"use server";

import { eq, desc, asc, and } from "drizzle-orm";
import { courts, venues, sports, venueSports } from "@/db/schema";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/actions/users";
import { revalidatePath } from "next/cache";

export type Court = typeof courts.$inferSelect;
export type NewCourt = typeof courts.$inferInsert;

// Create a new court (venue owner only)
export async function createCourt(courtData: {
    venueId: string;
    name: string;
    sportId: string;
    pricePerHour: string;
    operatingHoursStart: string;
    operatingHoursEnd: string;
}) {
    try {
        const userResult = await getCurrentUser();

        if (!userResult.success || !userResult.user) {
            return { success: false, error: "No authenticated user found" };
        }

        // Get the venue to check ownership
        const venue = await db.query.venues.findFirst({
            where: eq(venues.id, courtData.venueId),
            with: {
                venueSports: {
                    with: {
                        sport: true
                    }
                }
            }
        });

        if (!venue) {
            return { success: false, error: "Venue not found" };
        }

        // Check if user owns the venue or is admin
        if (venue.ownerId !== userResult.user.id && userResult.user.role !== 'admin') {
            return { success: false, error: "Unauthorized: You can only create courts for your own venues" };
        }

        // Check if the sport is available in this venue
        const venueHasSport = venue.venueSports.some(vs => vs.sportId === courtData.sportId);
        if (!venueHasSport) {
            return { success: false, error: "This sport is not available at this venue" };
        }

        // Validate operating hours
        const startTime = courtData.operatingHoursStart;
        const endTime = courtData.operatingHoursEnd;

        if (startTime >= endTime) {
            return { success: false, error: "Operating hours start time must be before end time" };
        }

        // Create the court
        const [newCourt] = await db.insert(courts).values({
            venueId: courtData.venueId,
            name: courtData.name,
            sportId: courtData.sportId,
            pricePerHour: courtData.pricePerHour,
            operatingHoursStart: startTime,
            operatingHoursEnd: endTime,
        }).returning();

        revalidatePath('/');
        revalidatePath('/venues');
        revalidatePath(`/venues/${courtData.venueId}`);
        revalidatePath('/dashboard');

        return { success: true, court: newCourt };
    } catch (error) {
        console.error("Error creating court:", error);
        return { success: false, error: "Failed to create court" };
    }
}

// Get courts for a venue
export async function getVenueCourts(venueId: string) {
    try {
        const userResult = await getCurrentUser();

        if (!userResult.success || !userResult.user) {
            return { success: false, error: "No authenticated user found" };
        }

        // Get the venue to check ownership
        const venue = await db.query.venues.findFirst({
            where: eq(venues.id, venueId)
        });

        if (!venue) {
            return { success: false, error: "Venue not found" };
        }

        // Check if user owns the venue or is admin
        if (venue.ownerId !== userResult.user.id && userResult.user.role !== 'admin') {
            return { success: false, error: "Unauthorized: You can only view courts for your own venues" };
        }

        const venueCourts = await db.query.courts.findMany({
            where: eq(courts.venueId, venueId),
            with: {
                sport: true
            },
            orderBy: desc(courts.createdAt)
        });

        return { success: true, courts: venueCourts };
    } catch (error) {
        console.error("Error fetching venue courts:", error);
        return { success: false, error: "Failed to fetch courts" };
    }
}

// Get available sports for a venue
export async function getVenueSports(venueId: string) {
    try {
        const userResult = await getCurrentUser();

        if (!userResult.success || !userResult.user) {
            return { success: false, error: "No authenticated user found" };
        }

        // Get the venue with its sports
        const venue = await db.query.venues.findFirst({
            where: eq(venues.id, venueId),
            with: {
                venueSports: {
                    with: {
                        sport: true
                    }
                }
            }
        });

        if (!venue) {
            return { success: false, error: "Venue not found" };
        }

        // Check if user owns the venue or is admin
        if (venue.ownerId !== userResult.user.id && userResult.user.role !== 'admin') {
            return { success: false, error: "Unauthorized: You can only view sports for your own venues" };
        }

        const availableSports = venue.venueSports.map(vs => vs.sport);

        return { success: true, sports: availableSports };
    } catch (error) {
        console.error("Error fetching venue sports:", error);
        return { success: false, error: "Failed to fetch venue sports" };
    }
}

