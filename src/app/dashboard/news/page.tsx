import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ZakatGlobalMainNavbarLayoutComponent } from "@/components/zakat/Navbar";
import { Megaphone, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pusat Maklumat Terkini | Sistem Zakat UTHM",
  description: "Rujukan pekeliling rasmi dan warta pengurusan zakat UTHM.",
};

export default async function NewsDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser) {
    redirect("/login");
  }

  // 1. Ambil senarai berita dari pangkalan data
  let newsList = await prisma.news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  // 2. Jika pangkalan data kosong, lakukan auto-seeding untuk paparan visual awal yang cantik
  if (newsList.length === 0) {
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

    await prisma.news.createMany({
      data: defaultNews,
    });

    // Re-fetch selepas seeding
    newsList = await prisma.news.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
    });
  }

  const formattedUser = {
    name: dbUser.name ?? "",
    email: dbUser.email ?? "",
    noPekerja: dbUser.noPekerja ?? "",
    role: dbUser.role,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans antialiased pb-16">
      {/* Navbar Global */}
      <ZakatGlobalMainNavbarLayoutComponent
        activeTab="news"
        user={formattedUser}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        {/* Header Seksyen */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="p-2.5 bg-[#002060]/10 text-[#002060] rounded-xl shadow-xs">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#002060] tracking-tight">Pusat Maklumat Terkini</h2>
            <p className="text-sm text-slate-500 font-medium">Rujukan pekeliling rasmi dan warta pengurusan zakat UTHM</p>
          </div>
        </div>

        {/* Grid Berita */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsList.map((item) => (
            <div
              key={item.id}
              className="border border-slate-200/80 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Gambar Berita (jika ada) */}
                {item.imageUrl && (
                  <div className="relative w-full h-48 overflow-hidden bg-slate-100 border-b border-slate-100">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={400}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                )}

                <div className="p-6 space-y-3">
                  {/* Badge Kategori */}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-blue-50 text-blue-900 uppercase border border-blue-100/50">
                    {item.category}
                  </span>
                  
                  {/* Tajuk Berita */}
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug tracking-tight group-hover:text-[#002060] transition-colors">
                    {item.title}
                  </h3>
                  
                  {/* Ringkasan AI */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {item.aiSummary || item.content.substring(0, 140) + "..."}
                  </p>
                </div>
              </div>

              {/* Footer Kad */}
              <div className="p-6 pt-0 space-y-4">
                <div className="flex items-center justify-between gap-1.5 text-[11px] text-slate-400 font-medium pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {item.createdAt.toLocaleDateString("ms-MY", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">Oleh: {item.author}</span>
                </div>
                
                <Link
                  href={`/dashboard/news/${item.id}`}
                  className="block w-full py-2 bg-[#002060] hover:bg-[#002060]/90 text-white text-xs font-bold rounded-xl text-center shadow-xs transition-colors"
                >
                  Baca Lagi
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
