import { NextRequest, NextResponse } from "next/server";
import { createCourt } from "@/lib/actions/courts";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { venueId, name, sportId, pricePerHour, operatingHoursStart, operatingHoursEnd } = body;

        // Validate required fields
        if (!venueId || !name || !sportId || !pricePerHour || !operatingHoursStart || !operatingHoursEnd) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const result = await createCourt({
            venueId,
            name,
            sportId,
            pricePerHour,
            operatingHoursStart,
            operatingHoursEnd,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Court created successfully", court: result.court },
            { status: 201 }
        );
    } catch (error) {
        console.error("Court creation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