// Update court
export async function updateCourt(courtId: string, courtData: {
    name?: string;
    sportId?: string;
    pricePerHour?: string;
    operatingHoursStart?: string;
    operatingHoursEnd?: string;
    isActive?: boolean;
}) {
    try {
        const userResult = await getCurrentUser();

        if (!userResult.success || !userResult.user) {
            return { success: false, error: "No authenticated user found" };
        }

        // Get the court with venue info
        const court = await db.query.courts.findFirst({
            where: eq(courts.id, courtId),
            with: {
                venue: {
                    with: {
                        venueSports: {
                            with: {
                                sport: true
                            }
                        }
                    }
                }
            }
        });

        if (!court) {
            return { success: false, error: "Court not found" };
        }

        // Check if user owns the venue or is admin
        if (court.venue.ownerId !== userResult.user.id && userResult.user.role !== 'admin') {
            return { success: false, error: "Unauthorized: You can only update courts for your own venues" };
        }

        // If sport is being changed, check if it's available in the venue
        if (courtData.sportId) {
            const venueHasSport = court.venue.venueSports.some(vs => vs.sportId === courtData.sportId);
            if (!venueHasSport) {
                return { success: false, error: "This sport is not available at this venue" };
            }
        }

        // Validate operating hours if provided
        if (courtData.operatingHoursStart && courtData.operatingHoursEnd) {
            if (courtData.operatingHoursStart >= courtData.operatingHoursEnd) {
                return { success: false, error: "Operating hours start time must be before end time" };
            }
        }

        const [updatedCourt] = await db
            .update(courts)
            .set({
                ...courtData,
                updatedAt: new Date(),
            })
            .where(eq(courts.id, courtId))
            .returning();

        revalidatePath('/');
        revalidatePath('/venues');
        revalidatePath(`/venues/${court.venueId}`);
        revalidatePath('/dashboard');

        return { success: true, court: updatedCourt };
    } catch (error) {
        console.error("Error updating court:", error);
        return { success: false, error: "Failed to update court" };
    }
}

// Delete court
export async function deleteCourt(courtId: string) {
    try {
        const userResult = await getCurrentUser();

        if (!userResult.success || !userResult.user) {
            return { success: false, error: "No authenticated user found" };
        }

        // Get the court with venue info
        const court = await db.query.courts.findFirst({
            where: eq(courts.id, courtId),
            with: {
                venue: true
            }
        });

        if (!court) {
            return { success: false, error: "Court not found" };
        }

        // Check if user owns the venue or is admin
        if (court.venue.ownerId !== userResult.user.id && userResult.user.role !== 'admin') {
            return { success: false, error: "Unauthorized: You can only delete courts for your own venues" };
        }

        const [deletedCourt] = await db
            .delete(courts)
            .where(eq(courts.id, courtId))
            .returning();

        revalidatePath('/');
        revalidatePath('/venues');
        revalidatePath(`/venues/${court.venueId}`);
        revalidatePath('/dashboard');

        return { success: true, court: deletedCourt };
    } catch (error) {
        console.error("Error deleting court:", error);
        return { success: false, error: "Failed to delete court" };
    }
}

// Get court by ID
export async function getCourtById(courtId: string) {
    try {
        const court = await db.query.courts.findFirst({
            where: eq(courts.id, courtId),
            with: {
                venue: true,
                sport: true,
                bookings: {
                    limit: 10,
                    orderBy: desc(courts.createdAt)
                }
            }
        });

        if (!court) {
            return { success: false, error: "Court not found" };
        }

        return { success: true, court };
    } catch (error) {
        console.error("Error fetching court:", error);
        return { success: false, error: "Failed to fetch court" };
    }
}
