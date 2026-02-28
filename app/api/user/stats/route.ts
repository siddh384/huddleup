import { NextResponse } from "next/server";
import { getUserStats } from "@/lib/actions/users";

export async function GET() {
    try {
        const result = await getUserStats();

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: result.error === "No user ID provided" ? 400 : 500 }
            );
        }

        return NextResponse.json({
            success: true,
            stats: result.stats
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
