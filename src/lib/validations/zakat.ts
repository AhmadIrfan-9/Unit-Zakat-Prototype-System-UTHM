// src/lib/validations/zakat.ts
//
// Shared Zod v4 schema for the Zakat salary deduction application form.
// NOTE: Zod v4 replaced `required_error`/`errorMap` params with a unified `error` param.
//
// Imported by BOTH the Server Action and the ZakatForm client component for
// pre-submit UI feedback — no server secrets leak because this file has no
// "use server" directive and imports nothing server-specific.

import { z } from "zod";

// ─── Currency field factory ────────────────────────────────────────────────────
// All monetary inputs arrive from FormData as strings. We enforce:
//   • Non-empty, positive decimal numbers
//   • Max 2 decimal places (RM currency precision)
const currencyField = (label: string) =>
  z
    .string({ error: `${label} diperlukan.` })
    .trim()
    .min(1, `${label} diperlukan.`)
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0,
      { message: `${label} mesti nombor positif (contoh: 250.00).` }
    );

// Optional currency — present only when its parent deduction type is NOT selected.
const optionalCurrencyField = () =>
  z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || (/^\d+(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0),
      { message: "Jumlah mesti nombor positif jika diisi." }
    );

// ─── DeductionType enum ────────────────────────────────────────────────────────
// Zod v4: use `error` (string) instead of deprecated `required_error` / `errorMap`.
export const DeductionTypeEnum = z.enum(
  ["ORIGINAL_PCB_CHANGE", "FIXED_MONTHLY", "AMOUNT_ADJUSTMENT", "MATCH_PCB"],
  { error: "Sila pilih jenis potongan." }
);

export type DeductionType = z.infer<typeof DeductionTypeEnum>;

// ─── Malay month list ──────────────────────────────────────────────────────────
export const MALAY_MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
] as const;

// ─── Base fields shared across all deduction types ────────────────────────────
const baseFields = {
  deductionType: DeductionTypeEnum,

  startMonth: z
    .string({ error: "Bulan mula potongan diperlukan." })
    .min(1, "Bulan mula potongan diperlukan."),

  declarationConfirmed: z
    .string()
    .refine((val) => val === "true", {
      message: "Anda mesti bersetuju dengan lafaz membayar zakat.",
    }),
};

// ─── Variant schemas (discriminated on deductionType) ─────────────────────────

const originalPcbChangeSchema = z.object({
  ...baseFields,
  deductionType:         z.literal("ORIGINAL_PCB_CHANGE"),
  originalPcbAmount:     currencyField("Potongan PCB Asal"),
  monthlyZakatDeduction: currencyField("Potongan Zakat Bulanan"),
  residualPcbBalance:    currencyField("Baki PCB"),
  fixedMonthlyAmount:    optionalCurrencyField(),
  adjustmentFromAmount:  optionalCurrencyField(),
  adjustmentToAmount:    optionalCurrencyField(),
});

const fixedMonthlySchema = z.object({
  ...baseFields,
  deductionType:         z.literal("FIXED_MONTHLY"),
  fixedMonthlyAmount:    currencyField("Jumlah Potongan Bulanan"),
  originalPcbAmount:     optionalCurrencyField(),
  monthlyZakatDeduction: optionalCurrencyField(),
  residualPcbBalance:    optionalCurrencyField(),
  adjustmentFromAmount:  optionalCurrencyField(),
  adjustmentToAmount:    optionalCurrencyField(),
});

const amountAdjustmentSchema = z
  .object({
    ...baseFields,
    deductionType:         z.literal("AMOUNT_ADJUSTMENT"),
    adjustmentFromAmount:  currencyField("Jumlah Asal (Daripada)"),
    adjustmentToAmount:    currencyField("Jumlah Baru (Kepada)"),
    originalPcbAmount:     optionalCurrencyField(),
    monthlyZakatDeduction: optionalCurrencyField(),
    residualPcbBalance:    optionalCurrencyField(),
    fixedMonthlyAmount:    optionalCurrencyField(),
  })
  .refine(
    (data) =>
      parseFloat(data.adjustmentToAmount ?? "0") !==
      parseFloat(data.adjustmentFromAmount ?? "0"),
    {
      message: "Jumlah 'Kepada' mesti berbeza daripada jumlah 'Daripada'.",
      path: ["adjustmentToAmount"],
    }
  );

const matchPcbSchema = z.object({
  ...baseFields,
  deductionType:         z.literal("MATCH_PCB"),
  originalPcbAmount:     optionalCurrencyField(),
  monthlyZakatDeduction: optionalCurrencyField(),
  residualPcbBalance:    optionalCurrencyField(),
  fixedMonthlyAmount:    optionalCurrencyField(),
  adjustmentFromAmount:  optionalCurrencyField(),
  adjustmentToAmount:    optionalCurrencyField(),
});

// ─── Discriminated union ───────────────────────────────────────────────────────
export const zakatApplicationSchema = z.discriminatedUnion("deductionType", [
  originalPcbChangeSchema,
  fixedMonthlySchema,
  amountAdjustmentSchema,
  matchPcbSchema,
]);

export type ZakatApplicationInput = z.infer<typeof zakatApplicationSchema>;

export type ZakatFieldErrors = Partial<
  Record<keyof ZakatApplicationInput, string[]>
>;
