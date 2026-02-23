import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { env } from "@/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    // Sends a password reset email with a link containing the token
    sendResetPassword: async ({ user, url, token }, request) => {
      // TODO: Replace with your email provider integration
      // Example: await sendEmail({ to: user.email, subject: "Reset your password", text: `Reset link: ${url}` })
      console.log("[BetterAuth] sendResetPassword invoked for:", user.email);
      console.log("Reset URL:", url);
      console.log("Token:", token);
    },
    // Optional callback after a successful password reset
    onPasswordReset: async ({ user }, request) => {
      console.log(`[BetterAuth] Password reset for user: ${user.email}`);
    },
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [nextCookies()],
});
