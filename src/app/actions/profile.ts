"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"; 

// Incremental patch verifying current credential state and hashing the new target safely.
export async function updatePasswordAction(formData: { currentPassword?: string; newPassword?: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Sesi tidak sah. Sila log masuk semula." };
  }

  const { currentPassword, newPassword } = formData;

  if (!currentPassword || !newPassword) {
    return { success: false, error: "Sila isi semua ruangan kata laluan." };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "Kata laluan baharu mestilah sekurang-kurangnya 8 aksara." };
  }

  try {
    // 1. Ambil rekod staf daripada pangkalan data
    const user = await prisma.user.findUnique({ 
      where: { id: session.user.id } 
    });
    
    if (!user || !user.passwordHash) {
      return { success: false, error: "Pengguna tidak ditemui atau tiada kata laluan berdaftar." };
    }

    // 2. Semak sama ada kata laluan semasa yang dimasukkan adalah betul
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Kata laluan semasa anda salah." };
    }

    // 3. KRITIKAL: Tukar kata laluan baharu kepada hash Bcrypt sebelum disimpan
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 4. Kemas kini medan kata laluan utama (passwordHash) di dalam DB
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: hashedNewPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[updatePasswordAction] Error:", error);
    return { success: false, error: "Ralat pangkalan data berlaku semasa mengemas kini kata laluan." };
  }
}
