"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  Edit,
  Eye,
  EyeOff,
  MapPin,
  Settings,
  Trash2,
} from "lucide-react";
import { RiMore2Fill } from "@remixicon/react";
import { Chip } from "@/components/base/badges/chip";
import { IconButton } from "@/components/base/buttons/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import type { VenueData } from "@/components/owner/types";
import { toggleVenueActive, deleteVenue } from "@/lib/actions/venues";
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
    header: "Venue Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        {row.getValue("location")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = {
        approved: { label: "Approved", color: "lime" as const },
        pending: { label: "Pending", color: "yellow" as const },
        rejected: { label: "Rejected", color: "rose" as const },
      };
      const chip = config[status as keyof typeof config];

      return (
        <Chip color={chip?.color ?? "neutral"}>
          {chip?.label ?? status}
        </Chip>
      );
    },
  },
  {
    accessorKey: "courtsCount",
    header: "Courts",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("courtsCount")}</div>
    ),
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("revenue"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <VenueActionsDropdown venue={row.original} />,
  },
];

function VenueActionsDropdown({ venue }: { venue: VenueData }) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
          <DropdownMenuItem asChild>
            <Link href={`/venues/${venue.id}/courts`}>
              <Settings className="mr-2 h-4 w-4" />
              Manage courts
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/venues/${venue.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit venue
            </Link>
          </DropdownMenuItem>
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

export function VenuesTable({ initialVenues }: { initialVenues: VenueData[] }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="px-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Venue Management</h2>
          <p className="text-base text-muted-foreground">
            Manage your venues, courts, and settings
          </p>
        </div>
        <DataTable
          columns={venueColumns}
          data={initialVenues}
          filterColumn="name"
          filterPlaceholder="Filter venues by name..."
          label="Venues"
        />
      </CardContent>
    </Card>
  );
}