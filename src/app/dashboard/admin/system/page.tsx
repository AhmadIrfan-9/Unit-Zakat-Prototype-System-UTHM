export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SystemDashboardClient from "@/components/admin/SystemDashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sistem Pentadbir | Portal Zakat UTHM",
  description: "Paparan status kesihatan sistem, log audit, dan sandaran pangkalan data.",
};

export default async function AdminSystemPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard/zakat");
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
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        role: session.user.role ?? "SUPER_ADMIN",
      }}
    />
  );
}
