/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Users
} from "lucide-react";
import {
  SystemNotification,
  getStoredNotifications,
  saveStoredNotifications,
  DAFTAR_PERAN,
  DAFTAR_UNIT_KERJA_PPATK
} from "../../data/userManagementData";

export default function KelolaNotifikasiPage() {
  const [notifs, setNotifs] = useState<SystemNotification[]>(getStoredNotifications);
  const [judul, setJudul] = useState("");
  const [pesan, setPesan] = useState("");
  const [kategori, setKategori] = useState<"Penting" | "Info" | "Peringatan" | "Tindak Lanjut">("Info");
  const [targetPeran, setTargetPeran] = useState("Semua Pengguna");
  const [targetUnit, setTargetUnit] = useState("Semua Unit");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const handleUpdate = () => {
      setNotifs(getStoredNotifications());
    };
    window.addEventListener("aksi_notifications_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("aksi_notifications_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleKirimNotifikasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !pesan.trim()) return;

    const newNotif: SystemNotification = {
      id: `NOTIF-${Date.now()}`,
      judul: judul.trim(),
      pesan: pesan.trim(),
      kategori: kategori,
      waktu: "Baru saja",
      targetPeran: targetPeran,
      targetUnit: targetUnit !== "Semua Unit" ? targetUnit : undefined,
      dibaca: false,
    };

    const updated = [newNotif, ...notifs];
    setNotifs(updated);
    saveStoredNotifications(updated);

    setJudul("");
    setPesan("");
    setSuccessMsg("Notifikasi baru berhasil diterbitkan dan langsung muncul pada lonceng notifikasi menu atas!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleHapusNotif = (id: string) => {
    const updated = notifs.filter((n) => n.id !== id);
    setNotifs(updated);
    saveStoredNotifications(updated);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary text-[0.65rem] font-bold">ADMINISTRASI & PENGGUNA</span>
            <span className="text-xs text-[var(--text-muted)]">Pusat Komunikasi & Notifikasi Sistem</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[var(--text)] flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-500" />
            <span>Kelola Notifikasi Sistem</span>
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] mt-0.5">
            Terbitkan pengumuman, instruksi penelaahan, dan batas waktu perencanaan yang tampil pada tombol lonceng notifikasi menu atas.
          </p>
        </div>
      </div>

      {/* Alert Sukses */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Form Input Notifikasi & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Input (7 Spans) */}
        <div className="lg:col-span-7 aksi-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                <Send className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-[var(--text)]">Formulir Terbitan Notifikasi Baru</h2>
            </div>
            <span className="badge badge-primary text-[10px]">Real-Time Broadcast</span>
          </div>

          <form onSubmit={handleKirimNotifikasi} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[var(--text)] block mb-1">
                Judul Notifikasi / Pengumuman <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Pembukaan Forum Penelaahan Pagu Alokasi 2027"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[var(--text)] block mb-1">
                Isi Pesan Notifikasi <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Tuliskan isi pesan atau arahan tindak lanjut untuk pegawai / evaluator..."
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-[var(--text)] block mb-1">Kategori / Urgensi</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-medium"
                >
                  <option value="Info">Info (Biru)</option>
                  <option value="Penting">Penting (Merah)</option>
                  <option value="Peringatan">Peringatan (Kuning)</option>
                  <option value="Tindak Lanjut">Tindak Lanjut (Ungu)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[var(--text)] block mb-1">Sasaran Peran</label>
                <select
                  value={targetPeran}
                  onChange={(e) => setTargetPeran(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-medium"
                >
                  <option value="Semua Pengguna">Semua Pengguna</option>
                  {DAFTAR_PERAN.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[var(--text)] block mb-1">Sasaran Unit</label>
                <select
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-medium"
                >
                  <option value="Semua Unit">Semua Unit</option>
                  {DAFTAR_UNIT_KERJA_PPATK.map((u) => (
                    <option key={u.kode} value={u.kode}>
                      {u.kode}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Terbitkan Notifikasi</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Dropdown Lonceng (5 Spans) */}
        <div className="lg:col-span-5 aksi-card p-6 flex flex-col justify-between space-y-4">
          <div className="pb-3 border-b border-[var(--border)]">
            <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Pratinjau Tampilan di Tombol Lonceng</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Simulasi tampilan pada menu atas saat pengguna mengklik ikon lonceng.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Pemberitahuan Sistem
              </span>
              <span className="badge badge-red text-[10px]">{notifs.length} Aktif</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {notifs.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {n.judul}
                    </p>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border flex-shrink-0 ${
                        n.kategori === "Penting"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : n.kategori === "Peringatan"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : n.kategori === "Tindak Lanjut"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {n.kategori}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    {n.pesan}
                  </p>
                  <span className="text-[10px] text-indigo-600 font-semibold block pt-0.5">
                    {n.waktu}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Setiap notifikasi baru akan langsung disinkronkan ke seluruh pengguna secara instan.
          </p>
        </div>
      </div>

      {/* Tabel Daftar Notifikasi Aktif */}
      <div className="aksi-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-[var(--text)]">Daftar Notifikasi yang Sedang Aktif</h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{notifs.length} Notifikasi Tersimpan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--accent)] text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-3 w-56">Judul Notifikasi</th>
                <th className="py-3 px-3">Isi Pesan Notifikasi</th>
                <th className="py-3 px-3 text-center w-28">Kategori</th>
                <th className="py-3 px-3 w-32">Sasaran Target</th>
                <th className="py-3 px-3 w-32">Waktu Terbit</th>
                <th className="py-3 px-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {notifs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada notifikasi yang diterbitkan. Gunakan formulir di atas untuk membuat notifikasi.
                  </td>
                </tr>
              ) : (
                notifs.map((n, idx) => (
                  <tr key={n.id} className="hover:bg-[var(--accent)]/40 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-[var(--text)]">{n.judul}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                      {n.pesan}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          n.kategori === "Penting"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : n.kategori === "Peringatan"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : n.kategori === "Tindak Lanjut"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {n.kategori}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                      {n.targetPeran || "Semua"} {n.targetUnit ? `(${n.targetUnit})` : ""}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{n.waktu}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleHapusNotif(n.id)}
                        title="Hapus Notifikasi"
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
