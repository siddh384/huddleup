"use client";

import Link from "next/link";

import { AuthStatus } from "./auth-status";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import { useState, useEffect } from "react";
import { Menu, Volleyball, X } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { CitySwitcher } from "@/components/city-switcher";
import { type City } from "@/lib/cities";

interface HomeNavbarProps {
  city?: City | null;
}

export const HomeNavbar = ({ city }: HomeNavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useCurrentUser();

  // Debug: Log user data to help verify the fix
  useEffect(() => {
    if (user) {
      console.log("NavBar User Data:", { role: user.role, name: user.name });
      console.log(
        "Should show Create Venue:",
        user.role === "facility_owner" || user.role === "admin",
      );
      console.log("Should show Admin:", user.role === "admin");
    } else {
      console.log("NavBar: No user data");
    }
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 flex items-center px-4 md:px-6 z-50">
      <div className="flex items-center justify-between lg:grid lg:grid-cols-3 w-full max-w-7xl mx-auto gap-3">
        {/* Logo */}
        <div className="flex items-center justify-self-start flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 p-1.5 rounded-lg transition-colors hover:bg-accent/50"
          >
            <Volleyball className="size-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
              HuddleUp
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex justify-center">
          <nav className="flex items-center gap-1">
            <Link
              href="/venues"
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors px-3 py-2 rounded-md"
            >
              Venues
            </Link>

            <Link
              href="/bookings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors px-3 py-2 rounded-md"
            >
              My Bookings
            </Link>

            <Link
              href="/contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors px-3 py-2 rounded-md"
            >
              Contact
            </Link>

            {/* Admin Links removed */}
          </nav>
        </div>

        {/* User Controls */}
        <div className="flex items-center justify-self-end gap-1.5">
          {/* Desktop User Controls */}
          <div className="hidden lg:flex items-center gap-1.5">
            {city && <CitySwitcher currentCity={city} />}
            <ThemeToggleButton variant="circle-blur" start="top-right" />
            <AuthStatus />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-1.5">
            {city && <CitySwitcher currentCity={city} />}
            <ThemeToggleButton variant="circle-blur" start="top-right" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-background border-b border-border/40 shadow-lg">
            <nav className="flex flex-col p-4 space-y-1">
              <Link
                href="/venues"
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors px-3 py-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Venues
              </Link>

              {/* Facility Owner Links removed */}

              <Link
                href="/bookings"
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors px-3 py-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                My Bookings
              </Link>

              <Link
                href="/contact"
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors px-3 py-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Admin Links removed */}

              {/* Mobile Auth Status */}
              <div className="pt-2 mt-2 border-t border-border/40">
                <AuthStatus />
              </div>
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
};
