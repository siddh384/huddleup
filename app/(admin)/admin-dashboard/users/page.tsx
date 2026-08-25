import { getAllUsers } from "@/lib/actions/users";
import { UsersTable } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const usersResult = await getAllUsers({ pageSize: 50 });

  const users = usersResult.success
    ? (usersResult.users ?? []).map((u) => ({
        id: u.id,
        name: u.name ?? "Unknown",
        email: u.email ?? "",
        role: u.role as "user" | "facility_owner" | "admin",
        createdAt:
          u.createdAt instanceof Date
            ? u.createdAt.toISOString()
            : String(u.createdAt),
        profile: u.profile
          ? {
              phoneNumber: u.profile.phoneNumber ?? undefined,
              city: u.profile.city ?? undefined,
            }
          : undefined,
      }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Users</h1>
      <UsersTable users={users} />
    </div>
  );
}
