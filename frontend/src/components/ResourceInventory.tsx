import {
    Card,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Text,
    Title,
    Badge,
    TextInput
} from "@tremor/react";
import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

interface Resource {
    name: string;
    asset_type: string;
    location: string;
    project: string;
    state: string;
    create_time: string;
}

interface ResourceInventoryProps {
    projectId: string;
    zones: string; // "zone1, zone2"
}

const ResourceInventory = ({ projectId, zones }: ResourceInventoryProps) => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchResources = async () => {
            if (!projectId) return;

            setLoading(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/v1/resources?project_id=${projectId}&zones=${zones}`);
                if (res.ok) {
                    const data = await res.json();
                    setResources(data);
                    setFilteredResources(data);
                }
            } catch (error) {
                console.error("Failed to fetch resources", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, [projectId, zones]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredResources(resources);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            setFilteredResources(resources.filter(r =>
                r.name.toLowerCase().includes(lowerQuery) ||
                r.asset_type.toLowerCase().includes(lowerQuery) ||
                r.location.toLowerCase().includes(lowerQuery)
            ));
        }
    }, [searchQuery, resources]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Title className="text-2xl font-bold text-slate-900 dark:text-white">Resource Inventory</Title>
                    <Text>List of discovered assets in {projectId}</Text>
                </div>
                <div className="max-w-md w-full">
                    <TextInput
                        icon={MagnifyingGlassIcon}
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card className="mt-4 p-0 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Text>Loading inventory...</Text>
                    </div>
                ) : (
                    <Table className="w-full">
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell>Type</TableHeaderCell>
                                <TableHeaderCell>Location</TableHeaderCell>
                                <TableHeaderCell>State</TableHeaderCell>
                                <TableHeaderCell>Created</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredResources.map((res, idx) => (
                                <TableRow key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <TableCell>
                                        <Text className="font-medium text-slate-900 dark:text-white">{res.name}</Text>
                                    </TableCell>
                                    <TableCell>
                                        <Text className="text-xs font-mono text-slate-500">{res.asset_type}</Text>
                                    </TableCell>
                                    <TableCell>
                                        <Badge size="xs" color="gray">{res.location}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge size="xs" color={res.state === "RUNNING" || res.state === "IN_USE" ? "emerald" : "amber"}>
                                            {res.state}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Text>{res.create_time}</Text>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredResources.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <Text>No resources found matching criteria.</Text>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
};

export default ResourceInventory;
