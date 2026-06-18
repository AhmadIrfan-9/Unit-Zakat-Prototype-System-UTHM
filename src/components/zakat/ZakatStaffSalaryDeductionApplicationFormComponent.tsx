// This form captures salary deduction data using read-only applicant headers and triggers a formal DBP-compliant success banner upon submission.

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
import { AlertCircle, HelpCircle } from "lucide-react";

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

// This input component formats monetary amounts in Ringgit Malaysia with absolute positioning.
function RmInput({ id, name, error, className, disabled, ...rest }: RmInputProps) {
  return (
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
  tooltipText: string;
  children?: React.ReactNode;
}

// This component renders individual option rows for specific salary deduction types.
function SectionCRow({ value, label, selected, onSelect, disabled, tooltipText, children }: SectionCRowProps) {
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
      <div className="flex items-center justify-between gap-3">
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

        <div className="relative group inline-block ml-2 align-middle shrink-0">
          <button
            type="button"
            className="text-slate-400 hover:text-[#002060] focus:text-[#002060] transition-colors cursor-help outline-none p-1 rounded-full hover:bg-muted focus:bg-muted"
            aria-label={`Penerangan bagi ${label}`}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-white dark:bg-card border border-border text-foreground rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-50 text-xs font-normal leading-normal">
            <div className="font-bold text-[#002060] mb-1">Definisi Korporat</div>
            <p className="text-muted-foreground">{tooltipText}</p>
            <div className="absolute top-full right-3 border-4 border-transparent border-t-white dark:border-t-card" />
          </div>
        </div>
      </div>
      
      {isSelected && children && (
        <div className="ml-8 mt-1 border-l-2 border-[#002060]/20 pl-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// This form component captures employee details and compiles salary deduction configurations for submission.
export function ZakatStaffSalaryDeductionApplicationFormComponent({ user }: ZakatStaffSalaryDeductionApplicationFormProps) {
  // This asynchronous state hook handles the server action lifecycle for form submission transactions.
  const [state, dispatch, isPending] = useActionState<ZakatStaffSalaryDeductionActionResult | null, FormData>(
    handleZakatDeductionSubmission,
    null
  );

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [bulanMula, setBulanMula] = useState<string>("");
  const [tahunMula, setTahunMula] = useState<string>("");
  const [targetDeductionValue, setTargetDeductionValue] = useState<string>("");
  const [pengesahanLafaz, setPengesahanLafaz] = useState<boolean>(false);
  const [persetujuanAkta709, setPersetujuanAkta709] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const hiddenSubmitRef = useRef<HTMLButtonElement>(null);

  const handleTypeSelect = useCallback((type: string) => {
    setSelectedType((prev) => (prev === type ? null : type));
  }, []);

  const err = (field: keyof ZakatStaffSalaryDeductionFieldErrors) => {
    if (state?.success === false && state.fieldErrors) {
      return state.fieldErrors[field]?.[0];
    }
    return undefined;
  };

  const handleConfirmSubmit = () => {
    setIsConfirmOpen(false);
    hiddenSubmitRef.current?.click();
  };

  const isSuccess = state?.success === true;

  // This view-gating conditional block determines if the submission succeeded to display the receipt screen.
  if (isSuccess && state?.data) {
    return (
      // This major structural component card displays the official submission receipt details.
      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/10 w-full animate-in fade-in duration-300">
        <CardContent className="pt-8 text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 animate-bounce">
            <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* This layout wrapper container displays the Dewan Bahasa dan Pustaka validated success announcement. */}
          <div className="bg-emerald-600 text-white font-bold px-6 py-4 rounded-xl shadow-md max-w-2xl mx-auto text-xs sm:text-sm tracking-wide leading-relaxed">
            Permohonan Berjaya Dihantar. Borang anda telah diterima secara rasmi dan akan diproses dalam tempoh masa yang ditetapkan oleh Unit Pengurusan Zakat UTHM.
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
              Hantaran Borang Selesai!
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
              Permohonan potongan zakat gaji anda berjaya direkodkan dalam pangkalan data UTHM.
            </p>
          </div>
          
          <div className="inline-block px-4 py-2 bg-background border rounded-lg shadow-xs text-xs font-mono font-bold text-muted-foreground select-all">
            No. Rujukan: {state.data.applicationId}
          </div>
          <div className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.reload()}
              className="px-6 py-2 border-[#002060] text-[#002060] hover:bg-[#002060] hover:text-white font-bold cursor-pointer transition-all duration-200"
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
    // This layout wrapper container structures the form submission tree and tracking attributes.
    <form ref={formRef} action={dispatch} noValidate className="space-y-8 w-full animate-in fade-in duration-300 relative">
      {selectedType && <input type="hidden" name="deductionType" value={selectedType} />}
      
      <input type="hidden" name="namaPenuh" value={user.name || ""} />
      <input type="hidden" name="noKP" value={user.noKP || ""} />
      <input type="hidden" name="noPekerja" value={user.noPekerja || ""} />

      <button type="submit" ref={hiddenSubmitRef} className="hidden" />

      {/* This view-gating conditional block displays the modal loading overlay when transactions are pending. */}
      {isPending && (
        // This layout wrapper container dims the viewport to emphasize the transaction submission progress indicator.
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-3 bg-white dark:bg-card p-6 rounded-xl shadow-2xl border border-border">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-[#002060]" />
            <p className="text-xs font-bold text-[#002060] dark:text-blue-300">Memproses permohonan anda...</p>
          </div>
        </div>
      )}

      {/* This major structural component card shows the verified applicant identity details from the current session. */}
      <div className="bg-[#002060]/5 border border-[#002060]/10 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-[#002060]/15 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#002060]">
            Maklumat Pemohon (Sesi Aktif)
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#002060] text-white">
            Sesi Disahkan
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Nama Penuh</span>
            <span className="text-xs font-semibold text-[#002060] block truncate">{user.name || "-"}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">No. Kad Pengenalan</span>
            <span className="text-xs font-semibold text-foreground block">{user.noKP || "-"}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">No. Pekerja</span>
            <span className="text-xs font-semibold text-foreground block">{user.noPekerja || "-"}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Gaji Semasa</span>
            <span className="text-xs font-bold text-[#002060] block">
              {user.gajiSemasa ? `RM ${user.gajiSemasa.toFixed(2)}` : "RM 0.00"}
            </span>
          </div>
        </div>
      </div>

      {/* This layout wrapper container groups the contact information and residential address inputs. */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-sm font-bold tracking-wider text-[#002060] uppercase">
            BAHAGIAN A: MAKLUMAT PERIBADI (PROFIL KAKITANGAN)
          </h2>
        </div>

        {/* This major structural component card informs users about updating fixed identity parameters. */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3.5 text-xs text-amber-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <p className="leading-relaxed">
            <strong>Pemberitahuan Pindaan:</strong> Untuk membetulkan nama atau maklumat profil, sila hubungi bahagian penggajian zakat.
          </p>
          <a
            href={`mailto:zakat-desk@uthm.edu.my?subject=Pindaan%20Profil%20Zakat%20-%20${user.noPekerja || ""}`}
            className="inline-flex items-center justify-center px-3.5 py-1.5 bg-[#002060] hover:bg-[#002060]/90 text-white rounded text-[10px] font-bold shadow-xs cursor-pointer select-none transition-all shrink-0 text-center uppercase tracking-wider"
          >
            Hubungi Pentadbir
          </a>
        </div>
        
        {/* This layout wrapper container arranges the editable contact address fields into a two-column responsive grid. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="noTelefon" className="font-semibold text-xs text-[#002060]">No. Telefon <span className="text-destructive">*</span></Label>
            <Input id="noTelefon" name="noTelefon" disabled={isPending} className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9" placeholder="Contoh: 0123456789" />
            {err("noTelefon") && <p className="text-xs text-destructive font-medium">{err("noTelefon")}</p>}
          </div>

          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="alamatRumah" className="font-semibold text-xs text-[#002060]">Alamat Kediaman <span className="text-destructive">*</span></Label>
            <Textarea id="alamatRumah" name="alamatRumah" defaultValue={user.alamatRumah || ""} disabled={isPending} className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs" placeholder="Masukkan alamat kediaman lengkap" rows={3} />
            {err("alamatRumah") && <p className="text-xs text-destructive font-medium">{err("alamatRumah")}</p>}
          </div>

          {/* This layout wrapper container aligns the residential location details on a shared grid row. */}
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
                  <SelectValue placeholder="Pilih Negeri" />
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

      {/* This layout wrapper container lists the primary calculation methods for salary deductions. */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-sm font-bold tracking-wider text-[#002060] uppercase">
            BAHAGIAN C: KAEDAH POTONGAN ZAKAT YANG DIKEHENDAKI
          </h2>
        </div>

        {/* This layout wrapper container stacks the four customizable method selection components vertically. */}
        <div className="space-y-3">
          <SectionCRow
            value="ORIGINAL_PCB_CHANGE"
            label="Perubahan potongan PCB Asal"
            selected={selectedType}
            onSelect={handleTypeSelect}
            disabled={isPending}
            tooltipText="Membolehkan kakitangan melaraskan sumbangan zakat berdasarkan pengiraan potongan PCB sedia ada."
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
            tooltipText="Pilihan caruman zakat bulanan dengan amaun tetap yang konsisten mengikut kehendak pemohon."
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
            tooltipText="Membolehkan pengubahsuaian kadar caruman zakat sedia ada sama ada ditambah atau dikurangkan."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div className="space-y-1.5">
                <Label htmlFor="amaunZakatAsal" className="text-xs font-semibold text-muted-foreground">Daripada (Amaun Semasa)</Label>
                <RmInput id="amaunZakatAsal" name="amaunZakatAsal" disabled={isPending} error={err("amaunZakatAsal")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amaunZakatBaru" className="text-xs font-semibold text-muted-foreground">Kepada (Amaun Baru)</Label>
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
            tooltipText="Kadar caruman zakat diselaraskan secara automatik menyamai amaun Potongan Cukai Bulanan (PCB) semasa."
          >
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              * Tiada pengisian amaun diperlukan. Sistem potongan gaji akan menyelaraskan amaun potongan zakat bulanan anda secara automatik menyamai amaun Potongan Cukai Bulanan (PCB) semasa.
            </p>
          </SectionCRow>

          {err("deductionType") && (
            <p className="text-sm text-destructive font-bold mt-2">{err("deductionType")}</p>
          )}
        </div>
      </div>

      {/* This layout wrapper container aggregates the formal declaration text, confirmation checkboxes, and submit triggers. */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-sm font-bold tracking-wider text-[#002060] uppercase">
            BAHAGIAN D: AKAD & LAFAZ MEMBAYAR ZAKAT
          </h2>
        </div>

        {/* This layout wrapper container stacks the formal declaration fields and acknowledgements. */}
        <div className="space-y-4">
          <div className="max-w-xs space-y-1.5">
            <Label htmlFor="targetDeductionValue" className="font-semibold text-xs text-[#002060]">
              Amaun Potongan Zakat Bulanan Rasmi (RM) <span className="text-destructive">*</span>
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
                  <SelectValue placeholder="Pilih Bulan" />
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
                  <SelectValue placeholder="Pilih Tahun" />
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

          {/* This major structural component card presents the official electronic lafaz translation text. */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
            <p className="text-sm text-amber-900 font-semibold mb-2">
              Lafaz Niat Zakat Gaji:
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
              bagi menunaikan zakat pendapatan wajib yang dikenakan ke atas diri saya.&rdquo;
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
                Saya mengesahkan dengan ini akad lafaz pembayaran zakat gaji di atas dibaca dengan penuh kesedaran dan persetujuan bertulis.
              </Label>
            </div>
            {err("pengesahanLafaz") && <p className="text-xs text-destructive font-medium mt-1">{err("pengesahanLafaz")}</p>}
          </div>

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
                Saya memberikan kebenaran bertulis pemprosesan maklumat peribadi selaras dengan Akta Perlindungan Data Peribadi 2010 (Akta 709).
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

      {/* This layout wrapper container centers the submission control elements at the base of the form. */}
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
          {isPending ? "MEMPROSES..." : "HANTAR BORANG PERMOHONAN"}
        </Button>
      </div>

      {/* This view-gating conditional block renders the confirmation modal overlay when the user triggers the form submission. */}
      {isConfirmOpen && (
        // This layout wrapper container locks focus and overlays the main workspace with the confirmation prompt.
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          {/* This major structural component card prompts the user to finalize their deduction request. */}
          <div className="w-full max-w-sm border border-border shadow-2xl rounded-xl bg-white dark:bg-card p-6 space-y-4 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="h-10 w-10 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">
                Sahkan Penghantaran Borang
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Adakah anda bersetuju untuk menghantar borang permohonan potongan zakat gaji ini dan mengaktifkan lafaz akad secara sah?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isPending}
                className="h-9 px-4 text-xs font-semibold cursor-pointer border-slate-200 text-slate-600 hover:bg-red-600 hover:text-white hover:border-red-600 focus:bg-red-600 focus:text-white focus:border-red-600 transition-all duration-200"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isPending}
                className="h-9 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer border-none transition-colors"
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
