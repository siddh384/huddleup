"use server";

import { eq, desc, asc, and, gte, lte, sql } from "drizzle-orm";
import { bookings, courts, timeSlots, venues } from "@/db/schema";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/actions/users";

import { revalidatePath } from "next/cache";

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type TimeSlot = typeof timeSlots.$inferSelect;

// Generate time slots for a court on a specific date
export async function generateTimeSlots(courtId: string, date: string) {
    try {
        // Get court information with operating hours
        const court = await db.query.courts.findFirst({
            where: eq(courts.id, courtId),
            with: {
                venue: true,
                sport: true
            }
        });

        if (!court) {
            return { success: false, error: "Court not found" };
        }

        const slots = [];
        const selectedDate = new Date(date);

        // Parse operating hours
        const [startHour, startMinute] = court.operatingHoursStart.split(':').map(Number);
        const [endHour, endMinute] = court.operatingHoursEnd.split(':').map(Number);

        // Generate hourly slots
        for (let hour = startHour; hour < endHour; hour++) {
            const startTime = `${hour.toString().padStart(2, '0')}:00`;
            const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

            // Create datetime for this slot
            const slotDate = new Date(selectedDate);
            slotDate.setHours(hour, 0, 0, 0);

            slots.push({
                startTime,
                endTime,
                date: slotDate,
                price: parseFloat(court.pricePerHour),
                courtName: court.name,
                sportName: court.sport.name,
                hour: hour
            });
        }

        // Get existing bookings for this date
        const existingBookings = await db.query.bookings.findMany({
            where: and(
                eq(bookings.courtId, courtId),
                eq(sql`DATE(${bookings.bookingDate})`, date)
            )
        });

        // Create a set of booked hours for efficient lookup
        const bookedHours = new Set<number>();
        existingBookings.forEach(booking => {
            if (booking.status !== 'cancelled') {
                const [startHour] = booking.startTime.split(':').map(Number);
                const [endHour] = booking.endTime.split(':').map(Number);

                // Mark all hours from start to end as booked
                for (let hour = startHour; hour < endHour; hour++) {
                    bookedHours.add(hour);
                }
            }
        });

        // Mark slots as booked if they have existing bookings
        const slotsWithStatus = slots.map(slot => {
            const isBooked = bookedHours.has(slot.hour);

            return {
                ...slot,
                status: isBooked ? 'booked' : 'available'
            };
        });

        return { success: true, slots: slotsWithStatus };
    } catch (error) {
        console.error("Error generating time slots:", error);
        return { success: false, error: "Failed to generate time slots" };
    }
}

// Create a new booking
export async function createBooking(bookingData: {
    courtId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    duration: number; // Number of hours
}) {
    try {
        const userResult = await getCurrentUser();

        if (!userResult.success || !userResult.user) {
            return { success: false, error: "No authenticated user found" };
        }

        // Get court information to calculate price
        const court = await db.query.courts.findFirst({
            where: eq(courts.id, bookingData.courtId),
            with: {
                venue: true
            }
        });

        if (!court) {
            return { success: false, error: "Court not found" };
        }

        // Parse start and end times
        const [startHour] = bookingData.startTime.split(':').map(Number);
        const [endHour] = bookingData.endTime.split(':').map(Number);

        // Check if all time slots in the range are available
        const existingBookings = await db.query.bookings.findMany({
            where: and(
                eq(bookings.courtId, bookingData.courtId),
                eq(sql`DATE(${bookings.bookingDate})`, bookingData.bookingDate),
                eq(bookings.status, 'confirmed')
            )
        });

        // Create a set of booked hours
        const bookedHours = new Set<number>();
        existingBookings.forEach(booking => {
            const [bookingStartHour] = booking.startTime.split(':').map(Number);
            const [bookingEndHour] = booking.endTime.split(':').map(Number);

            for (let hour = bookingStartHour; hour < bookingEndHour; hour++) {
                bookedHours.add(hour);
            }
        });

        // Check if any of the requested hours are already booked
        for (let hour = startHour; hour < endHour; hour++) {
            if (bookedHours.has(hour)) {
                return { success: false, error: `Time slot ${hour}:00 - ${hour + 1}:00 is already booked` };
            }
        }

        // Calculate total price (duration * price per hour)
        const originalPrice = parseFloat(court.pricePerHour) * bookingData.duration;

        const finalPrice = originalPrice;

        // Create booking date object
        const bookingDateTime = new Date(bookingData.bookingDate);
        bookingDateTime.setHours(startHour, 0, 0, 0);

        // Create the booking
        const [newBooking] = await db.insert(bookings).values({
            userId: userResult.user.id,
            courtId: bookingData.courtId,
            bookingDate: bookingDateTime,
            startTime: bookingData.startTime,
            endTime: bookingData.endTime,
            totalPrice: finalPrice.toString(),
            status: 'confirmed',
            paymentStatus: 'pending'
        }).returning();

        revalidatePath('/');
        revalidatePath('/venues');
        revalidatePath(`/venues/${court.venueId}`);
        revalidatePath('/dashboard');

        return {
            success: true,
            booking: newBooking,
            finalPrice
        };
    } catch (error) {
        console.error("Error creating booking:", error);
        return { success: false, error: "Failed to create booking" };
    }
}

// Get user's bookings
export async function getUserBookings() {
    try {
        const userResult = await getCurrentUser();

        if (!userResult.success || !userResult.user) {
            return { success: false, error: "No authenticated user found" };
        }

        const userBookings = await db.query.bookings.findMany({
            where: eq(bookings.userId, userResult.user.id),
            with: {
                court: {
                    with: {
                        venue: true,
                        sport: true
                    }
                }
            },
            orderBy: desc(bookings.bookingDate)
        });

        return { success: true, bookings: userBookings };
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return { success: false, error: "Failed to fetch bookings" };
    }
}

