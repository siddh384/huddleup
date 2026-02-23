import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const protectedRoutes = [
  "/bookings",
  "/my-bookings",
  "/my-venues",
  "/admin",
  "/create-venue",
  "/profile",
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

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
