import { getOwnerBookings } from "@/lib/actions/venues";
import { BookingsTable } from "@/components/owner/bookings-table";

export default async function OwnerBookingsPage() {
  const bookingsResult = await getOwnerBookings({ pageSize: 1000 });

  const bookings = bookingsResult.success
    ? (bookingsResult.bookings ?? []).map((row: any) => ({
        id: row.booking.id,
        bookingDate:
          row.booking.bookingDate instanceof Date
            ? row.booking.bookingDate.toISOString().split("T")[0]
            : String(row.booking.bookingDate).split("T")[0],
        startTime: row.booking.startTime,
        endTime: row.booking.endTime,
        status: row.booking.status,
        paymentStatus: row.booking.paymentStatus,
        venueName: row.venue.name,
        courtName: row.court.name,
        customerName: row.user.name,
        customerEmail: row.user.email,
        totalPrice: parseFloat(row.booking.totalPrice),
        sportName: "",
      }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
      <BookingsTable bookings={bookings} />
    </div>
  );
}