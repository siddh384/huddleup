"use client";

import { useState } from "react";
import { PillTabList, PillTab } from "@/components/base/tabs/pill-tab";
import { AlertTriangle, FileText } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { UserReportsSection } from "@/components/user-reports-section";

interface ContactTabsProps {
  venues: { id: string; name: string; location: string }[];
  initialReports: {
    id: string;
    reason: string;
    description: string | null;
    status: string | null;
    createdAt: Date | string;
    reportedVenue?: {
      id: string;
      name: string;
      location: string;
    } | null;
    reportedUser?: {
      id: string;
      name: string;
    } | null;
  }[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export function ContactTabs({
  venues,
  initialReports,
  pagination,
}: ContactTabsProps) {
  const [tab, setTab] = useState<"report" | "reports">("report");

  return (
    <div>
      <PillTabList className="mb-5">
        <PillTab
          variant="gray"
          icon={AlertTriangle}
          isSelected={tab === "report"}
          onSelect={() => setTab("report")}
        >
          Report an Issue
        </PillTab>
        <PillTab
          variant="gray"
          icon={FileText}
          isSelected={tab === "reports"}
          onSelect={() => setTab("reports")}
        >
          My Reports
        </PillTab>
      </PillTabList>

      {tab === "report" ? (
        <div className="rounded-3xl border border-border bg-background-primary-default p-5 shadow-xs">
          <ContactForm venues={venues} />
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-background-primary-default p-5 shadow-xs">
          <UserReportsSection
            initialReports={initialReports}
            pagination={pagination}
          />
        </div>
      )}
    </div>
  );
}