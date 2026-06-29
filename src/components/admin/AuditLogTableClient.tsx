// src/components/admin/AuditLogTableClient.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";

interface AuditLogRecord {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  details: unknown;
  ipAddress: string;
  createdAt: string | Date;
}

interface AuditLogTableClientProps {
  initialLogs?: AuditLogRecord[];
}

export default function AuditLogTableClient({ initialLogs }: AuditLogTableClientProps = {}) {
  const [logs, setLogs] = useState<AuditLogRecord[]>(initialLogs || []);
  const [isLoading, setIsLoading] = useState(!initialLogs);
  const [selectedAction, setSelectedAction] = useState<string>("All");

  // 1. Ambil data log secara real-time daripada API selamat Next.js
  useEffect(() => {
    if (initialLogs) return;
    async function fetchLogs() {
      try {
        const res = await fetch("/api/admin/audit-logs");
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error("Gagal memuatkan audit log:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  // Ambil senarai unik jenis aktiviti untuk ditapis
  const uniqueActions = useMemo(() => {
    const actions = new Set<string>();
    logs.forEach((log) => {
      if (log.action) actions.add(log.action);
    });
    return ["All", ...Array.from(actions)];
  }, [logs]);

  // Log yang telah ditapis
  const filteredLogs = useMemo(() => {
    if (selectedAction === "All") return logs;
    return logs.filter((log) => log.action === selectedAction);
  }, [logs, selectedAction]);

  // 2. TUGASAN 3: ENJIN UTALITI EKSPORT KE EXCEL (CSV FORMAT)
  const handleExportToCSV = () => {
    const dataToExport = filteredLogs;
    if (dataToExport.length === 0) return alert("Tiada data log untuk dieksport.");

    // Sediakan tajuk kolum utama Excel
    const headers = ["ID REKOD", "STEMPEL MASA (MYT)", "PELAKU (EMAIL)", "AKTIVITI", "ALAMAT IP", "METADATA PERINCIAN"];
    
    // Tukar baris data objek menjadi baris teks CSV yang dipisahkan oleh tanda koma
    const csvRows = dataToExport.map((log) => {
      const formattedDate = new Date(log.createdAt).toLocaleString("ms-MY", { timeZone: "Asia/Kuala_Lumpur" });
      const sanitizedDetails = JSON.stringify(log.details).replace(/"/g, '""'); // Escaping tanda petik untuk Excel

      return [
        `"${log.id}"`,
        `"${formattedDate}"`,
        `"${log.userEmail || "ANONYMOUS"}"`,
        `"${log.action}"`,
        `"${log.ipAddress}"`,
        `"${sanitizedDetails}"`
      ].join(",");
    });

    // Gabungkan tajuk bersama baris kandungan
    const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\n"); // Menggunakan BOM (\uFEFF) supaya tulisan jawi/khas tidak rosak di Excel
    
    // Cetus muat turun fail automatik ke dalam komputer
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ZAKAT_UTHM_AUDIT_LOG_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500 animate-pulse">Memuatkan log keselamatan...</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-blue-950">Jejak Audit & Log Aktiviti Global</h2>
          <p className="text-xs text-gray-500">Sistem arkib imutabel bagi memantau urus tadbir integriti portal.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Penapis Jenis Aktiviti */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="p-2 border rounded-lg bg-gray-50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-950"
          >
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                Tapis: {act === "All" ? "Semua Aktiviti" : act}
              </option>
            ))}
          </select>

          {/* Butang Eksport CSV gred industri */}
          <button
            onClick={handleExportToCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors duration-200 shadow-sm shrink-0"
          >
            📊 Eksport CSV
          </button>
        </div>
      </div>

      {/* Paparan Jadual Utama (Read-Only Layout) */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4">Tarikh & Masa (MYT)</th>
              <th className="p-4">Kakitangan (Pelaku)</th>
              <th className="p-4">Jenis Aktiviti</th>
              <th className="p-4">Alamat IP</th>
              <th className="p-4">Perincian Metadata (JSON)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-gray-600">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">Tiada rekod log aktiviti ditemui bagi tapisan ini.</td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/80 transition-colors duration-150">
                  <td className="p-4 whitespace-nowrap font-medium text-gray-900">
                    {new Date(log.createdAt).toLocaleString("ms-MY", { timeZone: "Asia/Kuala_Lumpur" })}
                  </td>
                  <td className="p-4 whitespace-nowrap text-blue-900 font-mono text-xs">
                    {log.userEmail}
                  </td>
                  <td className="p-4 hash-tag-zone">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      log.action.includes("HAD") || log.action.includes("HARBI") || log.action.includes("GAGAL") || log.action.includes("TOLAK")
                        ? "bg-red-50 text-red-700 border border-red-100"
                        : "bg-blue-50 text-blue-700 border border-blue-100"
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap font-mono text-xs text-gray-500">
                    {log.ipAddress}
                  </td>
                  <td className="p-4 max-w-xs">
                    <pre className="text-[11px] bg-gray-50 p-2 rounded-md font-mono overflow-x-auto border border-gray-200 text-gray-700 max-h-24">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}