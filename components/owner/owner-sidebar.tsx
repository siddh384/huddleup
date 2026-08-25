"use client";

import {
  RiBuilding2Line,
  RiCalendarLine,
  RiDashboard2Line,
} from "@remixicon/react";
import {
  DashboardSidebar,
  type DashboardNavItem,
} from "@/components/shared/dashboard-sidebar";

// Nav lives in this client module because the icon references are functions,
// which cannot cross the server→client prop boundary from the layout.
const OWNER_NAV: DashboardNavItem[] = [
  {
    label: "Overview",
    href: "/owner-dashboard",
    icon: RiDashboard2Line,
    exact: true,
  },
  {
    label: "My Venues",
    href: "/owner-dashboard/venues",
    icon: RiBuilding2Line,
    exact: false,
  },
  {
    label: "Bookings",
    href: "/owner-dashboard/bookings",
    icon: RiCalendarLine,
    exact: false,
  },
];

export function OwnerSidebar({
  user,
}: {
  user: { name: string; email: string };
}) {
  return <DashboardSidebar navItems={OWNER_NAV} user={user} />;
}
