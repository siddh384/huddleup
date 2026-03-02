import { getCurrentUser } from "@/lib/actions/users";
import { CreateVenueForm } from "@/components/create-venue-form";
import { redirect } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

export default async function CreateVenuePage() {
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.user) {
    redirect("/signin");
  }

  // Check if user has facility_owner role
  if (
    userResult.user.role !== "facility_owner" &&
    userResult.user.role !== "admin"
  ) {
    return (
      <div className="container mx-auto py-8">
        <Alert className="max-w-2xl mx-auto">
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
    <div className="container mx-auto py-8">
      <CreateVenueForm />
    </div>
  );
}
