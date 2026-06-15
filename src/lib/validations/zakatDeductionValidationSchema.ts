// src/lib/validations/zakatDeductionValidationSchema.ts
import { z } from "zod";

// This list holds the official names of the twelve months in Bahasa Melayu.
export const MALAY_MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember"
] as const;

// This list catalogs the valid administrative states and territories across Malaysia.
export const NEGERI_LIST = [
  "Johor", "Melaka", "Negeri Sembilan", "Pahang", "Selangor", "Terengganu",
  "Kelantan", "Perak", "Pulau Pinang", "Kedah", "Perlis",
  "W.P. Kuala Lumpur", "W.P. Putrajaya", "W.P. Labuan"
] as const;

// This regular expression validates that currency amounts are formatted with exactly two decimal places.
export const currencyRegex = /^\d+\.\d{2}$/;

// This schema ensures all user inputs and money formats are correct before saving.
export const zakatDeductionValidationSchema = z.object({
  // This rule validates that the full name of the employee is entered as a non-empty string.
  namaPenuh: z
    .string({ error: "Nama penuh diperlukan." })
    .trim()
    .min(1, "Nama penuh diperlukan."),
  
  // This rule validates that the identity card number is exactly twelve numeric digits without hyphens.
  noKP: z
    .string({ error: "No. Kad Pengenalan diperlukan." })
    .trim()
    .regex(/^\d{12}$/, "No. Kad Pengenalan mestilah tepat 12 digit tanpa tanda sempang (contoh: 890520015432)."),
  
  // This rule validates that the university staff identification code is provided.
  noPekerja: z
    .string({ error: "No. Pekerja diperlukan." })
    .trim()
    .min(1, "No. Pekerja diperlukan."),
  
  // This rule validates that the telephone contact number is registered as a non-empty string.
  noTelefon: z
    .string({ error: "No. Telefon diperlukan." })
    .trim()
    .min(1, "No. Telefon diperlukan."),
  
  // This rule validates that the physical home address details are fully filled.
  alamatRumah: z
    .string({ error: "Alamat rumah diperlukan." })
    .trim()
    .min(1, "Alamat rumah diperlukan."),
  
  // This rule validates that the Malaysian postal routing code is exactly five digits.
  poskod: z
    .string({ error: "Poskod diperlukan." })
    .trim()
    .regex(/^\d{5}$/, "Poskod mestilah tepat 5 digit (contoh: 86400)."),
  
  // This rule validates that the local municipality city name is provided.
  bandar: z
    .string({ error: "Bandar diperlukan." })
    .trim()
    .min(1, "Bandar diperlukan."),
  
  // This rule validates that the regional state is chosen from the official select options.
  negeri: z.enum(NEGERI_LIST, {
    error: "Sila pilih negeri yang sah daripada senarai."
  }),

  // This rule validates that the staff member chooses exactly one valid deduction category.
  deductionType: z.enum(
    ["ORIGINAL_PCB_CHANGE", "FIXED_MONTHLY", "AMOUNT_ADJUSTMENT", "MATCH_PCB"],
    { error: "Sila pilih sekurang-kurangnya satu jenis potongan." }
  ),

  // This field represents the optional Potongan Cukai Bulanan amount before change.
  amaunPcbAsal: z.string().trim().optional(),
  
  // This field represents the optional target monthly zakat deduction amount.
  amaunZakatBulanan: z.string().trim().optional(),
  
  // This field represents the optional current monthly zakat amount before adjustment.
  amaunZakatAsal: z.string().trim().optional(),
  
  // This field represents the optional adjusted monthly zakat amount after adjustment.
  amaunZakatBaru: z.string().trim().optional(),

  // This rule validates that the starting month for the deduction is selected.
  bulanMula: z.string({ error: "Sila pilih bulan mula potongan." }).min(1, "Sila pilih bulan mula potongan."),
  
  // This rule validates that the starting year for the deduction is selected.
  tahunMula: z.string({ error: "Sila pilih tahun mula potongan." }).min(1, "Sila pilih tahun mula potongan."),
  
  // This rule validates that the target salary deduction value matches the strict monetary decimal regex.
  targetDeductionValue: z
    .string({ error: "Amaun potongan zakat diperlukan." })
    .trim()
    .regex(currencyRegex, "Amaun potongan mestilah dalam format dua tempat perpuluhan (contoh: 300.00)."),

  // This rule validates that the employee has marked the declaration acknowledgment checkbox.
  pengesahanLafaz: z
    .string()
    .refine((val) => val === "true", {
      message: "Anda mesti menanda kotak pengesahan lafaz untuk meneruskan.",
    }),
}).superRefine((validatedFields, ctx) => {
  // This rule checks that valid original PCB and new zakat values are entered for changing original PCB.
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

  // This rule checks that a valid monthly deduction value is provided for a fixed monthly rate.
  if (validatedFields.deductionType === "FIXED_MONTHLY") {
    if (!validatedFields.amaunZakatBulanan || !currencyRegex.test(validatedFields.amaunZakatBulanan)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amaun Zakat Bulanan diperlukan dalam format dua perpuluhan (contoh: 100.00).",
        path: ["amaunZakatBulanan"],
      });
    }
  }

  // This rule checks that valid current and target values are provided for adjusting deduction levels.
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

export type ZakatStaffSalaryDeductionInput = z.infer<typeof zakatDeductionValidationSchema>;
export type ZakatStaffSalaryDeductionFieldErrors = Partial<Record<keyof ZakatStaffSalaryDeductionInput, string[]>>;
