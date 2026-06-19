// src/app/dashboard/zakat/page.tsx
// This server view component validates employee session roles and rejects administrative profiles with an automatic redirect to the management dashboard.
export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ZakatStaffDashboardMasterViewComponent } from "@/components/zakat/ZakatStaffDashboardMasterViewComponent";
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

  // This query fetches the authenticated user's full database record to verify their role and populate form fields.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  // This guard redirects requests whose database record no longer exists back to the login page.
  if (!dbUser) {
    redirect("/login");
  }

  // This role gate prevents management staff from accessing the employee submission channel by forwarding them to their correct dashboard.
  if (dbUser.role === "MANAGEMENT_STAFF") {
    redirect("/dashboard/pengurusan");
  }

  // This object maps database columns to the stable, serializable shape expected by the client dashboard component.
  const formattedUser = {
    name:        dbUser.name         ?? "",
    email:       dbUser.email        ?? "",
    noPekerja:   dbUser.noPekerja    ?? "",
    noKP:        dbUser.noKP         ?? "",
    gajiSemasa:  dbUser.gajiSemasa ? Number(dbUser.gajiSemasa) : null,
    alamatRumah: dbUser.alamatRumah  ?? "",
    role:        dbUser.role,
    fakulti:     dbUser.fakulti      ?? "",
    umur:        dbUser.umur         ?? null,
  };

  return (
    // This component mounts the full single-ribbon staff workspace including navbar, tabs, and content panels.
    <ZakatStaffDashboardMasterViewComponent user={formattedUser} />
  );
}
