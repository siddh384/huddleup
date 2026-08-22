"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Chip } from "@/components/base/badges/chip";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { ReportStatusUpdater } from "@/components/report-status-updater";
import { formatDate, type ReportData } from "@/components/admin/types";

const reportColumns: ColumnDef<ReportData>[] = [
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <div>
          <div className="font-medium capitalize">
            {r.reason.replace("_", " ")}
          </div>
          {r.description && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {r.description}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "reporter",
    header: "Reporter",
    cell: ({ row }) => row.original.reporter?.name || "Unknown",
  },
  {
    id: "target",
    header: "Target",
    cell: ({ row }) => {
      const r = row.original;
      if (r.reportedVenue) return `Venue: ${r.reportedVenue.name}`;
      if (r.reportedUser) return `User: ${r.reportedUser.name}`;
      return "General";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.getValue("status") as string;
      return (
        <Chip
          color={
            s === "resolved"
              ? "lime"
              : s === "dismissed"
                ? "neutral"
                : "yellow"
          }
        >
          {s}
        </Chip>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Reported",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ReportStatusUpdater
        reportId={row.original.id}
        currentStatus={row.original.status}
      />
    ),
  },
];

export function ReportsTable({ reports }: { reports: ReportData[] }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="px-6 py-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Report Management</h2>
          <p className="text-base text-muted-foreground">
            Review and manage user reports about venues and platform issues
          </p>
        </div>
        <DataTable
          columns={reportColumns}
          data={reports}
          filterColumn="reason"
          filterPlaceholder="Filter reports by reason..."
          label="Reports"
        />
      </CardContent>
    </Card>
  );
}
