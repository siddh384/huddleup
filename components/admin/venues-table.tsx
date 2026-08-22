"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  Edit,
  Eye,
  MapPin,
} from "lucide-react";
import { RiMore2Fill } from "@remixicon/react";
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
import { VenueStatusUpdater } from "@/components/venue-status-updater";
import { formatDate, type VenueData } from "@/components/admin/types";

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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.getValue("status") as string;
      return (
        <Chip
          color={
            s === "approved" ? "lime" : s === "rejected" ? "rose" : "yellow"
          }
        >
          {s}
        </Chip>
      );
    },
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
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {/* <VenueStatusUpdater
          venueId={row.original.id}
          currentStatus={row.original.status}
        /> */}
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
              <Link href={`/venues/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View venue
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/venues/${row.original.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit venue
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

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
