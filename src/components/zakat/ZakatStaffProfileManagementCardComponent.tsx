// This profile management card displays empty form inputs styled with low-opacity format placeholders to guide staff data entry cleanly.

"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NEGERI_LIST } from "@/lib/validations/zakatDeductionValidationSchema";
import { zakatProfileSchema, type ZakatProfileInput } from "@/lib/validations/zakatProfileSchema";
import { updateUserProfileAction } from "@/app/actions/zakatWorkflowManagementServerActions";
import { toast } from "sonner";

interface ProfileDefaultValues {
  namaPenuh?: string;
  noKP?: string;
  noPekerja?: string;
  umur?: number;
  gajiSemasa?: string;
  noTelefon?: string;
  alamatRumah?: string;
  poskod?: string;
  bandar?: string;
  negeri?: string;
  isManagement?: boolean;
}

interface ZakatStaffProfileManagementCardProps {
  defaultValues?: ProfileDefaultValues;
}

export function ZakatStaffProfileManagementCardComponent({ defaultValues }: ZakatStaffProfileManagementCardProps) {
  // This hook handles the React server action transition state.
  const [isPending, startTransition] = useTransition();

  // This form state manages initialization with empty defaults to enforce user input guided by placeholders.
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(zakatProfileSchema),
    defaultValues: {
      namaPenuh: "",
      noKP: "",
      umur: undefined,
      noTelefon: "",
      noPekerja: "",
      gajiSemasa: undefined,
      negeri: "",
      bandar: "",
      poskod: "",
      alamatRumah: "",
      persetujuanAkta709: false,
    }
  });

  const negeriValue = watch("negeri");
  const consentValue = watch("persetujuanAkta709");

  // This method submits the validated fields to the server database mutation.
  const onSubmit = (data: ZakatProfileInput) => {
    startTransition(async () => {
      const result = await updateUserProfileAction({
        namaPenuh: data.namaPenuh,
        noKP: data.noKP,
        noPekerja: data.noPekerja,
        umur: data.umur,
        gajiSemasa: data.gajiSemasa,
        alamatRumah: data.alamatRumah,
      });

      if (result.success) {
        toast.success("Maklumat profil berjaya dikemaskini.");
      } else {
        toast.error(result.error || "Gagal mengemas kini profil.");
      }
    });
  };

  return (
    // Centered single card constraints.
    <Card className="border border-border/80 shadow-xl bg-white dark:bg-card/95 w-full">
      
      {/* Header block introducing the profile card details */}
      <CardHeader className="border-b border-border bg-muted/10 px-6 py-6">
        <CardTitle className="text-base font-bold text-[#002060] flex items-center gap-2">
          <User className="h-5 w-5" />
          <span>Profil Kakitangan UTHM</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Sila kemaskini maklumat profil peribadi dan rekod kerjaya anda secara lengkap.
        </CardDescription>
      </CardHeader>
      
      {/* Content wrapper rendering the form input grid */}
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Block A: Maklumat Peribadi */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#002060] border-b pb-1">
                Maklumat Peribadi
              </h3>
              
              {/* Full name input box */}
              <div className="space-y-1.5">
                <Label htmlFor="namaPenuh" className="font-semibold text-xs text-[#002060]">Nama Penuh</Label>
                <Input
                  id="namaPenuh"
                  placeholder="Ali bin Abu"
                  className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9 placeholder:text-slate-400/40"
                  {...register("namaPenuh")}
                />
                {errors.namaPenuh && (
                  <p className="text-xs text-destructive font-semibold">{String(errors.namaPenuh.message)}</p>
                )}
              </div>

              {/* IC number input box */}
              <div className="space-y-1.5">
                <Label htmlFor="noKP" className="font-semibold text-xs text-[#002060]">No. Kad Pengenalan</Label>
                <Input
                  id="noKP"
                  placeholder="000000000000"
                  className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9 placeholder:text-slate-400/40"
                  {...register("noKP")}
                />
                {errors.noKP && (
                  <p className="text-xs text-destructive font-semibold">{String(errors.noKP.message)}</p>
                )}
              </div>

              {/* Age input box */}
              <div className="space-y-1.5">
                <Label htmlFor="umur" className="font-semibold text-xs text-[#002060]">Umur</Label>
                <Input
                  id="umur"
                  type="number"
                  placeholder="37"
                  className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9 placeholder:text-slate-400/40"
                  {...register("umur")}
                />
                {errors.umur && (
                  <p className="text-xs text-destructive font-semibold">{String(errors.umur.message)}</p>
                )}
              </div>

              {/* Phone number input box */}
              <div className="space-y-1.5">
                <Label htmlFor="noTelefon" className="font-semibold text-xs text-[#002060]">No. Telefon</Label>
                <Input
                  id="noTelefon"
                  type="tel"
                  placeholder="0123456789"
                  className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9 placeholder:text-slate-400/40"
                  {...register("noTelefon")}
                />
                {errors.noTelefon && (
                  <p className="text-xs text-destructive font-semibold">{String(errors.noTelefon.message)}</p>
                )}
              </div>
            </div>

            {/* Block B: Maklumat Pekerjaan */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#002060] border-b pb-1">
                Maklumat Pekerjaan
              </h3>

              {/* Employee ID input box */}
              <div className="space-y-1.5">
                <Label htmlFor="noPekerja" className="font-semibold text-xs text-[#002060]">No. Pekerja</Label>
                <Input
                  id="noPekerja"
                  placeholder="STAFF001"
                  className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9 placeholder:text-slate-400/40"
                  {...register("noPekerja")}
                />
                {errors.noPekerja && (
                  <p className="text-xs text-destructive font-semibold">{String(errors.noPekerja.message)}</p>
                )}
              </div>

              {/* Current salary input box */}
              <div className="space-y-1.5">
                <Label htmlFor="gajiSemasa" className="font-semibold text-xs text-[#002060]">Gaji Semasa (RM)</Label>
                <Input
                  id="gajiSemasa"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9 placeholder:text-slate-400/40"
                  {...register("gajiSemasa")}
                />
                {errors.gajiSemasa && (
                  <p className="text-xs text-destructive font-semibold">{String(errors.gajiSemasa.message)}</p>
                )}
              </div>

              {/* State select dropdown */}
              <div className="space-y-1.5">
                <Label htmlFor="negeri" className="font-semibold text-xs text-[#002060]">Negeri</Label>
                <Select
                  value={negeriValue}
                  onValueChange={(val) => setValue("negeri", val, { shouldValidate: true })}
                >
                  <SelectTrigger id="negeri" className="w-full text-xs h-9 focus:ring-[#002060]">
                    <SelectValue placeholder="Pilih Negeri" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {NEGERI_LIST.map((neg) => (
                      <SelectItem key={neg} value={neg}>{neg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.negeri && (
                  <p className="text-xs text-destructive font-semibold">{String(errors.negeri.message)}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* City location input box */}
                <div className="space-y-1.5">
                  <Label htmlFor="bandar" className="font-semibold text-xs text-[#002060]">Bandar</Label>
                  <Input
                    id="bandar"
                    placeholder="Parit Raja"
                    className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9 placeholder:text-slate-400/40"
                    {...register("bandar")}
                  />
                  {errors.bandar && (
                    <p className="text-xs text-destructive font-semibold">{String(errors.bandar.message)}</p>
                  )}
                </div>

                {/* Postal code input box */}
                <div className="space-y-1.5">
                  <Label htmlFor="poskod" className="font-semibold text-xs text-[#002060]">Poskod</Label>
                  <Input
                    id="poskod"
                    placeholder="86400"
                    className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9 placeholder:text-slate-400/40"
                    {...register("poskod")}
                  />
                  {errors.poskod && (
                    <p className="text-xs text-destructive font-semibold">{String(errors.poskod.message)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Home Address textarea spanning full width */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <Label htmlFor="alamatRumah" className="font-semibold text-xs text-[#002060]">Alamat Rumah</Label>
              <Textarea
                id="alamatRumah"
                placeholder="No. 12, Jalan Universiti, Taman Parit Raja, 86400 Parit Raja, Johor"
                className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs placeholder:text-slate-400/40"
                rows={3}
                {...register("alamatRumah")}
              />
              {errors.alamatRumah && (
                <p className="text-xs text-destructive font-semibold">{String(errors.alamatRumah.message)}</p>
              )}
            </div>

            {/* Akta 709 compliance declaration block */}
            <div className="col-span-1 md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 shadow-xs">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="persetujuanAkta709"
                  checked={consentValue}
                  onCheckedChange={(checked) => setValue("persetujuanAkta709", !!checked, { shouldValidate: true })}
                  className="mt-0.5 focus:ring-[#002060] border-slate-300 data-[state=checked]:bg-[#002060] data-[state=checked]:border-[#002060]"
                />
                <Label htmlFor="persetujuanAkta709" className="cursor-pointer text-xs leading-relaxed text-slate-600 select-none font-medium">
                  Saya mengesahkan maklumat profil ini dikemaskini secara sukarela selaras dengan Hak Akses dan Integriti Data di bawah Akta 709.
                </Label>
              </div>
              {errors.persetujuanAkta709 && (
                <p className="text-xs text-destructive font-semibold ml-8 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" /> {String(errors.persetujuanAkta709.message)}
                </p>
              )}
            </div>

          </div>

          {/* Form submit button styled in Emerald Green */}
          <div className="pt-4 flex justify-end border-t">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-6 rounded-lg cursor-pointer transition-colors shadow-xs disabled:opacity-50 uppercase tracking-wider text-xs"
            >
              {isPending ? "Menyimpan..." : "SIMPAN MAKLUMAT"}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
