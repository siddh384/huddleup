import { NextRequest, NextResponse } from "next/server";
import { getVenueCourts, getVenueSports } from "@/lib/actions/courts";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        if (type === 'sports') {
            // Get available sports for the venue
            const result = await getVenueSports(params.id);

            if (!result.success) {
                return NextResponse.json(
                    { error: result.error },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { sports: result.sports },
                { status: 200 }
            );
        } else {
            // Get courts for the venue
            const result = await getVenueCourts(params.id);

            if (!result.success) {
                return NextResponse.json(
                    { error: result.error },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { courts: result.courts },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error("Venue courts/sports fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
