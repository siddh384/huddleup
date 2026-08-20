import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/actions/users";

export async function GET() {
  try {
    const result = await getAllUsers({ pageSize: 50 });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Unauthorized: Admin access required" ? 403 : 400 },
      );
    }

    return NextResponse.json({
      success: true,
      users: result.users,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
