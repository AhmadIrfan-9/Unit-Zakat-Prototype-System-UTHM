import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SystemDashboardClient from "@/components/admin/SystemDashboardClient";
import AuditLogTableClient from "@/components/admin/AuditLogTableClient";
import UserVerificationTable from "@/components/zakat/UserVerificationTable";
import AdminProfileDropdownClient from "@/components/admin/AdminProfileDropdownClient";
import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portal Pentadbir Utama | Sistem Zakat UTHM",
  description: "Sistem Caruman Zakat Gaji UTHM • Panel Kawal Selia Infrastruktur & Keselamatan",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

// 1. Loading Skeletons for Core Web Vitals Optimization
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-gray-200 rounded-2xl border" />
        <div className="h-32 bg-gray-200 rounded-2xl border" />
        <div className="h-32 bg-gray-200 rounded-2xl border" />
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl border" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-gray-200 rounded-lg w-1/3" />
      <div className="h-64 bg-gray-200 rounded-2xl border" />
    </div>
  );
}

// 2. Server Component Wrapper for the System Dashboard
async function SystemDashboardWrapper({ user }: { user: { name: string; email: string; role: string } }) {
  // Connection check ke Database
  let dbOnline = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOnline = true;
  } catch (e) {
    dbOnline = false;
  }

  // Email setup status check
  const emailConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER);

  // Vercel deployment status
  const isVercel = !!process.env.VERCEL;

  // Statistics snapshot in parallel (optimized for speed)
  const [totalUsers, totalApplications, inactiveUsers] = await Promise.all([
    prisma.user.count(),
    prisma.zakatStaffSalaryDeductionApplication.count(),
    prisma.user.count({
      where: {
        zakatStaffSalaryDeductions: {
          none: {},
        },
      },
    }),
  ]);

  return (
    <SystemDashboardClient
      dbOnline={dbOnline}
      emailConfigured={emailConfigured}
      isVercel={isVercel}
      stats={{
        totalUsers,
        totalApplications,
        inactiveUsers,
      }}
      user={user}
    />
  );
}

// 3. Server Component Wrapper for the Audit Logs (using selective select and take: 50)
async function AuditLogsWrapper() {
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      userId: true,
      userEmail: true,
      action: true,
      details: true,
      ipAddress: true,
      createdAt: true,
    },
  });

  return <AuditLogTableClient initialLogs={auditLogs} />;
}

export default async function AdminSystemPage({ searchParams }: PageProps) {
  const session = await auth();
  const { tab = "health" } = await searchParams;

  // DINDING PERTAHANAN: Hanya SUPER_ADMIN sahaja boleh masuk
  if (!session?.user?.id || session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard/zakat?tab=info");
  }

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-12 font-sans">
      
      {/* 1. TOP NAVBAR: Latar belakang putih bersih (Tepat sepadan dengan Screenshot 3 & 4) */}
      {/* Enforcing standardized corporate topbar structure with integrated horizontal navigation tabs. */}
      <header className="w-full bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-50">
        
        {/* Kiri: Logo UTHM Korporat */}
        <div className="flex items-center gap-3 animate-in fade-in duration-300">
          <img src="/6232c1fe-be22-4a39-89b1-0eb508f91e72.png" alt="UTHM Logo" className="h-7 w-auto select-none" />
          <div className="w-px h-5 bg-gray-200" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Portal Pentadbir Utama</span>
        </div>

        {/* Tengah: Menu Tab Kapsul Horizontal (Symmetry Layout) */}
        <div className="flex bg-gray-100/80 border p-1 rounded-xl gap-1">
          <Link 
            href="/dashboard/admin/system?tab=health" 
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === "health" ? "bg-white text-[#002060] shadow-xs border border-gray-200/50" : "text-gray-555 hover:text-gray-900"}`}
          >
            Kesihatan Sistem
          </Link>
          <Link 
            href="/dashboard/admin/system?tab=users" 
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === "users" ? "bg-white text-[#002060] shadow-xs border border-gray-200/50" : "text-gray-555 hover:text-gray-900"}`}
          >
            Uruskan Staf
          </Link>
          <Link 
            href="/dashboard/admin/system?tab=audit" 
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === "audit" ? "bg-white text-[#002060] shadow-xs border border-gray-200/50" : "text-gray-555 hover:text-gray-900"}`}
          >
            Jejak Audit Logs
          </Link>
        </div>

        {/* Kanan: Avatar Profil Bulatan + Dropdown Log Keluar Halimunan (Symmetry to Screenshot 3) */}
        <AdminProfileDropdownClient 
          userEmail={session.user.email || "admin@uthm.edu.my"} 
          userName={session.user.name || "Ali SuperAdmin"} 
        />
      </header>

      {/* 2. BLUE EXECUTIVE HERO BANNER: Melekat tepat di bawah topbar putih tanpa berlapis dua */}
      {/* Rectifying rendering alignment hierarchies to eliminate layout stack duplication bugs. */}
      <div className="w-full bg-[#002060] text-white px-8 py-10 shadow-inner">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[9px] bg-[#001848] text-blue-200 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest">
              Portal Pentadbir Utama
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {session.user.name || "Ali SuperAdmin"}
            </h1>
            <p className="text-xs text-blue-200/70 font-medium">
              Sistem Caruman Zakat Gaji UTHM • Panel Kawal Selia Infrastruktur & Keselamatan
            </p>
          </div>
          
          {/* Kotak Logo Zakat Putih di sebelah kanan (Tepat sepadan dengan identiti visual Screenshot 3 & 4) */}
          <div className="bg-white p-2.5 rounded-2xl shadow-md hidden md:block border border-blue-900/10">
            <img src="/6232c1fe-be22-4a39-89b1-0eb508f91e72.png" alt="Zakat UTHM" className="h-11 w-auto object-contain select-none" />
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT WORKSPACE AREA: Sits clean below the structural layers */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="animate-in fade-in duration-200">
          
          {/* Sub-tab 1: Kesihatan Sistem */}
          {tab === "health" && (
            <Suspense fallback={<DashboardSkeleton />}>
              <SystemDashboardWrapper 
                user={{
                  name: session.user.name ?? "",
                  email: session.user.email ?? "",
                  role: session.user.role ?? "SUPER_ADMIN",
                }}
              />
            </Suspense>
          )}

          {/* Sub-tab 2: Uruskan Staf */}
          {tab === "users" && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Urusen Kebenaran Akses Kakitangan</h3>
                <p className="text-xs text-gray-400">Tingkatkan pangkat (Promote) atau turunkan pangkat (Demote) peranan akaun staf UTHM.</p>
              </div>
              <UserVerificationTable />
            </div>
          )}

          {/* Sub-tab 3: Jejak Audit Logs */}
          {tab === "audit" && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Log Forensik Keselamatan Digital</h3>
                <p className="text-xs text-gray-400">Jejak kronologi aktiviti mutasi pangkalan data, pengiraan nisab, dan tindakan sistem.</p>
              </div>
              <Suspense fallback={<TableSkeleton />}>
                <AuditLogsWrapper />
              </Suspense>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
