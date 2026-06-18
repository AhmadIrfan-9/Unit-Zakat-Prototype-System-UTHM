// This popover header module handles role-based system notifications using a constant-length hook dependency array to avoid invariant rendering crashes.

"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle2, XCircle, Inbox, Send } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { fetchNotificationDataAction } from "@/app/actions/zakatWorkflowManagementServerActions";

// This data model definition outlines properties of each notification application record.
interface NotificationAppItem {
  id: string;
  namaPenuh: string;
  noPekerja: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: Date | string;
  adminNotes: string | null;
}

// This data model definition describes the props accepted by the notification bell component.
interface NotificationBellProps {
  role: "USER_STAFF" | "MANAGEMENT_STAFF";
  initialApplications?: NotificationAppItem[];
}

export function ZakatGlobalNotificationBellPopoverComponent({
  role,
  initialApplications = []
}: NotificationBellProps) {
  // This stable boolean constant determines the user role category without dynamic hook evaluation.
  const isManagement = role === "MANAGEMENT_STAFF";

  // This state hook tracks the dynamic list of applications fetched from the database server.
  const [applications, setApplications] = useState<NotificationAppItem[]>(initialApplications);

  // This state hook manages whether the notifications popover panel is currently open or closed.
  const [isOpen, setIsOpen] = useState(false);

  // This state hook tracks which notification IDs have been read to compute the unread badge count.
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // This callback fetches notification data from the server action endpoint on demand.
  const loadNotifications = useCallback(async () => {
    try {
      const data = await fetchNotificationDataAction();
      if (data && data.length > 0) {
        setApplications(data as NotificationAppItem[]);
      }
    } catch (err) {
      console.error("[ZakatNotificationBell] Failed to load notifications:", err);
    }
  }, []);

  // This hook uses a constant-length dependency array to prevent invariant hook violations across render sequences.
  useEffect(() => {
    loadNotifications();
  }, [isManagement, loadNotifications]);

  // This hook re-fetches notification data every time the popover panel opens to show live records.
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  // This utility composes the mailto email appeal draft for a rejected application.
  const handleEmailAppeal = (app: NotificationAppItem) => {
    const emailTo = "zakat-desk@uthm.edu.my";
    const subject = `Rayuan Penolakan Permohonan Caruman Zakat Gaji UTHM - ${app.namaPenuh} (${app.noPekerja})`;
    const body = `Assalamualaikum/Salam Sejahtera Pengurusan Zakat UTHM,\n\nMerujuk kepada permohonan potongan zakat saya (ID: ${app.id ?? ""}) yang telah ditolak atas alasan: "${app.adminNotes ?? "Tiada catatan diberikan"}", saya ingin mengemukakan rayuan rasmi.\n\n[Sila tulis alasan rayuan anda di sini]\n\nSekian, terima kasih.\n\nYang benar,\n${app.namaPenuh ?? ""}\nNo. Pekerja: ${app.noPekerja ?? ""}`;
    window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // This block builds the notification feed for standard staff users based on their submission history.
  const staffNotifications: { id: string; title: string; desc: string; type: "info" | "success" | "error"; date: Date; app: NotificationAppItem }[] = [];
  // This block builds the notification feed for management staff based on incoming pending submissions.
  const managementNotifications: { id: string; title: string; desc: string; type: "info" | "success" | "error"; date: Date; app: NotificationAppItem }[] = [];

  applications.forEach((app) => {
    const safeDate = new Date(app.submittedAt ?? Date.now());

    if (!isManagement) {
      staffNotifications.push({
        id: `${app.id}-received`,
        title: "Permohonan Diterima",
        desc: "Borang caruman zakat anda telah berjaya diterima dan kini sedang disemak.",
        type: "info",
        date: safeDate,
        app,
      });
      if (app.status === "APPROVED") {
        staffNotifications.push({
          id: `${app.id}-approved`,
          title: "Permohonan Diluluskan",
          desc: "Tahniah! Permohonan caruman zakat anda telah diluluskan dan berkuat kuasa untuk penggajian.",
          type: "success",
          date: safeDate,
          app,
        });
      } else if (app.status === "REJECTED") {
        staffNotifications.push({
          id: `${app.id}-rejected`,
          title: "Permohonan Ditolak",
          desc: `Ditolak: ${app.adminNotes ?? "Sila semak butiran atau hubungi pentadbir."}`,
          type: "error",
          date: safeDate,
          app,
        });
      }
    } else {
      if (app.status === "PENDING") {
        managementNotifications.push({
          id: `${app.id}-pending-mgmt`,
          title: "Permohonan Baru Masuk",
          desc: `Borang baru daripada ${app.namaPenuh ?? ""} (${app.noPekerja ?? ""}) memerlukan penentusahan anda.`,
          type: "info",
          date: safeDate,
          app,
        });
      } else if (app.status === "REJECTED") {
        managementNotifications.push({
          id: `${app.id}-appeal-mgmt`,
          title: "Rayuan E-mel Sedia Ada",
          desc: `Kakitangan ${app.namaPenuh ?? ""} mungkin mengemukakan rayuan bagi permohonan yang ditolak.`,
          type: "error",
          date: safeDate,
          app,
        });
      }
    }
  });

  // This fallback variable model selects the correct notification list based on the stable role boolean.
  const notifications = isManagement ? managementNotifications : staffNotifications;

  // This derived value counts the number of unread notifications for the badge indicator.
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  // This handler controls popover open state and marks all visible notifications as read.
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
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 border-[#002060]/20 shadow-2xl bg-white dark:bg-card">
        {/* This layout wrapper renders the navy header band of the notification popover panel. */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-[#002060] text-white rounded-t-lg">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Bell className="h-4 w-4" /> Notifikasi Sistem
          </span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-white text-[#002060] px-2 py-0.5 rounded-full font-bold">
              {unreadCount} Baru
            </span>
          )}
        </div>

        {/* This layout wrapper contains the scrollable notification entries list. */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div key={notif.id} className="p-3.5 hover:bg-muted/10 transition-colors">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {notif.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    {notif.type === "error" && <XCircle className="h-4 w-4 text-red-600" />}
                    {notif.type === "info" && <Inbox className="h-4 w-4 text-[#002060]" />}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground leading-none truncate">{notif.title}</span>
                      <span className="text-[9px] text-muted-foreground font-mono shrink-0">
                        {notif.date.toLocaleDateString("ms-MY", { day: "2-digit", month: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-normal">{notif.desc}</p>

                    {/* This conditional block renders the email appeal action button for staff rejected notifications. */}
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
            <div className="p-6 text-center text-muted-foreground text-xs italic">
              Tiada notifikasi semasa untuk dipaparkan.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
