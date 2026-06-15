// src/components/zakat/ZakatStaffProfileManagementCardComponent.tsx
"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NEGERI_LIST } from "@/lib/validations/zakatDeductionValidationSchema";
import { User } from "lucide-react";

// This profile module removes the external reference panel and places valid employee mock records directly within fully editable input fields and textareas.
export function ZakatStaffProfileManagementCardComponent() {
  return (
    // This wrapper panel renders the profile card in a centered layout.
    <Card className="border border-border/80 shadow-xl bg-white dark:bg-card/95 w-full max-w-3xl mx-auto">
      
      {/* Header section containing the stacked branding logos and title descriptions */}
      <CardHeader className="border-b border-border bg-muted/10 px-6 py-8 flex flex-col items-center">
        {/* The primary UTHM brand identity logo display */}
        <Image
          src="/image_bb5246.png"
          alt="Logo UTHM"
          width={240}
          height={80}
          priority
          className="h-16 w-auto object-contain"
        />
        
        {/* The secondary UTHM Zakat department logo display aligned underneath */}
        <Image
          src="/image_bb546b.png"
          alt="Logo Zakat UTHM"
          width={180}
          height={60}
          priority
          className="h-10 w-auto object-contain mt-2"
        />
        
        <CardTitle className="text-base font-bold text-[#002060] mt-4 flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Profil Kakitangan UTHM</span>
        </CardTitle>
        <CardDescription className="text-xs text-center">
          Maklumat profil peribadi dan butiran pekerjaan berdaftar
        </CardDescription>
      </CardHeader>

      {/* Card content rendering editable inputs initialized with valid UTHM mock employee records */}
      <CardContent className="p-6 md:p-8 space-y-6">
        
        {/* Input fields grid mapping */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Editable full name field */}
          <div className="space-y-1.5">
            <Label htmlFor="profileNamaPenuh" className="font-semibold text-xs text-[#002060]">Nama Penuh</Label>
            <Input id="profileNamaPenuh" defaultValue="Ahmad bin Abdullah" className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9" />
          </div>

          {/* Editable identity card number field */}
          <div className="space-y-1.5">
            <Label htmlFor="profileNoKP" className="font-semibold text-xs text-[#002060]">No. Kad Pengenalan</Label>
            <Input id="profileNoKP" defaultValue="890520015432" className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9" />
          </div>

          {/* Editable staff identification code field */}
          <div className="space-y-1.5">
            <Label htmlFor="profileNoPekerja" className="font-semibold text-xs text-[#002060]">No. Pekerja</Label>
            <Input id="profileNoPekerja" defaultValue="STAFF001" className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9" />
          </div>

          {/* Editable age numeric input field */}
          <div className="space-y-1.5">
            <Label htmlFor="profileUmur" className="font-semibold text-xs text-[#002060]">Umur</Label>
            <Input id="profileUmur" type="number" defaultValue={37} className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9" />
          </div>

          {/* Editable current salary amount text field */}
          <div className="space-y-1.5">
            <Label htmlFor="profileGajiSemasa" className="font-semibold text-xs text-[#002060]">Gaji Semasa (RM)</Label>
            <div className="relative flex items-center rounded-lg border border-input focus-within:ring-2 focus-within:ring-[#002060] transition-all bg-background h-9">
              <span className="absolute left-3 text-xs font-bold text-muted-foreground select-none pointer-events-none">
                RM
              </span>
              <input 
                id="profileGajiSemasa" 
                defaultValue="4500.00" 
                className="w-full bg-transparent pl-10 pr-3 h-full text-xs outline-none rounded-lg focus-visible:ring-[#002060]" 
              />
            </div>
          </div>

          {/* Editable phone number field */}
          <div className="space-y-1.5">
            <Label htmlFor="profileNoTelefon" className="font-semibold text-xs text-[#002060]">No. Telefon</Label>
            <Input id="profileNoTelefon" defaultValue="012-3456789" className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9" />
          </div>

          {/* Editable home address textarea pre-populated with standard address sample */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="profileAlamatRumah" className="font-semibold text-xs text-[#002060]">Alamat Rumah</Label>
            <Textarea 
              id="profileAlamatRumah" 
              defaultValue="No. 12, Jalan Universiti, Taman Parit Raja, 86400 Parit Raja, Johor" 
              className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs" 
              rows={3} 
            />
          </div>

          {/* Editable postal code numerical field */}
          <div className="space-y-1.5 col-span-1">
            <Label htmlFor="profilePoskod" className="font-semibold text-xs text-[#002060]">Poskod</Label>
            <Input id="profilePoskod" defaultValue="86400" className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9" />
          </div>

          {/* Editable city location field */}
          <div className="space-y-1.5 col-span-1">
            <Label htmlFor="profileBandar" className="font-semibold text-xs text-[#002060]">Bandar</Label>
            <Input id="profileBandar" defaultValue="Parit Raja" className="focus-visible:ring-[#002060] focus-visible:border-[#002060] text-xs h-9" />
          </div>

          {/* Editable state dropdown selector field */}
          <div className="space-y-1.5 col-span-1">
            <Label htmlFor="profileNegeri" className="font-semibold text-xs text-[#002060]">Negeri</Label>
            <Select defaultValue="Johor">
              <SelectTrigger id="profileNegeri" className="w-full focus-visible:ring-[#002060] focus-visible:border-[#002060] focus:ring-[#002060] text-xs h-9">
                <SelectValue placeholder="Pilih..." />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {NEGERI_LIST.map((neg) => (
                  <SelectItem key={neg} value={neg}>{neg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Save updates action button container */}
        <div className="pt-4 flex justify-end">
          <Button 
            type="button" 
            className="bg-[#002060] hover:bg-[#002060]/95 text-white font-bold px-6 py-2 text-xs rounded-lg transition-all shadow-sm cursor-pointer"
          >
            Kemaskini Profil
          </Button>
        </div>

      </CardContent>

    </Card>
  );
}
