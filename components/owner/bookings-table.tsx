"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Chip } from "@/components/base/badges/chip";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import type { BookingData } from "@/components/owner/types";


const bookingColumns: ColumnDef<BookingData>[] = [
  {
    accessorKey: "bookingDate",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("bookingDate"));
      return <div className="font-medium">{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "venueName",
    header: "Venue",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("venueName")}</div>
    ),
  },
  {
    accessorKey: "courtName",
    header: "Court",
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("customerName")}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.customerEmail}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "sportName",
    header: "Sport",
    cell: ({ row }) => (
      <Chip variant="caption" color="gray">
        {row.original.sportName || "N/A"}
      </Chip>
    ),
  },
  {
    accessorKey: "totalPrice",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount =
        typeof row.original.totalPrice === "number"
          ? row.original.totalPrice
          : 0;
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = {
        confirmed: { label: "Confirmed", color: "lime" as const },
        cancelled: { label: "Cancelled", color: "rose" as const },
        completed: { label: "Completed", color: "blue" as const },
      };
      const chip = config[status as keyof typeof config];

      return (
        <Chip color={chip?.color ?? "neutral"}>
          {chip?.label ?? status}
        </Chip>
      );
    },
  },
];

export function BookingsTable({ bookings }: { bookings: BookingData[] }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Recent Bookings</h2>
          <p className="text-base text-muted-foreground">
            View and manage all bookings across your venues
          </p>
        </div>
        <DataTable
          columns={bookingColumns}
          data={bookings}
          filterColumn="venueName"
          filterPlaceholder="Filter bookings by venue..."
          label="Bookings"
        />
      </CardContent>
    </Card>
  );
}