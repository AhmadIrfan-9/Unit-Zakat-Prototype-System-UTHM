// This management query module handles data gathering pipelines and joins user profiles directly to incoming submissions to avoid invalid empty array lookups.

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// This interface defines the chart data item shape returned to the analytics dashboard component.
export interface MonthlyAnalyticsItem {
  period: string;
  total: number;
}

// This interface defines the four KPI statistics block returned to the management dashboard component.
export interface ManagementDashboardStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  approvedAmount: number;
}

// This function fetches all application records and user profiles for the management dashboard using a single Prisma relational include join.
export async function fetchManagementAnalyticsDashboardData() {

  // This guard verifies the requesting session belongs to an authenticated management staff member before executing any query.
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ZAKAT_OFFICER" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Akses tidak dibenarkan. Hanya Pegawai Zakat atau Pentadbir sahaja.");
  }

  // This Prisma query retrieves all deduction applications and resolves the associated User record in a single relational join, eliminating any WHERE IN (NULL) exposure from upstream array mapping.
  const applications = await prisma.zakatStaffSalaryDeductionApplication.findMany({
    orderBy: { submittedAt: "desc" },
    include: {
      // This include directive performs a native SQL LEFT JOIN between ZakatStaffSalaryDeductionApplication and User, guaranteeing the full user profile is hydrated alongside every application row.
      user: {
        select: {
          id:          true,
          name:        true,
          email:       true,
          noPekerja:   true,
          noKP:        true,
          gajiSemasa:  true,
          alamatRumah: true,
          role:        true,
        },
      },
    },
  });

  // This initialisation block zeros all KPI counters before the aggregation loop begins.
  let totalPending  = 0;
  let totalApproved = 0;
  let totalRejected = 0;
  let approvedAmount = 0;

  const monthlySums: Record<string, number> = {};

  // This loop computes status bucket counts and accumulates approved monthly collection totals in a single pass over the result set.
  for (const app of applications) {
    if      (app.status === "PENDING")  totalPending++;
    else if (app.status === "APPROVED") totalApproved++;
    else if (app.status === "REJECTED") totalRejected++;

    // This block resolves the correct deduction amount for each application based on its active deduction type.
    let amount = 0;
    if (app.deductionType === "FIXED_MONTHLY" || app.deductionType === "ORIGINAL_PCB_CHANGE") {
      amount = Number(app.amaunZakatBulanan ?? 0);
    } else if (app.deductionType === "AMOUNT_ADJUSTMENT") {
      amount = Number(app.amaunZakatBaru ?? 0);
    } else if (app.deductionType === "MATCH_PCB") {
      // This default applies the standard PCB-equivalent rate when no explicit amount is stored.
      amount = 150.00;
    }

    if (app.status === "APPROVED") {
      approvedAmount += amount;
      const key = `${app.bulanMula} ${app.tahunMula}`;
      monthlySums[key] = (monthlySums[key] ?? 0) + amount;
    }
  }

  // This map converts the monthly sum dictionary into a chart-ready array of period-total pairs.
  const chartData: MonthlyAnalyticsItem[] = Object.entries(monthlySums).map(
    ([period, total]) => ({ period, total: parseFloat(total.toFixed(2)) })
  );

  const stats: ManagementDashboardStats = {
    totalPending,
    totalApproved,
    totalRejected,
    approvedAmount: parseFloat(approvedAmount.toFixed(2)),
  };

  // This return block serialises the full application list with all Decimal fields converted to plain JS numbers for safe client-side consumption.
  return {
    stats,
    chartData,
    applications: applications.map((app) => ({
      id:            app.id,
      // This block prefers the joined user.name from the relational include over the denormalised namaPenuh column for display accuracy.
      namaPenuh:     app.user?.name      ?? app.namaPenuh,
      noKP:          app.user?.noKP      ?? app.noKP,
      noPekerja:     app.user?.noPekerja ?? app.noPekerja,
      noTelefon:     app.noTelefon,
      alamatRumah:   app.alamatRumah,
      deductionType: app.deductionType,
      amaunZakatBulanan: app.amaunZakatBulanan ? Number(app.amaunZakatBulanan) : null,
      amaunZakatBaru:    app.amaunZakatBaru    ? Number(app.amaunZakatBaru)    : null,
      bulanMula:     app.bulanMula,
      tahunMula:     app.tahunMula,
      status:        app.status,
      submittedAt:   app.submittedAt,
      adminNotes:    app.adminNotes,
    })),
  };
}

// This function transitions an application workflow status to APPROVED or REJECTED and writes optional admin notes to the database.
export async function updateZakatApplicationWorkflowStatus(
  applicationId: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
  adminNotes?: string
) {
  // This guard confirms the requesting session is authenticated and carries the MANAGEMENT_STAFF role before any mutation executes.
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ZAKAT_OFFICER" && session.user.role !== "SUPER_ADMIN")) {
    return {
      success: false,
      error: "Akses tidak dibenarkan. Hanya Pegawai Zakat atau Pentadbir sahaja.",
    };
  }

  try {
    // This explicit await ensures the Prisma UPDATE completes and returns the updated record before this function resolves.
    const updated = await prisma.zakatStaffSalaryDeductionApplication.update({
      where: { id: applicationId },
      data: {
        status,
        adminNotes: adminNotes?.trim() || null,
      },
      select: { id: true, status: true, userId: true },
    });

    // Cipta notifikasi jika permohonan diluluskan (APPROVED) atau ditolak (REJECTED)
    if (status === "APPROVED" || status === "REJECTED") {
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: status === "APPROVED" ? "Permohonan DISAHKAN" : "Permohonan DITOLAK",
          message: status === "APPROVED"
            ? "Tahniah! Permohonan caruman zakat anda telah disahkan dan berkuat kuasa untuk penggajian."
            : `Ditolak: ${adminNotes || "Sila semak butiran atau hubungi pentadbir."}`,
        }
      });
    }

    // This revalidatePath call clears the ISR cache for both affected dashboard routes so the updated status renders immediately.
    revalidatePath("/dashboard/pengurusan");
    revalidatePath("/dashboard/zakat");

    return {
      success: true,
      data: {
        id:     updated.id,
        status: updated.status,
      },
    };

  } catch (error) {
    // This catch block logs the raw error and surfaces a safe Bahasa Melayu message to the management UI without exposing internal details.
    console.error("[updateZakatApplicationWorkflowStatus] Error:", error);
    return {
      success: false,
      error: "Gagal mengemas kini status permohonan di pangkalan data.",
    };
  }
}
