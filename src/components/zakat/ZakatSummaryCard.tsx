// src/components/zakat/ZakatSummaryCard.tsx

import React from "react";

interface ZakatSummaryCardProps {
  nisab: number;
  annualIncome: number;
  totalDeductions: number;
  bakiBersih: number;
  isEligible: boolean;
  estimasi: number;
  estimasiTahunan: number;
}

export default function ZakatSummaryCard({
  nisab,
  annualIncome,
  totalDeductions,
  bakiBersih,
  isEligible,
  estimasi,
  estimasiTahunan,
}: ZakatSummaryCardProps) {
  return (
    <div className="bg-blue-950 text-white p-6 rounded-3xl space-y-6">
      <div>
        <h4 className="text-xs uppercase tracking-widest text-blue-200 font-bold">Kadar Nisab Rujukan (MAIJ)</h4>
        <p className="text-2xl font-black mt-1 text-amber-400">
          RM {nisab.toLocaleString("ms-MY", { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[10px] text-gray-300 mt-0.5">Asas pengiraan semasa: 85 gram emas.</p>
      </div>

      <div className="border-t border-blue-800/60 pt-4 space-y-2 text-xs">
        <div className="flex justify-between text-gray-300">
          <span>Jumlah Pendapatan Kasar:</span>
          <span className="font-mono text-white">
            RM {annualIncome.toLocaleString("ms-MY", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span>Jumlah Penolakan Dibenarkan:</span>
          <span className="font-mono text-white">
            RM {totalDeductions.toLocaleString("ms-MY", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between border-t border-dashed border-blue-800 pt-2 text-gray-200 font-semibold">
          <span>Baki Bersih Terjadual:</span>
          <span className="font-mono text-amber-400">
            RM {bakiBersih.toLocaleString("ms-MY", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* INDIKATOR STATUS KELAYAKAN SYARAK */}
      <div className={`p-4 rounded-xl text-center font-bold text-xs ${
        isEligible ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-gray-300 border border-white/10"
      }`}>
        {isEligible ? "✓ WAJIB MENUNAIKAN ZAKAT" : "✗ BELUM CUKUP NISAB KELAYAKAN"}
      </div>

      {/* JUMLAH CARUMAN AKHIR */}
      <div className="p-4 bg-blue-900/40 rounded-2xl border border-blue-900 text-center space-y-1">
        <span className="block text-[10px] uppercase text-gray-400 font-bold tracking-wider">Estimasi Caruman Sebulan</span>
        <span className="text-3xl font-black block mt-1 font-mono text-white">
          RM {estimasi.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-[10px] text-gray-400 block">
          (RM {estimasiTahunan.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / setahun)
        </span>
      </div>

      {/* PEMBAIKAN UTAMA: Blok dua butang di bahagian bawah telah DIPADAMKAN sepenuhnya 
          untuk menjaga kebersihan visual dan mengelakkan kecelaruan kognitif. */}
    </div>
  );
}
