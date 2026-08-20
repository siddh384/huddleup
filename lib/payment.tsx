"use server";
import { env } from "@/env";
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

export const payForBooking = async (amount: number, bookingId: string) => {
  // Validate amount is between 100 and 500
  if (amount < 100 || amount > 500) {
    return { success: false, error: "Amount must be between ₹100 and ₹500" };
  }

  try {
    const checkout = await polar.checkouts.create({
      products: ["a36af0cb-f387-46dc-83cd-f0bb9388d921"],
      amount: amount * 100, // Convert to paise for Polar
      successUrl: `${env.BETTER_AUTH_URL}/api/payment/success?booking=${bookingId}`,
      metadata: {
        bookingId,
        amount: amount.toString(),
      },
    });
    return { success: true, checkoutUrl: checkout.url };
  } catch (error) {
    console.error("Payment creation failed:", error);
    return { success: false, error: "Failed to create payment checkout" };
  }
};
