import { getCurrentUser } from "@/lib/actions/users";
import { getVenues } from "@/lib/actions/venues";
import { getUserReports } from "@/lib/actions/reports";
import { redirect } from "next/navigation";
import { ContactTabs } from "@/components/contact-tabs";
import { Mail, Phone, Clock } from "lucide-react";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.user) {
    redirect("/auth/signin");
  }

  // Get user's reports and venues for the dropdown
  const [userReportsResult, venuesResult] = await Promise.all([
    getUserReports({ pageSize: 10 }),
    getVenues({ pageSize: 100, status: "approved" }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-title-1-bold mb-4">Contact Us</h1>

        <ContactTabs
          venues={venuesResult.success ? venuesResult.venues || [] : []}
          initialReports={
            userReportsResult.success
              ? userReportsResult.reports || []
              : []
          }
          pagination={
            userReportsResult.success
              ? userReportsResult.pagination
              : undefined
          }
        />

        {/* Contact Information */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-background-primary-default p-5 shadow-xs">
            <h2 className="text-title-3-semibold mb-3">
              General Inquiries
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-foreground-icon-secondary" />
                <span className="text-body-regular text-text-secondary">
                  support@quickcourt.com
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-foreground-icon-secondary" />
                <span className="text-body-regular text-text-secondary">
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-foreground-icon-secondary" />
                <span className="text-body-regular text-text-secondary">
                  Mon-Fri 9AM-6PM EST
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background-primary-default p-5 shadow-xs">
            <h2 className="text-title-3-semibold mb-3">
              Business Partnerships
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-foreground-icon-secondary" />
                <span className="text-body-regular text-text-secondary">
                  partnerships@quickcourt.com
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-foreground-icon-secondary" />
                <span className="text-body-regular text-text-secondary">
                  +1 (555) 123-4568
                </span>
              </div>
              <p className="text-body-2-regular text-text-tertiary">
                For venue owners and business collaborations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}