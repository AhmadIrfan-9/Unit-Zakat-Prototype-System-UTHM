// src/app/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// This server component determines the user's role and routes them to the correct dashboard workspace.
export default async function ZakatPage() {
  // Extract user session details to determine authentication state.
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect users to their respective workspaces directly based on database role
  if (session.user.role === "SUPER_ADMIN") {
    redirect("/dashboard/admin/system");
  } else if (session.user.role === "ZAKAT_OFFICER") {
    redirect("/dashboard/pengurusan");
  } else {
    redirect("/dashboard/zakat");
  }
}

