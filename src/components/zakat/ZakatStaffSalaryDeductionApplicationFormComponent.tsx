// src/components/zakat/ZakatStaffSalaryDeductionApplicationFormComponent.tsx
"use client";

import { useActionState, useState, useCallback, useRef } from "react";
import { handleZakatDeductionSubmission, type ZakatStaffSalaryDeductionActionResult } from "@/app/actions/zakatDeductionServerActions";
import { MALAY_MONTHS, NEGERI_LIST, type ZakatStaffSalaryDeductionFieldErrors } from "@/lib/validations/zakatDeductionValidationSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface AuthenticatedUserProps {
  name?: string | null;
  email?: string | null;
  noPekerja?: string | null;
  noKP?: string | null;
  gajiSemasa?: number | null;
  alamatRumah?: string | null;
}

interface ZakatStaffSalaryDeductionApplicationFormProps {
  user: AuthenticatedUserProps;
}

interface RmInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  error?: string;
}

// This currency input component renders a text field with an absolute RM label prepended on the left.
function RmInput({ id, name, error, className, disabled, ...rest }: RmInputProps) {
  return (
    // This container wraps the input and overlays the RM symbol in an absolute position.
    <div className="flex flex-col gap-1 w-full animate-in slide-in-from-top-2 duration-250">
      <div
        className={cn(
          "relative flex items-center rounded-lg border bg-background ring-offset-background transition-all h-9 focus-within:ring-2 focus-within:ring-[#002060] focus-within:ring-offset-2",
          error ? "border-destructive focus-within:ring-destructive/50" : "border-input",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className="absolute left-3 text-xs font-bold text-muted-foreground select-none pointer-events-none">
          RM
        </span>
        <input
          id={id}
          name={name}
          type="text"
          placeholder="0.00"
          disabled={disabled}
          className={cn(
            "w-full bg-transparent pl-10 pr-3 h-full text-xs outline-none",
            "placeholder:text-muted-foreground",
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

// This row component manages checkboxes in Section C and shows or hides currency inputs based on selection states.
function SectionCRow({ value, label, selected, onSelect, disabled, children }: SectionCRowProps) {
  const isSelected = selected === value;
  return (
    // Renders the row box with color highlights when selected.
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-4 transition-all duration-300 bg-card/50",
        isSelected
          ? "border-[#002060] bg-[#002060]/5 shadow-sm ring-1 ring-[#002060]/30"
          : "border-border hover:border-muted-foreground/30 hover:bg-card/80"
      )}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          id={`type-${value}`}
          checked={isSelected}
          onCheckedChange={() => onSelect(value)}
          disabled={disabled}
          className="h-5 w-5 rounded border-muted-foreground/40 text-[#002060] data-[state=checked]:bg-[#002060] data-[state=checked]:border-[#002060] focus:ring-[#002060]"
        />
        <Label
          htmlFor={`type-${value}`}
          className={cn(
            "cursor-pointer font-semibold text-sm leading-tight select-none",
            isSelected ? "text-[#002060] dark:text-blue-300" : "text-foreground"
          )}
        >
          {label}
        </Label>
      </div>
      
      {/* Input boxes remain completely hidden until their specific checkbox item is toggled to true */}
      {isSelected && children && (
        <div className="ml-8 mt-1 border-l-2 border-[#002060]/20 pl-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// This form captures user salary deduction criteria, reveals relative numerical inputs conditionally, and generates a reactive certification string for submission.
export function ZakatStaffSalaryDeductionApplicationFormComponent({ user }: ZakatStaffSalaryDeductionApplicationFormProps) {
  // Binds submission logic to server-side action handlers.
  const [state, dispatch, isPending] = useActionState<ZakatStaffSalaryDeductionActionResult | null, FormData>(
    handleZakatDeductionSubmission,
    null
  );

  // Tracks the active payment method checkbox choice.
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Tracks the target start month value.
  const [bulanMula, setBulanMula] = useState<string>("");

  // Tracks the target start year value.
  const [tahunMula, setTahunMula] = useState<string>("");

  // Tracks the raw payment amount input.
  const [targetDeductionValue, setTargetDeductionValue] = useState<string>("");

  // Tracks the state of the legal declaration checkbox.
  const [pengesahanLafaz, setPengesahanLafaz] = useState<boolean>(false);

  // Tracks the state of the Akta 709 consent checkbox.
  const [persetujuanAkta709, setPersetujuanAkta709] = useState<boolean>(false);

  // Connects page actions to raw DOM references.
  const formRef = useRef<HTMLFormElement>(null);
  const hiddenSubmitRef = useRef<HTMLButtonElement>(null);

  // Tracks the visibility of the confirmation overlay.
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Filters selected payment categories exclusively.
  const handleTypeSelect = useCallback((type: string) => {
    setSelectedType((prev) => (prev === type ? null : type));
  }, []);

  // Maps Zod validation issues to corresponding fields.
  const err = (field: keyof ZakatStaffSalaryDeductionFieldErrors) => {
    if (state?.success === false && state.fieldErrors) {
      return state.fieldErrors[field]?.[0];
    }
    return undefined;
  };

  // Triggers formal database commits after verification.
  const handleConfirmSubmit = () => {
    setIsConfirmOpen(false);
    hiddenSubmitRef.current?.click();
  };

  const isSuccess = state?.success === true;

  // Renders a successful submission notification block.
  if (isSuccess && state?.data) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/10 w-full">
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

  // Generates starting year parameters beginning at year 2026.
  const years = Array.from({ length: 10 }, (_, i) => String(2026 + i));

  return (
    // Renders the interactive deduction form with split divisions.
    <form ref={formRef} action={dispatch} noValidate className="space-y-8 w-full animate-in fade-in duration-300">
      {selectedType && <input type="hidden" name="deductionType" value={selectedType} />}
      
      {/* Raw credentials identifiers fetched from active sessions */}
      <input type="hidden" name="namaPenuh" value={user.name || ""} />
      <input type="hidden" name="noKP" value={user.noKP || ""} />
      <input type="hidden" name="noPekerja" value={user.noPekerja || ""} />

      {/* Hidden button to process HTML form triggers */}
      <button type="submit" ref={hiddenSubmitRef} className="hidden" />

      {/* BAHAGIAN A: MAKLUMAT PERIBADI */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-sm font-bold tracking-wider text-[#002060] uppercase">
            BAHAGIAN A: MAKLUMAT PERIBADI (PROFIL STAF)
          </h2>
        </div>

        {/* Change profile notification box */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3.5 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <p className="leading-relaxed">
            <strong>Pemberitahuan Pindaan:</strong> Untuk menukar sebarang maklumat profil (Nama, No. KP, No. Pekerja, Gaji Semasa), anda perlu menghubungi staf pengurusan melalui emel rasmi.
          </p>
          <a
            href={`mailto:zainal@uthm.edu.my?subject=Pindaan%20Maklumat%20Profil%20Zakat%20Gaji%20-%20%5BNo.%20Pekerja:%20${user.noPekerja || ""}%5D`}
            className="inline-flex items-center justify-center px-3.5 py-1.5 bg-[#002060] hover:bg-[#002060]/90 text-white rounded text-[10px] font-bold shadow-xs cursor-pointer select-none transition-all shrink-0 text-center uppercase tracking-wider"
          >
            Emel Pengurusan
          </a>
        </div>
        
        {/* Personal profile details fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="font-semibold text-xs text-[#002060]">Nama Penuh</Label>
            <Input value={user.name || "-"} disabled className="bg-muted/50 cursor-not-allowed border-muted font-medium text-foreground opacity-90 text-xs h-9" />
          </div>

          <div className="space-y-1">
            <Label className="font-semibold text-xs text-[#002060]">No. Kad Pengenalan</Label>
            <Input value={user.noKP || "-"} disabled className="bg-muted/50 cursor-not-allowed border-muted font-medium text-foreground opacity-90 text-xs h-9" />
          </div>

          <div className="space-y-1">
            <Label className="font-semibold text-xs text-[#002060]">No. Pekerja</Label>
            <Input value={user.noPekerja || "-"} disabled className="bg-muted/50 cursor-not-allowed border-muted font-medium text-foreground opacity-90 text-xs h-9" />
          </div>

          <div className="space-y-1">
            <Label className="font-semibold text-xs text-[#002060]">Gaji Semasa</Label>
            <Input value={user.gajiSemasa ? `RM ${user.gajiSemasa.toFixed(2)}` : "RM 0.00"} disabled className="bg-muted/50 cursor-not-allowed border-muted font-semibold text-foreground opacity-90 text-xs h-9" />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="noTelefon" className="font-semibold text-xs text-[#002060]">No. Telefon <span className="text-destructive">*</span></Label>
            <Input id="noTelefon" name="noTelefon" disabled={isPending} className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9" placeholder="Contoh: 0123456789" />
            {err("noTelefon") && <p className="text-xs text-destructive font-medium">{err("noTelefon")}</p>}
          </div>

          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="alamatRumah" className="font-semibold text-xs text-[#002060]">Alamat Rumah <span className="text-destructive">*</span></Label>
            <Textarea id="alamatRumah" name="alamatRumah" defaultValue={user.alamatRumah || ""} disabled={isPending} className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs" placeholder="Masukkan alamat kediaman penuh" rows={3} />
            {err("alamatRumah") && <p className="text-xs text-destructive font-medium">{err("alamatRumah")}</p>}
          </div>

          <div className="grid grid-cols-3 sm:col-span-2 gap-4">
            <div className="space-y-1 col-span-1">
              <Label htmlFor="poskod" className="font-semibold text-xs text-[#002060]">Poskod <span className="text-destructive">*</span></Label>
              <Input id="poskod" name="poskod" maxLength={5} disabled={isPending} className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9" placeholder="86400" />
              {err("poskod") && <p className="text-xs text-destructive font-medium">{err("poskod")}</p>}
            </div>

            <div className="space-y-1 col-span-1">
              <Label htmlFor="bandar" className="font-semibold text-xs text-[#002060]">Bandar <span className="text-destructive">*</span></Label>
              <Input id="bandar" name="bandar" disabled={isPending} className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9" placeholder="Parit Raja" />
              {err("bandar") && <p className="text-xs text-destructive font-medium">{err("bandar")}</p>}
            </div>

            <div className="space-y-1 col-span-1">
              <Label htmlFor="negeri" className="font-semibold text-xs text-[#002060]">Negeri <span className="text-destructive">*</span></Label>
              <Select name="negeri" disabled={isPending}>
                <SelectTrigger id="negeri" className="w-full focus-visible:ring-[#002060] focus-visible:border-[#002060] focus:ring-[#002060] text-xs h-9">
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

      {/* BAHAGIAN C: KAEDAH POTONGAN */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-sm font-bold tracking-wider text-[#002060] uppercase">
            BAHAGIAN C: SILA TANDAKAN (/) PADA PETAK BERKENAAN
          </h2>
        </div>

        {/* Section C payment checkbox rows */}
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

      {/* BAHAGIAN D: LAFAZ MEMBAYAR ZAKAT */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-sm font-bold tracking-wider text-[#002060] uppercase">
            BAHAGIAN D: LAFAZ MEMBAYAR ZAKAT
          </h2>
        </div>

        {/* Dynamic target deductions input fields and dropdown parameters */}
        <div className="space-y-4">
          <div className="max-w-xs space-y-1.5">
            <Label htmlFor="targetDeductionValue" className="font-semibold text-xs text-[#002060]">
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
              <Label htmlFor="bulanMula" className="font-semibold text-xs text-[#002060]">Bulan Mula Potongan <span className="text-destructive">*</span></Label>
              <Select name="bulanMula" value={bulanMula} onValueChange={setBulanMula} disabled={isPending}>
                <SelectTrigger id="bulanMula" className="w-full focus-visible:ring-[#002060] focus-visible:border-[#002060] focus:ring-[#002060] text-xs h-9">
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
              <Label htmlFor="tahunMula" className="font-semibold text-xs text-[#002060]">Tahun Mula Potongan <span className="text-destructive">*</span></Label>
              <Select name="tahunMula" value={tahunMula} onValueChange={setTahunMula} disabled={isPending}>
                <SelectTrigger id="tahunMula" className="w-full focus-visible:ring-[#002060] focus-visible:border-[#002060] focus:ring-[#002060] text-xs h-9">
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

          {/* Interactive Akad Announcement Banner */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
            <p className="text-sm text-amber-900 font-semibold mb-2">
              Akad & Lafaz Zakat:
            </p>
            <p className="text-sm leading-relaxed text-foreground font-medium italic">
              &ldquo;Saya bersetuju gaji saya dipotong mulai gaji bulan{" "}
              <span className="underline decoration-amber-500/80 decoration-2 underline-offset-4 font-bold text-amber-800 bg-amber-100/40 px-2 py-0.5 rounded">
                {bulanMula || "[Bulan]"}
              </span>{" "}
              <span className="underline decoration-amber-500/80 decoration-2 underline-offset-4 font-bold text-amber-800 bg-amber-100/40 px-2 py-0.5 rounded">
                {tahunMula || "[Tahun]"}
              </span>{" "}
              sebanyak RM{" "}
              <span className="underline decoration-amber-500/80 decoration-2 underline-offset-4 font-bold text-amber-800 bg-amber-100/40 px-2 py-0.5 rounded">
                {targetDeductionValue || "0.00"}
              </span>{" "}
              bagi menunaikan zakat harta.&rdquo;
            </p>
          </div>

          {/* Verification lafaz confirmation checkbox component */}
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
                className="mt-0.5 h-5 w-5 rounded border-muted-foreground/40 text-[#002060] data-[state=checked]:bg-[#002060] data-[state=checked]:border-[#002060] focus:ring-[#002060]"
              />
              <Label htmlFor="pengesahanLafaz" className="cursor-pointer text-xs leading-relaxed text-muted-foreground select-none">
                Saya mengesahkan bahawa maklumat yang diberikan adalah benar dan saya bersetuju untuk membuat potongan zakat gaji seperti yang dinyatakan dalam lafaz di atas.
              </Label>
            </div>
            {err("pengesahanLafaz") && <p className="text-xs text-destructive font-medium mt-1">{err("pengesahanLafaz")}</p>}
          </div>

          {/* Akta 709 compliance consent checkbox component */}
          <div className="space-y-1">
            <div
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 bg-card/40",
                err("persetujuanAkta709") ? "border-destructive bg-destructive/5" : "border-border hover:bg-card/70"
              )}
            >
              <Checkbox
                id="persetujuanAkta709"
                name="persetujuanAkta709"
                value="true"
                checked={persetujuanAkta709}
                onCheckedChange={(checked) => setPersetujuanAkta709(!!checked)}
                disabled={isPending}
                className="mt-0.5 h-5 w-5 rounded border-muted-foreground/40 text-[#002060] data-[state=checked]:bg-[#002060] data-[state=checked]:border-[#002060] focus:ring-[#002060]"
              />
              <Label htmlFor="persetujuanAkta709" className="cursor-pointer text-xs leading-relaxed text-muted-foreground select-none">
                Bersetuju dengan terma dan syarat pemprosesan data peribadi mengikut Akta Perlindungan Data Peribadi 2010 (Akta 709).
              </Label>
            </div>
            {err("persetujuanAkta709") && <p className="text-xs text-destructive font-medium mt-1">{err("persetujuanAkta709")}</p>}
          </div>
        </div>
      </div>

      {state?.success === false && !state.fieldErrors && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive font-semibold">
          {state.error}
        </div>
      )}

      {/* Action button styled in Emerald Green */}
      <div className="pt-4 flex justify-center">
        <Button
          type="button"
          onClick={() => {
            if (selectedType && pengesahanLafaz && persetujuanAkta709) {
              setIsConfirmOpen(true);
            }
          }}
          disabled={isPending || !selectedType || !pengesahanLafaz || !persetujuanAkta709}
          aria-busy={isPending}
          className="w-full sm:max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm tracking-wide shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {isPending ? "Memproses Permohonan..." : "HANTAR PERMOHONAN"}
        </Button>
      </div>

      {/* Confirmation Modal overlay requiring user check */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm border border-border shadow-2xl rounded-xl bg-white dark:bg-card p-6 space-y-4 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="h-10 w-10 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">
                Pengesahan Hantar Borang
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Adakah anda pasti untuk menghantar permohonan potongan zakat gaji bulanan ini? Lafaz akad zakat anda akan didaftarkan secara rasmi.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsConfirmOpen(false)}
                className="h-9 px-4 text-xs font-semibold cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSubmit}
                className="h-9 px-5 text-xs font-bold bg-[#002060] hover:bg-[#002060]/95 text-white shadow-sm cursor-pointer"
              >
                Ya, Hantar
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
