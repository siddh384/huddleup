import { getCurrentUser, getUserStats } from "@/lib/actions/users";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Building2,
  Star,
  Bell,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { ProfileForm } from "@/components/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.user) {
    redirect("/sign-in");
  }

  const currentUser = userResult.user;
  const profile = currentUser.profile;

  const statsResult = await getUserStats();
  const stats = statsResult.success ? statsResult.stats : null;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and view your activity
        </p>
      </div>

      <div className="grid gap-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {currentUser.image ? (
                <img
                  src={currentUser.image}
                  alt={currentUser.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{currentUser.name}</h2>
                <p className="text-muted-foreground">{currentUser.email}</p>
                <Badge variant="outline" className="mt-1">
                  <Shield className="h-3 w-3 mr-1" />
                  {currentUser.role.replace("_", " ")}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span>{currentUser.email}</span>
              </div>
              {profile?.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
              {profile?.city && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span>
                    {profile.city}
                    {profile.state ? `, ${profile.state}` : ""}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined:</span>
                <span>{format(new Date(currentUser.createdAt), "MMM dd, yyyy")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <CreditCard className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
              <p className="text-xs text-muted-foreground">Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Building2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats?.venuesOwned || 0}</div>
              <p className="text-xs text-muted-foreground">Venues Owned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{stats?.reviewsGiven || 0}</div>
              <p className="text-xs text-muted-foreground">Reviews Given</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Bell className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{stats?.unreadNotifications || 0}</div>
              <p className="text-xs text-muted-foreground">Unread Notifications</p>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile Form */}
        <ProfileForm
          user={currentUser}
          profile={profile ?? null}
        />
      </div>
    </div>
  );
}
