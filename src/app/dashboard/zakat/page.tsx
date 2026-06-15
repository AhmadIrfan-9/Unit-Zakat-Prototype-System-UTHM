// src/app/dashboard/zakat/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ZakatStaffDashboardTabsContainerComponent } from "@/components/zakat/ZakatStaffDashboardTabsContainerComponent";
import Link from "next/link";
import type { Metadata } from "next";

// Define metadata for the staff salary deduction form page.
export const metadata: Metadata = {
  title: "Permohonan Zakat Gaji | Sistem Caruman Zakat UTHM",
  description:
    "Portal permohonan potongan zakat gaji bulanan untuk staf UTHM. Lengkapkan borang dalam talian bagi menggantikan prosedur borang fizikal.",
};

// This server component validates the session, retrieves staff database profiles, and renders the layout wrapper.
export default async function ZakatApplicationPage() {
  // Validate that the user is authenticated prior to rendering page assets.
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch the user's fresh database profile to populate the form parameters.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser) {
    redirect("/login");
  }

  // Format the user profile properties safely for the client form container component.
  const formattedUser = {
    name: dbUser.name,
    email: dbUser.email,
    noPekerja: dbUser.noPekerja,
    noKP: dbUser.noKP,
    gajiSemasa: dbUser.gajiSemasa ? Number(dbUser.gajiSemasa) : null,
    alamatRumah: dbUser.alamatRumah,
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 md:p-8 font-sans antialiased">
      
      {/* Background vector design pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,rgba(0,32,96,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,32,96,0.02)_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,#000_80%,transparent_100%)]" />

      {/* Show navigation controls and user session info before the main tab container */}
      <div className="w-full max-w-3xl flex flex-col gap-6">
        
        {/* Authentication status header banner and routing controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/85 dark:bg-card/85 backdrop-blur-xs p-4 rounded-xl border border-border shadow-sm">
          <div className="text-left space-y-0.5">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Log masuk sebagai</p>
            <p className="text-xs font-extrabold text-[#002060] dark:text-blue-300">
              {dbUser.name ?? dbUser.email} (Pekerja: {dbUser.noPekerja || "PENTADBIR"})
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {session.user.role === "MANAGEMENT_STAFF" && (
              <Link
                href="/dashboard/pengurusan"
                className="inline-flex items-center justify-center px-3 py-1.5 border border-[#002060] rounded-lg text-[10px] font-bold text-[#002060] hover:bg-[#002060]/5 dark:border-blue-400 dark:text-blue-400 transition-all cursor-pointer shadow-xs bg-white"
              >
                Dashboard Pengurusan
              </Link>
            )}
            <Link
              href="/api/auth/signout"
              className="inline-flex items-center justify-center px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors cursor-pointer select-none"
            >
              Log Keluar
            </Link>
          </div>
        </div>

        {/* Tab-based Dashboard workspace container rendering */}
        <ZakatStaffDashboardTabsContainerComponent user={formattedUser} />

        {/* Footer info copy credits */}
        <footer className="text-center space-y-1">
          <p className="text-[11px] text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} Universiti Tun Hussein Onn Malaysia. Hak Cipta Terpelihara.
          </p>
          <p className="text-[10px] text-muted-foreground/50">
            Disediakan oleh Pejabat Zakat UTHM & Bahagian Teknologi Maklumat
          </p>
        </footer>
      </div>
    </div>
  );
}

