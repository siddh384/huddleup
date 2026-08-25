import React from "react";
import { getVenueById, getAllSports } from "@/lib/actions/venues";
import { getVenueCourts } from "@/lib/actions/courts";
import { getCurrentUser } from "@/lib/actions/users";
import { RiArrowLeftLine } from "@remixicon/react";
import { ButtonLink } from "@/components/base/buttons/button";
import { notFound, redirect } from "next/navigation";
import { CourtForm } from "@/components/court-form";
import { CourtsTable } from "@/components/courts-table";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

interface CourtsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const CourtsPage = async ({ params }: CourtsPageProps) => {
  const resolvedParams = await params;
  const venueId = resolvedParams.id;

  const userResult = await getCurrentUser();
  if (!userResult.success || !userResult.user) {
    redirect("/sign-in");
  }

  const venueResult = await getVenueById(venueId);
  if (!venueResult.success || !venueResult.venue) {
    notFound();
  }

  const venue = venueResult.venue;

  if (
    venue.ownerId !== userResult.user.id &&
    userResult.user.role !== "admin"
  ) {
    redirect("/venues");
  }

  const [courtsResult, sportsResult] = await Promise.all([
    getVenueCourts(venueId),
    getAllSports(),
  ]);

  if (!courtsResult.success) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="text-center">
          <p className="text-text-primary">
            Error loading courts: {courtsResult.error}
          </p>
        </div>
      </div>
    );
  }

  if (!sportsResult.success) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="text-center">
          <p className="text-text-primary">
            Error loading sports: {sportsResult.error}
          </p>
        </div>
      </div>
    );
  }

  const courts = courtsResult.courts || [];
  const availableSports = sportsResult.sports || [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      {/* Page Header — full-width */}
      <div className="mb-14">
        <ButtonLink
          href={`/venues/${venueId}`}
          variant="secondary"
          size="small"
          leadingIcon={RiArrowLeftLine}
          className="mb-3"
        >
          Back to Venue
        </ButtonLink>
        <h1 className="text-display-4-semibold text-text-primary">
          Manage Courts
        </h1>
        <p className="text-body-regular text-text-secondary mt-1">
          {venue.name} · {courts.length} court
          {courts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Two-column layout with divider */}
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[30fr_70fr]">
        {/* Left Column — Add New Court */}
        {availableSports.length > 0 && (
          <div className="lg:pr-10 lg:border-r lg:border-border">
            <h2 className="text-title-3-semibold text-text-primary mb-5">
              Add New Court
            </h2>
            <CourtForm venueId={venueId} availableSports={availableSports} />
          </div>
        )}

        {/* Right Column — Courts */}
        <div className="lg:pl-10">
          <h2 className="text-title-3-semibold text-text-primary mb-5">
            Courts ({courts.length})
          </h2>
          {courts.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-body-regular text-text-tertiary">
                No courts created yet
              </p>
            </div>
          ) : (
            <CourtsTable
              courts={courts.map((court) => ({
                ...court,
                isActive: court.isActive ?? false,
              }))}
              availableSports={availableSports}
              venueId={venueId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CourtsPage;