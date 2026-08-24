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
      <div className="size-9 aspect-square flex items-center justify-center">
        <div className="size-5 rounded-full bg-muted/50 animate-pulse"></div>
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
          size="icon"
          className={cn(
            "rounded-full overflow-hidden",
            signingOut && "animate-pulse",
            className,
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
      <DropdownMenuContent
        className="w-[220px] rounded-[18px] p-1.5"
        sideOffset={8}
        align="end"
        side="bottom"
      >
        <div className="px-2.5 pb-1 pt-2.5 flex flex-col gap-0.5">
          <p className="text-sm font-medium leading-tight text-foreground">
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <Settings className="size-3.5" />
            Profile
          </Link>
        </DropdownMenuItem>

        {/* Admin dashboard - only show for admin users */}
        {user.role === "admin" && (
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href="/admin-dashboard" className="flex items-center gap-2">
              <Settings className="size-3.5" />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {/* Facility Owner dashboard - only show for facility owners */}
        {user.role === "facility_owner" && (
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href="/owner-dashboard" className="flex items-center gap-2">
              <Building2 className="size-3.5" />
              Owner Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          className="cursor-pointer w-full flex items-center justify-between gap-2 text-destructive/70 hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive [&_svg]:text-destructive/70"
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
          <LogOutIcon className="size-3.5" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
