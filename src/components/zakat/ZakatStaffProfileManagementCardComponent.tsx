// src/components/zakat/ZakatStaffProfileManagementCardComponent.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, User, FileText } from "lucide-react";

// This profile interface renders blank employee data forms alongside a dedicated reference box showing examples of valid input data structures.
export function ZakatStaffProfileManagementCardComponent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-in fade-in duration-300">
      
      {/* LEFT PANEL: Blank employee data form fields representation */}
      <div className="md:col-span-2 space-y-4">
        <div className="border-b border-border pb-2 flex items-center gap-2">
          <User className="h-5 w-5 text-[#002060]" />
          <h2 className="text-sm font-bold tracking-wider text-[#002060] uppercase">
            Borang Maklumat Profil Kakitangan (Templat Kosong)
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="font-semibold text-xs text-[#002060]">Nama Penuh</Label>
            <Input placeholder="" disabled className="bg-muted/10 border-muted text-xs h-9 cursor-not-allowed" />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-xs text-[#002060]">No. Kad Pengenalan</Label>
            <Input placeholder="" disabled className="bg-muted/10 border-muted text-xs h-9 cursor-not-allowed" />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-xs text-[#002060]">No. Pekerja</Label>
            <Input placeholder="" disabled className="bg-muted/10 border-muted text-xs h-9 cursor-not-allowed" />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-xs text-[#002060]">Umur</Label>
            <Input placeholder="" disabled className="bg-muted/10 border-muted text-xs h-9 cursor-not-allowed" />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-xs text-[#002060]">Gaji Semasa (RM)</Label>
            <Input placeholder="" disabled className="bg-muted/10 border-muted text-xs h-9 cursor-not-allowed" />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-xs text-[#002060]">No. Telefon</Label>
            <Input placeholder="" disabled className="bg-muted/10 border-muted text-xs h-9 cursor-not-allowed" />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label className="font-semibold text-xs text-[#002060]">Alamat Rumah</Label>
            <Textarea placeholder="" disabled className="bg-muted/10 border-muted text-xs cursor-not-allowed" rows={2} />
          </div>

          <div className="grid grid-cols-3 sm:col-span-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <Label className="font-semibold text-xs text-[#002060]">Poskod</Label>
              <Input placeholder="" disabled className="bg-muted/10 border-muted text-xs h-9 cursor-not-allowed" />
            </div>

            <div className="space-y-1.5 col-span-1">
              <Label className="font-semibold text-xs text-[#002060]">Bandar</Label>
              <Input placeholder="" disabled className="bg-muted/10 border-muted text-xs h-9 cursor-not-allowed" />
            </div>

            <div className="space-y-1.5 col-span-1">
              <Label className="font-semibold text-xs text-[#002060]">Negeri</Label>
              <Input placeholder="" disabled className="bg-muted/10 border-muted text-xs h-9 cursor-not-allowed" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Reference box showing valid formatted profile placeholder guides */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-[#002060]" />
          <h2 className="text-sm font-bold tracking-wider text-[#002060] uppercase">
            Panduan & Contoh
          </h2>
        </div>

        <Card className="border border-border/80 shadow-md bg-white dark:bg-card">
          <CardHeader className="bg-[#002060]/5 border-b pb-3 flex flex-row items-center gap-2">
            <FileText className="h-4 w-4 text-[#002060]" />
            <CardTitle className="text-xs font-bold text-[#002060] uppercase tracking-wide">
              Contoh Profil Sah UTHM
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5 text-xs">
            <div className="space-y-1 border-b pb-2 border-border/40">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Nama Penuh</span>
              <p className="font-semibold text-foreground">Ahmad bin Abdullah</p>
            </div>
            <div className="space-y-1 border-b pb-2 border-border/40">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">No. Kad Pengenalan</span>
              <p className="font-semibold text-foreground font-mono">890520015432</p>
            </div>
            <div className="space-y-1 border-b pb-2 border-border/40">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">No. Pekerja / Umur</span>
              <p className="font-semibold text-foreground">STAFF001 (37 Tahun)</p>
            </div>
            <div className="space-y-1 border-b pb-2 border-border/40">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Gaji Semasa</span>
              <p className="font-bold text-[#002060] dark:text-blue-300">RM 4,500.00</p>
            </div>
            <div className="space-y-1 border-b pb-2 border-border/40">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">No. Telefon</span>
              <p className="font-semibold text-foreground font-mono">012-3456789</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Alamat Kediaman</span>
              <p className="font-semibold text-foreground leading-relaxed">
                No. 12, Jalan Universiti, Taman Parit Raja, 86400 Parit Raja, Johor
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
