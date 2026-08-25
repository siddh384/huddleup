"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const [isHeroInView, setIsHeroInView] = useState(true);
  const { data: user } = useCurrentUser();
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Light mode: white text/transparent bg — active only on the homepage
  // while the hero section overlaps the navbar area.
  const isLightNav = isHome && isHeroInView;

  // Detect when the hero section scrolls past the fixed navbar by reading
  // the hero element's actual bounding rect. This adapts to any screen size
  // via getBoundingClientRect rather than a hardcoded scrollY value.
  useEffect(() => {
    if (!isHome) {
      setIsHeroInView(false);
      return;
    }

    const hero = document.querySelector("[data-hero]");
    if (!hero) return;

    // 64 = 4rem fixed navbar height — a layout constant, not a magic number.
    const NAVBAR_HEIGHT = 64;

    const update = () => {
      const rect = hero.getBoundingClientRect();
      // The navbar sits over the hero as long as the hero's top edge has not
      // scrolled below the bottom of the navbar (64px from viewport top).
      setIsHeroInView(rect.top <= NAVBAR_HEIGHT);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [isHome]);

  useEffect(() => {
    // Debug logging removed for viva
  }, [user]);

  const lightStyles =
    "text-white/80 hover:text-white hover:bg-white/10 drop-shadow-sm";
  const darkStyles =
    "text-muted-foreground hover:text-foreground hover:bg-accent/50";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-16 flex items-center px-4 md:px-6 z-50 transition-all duration-300 ${
        isLightNav
          ? "bg-transparent backdrop-blur-sm border-b border-white/10"
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40"
      }`}
    >
      <div className="flex items-center justify-between lg:grid lg:grid-cols-3 w-full max-w-7xl mx-auto gap-3">
        {/* Logo */}
        <div className="flex items-center justify-self-start flex-shrink-0">
          <Link
            href="/"
            className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors duration-300 ${
              isLightNav ? "hover:bg-white/10" : "hover:bg-accent/50"
            }`}
          >
            <Volleyball
              className={`size-8 transition-colors duration-300 ${
                isLightNav ? "text-white drop-shadow-sm" : "text-primary"
              }`}
            />
            <span
              className={`text-xl font-bold tracking-tight hidden sm:block transition-colors duration-300 ${
                isLightNav ? "text-white drop-shadow-sm" : "text-foreground"
              }`}
            >
              HuddleUp
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex justify-center">
          <nav className="flex items-center gap-1">
            <Link
              href="/venues"
              className={`text-sm font-medium transition-colors duration-300 px-3 py-2 rounded-md ${
                isLightNav ? lightStyles : darkStyles
              }`}
            >
              Venues
            </Link>

            <Link
              href="/bookings"
              className={`text-sm font-medium transition-colors duration-300 px-3 py-2 rounded-md ${
                isLightNav ? lightStyles : darkStyles
              }`}
            >
              My Bookings
            </Link>

            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors duration-300 px-3 py-2 rounded-md ${
                isLightNav ? lightStyles : darkStyles
              }`}
            >
              Contact
            </Link>

            {/* Admin Links removed */}
          </nav>
        </div>

        {/* User Controls */}
        <div className="flex items-center justify-self-end gap-1.5">
          {/* Desktop User Controls — hide city picker and theme toggle on homepage */}
          <div className="hidden lg:flex items-center gap-1.5">
            {!isHome && city && <CitySwitcher currentCity={city} />}
            {!isHome && <ThemeToggleButton variant="circle-blur" start="top-right" />}
            <AuthStatus homepage={isLightNav} />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-1.5">
            {!isHome && city && <CitySwitcher currentCity={city} />}
            {!isHome && <ThemeToggleButton variant="circle-blur" start="top-right" />}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isLightNav ? "hover:bg-white/10" : "hover:bg-accent/50"
              }`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X
                  className={`h-5 w-5 transition-colors duration-300 ${
                    isLightNav ? "text-white drop-shadow-sm" : ""
                  }`}
                />
              ) : (
                <Menu
                  className={`h-5 w-5 transition-colors duration-300 ${
                    isLightNav ? "text-white drop-shadow-sm" : ""
                  }`}
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className={`lg:hidden absolute top-16 left-0 right-0 shadow-lg transition-all duration-300 ${
              isLightNav
                ? "bg-black/20 backdrop-blur-xl border-b border-white/10"
                : "bg-background border-b border-border/40"
            }`}
          >
            <nav className="flex flex-col p-4 space-y-1">
              <Link
                href="/venues"
                className={`text-sm font-medium transition-colors duration-300 px-3 py-2 rounded-md ${
                  isLightNav ? lightStyles : darkStyles
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Venues
              </Link>

              <Link
                href="/bookings"
                className={`text-sm font-medium transition-colors duration-300 px-3 py-2 rounded-md ${
                  isLightNav ? lightStyles : darkStyles
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                My Bookings
              </Link>

              <Link
                href="/contact"
                className={`text-sm font-medium transition-colors duration-300 px-3 py-2 rounded-md ${
                  isLightNav ? lightStyles : darkStyles
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Admin Links removed */}

              {/* Mobile Auth Status */}
              <div
                className={`pt-2 mt-2 border-t transition-all duration-300 ${
                  isLightNav ? "border-white/10" : "border-border/40"
                }`}
              >
                <AuthStatus homepage={isLightNav} />
              </div>
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
};