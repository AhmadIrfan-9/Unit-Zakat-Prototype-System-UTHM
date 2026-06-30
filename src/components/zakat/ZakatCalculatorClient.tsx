import React, { useState, useMemo, useCallback, useDeferredValue } from "react";

interface CalculatorProps {
  initialNisab?: number; // Menerima nilai daripada DB, lalai kepada RM 50228.51 mengikut imej 2026
}

// Kelas utiliti Tailwind untuk menyembunyikan anak panah angka (spin buttons)
const NUM_INPUT_CLASS = "w-full p-2.5 border rounded-lg focus:outline-none focus:border-blue-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

export default function ZakatCalculatorClient({ initialNisab = 50228.51 }: CalculatorProps) {
  // A. State Bahagian Pendapatan
  const [monthlySalary, setMonthlySalary] = useState<number>(0);
  const [allowance, setAllowance] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);

  // B. State Bahagian Penolakan/Pelepasan (Had Kifayah MAIJ)
  const [wivesCount, setWivesCount] = useState<number>(0);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [parentsSupport, setParentsSupport] = useState<number>(0);
  const [medical, setMedical] = useState<number>(0);
  const [education, setEducation] = useState<number>(0);

  // Defer all inputs for calculations to prevent keyboard input stuttering (INP optimization)
  const deferredMonthlySalary = useDeferredValue(monthlySalary);
  const deferredAllowance = useDeferredValue(allowance);
  const deferredBonus = useDeferredValue(bonus);
  const deferredWivesCount = useDeferredValue(wivesCount);
  const deferredChildrenCount = useDeferredValue(childrenCount);
  const deferredParentsSupport = useDeferredValue(parentsSupport);
  const deferredMedical = useDeferredValue(medical);
  const deferredEducation = useDeferredValue(education);

  // Fungsi onBlur: Format angka kepada 2 titik perpuluhan secara automatik
  const handleCurrencyBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      e.target.value = val.toFixed(2);
    } else if (e.target.value === "") {
      e.target.value = "0.00";
    }
  }, []);

  // Fungsi tetapan semula (Reset) semua input ke nilai asal
  const handleReset = useCallback(() => {
    const confirmed = window.confirm(
      "Adakah anda pasti mahu mengosongkan semua ruangan borang kalkulator ini?\n\nSemua nilai yang telah dimasukkan akan hilang."
    );
    if (!confirmed) return;

    setMonthlySalary(0);
    setAllowance(0);
    setBonus(0);
    setWivesCount(0);
    setChildrenCount(0);
    setParentsSupport(0);
    setMedical(0);
    setEducation(0);

    // Reset semua input DOM secara visual
    const form = document.getElementById("zakat-calculator-form") as HTMLFormElement | null;
    if (form) form.reset();
  }, []);

  // ENJIN LOGIK PENGIRAAN REAL-TIME (KISS & IMMUTABLE WORKFLOW)
  // Enforcing official MAIJ calculations dynamically within the reactive state scope.
  const calculations = useMemo(() => {
    const annualIncome = (deferredMonthlySalary + deferredAllowance) * 12 + deferredBonus;

    // Tetapan pemanduan kos pelepasan rasmi berdasarkan dokumen rujukan
    const SARA_DIRI = 9000;
    const ISTERI_PER_KAPITA = 3000;
    const ANAK_PER_KAPITA = 1000;

    const totalDeductions =
      SARA_DIRI +
      (deferredWivesCount * ISTERI_PER_KAPITA) +
      (deferredChildrenCount * ANAK_PER_KAPITA) +
      (deferredParentsSupport * 12) +
      deferredMedical +
      deferredEducation;

    const netDeductibleBalance = Math.max(0, annualIncome - totalDeductions);
    const isEligible = netDeductibleBalance >= initialNisab;
    
    const annualZakat = isEligible ? netDeductibleBalance * 0.025 : 0;
    const monthlyZakat = annualZakat / 12;

    return {
      annualIncome,
      totalDeductions,
      netDeductibleBalance,
      isEligible,
      annualZakat,
      monthlyZakat
    };
  }, [
    deferredMonthlySalary, 
    deferredAllowance, 
    deferredBonus, 
    deferredWivesCount, 
    deferredChildrenCount, 
    deferredParentsSupport, 
    deferredMedical, 
    deferredEducation, 
    initialNisab
  ]);

  return (
    <div id="zakat-calculator-form" className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-1 text-sm text-gray-700">
      
      {/* RUANGAN INPUT DATA (KOLUM 1 & 2) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* SEKYEN A: GAJI & PENDAPATAN */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider border-b pb-2">A. Pendapatan Tahunan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Gaji Pokok Sebulan (RM)</label>
              <input
                type="number"
                onChange={(e) => setMonthlySalary(Number(e.target.value) || 0)}
                onBlur={handleCurrencyBlur}
                className={NUM_INPUT_CLASS}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Elaun Sebulan (RM)</label>
              <input
                type="number"
                onChange={(e) => setAllowance(Number(e.target.value) || 0)}
                onBlur={handleCurrencyBlur}
                className={NUM_INPUT_CLASS}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Bonus/Pendapatan Lain (RM)</label>
              <input
                type="number"
                onChange={(e) => setBonus(Number(e.target.value) || 0)}
                onBlur={handleCurrencyBlur}
                className={NUM_INPUT_CLASS}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* SEKYEN B: PERBELANJAAN / PENOLAKAN (HAD KIFAYAH MAIJ) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider border-b pb-2">B. Keperluan Asas / Penolakan Setahun</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Sara Diri (Ditetapkan Automatik)</label>
              <input type="text" value="RM 9,000.00" disabled className="w-full p-2.5 border rounded-lg bg-gray-50 font-medium text-gray-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Bilangan Isteri (RM 3,000 x isteri)</label>
              <input
                type="number"
                min="0"
                onChange={(e) => setWivesCount(Math.max(0, Number(e.target.value)))}
                className={NUM_INPUT_CLASS}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Bilangan Anak (RM 1,000 x anak)</label>
              <input
                type="number"
                min="0"
                onChange={(e) => setChildrenCount(Math.max(0, Number(e.target.value)))}
                className={NUM_INPUT_CLASS}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Saraan Ibu Bapa Sebulan (RM)</label>
              <input
                type="number"
                onChange={(e) => setParentsSupport(Number(e.target.value) || 0)}
                onBlur={handleCurrencyBlur}
                className={NUM_INPUT_CLASS}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Kos Perubatan Sebenar Setahun (RM)</label>
              <input
                type="number"
                onChange={(e) => setMedical(Number(e.target.value) || 0)}
                onBlur={handleCurrencyBlur}
                className={NUM_INPUT_CLASS}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Kos Pendidikan Sebenar Setahun (RM)</label>
              <input
                type="number"
                onChange={(e) => setEducation(Number(e.target.value) || 0)}
                onBlur={handleCurrencyBlur}
                className={NUM_INPUT_CLASS}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

      </div>

      {/* PANEL HASIL RUMUSAN REAKTIF (KOLUM 3) */}
      <div className="space-y-4">
        <div className="bg-gradient-to-b from-blue-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-6 sticky top-6">
          <div>
            <h4 className="text-xs uppercase tracking-widest text-blue-200 font-bold">Kadar Nisab Rujukan (MAIJ)</h4>
            <p className="text-2xl font-black mt-1 text-amber-400">RM {initialNisab.toLocaleString("ms-MY", { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-gray-300 mt-0.5">Asas pengiraan semasa: 85 gram emas.</p>
          </div>

          <div className="border-t border-blue-800/60 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>Jumlah Pendapatan Kasar:</span>
              <span className="font-mono text-white">RM {calculations.annualIncome.toLocaleString("ms-MY", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Jumlah Penolakan Dibenarkan:</span>
              <span className="font-mono text-white">RM {calculations.totalDeductions.toLocaleString("ms-MY", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-blue-800 pt-2 text-gray-200 font-semibold">
              <span>Baki Bersih Terjadual:</span>
              <span className="font-mono text-amber-400">RM {calculations.netDeductibleBalance.toLocaleString("ms-MY", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* INDIKATOR STATUS KELAYAKAN SYARAK */}
          <div className={`p-4 rounded-xl text-center font-bold text-xs ${
            calculations.isEligible ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-gray-300 border border-white/10"
          }`}>
            {calculations.isEligible ? "✓ WAJIB MENUNAIKAN ZAKAT" : "✗ BELUM CUKUP NISAB KELAYAKAN"}
          </div>

          {/* JUMLAH CARUMAN AKHIR */}
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center space-y-1">
            <span className="text-[11px] text-gray-400 block uppercase tracking-wider font-semibold">Estimasi Caruman Sebulan</span>
            <span className="text-3xl font-black text-white font-mono">
              RM {calculations.monthlyZakat.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gray-400 block">
              (RM {calculations.annualZakat.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / setahun)
            </span>
          </div>

          {/* BUTANG TINDAKAN: CTA & KOSONGKAN BORANG */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={!calculations.isEligible || calculations.monthlyZakat <= 0}
              onClick={() => {
                localStorage.setItem("uthm_zakat_autofill_value", calculations.monthlyZakat.toFixed(2));
                alert(`Nilai RM ${calculations.monthlyZakat.toFixed(2)} telah dikunci masuk! Melencongkan anda ke borang caruman...`);
                window.location.href = "/dashboard/zakat?tab=mohon";
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-gray-500 text-slate-950 font-bold text-xs rounded-xl transition-colors duration-150 uppercase tracking-wider shadow-md"
            >
              Isi Borang Caruman Serta-merta
            </button>

            {/* Butang Kosongkan Borang (Reset) */}
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white font-semibold text-xs rounded-xl transition-colors duration-150 border border-white/10"
            >
              ↺ Kosongkan Borang
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
