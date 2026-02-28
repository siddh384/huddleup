import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getUserBookings } from '@/lib/actions/bookings';

// GET /api/bookings - Get user's bookings
export async function GET() {
    try {
        const result = await getUserBookings();

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: result.error === 'No authenticated user found' ? 401 : 400 }
            );
        }

        return NextResponse.json({
            success: true,
            bookings: result.bookings
        });
    } catch (error) {
        console.error('Error in GET /api/bookings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { courtId, bookingDate, startTime, endTime, duration } = body;

        // Validate required fields
        if (!courtId || !bookingDate || !startTime || !endTime || !duration) {
            return NextResponse.json(
                { error: 'Missing required fields: courtId, bookingDate, startTime, endTime, duration' },
                { status: 400 }
            );
        }

        const result = await createBooking({
            courtId,
            bookingDate,
            startTime,
            endTime,
            duration
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: result.error === 'No authenticated user found' ? 401 : 400 }
            );
        }

        return NextResponse.json({
            success: true,
            booking: result.booking
        }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/bookings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
