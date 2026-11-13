/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  Sparkles,
  Award,
  Calendar,
  Building2,
  UserCheck,
  ChevronRight,
  PieChart,
  Target,
  ArrowRight,
  SlidersHorizontal,
  BookmarkCheck,
  Activity,
  FileCheck2,
  Scale
} from "lucide-react";
import unitKerjaData from "../data/unitKerjaData.json";
import { KERANGKA_EVALUASI_RENJA_ESELON2 } from "../data/kerangkaEvaluasiRenjaEselon2Data";

// Tipe Role Pengguna Sesuai Tata Kelola Perencanaan & Penganggaran
export type UserRole = "Operator" | "Approver" | "BINCANG" | "Super Admin";

interface UnitOption {
  kode: string;
  nama: string;
  cluster: string;
  paguDipa: number; // Dalam Rupiah
  targetOutput: string;
  namaPimpinan: string;
  jabatan: string;
}

// Master 16 Unit Kerja Eselon II dengan data pagu & pimpinan resmi
const DAFTAR_UNIT_KERJA: UnitOption[] = unitKerjaData.map((u, idx) => {
  // Simulasi data realistis sesuai karakteristik unit kerja di PPATK
  let pagu = 6912500000;
  let target = "40 Diklat APU PPT (1.200 Peserta)";
  let pimpinan = "Akhyar Effendi, S.E.";
  let jabatan = "Kepala Pusat Pendidikan dan Pelatihan APU PPT";

  if (u.singkatan === "PATIH") {
    pagu = 6912500000;
    target = "40 Paket Diklat APU PPT & 390 Sertifikasi APH";
    pimpinan = "Akhyar Effendi, S.E.";
    jabatan = "Kepala Pusat Pendidikan dan Pelatihan APU PPT";
  } else if (u.singkatan === "KREASI") {
    pagu = 8450000000;
    target = "12 Naskah Advokasi Regulasi & 4 Harmonisasi RUU";
    pimpinan = "Dr. Fithriadi Muslim, S.H., M.H.";
    jabatan = "Direktur Hukum dan Regulasi";
  } else if (u.singkatan === "REKAN") {
    pagu = 14200000000;
    target = "2.850.000 Laporan Transaksi Keuangan Mencurigakan (LTKM)";
    pimpinan = "M. Syahril Ramadhan, S.E., Ak.";
    jabatan = "Direktur Pelaporan";
  } else if (u.singkatan === "SIASAT") {
    pagu = 18900000000;
    target = "640 Hasil Analisis Strategis & Taktis TPPU/TPPT";
    pimpinan = "Drs. Muhammad Novian";
    jabatan = "Direktur Analisis dan Pemeriksaan I";
  } else if (u.singkatan === "PEKA") {
    pagu = 5800000000;
    target = "28 Audit Kepatuhan & Reviu Tata Kelola Pengawasan";
    pimpinan = "Indra Laksmana, Ak., M.M.";
    jabatan = "Inspektur PPATK";
  } else {
    pagu = 5000000000 + (idx * 750000000);
    target = `${15 + idx * 2} Target Kinerja Prioritas Program`;
    pimpinan = `Pejabat Pimpinan ${u.singkatan}`;
    jabatan = `Kepala / Direktur ${u.nama}`;
  }

  return {
    kode: u.singkatan,
    nama: u.nama,
    cluster: u.subcluster,
    paguDipa: pagu,
    targetOutput: target,
    namaPimpinan: pimpinan,
    jabatan: jabatan
  };
});

// Format Angka Rupiah Ringkas (Miliar / Triliun / Juta)
function formatRupiahSingkat(angka: number): string {
  if (angka >= 1000000000000) {
    return `Rp ${(angka / 1000000000000).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} T`;
  }
  if (angka >= 1000000000) {
    return `Rp ${(angka / 1000000000).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`;
  }
  if (angka >= 1000000) {
    return `Rp ${(angka / 1000000).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Jt`;
  }
  return `Rp ${angka.toLocaleString("id-ID")}`;
}

