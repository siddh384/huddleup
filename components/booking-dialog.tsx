"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar as CalendarIcon, MapPin, User, CreditCard, Loader2, Plus, Minus } from 'lucide-react';
import { generateTimeSlots, createBooking, getBookingPricing } from '@/lib/actions/bookings';

import { format } from 'date-fns';
import { toast } from 'sonner';

interface BookingDialogProps {
    courtId: string;
    courtName: string;
    sportName: string;
    pricePerHour: string;
    venueName: string;
    venueLocation: string;
    children: React.ReactNode;
}

interface TimeSlot {
    startTime: string;
    endTime: string;
    date: Date;
    price: number;
    courtName: string;
    sportName: string;
    status: 'available' | 'booked';
    hour: number;
}

const BookingDialog: React.FC<BookingDialogProps> = ({
    courtId,
    courtName,
    sportName,
    pricePerHour,
    venueName,
    venueLocation,
    children
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [duration, setDuration] = useState<number>(1);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(false);
    const [membershipStatus, setMembershipStatus] = useState<{
        isMember: boolean;
        discountPercentage: number;
    }>({ isMember: false, discountPercentage: 0 });
    const [pricingInfo, setPricingInfo] = useState<{
        originalPrice: number;
        discountedPrice: number;
        discountAmount: number;
    } | null>(null);

    // Format date for API call
    const formatDateForAPI = (date: Date) => {
        return format(date, 'yyyy-MM-dd');
    };

    // Load time slots and membership status when dialog opens
    useEffect(() => {
        if (isOpen) {
            loadTimeSlots();
        }
    }, [selectedDate, isOpen]);

    // Update pricing when duration changes
    useEffect(() => {
        if (isOpen) {
            updatePricing();
        }
    }, [duration, membershipStatus, isOpen]);

    // Reset selected slot when duration changes
    useEffect(() => {
        setSelectedSlot(null);
    }, [duration]);


    const updatePricing = async () => {
        try {
            const result = await getBookingPricing(courtId, duration);
            if (result.success) {
                const originalPrice = result.originalPrice || 0;
                setPricingInfo({
                    originalPrice,
                    discountedPrice: originalPrice,
                    discountAmount: 0,
                });
            }
        } catch (error) {
            console.error('Error updating pricing:', error);
        }
    };

    const loadTimeSlots = async () => {
        setLoading(true);
        try {
            const result = await generateTimeSlots(courtId, formatDateForAPI(selectedDate));
            if (result.success) {
                type ApiSlot = Omit<TimeSlot, 'status'> & { status: string };
                const normalizedSlots: TimeSlot[] = ((result.slots as ApiSlot[] | undefined) ?? []).map((slot) => ({
                    ...slot,
                    status: slot.status === 'booked' ? 'booked' : 'available',
                }));
                setTimeSlots(normalizedSlots);
            } else {
                toast.error(result.error || 'Failed to load time slots');
                setTimeSlots([]);
            }
        } catch (error) {
            console.error('Error loading time slots:', error);
            toast.error('Failed to load time slots');
            setTimeSlots([]);
        } finally {
            setLoading(false);
        }
    };

    // Check if consecutive slots are available for the selected duration
    const isSlotAvailableForDuration = (startSlot: TimeSlot, requestedDuration: number) => {
        if (requestedDuration === 1) return startSlot.status === 'available';

        const startIndex = timeSlots.findIndex(slot => slot.hour === startSlot.hour);
        if (startIndex === -1) return false;

        // Check if we have enough consecutive available slots
        for (let i = 0; i < requestedDuration; i++) {
            const slotIndex = startIndex + i;
            if (slotIndex >= timeSlots.length) return false;
            if (timeSlots[slotIndex].status !== 'available') return false;
        }

        return true;
    };

    // Calculate end time based on start time and duration
    const calculateEndTime = (startTime: string, duration: number) => {
        const [startHour] = startTime.split(':').map(Number);
        const endHour = startHour + duration;
        return `${endHour.toString().padStart(2, '0')}:00`;
    };

    const handleBooking = async () => {
        if (!selectedSlot) return;

        setBooking(true);
        try {
            const endTime = calculateEndTime(selectedSlot.startTime, duration);

            const result = await createBooking({
                courtId,
                bookingDate: formatDateForAPI(selectedDate),
                startTime: selectedSlot.startTime,
                endTime: endTime,
                duration: duration
            });

            if (result.success) {
                toast.success('Booking confirmed successfully!');
                setIsOpen(false);
                setSelectedSlot(null);
                setDuration(1);
                // Reload time slots to reflect the new booking
                loadTimeSlots();
            } else {
                toast.error(result.error || 'Failed to create booking');
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            toast.error('Failed to create booking');
        } finally {
            setBooking(false);
        }
    };

    const resetDialog = () => {
        setSelectedDate(new Date());
        setSelectedSlot(null);
        setDuration(1);
        setTimeSlots([]);
    };

    // Filter out past time slots for today
    const availableSlots = timeSlots.filter(slot => {
        const now = new Date();
        const today = format(now, 'yyyy-MM-dd');
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

        // If it's today, filter out past slots
        if (selectedDateStr === today) {
            const currentTime = format(now, 'HH:mm');
            return slot.startTime > currentTime;
        }

        return true;
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
                resetDialog();
            }
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-6xl sm:max-w-6xl w-[95vw] sm:w-[90vw] max-h-[95vh] overflow-y-auto p-0 rounded-2xl">
                <DialogHeader className="p-8 pb-5 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b">
                    <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Book {courtName}
                    </DialogTitle>
                    <div className="flex items-center gap-4 text-muted-foreground mt-2">
                        <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{venueName}, {venueLocation}</span>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {sportName}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-10">
                    {/* Left Column - Calendar */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <CalendarIcon className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold">Select Date</h3>
                        </div>
                        <div className="bg-gradient-to-br from-background to-muted/20 p-6 rounded-xl border-2 border-primary/10 shadow-sm">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    if (date) {
                                        setSelectedDate(date);
                                        setSelectedSlot(null);
                                    }
                                }}
                                disabled={(date) => {
                                    // Disable past dates
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return date < today;
                                }}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Right Column - Time Slots */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Clock className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold">Available Time Slots</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
                                </p>
                            </div>
                        </div>

                        {/* Duration Selection */}
                        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-5 rounded-xl border border-primary/20">
                            <label className="text-sm font-semibold text-primary mb-3 block">Select Duration</label>
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDuration(Math.max(1, duration - 1))}
                                    disabled={duration <= 1}
                                    className="h-10 w-10 rounded-full border-primary/30 hover:bg-primary/10"
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {duration}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        hour{duration > 1 ? 's' : ''}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDuration(Math.min(8, duration + 1))}
                                    disabled={duration >= 8}
                                    className="h-10 w-10 rounded-full border-primary/30 hover:bg-primary/10"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="text-center mt-3 p-3 bg-background/50 rounded-lg space-y-1">
                                {membershipStatus.isMember && pricingInfo ? (
                                    <>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-sm text-muted-foreground line-through">
                                                ₹{pricingInfo.originalPrice.toFixed(0)}
                                            </span>
                                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                                {membershipStatus.discountPercentage}% OFF
                                            </Badge>
                                        </div>
                                        <div className="font-bold text-primary text-lg">
                                            ₹{pricingInfo.discountedPrice.toFixed(0)}
                                        </div>
                                        <div className="text-xs text-green-600">
                                            You save ₹{pricingInfo.discountAmount.toFixed(0)}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-sm text-muted-foreground">Estimated Total: </span>
                                        <span className="font-bold text-primary">
                                            ₹{(parseFloat(pricePerHour) * duration).toFixed(0)}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-14 bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                                <span className="text-muted-foreground font-medium">Loading time slots...</span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Available slots ({availableSlots.filter(slot => isSlotAvailableForDuration(slot, duration)).length})
                                    </span>
                                    {selectedSlot && (
                                        <Badge variant="outline" className="text-xs">
                                            Selected: {selectedSlot.startTime} - {calculateEndTime(selectedSlot.startTime, duration)}
                                        </Badge>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1 md:pr-2">
                                    {availableSlots.length > 0 ? (
                                        availableSlots.map((slot, index) => {
                                            const isAvailableForDuration = isSlotAvailableForDuration(slot, duration);
                                            const isSelected = selectedSlot?.startTime === slot.startTime;
                                            const endTime = calculateEndTime(slot.startTime, duration);

                                            return (
                                                <Card
                                                    key={index}
                                                    className={`cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${!isAvailableForDuration
                                                        ? 'opacity-40 cursor-not-allowed bg-muted/30 border-muted'
                                                        : isSelected
                                                            ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30 shadow-lg'
                                                            : 'hover:shadow-lg hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/70 border-border/50'
                                                        }`}
                                                    onClick={() => {
                                                        if (isAvailableForDuration) {
                                                            setSelectedSlot(slot);
                                                        }
                                                    }}
                                                >
                                                    <CardContent className="p-5">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <div className="text-sm font-bold text-foreground">
                                                                    {slot.startTime} - {endTime}
                                                                </div>
                                                                <Badge
                                                                    variant={isAvailableForDuration ? (isSelected ? 'default' : 'outline') : 'secondary'}
                                                                    className={`text-xs ${isSelected ? 'bg-primary text-primary-foreground' : ''
                                                                        }`}
                                                                >
                                                                    {isAvailableForDuration ? 'Available' : duration > 1 ? 'Unavailable' : 'Booked'}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {membershipStatus.isMember ? (
                                                                    <div className="space-y-1">
                                                                        <div className="line-through opacity-70">
                                                                            ₹{slot.price}/hr × {duration} = ₹{(slot.price * duration).toFixed(0)}
                                                                        </div>
                                                                        <div className="text-green-600 font-semibold">
                                                                            Member Price: ₹{((slot.price * duration) * (100 - membershipStatus.discountPercentage) / 100).toFixed(0)}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        ₹{slot.price}/hr × {duration} = <span className="font-semibold text-primary">₹{(slot.price * duration).toFixed(0)}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                                    ) : (
                                        <div className="col-span-2 flex flex-col items-center justify-center py-16 bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl">
                                            <Clock className="w-12 h-12 text-muted-foreground/50 mb-3" />
                                            <span className="text-muted-foreground font-medium">No available time slots</span>
                                            <span className="text-sm text-muted-foreground/70">for this date</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Booking Summary */}
                {selectedSlot && (
                    <div className="border-t bg-gradient-to-r from-primary/5 to-primary/10 px-8 py-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <CreditCard className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold">Booking Summary</h3>
                        </div>
                        <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-primary/20 shadow-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Court</span>
                                        <span className="font-semibold text-foreground">{courtName}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sport</span>
                                        <span className="font-semibold text-foreground">{sportName}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</span>
                                        <span className="font-semibold text-foreground">{format(selectedDate, 'MMM dd, yyyy')}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</span>
                                        <span className="font-semibold text-foreground">
                                            {selectedSlot.startTime} - {calculateEndTime(selectedSlot.startTime, duration)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Duration</span>
                                        <span className="font-semibold text-foreground">{duration} hour{duration > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rate</span>
                                        <span className="font-semibold text-foreground">₹{selectedSlot.price}/hour</span>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-primary/20 pt-4">
                                {membershipStatus.isMember && pricingInfo ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg">
                                            <span className="text-sm text-muted-foreground">Original Price</span>
                                            <span className="text-lg line-through text-muted-foreground">₹{pricingInfo.originalPrice.toFixed(0)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-green-700 dark:text-green-300">Member Discount ({membershipStatus.discountPercentage}%)</span>
                                                <Badge variant="secondary" className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">
                                                    MEMBER
                                                </Badge>
                                            </div>
                                            <span className="text-lg font-semibold text-green-700 dark:text-green-300">-₹{pricingInfo.discountAmount.toFixed(0)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg">
                                            <span className="text-lg font-bold text-foreground">Total Amount</span>
                                            <span className="text-2xl font-bold text-primary">₹{pricingInfo.discountedPrice.toFixed(0)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg">
                                        <span className="text-lg font-bold text-foreground">Total Amount</span>
                                        <span className="text-2xl font-bold text-primary">₹{(selectedSlot.price * duration).toFixed(0)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="p-8 bg-gradient-to-r from-background to-muted/20 border-t">
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 sm:flex-none sm:min-w-[140px] h-12 border-muted-foreground/20 hover:bg-muted/50"
                            size="lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBooking}
                            disabled={!selectedSlot || booking}
                            className="flex-1 sm:flex-none sm:min-w-[200px] h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                            size="lg"
                        >
                            {booking ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Confirm Booking
                                    {selectedSlot && (
                                        <span className="ml-2 text-sm opacity-90">
                                            {membershipStatus.isMember && pricingInfo ?
                                                `₹${pricingInfo.discountedPrice.toFixed(0)}` :
                                                `₹${(selectedSlot.price * duration).toFixed(0)}`
                                            }
                                        </span>
                                    )}
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BookingDialog;
