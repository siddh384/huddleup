import { getCurrentUser } from "@/lib/actions/users";
import { getUserVenues } from "@/lib/actions/venues";
import { redirect } from "next/navigation";
import { OwnerDashboardClient } from "@/components/owner/owner-dashboard-client";

export default async function OwnerDashboardPage() {
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.user) {
    redirect("/sign-in");
  }

  if (
    userResult.user.role !== "facility_owner" &&
    userResult.user.role !== "admin"
  ) {
    redirect("/");
  }

  // Fetch venues server-side
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

  return <OwnerDashboardClient initialVenues={venues} />;
}
