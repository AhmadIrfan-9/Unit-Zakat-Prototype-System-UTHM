import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ZakatGlobalMainNavbarLayoutComponent } from "@/components/zakat/Navbar";
import { Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface NewsDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await prisma.news.findUnique({
    where: { id },
  });

  return {
    title: article ? `${article.title} | Portal Berita Zakat UTHM` : "Artikel Berita",
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
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

  const { id } = await params;

  // Carian berita daripada pangkalan data
  const article = await prisma.news.findUnique({
    where: { id },
  });

  if (!article) {
    notFound();
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* Butang Kembali */}
        <div>
          <Link
            href="/dashboard/news"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#002060] hover:text-[#002060]/80 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Pusat Maklumat</span>
          </Link>
        </div>

        {/* Artikel Kad Penuh */}
        <article className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm space-y-6">
          {/* Tag & Kategori */}
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black tracking-wider bg-blue-50 text-blue-900 uppercase border border-blue-100/50">
              {article.category}
            </span>
          </div>

          {/* Tajuk Utama */}
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Maklumat Penulis & Tarikh */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium pb-6 border-b border-slate-100">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <User className="h-4 w-4 text-[#002060]" />
              <h5 className="font-bold text-slate-800">Ditulis oleh: {article.author}</h5>
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Calendar className="h-4 w-4 text-[#002060]" />
              <span>
                Tarikh Terbit:{" "}
                {article.createdAt.toLocaleDateString("ms-MY", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Gambar Utama (jika ada) */}
          {article.imageUrl && (
            <div className="relative w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <Image
                src={article.imageUrl}
                alt={article.title}
                width={800}
                height={400}
                className="w-full h-auto max-h-[400px] object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Ringkasan AI Terperinci (jika ada) */}
          {article.aiSummary && (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <h4 className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-450 tracking-wider">
                  Rumusan Pintar AI
                </h4>
              </div>
              <p className="text-xs text-emerald-950 dark:text-emerald-350 leading-relaxed font-semibold italic">
                {article.aiSummary}
              </p>
            </div>
          )}

          {/* Kandungan Artikel Penuh */}
          <div className="prose max-w-none text-slate-700 leading-relaxed text-sm md:text-base font-medium space-y-6">
            {article.content.split("\n\n").map((para: string, idx: number) => (
              <p key={idx} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>

        </article>
      </main>
    </div>
  );
}
