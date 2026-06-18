// This verification view aggregates high-impact status counters over the primary administrative data table grid to manage incoming staff files.

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle, DollarSign, Check, XCircle, Clock } from "lucide-react";

// This data model outlines the structured properties of each application record displayed in the management grid.
interface ApplicationItem {
  id: string;
  namaPenuh: string;
  noKP: string;
  noPekerja: string;
  noTelefon: string;
  alamatRumah: string;
  deductionType: string;
  amaunZakatBulanan: number | null;
  amaunZakatBaru: number | null;
  bulanMula: string;
  tahunMula: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: Date;
  adminNotes: string | null;
}

// This data model describes all props consumed by the application processing tab layout component.
interface ZakatManagementApplicationProcessingTabProps {
  stats: {
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    approvedAmount: number;
  };
  applications: ApplicationItem[];
  isPendingTransition: boolean;
  handleApproveInline: (appId: string) => void;
  handleRejectTrigger: (app: ApplicationItem) => void;
}

// This helper safely resolves the displayed deduction amount from any application record's active type.
function resolveDeductionAmount(app: ApplicationItem): number {
  if (app.deductionType === "FIXED_MONTHLY" || app.deductionType === "ORIGINAL_PCB_CHANGE") {
    return app.amaunZakatBulanan ?? 0;
  }
  if (app.deductionType === "AMOUNT_ADJUSTMENT") {
    return app.amaunZakatBaru ?? 0;
  }
  // This fallback returns 150.00 for MATCH_PCB type which carries no explicit stored amount.
  return 150.00;
}

// This helper maps a raw DeductionType enum key to its human-readable Bahasa Melayu label.
function resolveDeductionLabel(deductionType: string): string {
  const labels: Record<string, string> = {
    FIXED_MONTHLY:       "Bulanan Tetap",
    ORIGINAL_PCB_CHANGE: "Perubahan PCB",
    AMOUNT_ADJUSTMENT:   "Pelarasan Amaun",
    MATCH_PCB:           "Ikut PCB",
  };
  return labels[deductionType] ?? deductionType.replace(/_/g, " ");
}

