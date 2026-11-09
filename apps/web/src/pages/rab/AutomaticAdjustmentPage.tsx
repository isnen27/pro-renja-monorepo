import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  SlidersHorizontal,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  DollarSign,
  Building2,
  Save,
  Search,
  ArrowRight,
  Upload,
  FileSpreadsheet,
  Check,
  FileUp,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  Info,
  RotateCcw,
  Percent,
  Sliders,
  FileText,
  Ban,
} from "lucide-react";
import * as XLSX from "xlsx";
import unitKerjaData from "../../data/unitKerjaData.json";
import informasiKinerjaData from "../../data/informasiKinerjaData.json";
import { baganAkunStandar } from "../../data/baganAkunStandar";
import seriesAnggaranData from "../../data/seriesAnggaranData.json";
import { UserRole } from "./PilihHistoriRabPage";
import { buildHierarchyTree, getVisibleRowsFromTree } from "./drillDownHelper";

// Helper pembersih string uraian untuk pencocokan lintas halaman (Automatic Adjustment <-> Isian RAB)

// Helper batas realisasi belanja (floor) untuk validasi Automatic Adjustment: (Pagu - Blokir) >= Realisasi
export function getRealisasiForAaRow(row: { id?: string; kode?: string; uraian?: string; type?: string; jumlah?: number; jumlahMenjadi?: number; jumlahSemula?: number }): number {
  if (row.type === "detail") {
    try {
      const storedDetailRealisasi = localStorage.getItem("rab_realisasi_per_detail");
      if (storedDetailRealisasi) {
        const parsed = JSON.parse(storedDetailRealisasi);
        if (row.id && parsed[row.id] !== undefined) return parsed[row.id];
      }
    } catch (e) {}

    const cleanUraian = (row.uraian || "").toLowerCase();
    if (row.id === "row-det-3" || row.id === "blk-det-3" || row.id === "man-det-3" || cleanUraian.includes("jamuan tamu")) {
      return 5500000;
    }
    if (row.id === "row-det-5" || row.id === "blk-det-5" || row.id === "man-det-5" || cleanUraian.includes("transport lokal")) {
      return 16000000;
    }
    const val = Number(row.jumlah ?? row.jumlahSemula ?? 0);
    return Math.round(val * 0.45);
  }

  if (row.type === "akun" && row.kode) {
    try {
      const stored = localStorage.getItem("rab_realisasi_per_akun");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[row.kode] !== undefined) return parsed[row.kode];
      }
    } catch (e) {}
    const simMap: Record<string, number> = {
      "521211": 45000000,
      "521219": 5500000,
      "522151": 2500000,
      "524113": 16000000,
      "524219": 40000000,
    };
    if (simMap[row.kode] !== undefined) return simMap[row.kode];
    return Math.round(Number(row.jumlah ?? row.jumlahSemula ?? 0) * 0.45);
  }

  return 0;
}

