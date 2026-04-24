import { getCurrentUser, getAllUsers } from "@/lib/actions/users";
import { getVenues } from "@/lib/actions/venues";
import { getAllReports, getReportsStats } from "@/lib/actions/reports";
import { redirect } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Users,
  Settings,
  Building2,
  Flag,
  MessageSquare,
} from "lucide-react";
import { UserRoleUpdater } from "@/components/user-role-updater";
import { VenueStatusUpdater } from "@/components/venue-status-updater";
import { ReportStatusUpdater } from "@/components/report-status-updater";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.user) {
    redirect("/auth/signin");
  }

  // Check if user is admin
  if (userResult.user.role !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You need admin privileges to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get all users, venues, and reports
  const [usersResult, venuesResult, reportsResult, reportsStatsResult] =
    await Promise.all([
      getAllUsers({ pageSize: 50 }),
      getVenues({ pageSize: 50, status: "pending" }),
      getAllReports({ pageSize: 20, status: "pending" }),
      getReportsStats(),
    ]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Settings className="w-6 h-6 mr-2" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid gap-6">
        {/* Venue Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Pending Venues
            </CardTitle>
            <CardDescription>
              Review and approve venue submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {venuesResult.success &&
            venuesResult.venues &&
            venuesResult.venues.length > 0 ? (
              <div className="space-y-4">
                {venuesResult.venues.map((venue) => (
                  <div
                    key={venue.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{venue.name}</p>
                          <p className="text-sm text-gray-500">
                            {venue.location}
                          </p>
                          {venue.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {venue.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">{venue.status}</Badge>
                      </div>
                      {venue.owner && (
                        <p className="text-xs text-gray-500 mt-2">
                          Owner: {venue.owner.name} ({venue.owner.email})
                        </p>
                      )}
                    </div>
                    <VenueStatusUpdater
                      venueId={venue.id}
                      currentStatus={venue.status || "pending"}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No pending venues to review.</p>
            )}
          </CardContent>
        </Card>

        {/* Reports Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flag className="w-5 h-5 mr-2" />
              Pending Reports
            </CardTitle>
            <CardDescription>
              Review and manage user reports about venues and issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportsResult.success &&
            reportsResult.reports &&
            reportsResult.reports.length > 0 ? (
              <div className="space-y-4">
                {reportsResult.reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div>
                          <p className="font-medium">{report.reason}</p>
                          <p className="text-sm text-gray-500">
                            Reported by: {report.reporter?.name} (
                            {report.reporter?.email})
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">{report.status}</Badge>
                      </div>

                      {report.reportedVenue && (
                        <div className="mb-2">
                          <p className="text-sm text-blue-600">
                            <strong>Venue:</strong> {report.reportedVenue.name}{" "}
                            - {report.reportedVenue.location}
                          </p>
                        </div>
                      )}

                      {report.description && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2 line-clamp-3">
                          {report.description}
                        </p>
                      )}
                    </div>
                    <ReportStatusUpdater
                      reportId={report.id}
                      currentStatus={report.status || "pending"}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No pending reports to review.</p>
            )}
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              User Management
            </CardTitle>
            <CardDescription>Manage user roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {usersResult.success && usersResult.users ? (
              <div className="space-y-4">
                {usersResult.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "default"
                            : user.role === "facility_owner"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <UserRoleUpdater userId={user.id} currentRole={user.role} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Failed to load users.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {usersResult.success ? usersResult.users?.length || 0 : 0}
              </div>
              <p className="text-sm text-gray-500">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {usersResult.success
                  ? usersResult.users?.filter(
                      (u) => u.role === "facility_owner",
                    ).length || 0
                  : 0}
              </div>
              <p className="text-sm text-gray-500">Facility Owners</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {usersResult.success
                  ? usersResult.users?.filter((u) => u.role === "admin")
                      .length || 0
                  : 0}
              </div>
              <p className="text-sm text-gray-500">Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {reportsStatsResult.success
                  ? reportsStatsResult.stats?.pending || 0
                  : 0}
              </div>
              <p className="text-sm text-gray-500">Pending Reports</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
