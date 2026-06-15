// src/app/dashboard/zakat/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ZakatStaffApplicationFormContainerComponent } from "@/components/zakat/ZakatStaffApplicationFormContainerComponent";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

      <div className="w-full max-w-3xl flex flex-col items-center gap-6">
        
        {/* Institutional logo layout element */}
        <div className="flex justify-center w-full animate-in fade-in slide-in-from-top-4 duration-500">
          <Image
            src="/logo.png"
            alt="Logo UTHM"
            width={280}
            height={80}
            priority
            className="h-20 w-auto object-contain mix-blend-multiply dark:mix-blend-normal"
          />
        </div>

        {/* Primary container Card for the wizard form */}
        <Card className="border border-border/80 shadow-xl bg-white dark:bg-card/95 w-full">
          
          {/* Main header indicating the authority portal details */}
          <CardHeader className="border-b border-border bg-muted/10 px-6 py-8 flex flex-col items-center text-center space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4 border-b pb-4 border-border/60">
              <div className="text-left">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#002060]">
                  Sistem Caruman Zakat Gaji UTHM
                </h1>
                <p className="text-xs text-muted-foreground font-semibold">
                  Borang Kebenaran Potongan Gaji Bulanan Kakitangan
                </p>
              </div>
              
              {/* Redirect option link to go to management dashboard */}
              {session.user.role === "MANAGEMENT_STAFF" && (
                <Link
                  href="/dashboard/pengurusan"
                  className="inline-flex items-center justify-center px-4 py-2 border border-[#002060] rounded-lg text-xs font-bold text-[#002060] hover:bg-[#002060]/5 dark:border-blue-400 dark:text-blue-400 transition-all cursor-pointer shrink-0 self-start sm:self-center"
                >
                  Dashboard Pengurusan &rarr;
                </Link>
              )}
            </div>

            {/* Confirmation status block banner */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30 flex items-center justify-between w-full">
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold text-left">
                <span className="font-bold">Pemohon:</span> {dbUser.name ?? dbUser.email} ({dbUser.noPekerja || "Tiada No. Pekerja"})
              </p>
              <Link href="/api/auth/signout" className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0">
                Log Keluar
              </Link>
            </div>

            {/* Instruction banner */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300 w-full text-left">
              <strong>Arahan:</strong> Maklumat profil anda dimuatkan secara automatik dari sistem pendaftaran staf. Sila tentukan kaedah potongan di Bahagian C dan lengkapi lafaz akad di Bahagian D sebelum menghantar borang.
            </div>
          </CardHeader>

          {/* Form component segment container */}
          <CardContent className="p-6 md:p-8">
            <ZakatStaffApplicationFormContainerComponent user={formattedUser} />
          </CardContent>

        </Card>

        {/* Footer info blocks */}
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

