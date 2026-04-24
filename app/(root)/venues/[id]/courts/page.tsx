import React from "react";
import { getVenueById } from "@/lib/actions/venues";
import { getVenueCourts, getVenueSports } from "@/lib/actions/courts";
import { getCurrentUser } from "@/lib/actions/users";
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
  ArrowLeft,
  Plus,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CourtForm } from "@/components/court-form";
import { DeleteCourtDialog } from "@/components/delete-court-dialog";
import { CourtsTable } from "@/components/courts-table";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

interface CourtsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const CourtsPage = async ({ params }: CourtsPageProps) => {
  const resolvedParams = await params;
  const venueId = resolvedParams.id;

  // Get current user
  const userResult = await getCurrentUser();
  if (!userResult.success || !userResult.user) {
    redirect("/sign-in");
  }

  // Get venue details
  const venueResult = await getVenueById(venueId);
  if (!venueResult.success || !venueResult.venue) {
    notFound();
  }

  const venue = venueResult.venue;

  // Check if user owns the venue or is admin
  if (
    venue.ownerId !== userResult.user.id &&
    userResult.user.role !== "admin"
  ) {
    redirect("/venues");
  }

  // Get courts and available sports
  const [courtsResult, sportsResult] = await Promise.all([
    getVenueCourts(venueId),
    getVenueSports(venueId),
  ]);

  if (!courtsResult.success) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-destructive">
            Error loading courts: {courtsResult.error}
          </p>
        </div>
      </div>
    );
  }

  if (!sportsResult.success) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-destructive">
            Error loading sports: {sportsResult.error}
          </p>
        </div>
      </div>
    );
  }

  const courts = courtsResult.courts || [];
  const availableSports = sportsResult.sports || [];

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/venues/${venueId}`}>
              <Button variant="outline" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Venue
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Manage Courts</h1>
            <p className="text-muted-foreground mt-2">
              {venue.name} - {courts.length} court
              {courts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Available Sports Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Available Sports</CardTitle>
          <CardDescription>
            Courts can only be created for sports that are available at this
            venue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableSports.map((sport) => (
              <Badge key={sport.id} variant="secondary">
                {sport.name}
              </Badge>
            ))}
            {availableSports.length === 0 && (
              <p className="text-muted-foreground">
                No sports configured for this venue.{" "}
                <Link
                  href={`/venues/${venueId}/edit`}
                  className="text-primary hover:underline"
                >
                  Add sports to venue
                </Link>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Court Form */}
      {availableSports.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Add New Court</CardTitle>
            <CardDescription>Create a new court for this venue</CardDescription>
          </CardHeader>
          <CardContent>
            <CourtForm venueId={venueId} availableSports={availableSports} />
          </CardContent>
        </Card>
      )}

      {/* Courts List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Courts ({courts.length})</CardTitle>
          <CardDescription>Manage all courts for this venue</CardDescription>
        </CardHeader>
        <CardContent>
          {courts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No courts created yet
              </p>
              {availableSports.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Add sports to your venue first to create courts
                </p>
              )}
            </div>
          ) : (
            <CourtsTable
              courts={courts.map((court) => ({
                ...court,
                isActive: court.isActive ?? false,
              }))}
              availableSports={availableSports}
              venueId={venueId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourtsPage;
