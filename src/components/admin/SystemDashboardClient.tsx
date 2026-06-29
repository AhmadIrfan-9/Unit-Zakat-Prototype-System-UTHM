"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuditLogTableClient from "./AuditLogTableClient";
import SystemBackupButton from "./SystemBackupButton";

interface SystemDashboardClientProps {
  dbOnline: boolean;
  emailConfigured: boolean;
  isVercel: boolean;
  stats: {
    totalUsers: number;
    totalApplications: number;
    inactiveUsers: number;
  };
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function SystemDashboardClient({
  dbOnline,
  emailConfigured,
  isVercel,
  stats,
  user,
}: SystemDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"health" | "audit">("health");

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-12 font-sans antialiased text-slate-800">
      
      {/* Top Banner Header (Berdasarkan imej) */}
      <div className="w-full bg-[#002060] text-white py-12 px-6 shadow-md border-b border-[#002060]/10">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="text-[10px] uppercase font-black tracking-widest text-[#002060] bg-white rounded-full px-3 py-1 inline-block">
            ADMIN PORTAL
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">System</h1>
          <p className="text-sm text-gray-200">
            Monitor system health, manage configuration, and review audit activity.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Sub-Tab Navigation Capsule pills */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm max-w-md">
          <button
            onClick={() => setActiveTab("health")}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer select-none ${
              activeTab === "health"
                ? "bg-[#002060] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>🩺 Kesihatan Sistem</span>
          </button>
          
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer select-none ${
              activeTab === "audit"
                ? "bg-[#002060] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>📜 Jejak Audit Logs</span>
          </button>
        </div>

        {/* TAB 1: KESIHATAN SISTEM */}
        {activeTab === "health" && (
          <div className="space-y-8 animate-in fade-in duration-150">
            
            {/* Status Indicators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Database Status */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-gray-400 text-lg">🗄️</span>
                  <h3 className="text-sm font-bold text-slate-800">Database Status</h3>
                  <p className="text-[11px] text-gray-500">Prisma Database Connection Check</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dbOnline ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className="text-xs font-extrabold tracking-wide uppercase text-slate-700">
                      {dbOnline ? "Online" : "Offline / Unreachable"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Checked just now</p>
                </div>
              </div>

              {/* Email Service Status */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-gray-400 text-lg">📧</span>
                  <h3 className="text-sm font-bold text-slate-800">Email Service Status</h3>
                  <p className="text-[11px] text-gray-500">SMTP Server Configuration Status</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${emailConfigured ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <span className="text-xs font-extrabold tracking-wide uppercase text-slate-700">
                      {emailConfigured ? "Configured" : "Simulated Console"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Production mail service integration</p>
                </div>
              </div>

              {/* Vercel Telemetry Status */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-gray-400 text-lg">☁️</span>
                  <h3 className="text-sm font-bold text-slate-800">Vercel Telemetry Status</h3>
                  <p className="text-[11px] text-gray-500">Hosting and telemetry health monitoring</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${isVercel ? "bg-emerald-500" : "bg-blue-500"}`} />
                    <span className="text-xs font-extrabold tracking-wide uppercase text-slate-700">
                      {isVercel ? "Active / Connected" : "Local Development"}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Platform metric streams</p>
                </div>
              </div>

            </div>

            {/* System Snapshot */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-blue-950 uppercase tracking-wider">System Snapshot</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Total Users */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Jumlah Pengguna Terdaftar</p>
                  <p className="text-3xl font-black text-[#002060]">{stats.totalUsers}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">✓ Staf Aktif &amp; Pengurusan</p>
                </div>

                {/* Total Applications */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Jumlah Borang Caruman Zakat</p>
                  <p className="text-3xl font-black text-[#002060]">{stats.totalApplications}</p>
                  <p className="text-[10px] text-blue-600 font-bold">✓ Rekod Potongan Gaji</p>
                </div>

                {/* Inactive Users */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Jumlah Pengguna Pasif (0 Borang)</p>
                  <p className="text-3xl font-black text-amber-600">{stats.inactiveUsers}</p>
                  <p className="text-[10px] text-amber-600 font-bold">⚠️ Belum mengemukakan permohonan</p>
                </div>

              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-blue-950 uppercase tracking-wider">Quick Actions</h2>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap gap-4 items-center">
                <SystemBackupButton />
                
                <Link
                  href="/dashboard/pengurusan?tab=pengguna"
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all duration-150 uppercase tracking-wider"
                >
                  👥 Urus Peranan Pengguna
                </Link>

                <button
                  onClick={() => setActiveTab("audit")}
                  className="px-5 py-3 bg-[#002060]/10 hover:bg-[#002060]/20 text-[#002060] font-bold text-xs rounded-xl transition-all duration-150 uppercase tracking-wider"
                >
                  🔎 Lihat Log Audit
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: AUDIT LOGS */}
        {activeTab === "audit" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <AuditLogTableClient />
          </div>
        )}

      </main>

    </div>
  );
}
