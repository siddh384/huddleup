import { NextResponse } from "next/server";
import { getOwnerVenueBookings } from "@/lib/actions/bookings";

export async function GET() {
    try {
        const result = await getOwnerVenueBookings();

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: result.error === "No authenticated user found" ? 401 : 400 }
            );
        }

        return NextResponse.json({
            success: true,
            bookings: result.bookings
        });
    } catch (error) {
        console.error("Error in GET /api/bookings/owner:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
