import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, cancelBooking } from '@/lib/actions/bookings';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

// GET /api/bookings/[id] - Get a specific booking
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const resolvedParams = await params;
        const bookingId = resolvedParams.id;

        const result = await getBookingById(bookingId);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: result.error === 'Booking not found' ? 404 : 400 }
            );
        }

        return NextResponse.json({
            success: true,
            booking: result.booking
        });
    } catch (error) {
        console.error('Error in GET /api/bookings/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH /api/bookings/[id] - Cancel a booking
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const resolvedParams = await params;
        const bookingId = resolvedParams.id;
        const body = await request.json();
        const { action, cancellationReason } = body;

        if (action === 'cancel') {
            const result = await cancelBooking(bookingId, cancellationReason);

            if (!result.success) {
                return NextResponse.json(
                    { error: result.error },
                    { status: result.error === 'No authenticated user found' ? 401 : 
                             result.error === 'Booking not found' ? 404 : 400 }
                );
            }

            return NextResponse.json({
                success: true,
                booking: result.booking
            });
        }

        return NextResponse.json(
            { error: 'Invalid action. Only "cancel" is supported.' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error in PATCH /api/bookings/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
