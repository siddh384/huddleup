import { NextRequest, NextResponse } from "next/server";
import { updateCourt, deleteCourt, getCourtById } from "@/lib/actions/courts";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const result = await getCourtById(params.id);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { court: result.court },
            { status: 200 }
        );
    } catch (error) {
        console.error("Court fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();

        const result = await updateCourt(params.id, body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Court updated successfully", court: result.court },
            { status: 200 }
        );
    } catch (error) {
        console.error("Court update error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const result = await deleteCourt(params.id);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Court deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Court deletion error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
