from typing import List, Dict, Optional
from ..domain.models import Recommendation, ZombieResource
from ..infrastructure.gcp.recommender_repository import GCPRecommendationRepository
from ..infrastructure.gcp.monitoring_repository import GCPZombieRepository
from ..infrastructure.gcp.resource_manager_repository import GCPProjectRepository
from ..infrastructure.gcp.asset_repository import GCPAssetRepository

class FinOpsService:
    def __init__(
        self, 
        recommender_repo: GCPRecommendationRepository, 
        zombie_repo: GCPZombieRepository,
        project_repo: Optional[GCPProjectRepository] = None,
        asset_repo: Optional[GCPAssetRepository] = None
    ):
        self.recommender_repo = recommender_repo
        self.zombie_repo = zombie_repo
        self.project_repo = project_repo or GCPProjectRepository()
        self.asset_repo = asset_repo or GCPAssetRepository()

    def get_accessible_projects(self) -> List[Dict]:
        """
        Returns a list of projects accessible to the service account.
        """
        return self.project_repo.list_accessible_projects()

    def get_all_resources(self, project_id: str, zones: List[str] = None) -> List[Dict]:
        """
        Returns a list of all resources in the project, optionally filtered by zone.
        """
        return self.asset_repo.list_all_resources(project_id, zones)

    def get_optimization_report(self, project_id: str, zones: List[str]) -> Dict:
        """
        Aggregates all FinOps insights for a project across multiple zones.
        """
        all_recommendations = []
        all_zombies = []
        
        cost_by_zone = {} # { "us-central1-a": 120.50 }

        for zone in zones:
            zone_savings = 0.0
            
            # 1. Fetch Recommendations
            recs = self.recommender_repo.get_recommendations(project_id, zone)
            all_recommendations.extend(recs)
            
            for rec in recs:
                 if rec.cost_savings:
                    zone_savings += abs(rec.cost_savings.amount_per_month)

            # 2. Detect Zombies
            zombies = self.zombie_repo.detect_zombies(project_id, zone)
            all_zombies.extend(zombies)
            
            for zombie in zombies:
                if zombie.estimated_monthly_waste:
                    zone_savings += zombie.estimated_monthly_waste
            
            if zone_savings > 0:
                cost_by_zone[zone] = zone_savings

        # 3. Calculate Total Potential Savings
        total_savings = sum(cost_by_zone.values())
        currency = "USD"
        
        return {
            "project_id": project_id,
            "zones_scanned": zones,
            "summary": {
                "total_potential_savings": total_savings,
                "currency": currency,
                "recommendation_count": len(all_recommendations),
                "zombie_resource_count": len(all_zombies),
                "cost_by_zone": cost_by_zone
            },
            "recommendations": all_recommendations,
            "zombie_resources": all_zombies
        }
