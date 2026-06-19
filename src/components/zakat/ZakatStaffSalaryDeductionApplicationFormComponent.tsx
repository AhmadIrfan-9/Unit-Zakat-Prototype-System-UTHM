// This updated form component replaces restrictive edit warnings with an empowering textual data update reminder beneath the read-only user grid header.

"use client";

import { useActionState, useState, useCallback, useRef } from "react";
import {
  submitZakatApplicationAction,
  type ZakatSubmissionResult,
} from "@/app/actions/zakatSubmissionServerActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";

// This constant array stores the official Bahasa Melayu month names rendered in the deduction start month selector.
const MALAY_MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
] as const;

// This constant array stores all valid Malaysian state names for the state dropdown selector.
const NEGERI_LIST = [
  "Johor", "Melaka", "Negeri Sembilan", "Pahang", "Selangor", "Terengganu",
  "Kelantan", "Perak", "Pulau Pinang", "Kedah", "Perlis",
  "W.P. Kuala Lumpur", "W.P. Putrajaya", "W.P. Labuan",
] as const;

// This data model outlines the session-sourced personal attributes passed into the application form.
interface AuthenticatedUserProps {
  name?: string | null;
  email?: string | null;
  noPekerja?: string | null;
  noKP?: string | null;
  gajiSemasa?: number | null;
  alamatRumah?: string | null;
}

// This data model describes the component props structure for the salary deduction form container.
interface FormProps {
  user: AuthenticatedUserProps;
  onSwitchToProfile?: () => void;
}

// This data model extends standard input HTML attributes with Ringgit Malaysia-specific identifiers.
interface RmInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  error?: string;
}

// This sub-component renders a prefixed RM currency input with a focused ring highlight on interaction.
function RmInput({ id, name, error, className, disabled, ...rest }: RmInputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
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
          inputMode="decimal"
          placeholder="0.00"
          disabled={disabled}
          className={cn(
            "w-full bg-transparent pl-10 pr-3 h-full text-xs outline-none placeholder:text-muted-foreground",
            className
          )}
          {...rest}
        />
      </div>
      {error && <p className="text-xs text-destructive font-medium mt-1">{error}</p>}
    </div>
  );
}

// This data model defines the props for a single selectable deduction type option row.
interface SectionCRowProps {
  value: string;
  label: string;
  selected: string | null;
  onSelect: (value: string) => void;
  disabled: boolean;
  tooltipText: string;
  children?: React.ReactNode;
}

