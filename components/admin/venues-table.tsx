"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Trash2,
  MapPin,
} from "lucide-react";
import { RiMore2Fill, RiCheckLine, RiCloseLine } from "@remixicon/react";
import { Chip } from "@/components/base/badges/chip";
import { IconButton } from "@/components/base/buttons/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { formatDate, type VenueData } from "@/components/admin/types";
import { toggleVenueActive, deleteVenue, updateVenueStatus } from "@/lib/actions/venues";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const venueColumns: ColumnDef<VenueData>[] = [
  {
    accessorKey: "name",
    header: "Venue",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("name")}</div>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {row.original.location}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => <div className="font-medium capitalize">{row.getValue("city")}</div>,
  },
  {
    id: "owner",
    header: "Owner",
    cell: ({ row }) => row.original.owner?.name || "Unknown",
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const isActive = row.original.isActive;

      // Rejected venues always show as Rejected
      if (status === "rejected") {
        return <Chip color="rose">Rejected</Chip>;
      }

      // Pending venues show as Pending
      if (status === "pending") {
        return <Chip color="yellow">Pending</Chip>;
      }

      // Approved venues show Enabled/Disabled based on isActive
      return (
        <Chip color={isActive ? "lime" : "neutral"}>
          {isActive ? "Enabled" : "Disabled"}
        </Chip>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <VenueActionsDropdown venue={row.original} />,
  },
];

function VenueActionsDropdown({ venue }: { venue: VenueData }) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const result = await updateVenueStatus(venue.id, "approved");
      if (result.success) {
        toast.success("Venue approved successfully");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to approve venue");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setIsRejecting(true);
    try {
      const result = await updateVenueStatus(venue.id, "rejected", rejectionReason);
      if (result.success) {
        toast.success("Venue rejected");
        setRejectionDialogOpen(false);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to reject venue");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleToggleActive = async () => {
    setIsToggling(true);
    try {
      const result = await toggleVenueActive(venue.id);
      if (result.success) {
        toast.success(
          venue.isActive
            ? "Venue disabled successfully"
            : "Venue enabled successfully",
        );
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to toggle venue status");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteVenue(venue.id);
      if (result.success) {
        toast.success("Venue deleted successfully");
        setDeleteDialogOpen(false);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to delete venue");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const isPending = venue.status === "pending";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            icon={RiMore2Fill}
            size="small"
            aria-label="Open venue actions"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/venues/${venue.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View venue
            </Link>
          </DropdownMenuItem>

          {isPending && (
            <>
              <DropdownMenuItem onClick={handleApprove} disabled={isApproving}>
                {isApproving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RiCheckLine className="mr-2 h-4 w-4" />
                )}
                Approve venue
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setRejectionDialogOpen(true)}
                disabled={isRejecting}
              >
                <RiCloseLine className="mr-2 h-4 w-4" />
                Reject venue
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem
            onClick={handleToggleActive}
            disabled={isToggling}
          >
            {isToggling ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : venue.isActive ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {venue.isActive ? "Disable venue" : "Enable venue"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onSelect={(e) => {
              e.preventDefault();
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete venue
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rejection reason dialog */}
      <AlertDialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Venue</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting <strong>{venue.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-3">
            <input
              type="text"
              placeholder="Rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRejecting} onClick={() => setRejectionReason("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !rejectionReason.trim()}
            >
              {isRejecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Venue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{venue.name}</strong>?
              This action cannot be undone. The venue, its courts, and all
              associated data will be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Yes, delete venue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function VenuesTable({ venues }: { venues: VenueData[] }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="px-6 py-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Venue Management</h2>
          <p className="text-base text-muted-foreground">
            Review and manage venue submissions and approvals
          </p>
        </div>  
        <DataTable
          columns={venueColumns}
          data={venues}
          filterColumn="name"
          filterPlaceholder="Filter venues by name..."
          label="Venues"
        />
      </CardContent>
    </Card>
  );
}