import React from "react";
import { getVenueById } from "@/lib/actions/venues";
import { getCurrentUser } from "@/lib/actions/users";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/base/buttons/button";
import {
  MapPin,
  Users,
  Clock,
  Wifi,
  UtensilsCrossed,
  ShowerHead,
  Stethoscope,
  Lightbulb,
  Fan,
  Droplets,
  ParkingCircle,
  CheckCircle,
  LucideIcon,
} from "lucide-react";
import { RiArrowLeftLine, RiBuildingLine, RiSettingsLine } from "@remixicon/react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import BookingDialog from "@/components/booking-dialog";
import ReviewsSection from "@/components/reviews-section";
import { VenueVisitTracker } from "@/components/venue-visit-tracker";
import { ExpandableDescription } from "@/components/expandable-description";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

interface VenueDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Amenity → icon mapping using substring matching
const AMENITY_ICONS: Record<string, LucideIcon> = {
  parking: ParkingCircle,
  car: ParkingCircle,
  cafeteria: UtensilsCrossed,
  restaurant: UtensilsCrossed,
  food: UtensilsCrossed,
  canteen: UtensilsCrossed,
  dining: UtensilsCrossed,
  kitchen: UtensilsCrossed,
  shower: ShowerHead,
  bathroom: ShowerHead,
  washroom: ShowerHead,
  "first aid": Stethoscope,
  medical: Stethoscope,
  emergency: Stethoscope,
  wifi: Wifi,
  internet: Wifi,
  lighting: Lightbulb,
  floodlight: Lightbulb,
  light: Lightbulb,
  ac: Fan,
  "air conditioning": Fan,
  cooling: Fan,
  water: Droplets,
  "drinking water": Droplets,
  hydration: Droplets,
};

