import { Building2, Flag, UserCheck, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminStats } from "@/components/admin/types";

export function AdminOverviewStats({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-700">
            {stats.totalUsers}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-green-600 font-medium">+12%</span> from last
            month
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Facility Owners
          </CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-700">
            {stats.facilityOwners}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.admins} admin{stats.admins !== 1 ? "s" : ""} total
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Venues</CardTitle>
          <Building2 className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-700">
            {stats.pendingVenues}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Reports
          </CardTitle>
          <Flag className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-700">
            {stats.pendingReports}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-red-600 font-medium">
              {stats.recentReports}
            </span>{" "}
            this week
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
