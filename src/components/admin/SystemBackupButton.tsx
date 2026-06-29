"use client";

import React, { useState, useTransition } from "react";

export default function SystemBackupButton() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const handleHeavyAction = () => {
    // 1. URUSAN PANTAS: Tukar status memuatkan serta-merta untuk membebaskan Main Thread pelayar
    setIsLoading(true);

    // 2. PEMBAIKAN INP: Gunakan setTimeout dan startTransition untuk melonggarkan giliran tugasan (Event Loop)
    // Incremental patch splitting synchronous event blocks to optimize Interaction to Next Paint (INP).
    setTimeout(() => {
      startTransition(async () => {
        try {
          console.log("Menjalankan operasi forensik data yang berat...");
          
          // Cetus muat turun fail sandaran pangkalan data secara langsung
          const link = document.createElement("a");
          link.href = "/api/admin/backup";
          link.setAttribute("download", `zakat_uthm_backup_${Date.now()}.json`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          alert("Muat turun sandaran pangkalan data berjaya dimulakan!");
        } catch (error) {
          console.error("Ralat operasi:", error);
          alert("Gagal memuat turun sandaran pangkalan data.");
        } finally {
          setIsLoading(false);
        }
      });
    }, 0); // Diaktifkan pada makrotask seterusnya supaya pelayar sempat melukis (paint) butang loading
  };

  return (
    <button
      type="button"
      disabled={isLoading || isPending}
      onClick={handleHeavyAction}
      className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all duration-150 uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading || isPending ? (
        <>
          <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Sedang Menyediakan Sandaran...</span>
        </>
      ) : (
        <span>📥 Muat Turun Sandaran Penuh (.json)</span>
      )}
    </button>
  );
}
