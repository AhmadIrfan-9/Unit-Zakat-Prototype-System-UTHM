import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return new NextResponse("Akses Ditolak! Hanya SUPER_ADMIN layak membuat sandaran.", { status: 401 });
  }

  try {
    const users = await prisma.user.findMany();
    const applications = await prisma.zakatStaffSalaryDeductionApplication.findMany();
    const auditLogs = await prisma.auditLog.findMany();
    const settings = await prisma.systemSetting.findMany();
    const news = await prisma.news.findMany();

    const backupData = {
      timestamp: new Date().toISOString(),
      database: "zakat_uthm_db",
      data: {
        users,
        applications,
        auditLogs,
        settings,
        news,
      },
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=zakat_uthm_backup_${new Date().toISOString().split("T")[0]}.json`,
      },
    });
  } catch (error) {
    console.error("Backup failed:", error);
    return new NextResponse("Gagal menjana sandaran pangkalan data.", { status: 500 });
  }
}
