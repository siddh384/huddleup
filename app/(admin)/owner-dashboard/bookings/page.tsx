import { BookingsTable } from "@/components/owner/bookings-table";

export default function OwnerBookingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
      <BookingsTable />
    </div>
  );
}
