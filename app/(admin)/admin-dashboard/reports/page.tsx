import { getAllReports } from "@/lib/actions/reports";
import { ReportsTable } from "@/components/admin/reports-table";

export default async function AdminReportsPage() {
  const reportsResult = await getAllReports({ pageSize: 50 });

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
          ? {
              id: r.reporter.id,
              name: r.reporter.name ?? "Unknown",
              email: r.reporter.email ?? "",
            }
          : undefined,
        reportedVenue: r.reportedVenue
          ? {
              id: r.reportedVenue.id,
              name: r.reportedVenue.name,
              location: r.reportedVenue.location,
            }
          : undefined,
        reportedUser: r.reportedUser
          ? {
              id: r.reportedUser.id,
              name: r.reportedUser.name ?? "Unknown",
              email: r.reportedUser.email ?? "",
            }
          : undefined,
      }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      <ReportsTable reports={reports} />
    </div>
  );
}
