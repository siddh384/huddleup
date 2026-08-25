import { RiHomeLine } from "@remixicon/react";
import { ButtonLink } from "@/components/base/buttons/button";
import { getAllUsers } from "@/lib/actions/users";
import { getVenues } from "@/lib/actions/venues";
import { getReportsStats } from "@/lib/actions/reports";
import { AdminOverviewStats } from "@/components/admin/overview-stats";

export default async function AdminOverviewPage() {
  // Stats count across the user and venue lists; report counts come pre-aggregated
  const [usersResult, venuesResult, reportsStatsResult] = await Promise.all([
    getAllUsers({ pageSize: 50 }),
    getVenues({ pageSize: 50 }),
    getReportsStats(),
  ]);

  const users = usersResult.success ? (usersResult.users ?? []) : [];
  const venues = venuesResult.success ? (venuesResult.venues ?? []) : [];

  const adminStats = {
    totalUsers: users.length,
    facilityOwners: users.filter((u) => u.role === "facility_owner").length,
    admins: users.filter((u) => u.role === "admin").length,
    pendingVenues: venues.filter((v) => v.status === "pending").length,
    pendingReports: reportsStatsResult.success
      ? reportsStatsResult.stats?.pending ?? 0
      : 0,
    recentReports: reportsStatsResult.success
      ? reportsStatsResult.stats?.recentReports ?? 0
      : 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage users, venues, and platform reports
          </p>
        </div>
        <ButtonLink href="/" variant="secondary" leadingIcon={RiHomeLine}>
          Back to Home
        </ButtonLink>
      </div>

      <div>
        <h2 className="mb-6 text-2xl font-semibold">Overview</h2>
        <AdminOverviewStats stats={adminStats} />
      </div>
    </div>
  );
}
