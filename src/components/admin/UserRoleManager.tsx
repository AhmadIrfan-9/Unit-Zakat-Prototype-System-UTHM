"use client";

import React, { useState } from "react";
import ActionStatusOverlay from "@/components/zakat/ActionStatusOverlay";
import { updateUserRoleAction } from "@/app/actions/admin";

interface UserRoleManagerProps {
  userId: string;
  userName: string;
  currentRole: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserRoleManager({
  userId,
  userName,
  currentRole,
  isOpen,
  onClose,
  onSuccess,
}: UserRoleManagerProps) {
  const [newRole, setNewRole] = useState<string>(currentRole);
  const [justification, setJustification] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Map database role to user friendly label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Pentadbir Tertinggi (SUPER_ADMIN)";
      case "ZAKAT_OFFICER":
      case "MANAGEMENT":
        return "Pegawai Pengurusan (MANAGEMENT)";
      case "STAFF":
      default:
        return "Kakitangan Biasa (STAFF)";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const result = await updateUserRoleAction(userId, newRole, justification);
      
      if (result.success) {
        setStatus("success");
        // Wait 2 seconds for user to see the success checkmark before closing
        setTimeout(() => {
          setStatus("idle");
          setJustification("");
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setStatus("idle");
        setErrorMessage(result.error || "Gagal mengemas kini peranan pengguna.");
      }
    } catch (err) {
      setStatus("idle");
      const message = err instanceof Error ? err.message : "Berlaku ralat sistem yang tidak dijangka.";
      setErrorMessage(message);
    }
  };

  const isSubmitDisabled = justification.trim().length < 5 || newRole === currentRole || status === "loading";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden transform transition-all duration-300 scale-100 animate-in zoom-in-95">
          {/* Header */}
          <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Urus Peranan Pengguna
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kemaskini tahap keselamatan dan kebenaran sistem
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* User Info Capsule */}
            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Nama Pengguna:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{userName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Peranan Semasa:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {getRoleLabel(currentRole)}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg border border-red-100 dark:border-red-900 flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Dropdown - New Role */}
            <div className="space-y-1">
              <label htmlFor="newRole" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Pilih Peranan Baharu <span className="text-red-500">*</span>
              </label>
              <select
                id="newRole"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="STAFF">Kakitangan Biasa (STAFF)</option>
                <option value="MANAGEMENT">Pegawai Pengurusan (MANAGEMENT)</option>
                <option value="SUPER_ADMIN">Pentadbir Tertinggi (SUPER_ADMIN)</option>
              </select>
            </div>

            {/* Textarea - Justification */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <label htmlFor="justification" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Justifikasi Alasan Perubahan <span className="text-red-500">*</span>
                </label>
                {justification.trim().length === 0 && (
                  <span className="text-xs text-red-500 mt-0.5 font-medium animate-pulse">Wajib diisi</span>
                )}
              </div>
              <textarea
                id="justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={3}
                placeholder="Sila masukkan justifikasi penukaran peranan (cth: Kenaikan pangkat ke Pegawai Zakat UTHM)..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`px-5 py-2 text-white text-sm font-semibold rounded-lg transition-all ${
                  isSubmitDisabled
                    ? "bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
                }`}
              >
                Kemaskini Peranan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Action Overlay */}
      <ActionStatusOverlay
        status={status}
        message="Tahniah! Peranan akaun telah berjaya dikemas kini"
      />
    </>
  );
}
