# GCP FinOps Intelligence Hub 💰☁️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)

A comprehensive **FinOps Dashboard** for Google Cloud Platform. This tool helps you visualize cloud costs, identify "zombie" resources (idle/unused), and discover rightsizing opportunities to optimize your spending.

It is built with a **Clean Architecture** backend (Python/FastAPI) and a modern **React + Tremor** frontend.

![Dashboard Preview](docs/images/dashboard_preview.png)
*(Note: Replace with actual screenshot)*

## ✨ Key Features

*   **📊 Cost & Inventory Overview:** Visualize your monthly spending trends and forecast.
*   **🧟 Zombie Resource Hunter:** Automatically detect and flag wasteful resources:
    *   **Idle VMs:** Instances with < 5% CPU utilization over 30 days.
    *   **Unattached Disks:** Persistent Disks paying for storage but not attached to any VM.
    *   **Unused IPs:** Static IP addresses reserved but not assigned to a resource.
*   **📉 Rightsizing Recommendations:** Integrate with **GCP Recommender API** to find over-provisioned instances and estimate monthly savings.
*   **🏗️ Clean Architecture:** Modular backend design separating Domain, Application, and Infrastructure layers.

## 🛠️ Technology Stack

*   **Backend:** Python 3.9+, FastAPI, Google Cloud Client Libraries
*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Tremor (UI Library for Dashboards)
*   **Infrastructure:** Docker, Docker Compose

## 🚀 Getting Started

### Prerequisites

1.  **GCP Credentials:** You need a Google Cloud Service Account with the following roles:
    *   `Recommender Viewer` (`roles/recommender.viewer`)
    *   `Monitoring Viewer` (`roles/monitoring.viewer`)
    *   `Compute Viewer` (`roles/compute.viewer`)
2.  **Docker Desktop:** Installed and running.

### Quick Start (Docker Compose)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/gcp-finops-intelligence-hub.git
    cd gcp-finops-intelligence-hub
    ```

2.  **Add Credentials:**
    Save your Service Account Key as `credentials.json` in the root directory.

3.  **Run the application:**
    ```bash
    ./deploy.sh
    # Or manually: docker-compose up --build
    ```

4.  **Access the Dashboard:**
    *   Frontend: [http://localhost:5173](http://localhost:5173)
    *   Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## 📂 Project Structure

```
gcp-finops-intelligence-hub/
├── backend/                  # Python FastAPI Application
│   ├── app/
│   │   ├── domain/           # Pure Business Logic (Models)
│   │   ├── application/      # Use Cases (FinOps Services)
│   │   ├── infrastructure/   # GCP Adapters (Recommender, Monitoring)
│   │   └── interfaces/       # Abstract Repositories
│   ├── main.py               # API Entrypoint
│   └── Dockerfile
├── frontend/                 # React + Vite Application
│   ├── src/
│   │   ├── components/       # Tremor Dashboard Components
│   │   └── App.tsx           # Main Dashboard View
│   └── Dockerfile
├── docker-compose.yml        # Orchestration
├── deploy.sh                 # One-click deployment script
└── credentials.json          # (Ignored) GCP Service Account Key
```

## 🔧 Local Development

### Backend (Python)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export GOOGLE_APPLICATION_CREDENTIALS=../credentials.json
uvicorn main:app --reload
```

### Frontend (Node.js)
```bash
cd frontend
npm install
npm run dev
```

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
