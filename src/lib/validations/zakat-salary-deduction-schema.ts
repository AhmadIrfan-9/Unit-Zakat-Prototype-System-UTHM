// src/lib/validations/zakat-salary-deduction-schema.ts
import { z } from "zod";

// Predefine the list of months to match physical payroll administration requirements.
export const MALAY_MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember"
] as const;

// Predefine standard Malaysian state names to avoid database fragmentation from free text inputs.
export const NEGERI_LIST = [
  "Johor", "Melaka", "Negeri Sembilan", "Pahang", "Selangor", "Terengganu",
  "Kelantan", "Perak", "Pulau Pinang", "Kedah", "Perlis",
  "W.P. Kuala Lumpur", "W.P. Putrajaya", "W.P. Labuan"
] as const;

// Verify exact two-decimal layout to guarantee bank processing alignment and avoid rounding discrepancies.
export const currencyRegex = /^\d+\.\d{2}$/;

// Structure constraints on the entire salary deduction data model to maintain administrative accuracy.
export const zakatSalaryDeductionSchema = z.object({
  // Require name input so administrative staff can uniquely verify employee records.
  namaPenuh: z
    .string({ error: "Nama penuh diperlukan." })
    .trim()
    .min(1, "Nama penuh diperlukan."),
  
  // Require exactly 12 digits to conform strictly to the National Registration Identity Card specification.
  noKP: z
    .string({ error: "No. Kad Pengenalan diperlukan." })
    .trim()
    .regex(/^\d{12}$/, "No. Kad Pengenalan mestilah tepat 12 digit tanpa tanda sempang (contoh: 890520015432)."),
  
  // Require employee code to associate records with the university Human Resources directory.
  noPekerja: z
    .string({ error: "No. Pekerja diperlukan." })
    .trim()
    .min(1, "No. Pekerja diperlukan."),
  
  // Require phone details so support desks can contact applicants during validation issues.
  noTelefon: z
    .string({ error: "No. Telefon diperlukan." })
    .trim()
    .min(1, "No. Telefon diperlukan."),
  
  // Require physical address parameters to support tax deduction slip mail delivery.
  alamatRumah: z
    .string({ error: "Alamat rumah diperlukan." })
    .trim()
    .min(1, "Alamat rumah diperlukan."),
  
  // Enforce exactly 5 digits to match Pos Malaysia routing area codes.
  poskod: z
    .string({ error: "Poskod diperlukan." })
    .trim()
    .regex(/^\d{5}$/, "Poskod mestilah tepat 5 digit (contoh: 86400)."),
  
  // Require city details to categorize applicants by local municipality divisions.
  bandar: z
    .string({ error: "Bandar diperlukan." })
    .trim()
    .min(1, "Bandar diperlukan."),
  
  // Enforce rigid state categories to align with regional state religious council distributions.
  negeri: z.enum(NEGERI_LIST, {
    error: "Sila pilih negeri yang sah daripada senarai."
  }),

  // Limit selection to valid deduction categories to align with payroll processing configurations.
  deductionType: z.enum(
    ["ORIGINAL_PCB_CHANGE", "FIXED_MONTHLY", "AMOUNT_ADJUSTMENT", "MATCH_PCB"],
    { error: "Sila pilih sekurang-kurangnya satu jenis potongan." }
  ),

  amaunPcbAsal: z.string().trim().optional(),
  amaunZakatBulanan: z.string().trim().optional(),
  amaunZakatAsal: z.string().trim().optional(),
  amaunZakatBaru: z.string().trim().optional(),

  bulanMula: z.string({ error: "Sila pilih bulan mula potongan." }).min(1, "Sila pilih bulan mula potongan."),
  tahunMula: z.string({ error: "Sila pilih tahun mula potongan." }).min(1, "Sila pilih tahun mula potongan."),
  
  // Lock target values to currency formats to avoid float division anomalies during database write operations.
  targetDeductionValue: z
    .string({ error: "Amaun potongan zakat diperlukan." })
    .trim()
    .regex(currencyRegex, "Amaun potongan mestilah dalam format dua tempat perpuluhan (contoh: 300.00)."),

  // Require explicit confirmation to validate religious compliance of electronic declarations.
  pengesahanLafaz: z
    .string()
    .refine((val) => val === "true", {
      message: "Anda mesti menanda kotak pengesahan lafaz untuk meneruskan.",
    }),
}).superRefine((validatedFields, ctx) => {
  // Prevent missing amounts during original PCB changes to avoid processing empty payroll fields.
  if (validatedFields.deductionType === "ORIGINAL_PCB_CHANGE") {
    if (!validatedFields.amaunPcbAsal || !currencyRegex.test(validatedFields.amaunPcbAsal)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amaun PCB Asal diperlukan dalam format dua perpuluhan (contoh: 250.00).",
        path: ["amaunPcbAsal"],
      });
    }
    if (!validatedFields.amaunZakatBulanan || !currencyRegex.test(validatedFields.amaunZakatBulanan)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amaun Zakat Bulanan diperlukan dalam format dua perpuluhan (contoh: 150.00).",
        path: ["amaunZakatBulanan"],
      });
    }
  }

  // Prevent missing values for fixed monthly deductions to block processing of zero-value items.
  if (validatedFields.deductionType === "FIXED_MONTHLY") {
    if (!validatedFields.amaunZakatBulanan || !currencyRegex.test(validatedFields.amaunZakatBulanan)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amaun Zakat Bulanan diperlukan dalam format dua perpuluhan (contoh: 100.00).",
        path: ["amaunZakatBulanan"],
      });
    }
  }

  // Prevent invalid ranges during adjustment choices to enforce valid mathematical transition thresholds.
  if (validatedFields.deductionType === "AMOUNT_ADJUSTMENT") {
    if (!validatedFields.amaunZakatAsal || !currencyRegex.test(validatedFields.amaunZakatAsal)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amaun Zakat Asal (Semasa) diperlukan dalam format dua perpuluhan (contoh: 120.00).",
        path: ["amaunZakatAsal"],
      });
    }
    if (!validatedFields.amaunZakatBaru || !currencyRegex.test(validatedFields.amaunZakatBaru)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amaun Zakat Baru diperlukan dalam format dua perpuluhan (contoh: 180.00).",
        path: ["amaunZakatBaru"],
      });
    }
  }
});

export type ZakatStaffSalaryDeductionInput = z.infer<typeof zakatSalaryDeductionSchema>;
export type ZakatStaffSalaryDeductionFieldErrors = Partial<Record<keyof ZakatStaffSalaryDeductionInput, string[]>>;
