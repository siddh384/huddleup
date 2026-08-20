import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/payment/success - Called by Polar after successful checkout
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('booking');

        if (!bookingId) {
            return NextResponse.redirect(new URL('/bookings?payment=error', request.url));
        }

        // Mark booking as paid
        await db
            .update(bookings)
            .set({
                paymentStatus: 'completed',
                updatedAt: new Date(),
            })
            .where(eq(bookings.id, bookingId));

        // Redirect to bookings page with success indicator
        return NextResponse.redirect(
            new URL(`/bookings?payment=success&booking=${bookingId}`, request.url)
        );
    } catch (error) {
        console.error('Error in GET /api/payment/success:', error);
        return NextResponse.redirect(new URL('/bookings?payment=error', request.url));
    }
}