// This sub-component renders one selectable deduction method row with an accessible tooltip definition.
function SectionCRow({
  value,
  label,
  selected,
  onSelect,
  disabled,
  tooltipText,
  children,
}: SectionCRowProps) {
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
            className="h-5 w-5 rounded border-muted-foreground/40 data-[state=checked]:bg-[#002060] data-[state=checked]:border-[#002060] focus:ring-[#002060]"
          />
          <Label
            htmlFor={`type-${value}`}
            className={cn(
              "cursor-pointer font-semibold text-sm leading-tight select-none",
              isSelected ? "text-[#002060]" : "text-foreground"
            )}
          >
            {label}
          </Label>
        </div>

        {/* This tooltip wrapper displays an institutional definition card on hover or keyboard focus. */}
        <div className="relative group inline-block shrink-0">
          <button
            type="button"
            aria-label={`Definisi untuk ${label}`}
            className="text-slate-400 hover:text-[#002060] focus:text-[#002060] transition-colors cursor-help outline-none p-1 rounded-full hover:bg-muted focus:bg-muted"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-white dark:bg-card border border-border text-foreground rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-50 text-xs font-normal leading-normal">
            <div className="font-bold text-[#002060] mb-1 text-[10px] uppercase tracking-wider">
              Definisi Institusi
            </div>
            <p className="text-muted-foreground">{tooltipText}</p>
            <div className="absolute top-full right-3 border-4 border-transparent border-t-white dark:border-t-card" />
          </div>
        </div>
      </div>

      {/* This conditional block expands the nested amount fields when this deduction row is selected. */}
      {isSelected && children && (
        <div className="ml-8 mt-1 border-l-2 border-[#002060]/20 pl-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// This main form component coordinates the read-only applicant header, deduction type selectors, and DBP success banner lifecycle.
export function ZakatStaffSalaryDeductionApplicationFormComponent({ user, onSwitchToProfile }: FormProps) {

  // This action state hook wires the server action to the form and tracks its pending and result states.
  const [state, dispatch, isPending] = useActionState<ZakatSubmissionResult | null, FormData>(
    submitZakatApplicationAction,
    null
  );

  // This state hook tracks the currently selected deduction type option.
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // This state hook tracks the selected deduction start month value.
  const [bulanMula, setBulanMula] = useState<string>("");

  // This state hook tracks the selected deduction start year value.
  const [tahunMula, setTahunMula] = useState<string>("");

  // This state hook tracks the official deduction amount entered in the lafaz declaration field.
  const [targetDeductionValue, setTargetDeductionValue] = useState<string>("");

  // This state hook tracks whether the lafaz declaration checkbox has been confirmed by the user.
  const [pengesahanLafaz, setPengesahanLafaz] = useState<boolean>(false);

  // This state hook tracks whether the Akta 709 personal data consent checkbox has been confirmed.
  const [persetujuanAkta709, setPersetujuanAkta709] = useState<boolean>(false);

  // This state hook controls the visibility of the pre-submission confirmation modal dialog.
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // This ref connects to the hidden submit button that triggers the server action form dispatch.
  const hiddenSubmitRef = useRef<HTMLButtonElement>(null);

  // This memoized callback toggles or deselects the active deduction type option.
  const handleTypeSelect = useCallback((type: string) => {
    setSelectedType((prev) => (prev === type ? null : type));
  }, []);

  // This helper extracts a specific field validation error string from the server action response.
  const err = (field: string): string | undefined => {
    if (state?.success === false && state.fieldErrors) {
      return (state.fieldErrors as Record<string, string[]>)[field]?.[0];
    }
    return undefined;
  };

  // This function executes the hidden form submit after the confirmation modal is accepted.
  const handleConfirmSubmit = () => {
    setIsConfirmOpen(false);
    hiddenSubmitRef.current?.click();
  };

  // This computed flag resolves whether the server action returned a successful write result.
  const isSuccess = state?.success === true;

  // This block generates a dynamic year range for the tahun mula deduction start year selector.
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear + i));

  // This conditional block renders the DBP-compliant success receipt panel upon a confirmed database write.
  if (isSuccess && state.applicationId) {
    return (
      // This major structural card displays the official application receipt after successful submission.
      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/10 w-full animate-in fade-in duration-300">
        <CardContent className="pt-8 pb-8 text-center space-y-5">

          {/* This success icon container renders an animated bouncing check badge. */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 animate-bounce">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>

          {/* This DBP-validated banner delivers the official submission confirmation text payload with a checkmark icon primitive. */}
          <div className="bg-emerald-600 text-white font-bold px-6 py-4 rounded-xl shadow-md max-w-2xl mx-auto text-xs sm:text-sm tracking-wide leading-relaxed flex items-center justify-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />
            <span>{state.message}</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
              Hantaran Borang Selesai!
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
              Permohonan potongan zakat gaji anda berjaya direkodkan dalam pangkalan data UTHM.
            </p>
          </div>

          {/* This reference display renders the unique application ID for audit tracing purposes. */}
          <div className="inline-block px-4 py-2 bg-background border rounded-lg shadow-xs text-xs font-mono font-bold text-muted-foreground select-all">
            No. Rujukan: {state.applicationId}
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

  return (
    // This layout wrapper contains the complete salary deduction application form tree.
    <form action={dispatch} noValidate className="space-y-8 w-full animate-in fade-in duration-300 relative">

      {/* These hidden inputs inject the session-sourced immutable identity values into the form payload. */}
      <input type="hidden" name="namaPenuh"  value={user.name      ?? ""} />
      <input type="hidden" name="noKP"       value={user.noKP      ?? ""} />
      <input type="hidden" name="noPekerja"  value={user.noPekerja ?? ""} />
      {selectedType && <input type="hidden" name="deductionType" value={selectedType} />}

      {/* This hidden button is the actual native form submit target triggered by the confirmation modal. */}
      <button type="submit" ref={hiddenSubmitRef} className="hidden" aria-hidden="true" />

      {/* This full-screen overlay renders the loading spinner during the server action pending state. */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-3 bg-white dark:bg-card p-6 rounded-xl shadow-2xl border border-border">
            <Loader2 className="h-10 w-10 animate-spin text-[#002060]" />
            <p className="text-xs font-bold text-[#002060] dark:text-blue-300">
              Memproses permohonan anda...
            </p>
          </div>
        </div>
      )}

      {/* This read-only metadata card block auto-populates session identity values in a 3-column grid with the address spanning full width. */}
      <div className="bg-[#002060]/5 border border-[#002060]/10 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-[#002060]/15 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#002060]">
            Maklumat Pemohon (Sesi Aktif)
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#002060] text-white">
            Sesi Disahkan
          </span>
        </div>

        {/* This three-column grid renders Nama Penuh, No. KP, and No. Pekerja in the first row. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Nama Penuh
            </span>
            <span className="text-xs font-semibold text-[#002060] block truncate">
              {user.name ?? "—"}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              No. Kad Pengenalan
            </span>
            <span className="text-xs font-semibold text-foreground block">
              {user.noKP ?? "—"}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              No. Pekerja
            </span>
            <span className="text-xs font-semibold text-foreground block">
              {user.noPekerja ?? "—"}
            </span>
          </div>

          {/* This address field spans all three columns in the second row for full readability. */}
          <div className="md:col-span-3 space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Alamat Rumah
              </span>
              {/* This deep-link button switches the active workspace tab to the editable profile panel. */}
              {onSwitchToProfile && (
                <button
                  type="button"
                  onClick={onSwitchToProfile}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#002060] hover:underline hover:text-[#002060]/80 transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-3 w-3" />
                  Kemaskini Alamat
                </button>
              )}
            </div>
            <span className="text-xs font-semibold text-foreground block leading-relaxed">
              {user.alamatRumah ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Incremental patch removing the rigid yellow warning box and rendering a standard data flexibility statement. */}
      <div className="mt-2 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 rounded-lg p-3 leading-relaxed animate-in fade-in duration-300">
        <span className="font-bold text-[#002060]">Nota:</span> Sekiranya anda perlu mengemas kini maklumat selepas penghantaran borang, anda boleh melakukannya secara terus melalui menu Profil Peribadi pada bila-bila masa bagi memastikan integriti data caruman dikemas kini dengan serta-merta.
      </div>

      {/* This section header labels the personal contact and address inputs of Bahagian A. */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-sm font-bold tracking-wider text-[#002060] uppercase">
            BAHAGIAN A: MAKLUMAT HUBUNGAN
          </h2>
        </div>

        {/* This grid lays out the editable contact number, address, postcode, city, and state fields. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="noTelefon" className="font-semibold text-xs text-[#002060]">
              No. Telefon <span className="text-destructive">*</span>
            </Label>
            <Input
              id="noTelefon"
              name="noTelefon"
              disabled={isPending}
              className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9"
              placeholder="Contoh: 0123456789"
            />
            {err("noTelefon") && (
              <p className="text-xs text-destructive font-medium">{err("noTelefon")}</p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="alamatRumah" className="font-semibold text-xs text-[#002060]">
              Alamat Kediaman <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="alamatRumah"
              name="alamatRumah"
              defaultValue={user.alamatRumah ?? ""}
              disabled={isPending}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002060] focus-visible:ring-offset-2 focus-visible:border-[#002060] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="Masukkan alamat kediaman lengkap"
              rows={3}
            />
            {err("alamatRumah") && (
              <p className="text-xs text-destructive font-medium">{err("alamatRumah")}</p>
            )}
          </div>

          {/* This three-column sub-grid renders the postcode, city, and state selectors. */}
          <div className="grid grid-cols-3 sm:col-span-2 gap-4">
            <div className="space-y-1 col-span-1">
              <Label htmlFor="poskod" className="font-semibold text-xs text-[#002060]">
                Poskod <span className="text-destructive">*</span>
              </Label>
              <Input
                id="poskod"
                name="poskod"
                maxLength={5}
                disabled={isPending}
                className="focus-visible:ring-[#002060] text-xs h-9"
                placeholder="86400"
              />
              {err("poskod") && (
                <p className="text-xs text-destructive font-medium">{err("poskod")}</p>
              )}
            </div>

            <div className="space-y-1 col-span-1">
              <Label htmlFor="bandar" className="font-semibold text-xs text-[#002060]">
                Bandar <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bandar"
                name="bandar"
                disabled={isPending}
                className="focus-visible:ring-[#002060] text-xs h-9"
                placeholder="Parit Raja"
              />
              {err("bandar") && (
                <p className="text-xs text-destructive font-medium">{err("bandar")}</p>
              )}
            </div>

            <div className="space-y-1 col-span-1">
              <Label htmlFor="negeri" className="font-semibold text-xs text-[#002060]">
                Negeri <span className="text-destructive">*</span>
              </Label>
              <Select name="negeri" disabled={isPending}>
                <SelectTrigger id="negeri" className="w-full focus:ring-[#002060] text-xs h-9">
                  <SelectValue placeholder="Pilih Negeri" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {/* This array map renders all valid Malaysian state options in the state dropdown. */}
                  {NEGERI_LIST.map((neg) => (
                    <SelectItem key={neg} value={neg}>
                      {neg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("negeri") && (
                <p className="text-xs text-destructive font-medium">{err("negeri")}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* This section header labels the four selectable deduction method rows of Bahagian C. */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-sm font-bold tracking-wider text-[#002060] uppercase">
            BAHAGIAN C: KAEDAH POTONGAN ZAKAT YANG DIKEHENDAKI
          </h2>
        </div>

        <div className="space-y-3">
          <SectionCRow
            value="ORIGINAL_PCB_CHANGE"
            label="Perubahan potongan PCB Asal"
            selected={selectedType}
            onSelect={handleTypeSelect}
            disabled={isPending}
            tooltipText="Melaraskan caruman zakat berdasarkan nilai Potongan Cukai Bulanan (PCB) yang sedia ada bagi sesi gaji semasa."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div className="space-y-1.5">
                <Label htmlFor="amaunPcbAsal" className="text-xs font-semibold text-muted-foreground">
                  Potongan PCB Asal
                </Label>
                <RmInput
                  id="amaunPcbAsal"
                  name="amaunPcbAsal"
                  disabled={isPending}
                  error={err("amaunPcbAsal")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amaunZakatBulanan-pcb" className="text-xs font-semibold text-muted-foreground">
                  Potongan Zakat Baru Sebulan
                </Label>
                <RmInput
                  id="amaunZakatBulanan-pcb"
                  name="amaunZakatBulanan"
                  disabled={isPending}
                  error={err("amaunZakatBulanan")}
                />
              </div>
            </div>
          </SectionCRow>

          <SectionCRow
            value="FIXED_MONTHLY"
            label="Potongan Zakat Bulanan Sebanyak"
            selected={selectedType}
            onSelect={handleTypeSelect}
            disabled={isPending}
            tooltipText="Caruman zakat bulanan dengan amaun tetap dan konsisten yang dipilih sendiri oleh pemohon setiap bulan."
          >
            <div className="max-w-xs space-y-1.5">
              <Label htmlFor="amaunZakatBulanan-fixed" className="text-xs font-semibold text-muted-foreground">
                Jumlah Potongan Tetap Sebulan
              </Label>
              <RmInput
                id="amaunZakatBulanan-fixed"
                name="amaunZakatBulanan"
                disabled={isPending}
                error={err("amaunZakatBulanan")}
              />
            </div>
          </SectionCRow>

          <SectionCRow
            value="AMOUNT_ADJUSTMENT"
            label="Penambahan / Pengurangan Potongan Zakat"
            selected={selectedType}
            onSelect={handleTypeSelect}
            disabled={isPending}
            tooltipText="Membolehkan pengubahsuaian kadar caruman zakat sedia ada sama ada ditambah atau dikurangkan daripada amaun semasa."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div className="space-y-1.5">
                <Label htmlFor="amaunZakatAsal" className="text-xs font-semibold text-muted-foreground">
                  Daripada (Amaun Semasa)
                </Label>
                <RmInput
                  id="amaunZakatAsal"
                  name="amaunZakatAsal"
                  disabled={isPending}
                  error={err("amaunZakatAsal")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amaunZakatBaru" className="text-xs font-semibold text-muted-foreground">
                  Kepada (Amaun Baru)
                </Label>
                <RmInput
                  id="amaunZakatBaru"
                  name="amaunZakatBaru"
                  disabled={isPending}
                  error={err("amaunZakatBaru")}
                />
              </div>
            </div>
          </SectionCRow>

          <SectionCRow
            value="MATCH_PCB"
            label="Potongan Zakat Mengikut Potongan PCB"
            selected={selectedType}
            onSelect={handleTypeSelect}
            disabled={isPending}
            tooltipText="Kadar caruman zakat diselaraskan secara automatik menyamai amaun Potongan Cukai Bulanan (PCB) aktif — tiada input manual diperlukan."
          >
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              * Tiada pengisian amaun diperlukan. Sistem akan menyelaraskan amaun potongan zakat
              bulanan anda secara automatik menyamai Potongan Cukai Bulanan (PCB) semasa.
            </p>
          </SectionCRow>

          {err("deductionType") && (
            <p className="text-sm text-destructive font-bold mt-2">{err("deductionType")}</p>
          )}
        </div>
      </div>

      {/* This section header labels the lafaz declaration and consent acknowledgement area of Bahagian D. */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-sm font-bold tracking-wider text-[#002060] uppercase">
            BAHAGIAN D: AKAD &amp; LAFAZ MEMBAYAR ZAKAT
          </h2>
        </div>

        <div className="space-y-4">
          <div className="max-w-xs space-y-1.5">
            <Label htmlFor="targetDeductionValue" className="font-semibold text-xs text-[#002060]">
              Amaun Potongan Zakat Bulanan Rasmi (RM){" "}
              <span className="text-destructive">*</span>
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

          {/* This two-column grid places the start month and start year selectors side-by-side. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bulanMula" className="font-semibold text-xs text-[#002060]">
                Bulan Mula Potongan <span className="text-destructive">*</span>
              </Label>
              <Select name="bulanMula" value={bulanMula} onValueChange={setBulanMula} disabled={isPending}>
                <SelectTrigger id="bulanMula" className="w-full focus:ring-[#002060] text-xs h-9">
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {/* This array map renders the twelve Bahasa Melayu month names as dropdown options. */}
                  {MALAY_MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("bulanMula") && (
                <p className="text-xs text-destructive font-medium">{err("bulanMula")}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tahunMula" className="font-semibold text-xs text-[#002060]">
                Tahun Mula Potongan <span className="text-destructive">*</span>
              </Label>
              <Select name="tahunMula" value={tahunMula} onValueChange={setTahunMula} disabled={isPending}>
                <SelectTrigger id="tahunMula" className="w-full focus:ring-[#002060] text-xs h-9">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {/* This array map renders the available deduction start year options from the current year forward. */}
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("tahunMula") && (
                <p className="text-xs text-destructive font-medium">{err("tahunMula")}</p>
              )}
            </div>
          </div>

          {/* This amber card renders the live-preview lafaz declaration text populated from the user's form inputs. */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
            <p className="text-sm text-amber-900 font-semibold mb-2">Lafaz Niat Zakat Gaji:</p>
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

          {/* This checkbox block captures the lafaz declaration acknowledgment from the staff member. */}
          <div className="space-y-1">
            <div
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 bg-card/40",
                err("pengesahanLafaz")
                  ? "border-destructive bg-destructive/5"
                  : "border-border hover:bg-card/70"
              )}
            >
              <Checkbox
                id="pengesahanLafaz"
                name="pengesahanLafaz"
                value="true"
                checked={pengesahanLafaz}
                onCheckedChange={(checked) => setPengesahanLafaz(!!checked)}
                disabled={isPending}
                className="mt-0.5 h-5 w-5 rounded border-muted-foreground/40 data-[state=checked]:bg-[#002060] data-[state=checked]:border-[#002060] focus:ring-[#002060]"
              />
              <Label
                htmlFor="pengesahanLafaz"
                className="cursor-pointer text-xs leading-relaxed text-muted-foreground select-none"
              >
                Saya mengesahkan dengan ini akad lafaz pembayaran zakat gaji di atas dibaca dengan
                penuh kesedaran dan persetujuan bertulis.
              </Label>
            </div>
            {err("pengesahanLafaz") && (
              <p className="text-xs text-destructive font-medium mt-1">{err("pengesahanLafaz")}</p>
            )}
          </div>

          {/* This checkbox block captures the Akta 709 personal data protection consent from the staff member. */}
          <div className="space-y-1">
            <div
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 bg-card/40",
                err("persetujuanAkta709")
                  ? "border-destructive bg-destructive/5"
                  : "border-border hover:bg-card/70"
              )}
            >
              <Checkbox
                id="persetujuanAkta709"
                name="persetujuanAkta709"
                value="true"
                checked={persetujuanAkta709}
                onCheckedChange={(checked) => setPersetujuanAkta709(!!checked)}
                disabled={isPending}
                className="mt-0.5 h-5 w-5 rounded border-muted-foreground/40 data-[state=checked]:bg-[#002060] data-[state=checked]:border-[#002060] focus:ring-[#002060]"
              />
              <Label
                htmlFor="persetujuanAkta709"
                className="cursor-pointer text-xs leading-relaxed text-muted-foreground select-none"
              >
                Saya memberikan kebenaran bertulis pemprosesan maklumat peribadi selaras dengan
                Akta Perlindungan Data Peribadi 2010 (Akta 709).
              </Label>
            </div>
            {err("persetujuanAkta709") && (
              <p className="text-xs text-destructive font-medium mt-1">{err("persetujuanAkta709")}</p>
            )}
          </div>
        </div>
      </div>

      {/* This error banner renders any non-field-level server error messages returned from the action. */}
      {state?.success === false && !state.fieldErrors && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive font-semibold">{state.error}</p>
        </div>
      )}

      {/* This centered submit button area places the emerald green primary action button at the base of the form. */}
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
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              MEMPROSES...
            </span>
          ) : (
            "HANTAR BORANG PERMOHONAN"
          )}
        </Button>
      </div>

      {/* This confirmation modal overlay requires the user to explicitly accept before the form payload is dispatched. */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm border border-border shadow-2xl rounded-xl bg-white dark:bg-card p-6 space-y-4 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="h-10 w-10 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Sahkan Penghantaran Borang</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Adakah anda bersetuju untuk menghantar borang permohonan potongan zakat gaji ini dan
              mengaktifkan lafaz akad secara sah?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              {/* This cancel button uses a neutral outline style that fills red only on hover for asymmetric button hierarchy. */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isPending}
                className="h-9 px-4 text-xs font-semibold cursor-pointer border-slate-200 text-slate-600 hover:bg-red-600 hover:text-white hover:border-red-600 focus:bg-red-600 focus:text-white transition-all duration-200"
              >
                Batal
              </Button>
              {/* This confirm button uses a solid emerald fill as the primary transaction confirmation action. */}
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
