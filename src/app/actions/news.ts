"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSystemAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

interface NewsFormData {
  title: string;
  category: string;
  content: string;
  imageUrl?: string;
  status: "DRAFT" | "PUBLISHED";
}

// 1. FUNGSI UTAMA: Cipta dan Terbit Berita Rasmi Pusat Islam
// Incremental patch enforcing role-based isolation during structural CMS write mutations.
export async function createNewsAction(formData: NewsFormData) {
  const session = await auth();

  // KUNCI KESELAMATAN: Hanya meluluskan peranan MANAGEMENT (ZAKAT_OFFICER) sahaja. SUPER_ADMIN dilarang.
  if (session?.user?.role !== "ZAKAT_OFFICER") {
    return { success: false, error: "Akses Ditolak!" };
  }

  try {
    // TUGASAN TAMBAHAN: Jana ringkasan AI secara automatik berdasarkan isi berita yang ditaip
    const generatedSummary = await generateAiSummaryMock(formData.content);

    const newArticle = await prisma.news.create({
      data: {
        title: formData.title,
        category: formData.category,
        content: formData.content,
        imageUrl: formData.imageUrl || null,
        status: formData.status,
        author: session.user.name || "Pegawai Pengurusan Pusat Islam",
        aiSummary: generatedSummary,
      },
    });

    // INTEGRASI LOG AUDIT: Rekodkan aktiviti management ke dalam sistem forensik siber
    await createSystemAuditLog("PENGURUSAN_TERBIT_BERITA", {
      newsId: newArticle.id,
      title: newArticle.title,
      category: newArticle.category,
    });

    revalidatePath("/dashboard/news");

    return { success: true, data: newArticle };
  } catch (error) {
    console.error("CMS_CREATE_NEWS_ERROR:", error);
    return { success: false, error: "Gagal menyimpan artikel berita ke dalam pangkalan data." };
  }
}

// 2. FUNGSI SOKONGAN: Simulasi Penjanaan Ringkasan AI (KISS Principle)
// Memotong kod tag HTML dan merumuskan isi berita untuk paparan kad hadapan
export async function generateAiSummaryAction(content: string) {
  return generateAiSummaryMock(content);
}

async function generateAiSummaryMock(content: string): Promise<string> {
  // Nota: Kelak anda boleh tukar fungsi ini untuk 'fetch' ke API OpenAI/Gemini yang sebenar.
  // Buat masa ini, kita bersihkan tag HTML dan ambil 140 aksara pertama sebagai rumusan pintar.
  const cleanText = content.replace(/<[^>]*>/g, ""); 
  if (cleanText.length > 140) {
    return cleanText.substring(0, 140) + "... [Rumusan Pintar AI Portal Zakat]";
  }
  return cleanText + " [Rumusan Pintar AI Portal Zakat]";
}

// 3. FUNGSI PEMBACAAN: Ambil Senarai Berita
export async function fetchNewsListAction() {
  try {
    const list = await prisma.news.findMany({
      where: {
        status: "PUBLISHED"
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return { success: true, data: list };
  } catch (error) {
    console.error("CMS_FETCH_NEWS_LIST_ERROR:", error);
    return { success: false, error: "Gagal memuatkan senarai berita dari pangkalan data." };
  }
}

// 4. FUNGSI PEMBACAAN DETAIL: Ambil Berita Spesifik
export async function fetchNewsByIdAction(id: string) {
  try {
    const article = await prisma.news.findUnique({
      where: { id }
    });
    if (!article) {
      return { success: false, error: "Artikel berita tidak ditemui." };
    }
    return { success: true, data: article };
  } catch (error) {
    console.error("CMS_FETCH_NEWS_DETAIL_ERROR:", error);
    return { success: false, error: "Gagal memuatkan butiran berita." };
  }
}
