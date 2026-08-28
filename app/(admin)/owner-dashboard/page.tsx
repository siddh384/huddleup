import { RiAddLine, RiHomeLine } from "@remixicon/react";
import { ButtonLink } from "@/components/base/buttons/button";
import { getOwnerDashboardStats } from "@/lib/actions/venues";
import { OverviewStats } from "@/components/owner/overview-stats";
import type { OwnerStats } from "@/components/owner/types";

export default async function OwnerOverviewPage() {
  const statsResult = await getOwnerDashboardStats();

  const stats: OwnerStats = statsResult.success && statsResult.stats
    ? {
        totalVenues: statsResult.stats.totalVenues,
        totalCourts: statsResult.stats.totalCourts,
        totalRevenue: statsResult.stats.totalRevenue,
        totalBookings: statsResult.stats.totalBookings,
        monthlyRevenue: statsResult.stats.monthlyRevenue,
        monthlyBookings: statsResult.stats.monthlyBookings,
        venues: (statsResult.stats.venues ?? []).map((v: any) => ({
          id: v.id,
          name: v.name,
          location: v.location,
          status: v.status,
          isActive: v.isActive ?? true,
          courtsCount: v.courts?.length || 0,
          totalBookings: 0,
          revenue: 0,
          createdAt: new Date(v.createdAt).toISOString().split("T")[0],
        })),
      }
    : {
        totalVenues: 0,
        totalCourts: 0,
        totalRevenue: 0,
        totalBookings: 0,
        monthlyRevenue: 0,
        monthlyBookings: 0,
        venues: [],
      };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Owner Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage your venues, courts, and bookings efficiently
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/create-venue" leadingIcon={RiAddLine}>
            Create New Venue
          </ButtonLink>
          <ButtonLink
            href="/"
            variant="secondary"
            leadingIcon={RiHomeLine}
          >
            Back to Home
          </ButtonLink>
        </div>
      </div>

      <div>
        <h2 className="mb-6 text-2xl font-semibold">Overview</h2>
        <OverviewStats stats={stats} />
      </div>
    </div>
  );
}