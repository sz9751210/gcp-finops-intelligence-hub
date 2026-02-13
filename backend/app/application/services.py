from typing import List, Dict
from ..domain.models import Recommendation, ZombieResource
from ..interfaces.repositories import RecommendationRepository, ZombieRepository

class FinOpsService:
    def __init__(self, recommender_repo: RecommendationRepository, zombie_repo: ZombieRepository):
        self.recommender_repo = recommender_repo
        self.zombie_repo = zombie_repo

    def get_optimization_report(self, project_id: str, zone: str) -> Dict:
        """
        Aggregates all FinOps insights for a project/zone.
        """
        # 1. Fetch Recommendations
        recommendations = self.recommender_repo.get_recommendations(project_id, zone)
        
        # 2. Detect Zombies
        zombies = self.zombie_repo.detect_zombies(project_id, zone)
        
        # 3. Calculate Potential Savings
        total_savings = 0.0
        currency = "USD"
        
        for rec in recommendations:
            if rec.cost_savings:
                total_savings += abs(rec.cost_savings.amount_per_month)
                currency = rec.cost_savings.currency
        
        for zombie in zombies:
            if zombie.estimated_monthly_waste:
                total_savings += zombie.estimated_monthly_waste

        return {
            "project_id": project_id,
            "zone": zone,
            "summary": {
                "total_potential_savings": total_savings,
                "currency": currency,
                "recommendation_count": len(recommendations),
                "zombie_resource_count": len(zombies)
            },
            "recommendations": recommendations,
            "zombie_resources": zombies
        }
