// This global master navbar combines branding elements, core navigation selectors, and administrative tools into a single high-visibility top header ribbon.

"use client";

import { useState } from "react";
import Image from "next/image";
import { Info, FileText, User as UserIcon, LogOut, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ZakatGlobalNotificationBellPopoverComponent } from "./NotificationBell";
import { ZakatAuthenticationSignOutConfirmationModalComponent } from "./LogoutModal";

// This data model definition outlines the personal user info structure passed into the navbar.
interface UserInfo {
  name?: string | null;
  email?: string | null;
  noPekerja?: string | null;
  role?: string | null;
}

// This data model definition describes the properties accepted by the global navbar layout.
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
  // This state hook tracks whether the avatar profile dropdown menu is open.
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // This state hook tracks whether the logout confirmation modal dialog is open.
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);

  // This stable boolean constant determines the management role without dynamic evaluation inside hooks.
  const isManagement = user.role === "MANAGEMENT_STAFF";

  // This fallback variable provides a safe display name with null-coalescing protection.
  const displayName = user.name ?? user.email ?? "Pengguna";

  // This fallback variable provides the safe avatar initial letter with null-coalescing protection.
  const avatarInitial = (user.name ?? "U").charAt(0).toUpperCase();

  return (
    // This layout wrapper structures the sticky top master navigation header ribbon.
    <header className="sticky top-0 z-45 w-full border-b border-border bg-white/95 backdrop-blur-md dark:bg-card/95 shadow-xs">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* This layout wrapper anchors the primary corporate identity logo on the far left at h-14 height. */}
        <div className="flex items-center justify-start h-14 py-1 shrink-0">
          <Image
            src="/image_bb5246.png"
            alt="Logo UTHM"
            width={196}
            height={56}
            priority
            className="h-14 w-auto object-contain select-none"
            style={{ width: "auto" }}
          />
        </div>

        {/* This layout wrapper groups the navigation tab selector capsule pills in the center zone. */}
        <div className="hidden md:flex items-center justify-center flex-1 px-6">
          {/* This conditional rendering ternary wrapper decides between management and staff navigation capsules. */}
          {onTabChange ? (
            <div className="flex items-center gap-1 bg-muted/65 p-1 rounded-xl border border-border/40">
              {isManagement ? (
                <>
                  {/* This array data map renders the management tab navigation buttons. */}
                  {[
                    { key: "proses",   label: "Proses Permohonan", Icon: FileText },
                    { key: "analisis", label: "Analisis Kutipan",  Icon: TrendingUp },
                    { key: "pengguna", label: "Pengurusan Staf",   Icon: Users },
                    { key: "profile",  label: "Profil Peribadi",   Icon: UserIcon },
                  ].map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onTabChange(key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none",
                        activeTab === key
                          ? "bg-white dark:bg-card text-[#002060] shadow-xs ring-1 ring-black/5"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {/* This array data map renders the staff employee tab navigation buttons. */}
                  {[
                    { key: "info",    label: "Maklumat Terkini", Icon: Info,     match: ["info", "home", "news"] },
                    { key: "form",    label: "Borang Permohonan", Icon: FileText, match: ["form", "mohon"] },
                    { key: "profile", label: "Profil Peribadi",  Icon: UserIcon, match: ["profile"] },
                  ].map(({ key, label, Icon, match }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onTabChange(key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none",
                        match.includes(activeTab ?? "")
                          ? "bg-white dark:bg-card text-[#002060] shadow-xs ring-1 ring-black/5"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="text-xs font-bold text-[#002060] px-4 py-2 bg-[#002060]/5 rounded-lg">
              Panel Pengurusan Zakat UTHM
            </div>
          )}
        </div>

        {/* This layout wrapper aligns the notification bell and user avatar controls in the right zone. */}
        <div className="flex items-center gap-3 shrink-0 relative">
          {/* This major structural component renders the role-aware notification alert bell popover. */}
          <ZakatGlobalNotificationBellPopoverComponent
            role={isManagement ? "MANAGEMENT_STAFF" : "USER_STAFF"}
          />

          {/* This layout wrapper contains the clickable user avatar and its dropdown menu. */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              aria-label="Buka menu profil"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#002060] text-white text-xs font-extrabold shadow-sm transition-all hover:scale-105 select-none cursor-pointer"
            >
              {avatarInitial}
            </button>

            {/* This conditional rendering block displays the avatar dropdown card when the menu is open. */}
            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2.5 w-56 rounded-xl border border-border bg-white dark:bg-card p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="space-y-1 mb-3">
                    <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                      ID: {user.noPekerja ?? "N/A"}
                    </p>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#002060]/10 text-[#002060]">
                      {isManagement ? "PENGURUSAN" : "Kakitangan"}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2">
                    {/* This sign-out button scales and fills red on hover to signal the destructive action clearly. */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setSignOutModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-red-600 hover:text-white hover:scale-105 dark:hover:bg-red-700 transition-all duration-200 select-none cursor-pointer text-left"
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

      {/* This major structural component renders the logout confirmation dialog modal. */}
      <ZakatAuthenticationSignOutConfirmationModalComponent
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
      />
    </header>
  );
}