// Cancel a booking
export async function cancelBooking(bookingId: string, cancellationReason?: string) {
    try {
        const userResult = await getCurrentUser();

        if (!userResult.success || !userResult.user) {
            return { success: false, error: "No authenticated user found" };
        }

        // Get the booking to check ownership
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, bookingId),
            with: {
                court: {
                    with: {
                        venue: true
                    }
                }
            }
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        // Check if user owns the booking or is admin/venue owner
        const isAuthorized = booking.userId === userResult.user.id ||
            userResult.user.role === 'admin' ||
            booking.court.venue.ownerId === userResult.user.id;

        if (!isAuthorized) {
            return { success: false, error: "Unauthorized: You can only cancel your own bookings" };
        }

        // Check if booking can be cancelled (not already cancelled or completed)
        if (booking.status === 'cancelled') {
            return { success: false, error: "Booking is already cancelled" };
        }

        if (booking.status === 'completed') {
            return { success: false, error: "Cannot cancel a completed booking" };
        }

        // Update booking status to cancelled
        const [cancelledBooking] = await db
            .update(bookings)
            .set({
                status: 'cancelled',
                cancelledAt: new Date(),
                cancellationReason: cancellationReason,
                updatedAt: new Date()
            })
            .where(eq(bookings.id, bookingId))
            .returning();

        revalidatePath('/');
        revalidatePath('/venues');
        revalidatePath('/dashboard');

        return { success: true, booking: cancelledBooking };
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return { success: false, error: "Failed to cancel booking" };
    }
}

// Get bookings for a specific court (for venue owners)
export async function getCourtBookings(courtId: string) {
    try {
        const userResult = await getCurrentUser();

        if (!userResult.success || !userResult.user) {
            return { success: false, error: "No authenticated user found" };
        }

        // Get court information to check ownership
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
            return { success: false, error: "Unauthorized: You can only view bookings for your own courts" };
        }

        const courtBookings = await db.query.bookings.findMany({
            where: eq(bookings.courtId, courtId),
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: desc(bookings.bookingDate)
        });

        return { success: true, bookings: courtBookings };
    } catch (error) {
        console.error("Error fetching court bookings:", error);
        return { success: false, error: "Failed to fetch court bookings" };
    }
}

// Get pricing information with membership discount
export async function getBookingPricing(courtId: string, duration: number) {
    try {
        const userResult = await getCurrentUser();

        if (!userResult.success || !userResult.user) {
            return { success: false, error: "No authenticated user found" };
        }

        // Get court information
        const court = await db.query.courts.findFirst({
            where: eq(courts.id, courtId),
            with: {
                venue: true,
                sport: true
            }
        });

        if (!court) {
            return { success: false, error: "Court not found" };
        }

        // Calculate original price
        const originalPrice = parseFloat(court.pricePerHour) * duration;

        // Apply membership discount if user is a member

        return {
            success: true,
            originalPrice: originalPrice,
            pricePerHour: parseFloat(court.pricePerHour)
        };
    } catch (error) {
        console.error("Error getting booking pricing:", error);
        return { success: false, error: "Failed to get pricing information" };
    }
}

// Get booking by ID
export async function getBookingById(bookingId: string) {
    try {
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, bookingId),
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                court: {
                    with: {
                        venue: true,
                        sport: true
                    }
                }
            }
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        return { success: true, booking };
    } catch (error) {
        console.error("Error fetching booking:", error);
        return { success: false, error: "Failed to fetch booking" };
    }
}

// Update booking payment status
export async function updateBookingPaymentStatus(bookingId: string, paymentStatus: 'pending' | 'completed' | 'failed') {
    try {
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, bookingId)
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        const [updatedBooking] = await db
            .update(bookings)
            .set({
                paymentStatus,
                updatedAt: new Date()
            })
            .where(eq(bookings.id, bookingId))
            .returning();

        // Revalidate relevant paths
        revalidatePath('/bookings');
        revalidatePath('/my-bookings');
        revalidatePath('/dashboard');

        return { success: true, booking: updatedBooking };
    } catch (error) {
        console.error("Error updating booking payment status:", error);
        return { success: false, error: "Failed to update payment status" };
    }
}

// Get bookings for venues owned by the current user (for venue owners)
export async function getOwnerVenueBookings() {
    try {
        const userResult = await getCurrentUser();

        if (!userResult.success || !userResult.user) {
            return { success: false, error: "No authenticated user found" };
        }

        // Get all bookings for courts in venues owned by the current user
        const venueBookings = await db.query.bookings.findMany({
            where: and(
                // We'll filter by venue ownership in the join
            ),
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                court: {
                    with: {
                        venue: {
                            columns: {
                                id: true,
                                name: true,
                                ownerId: true
                            }
                        },
                        sport: {
                            columns: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: desc(bookings.createdAt)
        });

        // Filter bookings to only include those from venues owned by the current user
        const userOwnedBookings = venueBookings.filter(booking =>
            booking.court.venue.ownerId === userResult.user!.id
        );

        // Transform the data to match the dashboard format
        const transformedBookings = userOwnedBookings.map(booking => ({
            id: booking.id,
            bookingDate: booking.bookingDate.toISOString().split('T')[0],
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            venueName: booking.court.venue.name,
            courtName: booking.court.name,
            customerName: booking.user.name,
            customerEmail: booking.user.email,
            totalPrice: parseFloat(booking.totalPrice),
            sportName: booking.court.sport.name
        }));

        return { success: true, bookings: transformedBookings };
    } catch (error) {
        console.error("Error fetching owner venue bookings:", error);
        return { success: false, error: "Failed to fetch venue bookings" };
    }
}