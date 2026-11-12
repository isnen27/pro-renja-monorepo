import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
  TrendingUp,
  FileText,
  Lock,
  ArrowRight,
  Eye,
  Check,
  Printer,
  ChevronDown,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import {
  KERANGKA_EVALUASI_RENJA_ESELON2,
  DimensiEvaluasi,
  SubDimensiEvaluasi,
} from "../../data/kerangkaEvaluasiRenjaEselon2Data";
import { UserRole } from "../rab/PilihHistoriRabPage";

// Interface profil evaluator
export interface EvaluatorProfile {
  id: string;
  nama: string;
  nip: string;
  tim: "Tim Perencanaan (BINCANG)" | "Tim Penganggaran (BINCANG)" | "Inspektorat (PEKA)";
  roleBadge: string;
  badgeColor: string;
}

export const LIST_EVALUATOR: EvaluatorProfile[] = [
  {
    id: "eval-ren-1",
    nama: "Drs. Hendra Setiawan, M.Si",
    nip: "197805122002121001",
    tim: "Tim Perencanaan (BINCANG)",
    roleBadge: "Perencana Ahli Madya",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  },
  {
    id: "eval-ang-1",
    nama: "Siti Rahmawati, S.E., M.Ak",
    nip: "198204192006042002",
    tim: "Tim Penganggaran (BINCANG)",
    roleBadge: "Analis Anggaran Ahli Muda",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  {
    id: "eval-insp-1",
    nama: "Bambang Trianto, S.H., CFrA",
    nip: "197509181999031003",
    tim: "Inspektorat (PEKA)",
    roleBadge: "Auditor Ahli Madya",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
  },
];

export interface UnitEselon1Option {
  kode: string;
  nama: string;
}

export const LIST_ESELON1_UNITS: UnitEselon1Option[] = [
  { kode: "SETIA", nama: "Sekretariat Utama" },
  { kode: "TEGAS", nama: "Deputi Bidang Strategi dan Kerja Sama" },
  { kode: "PENGASUH", nama: "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan" },
  { kode: "ASA", nama: "Deputi Bidang Analisis Transaksi Keuangan" },
];

export default function MonitoringPenilaianRenjaEselon2Page() {
  // Current user role
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("renja_e2_user_role");
      if (saved && ["Operator", "Approver", "BINCANG", "Super Admin"].includes(saved)) {
        return saved as UserRole;
      }
    } catch {}
    return "BINCANG";
  });

  // Sinkronisasi event role
  useEffect(() => {
    const handleRole = () => {
      try {
        const saved = localStorage.getItem("renja_e2_user_role");
        if (saved) setCurrentUserRole(saved as UserRole);
      } catch {}
    };
    window.addEventListener("storage", handleRole);
    window.addEventListener("renja_role_changed", handleRole);
    return () => {
      window.removeEventListener("storage", handleRole);
      window.removeEventListener("renja_role_changed", handleRole);
    };
  }, []);

  // Filter & Selected state
  const [selectedUnit, setSelectedUnit] = useState<string>("SETIA");
  const [selectedTimFilter, setSelectedTimFilter] = useState<string>("Semua Tim");
  const [activeTabDetail, setActiveTabDetail] = useState<"kompilasi" | "matriks_subdimensi" | "berita_acara">("kompilasi");

  const tahunAnggaran = 2027;

  // Akses eksklusif: Approver BINCANG dan Super Admin
  const hasAccess = currentUserRole === "BINCANG" || currentUserRole === "Super Admin";

  // Data skoring simulasi per evaluator untuk unit terpilih
  const evaluationRecords = useMemo(() => {
    // Skor dasar untuk masing-masing evaluator
    // Evaluator 1: Tim Perencanaan (fokus ke alignment & cascading)
    // Evaluator 2: Tim Penganggaran (fokus ke resource & gap kuantitatif)
    // Evaluator 3: Inspektorat (fokus ke compliance, BPK & SPIP)
    return LIST_EVALUATOR.map((evaluator) => {
      const storageKey = `evaluasi_renja_eselon2_${selectedUnit}_${tahunAnggaran}_${evaluator.id}`;
      let scoresMap: Record<string, number> = {};

      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          scoresMap = JSON.parse(saved);
        }
      } catch {}

      // Default mock yang realistis sesuai karakter spesialisasi evaluator
      if (Object.keys(scoresMap).length === 0) {
        if (evaluator.tim === "Tim Perencanaan (BINCANG)") {
          scoresMap = {
            "1.1": 4, "1.2": 4, "1.3": 4,
            "2.1": 4, "2.2": 4, "2.3": 3,
            "3.1": 4, "3.2": 4, "3.3": 4,
            "4.1": 4, "4.2": 3, "4.3": 3,
          };
        } else if (evaluator.tim === "Tim Penganggaran (BINCANG)") {
          scoresMap = {
            "1.1": 4, "1.2": 3, "1.3": 3,
            "2.1": 3, "2.2": 3, "2.3": 4,
            "3.1": 4, "3.2": 3, "3.3": 3,
            "4.1": 4, "4.2": 4, "4.3": 4,
          };
        } else {
          // Inspektorat
          scoresMap = {
            "1.1": 3, "1.2": 4, "1.3": 4,
            "2.1": 4, "2.2": 4, "2.3": 3,
            "3.1": 4, "3.2": 3, "3.3": 4,
            "4.1": 3, "4.2": 4, "4.3": 4,
          };
        }
      }

      // Hitung skor dimensi dan total
      let totalSkala5 = 0;
      const skorPerDimensi: Record<number, number> = {};

      KERANGKA_EVALUASI_RENJA_ESELON2.forEach((dim) => {
        let subSum = 0;
        dim.subDimensi.forEach((sub) => {
          const val = scoresMap[sub.id] || 3;
          subSum += val * sub.bobot;
        });
        skorPerDimensi[dim.id] = subSum;
        totalSkala5 += subSum * dim.bobot;
      });

      const totalSkala100 = (totalSkala5 / 5) * 100;

      return {
        evaluator,
        scoresMap,
        skorPerDimensi,
        totalSkala5,
        totalSkala100,
        status: "Selesai Dinilai",
        tglPenilaian: "08 Nov 2026",
      };
    });
  }, [selectedUnit, tahunAnggaran]);

  // Filtered by Tim
  const filteredRecords = useMemo(() => {
    if (selectedTimFilter === "Semua Tim") return evaluationRecords;
    return evaluationRecords.filter((r) => r.evaluator.tim === selectedTimFilter);
  }, [evaluationRecords, selectedTimFilter]);

  // Konsensus & Rata-rata Gabungan 3 Tim
  const konsensusSummary = useMemo(() => {
    if (evaluationRecords.length === 0) return { avg5: 0, avg100: 0, predikat: "-" };

    const avg5 =
      evaluationRecords.reduce((acc, curr) => acc + curr.totalSkala5, 0) /
      evaluationRecords.length;
    const avg100 = (avg5 / 5) * 100;

    let predikat = "PERLU PERBAIKAN";
    let predikatColor = "text-rose-600 bg-rose-50 border-rose-200";
    if (avg100 >= 85) {
      predikat = "SANGAT BAIK (OPTIMAL)";
      predikatColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    } else if (avg100 >= 65) {
      predikat = "BAIK (MEMADAI)";
      predikatColor = "text-blue-700 bg-blue-50 border-blue-200";
    }

    // Hitung rata-rata per sub-dimensi untuk deteksi disparity (perbedaan pendapat > 1 skor)
    const subDimensiStats: Record<
      string,
      { avg: number; min: number; max: number; disparity: boolean }
    > = {};

    KERANGKA_EVALUASI_RENJA_ESELON2.forEach((d) => {
      d.subDimensi.forEach((s) => {
        const vals = evaluationRecords.map((r) => r.scoresMap[s.id] || 3);
        const sum = vals.reduce((a, b) => a + b, 0);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        subDimensiStats[s.id] = {
          avg: sum / vals.length,
          min,
          max,
          disparity: max - min >= 2,
        };
      });
    });

    return {
      avg5,
      avg100,
      predikat,
      predikatColor,
      subDimensiStats,
      countEvaluator: evaluationRecords.length,
    };
  }, [evaluationRecords]);

  // JIKA BUKAN BINCANG ATAU SUPER ADMIN: BLOKIR TAMPILAN
  if (!hasAccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 bg-rose-100 dark:bg-rose-950/50 rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-600">
          <Lock className="w-12 h-12 stroke-[1.5]" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Akses Terbatas (Restricted Access)
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Halaman <strong>Monitoring Penilaian Renja</strong> adalah kompilasi hasil evaluasi lintas-tim (Tim Perencanaan, Tim Penganggaran, dan Inspektorat) yang hanya dapat diakses oleh <strong>Approver BINCANG</strong> dan <strong>Super Admin</strong>.
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Role Anda saat ini: {currentUserRole}
            </span>
          </div>
        </div>
        <Link
          to="/eselon2/evaluasi"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
        >
          <span>Kembali ke Evaluasi Renja Eselon III</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* ── BREADCRUMB & TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Perencanaan &amp; Kinerja</span>
            <span>/</span>
            <Link to="/eselon2/bab-3" className="hover:underline">Renja Eselon II</Link>
            <span>/</span>
            <Link to="/eselon2/evaluasi" className="hover:underline">Evaluasi Renja Eselon III</Link>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Monitoring Penilaian</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <ClipboardCheck className="h-6 w-6 text-indigo-600" />
            <span>Monitoring Penilaian Renja Eselon III (Multi-Evaluator)</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Kompilasi dan agregasi hasil evaluasi dokumen Renja dari Tim Perencanaan, Tim Penganggaran, dan Inspektorat (Khusus Approver BINCANG &amp; Super Admin).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge Otoritas */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Hak Akses: {currentUserRole}</span>
          </div>

          <Link
            to="/eselon2/evaluasi"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Buka Lembar Kerja Skoring</span>
          </Link>
        </div>
      </div>

      {/* ── KONSENSUS HIGHLIGHT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Unit Kerja */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--border)] shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unit Eselon I:</span>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
          >
            {LIST_ESELON1_UNITS.map((u) => (
              <option key={u.kode} value={u.kode}>
                {u.kode} - {u.nama}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 block">Tahun Anggaran: {tahunAnggaran}</span>
        </div>

        {/* Skor Konsensus Rata-rata Skala 100 */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
            Nilai Konsensus Gabungan:
          </span>
          <div className="text-2xl font-black text-indigo-600 font-mono">
            {konsensusSummary.avg100.toFixed(1)} <span className="text-xs font-semibold text-slate-500">/ 100</span>
          </div>
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${konsensusSummary.predikatColor}`}>
            {konsensusSummary.predikat}
          </span>
        </div>

        {/* Skor Rata-rata Skala 5 */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Skor Gabungan (Skala 1 - 5):
          </span>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {konsensusSummary.avg5.toFixed(2)} <span className="text-xs font-semibold text-slate-500">/ 5.00</span>
          </div>
          <p className="text-[10px] text-slate-500">Rata-rata 3 Tim Penilai Resmi</p>
        </div>

        {/* Status Evaluator Terlibat */}
        <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
            Keterlibatan Penilai:
          </span>
          <div className="text-lg font-black text-purple-700 dark:text-purple-300 font-mono pt-1">
            3 / 3 Tim Lengkap
          </div>
          <p className="text-[10px] text-purple-600/80">Perencanaan, Anggaran &amp; Inspektorat</p>
        </div>
      </div>

      {/* ── TAB NAVIGASI TAMPILAN KOMPILASI ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTabDetail("kompilasi")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTabDetail === "kompilasi"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Kompilasi Tim Penilai
        </button>
        <button
          onClick={() => setActiveTabDetail("matriks_subdimensi")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTabDetail === "matriks_subdimensi"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Matriks Komparasi 12 Sub-Dimensi
        </button>
      </div>

      {/* ── TAB 1: KOMPILASI REKAPITULASI 3 TIM PENILAI ── */}
      {activeTabDetail === "kompilasi" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Tabel Kompilasi Penilaian per Tim */}
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Daftar Nilai Tim Penilai Dokumen Renja {selectedUnit} 2027</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Setiap tim memiliki bobot setara (1/3) dalam menyusun skor konsensus akhir Renja Eselon II.
                </p>
              </div>

              {/* Filter Tim */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Filter Tim:</span>
                <select
                  value={selectedTimFilter}
                  onChange={(e) => setSelectedTimFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="Semua Tim">Semua Tim Penilai</option>
                  <option value="Tim Perencanaan (BINCANG)">Tim Perencanaan (BINCANG)</option>
                  <option value="Tim Penganggaran (BINCANG)">Tim Penganggaran (BINCANG)</option>
                  <option value="Inspektorat (PEKA)">Inspektorat (PEKA)</option>
                </select>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1e588a] text-white font-bold text-center border-b border-black">
                    <th className="py-2.5 px-3 w-12 text-center">NO</th>
                    <th className="py-2.5 px-3 text-left min-w-[220px]">EVALUATOR &amp; ASAL TIM</th>
                    <th className="py-2.5 px-2 w-28 text-center">ALGN (20%)</th>
                    <th className="py-2.5 px-2 w-28 text-center">GOV (25%)</th>
                    <th className="py-2.5 px-2 w-28 text-center">GAP (20%)</th>
                    <th className="py-2.5 px-2 w-28 text-center">CROSS (15%)</th>
                    <th className="py-2.5 px-2 w-28 text-center">REAL (15%)</th>
                    <th className="py-2.5 px-2 w-28 text-center">RISK (5%)</th>
                    <th className="py-2.5 px-3 w-32 text-right bg-blue-900 text-white">SKOR (1-5)</th>
                    <th className="py-2.5 px-3 w-32 text-right bg-indigo-900 text-white">NILAI (100)</th>
                    <th className="py-2.5 px-3 w-28 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-sans">
                  {filteredRecords.map((rec, idx) => (
                    <tr key={rec.evaluator.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 text-center font-mono font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="p-3">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">
                            {rec.evaluator.nama}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            NIP. {rec.evaluator.nip}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${rec.evaluator.badgeColor}`}>
                            {rec.evaluator.tim}
                          </span>
                        </div>
                      </td>

                      {/* Skor per dimensi 1 s.d. 6 */}
                      <td className="p-3 text-center font-mono">
                        {rec.skorPerDimensi[1]?.toFixed(2) || "-"}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {rec.skorPerDimensi[2]?.toFixed(2) || "-"}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {rec.skorPerDimensi[3]?.toFixed(2) || "-"}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {rec.skorPerDimensi[4]?.toFixed(2) || "-"}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {rec.skorPerDimensi[5]?.toFixed(2) || "-"}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {rec.skorPerDimensi[6]?.toFixed(2) || "-"}
                      </td>

                      {/* Total Skala 1-5 */}
                      <td className="p-3 text-right font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20">
                        {rec.totalSkala5.toFixed(2)}
                      </td>

                      {/* Total Skala 0-100 */}
                      <td className="p-3 text-right font-mono font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50/40 dark:bg-indigo-950/20 text-sm">
                        {rec.totalSkala100.toFixed(1)}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Final</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-600">
                    <td colSpan={2} className="p-3 text-right uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      Rata-Rata Konsensus (Kompilasi 3 Tim):
                    </td>
                    <td className="p-3 text-center font-mono text-indigo-600">
                      {(evaluationRecords.reduce((acc, r) => acc + (r.skorPerDimensi[1] || 0), 0) / 3).toFixed(2)}
                    </td>
                    <td className="p-3 text-center font-mono text-indigo-600">
                      {(evaluationRecords.reduce((acc, r) => acc + (r.skorPerDimensi[2] || 0), 0) / 3).toFixed(2)}
                    </td>
                    <td className="p-3 text-center font-mono text-indigo-600">
                      {(evaluationRecords.reduce((acc, r) => acc + (r.skorPerDimensi[3] || 0), 0) / 3).toFixed(2)}
                    </td>
                    <td className="p-3 text-center font-mono text-indigo-600">
                      {(evaluationRecords.reduce((acc, r) => acc + (r.skorPerDimensi[4] || 0), 0) / 3).toFixed(2)}
                    </td>
                    <td className="p-3 text-center font-mono text-indigo-600">
                      {(evaluationRecords.reduce((acc, r) => acc + (r.skorPerDimensi[5] || 0), 0) / 3).toFixed(2)}
                    </td>
                    <td className="p-3 text-center font-mono text-indigo-600">
                      {(evaluationRecords.reduce((acc, r) => acc + (r.skorPerDimensi[6] || 0), 0) / 3).toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-blue-700 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/40">
                      {konsensusSummary.avg5.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-900/40 text-base">
                      {konsensusSummary.avg100.toFixed(1)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${konsensusSummary.predikatColor}`}>
                        {konsensusSummary.predikat}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: MATRIKS KOMPARASI 15 SUB-DIMENSI ── */}
      {activeTabDetail === "matriks_subdimensi" && (
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in">
          <div className="pb-3 border-b border-[var(--border)] space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Matriks Detil Komparasi Skor per Sub-Dimensi</span>
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan skor penilaian tiap sub-dimensi dari Tim Perencanaan, Tim Penganggaran, dan Inspektorat. Baris dengan perbedaan pandangan $\ge 2$ poin ditandai warna kuning untuk pembahasan forum penelaahan.
            </p>
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 text-center">
                  <th className="py-2.5 px-3 w-16">KODE</th>
                  <th className="py-2.5 px-3 text-left min-w-[280px]">SUB-DIMENSI &amp; KRITERIA</th>
                  <th className="py-2.5 px-2 w-28">PERENCANAAN</th>
                  <th className="py-2.5 px-2 w-28">ANGGARAN</th>
                  <th className="py-2.5 px-2 w-28">INSPEKTORAT</th>
                  <th className="py-2.5 px-2 w-28 text-center bg-indigo-50 dark:bg-indigo-950/40">RATA-RATA</th>
                  <th className="py-2.5 px-3 min-w-[200px] text-left">STATUS KONSENSUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-sans">
                {KERANGKA_EVALUASI_RENJA_ESELON2.map((dim) => (
                  <React.Fragment key={dim.id}>
                    {/* Header Dimensi */}
                    <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-slate-100">
                      <td colSpan={7} className="p-2.5 px-3 border-y border-slate-200 dark:border-slate-700">
                        {dim.nama} (Bobot: {(dim.bobot * 100).toFixed(0)}%)
                      </td>
                    </tr>

                    {/* Sub-Dimensi */}
                    {dim.subDimensi.map((sub) => {
                      const scoreRen = evaluationRecords[0]?.scoresMap[sub.id] || 3;
                      const scoreAng = evaluationRecords[1]?.scoresMap[sub.id] || 3;
                      const scoreInsp = evaluationRecords[2]?.scoresMap[sub.id] || 3;
                      const avg = (scoreRen + scoreAng + scoreInsp) / 3;
                      const disparity = Math.max(scoreRen, scoreAng, scoreInsp) - Math.min(scoreRen, scoreAng, scoreInsp) >= 2;

                      return (
                        <tr
                          key={sub.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                            disparity ? "bg-amber-50/60 dark:bg-amber-950/30" : ""
                          }`}
                        >
                          <td className="p-2.5 text-center font-mono font-bold text-slate-500">
                            {sub.id}
                          </td>
                          <td className="p-2.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {sub.nama}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Bobot: {(sub.bobot * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold text-blue-700 dark:text-blue-400">
                            {scoreRen}
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {scoreAng}
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold text-purple-700 dark:text-purple-400">
                            {scoreInsp}
                          </td>
                          <td className="p-2.5 text-center font-mono font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50/40 dark:bg-indigo-950/20">
                            {avg.toFixed(2)}
                          </td>
                          <td className="p-2.5">
                            {disparity ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Perbedaan Skor Signifikan (Perlu Rekonsiliasi)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Selaras / Konsensus Kuat</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
