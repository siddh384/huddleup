"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  Edit,
  Eye,
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
    header: () => <div className="text-center">Courts</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("courtsCount")}
      </div>
    ),
  },
  {
    accessorKey: "revenue",
    header: () => <div className="text-right">Revenue</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("revenue"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const venue = row.original;
      return (
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
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete venue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

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
