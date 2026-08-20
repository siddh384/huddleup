"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2 } from "lucide-react";
import { payForBooking } from "@/lib/payment";
import { toast } from "sonner";

interface BookingPaymentDialogProps {
  bookingId: string;
  bookingAmount: number;
  isDisabled?: boolean;
}

export function BookingPaymentDialog({
  bookingId,
  bookingAmount,
  isDisabled = false,
}: BookingPaymentDialogProps) {
  const [amount, setAmount] = useState<string>(bookingAmount.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handlePayment = async () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount < 100 || numAmount > 500) {
      toast.error("Please enter a valid amount between ₹100 and ₹500");
      return;
    }

    setIsLoading(true);

    try {
      const result = await payForBooking(numAmount, bookingId);

      if (result.success && result.checkoutUrl) {
        // Redirect to payment page
        window.location.href = result.checkoutUrl;
      } else {
        toast.error(result.error || "Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isDisabled) {
    return (
      <Button disabled variant="outline" size="sm" className="w-full">
        <CreditCard className="w-4 h-4 mr-2" />
        Paid
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="w-full">
          <CreditCard className="w-4 h-4 mr-2" />
          Pay Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment for Booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹100 - ₹500)</Label>
            <Input
              id="amount"
              type="number"
              min="100"
              max="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <p className="text-sm text-muted-foreground">
              Suggested amount: ₹{bookingAmount}
            </p>
          </div>
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ₹{amount}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
