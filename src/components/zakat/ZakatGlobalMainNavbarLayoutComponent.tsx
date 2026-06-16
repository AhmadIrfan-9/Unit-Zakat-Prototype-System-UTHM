// src/components/zakat/ZakatGlobalMainNavbarLayoutComponent.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Info, FileText, User as UserIcon, LogOut, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ZakatGlobalNotificationBellPopoverComponent } from "./ZakatGlobalNotificationBellPopoverComponent";


interface UserInfo {
  name?: string | null;
  email?: string | null;
  noPekerja?: string | null;
  role?: string | null;
}

interface ZakatGlobalMainNavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  user: UserInfo;
}

// This core navbar locks at the top of the interface screen to display primary navigation links and the official university identity logo.
export function ZakatGlobalMainNavbarLayoutComponent({
  activeTab,
  onTabChange,
  user
}: ZakatGlobalMainNavbarProps) {
  // Toggle the user logout dropdown card.
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Render the persistent header structure.
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur-md dark:bg-card/95 shadow-xs">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Block: Display ONLY the primary UTHM logo on the far-left */}
        <div className="flex items-center gap-2">
          <Image
            src="/image_bb5246.png"
            alt="Logo UTHM"
            width={140}
            height={44}
            priority
            className="h-10 w-auto object-contain select-none"
          />
        </div>

        {/* Center Block: Responsive workspace navigation tabs in a pill style based on roles */}
        <div className="hidden md:flex items-center justify-center">
          {onTabChange ? (
            <div className="flex items-center gap-1 bg-muted/65 p-1 rounded-xl border border-border/40">
              {user.role === "MANAGEMENT_STAFF" ? (
                <>
                  {/* Executive tab to show database stats and graphs */}
                  <button
                    type="button"
                    onClick={() => onTabChange("analysis")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none",
                      activeTab === "analysis"
                        ? "bg-white dark:bg-card text-[#002060] shadow-xs ring-1 ring-black/5"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Analisis Kutipan</span>
                  </button>

                  {/* Executive tab to show and edit manager profile details */}
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
                  {/* Staff tab to view information guidelines */}
                  <button
                    type="button"
                    onClick={() => onTabChange("info")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none",
                      activeTab === "info"
                        ? "bg-white dark:bg-card text-[#002060] shadow-xs ring-1 ring-black/5"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>Maklumat Terkini</span>
                  </button>

                  {/* Staff tab to fill the deduction form */}
                  <button
                    type="button"
                    onClick={() => onTabChange("form")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none",
                      activeTab === "form"
                        ? "bg-white dark:bg-card text-[#002060] shadow-xs ring-1 ring-black/5"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Borang Permohonan</span>
                  </button>

                  {/* Staff tab to view and edit personal profile inputs */}
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

        {/* Right Block: User profile control pod with notification bell and avatar dropdown */}
        <div className="flex items-center gap-4 relative">
          {/* Notification bell badge with alert icon indicator */}
          <ZakatGlobalNotificationBellPopoverComponent
            role={user.role === "MANAGEMENT_STAFF" ? "MANAGEMENT_STAFF" : "USER_STAFF"}
          />


          {/* User profile avatar container */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#002060] text-white text-xs font-extrabold shadow-sm transition-all hover:scale-105 select-none cursor-pointer"
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </button>

            {/* Click revealed logout and role identity dropdown container */}
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
                    <Link
                      href="/api/auth/signout"
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all select-none cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Keluar</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
