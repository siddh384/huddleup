"use client";

import {
  RiBuilding2Line,
  RiDashboard2Line,
  RiFlagLine,
  RiGroupLine,
} from "@remixicon/react";
import {
  DashboardSidebar,
  type DashboardNavItem,
} from "@/components/shared/dashboard-sidebar";

// Nav lives in this client module because the icon references are functions,
// which cannot cross the server→client prop boundary from the layout.
const ADMIN_NAV: DashboardNavItem[] = [
  {
    label: "Overview",
    href: "/admin-dashboard",
    icon: RiDashboard2Line,
    exact: true,
  },
  {
    label: "Users",
    href: "/admin-dashboard/users",
    icon: RiGroupLine,
    exact: false,
  },
  {
    label: "Venues",
    href: "/admin-dashboard/venues",
    icon: RiBuilding2Line,
    exact: false,
  },
  {
    label: "Reports",
    href: "/admin-dashboard/reports",
    icon: RiFlagLine,
    exact: false,
  },
];

export function AdminSidebar({
  user,
}: {
  user: { name: string; email: string };
}) {
  return <DashboardSidebar navItems={ADMIN_NAV} user={user} />;
}
