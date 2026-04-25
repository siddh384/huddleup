import React from "react";
import { getVenueById } from "@/lib/actions/venues";
import { getCurrentUser } from "@/lib/actions/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  MapPin,
  Calendar,
  Star,
  ArrowLeft,
  Users,
  Clock,
  Settings,
  Building,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import BookingDialog from "@/components/booking-dialog";
import ReviewsSection from "@/components/reviews-section";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

interface VenueDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const VenueDetailsPage = async ({ params }: VenueDetailsPageProps) => {
  const resolvedParams = await params;
  const venueResult = await getVenueById(resolvedParams.id);

  if (!venueResult.success || !venueResult.venue) {
    notFound();
  }

  const venue = venueResult.venue;

  // Get current user to check if they own this venue
  const userResult = await getCurrentUser();
  const user = userResult.success ? userResult.user : null;
  const isVenueOwner =
    user && (user.id === venue.ownerId || user.role === "admin");

  // Sport name to image mapping
  const SPORT_IMAGE_MAP: Record<string, string> = {
    squash: "/sports/squash-s.png",
    basketball: "/sports/basketball.png",
    tennis: "/sports/tennis.png",
    cricket: "/sports/cricket.png",
    badminton: "/sports/badminton.png",
    volleyball: "/sports/volleyball.png",
    "table tennis": "/sports/tennis.png", // Using tennis as fallback
    football: "/sports/football.png",
    swimming: "/sports/swimming.png",
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header with Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Link href="/venues">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Venues
            </Button>
          </Link>

          {/* Management Buttons for Venue Owner */}
          {isVenueOwner && (
            <div className="flex items-center gap-2">
              <Link href={`/venues/${venue.id}/courts`}>
                <Button variant="outline" size="sm">
                  <Building className="w-4 h-4 mr-2" />
                  Manage Courts
                </Button>
              </Link>
              <Link href={`/venues/${venue.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Venue
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - 50/50 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* Left Column - Image Carousel (50%) */}
        <div className="flex items-center justify-center">
          {venue.images && venue.images.length > 0 ? (
            <Carousel
              className="w-full max-w-2xl"
              opts={{
                align: "start",
                loop: true,
                dragFree: true,
                containScroll: "trimSnaps",
              }}
            >
              <CarouselContent>
                {venue.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${venue.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <div className="flex items-center justify-center w-full h-96 bg-muted rounded-lg">
              <p className="text-muted-foreground">No images available</p>
            </div>
          )}
        </div>

        {/* Right Column - Venue Details (50%) */}
        <div className="space-y-6">
          {/* Venue Header */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{venue.name}</h1>
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span className="text-lg">{venue.location}</span>
            </div>
            {venue.description && (
              <p className="text-muted-foreground text-lg leading-relaxed">
                {venue.description}
              </p>
            )}
          </div>

          {/* Location Details */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location
            </h3>
            <div className="ml-7 space-y-2">
              <div>
                <span className="font-medium">Address: </span>
                <span className="text-muted-foreground">{venue.address}</span>
              </div>
              <div>
                <span className="font-medium">Area: </span>
                <span className="text-muted-foreground">{venue.location}</span>
              </div>
            </div>
          </div>

          {/* Sports Available */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Sports Available
            </h3>
            <div className="ml-7">
              {venue.venueSports && venue.venueSports.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {venue.venueSports.map((venueSport) => (
                    <Badge
                      key={venueSport.sportId}
                      variant="secondary"
                      className="text-sm"
                    >
                      {venueSport.sport.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No sports listed</p>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Amenities</h3>
            <div className="ml-7">
              {venue.amenities && venue.amenities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {venue.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No amenities listed</p>
              )}
            </div>
          </div>

          {/* Owner Info */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Venue Owner</h3>
            <div className="ml-7 space-y-1">
              <p className="font-medium">{venue.owner.name}</p>
              <p className="text-muted-foreground">{venue.owner.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courts Grid Section */}
      {venue.courts && venue.courts.length > 0 && (
        <div className="mt-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Available Courts</h2>
            <p className="text-muted-foreground">
              Choose from our available courts and book your game
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venue.courts.map((court) => {
              // Get sport image based on sport name
              const sportKey = court.sport.name.toLowerCase();
              const sportImage = SPORT_IMAGE_MAP[sportKey] || "/court.png";

              return (
                <Card
                  key={court.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col p-0"
                >
                  {/* Court Image */}
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                      src={sportImage}
                      alt={court.sport.name}
                      fill
                      className="object-cover"
                    />

                    {/* Sport Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="secondary"
                        className="bg-background/90 backdrop-blur-sm"
                      >
                        {court.sport.name}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6 flex flex-col flex-grow">
                    {/* Court Name and Details */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-2">{court.name}</h3>
                      <div className="flex items-center text-muted-foreground mb-3">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {court.operatingHoursStart} -{" "}
                          {court.operatingHoursEnd}
                        </span>
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-primary">
                          ₹{court.pricePerHour}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /hour
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <Badge variant="outline" className="text-xs">
                        Available
                      </Badge>
                    </div>

                    {/* Spacer to push button to bottom */}
                    <div className="flex-grow"></div>

                    {/* Book Now Button */}
                    <BookingDialog
                      courtId={court.id}
                      courtName={court.name}
                      sportName={court.sport.name}
                      pricePerHour={court.pricePerHour}
                      venueName={venue.name}
                      venueLocation={venue.location}
                    >
                      <Button className="w-full mt-4">Book Now</Button>
                    </BookingDialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <ReviewsSection
        venueId={venue.id}
        initialAverageRating={venue.rating}
        initialReviewCount={venue.reviewCount}
        initialReviews={venue.reviews as any}
      />
    </div>
  );
};

export default VenueDetailsPage;
