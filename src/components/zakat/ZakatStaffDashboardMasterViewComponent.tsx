// This primary workspace shell tracks active tab scopes to dynamically swap content panes and enforce strict layout containment rules.

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ZakatGlobalMainNavbarLayoutComponent } from "./ZakatGlobalMainNavbarLayoutComponent";
import { ZakatStaffInformativeNisabHaulCardComponent } from "./ZakatStaffInformativeNisabHaulCardComponent";
import { ZakatStaffSalaryDeductionApplicationFormComponent } from "./ZakatStaffSalaryDeductionApplicationFormComponent";
import { ZakatStaffProfileManagementCardComponent } from "./ZakatStaffProfileManagementCardComponent";
import { ZakatManagementAnalyticsReportingTabComponent } from "./ZakatManagementAnalyticsReportingTabComponent";
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

export function ZakatStaffDashboardMasterViewComponent({ user }: ZakatStaffDashboardMasterViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // This state hook manages the active navigation tab key.
  const [activeTab, setActiveTab] = useState<string>("info");

  // This hook synchronises active tabs with the browser url parameters to prevent visual leakage.
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["info", "form", "profile", "mohon", "analisis"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // This helper function handles tab changes and pushes parameters to browser navigation history.
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/zakat?tab=${tab}`, { scroll: false });
  };

  // This rendering ternary operation matches URL parameters to strict view scopes to prevent tab leakage.
  const viewScope = activeTab === "form" || activeTab === "mohon"
    ? "mohon"
    : activeTab === "profile"
    ? "profile"
    : "analisis";

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col font-sans antialiased pb-10">
      
      {/* This navbar layout component renders the responsive top-aligned navigation headers. */}
      <ZakatGlobalMainNavbarLayoutComponent 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        user={user} 
      />

      {/* This header banner displays welcome metadata and the restored logo inside the right corner. */}
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
          
          {/* This branding container anchors the restored logo cleanly inside the right corner. */}
          <div className="shrink-0 flex items-center justify-start sm:justify-end">
            <Image
              src="/6232c1fe-be22-4a39-89b1-0eb508f91e72.png"
              alt="Logo Zakat UTHM"
              width={130}
              height={130}
              priority
              className="h-24 w-auto object-contain bg-white p-2.5 rounded-xl shadow-xs select-none"
            />
          </div>
        </div>
      </section>

      {/* This main content layout area switches views based on the dynamic conditional scope structure. */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* This conditional switch block maps parameters to toggle form, analytics, or profile views. */}
        {viewScope === "mohon" ? (
          <div className="space-y-8">
            {/* This structural layout card displays the Nisab thresholds and Haul conditions. */}
            <ZakatStaffInformativeNisabHaulCardComponent gajiSemasa={user.gajiSemasa || null} />

            {/* This structural layout card displays the salary deduction submission form. */}
            <div className="w-full max-w-3xl mx-auto">
              <Card className="border border-border/80 shadow-xl bg-white dark:bg-card/95 p-6 md:p-8">
                <ZakatStaffSalaryDeductionApplicationFormComponent user={user} />
              </Card>
            </div>
          </div>
        ) : viewScope === "analisis" ? (
          <div className="w-full">
            {/* This structural layout card displays side-by-side faculty collection and annual trend charts. */}
            <ZakatManagementAnalyticsReportingTabComponent applications={[]} chartData={[]} />
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto">
            {/* This structural layout card displays the profile details form on the top layer. */}
            <ZakatStaffProfileManagementCardComponent />
          </div>
        )}

      </main>
    </div>
  );
}
