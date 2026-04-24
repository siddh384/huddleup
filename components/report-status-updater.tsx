"use client";

import { useState } from "react";
import { updateReportStatus } from "@/lib/actions/reports";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check, X } from "lucide-react";
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
                value={status}
                onValueChange={handleStatusUpdate}
                disabled={isUpdating}
            >
                <SelectTrigger className="w-32">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="pending">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                            Pending
                        </div>
                    </SelectItem>
                    <SelectItem value="resolved">
                        <div className="flex items-center">
                            <Check className="w-4 h-4 text-green-600 mr-2" />
                            Resolved
                        </div>
                    </SelectItem>
                    <SelectItem value="dismissed">
                        <div className="flex items-center">
                            <X className="w-4 h-4 text-gray-600 mr-2" />
                            Dismissed
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

            {isUpdating && (
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            )}
        </div>
    );
}
