// src/app/actions/zakatDeductionServerActions.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { zakatDeductionValidationSchema, type ZakatStaffSalaryDeductionFieldErrors } from "@/lib/validations/zakatDeductionValidationSchema";
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

// This server function securely handles the logic of saving the form data to our database.
export async function handleZakatDeductionSubmission(
  _previousState: ZakatStaffSalaryDeductionActionResult | null,
  formData: FormData
): Promise<ZakatStaffSalaryDeductionActionResult> {
  // This step verifies that the user session is active and authentic before proceeding.
  const activeSession = await auth();
  if (!activeSession?.user?.id) {
    return {
      success: false,
      error: "Sesi anda telah tamat. Sila log masuk semula.",
    };
  }

  // This step structures raw form parameters to prepare them for parsing.
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

  // This step parses user inputs against Zod schema rules to ensure data integrity.
  const parsedValidation = zakatDeductionValidationSchema.safeParse(rawInput);
  if (!parsedValidation.success) {
    return {
      success: false,
      error: "Sila lengkapkan maklumat borang dengan betul.",
      fieldErrors: parsedValidation.error.flatten().fieldErrors as ZakatStaffSalaryDeductionFieldErrors,
    };
  }

  const validatedFields = parsedValidation.data;

  // This step checks that the user checked the electronic lafaz verification box.
  if (validatedFields.pengesahanLafaz !== "true") {
    return {
      success: false,
      error: "Lafaz membayar zakat mestilah disahkan sebelum menghantar.",
    };
  }

  // This step commits the verified salary deduction request data to the database.
  try {
    const newSubmission = await prisma.zakatStaffSalaryDeduction.create({
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

    // This step clears cache regions to refresh layouts across active pages in real time.
    revalidatePath("/");
    revalidatePath("/dashboard/zakat");

    return {
      success: true,
      data: {
        applicationId: newSubmission.id,
      },
    };
  } catch (dbWriteError) {
    console.error("[handleZakatDeductionSubmission] Error saving submission:", dbWriteError);
    return {
      success: false,
      error: "Ralat pangkalan data berlaku semasa memproses permohonan anda.",
    };
  }
}
