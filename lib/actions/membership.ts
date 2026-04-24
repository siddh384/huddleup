"use server";

import { eq, and, gte } from "drizzle-orm";
import { members } from "@/db/schema";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/actions/users";
import { revalidatePath } from "next/cache";

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;

// Check if user has an active membership
export async function checkMembershipStatus(userId?: string) {
  try {
    let targetUserId = userId;

    if (!targetUserId) {
      const userResult = await getCurrentUser();
      if (!userResult.success || !userResult.user) {
        return {
          success: false,
          error: "No authenticated user found",
          isMember: false,
        };
      }
      targetUserId = userResult.user.id;
    }

    const membership = await db.query.members.findFirst({
      where: and(
        eq(members.userId, targetUserId),
        eq(members.status, "active"),
        gte(members.endDate, new Date()), // Membership hasn't expired
      ),
    });

    const isMember = !!membership;
    const discountPercentage = membership?.discountPercentage || 0;

    return {
      success: true,
      isMember,
      membership,
      discountPercentage,
    };
  } catch (error) {
    console.error("Error checking membership status:", error);
    return {
      success: false,
      error: "Failed to check membership status",
      isMember: false,
    };
  }
}

// Create a new membership
export async function createMembership(membershipData: {
  planType: "monthly" | "6_months" | "annual";
  autoRenew?: boolean;
}) {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Check if user already has an active membership
    const existingMembership = await checkMembershipStatus();
    if (existingMembership.isMember) {
      return { success: false, error: "You already have an active membership" };
    }

    // Calculate membership dates and pricing
    const startDate = new Date();
    const endDate = new Date();
    let paymentAmount: number;

    switch (membershipData.planType) {
      case "monthly":
        endDate.setMonth(endDate.getMonth() + 1);
        paymentAmount = 49;
        break;
      case "6_months":
        endDate.setMonth(endDate.getMonth() + 6);
        paymentAmount = 234; // $39 * 6 months
        break;
      case "annual":
        endDate.setFullYear(endDate.getFullYear() + 1);
        paymentAmount = 348; // $29 * 12 months
        break;
      default:
        return { success: false, error: "Invalid plan type" };
    }

    // Create the membership
    const [newMembership] = await db
      .insert(members)
      .values({
        userId: userResult.user.id,
        planType: membershipData.planType,
        startDate,
        endDate,
        autoRenew: membershipData.autoRenew || false,
        paymentAmount: paymentAmount.toString(),
        status: "active",
        paymentStatus: "pending",
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/buy-membership");
    revalidatePath("/profile");

    return { success: true, membership: newMembership };
  } catch (error) {
    console.error("Error creating membership:", error);
    return { success: false, error: "Failed to create membership" };
  }
}

// Cancel a membership
export async function cancelMembership(cancellationReason?: string) {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Get active membership
    const membership = await db.query.members.findFirst({
      where: and(
        eq(members.userId, userResult.user.id),
        eq(members.status, "active"),
      ),
    });

    if (!membership) {
      return { success: false, error: "No active membership found" };
    }

    // Update membership status to cancelled
    const [cancelledMembership] = await db
      .update(members)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: cancellationReason,
        autoRenew: false,
        updatedAt: new Date(),
      })
      .where(eq(members.id, membership.id))
      .returning();

    revalidatePath("/");
    revalidatePath("/buy-membership");
    revalidatePath("/profile");

    return { success: true, membership: cancelledMembership };
  } catch (error) {
    console.error("Error cancelling membership:", error);
    return { success: false, error: "Failed to cancel membership" };
  }
}

// Get user's membership history
export async function getMembershipHistory() {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    const membershipHistory = await db.query.members.findMany({
      where: eq(members.userId, userResult.user.id),
      orderBy: (members, { desc }) => [desc(members.createdAt)],
    });

    return { success: true, memberships: membershipHistory };
  } catch (error) {
    console.error("Error fetching membership history:", error);
    return { success: false, error: "Failed to fetch membership history" };
  }
}

// Update membership payment status (for payment processing)
export async function updateMembershipPaymentStatus(
  membershipId: string,
  paymentStatus: "pending" | "paid" | "failed",
) {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Get membership to check ownership
    const membership = await db.query.members.findFirst({
      where: eq(members.id, membershipId),
    });

    if (!membership) {
      return { success: false, error: "Membership not found" };
    }

    if (
      membership.userId !== userResult.user.id &&
      userResult.user.role !== "admin"
    ) {
      return {
        success: false,
        error: "Unauthorized: You can only update your own membership",
      };
    }

    // Update payment status
    const [updatedMembership] = await db
      .update(members)
      .set({
        paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(members.id, membershipId))
      .returning();

    revalidatePath("/");
    revalidatePath("/buy-membership");
    revalidatePath("/profile");

    return { success: true, membership: updatedMembership };
  } catch (error) {
    console.error("Error updating membership payment status:", error);
    return { success: false, error: "Failed to update payment status" };
  }
}

// Calculate discount for booking
export async function calculateMembershipDiscount(
  originalPrice: number,
  userId?: string,
) {
  try {
    const membershipStatus = await checkMembershipStatus(userId);

    if (!membershipStatus.success || !membershipStatus.isMember) {
      return {
        success: true,
        originalPrice,
        discountedPrice: originalPrice,
        discountAmount: 0,
        discountPercentage: 0,
        isMember: false,
      };
    }

    const discountPercentage = membershipStatus.discountPercentage || 0;
    const discountAmount = (originalPrice * discountPercentage) / 100;
    const discountedPrice = originalPrice - discountAmount;

    return {
      success: true,
      originalPrice,
      discountedPrice,
      discountAmount,
      discountPercentage,
      isMember: true,
    };
  } catch (error) {
    console.error("Error calculating membership discount:", error);
    return {
      success: false,
      error: "Failed to calculate discount",
      originalPrice,
      discountedPrice: originalPrice,
      discountAmount: 0,
      discountPercentage: 0,
      isMember: false,
    };
  }
}
