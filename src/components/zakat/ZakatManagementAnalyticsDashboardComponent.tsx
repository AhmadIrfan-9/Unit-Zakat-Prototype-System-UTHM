// This dashboard element manages the interactive faculty collection donut charts and plots multi-year transactional trends with historical filters.

"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Users, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// This list maps the raw faculty acronyms to their official Malay Dewan Bahasa dan Pustaka designations.
const FACULTY_TRANSLATIONS: Record<string, string> = {
  FKAAB: "Fakulti Kejuruteraan Awam dan Alam Bina",
  FKEE: "Fakulti Kejuruteraan Elektrik dan Elektronik",
  FKMP: "Fakulti Kejuruteraan Mekanikal dan Pembuatan",
  FPTV: "Fakulti Pendidikan Teknik dan Vokasional",
  FPTP: "Fakulti Pengurusan Teknologi dan Perniagaan",
  FAST: "Fakulti Sains Gunaan dan Teknologi",
  FSKTM: "Fakulti Sains Komputer dan Teknologi Maklumat",
  FTK: "Fakulti Teknologi Kejuruteraan",
};

// This list provides distinct theme color values matching the corporate navy environment for the donut charts.
const DONUT_COLORS = [
  "#002060",
  "#0c3893",
  "#1d52c6",
  "#4374e0",
  "#7496eb",
  "#9db6f2",
  "#c6d6f8",
  "#eef3fd"
];

interface AnalyticsDashboardProps {
  stats: {
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    approvedAmount: number;
  };
  chartData: {
    period: string;
    total: number;
  }[];
  facultyMetrics?: {
    faculty: string;
    value: number;
  }[];
  historicalTrends?: {
    year: string;
    total: number;
  }[];
}

