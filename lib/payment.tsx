"use server";
import { env } from "@/env";
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

export const buyMembership = async () => {
  const checkout = await polar.checkouts.create({
    products: ["9c04810d-081c-453c-a7d8-799a7b593765"],
    successUrl: `${env.BETTER_AUTH_URL}/buy-membership`,
  });
  return { success: true, checkoutUrl: checkout.url };
};

export const payForBooking = async (amount: number, bookingId: string) => {
  // Validate amount is between 1 and 500
  if (amount < 1 || amount > 500) {
    return { success: false, error: "Amount must be between ₹1 and ₹500" };
  }

  try {
    const checkout = await polar.checkouts.create({
      products: ["abf9ae33-1c8c-42fd-93cb-f80a11f77009"],
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
