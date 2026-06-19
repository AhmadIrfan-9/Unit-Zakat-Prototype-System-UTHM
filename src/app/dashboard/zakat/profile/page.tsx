// This page serves as the dedicated profile management view, stripping away dashboard metrics to focus purely on user data updates.

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ZakatStaffProfileComponent } from "@/components/zakat/ZakatStaffProfileComponent";

export default async function ZakatProfilePage() {
  // This statement verifies that the active session is valid and retrieves user credentials.
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // This query retrieves the database user record matching the authenticated account ID.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser) {
    redirect("/login");
  }

  // This statement maps the retrieved database parameters to the form fields.
  const formattedUser = {
    namaPenuh: dbUser.name || "",
    email: dbUser.email || "",
    noPekerja: dbUser.noPekerja || "",
    noKP: dbUser.noKP || "",
    umur: dbUser.umur || undefined,
    gajiSemasa: dbUser.gajiSemasa ? dbUser.gajiSemasa.toString() : "",
    alamatRumah: dbUser.alamatRumah || "",
    fakulti: dbUser.fakulti || "",
  };

  return (
    // This container wraps the form in a centered layout with padding.
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <ZakatStaffProfileComponent defaultValues={formattedUser} />
      </div>
    </div>
  );
}
