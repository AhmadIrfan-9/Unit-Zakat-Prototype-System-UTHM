// src/app/actions/zakat-salary-deduction-server-actions.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { zakatSalaryDeductionSchema, type ZakatStaffSalaryDeductionFieldErrors } from "@/lib/validations/zakat-salary-deduction-schema";
import { revalidatePath } from "next/cache";
import { DeductionType } from "@prisma/client";

type ActionSuccess = {
  success: true;
  data: {
    applicationId: string;
  };
};

type ActionError = {
  success: false;
  error: string;
  fieldErrors?: ZakatStaffSalaryDeductionFieldErrors;
};

export type ZakatStaffSalaryDeductionActionResult = ActionSuccess | ActionError;

// Prevent numeric parsing errors and rounding discrepancies by standardizing incoming amount strings.
function parseDecimal(amountString: FormDataEntryValue | null): number | undefined {
  if (!amountString || String(amountString).trim() === "") return undefined;
  const numericAmount = parseFloat(String(amountString));
  return isNaN(numericAmount) ? undefined : numericAmount;
}

export async function executeZakatSalaryDeductionDatabaseInsertion(
  _previousState: ZakatStaffSalaryDeductionActionResult | null,
  formData: FormData
): Promise<ZakatStaffSalaryDeductionActionResult> {
  // Prevent unauthorized data manipulation by validating active sessions before database interaction.
  const activeSession = await auth();
  if (!activeSession?.user?.id) {
    return {
      success: false,
      error: "Sesi anda telah tamat. Sila log masuk semula.",
    };
  }

  // Secure client input structures against malicious payloads by mapping incoming form parameters.
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

  // Enforce business rules and payload format accuracy using strict schema validations.
  const parsedValidation = zakatSalaryDeductionSchema.safeParse(rawInput);
  if (!parsedValidation.success) {
    return {
      success: false,
      error: "Sila lengkapkan maklumat borang dengan betul.",
      fieldErrors: parsedValidation.error.flatten().fieldErrors as ZakatStaffSalaryDeductionFieldErrors,
    };
  }

  const validatedFields = parsedValidation.data;

  // Respect Islamic jurisprudence rules requiring explicit agreement declarations before logging zakat covenants.
  if (validatedFields.pengesahanLafaz !== "true") {
    return {
      success: false,
      error: "Lafaz membayar zakat mestilah disahkan sebelum menghantar.",
    };
  }

  // Maintain historical employee transaction tracking by committing deduction items to database records.
  try {
    const newSubmission = await prisma.zakatStaffSalaryDeductionSubmission.create({
      data: {
        userId:            activeSession.user.id,
        namaPenuh:         validatedFields.namaPenuh,
        noKP:              validatedFields.noKP,
        noPekerja:         validatedFields.noPekerja,
        noTelefon:         validatedFields.noTelefon,
        alamatRumah:       validatedFields.alamatRumah,
        poskod:            validatedFields.poskod,
        bandar:            validatedFields.bandar,
        negeri:            validatedFields.negeri,
        deductionType:     validatedFields.deductionType as DeductionType,
        bulanMula:         validatedFields.bulanMula,
        tahunMula:         validatedFields.tahunMula,
        pengesahanLafaz:   true,

        amaunPcbAsal:
          validatedFields.deductionType === "ORIGINAL_PCB_CHANGE"
            ? parseDecimal(formData.get("amaunPcbAsal"))
            : undefined,
        
        amaunZakatBulanan:
          validatedFields.deductionType === "ORIGINAL_PCB_CHANGE" || validatedFields.deductionType === "FIXED_MONTHLY"
            ? parseDecimal(formData.get("amaunZakatBulanan"))
            : undefined,
        
        amaunZakatAsal:
          validatedFields.deductionType === "AMOUNT_ADJUSTMENT"
            ? parseDecimal(formData.get("amaunZakatAsal"))
            : undefined,
        
        amaunZakatBaru:
          validatedFields.deductionType === "AMOUNT_ADJUSTMENT"
            ? parseDecimal(formData.get("amaunZakatBaru"))
            : undefined,
      },
      select: { id: true },
    });

    // Avoid stale layout views in client viewports by clearing browser caches for related pages.
    revalidatePath("/");
    revalidatePath("/dashboard/zakat");

    return {
      success: true,
      data: {
        applicationId: newSubmission.id,
      },
    };
  } catch (dbWriteError) {
    console.error("[executeZakatSalaryDeductionDatabaseInsertion] Error saving submission:", dbWriteError);
    return {
      success: false,
      error: "Ralat pangkalan data berlaku semasa memproses permohonan anda.",
    };
  }
}
