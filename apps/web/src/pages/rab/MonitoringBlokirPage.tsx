import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  ArrowRight,
  SlidersHorizontal,
  Info,
  Layers,
  FileSpreadsheet,
  PieChart,
  Wallet,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  JENIS_BLOKIR_OPTIONS,
  HIERARCHY_RANK,
  BlokirRowItem,
} from "./AutomaticAdjustmentPage";
import unitKerjaData from "../../data/unitKerjaData.json";
import { getUnitKerjaByNamaOrSingkatan } from "../kak/kakKinerjaHelper";
import { UserRole } from "./PilihHistoriRabPage";
import { buildHierarchyTree, getVisibleRowsFromTree } from "./drillDownHelper";

// Default template hierarki lengkap Program s.d. Detail Belanja
const DEFAULT_HIERARCHY_ROWS: BlokirRowItem[] = [
  {
    id: "blk-prog",
    kode: "078.01.BE",
    type: "program",
    uraian: "Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    jumlah: 743651000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-keg",
    kode: "3379",
    type: "kegiatan",
    uraian: "Pengelolaan Bidang Hukum dan Regulasi PPATK",
    jumlah: 743651000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-kro",
    kode: "3379.AAH",
    type: "kro",
    uraian: "Peraturan lainnya (Lokasi: 01.51 - KOTA JAKARTA PUSAT)",
    jumlah: 743651000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-ro",
    kode: "3379.AAH.001",
    type: "ro",
    uraian: "Penyusunan Regulasi PPATK",
    jumlah: 743651000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-komp-052",
    kode: "052",
    type: "komponen",
    uraian: "Penyusunan Dokumen Legislasi",
    jumlah: 578910000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-subkomp-A",
    kode: "A",
    type: "subkomponen",
    uraian: "Penyusunan dan Implementasi Regulasi Kerja Sama",
    jumlah: 181573000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  // AKUN 1: 521211
  {
    id: "blk-akun-521211",
    kode: "521211",
    type: "akun",
    uraian: "Belanja Bahan",
    jumlah: 64709000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-det-1",
    kode: "",
    type: "detail",
    uraian: "- Konsumsi Rapat (18 ORG x 45 KEG = 810 OK @ 79.559)",
    jumlah: 64443000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-det-2",
    kode: "",
    type: "detail",
    uraian: "- Souvenir Kunjungan Tamu Internasional (1 ORG x 1 KEG = 1 OK @ 266.000)",
    jumlah: 266000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  // AKUN 2: 521219
  {
    id: "blk-akun-521219",
    kode: "521219",
    type: "akun",
    uraian: "Belanja Barang Non Operasional Lainnya",
    jumlah: 4491000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-det-3",
    kode: "",
    type: "detail",
    uraian: "- Jamuan Tamu Internasional (20 ORG x 1 KEG = 20 OK @ 224.550)",
    jumlah: 4491000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  // AKUN 3: 522151
  {
    id: "blk-akun-522151",
    kode: "522151",
    type: "akun",
    uraian: "Belanja Jasa Profesi",
    jumlah: 3800000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-det-4",
    kode: "",
    type: "detail",
    uraian: "- Honorarium Narasumber Eselon III (2 ORG x 1 KEG x 3 JM = 6 OK @ 633.333)",
    jumlah: 3800000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  // AKUN 4: 524113
  {
    id: "blk-akun-524113",
    kode: "524113",
    type: "akun",
    uraian: "Belanja Perjalanan Dinas Dalam Kota",
    jumlah: 14620000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-det-5",
    kode: "",
    type: "detail",
    uraian: "- Transport Lokal (3 ORG x 29 KEG = 87 OK @ 168.046)",
    jumlah: 14620000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  // AKUN 5: 524219
  {
    id: "blk-akun-524219",
    kode: "524219",
    type: "akun",
    uraian: "Belanja Perjalanan Dinas Lainnya - Luar Negeri",
    jumlah: 63787000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-sub-sg",
    kode: "",
    type: "header1",
    uraian: "> Singapore (FICG Meeting)",
    jumlah: 5483000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-det-6",
    kode: "",
    type: "detail",
    uraian: "- Uang Harian Gol C - Singapore (1 ORG x 1 KEG x 3 HR = 3 OH @ 1.827.667)",
    jumlah: 5483000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-sub-ns",
    kode: "",
    type: "header1",
    uraian: "> Pemenuhan permintaan Narasumber dari Negara Lain/Organisasi",
    jumlah: 50899000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-det-7",
    kode: "",
    type: "detail",
    uraian: "- Uang Harian Gol B - Singapura (2 ORG x 2 KEG x 2 HR = 8 OH @ 3.202.375)",
    jumlah: 25619000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-det-8",
    kode: "",
    type: "detail",
    uraian: "- Uang Harian Gol C - Singapura (3 ORG x 2 KEG x 2 HR = 12 OH @ 2.066.583)",
    jumlah: 24799000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-det-9",
    kode: "",
    type: "detail",
    uraian: "- Uang Harian Perjalanan Gol C - Singapura (3 ORG x 2 KEG x 1 HR = 6 OH @ 80.167)",
    jumlah: 481000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-sub-tw",
    kode: "",
    type: "header1",
    uraian: "> Taiwan",
    jumlah: 2411000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  {
    id: "blk-det-10",
    kode: "",
    type: "detail",
    uraian: "- Uang Harian Gol C - Taiwan (1 ORG x 1 KEG x 4 HR = 4 OH @ 602.750)",
    jumlah: 2411000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  // Komponen Pendukung 054
  {
    id: "blk-komp-054",
    kode: "054",
    type: "komponen",
    uraian: "Pengelolaan JDIH",
    jumlah: 164741000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "KREASI",
  },
  // Data Tambahan untuk Pusdiklat APU PPT (PATIH)
  {
    id: "blk-ro-patih",
    kode: "3365.DCF.001",
    type: "ro",
    uraian: "Pelatihan bidang APU PPT PPSPM",
    jumlah: 412500000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "PATIH",
  },
  {
    id: "blk-akun-patih",
    kode: "524111",
    type: "akun",
    uraian: "Belanja Perjalanan Dinas Biasa",
    jumlah: 125000000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "PATIH",
  },
  {
    id: "blk-det-patih-1",
    kode: "",
    type: "detail",
    uraian: "- Transport Tim Pengajar Diklat Luar Kota (5 ORG x 10 KEG)",
    jumlah: 125000000,
    blokir: 0,
    jenisBlokir: "9",
    isChecklist: false,
    unitKerja: "PATIH",
  },
];

export default function MonitoringBlokirPage() {

  // Auto-migrate legacy localStorage unit kerja HUKER -> KREASI
  useEffect(() => {
    try {
      const keys = ['rab_aa_blokir_rows_v2', 'rab_monitoring_blokir_data', 'rab_aa_manual_rows_v2'];
      keys.forEach((key) => {
        const raw = localStorage.getItem(key);
        if (raw && raw.includes('"HUKER"')) {
          localStorage.setItem(key, raw.replace(/"HUKER"/g, '"KREASI"'));
        }
      });
    } catch (e) {}
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>("");

  // Role Aktif (BINCANG / Super Admin / Operator / Approver)
  const [currentUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("renja_e2_user_role");
      if (saved && ["Operator", "Approver", "BINCANG", "Super Admin"].includes(saved)) {
        return saved as UserRole;
      }
    } catch (e) {}
    return "BINCANG";
  });

  const isPrivileged = currentUserRole === "BINCANG" || currentUserRole === "Super Admin";

  // Unit kerja default user biasa (diambil dari sesi histori aktif)
  const userUnitKerja = useMemo(() => {
    try {
      const raw = localStorage.getItem("rab_active_histori");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.kdsatker) {
          return getUnitKerjaByNamaOrSingkatan(parsed.kdsatker).singkatan;
        }
      }
    } catch (e) {}
    return "KREASI";
  }, []);

  // Filter unit kerja
  const [selectedUnit, setSelectedUnit] = useState<string>(() => {
    return isPrivileged ? "Semua Unit Kerja" : userUnitKerja;
  });

  // State baris hierarki lengkap Automatic Adjustment
  const [blokirRows, setBlokirRows] = useState<BlokirRowItem[]>(() => {
    try {
      const saved = localStorage.getItem("rab_aa_blokir_rows_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => item.unitKerja === "HUKER" ? { ...item, unitKerja: "KREASI" } : item);
      }
    } catch (e) {}
    return DEFAULT_HIERARCHY_ROWS;
  });

  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem("rab_aa_blokir_rows_v2");
        if (saved) {
          const parsed = JSON.parse(saved);
          setBlokirRows(parsed.map((item: any) => item.unitKerja === "HUKER" ? { ...item, unitKerja: "KREASI" } : item));
        } else {
          setBlokirRows(DEFAULT_HIERARCHY_ROWS);
        }
      } catch (e) {}
    };

    window.addEventListener("storage", handleStorageUpdate);
    window.addEventListener("rab_aa_updated", handleStorageUpdate);
    window.addEventListener("rab_worksheet_updated", handleStorageUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("rab_aa_updated", handleStorageUpdate);
      window.removeEventListener("rab_worksheet_updated", handleStorageUpdate);
    };
  }, []);

  // Filter baris sesuai Unit Kerja dan Search Query
  const filteredRows = useMemo(() => {
    const effectiveUnit = isPrivileged ? selectedUnit : userUnitKerja;
    return blokirRows.filter((r) => {
      if (effectiveUnit !== "Semua Unit Kerja" && r.unitKerja !== effectiveUnit) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.kode.toLowerCase().includes(q) ||
          r.uraian.toLowerCase().includes(q) ||
          r.unitKerja.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [blokirRows, selectedUnit, isPrivileged, userUnitKerja, searchQuery]);

  // State Expand/Collapse untuk Drill Down
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const hierarchyTreeResult = useMemo(() => {
    return buildHierarchyTree(filteredRows, HIERARCHY_RANK);
  }, [filteredRows]);

  const visibleRows = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredRows;
    }
    return getVisibleRowsFromTree(hierarchyTreeResult.tree, expandedNodes);
  }, [hierarchyTreeResult, expandedNodes, filteredRows, searchQuery]);

  const toggleNodeExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const isCurrentlyExpanded = prev[nodeId] !== false;
      return { ...prev, [nodeId]: !isCurrentlyExpanded };
    });
  };

  const handleExpandAll = () => {
    const next: Record<string, boolean> = {};
    hierarchyTreeResult.allParentIds.forEach((id) => {
      next[id] = true;
    });
    setExpandedNodes(next);
  };

  const handleCollapseAll = () => {
    const next: Record<string, boolean> = {};
    hierarchyTreeResult.allParentIds.forEach((id) => {
      next[id] = false;
    });
    setExpandedNodes(next);
  };

  // Statistik Ringkasan Pagu
  const summaryStats = useMemo(() => {
    const totalPagu = filteredRows.reduce((acc, r) => (r.type === "program" ? acc + r.jumlah : acc), 0) ||
      (selectedUnit === "PATIH" ? 412500000 : 743651000);
    const totalBlokir = filteredRows.reduce((acc, r) => acc + (Number(r.blokir) || 0), 0);
    const countBlokirActive = filteredRows.filter((r) => r.blokir > 0).length;

    return {
      totalPagu,
      totalBlokir,
      effectivePagu: Math.max(0, totalPagu - totalBlokir),
      countBlokirActive,
    };
  }, [filteredRows, selectedUnit]);

  // Rekapitulasi Data Blokir per Akun Belanja (Disajikan sebelum tabel utama)
  const akunBlokirSummary = useMemo(() => {
    const effectiveUnit = isPrivileged ? selectedUnit : userUnitKerja;
    const targetRows = blokirRows.filter((r) => {
      if (effectiveUnit !== "Semua Unit Kerja" && r.unitKerja !== effectiveUnit) {
        return false;
      }
      return true;
    });

    // Peta akun belanja
    const akunList: Array<{
      kode: string;
      nama: string;
      unitKerja: string;
      totalPagu: number;
      totalBlokir: number;
      countItemBlokir: number;
    }> = [];

    let currentAkun: {
      kode: string;
      nama: string;
      unitKerja: string;
      totalPagu: number;
      totalBlokir: number;
      countItemBlokir: number;
    } | null = null;

    targetRows.forEach((r) => {
      if (r.type === "akun") {
        if (currentAkun) {
          akunList.push(currentAkun);
        }
        currentAkun = {
          kode: r.kode,
          nama: r.uraian,
          unitKerja: r.unitKerja,
          totalPagu: r.jumlah,
          totalBlokir: Number(r.blokir) || 0,
          countItemBlokir: r.blokir > 0 ? 1 : 0,
        };
      } else if (currentAkun && (r.type === "detail" || r.type === "header1" || r.type === "header2")) {
        if (r.blokir > 0) {
          currentAkun.totalBlokir += Number(r.blokir);
          currentAkun.countItemBlokir += 1;
        }
      }
    });

    if (currentAkun) {
      akunList.push(currentAkun);
    }

    return akunList;
  }, [blokirRows, selectedUnit, isPrivileged, userUnitKerja]);

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* ── Top Header & Breadcrumb ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Penganggaran &amp; Biaya</span>
            <span>/</span>
            <span>Rencana Anggaran Biaya (RAB)</span>
            <span>/</span>
            <span>Laporan RAB</span>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Monitoring Blokir</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-amber-600" />
            <span>Monitoring Blokir Anggaran</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Pemantauan seluruh alokasi anggaran yang berstatus blokir (tanda bintang '*') hasil penetapan Automatic Adjustment atau ketentuan Kementerian Keuangan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPrivileged && (
            <Link
              to="/rab/automatic-adjustment"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Kelola Automatic Adjustment</span>
            </Link>
          )}
          <Link
            to="/rab/isian"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Kertas Kerja Isian RAB</span>
          </Link>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
              Total Pagu Terblokir (* / @):
            </span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            Rp {summaryStats.totalBlokir.toLocaleString("id-ID")}
          </div>
          <span className="text-[11px] text-slate-500">
            {summaryStats.countBlokirActive > 0
              ? `${summaryStats.countBlokirActive} pos anggaran berstatus blokir (*).`
              : "Nihil. Belum ada pos anggaran yang diblokir."}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
              Pagu Efektif Siap Dibelanjakan:
            </span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            Rp {summaryStats.effectivePagu.toLocaleString("id-ID")}
          </div>
          <span className="text-[11px] text-slate-500">
            Alokasi riil yang tersedia untuk pelaksanaan kegiatan.
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider">
              Total Alokasi Pagu DIPA:
            </span>
            <PieChart className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 font-mono">
            Rp {summaryStats.totalPagu.toLocaleString("id-ID")}
          </div>
          <span className="text-[11px] text-slate-500">
            Pagu total DIPA TA 2027 (tidak berkurang oleh blokir).
          </span>
        </div>
      </div>

      {/* ── SAJIAN DATA BLOKIR PER AKUN BELANJA SESUAI UNIT KERJA (SEBELUM TABEL UTAMA) ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-xl text-amber-700 dark:text-amber-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text)]">
                Rekapitulasi Data Blokir per Akun Belanja
              </h2>
              <p className="text-[11px] text-slate-500">
                Ringkasan total pagu vs alokasi blokir pada masing-masing akun belanja berdasarkan unit kerja.
              </p>
            </div>
          </div>

          {/* Kontrol Unit Kerja: Khusus role BINCANG & Super Admin dapat memilih semua atau unit tertentu */}
          {isPrivileged ? (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>Unit Kerja:</span>
              </span>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="bg-transparent font-bold text-blue-700 dark:text-blue-400 focus:outline-none cursor-pointer"
              >
                <option value="Semua Unit Kerja">Semua Unit Kerja</option>
                {unitKerjaData.map((u) => (
                  <option key={u.singkatan} value={u.singkatan}>
                    {u.nama} ({u.singkatan})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs">
              <span className="text-slate-500">Unit Kerja:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {unitKerjaData.find((u) => u.singkatan === userUnitKerja)?.nama || userUnitKerja} ({userUnitKerja})
              </span>
            </div>
          )}
        </div>

        {/* Kartu Grid Akun Belanja */}
        {akunBlokirSummary.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            Tidak ada akun belanja yang ditemukan untuk unit kerja ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {akunBlokirSummary.map((acc) => {
              const persenBlokir = acc.totalPagu > 0 ? (acc.totalBlokir / acc.totalPagu) * 100 : 0;
              const hasBlokir = acc.totalBlokir > 0;

              return (
                <div
                  key={`${acc.unitKerja}-${acc.kode}`}
                  className={`p-4 rounded-xl border transition-all ${
                    hasBlokir
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-xs"
                      : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-400">
                          {acc.kode}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {acc.unitKerja}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 line-clamp-1" title={acc.nama}>
                        {acc.nama}
                      </h4>
                    </div>

                    {hasBlokir ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1 shrink-0">
                        <span>*</span>
                        <span>{persenBlokir.toFixed(1)}%</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                        Bebas Blokir
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Total Pagu:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Rp {acc.totalPagu.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-sans">Pagu Terblokir (*):</span>
                      <span className={`font-bold ${hasBlokir ? "text-amber-600 dark:text-amber-400" : "text-slate-500"}`}>
                        Rp {acc.totalBlokir.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TABEL UTAMA MONITORING BLOKIR ANGGARAN (PROGRAM S.D. DETAIL BELANJA) ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode atau uraian pos belanja..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-slate-800 text-[var(--text)] text-xs w-full sm:w-80"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-slate-50 dark:bg-slate-800/60">
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-2 py-1 rounded text-[11px] font-bold bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs hover:bg-blue-50 dark:hover:bg-slate-600 cursor-pointer transition-colors"
                title="Buka seluruh level hierarki s.d. Detail Belanja"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="px-2 py-1 rounded text-[11px] font-bold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer transition-colors"
                title="Tutup (ciutkan) seluruh level bawahan"
              >
                Collapse All
              </button>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-mono">
              <span>Menampilkan:</span>
              <strong className="text-slate-800 dark:text-slate-200">{visibleRows.length}</strong>
              <span className="text-slate-400">/ {filteredRows.length} baris</span>
            </div>
          </div>
        </div>

        {/* Tabel Hierarki Lengkap */}
        <div className="border border-black overflow-x-auto rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1e588a] text-white font-bold text-center border-b border-black">
                <th className="py-2.5 px-3 border-r border-blue-400/40 w-36">KODE</th>
                <th className="py-2.5 px-3 border-r border-blue-400/40 text-left min-w-[340px]">
                  OUTPUT / SUBOUTPUT / KOMPONEN / SUBKOMPONEN / DETAIL BELANJA
                </th>
                <th className="py-2.5 px-3 border-r border-blue-400/40 w-28 text-center">UNIT KERJA</th>
                <th className="py-2.5 px-3 border-r border-blue-400/40 w-36 text-right">TOTAL PAGU (Rp)</th>
                <th className="py-2.5 px-3 border-r border-blue-400/40 w-36 text-right bg-amber-700 text-white">
                  BLOKIR (*) (Rp)
                </th>
                <th className="py-2.5 px-3 border-r border-blue-400/40 text-left min-w-[280px]">
                  JENIS BLOKIR (9 KODE KEBIJAKAN)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-sans">
              {visibleRows.map((row) => {
                const hasChildren = !!hierarchyTreeResult.hasChildrenMap[row.id];
                const isExpanded = expandedNodes[row.id] !== false;
                const isBlocked = row.blokir > 0;
                const isDetail = row.type === "detail";
                const isHeader = row.type === "header1" || row.type === "header2";
                const isAkun = row.type === "akun";

                const rank = HIERARCHY_RANK[row.type] ?? 0;
                const paddingLeftPx = rank * 14;

                const jenisObj = JENIS_BLOKIR_OPTIONS.find((j) => j.kode === row.jenisBlokir);

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isBlocked ? "bg-amber-50/50 dark:bg-amber-950/20" : ""
                    } ${
                      row.type === "program" || row.type === "kegiatan"
                        ? "bg-slate-100 dark:bg-slate-800/80 font-bold"
                        : row.type === "kro" || row.type === "ro"
                        ? "font-semibold"
                        : isAkun
                        ? "font-medium"
                        : ""
                    }`}
                  >
                    {/* KODE */}
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-mono text-center font-bold align-top">
                      {row.kode || "-"}
                    </td>

                    {/* OUTPUT / SUBOUTPUT / KOMPONEN / SUBKOMPONEN / DETAIL BELANJA */}
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 align-top">
                      <div style={{ paddingLeft: `${paddingLeftPx}px` }} className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          {hasChildren ? (
                            <button
                              type="button"
                              onClick={() => toggleNodeExpand(row.id)}
                              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer transition-colors shrink-0"
                              title={isExpanded ? "Klik untuk menciutkan (collapse)" : "Klik untuk membuka drill-down (expand)"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>
                          ) : (
                            <span className="w-4 inline-block shrink-0" />
                          )}
                          {isBlocked && (
                            <span className="font-bold text-amber-600 font-mono text-sm leading-none" title="Pos Anggaran Diblokir (*)">
                              *
                            </span>
                          )}
                          <span
                            onClick={() => hasChildren && toggleNodeExpand(row.id)}
                            className={`${hasChildren ? "cursor-pointer hover:underline " : ""}${
                              isDetail
                                ? "text-slate-700 dark:text-slate-300 font-normal"
                                : isHeader
                                ? "font-semibold italic text-slate-800 dark:text-slate-200"
                                : isAkun
                                ? "font-bold text-blue-700 dark:text-blue-400"
                                : "font-bold text-slate-900 dark:text-slate-100"
                            }`}
                          >
                            {row.uraian}
                          </span>
                        </div>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          Level: {row.type.toUpperCase()}
                        </span>
                      </div>
                    </td>

                    {/* UNIT KERJA */}
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center font-mono font-bold text-slate-600 dark:text-slate-400 align-top">
                      {row.unitKerja}
                    </td>

                    {/* TOTAL PAGU */}
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right font-mono text-slate-600 dark:text-slate-300 align-top">
                      {row.jumlah.toLocaleString("id-ID")}
                    </td>

                    {/* PAGU DIBLOKIR (*) */}
                    <td className={`p-2 border-r border-slate-200 dark:border-slate-700 text-right font-mono font-bold align-top ${
                      isBlocked ? "text-amber-700 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/20" : "text-slate-400"
                    }`}>
                      {row.blokir > 0 ? row.blokir.toLocaleString("id-ID") : "-"}
                    </td>

                    {/* JENIS BLOKIR (9 KODE KEBIJAKAN) */}
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-[11px] align-top text-slate-700 dark:text-slate-300">
                      {isBlocked ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-amber-800 dark:text-amber-300">
                            {jenisObj?.label || `Kode ${row.jenisBlokir}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
