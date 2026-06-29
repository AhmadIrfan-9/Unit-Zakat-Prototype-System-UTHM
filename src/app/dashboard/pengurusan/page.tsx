import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchManagementAnalyticsDashboardData } from "@/app/actions/zakatSalaryDeductionManagementServerActions";
import { ZakatManagementDashboardMasterViewComponent } from "@/components/zakat/ManagementDashboard";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// This metadata block configures the browser tab title and description for the management analytics portal.
export const metadata: Metadata = {
  title: "Dashboard Pengurusan | Sistem Caruman Zakat Gaji UTHM",
  description:
    "Uruskan permohonan potongan zakat kakitangan UTHM dan analisis data caruman bulanan.",
};

// This server component verifies user management roles and renders the analytics interface framework.
export default async function ManagementDashboardPage() {
  // This guard redirects unauthenticated requests to the login page before any data is fetched.
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Halang akses jika pengguna bukan ZAKAT_OFFICER atau SUPER_ADMIN — redirect ke portal kakitangan.
  if (session.user.role !== "ZAKAT_OFFICER" && session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard/zakat");
  }

  // Tarik data analisis dan permohonan secara selari
  const [data, allNews] = await Promise.all([
    fetchManagementAnalyticsDashboardData(),
    prisma.news.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // This object constructs a type-safe, null-coalesced session identity record to prevent hook dependency array size shifts in child components.
  const formattedUser = {
    name:      session?.user?.name      ?? "",
    email:     session?.user?.email     ?? "",
    noPekerja: session?.user?.noPekerja ?? "",
    role:      session?.user?.role      ?? "ZAKAT_OFFICER",
  };

  return (
    // This component mounts the full executive management workspace including the single-ribbon navbar and analytics panels.
    <ZakatManagementDashboardMasterViewComponent
      stats={data.stats}
      chartData={data.chartData}
      applications={data.applications}
      user={formattedUser}
      allNews={allNews}
    />
  );
}
