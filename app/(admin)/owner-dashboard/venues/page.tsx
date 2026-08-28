import { RiAddLine, RiHomeLine } from "@remixicon/react";
import { ButtonLink } from "@/components/base/buttons/button";
import { getUserVenues, getOwnerBookings } from "@/lib/actions/venues";
import { VenuesTable } from "@/components/owner/venues-table";

export default async function OwnerVenuesPage() {
  const [venuesResult, bookingsResult] = await Promise.all([
    getUserVenues(),
    getOwnerBookings({ pageSize: 1000 }),
  ]);

  // Build a map of venueId -> { totalBookings, revenue }
  const venueStatsMap = new Map<string, { totalBookings: number; revenue: number }>();

  if (bookingsResult.success && bookingsResult.bookings) {
    for (const row of bookingsResult.bookings as any[]) {
      const venueId = row.venue.id;
      const existing = venueStatsMap.get(venueId) ?? {
        totalBookings: 0,
        revenue: 0,
      };
      existing.totalBookings += 1;
      existing.revenue += parseFloat(row.booking.totalPrice || "0");
      venueStatsMap.set(venueId, existing);
    }
  }

  const venues = venuesResult.success
    ? (venuesResult.venues ?? []).map((v: any) => {
        const stats = venueStatsMap.get(v.id) ?? {
          totalBookings: 0,
          revenue: 0,
        };
        return {
          id: v.id,
          name: v.name,
          location: v.location,
          status: v.status,
          isActive: v.isActive ?? true,
          courtsCount: v.courts?.length || 0,
          totalBookings: stats.totalBookings,
          revenue: stats.revenue,
          createdAt: new Date(v.createdAt).toISOString().split("T")[0],
        };
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">My Venues</h1>
          <p className="text-lg text-muted-foreground">
            Manage your venues and their settings
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/create-venue" leadingIcon={RiAddLine}>
            Create New Venue
          </ButtonLink>
          <ButtonLink href="/" variant="secondary" leadingIcon={RiHomeLine}>
            Back to Home
          </ButtonLink>
        </div>
      </div>
      <VenuesTable initialVenues={venues} />
    </div>
  );
}