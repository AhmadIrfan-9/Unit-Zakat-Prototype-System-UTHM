// src/components/zakat/ZakatForm.tsx
//
// "use client" — the server/client boundary. Nothing in this file touches Prisma,
// auth secrets, or process.env. All side-effects cross the boundary via the
// Server Action reference passed through useActionState.

"use client";

import { useActionState, useState, useCallback } from "react";
import {
  submitZakatApplicationAction,
  type ZakatActionResult,
} from "@/app/actions/zakat";
import { MALAY_MONTHS, type DeductionType } from "@/lib/validations/zakat";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ─── Month Option Generator ────────────────────────────────────────────────────
// Generates "Bulan Tahun" strings for current year ±1.
// Covers advance applications and same-month corrections.
function generateMonthOptions(): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const options: string[] = [];
  for (const year of [currentYear - 1, currentYear, currentYear + 1]) {
    for (const month of MALAY_MONTHS) {
      options.push(`${month} ${year}`);
    }
  }
  return options;
}
const MONTH_OPTIONS = generateMonthOptions();

// ─── RM Currency Input ─────────────────────────────────────────────────────────
// Standardised input component for all monetary fields.
// The "RM" prefix is rendered as a visual-only adornment inside the input wrapper,
// never included in the actual FormData value — avoids Zod parse failures.
interface RmInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  error?: string;
}

