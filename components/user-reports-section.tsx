"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export function UserReportsSection({
  initialReports,
  pagination,
}: UserReportsSectionProps) {
  const [reports] = useState<UserReport[]>(initialReports);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "pending":
        return "warning";
      case "resolved":
        return "success";
      case "dismissed":
        return "secondary";
      default:
        return "default";
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

  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No Reports Yet
        </h3>
        <p className="text-gray-500">
          You haven't submitted any reports yet. Use the "Report an Issue" tab
          to submit your first report.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="border-l-4 border-l-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{report.reason}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    {formatDate(report.createdAt)}
                  </div>
                  {report.reportedVenue && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {report.reportedVenue.name}
                    </div>
                  )}
                </div>
              </div>
              <Badge variant={getStatusColor(report.status) as any}>
                {getStatusText(report.status)}
              </Badge>
            </div>
          </CardHeader>

          {(report.description || report.reportedVenue) && (
            <CardContent className="pt-0">
              {report.description && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Description:
                  </h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {report.description}
                  </p>
                </div>
              )}

              {report.reportedVenue && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Reported Venue:
                  </h4>
                  <p className="text-sm text-gray-600">
                    <strong>{report.reportedVenue.name}</strong> -{" "}
                    {report.reportedVenue.location}
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.totalItems,
            )}{" "}
            of {pagination.totalItems} reports
          </p>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevious}
            >
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!pagination.hasNext}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
