import { HomeIcon, CurrencyDollarIcon, ListBulletIcon, CogIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Text, Title, Flex } from "@tremor/react";

interface SidebarProps {
    selectedView: string;
    onSelectView: (view: string) => void;
}

const navigation = [
    { name: 'Overview', icon: HomeIcon, id: 'overview' },
    { name: 'Resource Inventory', icon: ListBulletIcon, id: 'inventory' },
    { name: 'Rightsizing', icon: CurrencyDollarIcon, id: 'rightsizing' },
    { name: 'Zombie Hunter', icon: ExclamationTriangleIcon, id: 'zombie' },
    { name: 'Settings', icon: CogIcon, id: 'settings' },
];

export default function Sidebar({ selectedView, onSelectView }: SidebarProps) {
    return (
        <div className="h-screen w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
            <div className="p-6">
                <Flex justifyContent="start" className="space-x-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        G
                    </div>
                    <Title className="text-white text-lg">FinOps Hub</Title>
                </Flex>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navigation.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => onSelectView(item.id)}
                        className={`w-full flex items-center p-3 rounded-md transition-colors ${selectedView === item.id
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        <item.icon className="h-6 w-6 mr-3" aria-hidden="true" />
                        <span className="text-sm font-medium">{item.name}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <Text className="text-xs text-slate-500">Project: my-gcp-project</Text>
                <Text className="text-xs text-slate-500 mt-1">v2.0.0</Text>
            </div>
        </div>
    );
}
