/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { eq, desc, asc, and, or, ilike, sql, inArray, gte } from "drizzle-orm";
import {
  venues,
  courts,
  sports,
  venueSports,
  reviews,
  bookings,
  user,
} from "@/db/schema";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/actions/users";
import { revalidatePath } from "next/cache";

export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;

// Create a new venue (facility_owner only)
export async function createVenue(venueData: {
  name: string;
  description?: string;
  address: string;
  location: string;
  images: string[];
  amenities: string[];
  sportIds: string[];
}) {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Check if user has facility_owner role or admin role
    if (
      userResult.user.role !== "facility_owner" &&
      userResult.user.role !== "admin"
    ) {
      return {
        success: false,
        error: "Unauthorized: Facility owner access required",
      };
    }

    // Create the venue
    const [newVenue] = await db
      .insert(venues)
      .values({
        name: venueData.name,
        description: venueData.description,
        address: venueData.address,
        location: venueData.location,
        images: venueData.images,
        amenities: venueData.amenities,
        ownerId: userResult.user.id,
        status: "pending", // Needs admin approval
      })
      .returning();

    // Link sports to venue
    if (venueData.sportIds.length > 0) {
      const venueSportEntries = venueData.sportIds.map((sportId) => ({
        venueId: newVenue.id,
        sportId: sportId,
      }));

      await db.insert(venueSports).values(venueSportEntries);
    }

    revalidatePath("/");
    revalidatePath("/venues");
    revalidatePath("/dashboard");

    return { success: true, venue: newVenue };
  } catch (error) {
    console.error("Error creating venue:", error);
    return { success: false, error: "Failed to create venue" };
  }
}

// Get all venues with pagination and filtering
export async function getVenues({
  page = 1,
  pageSize = 12,
  searchQuery,
  sportFilter,
  locationFilter,
  ratingFilter,
  status = "approved",
}: {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sportFilter?: string;
  locationFilter?: string;
  ratingFilter?: string;
  status?: "pending" | "approved" | "rejected";
} = {}) {
  try {
    const skipAmount = (page - 1) * pageSize;

    // Build search conditions
    const searchConditions = [];
    searchConditions.push(eq(venues.status, status));

    if (searchQuery) {
      searchConditions.push(
        or(
          ilike(venues.name, `%${searchQuery}%`),
          ilike(venues.description, `%${searchQuery}%`),
          ilike(venues.location, `%${searchQuery}%`),
        ),
      );
    }

    if (locationFilter) {
      searchConditions.push(ilike(venues.location, `%${locationFilter}%`));
    }

    if (ratingFilter && ratingFilter !== "all") {
      const minRating = parseFloat(ratingFilter);
      searchConditions.push(gte(venues.rating, minRating.toString()));
    }

    const allConditions =
      searchConditions.length > 0 ? and(...searchConditions) : undefined;

    // Get venues with related data
    let venueListResult: any[] = [];

    if (sportFilter && sportFilter !== "all") {
      // If sport filter is specified, we need to join with venueSports table
      const venueQuery = db
        .select({
          venue: venues,
        })
        .from(venues)
        .innerJoin(venueSports, eq(venues.id, venueSports.venueId))
        .where(
          allConditions
            ? and(allConditions, eq(venueSports.sportId, sportFilter))
            : eq(venueSports.sportId, sportFilter),
        )
        .orderBy(desc(venues.createdAt))
        .limit(pageSize + 1)
        .offset(skipAmount);

      const rawResults = await venueQuery;

      // Get the unique venue IDs
      const venueIds = [...new Set(rawResults.map((r) => r.venue.id))];

      // If no venues match the sport filter, return empty result
      if (venueIds.length === 0) {
        venueListResult = [];
      } else {
        // Now get full venue data for these IDs
        venueListResult = await db.query.venues.findMany({
          where: allConditions
            ? and(allConditions, inArray(venues.id, venueIds))
            : inArray(venues.id, venueIds),
          with: {
            owner: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
            venueSports: {
              with: {
                sport: true,
              },
            },
            courts: {
              where: eq(courts.isActive, true),
            },
          },
          orderBy: desc(venues.createdAt),
        });
      }
    } else {
      // No sport filter, use regular query
      venueListResult = await db.query.venues.findMany({
        where: allConditions,
        with: {
          owner: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
          venueSports: {
            with: {
              sport: true,
            },
          },
          courts: {
            where: eq(courts.isActive, true),
          },
        },
        orderBy: desc(venues.createdAt),
        limit: pageSize + 1,
        offset: skipAmount,
      });
    }

    // Check if there are more pages
    const isNext = venueListResult.length > pageSize;
    if (isNext) {
      venueListResult.pop();
    }

    // Get total count for pagination (with the same filters)
    let totalCount;

    if (sportFilter && sportFilter !== "all") {
      // Count venues with sport filter using database query
      const sportConditions = allConditions
        ? and(allConditions, eq(venueSports.sportId, sportFilter))
        : eq(venueSports.sportId, sportFilter);

      const countQuery = await db
        .select({ count: sql<number>`count(distinct ${venues.id})` })
        .from(venues)
        .innerJoin(venueSports, eq(venues.id, venueSports.venueId))
        .where(sportConditions);

      totalCount = countQuery[0]?.count || 0;
    } else {
      // Count venues without sport filter
      const countQuery = await db
        .select({ count: sql<number>`count(*)` })
        .from(venues)
        .where(allConditions);

      totalCount = countQuery[0]?.count || 0;
    }
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      venues: venueListResult,
      isNext,
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching venues:", error);
    return { success: false, error: "Failed to fetch venues" };
  }
}

