import React, { Suspense } from "react";
import { getUserBookings } from "@/lib/actions/bookings";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { CancelBookingButton } from "@/components/cancel-booking-button";
import { PaymentStatusHandler } from "@/components/payment-status-handler";
import { ButtonLink } from "@/components/base/buttons/button";
import { Chip } from "@/components/base/badges/chip";

export const dynamic = "force-dynamic";

const SPORT_IMAGE_MAP: Record<string, string> = {
  squash: "/sports/squash-s.png",
  basketball: "/sports/basketball.png",
  tennis: "/sports/tennis.png",
  cricket: "/sports/cricket.png",
  badminton: "/sports/badminton.png",
  volleyball: "/sports/volleyball.png",
  "table tennis": "/sports/tennis.png",
  football: "/sports/football.png",
  swimming: "/sports/swimming.png",
};

function getTimingStatus(
  bookingDate: Date,
  startTime: string,
  endTime: string,
): "upcoming" | "live" | "finished" {
  const now = new Date();
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);

  const start = new Date(bookingDate);
  start.setHours(sh, sm, 0, 0);

  const end = new Date(bookingDate);
  end.setHours(eh, em, 0, 0);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "finished";
}

const BookingsPage = async () => {
  const result = await getUserBookings();

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
          <p className="text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  const bookings = (result.bookings || []).filter(
    (b) => b.status !== "cancelled",
  );

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <Suspense fallback={null}>
        <PaymentStatusHandler />
      </Suspense>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">My Bookings</h1>
        <p className="text-muted-foreground">
          Manage your court bookings and view booking history
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-14 h-14 mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No bookings yet
          </h2>
          <p className="text-muted-foreground mb-6">
            Start booking courts to see your reservations here
          </p>
          <ButtonLink href="/venues" variant="primary" size="medium">
            Browse Venues
          </ButtonLink>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => {
            const venueImages = booking.court.venue.images;
            const venueImage =
              venueImages && venueImages.length > 0
                ? venueImages[0]
                : null;
            const sportKey = booking.court.sport.name.toLowerCase();
            const cardImage =
              venueImage ||
              SPORT_IMAGE_MAP[sportKey] ||
              "/court.png";
            const bookingDate = new Date(booking.bookingDate);
            const timing = getTimingStatus(
              bookingDate,
              booking.startTime,
              booking.endTime,
            );

            return (
              <div
                key={booking.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Hero Image — same height as /venues cards */}
                <div className="relative w-full h-[220px] sm:h-[260px] md:h-[280px] shrink-0">
                  <Image
                    src={cardImage}
                    alt={booking.court.venue.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />

                  {/* Timing Chip */}
                  <div className="absolute top-3 left-3">
                    {timing === "upcoming" && (
                      <Chip variant="bold" color="lime">
                        Upcoming
                      </Chip>
                    )}
                    {timing === "live" && (
                      <Chip variant="bold" color="yellow">
                        Currently Going On
                      </Chip>
                    )}
                    {timing === "finished" && (
                      <Chip variant="bold" color="blue">
                        Finished
                      </Chip>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-1.5 p-5">
                  {/* Venue Name */}
                  <h3 className="text-lg font-semibold leading-snug tracking-tight text-card-foreground">
                    {booking.court.venue.name}
                  </h3>

                  {/* Area + Court Name */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {booking.court.venue.location}
                      </span>
                    </div>
                    <span className="text-foreground font-medium shrink-0 ml-3">
                      {booking.court.name}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center justify-between pt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{format(bookingDate, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                  </div>

                  {/* Amount Paid */}
                  <p className="text-sm pt-0.5">
                    <span className="text-muted-foreground">Amount paid: </span>
                    <span className="font-semibold text-foreground">
                      ₹{booking.totalPrice}
                    </span>
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 mt-auto">
                    <ButtonLink
                      href={`/venues/${booking.court.venueId}`}
                      variant="secondary"
                      size="small"
                      className="flex-1"
                    >
                      View Venue
                    </ButtonLink>
                    {timing === "upcoming" && (
                      <CancelBookingButton bookingId={booking.id} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
