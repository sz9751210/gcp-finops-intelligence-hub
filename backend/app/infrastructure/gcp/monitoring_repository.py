from typing import List
from google.cloud import monitoring_v3
from google.cloud import compute_v1
import time
import logging
from ...domain.models import ZombieResource
from ...interfaces.repositories import ZombieRepository

logger = logging.getLogger(__name__)

class GCPZombieRepository(ZombieRepository):
    def detect_zombies(self, project_id: str, location: str) -> List[ZombieResource]:
        zombies = []
        
        # 1. Idle VMs
        zombies.extend(self._detect_idle_vms(project_id, location))
        
        # 2. Unattached Disks 
        # Note: 'location' here is treated as a zone for disks
        zombies.extend(self._detect_unattached_disks(project_id, location))
        
        # 3. Unused IPs
        # Note: IPs are regional, we might need to parse region from zone or pass region explicitly.
        # For simplicity, assuming location is a zone (us-central1-a) -> region (us-central1)
        region = "-".join(location.split("-")[:-1])
        zombies.extend(self._detect_unused_ips(project_id, region))
        
        return zombies

    def _detect_idle_vms(self, project_id: str, zone: str, days: int = 30, threshold: float = 0.05) -> List[ZombieResource]:
        client = monitoring_v3.MetricServiceClient()
        compute_client = compute_v1.InstancesClient()
        project_name = f"projects/{project_id}"
        
        # Simplified pricing table (monthly in USD)
        # In a real app, use the Cloud Billing Catalog API
        PRICING = {
            "e2-micro": 6.11,
            "e2-small": 12.23,
            "e2-medium": 24.46,
            "e2-standard-2": 48.92,
            "n1-standard-1": 24.27,
            "n2-standard-2": 48.54,
            "c2-standard-4": 126.63
        }

        now = time.time()
        seconds = int(now)
        nanos = int((now - seconds) * 10**9)
        
        interval = monitoring_v3.TimeInterval(
            {
                "end_time": {"seconds": seconds, "nanos": nanos},
                "start_time": {"seconds": seconds - (days * 86400), "nanos": nanos},
            }
        )
        
        aggregation = monitoring_v3.Aggregation(
            {
                "alignment_period": {"seconds": 86400},
                "per_series_aligner": monitoring_v3.Aggregation.Aligner.ALIGN_MEAN,
                "cross_series_reducer": monitoring_v3.Aggregation.Reducer.REDUCE_MAX,
                "group_by_fields": ["resource.label.instance_id"],
            }
        )
        
        filter_str = (
            'metric.type = "compute.googleapis.com/instance/cpu/utilization" '
            f'AND resource.label.zone = "{zone}"'
        )

        idle_resources = []
        try:
            results = client.list_time_series(
                request={
                    "name": project_name,
                    "filter": filter_str,
                    "interval": interval,
                    "view": monitoring_v3.ListTimeSeriesRequest.TimeSeriesView.FULL,
                    "aggregation": aggregation,
                }
            )

            for series in results:
                instance_id = series.resource.labels.get("instance_id")
                
                is_idle = True
                for point in series.points:
                    if point.value.double_value > threshold:
                        is_idle = False
                        break
                
                if is_idle:
                    # Fetch instance details to get name and machine type
                    instance_name = instance_id # Default fallback
                    cost = 0.0
                    
                    try:
                        # We need to find the instance name from the ID, or list all instances and match ID
                        # Listing is safer as we don't have the name yet
                        # Optimization: In a real production app, cache this list
                        list_request = compute_v1.ListInstancesRequest(project=project_id, zone=zone)
                        for inst in compute_client.list(request=list_request):
                            if str(inst.id) == instance_id:
                                instance_name = inst.name
                                machine_type = inst.machine_type.split("/")[-1] # zones/us-central1-a/machineTypes/e2-medium
                                cost = PRICING.get(machine_type, 20.0) # Default to $20 if unknown
                                break
                    except Exception as e:
                        logger.warning(f"Could not fetch details for instance {instance_id}: {e}")

                    idle_resources.append(ZombieResource(
                        resource_id=instance_id,
                        resource_type="gce_instance",
                        name=instance_name,
                        project_id=project_id,
                        zone=zone,
                        waste_reason=f"Idle VM (< 5% CPU)",
                        estimated_monthly_waste=cost
                    ))

        except Exception as e:
            logger.error(f"Error checking monitoring: {e}")
            
        return idle_resources

    def _detect_unattached_disks(self, project_id: str, zone: str) -> List[ZombieResource]:
        disk_client = compute_v1.DisksClient()
        disks = []
        try:
            request = compute_v1.ListDisksRequest(project=project_id, zone=zone)
            for disk in disk_client.list(request=request):
                if not disk.users:
                    disks.append(ZombieResource(
                        resource_id=str(disk.id),
                        resource_type="disk",
                        name=disk.name,
                        project_id=project_id,
                        zone=zone,
                        waste_reason="Unattached Disk",
                        metadata={"size_gb": disk.size_gb},
                        estimated_monthly_waste=disk.size_gb * 0.04 # Rough estimate $0.04/GB
                    ))
        except Exception as e:
             logger.error(f"Error listing disks: {e}")
        return disks

    def _detect_unused_ips(self, project_id: str, region: str) -> List[ZombieResource]:
        addr_client = compute_v1.AddressesClient()
        ips = []
        try:
            request = compute_v1.ListAddressesRequest(project=project_id, region=region)
            for addr in addr_client.list(request=request):
                if addr.status == "RESERVED" and not addr.users:
                    ips.append(ZombieResource(
                        resource_id=str(addr.id),
                        resource_type="ip_address",
                        name=addr.name,
                        project_id=project_id,
                        region=region,
                        waste_reason="Unused Static IP",
                        estimated_monthly_waste=2.50 # roughly $2.50/mo
                    ))
        except Exception as e:
            logger.error(f"Error listing IPs: {e}")
        return ips
