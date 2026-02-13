from google.cloud import monitoring_v3
from google.cloud import compute_v1
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def detect_idle_vms(project_id: str, zone: str, days: int = 30, threshold: float = 0.05):
    """
    Detects VMs that have had CPU utilization below a threshold for a set number of days.
    
    Args:
        project_id (str): GCP Project ID.
        zone (str): The zone to check.
        days (int): Number of days to look back (default 30).
        threshold (float): CPU utilization threshold (default 5% / 0.05).
        
    Returns:
        list: List of idle VM instance names.
    """
    client = monitoring_v3.MetricServiceClient()
    project_name = f"projects/{project_id}"
    
    now = time.time()
    seconds = int(now)
    nanos = int((now - seconds) * 10**9)
    
    # Time interval for the query
    interval = monitoring_v3.TimeInterval(
        {
            "end_time": {"seconds": seconds, "nanos": nanos},
            "start_time": {"seconds": seconds - (days * 86400), "nanos": nanos},
        }
    )
    
    # Aggregation: Mean over 1 day alignment period
    aggregation = monitoring_v3.Aggregation(
        {
            "alignment_period": {"seconds": 86400},  # 1 day
            "per_series_aligner": monitoring_v3.Aggregation.Aligner.ALIGN_MEAN,
            "cross_series_reducer": monitoring_v3.Aggregation.Reducer.REDUCE_MAX,  # Max of the means
            "group_by_fields": ["resource.label.instance_id"],
        }
    )
    
    filter_str = (
        'metric.type = "compute.googleapis.com/instance/cpu/utilization" '
        f'AND resource.label.zone = "{zone}"'
    )

    idle_vms = []

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
            instance_id = series.metric.labels.get("instance_id") # Note: Filter groups by this, but key might be in resource labels depending on metric
            # Actually, for CPU utilization, instance_id is a resource label.
            instance_name = series.resource.labels.get("instance_id") # This usually returns the ID, name mapping requires Compute API lookup
            
            # Check if ALL data points in the window are below threshold
            is_idle = True
            for point in series.points:
                if point.value.double_value > threshold:
                    is_idle = False
                    break
            
            if is_idle:
                idle_vms.append(instance_name)

    except Exception as e:
        logger.error(f"Error querying monitoring API: {e}")
        
    return idle_vms

def detect_unattached_disks(project_id: str, zone: str):
    """
    Lists Persistent Disks that are not attached to any VM.
    """
    disk_client = compute_v1.DisksClient()
    unattached_disks = []
    
    try:
        request = compute_v1.ListDisksRequest(project=project_id, zone=zone)
        for disk in disk_client.list(request=request):
            if not disk.users: # 'users' list is empty if not attached
                unattached_disks.append({
                    "name": disk.name,
                    "size_gb": disk.size_gb,
                    "status": disk.status,
                    "last_attach_timestamp": disk.last_attach_timestamp
                })
    except Exception as e:
        logger.error(f"Error listing disks: {e}")
        
    return unattached_disks

def detect_unused_ips(project_id: str, region: str):
    """
    Lists static External IPs that are RESERVED but not assigned (IN_USE).
    """
    addr_client = compute_v1.AddressesClient()
    unused_ips = []
    
    try:
        request = compute_v1.ListAddressesRequest(project=project_id, region=region)
        for addr in addr_client.list(request=request):
            if addr.status == "RESERVED" and not addr.users:
                unused_ips.append({
                    "name": addr.name,
                    "address": addr.address,
                    "status": addr.status,
                    "creation_timestamp": addr.creation_timestamp
                })
    except Exception as e:
        logger.error(f"Error listing addresses: {e}")
        
    return unused_ips

if __name__ == "__main__":
    # Example usage
    PROJECT_ID = "your-project-id"
    ZONE = "us-central1-a"
    REGION = "us-central1"
    
    print("--- Zombie Resource Detection ---")
    # print(f"Idle VMs: {detect_idle_vms(PROJECT_ID, ZONE)}")
    # print(f"Unattached Disks: {detect_unattached_disks(PROJECT_ID, ZONE)}")
    # print(f"Unused IPs: {detect_unused_ips(PROJECT_ID, REGION)}")
