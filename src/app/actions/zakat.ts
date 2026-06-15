// src/app/actions/zakat.ts
//
// "use server" seals this entire module at the server boundary.
// The Next.js bundler guarantees Prisma, auth tokens, and DB credentials
// never appear in the client JavaScript bundle.

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { zakatApplicationSchema, type ZakatFieldErrors } from "@/lib/validations/zakat";
import { revalidatePath } from "next/cache";
import { DeductionType } from "@prisma/client";

// ─── Discriminated return type ─────────────────────────────────────────────────
// Forces the client component to exhaustively handle both outcomes at compile time.

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

// ─── Helper: parse a FormData decimal string to Prisma-compatible Decimal input ─
// Returns undefined (not null) so Prisma omits the column entirely for
// deduction types that don't use that field — avoids polluting rows with zeros.
function parseDecimal(value: FormDataEntryValue | null): number | undefined {
  if (!value || String(value).trim() === "") return undefined;
  const n = parseFloat(String(value));
  return isNaN(n) ? undefined : n;
}

// ─── Server Action ─────────────────────────────────────────────────────────────

export async function submitZakatApplicationAction(
  _prevState: ZakatActionResult | null,
  formData: FormData
): Promise<ZakatActionResult> {

  // ① Authentication guard — always the FIRST check.
  //    Middleware is a supplementary layer; a misconfigured matcher could bypass it.
  const session = await auth();
  if (!session?.user?.id) {
    return {
      status: "error",
      message: "Sesi anda telah tamat. Sila log masuk semula.",
    };
  }

  // ② Extract raw FormData entries into a plain object for Zod parsing.
  //    All FormData values arrive as strings or File objects — we pass everything
  //    as strings and let Zod's coercion/refinement logic handle typing.
  const rawInput = {
    deductionType:        formData.get("deductionType"),
    originalPcbAmount:    formData.get("originalPcbAmount"),
    monthlyZakatDeduction:formData.get("monthlyZakatDeduction"),
    residualPcbBalance:   formData.get("residualPcbBalance"),
    fixedMonthlyAmount:   formData.get("fixedMonthlyAmount"),
    adjustmentFromAmount: formData.get("adjustmentFromAmount"),
    adjustmentToAmount:   formData.get("adjustmentToAmount"),
    startMonth:           formData.get("startMonth"),
    // Checkbox returns the string "true" only when checked; absent when unchecked.
    declarationConfirmed: formData.get("declarationConfirmed") ?? "false",
  };

  // ③ Schema validation — discriminated union selects the correct variant based
  //    on `deductionType` before applying field-level rules.
  const parsed = zakatApplicationSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Sila semak semula maklumat yang diisi.",
      fieldErrors: parsed.error.flatten().fieldErrors as ZakatFieldErrors,
    };
  }

  const data = parsed.data;

  // ④ Defensive re-check: declarationConfirmed must be "true" string.
  //    Zod already validates this, but we add an explicit guard as documentation.
  if (data.declarationConfirmed !== "true") {
    return {
      status: "error",
      message: "Anda mesti bersetuju dengan lafaz membayar zakat sebelum menghantar.",
    };
  }

  // ⑤ Database write — scoped exclusively to the authenticated user's ID.
  //    userId is NEVER sourced from client input; it comes from the server session.
  try {
    const application = await prisma.zakatApplication.create({
      data: {
        userId:        session.user.id,
        deductionType: data.deductionType as DeductionType,
        startMonth:    data.startMonth,
        declarationConfirmed: true,

        // Conditional decimal fields — undefined values are omitted by Prisma
        // so irrelevant columns remain NULL in the DB, not zero.
        originalPcbAmount:
          data.deductionType === "ORIGINAL_PCB_CHANGE"
            ? parseDecimal(formData.get("originalPcbAmount"))
            : undefined,

        monthlyZakatDeduction:
          data.deductionType === "ORIGINAL_PCB_CHANGE"
            ? parseDecimal(formData.get("monthlyZakatDeduction"))
            : undefined,

        residualPcbBalance:
          data.deductionType === "ORIGINAL_PCB_CHANGE"
            ? parseDecimal(formData.get("residualPcbBalance"))
            : undefined,

        fixedMonthlyAmount:
          data.deductionType === "FIXED_MONTHLY"
            ? parseDecimal(formData.get("fixedMonthlyAmount"))
            : undefined,

        adjustmentFromAmount:
          data.deductionType === "AMOUNT_ADJUSTMENT"
            ? parseDecimal(formData.get("adjustmentFromAmount"))
            : undefined,

        adjustmentToAmount:
          data.deductionType === "AMOUNT_ADJUSTMENT"
            ? parseDecimal(formData.get("adjustmentToAmount"))
            : undefined,
      },
      select: { id: true }, // Minimal projection — don't round-trip the full row
    });

    // ⑥ Cache invalidation — revalidates the admin review page and user history page
    //    so both views reflect the new submission without stale RSC cache data.
    revalidatePath("/dashboard/zakat");
    revalidatePath("/admin/zakat");

    return {
      status: "success",
      applicationId: application.id,
      message: "Permohonan zakat berjaya dihantar. Pihak pentadbir akan menyemak permohonan anda.",
    };
  } catch (error) {
    // Log server-side for observability (e.g., Vercel logs / Sentry).
    // Return only a safe generic message to the client — never leak DB internals.
    console.error("[submitZakatApplicationAction] DB write failed:", error);
    return {
      status: "error",
      message: "Ralat sistem berlaku. Sila cuba lagi atau hubungi pihak pentadbir.",
    };
  }
}
