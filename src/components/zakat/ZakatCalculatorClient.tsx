import React, { useState, useMemo, useCallback, useDeferredValue } from "react";
import ZakatSummaryCard from "./ZakatSummaryCard";

interface CalculatorProps {
  initialNisab?: number;
  userProfileSalary?: number;
}

// Kelas utiliti Tailwind untuk menyembunyikan anak panah angka (spin buttons)
const NUM_INPUT_CLASS = "w-full p-2.5 border rounded-lg focus:outline-none focus:border-blue-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

export default function ZakatCalculatorClient({ initialNisab = 50228.51, userProfileSalary = 0 }: CalculatorProps) {
  // A. State Bahagian Pendapatan
  const [allowance, setAllowance] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);

  // B. State Bahagian Penolakan/Pelepasan (Had Kifayah MAIJ)
  const [wivesCount, setWivesCount] = useState<number>(0);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [parentsSupport, setParentsSupport] = useState<number>(0);
  const [medical, setMedical] = useState<number>(0);
  const [education, setEducation] = useState<number>(0);

  // Defer all inputs for calculations to prevent keyboard input stuttering (INP optimization)
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



  // ENJIN LOGIK PENGIRAAN REAL-TIME (KISS & IMMUTABLE WORKFLOW)
  // Enforcing official MAIJ calculations dynamically within the reactive state scope.
  const calculations = useMemo(() => {
    const NISAB_TAHUNAN_MAIJ = initialNisab;
    const NISAB_BULANAN_MAIJ = NISAB_TAHUNAN_MAIJ / 12; // RM 4,185.71

    const jumlahPendapatanKasar = (userProfileSalary + deferredAllowance) * 12 + deferredBonus;

    // Tetapan pemanduan kos pelepasan rasmi berdasarkan dokumen rujukan
    const SARA_DIRI = 9000;
    const ISTERI_PER_KAPITA = 3000;
    const ANAK_PER_KAPITA = 1000;

    const jumlahPenolakanDibenarkan =
      SARA_DIRI +
      (deferredWivesCount * ISTERI_PER_KAPITA) +
      (deferredChildrenCount * ANAK_PER_KAPITA) +
      (deferredParentsSupport * 12) +
      deferredMedical +
      deferredEducation;

    // Kira baki bersih selepas penolakan kos bulan-bulan
    const bakiBersihTerjadual = Math.max(0, jumlahPendapatanKasar - jumlahPenolakanDibenarkan) / 12;

    // Keputusan muktamad status wajib zakat
    const isWajibZakat = bakiBersihTerjadual >= NISAB_BULANAN_MAIJ;
    const isEligible = isWajibZakat;

    const annualZakat = isWajibZakat ? Math.max(0, jumlahPendapatanKasar - jumlahPenolakanDibenarkan) * 0.025 : 0;
    const monthlyZakat = annualZakat / 12;

    return {
      annualIncome: jumlahPendapatanKasar,
      totalDeductions: jumlahPenolakanDibenarkan,
      netDeductibleBalance: Math.max(0, jumlahPendapatanKasar - jumlahPenolakanDibenarkan),
      isEligible,
      annualZakat,
      monthlyZakat
    };
  }, [
    userProfileSalary,
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
                type="text"
                value={userProfileSalary.toFixed(2)}
                readOnly
                className="w-full p-2.5 text-xs bg-gray-50 text-gray-500 border border-gray-200 rounded-xl font-mono cursor-not-allowed select-none focus:outline-none"
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
        <ZakatSummaryCard
          nisab={initialNisab}
          annualIncome={calculations.annualIncome}
          totalDeductions={calculations.totalDeductions}
          bakiBersih={calculations.netDeductibleBalance}
          isEligible={calculations.isEligible}
          estimasi={calculations.monthlyZakat}
          estimasiTahunan={calculations.annualZakat}
        />
      </div>

    </div>
  );
}
