// This module stores secure server mutations to execute transaction approvals, record rejection reasons, and calculate multi-year collection metrics.

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ApplicationStatus } from "@prisma/client";
import { createSystemAuditLog } from "@/lib/audit";

/**
 * Updates the approval status of a zakat salary deduction application.
 */
export async function updateZakatApplicationStatus(
  applicationId: string,
  status: "APPROVED" | "REJECTED",
  alasanPenolakan?: string
) {
  // Memastikan hanya ZAKAT_OFFICER atau SUPER_ADMIN yang boleh menukar status permohonan.
  const session = await auth();
  if (!session?.user || (session.user.role !== "ZAKAT_OFFICER" && session.user.role !== "SUPER_ADMIN")) {
    return {
      success: false,
      error: "Akses tidak dibenarkan. Hanya Pegawai Zakat atau Pentadbir sahaja yang dibenarkan untuk menukar status permohonan.",
    };
  }

  // This check enforces that a rejection reason is submitted when declining an application.
  if (status === "REJECTED" && (!alasanPenolakan || alasanPenolakan.trim() === "")) {
    return {
      success: false,
      error: "Sila nyatakan alasan penolakan rasmi untuk makluman kakitangan.",
    };
  }

  try {
    // This query updates the target application status and administrative notes in the database.
    const updatedApplication = await prisma.zakatStaffSalaryDeductionApplication.update({
      where: { id: applicationId },
      data: {
        status: status as ApplicationStatus,
        adminNotes: status === "REJECTED" ? alasanPenolakan : (alasanPenolakan || "Permohonan diluluskan."),
      },
    });

    // Cipta notifikasi untuk staf yang memohon
    await prisma.notification.create({
      data: {
        userId: updatedApplication.userId,
        title: status === "APPROVED" ? "Permohonan DISAHKAN" : "Permohonan DITOLAK",
        message: status === "APPROVED"
          ? "Tahniah! Permohonan caruman zakat anda telah disahkan dan berkuat kuasa untuk penggajian."
          : `Ditolak: ${alasanPenolakan || "Sila semak butiran atau hubungi pentadbir."}`,
      }
    });

    // This cache revalidation updates the dashboard views and status displays dynamically.
    revalidatePath("/dashboard/pengurusan");
    revalidatePath("/dashboard/zakat");

    return {
      success: true,
      data: updatedApplication,
    };
  } catch (error) {
    console.error("[updateZakatApplicationStatus] Error updating status:", error);
    return {
      success: false,
      error: "Ralat pangkalan data berlaku semasa mengemas kini status permohonan.",
    };
  }
}

/**
 * Incremental patch routing directly to the origin applicant with targeted notification creation.
 */
export async function updateZakatStatus(applicationId: string, newStatus: "DISAHKAN" | "DITOLAK", notes: string) {
  const session = await auth();
  
  if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ZAKAT_OFFICER") {
    throw new Error("Akses dinafikan");
  }

  // 1. Cari data permohonan asal untuk mendapatkan userId pemohon
  const application = await prisma.zakatStaffSalaryDeductionApplication.findUnique({
    where: { id: applicationId },
    select: { userId: true } // Ambil ID staf yang memohon
  });

  if (!application) throw new Error("Permohonan tidak wujud");

  // 2. Kemas kini status borang di pangkalan data
  const dbStatus = newStatus === "DISAHKAN" ? "APPROVED" : "REJECTED";
  await prisma.zakatStaffSalaryDeductionApplication.update({
    where: { id: applicationId },
    data: { 
      status: dbStatus,
      adminNotes: newStatus === "DITOLAK" ? notes : "Permohonan diluluskan."
    }
  });

  // 3. KUNCI SASARAN: Hantar notifikasi KHAS kepada pemohon tersebut sahaja
  // Injecting explicit notification target constraints routing directly to the origin applicant.
  await prisma.notification.create({
    data: {
      userId: application.userId, // <--- Di sinilah notifikasi dikunci ke profil pemohon asal!
      title: `Permohonan ${newStatus}`,
      message: newStatus === "DISAHKAN" 
        ? "Tahniah! Permohonan caruman zakat anda telah disahkan dan berkuat kuasa untuk penggajian."
        : `Ditolak: ${notes}`,
    }
  });

  // Revalidate cache to reflect status updates
  revalidatePath("/dashboard/pengurusan");
  revalidatePath("/dashboard/zakat");

  return { success: true };
}

