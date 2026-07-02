// src/app/dashboard/zakat/page.tsx
// This server view component validates employee session roles and rejects administrative profiles with an automatic redirect to the management dashboard.
export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ZakatStaffDashboardMasterViewComponent } from "@/components/zakat/StaffDashboard";
import type { Metadata } from "next";

// This metadata block sets the browser tab title and search description for the staff application portal.
export const metadata: Metadata = {
  title: "Permohonan Zakat Gaji | Sistem Caruman Zakat UTHM",
  description:
    "Portal permohonan potongan zakat gaji bulanan untuk staf UTHM. Lengkapkan borang dalam talian bagi menggantikan prosedur borang fizikal.",
};

// This server component validates the session, retrieves staff database profiles, and renders the layout wrapper.
export default async function ZakatApplicationPage() {
  // This guard redirects any unauthenticated request immediately to the login page.
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Defer database lookups into parallel promises to allow instant shell rendering
  const nisabPromise = prisma.systemSetting.findUnique({
    where: { key: "CURRENT_NISAB" }
  }).then(setting => setting?.value || 50228.51);

  const userPromise = prisma.user.findUnique({
    where: { id: session.user.id },
  }).then(dbUser => {
    if (!dbUser) return null;
    return {
      name:        dbUser.name         ?? "",
      email:       dbUser.email        ?? "",
      noPekerja:   dbUser.noPekerja    ?? "",
      noKP:        dbUser.noKP         ?? "",
      gajiSemasa:  dbUser.gajiSemasa ? Number(dbUser.gajiSemasa) : null,
      alamatRumah: dbUser.alamatRumah  ?? "",
      role:        dbUser.role,
      fakulti:     dbUser.fakulti      ?? "",
      umur:        dbUser.umur         ?? null,
      noTelefon:   dbUser.noTelefon    ?? "",
      poskod:      dbUser.poskod       ?? "",
      bandar:      dbUser.bandar       ?? "",
      negeri:      dbUser.negeri       ?? "",
    };
  });

  return (
    // This component mounts the full single-ribbon staff workspace including navbar, tabs, and content panels.
    <ZakatStaffDashboardMasterViewComponent 
      sessionUser={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        role: session.user.role ?? "STAFF",
      }}
      userPromise={userPromise} 
      nisabPromise={nisabPromise} 
    />
  );
}
