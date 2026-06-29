import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await prisma.news.findUnique({ where: { id } });
  return {
    title: article ? `${article.title} | Portal Berita Zakat UTHM` : "Artikel Berita",
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const article = await prisma.news.findUnique({
    where: { id },
  });

  if (!article) return notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 min-h-screen bg-white shadow-sm border border-gray-100 rounded-2xl my-6">
      
      {/* Butang Kembali Ke Hub Asal */}
      <Link href="/dashboard/news" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-900 transition-colors">
        ← Kembali ke Pusat Maklumat
      </Link>

      {/* Label Kategori */}
      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider rounded">
        {article.category}
      </span>

      {/* Tajuk Utama Berita (H1) */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
        {article.title}
      </h1>

      {/* Nama Penulis & Stempel Masa (H5) */}
      <h5 className="text-xs font-medium text-gray-400 flex items-center gap-4 border-b border-gray-100 pb-4">
        <span>✍️ Ditulis oleh: <strong className="text-gray-700">{article.author}</strong></span>
        <span>📅 Tarikh: {new Date(article.createdAt).toLocaleString("ms-MY")}</span>
      </h5>

      {/* Gambar Berita */}
      {article.imageUrl && (
        <div className="w-full h-64 md:h-80 bg-gray-100 rounded-xl overflow-hidden border">
          <Image 
            src={article.imageUrl} 
            alt={article.title}
            width={800}
            height={400}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      )}

      {/* KOTAK KHAS: Ringkasan AI Portal */}
      {article.aiSummary && (
        <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl space-y-1">
          <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
            ✨ Ringkasan AI Pintar:
          </h4>
          <p className="text-xs italic text-amber-900/80 leading-relaxed">
            {article.aiSummary}
          </p>
        </div>
      )}

      {/* Isi Berita Penuh */}
      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pt-2">
        {article.content}
      </div>

    </div>
  );
}
