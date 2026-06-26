"use client";

import React, { useEffect, useState } from "react";
import { Search, RefreshCw, FileText, ChevronDown, ChevronUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  details: unknown;
  ipAddress: string;
  createdAt: string;
}

export default function AuditLogTableClient() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const res = await fetch("/api/admin/audit-logs");
      if (!res.ok) {
        throw new Error("Gagal memuatkan log audit.");
      }
      const data = (await res.json()) as AuditLog[];
      setLogs(data);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Ralat sistem berlaku semasa mengambil data log.";
      console.error("[fetchLogs] Error:", error);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    
    // Gunakan setTimeout untuk melarikan panggilan setState dari kitaran pemprosesan segerak useEffect
    const timer = setTimeout(() => {
      const loadInitialLogs = async () => {
        try {
          const res = await fetch("/api/admin/audit-logs");
          if (!res.ok) {
            throw new Error("Gagal memuatkan log audit.");
          }
          const data = (await res.json()) as AuditLog[];
          if (active) {
            setLogs(data);
            setIsLoading(false);
          }
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Ralat sistem berlaku semasa mengambil data log.";
          console.error("[loadInitialLogs] Error:", error);
          if (active) {
            toast.error(errMsg);
            setIsLoading(false);
          }
        }
      };
      
      loadInitialLogs();
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
      log.action.toLowerCase().includes(q) ||
      log.ipAddress.includes(q)
    );
  });

  const formatMYT = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("ms-MY", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      toast.error("Tiada data untuk dieksport.");
      return;
    }

    const headers = ["ID", "Tarikh (MYT)", "Emel Pelaku", "Aktiviti", "IP Address", "Butiran (JSON)"];
    
    const csvRows = [
      headers.join(","),
      ...filteredLogs.map((log) => {
        const formattedDate = formatMYT(log.createdAt);
        const email = log.userEmail ?? "N/A";
        const action = log.action;
        const ip = log.ipAddress;
        const details = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : "";
        return [
          `"${log.id}"`,
          `"${formattedDate}"`,
          `"${email}"`,
          `"${action}"`,
          `"${ip}"`,
          `"${details}"`
        ].join(",");
      })
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "ZAKAT_UTHM_AUDIT_LOG.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Log audit berjaya dieksport ke format CSV (Excel).");
  };

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search Input box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-405" />
          <Input
            placeholder="Cari emel, aktiviti, atau IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs focus-visible:ring-[#002060] focus-visible:border-[#002060]"
          />
        </div>

        {/* Buttons Control Block */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fetchLogs(true)}
            disabled={isLoading}
            className="h-9 px-3 text-xs border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Muat Semula</span>
          </Button>

          <Button
            type="button"
            onClick={exportToCSV}
            disabled={isLoading || filteredLogs.length === 0}
            className="h-9 px-4 text-xs bg-[#002060] hover:bg-[#002060]/95 text-white flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-bold shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Eksport ke Excel (CSV)</span>
          </Button>
        </div>
      </div>

      {/* Table Data Block */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#002060]/5 border-b border-slate-200 text-[#002060] text-[10px] font-black uppercase tracking-wider">
                <th className="py-3 px-4">Tarikh (MYT)</th>
                <th className="py-3 px-4">Emel Pelaku</th>
                <th className="py-3 px-4">Aktiviti</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#002060]/40" />
                    Memuatkan log audit...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                    Tiada rekod jejak log audit ditemui.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  let badgeColor = "bg-slate-105 text-slate-805 border-slate-205";
                  if (log.action.includes("PADAM") || log.action.includes("HARAM") || log.action.includes("GAGAL")) {
                    badgeColor = "bg-rose-50 text-rose-700 border-rose-100";
                  } else if (log.action.includes("SUKSES") || log.action.includes("DAFTAR") || log.action.includes("KEMASKINI")) {
                    badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                  }

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                          {formatMYT(log.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          {log.userEmail ?? <span className="text-slate-400 italic">N/A (Sistem/Anonim)</span>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider border ${badgeColor}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">{log.ipAddress}</td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(log.id)}
                            className="h-7 text-[10px] font-bold text-[#002060] hover:text-[#002060] hover:bg-[#002060]/5 cursor-pointer px-2.5"
                          >
                            {isExpanded ? (
                              <>
                                <span>Tutup</span>
                                <ChevronUp className="ml-1 h-3 w-3" />
                              </>
                            ) : (
                              <>
                                <span>Butiran</span>
                                <ChevronDown className="ml-1 h-3 w-3" />
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/40">
                          <td colSpan={5} className="py-3.5 px-6 border-b">
                            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg p-4 font-mono text-[10px] text-slate-700 dark:text-slate-300 max-w-full overflow-x-auto shadow-inner">
                              <div className="flex items-center gap-1.5 mb-2 border-b pb-1.5 border-slate-200/60 dark:border-slate-800 text-[#002060] dark:text-blue-300 font-bold uppercase tracking-wider">
                                <FileText className="h-3.5 w-3.5" />
                                <span>Metadata JSON (Immutable)</span>
                              </div>
                              <pre className="whitespace-pre-wrap break-all">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
