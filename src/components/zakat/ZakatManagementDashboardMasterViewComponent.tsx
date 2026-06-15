// src/components/zakat/ZakatManagementDashboardMasterViewComponent.tsx
"use client";

import { useState, useTransition } from "react";
import { updateZakatApplicationWorkflowStatus } from "@/app/actions/zakatSalaryDeductionManagementServerActions";
import { ZakatGlobalMainNavbarLayoutComponent } from "./ZakatGlobalMainNavbarLayoutComponent";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  AlertCircle,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  Check,
  Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

interface ZakatManagementDashboardMasterViewProps {
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
  user: {
    name?: string | null;
    email?: string | null;
    noPekerja?: string | null;
    role?: string | null;
  };
}

// This manager interface handles the data visualization dashboards, aggregate metrics rows, and payroll validation tables for the executive staff.
export function ZakatManagementDashboardMasterViewComponent({
  stats,
  chartData,
  applications: initialApplications,
  user
}: ZakatManagementDashboardMasterViewProps) {
  // Manage applications lists fetched from the server.
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);

  // Manage transitions for database write states.
  const [isPendingTransition, startTransition] = useTransition();

  // Manage the currently selected application being modified.
  const [activeEditingApp, setActiveEditingApp] = useState<ApplicationItem | null>(null);

  // Manage status inputs inside evaluation forms.
  const [newStatus, setNewStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");

  // Manage admin notes inputs inside evaluation forms.
  const [adminNotes, setAdminNotes] = useState<string>("");

  // Manage action errors returned from server handlers.
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter list of pending applications to display on the left.
  const pendingApps = applications.filter((app) => app.status === "PENDING");

  // Calculate the total applications count.
  const totalApplications = stats.totalPending + stats.totalApproved + stats.totalRejected;

  // Resolve raw deduction amounts from application values.
  const getDeductionAmount = (app: ApplicationItem) => {
    if (app.deductionType === "FIXED_MONTHLY" || app.deductionType === "ORIGINAL_PCB_CHANGE") {
      return app.amaunZakatBulanan || 0;
    }
    if (app.deductionType === "AMOUNT_ADJUSTMENT") {
      return app.amaunZakatBaru || 0;
    }
    return 150.00;
  };

  // Convert deduction codes into readable Malay text formats.
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

  // Open the decision overlay for the selected record.
  const initiateEdit = (app: ApplicationItem) => {
    setActiveEditingApp(app);
    setNewStatus(app.status);
    setAdminNotes(app.adminNotes || "");
    setActionError(null);
  };

  // Process status modifications on server nodes.
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditingApp) return;

    setActionError(null);
    startTransition(async () => {
      const result = await updateZakatApplicationWorkflowStatus(activeEditingApp.id, newStatus, adminNotes);
      if (result.success) {
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

  return (
    // Main full-bleed flex layout container.
    <div className="min-h-screen bg-muted/30 flex flex-col font-sans antialiased pb-10">
      
      {/* Sticky top navbar display */}
      <ZakatGlobalMainNavbarLayoutComponent user={user} />

      {/* Welcome Hero Banner: full-bleed background styled in UTHM corporate Navy Blue */}
      <section className="w-full bg-[#002060] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#002060]/10 shadow-md">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase font-black tracking-widest text-[#002060] bg-white rounded-full px-3 py-1 inline-block mb-3">
            Portal Eksekutif Pengurusan
          </p>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Selamat Datang, Pengurusan Zakat UTHM
          </h1>
          <p className="text-xs md:text-sm text-gray-200 mt-2 font-medium">
            Sistem Caruman Zakat Gaji UTHM &bull; Panel Kuasa Penilai Pentadbiran
          </p>
        </div>
      </section>

      {/* Main executive content layout wrapped in centered bounding container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Metrics Row: Three summary transaction statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total applications count */}
          <Card className="border border-border shadow-md bg-white dark:bg-card">
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

          {/* Card 2: Pending evaluations counter */}
          <Card className="border border-border shadow-md bg-white dark:bg-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Menunggu Penilaian</span>
                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.totalPending}</h3>
                <p className="text-[10px] text-amber-600 font-semibold">Tindakan pentadbiran diperlukan</p>
              </div>
              <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center text-amber-600">
                <AlertCircle className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Total Monthly Collections Aggregate Sum */}
          <Card className="border border-border shadow-md bg-white dark:bg-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Jumlah Kutipan Bulanan</span>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  RM {stats.approvedAmount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> Caruman diluluskan
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Workspace Grid: Table and line graph components rendered side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Pending application submissions grid table */}
          <div className="lg:col-span-2">
            <Card className="border border-border shadow-lg bg-white dark:bg-card overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/10 px-5 py-4">
                <CardTitle className="text-sm font-bold text-foreground">Permohonan Zakat Menunggu Kelulusan</CardTitle>
                <CardDescription className="text-[10px]">Senarai permohonan aktif perlu ditentusahkan</CardDescription>
              </CardHeader>
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
                      {pendingApps.length > 0 ? (
                        pendingApps.map((app) => (
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
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => initiateEdit(app)}
                                className="h-7 px-2.5 text-[10px] border-[#002060] text-[#002060] hover:bg-[#002060]/5 dark:border-blue-400 dark:text-blue-400 cursor-pointer"
                              >
                                <Edit2 className="h-3 w-3 mr-1" /> Urus
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground italic">
                            Tiada permohonan menunggu kelulusan pada masa ini
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Recharts line graph monitoring monthly transactions */}
          <div className="lg:col-span-1">
            <Card className="border border-border shadow-lg bg-white dark:bg-card flex flex-col h-full">
              <CardHeader className="border-b border-border bg-muted/10 px-5 py-4">
                <CardTitle className="text-sm font-bold text-foreground">Trend Kutipan Zakat</CardTitle>
                <CardDescription className="text-[10px]">Caruman terkumpul UTHM berdasarkan bulan potongan</CardDescription>
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col justify-center">
                <div className="h-60 w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="period" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `RM${v}`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "10px"
                          }}
                          formatter={(v) => [`RM ${Number(v).toFixed(2)}`, "Jumlah Caruman"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#002060"
                          strokeWidth={2.5}
                          dot={{ r: 3.5, stroke: "#002060", strokeWidth: 1.5, fill: "#fff" }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                      <FileText className="h-8 w-8 stroke-1 mb-2" />
                      <p className="text-[10px] font-semibold">Tiada data kutipan diluluskan</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

      </main>

      {/* Decisions overlay dialog box */}
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
                  className="h-9 px-5 text-xs font-bold bg-[#002060] hover:bg-[#002060]/95 text-white shadow-sm cursor-pointer"
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
