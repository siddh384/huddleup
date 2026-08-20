import { getVenueById } from "@/lib/actions/venues";
import { getCurrentUser } from "@/lib/actions/users";
import { redirect, notFound } from "next/navigation";
import { EditVenueForm } from "@/components/edit-venue-form";

export const dynamic = "force-dynamic";

interface EditVenuePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditVenuePage({ params }: EditVenuePageProps) {
  const resolvedParams = await params;

  const userResult = await getCurrentUser();
  if (!userResult.success || !userResult.user) {
    redirect("/sign-in");
  }

  const venueResult = await getVenueById(resolvedParams.id);

  if (!venueResult.success || !venueResult.venue) {
    notFound();
  }

  const venue = venueResult.venue;

  // Check if user owns this venue or is admin
  if (
    venue.ownerId !== userResult.user.id &&
    userResult.user.role !== "admin"
  ) {
    redirect(`/venues/${venue.id}`);
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Venue</h1>
        <p className="text-muted-foreground">
          Update your venue details
        </p>
      </div>

      <EditVenueForm venue={venue} />
    </div>
  );
}
