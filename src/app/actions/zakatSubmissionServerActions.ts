// This server mutation function validates employee session metadata blocks and commits payroll deduction forms to the database using explicit relationship binding.

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DeductionType } from "@prisma/client";
import { z } from "zod";
import fs from "fs";
import path from "path";

// This constant array stores the official Bahasa Melayu month names used for the deduction start date field validation.
const VALID_MALAY_MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
] as const;

// This constant array stores the complete list of valid Malaysian state names used for the residential address field validation.
const VALID_NEGERI = [
  "Johor", "Melaka", "Negeri Sembilan", "Pahang", "Selangor", "Terengganu",
  "Kelantan", "Perak", "Pulau Pinang", "Kedah", "Perlis",
  "W.P. Kuala Lumpur", "W.P. Putrajaya", "W.P. Labuan",
] as const;

// This Zod schema enforces strict type and format validation on all incoming form payloads before they touch the database.
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
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Amaun mestilah dalam format angka (contoh: 150.00)."
    ),
  pengesahanLafaz:    z.literal("true", { error: "Pengesahan lafaz diperlukan." }),
  persetujuanAkta709: z.literal("true", { error: "Persetujuan Akta 709 diperlukan." }),
});

// This discriminated union type cleanly separates success and failure response payloads returned to the client.
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

// This helper function safely converts an optional form string value into a floating-point number, returning undefined for blank or non-numeric inputs.
function parseOptionalDecimal(raw: FormDataEntryValue | null): number | undefined {
  if (!raw || String(raw).trim() === "") return undefined;
  const parsed = parseFloat(String(raw));
  return isNaN(parsed) ? undefined : parsed;
}

// This exported async server action is the primary entry point for all staff zakat salary deduction form submissions.
export async function submitZakatApplicationAction(
  _previousState: ZakatSubmissionResult | null,
  formData: FormData
): Promise<ZakatSubmissionResult> {

  // This guard clause verifies the caller holds a valid authenticated session with a resolved user ID before touching any database resource.
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error:
        "Sesi anda telah tamat atau tidak sah. Sila log masuk semula untuk menghantar permohonan.",
    };
  }

  // This block extracts all raw form field values into a plain object keyed for Zod schema validation.
  const rawPayload = {
    namaPenuh:            formData.get("namaPenuh")?.toString() ?? "",
    noKP:                 formData.get("noKP")?.toString() ?? "",
    noPekerja:            formData.get("noPekerja")?.toString() ?? "",
    noTelefon:            formData.get("noTelefon")?.toString() ?? "",
    alamatRumah:          formData.get("alamatRumah")?.toString() ?? "",
    poskod:               formData.get("poskod")?.toString() ?? "",
    bandar:               formData.get("bandar")?.toString() ?? "",
    negeri:               formData.get("negeri")?.toString() ?? undefined,
    deductionType:        formData.get("deductionType")?.toString() ?? undefined,
    amaunPcbAsal:         formData.get("amaunPcbAsal")?.toString() ?? undefined,
    amaunZakatBulanan:    formData.get("amaunZakatBulanan")?.toString() ?? undefined,
    amaunZakatAsal:       formData.get("amaunZakatAsal")?.toString() ?? undefined,
    amaunZakatBaru:       formData.get("amaunZakatBaru")?.toString() ?? undefined,
    bulanMula:            formData.get("bulanMula")?.toString() ?? undefined,
    tahunMula:            formData.get("tahunMula")?.toString() ?? "",
    targetDeductionValue: formData.get("targetDeductionValue")?.toString() ?? "",
    pengesahanLafaz:      formData.get("pengesahanLafaz")?.toString() ?? "false",
    persetujuanAkta709:   formData.get("persetujuanAkta709")?.toString() ?? "false",
  };

  // This validation step runs the raw payload through the Zod schema and returns structured field-level errors on failure.
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

  // Sediakan folder muat naik dan tulis fail jika ada fail disertakan
  let payslipUrl: string | undefined = undefined;
  try {
    const fileEntry = formData.get("payslipFile");
    if (fileEntry && fileEntry instanceof File && fileEntry.size > 0) {
      const bytes = await fileEntry.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filename = `${Date.now()}-${fileEntry.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const filePath = path.join(uploadDir, filename);
      await fs.promises.writeFile(filePath, buffer);
      payslipUrl = `/uploads/${filename}`;
    }
  } catch (err) {
    console.error("Gagal menyimpan slip gaji:", err);
  }

  // This try-catch block wraps the Prisma write operation to isolate and report database-layer failures without exposing internal stack traces.
  try {
    // This explicit await ensures the Prisma INSERT statement completes and returns the new record ID before this function resolves.
    const newRecord = await prisma.zakatStaffSalaryDeductionApplication.create({
      data: {
        // This userId binding anchors the submission record permanently to the authenticated employee's account.
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
        payslipUrl: payslipUrl,

        // This conditional block maps optional decimal amounts to the corresponding schema columns based on the selected deduction type.
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

    // This revalidatePath call purges the ISR cache for both dashboard routes so management sees the new record immediately on next load.
    revalidatePath("/dashboard/pengurusan");
    revalidatePath("/dashboard/zakat");

    console.log("[submitZakatApplicationAction] Record committed:", newRecord.id);

    // This return block delivers the DBP-validated success message payload to the client form component for display.
    return {
      success: true,
      applicationId: newRecord.id,
      message:
        "Permohonan Berjaya Dihantar. Borang anda telah diterima secara rasmi dan akan diproses dalam tempoh masa yang ditetapkan oleh Unit Pengurusan Zakat UTHM.",
    };

  } catch (dbError) {
    // This catch block logs the raw database error object and returns a safe user-facing message without exposing internal implementation details.
    console.error("[submitZakatApplicationAction] Database write failed:", dbError);
    return {
      success: false,
      error:
        "Ralat pangkalan data berlaku semasa menyimpan permohonan anda. Sila cuba semula atau hubungi pentadbir sistem.",
    };
  }
}
