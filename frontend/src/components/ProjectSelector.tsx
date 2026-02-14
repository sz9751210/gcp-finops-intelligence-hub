import { Select, SelectItem } from "@tremor/react";
import { useEffect, useState } from "react";

interface Project {
    project_id: string;
    display_name: string;
}

interface ProjectSelectorProps {
    selectedProject: string;
    onSelectProject: (projectId: string) => void;
}

const ProjectSelector = ({ selectedProject, onSelectProject }: ProjectSelectorProps) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/v1/projects`);
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data);
                }
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div className="w-full max-w-sm">
            <Select
                value={selectedProject}
                onValueChange={onSelectProject}
                placeholder={loading ? "Loading projects..." : "Select Project"}
                enableClear={false}
            >
                {projects.map((p) => (
                    <SelectItem key={p.project_id} value={p.project_id}>
                        {p.display_name} ({p.project_id})
                    </SelectItem>
                ))}
                {/* Fallback if no projects found or API fails, keep current selection viable */}
                {projects.length === 0 && selectedProject && (
                    <SelectItem value={selectedProject}>{selectedProject}</SelectItem>
                )}
            </Select>
        </div>
    );
};

export default ProjectSelector;
