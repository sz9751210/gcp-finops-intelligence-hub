from google.cloud import recommender_v1
from google.api_core import exceptions
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_recommendations(project_id: str, zone: str, recommender_id: str):
    """
    Fetches recommendations from a specific GCP Recommender.
    
    Args:
        project_id (str): The GCP Project ID.
        zone (str): The zone (e.g., 'us-central1-a').
        recommender_id (str): The Recommender ID (e.g., 'google.compute.instance.IdleResourceRecommender').
    
    Returns:
        list: A list of recommendations with operation, cost savings, and description.
    """
    client = recommender_v1.RecommenderClient()
    
    parent = f"projects/{project_id}/locations/{zone}/recommenders/{recommender_id}"
    
    results = []
    
    try:
        # List recommendations
        # Note: In a real scenario, you might want to paginate through results.
        response = client.list_recommendations(parent=parent)
        
        for recommendation in response:
            rec_data = {
                "recommendation_id": recommendation.name,
                "description": recommendation.description,
                "last_refresh_time": recommendation.last_refresh_time.isoformat(),
                "priority": recommendation.priority,
                "recommender_subtype": recommendation.recommender_subtype,
                "operations": [],
                "cost_savings": {}
            }
            
            # Extract suggested operations
            for operation_group in recommendation.content.operation_groups:
                for operation in operation_group.operations:
                    rec_data["operations"].append({
                        "action": operation.action,
                        "resource": operation.resource,
                        "resource_type": operation.resource_type,
                        "path": operation.path,
                        # 'value' might be a complex object, extracting as string for simplicity in summary
                        "value_summary": str(operation.value) if operation.value else None
                    })
            
            # Extract cost savings
            if recommendation.primary_impact.category == recommender_v1.Impact.Category.COST:
                cost_impact = recommendation.primary_impact.cost_projection
                rec_data["cost_savings"] = {
                    "currency": cost_impact.cost.currency_code,
                    "amount_per_month": f"-{cost_impact.cost.units}.{cost_impact.cost.nanos} (Savings)" # Negative implies cost reduction
                }

            results.append(rec_data)
            
    except exceptions.GoogleAPICallError as e:
        logger.error(f"Error calling Recommender API: {e}")
        return []
        
    return results

def get_finops_recommendations(project_id: str, zone: str):
    """
    Aggregates FinOps recommendations for a project and zone.
    Focuses on Idle Resources and Rightsizing.
    """
    recommenders = [
        "google.compute.instance.IdleResourceRecommender",
        "google.compute.instance.RightsizingRecommender"
    ]
    
    all_recommendations = {}
    
    for rec_id in recommenders:
        logger.info(f"Fetching recommendations for {rec_id}...")
        recs = get_recommendations(project_id, zone, rec_id)
        all_recommendations[rec_id] = recs
        
    return all_recommendations

if __name__ == "__main__":
    # Example Usage (Mock Data / For Testing)
    # You would need to set GOOGLE_APPLICATION_CREDENTIALS to run this against a real project.
    PROJECT_ID = "your-project-id"
    ZONE = "us-central1-a"
    
    print(f"--- Simulating fetch for {PROJECT_ID} in {ZONE} ---")
    # Uncomment to run against real API if credentials are set
    # recommendations = get_finops_recommendations(PROJECT_ID, ZONE)
    # import json
    # print(json.dumps(recommendations, indent=2))
