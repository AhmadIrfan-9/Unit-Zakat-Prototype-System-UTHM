// This global master navbar combines branding elements, core navigation selectors, and administrative tools into a single high-visibility top header ribbon.

"use client";

import { useState } from "react";
import Image from "next/image";
import { Info, FileText, User as UserIcon, LogOut, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ZakatGlobalNotificationBellPopoverComponent } from "./ZakatGlobalNotificationBellPopoverComponent";
import { ZakatAuthenticationSignOutConfirmationModalComponent } from "./ZakatAuthenticationSignOutConfirmationModalComponent";

// This data model definition outlines the personal user info structure.
interface UserInfo {
  name?: string | null;
  email?: string | null;
  noPekerja?: string | null;
  role?: string | null;
}

// This data model definition describes the navbar properties.
interface ZakatGlobalMainNavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  user: UserInfo;
}

export function ZakatGlobalMainNavbarLayoutComponent({
  activeTab,
  onTabChange,
  user
}: ZakatGlobalMainNavbarProps) {
  // This lifecycle state hook tracks the open state of the profile avatar dropdown.
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // This lifecycle state hook tracks the open state of the logout confirmation dialog.
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);

  return (
    // This layout wrapper structures the sticky top master navigation header ribbon.
    <header className="sticky top-0 z-45 w-full border-b border-border bg-white/95 backdrop-blur-md dark:bg-card/95 shadow-xs">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* This layout wrapper anchors the primary corporate identity logo on the far-left. */}
        <div className="flex items-center justify-start h-14 py-1 pr-2">
          {/* This major structural component card renders the UTHM shield logo. */}
          <Image
            src="/image_bb5246.png"
            alt="Logo UTHM"
            width={180}
            height={56}
            priority
            className="h-14 w-auto object-contain select-none"
            style={{ width: "auto" }}
          />
        </div>

        {/* This layout wrapper groups the active tab selector buttons. */}
        <div className="hidden md:flex items-center justify-center">
          {/* This conditional rendering ternary wrapper decides between the management cockpit tabs and staff employee navigation selectors based on user role. */}
          {onTabChange ? (
            <div className="flex items-center gap-1 bg-muted/65 p-1 rounded-xl border border-border/40">
              {user.role === "MANAGEMENT_STAFF" ? (
                <>
                  <button
                    type="button"
                    onClick={() => onTabChange("proses")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none",
                      activeTab === "proses"
                        ? "bg-white dark:bg-card text-[#002060] shadow-xs ring-1 ring-black/5"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Proses Permohonan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onTabChange("analisis")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none",
                      activeTab === "analisis"
                        ? "bg-white dark:bg-card text-[#002060] shadow-xs ring-1 ring-black/5"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Analisis Kutipan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onTabChange("profile")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none",
                      activeTab === "profile"
                        ? "bg-white dark:bg-card text-[#002060] shadow-xs ring-1 ring-black/5"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>Profil Peribadi</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onTabChange("info")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none",
                      activeTab === "info" || activeTab === "home" || activeTab === "news"
                        ? "bg-white dark:bg-card text-[#002060] shadow-xs ring-1 ring-black/5"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>Maklumat Terkini</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onTabChange("form")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none",
                      activeTab === "form" || activeTab === "mohon"
                        ? "bg-white dark:bg-card text-[#002060] shadow-xs ring-1 ring-black/5"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Borang Permohonan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onTabChange("profile")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none",
                      activeTab === "profile"
                        ? "bg-white dark:bg-card text-[#002060] shadow-xs ring-1 ring-black/5"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>Profil Peribadi</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="text-xs font-bold text-[#002060] px-4 py-2 bg-[#002060]/5 rounded-lg">
              Panel Pengurusan Zakat UTHM
            </div>
          )}
        </div>

        {/* This layout wrapper aligns notifications and profile controls on the right of the header ribbon. */}
        <div className="flex items-center gap-4 relative">
          {/* This major structural component card displays the alerts bell popover. */}
          <ZakatGlobalNotificationBellPopoverComponent
            role={user.role === "MANAGEMENT_STAFF" ? "MANAGEMENT_STAFF" : "USER_STAFF"}
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#002060] text-white text-xs font-extrabold shadow-sm transition-all hover:scale-105 select-none cursor-pointer"
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </button>

            {/* This conditional rendering ternary wrapper displays the avatar dropdown card menu when open. */}
            {profileDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setProfileDropdownOpen(false)} 
                />
                
                <div className="absolute right-0 mt-2.5 w-56 rounded-xl border border-border bg-white dark:bg-card p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="space-y-1 mb-3">
                    <p className="text-xs font-bold text-foreground truncate">{user.name ?? user.email}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">ID: {user.noPekerja ?? "N/A"}</p>
                    <p className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#002060]/10 text-[#002060]">
                      {user.role === "MANAGEMENT_STAFF" ? "PENGURUSAN" : "Kakitangan"}
                    </p>
                  </div>
                  <div className="border-t border-border pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setSignOutModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all select-none cursor-pointer text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Keluar</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* This major structural component card displays the logout verification popup modal. */}
      <ZakatAuthenticationSignOutConfirmationModalComponent
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
      />
    </header>
  );
}
