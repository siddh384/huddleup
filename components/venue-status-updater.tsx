"use client";

import { useState } from "react";
import { updateVenueStatus } from "@/lib/actions/venues";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";

interface VenueStatusUpdaterProps {
  venueId: string;
  currentStatus: string;
}

export function VenueStatusUpdater({
  venueId,
  currentStatus,
}: VenueStatusUpdaterProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    if (status === "rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateVenueStatus(
        venueId,
        status,
        status === "rejected" ? rejectionReason : undefined,
      );

      if (result.success) {
        toast.success(`Venue ${status} successfully`);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(result.error || `Failed to ${status} venue`);
      }
    } catch (error) {
      toast.error("An error occurred while updating the venue status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = () => {
    setShowRejectionInput(true);
  };

  const confirmReject = () => {
    handleStatusUpdate("rejected");
  };

  const cancelReject = () => {
    setShowRejectionInput(false);
    setRejectionReason("");
  };

  if (currentStatus === "approved") {
    return (
      <div className="flex items-center space-x-2">
        <Check className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-600">Approved</span>
      </div>
    );
  }

  if (currentStatus === "rejected") {
    return (
      <div className="flex items-center space-x-2">
        <X className="w-4 h-4 text-red-600" />
        <span className="text-sm text-red-600">Rejected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {showRejectionInput ? (
        <div className="flex flex-col space-y-2">
          <Input
            placeholder="Rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-48"
          />
          <div className="flex space-x-2">
            <Button
              onClick={confirmReject}
              disabled={isUpdating || !rejectionReason.trim()}
              variant="destructive"
              size="sm"
            >
              {isUpdating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Confirm Reject"
              )}
            </Button>
            <Button
              onClick={cancelReject}
              disabled={isUpdating}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Button
            onClick={() => handleStatusUpdate("approved")}
            disabled={isUpdating}
            variant="default"
            size="sm"
          >
            {isUpdating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Check className="w-3 h-3 mr-1" />
                Approve
              </>
            )}
          </Button>
          <Button
            onClick={handleReject}
            disabled={isUpdating}
            variant="destructive"
            size="sm"
          >
            <X className="w-3 h-3 mr-1" />
            Reject
          </Button>
        </>
      )}
    </div>
  );
}
