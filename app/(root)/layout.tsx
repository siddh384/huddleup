import { HomeNavbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { getUserCity } from "@/lib/actions/cities";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const city = await getUserCity();

  return (
    <>
      <HomeNavbar city={city} />
      <main className="flex-1 pt-16 min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </>
  );
}
