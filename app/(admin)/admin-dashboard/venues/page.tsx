import { getVenues } from "@/lib/actions/venues";
import { VenuesTable } from "@/components/admin/venues-table";

export default async function AdminVenuesPage() {
  const venuesResult = await getVenues({ pageSize: 50 });

  const venues = venuesResult.success
    ? (venuesResult.venues ?? []).map((v) => ({
        id: v.id,
        name: v.name,
        location: v.location,
        status: v.status as "pending" | "approved" | "rejected",
        description: v.description ?? undefined,
        createdAt:
          v.createdAt instanceof Date
            ? v.createdAt.toISOString()
            : String(v.createdAt),
        owner: v.owner
          ? {
              id: v.owner.id,
              name: v.owner.name ?? "Unknown",
              email: v.owner.email ?? "",
            }
          : undefined,
        courts: v.courts,
      }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
      <VenuesTable venues={venues} />
    </div>
  );
}
