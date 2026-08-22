import { getUserVenues } from "@/lib/actions/venues";
import { VenuesTable } from "@/components/owner/venues-table";

export default async function OwnerVenuesPage() {
  const venuesResult = await getUserVenues();

  const venues = venuesResult.success
    ? (venuesResult.venues ?? []).map((v: any) => ({
        id: v.id,
        name: v.name,
        location: v.location,
        status: v.status,
        courtsCount: v.courts?.length || 0,
        totalBookings: 0,
        revenue: 0,
        createdAt: new Date(v.createdAt).toISOString().split("T")[0],
      }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Venues</h1>
      <VenuesTable initialVenues={venues} />
    </div>
  );
}
