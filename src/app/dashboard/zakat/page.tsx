// src/app/dashboard/zakat/page.tsx
//
// RSC (React Server Component) — no "use client" directive.
// Session validation happens server-side before any HTML is sent to the browser.
// The ZakatForm client component is imported as a leaf — it receives no props
// that contain server secrets, keeping the server/client boundary clean.

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ZakatSalaryDeductionFormClientComponent } from "@/components/zakat/zakat-salary-deduction-form-client-component";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permohonan Zakat Gaji | Sistem Caruman Zakat UTHM",
  description:
    "Portal permohonan potongan zakat gaji bulanan untuk staf UTHM. Lengkapkan borang dalam talian bagi menggantikan prosedur borang fizikal.",
};

export default async function ZakatApplicationPage() {
  // Server-side session guard — redirects before the page tree renders.
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-background dark:from-emerald-950/10">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 shadow-sm">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Borang Permohonan Zakat Gaji
              </h1>
              <p className="text-sm text-muted-foreground">
                Sistem Caruman Zakat — Universiti Tun Hussein Onn Malaysia
              </p>
            </div>
          </div>

          {/* Staff identity confirmation banner */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
            <p className="text-sm text-emerald-800 dark:text-emerald-300">
              <span className="font-semibold">Pemohon:</span>{" "}
              {session.user.name ?? session.user.email}
            </p>
          </div>

          {/* Instructional callout */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
            <strong>Arahan:</strong> Sila pilih satu (1) jenis potongan dalam Bahagian C, kemudian
            lengkapkan Bahagian D (Lafaz Membayar Zakat) sebelum menekan butang Hantar.
          </div>
        </div>

        {/* ── Form ────────────────────────────────────────────────────────── */}
        <ZakatSalaryDeductionFormClientComponent />

        {/* ── Footer Note ─────────────────────────────────────────────────── */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Sekiranya menghadapi masalah, sila hubungi Pusat Islam UTHM di{" "}
          <a
            href="mailto:islamiccentre@uthm.edu.my"
            className="underline hover:text-foreground transition-colors"
          >
            islamiccentre@uthm.edu.my
          </a>{" "}
          atau talian 07-5537508.
        </p>
      </div>
    </div>
  );
}
