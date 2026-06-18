// This specialized security interface prompts the user before session destruction and uses smooth hover scaling animations to flag the destructive action button.

"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { signOut } from "next-auth/react";

interface ZakatAuthenticationSignOutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ZakatAuthenticationSignOutConfirmationModalComponent({
  isOpen,
  onClose
}: ZakatAuthenticationSignOutConfirmationModalProps) {
  // This state hook manages the loading state when executing session sign out.
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  // This transition hook manages async route navigation boundaries cleanly.
  const [isPending, startTransition] = React.useTransition();

  // This action dispatch trigger executes NextAuth session destruction and redirects to the login path.
  const handleConfirmSignOut = () => {
    setIsSigningOut(true);
    startTransition(async () => {
      await signOut({ callbackUrl: "/login" });
    });
  };

  return (
    // This layout block renders the dialog modal container structure.
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      
      {/* This container wraps the branding icons, warning message blocks, and option buttons. */}
      <DialogContent className="max-w-md p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
        
        {/* This branding zone displays the university identity logo and warning icon. */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-full flex justify-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <Image
              src="/image_bb5246.png"
              alt="Logo UTHM"
              width={120}
              height={38}
              priority
              className="h-9 w-auto object-contain select-none"
              style={{ width: "auto" }}
            />
          </div>
          <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-650 animate-bounce">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base font-black text-[#002060] dark:text-blue-300">
              Log Keluar Sesi Selamat
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-medium">
              Adakah anda pasti ingin menamatkan sesi keselamatan aktif anda? Sila pastikan segala pindaan caruman zakat dan kemas kini profil peribadi anda telah disimpan dengan lengkap sebelum menceraking sesi.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* This action container layout groups the confirm and cancel buttons side-by-side. */}
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            disabled={isSigningOut || isPending}
            onClick={onClose}
            className="flex-1 bg-[#002060] hover:bg-[#002060]/90 text-white font-bold h-10 px-4 text-xs rounded-lg transition-colors cursor-pointer"
          >
            Tidak, Saya Ingin Kekal
          </Button>
          <Button
            type="button"
            disabled={isSigningOut || isPending}
            onClick={handleConfirmSignOut}
            className="flex-1 border border-slate-200 bg-transparent text-slate-700 hover:text-white dark:border-slate-800 dark:text-slate-300 font-bold h-10 px-4 text-xs rounded-lg transition-all duration-200 hover:scale-105 hover:bg-red-600 hover:border-red-600 cursor-pointer"
          >
            {isSigningOut || isPending ? "Memproses..." : "Ya, Log Keluar"}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
