import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { env } from '@/env';
import { Polar } from '@polar-sh/sdk';

const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

// GET /api/payment/success - Called by Polar after successful checkout
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('booking');
        const checkoutId = searchParams.get('checkout_id');

        if (!bookingId) {
            return NextResponse.redirect(new URL('/bookings?payment=error', request.url));
        }

        if (!checkoutId) {
            console.error("Missing checkout_id in payment success callback");
            return NextResponse.redirect(new URL('/bookings?payment=error', request.url));
        }

        // Require an authenticated session — never trust a plain query string.
        let session = null;
        try {
            session = await auth.api.getSession({
                headers: request.headers,
            });
        } catch (sessionError) {
            console.error("Session validation failed in payment success:", sessionError);
            return NextResponse.redirect(new URL(`/login?redirect=/bookings?booking=${bookingId}`, request.url));
        }

        if (!session?.user) {
            return NextResponse.redirect(new URL(`/login?redirect=/bookings?booking=${bookingId}`, request.url));
        }

        // Verify the booking exists and belongs to the authenticated user.
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, bookingId),
        });

        if (!booking) {
            return NextResponse.redirect(new URL('/bookings?payment=error', request.url));
        }

        if (booking.userId !== session.user.id) {
            return NextResponse.redirect(new URL('/bookings?payment=error', request.url));
        }

        // Verify with Polar that the checkout actually succeeded before
        // marking the booking as paid.
        const checkout = await polar.checkouts.get({ id: checkoutId });
        const isPaid = checkout.status === "succeeded";
        const bookingIdMatch =
            checkout.metadata?.bookingId === bookingId;

        if (!isPaid || !bookingIdMatch) {
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