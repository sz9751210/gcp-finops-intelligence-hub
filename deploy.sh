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

echo "🐳 Building and starting containers..."
docker-compose up --build -d

echo "✅ Deployment Complete!"
echo "------------------------------------------------"
echo "🖥️  Frontend: http://localhost:5173"
echo "🔌 Backend:  http://localhost:8000/docs"
echo "------------------------------------------------"
