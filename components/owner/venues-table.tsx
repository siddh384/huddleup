"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  Edit,
  Eye,
  MapPin,
  MoreHorizontal,
  Settings,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { DataTable } from "@/components/owner/data-table";
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
      const statusConfig = {
        approved: {
          label: "Approved",
          variant: "default" as const,
          icon: CheckCircle,
        },
        pending: {
          label: "Pending",
          variant: "secondary" as const,
          icon: Clock,
        },
        rejected: {
          label: "Rejected",
          variant: "destructive" as const,
          icon: XCircle,
        },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      const Icon = config?.icon;

      return (
        <Badge
          variant={config?.variant || "default"}
          className="flex items-center gap-1"
        >
          {Icon && <Icon className="h-3 w-3" />}
          {config?.label || status}
        </Badge>
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
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
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
