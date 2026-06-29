"use client";

import React, { useState } from "react";
import { createNewsAction } from "@/app/actions/news";
import ActionStatusOverlay from "@/components/zakat/ActionStatusOverlay";

export default function NewsCreateFormClient() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("WARTA NISAB 2026");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");
  const [submitting, setSubmitting] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setSubmitting("loading");

    const result = await createNewsAction({ title, category, content, status });

    if (result.success) {
      setSubmitting("success");
      setTitle("");
      setContent("");
      setTimeout(() => {
        setSubmitting("idle");
        window.location.reload(); // Muat semula untuk papar kad berita baharu
      }, 2500);
    } else {
      setSubmitting("idle");
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm text-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block font-semibold mb-1 text-xs text-gray-600">Tajuk Berita / Pekeliling</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masukkan tajuk berita..." 
            className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-blue-900 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-xs text-gray-600">Kategori Tag</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2.5 border rounded-lg bg-white focus:outline-none"
          >
            <option value="WARTA NISAB 2026">WARTA NISAB 2026</option>
            <option value="PANDUAN HAUL">PANDUAN HAUL</option>
            <option value="REBAT CUKAI">REBAT CUKAI</option>
            <option value="HEBAHAN AM">HEBAHAN AM</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1 text-xs text-gray-600">Isi Kandungan Berita</label>
        <textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Tulis butiran atau tampal artikel rasmi di sini..." 
          className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-blue-900 focus:outline-none font-sans"
          required
        />
      </div>

      <div className="flex justify-end gap-3 items-center">
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
          className="p-2 border rounded-lg bg-gray-50 text-xs font-medium"
        >
          <option value="PUBLISHED">Terbit Terus (Public)</option>
          <option value="DRAFT">Simpan Sebagai Draft</option>
        </select>
        
        <button
          type="submit"
          disabled={!title || !content}
          className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-medium rounded-lg text-xs transition-colors disabled:bg-gray-200 disabled:text-gray-400"
        >
          Hantar &amp; Proses AI
        </button>
      </div>

      <ActionStatusOverlay status={submitting} message="Borang anda telah berjaya dihantar untuk diproses" />
    </form>
  );
}
