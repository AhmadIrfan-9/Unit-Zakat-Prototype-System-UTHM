// src/app/api/zakat/notifications/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ANNOUNCEMENTS = [
  {
    id: "announcement-1",
    type: "NEWS",
    status: "NEWS",
    title: "Pengumuman: Kemas Kini Had Paras Nisab Bulanan Negeri Johor Suku Kedua 2026",
    desc: "Majlis Agama Islam Negeri Johor (MAINJ) secara rasmi menetapkan had paras nisab bulanan semasa pada kadar RM 2,150.00 untuk panduan taksiran caruman gaji.",
    date: "2026-06-15",
    app: null,
  },
  {
    id: "announcement-2",
    type: "NEWS",
    status: "NEWS",
    title: "Pengumuman: Penyelarasan Kitaran Haul 12 Bulan Bagi Caruman Gaji Kakitangan",
    desc: "Penyelarasan tempoh haul 12 bulan penuh kini diselaraskan secara automatik bagi memastikan potongan gaji selari dengan tempoh pemilikan harta yang sah.",
    date: "2026-06-10",
    app: null,
  },
  {
    id: "announcement-3",
    type: "NEWS",
    status: "NEWS",
    title: "Pengumuman: Automasi Resit Pelepasan Cukai Pendapatan Melalui Unit Kutipan Zakat",
    desc: "Penyatuan sistem automasi membolehkan penyata caruman tahunan digunakan terus sebagai resit pelepasan cukai pendapatan untuk urusan pemfailan LHDN.",
    date: "2026-06-05",
    app: null,
  },
];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const isManagement = session.user.role === "ZAKAT_OFFICER" || session.user.role === "SUPER_ADMIN";
    
    // Fetch user applications
    const apps = await prisma.zakatStaffSalaryDeductionApplication.findMany({
      where: isManagement ? {} : { userId: session.user.id },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        namaPenuh: true,
        noPekerja: true,
        status: true,
        submittedAt: true,
        adminNotes: true,
      },
    });

    const formattedApps = apps.map((app) => {
      const dateStr = app.submittedAt instanceof Date 
        ? app.submittedAt.toISOString() 
        : app.submittedAt;
      
      let type: "info" | "success" | "error" = "info";
      let status = "PENDING";
      let title = "Permohonan Baru Masuk";
      let desc = `Borang baru daripada ${app.namaPenuh} (${app.noPekerja}) memerlukan penentusahan anda.`;

      if (app.status === "APPROVED") {
        type = "success";
        status = "DISAHKAN";
        title = "Permohonan DISAHKAN";
        desc = "Tahniah! Permohonan caruman zakat anda telah disahkan dan berkuat kuasa untuk penggajian.";
      } else if (app.status === "REJECTED") {
        type = "error";
        status = "DITOLAK";
        title = "Permohonan DITOLAK";
        desc = `Ditolak: ${app.adminNotes ?? "Sila semak butiran atau hubungi pentadbir."}`;
      }

      return {
        id: app.id,
        type,
        status,
        title,
        desc,
        date: dateStr,
        app: {
          id: app.id,
          namaPenuh: app.namaPenuh,
          noPekerja: app.noPekerja,
          status: app.status,
          submittedAt: dateStr,
          adminNotes: app.adminNotes,
        },
      };
    });

    // Merge announcements for staff
    const result = isManagement 
      ? formattedApps 
      : [...ANNOUNCEMENTS, ...formattedApps];

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/zakat/notifications] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
