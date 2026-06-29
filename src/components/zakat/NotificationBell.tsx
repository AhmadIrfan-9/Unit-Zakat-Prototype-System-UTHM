// This header popover shell dynamically loops through system notice arrays to serve live deduction status revisions and news updates to the active user profile.

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Inbox,
  Send,
  RefreshCw,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { markAllNotificationsAsReadAction } from "@/app/actions/notifications";
import { cn } from "@/lib/utils";

// This data model defines the minimal application properties required for notification display.
interface NotificationAppItem {
  id: string;
  namaPenuh: string;
  noPekerja: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: Date | string;
  adminNotes: string | null;
}

interface PopoverNotificationItem {
  id: string;
  type: "success" | "error" | "info" | "NEWS";
  status: string;
  title: string;
  desc: string;
  date: Date;
  isRead: boolean;
  app: NotificationAppItem | null;
}

interface NotificationBellProps {
  role: "STAFF" | "ZAKAT_OFFICER" | "SUPER_ADMIN";
  userName?: string | null;
  noPekerja?: string | null;
}

const ANNOUNCEMENTS = [
  {
    id: "announcement-1",
    type: "NEWS" as const,
    status: "NEWS",
    title: "Pengumuman: Kemas Kini Had Paras Nisab Bulanan Negeri Johor Suku Kedua 2026",
    desc: "Majlis Agama Islam Negeri Johor (MAINJ) secara rasmi menetapkan had paras nisab bulanan semasa pada kadar RM 2,150.00 untuk panduan taksiran caruman gaji.",
    date: new Date("2026-06-15"),
    isRead: true,
    app: null,
  },
  {
    id: "announcement-2",
    type: "NEWS" as const,
    status: "NEWS",
    title: "Pengumuman: Penyelarasan Kitaran Haul 12 Bulan Bagi Caruman Gaji Kakitangan",
    desc: "Penyelarasan tempoh haul 12 bulan penuh kini diselaraskan secara automatik bagi memastikan potongan gaji selari dengan tempoh pemilikan harta yang sah.",
    date: new Date("2026-06-10"),
    isRead: true,
    app: null,
  },
  {
    id: "announcement-3",
    type: "NEWS" as const,
    status: "NEWS",
    title: "Pengumuman: Automasi Resit Pelepasan Cukai Pendapatan Melalui Unit Kutipan Zakat",
    desc: "Penyatuan sistem automasi membolehkan penyata caruman tahunan digunakan terus sebagai resit pelepasan cukai pendapatan untuk urusan pemfailan LHDN.",
    date: new Date("2026-06-05"),
    isRead: true,
    app: null,
  },
];

