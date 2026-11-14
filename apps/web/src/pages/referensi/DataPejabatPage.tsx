/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Search,
  Building2,
  FileCheck2,
  Award,
  Sparkles,
  Users,
  Shield,
  ArrowRight,
  UserCheck
} from "lucide-react";
import {
  UserAccount,
  getStoredUsers,
  isPejabatJabatan
} from "../../data/userManagementData";

export default function DataPejabatPage() {
  const [users, setUsers] = useState<UserAccount[]>(getStoredUsers);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleUpdate = () => {
      setUsers(getStoredUsers());
    };
    window.addEventListener("aksi_users_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("aksi_users_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Filter hanya pengguna yang menjabat Kepala PPATK, Deputi, Kepala Pusat, Kepala Biro, atau Direktur
  const pejabatList = useMemo(() => {
    return users.filter((u) => isPejabatJabatan(u.jabatan));
  }, [users]);

  // Filter pencarian
  const filteredPejabat = useMemo(() => {
    return pejabatList.filter((p) => {
      return (
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nip.includes(searchQuery) ||
        p.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.unitKerja.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [pejabatList, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary text-[0.65rem] font-bold">ADMINISTRASI & PENGGUNA</span>
            <span className="text-xs text-[var(--text-muted)]">Otoritas Penandatangan Dokumen</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[var(--text)] flex items-center gap-2">
            <BadgeCheck className="w-6 h-6 text-emerald-600" />
            <span>Data Pejabat PPATK</span>
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] mt-0.5">
            Daftar pejabat struktural berwenang menandatangani Renstra, Renja Eselon I, Renja Eselon II, KAK/TOR, dan RAB DIPA.
          </p>
        </div>

        <Link
          to="/admin/pengguna"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 text-xs font-bold transition-all self-start sm:self-auto"
        >
          <Users className="w-4 h-4" />
          <span>Kelola Akun di Daftar Pengguna</span>
        </Link>
      </div>

      {/* Banner Penjelasan Sinkronisasi Otomatis */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-blue-50/50 border border-emerald-200/80 text-xs text-emerald-950 dark:bg-slate-900 dark:border-emerald-900/60 dark:text-emerald-200 flex items-start gap-3 shadow-xs">
        <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Data Terhubung Dinamis dengan Manajemen Pengguna:
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Halaman ini secara otomatis menyaring seluruh pengguna yang memiliki jabatan struktural utama:{" "}
            <b>Kepala PPATK, Deputi, Kepala Pusat, Kepala Biro, dan Direktur</b>. Setiap perubahan nama, NIP, atau jabatan pada menu{" "}
            <Link to="/admin/pengguna" className="underline font-bold text-emerald-800 dark:text-emerald-300">
              Daftar Pengguna & Role
            </Link>{" "}
            langsung tercermin di sini.
          </p>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="aksi-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pejabat, NIP, jabatan, atau unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="text-xs text-[var(--text-muted)] font-semibold">
          Menampilkan <span className="text-emerald-600 font-bold">{filteredPejabat.length}</span> Pejabat Penandatangan Resmi
        </div>
      </div>

      {/* Grid Kartu Pejabat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPejabat.map((pejabat) => {
          // Penentuan wewenang penandatanganan dokumen berdasarkan jabatan
          let wewenang = ["Penandatangan Dokumen Internal"];
          if (pejabat.jabatan.toLowerCase().includes("kepala ppatk")) {
            wewenang = ["Pengesahan Akhir Renstra PPATK", "Penetapan Alokasi DIPA K/L", "Persetujuan RKA-K/L"];
          } else if (pejabat.jabatan.toLowerCase().includes("sekretaris utama")) {
            wewenang = ["Penandatangan Renja SETIA (Eselon I)", "KPA Satker Sekretariat Utama", "Pengusulan Revisi Anggaran"];
          } else if (pejabat.jabatan.toLowerCase().includes("deputi")) {
            wewenang = ["Pengesahan Renja Eselon I Bidang", "Evaluasi Kinerja Kedeputian", "Pengendalian Output Strategis"];
          } else if (pejabat.jabatan.toLowerCase().includes("kepala pusat") || pejabat.jabatan.toLowerCase().includes("direktur")) {
            wewenang = ["Penandatangan Renja Eselon II", "Pengesahan KAK / TOR Output", "Penetapan Kebutuhan RAB Rinci"];
          } else if (pejabat.jabatan.toLowerCase().includes("kepala biro")) {
            wewenang = ["Konsolidasi RKA-K/L Lembaga", "Reviu Kepatuhan SBM/SBK", "Penelaahan Bersama DJA Kemenkeu"];
          }

          return (
            <div
              key={pejabat.id}
              className="aksi-card p-5 space-y-4 hover:border-emerald-400 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
                    {pejabat.nama.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text)] group-hover:text-emerald-600 transition-colors">
                      {pejabat.nama}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {pejabat.jabatan}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    pejabat.status === "Online"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {pejabat.status}
                </span>
              </div>

              <div className="space-y-2 text-xs pt-2 border-t border-[var(--border)]">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)] font-medium">NIP / NRP:</span>
                  <span className="font-mono font-bold text-[var(--text)]">{pejabat.nip}</span>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <span className="text-[var(--text-muted)] font-medium flex-shrink-0">Unit Kerja:</span>
                  <span className="font-semibold text-right text-slate-800 dark:text-slate-200">
                    {pejabat.unitKerja}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                    Kewenangan Dokumen Perencanaan:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {wewenang.map((w, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        ✓ {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
