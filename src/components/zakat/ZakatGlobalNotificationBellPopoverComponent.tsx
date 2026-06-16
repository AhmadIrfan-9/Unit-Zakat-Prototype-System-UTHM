// This navigation popover component handles the live notification array tracking confirmation states and launches inline appeal email scripts.

"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle2, XCircle, Inbox, Send } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { fetchNotificationDataAction } from "@/app/actions/zakatWorkflowManagementServerActions";

interface NotificationAppItem {
  id: string;
  namaPenuh: string;
  noPekerja: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: Date | string;
  adminNotes: string | null;
}

interface NotificationBellProps {
  role: "USER_STAFF" | "MANAGEMENT_STAFF";
  initialApplications?: NotificationAppItem[];
}

export function ZakatGlobalNotificationBellPopoverComponent({
  role,
  initialApplications = []
}: NotificationBellProps) {
  // This state hook tracks the dynamic list of applications fetched from the database server.
  const [applications, setApplications] = useState<NotificationAppItem[]>(initialApplications);

  // This state hook manages whether the notifications popover panel is currently open or closed.
  const [isOpen, setIsOpen] = useState(false);

  // This state hook tracks which notifications have been clicked to dismiss the unread bubble indicator.
  const [readNotifications, setReadNotifications] = useState<string[]>([]);

  // This hook fetches notification data dynamically when the component mounts.
  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await fetchNotificationDataAction();
        if (data && data.length > 0) {
          setApplications(data as NotificationAppItem[]);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }
    loadNotifications();
  }, []);

  // This utility formats the e-mail rayuan draft addressed to the management desk.
  const handleEmailAppeal = (app: NotificationAppItem) => {
    const emailTo = "zakat-desk@uthm.edu.my";
    const subject = `Rayuan Penolakan Permohonan Caruman Zakat Gaji UTHM - ${app.namaPenuh} (${app.noPekerja})`;
    const body = `Assalamualaikum/Salam Sejahtera Pengurusan Zakat UTHM,\n\nMerujuk kepada permohonan potongan zakat saya yang bernilai RM ${app.id} dan telah ditolak atas alasan: "${app.adminNotes || "Tiada catatan diberikan"}", saya ingin mengemukakan rayuan rasmi.\n\n[Sila tulis alasan rayuan anda di sini]\n\nSekian, terima kasih.\n\nYang benar,\n${app.namaPenuh}\nNo. Pekerja: ${app.noPekerja}`;
    window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const notifications: { id: string; title: string; desc: string; type: "info" | "success" | "error"; date: Date; app?: NotificationAppItem }[] = [];

  // This block processes applications for staff role to construct transactional alert lines.
  if (role === "USER_STAFF") {
    applications.forEach((app) => {
      // Notification for successfully received application.
      notifications.push({
        id: `${app.id}-received`,
        title: "Permohonan Diterima",
        desc: `Borang caruman zakat anda telah berjaya diterima dan kini sedang disemak.`,
        type: "info",
        date: new Date(app.submittedAt),
        app,
      });

      if (app.status === "APPROVED") {
        // Notification for approved application.
        notifications.push({
          id: `${app.id}-approved`,
          title: "Permohonan Diluluskan",
          desc: `Tahniah! Permohonan caruman zakat anda telah diluluskan dan berkuat kuasa untuk penggajian.`,
          type: "success",
          date: new Date(app.submittedAt),
          app,
        });
      } else if (app.status === "REJECTED") {
        // Notification for rejected application.
        notifications.push({
          id: `${app.id}-rejected`,
          title: "Permohonan Ditolak",
          desc: `Ditolak: ${app.adminNotes || "Sila semak butiran atau hubungi pentadbir."}`,
          type: "error",
          date: new Date(app.submittedAt),
          app,
        });
      }
    });
  } else if (role === "MANAGEMENT_STAFF") {
    // This block compiles alerts for management role regarding incoming staff actions.
    applications.forEach((app) => {
      if (app.status === "PENDING") {
        notifications.push({
          id: `${app.id}-pending-mgmt`,
          title: "Permohonan Baru Masuk",
          desc: `Borang baru daripada ${app.namaPenuh} (${app.noPekerja}) memerlukan penentusahan anda.`,
          type: "info",
          date: new Date(app.submittedAt),
          app,
        });
      } else if (app.status === "REJECTED") {
        notifications.push({
          id: `${app.id}-appeal-mgmt`,
          title: "Rayuan E-mel Sedia Ada",
          desc: `Kakitangan ${app.namaPenuh} mungkin mengemukakan rayuan bagi permohonan yang ditolak.`,
          type: "error",
          date: new Date(app.submittedAt),
          app,
        });
      }
    });
  }

  // This check filters the notifications to find the count of unread items.
  const unreadCount = notifications.filter(n => !readNotifications.includes(n.id)).length;

  // This method marks all notifications as read upon opening the bell menu popover frame.
  const handleTogglePopover = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      const allIds = notifications.map(n => n.id);
      setReadNotifications(allIds);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleTogglePopover}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative p-2 rounded-full text-muted-foreground hover:text-[#002060] hover:bg-muted/50 transition-colors cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#002060]"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 border-[#002060]/20 shadow-2xl bg-white dark:bg-card">
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

        {/* Scrollable list content */}
        <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div key={notif.id} className="p-3.5 hover:bg-muted/10 transition-colors">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {notif.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                    {notif.type === "error" && <XCircle className="h-4 w-4 text-red-600 shrink-0" />}
                    {notif.type === "info" && <Inbox className="h-4 w-4 text-[#002060] shrink-0" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground leading-none">{notif.title}</span>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {notif.date.toLocaleDateString("ms-MY", { day: "2-digit", month: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-normal">{notif.desc}</p>
                    
                    {/* Inline email appeal action button for staff rejected status */}
                    {role === "USER_STAFF" && notif.type === "error" && notif.app && (
                      <div className="pt-2">
                        <Button
                          size="xs"
                          onClick={() => handleEmailAppeal(notif.app!)}
                          className="h-6 text-[10px] font-bold bg-[#002060] hover:bg-[#002060]/90 text-white gap-1 inline-flex items-center rounded-md cursor-pointer"
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
