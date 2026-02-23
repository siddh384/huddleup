import Link from "next/link";
import { MdOutlineSportsVolleyball } from "react-icons/md";
import { ArrowUpRight } from "lucide-react";
import { Linkedin } from "lucide-react";
import { Github } from "lucide-react";
import { Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-6 sm:mb-8">
          {/* Left Side - Brand Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2">
              <MdOutlineSportsVolleyball className="size-6 sm:size-8 text-primary" />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                HuddleUp
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
              Find and book sports courts near you. Discover basketball, tennis,
              volleyball, and other sports facilities in your area with ease.
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="https://github.com"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-3 h-3 sm:w-4 sm:h-4" />
              </a>
              <a
                href="https://twitter.com"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-3 h-3 sm:w-4 sm:h-4" />
              </a>
              <a
                href="https://linkedin.com"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3 h-3 sm:w-4 sm:h-4" />
              </a>
            </div>
          </div>

          {/* Right Side - Navigation Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Quick Links */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link
                    href="/venues"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Browse Venues
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bookings"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    My Bookings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/create-venue"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    List Your Venue
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Profile
                  </Link>
                </li>
              </ul>
            </div>

            {/* Sports */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider">
                Sports
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link
                    href="/venues?sport=basketball"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Basketball Courts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/venues?sport=tennis"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Tennis Courts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/venues?sport=volleyball"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Volleyball Courts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/venues?sport=football"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Football Fields
                  </Link>
                </li>
                <li>
                  <Link
                    href="/venues"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    Explore more sports
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider">
                Support
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a
                    href="/contact"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2025 QuickCourt. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                Made with
                <span className="text-red-500 mx-1">♥</span>
                by Strawhats Team
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
