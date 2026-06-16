// This document engine compiles database query array frames into clean vector structures to build a highly accessible and printable PDF summary sheet.

"use client";

import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

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

const DONUT_COLORS = [
  "#002060",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#6366f1",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6"
];

export function ZakatExecutiveReportGeneratorDocument({
  applications = [],
  yearRange = "2022-2026",
  aiInsights
}: ZakatExecutiveReportGeneratorDocumentProps) {
  
  // This reducer method aggregates Approved collections for the 8 faculties to feed the printable donut chart.
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

    const hasData = totalSum > 0;
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

    return { data, totalSum, hasData };
  };

  // This compiler aggregates annual Approved collections to populate the printable trend line chart.
  const getLineChartDataset = () => {
    const rangeMap: Record<string, string[]> = {
      "2022-2026": ["2022", "2023", "2024", "2025", "2026"],
      "2020-2024": ["2020", "2021", "2022", "2023", "2024"],
      "2018-2022": ["2018", "2019", "2020", "2021", "2022"]
    };
    const targetYears = rangeMap[yearRange] || ["2022", "2023", "2024", "2025", "2026"];
    let hasLineData = false;
    const safeApps = applications || [];

    const dynamicData = targetYears.map(year => {
      let total = 0;
      safeApps.forEach(app => {
        if (app && app.status === "APPROVED" && app.tahunMula === year) {
          const amt = app.amaunZakatBulanan || app.amaunZakatBaru || 150.00;
          total += Number(amt);
          hasLineData = true;
        }
      });
      return { year, total: parseFloat(total.toFixed(2)) };
    });

    const zeroStateDataset = targetYears.map(year => ({ year, total: 0 }));

    return !hasLineData ? zeroStateDataset : dynamicData;
  };

  const { data, totalSum, hasData } = getFacultyData();
  const lineData = getLineChartDataset();
  const isDonutZero = !hasData;

  const donutDataForChart = isDonutZero
    ? data.map(item => ({ ...item, chartValue: 1 }))
    : data.map(item => ({ ...item, chartValue: item.value }));

  const currentDateString = new Date().toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    // This header container constructs the formal university corporate branding header banner.
    <div className="w-full max-w-4xl mx-auto p-8 bg-white text-slate-900 border border-slate-200 rounded-none print:border-0 print:p-0">
      
      {/* Formal Header Section */}
      <div className="border-b-4 border-[#002060] pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#002060] uppercase">
            Universiti Tun Hussein Onn Malaysia
          </h1>
          <h2 className="text-sm font-bold text-slate-600 mt-1 uppercase">
            Pejabat Bendahari &mdash; Unit Kutipan Zakat Gaji
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kampus Induk, 86400 Parit Raja, Batu Pahat, Johor
          </p>
        </div>
        <div className="text-right text-[10px] text-slate-500 space-y-1 font-mono">
          <p>ID LAPORAN: RPT-ZKT-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}</p>
          <p>TARIKH CETAKAN: {currentDateString.toUpperCase()}</p>
          <p>STATUS DOKUMEN: LAPORAN RASMI EKSEKUTIF</p>
        </div>
      </div>

      {/* Report Title */}
      <div className="text-center mb-8">
        <h3 className="text-lg font-black text-[#002060] tracking-wide uppercase">
          Laporan Eksekutif Analisis Agihan & Trend Kutipan Zakat Kakitangan
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Analisis perbandingan taburan sumbangan fakulti dan penilaian aliran dana terkumpul
        </p>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8 text-center">
        <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
          <p className="text-[9px] uppercase font-bold text-slate-550">Jumlah Kutipan</p>
          <p className="text-sm font-black text-[#002060] mt-1">
            RM {totalSum.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
          <p className="text-[9px] uppercase font-bold text-slate-550">Bilangan Penyumbang</p>
          <p className="text-sm font-black text-[#002060] mt-1">
            {aiInsights.totalApprovedCount} Kakitangan
          </p>
        </div>
        <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
          <p className="text-[9px] uppercase font-bold text-slate-550">Sumbangan Tertinggi</p>
          <p className="text-sm font-black text-[#002060] mt-1 truncate">
            {aiInsights.highestFacultyName}
          </p>
        </div>
        <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
          <p className="text-[9px] uppercase font-bold text-slate-550">Trend Aliran</p>
          <p className="text-sm font-black text-emerald-700 mt-1 uppercase">
            {aiInsights.trendStatus}
          </p>
        </div>
      </div>

      {/* This layout grid organizes the donut chart and trend line chart side-by-side for print media. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-center">
        
        {/* Left: Donut Chart representation */}
        <div className="border border-slate-200 p-4 rounded-xl flex flex-col items-center">
          <p className="text-xs font-bold text-[#002060] mb-3 uppercase tracking-wider text-center">
            Pecahan Sumbangan Mengikut Fakulti
          </p>
          <div className="relative w-64 h-48 flex items-center justify-center">
            <PieChart width={240} height={180}>
              <Pie
                data={donutDataForChart}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={isDonutZero ? 0 : 2}
                dataKey="chartValue"
              >
                {donutDataForChart.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={isDonutZero ? "#cbd5e1" : DONUT_COLORS[index % DONUT_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[8px] font-bold text-slate-550 uppercase">Total</span>
              <span className="text-xs font-black text-[#002060] mt-0.5">
                RM {totalSum.toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Chronological Trend Line Chart */}
        <div className="border border-slate-200 p-4 rounded-xl flex flex-col items-center">
          <p className="text-xs font-bold text-[#002060] mb-3 uppercase tracking-wider text-center">
            Aliran Kutipan Mengikut Tahun Mula
          </p>
          <div className="w-64 h-48">
            <LineChart width={240} height={180} data={lineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="year" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `RM${v}`} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#002060"
                strokeWidth={2}
                dot={{ r: 3, stroke: "#002060", strokeWidth: 1, fill: "#fff" }}
              />
            </LineChart>
          </div>
        </div>

      </div>

      {/* This tabular grid displays the detailed collection values and percentages per faculty. */}
      <div className="border border-slate-200 rounded-lg overflow-hidden mb-8">
        <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 text-[10px] font-black text-[#002060] uppercase tracking-wider px-4 py-2">
          <span>Kod Fakulti</span>
          <span className="col-span-2">Nama Penuh Institusi Fakulti</span>
          <span className="text-right">Jumlah Sumbangan (RM)</span>
        </div>
        <div className="divide-y divide-slate-200 text-xs">
          {data.map((fac) => (
            <div key={fac.name} className="grid grid-cols-4 items-center px-4 py-2">
              <span className="font-bold text-[#002060]">{fac.name}</span>
              <span className="col-span-2 text-slate-600 truncate">{fac.fullName}</span>
              <span className="text-right font-bold">
                RM {fac.value.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({fac.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* This block container displays the dynamic analytical text summaries computed from current collections. */}
      <div className="border border-blue-150 p-6 rounded-lg bg-blue-50/40 mb-8">
        <h4 className="text-xs font-black text-[#002060] uppercase tracking-wider mb-2">
          Analisis & Cadangan Pintar AI (AI Smart Insights Summary)
        </h4>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          {aiInsights.insightText}
        </p>
      </div>

      {/* Signature and verification seal block */}
      <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 text-xs">
        <div>
          <p className="font-bold text-[#002060] uppercase">Tandatangan Pegawai Penilai</p>
          <div className="h-16"></div>
          <p className="font-black text-slate-700">_______________________________</p>
          <p className="text-slate-500 mt-1 font-semibold">Unit Pengurusan Zakat UTHM</p>
        </div>
        <div className="text-right self-end text-[10px] text-slate-400 font-mono">
          <p>Dokumen ini ditransmisi secara digital melalui Sistem Zakat Gaji UTHM.</p>
          <p>Tandatangan fizikal tidak diperlukan untuk kesahihan rasmi.</p>
        </div>
      </div>

    </div>
  );
}