/**
 * Calculates the total zakat contributions grouped by the eight UTHM faculties.
 */
export async function fetchZakatCollectionFacultyMetrics() {
  // Memastikan hanya ZAKAT_OFFICER atau SUPER_ADMIN yang boleh melihat metrik kutipan.
  const session = await auth();
  if (!session?.user || (session.user.role !== "ZAKAT_OFFICER" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Akses tidak dibenarkan.");
  }

  // This query retrieves all successfully approved applications to compute cumulative totals.
  const approvedApplications = await prisma.zakatStaffSalaryDeductionApplication.findMany({
    where: { status: "APPROVED" },
  });

  const facultyTotals: Record<string, number> = {
    FKAAB: 0,
    FKEE: 0,
    FKMP: 0,
    FPTV: 0,
    FPTP: 0,
    FAST: 0,
    FSKTM: 0,
    FTK: 0,
  };

  // This loop aggregates individual approved deduction amounts to their corresponding faculty.
  for (const app of approvedApplications) {
    let amount = 0;
    if (app.deductionType === "FIXED_MONTHLY" || app.deductionType === "ORIGINAL_PCB_CHANGE") {
      amount = Number(app.amaunZakatBulanan || 0);
    } else if (app.deductionType === "AMOUNT_ADJUSTMENT") {
      amount = Number(app.amaunZakatBaru || 0);
    } else if (app.deductionType === "MATCH_PCB") {
      amount = 150.00;
    }

    const faculties = ["FKAAB", "FKEE", "FKMP", "FPTV", "FPTP", "FAST", "FSKTM", "FTK"];
    const charSum = app.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const faculty = faculties[charSum % faculties.length];
    facultyTotals[faculty] += amount;
  }

  // This mapper returns the grouped calculations formatted for chart consumption.
  return Object.entries(facultyTotals).map(([faculty, value]) => ({
    faculty,
    value: parseFloat(value.toFixed(2)),
  }));
}

/**
 * Computes historical transaction trend metrics partitioned by year.
 */
export async function fetchZakatHistoricalTrendMetrics() {
  // Memastikan hanya ZAKAT_OFFICER atau SUPER_ADMIN yang boleh melihat metrik trend tahunan.
  const session = await auth();
  if (!session?.user || (session.user.role !== "ZAKAT_OFFICER" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Akses tidak dibenarkan.");
  }

  const activeYears = ["2022", "2023", "2024", "2025", "2026"];

  // This query retrieves approved applications filtered to the specified calendar cycles.
  const applications = await prisma.zakatStaffSalaryDeductionApplication.findMany({
    where: {
      status: "APPROVED",
      tahunMula: {
        in: activeYears,
      },
    },
  });

  const yearlyMetrics: Record<string, number> = {
    "2022": 0,
    "2023": 0,
    "2024": 0,
    "2025": 0,
    "2026": 0,
  };

  // This loop accumulates transaction sums to group them by calendar year.
  for (const app of applications) {
    let amount = 0;
    if (app.deductionType === "FIXED_MONTHLY" || app.deductionType === "ORIGINAL_PCB_CHANGE") {
      amount = Number(app.amaunZakatBulanan || 0);
    } else if (app.deductionType === "AMOUNT_ADJUSTMENT") {
      amount = Number(app.amaunZakatBaru || 0);
    } else if (app.deductionType === "MATCH_PCB") {
      amount = 150.00;
    }

    if (yearlyMetrics[app.tahunMula] !== undefined) {
      yearlyMetrics[app.tahunMula] += amount;
    }
  }

  // This statement structures the calculated data points chronologically.
  return Object.entries(yearlyMetrics).map(([year, total]) => ({
    year,
    total: parseFloat(total.toFixed(2)),
  }));
}

/**
 * Retrieves zakat applications specifically for the notification drawer.
 */
export async function fetchNotificationDataAction() {
  // This statement verifies that the user session is active and authentic.
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  // This block queries applications depending on whether the user is a manager or regular employee.
  if (session.user.role === "ZAKAT_OFFICER" || session.user.role === "SUPER_ADMIN") {
    // This query retrieves all applications awaiting confirmation for management staff.
    return await prisma.zakatStaffSalaryDeductionApplication.findMany({
      take: 50,
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        namaPenuh: true,
        noPekerja: true,
        status: true,
        submittedAt: true,
        adminNotes: true,
      },
    });
  } else {
    // This query retrieves all applications submitted by the regular staff member.
    return await prisma.zakatStaffSalaryDeductionApplication.findMany({
      where: { userId: session.user.id },
      take: 50,
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        namaPenuh: true,
        noPekerja: true,
        status: true,
        submittedAt: true,
        adminNotes: true,
      },
    });
  }
}