export function cleanUraianForMatch(s: string | undefined): string {
  if (!s) return "";
  return String(s)
    .replace(/\(.*?\)/g, "")
    .replace(/[-*•>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Helper format angka ribuan dengan pemisah '.' (standar Indonesia)
export function formatNumberWithDots(val: number | string | undefined): string {
  if (val === undefined || val === null || val === "" || val === 0) return "";
  const num = typeof val === "number" ? val : parseInt(String(val).replace(/\D/g, ""), 10);
  if (isNaN(num) || num === 0) return "";
  return new Intl.NumberFormat("id-ID").format(num);
}

// Helper parse input berpemisah '.' kembali ke number
export function parseNumberFromDots(valStr: string): number {
  const clean = valStr.replace(/\D/g, "");
  if (!clean) return 0;
  return parseInt(clean, 10);
}


// 9 Pilihan Jenis Blokir Resmi (Referensi automatic_adjustment.md)
export const JENIS_BLOKIR_OPTIONS = [
  {
    kode: "1",
    label: "1: Alokasi Anggaran yang Belum Dilengkapi Dasar Hukum Pengalokasiannya dan/atau Dokumen Terkait Lainnya (Kewenangan K/L)",
  },
  {
    kode: "2",
    label: "2: Alokasi Anggaran yang Masih Harus Dilengkapi Dasar Hukum Pengalokasiannya dan/atau Dokumen Terkait yang Relevan",
  },
  {
    kode: "3",
    label: "3: Pencantuman Alokasi Anggaran dalam DIPA yang Belum Diikuti dengan Penyaluran Dana Selaras dengan Kesiapan Pelaksanaan Kegiatan",
  },
  {
    kode: "4",
    label: "4: Alokasi Anggaran yang Pelaksanaannya Menunggu Hasil Evaluasi atau Penilaian Lebih Lanjut",
  },
  {
    kode: "5",
    label: "5: Alokasi Anggaran Rekening Cadangan (Earmarked) untuk Pembiayaan Khusus atau Kondisi Darurat",
  },
  {
    kode: "6",
    label: "6: Alokasi Anggaran Terkait Pinjaman/Hibah Luar Negeri (PHLN) atau Surat Berharga Syariah Negara (SBSN) yang Dokumen Teknisnya Belum Lengkap",
  },
  {
    kode: "7",
    label: "7: Alokasi Anggaran yang Persyaratan Teknis Pengadaan atau Pelaksanaan Kegiatannya Masih Harus Melalui Reviu Aparat Pengawasan Intern Pemerintah (APIP)",
  },
  {
    kode: "8",
    label: "8: Alokasi Anggaran yang Ketentuan Pelaksanaannya Menunggu Penerbitan Peraturan Turunan atau Regulasi Pelaksana yang Sah",
  },
  {
    kode: "9",
    label: "Kode 9: Automatic Adjustment (Penyesuaian Otomatis Belanja)",
  },
];

// Peringkat hierarki untuk cascading checklist:
// Jika level lebih tinggi dipilih (misal Akun), maka level di bawahnya (Header 1, Header 2, Detail) ikut ter-checklist
export const HIERARCHY_RANK: Record<string, number> = {
  program: 0,
  kegiatan: 1,
  kro: 2,
  ro: 3,
  komponen: 4,
  subkomponen: 5,
  akun: 6,
  header1: 7,
  header2: 8,
  detail: 9,
};

export interface BlokirRowItem {
  id: string;
  kode: string;
  type: "program" | "kegiatan" | "kro" | "ro" | "komponen" | "subkomponen" | "akun" | "header1" | "header2" | "detail";
  uraian: string;
  jumlah: number;
  blokir: number;
  jenisBlokir: string;
  isChecklist: boolean;
  unitKerja: string;
}

export interface ManualAaRowItem {
  id: string;
  kode: string;
  type: "program" | "kegiatan" | "kro" | "ro" | "komponen" | "subkomponen" | "akun" | "header1" | "header2" | "detail";
  uraian: string;
  jumlahSemula: number;
  jumlahMenjadi: number;
  keterangan: string;
  unitKerja: string;
}

export default function AutomaticAdjustmentPage() {

  // Auto-migrate legacy localStorage unit kerja HUKER -> KREASI
  useEffect(() => {
    try {
      const keys = ['rab_aa_blokir_rows_v2', 'rab_monitoring_blokir_data', 'rab_aa_manual_rows_v2', 'rab_worksheet_HUKER'];
      keys.forEach((key) => {
        const raw = localStorage.getItem(key);
        if (raw && raw.includes('"HUKER"')) {
          localStorage.setItem(key, raw.replace(/"HUKER"/g, '"KREASI"'));
        }
      });
      const hukerWs = localStorage.getItem('rab_worksheet_HUKER');
      if (hukerWs && !localStorage.getItem('rab_worksheet_KREASI')) {
        localStorage.setItem('rab_worksheet_KREASI', hukerWs.replace(/"HUKER"/g, '"KREASI"'));
      }
    } catch (e) {}
  }, []);

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("renja_e2_user_role");
      if (saved && ["Operator", "Approver", "BINCANG", "Super Admin"].includes(saved)) {
        return saved as UserRole;
      }
    } catch (e) {}
    return "BINCANG";
  });

  const isPrivileged = currentUserRole === "BINCANG" || currentUserRole === "Super Admin";

  // Mode Pilihan Kertas Kerja Automatic Adjustment:
  // 1. pemberian tanda @ (blokir anggaran)
  // 2. penyesuaian jumlah pagu
  // User dapat memilih lebih dari 1
  const [selectedTypes, setSelectedTypes] = useState<{
    blokir: boolean;
    pagu: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem("rab_aa_selected_types");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => item.unitKerja === "HUKER" ? { ...item, unitKerja: "KREASI" } : item);
      }
    } catch (e) {}
    return { blokir: true, pagu: false };
  });

  const toggleType = (key: "blokir" | "pagu") => {
    setSelectedTypes((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.blokir && !next.pagu) {
        next[key] = true;
      }
      try {
        localStorage.setItem("rab_aa_selected_types", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Sub-pilihan Penyesuaian Jumlah Pagu: "massal" | "manual"
  const [paguMode, setPaguMode] = useState<"massal" | "manual">(() => {
    try {
      return (localStorage.getItem("rab_aa_pagu_mode") as "massal" | "manual") || "massal";
    } catch (e) {
      return "massal";
    }
  });

  const handleSelectPaguMode = (mode: "massal" | "manual") => {
    setPaguMode(mode);
    try {
      localStorage.setItem("rab_aa_pagu_mode", mode);
    } catch (e) {}
  };

  // Unit Kerja Filter
  const [selectedUnit, setSelectedUnit] = useState<string>("Semua Unit Kerja");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Feedback Notification Message
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const showNotification = (text: string, type: "success" | "error" | "info" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. DATA KERTAS KERJA BLOKIR ANGGARAN (s.d. Detail Belanja)
  // ─────────────────────────────────────────────────────────────
  const initialBlokirRows = useMemo<BlokirRowItem[]>(() => {
    try {
      const savedAaBlokir = localStorage.getItem("rab_aa_blokir_rows_v2");
      if (savedAaBlokir) {
        const parsed = JSON.parse(savedAaBlokir);
        return parsed.map((item: any) => item.unitKerja === "HUKER" ? { ...item, unitKerja: "KREASI" } : item);
      }
    } catch (e) {}

    const rows: BlokirRowItem[] = [
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
    return rows;
  }, []);

  const [blokirRows, setBlokirRows] = useState<BlokirRowItem[]>(initialBlokirRows);

  // Cascading Checklist: Apabila user memilih level yang lebih tinggi, maka level di bawahnya ikut ter-checklist
  // Misal user memilih level Akun, maka level Header 1, Header 2, dan Detail Belanja ikut ter-checklist
  const handleToggleChecklistBlokir = (rowId: string) => {
    setBlokirRows((prev) => {
      const targetIdx = prev.findIndex((r) => r.id === rowId);
      if (targetIdx === -1) return prev;

      const targetRow = prev[targetIdx];
      const nextCheck = !targetRow.isChecklist;
      const targetLvl = HIERARCHY_RANK[targetRow.type] ?? 99;

      // Temukan seluruh index baris di bawahnya yang merupakan anak hierarki
      const affectedIndices = new Set<number>([targetIdx]);
      for (let i = targetIdx + 1; i < prev.length; i++) {
        const currLvl = HIERARCHY_RANK[prev[i].type] ?? 99;
        if (currLvl > targetLvl) {
          affectedIndices.add(i);
        } else {
          break;
        }
      }

      return prev.map((r, idx) => {
        if (affectedIndices.has(idx)) {
          return {
            ...r,
            isChecklist: nextCheck,
            blokir: nextCheck ? r.jumlah : 0,
          };
        }
        return r;
      });
    });
  };

  // Checklist massal semua baris
  const handleToggleAllChecklist = (checked: boolean) => {
    setBlokirRows((prev) =>
      prev.map((r) => ({
        ...r,
        isChecklist: checked,
        blokir: checked ? r.jumlah : 0,
      }))
    );
  };

  const handleBlokirNumberChange = (rowId: string, value: number) => {
    setBlokirRows((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          const clamped = Math.max(0, Math.min(r.jumlah, value));
          return {
            ...r,
            blokir: clamped,
            isChecklist: clamped === r.jumlah && r.jumlah > 0,
          };
        }
        return r;
      })
    );
  };

  const handleJenisBlokirChange = (rowId: string, jenis: string) => {
    setBlokirRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, jenisBlokir: jenis } : r))
    );
  };

  // Simpan Kertas Kerja Blokir Anggaran & Tandai '*' di Isian RAB
  const handleSaveBlokirKertasKerja = () => {
    // Validasi logic: (JUMLAH - BLOKIR) >= REALISASI
    const violations: { uraian: string; jumlah: number; blokir: number; sisa: number; realisasi: number }[] = [];
    blokirRows.forEach((r) => {
      if (r.type === "detail") {
        const realisasi = getRealisasiForAaRow(r);
        const paguEfektif = Number(r.jumlah || 0) - Number(r.blokir || 0);
        if (paguEfektif < realisasi) {
          violations.push({
            uraian: r.uraian,
            jumlah: r.jumlah,
            blokir: r.blokir,
            sisa: paguEfektif,
            realisasi,
          });
        }
      }
    });

    if (violations.length > 0) {
      const v = violations[0];
      showNotification(
        `Data tidak dapat disimpan! Parameter melanggar ketentuan realisasi: (JUMLAH - BLOKIR) harus >= REALISASI. Pada "${v.uraian.replace(/^[-*•\s]+/, "")}", sisa pagu Rp ${v.sisa.toLocaleString("id-ID")} lebih kecil dari realisasi belanja Rp ${v.realisasi.toLocaleString("id-ID")} (Blokir: Rp ${v.blokir.toLocaleString("id-ID")}). Silakan perbaiki parameter blokir terlebih dahulu!`,
        "error"
      );
      return;
    }

    try {
      localStorage.setItem("rab_aa_blokir_rows_v2", JSON.stringify(blokirRows));

      const blockedMap: Record<string, boolean> = {};
      const blockedList: any[] = [];

      blokirRows.forEach((r) => {
        if (r.blokir > 0) {
          blockedMap[r.id] = true;
          if (r.kode) blockedMap[r.kode] = true;
          blockedList.push({
            id: r.id,
            kode: r.kode,
            uraian: r.uraian,
            jumlah: r.jumlah,
            blokir: r.blokir,
            jenisBlokir: r.jenisBlokir,
            unitKerja: r.unitKerja,
            tglBlokir: new Date().toLocaleDateString("id-ID"),
          });
        }
      });

      // Simpan blockedMap baik berdasarkan ID, kode, maupun string uraian yang dinormalisasi
      blokirRows.forEach((r) => {
        if (r.blokir > 0) {
          const cu = cleanUraianForMatch(r.uraian);
          if (cu) blockedMap[cu] = true;
          const cleanId = r.id.replace(/^blk-/, "");
          blockedMap[cleanId] = true;
          blockedMap[`row-${cleanId}`] = true;
        }
      });

      localStorage.setItem("rab_aa_blocked_rows", JSON.stringify(blockedMap));
      localStorage.setItem("rab_monitoring_blokir_data", JSON.stringify(blockedList));

      // Update worksheetRows di localStorage untuk seluruh unit kerja agar row.tStar = "*"
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("rab_worksheet_"));
      if (keys.length === 0) {
        keys.push("rab_worksheet_KREASI", "rab_worksheet_PATIH", "rab_worksheet_BINCANG");
      }
      keys.forEach((k) => {
        try {
          const raw = localStorage.getItem(k);
          if (!raw) return;
          const ws = JSON.parse(raw);
          const updated = ws.map((row: any) => {
            const cu = cleanUraianForMatch(row.uraian);
            const isBlocked =
              blockedMap[row.id] ||
              (row.kode && blockedMap[row.kode]) ||
              (cu && blockedMap[cu]);
            if (isBlocked) {
              return { ...row, tStar: "*" };
            }
            return row;
          });
          localStorage.setItem(k, JSON.stringify(updated));
        } catch (e) {}
      });

      window.dispatchEvent(new Event("rab_aa_updated"));
      window.dispatchEvent(new Event("rab_worksheet_updated"));
      showNotification(
        `Kertas Kerja Blokir Anggaran berhasil disimpan! Tanda '*' telah otomatis disematkan pada submenu Isian RAB (${blockedList.length} pos anggaran terblokir).`,
        "success"
      );
    } catch (e) {
      showNotification("Gagal menyimpan kertas kerja blokir anggaran.", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 2. PENYESUAIAN JUMLAH PAGU - MASSAL
  // ─────────────────────────────────────────────────────────────
  const [persentaseMassal, setPersentaseMassal] = useState<number>(10);
  const [selectedAkunSasaran, setSelectedAkunSasaran] = useState<string>("524111");

  const availableAkunOptions = useMemo(() => {
    const list: { kode: string; nama: string }[] = [];
    const seen = new Set<string>();

    baganAkunStandar.forEach((b: any) => {
      const code = b.kode || b.kdakun;
      const name = b.nama || b.nmakun || b.uraian;
      if (code && String(code).startsWith("5") && !seen.has(code)) {
        seen.add(code);
        list.push({ kode: code, nama: name });
      }
    });

    const standardCodes = [
      { kode: "524111", nama: "Belanja Perjalanan Dinas Biasa" },
      { kode: "521211", nama: "Belanja Bahan" },
      { kode: "521219", nama: "Belanja Barang Non Operasional Lainnya" },
      { kode: "522151", nama: "Belanja Jasa Profesi" },
      { kode: "524113", nama: "Belanja Perjalanan Dinas Dalam Kota" },
      { kode: "524219", nama: "Belanja Perjalanan Dinas Lainnya - Luar Negeri" },
      { kode: "521811", nama: "Belanja Barang Persediaan Barang Konsumsi" },
    ];

    standardCodes.forEach((s) => {
      if (!seen.has(s.kode)) {
        seen.add(s.kode);
        list.push(s);
      }
    });

    return list.sort((a, b) => a.kode.localeCompare(b.kode));
  }, []);

  const handleApplyAaMassal = () => {
    if (persentaseMassal <= 0 || persentaseMassal > 100) {
      showNotification("Besaran persentase harus antara 1% sampai 100%.", "error");
      return;
    }

    try {
      const multiplier = (100 - persentaseMassal) / 100;
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("rab_worksheet_"));
      if (keys.length === 0) {
        keys.push("rab_worksheet_KREASI", "rab_worksheet_PATIH", "rab_worksheet_BINCANG");
      }

      keys.forEach((key) => {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return;
          const rows: any[] = JSON.parse(raw);
          let currentParentAkun = "";

          const updatedRows = rows.map((r: any) => {
            if (r.type === "akun") {
              currentParentAkun = r.kode || "";
            }

            const isTarget =
              r.kode === selectedAkunSasaran ||
              r.parentAkunKode === selectedAkunSasaran ||
              currentParentAkun === selectedAkunSasaran;

            if (isTarget) {
              if (r.type === "detail") {
                const oldHarga = Number(r.harga) || 0;
                const newHarga = Math.round(oldHarga * multiplier);
                const vol = Number(r.vol) || 1;
                const newJumlah = Math.floor((newHarga * vol) / 1000) * 1000;
                return {
                  ...r,
                  harga: newHarga,
                  jumlah: newJumlah,
                };
              } else if (r.type === "akun") {
                const oldJumlah = Number(r.jumlah) || 0;
                return {
                  ...r,
                  jumlah: Math.floor((oldJumlah * multiplier) / 1000) * 1000,
                };
              }
            }
            return r;
          });

          localStorage.setItem(key, JSON.stringify(updatedRows));
        } catch (e) {}
      });

      setManualRows((prev) =>
        prev.map((r) => {
          if (r.kode === selectedAkunSasaran || r.kode.startsWith(selectedAkunSasaran)) {
            const newJml = Math.floor((r.jumlahSemula * multiplier) / 1000) * 1000;
            return {
              ...r,
              jumlahMenjadi: newJml,
              keterangan: `Penyesuaian Automatic Adjustment massal -${persentaseMassal}% (Kewenangan BINCANG)`,
            };
          }
          return r;
        })
      );

      localStorage.setItem(
        "rab_aa_last_massal_log",
        JSON.stringify({
          tipe: "massal",
          persentase: persentaseMassal,
          akun: selectedAkunSasaran,
          tgl: new Date().toLocaleDateString("id-ID"),
          oleh: currentUserRole,
        })
      );
      window.dispatchEvent(new Event("rab_worksheet_updated"));

      showNotification(
        `OK! Automatic Adjustment massal berhasil diterapkan: Akun ${selectedAkunSasaran} beserta seluruh level di bawahnya (kolom SATUAN) berhasil dikurangi ${persentaseMassal}%. Data Isian RAB seluruh unit kerja telah diperbarui secara otomatis.`,
        "success"
      );
    } catch (err) {
      showNotification("Gagal menerapkan Automatic Adjustment massal.", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 3. PENYESUAIAN JUMLAH PAGU - MANUAL (s.d. Detail Belanja)
  // ─────────────────────────────────────────────────────────────
  const initialManualRows = useMemo<ManualAaRowItem[]>(() => {
    try {
      const saved = localStorage.getItem("rab_aa_manual_rows_v2");
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return [
      {
        id: "man-prog",
        kode: "078.01.BE",
        type: "program",
        uraian: "Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
        jumlahSemula: 743651000,
        jumlahMenjadi: 743651000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      {
        id: "man-keg",
        kode: "3379",
        type: "kegiatan",
        uraian: "Pengelolaan Bidang Hukum dan Regulasi PPATK",
        jumlahSemula: 743651000,
        jumlahMenjadi: 743651000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      {
        id: "man-kro",
        kode: "3379.AAH",
        type: "kro",
        uraian: "Peraturan lainnya (Lokasi: 01.51 - KOTA JAKARTA PUSAT)",
        jumlahSemula: 743651000,
        jumlahMenjadi: 743651000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      {
        id: "man-ro",
        kode: "3379.AAH.001",
        type: "ro",
        uraian: "Penyusunan Regulasi PPATK",
        jumlahSemula: 743651000,
        jumlahMenjadi: 743651000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      {
        id: "man-komp-052",
        kode: "052",
        type: "komponen",
        uraian: "Penyusunan Dokumen Legislasi",
        jumlahSemula: 578910000,
        jumlahMenjadi: 578910000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      {
        id: "man-subkomp-A",
        kode: "A",
        type: "subkomponen",
        uraian: "Penyusunan dan Implementasi Regulasi Kerja Sama",
        jumlahSemula: 181573000,
        jumlahMenjadi: 181573000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      // AKUN 1: 521211
      {
        id: "man-akun-521211",
        kode: "521211",
        type: "akun",
        uraian: "Belanja Bahan",
        jumlahSemula: 64709000,
        jumlahMenjadi: 64709000,
        keterangan: "Penyelarasan konsumsi rapat dinas internal",
        unitKerja: "KREASI",
      },
      {
        id: "man-det-1",
        kode: "",
        type: "detail",
        uraian: "- Konsumsi Rapat (18 ORG x 45 KEG = 810 OK @ 79.559)",
        jumlahSemula: 64443000,
        jumlahMenjadi: 64443000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      {
        id: "man-det-2",
        kode: "",
        type: "detail",
        uraian: "- Souvenir Kunjungan Tamu Internasional (1 ORG x 1 KEG = 1 OK @ 266.000)",
        jumlahSemula: 266000,
        jumlahMenjadi: 266000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      // AKUN 2: 521219
      {
        id: "man-akun-521219",
        kode: "521219",
        type: "akun",
        uraian: "Belanja Barang Non Operasional Lainnya",
        jumlahSemula: 4491000,
        jumlahMenjadi: 4491000,
        keterangan: "Efisiensi jamuan tamu",
        unitKerja: "KREASI",
      },
      {
        id: "man-det-3",
        kode: "",
        type: "detail",
        uraian: "- Jamuan Tamu Internasional (20 ORG x 1 KEG = 20 OK @ 224.550)",
        jumlahSemula: 4491000,
        jumlahMenjadi: 4491000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      // AKUN 3: 522151
      {
        id: "man-akun-522151",
        kode: "522151",
        type: "akun",
        uraian: "Belanja Jasa Profesi",
        jumlahSemula: 3800000,
        jumlahMenjadi: 3800000,
        keterangan: "Honorarium narasumber",
        unitKerja: "KREASI",
      },
      {
        id: "man-det-4",
        kode: "",
        type: "detail",
        uraian: "- Honorarium Narasumber Eselon III (2 ORG x 1 KEG x 3 JM = 6 OK @ 633.333)",
        jumlahSemula: 3800000,
        jumlahMenjadi: 3800000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      // AKUN 4: 524113
      {
        id: "man-akun-524113",
        kode: "524113",
        type: "akun",
        uraian: "Belanja Perjalanan Dinas Dalam Kota",
        jumlahSemula: 14620000,
        jumlahMenjadi: 14620000,
        keterangan: "Transport lokal koordinasi",
        unitKerja: "KREASI",
      },
      {
        id: "man-det-5",
        kode: "",
        type: "detail",
        uraian: "- Transport Lokal (3 ORG x 29 KEG = 87 OK @ 168.046)",
        jumlahSemula: 14620000,
        jumlahMenjadi: 14620000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      // AKUN 5: 524219
      {
        id: "man-akun-524219",
        kode: "524219",
        type: "akun",
        uraian: "Belanja Perjalanan Dinas Lainnya - Luar Negeri",
        jumlahSemula: 63787000,
        jumlahMenjadi: 63787000,
        keterangan: "Perjalanan dinas luar negeri",
        unitKerja: "KREASI",
      },
      {
        id: "man-sub-sg",
        kode: "",
        type: "header1",
        uraian: "> Singapore (FICG Meeting)",
        jumlahSemula: 5483000,
        jumlahMenjadi: 5483000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      {
        id: "man-det-6",
        kode: "",
        type: "detail",
        uraian: "- Uang Harian Gol C - Singapore (1 ORG x 1 KEG x 3 HR = 3 OH @ 1.827.667)",
        jumlahSemula: 5483000,
        jumlahMenjadi: 5483000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      {
        id: "man-sub-ns",
        kode: "",
        type: "header1",
        uraian: "> Pemenuhan permintaan Narasumber dari Negara Lain/Organisasi",
        jumlahSemula: 50899000,
        jumlahMenjadi: 50899000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      {
        id: "man-det-7",
        kode: "",
        type: "detail",
        uraian: "- Uang Harian Gol B - Singapura (2 ORG x 2 KEG x 2 HR = 8 OH @ 3.202.375)",
        jumlahSemula: 25619000,
        jumlahMenjadi: 25619000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      {
        id: "man-det-8",
        kode: "",
        type: "detail",
        uraian: "- Uang Harian Gol C - Singapura (3 ORG x 2 KEG x 2 HR = 12 OH @ 2.066.583)",
        jumlahSemula: 24799000,
        jumlahMenjadi: 24799000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      {
        id: "man-det-9",
        kode: "",
        type: "detail",
        uraian: "- Uang Harian Perjalanan Gol C - Singapura (3 ORG x 2 KEG x 1 HR = 6 OH @ 80.167)",
        jumlahSemula: 481000,
        jumlahMenjadi: 481000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      {
        id: "man-sub-tw",
        kode: "",
        type: "header1",
        uraian: "> Taiwan",
        jumlahSemula: 2411000,
        jumlahMenjadi: 2411000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      {
        id: "man-det-10",
        kode: "",
        type: "detail",
        uraian: "- Uang Harian Gol C - Taiwan (1 ORG x 1 KEG x 4 HR = 4 OH @ 602.750)",
        jumlahSemula: 2411000,
        jumlahMenjadi: 2411000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      // Komponen Pendukung 054
      {
        id: "man-komp-054",
        kode: "054",
        type: "komponen",
        uraian: "Pengelolaan JDIH",
        jumlahSemula: 164741000,
        jumlahMenjadi: 164741000,
        keterangan: "-",
        unitKerja: "KREASI",
      },
      // Data Tambahan untuk Pusdiklat APU PPT (PATIH)
      {
        id: "man-ro-patih",
        kode: "3365.DCF.001",
        type: "ro",
        uraian: "Pelatihan bidang APU PPT PPSPM",
        jumlahSemula: 412500000,
        jumlahMenjadi: 412500000,
        keterangan: "-",
        unitKerja: "PATIH",
      },
      // PATIH Akun 524111
      {
        id: "man-akun-patih",
        kode: "524111",
        type: "akun",
        uraian: "Belanja Perjalanan Dinas Biasa",
        jumlahSemula: 100000000,
        jumlahMenjadi: 90000000,
        keterangan: "Penyesuaian pagu Automatic Adjustment 10% sesuai arahan Kemenkeu",
        unitKerja: "PATIH",
      },
      {
        id: "man-det-patih-1",
        kode: "",
        type: "detail",
        uraian: "- Transport Tim Pengajar Diklat Luar Kota (5 ORG x 10 KEG)",
        jumlahSemula: 100000000,
        jumlahMenjadi: 90000000,
        keterangan: "Penyesuaian tarif tiket dan transport narasumber",
        unitKerja: "PATIH",
      },
    ];
  }, []);

  const [manualRows, setManualRows] = useState<ManualAaRowItem[]>(initialManualRows);

  const handleManualJumlahChange = (rowId: string, val: number) => {
    setManualRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, jumlahMenjadi: val } : r))
    );
  };

  const handleManualKeteranganChange = (rowId: string, ket: string) => {
    setManualRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, keterangan: ket } : r))
    );
  };

  const handleSaveManualPagu = () => {
    // Validasi logic: (JUMLAH MENJADI - BLOKIR) >= REALISASI
    const violations: { uraian: string; jumlahMenjadi: number; blokir: number; sisa: number; realisasi: number }[] = [];
    manualRows.forEach((r) => {
      if (r.type === "detail") {
        const realisasi = getRealisasiForAaRow(r);
        // Cek data blokir untuk baris ini jika ada
        const correspondingBlokir = blokirRows.find((b) => b.id === r.id || b.uraian === r.uraian || (b.kode && b.kode === r.kode));
        const blokirVal = correspondingBlokir ? Number(correspondingBlokir.blokir || 0) : 0;
        const paguEfektif = Number(r.jumlahMenjadi || 0) - blokirVal;
        if (paguEfektif < realisasi) {
          violations.push({
            uraian: r.uraian,
            jumlahMenjadi: r.jumlahMenjadi,
            blokir: blokirVal,
            sisa: paguEfektif,
            realisasi,
          });
        }
      }
    });

    if (violations.length > 0) {
      const v = violations[0];
      showNotification(
        `Data tidak dapat disimpan! Parameter melanggar ketentuan realisasi: (JUMLAH MENJADI - BLOKIR) harus >= REALISASI. Pada "${v.uraian.replace(/^[-*•\s]+/, "")}", sisa pagu Rp ${v.sisa.toLocaleString("id-ID")} lebih kecil dari batas realisasi Rp ${v.realisasi.toLocaleString("id-ID")}. Perbaiki parameter terlebih dahulu agar eksekusi dapat tersimpan!`,
        "error"
      );
      return;
    }

    try {
      localStorage.setItem("rab_aa_manual_rows_v2", JSON.stringify(manualRows));
      const changedRows = manualRows.filter((r) => r.jumlahMenjadi !== r.jumlahSemula);

      // Simpan lookup map penyesuaian manual (baik berdasar kode maupun uraian bersih)
      const manualAdjMap: Record<string, { jumlah: number; keterangan: string }> = {};
      manualRows.forEach((r) => {
        if (r.jumlahMenjadi !== r.jumlahSemula) {
          const cu = cleanUraianForMatch(r.uraian);
          if (cu) {
            manualAdjMap[cu] = { jumlah: r.jumlahMenjadi, keterangan: r.keterangan };
          }
          if (r.kode) {
            manualAdjMap[r.kode] = { jumlah: r.jumlahMenjadi, keterangan: r.keterangan };
          }
          const cleanId = r.id.replace(/^man-/, "");
          manualAdjMap[cleanId] = { jumlah: r.jumlahMenjadi, keterangan: r.keterangan };
          manualAdjMap[`row-${cleanId}`] = { jumlah: r.jumlahMenjadi, keterangan: r.keterangan };
        }
      });
      localStorage.setItem("rab_aa_manual_adj_map", JSON.stringify(manualAdjMap));

      // Terapkan penyesuaian langsung ke seluruh lembar kerja unit kerja (rab_worksheet_*)
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("rab_worksheet_"));
      if (keys.length === 0) {
        keys.push("rab_worksheet_KREASI", "rab_worksheet_PATIH", "rab_worksheet_BINCANG");
      }
      keys.forEach((key) => {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return;
          const rows: any[] = JSON.parse(raw);
          const updated = rows.map((r: any) => {
            const cu = cleanUraianForMatch(r.uraian);
            const adj = manualAdjMap[r.id] || (r.kode && manualAdjMap[r.kode]) || (cu && manualAdjMap[cu]);
            if (adj !== undefined) {
              const newJumlah = adj.jumlah;
              if (r.type === "detail") {
                const vol = Number(r.vol) || 1;
                const newHarga = vol > 0 ? Math.round(newJumlah / vol) : newJumlah;
                return {
                  ...r,
                  harga: newHarga,
                  jumlah: newJumlah,
                };
              } else {
                return {
                  ...r,
                  jumlah: newJumlah,
                };
              }
            }
            return r;
          });
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {}
      });

      localStorage.setItem(
        "rab_aa_last_manual_log",
        JSON.stringify({
          tgl: new Date().toLocaleDateString("id-ID"),
          count: changedRows.length,
          oleh: currentUserRole,
        })
      );

      window.dispatchEvent(new Event("rab_aa_updated"));
      window.dispatchEvent(new Event("rab_worksheet_updated"));

      showNotification(
        `OK! Penyesuaian jumlah pagu manual berhasil disimpan (${changedRows.length} pos anggaran disesuaikan nilainya). Kolom SATUAN & JUMLAH pada submenu Isian RAB telah otomatis disesuaikan!`,
        "success"
      );
    } catch (e) {
      showNotification("Gagal menyimpan penyesuaian manual pagu.", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // FILTERING BARIS KERTAS KERJA
  // ─────────────────────────────────────────────────────────────
  const filteredBlokirRows = useMemo(() => {
    return blokirRows.filter((r) => {
      if (selectedUnit !== "Semua Unit Kerja" && r.unitKerja !== selectedUnit) {
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
  }, [blokirRows, selectedUnit, searchQuery]);

  const filteredManualRows = useMemo(() => {
    return manualRows.filter((r) => {
      if (selectedUnit !== "Semua Unit Kerja" && r.unitKerja !== selectedUnit) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.kode.toLowerCase().includes(q) ||
          r.uraian.toLowerCase().includes(q) ||
          r.keterangan.toLowerCase().includes(q) ||
          r.unitKerja.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [manualRows, selectedUnit, searchQuery]);

  // Drill Down State & Tree untuk Kertas Kerja Blokir Anggaran
  const [expandedBlokirNodes, setExpandedBlokirNodes] = useState<Record<string, boolean>>({});
  const blokirTreeResult = useMemo(() => {
    return buildHierarchyTree(filteredBlokirRows, HIERARCHY_RANK);
  }, [filteredBlokirRows]);

  const visibleBlokirRows = useMemo(() => {
    if (searchQuery.trim()) return filteredBlokirRows;
    return getVisibleRowsFromTree(blokirTreeResult.tree, expandedBlokirNodes);
  }, [blokirTreeResult, expandedBlokirNodes, filteredBlokirRows, searchQuery]);

  const toggleBlokirExpand = (id: string) => {
    setExpandedBlokirNodes((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  const handleExpandAllBlokir = () => {
    const next: Record<string, boolean> = {};
    blokirTreeResult.allParentIds.forEach((id) => (next[id] = true));
    setExpandedBlokirNodes(next);
  };

  const handleCollapseAllBlokir = () => {
    const next: Record<string, boolean> = {};
    blokirTreeResult.allParentIds.forEach((id) => (next[id] = false));
    setExpandedBlokirNodes(next);
  };

  // Drill Down State & Tree untuk Penyesuaian Pagu Manual
  const [expandedManualNodes, setExpandedManualNodes] = useState<Record<string, boolean>>({});
  const manualTreeResult = useMemo(() => {
    return buildHierarchyTree(filteredManualRows, HIERARCHY_RANK);
  }, [filteredManualRows]);

  const visibleManualRows = useMemo(() => {
    if (searchQuery.trim()) return filteredManualRows;
    return getVisibleRowsFromTree(manualTreeResult.tree, expandedManualNodes);
  }, [manualTreeResult, expandedManualNodes, filteredManualRows, searchQuery]);

  const toggleManualExpand = (id: string) => {
    setExpandedManualNodes((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  const handleExpandAllManual = () => {
    const next: Record<string, boolean> = {};
    manualTreeResult.allParentIds.forEach((id) => (next[id] = true));
    setExpandedManualNodes(next);
  };

  const handleCollapseAllManual = () => {
    const next: Record<string, boolean> = {};
    manualTreeResult.allParentIds.forEach((id) => (next[id] = false));
    setExpandedManualNodes(next);
  };

  const summaryStats = useMemo(() => {
    const totalPaguAll = blokirRows.reduce((acc, r) => (r.type === "program" ? acc + r.jumlah : acc), 0) || 743651000;
    const totalBlokirAll = blokirRows.reduce((acc, r) => acc + (Number(r.blokir) || 0), 0);
    const countBlokirActive = blokirRows.filter((r) => r.blokir > 0).length;

    return {
      totalPaguAll,
      totalBlokirAll,
      effectivePagu: Math.max(0, totalPaguAll - totalBlokirAll),
      countBlokirActive,
    };
  }, [blokirRows]);

  if (!isPrivileged) {
    return (
      <div className="min-h-full p-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-base font-bold text-[var(--text)]">
              Akses Dibatasi untuk Role BINCANG &amp; Super Admin
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Submenu <strong>Automatic Adjustment (AA)</strong> merupakan instrumen fiskal resmi untuk pengendalian pagu dan pemblokiran anggaran yang hanya dapat dikelola oleh Biro Perencanaan &amp; Keuangan (BINCANG) dan Super Admin.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/rab/isian"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow hover:opacity-90 transition-opacity"
            >
              <span>Kembali ke Isian RAB</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="text-[var(--primary)] font-semibold">Automatic Adjustment</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <SlidersHorizontal className="h-6 w-6 text-[var(--primary)]" />
            <span>Automatic Adjustment (Penyesuaian Otomatis Belanja &amp; Blokir)</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Pengelolaan 2 jenis kebijakan Automatic Adjustment: pemberian tanda blokir (@/*) dan penyesuaian jumlah pagu (massal/manual) sesuai mandat Kementerian Keuangan.
          </p>
        </div>

        {/* Badge Kewenangan */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Role Pengelola: {currentUserRole}</span>
        </div>
      </div>

      {/* ── Notification Feedback Alert ── */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : feedbackMsg.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
              : "bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Summary Cards (Ringkasan Pengendalian Pagu) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--border)] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Alokasi Anggaran:</span>
          <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
            Rp {summaryStats.totalPaguAll.toLocaleString("id-ID")}
          </div>
          <p className="text-[10px] text-slate-400">Total alokasi pagu DIPA aktif</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Total Anggaran Dibekukan (Blokir):
          </span>
          <div className="text-lg font-black text-amber-600 font-mono">
            Rp {summaryStats.totalBlokirAll.toLocaleString("id-ID")}
          </div>
          <p className="text-[10px] text-amber-600/80">
            {summaryStats.countBlokirActive} pos anggaran berstatus blokir (*)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Pagu Efektif Tersedia:
          </span>
          <div className="text-lg font-black text-emerald-600 font-mono">
            Rp {summaryStats.effectivePagu.toLocaleString("id-ID")}
          </div>
          <p className="text-[10px] text-emerald-600/80">Alokasi yang siap direalisasikan satker</p>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
            Status Kertas Kerja Aktif:
          </span>
          <div className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>
              {[selectedTypes.blokir ? "Blokir (@)" : "", selectedTypes.pagu ? "Penyesuaian Pagu" : ""]
                .filter(Boolean)
                .join(" & ")}
            </span>
          </div>
          <p className="text-[10px] text-indigo-500/80">BINCANG &amp; Super Admin</p>
        </div>
      </div>

      {/* ── CARD PEMILIH KERTAS KERJA AUTOMATIC ADJUSTMENT ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Pilih Kertas Kerja Automatic Adjustment yang Ditampilkan:</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Pilih jenis instrumen Automatic Adjustment di bawah ini. Anda dapat memilih salah satu atau <strong>memilih lebih dari 1</strong> secara bersamaan:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Opsi 1: Pemberian Tanda @ (Blokir Anggaran) - Penjelasan di bawah pilihan telah dihapus sesuai instruksi user */}
          <div
            onClick={() => toggleType("blokir")}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
              selectedTypes.blokir
                ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 opacity-75"
            }`}
          >
            <div>
              {selectedTypes.blokir ? (
                <CheckSquare className="w-5 h-5 text-amber-600" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Pemberian Tanda @ (Blokir Anggaran)
              </span>
              {selectedTypes.blokir && (
                <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                  Aktif
                </span>
              )}
            </div>
          </div>

          {/* Opsi 2: Penyesuaian Jumlah Pagu */}
          <div
            onClick={() => toggleType("pagu")}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
              selectedTypes.pagu
                ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 opacity-75"
            }`}
          >
            <div>
              {selectedTypes.pagu ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Penyesuaian Jumlah Pagu
              </span>
              {selectedTypes.pagu && (
                <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200">
                  Aktif
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BAGIAN 1: KERTAS KERJA BLOKIR ANGGARAN (s.d. Detail Belanja) ── */}
      {selectedTypes.blokir && (
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Kertas Kerja Blokir Anggaran (Tanda @ / Bintang *)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Kolom: <strong>KODE</strong>, <strong>OUTPUT / SUBOUTPUT / KOMPONEN / SUBKOMPONEN/ DETAIL BELANJA</strong>, <strong>JUMLAH</strong>, <strong>CHECKLIST</strong>, <strong>BLOKIR</strong>, <strong>JENIS BLOKIR</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveBlokirKertasKerja}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Kertas Kerja Blokir</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kode atau uraian belanja..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-slate-800 text-[var(--text)] text-xs w-full sm:w-72"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800/60">
                <button
                  type="button"
                  onClick={handleExpandAllBlokir}
                  className="px-2 py-1 rounded text-[11px] font-bold bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs hover:bg-amber-50 cursor-pointer"
                  title="Buka seluruh drill-down s.d. Detail Belanja"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={handleCollapseAllBlokir}
                  className="px-2 py-1 rounded text-[11px] font-bold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-xs hover:bg-slate-100 cursor-pointer"
                  title="Tutup drill-down"
                >
                  Collapse All
                </button>
              </div>

              <span className="text-slate-500 font-medium ml-2">Unit Kerja:</span>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-slate-800 text-[var(--text)] text-xs font-semibold cursor-pointer"
              >
                <option value="Semua Unit Kerja">Semua Unit Kerja</option>
                {unitKerjaData.map((u) => (
                  <option key={u.singkatan} value={u.singkatan}>
                    {u.nama} ({u.singkatan})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabel Kertas Kerja Blokir (Ditampilkan s.d. Detail Belanja dengan Nomenklatur Kolom Baru) */}
          <div className="border border-black overflow-x-auto rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#24699f] text-white font-bold text-center border-b border-black">
                  <th className="py-2.5 px-3 border-r border-blue-400/40 w-32">KODE</th>
                  <th className="py-2.5 px-3 border-r border-blue-400/40 text-left min-w-[320px]">
                    OUTPUT / SUBOUTPUT / KOMPONEN / SUBKOMPONEN/ DETAIL BELANJA
                  </th>
                  <th className="py-2.5 px-3 border-r border-blue-400/40 w-36 text-right">JUMLAH (Rp)</th>
                  <th className="py-2.5 px-2 border-r border-blue-400/40 w-24 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span>CHECKLIST</span>
                      <input
                        type="checkbox"
                        checked={filteredBlokirRows.length > 0 && filteredBlokirRows.every((r) => r.isChecklist)}
                        onChange={(e) => handleToggleAllChecklist(e.target.checked)}
                        className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                        title="Checklist semua baris"
                      />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 border-r border-blue-400/40 w-36 text-right">BLOKIR (Rp)</th>
                  <th className="py-2.5 px-3 border-r border-blue-400/40 text-left min-w-[320px]">
                    JENIS BLOKIR (9 Pilihan Resmi)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-sans">
                {visibleBlokirRows.map((row) => {
                  const hasChildren = !!blokirTreeResult.hasChildrenMap[row.id];
                  const isExpanded = expandedBlokirNodes[row.id] !== false;
                  const isBlocked = row.blokir > 0;
                  const isDetail = row.type === "detail";
                  const isHeader = row.type === "header1" || row.type === "header2";
                  const isAkun = row.type === "akun";

                  // Indentasi visual sesuai level hierarki
                  const rank = HIERARCHY_RANK[row.type] ?? 0;
                  const paddingLeftPx = rank * 12;

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
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-mono text-center align-top">
                        <span className={isAkun ? "font-bold text-blue-700 dark:text-blue-400" : ""}>
                          {row.kode || "-"}
                        </span>
                      </td>

                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 align-top">
                        <div style={{ paddingLeft: `${paddingLeftPx}px` }} className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            {hasChildren ? (
                              <button
                                type="button"
                                onClick={() => toggleBlokirExpand(row.id)}
                                className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer transition-colors shrink-0"
                                title={isExpanded ? "Ciutkan level ini" : "Buka drill-down"}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </button>
                            ) : (
                              <span className="w-4 inline-block shrink-0" />
                            )}
                            <span
                              onClick={() => hasChildren && toggleBlokirExpand(row.id)}
                              className={`${hasChildren ? "cursor-pointer hover:underline " : ""}${isDetail ? "text-slate-700 dark:text-slate-300" : isHeader ? "font-semibold italic text-slate-800 dark:text-slate-200" : isAkun ? "font-bold text-blue-700 dark:text-blue-400" : "font-bold text-slate-900 dark:text-slate-100"}`}
                            >
                              {row.uraian}
                            </span>
                          </div>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            Unit: {row.unitKerja} • Level: {row.type.toUpperCase()}
                          </span>
                        </div>
                      </td>

                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right font-mono font-bold align-top">
                        {row.jumlah > 0 ? row.jumlah.toLocaleString("id-ID") : "0"}
                      </td>

                      {/* CHECKLIST (Cascading: memilih level lebih tinggi akan menceklis seluruh level di bawahnya) */}
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={row.isChecklist}
                          onChange={() => handleToggleChecklistBlokir(row.id)}
                          className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                          title={`Centang untuk memilih baris ini beserta seluruh level di bawahnya`}
                        />
                      </td>

                      {/* BLOKIR INPUT (Menggunakan pemisah '.' ribuan standar Indonesia) */}
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right align-top">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberWithDots(row.blokir)}
                          placeholder="0"
                          onChange={(e) => handleBlokirNumberChange(row.id, parseNumberFromDots(e.target.value))}
                          className="w-full px-2 py-1 text-right font-mono font-bold text-amber-700 dark:text-amber-400 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 focus:outline-none focus:border-amber-500 shadow-inner"
                        />
                      </td>

                      {/* JENIS BLOKIR (9 Pilihan) */}
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 align-top">
                        <select
                          value={row.jenisBlokir}
                          onChange={(e) => handleJenisBlokirChange(row.id, e.target.value)}
                          className="w-full px-2 py-1 text-[11px] border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          {JENIS_BLOKIR_OPTIONS.map((opt) => (
                            <option key={opt.kode} value={opt.kode}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BAGIAN 2: PENYESUAIAN JUMLAH PAGU (Ditampilkan s.d. Detail Belanja dengan Nomenklatur Baru) ── */}
      {selectedTypes.pagu && (
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Penyesuaian Jumlah Pagu (Automatic Adjustment)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Pilih metode: <strong>Automatic Adjustment massal</strong> (persentase) atau <strong>Automatic Adjustment manual</strong> (kertas kerja dengan kolom KETERANGAN).
              </p>
            </div>

            {/* Toggle Tab Massal vs Manual */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                onClick={() => handleSelectPaguMode("massal")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  paguMode === "massal"
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Automatic Adjustment Massal</span>
              </button>
              <button
                onClick={() => handleSelectPaguMode("manual")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  paguMode === "manual"
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Automatic Adjustment Manual</span>
              </button>
            </div>
          </div>

          {/* ── METODE 1: AUTOMATIC ADJUSTMENT MASSAL ── */}
          {paguMode === "massal" && (
            <div className="space-y-4 p-5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Besaran Persentase Automatic Adjustment (%):
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-36">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={persentaseMassal}
                        onChange={(e) => setPersentaseMassal(Number(e.target.value))}
                        className="w-full px-3 py-2 pr-8 text-center font-mono font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs"
                      />
                      <span className="absolute right-3 top-2.5 font-bold text-slate-400 text-xs">%</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Isian menjadi besaran persentase pengurangan pagu pada akun sasaran yang dipilih.
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Akun Sasaran Automatic Adjustment:
                  </label>
                  <select
                    value={selectedAkunSasaran}
                    onChange={(e) => setSelectedAkunSasaran(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer font-mono"
                  >
                    {availableAkunOptions.map((opt) => (
                      <option key={opt.kode} value={opt.kode}>
                        {opt.kode} - {opt.nama}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Daftar akun sasaran sesuai level akun yang ada di data Isian RAB dari seluruh Unit Kerja.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Simulasi Pengurangan Sesuai Panduan:</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Setelah klik <strong>OK / Terapkan</strong>, data kolom JUMLAH akan disesuaikan angkanya dengan persentasenya. Misalnya semula akun {selectedAkunSasaran} sebesar Rp100 juta, user menentukan {persentaseMassal}%, maka setelah role BINCANG klik OK, akun {selectedAkunSasaran} beserta seluruh level di bawahnya untuk kolom SATUAN (harga satuan rincian) dikurangi {persentaseMassal}%, sehingga secara agregat jumlah akun tinggal <strong>Rp{(100 * (1 - persentaseMassal / 100)).toFixed(0)} juta</strong>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleApplyAaMassal}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>OK - Terapkan Penyesuaian Akun {selectedAkunSasaran} (-{persentaseMassal}%)</span>
                </button>
              </div>
            </div>
          )}

          {/* ── METODE 2: AUTOMATIC ADJUSTMENT MANUAL (s.d. Detail Belanja dengan Nomenklatur Baru) ── */}
          {paguMode === "manual" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <strong>Format Kertas Kerja Manual:</strong> Seperti pada submenu Isian RAB yang ditampilkan s.d. detail belanja, dengan penambahan kolom <strong>KETERANGAN</strong> setelah kolom JUMLAH. Setelah klik OK / Simpan, nominal pada kolom JUMLAH akan disesuaikan angkanya dengan isian user role BINCANG atau Super Admin.
                </div>
                <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-white dark:bg-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={handleExpandAllManual}
                    className="px-2 py-1 rounded text-[11px] font-bold bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs hover:bg-blue-100 cursor-pointer"
                    title="Buka seluruh drill-down s.d. Detail Belanja"
                  >
                    Expand All
                  </button>
                  <button
                    type="button"
                    onClick={handleCollapseAllManual}
                    className="px-2 py-1 rounded text-[11px] font-bold bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-xs hover:bg-slate-100 cursor-pointer"
                    title="Tutup drill-down"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Tabel Kertas Kerja Manual s.d. Detail Belanja */}
              <div className="border border-black overflow-x-auto rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#1e588a] text-white font-bold text-center border-b border-black">
                      <th className="py-2.5 px-3 border-r border-blue-400/40 w-32">KODE</th>
                      <th className="py-2.5 px-3 border-r border-blue-400/40 text-left min-w-[320px]">
                        OUTPUT / SUBOUTPUT / KOMPONEN / SUBKOMPONEN/ DETAIL BELANJA
                      </th>
                      <th className="py-2.5 px-3 border-r border-blue-400/40 w-36 text-right">JUMLAH SEMULA (Rp)</th>
                      <th className="py-2.5 px-3 border-r border-blue-400/40 w-36 text-right">JUMLAH MENJADI (Rp)</th>
                      <th className="py-2.5 px-3 border-r border-blue-400/40 text-left min-w-[300px]">
                        KETERANGAN (Wajib Diisi)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-sans">
                    {visibleManualRows.map((row) => {
                      const hasChildren = !!manualTreeResult.hasChildrenMap[row.id];
                      const isExpanded = expandedManualNodes[row.id] !== false;
                      const isChanged = row.jumlahMenjadi !== row.jumlahSemula;
                      const isDetail = row.type === "detail";
                      const isHeader = row.type === "header1" || row.type === "header2";
                      const isAkun = row.type === "akun";

                      const rank = HIERARCHY_RANK[row.type] ?? 0;
                      const paddingLeftPx = rank * 12;

                      return (
                        <tr
                          key={row.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                            isChanged ? "bg-blue-50/50 dark:bg-blue-950/30" : ""
                          }`}
                        >
                          <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-mono text-center font-bold align-top">
                            {row.kode || "-"}
                          </td>
                          <td className="p-2 border-r border-slate-200 dark:border-slate-700 align-top">
                            <div style={{ paddingLeft: `${paddingLeftPx}px` }} className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                {hasChildren ? (
                                  <button
                                    type="button"
                                    onClick={() => toggleManualExpand(row.id)}
                                    className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer transition-colors shrink-0"
                                    title={isExpanded ? "Ciutkan level ini" : "Buka drill-down"}
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
                                <span
                                  onClick={() => hasChildren && toggleManualExpand(row.id)}
                                  className={`${hasChildren ? "cursor-pointer hover:underline " : ""}${isDetail ? "text-slate-700 dark:text-slate-300 font-normal" : isHeader ? "font-semibold italic text-slate-800 dark:text-slate-200" : isAkun ? "font-bold text-blue-700 dark:text-blue-400" : "font-bold text-slate-900 dark:text-slate-100"}`}
                                >
                                  {row.uraian}
                                </span>
                              </div>
                              <span className="block text-[10px] text-slate-400 font-mono">
                                Unit: {row.unitKerja} • Level: {row.type.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right font-mono text-slate-500 align-top">
                            {row.jumlahSemula.toLocaleString("id-ID")}
                          </td>
                          <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right align-top">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatNumberWithDots(row.jumlahMenjadi)}
                              placeholder="0"
                              onChange={(e) => handleManualJumlahChange(row.id, parseNumberFromDots(e.target.value))}
                              className="w-full px-2 py-1 text-right font-mono font-bold text-blue-700 dark:text-blue-400 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 shadow-inner"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-200 dark:border-slate-700 align-top">
                            <input
                              type="text"
                              value={row.keterangan}
                              placeholder="Masukkan justifikasi penyesuaian pagu..."
                              onChange={(e) => handleManualKeteranganChange(row.id, e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleSaveManualPagu}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>OK - Simpan &amp; Terapkan Penyesuaian Manual</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CARD DOKUMEN REALISASI ANGGARAN (BINCANG / Super Admin) ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
              <FileUp className="w-5 h-5 text-emerald-600" />
              <span>Dokumen Realisasi Anggaran (Sumber Kolom Realisasi Kertas Kerja RAB)</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Role <strong>BINCANG</strong> dan <strong>Super Admin</strong> dapat mengunggah laporan realisasi belanja atau menyinkronkan data dari SAKTI.
            </p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 w-fit">
            Kewenangan BINCANG &amp; Super Admin
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-slate-800 dark:text-slate-200">
              Dokumen Realisasi Aktif: {localStorage.getItem("rab_realisasi_filename") || "Data_Realisasi_SAKTI_Series_2025.xlsx (Default SAKTI)"}
            </div>
            <div className="text-[11px] text-slate-500">
              Diperbarui: <span className="font-mono">{localStorage.getItem("rab_realisasi_date") || new Date().toLocaleDateString("id-ID")}</span>
            </div>
          </div>

          <Link
            to="/rab/isian"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:opacity-90 shadow-xs"
          >
            <span>Buka Kertas Kerja Isian RAB</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
