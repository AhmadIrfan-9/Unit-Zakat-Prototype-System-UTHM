import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import NewsCreateFormClient from "@/components/admin/NewsCreateFormClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pusat Maklumat Terkini | Sistem Zakat UTHM",
  description: "Rujukan pekeliling rasmi dan warta pengurusan zakat UTHM.",
};

export default async function NewsHubPage() {
  const session = await auth();
  const isManagement = session?.user?.role === "ZAKAT_OFFICER" || session?.user?.role === "SUPER_ADMIN";

  // Tarik semua berita berstatus PUBLISHED (atau tunjuk semua termasuk DRAFT jika mereka pengurusan)
  let articles = await prisma.news.findMany({
    where: isManagement ? {} : { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  // Auto-seed jika pangkalan data kosong
  if (articles.length === 0) {
    const defaultNews = [
      {
        title: "Kemas Kini Had Paras Nisab Bulanan Negeri Johor Suku Kedua 2026",
        author: "Unit Zakat UTHM",
        content: "Majlis Agama Islam Negeri Johor (MAINJ) secara rasmi menetapkan had paras nisab bulanan semasa pada kadar RM 2,150.00 untuk panduan taksiran caruman gaji.",
        aiSummary: "Majlis Agama Islam Negeri Johor (MAINJ) secara rasmi menetapkan had paras nisab bulanan semasa pada kadar RM 2,150.00 untuk panduan taksiran caruman gaji. [Rumusan Pintar AI Portal Zakat]",
        imageUrl: null,
        category: "WARTA NISAB 2026",
        status: "PUBLISHED",
        createdAt: new Date("2026-06-15T08:00:00.000Z"),
      },
      {
        title: "Penyelarasan Kitaran Haul 12 Bulan Bagi Caruman Gaji Aktif Kakitangan",
        author: "Unit Zakat UTHM",
        content: "Penyelarasan tempoh haul 12 bulan penuh kini diselaraskan secara automatik bagi memastikan potongan gaji selari dengan tempoh pemilikan harta yang sah.",
        aiSummary: "Penyelarasan tempoh haul 12 bulan penuh kini diselaraskan secara automatik bagi memastikan potongan gaji selari dengan tempoh pemilikan harta yang sah. [Rumusan Pintar AI Portal Zakat]",
        imageUrl: null,
        category: "PANDUAN HAUL",
        status: "PUBLISHED",
        createdAt: new Date("2026-06-10T08:00:00.000Z"),
      },
      {
        title: "Automasi Resit Pelepasan Cukai Pendapatan Melalui Unit Kutipan Zakat",
        author: "Unit Zakat UTHM",
        content: "Penyatuan sistem automasi membolehkan penyata caruman tahunan digunakan terus sebagai resit pelepasan cukai pendapatan untuk urusan pemfailan LHDN.",
        aiSummary: "Penyatuan sistem automasi membolehkan penyata caruman tahunan digunakan terus sebagai resit pelepasan cukai pendapatan untuk urusan pemfailan LHDN. [Rumusan Pintar AI Portal Zakat]",
        imageUrl: null,
        category: "REBAT CUKAI",
        status: "PUBLISHED",
        createdAt: new Date("2026-06-05T08:00:00.000Z"),
      },
    ];

    await prisma.news.createMany({ data: defaultNews });

    articles = await prisma.news.findMany({
      where: isManagement ? {} : { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div className="p-6 space-y-10 bg-gray-50/50 min-h-screen">
      
      {/* SEGMEN 1: DASHBOARD MANAGEMENT (Hanya muncul jika peranan bersesuaian) */}
      {isManagement && (
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-blue-950">Panel Urus Kandungan & Berita Portal</h2>
            <p className="text-xs text-gray-500">Tulis warta, panduan haul, atau maklumat cukai baharu untuk hebahan staf.</p>
          </div>
          {/* Komponen klien mengurus input penulisan berita */}
          <NewsCreateFormClient />
        </div>
      )}

      {/* SEGMEN 2: GRID PAPARAN KAD BERITA (Berdasarkan WhatsApp Image 2026-06-22 at 16.37.23.jpeg) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-900 rounded-lg">
            {/* Ikon Megaphone/Mesej */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-950">Pusat Maklumat Terkini</h2>
            <p className="text-xs text-gray-500">Rujukan pekeliling rasmi dan warta pengurusan zakat UTHM</p>
          </div>
        </div>

        {/* Susunan Grid 3-Kolum */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.length === 0 ? (
            <p className="text-sm text-gray-400 col-span-3 py-8 text-center bg-white rounded-xl border">Tiada maklumat atau berita diterbitkan buat masa ini.</p>
          ) : (
            articles.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
                <div className="space-y-4">
                  {/* Gambar Berita (jika ada) */}
                  {item.imageUrl && (
                    <div className="relative w-full h-48 overflow-hidden bg-slate-100 rounded-xl border border-slate-100">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={400}
                        height={200}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Label Kategori - Spt WARTA NISAB 2026, PANDUAN HAUL */}
                  <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-900 text-[10px] font-bold tracking-wider uppercase rounded">
                    {item.category}
                  </span>
                  
                  {/* Tajuk Berita (H2) */}
                  <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  
                  {/* Cebisan Ringkasan AI */}
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    {item.aiSummary || "Tiada ringkasan AI tersedia untuk artikel ini."}
                  </p>
                </div>

                {/* Bahagian Bawah: Tarikh & Butang Navigasi Dalaman */}
                <div className="pt-6 border-t border-gray-100 mt-6 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span>📅</span>
                    <span>Diterbitkan: {new Date(item.createdAt).toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  
                  <Link 
                    href={`/dashboard/news/${item.id}`}
                    className="text-blue-900 font-bold hover:underline flex items-center gap-1"
                  >
                    Baca Lagi <span>→</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
