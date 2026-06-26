// This module exposes the central fire-and-forget audit log writer used across all server actions and API routes.
// It is intentionally isolated so that logging failures never interrupt the main request flow.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// Enforce a strict JSON-safe audit details type format
type AuditDetails = Record<string, string | number | boolean | null | undefined | object>;

// Incremental patch isolating the request context to prevent terminal termination during sign-out events.
export async function createSystemAuditLog(
  action: string,
  details: AuditDetails = {}
): Promise<void> {
  let ipAddress = "127.0.0.1";
  let userId = null;
  let userEmail = "ANONYMOUS_VISITOR";

  try {
    // 1. Dinding Pertahanan 1: Selamatkan pembacaan headers
    try {
      const headerList = await headers();
      ipAddress =
        headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headerList.get("x-real-ip") ||
        "127.0.0.1";
    } catch {
      // Fallback selamat jika dicetuskan daripada konteks event sign-out NextAuth
      ipAddress = "127.0.0.1 (SignOut Context)";
    }

    // 2. Dinding Pertahanan 2: Selamatkan pembacaan sesi pelayan
    try {
      const session = await auth();
      userId = session?.user?.id || null;
      userEmail = session?.user?.email || "ANONYMOUS_VISITOR";
    } catch {
      userId = null;
      userEmail = "LOGOUT_PROCESSING";
    }

    // 3. Rekodkan entri log ke dalam database secara selamat
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail,
        action,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    // Memastikan ralat log tidak sekali-kali menghentikan thread utama Node.js
    console.error("CRITICAL_AUDIT_LOG_EXCEPTION_HANDLED:", error);
  }
}
