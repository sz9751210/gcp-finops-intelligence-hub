import { useState, useEffect } from 'react';
import { Card, Grid, Title, Text, Metric, Flex, Badge, BarList, Button, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@tremor/react";
import { AreaChart } from "@tremor/react";
import Sidebar from './components/Sidebar';
import ActionDialog from './components/ActionDialog';
import SavingsBreakdown from './components/SavingsBreakdown';

// Mock data (Fallback)
const mockChartData = [
  { date: "Jan 1", Cost: 2890 },
  { date: "Jan 2", Cost: 2756 },
  { date: "Jan 3", Cost: 3322 },
  { date: "Jan 4", Cost: 3470 },
  { date: "Jan 5", Cost: 3475 },
  { date: "Jan 6", Cost: 3129 },
];

function App() {
  const [selectedView, setSelectedView] = useState('overview');
  const [report, setReport] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRec, setSelectedRec] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/report?project_id=my-project&zone=us-central1-a')
      .then(res => res.json())
      .then(data => setReport(data))
      .catch(err => console.error("Failed to fetch report", err));
  }, []);

  const openAction = (rec: any) => {
    setSelectedRec(rec);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar selectedView={selectedView} onSelectView={setSelectedView} />

      <main className="flex-1 overflow-y-auto p-8">
        {selectedView === 'overview' && (
          <>
            <Title className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Dashboard Overview</Title>
            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mb-6">
              <Card decoration="top" decorationColor="indigo">
                <Text>Total Monthly Cost</Text>
                <Metric>$ 12,450</Metric>
                <Badge deltaType="moderateIncrease" className="mt-2">+4.2%</Badge>
              </Card>
              <Card decoration="top" decorationColor="emerald">
                <Text>Potential Savings</Text>
                <Metric>$ {report?.summary?.total_potential_savings?.toFixed(2) || "0.00"}</Metric>
                <Text className="mt-2 text-emerald-600">from optimization</Text>
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

            <Grid numItems={1} numItemsLg={3} className="gap-6">
              <div className="col-span-2">
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
              </div>
              <div>
                <SavingsBreakdown recommendations={report?.recommendations} zombies={report?.zombie_resources} />
              </div>
            </Grid>
          </>
        )}

        {selectedView === 'rightsizing' && (
          <>
            <Title className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Rightsizing Opportunities</Title>
            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Resource</TableHeaderCell>
                    <TableHeaderCell>Recommendation</TableHeaderCell>
                    <TableHeaderCell>Est. Savings</TableHeaderCell>
                    <TableHeaderCell>Action</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report?.recommendations?.map((rec: any) => (
                    <TableRow key={rec.recommendation_id}>
                      <TableCell className="font-medium text-gray-900">{rec.description.split(" ")[0]}</TableCell>
                      <TableCell>{rec.description}</TableCell>
                      <TableCell className="text-emerald-600">{rec.cost_savings?.amount_per_month} {rec.cost_savings?.currency}</TableCell>
                      <TableCell>
                        <Button size="xs" onClick={() => openAction(rec)}>Fix It</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!report?.recommendations || report.recommendations.length === 0) && (
                    <TableRow><TableCell colSpan={4} className="text-center">No recommendations found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </>
        )}

        {selectedView === 'zombie' && (
          <>
            <Title className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Zombie Hunter</Title>
            <Grid numItems={1} numItemsLg={2} className="gap-6">
              {report?.zombie_resources?.map((res: any, idx: number) => (
                <Card key={idx} decoration="left" decorationColor="red">
                  <Flex justifyContent="between" alignItems="center">
                    <div>
                      <Text className="font-bold text-red-700">{res.waste_reason}</Text>
                      <Title>{res.name}</Title>
                      <Text className="text-sm text-gray-500 mt-1">{res.resource_id}</Text>
                    </div>
                    <div className="text-right">
                      <Text>Potential Waste</Text>
                      <Metric className="text-red-600">$ {res.estimated_monthly_waste?.toFixed(2)}</Metric>
                      <Button size="xs" color="red" className="mt-4" onClick={() => openAction({ description: `Delete ${res.resource_id}` })}>Delete</Button>
                    </div>
                  </Flex>
                </Card>
              ))}
              {(!report?.zombie_resources || report.zombie_resources.length === 0) && (
                <Text>No zombie resources detected! Great job.</Text>
              )}
            </Grid>
          </>
        )}
      </main>

      <ActionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        recommendation={selectedRec}
      />
    </div>
  );
}

export default App;
