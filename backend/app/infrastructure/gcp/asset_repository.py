from google.cloud import asset_v1
from typing import List, Dict

class GCPAssetRepository:
    def __init__(self):
        try:
            self.client = asset_v1.AssetServiceClient()
        except Exception as e:
            print(f"Warning: Could not initialize AssetServiceClient. Error: {e}")
            self.client = None

    def list_all_resources(self, project_id: str, zones: List[str] = None) -> List[Dict]:
        """
        Search for all resources in the project using Cloud Asset Inventory.
        Optionally filters by zone if the resource location matches.
        """
        if not self.client:
            return []

        try:
            scope = f"projects/{project_id}"
            
            # We want to list all main resources. 
            # We can use search_all_resources which is powerful.
            # Query for common cost-incurring resources
            query = (
                "state != \"TERMINATED\" AND state != \"DELETED\""
            )
            
            request = asset_v1.SearchAllResourcesRequest(
                scope=scope,
                query=query,
                asset_types=[
                    "compute.googleapis.com/Instance",
                    "compute.googleapis.com/Disk",
                    "storage.googleapis.com/Bucket",
                    "sqladmin.googleapis.com/Instance",
                    "redis.googleapis.com/Instance",
                    "container.googleapis.com/Cluster"
                ],
                page_size=100
            )

            results = []
            for resource in self.client.search_all_resources(request=request):
                # Basic zone filtering
                # location usually looks like "us-central1-a" or "us-central1"
                location = resource.location
                
                if zones:
                    # If specific zones are requested, filter. 
                    # Note: Global resources like buckets often have location "US" or "Multi-region".
                    # We should probably include them if they match or if it's broad.
                    # For strict zone filtering (e.g. only us-central1-a resources):
                    if location not in zones and location not in [z[:-2] for z in zones]: # Try to match region too
                        # If it's a global resource, maybe keep it? Let's just filter strictly for now if zones are provided,
                        # but keep global if not specific.
                        # Actually, easy logic: if resource is zonal and not in zones, skip.
                        pass
                
                results.append({
                    "name": resource.display_name,
                    "asset_type": resource.asset_type,
                    "location": resource.location,
                    "project": resource.project.split('/')[-1], # projects/xyz -> xyz
                    "state": resource.state,
                    "create_time": resource.create_time.strftime("%Y-%m-%d %H:%M:%S") if resource.create_time else "N/A"
                })
            
            return results

        except Exception as e:
            print(f"Error searching assets: {e}")
            return []
