import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Immutable GET endpoint scoped exclusively to SUPER_ADMIN to avoid forensic trail tampering.
export async function GET() {
  const session = await auth();

  // 1. Sekat pengunjung yang tiada sesi aktif atau bukan bertaraf SUPER_ADMIN
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Akses tidak dibenarkan. Hanya Pentadbir Tertinggi sahaja dibenarkan." },
      { status: 403 }
    );
  }

  try {
    // 2. KUNCI SASARAN: Tarik data dari jadual AuditLog disusun mengikut tarikh terbaharu dahulu
    const logs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("[GET /api/admin/audit-logs] Error:", error);
    return NextResponse.json(
      { error: "Ralat pangkalan data semasa menarik log audit." },
      { status: 500 }
    );
  }
}
