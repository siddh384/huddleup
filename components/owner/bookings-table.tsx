"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { DataTable } from "@/components/owner/data-table";
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
      <Badge variant="outline" className="text-xs">
        {row.original.sportName || "N/A"}
      </Badge>
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
      const statusConfig = {
        confirmed: {
          label: "Confirmed",
          variant: "default" as const,
          icon: CheckCircle,
        },
        cancelled: {
          label: "Cancelled",
          variant: "destructive" as const,
          icon: XCircle,
        },
        completed: {
          label: "Completed",
          variant: "secondary" as const,
          icon: CheckCircle,
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
];

export function BookingsTable() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // The API enforces the owner role.
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setBookingsLoading(true);
        const response = await fetch("/api/bookings/owner");
        const data = await response.json();

        if (data.success && data.bookings) {
          setBookings(data.bookings);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Recent Bookings</h2>
          <p className="text-base text-muted-foreground">
            View and manage all bookings across your venues
          </p>
        </div>
        {bookingsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-4 text-lg">Loading bookings...</span>
          </div>
        ) : (
          <DataTable
            columns={bookingColumns}
            data={bookings}
            filterColumn="venueName"
            filterPlaceholder="Filter bookings by venue..."
            label="Bookings"
          />
        )}
      </CardContent>
    </Card>
  );
}
