// This master dashboard view sets up the primary layout grid by rendering the navy greeting banner directly beneath the unified header ribbon.

"use client";

import { useState, useTransition } from "react";
import { updateZakatApplicationWorkflowStatus } from "@/app/actions/zakatSalaryDeductionManagementServerActions";
import { ZakatGlobalMainNavbarLayoutComponent } from "./ZakatGlobalMainNavbarLayoutComponent";
import { ZakatStaffProfileManagementCardComponent } from "./ZakatStaffProfileManagementCardComponent";
import { ZakatManagementApplicationProcessingTabComponent } from "./ZakatManagementApplicationProcessingTabComponent";
import { ZakatManagementAnalyticsReportingTabComponent } from "./ZakatManagementAnalyticsReportingTabComponent";
import { Check, XCircle } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<string>("proses");

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

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased pb-10">
      
      {/* This navbar layout component renders the responsive top-aligned navigation headers. */}
      <ZakatGlobalMainNavbarLayoutComponent 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        user={user} 
      />

      {/* This header banner displays welcome metadata and brand parameters directly below the navbar ribbon. */}
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

      {/* This main workspace layout grid wraps sub-tab modules cleanly to prevent visual rendering overflow on wide monitors. */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* This conditional rendering switcher displays either the personal profile configuration card, the process permohonan tab, or the analisis kutipan tab. */}
        {activeTab === "profile" && (
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
        )}

        {activeTab === "proses" && (
          <ZakatManagementApplicationProcessingTabComponent
            stats={stats}
            applications={applications}
            isPendingTransition={isPendingTransition}
            handleApproveInline={handleApproveInline}
            handleRejectTrigger={handleRejectTrigger}
          />
        )}

        {activeTab === "analisis" && (
          <ZakatManagementAnalyticsReportingTabComponent
            applications={applications}
            chartData={chartData}
          />
        )}

      </main>

      {/* This modal dialog manages workflow rejection input logs safely to prevent usability errors. */}
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
