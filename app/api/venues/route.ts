import { NextResponse } from "next/server";
import { getUserVenues } from "@/lib/actions/venues";

export async function GET() {
    try {
        const result = await getUserVenues();

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: result.error === "No authenticated user found" ? 401 : 400 }
            );
        }

        return NextResponse.json({
            success: true,
            venues: result.venues
        });
    } catch (error) {
        console.error("Error in GET /api/venues:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
