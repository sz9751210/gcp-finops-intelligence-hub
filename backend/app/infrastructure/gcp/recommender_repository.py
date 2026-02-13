from typing import List, Dict
from google.cloud import recommender_v1
import logging
from ...domain.models import Recommendation, Operation, CostSavings
from ...interfaces.repositories import RecommendationRepository
from google.api_core import exceptions

logger = logging.getLogger(__name__)

class GCPRecommendationRepository(RecommendationRepository):
    def get_recommendations(self, project_id: str, zone: str) -> List[Recommendation]:
        recommenders = [
            "google.compute.instance.IdleResourceRecommender",
            "google.compute.instance.RightsizingRecommender"
        ]
        
        all_recs = []
        # In a real app, we should probably inject the client or creating it per request might be okay relative to network latency
        client = recommender_v1.RecommenderClient()

        for rec_id in recommenders:
            parent = f"projects/{project_id}/locations/{zone}/recommenders/{rec_id}"
            try:
                # List recommendations
                response = client.list_recommendations(parent=parent)
                
                for r in response:
                    # Map to Domain Model
                    ops = []
                    for operation_group in r.content.operation_groups:
                        for op in operation_group.operations:
                            ops.append(Operation(
                                action=op.action,
                                resource=op.resource,
                                resource_type=op.resource_type,
                                path=op.path,
                                value_summary=str(op.value) if op.value else None
                            ))
                    
                    savings = None
                    if r.primary_impact.category == recommender_v1.Impact.Category.COST:
                        cost = r.primary_impact.cost_projection.cost
                        # Convert units and nanos to float
                        amount = -1 * (cost.units + cost.nanos / 1e9)
                        savings = CostSavings(
                            currency=cost.currency_code,
                            amount_per_month=amount
                        )

                    all_recs.append(Recommendation(
                        recommendation_id=r.name,
                        description=r.description,
                        last_refresh_time=r.last_refresh_time,
                        priority=r.priority.name, # Enum to string
                        recommender_subtype=r.recommender_subtype,
                        operations=ops,
                        cost_savings=savings
                    ))
                    
            except exceptions.GoogleAPICallError as e:
                logger.error(f"Error fetching {rec_id}: {e}")
                
        return all_recs
