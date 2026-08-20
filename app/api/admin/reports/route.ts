import { NextRequest, NextResponse } from "next/server";
import { getAllReports, getReportsStats } from "@/lib/actions/reports";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get("statsOnly") === "true";
    const status = searchParams.get("status") as "pending" | "resolved" | "dismissed" | null;

    if (statsOnly) {
      const statsResult = await getReportsStats();
      return NextResponse.json(statsResult);
    }

    const result = await getAllReports({
      pageSize: 20,
      status: status || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Unauthorized: Admin access required" ? 403 : 400 },
      );
    }

    return NextResponse.json({
      success: true,
      reports: result.reports,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
