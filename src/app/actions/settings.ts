"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSystemAuditLog } from "@/lib/audit";

// Incremental patch verifying admin credentials before modifying global runtime security variables.
export async function updateGlobalNisabAction(newValue: number) {
  const session = await auth();

  // KUNCI KESELAMATAN: Hanya SUPER_ADMIN sahaja layak menukar parameter syarak sistem
  if (session?.user?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Akses Ditolak! Anda bukan Pentadbir Utama Sistem." };
  }

  try {
    const updatedSetting = await prisma.systemSetting.upsert({
      where: { key: "CURRENT_NISAB" },
      update: { value: newValue },
      create: { key: "CURRENT_NISAB", value: newValue },
    });

    // REKOD LOG AUDIT: Jejaki siapa yang mengubah angka perkiraan zakat universiti
    await createSystemAuditLog("ADMIN_KEMASKINI_NISAB_GLOBAL", {
      newNisabValue: newValue,
      updatedBy: session.user.email,
    });

    return { success: true, data: updatedSetting };
  } catch (error) {
    console.error("SETTINGS_UPDATE_ERROR:", error);
    return { success: false, error: "Gagal mengemas kini nilai nisab global." };
  }
}

// Fungsi pembacaan nilai nisab semasa daripada pangkalan data
export async function fetchCurrentNisabAction() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "CURRENT_NISAB" },
    });

    // Pulangkan nilai lalai RM 50,228.51 jika rekod belum wujud
    return { success: true, value: setting?.value ?? 50228.51 };
  } catch (error) {
    console.error("SETTINGS_FETCH_ERROR:", error);
    return { success: true, value: 50228.51 };
  }
}
