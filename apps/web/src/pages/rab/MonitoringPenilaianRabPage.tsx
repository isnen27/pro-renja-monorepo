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
  KERANGKA_EVALUASI_RAB,
  DimensiEvaluasi,
  SubDimensiEvaluasi,
} from "../../data/kerangkaEvaluasiRabData";
import { UserRole } from "../rab/PilihHistoriRabPage";
import unitKerjaData from "../../data/unitKerjaData.json";

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

export interface UnitEselon2Option {
  kode: string;
  nama: string;
  cluster?: string;
}

export const LIST_ESELON2_UNITS: UnitEselon2Option[] = unitKerjaData.map((u) => ({
  kode: u.singkatan,
  nama: u.nama,
  cluster: u.subcluster,
}));

export default function MonitoringPenilaianRabPage() {
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
  const tahunAnggaran = 2027;
  const [selectedUnit, setSelectedUnit] = useState<string>("PATIH");
  const [selectedTimFilter, setSelectedTimFilter] = useState<string>("Semua Tim");
  const [activeTabDetail, setActiveTabDetail] = useState<"kompilasi" | "matriks_subdimensi" | "berita_acara" | "grafik">("kompilasi");
  const [chartMode, setChartMode] = useState<"semua_unit" | "per_unit" | "per_evaluator">("semua_unit");

  const selectedUnitName = useMemo(() => {
    return LIST_ESELON2_UNITS.find((u) => u.kode === selectedUnit)?.nama || selectedUnit;
  }, [selectedUnit]);

  // Ranking & kompilasi nilai untuk seluruh 16 unit Eselon II
  const allUnitsRanking = useMemo(() => {
    return LIST_ESELON2_UNITS.map((u) => {
      let sumTotal = 0;
      LIST_EVALUATOR.forEach((ev) => {
        const storageKey = `evaluasi_rab_${u.kode}_${tahunAnggaran}_${ev.id}`;
        let sMap: Record<string, number> = {};
        try {
          const s = localStorage.getItem(storageKey);
          if (s) sMap = JSON.parse(s);
        } catch {}

        let t5 = 0;
        KERANGKA_EVALUASI_RAB.forEach((dim) => {
          const subScores = dim.subDimensi.map((sub) => sMap[sub.id] || (ev.id === 'eval-1' ? 4.1 : ev.id === 'eval-2' ? 3.6 : 3.9));
          const avgSub = subScores.reduce((a, b) => a + b, 0) / (subScores.length || 1);
          t5 += avgSub * dim.bobot;
        });
        sumTotal += t5;
      });
      const avg5 = sumTotal / (LIST_EVALUATOR.length || 1);
      const score100 = (avg5 / 5) * 100;
      return {
        kode: u.kode,
        nama: u.nama,
        score5: avg5,
        score: score100,
      };
    }).sort((a, b) => b.score - a.score);
  }, [tahunAnggaran]);


  // Akses eksklusif: Approver BINCANG dan Super Admin
  const hasAccess = currentUserRole === "BINCANG" || currentUserRole === "Super Admin";

  // Data skoring simulasi per evaluator untuk unit terpilih
  const evaluationRecords = useMemo(() => {
    // Skor dasar untuk masing-masing evaluator
    // Evaluator 1: Tim Perencanaan (fokus ke alignment & cascading)
    // Evaluator 2: Tim Penganggaran (fokus ke resource & gap kuantitatif)
    // Evaluator 3: Inspektorat (fokus ke compliance, BPK & SPIP)
    return LIST_EVALUATOR.map((evaluator) => {
      const storageKey = `evaluasi_rab_${selectedUnit}_${tahunAnggaran}_${evaluator.id}`;
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

      KERANGKA_EVALUASI_RAB.forEach((dim) => {
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

    KERANGKA_EVALUASI_RAB.forEach((d) => {
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
          to="/rab/evaluasi"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
        >
          <span>Kembali ke Evaluasi Rencana Anggaran Biaya (RAB)</span>
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
            <Link to="/rab/isian" className="hover:underline">Rencana Anggaran Biaya (RAB)</Link>
            <span>/</span>
            <Link to="/rab/evaluasi" className="hover:underline">Evaluasi Rencana Anggaran Biaya (RAB)</Link>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Monitoring Penilaian Rencana Anggaran Biaya (RAB)</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <ClipboardCheck className="h-6 w-6 text-indigo-600" />
            <span>Monitoring Penilaian Rencana Anggaran Biaya (RAB)</span>
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
            to="/rab/evaluasi"
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unit Eselon II:</span>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
          >
            {LIST_ESELON2_UNITS.map((u) => (
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
        <button
          onClick={() => setActiveTabDetail("grafik")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTabDetail === "grafik"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Grafik Hasil Penilaian</span>
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
                  Setiap tim memiliki bobot setara (1/3) dalam menyusun skor konsensus akhir Rencana Anggaran Biaya (RAB).
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
                {KERANGKA_EVALUASI_RAB.map((dim) => (
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

      {/* ── TAB 3: GRAFIK HASIL PENILAIAN (SELURUH UNIT, PER UNIT, PER EVALUATOR) ── */}
      {activeTabDetail === "grafik" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Sub-Filter Grafik */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Visualisasi & Grafik Hasil Penilaian Rencana Anggaran Biaya (RAB)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Komparasi visual capaian nilai mutu perencanaan strategis seluruh unit kerja operasional, distribusi skor 4 dimensi, dan profil evaluasi antar-tim.
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setChartMode("semua_unit")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === "semua_unit"
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                1. Seluruh Unit Kerja (16 Unit)
              </button>
              <button
                type="button"
                onClick={() => setChartMode("per_unit")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === "per_unit"
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                2. Per Unit Kerja ({selectedUnit})
              </button>
              <button
                type="button"
                onClick={() => setChartMode("per_evaluator")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === "per_evaluator"
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                3. Per Evaluator (3 Tim)
              </button>
            </div>
          </div>

          {/* MODE 1: GRAFIK SELURUH UNIT KERJA (16 UNIT) */}
          {chartMode === "semua_unit" && (
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Peringkat Nilai Konsensus Evaluasi Rencana Anggaran Biaya (RAB) (Skala 0 - 100)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Rata-rata tertimbang gabungan Tim Perencanaan, Tim Penganggaran, dan Inspektorat untuk seluruh unit kerja.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Sangat Baik (≥85)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>Baik / Memadai (≥65)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span>Perlu Perbaikan (&lt;65)</span>
                  </span>
                </div>
              </div>

              {/* Bar Chart Horizontal Seluruh Unit */}
              <div className="space-y-3 pt-1">
                {allUnitsRanking.map((item, idx) => {
                  const isCurrent = item.kode === selectedUnit;
                  const barColor =
                    item.score >= 85
                      ? "bg-emerald-500"
                      : item.score >= 65
                      ? "bg-blue-500"
                      : "bg-rose-500";

                  return (
                    <div
                      key={item.kode}
                      onClick={() => setSelectedUnit(item.kode)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 shadow-xs"
                          : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/80"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            idx === 0
                              ? "bg-amber-400 text-amber-900"
                              : idx === 1
                              ? "bg-slate-300 text-slate-800"
                              : idx === 2
                              ? "bg-amber-600 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{item.kode}</span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[280px] sm:max-w-md">
                            {item.nama}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-[11px] text-slate-500">
                            {item.score5.toFixed(2)} / 5.00
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs w-14 text-right">
                            {item.score.toFixed(1)} / 100
                          </span>
                        </div>
                      </div>

                      {/* Bar Fill */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 2: GRAFIK PER UNIT KERJA (BREAKDOWN 4 DIMENSI UNIT TERPILIH) */}
          {chartMode === "per_unit" && (
            <div className="space-y-5">
              {/* Unit Selector Bar Khusus Mode Grafik Per Unit Eselon II */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl shadow-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Pilih Unit Kerja Eselon II:
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full sm:w-80 px-3 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-800 text-xs font-bold text-indigo-950 dark:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  >
                    {LIST_ESELON2_UNITS.map((u) => (
                      <option key={u.kode} value={u.kode}>
                        {u.kode} - {u.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      <span>Grafik Bar Vertikal Capaian Dimensi RAB: {selectedUnit} ({selectedUnitName})</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Visualisasi diagram batang (bar vertikal) skor 4 dimensi evaluasi Rencana Anggaran Biaya (RAB) beserta persentase ketercapaian dan rincian sub-dimensi.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Nilai Konsensus:</span>
                    <span className="text-lg font-black text-indigo-600 font-mono">
                      {konsensusSummary.avg100.toFixed(1)} <span className="text-xs font-semibold text-slate-500">/ 100</span>
                    </span>
                  </div>
                </div>

                {/* ── GRAFIK BAR VERTIKAL PER DIMENSI RAB ── */}
                <div className="p-4 sm:p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-semibold">Skor Dimensi Evaluasi RAB (Skala 1 - 5)</span>
                    <span className="font-mono font-bold text-indigo-600">Target Maksimal: 5.00</span>
                  </div>

                  {/* Grid Kolom Bar Vertikal */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 pb-2 items-end min-h-[260px]">
                    {KERANGKA_EVALUASI_RAB.map((dim) => {
                      const dimVals = evaluationRecords.map((r) => r.skorPerDimensi[dim.id] || 0);
                      const avgDim = dimVals.reduce((a, b) => a + b, 0) / (dimVals.length || 1);
                      const pctHeight = Math.max(8, Math.min(100, (avgDim / 5) * 100));
                      const barColor =
                        avgDim >= 4.25
                          ? "from-emerald-400 to-emerald-600"
                          : avgDim >= 3.25
                          ? "from-indigo-400 to-indigo-600"
                          : "from-amber-400 to-amber-600";

                      return (
                        <div key={dim.id} className="flex flex-col items-center h-full justify-end group">
                          {/* Value Label on Top of Bar */}
                          <div className="mb-2 text-center transition-transform group-hover:-translate-y-1">
                            <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white block">
                              {avgDim.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {((avgDim / 5) * 100).toFixed(0)}%
                            </span>
                          </div>

                          {/* Vertical Bar Container */}
                          <div className="w-14 sm:w-20 bg-slate-200 dark:bg-slate-700/60 rounded-xl h-44 p-1.5 flex flex-col justify-end relative shadow-inner">
                            <div
                              className={`w-full bg-gradient-to-t ${barColor} rounded-lg transition-all duration-700 shadow-sm relative group-hover:brightness-110`}
                              style={{ height: `${pctHeight}%` }}
                            >
                              <div className="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-t-lg" />
                            </div>
                          </div>

                          {/* Dimension Label below Bar */}
                          <div className="mt-3 text-center max-w-[130px]">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate leading-tight" title={dim.nama}>
                              D{dim.id}. {dim.nama.split(". ")[1] || dim.nama}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Bobot: {(dim.bobot * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4 Cards Grid Dimensi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {KERANGKA_EVALUASI_RAB.map((dim) => {
                    const dimVals = evaluationRecords.map((r) => r.skorPerDimensi[dim.id] || 0);
                    const avgDim = dimVals.reduce((a, b) => a + b, 0) / (dimVals.length || 1);
                    const pctDim = (avgDim / 5) * 100;
                    const kontribusiDim = avgDim * dim.bobot;

                    return (
                      <div
                        key={dim.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">
                              {dim.nama}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Bobot Dimensi: {(dim.bobot * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-base font-black text-indigo-600">
                              {avgDim.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400"> / 5.00</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                              style={{ width: `${pctDim}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>Ketercapaian: {pctDim.toFixed(1)}%</span>
                            <span>Kontribusi: {kontribusiDim.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Breakdown Sub-Dimensi Mini Bar */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Sub-Dimensi:
                          </span>
                          {dim.subDimensi.map((sub) => {
                            const subVals = evaluationRecords.map((r) => r.scoresMap[sub.id] || 3);
                            const avgSub = subVals.reduce((a, b) => a + b, 0) / (subVals.length || 1);
                            return (
                              <div key={sub.id} className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]" title={sub.nama}>
                                  {sub.id} {sub.nama.replace(sub.id, "").trim()}
                                </span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                  {avgSub.toFixed(1)} / 5
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: GRAFIK PER EVALUATOR (KOMPARASI 3 TIM PENILAI) */}
          {chartMode === "per_evaluator" && (
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-5">
              <div className="pb-3 border-b border-[var(--border)]">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Komparasi Nilai Antar-Evaluator ({selectedUnit})
                </h4>
                <p className="text-xs text-slate-500">
                  Perbandingan profil skor dari Tim Perencanaan, Tim Penganggaran, dan Inspektorat pada unit yang sedang dievaluasi.
                </p>
              </div>

              {/* 3 Columns Card Evaluator */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {evaluationRecords.map((rec) => (
                  <div
                    key={rec.evaluator.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rec.evaluator.badgeColor}`}>
                        {rec.evaluator.tim.split(" ")[1] || rec.evaluator.tim}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">{rec.evaluator.nama}</h5>
                      <p className="text-[10px] text-slate-400">{rec.evaluator.roleBadge}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-center space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Nilai:</span>
                      <div className="text-2xl font-black text-indigo-600 font-mono">
                        {rec.totalSkala100.toFixed(1)}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        ({rec.totalSkala5.toFixed(2)} / 5.00)
                      </span>
                    </div>

                    {/* Breakdown per Dimensi */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Skor per Dimensi:</span>
                      {KERANGKA_EVALUASI_RAB.map((d) => (
                        <div key={d.id} className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                            {d.id}. {d.nama.split(". ")[1] || d.nama}
                          </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {(rec.skorPerDimensi[d.id] || 0).toFixed(2)} / 5
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
