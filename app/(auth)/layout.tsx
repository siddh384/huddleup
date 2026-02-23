import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggler from "@/context/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between h-screen">
      <div className="hidden lg:block lg:w-1/2 h-full bg-black relative">
        <Image
          src="/image2.png"
          alt="auth-bg"
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
      </div>
      <div className="w-full lg:w-1/2 h-full flex flex-col px-2 md:px-0">
        {/* Top navigation for auth side only */}
        <div className="flex justify-between items-center p-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <ThemeToggler className="size-10" />
        </div>

        {/* Auth content */}
        <div className="flex-1 flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
