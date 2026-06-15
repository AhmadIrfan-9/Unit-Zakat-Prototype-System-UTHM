// src/components/zakat/ZakatStaffInformativeNisabHaulCardComponent.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Coins, CalendarRange, CheckCircle2, Info } from "lucide-react";

interface ZakatStaffInformativeNisabHaulCardProps {
  gajiSemasa: number | null;
}

// This module displays current calculation rules by placing the monthly Nisab metrics and yearly Haul tracking information together inside unified informative widgets.
export function ZakatStaffInformativeNisabHaulCardComponent({ gajiSemasa }: ZakatStaffInformativeNisabHaulCardProps) {
  const NISAB_BULANAN = 2150.00;
  const isWajib = (gajiSemasa || 0) >= NISAB_BULANAN;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in duration-300">
      
      {/* CARD 1: NISAB bulanan monitoring widgets */}
      <Card className="border border-border/80 shadow-md bg-white dark:bg-card overflow-hidden">
        <CardHeader className="bg-[#002060]/5 border-b pb-3.5 flex flex-row items-center gap-3">
          <div className="p-2 bg-[#002060]/10 rounded-lg text-[#002060]">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">Paras Nisab Bulanan</CardTitle>
            <CardDescription className="text-[10px]">Nilai minimum kelayakan zakat bulanan</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Kadar Nisab (Johor 2026)</span>
              <h3 className="text-2xl font-black text-[#002060] dark:text-blue-300">RM {NISAB_BULANAN.toFixed(2)}</h3>
            </div>
            
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
              isWajib
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800"
            )}>
              {isWajib ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
              {isWajib ? "WAJIB ZAKAT" : "DIGALAKKAN"}
            </span>
          </div>

          <div className="border-t pt-4 space-y-1.5 text-xs text-muted-foreground leading-relaxed">
            <p>
              Gaji bulanan anda: <strong className="text-foreground">RM {gajiSemasa ? gajiSemasa.toFixed(2) : "0.00"}</strong>
            </p>
            <p>
              {isWajib
                ? "Gaji bulanan semasa anda melebihi had paras Nisab. Anda wajib membuat caruman potongan zakat pendapatan bulanan."
                : "Gaji bulanan semasa anda di bawah paras Nisab bulanan. Anda digalakkan menyumbang secara sukarela melalui kaedah potongan tetap."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: HAUL timeline rule definitions */}
      <Card className="border border-border/80 shadow-md bg-white dark:bg-card overflow-hidden">
        <CardHeader className="bg-[#002060]/5 border-b pb-3.5 flex flex-row items-center gap-3">
          <div className="p-2 bg-[#002060]/10 rounded-lg text-[#002060]">
            <CalendarRange className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">Tempoh Haul Zakat</CardTitle>
            <CardDescription className="text-[10px]">Kitaran kelayakan masa pegangan harta</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Syarat Haul Pendapatan</span>
            <h3 className="text-xl font-black text-[#002060] dark:text-blue-300">12 Bulan (1 Tahun Hijriah)</h3>
          </div>

          <div className="border-t pt-4 text-xs text-muted-foreground leading-relaxed space-y-2">
            <p>
              Zakat pendapatan dikira berasaskan jumlah terkumpul hasil pekerjaan sepanjang tempoh setahun penuh (haul) yang melebihi paras Nisab tahunan.
            </p>
            <p className="italic bg-muted/20 p-2 rounded border border-border/40">
              * Nota: Pembayaran zakat bulanan melalui potongan gaji bertujuan mempermudah pembayaran haul tahunan anda secara ansuran berjadual.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
