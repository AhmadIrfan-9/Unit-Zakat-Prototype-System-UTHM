// This executive system dashboard coordinates staff payroll transaction counters, data tables, and reporting charts onto an aligned horizontal grid layout.

"use client";

import { useState, useTransition } from "react";
import { updateZakatApplicationWorkflowStatus } from "@/app/actions/zakatSalaryDeductionManagementServerActions";
import { ZakatGlobalMainNavbarLayoutComponent } from "./ZakatGlobalMainNavbarLayoutComponent";
import { ZakatStaffProfileManagementCardComponent } from "./ZakatStaffProfileManagementCardComponent";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  AlertCircle,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  XCircle,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

export function ZakatManagementDashboardMasterViewComponent({
  stats,
  chartData,
  applications: initialApplications,
  user
}: ZakatManagementDashboardMasterViewProps) {
  // This state hook manages the active navigation tab selection for the dashboard layout.
  const [activeTab, setActiveTab] = useState<string>("analysis");

  // This state hook tracks the list of payroll deduction applications for dynamic table updates.
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);

  // This transition hook manages database mutation state updates to prevent UI blocking.
  const [isPendingTransition, startTransition] = useTransition();

  // This state hook tracks the specific employee application currently being modified in the dialog.
  const [activeEditingApp, setActiveEditingApp] = useState<ApplicationItem | null>(null);

  // This state hook controls the status selection state in the workflow evaluation form.
  const [newStatus, setNewStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");

  // This state hook stores administrative notes entered by management during application review.
  const [adminNotes, setAdminNotes] = useState<string>("");

  // This state hook displays error alerts if status updates fail on the backend.
  const [actionError, setActionError] = useState<string | null>(null);

  // This state hook controls the count of monthly data periods visible on the line chart.
  const [visiblePeriods, setVisiblePeriods] = useState<number>(() => {
    return chartData.length > 0 ? Math.min(6, chartData.length) : 6;
  });

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

  // This helper function handles immediate inline approval transitions for the selected application.
  const handleApproveInline = (appId: string) => {
    setActionError(null);
    startTransition(async () => {
      const result = await updateZakatApplicationWorkflowStatus(appId, "APPROVED", "Diluluskan.");
      if (result.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === appId ? { ...app, status: "APPROVED", adminNotes: "Diluluskan." } : app
          )
        );
        toast.success("Permohonan berjaya diluluskan secara inline.");
      } else {
        toast.error(result.error || "Gagal meluluskan permohonan.");
      }
    });
  };

  // This helper function initiates rejection flow by launching the modal for entering admin comments.
  const handleRejectTrigger = (app: ApplicationItem) => {
    setActiveEditingApp(app);
    setNewStatus("REJECTED");
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
        toast.success("Keputusan permohonan berjaya dikemaskini.");
      } else {
        setActionError(result.error || "Ralat berlaku.");
      }
    });
  };

  // This slider filter slice generates a dynamic subset of historical chart data to prevent visual clutter.
  const displayChartData = chartData.slice(Math.max(0, chartData.length - visiblePeriods));

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col font-sans antialiased pb-10">
      
      {/* This navbar layout component renders the responsive top-aligned navigation headers */}
      <ZakatGlobalMainNavbarLayoutComponent 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        user={user} 
      />

      {/* This header banner displays welcome metadata and brand parameters to the executive */}
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

      {/* This conditional rendering switcher toggles between profile setup and analytical dashboard views */}
      {activeTab === "profile" ? (
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
          {/* This container wraps the profile management component for management staff */}
          <div className="w-full max-w-3xl mx-auto">
            <ZakatStaffProfileManagementCardComponent 
              defaultValues={{
                namaPenuh: user.name || "Prof. Dr. Zainal bin Ibrahim",
                noPekerja: user.noPekerja || "MGR001",
                noKP: "750812015433",
                umur: 51,
                gajiSemasa: "9500.00",
                noTelefon: "013-7654321",
                alamatRumah: "No. 45, Jalan Kemuliaan, Taman Universiti, 86400 Parit Raja, Johor",
                poskod: "86400",
                bandar: "Parit Raja",
                negeri: "Johor",
                isManagement: true
              }} 
            />
          </div>
        </main>
      ) : (
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
          
          {/* This section renders three transactional metric cards with explicit borders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Total applications count */}
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

            {/* Card 2: Pending evaluations counter */}
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-card">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Menunggu Penilaian</span>
                  <h3 className="text-2xl font-black text-amber-650 dark:text-amber-400">{stats.totalPending}</h3>
                  <p className="text-[10px] text-amber-600 font-semibold">Tindakan pentadbiran diperlukan</p>
                </div>
                <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center text-amber-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Total Monthly Collections Aggregate Sum */}
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-card">
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

          {/* This symmetrical container aligns the left application table and right trend chart on the desktop baseline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Pending application submissions grid table */}
            <div className="lg:col-span-2">
              {/* This card block hosts the application table using explicit height limits for baseline alignment */}
              <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-card h-[450px] flex flex-col justify-between overflow-hidden">
                <CardHeader className="border-b border-border bg-muted/10 px-5 py-4">
                  <CardTitle className="text-sm font-bold text-foreground">Permohonan Zakat Menunggu Kelulusan</CardTitle>
                  <CardDescription className="text-[10px]">Senarai permohonan aktif perlu ditentusahkan</CardDescription>
                </CardHeader>
                
                {/* This conditional rendering switcher displays either the pending application rows or an empty state */}
                {pendingApps.length > 0 ? (
                  <CardContent className="p-0 flex-1 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider sticky top-0 z-10">
                          <th className="px-5 py-3">Nama Pemohon</th>
                          <th className="px-5 py-3">No. Pekerja</th>
                          <th className="px-5 py-3">Bulan Bermula</th>
                          <th className="px-5 py-3">Amaun</th>
                          <th className="px-5 py-3 text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-xs">
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
                              {/* This button group organizes actions inline for approving and rejecting applications */}
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
                                  className="border-red-200 hover:bg-red-50 text-red-650 dark:text-red-400 dark:border-red-800 h-7 px-3 text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                >
                                  <XCircle className="h-3 w-3" /> Tolak
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                ) : (
                  <CardContent className="p-0 flex-1 flex flex-col items-center justify-center">
                    <p className="text-muted-foreground text-xs italic">
                      Tiada permohonan menunggu kelulusan pada masa ini
                    </p>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Right Column: Recharts line graph monitoring monthly transactions */}
            <div className="lg:col-span-1">
              {/* This card block coordinates the analytical charts and slider filters to match table heights */}
              <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-card h-[450px] flex flex-col justify-between overflow-hidden">
                <CardHeader className="border-b border-border bg-muted/10 px-5 py-4 flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">Trend Kutipan Zakat</CardTitle>
                    <CardDescription className="text-[10px]">Caruman terkumpul UTHM berdasarkan bulan</CardDescription>
                  </div>
                  
                  {/* PDF Export trigger button using UTHM Corporate Navy Blue palette */}
                  <Button
                    size="sm"
                    className="bg-[#002060] hover:bg-[#002060]/90 text-white text-[10px] h-7 px-3 flex items-center gap-1 font-bold shadow-sm transition-colors cursor-pointer"
                    onClick={() => {
                      toast.success("Memulakan eksport laporan PDF...");
                    }}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Eksport PDF
                  </Button>
                </CardHeader>
                
                <CardContent className="p-5 flex-1 flex flex-col justify-between overflow-hidden">
                  
                  {/* This conditional rendering switcher renders the line chart or an empty indicator based on dataset size */}
                  {displayChartData.length > 0 ? (
                    <div className="h-48 w-full flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={displayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    </div>
                  ) : (
                    <div className="h-48 w-full flex-1 flex flex-col items-center justify-center border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                      <FileText className="h-8 w-8 stroke-1 mb-2" />
                      <p className="text-[10px] font-semibold">Tiada data kutipan diluluskan</p>
                    </div>
                  )}

                  {/* Range slider for adjusting visible time points */}
                  {chartData.length > 0 && (
                    <div className="pt-4 border-t mt-2 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>Slaid Tempoh Analisis: {visiblePeriods} Bulan Terakhir</span>
                        <span className="text-[#002060]">Maks: {chartData.length} Bulan</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={chartData.length}
                        value={visiblePeriods}
                        onChange={(e) => setVisiblePeriods(Number(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#002060]"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
          </div>
        </main>
      )}

      {/* This conditional rendering switcher opens the workflow evaluation overlays if an item is selected */}
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
                
                {/* This conditional rendering switcher renders database error alerts inside the form */}
                {actionError && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive font-semibold">
                    {actionError}
                  </div>
                )}

                {/* This button grid allows toggle switching between approval and rejection states */}
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
                          ? "bg-red-650 border-red-650 text-white shadow-md"
                          : "border-border bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      <XCircle className="h-4 w-4" /> TOLAK
                    </button>
                  </div>
                </div>

                {/* This textarea input captures administrative remarks and explanation logs */}
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
              
              {/* This button group controls dialog form submission and cancellation flows */}
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
