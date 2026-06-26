// This module exposes the central fire-and-forget audit log writer used across all server actions and API routes.
// It is intentionally isolated so that logging failures never interrupt the main request flow.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// This type enforces a structured JSON-safe payload for the details column.
type AuditDetails = Record<string, string | number | boolean | null | undefined>;

/**
 * Merekodkan satu entri audit ke dalam pangkalan data secara latar belakang (fire-and-forget).
 * Ralat yang berlaku semasa penulisan log tidak akan meruntuhkan aliran kerja utama.
 *
 * @param action   - Pengecam tindakan dalam huruf besar, contoh: "PENTADBIR_PADAM_PENGGUNA"
 * @param details  - Objek metadata tambahan yang berkaitan dengan tindakan tersebut
 */
export async function createSystemAuditLog(
  action: string,
  details: AuditDetails = {}
): Promise<void> {
  try {
    const session = await auth();
    const headerList = await headers();

    // Mengekstrak IP Address klien daripada proksi Vercel/Cloudflare, atau fallback ke localhost
    const ipAddress =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "127.0.0.1";

    // Rekodkan entri audit secara terus ke dalam pangkalan data
    await prisma.auditLog.create({
      data: {
        userId:    session?.user?.id    || null,
        userEmail: session?.user?.email || "ANONYMOUS_VISITOR",
        action,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    // Isolasikan ralat log supaya tidak meruntuhkan aliran kerja utama sistem
    console.error("[AUDIT_LOG_CREATION_FAILED]", { action, error });
  }
}
