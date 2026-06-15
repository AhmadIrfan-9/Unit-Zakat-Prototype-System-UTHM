// src/app/actions/zakat.ts
//
// React 19 Server Action for submitting Zakat applications.
// Performs session verification, validates form input via Zod, and records application via Prisma.

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { zakatApplicationSchema, type ZakatFieldErrors } from "@/lib/validations/zakat";
import { revalidatePath } from "next/cache";
import { DeductionType } from "@prisma/client";

type ActionSuccess = {
  status: "success";
  applicationId: string;
  message: string;
};

type ActionError = {
  status: "error";
  message: string;
  fieldErrors?: ZakatFieldErrors;
};

export type ZakatActionResult = ActionSuccess | ActionError;

// Helper function to parse decimal inputs safely for Prisma
function parseDecimal(value: FormDataEntryValue | null): number | undefined {
  if (!value || String(value).trim() === "") return undefined;
  const n = parseFloat(String(value));
  return isNaN(n) ? undefined : n;
}

export async function submitZakatFormAction(
  _prevState: ZakatActionResult | null,
  formData: FormData
): Promise<ZakatActionResult> {
  // 1. Authenticate the active user session
  const session = await auth();
  if (!session?.user?.id) {
    return {
      status: "error",
      message: "Sesi anda telah tamat atau tidak sah. Sila log masuk semula.",
    };
  }

  // 2. Map form data parameters to object
  const rawInput = {
    namaPenuh:            formData.get("namaPenuh"),
    noKP:                 formData.get("noKP"),
    noPekerja:            formData.get("noPekerja"),
    noTelefon:            formData.get("noTelefon"),
    alamatRumah:          formData.get("alamatRumah"),
    poskod:               formData.get("poskod"),
    bandar:               formData.get("bandar"),
    negeri:               formData.get("negeri"),
    deductionType:        formData.get("deductionType"),
    amaunPcbAsal:         formData.get("amaunPcbAsal"),
    amaunZakatBulanan:    formData.get("amaunZakatBulanan"),
    amaunZakatAsal:       formData.get("amaunZakatAsal"),
    amaunZakatBaru:       formData.get("amaunZakatBaru"),
    bulanMula:            formData.get("bulanMula"),
    tahunMula:            formData.get("tahunMula"),
    targetDeductionValue: formData.get("targetDeductionValue"),
    pengesahanLafaz:      formData.get("pengesahanLafaz") ?? "false",
  };

  // 3. Strict schema parsing
  const parsed = zakatApplicationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Sila lengkapkan maklumat borang dengan betul.",
      fieldErrors: parsed.error.flatten().fieldErrors as ZakatFieldErrors,
    };
  }

  const data = parsed.data;

  // 4. Double guard for electronic certification
  if (data.pengesahanLafaz !== "true") {
    return {
      status: "error",
      message: "Lafaz membayar zakat mestilah disahkan sebelum menghantar.",
    };
  }

  // 5. Database ingestion using Prisma
  try {
    const application = await prisma.zakatApplication.create({
      data: {
        userId:            session.user.id,
        namaPenuh:         data.namaPenuh,
        noKP:              data.noKP,
        noPekerja:         data.noPekerja,
        noTelefon:         data.noTelefon,
        alamatRumah:       data.alamatRumah,
        poskod:            data.poskod,
        bandar:            data.bandar,
        negeri:            data.negeri,
        deductionType:     data.deductionType as DeductionType,
        bulanMula:         data.bulanMula,
        tahunMula:         data.tahunMula,
        pengesahanLafaz:   true,

        // Conditional decimal allocations
        amaunPcbAsal:
          data.deductionType === "ORIGINAL_PCB_CHANGE"
            ? parseDecimal(formData.get("amaunPcbAsal"))
            : undefined,
        
        amaunZakatBulanan:
          data.deductionType === "ORIGINAL_PCB_CHANGE" || data.deductionType === "FIXED_MONTHLY"
            ? parseDecimal(formData.get("amaunZakatBulanan"))
            : undefined,
        
        amaunZakatAsal:
          data.deductionType === "AMOUNT_ADJUSTMENT"
            ? parseDecimal(formData.get("amaunZakatAsal"))
            : undefined,
        
        amaunZakatBaru:
          data.deductionType === "AMOUNT_ADJUSTMENT"
            ? parseDecimal(formData.get("amaunZakatBaru"))
            : undefined,
      },
      select: { id: true },
    });

    // 6. Invalidate layout caches to refresh data views
    revalidatePath("/");
    revalidatePath("/dashboard/zakat");

    return {
      status: "success",
      applicationId: application.id,
      message: "Permohonan potongan zakat gaji anda berjaya dihantar ke sistem.",
    };
  } catch (error) {
    console.error("[submitZakatFormAction] Error committing to database:", error);
    return {
      status: "error",
      message: "Ralat pangkalan data berlaku semasa memproses permohonan anda.",
    };
  }
}
