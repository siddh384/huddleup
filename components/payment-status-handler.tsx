"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function PaymentStatusHandler() {
  const searchParams = useSearchParams();
  const hasShownToast = useRef(false);

  useEffect(() => {
    const payment = searchParams.get("payment");

    if (payment === "success" && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success(
        "Payment completed successfully! Your booking is now confirmed.",
      );

      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      url.searchParams.delete("booking");
      window.history.replaceState({}, "", url.toString());
    } else if (payment === "error" && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.error("Payment failed. Please try again.");

      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      url.searchParams.delete("booking");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
}
