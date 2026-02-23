"use client";

import Link from "next/link";
import { MdOutlineSportsVolleyball } from "react-icons/md";
import { AuthStatus } from "./auth-status";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

export const HomeNavbar = () => {
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
    <nav className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 flex items-center px-4 md:px-6 z-50 shadow-sm">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 p-2 rounded-lg transition-colors"
          >
            <MdOutlineSportsVolleyball className="size-7 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
              HuddleUp
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex flex-1 justify-center">
          <nav className="flex items-center gap-6 xl:gap-8">
            <Link
              href="/venues"
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors relative group py-2"
            >
              Venues
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link
              href="/bookings"
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors relative group py-2"
            >
              My Bookings
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors relative group py-2"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* Admin Links removed */}
          </nav>
        </div>

        {/* User Controls */}

        {/* Desktop User Controls */}
        <div className="hidden lg:flex flex-shrink-0 items-center gap-1">
          <ThemeToggleButton variant="circle-blur" start="top-right" />
          <AuthStatus />
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-background border-b border-border/40 shadow-lg">
            <nav className="flex flex-col p-4 space-y-4">
              <Link
                href="/venues"
                className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Venues
              </Link>

              {/* Facility Owner Links removed */}

              <Link
                href="/bookings"
                className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                My Bookings
              </Link>

              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Admin Links removed */}

              {/* Mobile Auth Status */}
              <div className="pt-2 border-t border-border/40">
                <AuthStatus />
              </div>
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
};
