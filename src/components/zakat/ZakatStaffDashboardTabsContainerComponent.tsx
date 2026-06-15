// src/components/zakat/ZakatStaffDashboardTabsContainerComponent.tsx
"use client";

import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ZakatStaffInformativeNisabHaulCardComponent } from "./ZakatStaffInformativeNisabHaulCardComponent";
import { ZakatStaffSalaryDeductionApplicationFormComponent } from "./ZakatStaffSalaryDeductionApplicationFormComponent";
import { ZakatStaffProfileManagementCardComponent } from "./ZakatStaffProfileManagementCardComponent";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, FileCheck2, Info } from "lucide-react";

interface AuthenticatedUserProps {
  name?: string | null;
  email?: string | null;
  noPekerja?: string | null;
  noKP?: string | null;
  gajiSemasa?: number | null;
  alamatRumah?: string | null;
}

interface ZakatStaffDashboardTabsContainerProps {
  user: AuthenticatedUserProps;
}

// This primary container component utilizes tab navigation to organize and switch between the informative widget views, the zakat application form, and user profile panels.
export function ZakatStaffDashboardTabsContainerComponent({ user }: ZakatStaffDashboardTabsContainerProps) {
  return (
    <div className="w-full max-w-3xl flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* ── HEADER PANEL WITH NATIVE UTHM LOGO AND SYSTEM TITLE ──────────────── */}
      <Card className="border border-border/80 shadow-xl bg-white dark:bg-card/95 w-full">
        
        {/* Brand layout title and logo wrapper */}
        <div className="border-b border-border bg-muted/10 px-6 py-8 flex flex-col items-center text-center space-y-4">
          
          <div className="flex flex-col items-center justify-center w-full gap-3">
            {/* Native logo container sizing */}
            <Image
              src="/logo.png"
              alt="Logo UTHM"
              width={280}
              height={80}
              priority
              className="h-20 w-auto object-contain mix-blend-multiply dark:mix-blend-normal"
            />
            
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#002060]">
                Sistem Caruman Zakat Gaji UTHM
              </h1>
              <p className="text-xs text-muted-foreground font-semibold">
                Borang Kebenaran Potongan Gaji Bulanan Kakitangan
              </p>
            </div>
          </div>

        </div>

        {/* Tab workspace containers */}
        <CardContent className="p-6 md:p-8">
          
          {/* Main workspace navigation tabs */}
          <Tabs defaultValue="info" className="space-y-6">
            
            {/* Centered navigation tab bar items */}
            <div className="flex justify-center border-b pb-4">
              <TabsList className="bg-muted/65 p-1 rounded-xl">
                <TabsTrigger value="info">
                  <div className="flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    <span>Maklumat Terkini</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="form">
                  <div className="flex items-center gap-1.5">
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>Borang Permohonan</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="profile">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Profil Peribadi</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content Tab 1: Informative indicators for Nisab and Haul */}
            <TabsContent value="info" className="focus-visible:outline-none">
              <ZakatStaffInformativeNisabHaulCardComponent gajiSemasa={user.gajiSemasa || null} />
            </TabsContent>

            {/* Content Tab 2: The interactive deduction submission form */}
            <TabsContent value="form" className="focus-visible:outline-none">
              <ZakatStaffSalaryDeductionApplicationFormComponent user={user} />
            </TabsContent>

            {/* Content Tab 3: Blank profile template view and guidances */}
            <TabsContent value="profile" className="focus-visible:outline-none">
              <ZakatStaffProfileManagementCardComponent />
            </TabsContent>

          </Tabs>

        </CardContent>

      </Card>

    </div>
  );
}
