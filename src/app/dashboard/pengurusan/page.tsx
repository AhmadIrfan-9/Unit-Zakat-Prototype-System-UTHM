// src/app/dashboard/pengurusan/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchManagementAnalyticsDashboardData } from "@/app/actions/zakatSalaryDeductionManagementServerActions";
import { ZakatManagementAnalyticsDashboardComponent } from "@/components/zakat/ZakatManagementAnalyticsDashboardComponent";
import Link from "next/link";
import Image from "next/image";
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

  return (
    // Renders the main dashboard container with a soft navy tint background.
    <div className="min-h-screen bg-linear-to-b from-[#002060]/5 to-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header container displaying branding stack and navigation controls */}
        <div className="mb-8 space-y-4">
          
          {/* Stacked UTHM and Zakat UTHM branding logos aligned on the left */}
          <div className="flex flex-col items-center sm:items-start gap-3 mb-6">
            <Image
              src="/image_bb5246.png"
              alt="Logo UTHM"
              width={240}
              height={80}
              className="h-16 w-auto object-contain"
              priority
            />
            <Image
              src="/image_bb546b.png"
              alt="Logo Zakat UTHM"
              width={180}
              height={60}
              className="h-10 w-auto object-contain mt-2"
              priority
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Title heading with the institutional icon */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#002060] shadow-sm">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  Portal Pengurusan Zakat Gaji UTHM
                </h1>
                <p className="text-xs text-muted-foreground font-semibold">
                  Sistem Kebenaran Potongan Gaji Kakitangan
                </p>
              </div>
            </div>

            {/* Link back to the staff application form view */}
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/zakat"
                className="inline-flex items-center justify-center px-4 py-2 border border-border rounded-lg text-xs font-bold text-foreground bg-white hover:bg-muted/40 transition-all cursor-pointer shadow-xs"
              >
                &larr; Borang Permohonan
              </Link>
            </div>
          </div>

          {/* Active administrator context display panel */}
          <div className="rounded-lg border border-[#002060]/20 bg-[#002060]/5 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-[#002060] font-bold">
              Pengguna Pentadbir: {session.user.name || session.user.email} (No. Pekerja: {session.user.noPekerja || "PENTADBIR"})
            </p>
            <Link href="/api/auth/signout" className="text-xs font-bold text-[#002060] hover:underline">
              Log Keluar
            </Link>
          </div>
        </div>

        {/* Core management workspace component hosting tables and graphs */}
        <ZakatManagementAnalyticsDashboardComponent
          stats={data.stats}
          chartData={data.chartData}
          applications={data.applications}
        />

        {/* Corporate footer details block */}
        <footer className="mt-12 text-center space-y-1">
          <p className="text-[11px] text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} Universiti Tun Hussein Onn Malaysia. Hak Cipta Terpelihara.
          </p>
          <p className="text-[10px] text-muted-foreground/50">
            Bahagian Pembangunan Aplikasi Portal Eksekutif UTHM
          </p>
        </footer>

      </div>
    </div>
  );
}
