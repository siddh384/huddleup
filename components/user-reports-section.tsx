/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Chip } from "@/components/base/badges/chip";
import { Button } from "@/components/base/buttons/button";
import { CalendarDays, MapPin, MessageSquare } from "lucide-react";

interface UserReport {
  id: string;
  reason: string;
  description: string | null;
  status: string | null;
  createdAt: Date | string;
  reportedVenue?: {
    id: string;
    name: string;
    location: string;
  } | null;
  reportedUser?: {
    id: string;
    name: string;
  } | null;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface UserReportsSectionProps {
  initialReports: UserReport[];
  pagination?: Pagination;
}

const statusChipColor = (
  status: string | null,
): "yellow" | "lime" | "neutral" | "gray" => {
  switch (status) {
    case "pending":
      return "yellow";
    case "resolved":
      return "lime";
    case "dismissed":
      return "neutral";
    default:
      return "gray";
  }
};

const getStatusText = (status: string | null) => {
  switch (status) {
    case "pending":
      return "Under Review";
    case "resolved":
      return "Resolved";
    case "dismissed":
      return "Dismissed";
    default:
      return status || "Unknown";
  }
};

const formatDate = (dateString: Date | string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function UserReportsSection({
  initialReports,
  pagination,
}: UserReportsSectionProps) {
  const [reports] = useState<UserReport[]>(initialReports);

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center py-12">
        <MessageSquare className="size-10 text-foreground-icon-disabled mb-3" />
        <h3 className="text-headline-semibold text-text-primary mb-1">
          No Reports Yet
        </h3>
        <p className="text-body-regular text-text-secondary">
          You haven&apos;t submitted any reports yet. Use the &ldquo;Report an
          Issue&rdquo; tab to submit your first report.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div
          key={report.id}
          className="rounded-3xl border border-border bg-background-primary-default p-5 shadow-xs"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-title-3-semibold text-text-primary truncate">
                {report.reason}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="flex items-center gap-1 text-body-2-regular text-text-secondary">
                  <CalendarDays className="size-3.5 shrink-0" />
                  {formatDate(report.createdAt)}
                </div>
                {report.reportedVenue && (
                  <div className="flex items-center gap-1 text-body-2-regular text-text-secondary">
                    <MapPin className="size-3.5 shrink-0" />
                    {report.reportedVenue.name}
                  </div>
                )}
              </div>
            </div>
            <Chip
              variant="caption"
              color={statusChipColor(report.status)}
            >
              {getStatusText(report.status)}
            </Chip>
          </div>

          {report.description && (
            <p className="text-body-regular text-text-secondary mt-3">
              {report.description}
            </p>
          )}
        </div>
      ))}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-body-2-regular text-text-tertiary">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.totalItems,
            )}{" "}
            of {pagination.totalItems} reports
          </p>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="small"
              disabled={!pagination.hasPrevious}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="small"
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}