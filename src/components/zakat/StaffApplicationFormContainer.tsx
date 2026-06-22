// src/components/zakat/ZakatStaffApplicationFormContainerComponent.tsx
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

// This interface declares the structure of user data passed from the authenticated session.
interface AuthenticatedUserProps {
  name?: string | null;
  email?: string | null;
  noPekerja?: string | null;
  noKP?: string | null;
  gajiSemasa?: number | null;
  alamatRumah?: string | null;
}

interface ZakatStaffApplicationFormContainerProps {
  user: AuthenticatedUserProps;
}

interface RmInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  error?: string;
}

// This utility input displays the Malaysian currency prepended with RM and handles focus ring states.
function RmInput({ id, name, error, className, disabled, ...rest }: RmInputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div
        className={cn(
          "flex items-center rounded-lg border bg-background ring-offset-background transition-all",
          "focus-within:ring-2 focus-within:ring-[#002060] focus-within:ring-offset-2",
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

// This helper component generates rows inside Section C containing a checkbox and dynamic conditional fields.
function SectionCRow({ value, label, selected, onSelect, disabled, children }: SectionCRowProps) {
  const isSelected = selected === value;
  return (
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
      
      {isSelected && children && (
        <div className="ml-8 mt-1 border-l-2 border-[#002060]/20 pl-4 space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}

// This client component loads the authenticated employee's profile as uneditable text and handles the dynamic salary deduction application pipeline.
export function ZakatStaffApplicationFormContainerComponent({ user }: ZakatStaffApplicationFormContainerProps) {
  // Bind form actions dynamically to Next.js server actions to handle background logic.
  const [state, dispatch, isPending] = useActionState<ZakatStaffSalaryDeductionActionResult | null, FormData>(
    handleZakatDeductionSubmission,
    null
  );

  // Manage selection states of checkboxed deduction types inside the interactive UI layout.
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Manage month starting fields to display them instantly in the electronic covenant preview.
  const [bulanMula, setBulanMula] = useState<string>("");

  // Manage year starting fields to display them instantly in the electronic covenant preview.
  const [tahunMula, setTahunMula] = useState<string>("");

  // Track the raw numeric amount to be dynamically rendered inside the Arabic akad statement block.
  const [targetDeductionValue, setTargetDeductionValue] = useState<string>("");

  // Control confirmation status checkbox before letting the submission trigger compile.
  const [pengesahanLafaz, setPengesahanLafaz] = useState<boolean>(false);

  // Reference hooks to access form nodes and trigger programmatic submission flows securely.
  const formRef = useRef<HTMLFormElement>(null);
  const hiddenSubmitRef = useRef<HTMLButtonElement>(null);

  // Interactive dialog visibility toggles.
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Handle section checks and toggle options mutually exclusively to prevent multi-value state submissions.
  const handleTypeSelect = useCallback((type: string) => {
    setSelectedType((prev) => (prev === type ? null : type));
  }, []);

  // Map server validation feedback fields to corresponding input segments in browser viewport.
  const err = (field: keyof ZakatStaffSalaryDeductionFieldErrors) => {
    if (state?.success === false && state.fieldErrors) {
      return state.fieldErrors[field]?.[0];
    }
    return undefined;
  };

  // Trigger form submission programmatically once the user clicks "Yes" in the confirmation overlay.
  const handleConfirmSubmit = () => {
    setIsConfirmOpen(false);
    hiddenSubmitRef.current?.click();
  };

  const isSuccess = state?.success === true;

  // Intercept the dashboard page flow with a victory modal card upon successful record ingestion.
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

  // Determine Johor 2026 monthly Nisab threshold (RM 2,150.00).
  const NISAB_BULANAN = 2150.00;
  const isEligible = (user.gajiSemasa || 0) >= NISAB_BULANAN;

  return (
    <form ref={formRef} action={dispatch} noValidate className="space-y-8">
      {selectedType && <input type="hidden" name="deductionType" value={selectedType} />}
      
      {/* Hidden fields to submit credentials details loaded from the session */}
      <input type="hidden" name="namaPenuh" value={user.name || ""} />
      <input type="hidden" name="noKP" value={user.noKP || ""} />
      <input type="hidden" name="noPekerja" value={user.noPekerja || ""} />

      {/* Hidden button to let JavaScript trigger browser form validation and server dispatching */}
      <button type="submit" ref={hiddenSubmitRef} className="hidden" />

      {/* Grid Layout for Personal Details and Nisab/Haul Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* BAHAGIAN A: MAKLUMAT PERIBADI */}
        <div className="md:col-span-2 space-y-4">
          <div className="border-b border-border pb-2">
            <h2 className="text-sm font-bold tracking-wider text-[#002060] uppercase">
              BAHAGIAN A: MAKLUMAT PERIBADI (PROFIL STAF)
            </h2>
          </div>

          {/* Email management staff instruction panel */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3.5 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
            <p className="leading-relaxed">
              <strong>Pemberitahuan Pindaan:</strong> Untuk menukar sebarang maklumat profil (Nama, No. KP, No. Pekerja, Gaji Semasa), anda perlu menghubungi staf pengurusan melalui emel rasmi.
            </p>
            <a
              href="mailto:zainal@uthm.edu.my?subject=Pindaan%20Maklumat%20Profil%20Zakat%20Gaji%20-%20%5BNo.%20Pekerja:%20STAFF001%5D"
              className="inline-flex items-center justify-center px-3.5 py-1.5 bg-[#002060] hover:bg-[#002060]/90 text-white rounded text-[10px] font-bold shadow-xs cursor-pointer select-none transition-all shrink-0 text-center uppercase tracking-wider"
            >
              Emel Pengurusan
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="font-semibold text-xs text-[#002060]">Nama Penuh</Label>
              <Input value={user.name || "-"} disabled className="bg-muted/50 cursor-not-allowed border-muted font-medium text-foreground opacity-90" />
            </div>

            <div className="space-y-1">
              <Label className="font-semibold text-xs text-[#002060]">No. Kad Pengenalan</Label>
              <Input value={user.noKP || "-"} disabled className="bg-muted/50 cursor-not-allowed border-muted font-medium text-foreground opacity-90" />
            </div>

            <div className="space-y-1">
              <Label className="font-semibold text-xs text-[#002060]">No. Pekerja</Label>
              <Input value={user.noPekerja || "-"} disabled className="bg-muted/50 cursor-not-allowed border-muted font-medium text-foreground opacity-90" />
            </div>

            <div className="space-y-1">
              <Label className="font-semibold text-xs text-[#002060]">Gaji Semasa</Label>
              <Input value={user.gajiSemasa ? `RM ${user.gajiSemasa.toFixed(2)}` : "RM 0.00"} disabled className="bg-muted/50 cursor-not-allowed border-muted font-semibold text-foreground opacity-90" />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="noTelefon" className="font-semibold text-xs text-[#002060]">No. Telefon <span className="text-destructive">*</span></Label>
              <Input id="noTelefon" name="noTelefon" disabled={isPending} className="focus-visible:ring-[#002060] focus-visible:border-[#002060]" placeholder="Contoh: 0123456789" />
              {err("noTelefon") && <p className="text-xs text-destructive font-medium">{err("noTelefon")}</p>}
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="alamatRumah" className="font-semibold text-xs text-[#002060]">Alamat Rumah <span className="text-destructive">*</span></Label>
              <Textarea id="alamatRumah" name="alamatRumah" defaultValue={user.alamatRumah || ""} disabled={isPending} className="focus-visible:ring-[#002060] focus-visible:border-[#002060]" placeholder="Masukkan alamat kediaman penuh" rows={3} />
              {err("alamatRumah") && <p className="text-xs text-destructive font-medium">{err("alamatRumah")}</p>}
            </div>

            <div className="grid grid-cols-3 sm:col-span-2 gap-4">
              <div className="space-y-1 col-span-1">
                <Label htmlFor="poskod" className="font-semibold text-xs text-[#002060]">Poskod <span className="text-destructive">*</span></Label>
                <Input id="poskod" name="poskod" maxLength={5} disabled={isPending} className="focus-visible:ring-[#002060] focus-visible:border-[#002060]" placeholder="86400" />
                {err("poskod") && <p className="text-xs text-destructive font-medium">{err("poskod")}</p>}
              </div>

              <div className="space-y-1 col-span-1">
                <Label htmlFor="bandar" className="font-semibold text-xs text-[#002060]">Bandar <span className="text-destructive">*</span></Label>
                <Input id="bandar" name="bandar" disabled={isPending} className="focus-visible:ring-[#002060] focus-visible:border-[#002060]" placeholder="Parit Raja" />
                {err("bandar") && <p className="text-xs text-destructive font-medium">{err("bandar")}</p>}
              </div>

              <div className="space-y-1 col-span-1">
                <Label htmlFor="negeri" className="font-semibold text-xs text-[#002060]">Negeri <span className="text-destructive">*</span></Label>
                <Select name="negeri" disabled={isPending}>
                  <SelectTrigger id="negeri" className="w-full focus-visible:ring-[#002060] focus-visible:border-[#002060] focus:ring-[#002060]">
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

        {/* SIDE-PANEL: HAUL & NISAB INDICATORS */}
        <div className="space-y-4">
          <div className="border-b border-border pb-2">
            <h2 className="text-sm font-bold tracking-wider text-[#002060] uppercase">
              STATUS KEWAJIPAN
            </h2>
          </div>
          
          <div className="space-y-4">
            {/* Nisab Status Card */}
            <Card className={cn(
              "border shadow-xs overflow-hidden",
              isEligible 
                ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-800/40 dark:bg-emerald-950/15" 
                : "border-amber-200 bg-amber-50/40 dark:border-amber-800/40 dark:bg-amber-950/15"
            )}>
              <div className={cn(
                "px-4 py-2 text-xs font-bold text-white flex items-center justify-between",
                isEligible ? "bg-emerald-600" : "bg-amber-600"
              )}>
                <span>{isEligible ? "WAJIB ZAKAT" : "SUKARELA / DIGALAKKAN"}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">Johor 2026</span>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Nisab Bulanan</div>
                  <div className="text-lg font-extrabold text-[#002060] dark:text-blue-300">RM {NISAB_BULANAN.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Gaji Anda</div>
                  <div className="text-sm font-bold text-foreground">RM {user.gajiSemasa ? user.gajiSemasa.toFixed(2) : "0.00"}</div>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                  {isEligible 
                    ? "Gaji bulanan anda melebihi paras Nisab. Anda diwajibkan membuat potongan zakat pendapatan."
                    : "Gaji bulanan anda belum mencapai paras Nisab bulanan, namun anda amat digalakkan membuat potongan zakat secara sukarela."
                  }
                </p>
              </CardContent>
            </Card>

            {/* Haul Information Card */}
            <Card className="border border-border bg-card/40 shadow-xs">
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Haul Zakat</div>
                  <div className="text-sm font-extrabold text-[#002060] dark:text-blue-300">12 Bulan (1 Tahun)</div>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                  Haul merujuk kepada tempoh genap satu tahun hijrah bagi pemilikan harta pendapatan sebelum dihitung kewajipan zakatnya.
                </p>
              </CardContent>
            </Card>
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
                <SelectTrigger id="bulanMula" className="w-full focus-visible:ring-[#002060] focus-visible:border-[#002060] focus:ring-[#002060]">
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
                <SelectTrigger id="tahunMula" className="w-full focus-visible:ring-[#002060] focus-visible:border-[#002060] focus:ring-[#002060]">
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

          {/* Interactive Akad Banner */}
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
        </div>
      </div>

      {state?.success === false && !state.fieldErrors && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive font-semibold">
          {state.error}
        </div>
      )}

      {/* Main button has type="button" to prompt confirmation dialog overlay instead of direct execution */}
      <div className="pt-4 flex justify-center">
        <Button
          type="button"
          onClick={() => {
            if (selectedType && pengesahanLafaz) {
              setIsConfirmOpen(true);
            }
          }}
          disabled={isPending || !selectedType || !pengesahanLafaz}
          aria-busy={isPending}
          className="w-full sm:max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm tracking-wide shadow-md transition-all duration-200 cursor-pointer"
        >
          {isPending ? "Memproses Permohonan..." : "HANTAR PERMOHONAN"}
        </Button>
      </div>

      {/* Confirmation Modal Box requiring confirmation from the user prior to submitting the form data */}
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
