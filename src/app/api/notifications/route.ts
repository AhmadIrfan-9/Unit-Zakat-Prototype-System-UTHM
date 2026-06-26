import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Incremental patch restricting the notification query scope exclusively to the active session owner.
export async function GET() {
  const session = await auth();

  // 1. Sekat terus jika pengunjung tiada sesi aktif
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. KUNCI TEGAR: Hanya ambil notifikasi milik ID user yang sedang login sahaja
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id, // Menghalang sebarang kebocoran data ke staf lain
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[GET /api/notifications] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
