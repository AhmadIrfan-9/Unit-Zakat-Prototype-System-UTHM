// src/components/zakat/zakat-salary-deduction-form-client-component.tsx
"use client";

import { useActionState, useState, useCallback } from "react";
import { executeZakatSalaryDeductionDatabaseInsertion, type ZakatStaffSalaryDeductionActionResult } from "@/app/actions/zakat-salary-deduction-server-actions";
import { MALAY_MONTHS, NEGERI_LIST, type ZakatStaffSalaryDeductionFieldErrors } from "@/lib/validations/zakat-salary-deduction-schema";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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

interface RmInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  error?: string;
}

function RmInput({ id, name, error, className, disabled, ...rest }: RmInputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div
        className={cn(
          "flex items-center rounded-lg border bg-background ring-offset-background transition-all",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          error ? "border-destructive focus-within:ring-destructive/50" : "border-input",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className="select-none border-r border-input bg-muted px-3 py-2 text-sm font-semibold text-muted-foreground rounded-l-lg">
          RM
        </span>
        <input
          id={id}
          name={name}
          type="text"
          placeholder="0.00"
          disabled={disabled}
          className={cn(
            "flex-1 bg-transparent px-3 py-2 text-sm outline-none w-full",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed",
            className
          )}
          {...rest}
        />
      </div>
      {error && (
        <p className="text-xs text-destructive font-medium mt-1">{error}</p>
      )}
    </div>
  );
}

interface SectionCRowProps {
  value: string;
  label: string;
  selected: string | null;
  onSelect: (value: string) => void;
  disabled: boolean;
  children?: React.ReactNode;
}

function SectionCRow({ value, label, selected, onSelect, disabled, children }: SectionCRowProps) {
  const isSelected = selected === value;
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-4 transition-all duration-300 bg-card/50",
        isSelected
          ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 shadow-sm ring-1 ring-emerald-500/30"
          : "border-border hover:border-muted-foreground/30 hover:bg-card/80"
      )}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          id={`type-${value}`}
          checked={isSelected}
          onCheckedChange={() => onSelect(value)}
          disabled={disabled}
          className="h-5 w-5 rounded border-muted-foreground/40 text-emerald-600 focus:ring-emerald-500"
        />
        <Label
          htmlFor={`type-${value}`}
          className={cn(
            "cursor-pointer font-semibold text-sm leading-tight select-none",
            isSelected ? "text-emerald-800 dark:text-emerald-300" : "text-foreground"
          )}
        >
          {label}
        </Label>
      </div>
      
      {isSelected && children && (
        <div className="ml-8 mt-1 border-l-2 border-emerald-500/20 pl-4 space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}

export function ZakatSalaryDeductionFormClientComponent() {
  // Bind form dispatch hooks dynamically to native React server actions to monitor async life transitions.
  const [state, dispatch, isPending] = useActionState<ZakatStaffSalaryDeductionActionResult | null, FormData>(
    executeZakatSalaryDeductionDatabaseInsertion,
    null
  );

  // Manage internal selection states to isolate checked inputs and maintain clean database mappings.
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Track the Malay text representation of the month chosen to launch the deduction sequence.
  const [bulanMula, setBulanMula] = useState<string>("");

  // Track the target calendar year to start the deduction to representation accuracy.
  const [tahunMula, setTahunMula] = useState<string>("");

  // Capture raw text keystrokes from the numeric field to build reactive preview sentences.
  const [targetDeductionValue, setTargetDeductionValue] = useState<string>("");

  // Control submission block states by ensuring user confirms covenant checks.
  const [pengesahanLafaz, setPengesahanLafaz] = useState<boolean>(false);

  // Toggle user choices mutually exclusively to prevent multi-selection database conflicts.
  const handleTypeSelect = useCallback((type: string) => {
    setSelectedType((prev) => (prev === type ? null : type));
  }, []);

  // Map server validation failures to local component scopes to present field feedback.
  const err = (field: keyof ZakatStaffSalaryDeductionFieldErrors) => {
    if (state?.success === false && state.fieldErrors) {
      return state.fieldErrors[field]?.[0];
    }
    return undefined;
  };

  const isSuccess = state?.success === true;

  // Intercept the form layout with an approval banner on success to confirm transactions.
  if (isSuccess && state?.data) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/10">
        <CardContent className="pt-8 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800">
            <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
              Permohonan Berjaya Dihantar!
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
              Permohonan potongan zakat gaji anda berjaya dihantar ke sistem.
            </p>
          </div>
          <div className="inline-block px-4 py-2 bg-background border rounded-lg shadow-xs text-xs font-mono font-bold text-muted-foreground select-all">
            ID Rujukan: {state.data.applicationId}
          </div>
          <div className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.reload()}
              className="px-6 py-2"
            >
              Hantar Permohonan Baru
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const years = Array.from({ length: 10 }, (_, i) => String(2026 + i));

  return (
    <form action={dispatch} noValidate className="space-y-8">
      {selectedType && <input type="hidden" name="deductionType" value={selectedType} />}

      {/* BAHAGIAN A: MAKLUMAT PERIBADI */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
            BAHAGIAN A: MAKLUMAT PERIBADI
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="namaPenuh" className="font-semibold text-xs">Nama Penuh</Label>
            <Input id="namaPenuh" name="namaPenuh" disabled={isPending} placeholder="Masukkan nama penuh seperti dalam KP" />
            {err("namaPenuh") && <p className="text-xs text-destructive font-medium">{err("namaPenuh")}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="noKP" className="font-semibold text-xs">No. Kad Pengenalan</Label>
            <Input id="noKP" name="noKP" maxLength={12} disabled={isPending} placeholder="Contoh: 890520015432 (12 digit)" />
            {err("noKP") && <p className="text-xs text-destructive font-medium">{err("noKP")}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="noPekerja" className="font-semibold text-xs">No. Pekerja</Label>
            <Input id="noPekerja" name="noPekerja" disabled={isPending} placeholder="Masukkan No. Kakitangan UTHM" />
            {err("noPekerja") && <p className="text-xs text-destructive font-medium">{err("noPekerja")}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="noTelefon" className="font-semibold text-xs">No. Telefon</Label>
            <Input id="noTelefon" name="noTelefon" disabled={isPending} placeholder="Contoh: 0123456789" />
            {err("noTelefon") && <p className="text-xs text-destructive font-medium">{err("noTelefon")}</p>}
          </div>

          <div className="md:col-span-2 space-y-1">
            <Label htmlFor="alamatRumah" className="font-semibold text-xs">Alamat Rumah</Label>
            <Textarea id="alamatRumah" name="alamatRumah" disabled={isPending} placeholder="Masukkan alamat kediaman penuh" rows={3} />
            {err("alamatRumah") && <p className="text-xs text-destructive font-medium">{err("alamatRumah")}</p>}
          </div>

          <div className="grid grid-cols-3 md:col-span-2 gap-4">
            <div className="space-y-1 col-span-1">
              <Label htmlFor="poskod" className="font-semibold text-xs">Poskod</Label>
              <Input id="poskod" name="poskod" maxLength={5} disabled={isPending} placeholder="86400" />
              {err("poskod") && <p className="text-xs text-destructive font-medium">{err("poskod")}</p>}
            </div>

            <div className="space-y-1 col-span-1">
              <Label htmlFor="bandar" className="font-semibold text-xs">Bandar</Label>
              <Input id="bandar" name="bandar" disabled={isPending} placeholder="Parit Raja" />
              {err("bandar") && <p className="text-xs text-destructive font-medium">{err("bandar")}</p>}
            </div>

            <div className="space-y-1 col-span-1">
              <Label htmlFor="negeri" className="font-semibold text-xs">Negeri</Label>
              <Select name="negeri" disabled={isPending}>
                <SelectTrigger id="negeri" className="w-full">
                  <SelectValue placeholder="Pilih..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {NEGERI_LIST.map((neg) => (
                    <SelectItem key={neg} value={neg}>{neg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("negeri") && <p className="text-xs text-destructive font-medium">{err("negeri")}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ── BAHAGIAN C: SILA TANDAKAN (/) PADA PETAK BERKENAAN ────────────────────── */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
            BAHAGIAN C: SILA TANDAKAN (/) PADA PETAK BERKENAAN
          </h2>
        </div>

        <div className="space-y-3">
          <SectionCRow
            value="ORIGINAL_PCB_CHANGE"
            label="Perubahan potongan PCB Asal"
            selected={selectedType}
            onSelect={handleTypeSelect}
            disabled={isPending}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div className="space-y-1.5">
                <Label htmlFor="amaunPcbAsal" className="text-xs font-semibold text-muted-foreground">Potongan PCB Asal</Label>
                <RmInput id="amaunPcbAsal" name="amaunPcbAsal" disabled={isPending} error={err("amaunPcbAsal")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amaunZakatBulanan" className="text-xs font-semibold text-muted-foreground">Potongan Zakat Baru Sebulan</Label>
                <RmInput id="amaunZakatBulanan" name="amaunZakatBulanan" disabled={isPending} error={err("amaunZakatBulanan")} />
              </div>
            </div>
          </SectionCRow>

          <SectionCRow
            value="FIXED_MONTHLY"
            label="Potongan Zakat Bulanan Sebanyak"
            selected={selectedType}
            onSelect={handleTypeSelect}
            disabled={isPending}
          >
            <div className="max-w-xs space-y-1.5">
              <Label htmlFor="amaunZakatBulanan-fixed" className="text-xs font-semibold text-muted-foreground">Jumlah Potongan Tetap Sebulan</Label>
              <RmInput id="amaunZakatBulanan-fixed" name="amaunZakatBulanan" disabled={isPending} error={err("amaunZakatBulanan")} />
            </div>
          </SectionCRow>

          <SectionCRow
            value="AMOUNT_ADJUSTMENT"
            label="Penambahan / Pengurangan Potongan Zakat"
            selected={selectedType}
            onSelect={handleTypeSelect}
            disabled={isPending}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div className="space-y-1.5">
                <Label htmlFor="amaunZakatAsal" className="text-xs font-semibold text-muted-foreground">Daripada (Jumlah Semasa)</Label>
                <RmInput id="amaunZakatAsal" name="amaunZakatAsal" disabled={isPending} error={err("amaunZakatAsal")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amaunZakatBaru" className="text-xs font-semibold text-muted-foreground">Kepada (Jumlah Baru)</Label>
                <RmInput id="amaunZakatBaru" name="amaunZakatBaru" disabled={isPending} error={err("amaunZakatBaru")} />
              </div>
            </div>
          </SectionCRow>

          <SectionCRow
            value="MATCH_PCB"
            label="Potongan Zakat Mengikut Potongan PCB"
            selected={selectedType}
            onSelect={handleTypeSelect}
            disabled={isPending}
          >
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              * Tiada pengisian amaun diperlukan. Sistem potongan gaji akan menyelaraskan amaun potongan zakat bulanan anda secara automatik menyamai amaun Potongan Cukai Bulanan (PCB) semasa yang dikenakan.
            </p>
          </SectionCRow>

          {err("deductionType") && (
            <p className="text-sm text-destructive font-bold mt-2">{err("deductionType")}</p>
          )}
        </div>
      </div>

      {/* ── BAHAGIAN D: LAFAZ MEMBAYAR ZAKAT ───────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
            BAHAGIAN D: LAFAZ MEMBAYAR ZAKAT
          </h2>
        </div>

        <div className="space-y-4">
          <div className="max-w-xs space-y-1.5">
            <Label htmlFor="targetDeductionValue" className="font-semibold text-xs text-foreground">
              Amaun Potongan Zakat Gaji (RM) <span className="text-destructive">*</span>
            </Label>
            <RmInput
              id="targetDeductionValue"
              name="targetDeductionValue"
              disabled={isPending}
              value={targetDeductionValue}
              onChange={(e) => setTargetDeductionValue(e.target.value)}
              error={err("targetDeductionValue")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bulanMula" className="font-semibold text-xs">Bulan Mula Potongan <span className="text-destructive">*</span></Label>
              <Select name="bulanMula" value={bulanMula} onValueChange={setBulanMula} disabled={isPending}>
                <SelectTrigger id="bulanMula" className="w-full">
                  <SelectValue placeholder="Pilih Bulan..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {MALAY_MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("bulanMula") && <p className="text-xs text-destructive font-medium">{err("bulanMula")}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tahunMula" className="font-semibold text-xs">Tahun Mula Potongan <span className="text-destructive">*</span></Label>
              <Select name="tahunMula" value={tahunMula} onValueChange={setTahunMula} disabled={isPending}>
                <SelectTrigger id="tahunMula" className="w-full">
                  <SelectValue placeholder="Pilih Tahun..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("tahunMula") && <p className="text-xs text-destructive font-medium">{err("tahunMula")}</p>}
            </div>
          </div>

          {/* Interpolate states dynamically within the card text block to satisfy electronic contract display requirements. */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/10 p-5 shadow-xs">
            <p className="text-sm text-amber-900 dark:text-amber-300 font-semibold mb-2 flex items-center gap-2">
              Akad & Lafaz Zakat:
            </p>
            <p className="text-sm leading-relaxed text-foreground font-medium italic">
              &ldquo;Saya bersetuju gaji saya dipotong mulai gaji bulan{" "}
              <span className="underline decoration-amber-500/80 decoration-2 underline-offset-4 font-bold text-amber-800 dark:text-amber-300 bg-amber-100/40 dark:bg-amber-900/20 px-2 py-0.5 rounded">
                {bulanMula || "[Bulan]"}
              </span>{" "}
              <span className="underline decoration-amber-500/80 decoration-2 underline-offset-4 font-bold text-amber-800 dark:text-amber-300 bg-amber-100/40 dark:bg-amber-900/20 px-2 py-0.5 rounded">
                {tahunMula || "[Tahun]"}
              </span>{" "}
              sebanyak RM{" "}
              <span className="underline decoration-amber-500/80 decoration-2 underline-offset-4 font-bold text-amber-800 dark:text-amber-300 bg-amber-100/40 dark:bg-amber-900/20 px-2 py-0.5 rounded">
                {targetDeductionValue || "0.00"}
              </span>{" "}
              bagi menunaikan zakat harta.&rdquo;
            </p>
          </div>

          <div className="space-y-1">
            <div
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 bg-card/40",
                err("pengesahanLafaz") ? "border-destructive bg-destructive/5" : "border-border hover:bg-card/70"
              )}
            >
              <Checkbox
                id="pengesahanLafaz"
                name="pengesahanLafaz"
                value="true"
                checked={pengesahanLafaz}
                onCheckedChange={(checked) => setPengesahanLafaz(!!checked)}
                disabled={isPending}
                className="mt-0.5 h-5 w-5 rounded border-muted-foreground/40 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="pengesahanLafaz" className="cursor-pointer text-xs leading-relaxed text-muted-foreground select-none">
                Saya mengesahkan bahawa maklumat yang diberikan adalah benar dan saya bersetuju untuk membuat potongan zakat gaji seperti yang dinyatakan dalam lafaz di atas.
              </Label>
            </div>
            {err("pengesahanLafaz") && <p className="text-xs text-destructive font-medium mt-1">{err("pengesahanLafaz")}</p>}
          </div>
        </div>
      </div>

      {state?.success === false && !state.fieldErrors && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive font-semibold">
          {state.error}
        </div>
      )}

      <div className="pt-4 flex justify-center">
        <Button
          type="submit"
          disabled={isPending || !selectedType || !pengesahanLafaz}
          aria-busy={isPending}
          className="w-full sm:max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm tracking-wide shadow-md"
        >
          {isPending ? "Memproses Permohonan..." : "HANTAR PERMOHONAN"}
        </Button>
      </div>
    </form>
  );
}
