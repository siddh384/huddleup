"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Chip } from "@/components/base/badges/chip";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { UserRoleUpdater } from "@/components/user-role-updater";
import { formatDate, type UserData } from "@/components/admin/types";

const userColumns: ColumnDef<UserData>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Chip
          variant="caption"
          color={
            role === "admin"
              ? "purple"
              : role === "facility_owner"
                ? "blue"
                : "neutral"
          }
        >
          {role.replace("_", " ")}
        </Chip>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <UserRoleUpdater userId={row.original.id} currentRole={row.original.role} />
    ),
  },
];

export function UsersTable({ users }: { users: UserData[] }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="px-6 py-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-base text-muted-foreground">
            Manage user roles and permissions across the platform
          </p>
        </div>
        <DataTable
          columns={userColumns}
          data={users}
          filterColumn="name"
          filterPlaceholder="Filter users by name..."
          label="Users"
        />
      </CardContent>
    </Card>
  );
}
