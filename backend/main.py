from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os

from app.infrastructure.gcp.recommender_repository import GCPRecommendationRepository
from app.infrastructure.gcp.monitoring_repository import GCPZombieRepository
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
finops_service = FinOpsService(recommender_repo, zombie_repo)

@app.get("/")
def read_root():
    return {"status": "ok", "service": "GCP FinOps Intelligence Hub"}

@app.get("/api/v1/report")
def get_report(project_id: str, zone: str):
    try:
        if not project_id:
            raise HTTPException(status_code=400, detail="project_id is required")
        
        report = finops_service.get_optimization_report(project_id, zone)
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
