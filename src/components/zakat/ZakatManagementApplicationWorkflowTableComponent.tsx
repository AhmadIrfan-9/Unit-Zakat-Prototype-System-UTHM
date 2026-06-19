// This grid module lists pending employee files and manages target confirmation triggers alongside modal text blocks capturing rejection reasons.

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateZakatApplicationStatus } from "@/app/actions/zakatWorkflowManagementServerActions";

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

interface WorkflowTableProps {
  applications: ApplicationItem[];
  onStatusUpdated?: () => void;
}

export function ZakatManagementApplicationWorkflowTableComponent({
  applications,
  onStatusUpdated
}: WorkflowTableProps) {
  const router = useRouter();
  const [isPendingTransition, startTransition] = useTransition();

  // This state hook tracks which application has been selected for rejection to populate the modal context.
  const [appForRejection, setAppForRejection] = useState<ApplicationItem | null>(null);

  // This state hook tracks the current text input value representing the formal reason for rejection.
  const [rejectionReason, setRejectionReason] = useState<string>("");

  // This state hook captures and displays errors returned by the server mutations.
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // This query filter isolates the applications that are in a pending evaluation state.
  const pendingApplications = applications.filter((app) => app.status === "PENDING");

  // This utility resolves the current deduction value depending on the method configuration.
  const resolveDeductionValue = (app: ApplicationItem) => {
    if (app.deductionType === "FIXED_MONTHLY" || app.deductionType === "ORIGINAL_PCB_CHANGE") {
      return app.amaunZakatBulanan || 0;
    }
    if (app.deductionType === "AMOUNT_ADJUSTMENT") {
      return app.amaunZakatBaru || 0;
    }
    return 150.00;
  };

  // This mapper maps technical deduction types to Dewan Bahasa dan Pustaka terminology.
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

  // This database method approves the deduction application and revalidates active dashboard pages.
  const handleApprove = (appId: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await updateZakatApplicationStatus(appId, "APPROVED");
      if (result.success) {
        router.refresh();
        if (onStatusUpdated) onStatusUpdated();
      } else {
        setErrorMessage(result.error || "Ralat tidak dikenali berlaku.");
      }
    });
  };

  // This database method rejects the deduction application with a mandatory comment reason.
  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appForRejection || !rejectionReason.trim()) return;

    setErrorMessage(null);
    startTransition(async () => {
      const result = await updateZakatApplicationStatus(
        appForRejection.id,
        "REJECTED",
        rejectionReason
      );
      if (result.success) {
        setAppForRejection(null);
        setRejectionReason("");
        router.refresh();
        if (onStatusUpdated) onStatusUpdated();
      } else {
        setErrorMessage(result.error || "Ralat tidak dikenali berlaku.");
      }
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main workflow grid display */}
      <div className="border border-border bg-white dark:bg-card rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="px-5 py-3.5">Maklumat Kakitangan</th>
                <th className="px-5 py-3.5">No. Pekerja / KP</th>
                <th className="px-5 py-3.5">Kaedah Caruman</th>
                <th className="px-5 py-3.5">Bulan Bermula</th>
                <th className="px-5 py-3.5">Amaun Sebulan</th>
                <th className="px-5 py-3.5 text-right">Tindakan Kelulusan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {pendingApplications.length > 0 ? (
                pendingApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-foreground">{app.namaPenuh}</div>
                      <div className="text-[10px] text-muted-foreground font-medium font-mono">{app.noTelefon}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-muted-foreground">Staf: {app.noPekerja}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">KP: {app.noKP}</div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-medium">
                      {getDeductionLabel(app.deductionType)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">
                      {app.bulanMula} {app.tahunMula}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#002060]">
                      RM {resolveDeductionValue(app).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          disabled={isPendingTransition}
                          onClick={() => handleApprove(app.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 px-3 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" /> Sahkan
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPendingTransition}
                          onClick={() => {
                            setAppForRejection(app);
                            setRejectionReason("");
                            setErrorMessage(null);
                          }}
                          className="border-slate-300 hover:bg-slate-50 text-slate-700 font-bold h-8 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" /> Tolak
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground italic font-medium">
                    Tiada permohonan potongan gaji yang memerlukan pengesahan pada masa ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controlled Rejection Modal overlay dialog */}
      <Dialog
        open={!!appForRejection}
        onOpenChange={(open) => !open && setAppForRejection(null)}
      >
        <DialogContent className="sm:max-w-md border-[#002060]/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#002060] font-black text-base flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" /> Tolak Permohonan Zakat
            </DialogTitle>
            <DialogDescription>
              Tindakan ini akan menolak permohonan daripada {appForRejection?.namaPenuh} ({appForRejection?.noPekerja}). Sila nyatakan alasan rasmi untuk rujukan mereka.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Sila nyatakan alasan penolakan rasmi untuk makluman kakitangan..."
                className="min-h-24 text-xs focus-visible:ring-[#002060] focus-visible:border-[#002060]"
                disabled={isPendingTransition}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAppForRejection(null)}
                disabled={isPendingTransition}
                className="h-9 px-4 text-xs font-semibold cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPendingTransition || !rejectionReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white font-bold h-9 px-4 text-xs rounded-lg shadow-xs cursor-pointer"
              >
                {isPendingTransition ? "Menyimpan..." : "Tolak Permohonan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
