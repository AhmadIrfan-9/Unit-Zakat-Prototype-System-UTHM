// This module exposes the central fire-and-forget audit log writer used across all server actions and API routes.
// It is intentionally isolated so that logging failures never interrupt the main request flow.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import crypto from "crypto";

// Enforce a strict JSON-safe audit details type format
type AuditDetails = Record<string, string | number | boolean | null | undefined | object>;

// Fungsi untuk mengira hash SHA-256 daripada data log
function calculateHash(action: string, user: string, resource: string, metadata: string, previousHash: string): string {
  const dataString = `${action}-${user}-${resource}-${metadata}-${previousHash}`;
  return crypto.createHash("sha256").update(dataString).digest("hex");
}

/**
 * REKOD LOG IMUTABEL: Menulis log audit berantai kriptografi ke database
 * Incremental patch implementing cryptographic block-chaining verification on database state updates.
 */
export async function createImmutableAuditLog(
  action: string, 
  user: string, 
  resource: string, 
  metadata: string, 
  ipAddress: string = "127.0.0.1"
) {
  try {
    // 1. Ambil log terakhir yang tersimpan di database untuk mendapatkan hash sebelumnya
    const lastLog = await prisma.auditLog.findFirst({
      orderBy: { createdAt: "desc" },
    });

    // Jika ini log pertama sistem (Genesis Block), kita tetapkan previousHash kepada "0"
    const previousHash = lastLog ? lastLog.hash : "0000000000000000000000000000000000000000000000000000000000000000";

    // 2. Kira hash unik untuk log semasa
    const currentHash = calculateHash(action, user, resource, metadata, previousHash);

    // 3. Tulis masuk ke database
    const secureLog = await prisma.auditLog.create({
      data: {
        action,
        user,
        resource,
        metadata,
        ipAddress,
        hash: currentHash,
        previousHash: previousHash,
      },
    });

    return { success: true, log: secureLog };
  } catch (error) {
    console.error("AUDIT_LEDGER_WRITE_FATAL:", error);
    return { success: false, error: "Gagal menulis log ke dalam inkues keselamatan." };
  }
}

/**
 * SISTEM PENGESAHAN INTEGRITI: Memeriksa sama ada log audit telah diusik/dipadam
 */
export async function verifyAuditLedgerIntegrity() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "asc" }, // Semak dari log paling lama ke paling baharu
    });

    let expectedPreviousHash = "0000000000000000000000000000000000000000000000000000000000000000";

    for (const log of logs) {
      // Periksa jika previousHash tidak sepadan dengan apa yang kita jangka
      if (log.previousHash !== expectedPreviousHash) {
        return { 
          isValid: false, 
          corruptedLogId: log.id, 
          reason: `Rantaian putus pada Log ID ${log.id}. Data sebelum ini telah dipadam!` 
        };
      }

      // Kira semula hash baris semasa untuk memastikan tiada data teks (cth: metadata) diubah secara manual
      const reCalculatedHash = calculateHash(log.action, log.user, log.resource, log.metadata, log.previousHash);
      if (log.hash !== reCalculatedHash) {
        return { 
          isValid: false, 
          corruptedLogId: log.id, 
          reason: `Isi kandungan Log ID ${log.id} telah diubah suai secara haram di database!` 
        };
      }

      // Alihkan pointer expected ke hash semasa untuk pusingan seterusnya
      expectedPreviousHash = log.hash;
    }

    return { isValid: true, message: "Integriti log audit dalam keadaan sempurna (100% Secure)." };
  } catch (error) {
    console.error("AUDIT_LEDGER_VERIFY_FATAL:", error);
    return { isValid: false, reason: "Gagal melakukan imbasan forensik." };
  }
}

// Incremental patch bridging existing logging logic with the cryptographic block-chained logger.
export async function createSystemAuditLog(
  action: string,
  details: AuditDetails = {}
): Promise<void> {
  let ipAddress = "127.0.0.1";
  let userEmail = "ANONYMOUS_VISITOR";

  try {
    // 1. Selamatkan pembacaan headers
    try {
      const headerList = await headers();
      ipAddress =
        headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headerList.get("x-real-ip") ||
        "127.0.0.1";
    } catch {
      ipAddress = "127.0.0.1 (SignOut Context)";
    }

    // 2. Selamatkan pembacaan sesi pelayan
    try {
      const session = await auth();
      userEmail = session?.user?.email || "ANONYMOUS_VISITOR";
    } catch {
      userEmail = "LOGOUT_PROCESSING";
    }

    // Adapt properties: extract resource and use details as metadata
    const resource = (details?.resource as string) || "Sistem";
    const metadata = JSON.stringify(details);

    // Write through the immutable cryptographic engine
    await createImmutableAuditLog(action, userEmail, resource, metadata, ipAddress);
  } catch (error) {
    console.error("CRITICAL_AUDIT_LOG_EXCEPTION_HANDLED:", error);
  }
}
