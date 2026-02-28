import { NextRequest, NextResponse } from 'next/server';
import { generateTimeSlots } from '@/lib/actions/bookings';

// GET /api/time-slots - Get available time slots for a court on a specific date
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const courtId = searchParams.get('courtId');
        const date = searchParams.get('date');

        // Validate required parameters
        if (!courtId || !date) {
            return NextResponse.json(
                { error: 'Missing required parameters: courtId and date' },
                { status: 400 }
            );
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return NextResponse.json(
                { error: 'Invalid date format. Use YYYY-MM-DD' },
                { status: 400 }
            );
        }

        const result = await generateTimeSlots(courtId, date);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: result.error === 'Court not found' ? 404 : 400 }
            );
        }

        return NextResponse.json({
            success: true,
            slots: result.slots
        });
    } catch (error) {
        console.error('Error in GET /api/time-slots:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
