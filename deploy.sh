#!/bin/bash

# One-click deployment for GCP FinOps Intelligence Hub

echo "🚀 Starting GCP FinOps Intelligence Hub Deployment..."

# Check for credentials
if [ ! -f "credentials.json" ]; then
    echo "❌ Error: credentials.json not found!"
    echo "👉 Please place your Google Cloud Service Account key in the root directory and name it 'credentials.json'."
    exit 1
fi

export GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/credentials.json

# Check if services are already running
if [ -n "$(docker-compose ps -q)" ]; then
    echo "⚠️  Services are already running."
    echo "What would you like to do?"
    echo "1) Restart (Simply restart the containers)"
    echo "2) Recreate (Rebuild and recreate containers)"
    echo "3) Cancel"
    read -p "Select an option [1-3]: " choice

    case $choice in
        1)
            echo "🔄 Restarting containers..."
            docker-compose restart
            ;;
        2)
            echo "🔨 Recreating containers..."
            docker-compose down
            docker-compose up --build -d
            ;;
        3)
            echo "❌ Operation cancelled."
            exit 0
            ;;
        *)
            echo "❌ Invalid option."
            exit 1
            ;;
    esac
else
    echo "🐳 Building and starting containers..."
    docker-compose up --build -d
fi

echo "✅ Deployment Complete!"
echo "------------------------------------------------"
echo "🖥️  Frontend: http://localhost:5173"
echo "🔌 Backend:  http://localhost:8000/docs"
echo "------------------------------------------------"
