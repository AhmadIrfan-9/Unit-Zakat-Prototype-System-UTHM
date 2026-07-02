import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Immutable GET endpoint scoped exclusively to SUPER_ADMIN to avoid forensic trail tampering.
export async function GET(request: NextRequest) {
  const session = await auth();

  // 1. Sekat pengunjung yang tiada sesi aktif atau bukan bertaraf SUPER_ADMIN
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Akses tidak dibenarkan. Hanya Pentadbir Tertinggi sahaja dibenarkan." },
      { status: 403 }
    );
  }

  try {
    // Membaca parameter had muatan (pagination) dari URL query
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    // 2. KUNCI SASARAN: Tarik data dari jadual AuditLog disusun mengikut tarikh terbaharu dengan had limit
    const logs = await prisma.auditLog.findMany({
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: "desc",
      },
    });

    const mappedLogs = logs.map((log) => {
      let detailsObj = {};
      try {
        detailsObj = JSON.parse(log.metadata);
      } catch {
        detailsObj = { rawMetadata: log.metadata };
      }
      return {
        id: log.id,
        userId: null,
        userEmail: log.user,
        action: log.action,
        details: detailsObj,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      };
    });

    return NextResponse.json(mappedLogs);
  } catch (error) {
    console.error("[GET /api/admin/audit-logs] Error:", error);
    return NextResponse.json(
      { error: "Ralat pangkalan data semasa menarik log audit." },
      { status: 500 }
    );
  }
}
