import { NextRequest, NextResponse } from "next/server";
import { updateUserProfile, ensureUserProfile } from "@/lib/actions/users";

export async function GET() {
  try {
    const result = await ensureUserProfile();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "No authenticated user found" ? 401 : 500 },
      );
    }

    return NextResponse.json({
      success: true,
      profile: result.profile,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the data
    const validFields = [
      "phoneNumber",
      "dateOfBirth",
      "gender",
      "address",
      "city",
      "state",
      "zipCode",
      "preferences",
    ];

    const profileData: any = {};
    for (const field of validFields) {
      if (body[field] !== undefined) {
        profileData[field] = body[field];
      }
    }

    // Convert dateOfBirth string to Date if provided
    if (profileData.dateOfBirth) {
      profileData.dateOfBirth = new Date(profileData.dateOfBirth);
    }

    const result = await updateUserProfile(profileData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "No authenticated user found" ? 401 : 500 },
      );
    }

    return NextResponse.json({
      success: true,
      profile: result.profile,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
