import React from "react";
import { getUserVenues } from "@/lib/actions/venues";
import { getCurrentUser } from "@/lib/actions/users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Plus,
  MapPin,
  Star,
  Users,
  Clock,
  Settings,
  Eye,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

const MyVenuesPage = async () => {
  // Get current user
  const userResult = await getCurrentUser();
  if (!userResult.success || !userResult.user) {
    redirect("/sign-in");
  }

  const user = userResult.user;

  // Check if user has facility_owner role or admin role
  if (user.role !== "facility_owner" && user.role !== "admin") {
    redirect("/");
  }

  // Get user's venues
  const venuesResult = await getUserVenues();

  if (!venuesResult.success) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-destructive">
            Error loading venues: {venuesResult.error}
          </p>
        </div>
      </div>
    );
  }

  const venues = venuesResult.venues || [];

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Venues</h1>
            <p className="text-muted-foreground">
              Manage your {venues.length} venue{venues.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/create-venue">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Venue
            </Button>
          </Link>
        </div>
      </div>

      {/* Venues Grid */}
      {venues.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No venues yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first venue to start managing courts and bookings
            </p>
            <Link href="/create-venue">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Venue
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <Card
              key={venue.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                {venue.images && venue.images.length > 0 ? (
                  <Image
                    src={venue.images[0]}
                    alt={venue.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <Building className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      venue.status === "approved"
                        ? "default"
                        : venue.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {venue.status}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{venue.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {venue.location}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{venue.courts?.length || 0} courts</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{venue.venueSports?.length || 0} sports</span>
                  </div>
                </div>

                {/* Sports */}
                {venue.venueSports && venue.venueSports.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-1">
                      {venue.venueSports.slice(0, 3).map((venueSport) => (
                        <Badge
                          key={venueSport.sportId}
                          variant="outline"
                          className="text-xs"
                        >
                          {venueSport.sport.name}
                        </Badge>
                      ))}
                      {venue.venueSports.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{venue.venueSports.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/venues/${venue.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/venues/${venue.id}/courts`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Building className="w-4 h-4 mr-2" />
                      Courts
                    </Button>
                  </Link>
                </div>

                {/* Status-specific info */}
                {venue.status === "pending" && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    Waiting for admin approval
                  </div>
                )}
                {venue.status === "rejected" && venue.rejectionReason && (
                  <div className="text-xs text-destructive border-t pt-2">
                    Rejected: {venue.rejectionReason}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyVenuesPage;