function RmInput({ id, name, error, className, disabled, ...rest }: RmInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "flex items-center rounded-md border bg-background ring-offset-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          error ? "border-destructive" : "border-input",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className="select-none border-r border-input bg-muted px-3 py-2 text-sm font-medium text-muted-foreground rounded-l-md">
          RM
        </span>
        <input
          id={id}
          name={name}
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          disabled={disabled}
          className={cn(
            "flex-1 bg-transparent px-3 py-2 text-sm outline-none",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed",
            className
          )}
          {...rest}
        />
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

// ─── Section C Row ─────────────────────────────────────────────────────────────
// Wraps a deduction type checkbox + its conditional input fields.
interface SectionCRowProps {
  value: DeductionType;
  label: string;
  selected: DeductionType | null;
  onSelect: (value: DeductionType) => void;
  disabled: boolean;
  children?: React.ReactNode;
}

function SectionCRow({ value, label, selected, onSelect, disabled, children }: SectionCRowProps) {
  const isSelected = selected === value;
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-4 transition-colors",
        isSelected
          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
          : "border-border bg-card hover:border-muted-foreground/40"
      )}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          id={`type-${value}`}
          checked={isSelected}
          onCheckedChange={() => onSelect(value)}
          disabled={disabled}
          className="mt-0.5"
        />
        <Label
          htmlFor={`type-${value}`}
          className={cn(
            "cursor-pointer font-medium text-sm leading-tight",
            isSelected ? "text-emerald-800 dark:text-emerald-300" : "text-foreground"
          )}
        >
          {label}
        </Label>
      </div>
      {/* Conditional input fields — rendered only when this row is selected */}
      {isSelected && children && (
        <div className="ml-7 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Field Error Helper ────────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ZakatForm() {
  // useActionState: React 19 hook that binds form lifecycle to the Server Action.
  // Returns [currentState, dispatchFn, isPending] — no manual useTransition needed.
  const [state, dispatch, isPending] = useActionState<
    ZakatActionResult | null,
    FormData
  >(submitZakatApplicationAction, null);

  // Local controlled state for fields that drive reactive UI changes.
  // NOTE: we use uncontrolled inputs for non-reactive fields (name="" attributes)
  // so FormData collection is automatic — avoids unnecessary re-renders.
  const [selectedType, setSelectedType] = useState<DeductionType | null>(null);
  const [startMonth,   setStartMonth]   = useState<string>("");
  const [lafazAmount,  setLafazAmount]  = useState<string>("");

  // Derive the "active" RM amount that feeds the Section D lafaz preview.
  // Logic: whichever input is semantically "the deduction amount" for the chosen type.
  const handleTypeSelect = useCallback((type: DeductionType) => {
    setSelectedType(type);
    setLafazAmount(""); // Reset amount preview when switching type
  }, []);

  // Shorthand field error accessor
  const err = (field: string) =>
    state?.status === "error"
      ? (state.fieldErrors as Record<string, string[]>)?.[field]?.[0]
      : undefined;

  // Determine whether the form was successfully submitted
  const isSuccess = state?.status === "success";

  if (isSuccess) {
    return (
      <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
        <CardContent className="pt-6 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
            Permohonan Berjaya Dihantar
          </h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            {(state as { message: string }).message}
          </p>
          <p className="text-xs text-muted-foreground">
            ID Permohonan: <span className="font-mono font-medium">{(state as { applicationId: string }).applicationId}</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={dispatch} noValidate className="space-y-6">
      {/* Hidden field — deductionType controlled by checkbox state */}
      {selectedType && (
        <input type="hidden" name="deductionType" value={selectedType} />
      )}

      {/* ── Section C ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold tracking-tight">
            C) SILA TANDAKAN (✓) PADA PETAK BERKENAAN
          </CardTitle>
          <CardDescription>
            Pilih satu (1) jenis potongan zakat gaji yang berkenaan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">

          {/* ── Row 1: ORIGINAL_PCB_CHANGE ──────────────────────────────────── */}
          <SectionCRow
            value="ORIGINAL_PCB_CHANGE"
            label="Perubahan potongan PCB Asal"
            selected={selectedType}
            onSelect={handleTypeSelect}
            disabled={isPending}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="originalPcbAmount" className="text-xs text-muted-foreground">
                  Potongan PCB Asal
                </Label>
                <RmInput
                  id="originalPcbAmount"
                  name="originalPcbAmount"
                  disabled={isPending}
                  error={err("originalPcbAmount")}
                  aria-describedby="originalPcbAmount-error"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="monthlyZakatDeduction" className="text-xs text-muted-foreground">
                  Potongan Zakat Bulanan
                </Label>
                <RmInput
                  id="monthlyZakatDeduction"
                  name="monthlyZakatDeduction"
                  disabled={isPending}
                  error={err("monthlyZakatDeduction")}
                  onChange={(e) => setLafazAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="residualPcbBalance" className="text-xs text-muted-foreground">
                  Baki PCB
                </Label>
                <RmInput
                  id="residualPcbBalance"
                  name="residualPcbBalance"
                  disabled={isPending}
                  error={err("residualPcbBalance")}
                />
              </div>
            </div>
          </SectionCRow>

          {/* ── Row 2: FIXED_MONTHLY ────────────────────────────────────────── */}
          <SectionCRow
            value="FIXED_MONTHLY"
            label="Potongan Zakat Bulanan Sebanyak"
            selected={selectedType}
            onSelect={handleTypeSelect}
            disabled={isPending}
          >
            <div className="max-w-xs space-y-1.5">
              <Label htmlFor="fixedMonthlyAmount" className="text-xs text-muted-foreground">
                Jumlah Potongan Tetap Sebulan
              </Label>
              <RmInput
                id="fixedMonthlyAmount"
                name="fixedMonthlyAmount"
                disabled={isPending}
                error={err("fixedMonthlyAmount")}
                onChange={(e) => setLafazAmount(e.target.value)}
              />
            </div>
          </SectionCRow>

          {/* ── Row 3: AMOUNT_ADJUSTMENT ────────────────────────────────────── */}
          <SectionCRow
            value="AMOUNT_ADJUSTMENT"
            label="Penambahan / Pengurangan Potongan Zakat"
            selected={selectedType}
            onSelect={handleTypeSelect}
            disabled={isPending}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="adjustmentFromAmount" className="text-xs text-muted-foreground">
                  Daripada (Jumlah Semasa)
                </Label>
                <RmInput
                  id="adjustmentFromAmount"
                  name="adjustmentFromAmount"
                  disabled={isPending}
                  error={err("adjustmentFromAmount")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adjustmentToAmount" className="text-xs text-muted-foreground">
                  Kepada (Jumlah Baru)
                </Label>
                <RmInput
                  id="adjustmentToAmount"
                  name="adjustmentToAmount"
                  disabled={isPending}
                  error={err("adjustmentToAmount")}
                  onChange={(e) => setLafazAmount(e.target.value)}
                />
              </div>
            </div>
          </SectionCRow>

          {/* ── Row 4: MATCH_PCB ────────────────────────────────────────────── */}
          <SectionCRow
            value="MATCH_PCB"
            label="Potongan Zakat Mengikut Potongan PCB"
            selected={selectedType}
            onSelect={handleTypeSelect}
            disabled={isPending}
          >
            <p className="text-xs text-muted-foreground italic">
              Jumlah potongan zakat akan diselaraskan secara automatik mengikut amaun PCB semasa.
            </p>
          </SectionCRow>

          {/* Deduction type validation error */}
          {!selectedType && state?.status === "error" && (
            <p className="text-sm text-destructive">
              {err("deductionType") ?? "Sila pilih jenis potongan."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Section D: Lafaz Membayar Zakat ───────────────────────────────── */}
      <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold tracking-tight text-amber-900 dark:text-amber-300">
            D) LAFAZ MEMBAYAR ZAKAT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Month selector — drives both the lafaz preview and the startMonth hidden field */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5 min-w-[180px]">
              <Label htmlFor="startMonth-select" className="text-sm font-medium">
                Bulan Mula Potongan <span className="text-destructive">*</span>
              </Label>
              <Select
                name="startMonth"
                value={startMonth}
                onValueChange={setStartMonth}
                disabled={isPending}
              >
                <SelectTrigger
                  id="startMonth-select"
                  aria-describedby="startMonth-error"
                  className={cn(err("startMonth") && "border-destructive")}
                >
                  <SelectValue placeholder="Pilih bulan..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {MONTH_OPTIONS.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={err("startMonth")} />
            </div>
          </div>

          {/* ── Dynamic Lafaz Declaration Box ─────────────────────────────── */}
          {/* The text binds reactively to startMonth and lafazAmount state.   */}
          {/* Unset placeholders render as underlined blanks matching the form. */}
          <div className="rounded-lg border border-amber-300 bg-white dark:bg-amber-950/40 p-4 shadow-sm">
            <p className="text-sm leading-7 text-foreground font-medium">
              Saya bersetuju gaji saya dipotong mulai gaji bulan{" "}
              <span
                className={cn(
                  "inline-block min-w-[120px] border-b-2 px-1 text-center font-semibold transition-colors",
                  startMonth
                    ? "border-emerald-500 text-emerald-700 dark:text-emerald-400"
                    : "border-muted-foreground text-muted-foreground"
                )}
              >
                {startMonth || "_______________"}
              </span>{" "}
              sebanyak RM{" "}
              <span
                className={cn(
                  "inline-block min-w-[80px] border-b-2 px-1 text-center font-semibold transition-colors",
                  lafazAmount
                    ? "border-emerald-500 text-emerald-700 dark:text-emerald-400"
                    : "border-muted-foreground text-muted-foreground"
                )}
              >
                {lafazAmount
                  ? parseFloat(lafazAmount).toFixed(2)
                  : "________"}
              </span>{" "}
              bagi menunaikan zakat harta.
            </p>
          </div>

          {/* ── Declaration Checkbox ─────────────────────────────────────── */}
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 transition-colors",
              err("declarationConfirmed")
                ? "border-destructive bg-destructive/5"
                : "border-border bg-card"
            )}
          >
            <Checkbox
              id="declarationConfirmed"
              name="declarationConfirmed"
              value="true"
              disabled={isPending}
              className="mt-0.5"
              aria-describedby="declaration-error"
            />
            <Label
              htmlFor="declarationConfirmed"
              className="cursor-pointer text-sm leading-relaxed"
            >
              Saya mengesahkan bahawa maklumat yang diberikan adalah benar dan saya
              bersetuju untuk membuat potongan zakat gaji seperti yang dinyatakan
              dalam lafaz di atas.
            </Label>
          </div>
          <FieldError message={err("declarationConfirmed")} />
        </CardContent>
      </Card>

      {/* ── Global non-field error ─────────────────────────────────────────── */}
      {state?.status === "error" && !state.fieldErrors && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {state.message}
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      <Button
        type="submit"
        disabled={isPending || !selectedType}
        aria-busy={isPending}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-5 text-base"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Menghantar Permohonan...
          </span>
        ) : (
          "HANTAR PERMOHONAN"
        )}
      </Button>
    </form>
  );
}
