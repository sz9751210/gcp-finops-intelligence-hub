import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

try:
    print("Verifying backend/services/recommender_service.py...")
    from backend.services import recommender_service
    print("✅ recommender_service imported successfully.")

    print("Verifying backend/services/monitoring_service.py...")
    from backend.services import monitoring_service
    print("✅ monitoring_service imported successfully.")

    print("\nAll backend services verified successfully!")

except Exception as e:
    print(f"\n❌ Verification failed: {e}")
    sys.exit(1)
