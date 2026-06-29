"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"; 
import { revalidatePath } from "next/cache";

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

  // ─── TUGASAN 2: SYARAT PASWORD BARU != PASWORD LAMA ───
  if (currentPassword === newPassword) {
    return { success: false, error: "Kata laluan baharu tidak boleh sama dengan kata laluan semasa." };
  }

  // ─── TUGASAN 1: VALIDASI KOMPLEKSITI (SIMBOL, HURUF BESAR/KECIL, NOMBOR) ───
  // Memastikan sekurang-kurangnya 1 huruf besar, 1 huruf kecil, 1 nombor, 1 simbol khas, dan min 8 aksara
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!strongPasswordRegex.test(newPassword)) {
    return { 
      success: false, 
      error: "Kata laluan kuat mestilah mengandungi sekurang-kurangnya 8 aksara, termasuk huruf besar, huruf kecil, nombor, dan simbol khas (@$!%*?&)." 
    };
  }

  try {
    // 1. Ambil rekod staf daripada pangkalan data beserta sejarah kata laluan
    const user = await prisma.user.findUnique({ 
      where: { id: session.user.id },
      include: { passwordHistories: true }
    });
    
    if (!user || !user.passwordHash) {
      return { success: false, error: "Pengguna tidak ditemui atau tiada kata laluan berdaftar." };
    }

    // 2. Semak sama ada kata laluan semasa yang dimasukkan adalah betul
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Kata laluan semasa anda salah." };
    }

    // ─── TUGASAN 3: SEKATAN SEMULA KATA LALUAN PERNAH DIGUNAKAN (PASSWORD HISTORY) ───
    // Memeriksa adakah password baru menyamai mana-mana rekod hash lama di dalam database
    for (const history of user.passwordHistories) {
      const isHistoryMatch = await bcrypt.compare(newPassword, history.passwordHash);
      if (isHistoryMatch) {
        return { success: false, error: "Kata laluan ini pernah digunakan sebelum ini. Sila pilih kata laluan lain." };
      }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // ─── PROSES KEMASKINI GLOBAL KATA LALUAN & PENGEHADAN SAIZ SEJARAH (MAX 5) ───
    await prisma.$transaction(async (tx) => {
      // A. Arkibkan kata laluan semasa ke dalam jadual sejarah
      await tx.passwordHistory.create({
        data: {
          userId: user.id,
          passwordHash: user.passwordHash as string
        }
      });

      // B. Kemas kini kata laluan utama akaun
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedNewPassword
        }
      });

      // C. Bersihkan rekod lapuk jika saiz sejarah melebihi had maksimum 5
      const historyRecords = await tx.passwordHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" }
      });

      if (historyRecords.length > 5) {
        const totalToPurge = historyRecords.length - 5;
        const idsToPurge = historyRecords.slice(0, totalToPurge).map((h) => h.id);

        await tx.passwordHistory.deleteMany({
          where: { id: { in: idsToPurge } }
        });
      }
    });

    revalidatePath("/dashboard/zakat");
    revalidatePath("/dashboard/zakat/profile");

    return { success: true };
  } catch (error) {
    console.error("[updatePasswordAction] Error:", error);
    return { success: false, error: "Ralat pangkalan data berlaku semasa mengemas kini kata laluan." };
  }
}