export function ZakatManagementApplicationProcessingTabComponent({
  stats,
  applications,
  isPendingTransition,
  handleApproveInline,
  handleRejectTrigger,
}: ZakatManagementApplicationProcessingTabProps) {

  // This defensive filter strips any falsy, null, or undefined elements from the application ID array before any relational database queries to prevent IN (NULL) errors.
  const safeApplications = (applications ?? []).filter(Boolean);

  // This derived list filters the safe application array to only PENDING records for the evaluation queue.
  const pendingApps = safeApplications.filter((app) => app.status === "PENDING");

  // This derived total computes the cumulative count across all three workflow status buckets.
  const totalApplications = stats.totalPending + stats.totalApproved + stats.totalRejected;

  return (
    <div className="space-y-8">

      {/* This three-column grid houses the KPI summary telemetry cards above the data table. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* This KPI card displays the total accumulated submissions count from all status types. */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Jumlah Permohonan
              </span>
              <h3 className="text-3xl font-black text-[#002060] dark:text-blue-300">
                {totalApplications}
              </h3>
              <p className="text-[10px] text-muted-foreground">Borang berdaftar terkumpul</p>
            </div>
            <div className="h-14 w-14 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center text-[#002060] shrink-0">
              <Users className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>

        {/* This KPI card displays the count of pending applications requiring management action. */}
        <Card className="border border-amber-200 dark:border-amber-800/40 shadow-sm bg-white dark:bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                Menunggu Penilaian
              </span>
              <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {stats.totalPending}
              </h3>
              <p className="text-[10px] text-amber-600 font-semibold">
                Tindakan pentadbiran diperlukan
              </p>
            </div>
            <div className="h-14 w-14 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center text-amber-600 shrink-0">
              <AlertCircle className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>

        {/* This KPI card displays the total approved monthly zakat collection amount in Ringgit. */}
        <Card className="border border-emerald-200 dark:border-emerald-800/40 shadow-sm bg-white dark:bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                Jumlah Kutipan Bulanan
              </span>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                RM{" "}
                {stats.approvedAmount.toLocaleString("en-MY", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
              <p className="text-[10px] text-emerald-600 font-semibold">
                Caruman diluluskan aktif
              </p>
            </div>
            <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
              <DollarSign className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* This card houses the evaluation data table grid populated with PENDING applications awaiting review. */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-card overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Permohonan Zakat Menunggu Kelulusan
              </CardTitle>
              <CardDescription className="text-[10px] mt-0.5">
                Senarai permohonan aktif perlu ditentusahkan oleh pihak pengurusan
              </CardDescription>
            </div>
            {/* This badge renders the live pending count next to the table header title. */}
            {pendingApps.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                <Clock className="h-3 w-3" />
                {pendingApps.length} Menunggu
              </span>
            )}
          </div>
        </CardHeader>

        {/* This conditional block renders either the data table or the empty-state fallback. */}
        {pendingApps.length > 0 ? (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-5 py-3">Nama Pemohon</th>
                    <th className="px-5 py-3">No. Pekerja</th>
                    <th className="px-5 py-3">Jenis Potongan</th>
                    <th className="px-5 py-3">Bulan Bermula</th>
                    <th className="px-5 py-3">Amaun</th>
                    <th className="px-5 py-3">Tarikh Hantar</th>
                    <th className="px-5 py-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  {/* This map loop renders one table row per pending application record. */}
                  {pendingApps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-muted/5 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-foreground">{app.namaPenuh}</div>
                        <div className="text-[9px] text-muted-foreground font-mono mt-0.5">
                          {app.noKP}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-muted-foreground">{app.noPekerja}</div>
                        <div className="text-[9px] text-muted-foreground">{app.noTelefon}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        {/* This badge displays the human-readable label for the deduction type enum value. */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#002060]/10 text-[#002060] uppercase tracking-wide">
                          {resolveDeductionLabel(app.deductionType)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-foreground">
                          {app.bulanMula} {app.tahunMula}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[#002060] dark:text-blue-300">
                        RM {resolveDeductionAmount(app).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(app.submittedAt).toLocaleDateString("ms-MY", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {/* This action cell holds the primary approve and outline reject buttons per row. */}
                        <div className="flex items-center justify-end gap-2">
                          {/* This approve button uses solid emerald fill as the primary transaction action. */}
                          <Button
                            size="sm"
                            disabled={isPendingTransition}
                            onClick={() => handleApproveInline(app.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-7 px-3 text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          >
                            <Check className="h-3 w-3" /> Sahkan
                          </Button>
                          {/* This reject button uses a neutral outline style that fills red only on hover for asymmetric hierarchy. */}
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPendingTransition}
                            onClick={() => handleRejectTrigger(app)}
                            className="border-slate-200 bg-transparent text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:text-red-400 dark:hover:border-red-800 h-7 px-3 text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          >
                            <XCircle className="h-3 w-3" /> Tolak
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* This summary footer renders the rejected and approved count below the pending table. */}
            {(stats.totalApproved > 0 || stats.totalRejected > 0) && (
              <div className="px-5 py-3 border-t border-border bg-muted/5 flex items-center gap-6 text-[10px] text-muted-foreground font-semibold">
                <span className="flex items-center gap-1 text-emerald-600">
                  <Check className="h-3 w-3" />
                  {stats.totalApproved} Diluluskan
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-3 w-3" />
                  {stats.totalRejected} Ditolak
                </span>
              </div>
            )}
          </CardContent>
        ) : (
          // This empty-state fallback renders when no PENDING applications exist in the queue.
          <CardContent className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <Check className="h-7 w-7 text-emerald-600" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-muted-foreground text-xs font-semibold">
                Tiada permohonan menunggu kelulusan pada masa ini.
              </p>
              <p className="text-[10px] text-muted-foreground">
                {totalApplications === 0
                  ? "Belum ada permohonan diterima. Kakitangan belum menghantar borang."
                  : "Semua permohonan telah diproses sepenuhnya."}
              </p>
            </div>
            {/* This status summary renders the full count context even when the queue is empty. */}
            {totalApplications > 0 && (
              <div className="flex items-center gap-4 mt-2 text-[10px] font-semibold">
                <span className="flex items-center gap-1 text-emerald-600">
                  <Check className="h-3 w-3" /> {stats.totalApproved} Diluluskan
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-3 w-3" /> {stats.totalRejected} Ditolak
                </span>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