export function ZakatManagementAnalyticsDashboardComponent({
  stats,
  chartData,
  facultyMetrics = [],
  historicalTrends = []
}: AnalyticsDashboardProps) {
  // This state hook manages the segmented toggle button between full history and recent five-year frames.
  const [timeframe, setTimeframe] = useState<"ALL" | "5YEARS">("ALL");

  // This fallback array acts as a default placeholder dataset for the UTHM faculties.
  const defaultFacultyData = [
    { faculty: "FKAAB", value: 34200.00 },
    { faculty: "FKEE", value: 28900.00 },
    { faculty: "FKMP", value: 31200.00 },
    { faculty: "FPTV", value: 18500.00 },
    { faculty: "FPTP", value: 22400.00 },
    { faculty: "FAST", value: 19800.00 },
    { faculty: "FSKTM", value: 27600.00 },
    { faculty: "FTK", value: 15400.00 },
  ];

  // This fallback array acts as a default placeholder dataset for the historical trends chart.
  const defaultHistoricalData = [
    { year: "2020", total: 110000 },
    { year: "2021", total: 135000 },
    { year: "2022", total: 158000 },
    { year: "2023", total: 182000 },
    { year: "2024", total: 198000 },
    { year: "2025", total: 220000 },
    { year: "2026", total: 245000 },
  ];

  const displayFacultyData = facultyMetrics.length > 0 ? facultyMetrics : defaultFacultyData;
  const rawHistoricalData = historicalTrends.length > 0 ? historicalTrends : defaultHistoricalData;

  const fiveYearKeys = ["2022", "2023", "2024", "2025", "2026"];

  // This query filter restricts the displayed historical metrics to the 5 most recent sequential cycles.
  const displayHistoricalData = timeframe === "5YEARS"
    ? rawHistoricalData.filter(d => fiveYearKeys.includes(d.year))
    : rawHistoricalData;

  // This config sets up the tooltip visual styling maps inside the donut graph wrapper.
  const donutConfig = {
    value: {
      label: "Jumlah Caruman",
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* ── KPI METRICS CARDS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Monthly Approved Collections */}
        <Card className="border border-border shadow-xs bg-white dark:bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Caruman Bulanan</span>
              <h3 className="text-xl md:text-2xl font-black text-[#002060]">
                RM {stats.approvedAmount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Diluluskan
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Pending Review */}
        <Card className="border border-[#002060]/20 shadow-xs bg-white dark:bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Menunggu Semakan</span>
              <h3 className="text-xl md:text-2xl font-black text-amber-600">
                {stats.totalPending}
              </h3>
              <p className="text-[10px] text-amber-600 font-medium">Borang memerlukan pengesahan</p>
            </div>
            <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
              <AlertCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Approved Count */}
        <Card className="border border-border shadow-xs bg-white dark:bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Permohonan Diluluskan</span>
              <h3 className="text-xl md:text-2xl font-black text-emerald-600">
                {stats.totalApproved}
              </h3>
              <p className="text-[10px] text-muted-foreground">Aktif dalam sistem penggajian</p>
            </div>
            <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Rejected Count */}
        <Card className="border border-border shadow-xs bg-white dark:bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Permohonan Ditolak</span>
              <h3 className="text-xl md:text-2xl font-black text-destructive">
                {stats.totalRejected}
              </h3>
              <p className="text-[10px] text-muted-foreground">Memerlukan pembetulan kakitangan</p>
            </div>
            <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-destructive">
              <XCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── CHARTS INTERACTIVE GRID ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: Donut Chart Section */}
        <Card className="border border-border shadow-md bg-white dark:bg-card flex flex-col justify-between">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#002060]" />
              <div>
                <CardTitle className="text-base font-bold text-foreground">Kutipan Zakat Mengikut Fakulti UTHM</CardTitle>
                <CardDescription className="text-xs">
                  Taburan caruman zakat bulanan yang disahkan mengikut fakulti pengajian
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col justify-center">
            <div className="h-80 w-full relative">
              <ChartContainer config={donutConfig} className="mx-auto min-h-80">
                <PieChart>
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      const dewanBahasaLabel = FACULTY_TRANSLATIONS[name] || name;
                      const numericValue = typeof value === "number" ? value : Number(value) || 0;
                      return [`RM ${numericValue.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`, dewanBahasaLabel];
                    }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Pie
                    data={displayFacultyData}
                    dataKey="value"
                    nameKey="faculty"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {displayFacultyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        className="stroke-background hover:opacity-85 transition-opacity outline-none"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            {/* Legend block display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 border-t pt-4 text-[10px]">
              {displayFacultyData.map((item, idx) => (
                <div key={item.faculty} className="flex items-center gap-1.5" title={FACULTY_TRANSLATIONS[item.faculty]}>
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                  />
                  <span className="font-bold text-foreground">{item.faculty}</span>
                  <span className="text-muted-foreground ml-auto">
                    RM {item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Line Chart Section */}
        <Card className="border border-border shadow-md bg-white dark:bg-card flex flex-col justify-between">
          <CardHeader className="border-b border-border/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#002060]" />
              <div>
                <CardTitle className="text-base font-bold text-foreground">Trend Kutipan Zakat Tahunan UTHM</CardTitle>
                <CardDescription className="text-xs">
                  Analisis kumulatif caruman tahunan mengikut kitaran penggajian kakitangan
                </CardDescription>
              </div>
            </div>

            {/* Segmented Toggle controls */}
            <div className="inline-flex items-center gap-1 border rounded-lg p-1 bg-muted/40 self-start sm:self-auto outline-2 outline-[#002060]">
              <button
                type="button"
                onClick={() => setTimeframe("ALL")}
                className={cn(
                  "px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer",
                  timeframe === "ALL"
                    ? "bg-[#002060] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Semua Sejarah
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("5YEARS")}
                className={cn(
                  "px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer",
                  timeframe === "5YEARS"
                    ? "bg-[#002060] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                5 Tahun Terkini
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col justify-center">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayHistoricalData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                  <XAxis
                    dataKey="year"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `RM ${val >= 1000 ? `${val / 1000}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                    formatter={(val: any) => {
                      const numericVal = typeof val === "number" ? val : Number(val) || 0;
                      return [`RM ${numericVal.toLocaleString("en-MY")}`, "Jumlah Caruman"];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#002060"
                    strokeWidth={3}
                    dot={{ r: 4.5, stroke: "#002060", strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
