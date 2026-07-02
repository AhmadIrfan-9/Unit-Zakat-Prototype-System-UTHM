// This staff workspace interface tracks active layout scopes to exclusively manage public news updates, application requests, and personal user profiles.

"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useSearchParams, useRouter, redirect } from "next/navigation";
import Image from "next/image";
import { ZakatGlobalMainNavbarLayoutComponent } from "./Navbar";
import { ZakatStaffSalaryDeductionApplicationFormComponent } from "./DeductionForm";
import { ZakatStaffProfileComponent } from "./UserProfile";
import { ZakatStaffNewsAnnouncementsComponent } from "./NewsAnnouncements";
import ZakatCalculatorClient from "@/components/zakat/ZakatCalculatorClient";
import { Card } from "@/components/ui/card";

interface AuthenticatedUserProps {
  name?: string | null;
  email?: string | null;
  noPekerja?: string | null;
  noKP?: string | null;
  gajiSemasa?: number | null;
  alamatRumah?: string | null;
  role?: string | null;
  fakulti?: string | null;
  umur?: number | null;
  noTelefon?: string | null;
  poskod?: string | null;
  bandar?: string | null;
  negeri?: string | null;
}

interface ZakatStaffDashboardMasterViewProps {
  sessionUser: {
    name: string;
    email: string;
    role: string;
  };
  userPromise: Promise<AuthenticatedUserProps | null>;
  nisabPromise: Promise<number>;
}

// 1. Core Web Vitals Loading Skeleton
function ZakatDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-2xl border" />
      <div className="h-96 bg-gray-200 rounded-2xl border" />
    </div>
  );
}

export function ZakatStaffDashboardMasterViewComponent({ 
  sessionUser, 
  userPromise, 
  nisabPromise 
}: ZakatStaffDashboardMasterViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lazy state initialization
  const [activeTab, setActiveTab] = useState<string>(() => 
    typeof window !== "undefined" 
      ? new URLSearchParams(window.location.search).get("tab") || "info" 
      : "info"
  );

  // Redirect ZAKAT_OFFICER dan SUPER_ADMIN ke dashboard pengurusan mereka.
  useEffect(() => {
    if (sessionUser.role === "ZAKAT_OFFICER" || sessionUser.role === "SUPER_ADMIN") {
      const tabParam = searchParams.get("tab") ?? "proses";
      router.push(`/dashboard/pengurusan?tab=${tabParam}`);
    }
  }, [sessionUser.role, router, searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/zakat?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col font-sans antialiased pb-10">

      {/* Renders the top navigation header ribbon instantly from session memory */}
      <ZakatGlobalMainNavbarLayoutComponent
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={sessionUser}
      />

      {/* Renders the welcome banner instantly (<50ms) without DB block */}
      <section className="w-full bg-[#002060] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#002060]/10 shadow-md">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-black tracking-widest text-[#002060] bg-white rounded-full px-3 py-1 inline-block">
              Portal Kakitangan UTHM
            </p>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Selamat Datang, {sessionUser.name ?? "Kakitangan UTHM"}
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
              style={{ width: "auto" }}
            />
          </div>
        </div>
      </section>

      {/* This major structural component provides the max-w-7xl container for all staff content panels. */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <Suspense fallback={<ZakatDashboardSkeleton />}>
          <ZakatDashboardContent 
            userPromise={userPromise} 
            nisabPromise={nisabPromise} 
            activeTab={activeTab} 
            handleTabChange={handleTabChange}
          />
        </Suspense>
      </main>
    </div>
  );
}

// Sub-component resolving database-reliant properties inside a Suspense boundary using React 19 use()
function ZakatDashboardContent({
  userPromise,
  nisabPromise,
  activeTab,
  handleTabChange,
}: {
  userPromise: Promise<AuthenticatedUserProps | null>;
  nisabPromise: Promise<number>;
  activeTab: string;
  handleTabChange: (tab: string) => void;
}) {
  const user = use(userPromise);
  const currentNisab = use(nisabPromise);

  if (!user) {
    redirect("/login");
  }

  const viewScope =
    activeTab === "form" || activeTab === "mohon"
      ? "mohon"
      : activeTab === "profile"
      ? "profile"
      : "home";

  return (
    <>
      {/* Profile Tab */}
      {viewScope === "profile" ? (
        <div className="w-full max-w-3xl mx-auto">
          <ZakatStaffProfileComponent
            defaultValues={{
              namaPenuh: user.name ?? "",
              noPekerja: user.noPekerja ?? "",
              noKP: user.noKP ?? "",
              gajiSemasa: user.gajiSemasa ? String(user.gajiSemasa) : "",
              alamatRumah: user.alamatRumah ?? "",
              fakulti: user.fakulti ?? "",
              umur: user.umur ?? undefined,
              noTelefon: user.noTelefon ?? "",
              poskod: user.poskod ?? "",
              bandar: user.bandar ?? "",
              negeri: user.negeri ?? "",
            }}
          />
        </div>
      ) : null}

      {/* Home Tab */}
      {viewScope === "home" ? (
        <div className="space-y-8">
          <ZakatStaffNewsAnnouncementsComponent />
        </div>
      ) : null}

      {/* Form/Mohon Tab */}
      {viewScope === "mohon" ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="border-b border-gray-200 pb-2">
              <h2 className="text-lg font-bold text-gray-900">Semakan & Simulasi Kiraan Zakat</h2>
              <p className="text-xs text-gray-500">Gunakan kalkulator rasmi di bawah sebelum menyerahkan borang caruman potongan gaji.</p>
            </div>
            <ZakatCalculatorClient initialNisab={currentNisab} userProfileSalary={user.gajiSemasa ?? 0} />
          </div>

          <div className="w-full max-w-3xl mx-auto">
            <Card className="border border-border/80 shadow-xl bg-white dark:bg-card/95 p-6 md:p-8">
              <ZakatStaffSalaryDeductionApplicationFormComponent
                user={user}
                onSwitchToProfile={() => handleTabChange("profile")}
              />
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
