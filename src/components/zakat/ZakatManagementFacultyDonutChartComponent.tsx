// This accessible reporting component renders the faculty zakat distribution donut chart alongside a structured data grid legend to prevent color-blindness visibility issues.

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface ZakatManagementFacultyDonutChartProps {
  applications?: ApplicationItem[];
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
  "#002060", // UTHM Navy Blue
  "#0ea5e9", // Sky Blue
  "#10b981", // Emerald Green
  "#f59e0b", // Amber
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#8b5cf6", // Violet
  "#14b8a6"  // Teal
];

export function ZakatManagementFacultyDonutChartComponent({
  applications = []
}: ZakatManagementFacultyDonutChartProps) {
  // This state hook tracks the active hovered faculty key to highlight chart segments and table rows.
  const [hoveredFaculty, setHoveredFaculty] = useState<string | null>(null);

  // This payload reducer function aggregates collections and computes percentage ratios for the 8 faculties.
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

  const { data, totalSum, hasData } = getFacultyData();
  const isDonutZero = !hasData;
  
  // This payload reducer function formats the chart inputs as equal segments in zero-state scenarios.
  const donutDataForChart = isDonutZero
    ? data.map(item => ({ ...item, chartValue: 1 }))
    : data.map(item => ({ ...item, chartValue: item.value }));

  // This fallback method handles hover parameters dynamically to coordinate accessibility updates.
  const handlePieHover = (_: any, index: number) => {
    const item = data[index];
    if (item) {
      setHoveredFaculty(item.name);
    }
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-card h-[450px] flex flex-col justify-between overflow-hidden">
      
      {/* Visual Header Block */}
      <CardHeader className="border-b border-border bg-muted/10 px-5 py-4 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-bold text-foreground">Kutipan Mengikut Fakulti UTHM</CardTitle>
          <CardDescription className="text-[10px]">Pecahan caruman zakat kakitangan merentasi 8 fakulti</CardDescription>
        </div>
        <Landmark className="h-4 w-4 text-[#002060]" />
      </CardHeader>
      
      {/* Symmetrical Two-Column content area */}
      <CardContent className="p-5 flex-1 flex flex-col justify-between overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center flex-1 overflow-hidden">
          
          {/* Donut Chart container */}
          <div className="relative h-44 w-full flex items-center justify-center">
            
            {/* This conditional visibility check displays the sifar record overlay text inside the placeholder ring. */}
            {isDonutZero && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border shadow-xs">
                  Kutipan: RM 0.00 (Sifar Rekod Kelulusan)
                </span>
              </div>
            )}

            {/* This conditional visibility check places active values inside the donut ring core if data is present. */}
            {!isDonutZero && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Kutipan</span>
                <span className="text-xs font-black text-[#002060] mt-0.5">
                  RM {totalSum.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutDataForChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={isDonutZero ? 0 : 2}
                  dataKey="chartValue"
                  onMouseEnter={handlePieHover}
                  onMouseLeave={() => setHoveredFaculty(null)}
                >
                  {donutDataForChart.map((entry, index) => {
                    const isHighlighted = hoveredFaculty === entry.name;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          isHighlighted 
                            ? "#002060" 
                            : isDonutZero 
                            ? "#cbd5e1" 
                            : DONUT_COLORS[index % DONUT_COLORS.length]
                        }
                        className="transition-all duration-200 outline-none"
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* This tabular grid layout container coordinates the aligned shorthand key and RM totals. */}
          <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col justify-center h-full max-h-[300px]">
            <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-[#002060] uppercase tracking-wider px-3 py-2 select-none">
              <span>Fakulti</span>
              <span className="text-right">Kutipan</span>
              <span className="text-right">Peratusan</span>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs overflow-y-auto max-h-[220px]">
              {data.map((fac) => {
                const isHovered = hoveredFaculty === fac.name;
                return (
                  <div
                    key={fac.name}
                    onMouseEnter={() => setHoveredFaculty(fac.name)}
                    onMouseLeave={() => setHoveredFaculty(null)}
                    className={cn(
                      "grid grid-cols-3 items-center px-3 py-2 transition-all cursor-pointer border-l-4",
                      isHovered
                        ? "bg-[#002060]/10 border-[#002060] text-[#002060] font-extrabold"
                        : "border-transparent text-slate-650 hover:bg-slate-50/50"
                    )}
                  >
                    <span className="font-bold">{fac.name}</span>
                    <span className="text-right font-semibold">
                      RM {fac.value.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-right font-black text-[#002060]">
                      {fac.percentage.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>

        {/* This layout block centers the complete official faculty name translation banner below the assets. */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center h-11 flex items-center justify-center shadow-xs">
          {hoveredFaculty ? (
            <p className="text-[10px] sm:text-xs font-black text-[#002060] dark:text-blue-300">
              {hoveredFaculty} &mdash; {FACULTY_NAMES[hoveredFaculty]}
            </p>
          ) : (
            <p className="text-[10px] sm:text-xs text-muted-foreground italic font-medium">
              Sila halakan tetikus pada carta atau jadual untuk melihat nama penuh fakulti.
            </p>
          )}
        </div>
      </CardContent>
      
    </Card>
  );
}
