"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser, useSignOut } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { LogOutIcon, Settings, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserProfile({ className }: { className?: string }) {
  const [signingOut, setSigningOut] = useState(false);
  const { data: user, isLoading } = useCurrentUser();
  const { signOut } = useSignOut();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="size-10 md:size-14 aspect-square flex items-center justify-center p-3">
        <div className="size-4 md:size-8 rounded-full bg-muted/50 animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "aspect-square p-2 md:p-3",
            signingOut && "animate-pulse",
            className || "size-14",
          )}
          asChild
        >
          <Avatar>
            <AvatarImage
              src={user.image ?? ""}
              alt={user.name ?? ""}
              className="rounded-full"
            />
            <AvatarFallback className="rounded-full">
              {user.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[250px]">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <p className="font-medium leading-none">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <Settings className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        {/* Admin dashboard - only show for admin users */}
        {user.role === "admin" && (
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href="/admin-dashboard" className="flex items-center gap-2">
              <Settings className="size-4" />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {/* Facility Owner dashboard - only show for facility owners */}
        {user.role === "facility_owner" && (
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href="/owner-dashboard" className="flex items-center gap-2">
              <Building2 className="size-4" />
              Owner Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer w-full flex items-center justify-between gap-2"
          onClick={() =>
            signOut({
              fetchOptions: {
                onRequest: () => {
                  setSigningOut(true);
                  toast.loading("Signing out...");
                },
                onSuccess: () => {
                  setSigningOut(false);
                  toast.success("Signed out successfully");
                  toast.dismiss();
                  router.push("/");
                },
                onError: () => {
                  setSigningOut(false);
                  toast.error("Failed to sign out");
                },
              },
            })
          }
        >
          <span>Sign Out</span>
          <LogOutIcon className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