export function ZakatGlobalNotificationBellPopoverComponent({
  role,
  userName,
  noPekerja,
}: NotificationBellProps) {

  // Menentukan sama ada pengguna adalah pegawai/pentadbir untuk penapisan notifikasi.
  const isManagement = role === "ZAKAT_OFFICER" || role === "SUPER_ADMIN";

  // State notifikasi terkini
  const [notifications, setNotifications] = useState<PopoverNotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State suis penapis notifikasi belum dibaca
  const [onlyUnread, setOnlyUnread] = useState(false);

  // Mengambil notifikasi daripada endpoint API
  const loadNotifications = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/notifications");
      const dataset = (await response.json()) as Array<{
        id: string;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
        createdAt: string;
      }>;
      
      const dbNotifications = dataset.map((item) => {
        let type: "success" | "error" | "info" | "NEWS" = "info";
        if (item.title.includes("DISAHKAN")) type = "success";
        else if (item.title.includes("DITOLAK")) type = "error";

        const appPayload = item.title.includes("DITOLAK") ? {
          id: item.id,
          namaPenuh: userName ?? "Kakitangan UTHM",
          noPekerja: noPekerja ?? "N/A",
          status: "REJECTED" as const,
          submittedAt: item.createdAt,
          adminNotes: item.message.replace("Ditolak: ", ""),
        } : null;

        return {
          id: item.id,
          type,
          status: item.title.includes("DISAHKAN") ? "DISAHKAN" : (item.title.includes("DITOLAK") ? "DITOLAK" : "INFO"),
          title: item.title,
          desc: item.message,
          date: new Date(item.createdAt),
          isRead: item.isRead,
          app: appPayload,
        };
      });

      const announcements = isManagement ? [] : ANNOUNCEMENTS;
      const refinedPayload = [...announcements, ...dbNotifications];
      refinedPayload.sort((a, b) => b.date.getTime() - a.date.getTime());
      setNotifications(refinedPayload);
    } catch (err) {
      console.error("[ZakatNotificationBell] Failed to load notifications:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isManagement, userName, noPekerja]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Bilangan belum dibaca (tidak termasuk pengumuman statik atau yang isRead = true)
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Tindakan Tandakan Semua Dibaca
  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllNotificationsAsReadAction();
      if (res.success) {
        loadNotifications();
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error("Gagal menandakan semua dibaca:", err);
    }
  };

  const handleEmailAppeal = (app: NotificationAppItem) => {
    const emailTo = "zakat-desk@uthm.edu.my";
    const subject = `Rayuan Penolakan Permohonan Caruman Zakat Gaji UTHM - ${app.namaPenuh} (${app.noPekerja})`;
    const body = [
      "Assalamualaikum/Salam Sejahtera Pengurusan Zakat UTHM,",
      "",
      `Merujuk kepada permohonan potongan zakat saya (ID: ${app.id ?? ""}) yang telah ditolak atas alasan: "${app.adminNotes ?? "Tiada catatan diberikan"}", saya ingin mengemukakan rayuan rasmi.`,
      "",
      "[Sila tulis alasan rayuan anda di sini]",
      "",
      "Sekian, terima kasih.",
      "",
      "Yang benar,",
      `${app.namaPenuh ?? ""}`,
      `No. Pekerja: ${app.noPekerja ?? ""}`,
    ].join("\n");
    if (typeof window !== "undefined") {
      window.location.assign(`mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  };

  // Notifikasi yang telah ditapis berdasarkan status penapis
  const filteredNotifications = useMemo(() => {
    if (onlyUnread) {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, onlyUnread]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Buka notifikasi sistem"
          className="relative p-2 rounded-full text-muted-foreground hover:text-[#002060] hover:bg-muted/50 transition-colors cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#002060]"
        >
          <Bell className={`h-5 w-5 ${isRefreshing ? "animate-pulse" : ""}`} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-85 p-0 border-[#002060]/20 shadow-2xl bg-white dark:bg-card">
        {/* Navy Header Band */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-[#002060] text-white rounded-t-lg">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Bell className="h-4 w-4" /> Notifikasi Sistem
          </span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="text-[10px] bg-white text-[#002060] px-2 py-0.5 rounded-full font-bold">
                {unreadCount} Baru
              </span>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); loadNotifications(); }}
              aria-label="Muat semula notifikasi"
              className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Sub-Header Pengurusan / Penapis Notifikasi */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-150 text-[10.5px] font-bold text-slate-600">
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="hover:text-blue-900 transition-colors flex items-center gap-1 cursor-pointer select-none text-left"
          >
            ✓ Tanda Semua Dibaca
          </button>
          <button
            type="button"
            onClick={() => setOnlyUnread((prev) => !prev)}
            className={cn(
              "transition-colors flex items-center gap-1 cursor-pointer select-none text-right",
              onlyUnread ? "text-blue-900 font-extrabold" : "hover:text-blue-900"
            )}
          >
            👁️ {onlyUnread ? "Tunjukkan Semua" : "Lihat Belum Dibaca"}
          </button>
        </div>

        {/* Scrollable List Container */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "p-3.5 transition-colors flex items-start gap-2.5 relative",
                  notif.isRead
                    ? "bg-white opacity-60"
                    : "bg-blue-50/50 font-semibold border-l-4 border-blue-900"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {notif.type === "success" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  {notif.type === "error" && (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  {(notif.type === "info" || notif.type === "NEWS") && (
                    <Inbox className="h-4 w-4 text-[#002060]" />
                  )}
                </div>
                
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground leading-none truncate pr-2">
                      {notif.title}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-mono shrink-0">
                      {notif.date.toLocaleDateString("ms-MY", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    {notif.desc}
                  </p>

                  {!isManagement && notif.type === "error" && notif.app && (
                    <div className="pt-1.5">
                      <Button
                        size="sm"
                        onClick={() => notif.app && handleEmailAppeal(notif.app)}
                        className="h-6 text-[10px] font-bold bg-[#002060] hover:bg-[#002060]/90 text-white gap-1 inline-flex items-center rounded-md cursor-pointer px-2.5"
                      >
                        <Send className="h-2.5 w-2.5" /> Kemuka Rayuan Via Emel
                      </Button>
                    </div>
                  )}
                </div>

                {/* Indikator bulatan kecil biru bagi yang belum dibaca */}
                {!notif.isRead && (
                  <span className="h-2 w-2 rounded-full bg-blue-900 shrink-0 absolute right-3.5 bottom-3.5" />
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground text-xs italic">
              {isRefreshing
                ? "Memuatkan notifikasi..."
                : "Tiada notifikasi untuk dipaparkan."}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