function getAmenityIcon(amenity: string): LucideIcon {
  const key = amenity.toLowerCase().trim();
  for (const [pattern, icon] of Object.entries(AMENITY_ICONS)) {
    if (key.includes(pattern)) return icon;
  }
  return CheckCircle;
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

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Track venue visit for Recently Visited */}
      <VenueVisitTracker venueId={venue.id} />

      {/* Header Navigation */}
      <div className="mb-8 flex items-center justify-between">
        <Link href="/venues">
          <Button variant="secondary" size="small" leadingIcon={RiArrowLeftLine}>
            Back to Venues
          </Button>
        </Link>

        {/* Management Buttons — visually subdued, xs ghost */}
        {isVenueOwner && (
          <div className="flex items-center gap-1.5">
            <Link href={`/venues/${venue.id}/courts`}>
              <Button variant="ghost" size="xs" leadingIcon={RiBuildingLine}>
                Manage Courts
              </Button>
            </Link>
            <Link href={`/venues/${venue.id}/edit`}>
              <Button variant="ghost" size="xs" leadingIcon={RiSettingsLine}>
                Edit Venue
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Hero Section — 50/50 two-column layout */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left Column — Image Carousel */}
        <div>
          {venue.images && venue.images.length > 0 ? (
            <Carousel
              className="w-full"
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
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px]">
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
              <CarouselPrevious className="-left-4 h-8 w-8 rounded-full border shadow-sm" />
              <CarouselNext className="-right-4 h-8 w-8 rounded-full border shadow-sm" />
            </Carousel>
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[18px] bg-muted">
              <p className="text-body-regular text-muted-foreground">
                No images available
              </p>
            </div>
          )}
        </div>

        {/* Right Column — Venue Information */}
        <div className="space-y-8">
          {/* Venue Name — largest, boldest element */}
          <h1 className="text-[32px]/[1.2] font-bold tracking-tight text-text-primary">
            {venue.name}
          </h1>

          {/* Venue Description */}
          {venue.description && (
            <ExpandableDescription text={venue.description} />
          )}

          {/* Location Section */}
          <div className="space-y-3">
            <h3 className="text-title-3-semibold flex items-center gap-2 text-text-primary">
              <MapPin className="h-5 w-5 text-text-secondary" />
              Location
            </h3>
            <div className="space-y-1.5 pl-7">
              <div className="text-body-regular">
                <span className="font-medium text-text-primary">Address: </span>
                <span className="text-text-secondary">{venue.address}</span>
              </div>
              <div className="text-body-regular">
                <span className="font-medium text-text-primary">Area: </span>
                <span className="text-text-secondary">{venue.location}</span>
              </div>
            </div>
          </div>

          {/* Sports Available Section */}
          <div className="space-y-3">
            <h3 className="text-title-3-semibold flex items-center gap-2 text-text-primary">
              <Users className="h-5 w-5 text-text-secondary" />
              Sports Available
            </h3>
            <div className="pl-7">
              {venue.venueSports && venue.venueSports.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {venue.venueSports.map((venueSport) => (
                    <span
                      key={venueSport.sportId}
                      className="inline-flex items-center rounded-full bg-neutral-900 px-3.5 py-1.5 text-caption-1-semibold text-white"
                    >
                      {venueSport.sport.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-body-regular text-text-secondary">
                  No sports listed
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Amenities Section — full width below hero */}
      {venue.amenities && venue.amenities.length > 0 && (
        <section className="mt-14">
          <h2 className="text-title-1-bold mb-6 text-text-primary">
            Amenities
          </h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {venue.amenities.map((amenity, index) => {
              const Icon = getAmenityIcon(amenity);
              return (
                <div key={index} className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-text-tertiary" />
                  <span className="text-body-regular text-text-primary">
                    {amenity}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Available Courts Section */}
      {venue.courts && venue.courts.length > 0 ? (
        <section className="mt-14">
          <div className="mb-8">
            <h2 className="text-title-1-bold mb-1 text-text-primary">
              Available Courts
            </h2>
            <p className="text-body-regular text-text-secondary">
              Choose from our available courts and book your game
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {venue.courts.map((court) => (
              <Card
                key={court.id}
                className="flex flex-col rounded-3xl border-border shadow-xs hover:shadow-sm transition-shadow p-0"
              >
                <CardContent className="flex flex-grow flex-col p-5">
                  {/* Court Name + Sport Badge */}
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="text-title-2-semibold text-text-primary">
                      {court.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-caption-2-semibold"
                    >
                      {court.sport.name}
                    </Badge>
                  </div>

                  {/* Operating Hours */}
                  <div className="mb-3 flex items-center gap-1.5 text-text-tertiary">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span className="text-body-2-regular">
                      {court.operatingHoursStart} - {court.operatingHoursEnd}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-3 flex items-baseline gap-1.5">
                    <span className="text-display-4-bold text-text-primary">
                      ₹{court.pricePerHour}
                    </span>
                    <span className="text-body-2-regular text-text-tertiary">
                      /hour
                    </span>
                  </div>

                  {/* Availability Badge */}
                  <div className="mb-3">
                    <span className="inline-flex items-center rounded-full bg-status-lime-background px-2.5 py-0.5 text-caption-2-semibold text-status-lime-text">
                      Available
                    </span>
                  </div>

                  {/* Spacer to push button to bottom */}
                  <div className="flex-grow" />

                  {/* Book Now Button */}
                  <BookingDialog
                    courtId={court.id}
                    courtName={court.name}
                    sportName={court.sport.name}
                    pricePerHour={court.pricePerHour}
                    venueName={venue.name}
                    venueLocation={venue.location}
                  >
                    <Button className="w-full" variant="primary">
                      Book Now
                    </Button>
                  </BookingDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-14 rounded-3xl border border-border bg-background-primary-default py-16 text-center">
          <h2 className="text-title-1-bold mb-2 text-text-primary">
            No Courts Available
          </h2>
          <p className="text-body-regular text-text-secondary">
            This venue doesn&apos;t have any courts set up yet. Check back
            later!
          </p>
        </div>
      )}

      {/* Reviews Section */}
      <ReviewsSection
        venueId={venue.id}
        initialAverageRating={venue.rating}
        initialReviewCount={venue.reviewCount}
        initialReviews={venue.reviews as any}
      />

      {/* Owner Footer — subtle, structured separator */}
      <footer className="mt-12 border-t border-border py-6">
        <div className="border-l-2 border-border pl-5">
          <p className="text-body-2-regular mb-0.5 text-text-tertiary">
            Venue Owner
          </p>
          <p className="text-body-medium text-text-primary">
            {venue.owner.name}
          </p>
          <p className="text-body-2-regular text-text-tertiary">
            {venue.owner.email}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VenueDetailsPage;