from dataclasses import dataclass
from typing import List, Optional, Dict
from datetime import datetime

@dataclass
class CostSavings:
    currency: str
    amount_per_month: float

@dataclass
class Operation:
    action: str
    resource: str
    resource_type: str
    path: str
    value_summary: Optional[str] = None

@dataclass
class Recommendation:
    recommendation_id: str
    description: str
    last_refresh_time: datetime
    priority: str
    recommender_subtype: str
    operations: List[Operation]
    cost_savings: Optional[CostSavings] = None

@dataclass
class Resource:
    resource_id: str
    resource_type: str # 'gce_instance', 'disk', 'ip_address'
    name: str
    project_id: str
    zone: Optional[str] = None
    region: Optional[str] = None
    status: str = "UNKNOWN"
    metadata: Dict[str, any] = None # Flexible field for specific details (size_gb, etc.)

@dataclass
class ZombieResource(Resource):
    waste_reason: str = "Unknown" # 'Idle VM', 'Unattached Disk', 'Unused IP'
    estimated_monthly_waste: Optional[float] = 0.0