// Get venue by ID
export async function getVenueById(venueId: string) {
  try {
    const venue = await db.query.venues.findFirst({
      where: eq(venues.id, venueId),
      with: {
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        venueSports: {
          with: {
            sport: true,
          },
        },
        courts: {
          where: eq(courts.isActive, true),
          with: {
            sport: true,
          },
        },
        reviews: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: desc(reviews.createdAt),
          limit: 10,
        },
      },
    });

    if (!venue) {
      return { success: false, error: "Venue not found" };
    }

    return { success: true, venue };
  } catch (error) {
    console.error("Error fetching venue:", error);
    return { success: false, error: "Failed to fetch venue" };
  }
}

// Get all sports for venue creation form
export async function getAllSports() {
  try {
    const sportsList = await db.query.sports.findMany({
      orderBy: asc(sports.name),
    });

    return { success: true, sports: sportsList };
  } catch (error) {
    console.error("Error fetching sports:", error);
    return { success: false, error: "Failed to fetch sports" };
  }
}

// Get user's venues (for facility owners)
export async function getUserVenues() {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    const userVenues = await db.query.venues.findMany({
      where: eq(venues.ownerId, userResult.user.id),
      with: {
        venueSports: {
          with: {
            sport: true,
          },
        },
        courts: {
          where: eq(courts.isActive, true),
        },
      },
      orderBy: desc(venues.createdAt),
    });

    return { success: true, venues: userVenues };
  } catch (error) {
    console.error("Error fetching user venues:", error);
    return { success: false, error: "Failed to fetch user venues" };
  }
}

// Update venue status (admin only)
export async function updateVenueStatus(
  venueId: string,
  status: "approved" | "rejected",
  rejectionReason?: string,
) {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Check if user is admin
    if (userResult.user.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "approved") {
      updateData.approvedBy = userResult.user.id;
      updateData.approvedAt = new Date();
      updateData.rejectionReason = null;
    } else if (status === "rejected") {
      updateData.rejectionReason = rejectionReason;
      updateData.approvedBy = null;
      updateData.approvedAt = null;
    }

    const [updatedVenue] = await db
      .update(venues)
      .set(updateData)
      .where(eq(venues.id, venueId))
      .returning();

    if (!updatedVenue) {
      return { success: false, error: "Venue not found" };
    }

    revalidatePath("/");
    revalidatePath("/venues");
    revalidatePath("/admin");

    return { success: true, venue: updatedVenue };
  } catch (error) {
    console.error("Error updating venue status:", error);
    return { success: false, error: "Failed to update venue status" };
  }
}

// Delete venue (admin only)
export async function deleteVenue(venueId: string) {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Check if user is admin
    if (userResult.user.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    const [deletedVenue] = await db
      .delete(venues)
      .where(eq(venues.id, venueId))
      .returning();

    if (!deletedVenue) {
      return { success: false, error: "Venue not found" };
    }

    revalidatePath("/");
    revalidatePath("/venues");
    revalidatePath("/admin");

    return { success: true, venue: deletedVenue };
  } catch (error) {
    console.error("Error deleting venue:", error);
    return { success: false, error: "Failed to delete venue" };
  }
}

