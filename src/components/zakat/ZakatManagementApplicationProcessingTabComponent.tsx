// This verification view aggregates high-impact status counters over the primary administrative data table grid to manage incoming staff files.

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle, DollarSign, Check, XCircle } from "lucide-react";

// This data model definition outlines the structured properties of an employee zakat deduction application.
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

// This data model definition describes the properties accepted by the application processing layout.
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

export function ZakatManagementApplicationProcessingTabComponent({
  stats,
  applications,
  isPendingTransition,
  handleApproveInline,
  handleRejectTrigger
}: ZakatManagementApplicationProcessingTabProps) {
  // This fallback variable model resolves the correct payroll deduction amount based on the selected application type.
  const getDeductionAmount = (app: ApplicationItem) => {
    if (app.deductionType === "FIXED_MONTHLY" || app.deductionType === "ORIGINAL_PCB_CHANGE") {
      return app.amaunZakatBulanan || 0;
    }
    if (app.deductionType === "AMOUNT_ADJUSTMENT") {
      return app.amaunZakatBaru || 0;
    }
    return 150.00;
  };

  // This data model definition filters the list of pending applications to display in the table.
  const pendingApps = applications.filter((app) => app.status === "PENDING");

  // This data model definition calculates the total applications count.
  const totalApplications = stats.totalPending + stats.totalApproved + stats.totalRejected;

  return (
    <div className="space-y-8">
      
      {/* This structural container organizes the overview counters in a responsive layout grid. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* This major structural component card displays the total accumulated applications count. */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Jumlah Permohonan</span>
              <h3 className="text-2xl font-black text-[#002060] dark:text-blue-300">{totalApplications}</h3>
              <p className="text-[10px] text-muted-foreground">Borang berdaftar terkumpul</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center text-[#002060]">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* This major structural component card displays the pending evaluations counter. */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Menunggu Penilaian</span>
              <h3 className="text-2xl font-black text-amber-655 dark:text-amber-400">{stats.totalPending}</h3>
              <p className="text-[10px] text-amber-655 font-semibold">Tindakan pentadbiran diperlukan</p>
            </div>
            <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center text-amber-655">
              <AlertCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* This major structural component card displays the total monthly collections aggregate sum. */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Jumlah Kutipan Bulanan</span>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                RM {stats.approvedAmount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 rotate-180" /> Caruman diluluskan
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* This major structural component card houses the list of active applications awaiting manager validation. */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-card overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/10 px-5 py-4">
          <CardTitle className="text-sm font-bold text-foreground">Permohonan Zakat Menunggu Kelulusan</CardTitle>
          <CardDescription className="text-[10px]">Senarai permohonan aktif perlu ditentusahkan oleh pihak pengurusan</CardDescription>
        </CardHeader>
        
        {/* This conditional rendering ternary wrapper determines whether to render the datagrid table or an empty record state. */}
        {pendingApps.length > 0 ? (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-5 py-3">Nama Pemohon</th>
                    <th className="px-5 py-3">No. Pekerja</th>
                    <th className="px-5 py-3">Bulan Bermula</th>
                    <th className="px-5 py-3">Amaun</th>
                    <th className="px-5 py-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  {/* This array data map iterates over each pending application to render its table row layout. */}
                  {pendingApps.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-foreground">{app.namaPenuh}</div>
                        <div className="text-[9px] text-muted-foreground font-mono">{app.noTelefon}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-muted-foreground">{app.noPekerja}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-foreground">{app.bulanMula} {app.tahunMula}</div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[#002060] dark:text-blue-300">
                        RM {getDeductionAmount(app).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            disabled={isPendingTransition}
                            onClick={() => handleApproveInline(app.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-7 px-3 text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          >
                            <Check className="h-3 w-3" /> Sahkan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPendingTransition}
                            onClick={() => handleRejectTrigger(app)}
                            className="border-slate-200 bg-transparent text-slate-600 hover:bg-red-50 hover:text-red-655 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:text-red-400 dark:hover:border-red-800 h-7 px-3 text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
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
          </CardContent>
        ) : (
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <p className="text-muted-foreground text-xs italic">
              Tiada permohonan menunggu kelulusan pada masa ini.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
