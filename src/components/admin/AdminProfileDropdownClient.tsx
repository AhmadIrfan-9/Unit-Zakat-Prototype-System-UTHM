// src/components/admin/AdminProfileDropdownClient.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Shield } from "lucide-react";

interface AdminProfileDropdownClientProps {
  userEmail: string;
  userName: string;
}

export default function AdminProfileDropdownClient({ userEmail, userName }: AdminProfileDropdownClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const confirmSignOut = window.confirm("Adakah anda pasti mahu log keluar?");
    if (confirmSignOut) {
      await signOut({ callbackUrl: "/login" });
    }
  };

  // Get initials for profile avatar
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "A";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-900 text-white font-bold text-xs border-2 border-white shadow-sm hover:bg-blue-950 transition-all focus:outline-none cursor-pointer"
          id="admin-menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {initials}
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2.5 w-60 rounded-xl shadow-xl bg-white border border-slate-100 ring-1 ring-black/5 divide-y divide-slate-100 focus:outline-none z-50 animate-in fade-in slide-in-from-top-3 duration-200"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="admin-menu-button"
        >
          {/* Admin Identity Info */}
          <div className="px-4 py-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider mb-1">
              <Shield className="h-3.5 w-3.5 text-blue-900" />
              <span>Pentadbir Utama</span>
            </div>
            <p className="font-semibold text-slate-900 truncate mt-0.5">{userName}</p>
            <p className="text-slate-450 truncate font-mono text-[10px] mt-0.5">{userEmail}</p>
          </div>

          {/* Action Links */}
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-xs font-semibold text-red-650 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 cursor-pointer"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Keluar Portal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
