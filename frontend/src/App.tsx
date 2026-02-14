/* imports */
import { useState, useEffect } from 'react';
import { Card, Grid, Title, Text, Metric, Flex, Badge, Button, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell, TextInput, DonutChart, BarList } from "@tremor/react";
import { AreaChart } from "@tremor/react";
import Sidebar from './components/Sidebar';
import ActionDialog from './components/ActionDialog';
import SavingsBreakdown from './components/SavingsBreakdown';
import ConsoleLink from './components/ConsoleLink';
import ProjectSelector from './components/ProjectSelector';
import ResourceInventory from './components/ResourceInventory';

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
  const [loadingReport, setLoadingReport] = useState(false);

  // Settings State
  const [config, setConfig] = useState({
    projectId: localStorage.getItem('finops_project_id') || 'nelab-402301',
    zones: localStorage.getItem('finops_zones') || 'us-central1-a, us-central1-b'
  });
  const [tempConfig, setTempConfig] = useState(config);

  const fetchReport = () => {
    setLoadingReport(true);
    // In a real app, use the env var for base URL or proxy
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    // Pass zones string directly, backend parses it
    fetch(`${apiUrl}/api/v1/report?project_id=${config.projectId}&zones=${config.zones}`)
      .then(res => res.json())
      .then(data => setReport(data))
      .catch(err => console.error("Failed to fetch report", err))
      .finally(() => setLoadingReport(false));
  };

  useEffect(() => {
    fetchReport();
  }, [config]);

  const saveSettings = () => {
    localStorage.setItem('finops_project_id', tempConfig.projectId);
    localStorage.setItem('finops_zones', tempConfig.zones);
    setConfig(tempConfig);
    alert("Settings saved! Refreshing data...");
  };

  const handleProjectChange = (newProjectId: string) => {
    const newConfig = { ...config, projectId: newProjectId };
    setConfig(newConfig);
    setTempConfig(newConfig);
    localStorage.setItem('finops_project_id', newProjectId);
  };

  const openAction = (rec: any) => {
    setSelectedRec(rec);
    setIsDialogOpen(true);
  };

  // Transform cost_by_zone for Visualization
  const zoneChartData = report?.summary?.cost_by_zone
    ? Object.entries(report.summary.cost_by_zone).map(([name, value]) => ({ name, value: Number(value) }))
    : [];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      <Sidebar selectedView={selectedView} onSelectView={setSelectedView} />

      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Top Bar Area */}
        <Flex justifyContent="between" className="mb-8">
          <div>
            <Title className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {selectedView === 'overview' && 'Dashboard Overview'}
              {selectedView === 'inventory' && 'Resource Inventory'}
              {selectedView === 'rightsizing' && 'Rightsizing Opportunities'}
              {selectedView === 'zombie' && 'Zombie Hunter'}
              {selectedView === 'settings' && 'Settings'}
            </Title>
            <Text>Managing cloud efficiency for your infrastructure.</Text>
          </div>

          <div className="flex space-x-4 items-center">
            <ProjectSelector
              selectedProject={config.projectId}
              onSelectProject={handleProjectChange}
            />
            <div className="w-48">
              <TextInput
                placeholder="Zones (e.g. us-central1-a)"
                value={tempConfig.zones}
                onChange={(e) => setTempConfig({ ...tempConfig, zones: e.target.value })}
                onBlur={saveSettings} /* Auto-save on blur for better UX? Or keep manual button? Let's keep manual for now but maybe allow quick edit */
              />
            </div>
          </div>
        </Flex>

        {loadingReport && selectedView === 'overview' && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10">
            <Text className="text-lg font-medium animate-pulse">Analyzing FinOps Data...</Text>
          </div>
        )}

        {selectedView === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
              <Card decoration="top" decorationColor="indigo" className="ring-1 ring-slate-200 shadow-sm">
                <Text>Estimated Monthly Waste</Text>
                <Metric>$ {report?.summary?.total_potential_savings?.toFixed(2) || "0.00"}</Metric>
                <Badge size="xs" color="rose" className="mt-2">-12% vs last month</Badge>
              </Card>
              <Card decoration="top" decorationColor="emerald" className="ring-1 ring-slate-200 shadow-sm">
                <Text>Potential Savings</Text>
                <Metric>$ {report?.summary?.total_potential_savings?.toFixed(2) || "0.00"}</Metric>
                <Text className="mt-2 text-emerald-600">from optimization</Text>
              </Card>
              <Card decoration="top" decorationColor="rose" className="ring-1 ring-slate-200 shadow-sm">
                <Text>Zombie Resources</Text>
                <Metric>{report?.summary?.zombie_resource_count || 0}</Metric>
                <Text className="mt-2 text-rose-600">Assets wasted</Text>
              </Card>
              <Card decoration="top" decorationColor="amber" className="ring-1 ring-slate-200 shadow-sm">
                <Text>Optimization Score</Text>
                <Metric>72%</Metric>
                <Text className="mt-2">Good standing</Text>
              </Card>
            </Grid>

            <Grid numItems={1} numItemsLg={3} className="gap-6">
              <div className="col-span-2 space-y-6">
                <Card>
                  <Title>Estimated Waste by Zone</Title>
                  <Text>Breakdown of potential savings across monitored zones.</Text>
                  <Flex className="mt-6" alignItems="center" justifyContent="start">
                    <DonutChart
                      className="h-40 w-40 mr-6"
                      data={zoneChartData}
                      category="value"
                      index="name"
                      colors={["cyan", "blue", "indigo", "violet", "fuchsia"]}
                      valueFormatter={(number: number) => `$ ${number.toFixed(2)}`}
                      showAnimation={true}
                    />
                    <div className="w-full">
                      <BarList
                        data={zoneChartData}
                        valueFormatter={(number: number) => `$ ${number.toFixed(2)}`}
                        color="blue"
                      />
                    </div>
                  </Flex>
                </Card>
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
              <div className="space-y-6">
                <SavingsBreakdown recommendations={report?.recommendations} zombies={report?.zombie_resources} />

                {/* Quick Actions / Tips */}
                <Card decoration="top" decorationColor="teal">
                  <Title>Quick Tips</Title>
                  <ul className="list-disc list-inside mt-4 text-sm text-slate-600 dark:text-slate-400 space-y-2">
                    <li>Review idle IP addresses in us-central1.</li>
                    <li>Consider committed use discounts for DBs.</li>
                    <li>Delete snapshots older than 90 days.</li>
                  </ul>
                </Card>
              </div>
            </Grid>
          </div>
        )}

        {selectedView === 'inventory' && (
          <ResourceInventory
            projectId={config.projectId}
            zones={config.zones}
          />
        )}

        {selectedView === 'rightsizing' && (
          <div className="animate-fadeIn">
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
          </div>
        )}

        {selectedView === 'zombie' && (
          <div className="animate-fadeIn">
            <Grid numItems={1} numItemsLg={2} className="gap-6">
              {report?.zombie_resources?.map((res: any, idx: number) => (
                <Card key={idx} decoration="left" decorationColor="red">
                  <Flex justifyContent="between" alignItems="start">
                    <div>
                      <Text className="font-bold text-red-700">{res.waste_reason}</Text>
                      <Title className="mt-1">{res.name}</Title>
                      <Text className="text-sm text-gray-500 font-mono">{res.resource_id}</Text>
                      <div className="mt-3">
                        <ConsoleLink
                          projectId={config.projectId}
                          zone={res.zone || config.zones.split(',')[0].trim()}
                          resourceId={res.resource_id}
                          resourceType={res.resource_type}
                          name={res.name}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <Text>Potential Waste</Text>
                      <Metric className="text-red-600">$ {res.estimated_monthly_waste?.toFixed(2)} / mo</Metric>
                      <Button size="xs" color="red" className="mt-4" onClick={() => openAction({ description: `Delete ${res.name}` })}>Delete</Button>
                    </div>
                  </Flex>
                </Card>
              ))}
              {(!report?.zombie_resources || report.zombie_resources.length === 0) && (
                <Text>No zombie resources detected! Great job.</Text>
              )}
            </Grid>
          </div>
        )}

        {selectedView === 'settings' && (
          <div className="animate-fadeIn">
            <Card className="max-w-xl">
              <Title>Project Configuration</Title>
              <Text className="mb-4">Configure the Google Cloud project you want to analyze.</Text>

              <div className="space-y-4">
                <div>
                  <Text className="mb-1">Project ID</Text>
                  <TextInput
                    placeholder="e.g. my-gcp-project-id"
                    value={tempConfig.projectId}
                    onChange={(e) => setTempConfig({ ...tempConfig, projectId: e.target.value })}
                  />
                </div>
                <div>
                  <Text className="mb-1">Zones</Text>
                  <TextInput
                    placeholder="e.g. us-central1-a, us-central1-b"
                    value={tempConfig.zones}
                    onChange={(e) => setTempConfig({ ...tempConfig, zones: e.target.value })}
                  />
                  <Text className="text-xs text-slate-500 mt-1">Comma-separated list of zones to monitor.</Text>
                </div>
                <div className="pt-2">
                  <Button onClick={saveSettings}>Save & Refresh</Button>
                </div>
              </div>
            </Card>
          </div>
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