// Get owner dashboard statistics
export async function getOwnerDashboardStats() {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Check if user is facility owner or admin
    if (
      userResult.user.role !== "facility_owner" &&
      userResult.user.role !== "admin"
    ) {
      return {
        success: false,
        error: "Unauthorized: Facility owner access required",
      };
    }

    // Get user's venues
    const userVenues = await db.query.venues.findMany({
      where: eq(venues.ownerId, userResult.user.id),
      with: {
        courts: {
          where: eq(courts.isActive, true),
        },
      },
    });

    const venueIds = userVenues.map((v) => v.id);
    const totalVenues = userVenues.length;
    const totalCourts = userVenues.reduce(
      (sum, venue) => sum + venue.courts.length,
      0,
    );

    // Calculate total revenue from bookings
    let totalRevenue = 0;
    let totalBookings = 0;
    let monthlyRevenue = 0;
    let monthlyBookings = 0;

    if (venueIds.length > 0) {
      // Get all bookings for owner's courts
      const allBookings = await db
        .select({
          totalPrice: bookings.totalPrice,
          bookingDate: bookings.bookingDate,
          status: bookings.status,
          paymentStatus: bookings.paymentStatus,
        })
        .from(bookings)
        .innerJoin(courts, eq(bookings.courtId, courts.id))
        .where(
          and(
            inArray(courts.venueId, venueIds),
            eq(bookings.status, "confirmed"),
            eq(bookings.paymentStatus, "paid"),
          ),
        );

      totalBookings = allBookings.length;
      totalRevenue = allBookings.reduce(
        (sum, booking) => sum + parseFloat(booking.totalPrice),
        0,
      );

      // Calculate this month's revenue
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const monthlyBookingsData = allBookings.filter(
        (booking) => new Date(booking.bookingDate) >= currentMonth,
      );

      monthlyBookings = monthlyBookingsData.length;
      monthlyRevenue = monthlyBookingsData.reduce(
        (sum, booking) => sum + parseFloat(booking.totalPrice),
        0,
      );
    }

    return {
      success: true,
      stats: {
        totalVenues,
        totalCourts,
        totalRevenue,
        totalBookings,
        monthlyRevenue,
        monthlyBookings,
        venues: userVenues,
      },
    };
  } catch (error) {
    console.error("Error fetching owner dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard statistics" };
  }
}

// Get owner's bookings with details
export async function getOwnerBookings({
  page = 1,
  pageSize = 20,
  status,
  venueId,
}: {
  page?: number;
  pageSize?: number;
  status?: "confirmed" | "cancelled" | "completed";
  venueId?: string;
} = {}) {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Check if user is facility owner or admin
    if (
      userResult.user.role !== "facility_owner" &&
      userResult.user.role !== "admin"
    ) {
      return {
        success: false,
        error: "Unauthorized: Facility owner access required",
      };
    }

    const skipAmount = (page - 1) * pageSize;

    // Build conditions
    const conditions = [eq(venues.ownerId, userResult.user.id)];

    if (status) {
      conditions.push(eq(bookings.status, status));
    }

    if (venueId) {
      conditions.push(eq(venues.id, venueId));
    }

    // Get bookings with all related data
    const ownerBookings = await db
      .select({
        booking: bookings,
        court: courts,
        venue: venues,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(bookings)
      .innerJoin(courts, eq(bookings.courtId, courts.id))
      .innerJoin(venues, eq(courts.venueId, venues.id))
      .innerJoin(user, eq(bookings.userId, user.id))
      .where(and(...conditions))
      .orderBy(desc(bookings.bookingDate))
      .limit(pageSize + 1)
      .offset(skipAmount);

    const isNext = ownerBookings.length > pageSize;
    if (isNext) {
      ownerBookings.pop();
    }

    // Get total count
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .innerJoin(courts, eq(bookings.courtId, courts.id))
      .innerJoin(venues, eq(courts.venueId, venues.id))
      .where(and(...conditions))
      .then((res) => res[0].count);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      bookings: ownerBookings,
      isNext,
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    return { success: false, error: "Failed to fetch bookings" };
  }
}
