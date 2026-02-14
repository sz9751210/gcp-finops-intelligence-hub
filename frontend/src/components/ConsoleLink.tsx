import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface ConsoleLinkProps {
    projectId: string;
    zone?: string;
    resourceId?: string;
    resourceType: 'gce_instance' | 'disk' | 'ip_address' | 'other';
    name?: string;
}

export default function ConsoleLink({ projectId, zone, resourceType, name }: ConsoleLinkProps) {
    let url = "";

    switch (resourceType) {
        case 'gce_instance':
            // https://console.cloud.google.com/compute/instancesDetail/zones/us-central1-a/instances/instance-1?project=my-project
            if (zone && name) {
                url = `https://console.cloud.google.com/compute/instancesDetail/zones/${zone}/instances/${name}?project=${projectId}`;
            } else {
                url = `https://console.cloud.google.com/compute/instances?project=${projectId}`;
            }
            break;
        case 'disk':
            url = `https://console.cloud.google.com/compute/disks?project=${projectId}`;
            break;
        case 'ip_address':
            url = `https://console.cloud.google.com/networking/addresses/list?project=${projectId}`;
            break;
        default:
            url = `https://console.cloud.google.com/home/dashboard?project=${projectId}`;
    }

    if (!url) return null;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
        >
            Open in Console
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </a>
    );
}
