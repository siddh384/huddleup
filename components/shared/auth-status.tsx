"use client";

import { Button } from "@/components/ui/button";
import { UserProfile } from "./user-profile";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthStatusProps {
  className?: string;
  homepage?: boolean;
}

export function AuthStatus({ className, homepage }: AuthStatusProps) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="size-9 rounded-full bg-muted/50 animate-pulse"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <UserProfile className="size-9" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {homepage ? (
        <Button
          variant="outline"
          size="sm"
          asChild
          className="border-white/30 text-white/90 hover:bg-white/10 hover:text-white"
        >
          <Link href="/sign-in">Sign In</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      )}
    </div>
  );
}
