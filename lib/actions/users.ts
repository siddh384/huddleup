"use server";

import { eq, desc, asc, and, or, ilike, sql } from "drizzle-orm";
import {
  user,
  userProfiles,
  venues,
  bookings,
  reviews,
  notifications,
} from "@/db/schema";
import { db } from "@/db";
import { getSession, getUser } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

// Get current user with their role and profile
export async function getCurrentUser() {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return { success: false, error: "No authenticated user found" };
    }

    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      with: {
        profile: true,
      },
    });

    if (!currentUser) {
      return { success: false, error: "User not found" };
    }

    // Ensure user has a profile - create one if it doesn't exist
    if (!currentUser.profile) {
      console.log(`Creating profile for user ${currentUser.id}`);
      const newProfile = await createUserProfile(currentUser.id);
      if (newProfile.success) {
        return {
          success: true,
          user: {
            ...currentUser,
            profile: newProfile.profile,
          },
        };
      } else {
        // Return user without profile if creation failed
        console.error("Failed to create profile:", newProfile.error);
        return { success: true, user: currentUser };
      }
    }

    return { success: true, user: currentUser };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return { success: false, error: "Failed to fetch current user" };
  }
}

// Create user profile
export async function createUserProfile(
  userId: string,
  profileData?: Partial<NewUserProfile>,
) {
  try {
    const newProfileData: NewUserProfile = {
      userId,
      phoneNumber: profileData?.phoneNumber || null,
      dateOfBirth: profileData?.dateOfBirth || null,
      gender: profileData?.gender || null,
      address: profileData?.address || null,
      city: profileData?.city || null,
      state: profileData?.state || null,
      zipCode: profileData?.zipCode || null,
      preferences: profileData?.preferences || {},
      ...profileData,
    };

    const [newProfile] = await db
      .insert(userProfiles)
      .values(newProfileData)
      .returning();

    return { success: true, profile: newProfile };
  } catch (error) {
    console.error("Error creating user profile:", error);
    return { success: false, error: "Failed to create user profile" };
  }
}

// Update user profile
export async function updateUserProfile(
  profileData: Partial<Omit<NewUserProfile, "userId">>,
) {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Check if profile exists
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (!existingProfile) {
      // Create profile if it doesn't exist
      return await createUserProfile(session.user.id, profileData);
    }

    // Update existing profile
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, session.user.id))
      .returning();

    return { success: true, profile: updatedProfile };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: "Failed to update user profile" };
  }
}

// Ensure user profile exists (called during sign-up or when accessing profile)
export async function ensureUserProfile() {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Check if profile exists
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (existingProfile) {
      return { success: true, profile: existingProfile };
    }

    // Create profile if it doesn't exist
    return await createUserProfile(session.user.id);
  } catch (error) {
    console.error("Error ensuring user profile:", error);
    return { success: false, error: "Failed to ensure user profile" };
  }
}
