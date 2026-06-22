// This news component renders a 3-column responsive card layout to deliver public announcements and compliance updates to staff members safely.

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Calendar } from "lucide-react";

interface Announcement {
  id: number;
  badge: string;
  title: string;
  content: string;
  date: string;
}

export function ZakatStaffNewsAnnouncementsComponent() {
  const announcements: Announcement[] = [
    {
      id: 1,
      badge: "WARTA NISAB 2026",
      title: "Kemas Kini Had Paras Nisab Bulanan Negeri Johor Suku Kedua 2026",
      content: "Majlis Agama Islam Negeri Johor (MAINJ) secara rasmi menetapkan had paras nisab bulanan semasa pada kadar RM 2,150.00 untuk panduan taksiran caruman gaji.",
      date: "15 Jun 2026",
    },
    {
      id: 2,
      badge: "PANDUAN HAUL",
      title: "Penyelarasan Kitaran Haul 12 Bulan Bagi Caruman Gaji Aktif Kakitangan",
      content: "Penyelarasan tempoh haul 12 bulan penuh kini diselaraskan secara automatik bagi memastikan potongan gaji selari dengan tempoh pemilikan harta yang sah.",
      date: "10 Jun 2026",
    },
    {
      id: 3,
      badge: "REBAT CUKAI",
      title: "Automasi Resit Pelepasan Cukai Pendapatan Melalui Unit Kutipan Zakat",
      content: "Penyatuan sistem automasi membolehkan penyata caruman tahunan digunakan terus sebagai resit pelepasan cukai pendapatan untuk urusan pemfailan LHDN.",
      date: "05 Jun 2026",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* This responsive asset layout wrapper organizes the section header and icon elements. */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
        <div className="p-2 bg-[#002060]/10 text-[#002060] rounded-lg">
          <Megaphone className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-[#002060]">Pusat Maklumat Terkini</h2>
          <p className="text-xs text-muted-foreground">Rujukan pekeliling rasmi dan warta pengurusan zakat UTHM</p>
        </div>
      </div>

      {/* This structural container organizes the public announcement card grid into a responsive layout. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* This map function iterates through the validated announcement array to dynamically render structured cards. */}
        {announcements.map((item) => (
          <Card key={item.id} className="border border-slate-200/80 shadow-xs bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between overflow-hidden">
            <CardHeader className="p-5 pb-3 space-y-2.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider bg-slate-200 text-slate-800 uppercase">
                {item.badge}
              </span>
              <CardTitle className="text-sm font-bold text-slate-900 leading-snug">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {item.content}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono pt-3 border-t border-slate-200/60">
                <Calendar className="h-3 w-3" />
                <span>Diterbitkan: {item.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