export default function DashboardPage() {
  const currentYear = 2027;

  // 1. Role Pengguna Aktif (Bisa disimulasikan pimpinan / user)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("renja_e2_user_role");
      if (saved && ["Operator", "Approver", "BINCANG", "Super Admin"].includes(saved)) {
        return saved as UserRole;
      }
    } catch {}
    return "Approver";
  });

  // 2. Unit Kerja Aktif (Default PATIH - Pusdiklat APU PPT)
  const [selectedUnitKode, setSelectedUnitKode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("renja_e2_active_unit");
      if (saved && DAFTAR_UNIT_KERJA.some(u => u.kode === saved)) {
        return saved;
      }
    } catch {}
    return "PATIH";
  });

  // Sinkronisasi dengan localStorage & custom event aplikasi
  useEffect(() => {
    const handleRoleChange = () => {
      try {
        const saved = localStorage.getItem("renja_e2_user_role");
        if (saved && ["Operator", "Approver", "BINCANG", "Super Admin"].includes(saved)) {
          setCurrentUserRole(saved as UserRole);
        }
      } catch {}
    };
    window.addEventListener("storage", handleRoleChange);
    window.addEventListener("renja_role_changed", handleRoleChange);
    return () => {
      window.removeEventListener("storage", handleRoleChange);
      window.removeEventListener("renja_role_changed", handleRoleChange);
    };
  }, []);

  const handleChangeRole = (newRole: UserRole) => {
    setCurrentUserRole(newRole);
    try {
      localStorage.setItem("renja_e2_user_role", newRole);
      window.dispatchEvent(new Event("renja_role_changed"));
    } catch {}
  };

  const handleChangeUnit = (newUnit: string) => {
    setSelectedUnitKode(newUnit);
    try {
      localStorage.setItem("renja_e2_active_unit", newUnit);
    } catch {}
  };

  // Unit terpilih saat ini
  const activeUnitInfo = useMemo(() => {
    return DAFTAR_UNIT_KERJA.find(u => u.kode === selectedUnitKode) || DAFTAR_UNIT_KERJA[0];
  }, [selectedUnitKode]);

  // Nama user & jabatan dinamis sesuai role & unit
  const userInfo = useMemo(() => {
    switch (currentUserRole) {
      case "Approver":
        return {
          nama: activeUnitInfo.namaPimpinan,
          jabatan: activeUnitInfo.jabatan,
          instansi: `${activeUnitInfo.nama} (Satker 3365)`,
          badgeText: "Pimpinan Unit Kerja / Pejabat Penandatangan",
          badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800"
        };
      case "BINCANG":
        return {
          nama: "Danang Tri Hartono, S.H.",
          jabatan: "Koordinator Perencanaan dan Penganggaran (BINCANG)",
          instansi: "Biro Perencanaan dan Keuangan PPATK (Satker 453374)",
          badgeText: "Tim Perencana & Evaluator Pusat",
          badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
        };
      case "Operator":
        return {
          nama: "Budi Santoso, S.Sos",
          jabatan: `Penyusun Rencana Kerja & Anggaran ${activeUnitInfo.kode}`,
          instansi: `${activeUnitInfo.nama} (Satker 3365)`,
          badgeText: "Operator Satuan Kerja",
          badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
        };
      case "Super Admin":
        return {
          nama: "Indra Laksmana, Ak., M.M.",
          jabatan: "Inspektur / Administrator Pengawasan Sistem AKSI",
          instansi: "Inspektorat PPATK (APIP Pengawasan Intern)",
          badgeText: "Administrator Pengawasan & Tata Kelola",
          badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        };
    }
  }, [currentUserRole, activeUnitInfo]);

  // 6 Dimensi Evaluasi & Perhitungan Skor Radar (Skala 1 - 5 dan 0 - 100)
  const radarDimensions = useMemo(() => {
    // Skor disesuaikan secara deterministik per unit kerja
    const baseOffset = (selectedUnitKode.charCodeAt(0) % 5) * 0.12;
    const scores = [
      { id: "D1", name: "D1. Penyelarasan Strategis", score: Math.min(4.8, 3.65 + baseOffset), bobot: "20%" },
      { id: "D2", name: "D2. Integrasi Tata Kelola", score: Math.min(4.7, 3.68 + (baseOffset * 0.8)), bobot: "25%" },
      { id: "D3", name: "D3. Analisis Kesenjangan & Akar Masalah", score: Math.min(4.5, 3.35 + (baseOffset * 0.5)), bobot: "20%" },
      { id: "D4", name: "D4. Kesiapan Kolaborasi Lintas Unit", score: Math.min(4.6, 3.25 + (baseOffset * 0.7)), bobot: "15%" },
      { id: "D5", name: "D5. Rasionalitas Target Kinerja", score: Math.min(4.9, 3.20 + (baseOffset * 0.9)), bobot: "15%" },
      { id: "D6", name: "D6. Kepatuhan Tindak Lanjut Pengawasan", score: Math.min(5.0, 4.35 + (baseOffset * 0.4)), bobot: "5%" }
    ];

    const avgScore5 = scores.reduce((acc, d) => acc + d.score, 0) / scores.length;
    const avgScore100 = (avgScore5 / 5) * 100;

    let predikat = "BAIK (MEMADAI)";
    let predikatColor = "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300";
    if (avgScore100 >= 85) {
      predikat = "SANGAT BAIK (OPTIMAL)";
      predikatColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300";
    } else if (avgScore100 < 65) {
      predikat = "CUKUP (PERLU PERBAIKAN)";
      predikatColor = "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300";
    }

    return {
      scores,
      avgScore5,
      avgScore100,
      predikat,
      predikatColor
    };
  }, [selectedUnitKode]);

  // Ranking 16 Unit Kerja (Untuk perspektif BINCANG / Super Admin)
  const ranking16Unit = useMemo(() => {
    return DAFTAR_UNIT_KERJA.map((u, i) => {
      const offset = ((u.kode.charCodeAt(0) * 7 + i * 3) % 18) - 9;
      const score = Math.min(96, Math.max(71, 84 + offset));
      return {
        ...u,
        score
      };
    }).sort((a, b) => b.score - a.score);
  }, []);

  // Alokasi Akun BAS 6-Digit untuk Unit Kerja Aktif (Perspektif Unit / Approver)
  const rincianAkunBas = useMemo(() => {
    const totalPagu = activeUnitInfo.paguDipa;
    return [
      {
        kode: "521211",
        nama: "Belanja Bahan & Konsumsi",
        alokasi: Math.round(totalPagu * 0.28),
        persen: 28,
        kepatuhan: "100% Sesuai SBM (PMK 39/2024)"
      },
      {
        kode: "524111",
        nama: "Belanja Perjalanan Dinas Biasa",
        alokasi: Math.round(totalPagu * 0.34),
        persen: 34,
        kepatuhan: "Sesuai Plafon Tiket Pesawat & Uang Harian"
      },
      {
        kode: "521219",
        nama: "Belanja Non Operasional Lainnya (Honorarium)",
        alokasi: Math.round(totalPagu * 0.18),
        persen: 18,
        kepatuhan: "Sesuai Standar Honor Narasumber"
      },
      {
        kode: "521811",
        nama: "Belanja Barang Persediaan Konsumsi (Kit Diklat)",
        alokasi: Math.round(totalPagu * 0.12),
        persen: 12,
        kepatuhan: "Tercatat di SIMAK BMN"
      },
      {
        kode: "522111",
        nama: "Belanja Langganan Daya dan Jasa",
        alokasi: Math.round(totalPagu * 0.08),
        persen: 8,
        kepatuhan: "Efisiensi 5% dari Usulan Awal"
      }
    ];
  }, [activeUnitInfo]);

  // SVG Helper untuk Radar Chart (Hexagon / 6 Axis)
  const radarSvgData = useMemo(() => {
    const size = 300;
    const center = size / 2;
    const radius = 105;
    const numPoints = 6;
    const angleStep = (Math.PI * 2) / numPoints;

    // Web background polygon points (5 rings: 1 to 5)
    const rings = [1, 2, 3, 4, 5].map(level => {
      const r = (level / 5) * radius;
      const points = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      return { level, path: points.join(" ") };
    });

    // Axis lines
    const axisLines = [];
    const labelPoints = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      axisLines.push({ x1: center, y1: center, x2: x, y2: y });

      // Label coordinate with extra offset
      const labelDist = radius + 28;
      const lx = center + labelDist * Math.cos(angle);
      const ly = center + labelDist * Math.sin(angle);
      labelPoints.push({ x: lx, y: ly, align: Math.abs(angle) < 0.2 ? "middle" : angle > 0 ? "start" : "end" });
    }

    // Data polygon
    const dataPoints = radarDimensions.scores.map((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const val = Math.max(1, Math.min(5, d.score));
      const r = (val / 5) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y, str: `${x},${y}` };
    });

    return {
      size,
      center,
      rings,
      axisLines,
      labelPoints,
      polygonPath: dataPoints.map(p => p.str).join(" "),
      dataPoints
    };
  }, [radarDimensions]);

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. BANNER IDENTITAS EKSEKUTIF & ROLE SIMULATOR ────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-6 md:p-8 shadow-xl border border-indigo-900/40">
        {/* Latar belakang grafis dekoratif */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Sisi Kiri: Profil Eksekutif */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Building2 className="w-3.5 h-3.5" />
                <span>Pusat Pelaporan dan Analisis Transaksi Keuangan</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tahun Anggaran {currentYear}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Peraturan PPATK No. 11/2025
              </span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Dashboard Eksekutif Perencanaan & Penganggaran</span>
              </h1>
              <p className="text-sm md:text-base text-slate-300 mt-1 flex items-center gap-2 font-medium">
                <span>Selamat Datang,</span>
                <span className="text-indigo-300 font-bold underline decoration-indigo-400/50 underline-offset-4">
                  {userInfo.nama}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {userInfo.jabatan} · <span className="text-slate-300">{userInfo.instansi}</span>
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Panel Simulasi Persona & Unit Kerja */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 lg:min-w-[320px] shadow-inner space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulasi Persona & Peran:</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${userInfo.badgeColor}`}>
                {currentUserRole}
              </span>
            </div>

            {/* Pilihan Role Cepat */}
            <div className="grid grid-cols-2 gap-1.5">
              {(["Approver", "BINCANG", "Operator", "Super Admin"] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleChangeRole(role)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-left flex items-center justify-between ${
                    currentUserRole === role
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                      : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <span className="truncate">
                    {role === "Approver" ? "Pimpinan Unit" : role === "BINCANG" ? "BINCANG" : role === "Operator" ? "Operator Satker" : "Inspektorat / Admin"}
                  </span>
                  {currentUserRole === role && <CheckCircle2 className="w-3 h-3 flex-shrink-0 ml-1" />}
                </button>
              ))}
            </div>

            {/* Pilihan Unit Kerja */}
            <div className="pt-1">
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Unit Kerja yang Ditampilkan:
              </label>
              <select
                value={selectedUnitKode}
                onChange={(e) => handleChangeUnit(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {DAFTAR_UNIT_KERJA.map((u) => (
                  <option key={u.kode} value={u.kode}>
                    {u.kode} - {u.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. INDIKATOR KINERJA UTAMA (4 HERO STAT CARDS) ────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Kartu 1: Alokasi Pagu Anggaran TA 2027 */}
        <div className="aksi-card p-5 relative overflow-hidden flex flex-col justify-between group hover:border-indigo-400 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {currentUserRole === "BINCANG" || currentUserRole === "Super Admin"
                  ? "Pagu Anggaran PPATK 2027"
                  : `Pagu Unit: ${activeUnitInfo.kode}`}
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                {currentUserRole === "BINCANG" || currentUserRole === "Super Admin"
                  ? "Rp 1,20 Triliun"
                  : formatRupiahSingkat(activeUnitInfo.paguDipa)}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] truncate">
              {currentUserRole === "BINCANG" || currentUserRole === "Super Admin"
                ? "Program 078.BE & 078.WA"
                : activeUnitInfo.targetOutput}
            </span>
            <Link
              to="/rab/isian"
              className="text-indigo-600 dark:text-indigo-400 font-bold inline-flex items-center gap-0.5 hover:underline"
            >
              <span>RAB</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Kartu 2: Indeks Mutu Dokumen Perencanaan */}
        <div className="aksi-card p-5 relative overflow-hidden flex flex-col justify-between group hover:border-purple-400 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Indeks Mutu Perencanaan
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-purple-600 font-mono">
                  {radarDimensions.avgScore100.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-[var(--text-muted)]">/ 100</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${radarDimensions.predikatColor}`}>
              {radarDimensions.predikat}
            </span>
            <Link
              to="/eselon2/monitoring-penilaian"
              className="text-purple-600 dark:text-purple-400 font-bold inline-flex items-center gap-0.5 hover:underline"
            >
              <span>Audit</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Kartu 3: Kepatuhan Standar Biaya & BAS */}
        <div className="aksi-card p-5 relative overflow-hidden flex flex-col justify-between group hover:border-emerald-400 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Kepatuhan SBM & Plafon SBK
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                100% Patuh
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Unit Cost: Rp 5,66 Jt / Peserta</span>
            <Link
              to="/referensi/asumsi-makro"
              className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-0.5 hover:underline"
            >
              <span>SBM</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Kartu 4: Kesiapan Dokumen Berjenjang */}
        <div className="aksi-card p-5 relative overflow-hidden flex flex-col justify-between group hover:border-amber-400 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Kesiapan Dokumen Renja-RAB
              </p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                4 dari 4 Dokumen
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Siap Telaah Kemenkeu</span>
            </span>
            <Link
              to="/eselon2/monitoring"
              className="text-amber-600 dark:text-amber-400 font-bold inline-flex items-center gap-0.5 hover:underline"
            >
              <span>Status</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3. VISUALISASI UTAMA: RADAR CHART KEMATANGAN PERENCANAAN ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri (7 Spans): Grafik Radar Spider Web */}
        <div className="lg:col-span-7 aksi-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600">
                  <Activity className="w-4 h-4" />
                </span>
                <h2 className="font-bold text-base text-[var(--text)]">
                  Radar Kematangan Dokumen Perencanaan (6 Dimensi)
                </h2>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Profil keselarasan target, efisiensi belanja, dan mitigasi risiko unit:{" "}
                <span className="font-bold text-indigo-600">{activeUnitInfo.kode} ({activeUnitInfo.nama})</span>
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${radarDimensions.predikatColor}`}>
              {radarDimensions.predikat}
            </span>
          </div>

          {/* Container Grafik Radar SVG */}
          <div className="flex items-center justify-center py-2">
            <svg
              viewBox={`0 0 ${radarSvgData.size} ${radarSvgData.size}`}
              className="w-full max-w-[340px] aspect-square overflow-visible"
            >
              {/* Jaring Radar (Grid Rings) */}
              {radarSvgData.rings.map((ring) => (
                <polygon
                  key={ring.level}
                  points={ring.path}
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth={ring.level === 5 ? "1.5" : "0.75"}
                  strokeDasharray={ring.level < 5 ? "2 2" : undefined}
                />
              ))}

              {/* Garis Sumbu (Axis Lines) */}
              {radarSvgData.axisLines.map((axis, i) => (
                <line
                  key={i}
                  x1={axis.x1}
                  y1={axis.y1}
                  x2={axis.x2}
                  y2={axis.y2}
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-700"
                  strokeWidth="0.75"
                />
              ))}

              {/* Area Nilai Realisasi Unit (Data Polygon) */}
              <polygon
                points={radarSvgData.polygonPath}
                fill="rgba(147, 51, 234, 0.25)"
                stroke="#9333ea"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Titik Simpul (Data Nodes) */}
              {radarSvgData.dataPoints.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  className="fill-purple-600 stroke-white dark:stroke-slate-900"
                  strokeWidth="2"
                />
              ))}

              {/* Label Sumbu Dimensi */}
              {radarSvgData.labelPoints.map((lbl, i) => (
                <text
                  key={i}
                  x={lbl.x}
                  y={lbl.y}
                  textAnchor={lbl.align as any}
                  fontSize="7.5"
                  fontWeight="bold"
                  className="fill-slate-600 dark:fill-slate-300"
                >
                  {`D${i + 1}`}
                </text>
              ))}
            </svg>
          </div>

          {/* Footer Keterangan Dimensi Singkat */}
          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Skala Penilaian: 1.0 (Rendah) s.d 5.0 (Optimal)</span>
            <Link
              to="/eselon2/monitoring-penilaian"
              className="text-indigo-600 dark:text-indigo-400 font-bold inline-flex items-center gap-1 hover:underline"
            >
              <span>Buka Analisis Matriks Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Kolom Kanan (5 Spans): Rangkuman Skor Radar & Kontribusi Bobot */}
        <div className="lg:col-span-5 aksi-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Rangkuman Skor Radar Dimensi</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200">
              Skala 1 - 5
            </span>
          </div>

          {/* Daftar 6 Dimensi dengan bar visual */}
          <div className="space-y-3">
            {radarDimensions.scores.map((dim) => {
              const pct = (dim.score / 5) * 100;
              return (
                <div key={dim.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text)] truncate max-w-[200px]">
                      {dim.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-purple-600">
                        {dim.score.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        ({dim.bobot})
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kotak Hasil Konsensus Akhir */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200/80 dark:border-purple-800/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                Nilai Konsensus Akhir Renja:
              </span>
              <span className="text-xl font-black text-purple-700 dark:text-purple-300 font-mono">
                {radarDimensions.avgScore100.toFixed(1)}{" "}
                <span className="text-xs font-semibold text-slate-500">/ 100</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Predikat Mutu:
              </span>
              <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-black border ${radarDimensions.predikatColor}`}>
                {radarDimensions.predikat}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. VISUALISASI DINAMIS BERDASARKAN ROLE PENGGUNA ──────────────── */}
      {currentUserRole === "BINCANG" || currentUserRole === "Super Admin" ? (
        /* PERSPEKTIF BINCANG / SUPER ADMIN: Peringkat Mutu Perencanaan 16 Unit Kerja */
        <div className="aksi-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-[var(--text)]">
                  Peringkat Mutu Dokumen Perencanaan 16 Unit Kerja Eselon II PPATK
                </h3>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Kompilasi nilai konsensus evaluasi terpadu (Renja Eselon II, KAK/TOR, dan Kelayakan RAB) · TA {currentYear}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Skala Standar: 0 - 100</span>
              <Link
                to="/eselon2/monitoring-penilaian"
                className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Berita Acara</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Grid Bar Horizontal Komparasi 16 Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-2">
            {ranking16Unit.map((unit, idx) => {
              const isSelected = unit.kode === selectedUnitKode;
              return (
                <div
                  key={unit.kode}
                  onClick={() => handleChangeUnit(unit.kode)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-400 shadow-xs"
                      : "border-[var(--border)] hover:bg-[var(--accent)]/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        idx < 3 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-bold text-[var(--text)] truncate">{unit.kode}</span>
                      <span className="text-[10px] text-[var(--text-muted)] truncate hidden sm:inline">
                        ({unit.nama})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-indigo-600">
                        {unit.score.toFixed(1)}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                        unit.score >= 85 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}>
                        {unit.score >= 85 ? "Optimal" : "Baik"}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar nilai */}
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0
                          ? "bg-amber-500"
                          : idx < 3
                          ? "bg-indigo-600"
                          : "bg-indigo-400"
                      }`}
                      style={{ width: `${unit.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* PERSPEKTIF PIMPINAN UNIT (APPROVER) / OPERATOR: Komposisi Pagu Belanja & RPD */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sisi Kiri (7 Spans): Komposisi Alokasi Akun BAS 6-Digit */}
          <div className="lg:col-span-7 aksi-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="font-bold text-base text-[var(--text)] flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  <span>Struktur Belanja Rencana Anggaran Biaya (RAB): {activeUnitInfo.kode}</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Rincian alokasi per Bagan Akun Standar (BAS 6-Digit) · Total Pagu: {formatRupiahSingkat(activeUnitInfo.paguDipa)}
                </p>
              </div>
              <Link
                to="/rab/isian"
                className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Input Rinci RAB</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {rincianAkunBas.map((item) => (
                <div key={item.kode} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--accent)]/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200">
                        {item.kode}
                      </span>
                      <span className="font-semibold text-[var(--text)]">{item.nama}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[var(--text)] tabular-nums">
                        {formatRupiahSingkat(item.alokasi)}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] ml-1 font-semibold">
                        ({item.persen}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                      style={{ width: `${item.persen * 2.5}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-0.5">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{item.kepatuhan}</span>
                    </span>
                    <span>Plafon DIPA Terpenuhi</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sisi Kanan (5 Spans): Rencana Penarikan Dana (RPD) Triwulanan */}
          <div className="lg:col-span-5 aksi-card p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Rencana Penarikan Dana (RPD) 2027</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Distribusi target serapan anggaran per Triwulan (Q1 - Q4)
                </p>
              </div>
              <Link to="/rab/rpd" className="text-xs font-bold text-emerald-600 hover:underline">
                Jadwal
              </Link>
            </div>

            <div className="space-y-4">
              {[
                { tw: "Triwulan I (Jan - Mar)", target: "15%", nominal: formatRupiahSingkat(activeUnitInfo.paguDipa * 0.15), fokus: "Persiapan TOR & Pengadaan Diklat APH", barColor: "bg-blue-500" },
                { tw: "Triwulan II (Apr - Jun)", target: "35%", nominal: formatRupiahSingkat(activeUnitInfo.paguDipa * 0.35), fokus: "Penyelenggaraan 16 Gelombang Diklat", barColor: "bg-emerald-500" },
                { tw: "Triwulan III (Jul - Sep)", target: "30%", nominal: formatRupiahSingkat(activeUnitInfo.paguDipa * 0.30), fokus: "Sertifikasi Kompetensi & Ujian Keahlian", barColor: "bg-indigo-500" },
                { tw: "Triwulan IV (Okt - Des)", target: "20%", nominal: formatRupiahSingkat(activeUnitInfo.paguDipa * 0.20), fokus: "Penyusunan LPJ & Tutup Buku Anggaran", barColor: "bg-purple-500" },
              ].map((rpd) => (
                <div key={rpd.tw} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[var(--text)]">{rpd.tw}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                      {rpd.nominal} ({rpd.target})
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${rpd.barColor} rounded-full`}
                      style={{ width: rpd.target }}
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">{rpd.fokus}</p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <span className="font-semibold">Target Deviasi Hal. III DIPA: Maksimal 5%</span>
              <span className="badge badge-primary text-[10px]">Patuh PMK 62</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. PIPELINE STATUS TAHAPAN DOKUMEN BERJENJANG ────────────────── */}
      <div className="aksi-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h3 className="font-bold text-base text-[var(--text)] flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Pipeline Kesiapan Dokumen Perencanaan & Penganggaran Berjenjang</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Alur validasi bertingkat mulai dari Rencana Strategis hingga Penetapan Anggaran DIPA TA {currentYear}
            </p>
          </div>
          <span className="badge badge-primary text-[10px]">Siklus RKA-K/L 2027</span>
        </div>

        {/* Stepper Grid 4 Tahapan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              tahap: "1. Renja Eselon I",
              dokumen: "SETIA (Sekretariat Utama)",
              status: "Disahkan Sestama",
              statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
              desc: "13 Program Prioritas Nasional & Reformasi Birokrasi telah terkunci",
              link: "/eselon1/evaluasi-strategis",
              icon: BookmarkCheck
            },
            {
              tahap: "2. Renja Eselon II",
              dokumen: `Rencana Kerja ${activeUnitInfo.kode}`,
              status: "Konsensus Selesai",
              statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
              desc: "40 Rincian Output & target kinerja selaras dengan Renstra PPATK",
              link: "/eselon2/monitoring-penilaian",
              icon: CheckCircle2
            },
            {
              tahap: "3. KAK / TOR Output",
              dokumen: "Kerangka Acuan Kerja",
              status: "Terverifikasi",
              statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
              desc: "Metode, tahapan pelaksanaan, dan justifikasi pengadaan lengkap",
              link: "/kak/monitoring-penilaian",
              icon: FileText
            },
            {
              tahap: "4. Rencana Anggaran (RAB)",
              dokumen: "RAB Rinci & SBK",
              status: "Siap Telaah",
              statusColor: "text-blue-600 bg-blue-50 border-blue-200",
              desc: "Pagu terverifikasi 5 akun BAS dan patuh batasan biaya masukan",
              link: "/rab/monitoring-penilaian",
              icon: Scale
            }
          ].map((step, idx) => (
            <div
              key={step.tahap}
              className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--accent)]/20 hover:border-indigo-400 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {step.tahap}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${step.statusColor}`}>
                    {step.status}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[var(--text)] flex items-center gap-1.5">
                  <step.icon className="w-4 h-4 text-indigo-600" />
                  <span>{step.dokumen}</span>
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <Link
                to={step.link}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center justify-between pt-2 border-t border-[var(--border)]"
              >
                <span>Buka Dokumen</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. CATATAN STRATEGIS EVALUATOR & AKSES MODUL KUNCI ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri (8 Spans): Catatan Penelaahan & Rekomendasi Prioritas */}
        <div className="lg:col-span-8 aksi-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="font-bold text-base text-[var(--text)] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Catatan & Rekomendasi Penelaahan Perencanaan</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Tindak lanjut penyesuaian dokumen sebelum forum penelaahan bersama Kemenkeu & Bappenas
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
              3 Rekomendasi
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                penilai: "Tim Penganggaran (BINCANG)",
                dokumen: "RAB Akun 524111 (Perjadin Luar Kota)",
                catatan: "Pastikan lampiran surat undangan dan estimasi riil tiket pesawat rute Jakarta-Jayapura menggunakan tarif kelas ekonomi sesuai batas pagu PMK Standar Biaya Masukan.",
                status: "Perlu Kelengkapan Tiket",
                urgensi: "bg-blue-50 text-blue-700 border-blue-200"
              },
              {
                penilai: "Tim Perencanaan (BINCANG)",
                dokumen: "Renja Eselon II (Cascading Indikator Kinerja)",
                catatan: "Penajaman indikator persentase Aparat Penegak Hukum yang lulus uji sertifikasi TPPU agar secara eksplisit terhubung dengan Indikator Kinerja Sasaran Strategis (IKSS 2.1).",
                status: "Telah Disesuaikan",
                urgensi: "bg-emerald-50 text-emerald-700 border-emerald-200"
              },
              {
                penilai: "Inspektorat PPATK (APIP)",
                dokumen: "TOR / KAK Pengadaan Sarana Prasarana",
                catatan: "Sertakan hasil reviu HPS (Harga Perkiraan Sendiri) dan analisis ketersediaan produk dalam negeri (P3DN/TKDN) minimal 40% untuk pengadaan perangkat IT pendukung diklat.",
                status: "Prioritas Reviu APIP",
                urgensi: "bg-amber-50 text-amber-700 border-amber-200"
              }
            ].map((rekom, i) => (
              <div key={i} className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--accent)]/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text)]">{rekom.penilai}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rekom.urgensi}`}>
                    {rekom.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {rekom.dokumen}
                </p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {rekom.catatan}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan (4 Spans): Tautan Cepat Navigasi Modul */}
        <div className="lg:col-span-4 aksi-card p-6 flex flex-col justify-between space-y-4">
          <div className="pb-3 border-b border-[var(--border)]">
            <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-indigo-600" />
              <span>Akses Cepat Modul Utama</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Pintasan langsung ke instrumen perencanaan
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <Link
              to="/eselon2/bab-1"
              className="p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] transition-colors flex items-center justify-between group"
            >
              <div>
                <p className="font-bold text-[var(--text)] group-hover:text-indigo-600">
                  Formulir Renja Eselon II
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">Pengisian Bab I s.d Bab III</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </Link>

            <Link
              to="/kak/isian"
              className="p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] transition-colors flex items-center justify-between group"
            >
              <div>
                <p className="font-bold text-[var(--text)] group-hover:text-indigo-600">
                  Penyusunan Kerangka Acuan (TOR)
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">Rincian Output & Jadwal Kegiatan</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </Link>

            <Link
              to="/rab/isian"
              className="p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] transition-colors flex items-center justify-between group"
            >
              <div>
                <p className="font-bold text-[var(--text)] group-hover:text-indigo-600">
                  Rencana Anggaran Biaya (RAB)
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">Kalkulator Rinci 5 Akun BAS</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </Link>

            <Link
              to="/referensi/series-anggaran"
              className="p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] transition-colors flex items-center justify-between group"
            >
              <div>
                <p className="font-bold text-[var(--text)] group-hover:text-indigo-600">
                  Series Anggaran PPATK
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">Histori Pagu & Realisasi 2020-2025</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </Link>
          </div>

          <div className="pt-2 border-t border-[var(--border)] text-center">
            <span className="text-[11px] text-slate-400">
              Sistem Informasi AKSI PPATK · Versi 2.4 (2026/2027)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
