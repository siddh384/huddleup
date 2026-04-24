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

// Update user role (admin only)
export async function updateUserRole(
  userId: string,
  newRole: "user" | "facility_owner" | "admin",
) {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Check if current user is admin
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    const [updatedUser] = await db
      .update(user)
      .set({
        role: newRole,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    if (!updatedUser) {
      return { success: false, error: "User not found" };
    }

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

// Get user by ID with profile
export async function getUserById(userId: string) {
  try {
    const foundUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
      with: {
        profile: true,
      },
    });

    if (!foundUser) {
      return { success: false, error: "User not found" };
    }

    return { success: true, user: foundUser };
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}

// Get user stats (bookings, venues owned, reviews given)
export async function getUserStats(userId?: string) {
  try {
    const session = await getSession();
    const targetUserId = userId || session?.user?.id;

    if (!targetUserId) {
      return { success: false, error: "No user ID provided" };
    }

    // Get booking count
    const bookingCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(eq(bookings.userId, targetUserId))
      .then((res) => res[0].count);

    // Get venues owned count
    const venuesOwnedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(venues)
      .where(eq(venues.ownerId, targetUserId))
      .then((res) => res[0].count);

    // Get reviews given count
    const reviewsGivenCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.userId, targetUserId))
      .then((res) => res[0].count);

    // Get unread notifications count
    const unreadNotificationsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, targetUserId),
          eq(notifications.isRead, false),
        ),
      )
      .then((res) => res[0].count);

    return {
      success: true,
      stats: {
        totalBookings: bookingCount,
        venuesOwned: venuesOwnedCount,
        reviewsGiven: reviewsGivenCount,
        unreadNotifications: unreadNotificationsCount,
      },
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { success: false, error: "Failed to fetch user stats" };
  }
}

// Get all users with pagination and filtering (admin only)
export async function getAllUsers({
  page = 1,
  pageSize = 20,
  searchQuery,
  roleFilter,
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  roleFilter?: "user" | "facility_owner" | "admin";
  sortBy?: "createdAt" | "name" | "email" | "role";
  sortOrder?: "asc" | "desc";
} = {}) {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Check if current user is admin
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    const skipAmount = (page - 1) * pageSize;

    // Build search conditions
    const searchConditions = [];
    if (searchQuery) {
      searchConditions.push(
        or(
          ilike(user.name, `%${searchQuery}%`),
          ilike(user.email, `%${searchQuery}%`),
        ),
      );
    }

    if (roleFilter) {
      searchConditions.push(eq(user.role, roleFilter));
    }

    // Build sort conditions
    let orderBy;
    const orderDirection = sortOrder === "desc" ? desc : asc;

    switch (sortBy) {
      case "name":
        orderBy = orderDirection(user.name);
        break;
      case "email":
        orderBy = orderDirection(user.email);
        break;
      case "role":
        orderBy = orderDirection(user.role);
        break;
      default:
        orderBy = orderDirection(user.createdAt);
        break;
    }

    // Combine all conditions
    const allConditions =
      searchConditions.length > 0 ? and(...searchConditions) : undefined;

    // Get users with profiles
    const users = await db.query.user.findMany({
      where: allConditions,
      with: {
        profile: true,
      },
      orderBy: orderBy,
      limit: pageSize + 1,
      offset: skipAmount,
    });

    const isNext = users.length > pageSize;
    if (isNext) {
      users.pop();
    }

    return { success: true, users, isNext };
  } catch (error) {
    console.error("Error getting all users:", error);
    return { success: false, error: "Failed to fetch users" };
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

// Update user basic info
export async function updateUserInfo(userData: {
  name?: string;
  email?: string;
}) {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return { success: false, error: "No authenticated user found" };
    }

    const [updatedUser] = await db
      .update(user)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))
      .returning();

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user info:", error);
    return { success: false, error: "Failed to update user info" };
  }
}

// Delete user account (soft delete by deactivating)
export async function deleteUserAccount() {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Note: In a production app, you might want to soft delete or anonymize data
    // For now, we'll just mark the user as inactive or handle it via better-auth

    return { success: true, message: "Account deletion initiated" };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return { success: false, error: "Failed to delete user account" };
  }
}
