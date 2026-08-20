"use server";

import { getCurrentUser, getAllUsers } from "@/lib/actions/users";
import { getVenues } from "@/lib/actions/venues";
import { getAllReports, getReportsStats } from "@/lib/actions/reports";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.user) {
    redirect("/sign-in");
  }

  if (userResult.user.role !== "admin") {
    redirect("/");
  }

  // Fetch all data in parallel via server actions
  const [usersResult, venuesResult, reportsResult, reportsStatsResult] =
    await Promise.all([
      getAllUsers({ pageSize: 50 }),
      getVenues({ pageSize: 50 }),
      getAllReports({ pageSize: 50 }),
      getReportsStats(),
    ]);

  const users = usersResult.success
    ? (usersResult.users ?? []).map((u) => ({
        id: u.id,
        name: u.name ?? "Unknown",
        email: u.email ?? "",
        role: u.role as "user" | "facility_owner" | "admin",
        createdAt:
          u.createdAt instanceof Date
            ? u.createdAt.toISOString()
            : String(u.createdAt),
        profile: u.profile
          ? { phoneNumber: u.profile.phoneNumber ?? undefined, city: u.profile.city ?? undefined }
          : undefined,
      }))
    : [];

  const venues = venuesResult.success
    ? (venuesResult.venues ?? []).map((v) => ({
        id: v.id,
        name: v.name,
        location: v.location,
        status: v.status as "pending" | "approved" | "rejected",
        description: v.description ?? undefined,
        createdAt:
          v.createdAt instanceof Date
            ? v.createdAt.toISOString()
            : String(v.createdAt),
        owner: v.owner
          ? { id: v.owner.id, name: v.owner.name ?? "Unknown", email: v.owner.email ?? "" }
          : undefined,
        courts: v.courts,
      }))
    : [];

  const reports = reportsResult.success
    ? (reportsResult.reports ?? []).map((r) => ({
        id: r.id,
        reason: r.reason,
        description: r.description ?? undefined,
        status: r.status as "pending" | "resolved" | "dismissed",
        createdAt:
          r.createdAt instanceof Date
            ? r.createdAt.toISOString()
            : String(r.createdAt),
        reporter: r.reporter
          ? { id: r.reporter.id, name: r.reporter.name ?? "Unknown", email: r.reporter.email ?? "" }
          : undefined,
        reportedVenue: r.reportedVenue
          ? { id: r.reportedVenue.id, name: r.reportedVenue.name, location: r.reportedVenue.location }
          : undefined,
        reportedUser: r.reportedUser
          ? { id: r.reportedUser.id, name: r.reportedUser.name ?? "Unknown", email: r.reportedUser.email ?? "" }
          : undefined,
      }))
    : [];

  // Compute stats server-side
  const adminStats = {
    totalUsers: users.length,
    facilityOwners: users.filter((u) => u.role === "facility_owner").length,
    admins: users.filter((u) => u.role === "admin").length,
    pendingVenues: venues.filter((v) => v.status === "pending").length,
    pendingReports: reportsStatsResult.success
      ? reportsStatsResult.stats?.pending ?? 0
      : 0,
    recentReports: reportsStatsResult.success
      ? reportsStatsResult.stats?.recentReports ?? 0
      : 0,
  };

  return (
    <AdminDashboardClient
      adminStats={adminStats}
      initialUsers={users}
      initialVenues={venues}
      initialReports={reports}
    />
  );
}
