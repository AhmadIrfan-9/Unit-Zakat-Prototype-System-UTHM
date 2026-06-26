// This primary management cockpit securely governs data routing switches to toggle between processing queues and financial visualization maps.

"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateZakatApplicationWorkflowStatus } from "@/app/actions/zakatSalaryDeductionManagementServerActions";
import { ZakatGlobalMainNavbarLayoutComponent } from "./Navbar";
import { ZakatStaffProfileComponent } from "./UserProfile";
import { ZakatManagementApplicationProcessingTabComponent } from "./ApplicationProcessingTab";
import { ZakatManagementAnalyticsReportingTabComponent } from "./AnalyticsReportingTab";
import { ZakatManagementUserVerificationTableDataFeed } from "./UserVerificationTable";
import AuditLogTableClient from "../admin/AuditLogTableClient";
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
  // This navigation hook provides access to Next.js routing methods.
  const router = useRouter();



  // Incremental patch utilizing lazy state initialization to align URL parameters without cascading rendering loops.
  const validTabs = ["proses", "analisis", "profile", "pengguna", "audit"];
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const tab = new URLSearchParams(window.location.search).get("tab");
      if (tab && validTabs.includes(tab)) {
        return tab;
      }
    }
    return "proses";
  });

  // This state hook tracks the local list of payroll deduction applications for reactive UI updates.
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);

  // This state hook manages async server transition states during status update operations.
  const [isPendingTransition, startTransition] = useTransition();

  // This state hook holds the application record currently open in the review modal.
  const [activeEditingApp, setActiveEditingApp] = useState<ApplicationItem | null>(null);

  // This state hook tracks the selected workflow status decision in the review modal.
  const [newStatus, setNewStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");

  // This state hook stores admin notes entered during the review and rejection workflow.
  const [adminNotes, setAdminNotes] = useState<string>("");

  // This state hook holds any server-side error message returned during a status update.
  const [actionError, setActionError] = useState<string | null>(null);

  // This sync hook updates the local application list whenever the server pushes refreshed props.
  useEffect(() => {
    const timer = setTimeout(() => {
      setApplications(initialApplications);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialApplications]);



  // This fallback method safely resolves the displayed deduction amount from the application record.
  const getDeductionAmount = (app: ApplicationItem): number => {
    if (app.deductionType === "FIXED_MONTHLY" || app.deductionType === "ORIGINAL_PCB_CHANGE") {
      return app.amaunZakatBulanan ?? 0;
    }
    if (app.deductionType === "AMOUNT_ADJUSTMENT") {
      return app.amaunZakatBaru ?? 0;
    }
    return 150.00;
  };

  // This helper function changes the active tab and updates the browser URL.
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/pengurusan?tab=${tab}`, { scroll: false });
  };

  // This helper function handles the inline approval server action for a pending application.
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
        // This refresh call triggers the server component to re-fetch and push updated application data.
        router.refresh();
      } else {
        toast.error(result.error ?? "Gagal meluluskan permohonan.");
      }
    });
  };

  // This helper function opens the rejection modal pre-populated with the selected application data.
  const handleRejectTrigger = (app: ApplicationItem) => {
    setActiveEditingApp(app);
    setNewStatus("REJECTED");
    setAdminNotes(app.adminNotes ?? "");
    setActionError(null);
  };

  // This async handler submits the status update from the review modal to the server action.
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
        // This refresh call triggers the server component to re-fetch and push updated application data.
        router.refresh();
      } else {
        setActionError(result.error ?? "Ralat berlaku.");
      }
    });
  };

  // This fallback variable provides the safe display name with null-coalescing protection.
  const safeUserName = user.name ?? user.email ?? "Pengurusan UTHM";

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased pb-10">

      {/* This major structural component renders the consolidated top navigation header ribbon. */}
      <ZakatGlobalMainNavbarLayoutComponent
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
      />

      {/* This layout wrapper renders the full-width navy blue corporate welcome hero banner for management. */}
      <section className="w-full bg-[#002060] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#002060]/10 shadow-md">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-black tracking-widest text-[#002060] bg-white rounded-full px-3 py-1 inline-block mb-3">
              Portal Eksekutif Pengurusan
            </p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Selamat Datang, {safeUserName}
            </h1>
            <p className="text-xs md:text-sm text-gray-200 mt-2 font-medium">
              Sistem Caruman Zakat Gaji UTHM &bull; Panel Kuasa Penilai Pentadbiran
            </p>
          </div>

          {/* This layout wrapper anchors the Zakat UTHM logo in the far-right corner of the hero banner. */}
          <div className="shrink-0 flex items-center justify-start sm:justify-end">
            <Image
              src="/6232c1fe-be22-4a39-89b1-0eb508f91e72.png"
              alt="Logo Zakat UTHM"
              width={130}
              height={130}
              priority
              className="h-24 w-auto object-contain bg-white p-2.5 rounded-xl shadow-xs select-none"
              style={{ width: "auto" }}
            />
          </div>
        </div>
      </section>

      {/* This major structural component provides the max-w-7xl container for all management content panels. */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">

        {/* This conditional rendering block mounts the profile card exclusively when the profile tab is active. */}
        {activeTab === "profile" && (
          <div className="w-full max-w-3xl mx-auto">
            {/* This major structural component card handles management profile configuration updates. */}
            <ZakatStaffProfileComponent
              defaultValues={{
                namaPenuh: user.name ?? "Prof. Dr. Zainal bin Ibrahim",
                noPekerja: user.noPekerja ?? "MGR001",
                noKP: "750812015433",
                umur: 51,
                gajiSemasa: "9500.00",
                noTelefon: "013-7654321",
                alamatRumah: "No. 45, Jalan Kemuliaan, Taman Universiti, 86400 Parit Raja, Johor",
                poskod: "86400",
                bandar: "Parit Raja",
                negeri: "Johor",
                fakulti: "FSKTM",
                isManagement: true
              }}
            />
          </div>
        )}

        {/* This conditional rendering block mounts the application evaluation grid exclusively when the proses tab is active. */}
        {activeTab === "proses" && (
          /* This major structural component card renders the workflow processing grid and status counters. */
          <ZakatManagementApplicationProcessingTabComponent
            stats={stats}
            applications={applications}
            isPendingTransition={isPendingTransition}
            handleApproveInline={handleApproveInline}
            handleRejectTrigger={handleRejectTrigger}
          />
        )}

        {/* This conditional rendering block mounts the analytics charts exclusively when the analisis tab is active. */}
        {activeTab === "analisis" && (
          /* This major structural component card renders the financial metrics and PDF export tools. */
          <ZakatManagementAnalyticsReportingTabComponent
            applications={applications}
            chartData={chartData}
          />
        )}

        {/* Incremental patch adding the dedicated User Management directory tab into the executive dashboard container. */}
        {activeTab === "pengguna" && (
          <div className="animate-in fade-in duration-300 space-y-6 max-w-7xl mx-auto p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#002060] mb-1">Pengurusan & Kelulusan Kakitangan</h3>
              <p className="text-xs text-slate-500 mb-4">Sahkan akaun kakitangan baharu UTHM atau batalkan akses perkhidmatan portal secara bersyarat.</p>
              
              {/* Sub-komponen Meja Paparan Pengguna Baharu dijalankan di sini */}
              <ZakatManagementUserVerificationTableDataFeed />
            </div>
          </div>
        )}

        {/* Incremental patch adding the dedicated Security Audit Log tab into the executive dashboard container. */}
        {activeTab === "audit" && user.role === "SUPER_ADMIN" && (
          <div className="animate-in fade-in duration-300 space-y-6 max-w-7xl mx-auto p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#002060] mb-1">Jejak Audit Keselamatan Sistem (Immutable)</h3>
              <p className="text-xs text-slate-500 mb-6">Semak log forensik keselamatan aktiviti pengguna dan pentadbir sistem secara masa nyata.</p>
              
              <AuditLogTableClient />
            </div>
          </div>
        )}

      </main>

      {/* This conditional rendering block displays the workflow evaluation dialog when a rejection is triggered. */}
      {activeEditingApp !== null && (
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

                {/* This conditional rendering block displays server error messages within the editing modal. */}
                {actionError && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive font-semibold">
                    {actionError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#002060]">Tentukan Status Keputusan</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* This conditional rendering ternary applies the selected style to the Luluskan button. */}
                    <button
                      type="button"
                      onClick={() => setNewStatus("APPROVED")}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                        newStatus === "APPROVED"
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                          : "border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <Check className="h-4 w-4" /> LULUSKAN
                    </button>
                    {/* This conditional rendering ternary applies the selected style to the Tolak button. */}
                    <button
                      type="button"
                      onClick={() => setNewStatus("REJECTED")}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                        newStatus === "REJECTED"
                          ? "border-red-500 bg-red-50/50 text-red-600"
                          : "border-slate-200 bg-transparent text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                      )}
                    >
                      <XCircle className="h-4 w-4" /> TOLAK
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="adminNotes" className="text-xs font-bold text-[#002060]">
                    Catatan Pentadbiran (Mesej untuk Staf)
                  </Label>
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
                  className="h-9 px-4 text-xs font-semibold cursor-pointer border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPendingTransition}
                  className="h-9 px-5 text-xs font-bold bg-[#002060] hover:bg-[#002060]/95 text-white shadow-sm cursor-pointer"
                >
                  {/* This conditional rendering ternary displays the saving progress label during active transitions. */}
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
