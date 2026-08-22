import { getCurrentUser } from "@/lib/actions/users";
import { CreateVenueForm } from "@/components/create-venue-form";
import { redirect } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import {
  RiBasketballLine,
  RiBuildingLine,
  RiImageLine,
  RiMapPinLine,
  RiShieldStarLine,
} from "@remixicon/react";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

const sections = [
  { icon: RiBuildingLine, label: "Venue details", description: "Name, city, and description" },
  { icon: RiMapPinLine, label: "Location", description: "Address, area, and amenities" },
  { icon: RiBasketballLine, label: "Sports", description: "Which sports are available" },
  { icon: RiImageLine, label: "Photos", description: "Upload venue images" },
];

export default async function CreateVenuePage() {
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.user) {
    redirect("/sign-in");
  }

  // Check if user has facility_owner role
  if (
    userResult.user.role !== "facility_owner" &&
    userResult.user.role !== "admin"
  ) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You need to have a facility owner role to create venues. Please
            contact an administrator to upgrade your account.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Create a venue</h1>
        <p className="text-lg text-muted-foreground">
          List your sports facility on HuddleUp. It goes live after a quick
          admin review.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-20">
          <Card className="border-0 py-0 shadow-lg">
            <CardContent className="p-5">
              <h2 className="mb-4 text-headline-semibold">Form sections</h2>
              <ul className="space-y-1">
                {sections.map(({ icon: Icon, label, description }, i) => (
                  <li
                    key={label}
                    className="flex items-start gap-3 rounded-lg px-3 py-2.5"
                  >
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-background-tertiary-default">
                      <Icon className="size-4 text-text-secondary" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-body-2-medium">{label}</p>
                      <p className="text-caption-1-regular text-muted-foreground">
                        {description}
                      </p>
                    </div>
                    <span className="ml-auto shrink-0 text-caption-1-regular text-muted-foreground">
                      {i + 1}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 py-0 shadow-lg">
            <CardContent className="flex items-start gap-3 p-5">
              <RiShieldStarLine className="mt-0.5 size-5 shrink-0 text-text-secondary" />
              <div>
                <p className="text-body-2-medium">Admin review</p>
                <p className="text-caption-1-regular text-muted-foreground">
                  Every venue is reviewed before going live. You will be
                  notified once it is approved.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Form */}
        <div className="min-w-0">
          <CreateVenueForm />
        </div>
      </div>
    </div>
  );
}
