// src/app/dashboard/zakat/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ZakatStaffDashboardMasterViewComponent } from "@/components/zakat/ZakatStaffDashboardMasterViewComponent";
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
    role: dbUser.role,
  };

  return (
    // Renders the master view component which handles full navbar layout and contents.
    <ZakatStaffDashboardMasterViewComponent user={formattedUser} />
  );
}
