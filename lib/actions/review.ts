"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, courts, reviews, venues } from "@/db/schema";
import { getCurrentUser } from "@/lib/actions/users";
import { revalidatePath } from "next/cache";

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

// Get all reviews for a venue with pagination
export async function getVenueReviews(venueId: string, page = 1, pageSize = 10) {
    try {
        const skipAmount = (page - 1) * pageSize;

        const reviewList = await db.query.reviews.findMany({
            where: eq(reviews.venueId, venueId),
            with: {
                user: {
                    columns: { id: true, name: true, image: true },
                },
            },
            orderBy: desc(reviews.createdAt),
            limit: pageSize,
            offset: skipAmount,
        });

        const countQuery = await db
            .select({ count: sql<number>`count(*)` })
            .from(reviews)
            .where(eq(reviews.venueId, venueId));

        const totalCount = countQuery[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / pageSize);

        return { success: true, reviews: reviewList, totalCount, totalPages, currentPage: page };
    } catch (error) {
        console.error("Error fetching venue reviews:", error);
        return { success: false, error: "Failed to fetch venue reviews" };
    }
}

// Create a review for a venue. Requires at least one confirmed booking at the venue
export async function createReview(reviewData: {
    venueId: string;
    rating: number; // 1-5
    comment?: string;
    bookingId?: string;
}) {
    try {
        const userResult = await getCurrentUser();

        if (!userResult.success || !userResult.user) {
            return { success: false, error: "No authenticated user found" };
        }

        const numericRating = Number(reviewData.rating);
        if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
            return { success: false, error: "Rating must be between 1 and 5" };
        }

        // Verify user has at least one confirmed booking for any court at this venue
        const bookingCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(bookings)
            .innerJoin(courts, eq(bookings.courtId, courts.id))
            .where(
                and(
                    eq(bookings.userId, userResult.user.id),
                    eq(bookings.status, "confirmed"),
                    eq(courts.venueId, reviewData.venueId)
                )
            );

        const hasBooking = (bookingCount[0]?.count || 0) > 0;
        if (!hasBooking) {
            return { success: false, error: "You can only review venues you have booked" };
        }

        // Fetch current aggregates to compute new average and count
        const currentVenue = await db.query.venues.findFirst({
            where: eq(venues.id, reviewData.venueId),
            columns: { id: true, rating: true, reviewCount: true },
        });

        if (!currentVenue) {
            return { success: false, error: "Venue not found" };
        }

        const currentAvg = Number(currentVenue.rating ?? 0);
        const currentCount = Number(currentVenue.reviewCount ?? 0);

        // Create review
        const [newReview] = await db
            .insert(reviews)
            .values({
                userId: userResult.user.id,
                venueId: reviewData.venueId,
                bookingId: reviewData.bookingId,
                rating: numericRating,
                comment: reviewData.comment,
            })
            .returning();

        // Update aggregates atomically based on prior values
        const newCount = currentCount + 1;
        const newAvg = ((currentAvg * currentCount) + numericRating) / newCount;

        await db
            .update(venues)
            .set({
                reviewCount: newCount,
                rating: newAvg.toFixed(2),
                updatedAt: new Date(),
            })
            .where(eq(venues.id, reviewData.venueId));

        revalidatePath(`/venues/${reviewData.venueId}`);
        revalidatePath('/venues');

        return { success: true, review: newReview, newAverageRating: newAvg, newReviewCount: newCount };
    } catch (error) {
        console.error("Error creating review:", error);
        return { success: false, error: "Failed to create review" };
    }
}


