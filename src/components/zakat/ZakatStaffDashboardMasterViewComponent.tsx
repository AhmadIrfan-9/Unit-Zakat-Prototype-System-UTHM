// src/components/zakat/ZakatStaffDashboardMasterViewComponent.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ZakatGlobalMainNavbarLayoutComponent } from "./ZakatGlobalMainNavbarLayoutComponent";
import { ZakatStaffInformativeNisabHaulCardComponent } from "./ZakatStaffInformativeNisabHaulCardComponent";
import { ZakatStaffSalaryDeductionApplicationFormComponent } from "./ZakatStaffSalaryDeductionApplicationFormComponent";
import { ZakatStaffProfileManagementCardComponent } from "./ZakatStaffProfileManagementCardComponent";
import { Card } from "@/components/ui/card";

interface AuthenticatedUserProps {
  name?: string | null;
  email?: string | null;
  noPekerja?: string | null;
  noKP?: string | null;
  gajiSemasa?: number | null;
  alamatRumah?: string | null;
  role?: string | null;
}

interface ZakatStaffDashboardMasterViewProps {
  user: AuthenticatedUserProps;
}

// This staff workspace manager prints a navy greeting banner embedded with the zakat logo, tracks threshold info cards, and wraps the interactive application view.
export function ZakatStaffDashboardMasterViewComponent({ user }: ZakatStaffDashboardMasterViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Manage navigation tab states based on query parameters.
  const [activeTab, setActiveTab] = useState<string>("info");

  // Synchronise active tabs with the browser url queries.
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["info", "form", "profile"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Coordinate active tab states when user selects tab pills.
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/zakat?tab=${tab}`, { scroll: false });
  };

  return (
    // Outer flex wrapper matching full height.
    <div className="min-h-screen bg-muted/30 flex flex-col font-sans antialiased pb-10">
      
      {/* Sticky top navbar wrapper */}
      <ZakatGlobalMainNavbarLayoutComponent 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        user={user} 
      />

      {/* Welcome Hero Banner: full-bleed background styled in UTHM corporate Navy Blue with the Zakat Logo on the right */}
      <section className="w-full bg-[#002060] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#002060]/10 shadow-md">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-black tracking-widest text-[#002060] bg-white rounded-full px-3 py-1 inline-block">
              Portal Kakitangan UTHM
            </p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Selamat Datang, {user.name || "Kakitangan UTHM"}
            </h1>
            <p className="text-xs md:text-sm text-gray-200 font-medium">
              Sistem Caruman Zakat Gaji UTHM &bull; Sesi Potongan Gaji Kakitangan Aktif
            </p>
          </div>
          
          {/* Zakat UTHM Logo displayed inside the far-right corner, white-accented */}
          <div className="shrink-0 flex items-center justify-start sm:justify-end">
            <Image
              src="/image_bb546b.png"
              alt="Logo Zakat UTHM"
              width={150}
              height={50}
              priority
              className="h-12 w-auto object-contain brightness-0 invert"
            />
          </div>
        </div>
      </section>

      {/* Main dashboard content sections wrapped in safety bounding margins */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Metrics Row: Side-by-side Nisab monthly limits and Haul rules */}
        <ZakatStaffInformativeNisabHaulCardComponent gajiSemasa={user.gajiSemasa || null} />

        {/* Main Workspace Area: Constrain content to a max-width of max-w-3xl */}
        <div className="w-full max-w-3xl mx-auto">
          {activeTab === "form" && (
            <Card className="border border-border/80 shadow-xl bg-white dark:bg-card/95 p-6 md:p-8">
              <ZakatStaffSalaryDeductionApplicationFormComponent user={user} />
            </Card>
          )}

          {activeTab === "profile" && (
            <ZakatStaffProfileManagementCardComponent />
          )}

          {activeTab === "info" && (
            <Card className="border border-border/80 shadow-md bg-white dark:bg-card/95 p-6 md:p-8 text-xs text-muted-foreground leading-relaxed space-y-4">
              <h3 className="font-bold text-sm text-[#002060] dark:text-blue-300">Panduan Ringkas Pengurusan Caruman Zakat Gaji</h3>
              <p>
                Sistem ini membolehkan kakitangan Universiti Tun Hussein Onn Malaysia (UTHM) menguruskan potongan zakat bulanan terus dari slip gaji anda.
              </p>
              <p>
                Sila ke tab <strong className="text-foreground">Borang Permohonan</strong> jika anda bersedia untuk mendaftar, menambah, atau mengubah kaedah potongan zakat bulanan semasa anda.
              </p>
              <p>
                Jika terdapat sebarang maklumat peribadi yang salah, sila hubungi pentadbir sistem melalui emel rasmi yang tertera di bahagian bawah borang permohonan.
              </p>
            </Card>
          )}
        </div>

      </main>
    </div>
  );
}
