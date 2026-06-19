// src/components/zakat/ZakatStaffDashboardTabsContainerComponent.tsx
"use client";

import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ZakatStaffInformativeNisabHaulCardComponent } from "./ZakatStaffInformativeNisabHaulCardComponent";
import { ZakatStaffSalaryDeductionApplicationFormComponent } from "./ZakatStaffSalaryDeductionApplicationFormComponent";
import { ZakatStaffProfileComponent } from "./ZakatStaffProfileComponent";
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

// This main interface hub mounts the vertical institutional branding logos and uses tab states to transition between information feeds, application components, and profiles.
export function ZakatStaffDashboardTabsContainerComponent({ user }: ZakatStaffDashboardTabsContainerProps) {
  return (
    // This wrapper restricts wider screens and triggers slide animations.
    <div className="w-full max-w-3xl flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Brand header card including corporate stacked logos and system title */}
      <Card className="border border-border/80 shadow-xl bg-white dark:bg-card/95 w-full">
        
        {/* Institutional header area containing the brand identity logos and system labels */}
        <div className="border-b border-border bg-muted/10 px-6 py-8 flex flex-col items-center text-center space-y-4">
          
          <div className="flex flex-col items-center justify-center w-full gap-3">
            {/* The primary UTHM brand identity logo display */}
            <Image
              src="/image_bb5246.png"
              alt="Logo UTHM"
              width={240}
              height={80}
              priority
              className="h-16 w-auto object-contain"
              style={{ width: "auto" }}
            />
            
            {/* The secondary UTHM Zakat department logo display aligned underneath */}
            <Image
              src="/image_bb546b.png"
              alt="Logo Zakat UTHM"
              width={180}
              height={60}
              priority
              className="h-10 w-auto object-contain mt-2"
              style={{ width: "auto" }}
            />
            
            {/* Title header block for the salary deduction application */}
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

        {/* Dynamic page context displaying the workspace tabs content */}
        <CardContent className="p-6 md:p-8">
          
          {/* Main workspace navigation tabs */}
          <Tabs defaultValue="info" className="space-y-6">
            
            {/* Center aligned triggers list for cycling through dashboard modules */}
            <div className="flex justify-center border-b pb-4">
              <TabsList className="bg-muted/65 p-1 rounded-xl">
                {/* The informational feed tab trigger button */}
                <TabsTrigger value="info">
                  <div className="flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    <span>Maklumat Terkini</span>
                  </div>
                </TabsTrigger>
                {/* The application submission form tab trigger button */}
                <TabsTrigger value="form">
                  <div className="flex items-center gap-1.5">
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>Borang Permohonan</span>
                  </div>
                </TabsTrigger>
                {/* The employee profile details tab trigger button */}
                <TabsTrigger value="profile">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Profil Peribadi</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Informative indicators for Nisab levels and Haul timelines */}
            <TabsContent value="info" className="focus-visible:outline-none">
              <ZakatStaffInformativeNisabHaulCardComponent gajiSemasa={user.gajiSemasa || null} />
            </TabsContent>

            {/* Interactive salary deduction submission form */}
            <TabsContent value="form" className="focus-visible:outline-none">
              <ZakatStaffSalaryDeductionApplicationFormComponent user={user} />
            </TabsContent>

            {/* Employee profile template editor panel */}
            <TabsContent value="profile" className="focus-visible:outline-none">
              <ZakatStaffProfileComponent
                defaultValues={{
                  namaPenuh: user.name ?? "",
                  noPekerja: user.noPekerja ?? "",
                  noKP: user.noKP ?? "",
                  gajiSemasa: user.gajiSemasa ? String(user.gajiSemasa) : "",
                  alamatRumah: user.alamatRumah ?? "",
                }}
              />
            </TabsContent>

          </Tabs>

        </CardContent>

      </Card>

    </div>
  );
}
