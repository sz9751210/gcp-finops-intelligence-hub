#!/bin/bash

# One-click deployment for GCP FinOps Intelligence Hub

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Starting GCP FinOps Intelligence Hub Deployment...${NC}"

# Check for credentials
if [ ! -f "credentials.json" ]; then
    echo -e "${RED}❌ Error: credentials.json not found!${NC}"
    echo -e "${YELLOW}👉 Please place your Google Cloud Service Account key in the root directory and name it 'credentials.json'.${NC}"
    echo "This service account needs the following roles:"
    echo " - Browser (roles/browser) or Project Viewer"
    echo " - Cloud Asset Viewer (roles/cloudasset.viewer)"
    echo " - Monitoring Viewer (roles/monitoring.viewer)"
    echo " - Recommender Viewer (roles/recommender.viewer)"
    echo " - Compute Viewer (optional, for detailed compute info)"
    exit 1
fi

export GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/credentials.json

# Check if services are already running
if [ -n "$(docker-compose ps -q)" ]; then
    echo -e "${YELLOW}⚠️  Services are already running.${NC}"
    echo "What would you like to do?"
    echo "1) Restart (Simply restart the containers)"
    echo "2) Recreate (Rebuild and recreate containers)"
    echo "3) Cancel"
    read -p "Select an option [1-3]: " choice

    case $choice in
        1)
            echo -e "${CYAN}🔄 Restarting containers...${NC}"
            docker-compose restart
            ;;
        2)
            echo -e "${CYAN}🔨 Recreating containers...${NC}"
            docker-compose down
            docker-compose up --build -d
            ;;
        3)
            echo -e "${RED}❌ Operation cancelled.${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option.${NC}"
            exit 1
            ;;
    esac
else
    echo -e "${CYAN}🐳 Building and starting containers...${NC}"
    docker-compose up --build -d
fi

# Wait a moment for services to come up
echo "Scale up..."
sleep 5

echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "------------------------------------------------"
echo -e "🖥️  ${CYAN}Frontend:${NC} http://localhost:5173"
echo -e "🔌 ${CYAN}Backend: ${NC} http://localhost:8000/docs"
echo "------------------------------------------------"
echo "If the frontend fails to load data, ensure your credentials have the correct permissions."
