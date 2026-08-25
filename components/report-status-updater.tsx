"use client";

import { useState } from "react";
import { updateReportStatus } from "@/lib/actions/reports";
import { Select, SelectItem } from "@/components/base/select/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReportStatusUpdaterProps {
    reportId: string;
    currentStatus: string;
}

export function ReportStatusUpdater({ reportId, currentStatus }: ReportStatusUpdaterProps) {
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async (newStatus: string) => {
        if (newStatus === status) return;

        setIsUpdating(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await updateReportStatus(reportId, newStatus as any);

            if (result.success) {
                setStatus(newStatus);
                toast.success(`Report ${newStatus} successfully`);
            } else {
                toast.error(result.error || "Failed to update report status");
            }
        } catch (error) {
            console.error("Error updating report status:", error);
            toast.error("Failed to update report status");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <Select
                className="w-36"
                size="sm"
                selectedKey={status}
                onSelectionChange={(key) => {
                    if (key !== null) handleStatusUpdate(String(key));
                }}
                isDisabled={isUpdating}
            >
                <SelectItem id="pending">
                    <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-yellow-500" />
                        Pending
                    </span>
                </SelectItem>
                <SelectItem id="resolved">
                    <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-green-600" />
                        Resolved
                    </span>
                </SelectItem>
                <SelectItem id="dismissed">
                    <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-gray-400" />
                        Dismissed
                    </span>
                </SelectItem>
            </Select>

            {isUpdating && (
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            )}
        </div>
    );
}
