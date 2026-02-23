import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  try {
    let session = null;

    try {
      session = await auth.api.getSession({
        headers: req.headers,
      });
    } catch (sessionError) {
      console.warn("Session validation failed:", sessionError);
      // session remains null, will be handled below
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await req.json();

    if (!role || !["user", "facility_owner"].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be either "user" or "facility_owner"' },
        { status: 400 },
      );
    }

    await db
      .update(user)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
