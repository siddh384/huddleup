import Link from "next/link";
import { Home, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserVenues } from "@/lib/actions/venues";
import { OverviewStats } from "@/components/owner/overview-stats";

export default async function OwnerOverviewPage() {
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
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Owner Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage your venues, courts, and bookings efficiently
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <Link href="/create-venue">
              <Plus className="mr-2 h-5 w-5" />
              Create New Venue
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>

      <div>
        <h2 className="mb-6 text-2xl font-semibold">Overview</h2>
        <OverviewStats initialVenues={venues} />
      </div>
    </div>
  );
}
