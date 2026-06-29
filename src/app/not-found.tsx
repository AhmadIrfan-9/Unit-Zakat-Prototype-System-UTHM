// src/app/not-found.tsx
// Custom 404 page for App Router

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl font-bold text-foreground">Halaman Tidak Dijumpai</h2>
        </div>
        
        <p className="text-muted-foreground">
          Maaf, halaman yang anda cari tidak dapat ditemukan di sistem.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="px-6 py-2 bg-[#002060] text-white font-semibold rounded-lg hover:bg-[#002060]/90 transition"
          >
            Ke Halaman Log Masuk
          </Link>
          <Link
            href="/"
            className="px-6 py-2 border border-border rounded-lg font-semibold hover:bg-muted transition"
          >
            Ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
