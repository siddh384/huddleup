"use client";

import { useState } from "react";
import { updateUserRole } from "@/lib/actions/users";
import { Button } from "@/components/base/buttons/button";
import { Select, SelectItem } from "@/components/base/select/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UserRoleUpdaterProps {
  userId: string;
  currentRole: string;
}

export function UserRoleUpdater({ userId, currentRole }: UserRoleUpdaterProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleUpdate = async () => {
    if (selectedRole === currentRole) {
      toast.error("Please select a different role");
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateUserRole(
        userId,
        selectedRole as "user" | "facility_owner" | "admin",
      );

      if (result.success) {
        toast.success(`User role updated to ${selectedRole}`);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to update user role");
        setSelectedRole(currentRole); // Reset selection
      }
    } catch (error) {
      toast.error("An error occurred while updating the role");
      setSelectedRole(currentRole); // Reset selection
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Select
        className="w-44"
        size="sm"
        selectedKey={selectedRole}
        onSelectionChange={(key) => {
          if (key !== null) setSelectedRole(String(key));
        }}
      >
        <SelectItem id="user">User</SelectItem>
        <SelectItem id="facility_owner">Facility Owner</SelectItem>
        <SelectItem id="admin">Admin</SelectItem>
      </Select>

      <Button
        onClick={handleRoleUpdate}
        disabled={isUpdating || selectedRole === currentRole}
        variant="secondary"
        size="small"
      >
        {isUpdating ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          "Update"
        )}
      </Button>
    </div>
  );
}
