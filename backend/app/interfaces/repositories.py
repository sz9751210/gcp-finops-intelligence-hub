from abc import ABC, abstractmethod
from typing import List
from ..domain.models import Recommendation, ZombieResource

class RecommendationRepository(ABC):
    @abstractmethod
    def get_recommendations(self, project_id: str, zone: str) -> List[Recommendation]:
        """Fetches recommendations for a given project and zone."""
        pass

class ZombieRepository(ABC):
    @abstractmethod
    def detect_zombies(self, project_id: str, location: str) -> List[ZombieResource]:
        """Detects idle or unused resources."""
        pass
