// This staff workspace interface tracks active layout scopes to exclusively manage public news updates, application requests, and personal user profiles.

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ZakatGlobalMainNavbarLayoutComponent } from "./ZakatGlobalMainNavbarLayoutComponent";
import { ZakatStaffInformativeNisabHaulCardComponent } from "./ZakatStaffInformativeNisabHaulCardComponent";
import { ZakatStaffSalaryDeductionApplicationFormComponent } from "./ZakatStaffSalaryDeductionApplicationFormComponent";
import { ZakatStaffProfileManagementCardComponent } from "./ZakatStaffProfileManagementCardComponent";
import { ZakatStaffNewsAnnouncementsComponent } from "./ZakatStaffNewsAnnouncementsComponent";
import { Card } from "@/components/ui/card";

// This data model definition outlines the structured properties of the authenticated staff member.
interface AuthenticatedUserProps {
  name?: string | null;
  email?: string | null;
  noPekerja?: string | null;
  noKP?: string | null;
  gajiSemasa?: number | null;
  alamatRumah?: string | null;
  role?: string | null;
}

// This data model definition describes the parameters expected by the staff dashboard view.
interface ZakatStaffDashboardMasterViewProps {
  user: AuthenticatedUserProps;
}

export function ZakatStaffDashboardMasterViewComponent({ user }: ZakatStaffDashboardMasterViewProps) {
  // This navigation hook provides access to routing features within Next.js.
  const router = useRouter();

  // This navigation hook retrieves query parameter parameters from the active window URL.
  const searchParams = useSearchParams();
  
  // This lifecycle state hook manages the active navigation tab key.
  const [activeTab, setActiveTab] = useState<string>("info");

  // This lifecycle state hook redirects administrative managers to the correct dashboard path.
  useEffect(() => {
    if (user.role === "MANAGEMENT_STAFF") {
      const tabParam = searchParams.get("tab") || "proses";
      router.push(`/dashboard/pengurusan?tab=${tabParam}`);
    }
  }, [user.role, router, searchParams]);

  // This lifecycle state hook synchronises active tabs with the browser url parameters to prevent visual leakage.
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["info", "home", "news", "form", "mohon", "profile"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // This helper function handles tab changes and pushes parameters to browser navigation history.
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/zakat?tab=${tab}`, { scroll: false });
  };

  // This fallback variable model determines the active view layout based on the active tab state.
  const viewScope = activeTab === "form" || activeTab === "mohon"
    ? "mohon"
    : activeTab === "profile"
    ? "profile"
    : "home";

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col font-sans antialiased pb-10">
      
      {/* This navbar layout component renders the responsive top-aligned navigation headers. */}
      <ZakatGlobalMainNavbarLayoutComponent 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        user={user} 
      />

      {/* This responsive asset layout wrapper structures the corporate welcome hero banner. */}
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

      {/* This major structural component card provides standard boundary dimensions of max-w-7xl for the staff layout. */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* This conditional rendering ternary wrapper renders the user profile card. */}
        {viewScope === "profile" && (
          <div className="w-full max-w-3xl mx-auto">
            <ZakatStaffProfileManagementCardComponent />
          </div>
        )}

        {/* This conditional rendering ternary wrapper renders the overview and news panels. */}
        {viewScope === "home" && (
          <div className="space-y-8">
            <ZakatStaffInformativeNisabHaulCardComponent gajiSemasa={user.gajiSemasa || null} />
            
            {/* This conditional rendering ternary wrapper displays the news announcements card grid. */}
            {(activeTab === "info" || activeTab === "news" || activeTab === "home") && (
              <ZakatStaffNewsAnnouncementsComponent />
            )}
          </div>
        )}

        {/* This conditional rendering ternary wrapper renders the deduction submission form. */}
        {viewScope === "mohon" && (
          <div className="space-y-8">
            <ZakatStaffInformativeNisabHaulCardComponent gajiSemasa={user.gajiSemasa || null} />
            
            <div className="w-full max-w-3xl mx-auto">
              <Card className="border border-border/80 shadow-xl bg-white dark:bg-card/95 p-6 md:p-8">
                <ZakatStaffSalaryDeductionApplicationFormComponent user={user} />
              </Card>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
