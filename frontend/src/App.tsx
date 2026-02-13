import { useState, useEffect } from 'react';
import { Card, Grid, Title, Text, Tab, TabList, TabGroup, TabPanels, TabPanel, Metric, Flex, Badge, BarList } from "@tremor/react";
import { AreaChart } from "@tremor/react";

// Mock data for initial render or fallback
const mockChartData = [
  { date: "Jan 1", Cost: 2890 },
  { date: "Jan 2", Cost: 2756 },
  { date: "Jan 3", Cost: 3322 },
  { date: "Jan 4", Cost: 3470 },
  { date: "Jan 5", Cost: 3475 },
  { date: "Jan 6", Cost: 3129 },
];

function App() {
  const [selectedView, setSelectedView] = useState(0);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    // Fetch data from backend
    // In a real scenario, use React Query or SWR
    fetch('http://localhost:8000/api/v1/report?project_id=my-project&zone=us-central1-a')
      .then(res => res.json())
      .then(data => setReport(data))
      .catch(err => console.error("Failed to fetch report", err));
  }, []);

  return (
    <main className="p-12 bg-slate-50 min-h-screen dark:bg-slate-900">
      <Title className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">GCP FinOps Intelligence Hub</Title>

      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mb-6">
        <Card decoration="top" decorationColor="indigo">
          <Text>Total Monthly Cost</Text>
          <Metric>$ 12,450</Metric>
          <Badge deltaType="moderateIncrease" className="mt-2">+4.2%</Badge>
        </Card>
        <Card decoration="top" decorationColor="emerald">
          <Text>Potential Savings</Text>
          <Metric>$ {report?.summary?.total_potential_savings?.toFixed(2) || "0.00"}</Metric>
          <Text className="mt-2 text-emerald-600">from rightsizing</Text>
        </Card>
        <Card decoration="top" decorationColor="rose">
          <Text>Zombie Resources</Text>
          <Metric>{report?.summary?.zombie_resource_count || 0}</Metric>
          <Text className="mt-2 text-rose-600">Assets wasted</Text>
        </Card>
        <Card decoration="top" decorationColor="amber">
          <Text>Optimization Score</Text>
          <Metric>72%</Metric>
          <Text className="mt-2">Good standing</Text>
        </Card>
      </Grid>

      {/* Main Content Areas */}
      <TabGroup index={selectedView} onIndexChange={setSelectedView}>
        <TabList className="mb-6">
          <Tab>Overview & Trends</Tab>
          <Tab>Rightsizing Opportunities</Tab>
          <Tab>Zombie Hunter</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Grid numItems={1} numItemsLg={2} className="gap-6">
              <Card>
                <Title>Cost Trend (30 Days)</Title>
                <AreaChart
                  className="h-72 mt-4"
                  data={mockChartData}
                  index="date"
                  categories={["Cost"]}
                  colors={["indigo"]}
                />
              </Card>
              <Card>
                <Title>Cost by Service</Title>
                <Flex className="mt-4">
                  <Text>Service</Text>
                  <Text>Cost</Text>
                </Flex>
                <BarList
                  data={[
                    { name: "Compute Engine", value: 4500 },
                    { name: "Cloud SQL", value: 3200 },
                    { name: "BigQuery", value: 2100 },
                    { name: "Cloud Storage", value: 1200 },
                    { name: "Kubernetes Engine", value: 850 },
                  ]}
                  className="mt-2"
                />
              </Card>
            </Grid>
          </TabPanel>
          <TabPanel>
            <Card>
              <Title>Rightsizing Recommendations</Title>
              <Text className="mt-2 mb-4">Optimize VM sizes to match actual usage.</Text>
              {/* Table logic would go here */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Resource</th>
                      <th className="px-6 py-3">Recommendation</th>
                      <th className="px-6 py-3">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report?.recommendations?.map((rec: any) => (
                      <tr key={rec.recommendation_id} className="bg-white border-b">
                        <td className="px-6 py-4 font-medium text-gray-900">{rec.description.split(" ")[0]}</td>
                        <td className="px-6 py-4">{rec.description}</td>
                        <td className="px-6 py-4 text-emerald-600">{rec.cost_savings?.amount_per_month} {rec.cost_savings?.currency}</td>
                      </tr>
                    ))}
                    {(!report?.recommendations || report.recommendations.length === 0) && (
                      <tr><td colSpan={3} className="px-6 py-4 text-center">No recommendations found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card>
              <Title>Zombie Resources</Title>
              <Text className="mt-2 mb-4">Unused resources that should be deleted.</Text>
              <div className="grid gap-4">
                {report?.zombie_resources?.map((res: any, idx: number) => (
                  <div key={idx} className="p-4 border border-red-200 rounded-md bg-red-50 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-red-700">{res.waste_reason}</p>
                      <p className="text-sm">{res.resource_id} ({res.name})</p>
                    </div>
                    <Badge color="red">Delete</Badge>
                  </div>
                ))}
                {(!report?.zombie_resources || report.zombie_resources.length === 0) && (
                  <Text>No zombie resources detected! Great job.</Text>
                )}
              </div>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}

export default App;
