// This primary management cockpit securely governs data routing switches to toggle between processing queues and financial visualization maps.

"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
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

// This data model definition defines the properties accepted by the manager cockpit master view.
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
  // This navigation hook provides access to routing features within Next.js.
  const router = useRouter();

  // This navigation hook retrieves query parameter parameters from the active window URL.
  const searchParams = useSearchParams();

  // This lifecycle state hook manages the active navigation tab key for the dashboard layout.
  const [activeTab, setActiveTab] = useState<string>("proses");

  // This lifecycle state hook tracks the current list of payroll deduction applications.
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);

  // This lifecycle state hook manages async transition states for database updates.
  const [isPendingTransition, startTransition] = useTransition();

  // This lifecycle state hook tracks the specific employee application currently being modified.
  const [activeEditingApp, setActiveEditingApp] = useState<ApplicationItem | null>(null);

  // This lifecycle state hook controls the status selection state in the workflow evaluation form.
  const [newStatus, setNewStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");

  // This lifecycle state hook stores administrative notes entered by management during application review.
  const [adminNotes, setAdminNotes] = useState<string>("");

  // This lifecycle state hook displays error alerts if status updates fail on the backend.
  const [actionError, setActionError] = useState<string | null>(null);

  // This lifecycle state hook synchronises active tabs with the browser url parameters to prevent visual leakage.
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["proses", "analisis", "profile"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

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

  // This helper function handles tab changes and pushes parameters to browser navigation history.
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/pengurusan?tab=${tab}`, { scroll: false });
  };

  // This helper function handles inline approval transitions for the selected application.
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
        onTabChange={handleTabChange} 
        user={user} 
      />

      {/* This responsive asset layout wrapper structures the corporate welcome hero banner. */}
      <section className="w-full bg-[#002060] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#002060]/10 shadow-md">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
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
          
          <div className="shrink-0 flex items-center justify-start sm:justify-end">
            <Image
              src="/6232c1fe-be22-4a39-89b1-0eb508f91e72.png"
              alt="Logo Zakat UTHM"
              width={130}
              height={130}
              priority
              className="h-24 w-auto object-contain bg-white p-2.5 rounded-xl shadow-xs select-none"
            />
          </div>
        </div>
      </section>

      {/* This major structural component card provides standard boundary dimensions of max-w-7xl for the management layout. */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* This conditional rendering ternary wrapper renders the profile view sub-tab on the dashboard layout. */}
        {activeTab === "profile" && (
          <div className="w-full max-w-3xl mx-auto">
            {/* This major structural component card handles profile setup updates. */}
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

        {/* This conditional rendering ternary wrapper renders the application evaluation grid on the dashboard layout. */}
        {activeTab === "proses" && (
          /* This major structural component card displays the active workflow processing grid. */
          <ZakatManagementApplicationProcessingTabComponent
            stats={stats}
            applications={applications}
            isPendingTransition={isPendingTransition}
            handleApproveInline={handleApproveInline}
            handleRejectTrigger={handleRejectTrigger}
          />
        )}

        {/* This conditional rendering ternary wrapper renders the collection analytics metrics on the dashboard layout. */}
        {activeTab === "analisis" && (
          /* This major structural component card displays collection metrics and charts. */
          <ZakatManagementAnalyticsReportingTabComponent
            applications={applications}
            chartData={chartData}
          />
        )}

      </main>

      {/* This conditional rendering ternary wrapper displays the workflow evaluation dialog modal. */}
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
                
                {/* This conditional rendering ternary wrapper displays system error messages within the editing modal. */}
                {actionError && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive font-semibold">
                    {actionError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#002060]">Tentukan Status Keputusan</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewStatus("APPROVED")}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                        /* This rendering ternary operation applies selected formatting rules to denote active approval. */
                        newStatus === "APPROVED"
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                          : "border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <Check className="h-4 w-4" /> LULUSKAN
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewStatus("REJECTED")}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                        /* This rendering ternary operation applies selected formatting rules to denote active rejection. */
                        newStatus === "REJECTED"
                          ? "border-red-500 bg-red-50/50 text-red-655"
                          : "border-slate-200 bg-transparent text-slate-600 hover:text-red-655 hover:border-red-200 hover:bg-red-50"
                      )}
                    >
                      <XCircle className="h-4 w-4" /> TOLAK
                    </button>
                  </div>
                </div>

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
              
              <div className="border-t p-4 flex items-center justify-end gap-3 bg-muted/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveEditingApp(null)}
                  disabled={isPendingTransition}
                  className="h-9 px-4 text-xs font-semibold cursor-pointer border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPendingTransition}
                  className="h-9 px-5 text-xs font-bold bg-[#002060] hover:bg-[#002060]/95 text-white shadow-sm cursor-pointer"
                >
                  {/* This rendering ternary operation displays saving indicators during active server transitions. */}
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
