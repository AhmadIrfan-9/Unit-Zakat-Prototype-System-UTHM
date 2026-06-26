// This module exposes the new staff account registration server action.
// It assigns an institutional default password and creates the user record securely.

"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

/**
 * Mendaftarkan akaun kakitangan baharu dengan kata laluan default institusi.
 * Incremental patch assigning the required institutional default password token directly inside the creation request.
 */
export async function registerNewStaffAccount(payload: {
  name: string;
  noPekerja: string;
  fakulti: string;
}) {
  try {
    // Check for duplicate noPekerja before creating
    const existing = await prisma.user.findUnique({
      where: { noPekerja: payload.noPekerja },
    });

    if (existing) {
      return { success: false, error: "No. Pekerja ini telah berdaftar dalam sistem." };
    }

    // Penetapan password default tegar gred prototype — hashed for DB safety
    const defaultSecuredPassword = "UthmPass01";
    const passwordHash = await bcrypt.hash(defaultSecuredPassword, 12);

    // Build an institutional email from noPekerja as fallback
    const institutionalEmail = `${payload.noPekerja.toLowerCase()}@uthm.edu.my`;

    const newUser = await prisma.user.create({
      data: {
        name: payload.name,
        noPekerja: payload.noPekerja,
        fakulti: payload.fakulti,
        passwordHash,
        email: institutionalEmail,
        role: "STAFF",
      },
    });

    revalidatePath("/dashboard/pengurusan");

    return { success: true, userId: newUser.id };
  } catch (error) {
    console.error("[registerNewStaffAccount] Error:", error);
    return { success: false, error: "Gagal mendaftar rekod kakitangan baharu." };
  }
}
