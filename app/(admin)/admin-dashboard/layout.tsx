import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/users";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.user) {
    redirect("/sign-in");
  }

  if (userResult.user.role !== "admin") {
    redirect("/");
  }

  const user = {
    name: userResult.user.name,
    email: userResult.user.email,
  };

  return (
    <div className="flex min-h-screen bg-background-full">
      <div className="sticky top-0 hidden h-screen p-3 md:block">
        <AdminSidebar user={user} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
