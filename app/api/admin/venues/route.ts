import { NextRequest, NextResponse } from "next/server";
import { getVenues } from "@/lib/actions/venues";
import { getCurrentUser } from "@/lib/actions/users";

export async function GET(request: NextRequest) {
  try {
    // Admin check
    const userResult = await getCurrentUser();
    if (!userResult.success || !userResult.user) {
      return NextResponse.json(
        { error: "No authenticated user found" },
        { status: 401 },
      );
    }
    if (userResult.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as "pending" | "approved" | "rejected" | null;

    const result = await getVenues({
      pageSize: 50,
      status: status || "pending",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      venues: result.venues,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/venues:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
