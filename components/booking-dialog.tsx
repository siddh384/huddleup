"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/base/buttons/button";
import {
  Clock,
  MapPin,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import { generateTimeSlots, createBooking } from "@/lib/actions/bookings";
import { format } from "date-fns";
import { toast } from "sonner";

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
  status: "available" | "booked";
  hour: number;
}

const BookingDialog: React.FC<BookingDialogProps> = ({
  courtId,
  courtName,
  sportName,
  pricePerHour,
  venueName,
  venueLocation,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [duration, setDuration] = useState<number>(1);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  const formatDateForAPI = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    if (isOpen) {
      loadTimeSlots();
    }
  }, [selectedDate, isOpen]);

  useEffect(() => {
    setSelectedSlot(null);
  }, [duration]);

  const loadTimeSlots = async () => {
    setLoading(true);
    try {
      const result = await generateTimeSlots(
        courtId,
        formatDateForAPI(selectedDate),
      );
      if (result.success) {
        type ApiSlot = Omit<TimeSlot, "status"> & { status: string };
        const normalizedSlots: TimeSlot[] = (
          (result.slots as ApiSlot[] | undefined) ?? []
        ).map((slot) => ({
          ...slot,
          status: slot.status === "booked" ? "booked" : "available",
        }));
        setTimeSlots(normalizedSlots);
      } else {
        toast.error(result.error || "Failed to load time slots");
        setTimeSlots([]);
      }
    } catch {
      toast.error("Failed to load time slots");
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const isSlotAvailableForDuration = (
    startSlot: TimeSlot,
    requestedDuration: number,
  ) => {
    if (requestedDuration === 1) return startSlot.status === "available";
    const startIndex = timeSlots.findIndex(
      (slot) => slot.hour === startSlot.hour,
    );
    if (startIndex === -1) return false;
    for (let i = 0; i < requestedDuration; i++) {
      const slotIndex = startIndex + i;
      if (slotIndex >= timeSlots.length) return false;
      if (timeSlots[slotIndex].status !== "available") return false;
    }
    return true;
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [startHour] = startTime.split(":").map(Number);
    const endHour = startHour + duration;
    return `${endHour.toString().padStart(2, "0")}:00`;
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
        duration: duration,
      });
      if (result.success) {
        toast.success("Booking confirmed successfully!");
        setIsOpen(false);
        setSelectedSlot(null);
        setDuration(1);
        loadTimeSlots();
      } else {
        toast.error(result.error || "Failed to create booking");
      }
    } catch {
      toast.error("Failed to create booking");
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

  const formatDateLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const availableSlots = timeSlots.filter((slot) => {
    const now = new Date();
    const today = formatDateLocal(now);
    const selectedDateStr = formatDateForAPI(selectedDate);
    if (selectedDateStr === today) {
      const currentHour = String(now.getHours()).padStart(2, "0");
      const currentMinute = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${currentHour}:${currentMinute}`;
      return slot.startTime > currentTime;
    }
    return true;
  });

  const totalPrice = selectedSlot
    ? (selectedSlot.price * duration).toFixed(0)
    : (parseFloat(pricePerHour) * duration).toFixed(0);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetDialog();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[88vh] overflow-y-auto p-0 rounded-3xl shadow-xl border-border">
        {/* Compact header */}
        <DialogHeader className="border-b border-border px-6 py-4 pb-3 space-y-0.5">
          <DialogTitle className="text-title-2-semibold text-text-primary">
            {courtName}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-body-2-regular text-text-tertiary">
              {venueName}, {venueLocation}
            </span>
            <span className="inline-flex items-center rounded-full bg-accent-400/10 px-2 py-0.5 text-caption-2-semibold text-accent-600">
              {sportName}
            </span>
          </div>
        </DialogHeader>

        {/* Two-column booking area */}
        <div className="grid grid-cols-1 gap-8 p-6 pt-4 lg:grid-cols-2">
          {/* Left — Calendar + Duration */}
          <div className="flex flex-col gap-4">
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
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              className="w-full [&_.rdp-month]:!p-0 [&_.rdp-month_caption]:!justify-start [&_.rdp-month_caption]:!pb-2 [&_.rdp-month_caption]:!text-title-3-semibold [&_.rdp-table]:!w-full [&_.rdp-cell]:!p-0 [&_.rdp-cell>button]:!h-9 [&_.rdp-cell>button]:!w-9 [&_.rdp-cell>button]:!text-sm"
            />

            {/* Duration row */}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3">
              <button
                type="button"
                onClick={() => setDuration(Math.max(1, duration - 1))}
                disabled={duration <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-background-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5 text-text-secondary" />
              </button>
              <div className="text-center">
                <span className="text-title-2-semibold text-text-primary">
                  {duration}
                </span>
                <span className="text-body-2-regular text-text-tertiary ml-1">
                  hour{duration > 1 ? "s" : ""}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDuration(Math.min(8, duration + 1))}
                disabled={duration >= 8}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-background-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5 text-text-secondary" />
              </button>
            </div>
          </div>

          {/* Right — Time slots */}
          <div className="flex flex-col gap-4">
            {/* Slots header */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-body-2-regular text-text-tertiary">
                {format(selectedDate, "EEE, MMM dd")} ·{" "}
                {
                  availableSlots.filter((s) =>
                    isSlotAvailableForDuration(s, duration),
                  ).length
                }{" "}
                available
              </span>
              {selectedSlot && (
                <span className="text-caption-1-semibold text-accent-600">
                  {selectedSlot.startTime} –{" "}
                  {calculateEndTime(selectedSlot.startTime, duration)}
                </span>
              )}
            </div>

            {/* Time slots grid */}
            {loading ? (
              <div className="flex items-center justify-center rounded-2xl border border-border py-10">
                <Loader2 className="h-5 w-5 animate-spin text-text-tertiary" />
              </div>
            ) : (
              <div className="min-h-0 max-h-[40vh] flex-1 grid grid-cols-2 content-start gap-2 overflow-y-auto pr-1">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot, index) => {
                    const isAvailable = isSlotAvailableForDuration(
                      slot,
                      duration,
                    );
                    const isSelected =
                      selectedSlot?.startTime === slot.startTime;
                    const endTime = calculateEndTime(
                      slot.startTime,
                      duration,
                    );

                    return (
                      <button
                        type="button"
                        key={index}
                        disabled={!isAvailable}
                        onClick={() => {
                          if (isAvailable) setSelectedSlot(slot);
                        }}
                        className={`cursor-pointer rounded-2xl border p-3.5 text-left transition-all ${
                          !isAvailable
                            ? "cursor-not-allowed border-border/40 bg-background-secondary/30 text-text-tertiary"
                            : isSelected
                              ? "border-text-primary bg-text-primary/5 text-text-primary"
                              : "border-border text-text-primary hover:border-text-primary/30 hover:shadow-xs"
                        }`}
                      >
                        <div className="text-body-semibold leading-none">
                          {slot.startTime} – {endTime}
                        </div>
                        <div className="mt-1 text-caption-2-regular text-text-tertiary">
                          ₹{slot.price}/hr
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border border-border py-10">
                    <Clock className="mb-2 h-5 w-5 text-text-tertiary" />
                    <span className="text-body-2-regular text-text-tertiary">
                      No slots available
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer — summary + actions */}
        <div className="flex items-center justify-between gap-4 border-t border-border px-6 py-4">
          <div className="min-w-0 flex-1">
            {selectedSlot ? (
              <div className="flex items-center gap-2.5 text-body-2-regular text-text-tertiary truncate flex-wrap">
                <span className="shrink-0">
                  {selectedSlot.startTime} –{" "}
                  {calculateEndTime(selectedSlot.startTime, duration)}
                </span>
                <span aria-hidden="true" className="h-3 w-px shrink-0 bg-border" />
                <span className="shrink-0">
                  {duration}h · ₹
                  {(selectedSlot.price * duration).toFixed(0)}
                </span>
              </div>
            ) : (
              <span className="text-body-2-regular text-text-tertiary">
                Select a time slot to continue
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBooking}
              disabled={!selectedSlot || booking}
            >
              {booking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Booking...
                </>
              ) : (
                <>
                  Confirm Booking{" "}
                  {selectedSlot && (
                    <span className="ml-1 opacity-90">
                      · ₹{(selectedSlot.price * duration).toFixed(0)}
                    </span>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;