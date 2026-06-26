// src/app/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// This server component determines the user's role and routes them to the correct dashboard workspace.
export default async function ZakatPage() {
  // Extract user session details to determine authentication state.
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect ZAKAT_OFFICER dan SUPER_ADMIN ke dashboard pengurusan; STAFF ke portal kakitangan.
  if (session.user.role === "ZAKAT_OFFICER" || session.user.role === "SUPER_ADMIN") {
    redirect("/dashboard/pengurusan");
  } else {
    redirect("/dashboard/zakat");
  }
}

