// src/app/dashboard/pengurusan/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchManagementAnalyticsDashboardData } from "@/app/actions/zakatSalaryDeductionManagementServerActions";
import { ZakatManagementDashboardMasterViewComponent } from "@/components/zakat/ZakatManagementDashboardMasterViewComponent";
import type { Metadata } from "next";

// Define meta details for the administrative management dashboard portal.
export const metadata: Metadata = {
  title: "Dashboard Pengurusan | Sistem Caruman Zakat Gaji UTHM",
  description: "Uruskan permohonan potongan zakat kakitangan UTHM dan analisis data caruman bulanan.",
};

// This server component verifies user management roles and renders the analytics interface framework.
export default async function ManagementDashboardPage() {
  // Confirm that the user session is active and authenticated before rendering page templates.
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Restrict access exclusively to members of the management staff.
  if (session.user.role !== "MANAGEMENT_STAFF") {
    redirect("/dashboard/zakat");
  }

  // Retrieve analytical collection sums and workflow listings from database resources.
  const data = await fetchManagementAnalyticsDashboardData();

  // Create a structured user session object for identity representation.
  const formattedUser = {
    name: session.user.name,
    email: session.user.email,
    noPekerja: session.user.noPekerja,
    role: session.user.role,
  };

  return (
    // Renders the executive management dashboard layout wrapper.
    <ZakatManagementDashboardMasterViewComponent
      stats={data.stats}
      chartData={data.chartData}
      applications={data.applications}
      user={formattedUser}
    />
  );
}
