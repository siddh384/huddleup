import { HomeNavbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HomeNavbar />
      <main className="flex-1 pt-16 min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </>
  );
}
