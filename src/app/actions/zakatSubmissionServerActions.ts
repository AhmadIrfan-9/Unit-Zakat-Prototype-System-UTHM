// This server action validates incoming staff payroll deduction requests and commits records to the Prisma database while enforcing data validation rules.

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DeductionType } from "@prisma/client";
import { z } from "zod";

// This constant list stores the valid Bahasa Melayu month names used for the deduction start date field.
const VALID_MALAY_MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
] as const;

// This constant list stores the valid Malaysian state names used for the residential address field.
const VALID_NEGERI = [
  "Johor", "Melaka", "Negeri Sembilan", "Pahang", "Selangor", "Terengganu",
  "Kelantan", "Perak", "Pulau Pinang", "Kedah", "Perlis",
  "W.P. Kuala Lumpur", "W.P. Putrajaya", "W.P. Labuan",
] as const;

// This Zod schema enforces strict type validation on all incoming form payloads before they reach the database.
const submissionSchema = z.object({
  namaPenuh:    z.string().trim().min(1, "Nama penuh diperlukan."),
  noKP:         z.string().trim().min(1, "No. KP diperlukan."),
  noPekerja:    z.string().trim().min(1, "No. Pekerja diperlukan."),
  noTelefon:    z.string().trim().min(1, "No. Telefon diperlukan."),
  alamatRumah:  z.string().trim().min(1, "Alamat kediaman diperlukan."),
  poskod:       z.string().trim().regex(/^\d{5}$/, "Poskod mestilah 5 digit."),
  bandar:       z.string().trim().min(1, "Bandar diperlukan."),
  negeri:       z.enum(VALID_NEGERI, { error: "Sila pilih negeri yang sah." }),
  deductionType: z.enum(
    ["ORIGINAL_PCB_CHANGE", "FIXED_MONTHLY", "AMOUNT_ADJUSTMENT", "MATCH_PCB"],
    { error: "Sila pilih jenis potongan yang sah." }
  ),
  amaunPcbAsal:      z.string().trim().optional(),
  amaunZakatBulanan: z.string().trim().optional(),
  amaunZakatAsal:    z.string().trim().optional(),
  amaunZakatBaru:    z.string().trim().optional(),
  bulanMula:    z.enum(VALID_MALAY_MONTHS, { error: "Sila pilih bulan mula." }),
  tahunMula:    z.string().trim().regex(/^\d{4}$/, "Tahun mula tidak sah."),
  targetDeductionValue: z
    .string()
    .trim()
    .regex(/^\d+\.\d{2}$/, "Amaun mestilah dalam format dua perpuluhan (contoh: 150.00)."),
  pengesahanLafaz:   z.literal("true", { error: "Pengesahan lafaz diperlukan." }),
  persetujuanAkta709: z.string().min(1),
});

// This discriminated union type clearly separates the success and failure response payloads.
type SubmitSuccess = {
  success: true;
  applicationId: string;
  message: string;
};

type SubmitError = {
  success: false;
  error: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export type ZakatSubmissionResult = SubmitSuccess | SubmitError;

// This helper safely parses a decimal string into a number, returning undefined when the input is absent or invalid.
function parseOptionalDecimal(raw: FormDataEntryValue | null): number | undefined {
  if (!raw || String(raw).trim() === "") return undefined;
  const parsed = parseFloat(String(raw));
  return isNaN(parsed) ? undefined : parsed;
}

// This exported async function is the primary entry point for all staff zakat deduction form submissions.
export async function submitZakatApplicationAction(
  _previousState: ZakatSubmissionResult | null,
  formData: FormData
): Promise<ZakatSubmissionResult> {

  // This guard verifies the caller has a valid authenticated session before touching database resources.
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Sesi anda telah tamat. Sila log masuk semula untuk menghantar permohonan.",
    };
  }

  // This block extracts all raw form values into a plain object for Zod validation.
  const rawPayload = {
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
    persetujuanAkta709:   formData.get("persetujuanAkta709") ?? "false",
  };

  // This validation step parses the payload through the Zod schema and returns structured field errors on failure.
  const parsed = submissionSchema.safeParse(rawPayload);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    console.error("[submitZakatApplicationAction] Validation failed:", fieldErrors);
    return {
      success: false,
      error: "Sila lengkapkan semua maklumat borang dengan betul.",
      fieldErrors,
    };
  }

  const v = parsed.data;

  // This try-catch block wraps the Prisma write operation to guarantee clean error reporting on any database failure.
  try {

    // This Prisma call explicitly awaits the database insert operation before returning a response to the client.
    const newRecord = await prisma.zakatStaffSalaryDeductionApplication.create({
      data: {
        userId:    session.user.id,
        namaPenuh: v.namaPenuh,
        noKP:      v.noKP,
        noPekerja: v.noPekerja,
        noTelefon: v.noTelefon,
        alamatRumah: v.alamatRumah,
        poskod:    v.poskod,
        bandar:    v.bandar,
        negeri:    v.negeri,
        deductionType: v.deductionType as DeductionType,
        bulanMula: v.bulanMula,
        tahunMula: v.tahunMula,
        pengesahanLafaz:    true,
        persetujuanAkta709: true,

        // This conditional block maps optional numeric amounts based on the chosen deduction type.
        amaunPcbAsal:
          v.deductionType === "ORIGINAL_PCB_CHANGE"
            ? parseOptionalDecimal(formData.get("amaunPcbAsal"))
            : undefined,

        amaunZakatBulanan:
          v.deductionType === "ORIGINAL_PCB_CHANGE" || v.deductionType === "FIXED_MONTHLY"
            ? parseOptionalDecimal(formData.get("amaunZakatBulanan"))
            : undefined,

        amaunZakatAsal:
          v.deductionType === "AMOUNT_ADJUSTMENT"
            ? parseOptionalDecimal(formData.get("amaunZakatAsal"))
            : undefined,

        amaunZakatBaru:
          v.deductionType === "AMOUNT_ADJUSTMENT"
            ? parseOptionalDecimal(formData.get("amaunZakatBaru"))
            : undefined,
      },
      select: { id: true },
    });

    // This revalidation call purges the ISR cache for both dashboard routes so managers see the new record immediately.
    revalidatePath("/dashboard/pengurusan");
    revalidatePath("/dashboard/zakat");

    console.log("[submitZakatApplicationAction] Record created:", newRecord.id);

    return {
      success: true,
      applicationId: newRecord.id,
      message:
        "Permohonan Berjaya Dihantar. Borang anda telah diterima secara rasmi dan akan diproses dalam tempoh masa yang ditetapkan oleh Unit Pengurusan Zakat UTHM.",
    };

  } catch (dbError) {
    // This catch block logs the raw database error and returns a safe, user-facing message without exposing internals.
    console.error("[submitZakatApplicationAction] Database write failed:", dbError);
    return {
      success: false,
      error: "Ralat pangkalan data berlaku semasa menyimpan permohonan anda. Sila cuba semula atau hubungi pentadbir sistem.",
    };
  }
}
