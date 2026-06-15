// src/lib/validations/zakat.ts
//
// Strict Zod validation schema for the Zakat Salary Deduction Application Form.
// Validates Malaysian personal details, strict decimal formatting, and conditional deduction amounts.

import { z } from "zod";

export const MALAY_MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember"
] as const;

export const NEGERI_LIST = [
  "Johor", "Melaka", "Negeri Sembilan", "Pahang", "Selangor", "Terengganu",
  "Kelantan", "Perak", "Pulau Pinang", "Kedah", "Perlis",
  "W.P. Kuala Lumpur", "W.P. Putrajaya", "W.P. Labuan"
] as const;

// Currency format validator: exactly two decimal places, e.g. 300.00
export const currencyRegex = /^\d+\.\d{2}$/;

export const zakatApplicationSchema = z.object({
  // BAHAGIAN A: MAKLUMAT PERIBADI
  namaPenuh: z
    .string({ error: "Nama penuh diperlukan." })
    .trim()
    .min(1, "Nama penuh diperlukan."),
  
  noKP: z
    .string({ error: "No. Kad Pengenalan diperlukan." })
    .trim()
    .regex(/^\d{12}$/, "No. Kad Pengenalan mestilah tepat 12 digit tanpa tanda sempang (contoh: 890520015432)."),
  
  noPekerja: z
    .string({ error: "No. Pekerja diperlukan." })
    .trim()
    .min(1, "No. Pekerja diperlukan."),
  
  noTelefon: z
    .string({ error: "No. Telefon diperlukan." })
    .trim()
    .min(1, "No. Telefon diperlukan."),
  
  alamatRumah: z
    .string({ error: "Alamat rumah diperlukan." })
    .trim()
    .min(1, "Alamat rumah diperlukan."),
  
  poskod: z
    .string({ error: "Poskod diperlukan." })
    .trim()
    .regex(/^\d{5}$/, "Poskod mestilah tepat 5 digit (contoh: 86400)."),
  
  bandar: z
    .string({ error: "Bandar diperlukan." })
    .trim()
    .min(1, "Bandar diperlukan."),
  
  negeri: z.enum(NEGERI_LIST, {
    error: "Sila pilih negeri yang sah daripada senarai."
  }),

  // BAHAGIAN C: JENIS POTONGAN
  deductionType: z.enum(
    ["ORIGINAL_PCB_CHANGE", "FIXED_MONTHLY", "AMOUNT_ADJUSTMENT", "MATCH_PCB"],
    { error: "Sila pilih sekurang-kurangnya satu jenis potongan." }
  ),

  // Conditional amount inputs
  amaunPcbAsal: z.string().trim().optional(),
  amaunZakatBulanan: z.string().trim().optional(),
  amaunZakatAsal: z.string().trim().optional(),
  amaunZakatBaru: z.string().trim().optional(),

  // BAHAGIAN D: LAFAZ
  bulanMula: z.string({ error: "Sila pilih bulan mula potongan." }).min(1, "Sila pilih bulan mula potongan."),
  tahunMula: z.string({ error: "Sila pilih tahun mula potongan." }).min(1, "Sila pilih tahun mula potongan."),
  
  targetDeductionValue: z
    .string({ error: "Amaun potongan zakat diperlukan." })
    .trim()
    .regex(currencyRegex, "Amaun potongan mestilah dalam format dua tempat perpuluhan (contoh: 300.00)."),

  pengesahanLafaz: z
    .string()
    .refine((val) => val === "true", {
      message: "Anda mesti menanda kotak pengesahan lafaz untuk meneruskan.",
    }),
}).superRefine((data, ctx) => {
  // Check conditions based on selected deductionType
  if (data.deductionType === "ORIGINAL_PCB_CHANGE") {
    if (!data.amaunPcbAsal || !currencyRegex.test(data.amaunPcbAsal)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amaun PCB Asal diperlukan dalam format dua perpuluhan (contoh: 250.00).",
        path: ["amaunPcbAsal"],
      });
    }
    if (!data.amaunZakatBulanan || !currencyRegex.test(data.amaunZakatBulanan)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amaun Zakat Bulanan diperlukan dalam format dua perpuluhan (contoh: 150.00).",
        path: ["amaunZakatBulanan"],
      });
    }
  }

  if (data.deductionType === "FIXED_MONTHLY") {
    if (!data.amaunZakatBulanan || !currencyRegex.test(data.amaunZakatBulanan)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amaun Zakat Bulanan diperlukan dalam format dua perpuluhan (contoh: 100.00).",
        path: ["amaunZakatBulanan"],
      });
    }
  }

  if (data.deductionType === "AMOUNT_ADJUSTMENT") {
    if (!data.amaunZakatAsal || !currencyRegex.test(data.amaunZakatAsal)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amaun Zakat Asal (Semasa) diperlukan dalam format dua perpuluhan (contoh: 120.00).",
        path: ["amaunZakatAsal"],
      });
    }
    if (!data.amaunZakatBaru || !currencyRegex.test(data.amaunZakatBaru)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amaun Zakat Baru diperlukan dalam format dua perpuluhan (contoh: 180.00).",
        path: ["amaunZakatBaru"],
      });
    }
  }
});

export type ZakatApplicationInput = z.infer<typeof zakatApplicationSchema>;

export type ZakatFieldErrors = Partial<
  Record<keyof ZakatApplicationInput, string[]>
>;
