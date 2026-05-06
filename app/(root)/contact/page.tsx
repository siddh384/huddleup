import { getCurrentUser } from "@/lib/actions/users";
import { getVenues } from "@/lib/actions/venues";
import { getUserReports } from "@/lib/actions/reports";
import { redirect } from "next/navigation";
import { ContactForm } from "@/components/contact-form";
import { UserReportsSection } from "@/components/user-reports-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText, AlertTriangle } from "lucide-react";

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
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <h1 className="text-4xl font-extrabold ml-4">Contact Us</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="report" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="report"
              className="flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report an Issue
            </TabsTrigger>
            <TabsTrigger
              value="my-reports"
              className="flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="w-4 h-4 mr-2" />
              My Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="report">
            <Card>
              <CardHeader>
                <CardTitle>Report a Venue Issue</CardTitle>
                <CardDescription>
                  Help us maintain quality by reporting any issues with venues
                  or services. Your feedback is important to us and helps
                  improve the platform for everyone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm
                  venues={venuesResult.success ? venuesResult.venues || [] : []}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-reports">
            <Card>
              <CardHeader>
                <CardTitle>Your Reports</CardTitle>
                <CardDescription>
                  View the status of your submitted reports and their resolution
                  progress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserReportsSection
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Information */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">General Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> support@quickcourt.com
                </p>
                <p>
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
                <p>
                  <strong>Hours:</strong> Mon-Fri 9AM-6PM EST
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Partnerships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> partnerships@quickcourt.com
                </p>
                <p>
                  <strong>Phone:</strong> +1 (555) 123-4568
                </p>
                <p>For venue owners and business collaborations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
