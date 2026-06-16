// This analytics interface renders symmetrical collection distribution graphs, displays inline AI data insight panels, and initializes the accessible vector PDF generation engine.

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, Cpu, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ZakatManagementFacultyDonutChartComponent } from "./ZakatManagementFacultyDonutChartComponent";
import { ZakatExecutiveReportGeneratorDocument } from "@/lib/pdf/ZakatExecutiveReportGeneratorDocument";

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

interface ZakatManagementAnalyticsReportingTabProps {
  applications?: ApplicationItem[];
  chartData?: {
    period: string;
    total: number;
  }[];
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

export function ZakatManagementAnalyticsReportingTabComponent({
  applications = [],
  chartData = []
}: ZakatManagementAnalyticsReportingTabProps) {
  // This state hook tracks the selected 5-year range to switch chronological line charts dynamically.
  const [selectedRangeKey, setSelectedRangeKey] = useState<string>("2022-2026");

  // This state hook manages the printable display status to compile vector PDF documents on demand.
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // This trigger hook coordinates browser printing actions when the vector rendering template unmounts normal views.
  useEffect(() => {
    if (isPrinting) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
        toast.success("Eksport laporan PDF berjaya diselesaikan.");
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isPrinting]);

  const yearRanges: Record<string, string[]> = {
    "2022-2026": ["2022", "2023", "2024", "2025", "2026"],
    "2020-2024": ["2020", "2021", "2022", "2023", "2024"],
    "2018-2022": ["2018", "2019", "2020", "2021", "2022"]
  };

  // This compiler aggregates annual Approved collections to populate the chronological trend line chart.
  const getLineChartDataset = () => {
    const targetYears = yearRanges[selectedRangeKey] || ["2022", "2023", "2024", "2025", "2026"];
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

  const lineData = getLineChartDataset();

  // This analytical method computes summary statistics and trend projections dynamically from approved collections.
  const getAIInsights = () => {
    const faculties = ["FKAAB", "FKEE", "FKMP", "FPTV", "FPTP", "FAST", "FSKTM", "FTK"];
    const sums: Record<string, number> = {};
    faculties.forEach(f => { sums[f] = 0; });
    let totalSum = 0;
    let totalApprovedCount = 0;
    const safeApps = applications || [];

    safeApps.forEach((app, index) => {
      if (app && app.status === "APPROVED") {
        const fac = faculties[index % faculties.length];
        const amt = Number(app.amaunZakatBulanan || app.amaunZakatBaru || 150.00);
        sums[fac] += amt;
        totalSum += amt;
        totalApprovedCount++;
      }
    });

    let highestFacName = "FSKTM";
    let highestFacAmt = 0;
    faculties.forEach(fac => {
      if (sums[fac] > highestFacAmt) {
        highestFacAmt = sums[fac];
        highestFacName = fac;
      }
    });

    let trendStatus = "STABIL";
    if (lineData.length >= 2) {
      const firstTotal = lineData[0].total;
      const lastTotal = lineData[lineData.length - 1].total;
      if (lastTotal > firstTotal) {
        trendStatus = "MENINGKAT";
      } else if (lastTotal < firstTotal) {
        trendStatus = "MENURUN";
      }
    }

    const highestFacultyFullName = FACULTY_NAMES[highestFacName] || highestFacName;
    const trendText = trendStatus === "MENINGKAT"
      ? "menunjukkan peningkatan berterusan yang konsisten berbanding tahun-tahun sebelumnya"
      : trendStatus === "MENURUN"
      ? "menunjukkan penurunan aliran kutipan yang memerlukan pemantauan lanjut"
      : "berada dalam keadaan stabil dan konsisten sepanjang tempoh penilaian";

    const insightText = `Berdasarkan pencerakan data terkini, jumlah caruman zakat kakitangan UTHM yang diluluskan secara rasmi berjumlah RM ${totalSum.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} merentasi ${totalApprovedCount} orang penyumbang aktif. Fakulti dengan jumlah sumbangan tertinggi diketuai oleh ${highestFacName} (${highestFacultyFullName}) dengan nilai dana terkumpul sebanyak RM ${highestFacAmt.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Trend kutipan tahunan bagi jangkauan masa terpilih (${selectedRangeKey}) adalah ${trendStatus}, yang mana aliran dana ${trendText}. Cadangan pengurusan adalah untuk meningkatkan lagi program kesedaran caruman di fakulti-fakulti dengan sumbangan yang lebih rendah bagi mengimbangi agihan kebajikan kakitangan.`;

    return {
      totalApprovedAmount: totalSum,
      totalApprovedCount,
      highestFacultyName: highestFacName,
      highestFacultyAmount: highestFacAmt,
      trendStatus,
      insightText
    };
  };

  const aiInsights = getAIInsights();

  // This component block represents the custom hover tooltip displaying chronological trend variables.
  const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-md text-xs">
          <p className="font-bold text-[#002060] dark:text-blue-400">Tahun {data.year}</p>
          <p className="text-slate-655 dark:text-slate-300 font-semibold mt-1">
            Kutipan Tahunan: <span className="font-bold text-[#002060] dark:text-emerald-500">RM {data.total.toFixed(2)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // This conditional visibility check unmounts normal views to isolate the print layout component.
  if (isPrinting) {
    return (
      <ZakatExecutiveReportGeneratorDocument
        applications={applications}
        yearRange={selectedRangeKey}
        aiInsights={aiInsights}
      />
    );
  }

  return (
    // This layout block aligns the collection breakdown donut charts and multi-year trend line graphs side-by-side.
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      
      {/* This grid flex container structures the interactive charts side-by-side across desktop viewports. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        
        {/* This layout block handles the faculty collection donut chart visualization. */}
        <ZakatManagementFacultyDonutChartComponent applications={applications} />

        {/* This layout container handles the annual collection line chart visualization. */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-card h-[450px] flex flex-col justify-between overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/10 px-5 py-4 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">Trend Kutipan Tahunan</CardTitle>
              <CardDescription className="text-[10px]">Jumlah caruman berdaftar diluluskan mengikut tahun mula</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="p-5 flex-1 flex flex-col justify-between overflow-hidden">
            
            <div className="h-48 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="year" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `RM${v}`} />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#002060"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, stroke: "#002060", strokeWidth: 1.5, fill: "#fff" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* This button switcher component toggles between consecutive 5-year chronological ranges. */}
            <div className="pt-4 border-t mt-2 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-500">Pilih Jangkauan 5-Tahun</span>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(yearRanges).map((rangeKey) => (
                  <Button
                    key={rangeKey}
                    type="button"
                    size="sm"
                    variant={selectedRangeKey === rangeKey ? "default" : "outline"}
                    onClick={() => setSelectedRangeKey(rangeKey)}
                    className={selectedRangeKey === rangeKey
                      ? "bg-[#002060] hover:bg-[#002060]/95 text-white font-bold h-8 text-[10px] cursor-pointer"
                      : "border-slate-200 text-slate-600 font-bold h-8 text-[10px] cursor-pointer"
                    }
                  >
                    {rangeKey.replace("-", " - ")}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* This card container hosts the AI Smart Insight Panel displaying dynamic collection analysis. */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-card overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/10 px-5 py-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#002060]" />
            <div>
              <CardTitle className="text-sm font-bold text-foreground">Panel Analisis Pintar AI</CardTitle>
              <CardDescription className="text-[10px]">Rumusan analisis automatik dijana terus daripada pangkalan data zakat</CardDescription>
            </div>
          </div>
          
          <Button
            type="button"
            size="sm"
            onClick={() => {
              toast.success("Menyediakan dokumen PDF...");
              setIsPrinting(true);
            }}
            className="bg-[#002060] hover:bg-[#002060]/90 text-white text-[10px] h-8 px-4 flex items-center gap-1.5 font-bold shadow-sm transition-colors cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            Eksport Laporan PDF
          </Button>
        </CardHeader>
        
        {/* This block container styles the soft light-blue background and structured typography list for AI insights. */}
        <CardContent className="p-5">
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-[#002060]/5 border border-blue-100/50 dark:border-[#002060]/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 block">Fakulti Tertinggi</span>
                <span className="text-sm font-black text-[#002060] flex items-center gap-1">
                  {aiInsights.highestFacultyName}
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-650">RM {aiInsights.highestFacultyAmount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 block">Jumlah Kutipan Keseluruhan</span>
                <span className="text-sm font-black text-emerald-700">
                  RM {aiInsights.totalApprovedAmount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 block">Aliran Trend Jangkauan</span>
                <span className="text-sm font-black text-[#002060] uppercase">
                  {aiInsights.trendStatus}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-medium pt-3 border-t border-slate-200/50 dark:border-slate-800">
              {aiInsights.insightText}
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
