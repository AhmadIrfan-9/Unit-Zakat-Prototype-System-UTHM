// src/components/zakat/ZakatManagementAnalyticsDashboardComponent.tsx
"use client";

import { useState, useTransition } from "react";
import { updateZakatApplicationWorkflowStatus } from "@/app/actions/zakatSalaryDeductionManagementServerActions";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  Filter,
  Check,
  Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// This interface defines the expected format of applications rendered in the table.
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

interface AnalyticsDashboardProps {
  stats: {
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    approvedAmount: number;
  };
  chartData: {
    period: string;
    total: number;
  }[];
  applications: ApplicationItem[];
}

// This interface allows administrative managers to evaluate submitted employee records and track monthly institutional zakat transaction analytics.
export function ZakatManagementAnalyticsDashboardComponent({
  stats,
  chartData,
  applications: initialApplications
}: AnalyticsDashboardProps) {
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isPendingTransition, startTransition] = useTransition();

  // Manage state for the selected application being edited in the status update modal/panel.
  const [activeEditingApp, setActiveEditingApp] = useState<ApplicationItem | null>(null);
  const [newStatus, setNewStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Trigger server-side application status modifications securely.
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditingApp) return;

    setActionError(null);
    startTransition(async () => {
      const result = await updateZakatApplicationWorkflowStatus(activeEditingApp.id, newStatus, adminNotes);
      if (result.success) {
        // Update local state reactively to refresh visual components immediately.
        setApplications((prev) =>
          prev.map((app) =>
            app.id === activeEditingApp.id
              ? { ...app, status: newStatus, adminNotes: adminNotes || null }
              : app
          )
        );
        setActiveEditingApp(null);
      } else {
        setActionError(result.error || "Ralat berlaku.");
      }
    });
  };

  // Open status update overlay form for the selected record.
  const initiateEdit = (app: ApplicationItem) => {
    setActiveEditingApp(app);
    setNewStatus(app.status);
    setAdminNotes(app.adminNotes || "");
    setActionError(null);
  };

  // Filter list of applicant records based on current search input and dropdown filters.
  const filteredApps = applications.filter((app) => {
    const matchesStatus = filterStatus === "ALL" || app.status === filterStatus;
    const matchesSearch =
      app.namaPenuh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.noPekerja.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.noKP.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Calculate the target deduction amount for display on each application record.
  const getDeductionAmount = (app: ApplicationItem) => {
    if (app.deductionType === "FIXED_MONTHLY" || app.deductionType === "ORIGINAL_PCB_CHANGE") {
      return app.amaunZakatBulanan || 0;
    }
    if (app.deductionType === "AMOUNT_ADJUSTMENT") {
      return app.amaunZakatBaru || 0;
    }
    return 150.00; // Default for MATCH_PCB placeholder
  };

  // Map the deduction code keys to user-friendly text descriptions in Bahasa Melayu.
  const getDeductionLabel = (type: string) => {
    switch (type) {
      case "ORIGINAL_PCB_CHANGE":
        return "Perubahan PCB Asal";
      case "FIXED_MONTHLY":
        return "Potongan Tetap Bulanan";
      case "AMOUNT_ADJUSTMENT":
        return "Penyelarasan Zakat";
      case "MATCH_PCB":
        return "Menyamai Amaun PCB";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ── KPI METRICS CARDS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Approved Amount */}
        <Card className="border border-border shadow-xs bg-white dark:bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Caruman Bulanan</span>
              <h3 className="text-xl md:text-2xl font-black text-[#002060] dark:text-blue-300">
                RM {stats.approvedAmount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Diluluskan
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Total Pending Review */}
        <Card className="border border-border shadow-xs bg-white dark:bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Menunggu Semakan</span>
              <h3 className="text-xl md:text-2xl font-black text-amber-600 dark:text-amber-400">
                {stats.totalPending}
              </h3>
              <p className="text-[10px] text-amber-600 font-medium">Borang perlu ditentusahkan</p>
            </div>
            <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center text-amber-600">
              <AlertCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Approved Count */}
        <Card className="border border-border shadow-xs bg-white dark:bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Permohonan Diluluskan</span>
              <h3 className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.totalApproved}
              </h3>
              <p className="text-[10px] text-muted-foreground">Aktif dalam sistem penggajian</p>
            </div>
            <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Rejected Count */}
        <Card className="border border-border shadow-xs bg-white dark:bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Permohonan Ditolak</span>
              <h3 className="text-xl md:text-2xl font-black text-destructive">
                {stats.totalRejected}
              </h3>
              <p className="text-[10px] text-muted-foreground">Memerlukan pembetulan staf</p>
            </div>
            <div className="h-12 w-12 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center text-destructive">
              <XCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── SECTION 2: FINANCIAL ANALYTICS GRAPH ─────────────────────────── */}
      <Card className="border border-border shadow-md bg-white dark:bg-card">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#002060] dark:text-blue-400" />
            <div>
              <CardTitle className="text-base font-bold text-foreground">Trend Kutipan Zakat Bulanan UTHM</CardTitle>
              <CardDescription className="text-xs">
                Graf caruman terkumpul berdasarkan bulan dan tahun potongan bermula
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-300px w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis
                    dataKey="period"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `RM ${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                    formatter={(value) => [`RM ${Number(value).toFixed(2)}`, "Jumlah Caruman"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#002060"
                    strokeWidth={3}
                    dot={{ r: 4, stroke: "#002060", strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                <FileText className="h-10 w-10 stroke-1 mb-2" />
                <p className="text-xs font-semibold">Tiada data kutipan diluluskan untuk dipaparkan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION 1: INCOMING APPLICATIONS TABLE ───────────────────────── */}
      <Card className="border border-border shadow-md bg-white dark:bg-card">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Senarai Borang Permohonan Potongan Gaji</CardTitle>
              <CardDescription className="text-xs">
                Uruskan penilaian, kelulusan, dan status caruman kakitangan UTHM
              </CardDescription>
            </div>
            
            {/* Filter and Search Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari Nama / No. Pekerja..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs focus-visible:ring-[#002060] focus-visible:border-[#002060]"
                />
              </div>

              <div className="flex items-center gap-1.5 border rounded-lg p-1 bg-muted/30">
                {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                      filterStatus === st
                        ? "bg-white dark:bg-card text-[#002060] shadow-xs border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {st === "ALL" ? "Semua" : st === "PENDING" ? "Semak" : st === "APPROVED" ? "Lulus" : "Tolak"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-3.5">Nama Pemohon</th>
                  <th className="px-5 py-3.5">No. Pekerja / KP</th>
                  <th className="px-5 py-3.5">Bulan Bermula</th>
                  <th className="px-5 py-3.5">Jenis Potongan</th>
                  <th className="px-5 py-3.5">Amaun Bulanan</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {filteredApps.length > 0 ? (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground">{app.namaPenuh}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{app.noTelefon}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-muted-foreground">Pekerja: {app.noPekerja}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">KP: {app.noKP}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">{app.bulanMula} {app.tahunMula}</div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground font-medium">
                        {getDeductionLabel(app.deductionType)}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#002060] dark:text-blue-300">
                        RM {getDeductionAmount(app).toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border",
                          app.status === "PENDING" && "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800",
                          app.status === "APPROVED" && "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800",
                          app.status === "REJECTED" && "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800"
                        )}>
                          {app.status === "PENDING" ? "SEMAKAN" : app.status === "APPROVED" ? "LULUS" : "TOLAK"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => initiateEdit(app)}
                          className="h-7 px-2.5 text-[11px] border-[#002060] text-[#002060] hover:bg-[#002060]/5 dark:border-blue-400 dark:text-blue-400 cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3 mr-1" /> Urus
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground italic">
                      Tiada permohonan ditemui padanan penapis semasa
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── STATUS UPDATE DIALOG / BOX (INLINE OVERLAY) ────────────────────── */}
      {activeEditingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border border-border shadow-2xl bg-white dark:bg-card animate-in zoom-in-95 duration-200">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-sm font-bold text-foreground">
                Urus Permohonan Zakat: {activeEditingApp.namaPenuh}
              </CardTitle>
              <CardDescription className="text-xs">
                No. Kakitangan: {activeEditingApp.noPekerja} | RM {getDeductionAmount(activeEditingApp).toFixed(2)}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateStatus}>
              <CardContent className="p-5 space-y-4">
                
                {actionError && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive font-semibold">
                    {actionError}
                  </div>
                )}

                {/* Status Selection Buttons */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#002060]">Tentukan Status Keputusan</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewStatus("APPROVED")}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                        newStatus === "APPROVED"
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                          : "border-border bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      <Check className="h-4 w-4" /> LULUSKAN
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewStatus("REJECTED")}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                        newStatus === "REJECTED"
                          ? "bg-red-600 border-red-600 text-white shadow-md"
                          : "border-border bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      <XCircle className="h-4 w-4" /> TOLAK
                    </button>
                  </div>
                </div>

                {/* Administration Notes Text Area */}
                <div className="space-y-1.5">
                  <Label htmlFor="adminNotes" className="text-xs font-bold text-[#002060]">Catatan Pentadbiran (Mesej untuk Staf)</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Contoh: Dokumen disahkan, potongan berkuat kuasa bulan hadapan."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="text-xs focus-visible:ring-[#002060] focus-visible:border-[#002060]"
                    rows={3}
                  />
                </div>
              </CardContent>
              
              {/* Form Action Controls */}
              <div className="border-t p-4 flex items-center justify-end gap-3 bg-muted/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveEditingApp(null)}
                  disabled={isPendingTransition}
                  className="h-9 px-4 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPendingTransition}
                  className="h-9 px-5 text-xs font-bold bg-[#002060] hover:bg-[#002060]/90 text-white shadow-sm cursor-pointer"
                >
                  {isPendingTransition ? "Menyimpan..." : "Kemaskini"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
