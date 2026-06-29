// src/components/Sidebar.tsx

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  ShieldAlert, 
  Users, 
  Activity, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Newspaper 
} from "lucide-react";

interface SidebarProps {
  userRole: "SUPER_ADMIN" | "MANAGEMENT" | "USER" | "ZAKAT_OFFICER" | "STAFF";
  userName: string;
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();

  // Selaraskan peranan pangkalan data (Prisma/NextAuth) dengan paparan visual Sidebar
  const normalizedRole = 
    userRole === "ZAKAT_OFFICER" ? "MANAGEMENT" :
    userRole === "STAFF" ? "USER" :
    userRole;

  // Fungsi log keluar
  const handleLogout = async () => {
    const sahkan = window.confirm("Adakah anda pasti mahu log keluar?");
    if (sahkan) {
      await signOut({ callbackUrl: "/login" });
    }
  };

  return (
    <aside className="w-64 h-screen bg-blue-950 text-white flex flex-col justify-between p-4 fixed left-0 top-0 z-50">
      
      {/* BAHAGIAN ATAS: Profil & Navigasi Menu */}
      <div className="space-y-6 w-full">
        {/* Header Profil Singkat */}
        <div className="border-b border-blue-900 pb-4">
          <h2 className="font-bold text-sm truncate">{userName}</h2>
          <span className="text-[10px] bg-blue-800 text-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
            {normalizedRole.replace("_", " ")}
          </span>
        </div>

        {/* Senarai Menu Berdasarkan Peranan (Strict Role Isolation) */}
        <nav className="space-y-1">
          
          {/* ==================== MENU SUPER_ADMIN ==================== */}
          {normalizedRole === "SUPER_ADMIN" && (
            <>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-3 mb-2">
                Sistem Pentadbir Utama
              </p>
              
              <Link 
                href="/dashboard/admin/system"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === "/dashboard/admin/system" ? "bg-blue-900 text-white font-bold" : "text-blue-200 hover:bg-blue-900/50"
                }`}
              >
                <Activity size={16} />
                <span>System Health</span>
              </Link>

              <Link 
                href="/dashboard/admin/users"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === "/dashboard/admin/users" ? "bg-blue-900 text-white font-bold" : "text-blue-200 hover:bg-blue-900/50"
                }`}
              >
                <Users size={16} />
                <span>Uruskan Staf</span>
              </Link>

              <Link 
                href="/dashboard/admin/audit"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === "/dashboard/admin/audit" ? "bg-blue-900 text-white font-bold" : "text-blue-200 hover:bg-blue-900/50"
                }`}
              >
                <ShieldAlert size={16} />
                <span>Audit Logs</span>
              </Link>
            </>
          )}

          {/* ==================== MENU MANAGEMENT ==================== */}
          {normalizedRole === "MANAGEMENT" && (
            <>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-3 mb-2">
                Menu Pengurusan
              </p>
              <Link href="/dashboard/pengurusan" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-blue-200 hover:bg-blue-900">
                <LayoutDashboard size={16} />
                <span>Dashboard Utama</span>
              </Link>
              <Link href="/dashboard/pengurusan/permohonan" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-blue-200 hover:bg-blue-900">
                <FileText size={16} />
                <span>Permohonan Zakat</span>
              </Link>
              <Link href="/dashboard/pengurusan/berita" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-blue-200 hover:bg-blue-900">
                <Newspaper size={16} />
                <span>Urus Berita (CMS)</span>
              </Link>
            </>
          )}

        </nav>
      </div>

      {/* BAHAGIAN BAWAH: Diasingkan menggunakan flex-col 'justify-between' */}
      {/* Ini akan memaksa butang Logout kekal melekat di bawah interface dan tidak hilang lagi */}
      <div className="border-t border-blue-900 pt-4 w-full">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors group"
        >
          <LogOut size={16} className="text-red-400 group-hover:translate-x-0.5 transition-transform" />
          <span>Log Keluar</span>
        </button>
      </div>

    </aside>
  );
}
