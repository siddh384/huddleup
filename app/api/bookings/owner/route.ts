import { NextResponse } from "next/server";
import { getOwnerBookings } from "@/lib/actions/venues";

export async function GET() {
    try {
        // Fetch all owner bookings using the DB-level filtered query (pageSize=1000 as upper bound)
        const result = await getOwnerBookings({ page: 1, pageSize: 1000 });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: result.error === "No authenticated user found" ? 401 : 400 }
            );
        }

        // Transform raw DB rows to match the BookingData shape the dashboard expects
        const bookings = (result.bookings ?? []).map((row: any) => ({
            id: row.booking.id,
            bookingDate: row.booking.bookingDate instanceof Date
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
        }));

        return NextResponse.json({
            success: true,
            bookings,
        });
    } catch (error) {
        console.error("Error in GET /api/bookings/owner:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
