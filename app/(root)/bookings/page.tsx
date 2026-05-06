import React, { Suspense } from "react";
import { getUserBookings } from "@/lib/actions/bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, CreditCard } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { BookingPaymentDialog } from "@/components/booking-payment-dialog";
import { PaymentStatusHandler } from "@/components/payment-status-handler";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

const BookingsPage = async () => {
  const result = await getUserBookings();

  if (!result.success) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
          <p className="text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  const bookings = result.bookings || [];

  // Sport name to image mapping
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={null}>
        <PaymentStatusHandler />
      </Suspense>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">
          Manage your court bookings and view booking history
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
          <p className="text-muted-foreground mb-6">
            Start booking courts to see your reservations here
          </p>
          <Link href="/venues">
            <Button>Browse Venues</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => {
            const sportKey = booking.court.sport.name.toLowerCase();
            const sportImage = SPORT_IMAGE_MAP[sportKey] || "/court.png";
            const bookingDate = new Date(booking.bookingDate);
            const isUpcoming =
              bookingDate > new Date() && booking.status === "confirmed";
            const isPast = bookingDate < new Date();
            const isPaid = booking.paymentStatus === "completed";

            return (
              <Card key={booking.id} className="overflow-hidden">
                {/* Court/Sport Image */}
                <div className="relative w-full aspect-[4/3] p-0">
                  <Image
                    src={sportImage}
                    alt={booking.court.sport.name}
                    fill
                    className="object-cover"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(booking.status || "pending")} text-white`}
                    >
                      {booking.status || "pending"}
                    </Badge>
                  </div>

                  {/* Upcoming/Past Badge */}
                  {isUpcoming && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="default" className="bg-green-600">
                        Upcoming
                      </Badge>
                    </div>
                  )}
                  {isPast && booking.status === "confirmed" && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-blue-600">
                        Completed
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {booking.court.name}
                  </CardTitle>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{booking.court.venue.name}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Sport */}
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{booking.court.sport.name}</span>
                  </div>

                  {/* Date and Time */}
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{format(bookingDate, "MMM dd, yyyy")}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="font-semibold">
                        ₹{booking.totalPrice}
                      </span>
                    </div>
                    <Badge
                      className={
                        isPaid
                          ? "bg-green-600 text-white"
                          : "bg-amber-500 text-white"
                      }
                    >
                      {booking.paymentStatus}
                    </Badge>
                  </div>

                  {/* Cancellation info */}
                  {booking.status === "cancelled" &&
                    booking.cancellationReason && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        <strong>Cancelled:</strong> {booking.cancellationReason}
                      </div>
                    )}

                  {/* Payment Section */}
                  {!isPaid && (
                    <div className="pt-2">
                      <BookingPaymentDialog
                        bookingId={booking.id}
                        bookingAmount={Number(booking.totalPrice)}
                        isDisabled={isPaid}
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex gap-2">
                    <Link
                      href={`/venues/${booking.court.venueId}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        View Venue
                      </Button>
                    </Link>

                    {isUpcoming && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        // TODO: Add cancel booking functionality
                        disabled
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