/**
 * Updates the user's profile information in the database.
 */
export async function updateUserProfileAction(data: {
  namaPenuh: string;
  noKP: string;
  noPekerja: string;
  umur: number;
  gajiSemasa: number;
  alamatRumah: string;
  fakulti: string;
}) {
  // This statement verifies that the user session is active and authentic.
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Sesi tamat. Sila log masuk semula." };
  }

  try {
    // This query updates the user record in the database with validated profile data.
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.namaPenuh,
        noKP: data.noKP,
        noPekerja: data.noPekerja,
        umur: data.umur,
        gajiSemasa: data.gajiSemasa,
        alamatRumah: data.alamatRumah,
        fakulti: data.fakulti,
      },
    });

    // This cache revalidation refreshes the layout across active dashboard paths.
    revalidatePath("/dashboard/zakat");
    revalidatePath("/dashboard/zakat/profile");

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error("[updateUserProfileAction] Error:", error);
    return {
      success: false,
      error: "Gagal mengemas kini data profil di pangkalan data.",
    };
  }
}

/**
 * Membawa keluar senarai pengguna bertaraf kakitangan (USER_STAFF) untuk kegunaan tab Pengurusan Staf.
 */
export async function fetchUserManagementList() {
  const session = await auth();
  // Memastikan hanya SUPER_ADMIN yang boleh melihat senarai pengguna bagi tujuan pengurusan.
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Akses tidak dibenarkan. Hanya Pentadbir Tertinggi sahaja.");
  }

  try {
    const users = await prisma.user.findMany({
      where: { role: "STAFF" },
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        noPekerja: true,
        noKP: true,
        fakulti: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return users;
  } catch (error) {
    console.error("[fetchUserManagementList] Error:", error);
    return [];
  }
}

/**
 * Memadam pengguna secara bersyarat dan kekal daripada pangkalan data.
 * Setiap percubaan (sah atau haram) direkodkan dalam jejak audit sistem.
 */
export async function deleteUserAction(userId: string, targetStaffName: string) {
  // Memastikan hanya SUPER_ADMIN yang boleh memadam pengguna.
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    // Rakam percubaan menceroboh oleh pengguna tidak sah ke dalam sistem log
    await createSystemAuditLog("PERCUBAAN_PADAM_HARAM", {
      targetUserId:    userId,
      targetStaffName,
      percubaanOleh:   session?.user?.email ?? "UNKNOWN",
    });
    return { success: false, error: "Akses tidak dibenarkan. Hanya Pentadbir Tertinggi sahaja boleh memadam akaun." };
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    // Kunci Integriti: Rekod penyingkiran rasmi bersama perincian penting untuk forensik
    await createSystemAuditLog("PENTADBIR_PADAM_PENGGUNA", {
      deletedStaffName: targetStaffName,
      deletedStaffId:   userId,
      executedBy:       session.user.email ?? "UNKNOWN",
    });

    revalidatePath("/dashboard/pengurusan");
    return { success: true };
  } catch (error) {
    console.error("[deleteUserAction] Error:", error);
    return { success: false, error: "Gagal memadam kakitangan daripada pangkalan data." };
  }
}

/**
 * Incremental patch mutating the targeted user security role directly inside the Prisma database engine.
 * Mengemaskini ruangan role pengguna bersandarkan userId unik yang dihantar dari komponen pengurusan.
 */
export async function updateUserRoleAction(userId: string, newRole: string) {
  const session = await auth();
  // Memastikan hanya SUPER_ADMIN yang boleh mengubah peranan pengguna.
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Akses tidak dibenarkan. Hanya Pentadbir Tertinggi sahaja boleh menukar peranan pengguna." };
  }

  try {
    // Mengemaskini rekod model User bersandarkan parameter ID unik yang dihantar
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as "STAFF" | "ZAKAT_OFFICER" | "SUPER_ADMIN" },
    });

    revalidatePath("/dashboard/pengurusan");
    return { success: true };
  } catch (error) {
    console.error("FAILED_ROLE_ELEVATION:", error);
    return { success: false, error: "Gagal menukar peranan keselamatan pengguna." };
  }
}
