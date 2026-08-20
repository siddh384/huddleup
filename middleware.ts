import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

const protectedRoutes = [
  "/bookings",
  "/my-bookings",
  "/my-venues",
  "/admin",
  "/admin-dashboard",
  "/owner-dashboard",
  "/create-venue",
  "/profile",
];

// Routes exempt from city check (no redirect to /profile)
const cityExemptRoutes = [
  "/profile",     // The page they need to set their city
  "/sign-in",
  "/sign-up",
];

const authRoutes = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
  let session = null;

  try {
    session = await auth.api.getSession({
      headers: request.headers,
    });
  } catch (error) {
    // Log the error for debugging but don't crash the middleware
    console.warn("Session validation failed:", error);
    // Treat as no session (unauthenticated user)
    session = null;
  }

  const { pathname } = request.nextUrl;

  // If user is not authenticated and trying to access protected route
  if (!session && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If user is authenticated but trying to access auth routes
  if (session && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // City guard: authenticated user without a city → redirect to /profile
  // Applies to ALL routes except exempt ones (profile, auth pages, API, static)
  if (session && !cityExemptRoutes.some((route) => pathname.startsWith(route))) {
    try {
      const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, session.user.id),
        columns: { city: true },
      });
      if (!profile?.city) {
        return NextResponse.redirect(new URL("/profile", request.url));
      }
    } catch (error) {
      // If DB query fails, let the request through (don't block the user)
      console.warn("City check failed:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
