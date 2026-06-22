"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle, Loader2, Mail, Search } from "lucide-react";
import { fetchUserManagementList, deleteUserAction } from "@/app/actions/zakatWorkflowManagementServerActions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  noPekerja: string | null;
  noKP: string | null;
  fakulti: string | null;
  createdAt: Date;
}

export function ZakatManagementUserVerificationTableDataFeed() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPendingTransition, startTransition] = useTransition();

  // Load the list of users from the server action on mount
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUserManagementList();
      // Ensure date objects are correctly initialized
      const formatted = data.map((u) => ({
        ...u,
        createdAt: new Date(u.createdAt),
      }));
      setUsers(formatted);
    } catch (err) {
      console.error("Error loading users:", err);
      toast.error("Gagal memuatkan senarai kakitangan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Main database deletion routine after validation confirm check
  const executeDatabaseDeleteAction = (userId: string) => {
    startTransition(async () => {
      const res = await deleteUserAction(userId);
      if (res.success) {
        toast.success("Akaun kakitangan berjaya dipadamkan.");
        loadUsers();
      } else {
        toast.error(res.error || "Ralat berlaku semasa pemadaman.");
      }
    });
  };

  // Incremental patch protecting user removal compliance rows by forcing an explicit notification email dispatch before unlock.
  const handleDefensiveDeleteInitiation = (userEmail: string | null | undefined, staffName: string, userId: string) => {
    const emailTo = userEmail ?? "unitzakat@uthm.edu.my";
    const subject = "Notifikasi Pembatalan Akses Portal Zakat UTHM";
    const body = `Assalamualaikum sdr/sdri ${staffName},\n\nSila ambil maklum bahawa akaun portal zakat gaji anda akan dipadamkan daripada pangkalan data pusat berikutan kemas kini rekod struktur perkhidmatan terbaharu.\n\nSalam Pentadbiran,\nUnit Pengurusan Zakat UTHM.`;
    
    // 1. Lancarkan client side email handler dengan parameter teks template siap bina
    window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // 2. Paparkan dialog pengesahan berperingkat untuk membuka kunci butang database mutation
    const userConfirmedEmailSent = confirm(`Sistem telah membuka pelayar emel untuk menghantar notifikasi kepada ${staffName}.\n\nAdakah anda sudah selesai menghantar emel tersebut dan pasti untuk meneruskan pemadaman akaun?`);
    
    if (userConfirmedEmailSent) {
      // Jalankan fungsi mutasi server action pangkalan data asal anda di sini
      executeDatabaseDeleteAction(userId);
    }
  };

  // Filter the list of users based on search string
  const filteredUsers = users.filter((u) => {
    const name = (u.name || "").toLowerCase();
    const email = u.email.toLowerCase();
    const staffNo = (u.noPekerja || "").toLowerCase();
    const kpNo = (u.noKP || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return (
      name.includes(search) ||
      email.includes(search) ||
      staffNo.includes(search) ||
      kpNo.includes(search)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Filter Bar */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, emel atau no. pekerja..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs focus-visible:ring-[#002060] focus-visible:border-[#002060]"
          />
        </div>
      </div>

      <div className="border border-border bg-white dark:bg-card rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="px-5 py-3.5">Nama & Profil Staf</th>
                <th className="px-5 py-3.5">Emel Rasmi</th>
                <th className="px-5 py-3.5">No. Pekerja / KP</th>
                <th className="px-5 py-3.5">Fakulti</th>
                <th className="px-5 py-3.5">Tarikh Daftar</th>
                <th className="px-5 py-3.5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#002060]" />
                      <span>Sila tunggu, memuatkan maklumat kakitangan...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-foreground">{u.name || "N/A"}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">ID: {u.id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-700 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-muted-foreground">
                      <div>Staf: {u.noPekerja || "-"}</div>
                      <div className="text-[10px] font-mono">KP: {u.noKP || "-"}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#002060]/10 text-[#002060]">
                        {u.fakulti || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {u.createdAt.toLocaleDateString("ms-MY", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPendingTransition}
                        onClick={() => handleDefensiveDeleteInitiation(u.email, u.name || "Kakitangan", u.id)}
                        className="text-red-650 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Padam Akses</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground italic font-medium">
                    Tiada rekod kakitangan ditemui.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
