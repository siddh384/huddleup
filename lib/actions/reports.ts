"use server";

import { eq, desc, asc, and, or, sql } from "drizzle-orm";
import { reports, user, venues } from "@/db/schema";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/actions/users";
import { revalidatePath } from "next/cache";

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

// Create a new report
export async function createReport(reportData: {
  reportedVenueId?: string;
  reportedUserId?: string;
  reason: string;
  description?: string;
}) {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Validate that at least one target is specified
    if (!reportData.reportedVenueId && !reportData.reportedUserId) {
      return {
        success: false,
        error: "Must specify either a venue or user to report",
      };
    }

    // Create the report
    const [newReport] = await db
      .insert(reports)
      .values({
        reporterId: userResult.user.id,
        reportedUserId: reportData.reportedUserId || null,
        reportedVenueId: reportData.reportedVenueId || null,
        reason: reportData.reason,
        description: reportData.description,
        status: "pending",
      })
      .returning();

    revalidatePath("/admin");
    revalidatePath("/contact");

    return { success: true, report: newReport };
  } catch (error) {
    console.error("Error creating report:", error);
    return { success: false, error: "Failed to create report" };
  }
}

// Get all reports with related data (admin only)
export async function getAllReports(
  options: {
    page?: number;
    pageSize?: number;
    status?: "pending" | "resolved" | "dismissed";
    sortBy?: "createdAt" | "status" | "reason";
    sortOrder?: "asc" | "desc";
  } = {},
) {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Check if user is admin
    if (userResult.user.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    const {
      page = 1,
      pageSize = 20,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(reports.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Build order clause
    const orderColumn = reports[sortBy];
    const orderClause =
      sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);

    // Get reports with related data
    const reportsData = await db.query.reports.findMany({
      where: whereClause,
      orderBy: orderClause,
      limit: pageSize,
      offset: offset,
      with: {
        reporter: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        reportedUser: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        reportedVenue: {
          columns: {
            id: true,
            name: true,
            location: true,
            status: true,
          },
        },
        resolvedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(whereClause);

    const totalPages = Math.ceil(count / pageSize);

    return {
      success: true,
      reports: reportsData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        pageSize,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching reports:", error);
    return { success: false, error: "Failed to fetch reports" };
  }
}

// Get a single report by ID (admin only)
export async function getReportById(reportId: string) {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Check if user is admin
    if (userResult.user.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    const report = await db.query.reports.findFirst({
      where: eq(reports.id, reportId),
      with: {
        reporter: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        reportedUser: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        reportedVenue: {
          columns: {
            id: true,
            name: true,
            location: true,
            status: true,
            description: true,
          },
        },
        resolvedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return { success: false, error: "Report not found" };
    }

    return { success: true, report };
  } catch (error) {
    console.error("Error fetching report:", error);
    return { success: false, error: "Failed to fetch report" };
  }
}

// Update report status (admin only)
export async function updateReportStatus(
  reportId: string,
  status: "pending" | "resolved" | "dismissed",
  resolution?: string,
) {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Check if user is admin
    if (userResult.user.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      status,
    };

    if (status === "resolved" || status === "dismissed") {
      updateData.resolvedBy = userResult.user.id;
      updateData.resolvedAt = new Date();
    }

    const [updatedReport] = await db
      .update(reports)
      .set(updateData)
      .where(eq(reports.id, reportId))
      .returning();

    if (!updatedReport) {
      return { success: false, error: "Report not found" };
    }

    revalidatePath("/admin");

    return { success: true, report: updatedReport };
  } catch (error) {
    console.error("Error updating report status:", error);
    return { success: false, error: "Failed to update report status" };
  }
}

// Get reports statistics (admin only)
export async function getReportsStats() {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    // Check if user is admin
    if (userResult.user.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    // Get total counts by status
    const [stats] = await db
      .select({
        total: sql<number>`count(*)`,
        pending: sql<number>`count(*) filter (where status = 'pending')`,
        resolved: sql<number>`count(*) filter (where status = 'resolved')`,
        dismissed: sql<number>`count(*) filter (where status = 'dismissed')`,
      })
      .from(reports);

    // Get recent reports (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentStats] = await db
      .select({
        recentReports: sql<number>`count(*)`,
      })
      .from(reports)
      .where(sql`created_at >= ${sevenDaysAgo}`);

    return {
      success: true,
      stats: {
        ...stats,
        ...recentStats,
      },
    };
  } catch (error) {
    console.error("Error fetching reports stats:", error);
    return { success: false, error: "Failed to fetch reports statistics" };
  }
}

// Get user's own reports
export async function getUserReports(
  options: {
    page?: number;
    pageSize?: number;
  } = {},
) {
  try {
    const userResult = await getCurrentUser();

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "No authenticated user found" };
    }

    const { page = 1, pageSize = 10 } = options;
    const offset = (page - 1) * pageSize;

    const userReports = await db.query.reports.findMany({
      where: eq(reports.reporterId, userResult.user.id),
      orderBy: desc(reports.createdAt),
      limit: pageSize,
      offset: offset,
      with: {
        reportedVenue: {
          columns: {
            id: true,
            name: true,
            location: true,
          },
        },
        reportedUser: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(eq(reports.reporterId, userResult.user.id));

    const totalPages = Math.ceil(count / pageSize);

    return {
      success: true,
      reports: userReports,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        pageSize,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching user reports:", error);
    return { success: false, error: "Failed to fetch your reports" };
  }
}
