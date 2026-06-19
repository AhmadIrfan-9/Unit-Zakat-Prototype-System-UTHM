// This header popover shell dynamically loops through system notice arrays to serve live deduction status revisions and news updates to the active user profile.

"use client";

import { useState, useEffect, useCallback } from "react";
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
import { fetchNotificationDataAction } from "@/app/actions/zakatWorkflowManagementServerActions";

// This data model defines the minimal application properties required for notification display.
interface NotificationAppItem {
  id: string;
  namaPenuh: string;
  noPekerja: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: Date | string;
  adminNotes: string | null;
}

// This data model describes the props accepted by the notification bell popover component.
interface NotificationBellProps {
  role: "USER_STAFF" | "MANAGEMENT_STAFF";
  initialApplications?: NotificationAppItem[];
}

// These are the official institutional announcements loaded into the notifications system.
const ANNOUNCEMENTS = [
  {
    id: 1,
    badge: "WARTA NISAB 2026",
    title: "Kemas Kini Had Paras Nisab Bulanan Negeri Johor Suku Kedua 2026",
    content: "Majlis Agama Islam Negeri Johor (MAINJ) secara rasmi menetapkan had paras nisab bulanan semasa pada kadar RM 2,150.00 untuk panduan taksiran caruman gaji.",
    date: "2026-06-15",
  },
  {
    id: 2,
    badge: "PANDUAN HAUL",
    title: "Penyelarasan Kitaran Haul 12 Bulan Bagi Caruman Gaji Kakitangan",
    content: "Penyelarasan tempoh haul 12 bulan penuh kini diselaraskan secara automatik bagi memastikan potongan gaji selari dengan tempoh pemilikan harta yang sah.",
    date: "2026-06-10",
  },
  {
    id: 3,
    badge: "REBAT CUKAI",
    title: "Automasi Resit Pelepasan Cukai Pendapatan Melalui Unit Kutipan Zakat",
    content: "Penyatuan sistem automasi membolehkan penyata caruman tahunan digunakan terus sebagai resit pelepasan cukai pendapatan untuk urusan pemfailan LHDN.",
    date: "2026-06-05",
  },
];

export function ZakatGlobalNotificationBellPopoverComponent({
  role,
  initialApplications = [],
}: NotificationBellProps) {

  // This stable boolean is computed once from the role prop and never changes across renders.
  const isManagement = role === "MANAGEMENT_STAFF";

  // This state hook holds the current notification records.
  const [notifications, setNotifications] = useState<any[]>([]);

  // This state hook controls whether the notification popover panel is currently open or collapsed.
  const [isOpen, setIsOpen] = useState(false);

  // This state hook maintains the set of notification IDs that have already been viewed.
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // This state hook tracks whether the notification fetch is currently in progress.
  const [isRefreshing, setIsRefreshing] = useState(false);

  // This memoized callback fetches fresh notification records from the server endpoint.
  const loadNotifications = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/zakat/notifications");
      const dataset = await response.json();
      const refinedPayload = dataset.filter((item: any) => 
        item.type === "NEWS" || ["DISAHKAN", "DITOLAK"].includes(item.status)
      ).map((item: any) => ({
        ...item,
        date: new Date(item.date),
      }));
      refinedPayload.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
      setNotifications(refinedPayload);
    } catch (err) {
      console.error("[ZakatNotificationBell] Failed to load notifications:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Incremental patch driving the active notification array filter based on real-time application status values.
  useEffect(() => {
    const syncLiveNotifications = async () => {
      try {
        const response = await fetch("/api/zakat/notifications");
        const dataset = await response.json();
        
        // Menapis ralat: Hanya paparkan berita atau permohonan yang bertukar status secara rasmi
        const refinedPayload = dataset.filter((item: any) => 
          item.type === "NEWS" || ["DISAHKAN", "DITOLAK"].includes(item.status)
        ).map((item: any) => ({
          ...item,
          date: new Date(item.date),
        }));
        refinedPayload.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
        setNotifications(refinedPayload);
      } catch (error) {
        console.error("Notification stream synchronization failed:", error);
      }
    };

    syncLiveNotifications();
  }, [isManagement]); // Fixed dependency size array node to eliminate client browser runtime variant crashes completely

  // This utility composes a formatted mailto appeal link for rejected application notifications.
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
    window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // This derived value counts the number of notifications that have not yet been opened by the user.
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  // This handler updates open state and marks all currently visible notifications as read on open.
  const handleTogglePopover = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setReadIds(new Set(notifications.map((n) => n.id)));
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleTogglePopover}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Buka notifikasi sistem"
          className="relative p-2 rounded-full text-muted-foreground hover:text-[#002060] hover:bg-muted/50 transition-colors cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#002060]"
        >
          <Bell className={`h-5 w-5 ${isRefreshing ? "animate-pulse" : ""}`} />
          {/* This badge renders the unread count indicator on the bell icon. */}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 border-[#002060]/20 shadow-2xl bg-white dark:bg-card">
        {/* This navy header band renders the popover title and a manual refresh trigger button. */}
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
            {/* This button triggers a manual refresh of notification data from the server. */}
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

        {/* This scrollable container renders the complete list of notification entry cards. */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div key={notif.id} className="p-3.5 hover:bg-muted/10 transition-colors">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {/* This conditional block renders the appropriate status icon per notification type. */}
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
                      <span className="text-xs font-bold text-foreground leading-none truncate">
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

                    {/* This block renders the email appeal button exclusively for rejected staff notifications. */}
                    {!isManagement && notif.type === "error" && (
                      <div className="pt-1.5">
                        <Button
                          size="sm"
                          onClick={() => handleEmailAppeal(notif.app)}
                          className="h-6 text-[10px] font-bold bg-[#002060] hover:bg-[#002060]/90 text-white gap-1 inline-flex items-center rounded-md cursor-pointer px-2.5"
                        >
                          <Send className="h-2.5 w-2.5" /> Kemuka Rayuan Via Emel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // This fallback container renders when there are no notifications to display for the active role.
            <div className="p-6 text-center text-muted-foreground text-xs italic">
              {isRefreshing
                ? "Memuatkan notifikasi..."
                : "Tiada notifikasi semasa untuk dipaparkan."}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
