// src/app/actions/zakatSalaryDeductionManagementServerActions.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// This interface details the return model representation for dashboard charts.
export interface MonthlyAnalyticsItem {
  period: string;
  total: number;
}

// This interface lists the dashboard statistics computed for administrative managers.
export interface ManagementDashboardStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  approvedAmount: number;
}

// This module holds server-side database actions used by management to compute collection analytics sums and update application processing states.
export async function fetchManagementAnalyticsDashboardData() {
  const session = await auth();
  if (!session?.user || session.user.role !== "MANAGEMENT_STAFF") {
    throw new Error("Akses tidak dibenarkan. Hanya staf pengurusan sahaja.");
  }

  // Retrieve all submitted applications from the database.
  const applications = await prisma.zakatStaffSalaryDeductionApplication.findMany({
    orderBy: { submittedAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          noPekerja: true,
          gajiSemasa: true,
        },
      },
    },
  });

  // Calculate sum counts and status statistics.
  let totalPending = 0;
  let totalApproved = 0;
  let totalRejected = 0;
  let approvedAmount = 0;

  const monthlySums: Record<string, number> = {};

  for (const app of applications) {
    if (app.status === "PENDING") {
      totalPending++;
    } else if (app.status === "APPROVED") {
      totalApproved++;
    } else if (app.status === "REJECTED") {
      totalRejected++;
    }

    // Determine the calculated monthly amount of this submission.
    let amount = 0;
    if (app.deductionType === "FIXED_MONTHLY" || app.deductionType === "ORIGINAL_PCB_CHANGE") {
      amount = Number(app.amaunZakatBulanan || 0);
    } else if (app.deductionType === "AMOUNT_ADJUSTMENT") {
      amount = Number(app.amaunZakatBaru || 0);
    } else if (app.deductionType === "MATCH_PCB") {
      // Use standard default value if not specified
      amount = 150.00;
    }

    if (app.status === "APPROVED") {
      approvedAmount += amount;
      const key = `${app.bulanMula} ${app.tahunMula}`;
      monthlySums[key] = (monthlySums[key] || 0) + amount;
    }
  }

  // Convert monthly aggregate groups into chart-ready array entries.
  const chartData: MonthlyAnalyticsItem[] = Object.entries(monthlySums).map(([period, total]) => ({
    period,
    total: parseFloat(total.toFixed(2)),
  }));

  const stats: ManagementDashboardStats = {
    totalPending,
    totalApproved,
    totalRejected,
    approvedAmount: parseFloat(approvedAmount.toFixed(2)),
  };

  return {
    stats,
    chartData,
    applications: applications.map(app => ({
      id: app.id,
      namaPenuh: app.namaPenuh,
      noKP: app.noKP,
      noPekerja: app.noPekerja,
      noTelefon: app.noTelefon,
      alamatRumah: app.alamatRumah,
      deductionType: app.deductionType,
      amaunZakatBulanan: app.amaunZakatBulanan ? Number(app.amaunZakatBulanan) : null,
      amaunZakatBaru: app.amaunZakatBaru ? Number(app.amaunZakatBaru) : null,
      bulanMula: app.bulanMula,
      tahunMula: app.tahunMula,
      status: app.status,
      submittedAt: app.submittedAt,
      adminNotes: app.adminNotes,
    })),
  };
}

// This server mutation transitions application workflow statuses between pending, approved, or rejected states.
export async function updateZakatApplicationWorkflowStatus(
  applicationId: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
  adminNotes?: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "MANAGEMENT_STAFF") {
    return {
      success: false,
      error: "Akses tidak dibenarkan. Hanya staf pengurusan sahaja.",
    };
  }

  try {
    // Perform database update operation to alter the workflow status state.
    const updated = await prisma.zakatStaffSalaryDeductionApplication.update({
      where: { id: applicationId },
      data: {
        status,
        adminNotes: adminNotes || null,
      },
    });

    // Revalidate paths to update visual layout data caches instantly.
    revalidatePath("/dashboard/pengurusan");
    revalidatePath("/dashboard/zakat");

    return {
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
      },
    };
  } catch (error) {
    console.error("[updateZakatApplicationWorkflowStatus] Error:", error);
    return {
      success: false,
      error: "Gagal mengemas kini status permohonan di pangkalan data.",
    };
  }
}
