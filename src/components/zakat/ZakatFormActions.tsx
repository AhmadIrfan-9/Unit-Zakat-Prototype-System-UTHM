// src/components/zakat/ZakatFormActions.tsx

"use client";

import React from "react";

interface ActionProps {
  onReset: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

export default function ZakatFormActions({ onReset, isSubmitting, isValid }: ActionProps) {
  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-4 border-t border-gray-100">
      
      {/* BUTANG UTAMA (Primary Solid Button) */}
      <button
        type="submit"
        disabled={isSubmitting || !isValid}
        className="w-full sm:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? "Memproses..." : "Hantar Borang Permohonan"}
      </button>

      {/* JALAN PENYELESAIAN: Butang Kosongkan dialihkan ke sini sebagai Ghost Button (Secondary Action) */}
      {/* Incremental patch repositioning form reset triggers closer to input validation layout boundaries. */}
      <button
        type="button"
        onClick={onReset}
        className="w-full sm:w-auto px-6 py-3 bg-transparent hover:bg-gray-50 text-gray-500 hover:text-gray-700 font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors border border-gray-200 cursor-pointer"
      >
        🔄 Kosongkan Borang
      </button>

    </div>
  );
}
