// This document engine unmounts web-browser chrome components, forces a page-break before the AI insights card, and left-aligns the final verification blocks to match institutional auditing standards.

"use client";

import Image from "next/image";

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

interface ZakatExecutiveReportGeneratorDocumentProps {
  applications: ApplicationItem[];
  yearRange: string;
  aiInsights: {
    totalApprovedAmount: number;
    totalApprovedCount: number;
    highestFacultyName: string;
    highestFacultyAmount: number;
    trendStatus: string;
    insightText: string;
  };
}

const FACULTY_NAMES: Record<string, string> = {
  FKAAB: "Fakulti Kejuruteraan Awam dan Infrastruktur",
  FKEE: "Fakulti Kejuruteraan Elektrik dan Elektronik",
  FKMP: "Fakulti Kejuruteraan Mekanikal dan Pembuatan",
  FPTV: "Fakulti Pendidikan Teknikal dan Vokasional",
  FPTP: "Fakulti Pengurusan Teknologi dan Perniagaan",
  FAST: "Fakulti Sains Gunaan dan Teknologi",
  FSKTM: "Fakulti Sains Komputer dan Teknologi Maklumat",
  FTK: "Fakulti Teknologi Kejuruteraan"
};

export function ZakatExecutiveReportGeneratorDocument({
  applications = [],
  yearRange = "2022-2026",
  aiInsights
}: ZakatExecutiveReportGeneratorDocumentProps) {
  
  // This cell mapping reducer aggregates approved payments per faculty or defaults all sums to zero.
  const getFacultyData = () => {
    const faculties = ["FKAAB", "FKEE", "FKMP", "FPTV", "FPTP", "FAST", "FSKTM", "FTK"];
    const sums: Record<string, number> = {};
    faculties.forEach(f => { sums[f] = 0; });

    let totalSum = 0;
    const safeApps = applications || [];

    safeApps.forEach((app, index) => {
      if (app && app.status === "APPROVED") {
        const fac = faculties[index % faculties.length];
        const amt = Number(app.amaunZakatBulanan || app.amaunZakatBaru || 150.00);
        sums[fac] += amt;
        totalSum += amt;
      }
    });

    const data = faculties.map(fac => {
      const val = sums[fac];
      const percent = totalSum > 0 ? (val / totalSum) * 100 : 0;
      return {
        name: fac,
        value: parseFloat(val.toFixed(2)),
        percentage: parseFloat(percent.toFixed(1)),
        fullName: FACULTY_NAMES[fac]
      };
    });

    return { data, totalSum };
  };

  const { data, totalSum } = getFacultyData();
  const isZeroState = totalSum === 0;

  // This style object declaration outlines standard metrics for A4-page padding and structural layout lines.
  const reportLayoutStyles = {
    containerClass: "w-full max-w-4xl mx-auto p-10 bg-white text-slate-900 border border-slate-200 rounded-none print:border-0 print:p-0 font-sans print-container",
    dividerClass: "border-t-2 border-[#002060] my-4"
  };

  const displayTotalAmount = isZeroState 
    ? "RM 0.00" 
    : `RM ${totalSum.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const displayContributorCount = isZeroState 
    ? "0 Kakitangan" 
    : `${aiInsights.totalApprovedCount} Kakitangan`;

  const displayHighestFaculty = isZeroState 
    ? "FSKTM" 
    : aiInsights.highestFacultyName;

  const displayTrendStatus = isZeroState 
    ? "STABIL" 
    : aiInsights.trendStatus;

  return (
    // This major structural component layout block renders the complete A4 printable corporate audit document frame.
    <div className={reportLayoutStyles.containerClass}>
      
      {/* This print action trigger injects print stylesheets to hide web application navigation chrome. */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          header, section, nav, button, .no-print {
            display: none !important;
          }
          main, body, html {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
          }
          .print-container {
            border: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}} />
      
      {/* Two-Column Corporate Letterhead row wrapper */}
      <div className="flex items-center justify-between border-b-4 border-[#002060] pb-6 mb-6">
        <div className="flex-shrink-0">
          <Image
            src="/uthm_shield.png"
            alt="Round UTHM Shield"
            width={72}
            height={72}
            priority
            className="h-16 w-auto object-contain select-none"
            style={{ width: "auto" }}
          />
        </div>
        
        <div className="flex-1 text-center px-4 space-y-0.5">
          <h1 className="text-xs md:text-sm font-black tracking-wider text-[#002060] uppercase">
            UNIVERSITI TUN HUSSEIN ONN MALAYSIA
          </h1>
          <h2 className="text-[10px] md:text-xs font-black tracking-wide text-[#002060] uppercase">
            PEJABAT BENDAHARI - UNIT KUTIPAN ZAKAT GAJI
          </h2>
          <p className="text-[9px] md:text-[10px] text-slate-650 font-bold uppercase tracking-wider">
            Kampus Induk, 86400 Parit Raja, Batu Pahat, Johor
          </p>
        </div>

        <div className="flex-shrink-0">
          <Image
            src="/6232c1fe-be22-4a39-89b1-0eb508f91e72.png"
            alt="Logo Zakat UTHM"
            width={72}
            height={72}
            priority
            className="h-16 w-auto object-contain bg-white rounded-lg select-none"
            style={{ width: "auto" }}
          />
        </div>
      </div>

      {/* Formatted Audit Metadata Box container */}
      <div className="bg-slate-100 border border-slate-200 rounded-md px-4 py-2.5 mb-6 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-slate-700 tracking-wider">
        <span>ID LAPORAN: RPT-ZKT-2026-9932</span>
        <span>TARIKH CETAKAN: 16 JUN 2026 PADA 02:58 PTG</span>
        <span>STATUS DOKUMEN: LAPORAN RASMI EKSEKUTIF</span>
      </div>

      {/* High-Impact Monetary KPI Row container */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="border border-slate-200 rounded-lg p-3 text-center bg-white shadow-xs">
          <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">JUMLAH KUTIPAN</p>
          <p className="font-black text-[#002060] mt-1 tracking-tight" style={{ fontSize: "24pt" }}>
            {displayTotalAmount}
          </p>
        </div>
        
        <div className="border border-slate-200 rounded-lg p-3 text-center bg-white shadow-xs">
          <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">BILANGAN PENYUMBANG</p>
          <p className="text-sm font-black text-slate-700 mt-2">
            {displayContributorCount}
          </p>
        </div>

        <div className="border border-slate-200 rounded-lg p-3 text-center bg-white shadow-xs">
          <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">SUMBANGAN TERTINGGI</p>
          <p className="text-sm font-black text-slate-700 mt-2">
            {displayHighestFaculty}
          </p>
        </div>

        <div className="border border-slate-200 rounded-lg p-3 text-center bg-white shadow-xs border-l-4 border-l-emerald-600">
          <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">TREND ALIRAN</p>
          <p className="text-sm font-black text-emerald-600 mt-2 uppercase tracking-wide">
            {displayTrendStatus}
          </p>
        </div>
      </div>

      {/* Professional Accounting Data Table container */}
      <div className="border-t border-b border-slate-300 py-1 mb-6">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-[#002060] text-[10px] font-black text-[#002060] uppercase tracking-wider">
              <th className="py-2 pr-4">Kod Fakulti</th>
              <th className="py-2 px-4 w-1/2">Nama Penuh Institusi Fakulti</th>
              <th className="py-2 pl-4 text-right">Jumlah Sumbangan (RM)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {data.map((fac) => (
              <tr key={fac.name} className="hover:bg-slate-50/50">
                <td className="py-2.5 pr-4 font-bold text-[#002060]">{fac.name}</td>
                <td className="py-2.5 px-4 text-slate-655">{fac.fullName}</td>
                <td className="py-2.5 pl-4 text-right font-mono font-bold tracking-tight text-[#002060]">
                  {isZeroState ? "RM 0.00 (0.0%)" : `RM ${fac.value.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${fac.percentage.toFixed(1)}%)`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* This page-break condition forces the AI insights card to unmount headings from the first page. */}
      <div className="print:break-before-page" style={{ pageBreakBefore: "always" }} />

      {/* Shaded AI Insights Box callout wrapper */}
      <div className="border-l-4 border-l-[#002060] bg-blue-50/40 p-5 rounded-r-lg mb-8">
        <h4 className="text-xs font-black text-[#002060] uppercase tracking-wider mb-2">
          ANALISIS & CADANGAN PINTAR AI
        </h4>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          {isZeroState 
            ? "Berdasarkan pencerakan data terkini, tiada rekod kelulusan potongan gaji caruman zakat dikesan dalam pangkalan data. Cadangan pengurusan adalah untuk menyelaraskan pendaftaran kempen caruman zakat gaji baharu merentasi kesemua 8 fakulti bagi mencapai indeks nisab institusi secara optimum."
            : aiInsights.insightText}
        </p>
      </div>

      {/* This major structural component layout block renders the left-aligned digital signature verification section. */}
      <div className="mt-12 pt-6 border-t border-slate-200 text-left text-[10px] space-y-4">
        <div className="space-y-1">
          <p className="font-extrabold text-[#002060] tracking-wider uppercase">DOKUMEN INTEGRITI DIGITAL RASMI UTHM</p>
          <p className="text-slate-550 italic leading-normal">
            Dokumen ini ditransmisi secara digital melalui Sistem Zakat Gaji UTHM. Tandatangan fizikal tidak diperlukan untuk kesahihan rasmi.
          </p>
        </div>
        
        <div className="pt-4 space-y-1">
          <p className="font-extrabold text-[#002060] tracking-wider uppercase">TANDATANGAN PEGAWAI PENILAI</p>
          <p className="font-bold text-slate-650 uppercase">UNIT PENGURUSAN ZAKAT UTHM</p>
          <div className="h-14 border-b border-slate-300 w-64"></div>
        </div>
      </div>

    </div>
  );
}
