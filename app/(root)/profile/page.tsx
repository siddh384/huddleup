import { getCurrentUser, getUserStats } from "@/lib/actions/users";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/base/avatar/avatar";
import { Chip } from "@/components/base/badges/chip";
import {
  RiBuilding2Line,
  RiCalendarCheckLine,
  RiCalendarLine,
  RiMailLine,
  RiMapPinLine,
  RiNotification3Line,
  RiPhoneLine,
  RiStarLine,
} from "@remixicon/react";
import type { ComponentType } from "react";
import { format } from "date-fns";
import { ProfileForm } from "@/components/profile-form";

export const dynamic = "force-dynamic";

const roleChipColor = {
  admin: "blue",
  facility_owner: "purple",
  user: "neutral",
} as const;

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function ProfilePage() {
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.user) {
    redirect("/sign-in");
  }

  const currentUser = userResult.user;
  const profile = currentUser.profile;

  const statsResult = await getUserStats();
  const stats = statsResult.success ? statsResult.stats : null;

  const detailRows: Array<{
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: string;
  }> = [
    { icon: RiMailLine, label: "Email", value: currentUser.email },
    ...(profile?.phoneNumber
      ? [{ icon: RiPhoneLine, label: "Phone", value: profile.phoneNumber }]
      : []),
    ...(profile?.city
      ? [
          {
            icon: RiMapPinLine,
            label: "Location",
            value: profile.state
              ? `${profile.city}, ${profile.state}`
              : profile.city,
          },
        ]
      : []),
    {
      icon: RiCalendarLine,
      label: "Member since",
      value: format(new Date(currentUser.createdAt), "MMM dd, yyyy"),
    },
  ];

  const statTiles: Array<{
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: number;
  }> = [
    {
      icon: RiCalendarCheckLine,
      label: "Bookings",
      value: stats?.totalBookings ?? 0,
    },
    { icon: RiBuilding2Line, label: "Venues owned", value: stats?.venuesOwned ?? 0 },
    { icon: RiStarLine, label: "Reviews given", value: stats?.reviewsGiven ?? 0 },
    {
      icon: RiNotification3Line,
      label: "Unread alerts",
      value: stats?.unreadNotifications ?? 0,
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">My profile</h1>
        <p className="text-lg text-muted-foreground">
          Manage your account settings and see your activity at a glance.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        {/* Account summary rail */}
        <aside className="space-y-6 lg:sticky lg:top-20">
          <Card className="border-0 py-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar
                  size="lg"
                  className="size-14 text-title-2-semibold"
                  src={currentUser.image ?? undefined}
                  alt={currentUser.name}
                  initials={initialsOf(currentUser.name)}
                />
                <div className="min-w-0">
                  <h2 className="truncate text-title-2-semibold">
                    {currentUser.name}
                  </h2>
                  <Chip
                    variant="caption"
                    color={
                      roleChipColor[
                        currentUser.role as keyof typeof roleChipColor
                      ] ?? "neutral"
                    }
                    className="mt-1 capitalize"
                  >
                    {currentUser.role.replace("_", " ")}
                  </Chip>
                </div>
              </div>

              <div className="mt-6 space-y-3.5 border-t pt-6">
                {detailRows.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background-tertiary-default">
                      <Icon className="size-4 text-text-secondary" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-caption-1-regular text-muted-foreground">
                        {label}
                      </p>
                      <p className="truncate text-body-2-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 py-0 shadow-lg">
            <CardContent className="grid grid-cols-2 gap-3 p-5">
              {statTiles.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1.5 rounded-2lg bg-background-secondary-default p-4"
                >
                  <Icon className="size-5 text-text-secondary" />
                  <span className="text-title-2-bold">{value}</span>
                  <span className="text-caption-1-regular text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Edit form */}
        <div className="min-w-0">
          <ProfileForm user={currentUser} profile={profile ?? null} />
        </div>
      </div>
    </div>
  );
}
