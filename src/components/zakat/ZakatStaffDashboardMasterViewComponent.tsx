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
  // This navigation hook provides access to Next.js routing methods.
  const router = useRouter();

  // This navigation hook retrieves the active URL query parameters.
  const searchParams = useSearchParams();

  // This state hook manages the currently active tab key for the staff workspace.
  const [activeTab, setActiveTab] = useState<string>("info");

  // This effect hook redirects management staff to the correct executive dashboard route.
  useEffect(() => {
    if (user.role === "MANAGEMENT_STAFF") {
      const tabParam = searchParams.get("tab") ?? "proses";
      router.push(`/dashboard/pengurusan?tab=${tabParam}`);
    }
  }, [user.role, router, searchParams]);

  // This effect hook synchronises the active tab with the browser URL query parameter.
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const validTabs = ["info", "home", "news", "form", "mohon", "profile"];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // This helper function updates both local state and the URL when a tab changes.
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/zakat?tab=${tab}`, { scroll: false });
  };

  // This fallback variable model resolves the active view scope from the current tab state.
  const viewScope =
    activeTab === "form" || activeTab === "mohon"
      ? "mohon"
      : activeTab === "profile"
      ? "profile"
      : "home";

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col font-sans antialiased pb-10">

      {/* This major structural component renders the consolidated top navigation header ribbon. */}
      <ZakatGlobalMainNavbarLayoutComponent
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
      />

      {/* This layout wrapper renders the full-width navy blue corporate welcome hero banner. */}
      <section className="w-full bg-[#002060] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#002060]/10 shadow-md">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-black tracking-widest text-[#002060] bg-white rounded-full px-3 py-1 inline-block">
              Portal Kakitangan UTHM
            </p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Selamat Datang, {user.name ?? "Kakitangan UTHM"}
            </h1>
            <p className="text-xs md:text-sm text-gray-200 font-medium">
              Sistem Caruman Zakat Gaji UTHM &bull; Sesi Potongan Gaji Kakitangan Aktif
            </p>
          </div>

          {/* This layout wrapper anchors the Zakat UTHM logo in the far-right corner of the hero banner. */}
          <div className="shrink-0 flex items-center justify-start sm:justify-end">
            <Image
              src="/6232c1fe-be22-4a39-89b1-0eb508f91e72.png"
              alt="Logo Zakat UTHM"
              width={130}
              height={130}
              priority
              className="h-24 w-auto object-contain bg-white p-2.5 rounded-xl shadow-xs select-none"
              style={{ width: "auto" }}
            />
          </div>
        </div>
      </section>

      {/* This major structural component provides the max-w-7xl container for all staff content panels. */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">

        {/* This conditional rendering block mounts the user profile card exclusively when the profile tab is active. */}
        {viewScope === "profile" && (
          <div className="w-full max-w-3xl mx-auto">
            <ZakatStaffProfileManagementCardComponent />
          </div>
        )}

        {/* This conditional rendering block mounts the news hub and Nisab metric row exclusively when the home tab is active. */}
        {viewScope === "home" && (
          <div className="space-y-8">
            <ZakatStaffInformativeNisabHaulCardComponent gajiSemasa={user.gajiSemasa ?? null} />

            {/* This conditional rendering block displays the news announcements grid only on the home/news/info scope. */}
            {(activeTab === "info" || activeTab === "news" || activeTab === "home") && (
              <ZakatStaffNewsAnnouncementsComponent />
            )}
          </div>
        )}

        {/* This conditional rendering block mounts the salary deduction form exclusively when the mohon tab is active. */}
        {viewScope === "mohon" && (
          <div className="space-y-8">
            <ZakatStaffInformativeNisabHaulCardComponent gajiSemasa={user.gajiSemasa ?? null} />

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
