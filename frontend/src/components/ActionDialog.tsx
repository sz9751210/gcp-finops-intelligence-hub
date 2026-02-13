import { Dialog, DialogPanel, Title, Text, Button, Flex } from "@tremor/react";
import { useState } from "react";
// Using Heroicons v2
import { ClipboardDocumentCheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ActionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    recommendation: any; // Using 'any' for speed, ideally typed from domain
}

export default function ActionDialog({ isOpen, onClose, recommendation }: ActionDialogProps) {
    const [copied, setCopied] = useState(false);

    if (!recommendation) return null;

    let command = "# No command generated";
    const resourceId = recommendation.description.split(" ")[0] || "INSTANCE_ID"; // simple parsing fallback
    const zone = "us-central1-a"; // Should pass this prop

    // Simple command generation logic based on description keywords
    if (recommendation.description.includes("Change machine type")) {
        // rough parsing: "Change machine type from n1-standard-4 to n1-standard-2..."
        const parts = recommendation.description.split(" ");
        const toIndex = parts.indexOf("to");
        const newType = parts[toIndex + 1].replace(",", "");
        command = `gcloud compute instances set-machine-type ${resourceId} --zone ${zone} --machine-type ${newType}`;
    } else if (recommendation.description.includes("Delete")) {
        command = `gcloud compute instances delete ${resourceId} --zone ${zone}`;
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onClose={onClose} static={true}>
            <DialogPanel>
                <Flex justifyContent="between" className="mb-4">
                    <Title>Take Action</Title>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </Flex>

                <Text className="mb-2">Run this command in your Cloud Shell to apply the fix:</Text>

                <div className="bg-slate-900 p-4 rounded-md font-mono text-sm text-green-400 overflow-x-auto mb-6">
                    {command}
                </div>

                <Flex justifyContent="end" className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    <Button icon={ClipboardDocumentCheckIcon} onClick={handleCopy}>
                        {copied ? "Copied!" : "Copy Command"}
                    </Button>
                </Flex>
            </DialogPanel>
        </Dialog>
    );
}
