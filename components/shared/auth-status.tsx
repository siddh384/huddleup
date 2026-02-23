"use client";

import { Button } from "@/components/ui/button";
import { UserProfile } from "./user-profile";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthStatusProps {
  className?: string;
}

export function AuthStatus({ className }: AuthStatusProps) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="size-9 md:size-10 rounded-full bg-muted/50 animate-pulse"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <UserProfile className="size-8 md:size-12" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button variant="outline" size="sm" asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
    </div>
  );
}
