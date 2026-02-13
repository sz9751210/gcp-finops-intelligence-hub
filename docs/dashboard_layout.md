# GCP FinOps Intelligence Hub - Dashboard Layout Plan

## 1. High-Level KPI Cards (Top Row)
*Goal: Immediate visibility into financial health and optimization savings.*

| Card Title | Data Source | Visualization | Description |
| :--- | :--- | :--- | :--- |
| **Total Monthly Cost** | Cloud Billing API | Big Number + % vs Last Month | Current month-to-date cost with forecast. |
| **Potential Savings** | Recommender API | Big Number (Green) | Aggregated savings from Idle Resources + Rightsizing. |
| **Zombie Resources** | Monitoring Service | Count (Red Badge) | Number of idle VMs + Unattached IP/Disks found. |
| **Optimization Score** | Calculated | Radial Chart (0-100%) | Simple score based on implemented vs available recommendations. |

## 2. Cost & Inventory Visualization (Middle Row)
*Goal: Understand where money is being spent.*

### Left Panel: Resource Treemap
*   **Library:** Nivo / Tremor Treemap
*   **Data:** Cloud Asset Inventory + Billing
*   **Hierarchy:** `Project` -> `Service` (Compute, SQL, Storage) -> `Resource`
*   **Size:** Current Monthly Cost
*   **Color:** Efficiency Score (Red = High Waste, Green = Optimized)

### Right Panel: Cost Trend
*   **Library:** Recharts / Tremor AreaChart
*   **X-Axis:** Date (Last 30 Days)
*   **Y-Axis:** Daily Cost ($)
*   **Series:**
    *   Solid Line: Actual Spending
    *   Dotted Line: Forecast (Next 7 Days)

## 3. Actionable Insights & The Zombie Hunter (Bottom Row)
*Goal: List specific actions to take.*

### Tab 1: Rightsizing Recommendations
*   **Table Columns:**
    *   **Resource Name:** (e.g., `app-server-prod`)
    *   **Type:** `Over-provisioned` | `Under-provisioned`
    *   **Recommendation:** (e.g., `n1-standard-4` -> `n1-standard-2`)
    *   **Est. Savings:** `$-45.20 / mo` (Sortable)
    *   **Action:** `[Fix It]` Button (Trigger Cloud Function/API)

### Tab 2: Zombie Resources (Idle/Unused)
*   **Table Columns:**
    *   **Type:** `Idle VM` | `Unattached Disk` | `Unused IP`
    *   **Resource ID:** Link to GCP Console
    *   **Age:** Days since last active (e.g., `45 days`)
    *   **Cost Waste:** Estimated Monthly Waste
    *   **Action:** `[Delete]` / `[Snapshot & Delete]`

## UI/UX Notes
*   **Theme:** Dark Mode by default (Professional "Command Center" feel).
*   **Refresh:** Data refreshes every 24h (heavy API calls) or On-Demand.
*   **Filters:** Top-bar drop-downs for `Organization`, `Project`, and `Zone`.
