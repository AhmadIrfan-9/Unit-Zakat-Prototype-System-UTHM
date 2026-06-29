import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SystemDashboardClient from "@/components/admin/SystemDashboardClient";
import AuditLogTableClient from "@/components/admin/AuditLogTableClient";
import UserVerificationTable from "@/components/zakat/UserVerificationTable";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portal Pentadbir Utama | Sistem Zakat UTHM",
  description: "Sistem Caruman Zakat Gaji UTHM • Panel Kawal Selia Infrastruktur & Keselamatan",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminSystemPage({ searchParams }: PageProps) {
  const session = await auth();
  const { tab = "health" } = await searchParams;

  // KUNCI KESELAMATAN: Hanya SUPER_ADMIN sahaja boleh melihat halaman ini
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard/zakat?tab=info");
  }

  // 1. Connection check ke Database
  let dbOnline = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOnline = true;
  } catch (e) {
    dbOnline = false;
  }

  // 2. Email setup status check
  const emailConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER);

  // 3. Vercel deployment status
  const isVercel = !!process.env.VERCEL;

  // 4. Statistics snapshot in parallel (optimized for speed)
  const [totalUsers, totalApplications, inactiveUsers, auditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.zakatStaffSalaryDeductionApplication.count(),
    prisma.user.count({
      where: {
        zakatStaffSalaryDeductions: {
          none: {},
        },
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-12">
      
      {/* GLOBAL TOPBAR (Mengekalkan reka bentuk visual asal universiti) */}
      <header className="w-full bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/6232c1fe-be22-4a39-89b1-0eb508f91e72.png" alt="UTHM Logo" className="h-8 w-auto" />
          <div className="w-px h-6 bg-gray-200" />
          <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">Portal Pentadbir Utama</span>
        </div>
        
        <form action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}>
          <button 
            type="submit"
            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>🚪</span> Log Keluar
          </button>
        </form>
      </header>

      {/* BLUE EXECUTIVE HERO BANNER (Symmetry to Screenshot 2) */}
      <div className="w-full bg-blue-950 text-white p-8 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <span className="text-[10px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Sistem Kawalan Forensik</span>
            <h1 className="text-2xl font-extrabold mt-1">Selamat Datang, {session.user.name || "Pentadbir Utama"}</h1>
            <p className="text-xs text-blue-200/80 mt-0.5">Sistem Caruman Zakat Gaji UTHM • Panel Kawal Selia Infrastruktur & Keselamatan</p>
          </div>
          <img src="/6232c1fe-be22-4a39-89b1-0eb508f91e72.png" alt="Zakat Logo" className="h-14 w-auto hidden md:block bg-white p-1 rounded" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* KUNCI VISUAL UTAMA: Menyelaraskan reka bentuk tab tepat seperti di Screenshot 2 */}
        {/* Incremental patch mirroring the standardized centralized horizontal sub-navigation layout from management dashboard view. */}
        <div className="flex justify-center bg-white border p-1.5 rounded-xl max-w-2xl mx-auto shadow-sm gap-2 mb-8">
          <Link 
            href="/dashboard/admin/system?tab=health" 
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${tab === "health" ? "bg-blue-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
          >
            Kesihatan Sistem
          </Link>
          <Link 
            href="/dashboard/admin/system?tab=users" 
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${tab === "users" ? "bg-blue-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
          >
            Uruskan Staf
          </Link>
          <Link 
            href="/dashboard/admin/system?tab=audit" 
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${tab === "audit" ? "bg-blue-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
          >
            Jejak Audit Logs
          </Link>
        </div>

        {/* CONTEN ROUTER SELECTION */}
        <div className="animate-in fade-in duration-150">
          
          {/* TAB 1: Kesihatan Sistem (Melihat status real-time komponen) */}
          {tab === "health" && (
            <SystemDashboardClient 
              dbOnline={dbOnline}
              emailConfigured={emailConfigured}
              isVercel={isVercel}
              stats={{
                totalUsers,
                totalApplications,
                inactiveUsers,
              }}
              user={{
                name: session.user.name ?? "",
                email: session.user.email ?? "",
                role: session.user.role ?? "SUPER_ADMIN",
              }}
            />
          )}

          {/* TAB 2: Uruskan Staf (Tempat menukar peranan peranti akaun menggunakan modal justifikasi) */}
          {tab === "users" && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Senarai & Pengurusan Kebenaran Akses Kakitangan</h3>
              <UserVerificationTable />
            </div>
          )}

          {/* TAB 3: Jejak Audit Logs (Zahir data log forensik digital gred perusahaan) */}
          {tab === "audit" && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Log Transaksi & Jejak Aktiviti Sistem</h3>
              <AuditLogTableClient initialLogs={auditLogs} />
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
