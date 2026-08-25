import { getVenueById, getAllSports } from "@/lib/actions/venues";
import { getCurrentUser } from "@/lib/actions/users";
import { redirect, notFound } from "next/navigation";
import { RiArrowLeftLine } from "@remixicon/react";
import { ButtonLink } from "@/components/base/buttons/button";
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

  if (
    venue.ownerId !== userResult.user.id &&
    userResult.user.role !== "admin"
  ) {
    redirect(`/venues/${venue.id}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-8">
        <ButtonLink
          href={`/venues/${venue.id}`}
          variant="secondary"
          size="small"
          leadingIcon={RiArrowLeftLine}
          className="mb-3"
        >
          Back to Venue
        </ButtonLink>
        <h1 className="text-display-4-semibold text-text-primary">Edit Venue</h1>
        <p className="text-body-regular text-text-secondary mt-1">
          Update your venue details
        </p>
      </div>

      <EditVenueForm venue={venue} />
    </div>
  );
}