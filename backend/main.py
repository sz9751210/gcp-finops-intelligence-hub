from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import os

from app.infrastructure.gcp.recommender_repository import GCPRecommendationRepository
from app.infrastructure.gcp.monitoring_repository import GCPZombieRepository
from app.infrastructure.gcp.resource_manager_repository import GCPProjectRepository
from app.infrastructure.gcp.asset_repository import GCPAssetRepository
from app.application.services import FinOpsService

app = FastAPI(title="GCP FinOps Intelligence Hub API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency Injection using simple singletons for this scale
recommender_repo = GCPRecommendationRepository()
zombie_repo = GCPZombieRepository()
project_repo = GCPProjectRepository()
asset_repo = GCPAssetRepository()

finops_service = FinOpsService(
    recommender_repo, 
    zombie_repo, 
    project_repo, 
    asset_repo
)

@app.get("/")
def read_root():
    return {"status": "ok", "service": "GCP FinOps Intelligence Hub"}

@app.get("/api/v1/projects")
def get_projects():
    """
    List all projects accessible to the service account.
    """
    try:
        return finops_service.get_accessible_projects()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/resources")
def get_resources(project_id: str, zones: Optional[str] = None):
    """
    List all resources in the project, optionally filtered by zone.
    """
    try:
        zone_list = [z.strip() for z in zones.split(",") if z.strip()] if zones else None
        return finops_service.get_all_resources(project_id, zone_list)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/report")
def get_report(project_id: str, zones: str):
    try:
        if not project_id:
            raise HTTPException(status_code=400, detail="project_id is required")
        
        # Parse zones string "us-central1-a,us-central1-b" -> list
        zone_list = [z.strip() for z in zones.split(",") if z.strip()]
        
        if not zone_list:
             raise HTTPException(status_code=400, detail="At least one zone is required")

        report = finops_service.get_optimization_report(project_id, zone_list)
        return report
    except Exception as e:
        # Log the error in a real app
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
