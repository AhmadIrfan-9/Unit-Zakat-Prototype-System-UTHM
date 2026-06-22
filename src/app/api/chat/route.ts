// src/app/api/chat/route.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Ambil sesi rasmi terus dari pelayan (bukan dari payload hantaran klien)
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
    }

    // Ekstrak data hantaran sembang dari body request
    const body = await req.json();
    const { userId, message } = body;

    // KUNCI KESELAMATAN: Pastikan userId yang meminta akses sembang adalah pemilik sebenar token sesi aktif
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: Security validation identity mismatch" }, 
        { status: 403 } // 403 Forbidden adalah status kod tepat untuk isu kebenaran hak akses
      );
    }

    // ─── Logik Penjanaan Sembang Asal (Zakat Assistant Prototype) ───
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mesej diperlukan" }, { status: 400 });
    }

    let reply = "Maaf, saya kurang memahami soalan anda. Sila tanya mengenai nisab semasa, pengiraan zakat, atau syarat wajib.";
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("nisab") || lowerMsg.includes("kadar")) {
      reply = "Kadar Nisab Zakat Pendapatan semasa (tahun 2026) bagi Johor/UTHM adalah RM23,000.00 setahun.";
    } else if (lowerMsg.includes("kira") || lowerMsg.includes("formula")) {
      reply = "Formula pengiraan zakat pendapatan: (Jumlah Pendapatan Kasar Setahun - Tolakan/Pelepasan Dibenarkan) x 2.5%.";
    } else if (lowerMsg.includes("syarat") || lowerMsg.includes("wajib")) {
      reply = "Syarat wajib zakat pendapatan: Islam, merdeka, milik sempurna, cukup nisab, dan cukup haul.";
    } else if (lowerMsg.includes("salam") || lowerMsg.includes("hello") || lowerMsg.includes("hai")) {
      reply = "Waalaikumussalam dan selamat sejahtera! Saya Pembantu Maya Zakat UTHM. Ada apa yang boleh saya bantu?";
    }

    return NextResponse.json({
      success: true,
      userId,
      reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("[POST /api/chat] Chat generation failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
