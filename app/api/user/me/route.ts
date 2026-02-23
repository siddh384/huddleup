import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/users";

export async function GET() {
  try {
    const result = await getCurrentUser();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "No authenticated user found" ? 401 : 500 },
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
