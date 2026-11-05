import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Save,
  CheckCircle2,
  Building2,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Printer,
  Search,
  Maximize2,
  Minimize2,
  ListFilter,
  XCircle,
  Edit3,
  Copy,
  RefreshCw,
  ChevronDown,
  Check,
  Lock,
  UploadCloud,
  ArrowRight,
  ChevronUp,
  Calculator,
  ClipboardPaste,
  Eye,
  SlidersHorizontal,
  X,
  CheckSquare,
  ClipboardList,
  FileUp,
  HelpCircle,
  PenTool,
  AlertTriangle,
  Download,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plane,
  Car,
  MapPin,
  Globe,
  Users,
} from "lucide-react";
import unitKerjaData from "../../data/unitKerjaData.json";
import templateRabGajiKantor from "../../data/templateRabGajiKantor.json";
import { baganAkunStandar } from "../../data/baganAkunStandar";
import informasiKinerjaData from "../../data/informasiKinerjaData.json";
import sbkData from "../../data/sbkData.json";
import rekapSasaranRenjaAllData from "../../data/rekapSasaranRenjaAllData.json";
import lokasiData from "../../data/lokasiData.json";
import lokasiFullData from "../../data/lokasiFullData.json";
import {
  getTarifPerjadinBiasa,
  cleanProvName,
  cleanKotaName,
  formatDisplayProv,
  formatDisplayKota,
  cleanHeaderUraian,
  getDaftarDestinasiLN,
  getTarifPerjadinLN,
  getTarifKonsinyeringDalamKota,
  getTarifKonsinyeringLuarKota,
  KURS_USD_ASUMSI_MAKRO,
} from "../../data/perjadinSbmHelper";
import {
  getIdentitasKinerjaByUnitKerja,
  getAvailableRoForUnit,
  getUnitKerjaByNamaOrSingkatan,
} from "../kak/kakKinerjaHelper";
import { UserRole } from "./PilihHistoriRabPage";

// Mode penginputan RAB
export type InputModeRab = "manual" | "panduan" | "unggah";

// Tipe baris hierarki tabel SAKTI / PATIH
export type WorksheetRowType =
  | "program"
  | "kegiatan"
  | "kro"
  | "ro"
  | "komponen"
  | "subkomponen" // Header 1 / Sub Komponen
  | "subkomponen_sub" // Sub Komponen Level 2 (misal: > Singapore, > Taiwan)
  | "header1"     // Header 1 Perjalanan Dinas / Pengelompokan 1
  | "header2"     // Header 2 Perjalanan Dinas / Pengelompokan 2
  | "akun"        // Header 2 / Akun Belanja
  | "detail";     // Detail Item

export interface WorksheetRow {
  id: string;
  type: WorksheetRowType;
  headerLevel?: number;
  kode: string;
  uraian: string;
  subUraian?: string;
  badge?: string;
  vol?: number | string;
  sat?: string;
  harga?: number;
  jumlah: number;
  tStar?: string; // *T
  sd?: string;    // SD (e.g. A00)
  cO?: boolean;   // O : Operator
  cS?: boolean;   // S : Satker, approve Eselon II
  cU?: boolean;   // U : Unit, approve Eselon I
  cK?: boolean;   // K : Kementerian, approve BINCANG
  cD?: boolean;   // D : DJA, approve Kementerian Keuangan
  c0?: boolean;   // alias fallback
  // Rincian Perhitungan Komponen I, II, III (masing-masing ada Nilai dan Satuan)
  k1Nilai?: number | string;
  k1Sat?: string;
  k2Nilai?: number | string;
  k2Sat?: string;
  k3Nilai?: number | string;
  k3Sat?: string;
  parentAkunKode?: string;
  parentSubkompKode?: string;
  // Metadata Komponen
  jenisBiaya?: string;
  sifatBiaya?: string;
  // Metadata SBK
  isSbk?: boolean;
  sbkKelompok?: "SBKU" | "SBKK" | string;
  sbkKode?: string;
  sbkUraian?: string;
  sbkBesaran?: number;
  sbkSatuan?: string;
  maxAnggaranRo?: number;
}

// Helper untuk mendeteksi apakah RO termasuk Layanan Perkantoran Operasional (3377.EBA.994 atau 3375.EBA.994)
function isOperasionalRo(roKodeOrUraian?: string): boolean {
  if (!roKodeOrUraian) return false;
  const s = String(roKodeOrUraian).toUpperCase().replace(/\s+/g, "");
  return s.includes("3377.EBA.994") || s.includes("3375.EBA.994");
}

// Tipe Baris Kertas Kerja Panduan Belanja Bahan (11 Kolom)
export interface GuidedBelanjaBahanRow {
  id: string;
  itemKey: string;
  uraian: string;        // Kolom 1 (A)
  v1: number;            // Kolom 2 (B)
  s1: string;            // Kolom 3 (C)
  v2: number;            // Kolom 4 (D)
  s2: string;            // Kolom 5 (E)
  v3: number;            // Kolom 6 (F)
  s3: string;            // Kolom 7 (G)
  totalVol: number;      // Kolom 8 (H = B * D * F)
  satTotal: string;      // Kolom 9 (I)
  harga: number;         // Kolom 10 (J)
  totalBiaya: number;    // Kolom 11 (K = ROUNDDOWN(H * J, -3))
  isLainnya?: boolean;
  selected?: boolean;    // Checklist baris untuk diganti / diedit
}

// Checklist Item Belanja Bahan Sesuai Panduan 2
export const BELANJA_BAHAN_CHECKLIST_ITEMS = [
  "Konsumsi",
  "Konsumsi Rapat - makan",
  "Konsumsi Rapat - kudapan",
  "Seminar Kit",
  "Souvenir",
  "Diklat Kit - Internal",
  "Diklat Kit - Eksternal",
  "Pencetakan",
  "Lainnya",
];

// Tarif SBM Belanja Bahan berdasarkan Lokasi KRO (Panduan 2)
export const TARIF_BELANJA_BAHAN_01_51_55: Record<string, number> = {
  "Konsumsi": 81000,
  "Konsumsi Rapat - makan": 57000,
  "Konsumsi Rapat - kudapan": 24000,
  "Seminar Kit": 50000,
  "Souvenir": 150000,
  "Diklat Kit - Internal": 100000,
  "Diklat Kit - Eksternal": 200000,
  "Pencetakan": 1000,
};

export const TARIF_BELANJA_BAHAN_02_58: Record<string, number> = {
  "Konsumsi": 76000,
  "Konsumsi Rapat - makan": 54000,
  "Konsumsi Rapat - kudapan": 22000,
  "Seminar Kit": 50000,
  "Souvenir": 150000,
  "Diklat Kit - Internal": 100000,
  "Diklat Kit - Eksternal": 200000,
  "Pencetakan": 1000,
};

// 7 Kategori Belanja Panduan 2
export type JenisBelanjaPanduan =
  | "001" // Komponen 001 Gaji dan Tunjangan (Hanya BINCANG & PATIH)
  | "002" // Komponen 002 Operasional Kantor (Hanya BIRU & PATIH)
  | "bahan" // Pengadaan Belanja Bahan
  | "jasa" // Pengadaan Jasa (Konsultan, profesi, lainnya)
  | "spd_dn" // Perjalanan Dinas Dalam Negeri
  | "spd_ln" // Perjalanan Dinas Luar Negeri
  | "konsinyering"; // Penyelenggaraan Konsinyering

// Tarif SBM Honorarium Jasa Profesi (Panduan 2)
export const TARIF_JASA_PROFESI_NARASUMBER: Record<string, number> = {
  "Honorarium Narasumber - Menteri/Pejabat Setingkat Menteri/Pejabat Negara Lainnya/Wakil Menteri/yang disetarakan": 1700000,
  "Honorarium Narasumber - Pejabat Eselon I/yang disetarakan": 1400000,
  "Honorarium Narasumber - Pejabat Eselon II/yang disetarakan": 1000000,
  "Honorarium Narasumber - Pejabat Eselon III ke bawah/yang disetarakan": 900000,
};

export const TARIF_JASA_PROFESI_PANITIA: Record<string, number> = {
  "Honorarium Moderator": 700000,
  "Honorarium Pembawa Acara": 400000,
  "Honorarium Panitia - Penanggung Jawab": 450000,
  "Honorarium Panitia - Ketua/Wakil ketua": 400000,
  "Honorarium Panitia - Sekretaris": 300000,
  "Honorarium Panitia - Anggota": 300000,
};

// Helper parsing angka standar Indonesia (pemisah ribuan '.' dan desimal ',')
export function parseIndoNumber(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const s = String(val).trim();
  if (!s) return 0;
  const clean = s.replace(/\./g, "").replace(/,/g, ".");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

// Helper format angka standar Indonesia (pemisah ribuan '.' dan desimal ',')
export function formatIndoNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === "") return "0";
  const num = typeof val === "number" ? val : parseIndoNumber(val);
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}


// Helper hierarki level kalkulasi bertingkat sesuai struktur SAKTI / PATIH
const HIERARCHY_LEVEL_ORDER = [
  "program",
  "kegiatan",
  "kro",
  "ro",
  "komponen",
  "subkomponen",
  "akun",
  "header1",
  "header2",
  "subkomponen_sub",
  "detail"
];


// Helper ekstraksi Program, Kegiatan, KRO, RO, Komponen dari informasiKinerjaData
function parseInformasiKinerjaRow(ikRow: any) {
  if (!ikRow) {
    return {
      prog1: "078",
      prog2: "01",
      prog3: "BE",
      progUraian: "Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
      aktivitasKode: "3379",
      aktivitasUraian: "Pengelolaan Bidang Hukum dan Regulasi PPATK",
      kroKode: "AAH",
      kroNama: "Peraturan lainnya",
      roKode: "001",
      roNama: "Penyusunan Regulasi PPATK",
      kompKode: "052",
      kompNama: "Penyusunan Dokumen Legislasi",
      fullKroKode: "3379.AAH",
      fullRoKode: "BE.3379.AAH.001",
    };
  }

  const progMatch = (ikRow.program || "").match(/^(\d{3})[\.\s](\d{2})[\.\s]([A-Z0-9]+)\s*(.*)$/);
  const prog1 = progMatch ? progMatch[1] : "078";
  const prog2 = progMatch ? progMatch[2] : "01";
  const prog3 = progMatch ? progMatch[3] : "BE";
  const progUraian = progMatch ? progMatch[4].trim() : (ikRow.program || "");

  const kegMatch = (ikRow.kegiatan || "").match(/^(\d{4})\s*(.*)$/);
  const aktivitasKode = kegMatch ? kegMatch[1] : "3379";
  const aktivitasUraian = kegMatch ? kegMatch[2].trim() : (ikRow.kegiatan || "");

  const kroMatch = (ikRow.kro || "").match(/^(\d{4})[\.\s]([A-Z0-9]{3})\s*(.*)$/);
  const kroKode = kroMatch ? kroMatch[2] : "AAH";
  const kroNama = kroMatch ? kroMatch[3].trim() : (ikRow.kro || "");
  const fullKroKode = `${aktivitasKode}.${kroKode}`;

  const roMatch = (ikRow.ro || "").match(/^(\d{4})[\.\s]([A-Z0-9]{3})[\.\s]([A-Z0-9]{3})\s*(.*)$/);
  const roKode = roMatch ? roMatch[3] : "001";
  const roNama = roMatch ? roMatch[4].trim() : (ikRow.ro || "");
  const fullRoKode = `${prog3}.${aktivitasKode}.${kroKode}.${roKode}`;

  const kompMatch = (ikRow.komponen || "").match(/^(\d{4})[\.\s]([A-Z0-9]{3})[\.\s]([A-Z0-9]{3})[\.\s]([A-Z0-9]{3})\s*(.*)$/) ||
                    (ikRow.komponen || "").match(/^([A-Z0-9]{3})\s*(.*)$/);
  const kompKode = kompMatch ? (kompMatch.length > 2 && kompMatch[4] ? kompMatch[4] : kompMatch[1]) : "051";
  const kompNama = kompMatch ? (kompMatch.length > 2 && kompMatch[5] ? kompMatch[5].trim() : kompMatch[2].trim()) : (ikRow.komponen || "");

  return {
    prog1, prog2, prog3, progUraian,
    aktivitasKode, aktivitasUraian,
    kroKode, kroNama, fullKroKode,
    roKode, roNama, fullRoKode,
    kompKode, kompNama,
  };
}

function getRowHierarchyLevel(row: WorksheetRow): number {
  if (row.type === "header1") return 7;
  if (row.type === "header2") return 8;
  if (row.type === "subkomponen_sub") {
    if (row.headerLevel === 1) return 7;
    if (row.headerLevel === 2) return 8;
    return 7;
  }
  const idx = HIERARCHY_LEVEL_ORDER.indexOf(row.type);
  return idx >= 0 ? idx : 99;
}

export function calculateHierarchyAmounts(rows: WorksheetRow[]): WorksheetRow[] {
  const stack: Array<{ level: number; index: number }> = [];
  const childrenMap = new Map<number, number[]>();

  rows.forEach((row, idx) => {
    const lvl = getRowHierarchyLevel(row);
    while (stack.length > 0 && stack[stack.length - 1].level >= lvl) {
      stack.pop();
    }
    if (stack.length > 0) {
      const parentIdx = stack[stack.length - 1].index;
      if (!childrenMap.has(parentIdx)) {
        childrenMap.set(parentIdx, []);
      }
      childrenMap.get(parentIdx)!.push(idx);
    }
    stack.push({ level: lvl, index: idx });
  });

  const computedAmounts = new Array<number>(rows.length).fill(0);

  function getSum(idx: number): number {
    const row = rows[idx];
    if (row.type === "detail") {
      // Pastikan baris detail belanja menerapkan formula ROUNDDOWN ke ribuan (-3)
      const rawJumlah = Number(row.jumlah) || 0;
      computedAmounts[idx] = Math.floor(rawJumlah / 1000) * 1000;
      return computedAmounts[idx];
    }
    const children = childrenMap.get(idx) || [];
    if (children.length === 0) {
      const rawJumlah = Number(row.jumlah) || 0;
      computedAmounts[idx] = Math.floor(rawJumlah / 1000) * 1000;
      return computedAmounts[idx];
    }
    let total = 0;
    for (const childIdx of children) {
      total += getSum(childIdx);
    }
    // Hasil penjumlahan bertingkat juga dipastikan bulat ke ribuan
    const roundedTotal = Math.floor(total / 1000) * 1000;
    computedAmounts[idx] = roundedTotal;
    return roundedTotal;
  }

  const allChildren = new Set<number>();
  for (const list of childrenMap.values()) {
    list.forEach((c) => allChildren.add(c));
  }

  for (let i = 0; i < rows.length; i++) {
    if (!allChildren.has(i)) {
      getSum(i);
    }
  }

  return rows.map((r, i) => ({
    ...r,
    jumlah: computedAmounts[i]
  }));
}

function formatRupiah(num: number): string {
  // Formula ROUNDDOWN ke ribuan: tidak boleh ada angka ratusan di kolom JUMLAH
  const roundedDown = Math.floor((Number(num) || 0) / 1000) * 1000;
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(roundedDown);
}

// Helper untuk menemukan parent RO dari suatu baris (index) dalam tabel hierarki
function findParentRoForRow(rows: WorksheetRow[], targetIdx: number): WorksheetRow | null {
  if (targetIdx < 0 || targetIdx >= rows.length) return null;
  const targetRow = rows[targetIdx];
  if (targetRow.type === "ro") return targetRow;

  const targetLvl = getRowHierarchyLevel(targetRow);
  const roLvl = HIERARCHY_LEVEL_ORDER.indexOf("ro");

  // Jika baris berada di atas level RO (program, kegiatan, kro), tidak ada parent RO
  if (targetLvl <= roLvl) return null;

  for (let i = targetIdx - 1; i >= 0; i--) {
    const cur = rows[i];
    if (cur.type === "ro") {
      return cur;
    }
    const curLvl = getRowHierarchyLevel(cur);
    if (curLvl < roLvl) {
      // Melewati batas KRO ke atas tanpa menemukan RO
      break;
    }
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════════
// HIERARKI POHON, VALIDASI DUPLIKASI & SORTING ASCENDING WORKSHEET
// ══════════════════════════════════════════════════════════════════════
export interface WorksheetTreeNode {
  row: WorksheetRow;
  children: WorksheetTreeNode[];
}

export function buildWorksheetTree(rows: WorksheetRow[]): WorksheetTreeNode[] {
  const rootNodes: WorksheetTreeNode[] = [];
  const stack: { level: number; node: WorksheetTreeNode }[] = [];

  for (const row of rows) {
    const level = getRowHierarchyLevel(row);
    const node: WorksheetTreeNode = { row: { ...row }, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      rootNodes.push(node);
    } else {
      stack[stack.length - 1].node.children.push(node);
    }

    stack.push({ level, node });
  }

  return rootNodes;
}

export interface DuplicateValidationResult {
  isValid: boolean;
  errors: string[];
  duplicateRowIds: string[];
}

// Validasi Duplikasi: Memeriksa apakah terdapat KRO, RO, Komponen, Sub Komponen, Akun, Header 1, atau Header 2 yang double
export function validateWorksheetDuplicates(rows: WorksheetRow[]): DuplicateValidationResult {
  const errors: string[] = [];
  const duplicateRowIds: string[] = [];
  const tree = buildWorksheetTree(rows);

  function checkNode(node: WorksheetTreeNode) {
    const byType = new Map<string, WorksheetTreeNode[]>();
    for (const child of node.children) {
      const t = child.row.type;
      if (!byType.has(t)) byType.set(t, []);
      byType.get(t)!.push(child);
    }

    // A. KRO ganda di bawah Kegiatan
    const kroChildren = byType.get("kro") || [];
    const kroCodeCounts = new Map<string, WorksheetTreeNode[]>();
    for (const c of kroChildren) {
      const code = (c.row.kode || "").trim();
      if (!kroCodeCounts.has(code)) kroCodeCounts.set(code, []);
      kroCodeCounts.get(code)!.push(c);
    }
    for (const [code, items] of kroCodeCounts.entries()) {
      if (items.length > 1) {
        errors.push(`Kegiatan ${node.row.kode || ""} ${node.row.uraian} terdapat ${items.length} KRO dengan kode ${code}`);
        items.forEach((it) => duplicateRowIds.push(it.row.id));
      }
    }

    // B. RO ganda di bawah KRO
    const roChildren = byType.get("ro") || [];
    const roCodeCounts = new Map<string, WorksheetTreeNode[]>();
    for (const c of roChildren) {
      const code = (c.row.kode || "").trim();
      if (!roCodeCounts.has(code)) roCodeCounts.set(code, []);
      roCodeCounts.get(code)!.push(c);
    }
    for (const [code, items] of roCodeCounts.entries()) {
      if (items.length > 1) {
        errors.push(`KRO ${node.row.kode || ""} ${node.row.uraian} terdapat ${items.length} RO dengan kode ${code}`);
        items.forEach((it) => duplicateRowIds.push(it.row.id));
      }
    }

    // C. Komponen ganda di bawah RO
    const kompChildren = byType.get("komponen") || [];
    const kompCodeCounts = new Map<string, WorksheetTreeNode[]>();
    for (const c of kompChildren) {
      const code = (c.row.kode || "").trim();
      if (!kompCodeCounts.has(code)) kompCodeCounts.set(code, []);
      kompCodeCounts.get(code)!.push(c);
    }
    for (const [code, items] of kompCodeCounts.entries()) {
      if (items.length > 1) {
        errors.push(`RO ${node.row.kode || ""} ${node.row.uraian} terdapat ${items.length} Komponen dengan kode ${code}`);
        items.forEach((it) => duplicateRowIds.push(it.row.id));
      }
    }

    // D. Sub Komponen ganda di bawah Komponen
    const subkompChildren = byType.get("subkomponen") || [];
    const subkompCodeCounts = new Map<string, WorksheetTreeNode[]>();
    for (const c of subkompChildren) {
      const code = (c.row.kode || c.row.uraian || "").trim();
      if (!subkompCodeCounts.has(code)) subkompCodeCounts.set(code, []);
      subkompCodeCounts.get(code)!.push(c);
    }
    for (const [code, items] of subkompCodeCounts.entries()) {
      if (items.length > 1) {
        errors.push(`Komponen ${node.row.kode || ""} ${node.row.uraian} terdapat ${items.length} Sub Komponen ${code}`);
        items.forEach((it) => duplicateRowIds.push(it.row.id));
      }
    }

    // E. Akun ganda di bawah Sub Komponen atau langsung di bawah Komponen
    const akunChildren = byType.get("akun") || [];
    const akunCodeCounts = new Map<string, WorksheetTreeNode[]>();
    for (const c of akunChildren) {
      const code = (c.row.kode || "").trim();
      if (!akunCodeCounts.has(code)) akunCodeCounts.set(code, []);
      akunCodeCounts.get(code)!.push(c);
    }
    for (const [code, items] of akunCodeCounts.entries()) {
      if (items.length > 1) {
        const parentDesc = `${node.row.type === "subkomponen" ? "Sub Komponen" : "Komponen"} ${node.row.kode || ""} ${node.row.uraian}`;
        errors.push(`${parentDesc} terdapat ${items.length} akun ${code}`);
        items.forEach((it) => duplicateRowIds.push(it.row.id));
      }
    }

    // Khusus level Komponen: cek juga seluruh Akun di dalam Komponen (termasuk yang berada di dalam subkomponen-subkomponen di bawahnya)
    if (node.row.type === "komponen") {
      const allAkunsInKomp: WorksheetTreeNode[] = [];
      function collectAkuns(n: WorksheetTreeNode) {
        if (n.row.type === "akun") {
          allAkunsInKomp.push(n);
        }
        for (const child of n.children) {
          collectAkuns(child);
        }
      }
      for (const child of node.children) {
        collectAkuns(child);
      }
      const allAkunCounts = new Map<string, WorksheetTreeNode[]>();
      for (const a of allAkunsInKomp) {
        const code = (a.row.kode || "").trim();
        if (!allAkunCounts.has(code)) allAkunCounts.set(code, []);
        allAkunCounts.get(code)!.push(a);
      }
      for (const [code, items] of allAkunCounts.entries()) {
        if (items.length > 1) {
          const err = `Komponen ${node.row.kode || ""} ${node.row.uraian} terdapat ${items.length} akun ${code}`;
          if (!errors.includes(err)) {
            errors.push(err);
          }
          items.forEach((it) => duplicateRowIds.push(it.row.id));
        }
      }
    }

    // F. Header 1 ganda di bawah Akun
    const h1Children = byType.get("header1") || [];
    const h1Counts = new Map<string, WorksheetTreeNode[]>();
    for (const c of h1Children) {
      const name = cleanHeaderUraian(c.row.uraian);
      if (!h1Counts.has(name)) h1Counts.set(name, []);
      h1Counts.get(name)!.push(c);
    }
    for (const [name, items] of h1Counts.entries()) {
      if (items.length > 1) {
        errors.push(`Akun ${node.row.kode || ""} ${node.row.uraian} terdapat ${items.length} Header 1 '${name}' yang duplikat.`);
        items.forEach((it) => duplicateRowIds.push(it.row.id));
      }
    }

    // G. Header 2 ganda di bawah Header 1
    const h2Children = byType.get("header2") || [];
    const h2Counts = new Map<string, WorksheetTreeNode[]>();
    for (const c of h2Children) {
      const name = cleanHeaderUraian(c.row.uraian);
      if (!h2Counts.has(name)) h2Counts.set(name, []);
      h2Counts.get(name)!.push(c);
    }
    for (const [name, items] of h2Counts.entries()) {
      if (items.length > 1) {
        errors.push(`Header 1 '${node.row.uraian}' terdapat ${items.length} Header 2 '${name}' yang duplikat.`);
        items.forEach((it) => duplicateRowIds.push(it.row.id));
      }
    }

    // Periksa anak secara rekursif
    for (const child of node.children) {
      checkNode(child);
    }
  }

  for (const root of tree) {
    checkNode(root);
  }

  return {
    isValid: errors.length === 0,
    errors,
    duplicateRowIds: Array.from(new Set(duplicateRowIds)),
  };
}

// Mengurutkan pohon hierarki secara ascending dan melakukan penomoran ulang Header 1 & 2
export function sortAndRenumberWorksheet(rows: WorksheetRow[]): WorksheetRow[] {
  const tree = buildWorksheetTree(rows);

  // 1. Urutkan seluruh tingkatan anak secara rekursif
  function sortNode(node: WorksheetTreeNode) {
    node.children.sort((a, b) => {
      const lvlA = getRowHierarchyLevel(a.row);
      const lvlB = getRowHierarchyLevel(b.row);
      if (lvlA !== lvlB) return lvlA - lvlB;

      const type = a.row.type;
      if (type === "kro" || type === "ro" || type === "komponen" || type === "subkomponen" || type === "akun") {
        const kA = (a.row.kode || "").trim();
        const kB = (b.row.kode || "").trim();
        if (kA && kB && kA !== kB) {
          return kA.localeCompare(kB, undefined, { numeric: true, sensitivity: "base" });
        }
        return (a.row.uraian || "").localeCompare(b.row.uraian || "", undefined, { numeric: true, sensitivity: "base" });
      }

      if (type === "header1") {
        const uA = cleanHeaderUraian(a.row.uraian);
        const uB = cleanHeaderUraian(b.row.uraian);
        return uA.localeCompare(uB, undefined, { numeric: true, sensitivity: "base" });
      }

      if (type === "header2") {
        const uA = cleanHeaderUraian(a.row.uraian);
        const uB = cleanHeaderUraian(b.row.uraian);
        return uA.localeCompare(uB, undefined, { numeric: true, sensitivity: "base" });
      }

      return 0;
    });

    for (const child of node.children) {
      sortNode(child);
    }
  }

  for (const root of tree) {
    sortNode(root);
  }

  // 2. Renumber Header 1, Header 2, dan detail baris di bawah Akun
  function renumberAkunSubtree(akunNode: WorksheetTreeNode) {
    let h1Index = 0;
    for (const child of akunNode.children) {
      if (child.row.type === "header1") {
        h1Index++;
        const cleanH1 = cleanHeaderUraian(child.row.uraian);
        child.row.uraian = `${h1Index}. ${cleanH1}`;

        let h2Index = 0;
        for (const subChild of child.children) {
          if (subChild.row.type === "header2") {
            const letter = String.fromCharCode(97 + h2Index); // 'a', 'b', 'c'...
            h2Index++;
            const cleanH2 = cleanHeaderUraian(subChild.row.uraian);
            subChild.row.uraian = `${h1Index}${letter}. ${cleanH2}`;

            // Renumber detail di bawah Header 2 agar nomor prefiks sinkron dengan h1Index
            for (const detailChild of subChild.children) {
              if (detailChild.row.type === "detail") {
                detailChild.row.uraian = detailChild.row.uraian.replace(
                  /^(\d+)([a-z]\.\s*)/i,
                  `${h1Index}$2`
                );
              }
            }
          }
        }
      }
    }
  }

  function walkTreeForRenumber(node: WorksheetTreeNode) {
    if (node.row.type === "akun") {
      renumberAkunSubtree(node);
    }
    for (const child of node.children) {
      walkTreeForRenumber(child);
    }
  }

  for (const root of tree) {
    walkTreeForRenumber(root);
  }

  // 3. Flatten pohon kembali menjadi flat array WorksheetRow
  const result: WorksheetRow[] = [];
  function flatten(node: WorksheetTreeNode) {
    result.push(node.row);
    for (const child of node.children) {
      flatten(child);
    }
  }

  for (const root of tree) {
    flatten(root);
  }

  return result;
}

// Error Boundary untuk mencegah blank screen jika terjadi runtime error tak terduga pada salah satu komponen
class RabErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("RabErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Terjadi Kendala Tampilan
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Sistem mendeteksi kesalahan rendering pada komponen ini:{" "}
              <span className="font-mono text-rose-600">{this.state.error?.message || "Kesalahan tak dikenal"}</span>
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Muat Ulang Halaman
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function IsianRabPageContent() {
  // Pengaturan role aktif
  const [currentUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("renja_e2_user_role");
      if (saved && ["Operator", "Approver", "BINCANG", "Super Admin"].includes(saved)) {
        return saved as UserRole;
      }
    } catch (e) {}
    return "Operator";
  });

  const isPrivileged = currentUserRole === "BINCANG" || currentUserRole === "Super Admin";

  // Data histori aktif yang terbaca dari KAK atau RAB
  const [activeHistori] = useState<{
    kdsatker: string;
    kode_sts_history: string;
    status_histori: string;
    label: string;
    is_angka_dasar?: boolean;
  }>(() => {
    try {
      const rabSaved = localStorage.getItem("rab_active_histori");
      if (rabSaved) return JSON.parse(rabSaved);
      const kakSaved = localStorage.getItem("kak_active_histori");
      if (kakSaved) {
        const p = JSON.parse(kakSaved);
        return {
          kdsatker: p.kdsatker,
          kode_sts_history: p.kode_sts_history,
          status_histori: p.status_histori,
          label: p.label || `${p.status_histori} - ${p.kode_sts_history}`,
        };
      }
    } catch (e) {}
    return {
      kdsatker: "Biro Hukum dan Kerja Sama",
      kode_sts_history: "B00",
      status_histori: "DIPA Awal",
      label: "DIPA Awal - B00",
    };
  });

  const activeUnit = activeHistori.kdsatker || "Biro Hukum dan Kerja Sama";
  const ukSingkatan = getUnitKerjaByNamaOrSingkatan(activeUnit).singkatan;

  // Sinkronisasi data Informasi Kinerja untuk Unit Kerja aktif
  const filteredInformasiKinerja = useMemo(() => {
    const list = informasiKinerjaData.filter((r) => r.unitKerja === ukSingkatan);
    if (list.length > 0) return list;
    return informasiKinerjaData.slice(0, 10);
  }, [ukSingkatan]);

  // Identitas Kinerja KAK (Collapsible Accordion)
  const [showIdentitasKak, setShowIdentitasKak] = useState(false);
  const identitasKinerja = useMemo(() => {
    return getIdentitasKinerjaByUnitKerja(activeUnit, 0);
  }, [activeUnit]);

  // State tampilan fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);

  // State Tayangkan: "semua" (Semua baris s.d. Detail Belanja) atau "komponen" (Tampilan awal s.d. Komponen sesuai gambar 1)
  const [viewScope, setViewScope] = useState<"semua" | "komponen">("komponen");
  const [showTayangkanMenu, setShowTayangkanMenu] = useState(false);
  const tayangkanMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tayangkanMenuRef.current && !tayangkanMenuRef.current.contains(e.target as Node)) {
        setShowTayangkanMenu(false);
      }
    }
    if (showTayangkanMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTayangkanMenu]);

  // State baris yang sedang dipilih
  const [selectedRowId, setSelectedRowId] = useState<string>("row-komp");

  // State Clipboard untuk Copy & Paste baris (Mendukung satu baris maupun seluruh subtree anak)
  const [copiedRows, setCopiedRows] = useState<WorksheetRow[]>([]);

  // State Modal Calculator (Sesuai Gambar Aplikasi Kalkulator Basic)
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcInput, setCalcInput] = useState("");
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [calcResult, setCalcResult] = useState<string | null>(null);

  function handleCalcInput(val: string) {
    setCalcHistory((prev) => [...prev, calcInput]);
    setCalcInput((prev) => prev + val);
  }

  function handleCalcBackspace() {
    setCalcHistory((prev) => [...prev, calcInput]);
    setCalcInput((prev) => prev.slice(0, -1));
  }

  function handleCalcUndo() {
    if (calcHistory.length > 0) {
      const prev = calcHistory[calcHistory.length - 1];
      setCalcHistory((h) => h.slice(0, -1));
      setCalcInput(prev);
    }
  }

  function handleCalcClear() {
    setCalcHistory((prev) => [...prev, calcInput]);
    setCalcInput("");
    setCalcResult(null);
  }

  function handleCalcEqual() {
    try {
      if (!calcInput.trim()) return;
      // Normalisasi karakter perhitungan
      const normalized = calcInput
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, `${Math.PI}`)
        .replace(/mod/g, "%")
        .replace(/,/g, ".")
        .replace(/%/g, "/100");

      const sanitized = normalized.replace(/[^0-9+\-*/().%]/g, "");
      // eslint-disable-next-line no-eval
      const res = Function(`'use strict'; return (${sanitized})`)();
      setCalcHistory((prev) => [...prev, calcInput]);
      setCalcInput(String(res));
      setCalcResult(String(res));
    } catch (e) {
      setCalcResult("Error");
    }
  }

  function handleCalcSqrt() {
    try {
      const val = Number(calcInput.replace(/,/g, "."));
      if (!isNaN(val)) {
        const res = Math.sqrt(val);
        setCalcHistory((prev) => [...prev, calcInput]);
        setCalcInput(String(res));
      }
    } catch (e) {}
  }

  function handleCalcSquare() {
    try {
      const val = Number(calcInput.replace(/,/g, "."));
      if (!isNaN(val)) {
        const res = val * val;
        setCalcHistory((prev) => [...prev, calcInput]);
        setCalcInput(String(res));
      }
    } catch (e) {}
  }


  // State Modal Rekam & Alur Form (Awal klik submenu Isian RAB langsung tampilkan modal KRO)
  const [modalMode, setModalMode] = useState<
    | "kro"
    | "konfirmasi_kro"
    | "ro"
    | "komponen"
    | "subkomponen"
    | "akun"
    | "header1"
    | "header2"
    | "detail"
    | "edit"
    | "pilih_metode"
    | "panduan_jenis_belanja"
    | "panduan_jasa"
    | "panduan_wizard"
    | "panduan_belanja_bahan"
    | "panduan_perjadin_dn"
    | "panduan_perjadin_ln"
    | "panduan_konsinyering"
    | "upload_excel"
    | null
  >("kro");

  // State Sub Komponen Target untuk input lanjutan setelah rekam Sub Komponen
  const [targetSubkompRowId, setTargetSubkompRowId] = useState<string | null>(null);

  // State Pilihan Multi-select 7 Jenis Belanja (Panduan 2)
  const [selectedJenisBelanjaList, setSelectedJenisBelanjaList] = useState<JenisBelanjaPanduan[]>([]);

  // State Form Pengadaan Jasa (Konsultan, Profesi, Lainnya)
  const [jasaSubPilihan, setJasaSubPilihan] = useState<"konsultan" | "profesi" | "lainnya">("konsultan");
  const [jasaKonsultanBiaya, setJasaKonsultanBiaya] = useState<number>(50000000);
  
  // Jasa Profesi
  const [jasaProfesiKategori, setJasaProfesiKategori] = useState<"narasumber" | "kepanitiaan">("narasumber");
  const [jasaProfesiItem, setJasaProfesiItem] = useState<string>("Honorarium Narasumber - Pejabat Eselon I/yang disetarakan");
  const [jasaProfesiJumlahOrg, setJasaProfesiJumlahOrg] = useState<number>(2);
  const [jasaProfesiJumlahKeg, setJasaProfesiJumlahKeg] = useState<number>(1);
  const [jasaProfesiTarif, setJasaProfesiTarif] = useState<number>(1400000);

  // Jasa Lainnya
  const [jasaLainnyaUraian, setJasaLainnyaUraian] = useState<string>("Jasa Penyelenggaraan Acara");
  const [jasaLainnyaVol1, setJasaLainnyaVol1] = useState<number>(1);
  const [jasaLainnyaVol2, setJasaLainnyaVol2] = useState<number>(1);
  const [jasaLainnyaHarga, setJasaLainnyaHarga] = useState<number>(15000000);

  // State Panduan Perjalanan Dinas Domestik (Panduan 3)
  const [perjadinJenisPilihan, setPerjadinJenisPilihan] = useState<Array<"lokal" | "biasa">>(["lokal"]);
  
  // Perjadin Transport Lokal (524113)
  const [perjadinLokalOrg, setPerjadinLokalOrg] = useState<number>(2);
  const [perjadinLokalKeg, setPerjadinLokalKeg] = useState<number>(1);

  // Perjadin Biasa (524111)
  const [jumlahLokasiBaruInput, setJumlahLokasiBaruInput] = useState<number>(1);
  const [perjadinBiasaLokasiList, setPerjadinBiasaLokasiList] = useState<Array<{
    id: string;
    provinsi: string; // Header 1 (misal: "06 ACEH")
    kabKota: string;  // Header 2 (misal: "06 51 KOTA BANDA ACEH")
    // Input isian user untuk item 1a s.d 1k
    tiket1aOrg: number; tiket1aKeg: number;
    tiket1bOrg: number; tiket1bKeg: number;
    taksi1cOrg: number; taksi1cKali: number; taksi1cKeg: number;
    taksi1dOrg: number; taksi1dKali: number; taksi1dKeg: number;
    inap1eOrg: number; inap1eHari: number; inap1eKeg: number;
    inap1fOrg: number; inap1fHari: number; inap1fKeg: number;
    inap1gOrg: number; inap1gHari: number; inap1gKeg: number;
    inap1hOrg: number; inap1hHari: number; inap1hKeg: number;
    uang1iOrg: number; uang1iHari: number; uang1iKeg: number;
    rep1jOrg: number; rep1jHari: number; rep1jKeg: number;
    rep1kOrg: number; rep1kHari: number; rep1kKeg: number;
  }>>([
    {
      id: "lok-1",
      provinsi: "06 ACEH",
      kabKota: "06 51 KOTA BANDA ACEH",
      tiket1aOrg: 1, tiket1aKeg: 1,
      tiket1bOrg: 2, tiket1bKeg: 1,
      taksi1cOrg: 3, taksi1cKali: 2, taksi1cKeg: 1,
      taksi1dOrg: 3, taksi1dKali: 2, taksi1dKeg: 1,
      inap1eOrg: 1, inap1eHari: 3, inap1eKeg: 1,
      inap1fOrg: 0, inap1fHari: 3, inap1fKeg: 1,
      inap1gOrg: 2, inap1gHari: 3, inap1gKeg: 1,
      inap1hOrg: 0, inap1hHari: 3, inap1hKeg: 1,
      uang1iOrg: 3, uang1iHari: 4, uang1iKeg: 1,
      rep1jOrg: 1, rep1jHari: 4, rep1jKeg: 1,
      rep1kOrg: 0, rep1kHari: 4, rep1kKeg: 1,
    }
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // STATE PANDUAN PERJALANAN DINAS LUAR NEGERI (AKUN 524211)
  // ─────────────────────────────────────────────────────────────────────────
  const [perjadinLNJumlahNegara, setPerjadinLNJumlahNegara] = useState<number>(1);
  const [perjadinLNJudulKegiatan, setPerjadinLNJudulKegiatan] = useState<string>("Sidang / Pertemuan Tingkat Internasional");
  const [perjadinLNDestinasiList, setPerjadinLNDestinasiList] = useState<Array<{
    id: string;
    judulKegiatan: string; // Nama Kegiatan (Header 1) untuk destinasi ini
    destinasiKey: string; // Misal: "JAKARTA - AMERIKA UTARA - Chicago"
    benua: string;        // "AMERIKA UTARA"
    negara: string;       // "Amerika Serikat"
    kota: string;         // "Chicago"
    labelHeader2: string; // "AMERIKA UTARA-Amerika Serikat - Chicago"
    // Rincian Input 1a s.d 1m
    tiket1aOrg: number; tiket1aKeg: number;
    tiket1bOrg: number; tiket1bKeg: number;
    tiket1cOrg: number; tiket1cKeg: number;
    tiket1dOrg: number; tiket1dKeg: number;
    taksi1eOrg: number; taksi1eKali: number; taksi1eKeg: number;
    uang1fOrg: number; uang1fHari: number; uang1fKeg: number;
    uang1gOrg: number; uang1gHari: number; uang1gKeg: number;
    uang1hOrg: number; uang1hHari: number; uang1hKeg: number;
    uang1iOrg: number; uang1iHari: number; uang1iKeg: number;
    perj1jOrg: number; perj1jHari: number; perj1jKeg: number;
    perj1kOrg: number; perj1kHari: number; perj1kKeg: number;
    perj1lOrg: number; perj1lHari: number; perj1lKeg: number;
    perj1mOrg: number; perj1mHari: number; perj1mKeg: number;
  }>>([
    {
      id: "ln-1",
      judulKegiatan: "Sidang / Pertemuan Tingkat Internasional",
      destinasiKey: "JAKARTA - AMERIKA UTARA - Chicago",
      benua: "AMERIKA UTARA",
      negara: "Amerika Serikat",
      kota: "Chicago",
      labelHeader2: "AMERIKA UTARA-Amerika Serikat - Chicago",
      tiket1aOrg: 1, tiket1aKeg: 1,
      tiket1bOrg: 1, tiket1bKeg: 1,
      tiket1cOrg: 1, tiket1cKeg: 1,
      tiket1dOrg: 0, tiket1dKeg: 1,
      taksi1eOrg: 3, taksi1eKali: 2, taksi1eKeg: 1,
      uang1fOrg: 1, uang1fHari: 5, uang1fKeg: 1,
      uang1gOrg: 1, uang1gHari: 5, uang1gKeg: 1,
      uang1hOrg: 1, uang1hHari: 5, uang1hKeg: 1,
      uang1iOrg: 0, uang1iHari: 5, uang1iKeg: 1,
      perj1jOrg: 1, perj1jHari: 2, perj1jKeg: 1,
      perj1kOrg: 1, perj1kHari: 2, perj1kKeg: 1,
      perj1lOrg: 1, perj1lHari: 2, perj1lKeg: 1,
      perj1mOrg: 0, perj1mHari: 2, perj1mKeg: 1,
    }
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // STATE PANDUAN PENYELENGGARAAN KONSINYERING (AKUN 524114 & 524119)
  // ─────────────────────────────────────────────────────────────────────────
  const [konsinyeringJenisPilihan, setKonsinyeringJenisPilihan] = useState<Array<"dalam_kota" | "luar_kota">>(["dalam_kota"]);
  const [konsinyeringNamaKegiatan, setKonsinyeringNamaKegiatan] = useState<string>("Konsinyering Penyusunan Rencana Kerja dan Anggaran");

  // Konsinyering Dalam Kota (524114)
  const [konsinyeringDKJumlahKeg, setKonsinyeringDKJumlahKeg] = useState<number>(1);
  const [konsinyeringDKKegiatanList, setKonsinyeringDKKegiatanList] = useState<Array<{
    id: string;
    namaKegiatan: string;
    trans1aOrg: number; trans1aKeg: number;
    fb1bOrg: number; fb1bHari: number; fb1bKeg: number;
    fb1cOrg: number; fb1cHari: number; fb1cKeg: number;
    fb1dOrg: number; fb1dHari: number; fb1dKeg: number;
    fd1eOrg: number; fd1eKeg: number;
    fd1fOrg: number; fd1fKeg: number;
    fd1gOrg: number; fd1gKeg: number;
    uh1hOrg: number; uh1hHari: number; uh1hKeg: number;
  }>>([
    {
      id: "kdk-1",
      namaKegiatan: "Konsinyering Penyusunan Rencana Kerja dan Anggaran",
      trans1aOrg: 20, trans1aKeg: 1,
      fb1bOrg: 1, fb1bHari: 2, fb1bKeg: 1,
      fb1cOrg: 3, fb1cHari: 2, fb1cKeg: 1,
      fb1dOrg: 16, fb1dHari: 2, fb1dKeg: 1,
      fd1eOrg: 0, fd1eKeg: 1,
      fd1fOrg: 0, fd1fKeg: 1,
      fd1gOrg: 0, fd1gKeg: 1,
      uh1hOrg: 20, uh1hHari: 2, uh1hKeg: 1,
    }
  ]);

  // Konsinyering Luar Kota (524119)
  const [konsinyeringLKProvinsiList, setKonsinyeringLKProvinsiList] = useState<Array<{
    id: string;
    namaKegiatan: string; // Nama Kegiatan (Header 1) untuk lokasi ini
    provinsi: string; // Misal: "06 ACEH"
    tiket1aOrg: number; tiket1aKeg: number;
    tiket1bOrg: number; tiket1bKeg: number;
    taksi1cOrg: number; taksi1cKali: number; taksi1cKeg: number;
    taksi1dOrg: number; taksi1dKali: number; taksi1dKeg: number;
    inap1eOrg: number; inap1eHari: number; inap1eKeg: number;
    inap1fOrg: number; inap1fHari: number; inap1fKeg: number;
    inap1gOrg: number; inap1gHari: number; inap1gKeg: number;
    inap1hOrg: number; inap1hHari: number; inap1hKeg: number;
    fb1iOrg: number; fb1iHari: number; fb1iKeg: number;
    fb1jOrg: number; fb1jHari: number; fb1jKeg: number;
    fb1kOrg: number; fb1kHari: number; fb1kKeg: number;
    fd1lOrg: number; fd1lKeg: number;
    fd1mOrg: number; fd1mKeg: number;
    fd1nOrg: number; fd1nKeg: number;
    uhfb1oOrg: number; uhfb1oHari: number; uhfb1oKeg: number;
    uh1pOrg: number; uh1pHari: number; uh1pKeg: number;
  }>>([
    {
      id: "klk-1",
      namaKegiatan: "Konsinyering Penyusunan Rencana Kerja dan Anggaran",
      provinsi: "06 ACEH",
      tiket1aOrg: 1, tiket1aKeg: 1,
      tiket1bOrg: 5, tiket1bKeg: 1,
      taksi1cOrg: 6, taksi1cKali: 2, taksi1cKeg: 1,
      taksi1dOrg: 6, taksi1dKali: 2, taksi1dKeg: 1,
      inap1eOrg: 1, inap1eHari: 3, inap1eKeg: 1,
      inap1fOrg: 1, inap1fHari: 3, inap1fKeg: 1,
      inap1gOrg: 4, inap1gHari: 3, inap1gKeg: 1,
      inap1hOrg: 0, inap1hHari: 3, inap1hKeg: 1,
      fb1iOrg: 1, fb1iHari: 3, fb1iKeg: 1,
      fb1jOrg: 1, fb1jHari: 3, fb1jKeg: 1,
      fb1kOrg: 4, fb1kHari: 3, fb1kKeg: 1,
      fd1lOrg: 0, fd1lKeg: 1,
      fd1mOrg: 0, fd1mKeg: 1,
      fd1nOrg: 0, fd1nKeg: 1,
      uhfb1oOrg: 6, uhfb1oHari: 3, uhfb1oKeg: 1,
      uh1pOrg: 6, uh1pHari: 3, uh1pKeg: 1,
    }
  ]);

  // State Panduan Belanja Bahan (Akun 521211)
  const [guidedBelanjaStep, setGuidedBelanjaStep] = useState<"checklist" | "kertas_kerja">("checklist");
  const [selectedBelanjaItems, setSelectedBelanjaItems] = useState<string[]>([]);
  const [guidedBelanjaRows, setGuidedBelanjaRows] = useState<GuidedBelanjaBahanRow[]>([]);
  const [selectedCellRange, setSelectedCellRange] = useState<{ startCol: number; endCol: number; rowIdx: number } | null>(null);
  const [lastSelectedRowIdx, setLastSelectedRowIdx] = useState<number | null>(null);
  const [pasteExcelModalOpen, setPasteExcelModalOpen] = useState(false);
  const [pasteExcelInputText, setPasteExcelInputText] = useState("");
  const [rowCountInput, setRowCountInput] = useState<number>(5);
  const [pasteTargetOption, setPasteTargetOption] = useState<"selected" | "all" | "append">("selected");
  const [activeCellRef, setActiveCellRef] = useState<{
    cellName: string;
    colKey: string;
    rowIdx: number;
    val: string;
    formula?: string;
  }>({
    cellName: "A1",
    colKey: "uraian",
    rowIdx: 0,
    val: "",
    formula: "",
  });

  // State Wizard Panduan Input
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardKategoriAkun, setWizardKategoriAkun] = useState<string>("521"); // Belanja Barang Operasional
  const [wizardAkun, setWizardAkun] = useState<string>("521211");
  const [wizardAkunUraian, setWizardAkunUraian] = useState<string>("Belanja Bahan");
  const [wizardItemUraian, setWizardItemUraian] = useState<string>("");
  const [wizardVol1, setWizardVol1] = useState<number>(1);
  const [wizardSat1, setWizardSat1] = useState<string>("ORG");
  const [wizardVol2, setWizardVol2] = useState<number>(1);
  const [wizardSat2, setWizardSat2] = useState<string>("KEG");
  const [wizardHargaSatuan, setWizardHargaSatuan] = useState<number>(50000);

  // State Upload File Excel
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<any[]>([]);
  const [isProcessingUpload, setIsProcessingUpload] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ══════════════════════════════════════════════════════════════════════
  // HELPER MULTI-STEP WIZARD PANDUAN JENIS BELANJA
  // ══════════════════════════════════════════════════════════════════════
  const GUIDED_STEP_ORDER: { key: JenisBelanjaPanduan; mode: ModalMode; label: string }[] = [
    { key: "jasa", mode: "panduan_jasa", label: "Pengadaan Jasa" },
    { key: "bahan", mode: "panduan_belanja_bahan", label: "Belanja Bahan" },
    { key: "spd_dn", mode: "panduan_perjadin_dn", label: "Perjalanan Dinas Dalam Negeri" },
    { key: "spd_ln", mode: "panduan_perjadin_ln", label: "Perjalanan Dinas Luar Negeri" },
    { key: "konsinyering", mode: "panduan_konsinyering", label: "Penyelenggaraan Konsinyering" },
  ];

  function getActiveGuidedSteps(): { key: JenisBelanjaPanduan; mode: ModalMode; label: string }[] {
    return GUIDED_STEP_ORDER.filter((s) => selectedJenisBelanjaList.includes(s.key));
  }

  function getNextGuidedStep(currentMode: ModalMode): { key: JenisBelanjaPanduan; mode: ModalMode; label: string } | null {
    const active = getActiveGuidedSteps();
    const currIdx = active.findIndex((s) => s.mode === currentMode);
    if (currIdx >= 0 && currIdx < active.length - 1) {
      return active[currIdx + 1];
    }
    return null;
  }

  function getPrevGuidedStep(currentMode: ModalMode): { key: JenisBelanjaPanduan; mode: ModalMode; label: string } | null {
    const active = getActiveGuidedSteps();
    const currIdx = active.findIndex((s) => s.mode === currentMode);
    if (currIdx > 0) {
      return active[currIdx - 1];
    }
    return null;
  }

  function handleTransitionToGuidedStep(targetMode: ModalMode) {
    if (targetMode === "panduan_belanja_bahan") {
      setGuidedBelanjaStep("checklist");
      setSelectedBelanjaItems([]);
    }
    setModalMode(targetMode);
  }

  // State ID baris yang sedang diedit melalui dialog box modal
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Opsi IB (Inisiatif Baru) lengkap 11 opsi resmi:
  // 00 : Baseline
  // 11 : Program Baru - Penambahan Anggaran
  // 12 : Program Baru - Perubahan Kebijakan
  // 21 : Kegiatan Baru - Penambahan Anggaran
  // 22 : Kegiatan Baru - Perubahan Kebijakan
  // 31 : Outcome Baru - Penambahan Anggaran
  // 32 : Outcome Baru - Perubahan Kebijakan
  // 41 : Output Baru - Penambahan Anggaran
  // 42 : Output Baru - Perubahan Kebijakan
  // 51 : Penambahan Target - Penambahan Anggaran
  // 52 : Penambahan Target - Perubahan Kebijakan
  const IB_OPTIONS = [
    { kode: "00", uraian: "Baseline" },
    { kode: "11", uraian: "Program Baru - Penambahan Anggaran" },
    { kode: "12", uraian: "Program Baru - Perubahan Kebijakan" },
    { kode: "21", uraian: "Kegiatan Baru - Penambahan Anggaran" },
    { kode: "22", uraian: "Kegiatan Baru - Perubahan Kebijakan" },
    { kode: "31", uraian: "Outcome Baru - Penambahan Anggaran" },
    { kode: "32", uraian: "Outcome Baru - Perubahan Kebijakan" },
    { kode: "41", uraian: "Output Baru - Penambahan Anggaran" },
    { kode: "42", uraian: "Output Baru - Perubahan Kebijakan" },
    { kode: "51", uraian: "Penambahan Target - Penambahan Anggaran" },
    { kode: "52", uraian: "Penambahan Target - Perubahan Kebijakan" },
  ];

  // Form Rekam Program, Aktivitas, KRO (Persis Gambar Form)
  const [formKroDialog, setFormKroDialog] = useState(() => {
    const p = parseInformasiKinerjaRow(filteredInformasiKinerja[0]);
    return {
      prog1: p.prog1,
      prog2: p.prog2,
      prog3: p.prog3,
      progUraian: p.progUraian,
      aktivitasKode: p.aktivitasKode,
      aktivitasUraian: p.aktivitasUraian,
      fungsiText: "01 PELAYANAN UMUM",
      subFungsiText: "01.01 Lembaga Eksekutif dan Legislatif, Keuangan dan Urusan Fiskal",
      kroKode: p.kroKode,
      kroNama: p.kroNama,
      kodeIB: "00",
      kodeIBUraian: "Baseline",
      lokasi1: "01",
      lokasi2: "51",
      lokasiNama: "KOTA JAKARTA PUSAT",
      kewenanganKode: "KP",
      kewenanganNama: "Kantor Pusat",
      volume: 19,
      hitungOtomatis: false,
    };
  });

  const [showKroPickerModal, setShowKroPickerModal] = useState(false);
  const [showIbPickerModal, setShowIbPickerModal] = useState(false);
  const [showLokasiPickerModal, setShowLokasiPickerModal] = useState(false);
  const [lokasiSearchQuery, setLokasiSearchQuery] = useState("");
  const [showKewenanganPickerModal, setShowKewenanganPickerModal] = useState(false);

  // Form Isian KRO selection
  const [selectedKroOption, setSelectedKroOption] = useState<string>(() => {
    const p = parseInformasiKinerjaRow(filteredInformasiKinerja[0]);
    return p.fullKroKode;
  });

  // State Sub-Pencarian Form Pop-up (Search Picker seperti gambar)
  const [showRoPicker, setShowRoPicker] = useState(false);
  const [roSearchQuery, setRoSearchQuery] = useState("");
  const [selectedRoPicker, setSelectedRoPicker] = useState<any>(null);

  const [showSbkPicker, setShowSbkPicker] = useState(false);
  const [sbkSearchQuery, setSbkSearchQuery] = useState("");
  const [selectedSbkPicker, setSelectedSbkPicker] = useState<any>(null);
  const [sbkPage, setSbkPage] = useState(1);
  const [sbkPageSize, setSbkPageSize] = useState(10);

  const [showKomponenPicker, setShowKomponenPicker] = useState(false);
  const [komponenSearchQuery, setKomponenSearchQuery] = useState("");
  const [selectedKomponenPicker, setSelectedKomponenPicker] = useState<any>(null);

  // Form Pendetailan Lokus / Rekam RO (Persis Gambar 5)
  const [formRo, setFormRo] = useState(() => {
    const p = parseInformasiKinerjaRow(filteredInformasiKinerja[0]);
    return {
      kroKode: p.fullKroKode,
      kroNama: p.kroNama,
      roKode: p.roKode,
      roNama: p.roNama,
      volume: 19,
      uic: "",
      isSbk: false,
      sbkKelompok: "",
      sbkKode: "",
      sbkUraian: "",
      sbkBesaran: 0,
      sbkSatuan: "",
    };
  });

  // Form Rekam Komponen (Persis Gambar 3)
  const [formKomponen, setFormKomponen] = useState(() => {
    const p = parseInformasiKinerjaRow(filteredInformasiKinerja[0]);
    const isOp = isOperasionalRo(p.fullRoKode || p.roKode);
    return {
      kode: p.kompKode,
      uraian: p.kompNama,
      jenisBiaya: isOp ? "OPERASIONAL" : "NON OPERASIONAL",
      sifatBiaya: "UTAMA",
    };
  });

  // Form Rekam Sub Komponen
  const [subkompType, setSubkompType] = useState<"tanpa" | "dengan">("dengan");
  const [formSubkomponen, setFormSubkomponen] = useState({
    kode: "A",
    uraian: "Penyusunan dan Implementasi Regulasi Kerja Sama",
  });

  // Form Rekam Akun (Dari Bagan Akun Standar - BAS)
  const [formAkun, setFormAkun] = useState({
    kodeAkun: "521211",
    uraianAkun: "Belanja Bahan",
    sd: "A00",
    subUraian: "(KPPN.175-Jakarta VI)",
  });
  const [akunSearchQuery, setAkunSearchQuery] = useState("");

  // Form Rekam Header 1 & Header 2
  const [formHeader1, setFormHeader1] = useState({
    nomenklatur: "Singapore (FICG Meeting)",
  });

  const [formHeader2, setFormHeader2] = useState({
    nomenklatur: "Pemenuhan permintaan Narasumber dari Negara Lain/Organisasi",
  });

  // Form Rekam Detail
  const [formDetail, setFormDetail] = useState({
    uraian: "Konsumsi Rapat Pembahasan Teknis",
    akunTarget: "521211",
    k1Nilai: 18,
    k1Sat: "ORG",
    k2Nilai: 45,
    k2Sat: "KEG",
    k3Nilai: "",
    k3Sat: "",
    satuanBiaya: 79559,
    satuanAkhir: "OK",
  });

  // Alert Notifikasi
  
  // Sinkronisasi otomatis form isian KRO, RO, Komponen saat Unit Kerja berganti
  useEffect(() => {
    const p = parseInformasiKinerjaRow(filteredInformasiKinerja[0]);
    setFormKroDialog((prev) => ({
      ...prev,
      prog1: p.prog1,
      prog2: p.prog2,
      prog3: p.prog3,
      progUraian: p.progUraian,
      aktivitasKode: p.aktivitasKode,
      aktivitasUraian: p.aktivitasUraian,
      kroKode: p.kroKode,
      kroNama: p.kroNama,
    }));
    setSelectedKroOption(p.fullKroKode);
    setFormRo({
      kroKode: p.fullKroKode,
      kroNama: p.kroNama,
      roKode: p.roKode,
      roNama: p.roNama,
      volume: 19,
      uic: "",
      isSbk: false,
      sbkKelompok: "",
      sbkKode: "",
      sbkUraian: "",
      sbkBesaran: 0,
      sbkSatuan: "",
    });
    const isOp = isOperasionalRo(p.fullRoKode || p.roKode);
    setFormKomponen({
      kode: p.kompKode,
      uraian: p.kompNama,
      jenisBiaya: isOp ? "OPERASIONAL" : "NON OPERASIONAL",
      sifatBiaya: "UTAMA",
    });
  }, [filteredInformasiKinerja]);

  const [actionAlert, setActionAlert] = useState<string | null>(null);
  const [duplicateErrors, setDuplicateErrors] = useState<string[]>([]);
  const [duplicateRowIds, setDuplicateRowIds] = useState<string[]>([]);

  function triggerAlert(msg: string) {
    setActionAlert(msg);
    setTimeout(() => setActionAlert(null), 3500);
  }

  // Generate Inisialisasi Data Worksheet Sesuai Informasi Kinerja Unit Kerja
  const initialWorksheet = useMemo<WorksheetRow[]>(() => {
    const ikRow = filteredInformasiKinerja[0] || {
      program: "078 01 BE Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
      kegiatan: "3379 Pengelolaan Bidang Hukum dan Regulasi PPATK",
      kro: "3379 AAH Peraturan lainnya",
      ro: "3379 AAH 001 Penyusunan Regulasi PPATK",
      komponen: "052 Penyusunan Dokumen Legislasi",
    };

    const parsed = parseInformasiKinerjaRow(ikRow);
    const progKode = `${parsed.prog1}.${parsed.prog2}.${parsed.prog3}`;
    const progNama = parsed.progUraian;
    const kegKode = parsed.aktivitasKode;
    const kegNama = parsed.aktivitasUraian;
    const kroKode = parsed.fullKroKode;
    const kroNama = parsed.kroNama;
    const roKode = parsed.fullRoKode;
    const roNama = parsed.roNama;
    const kompKode = parsed.kompKode;
    const kompNama = parsed.kompNama;

    const rawRows: WorksheetRow[] = [
      {
        id: "row-prog",
        type: "program",
        kode: progKode,
        uraian: progNama,
        jumlah: 743651000,
        c0: false,
        cS: false,
        cU: false,
        cD: false,
      },
      {
        id: "row-keg",
        type: "kegiatan",
        kode: kegKode,
        uraian: kegNama,
        jumlah: 743651000,
        c0: false,
        cS: false,
        cU: false,
        cD: false,
      },
      {
        id: "row-kro",
        type: "kro",
        kode: kroKode,
        uraian: kroNama,
        subUraian: "(Lokasi :01.51-KOTA JAKARTA PUSAT) (KDIB=00 Base Line)",
        vol: 19,
        sat: "peraturan, Rancanga...",
        jumlah: 743651000,
        c0: false,
        cS: false,
        cU: false,
        cD: false,
      },
      {
        id: "row-ro",
        type: "ro",
        kode: roKode,
        uraian: roNama,
        badge: "[Kerangka Regulasi 7%]",
        subUraian: "Jumlah Komponen Utama [100.00%]",
        vol: 19,
        sat: "peraturan",
        jumlah: 743651000,
        c0: false,
        cS: false,
        cU: false,
        cD: false,
      },
      // Komponen Utama 052
      {
        id: "row-komp",
        type: "komponen",
        kode: kompKode,
        uraian: kompNama,
        vol: 0,
        jumlah: 578910000,
        c0: false,
        cS: false,
        cU: false,
        cD: false,
      },
      // Komponen Pendukung 054 (Persis di gambar 1)
      {
        id: "row-komp-054",
        type: "komponen",
        kode: "054",
        uraian: "Pengelolaan JDIH",
        vol: 0,
        jumlah: 164741000,
        c0: false,
        cS: false,
        cU: false,
        cD: false,
      },
      // SUBKOMPONEN A (Kerjasama Internasional / Penyusunan Regulasi)
      {
        id: "row-subkomp-A",
        type: "subkomponen",
        kode: "A",
        uraian: "Penyusunan dan Implementasi Regulasi Kerja Sama",
        jumlah: 181573000,
        c0: false,
        cS: false,
        cU: false,
        cD: false,
      },
      // AKUN 1: 521211 (Belanja Bahan)
      {
        id: "row-akun-521211",
        type: "akun",
        kode: "521211",
        uraian: "Belanja Bahan",
        subUraian: "(KPPN.175-Jakarta VI)",
        jumlah: 64709000,
        sd: "A00",
        c0: false,
        cS: false,
        cU: false,
        cD: false,
      },
      // DETAIL 1.1: Konsumsi Rapat (18 ORG x 45 KEG = 810 OK @ 79.559)
      {
        id: "row-det-1",
        type: "detail",
        kode: "",
        uraian: "- Konsumsi Rapat",
        k1Nilai: 18,
        k1Sat: "ORG",
        k2Nilai: 45,
        k2Sat: "KEG",
        vol: 810,
        sat: "OK",
        harga: 79559,
        jumlah: 64443000,
        parentAkunKode: "521211",
        c0: false,
        cS: true,
        cU: true,
        cD: true,
      },
      // DETAIL 1.2: Souvenir Kunjungan Tamu Internasional (1 ORG x 1 KEG = 1 OK @ 266.000)
      {
        id: "row-det-2",
        type: "detail",
        kode: "",
        uraian: "- Souvenir Kunjungan Tamu Internasional",
        k1Nilai: 1,
        k1Sat: "ORG",
        k2Nilai: 1,
        k2Sat: "KEG",
        vol: 1,
        sat: "OK",
        harga: 266000,
        jumlah: 266000,
        parentAkunKode: "521211",
        c0: false,
        cS: true,
        cU: true,
        cD: true,
      },
      // AKUN 2: 521219 (Belanja Barang Non Operasional Lainnya)
      {
        id: "row-akun-521219",
        type: "akun",
        kode: "521219",
        uraian: "Belanja Barang Non Operasional Lainnya",
        subUraian: "(KPPN.175-Jakarta VI)",
        jumlah: 4491000,
        sd: "A00",
        c0: false,
        cS: false,
        cU: false,
        cD: false,
      },
      // DETAIL 2.1: Jamuan Tamu Internasional (20 ORG x 1 KEG = 20 OK @ 224.550)
      {
        id: "row-det-3",
        type: "detail",
        kode: "",
        uraian: "- Jamuan Tamu Internasional",
        k1Nilai: 20,
        k1Sat: "ORG",
        k2Nilai: 1,
        k2Sat: "KEG",
        vol: 20,
        sat: "OK",
        harga: 224550,
        jumlah: 4491000,
        parentAkunKode: "521219",
        c0: false,
        cS: true,
        cU: true,
        cD: true,
      },
      // AKUN 3: 522151 (Belanja Jasa Profesi)
      {
        id: "row-akun-522151",
        type: "akun",
        kode: "522151",
        uraian: "Belanja Jasa Profesi",
        subUraian: "(KPPN.175-Jakarta VI)",
        jumlah: 3800000,
        sd: "A00",
        c0: false,
        cS: false,
        cU: false,
        cD: false,
      },
      // DETAIL 3.1: Honorarium Narasumber Eselon III (2 ORG x 1 KEG x 3 JM = 6 OK @ 633.333)
      {
        id: "row-det-4",
        type: "detail",
        kode: "",
        uraian: "- Honorarium Narasumber Eselon III",
        k1Nilai: 2,
        k1Sat: "ORG",
        k2Nilai: 1,
        k2Sat: "KEG",
        k3Nilai: 3,
        k3Sat: "JM",
        vol: 6,
        sat: "OK",
        harga: 633333,
        jumlah: 3800000,
        parentAkunKode: "522151",
        c0: false,
        cS: true,
        cU: true,
        cD: true,
      },
      // AKUN 4: 524113 (Belanja Perjalanan Dinas Dalam Kota)
      {
        id: "row-akun-524113",
        type: "akun",
        kode: "524113",
        uraian: "Belanja Perjalanan Dinas Dalam Kota",
        subUraian: "(KPPN.175-Jakarta VI)",
        jumlah: 14620000,
        sd: "A00",
        c0: false,
        cS: false,
        cU: false,
        cD: false,
      },
      // DETAIL 4.1: Transport Lokal (3 ORG x 29 KEG = 87 OK @ 168.046)
      {
        id: "row-det-5",
        type: "detail",
        kode: "",
        uraian: "- Transport Lokal",
        k1Nilai: 3,
        k1Sat: "ORG",
        k2Nilai: 29,
        k2Sat: "KEG",
        vol: 87,
        sat: "OK",
        harga: 168046,
        jumlah: 14620000,
        parentAkunKode: "524113",
        c0: false,
        cS: true,
        cU: true,
        cD: true,
      },
      // AKUN 5: 524219 (Belanja Perjalanan Dinas Lainnya - Luar Negeri)
      {
        id: "row-akun-524219",
        type: "akun",
        kode: "524219",
        uraian: "Belanja Perjalanan Dinas Lainnya - Luar Negeri",
        subUraian: "(KPPN.175-Jakarta VI)",
        jumlah: 63787000,
        sd: "A00",
        c0: false,
        cS: false,
        cU: false,
        cD: false,
      },
      // SUB-LEVEL: > Singapore (FICG Meeting)
      {
        id: "row-sub-sg",
        type: "subkomponen_sub",
        kode: "",
        uraian: "> Singapore (FICG Meeting)",
        jumlah: 5483000,
        parentAkunKode: "524219",
      },
      // DETAIL 5.1: Uang Harian Gol C - Singapore (1 ORG x 1 KEG x 3 HR = 3 OH @ 1.827.667)
      {
        id: "row-det-6",
        type: "detail",
        kode: "",
        uraian: "- Uang Harian Gol C - Singapore",
        k1Nilai: 1,
        k1Sat: "ORG",
        k2Nilai: 1,
        k2Sat: "KEG",
        k3Nilai: 3,
        k3Sat: "HR",
        vol: 3,
        sat: "OH",
        harga: 1827667,
        jumlah: 5483000,
        parentAkunKode: "524219",
        c0: false,
        cS: true,
        cU: true,
        cD: true,
      },
      // SUB-LEVEL: > Pemenuhan permintaan Narasumber dari Negara Lain/Organisasi
      {
        id: "row-sub-ns",
        type: "subkomponen_sub",
        kode: "",
        uraian: "> Pemenuhan permintaan Narasumber dari Negara Lain/Organisasi",
        jumlah: 50899000,
        parentAkunKode: "524219",
      },
      {
        id: "row-det-7",
        type: "detail",
        kode: "",
        uraian: "- Uang Harian Gol B - Singapura",
        k1Nilai: 2,
        k1Sat: "ORG",
        k2Nilai: 2,
        k2Sat: "KEG",
        k3Nilai: 2,
        k3Sat: "HR",
        vol: 8,
        sat: "OH",
        harga: 3202375,
        jumlah: 25619000,
        parentAkunKode: "524219",
        c0: false,
        cS: true,
        cU: true,
        cD: true,
      },
      {
        id: "row-det-8",
        type: "detail",
        kode: "",
        uraian: "- Uang Harian Gol C - Singapura",
        k1Nilai: 3,
        k1Sat: "ORG",
        k2Nilai: 2,
        k2Sat: "KEG",
        k3Nilai: 2,
        k3Sat: "HR",
        vol: 12,
        sat: "OH",
        harga: 2066583,
        jumlah: 24799000,
        parentAkunKode: "524219",
        c0: false,
        cS: true,
        cU: true,
        cD: true,
      },
      {
        id: "row-det-9",
        type: "detail",
        kode: "",
        uraian: "- Uang Harian Perjalanan Gol C - Singapura",
        k1Nilai: 3,
        k1Sat: "ORG",
        k2Nilai: 2,
        k2Sat: "KEG",
        k3Nilai: 1,
        k3Sat: "HR",
        vol: 6,
        sat: "OH",
        harga: 80167,
        jumlah: 481000,
        parentAkunKode: "524219",
        c0: false,
        cS: true,
        cU: true,
        cD: true,
      },
      // SUB-LEVEL: > Taiwan
      {
        id: "row-sub-tw",
        type: "subkomponen_sub",
        kode: "",
        uraian: "> Taiwan",
        jumlah: 2411000,
        parentAkunKode: "524219",
      },
      {
        id: "row-det-10",
        type: "detail",
        kode: "",
        uraian: "- Uang Harian Gol C - Taiwan",
        k1Nilai: 1,
        k1Sat: "ORG",
        k2Nilai: 1,
        k2Sat: "KEG",
        k3Nilai: 4,
        k3Sat: "HR",
        vol: 4,
        sat: "OH",
        harga: 602750,
        jumlah: 2411000,
        parentAkunKode: "524219",
        c0: false,
        cS: true,
        cU: true,
        cD: true,
      },
    ];
    return calculateHierarchyAmounts(rawRows);
  }, [filteredInformasiKinerja]);

  const [worksheetRows, setWorksheetRows] = useState<WorksheetRow[]>(() => {
    try {
      const saved = localStorage.getItem(`rab_worksheet_${ukSingkatan}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialWorksheet;
  });

  const selectedRow = useMemo(
    () => worksheetRows.find((r) => r.id === selectedRowId),
    [worksheetRows, selectedRowId]
  );

  // Sinkronisasi bila unit kerja berganti
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`rab_worksheet_${ukSingkatan}`);
      if (saved) {
        setWorksheetRows(JSON.parse(saved));
        return;
      }
    } catch (e) {}
    setWorksheetRows(initialWorksheet);
  }, [ukSingkatan, initialWorksheet]);

  // Simpan otomatis ke localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`rab_worksheet_${ukSingkatan}`, JSON.stringify(worksheetRows));
    } catch (e) {}
  }, [worksheetRows, ukSingkatan]);

  // Hitung Total Pagu Dinamis
  const totalPaguDetail = useMemo(() => {
    return worksheetRows
      .filter((r) => r.type === "detail")
      .reduce((sum, r) => sum + (Number(r.jumlah) || 0), 0);
  }, [worksheetRows]);

  // Pagu Agregat Level Tertinggi Kertas Kerja (Jika terdapat 2 Program, menjumlahkan keduanya)
  const totalPaguAgregat = useMemo(() => {
    const programRows = worksheetRows.filter((r) => r.type === "program");
    if (programRows.length > 0) {
      return programRows.reduce((sum, r) => sum + (Number(r.jumlah) || 0), 0);
    }
    const kegiatanRows = worksheetRows.filter((r) => r.type === "kegiatan");
    if (kegiatanRows.length > 0) {
      return kegiatanRows.reduce((sum, r) => sum + (Number(r.jumlah) || 0), 0);
    }
    const kroRows = worksheetRows.filter((r) => r.type === "kro");
    if (kroRows.length > 0) {
      return kroRows.reduce((sum, r) => sum + (Number(r.jumlah) || 0), 0);
    }
    return totalPaguDetail;
  }, [worksheetRows, totalPaguDetail]);

  const displayPagu = formatRupiah(totalPaguAgregat);

  // Akumulasi Akun 3 Digit di Kertas Kerja (Berdasarkan baris akun dan tabel bagan_akun_standar)
  const akumulasiAkun3Digit = useMemo(() => {
    const akunNama3DigitMap = new Map<string, string>();
    baganAkunStandar.forEach((item) => {
      if (item.kodeAkun3Digit && item.namaAkun3Digit && !akunNama3DigitMap.has(item.kodeAkun3Digit)) {
        akunNama3DigitMap.set(item.kodeAkun3Digit, item.namaAkun3Digit);
      }
    });

    const sumMap = new Map<string, number>();
    worksheetRows.forEach((row) => {
      if (row.type === "akun") {
        const cleanKode = (row.kode || "").replace(/\D/g, "");
        const kode3 = cleanKode.length >= 3 ? cleanKode.substring(0, 3) : cleanKode;
        if (kode3) {
          sumMap.set(kode3, (sumMap.get(kode3) || 0) + (Number(row.jumlah) || 0));
        }
      }
    });

    const result: Array<{ kode3: string; nama3: string; total: number }> = [];
    sumMap.forEach((total, kode3) => {
      const nama3 = akunNama3DigitMap.get(kode3) || `AKUN ${kode3}`;
      result.push({ kode3, nama3, total });
    });

    return result.sort((a, b) => a.kode3.localeCompare(b.kode3));
  }, [worksheetRows]);

  // Filter baris berdasarkan scope dan pencarian
  const visibleRows = useMemo(() => {
    let rows = worksheetRows;
    if (viewScope === "komponen") {
      // Tampilan awal persis seperti Gambar 1: Hanya sampai tingkat Komponen
      rows = rows.filter((r) =>
        ["program", "kegiatan", "kro", "ro", "komponen"].includes(r.type)
      );
    }

    if (!filterSearch.trim()) return rows;
    const q = filterSearch.toLowerCase();
    return rows.filter(
      (r) =>
        r.kode.toLowerCase().includes(q) ||
        r.uraian.toLowerCase().includes(q) ||
        (r.subUraian && r.subUraian.toLowerCase().includes(q))
    );
  }, [worksheetRows, viewScope, filterSearch]);

  // List RO yang tersedia untuk KRO aktif (difilter ketat berdasarkan KRO pada Form Lokus / KRO aktif)
  const availableRosForKro = useMemo(() => {
    const list: Array<{
      id: string;
      fullKode: string;
      subKode: string;
      nama: string;
      kegKode: string;
      kroKode: string;
    }> = [];
    const seenFullKode = new Set<string>();

    // Target KRO yang sedang dibuka di Form Pendetailan Lokus (formRo.kroKode) atau fallback ke KRO dialog/option
    const formKroVal = (formRo.kroKode || "").trim();
    const partsFormKro = formKroVal.split(".");
    const targetKegKode = partsFormKro.length > 1 ? partsFormKro[0].toUpperCase() : (formKroDialog.aktivitasKode || "").toUpperCase();
    const targetKroShort = (partsFormKro.length > 1 ? partsFormKro[partsFormKro.length - 1] : formKroVal || formKroDialog.kroKode || selectedKroOption || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const targetKroFull = targetKegKode ? `${targetKegKode}.${targetKroShort}` : targetKroShort;

    // 1. Prioritas Utama: Ambil dari Informasi Kinerja Unit Kerja aktif pada TOR
    filteredInformasiKinerja.forEach((ik, idx) => {
      const p = parseInformasiKinerjaRow(ik);
      const isMatch =
        !targetKroShort ||
        p.kroKode.toUpperCase() === targetKroShort ||
        p.fullKroKode.toUpperCase() === targetKroFull ||
        (targetKegKode ? p.aktivitasKode.toUpperCase() === targetKegKode && p.kroKode.toUpperCase() === targetKroShort : false);

      if (isMatch && !seenFullKode.has(p.fullRoKode)) {
        seenFullKode.add(p.fullRoKode);
        list.push({
          id: `ik-ro-${idx}`,
          fullKode: p.fullRoKode,
          subKode: p.roKode,
          nama: p.roNama,
          kegKode: p.aktivitasKode,
          kroKode: p.kroKode,
        });
      }
    });

    // 2. Ambil dari Rekap Sasaran Renja jika masih ada RO tambahan
    (rekapSasaranRenjaAllData as any[]).forEach((item, idx) => {
      if (!item.ro || typeof item.ro !== "string") return;
      const parts = item.ro.split(" - ");
      const rawFullKode = parts[0].trim();
      const rawDeskripsi = parts.slice(1).join(" - ").trim();
      const match = rawFullKode.match(/^([A-Z0-9]+)\.(\d{4})\.([A-Z0-9]+)\.([A-Z0-9]+)$/);
      if (match) {
        const [_, prog, keg, kro, sub] = match;
        const fullKode = `${prog}.${keg}.${kro}.${sub}`;

        const isKroMatch =
          !targetKroShort ||
          (targetKegKode ? keg.toUpperCase() === targetKegKode && kro.toUpperCase() === targetKroShort : kro.toUpperCase() === targetKroShort);

        if (isKroMatch && !seenFullKode.has(fullKode)) {
          seenFullKode.add(fullKode);
          list.push({
            id: `renja-${idx}`,
            fullKode,
            subKode: sub,
            nama: rawDeskripsi,
            kegKode: keg,
            kroKode: kro,
          });
        }
      }
    });

    // Filter dengan roSearchQuery jika diinput pengguna
    if (roSearchQuery.trim()) {
      const q = roSearchQuery.toLowerCase();
      return list.filter(
        (r) =>
          r.fullKode.toLowerCase().includes(q) ||
          r.subKode.toLowerCase().includes(q) ||
          r.nama.toLowerCase().includes(q)
      );
    }

    return list;
  }, [filteredInformasiKinerja, formRo.kroKode, formKroDialog.aktivitasKode, formKroDialog.kroKode, selectedKroOption, roSearchQuery]);

  // List SBK (Standar Biaya Keluaran) terfilter untuk modal pemilih SBK
  const filteredSbkList = useMemo(() => {
    if (!sbkSearchQuery.trim()) return sbkData;
    const q = sbkSearchQuery.toLowerCase();
    return sbkData.filter(
      (item) =>
        item.uraian.toLowerCase().includes(q) ||
        item.kode.toLowerCase().includes(q) ||
        item.kelompok.toLowerCase().includes(q) ||
        (item.satker && item.satker.toLowerCase().includes(q))
    );
  }, [sbkSearchQuery]);

  // Reset sbkPage ke 1 bila query pencarian berubah
  useEffect(() => {
    setSbkPage(1);
  }, [sbkSearchQuery]);

  // Total pages & paginated SBK list
  const totalSbkPages = Math.ceil(filteredSbkList.length / sbkPageSize) || 1;
  const paginatedSbkList = useMemo(() => {
    const start = (sbkPage - 1) * sbkPageSize;
    return filteredSbkList.slice(start, start + sbkPageSize);
  }, [filteredSbkList, sbkPage, sbkPageSize]);

  // RO aktif yang menaungi baris komponen yang sedang ditambah/diedit
  const activeRoForKomponen = useMemo(() => {
    if (editingRowId) {
      const idx = worksheetRows.findIndex((r) => r.id === editingRowId);
      return findParentRoForRow(worksheetRows, idx);
    }
    const selIdx = worksheetRows.findIndex((r) => r.id === selectedRowId);
    if (selIdx >= 0) {
      return findParentRoForRow(worksheetRows, selIdx);
    }
    return [...worksheetRows].reverse().find((r) => r.type === "ro") || null;
  }, [editingRowId, selectedRowId, worksheetRows]);

  // Cek apakah RO aktif merupakan operasional perkantoran (3377.EBA.994 atau 3375.EBA.994)
  const isCurrentRoOperasional = useMemo(() => {
    const roRef = (activeRoForKomponen?.kode || formRo.roKode || "").trim();
    return isOperasionalRo(roRef);
  }, [activeRoForKomponen, formRo.roKode]);

  // Dapatkan lokasi KRO aktif untuk penentuan tarif Belanja Bahan
  const currentKroLocation = useMemo(() => {
    const targetId = targetSubkompRowId || selectedRowId;
    const selIdx = worksheetRows.findIndex((r) => r.id === targetId);
    let kroRow: WorksheetRow | null = null;
    if (selIdx >= 0) {
      for (let i = selIdx; i >= 0; i--) {
        if (worksheetRows[i].type === "kro") {
          kroRow = worksheetRows[i];
          break;
        }
      }
    }
    if (!kroRow) {
      kroRow = worksheetRows.find((r) => r.type === "kro") || null;
    }

    let locCode = `${formKroDialog.lokasi1}.${formKroDialog.lokasi2}`;
    let locName = formKroDialog.lokasiNama || "DKI Jakarta";
    if (kroRow?.subUraian) {
      const match = kroRow.subUraian.match(/Lokasi\s*:\s*(\d{2}\.\d{2})-?([^)]*)/i);
      if (match) {
        locCode = match[1];
        if (match[2]) locName = match[2].trim();
      }
    }
    const isKotaDepok = locCode.startsWith("02.58") || locCode.startsWith("02");
    return {
      code: locCode,
      name: locName,
      isKotaDepok,
      tarif: isKotaDepok ? TARIF_BELANJA_BAHAN_02_58 : TARIF_BELANJA_BAHAN_01_51_55,
      tarifLabel: isKotaDepok ? "Lokasi 02.58 (Kota Depok / Jawa Barat)" : `Lokasi ${locCode} (DKI Jakarta / 01.51 s.d 01.55)`,
    };
  }, [targetSubkompRowId, selectedRowId, worksheetRows, formKroDialog]);

  // List Komponen yang tersedia untuk RO aktif (difilter Unit Kerja aktif & RO yang dipilih)
  const availableKomponensForRo = useMemo(() => {
    const list: Array<{
      kode: string;
      shortKode: string;
      deskripsi: string;
      jenis: string;
    }> = [];
    const seen = new Set<string>();

    // Dapatkan RO aktif: utamakan baris RO yang menaungi kursor aktif, lalu formRo
    const activeRoRow = activeRoForKomponen || [...worksheetRows].reverse().find((r) => r.type === "ro");

    const targetRoKode = (activeRoRow?.kode || formRo.roKode || "").trim();
    const targetRoNama = (activeRoRow?.uraian || formRo.roNama || "").toLowerCase().trim();

    // Ekstrak kode angka RO 3-digit (misal: "004" dari "3380.AEC.004" atau "BE.3380.AEC.004")
    const ro3DigitMatch = targetRoKode.match(/(?:^|\.)(\d{3})(?:$|\.)/);
    const targetRo3Digit = ro3DigitMatch ? ro3DigitMatch[1] : (targetRoKode.length === 3 ? targetRoKode : "");

    // Ambil dari Informasi Kinerja Unit Kerja aktif
    filteredInformasiKinerja.forEach((ik) => {
      const p = parseInformasiKinerjaRow(ik);
      
      // Pencocokan ketat terhadap RO terpilih
      let isRoMatch = false;
      if (targetRoKode) {
        if (p.fullRoKode === targetRoKode || p.roKode === targetRoKode) {
          isRoMatch = true;
        } else if (p.fullRoKode.includes(targetRoKode)) {
          isRoMatch = true;
        } else if (targetRo3Digit && (p.roKode === targetRo3Digit || (ik.ro || "").includes(`.${targetRo3Digit}`))) {
          // Cocokkan juga KRO agar tidak lintas KRO jika KRO terdefinisi
          const targetKroRaw = (formKroDialog.kroKode || selectedKroOption || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
          if (!targetKroRaw || p.kroKode.toUpperCase().includes(targetKroRaw) || p.fullKroKode.toUpperCase().includes(targetKroRaw)) {
            isRoMatch = true;
          }
        }
      } else if (targetRoNama) {
        isRoMatch = p.roNama.toLowerCase().includes(targetRoNama);
      } else {
        isRoMatch = true;
      }

      if (isRoMatch) {
        const fullKomp = `${p.prog1}.${p.prog2}.${p.prog3}.${p.aktivitasKode}.${p.kroKode}.${p.roKode}.${p.kompKode}`;
        if (!seen.has(fullKomp)) {
          seen.add(fullKomp);
          list.push({
            kode: fullKomp,
            shortKode: p.kompKode,
            deskripsi: p.kompNama,
            jenis: "Utama",
          });
        }
      }
    });

    if (komponenSearchQuery.trim()) {
      const q = komponenSearchQuery.toLowerCase();
      return list.filter(
        (k) =>
          k.kode.toLowerCase().includes(q) ||
          k.shortKode.toLowerCase().includes(q) ||
          k.deskripsi.toLowerCase().includes(q)
      );
    }

    return list;
  }, [filteredInformasiKinerja, formRo.roKode, formRo.roNama, worksheetRows, selectedRowId, formKroDialog.kroKode, selectedKroOption, komponenSearchQuery]);

  // Helper untuk menentukan index penyisipan baris baru di bawah cabang/subtree baris terpilih
  function findInsertionIndexForSubtree(startIdx: number, parentType: WorksheetRowType): number {
    const typeRanks: Record<WorksheetRowType, number> = {
      program: 1,
      kegiatan: 2,
      kro: 3,
      ro: 4,
      komponen: 5,
      subkomponen: 6,
      akun: 7,
      header1: 8,
      header2: 9,
      subkomponen_sub: 9,
      detail: 10,
    };
    const parentRank = typeRanks[parentType];
    let insertIdx = startIdx + 1;
    while (insertIdx < worksheetRows.length) {
      const nextRank = typeRanks[worksheetRows[insertIdx].type];
      // Jika baris berikutnya levelnya lebih dalam dari parent (rank > parentRank), maka masih anak dari parent
      if (nextRank > parentRank) {
        insertIdx++;
      } else {
        break;
      }
    }
    return insertIdx;
  }

  // Handler Buka Modal Penambahan Baris dengan Validasi Hierarki Berdasarkan Letak Kursor
  function handleOpenAddModal(targetMode: "kro" | "ro" | "komponen" | "subkomponen" | "akun" | "header1" | "header2" | "detail") {
    setEditingRowId(null);

    // Jika tabel kosong, hanya boleh mulai dari KRO
    if (worksheetRows.length === 0) {
      if (targetMode === "kro") {
        setModalMode("kro");
      } else {
        triggerAlert("Kertas kerja masih kosong. Silakan mulai dari Isian KRO terlebih dahulu.");
      }
      return;
    }

    // Jika tidak ada baris yang dipilih / kursor belum diletakkan
    if (!selectedRowId) {
      triggerAlert("Pilih / klik salah satu baris terlebih dahulu sebagai acuan posisi hierarki.");
      return;
    }

    const selectedRow = worksheetRows.find((r) => r.id === selectedRowId);
    if (!selectedRow) {
      triggerAlert("Baris acuan tidak ditemukan.");
      return;
    }

    const curType = selectedRow.type;

    // Aturan hierarki penambahan baris:
    // 1. Program / Kegiatan / KRO -> hanya boleh tambah RO (targetMode === "ro")
    // 2. RO -> hanya boleh tambah Komponen (targetMode === "komponen")
    // 3. Komponen -> hanya boleh tambah Sub Komponen (targetMode === "subkomponen")
    // 4. Sub Komponen -> hanya boleh tambah Akun (targetMode === "akun")
    // 5. Akun -> boleh tambah Header 1 (header1), atau langsung Detail Belanja (detail)
    // 6. Header 1 -> boleh tambah Header 2 (header2), atau langsung Detail Belanja (detail)
    // 7. Header 2 -> boleh tambah Detail Belanja (detail)
    // 8. Detail Belanja -> boleh tambah Detail Belanja lagi di akun/header yang sama (detail)

    if (targetMode === "kro") {
      // Periksa apakah kursor aktif berada pada level KRO
      if (selectedRow && selectedRow.type === "kro") {
        const selIdx = worksheetRows.findIndex((r) => r.id === selectedRowId);
        let hasChildRo = false;
        if (selIdx >= 0) {
          for (let i = selIdx + 1; i < worksheetRows.length; i++) {
            const rowType = worksheetRows[i].type;
            if (rowType === "program" || rowType === "kegiatan" || rowType === "kro") {
              break; // Keluar dari subtree KRO ini
            }
            if (rowType === "ro") {
              hasChildRo = true;
              break;
            }
          }
        }

        if (!hasChildRo) {
          // Di bawah KRO belum ada level RO -> buka dialogbox untuk Form Rekam KRO kembali (edit baris KRO ini)
          setEditingRowId(selectedRow.id);
          const parts = selectedRow.kode.split(".");
          const kroCode = parts.length > 1 ? parts[parts.length - 1] : selectedRow.kode;
          setFormKroDialog((prev) => ({
            ...prev,
            kroKode: kroCode,
            kroNama: selectedRow.uraian,
            volume: selectedRow.vol || prev.volume,
          }));
          setModalMode("kro");
          return;
        } else {
          // Di bawah KRO ada minimal 1 baris level RO -> konfirmasi edit KRO atau tambah KRO
          setModalMode("konfirmasi_kro");
          return;
        }
      }

      setEditingRowId(null);
      setModalMode("kro");
      return;
    }

    if (targetMode === "ro") {
      if (curType !== "kro" && curType !== "kegiatan" && curType !== "program") {
        triggerAlert("Baris baru level RO hanya dapat ditambahkan di bawah level KRO.");
        return;
      }
      setFormRo((prev) => ({
        ...prev,
        kroKode: selectedRow.kode,
        kroNama: selectedRow.uraian,
        isSbk: false,
        sbkKelompok: "",
        sbkKode: "",
        sbkUraian: "",
        sbkBesaran: 0,
        sbkSatuan: "",
      }));
      setModalMode("ro");
      return;
    }

    if (targetMode === "komponen") {
      if (curType !== "ro") {
        triggerAlert("Baris baru level Komponen hanya dapat ditambahkan di bawah baris level RO.");
        return;
      }
      const isOp = isOperasionalRo(selectedRow.kode);
      setFormKomponen((prev) => ({
        ...prev,
        jenisBiaya: isOp ? "OPERASIONAL" : "NON OPERASIONAL",
      }));
      setModalMode("komponen");
      return;
    }

    if (targetMode === "subkomponen") {
      if (curType !== "komponen") {
        triggerAlert("Baris baru level Sub Komponen hanya dapat ditambahkan di bawah baris level Komponen.");
        return;
      }
      setModalMode("subkomponen");
      return;
    }

    if (targetMode === "akun") {
      if (curType !== "subkomponen") {
        triggerAlert("Baris baru level Akun Belanja hanya dapat ditambahkan di bawah baris level Sub Komponen.");
        return;
      }
      setModalMode("akun");
      return;
    }

    if (targetMode === "header1") {
      if (curType !== "akun") {
        triggerAlert("Header 1 hanya dapat ditambahkan di bawah baris level Akun Belanja.");
        return;
      }
      setModalMode("header1");
      return;
    }

    if (targetMode === "header2") {
      if (curType !== "subkomponen_sub" || selectedRow.headerLevel !== 1) {
        triggerAlert("Header 2 hanya dapat ditambahkan di bawah baris Header 1.");
        return;
      }
      setModalMode("header2");
      return;
    }

    if (targetMode === "detail") {
      // Level Akun dapat langsung membentuk Detail Anggaran, atau dari Header 1 / Header 2 / sesama Detail
      if (curType !== "akun" && curType !== "subkomponen_sub" && curType !== "detail") {
        triggerAlert("Detail Belanja hanya dapat ditambahkan di bawah level Akun Belanja atau Header.");
        return;
      }

      // Tentukan target kode akun induk secara otomatis
      let parentAkun = "";
      if (curType === "akun") {
        parentAkun = selectedRow.kode;
      } else if (selectedRow.parentAkunKode) {
        parentAkun = selectedRow.parentAkunKode;
      } else {
        const selIdx = worksheetRows.findIndex((r) => r.id === selectedRowId);
        for (let i = selIdx; i >= 0; i--) {
          if (worksheetRows[i].type === "akun") {
            parentAkun = worksheetRows[i].kode;
            break;
          }
        }
      }

      if (parentAkun) {
        setFormDetail((prev) => ({
          ...prev,
          akunTarget: parentAkun,
        }));
      }
      setModalMode("detail");
      return;
    }

    setModalMode(targetMode);
  }

  // Handler Konfirmasi Form Isian KRO (Form Rekam Program, Aktivitas, KRO)
  function handleConfirmKro() {
    const progKode = `${formKroDialog.prog1}.${formKroDialog.prog2}.${formKroDialog.prog3}`;
    const progNama = formKroDialog.progUraian;

    const kegKode = formKroDialog.aktivitasKode;
    const kegNama = formKroDialog.aktivitasUraian;

    const kroKode = `${kegKode}.${formKroDialog.kroKode}`;
    const kroNama = formKroDialog.kroNama;
    const subUraianKro = `(Lokasi :${formKroDialog.lokasi1}.${formKroDialog.lokasi2}-${formKroDialog.lokasiNama}) (KDIB=${formKroDialog.kodeIB} ${formKroDialog.kodeIBUraian})`;

    if (editingRowId) {
      // Jika mode edit, pastikan tidak mengganti menjadi KRO yang sudah ada di baris KRO lain
      const existingKroRow = worksheetRows.find(
        (r) =>
          r.type === "kro" &&
          r.id !== editingRowId &&
          (r.kode.trim().toUpperCase() === kroKode.trim().toUpperCase() ||
            (formKroDialog.kroKode && r.kode.trim().toUpperCase().endsWith(formKroDialog.kroKode.trim().toUpperCase())))
      );
      if (existingKroRow) {
        triggerAlert(`KRO ${kroKode} sudah ada di kertas kerja (${existingKroRow.uraian}). Anda tidak dapat menggunakan KRO yang sama!`);
        return;
      }

      setWorksheetRows((prev) =>
        prev.map((r) => {
          if (r.id === editingRowId) {
            return {
              ...r,
              kode: kroKode,
              uraian: kroNama,
              subUraian: subUraianKro,
              vol: Number(formKroDialog.volume) || r.vol,
            };
          }
          return r;
        })
      );
      setEditingRowId(null);
      setModalMode(null);
      triggerAlert(`KRO ${kroKode} - ${kroNama} berhasil diperbarui!`);
      return;
    }

    // Validasi penambahan KRO baru: User tidak dapat menambahkan KRO baru apabila KRO yang sama sudah ada di kertas kerja
    const isKroAlreadyExist = worksheetRows.some(
      (r) =>
        r.type === "kro" &&
        (r.kode.trim().toUpperCase() === kroKode.trim().toUpperCase() ||
          (formKroDialog.kroKode && r.kode.trim().toUpperCase().endsWith(formKroDialog.kroKode.trim().toUpperCase())))
    );

    if (isKroAlreadyExist) {
      triggerAlert(
        `KRO ${kroKode} sudah ada di kertas kerja! Penambahan KRO hanya dapat dilakukan untuk KRO yang belum ada di kertas kerja.`
      );
      return;
    }

    // Jika worksheet sudah memiliki data dan user memilih Tambah KRO baru:
    if (worksheetRows.length > 0) {
      const newKroRow: WorksheetRow = {
        id: `row-kro-${Date.now()}`,
        type: "kro",
        kode: kroKode,
        uraian: kroNama,
        subUraian: subUraianKro,
        vol: Number(formKroDialog.volume) || 19,
        sat: "peraturan, Rancanga...",
        jumlah: 0,
        cO: false,
        cS: false,
        cU: false,
        cK: false,
        cD: false,
      };

      setWorksheetRows((prev) => {
        const selIdx = prev.findIndex((r) => r.id === selectedRowId);
        const next = [...prev];
        if (selIdx >= 0) {
          let kroIdx = selIdx;
          while (kroIdx >= 0 && next[kroIdx].type !== "kro") {
            kroIdx--;
          }
          const insertIdx = findInsertionIndexForSubtree(kroIdx >= 0 ? kroIdx : selIdx, "kro");
          next.splice(insertIdx, 0, newKroRow);
        } else {
          next.push(newKroRow);
        }
        return calculateHierarchyAmounts(next);
      });

      setSelectedRowId(newKroRow.id);
      setFormRo((prev) => ({
        ...prev,
        kroKode,
        kroNama,
      }));
      setSelectedKroOption(kroKode);
      setModalMode(null);
      triggerAlert(`KRO baru ${kroKode} - ${kroNama} berhasil ditambahkan pada baris baru!`);
      return;
    }

    // Tampilkan s.d. level KRO persis permintaan user (kertas kerja awal)
    const levelRows: WorksheetRow[] = [
      {
        id: "row-prog",
        type: "program",
        kode: progKode,
        uraian: progNama,
        jumlah: 743651000,
        cO: false,
        cS: false,
        cU: false,
        cK: false,
        cD: false,
      },
      {
        id: "row-keg",
        type: "kegiatan",
        kode: kegKode,
        uraian: kegNama,
        jumlah: 743651000,
        cO: false,
        cS: false,
        cU: false,
        cK: false,
        cD: false,
      },
      {
        id: "row-kro",
        type: "kro",
        kode: kroKode,
        uraian: kroNama,
        subUraian: subUraianKro,
        vol: Number(formKroDialog.volume) || 19,
        sat: "peraturan, Rancanga...",
        jumlah: 743651000,
        cO: false,
        cS: false,
        cU: false,
        cK: false,
        cD: false,
      },
    ];

    setWorksheetRows(levelRows);
    setFormRo((prev) => ({
      ...prev,
      kroKode,
      kroNama,
    }));
    setSelectedKroOption(kroKode);
    setModalMode(null);
    triggerAlert(`Kertas kerja menampilkan s.d. level KRO: ${kroKode} - ${kroNama} (KDIB: ${formKroDialog.kodeIB} ${formKroDialog.kodeIBUraian})`);
  }

  // Handler Simpan RO (Persis Gambar 5: Form Pendetailan Lokus)
  function handleSaveRo() {
    if (!formRo.roNama.trim()) return;
    const cleanRoKode = formRo.roKode.includes(".") ? formRo.roKode : `${formRo.kroKode}.${formRo.roKode}`;
    const volNum = Number(formRo.volume) || 1;
    const maxAnggaran = formRo.isSbk && formRo.sbkBesaran ? volNum * formRo.sbkBesaran : undefined;

    if (editingRowId) {
      setWorksheetRows((prev) => {
        const next = prev.map((r) => {
          if (r.id === editingRowId) {
            return {
              ...r,
              kode: cleanRoKode,
              uraian: formRo.roNama,
              vol: Number(formRo.volume) || r.vol,
              isSbk: formRo.isSbk,
              sbkKelompok: formRo.sbkKelompok,
              sbkKode: formRo.sbkKode,
              sbkUraian: formRo.sbkUraian,
              sbkBesaran: formRo.sbkBesaran,
              sbkSatuan: formRo.sbkSatuan,
              maxAnggaranRo: maxAnggaran,
            };
          }
          return r;
        });
        return calculateHierarchyAmounts(next);
      });
      setEditingRowId(null);
      setModalMode(null);
      triggerAlert(
        formRo.isSbk
          ? `RO ${cleanRoKode} - ${formRo.roNama} berhasil diperbarui dengan batasan ${formRo.sbkKelompok} (Batas Pagu: Rp ${formatRupiah(maxAnggaran || 0)})`
          : `RO ${cleanRoKode} - ${formRo.roNama} berhasil diperbarui!`
      );
      return;
    }

    const newRow: WorksheetRow = {
      id: `row-ro-${Date.now()}`,
      type: "ro",
      kode: cleanRoKode,
      uraian: formRo.roNama,
      badge: formRo.isSbk ? `[${formRo.sbkKelompok}]` : "[Kerangka Regulasi 7%]",
      subUraian: formRo.isSbk
        ? `Batas SBK: Rp ${formatRupiah(formRo.sbkBesaran)}/${formRo.sbkSatuan || "output"} (Maks. Rp ${formatRupiah(maxAnggaran || 0)})`
        : "Jumlah Komponen Utama [100.00%]",
      vol: volNum,
      sat: formRo.sbkSatuan || "peraturan",
      jumlah: 0,
      isSbk: formRo.isSbk,
      sbkKelompok: formRo.sbkKelompok,
      sbkKode: formRo.sbkKode,
      sbkUraian: formRo.sbkUraian,
      sbkBesaran: formRo.sbkBesaran,
      sbkSatuan: formRo.sbkSatuan,
      maxAnggaranRo: maxAnggaran,
      cO: false,
      cS: false,
      cU: false,
      cK: false,
      cD: false,
    };

    setWorksheetRows((prev) => {
      const selIdx = prev.findIndex((r) => r.id === selectedRowId);
      const next = [...prev];
      if (selIdx >= 0) {
        const insertIdx = findInsertionIndexForSubtree(selIdx, prev[selIdx].type);
        next.splice(insertIdx, 0, newRow);
      } else {
        const kroIdx = prev.findIndex((r) => r.type === "kro");
        if (kroIdx >= 0) {
          const insertIdx = findInsertionIndexForSubtree(kroIdx, "kro");
          next.splice(insertIdx, 0, newRow);
        } else {
          next.push(newRow);
        }
      }
      return calculateHierarchyAmounts(next);
    });

    setSelectedRowId(newRow.id);
    setModalMode(null);
    triggerAlert(`RO ${cleanRoKode} - ${formRo.roNama} berhasil ditambahkan!`);
  }

  // Handler Tambah Komponen (Persis Gambar 3)
  function handleSaveKomponen() {
    if (!formKomponen.uraian.trim()) return;

    const finalJenisBiaya = isCurrentRoOperasional ? formKomponen.jenisBiaya : "NON OPERASIONAL";

    if (editingRowId) {
      setWorksheetRows((prev) => {
        const next = prev.map((r) => {
          if (r.id === editingRowId) {
            return {
              ...r,
              kode: formKomponen.kode,
              uraian: formKomponen.uraian,
              jenisBiaya: finalJenisBiaya,
              sifatBiaya: formKomponen.sifatBiaya,
              badge: `[${formKomponen.sifatBiaya}]`,
            };
          }
          return r;
        });
        return calculateHierarchyAmounts(next);
      });
      setEditingRowId(null);
      setModalMode(null);
      triggerAlert(`Komponen ${formKomponen.kode} berhasil diperbarui!`);
      return;
    }

    const newRow: WorksheetRow = {
      id: `row-komp-${Date.now()}`,
      type: "komponen",
      kode: formKomponen.kode,
      uraian: formKomponen.uraian,
      jenisBiaya: finalJenisBiaya,
      sifatBiaya: formKomponen.sifatBiaya,
      badge: `[${formKomponen.sifatBiaya}]`,
      vol: 0,
      jumlah: 578910000,
      cO: false,
      cS: false,
      cU: false,
      cK: false,
      cD: false,
    };

    setWorksheetRows((prev) => {
      const selIdx = prev.findIndex((r) => r.id === selectedRowId);
      const next = [...prev];
      if (selIdx >= 0) {
        const insertIdx = findInsertionIndexForSubtree(selIdx, prev[selIdx].type);
        next.splice(insertIdx, 0, newRow);
      } else {
        const lastRoIdx = prev.map((r) => r.type).lastIndexOf("ro");
        if (lastRoIdx >= 0) {
          const insertIdx = findInsertionIndexForSubtree(lastRoIdx, "ro");
          next.splice(insertIdx, 0, newRow);
        } else {
          next.push(newRow);
        }
      }
      return calculateHierarchyAmounts(next);
    });

    setSelectedRowId(newRow.id);
    setModalMode(null);
    triggerAlert(`Komponen ${formKomponen.kode} berhasil ditambahkan!`);
  }

  // Handler Tambah Sub Komponen (Pilihan: Tanpa Sub Komponen atau Kode Huruf A s.d. Z)
  function handleSaveSubkomponen() {
    const isTanpa = subkompType === "tanpa" || !formSubkomponen.uraian.trim();
    const finalKode = isTanpa ? "" : formSubkomponen.kode.toUpperCase();
    const finalUraian = isTanpa ? "Tanpa Sub Komponen" : formSubkomponen.uraian.trim();

    // Validasi Duplikasi: dalam satu Komponen tidak dapat ada 2 sub Komponen yang sama (kode / uraian)
    const selIdx = worksheetRows.findIndex((r) => r.id === (editingRowId || selectedRowId));
    let parentKompIdx = -1;
    if (selIdx >= 0) {
      for (let i = selIdx; i >= 0; i--) {
        if (worksheetRows[i].type === "komponen") {
          parentKompIdx = i;
          break;
        }
      }
    }
    if (parentKompIdx >= 0) {
      // Periksa semua subkomponen di bawah komponen induk ini sampai bertemu komponen/level lebih tinggi berikutnya
      for (let i = parentKompIdx + 1; i < worksheetRows.length; i++) {
        const row = worksheetRows[i];
        if (["program", "kegiatan", "kro", "ro", "komponen"].includes(row.type)) break;
        if (row.type === "subkomponen" && row.id !== editingRowId) {
          const isSameKode = finalKode && row.kode.toUpperCase() === finalKode;
          const isSameUraian = row.uraian.trim().toLowerCase() === finalUraian.toLowerCase();
          if (isSameKode || isSameUraian) {
            triggerAlert(`Sub Komponen "${finalKode ? finalKode + ' - ' : ''}${finalUraian}" sudah ada dalam Komponen ini! Dalam satu Komponen tidak dapat ada 2 Sub Komponen yang sama.`);
            return;
          }
        }
      }
    }

    if (editingRowId) {
      setWorksheetRows((prev) => {
        const next = prev.map((r) => {
          if (r.id === editingRowId) {
            return {
              ...r,
              kode: finalKode,
              uraian: finalUraian,
            };
          }
          return r;
        });
        return calculateHierarchyAmounts(next);
      });
      setEditingRowId(null);
      setModalMode(null);
      triggerAlert(`Sub Komponen "${finalUraian}" berhasil diperbarui!`);
      return;
    }

    const newRow: WorksheetRow = {
      id: `row-subkomp-${Date.now()}`,
      type: "subkomponen",
      kode: finalKode,
      uraian: finalUraian,
      jumlah: 0,
      cO: false,
      cS: false,
      cU: false,
      cK: false,
      cD: false,
    };
    setWorksheetRows((prev) => {
      const selIdx = prev.findIndex((r) => r.id === selectedRowId);
      const next = [...prev];
      if (selIdx >= 0) {
        const insertIdx = findInsertionIndexForSubtree(selIdx, prev[selIdx].type);
        next.splice(insertIdx, 0, newRow);
      } else {
        const lastKompIdx = prev.map((r) => r.type).lastIndexOf("komponen");
        if (lastKompIdx >= 0) {
          const insertIdx = findInsertionIndexForSubtree(lastKompIdx, "komponen");
          next.splice(insertIdx, 0, newRow);
        } else {
          next.push(newRow);
        }
      }
      return calculateHierarchyAmounts(next);
    });
    if (viewScope === "komponen") setViewScope("semua");
    setSelectedRowId(newRow.id);
    setTargetSubkompRowId(newRow.id);
    setModalMode("pilih_metode");
    triggerAlert(
      isTanpa
        ? 'Sub Komponen "Tanpa Sub Komponen" berhasil ditambahkan! Silakan pilih metode input belanja.'
        : `Sub Komponen ${finalKode} berhasil ditambahkan! Silakan pilih metode input belanja.`
    );
  }

  // Handler Tambah Akun (Bagan Akun Standar - BAS)
  function handleSaveAkun() {
    if (!formAkun.kodeAkun.trim()) return;

    // Validasi Duplikasi: dalam satu Sub Komponen tidak dapat ada 2 Akun yang sama (kode akun)
    const selIdx = worksheetRows.findIndex((r) => r.id === (editingRowId || selectedRowId));
    let parentSubkompIdx = -1;
    if (selIdx >= 0) {
      for (let i = selIdx; i >= 0; i--) {
        if (worksheetRows[i].type === "subkomponen") {
          parentSubkompIdx = i;
          break;
        }
        if (["program", "kegiatan", "kro", "ro", "komponen"].includes(worksheetRows[i].type)) {
          break;
        }
      }
    }
    if (parentSubkompIdx >= 0) {
      for (let i = parentSubkompIdx + 1; i < worksheetRows.length; i++) {
        const row = worksheetRows[i];
        if (["program", "kegiatan", "kro", "ro", "komponen", "subkomponen"].includes(row.type)) break;
        if (row.type === "akun" && row.id !== editingRowId) {
          if (row.kode.trim() === formAkun.kodeAkun.trim()) {
            triggerAlert(`Akun ${formAkun.kodeAkun} sudah ada dalam Sub Komponen ini! Dalam satu Sub Komponen tidak dapat ada 2 Akun yang sama.`);
            return;
          }
        }
      }
    }

    if (editingRowId) {
      setWorksheetRows((prev) => {
        const next = prev.map((r) => {
          if (r.id === editingRowId) {
            return {
              ...r,
              kode: formAkun.kodeAkun,
              uraian: formAkun.uraianAkun,
              subUraian: formAkun.subUraian || "(KPPN.175-Jakarta VI)",
              sd: formAkun.sd || "A00",
            };
          }
          return r;
        });
        return calculateHierarchyAmounts(next);
      });
      setEditingRowId(null);
      setModalMode(null);
      triggerAlert(`Akun ${formAkun.kodeAkun} - ${formAkun.uraianAkun} berhasil diperbarui!`);
      return;
    }

    const newRow: WorksheetRow = {
      id: `row-akun-${Date.now()}`,
      type: "akun",
      kode: formAkun.kodeAkun,
      uraian: formAkun.uraianAkun,
      subUraian: formAkun.subUraian || "(KPPN.175-Jakarta VI)",
      jumlah: 64709000,
      sd: formAkun.sd || "A00",
      cO: false,
      cS: false,
      cU: false,
      cK: false,
      cD: false,
    };
    setWorksheetRows((prev) => {
      const selIdx = prev.findIndex((r) => r.id === selectedRowId);
      const next = [...prev];
      if (selIdx >= 0) {
        const insertIdx = findInsertionIndexForSubtree(selIdx, prev[selIdx].type);
        next.splice(insertIdx, 0, newRow);
      } else {
        const lastSubkompIdx = prev.map((r) => r.type).lastIndexOf("subkomponen");
        if (lastSubkompIdx >= 0) {
          const insertIdx = findInsertionIndexForSubtree(lastSubkompIdx, "subkomponen");
          next.splice(insertIdx, 0, newRow);
        } else {
          next.push(newRow);
        }
      }
      return calculateHierarchyAmounts(next);
    });
    if (viewScope === "komponen") setViewScope("semua");
    setSelectedRowId(newRow.id);
    setModalMode(null);
    triggerAlert(`Akun ${formAkun.kodeAkun} - ${formAkun.uraianAkun} berhasil ditambahkan!`);
  }

  // Handler Rekam Header 1
  function handleSaveHeader1() {
    if (!formHeader1.nomenklatur.trim()) return;
    const cleanInput = cleanHeaderUraian(formHeader1.nomenklatur);

    // Cek apakah di bawah Akun induk sudah ada Header 1 yang sama
    const selIdx = worksheetRows.findIndex((r) => r.id === selectedRowId);
    let parentAkunIdx = -1;
    if (selIdx >= 0) {
      for (let i = selIdx; i >= 0; i--) {
        if (worksheetRows[i].type === "akun") {
          parentAkunIdx = i;
          break;
        }
        if (["program", "kegiatan", "kro", "ro", "komponen", "subkomponen"].includes(worksheetRows[i].type)) {
          break;
        }
      }
    }
    if (parentAkunIdx >= 0) {
      for (let i = parentAkunIdx + 1; i < worksheetRows.length; i++) {
        const row = worksheetRows[i];
        if (["program", "kegiatan", "kro", "ro", "komponen", "subkomponen", "akun"].includes(row.type)) break;
        if (row.type === "header1" || (row.type === "subkomponen_sub" && row.headerLevel === 1)) {
          if (cleanHeaderUraian(row.uraian) === cleanInput) {
            triggerAlert(`Header 1 "${formHeader1.nomenklatur}" sudah ada di bawah Akun ini! Tidak boleh ada duplikasi Header 1.`);
            return;
          }
        }
      }
    }

    const newRow: WorksheetRow = {
      id: `row-hdr1-${Date.now()}`,
      type: "header1",
      headerLevel: 1,
      kode: "",
      uraian: formHeader1.nomenklatur.startsWith(">") ? formHeader1.nomenklatur : `> ${formHeader1.nomenklatur}`,
      jumlah: 0,
      cO: false,
      cS: false,
      cU: false,
      cK: false,
      cD: false,
    };
    setWorksheetRows((prev) => {
      const targetIdx = selIdx;
      const next = [...prev];
      if (targetIdx >= 0) {
        const insertIdx = findInsertionIndexForSubtree(targetIdx, prev[targetIdx].type);
        next.splice(insertIdx, 0, newRow);
      } else {
        const lastAkunIdx = prev.map((r) => r.type).lastIndexOf("akun");
        if (lastAkunIdx >= 0) {
          const insertIdx = findInsertionIndexForSubtree(lastAkunIdx, "akun");
          next.splice(insertIdx, 0, newRow);
        } else {
          next.push(newRow);
        }
      }
      return calculateHierarchyAmounts(next);
    });
    if (viewScope === "komponen") setViewScope("semua");
    setSelectedRowId(newRow.id);
    setModalMode(null);
    triggerAlert(`Header 1 "${formHeader1.nomenklatur}" berhasil disimpan!`);
  }

  // Handler Rekam Header 2
  function handleSaveHeader2() {
    if (!formHeader2.nomenklatur.trim()) return;
    const cleanInput = cleanHeaderUraian(formHeader2.nomenklatur);

    // Cek apakah di bawah Header 1 induk sudah ada Header 2 yang sama
    const selIdx = worksheetRows.findIndex((r) => r.id === selectedRowId);
    let parentH1Idx = -1;
    if (selIdx >= 0) {
      for (let i = selIdx; i >= 0; i--) {
        if (worksheetRows[i].type === "header1" || (worksheetRows[i].type === "subkomponen_sub" && worksheetRows[i].headerLevel === 1)) {
          parentH1Idx = i;
          break;
        }
        if (["program", "kegiatan", "kro", "ro", "komponen", "subkomponen", "akun"].includes(worksheetRows[i].type)) {
          break;
        }
      }
    }
    if (parentH1Idx >= 0) {
      for (let i = parentH1Idx + 1; i < worksheetRows.length; i++) {
        const row = worksheetRows[i];
        if (["program", "kegiatan", "kro", "ro", "komponen", "subkomponen", "akun", "header1"].includes(row.type)) break;
        if (row.type === "header2" || (row.type === "subkomponen_sub" && row.headerLevel === 2)) {
          if (cleanHeaderUraian(row.uraian) === cleanInput) {
            triggerAlert(`Header 2 "${formHeader2.nomenklatur}" sudah ada di bawah Header 1 ini! Tidak boleh ada duplikasi Header 2.`);
            return;
          }
        }
      }
    }

    const newRow: WorksheetRow = {
      id: `row-hdr2-${Date.now()}`,
      type: "header2",
      headerLevel: 2,
      kode: "",
      uraian: formHeader2.nomenklatur.startsWith(">>") ? formHeader2.nomenklatur : `>> ${formHeader2.nomenklatur}`,
      jumlah: 0,
      cO: false,
      cS: false,
      cU: false,
      cK: false,
      cD: false,
    };
    setWorksheetRows((prev) => {
      const targetIdx = selIdx;
      const next = [...prev];
      if (targetIdx >= 0) {
        const insertIdx = findInsertionIndexForSubtree(targetIdx, prev[targetIdx].type);
        next.splice(insertIdx, 0, newRow);
      } else {
        const lastHdrIdx = prev.map((r) => r.type).lastIndexOf("header2");
        if (lastHdrIdx >= 0) {
          const insertIdx = findInsertionIndexForSubtree(lastHdrIdx, "header2");
          next.splice(insertIdx, 0, newRow);
        } else {
          next.push(newRow);
        }
      }
      return calculateHierarchyAmounts(next);
    });
    if (viewScope === "komponen") setViewScope("semua");
    setSelectedRowId(newRow.id);
    setModalMode(null);
    triggerAlert(`Header 2 "${formHeader2.nomenklatur}" berhasil disimpan!`);
  }

  // Handler Tambah Detail Belanja
  function handleSaveDetail() {
    if (!formDetail.uraian.trim()) return;
    const k1 = Number(formDetail.k1Nilai) || 1;
    const k2 = Number(formDetail.k2Nilai) || 1;
    const k3 = Number(formDetail.k3Nilai) || 1;
    const volTotal = k1 * k2 * k3;
    const rawSubtotal = volTotal * formDetail.satuanBiaya;
    const subtotal = Math.floor(rawSubtotal / 1000) * 1000;

    // Validasi pagu maksimal RO jika RO menggunakan batasan SBK
    const selIdx = worksheetRows.findIndex((r) => r.id === selectedRowId);
    const parentRo = findParentRoForRow(worksheetRows, selIdx >= 0 ? selIdx : worksheetRows.length - 1);
    if (parentRo && parentRo.isSbk && parentRo.maxAnggaranRo) {
      const currentRoTotal = Number(parentRo.jumlah) || 0;
      if (currentRoTotal + subtotal > parentRo.maxAnggaranRo) {
        triggerAlert(
          `Peringatan SBK: Penambahan anggaran sebesar Rp ${formatRupiah(subtotal)} akan melebihi batas maksimal anggaran RO (Rp ${formatRupiah(parentRo.maxAnggaranRo)}). Total anggaran RO saat ini: Rp ${formatRupiah(currentRoTotal)}.`
        );
      }
    }

    const newRow: WorksheetRow = {
      id: `row-det-${Date.now()}`,
      type: "detail",
      kode: "",
      uraian: `- ${formDetail.uraian}`,
      k1Nilai: formDetail.k1Nilai,
      k1Sat: formDetail.k1Sat,
      k2Nilai: formDetail.k2Nilai,
      k2Sat: formDetail.k2Sat,
      k3Nilai: formDetail.k3Nilai,
      k3Sat: formDetail.k3Sat,
      vol: volTotal,
      sat: formDetail.satuanAkhir,
      harga: formDetail.satuanBiaya,
      jumlah: subtotal,
      parentAkunKode: formDetail.akunTarget,
      cO: false,
      cS: true,
      cU: true,
      cK: true,
      cD: true,
    };

    setWorksheetRows((prev) => {
      const selIdx = prev.findIndex((r) => r.id === selectedRowId);
      const next = [...prev];
      if (selIdx >= 0) {
        const insertIdx = findInsertionIndexForSubtree(selIdx, prev[selIdx].type);
        next.splice(insertIdx, 0, newRow);
      } else {
        // Fallback: tempatkan di bawah header terakhir atau akun terkait
        const lastHeaderIdx = prev.map((r) => r.type).lastIndexOf("subkomponen_sub");
        const lastAkunIdx = prev.map((r) => r.kode).lastIndexOf(formDetail.akunTarget);
        const targetIdx = lastHeaderIdx >= 0 && lastHeaderIdx > lastAkunIdx ? lastHeaderIdx : (lastAkunIdx >= 0 ? lastAkunIdx : prev.length - 1);
        if (targetIdx >= 0) {
          next.splice(targetIdx + 1, 0, newRow);
        } else {
          next.push(newRow);
        }
      }
      return calculateHierarchyAmounts(next);
    });

    if (viewScope === "komponen") setViewScope("semua");
    setSelectedRowId(newRow.id);
    setModalMode(null);
    triggerAlert(`Baris Detail Belanja berhasil ditambahkan! Total: Rp ${formatRupiah(subtotal)}`);
  }

  // Handler Simpan dari Wizard Panduan
  function handleSaveFromWizard() {
    if (!wizardItemUraian.trim()) {
      triggerAlert("Mohon isi rincian uraian belanja pada formulir panduan!");
      return;
    }

    const volTotal = (wizardVol1 || 1) * (wizardVol2 || 1);
    const rawSubtotal = volTotal * (wizardHargaSatuan || 0);
    const subtotal = Math.floor(rawSubtotal / 1000) * 1000;

    // Validasi pagu maksimal RO jika RO menggunakan batasan SBK
    const targetId = targetSubkompRowId || selectedRowId;
    const targetIdx = worksheetRows.findIndex((r) => r.id === targetId);
    const parentRo = findParentRoForRow(worksheetRows, targetIdx >= 0 ? targetIdx : worksheetRows.length - 1);
    if (parentRo && parentRo.isSbk && parentRo.maxAnggaranRo) {
      const currentRoTotal = Number(parentRo.jumlah) || 0;
      if (currentRoTotal + subtotal > parentRo.maxAnggaranRo) {
        triggerAlert(
          `Peringatan SBK: Penambahan anggaran sebesar Rp ${formatRupiah(subtotal)} akan melebihi batas maksimal anggaran RO (Rp ${formatRupiah(parentRo.maxAnggaranRo)}). Total anggaran RO saat ini: Rp ${formatRupiah(currentRoTotal)}.`
        );
      }
    }

    const akunRow: WorksheetRow = {
      id: `row-akun-${Date.now()}`,
      type: "akun",
      kode: wizardAkun,
      uraian: wizardAkunUraian,
      subUraian: "(KPPN.175-Jakarta VI)",
      jumlah: subtotal,
      sd: "A00",
      cO: false,
      cS: false,
      cU: false,
      cK: false,
      cD: false,
    };

    const detailRow: WorksheetRow = {
      id: `row-det-${Date.now() + 1}`,
      type: "detail",
      kode: "",
      uraian: `- ${wizardItemUraian}`,
      k1Nilai: wizardVol1,
      k1Sat: wizardSat1,
      k2Nilai: wizardVol2,
      k2Sat: wizardSat2,
      vol: volTotal,
      sat: `${wizardSat1} ${wizardSat2}`,
      harga: wizardHargaSatuan,
      jumlah: subtotal,
      parentAkunKode: wizardAkun,
      cO: false,
      cS: true,
      cU: false,
      cK: false,
      cD: false,
    };

    setWorksheetRows((prev) => {
      const targetId = targetSubkompRowId || selectedRowId;
      const targetIdx = prev.findIndex((r) => r.id === targetId);
      const next = [...prev];

      if (targetIdx >= 0) {
        const insertIdx = findInsertionIndexForSubtree(targetIdx, prev[targetIdx].type);
        next.splice(insertIdx, 0, akunRow, detailRow);
      } else {
        const lastSubkompIdx = prev.map((r) => r.type).lastIndexOf("subkomponen");
        if (lastSubkompIdx >= 0) {
          const insertIdx = findInsertionIndexForSubtree(lastSubkompIdx, "subkomponen");
          next.splice(insertIdx, 0, akunRow, detailRow);
        } else {
          next.push(akunRow, detailRow);
        }
      }
      return calculateHierarchyAmounts(next);
    });

    setSelectedRowId(detailRow.id);
    setModalMode(null);
    setWizardStep(1);
    setWizardItemUraian("");
    triggerAlert(`Berhasil menambahkan akun ${wizardAkun} & rincian belanja melalui panduan!`);
  }

  // ── HANDLER PANDUAN PENGISIAN 7 JENIS BELANJA (PANDUAN 2) ──────────────────

  // Helper untuk mendapatkan unit kerja aktif yang dinormalisasi ("BINCANG" | "PATIH" | "BIRU" | string)
  const currentUnitSingkatan = useMemo(() => {
    const raw = (ukSingkatan || activeUnit || "BINCANG").toUpperCase().trim();
    if (raw.includes("PATIH") || raw.includes("PUSDIKLAT")) return "PATIH";
    if (raw.includes("BIRU") || raw.includes("UMUM")) return "BIRU";
    if (raw.includes("BINCANG") || raw.includes("RENCANA") || raw.includes("KEUANGAN")) return "BINCANG";
    return raw;
  }, [ukSingkatan, activeUnit]);

  // Handler eksekusi Otomatisasi Komponen 001 dari template Excel
  function handleImportKomponen001() {
    const templateRows = currentUnitSingkatan === "PATIH"
      ? (templateRabGajiKantor as any).pusdiklatGaji
      : (templateRabGajiKantor as any).pusatGaji;

    if (!templateRows || templateRows.length === 0) {
      triggerAlert("Template Excel Gaji tidak ditemukan!");
      return;
    }

    const targetId = targetSubkompRowId || selectedRowId;
    let subkompIdx = worksheetRows.findIndex((r) => r.id === targetId);
    if (subkompIdx < 0) {
      subkompIdx = worksheetRows.map((r) => r.type).lastIndexOf("subkomponen");
    }

    const newRowsToInsert: WorksheetRow[] = templateRows.map((row: any, idx: number) => ({
      id: `row-k001-${Date.now()}-${idx}`,
      type: row.type as WorksheetRowType,
      kode: row.kode || "",
      uraian: row.uraian,
      subUraian: row.subUraian || "",
      sd: row.sd || "A00",
      vol: row.vol,
      sat: row.sat,
      k1Nilai: row.k1Nilai,
      k1Sat: row.k1Sat,
      k2Nilai: row.k2Nilai,
      k2Sat: row.k2Sat,
      k3Nilai: row.k3Nilai,
      k3Sat: row.k3Sat,
      harga: row.harga,
      jumlah: row.jumlah,
      cO: false,
      cS: false,
      cU: false,
      cK: false,
      cD: false,
    }));

    setWorksheetRows((prev) => {
      const next = [...prev];
      if (subkompIdx >= 0) {
        const insertIdx = findInsertionIndexForSubtree(subkompIdx, "subkomponen");
        next.splice(insertIdx, 0, ...newRowsToInsert);
      } else {
        next.push(...newRowsToInsert);
      }
      return calculateHierarchyAmounts(next);
    });

    triggerAlert(
      `Berhasil mengisi otomatis Komponen 001 Gaji dan Tunjangan (${newRowsToInsert.length} baris) sesuai file ${
        currentUnitSingkatan === "PATIH" ? "Pusdiklat_RAB Gaji.xlsx" : "Pusat_RAB Gaji.xlsx"
      }!`
    );
  }

  // Handler eksekusi Otomatisasi Komponen 002 dari template Excel
  function handleImportKomponen002() {
    const templateRows = currentUnitSingkatan === "PATIH"
      ? (templateRabGajiKantor as any).pusdiklatKantor
      : (templateRabGajiKantor as any).pusatKantor;

    if (!templateRows || templateRows.length === 0) {
      triggerAlert("Template Excel Operasional Kantor tidak ditemukan!");
      return;
    }

    const targetId = targetSubkompRowId || selectedRowId;
    let subkompIdx = worksheetRows.findIndex((r) => r.id === targetId);
    if (subkompIdx < 0) {
      subkompIdx = worksheetRows.map((r) => r.type).lastIndexOf("subkomponen");
    }

    const newRowsToInsert: WorksheetRow[] = templateRows.map((row: any, idx: number) => ({
      id: `row-k002-${Date.now()}-${idx}`,
      type: row.type as WorksheetRowType,
      kode: row.kode || "",
      uraian: row.uraian,
      subUraian: row.subUraian || "",
      sd: row.sd || "A00",
      vol: row.vol,
      sat: row.sat,
      k1Nilai: row.k1Nilai,
      k1Sat: row.k1Sat,
      k2Nilai: row.k2Nilai,
      k2Sat: row.k2Sat,
      k3Nilai: row.k3Nilai,
      k3Sat: row.k3Sat,
      harga: row.harga,
      jumlah: row.jumlah,
      cO: false,
      cS: false,
      cU: false,
      cK: false,
      cD: false,
    }));

    setWorksheetRows((prev) => {
      const next = [...prev];
      if (subkompIdx >= 0) {
        const insertIdx = findInsertionIndexForSubtree(subkompIdx, "subkomponen");
        next.splice(insertIdx, 0, ...newRowsToInsert);
      } else {
        next.push(...newRowsToInsert);
      }
      return calculateHierarchyAmounts(next);
    });

    triggerAlert(
      `Berhasil mengisi otomatis Komponen 002 Operasional Kantor (${newRowsToInsert.length} baris) sesuai file ${
        currentUnitSingkatan === "PATIH" ? "Pusdiklat_RAB kantor.xlsx" : "Pusat_RAB kantor.xlsx"
      }!`
    );
  }

  // Handler Simpan Pengadaan Jasa (Konsultan 522131, Profesi 522151, Lainnya 522191)
  function handleSavePengadaanJasa() {
    const targetId = targetSubkompRowId || selectedRowId;
    let subkompIdx = worksheetRows.findIndex((r) => r.id === targetId);
    if (subkompIdx < 0) {
      subkompIdx = worksheetRows.map((r) => r.type).lastIndexOf("subkomponen");
    }
    if (subkompIdx < 0) {
      triggerAlert("Silakan pilih Sub Komponen terlebih dahulu!");
      return;
    }

    const subkompRow = worksheetRows[subkompIdx];
    const newRowsToInsert: WorksheetRow[] = [];

    if (jasaSubPilihan === "konsultan") {
      // Kode Akun 522131 Belanja Jasa Konsultan
      const harga = jasaKonsultanBiaya;
      const total = harga; // 1 paket * 1 keg = 1 paket
      newRowsToInsert.push({
        id: `row-akun-522131-${Date.now()}`,
        type: "akun",
        kode: "522131",
        uraian: "Belanja Jasa Konsultan",
        subUraian: "(KPPN.175-Jakarta VI)",
        sd: "A00",
        jumlah: total,
        parentSubkompKode: subkompRow.kode,
        cO: false, cS: false, cU: false, cK: false, cD: false,
      });
      newRowsToInsert.push({
        id: `row-detail-522131-${Date.now()}`,
        type: "detail",
        kode: "",
        uraian: "Jasa Konsultan",
        parentAkunKode: "522131",
        k1Nilai: 1,
        k1Sat: "paket",
        k2Nilai: 1,
        k2Sat: "keg",
        vol: 1,
        sat: "paket",
        harga: harga,
        jumlah: total,
        cO: false, cS: false, cU: false, cK: false, cD: false,
      });
    } else if (jasaSubPilihan === "profesi") {
      // Kode Akun 522151 Belanja Jasa Profesi
      const totalVol = (jasaProfesiJumlahOrg || 1) * (jasaProfesiJumlahKeg || 1);
      const total = totalVol * jasaProfesiTarif;
      const satTotal = jasaProfesiKategori === "narasumber" ? "OJ" : "OK";

      newRowsToInsert.push({
        id: `row-akun-522151-${Date.now()}`,
        type: "akun",
        kode: "522151",
        uraian: "Belanja Jasa Profesi",
        subUraian: "(KPPN.175-Jakarta VI)",
        sd: "A00",
        jumlah: total,
        parentSubkompKode: subkompRow.kode,
        cO: false, cS: false, cU: false, cK: false, cD: false,
      });
      newRowsToInsert.push({
        id: `row-detail-522151-${Date.now()}`,
        type: "detail",
        kode: "",
        uraian: jasaProfesiItem,
        parentAkunKode: "522151",
        k1Nilai: jasaProfesiJumlahOrg,
        k1Sat: "orang",
        k2Nilai: jasaProfesiJumlahKeg,
        k2Sat: "keg",
        vol: totalVol,
        sat: satTotal,
        harga: jasaProfesiTarif,
        jumlah: total,
        cO: false, cS: false, cU: false, cK: false, cD: false,
      });
    } else {
      // Kode Akun 522191 Belanja Jasa Lainnya
      const totalVol = (jasaLainnyaVol1 || 1) * (jasaLainnyaVol2 || 1);
      const total = totalVol * jasaLainnyaHarga;

      newRowsToInsert.push({
        id: `row-akun-522191-${Date.now()}`,
        type: "akun",
        kode: "522191",
        uraian: "Belanja Jasa Lainnya",
        subUraian: "(KPPN.175-Jakarta VI)",
        sd: "A00",
        jumlah: total,
        parentSubkompKode: subkompRow.kode,
        cO: false, cS: false, cU: false, cK: false, cD: false,
      });
      newRowsToInsert.push({
        id: `row-detail-522191-${Date.now()}`,
        type: "detail",
        kode: "",
        uraian: jasaLainnyaUraian,
        parentAkunKode: "522191",
        k1Nilai: jasaLainnyaVol1,
        k1Sat: "paket",
        k2Nilai: jasaLainnyaVol2,
        k2Sat: "keg",
        vol: totalVol,
        sat: "paket",
        harga: jasaLainnyaHarga,
        jumlah: total,
        cO: false, cS: false, cU: false, cK: false, cD: false,
      });
    }

    setWorksheetRows((prev) => {
      const next = [...prev];
      const insertIdx = findInsertionIndexForSubtree(subkompIdx, "subkomponen");
      next.splice(insertIdx, 0, ...newRowsToInsert);
      return calculateHierarchyAmounts(next);
    });

    triggerAlert(`Berhasil menambahkan baris Pengadaan Jasa ke kertas kerja!`);
  }

  // ══════════════════════════════════════════════════════════════════════
  // HANDLER: SIMPAN PERJALANAN DINAS DOMESTIK (PANDUAN 3)
  // ══════════════════════════════════════════════════════════════════════
  function handleSavePerjadinDomestik(): boolean {
    if (perjadinJenisPilihan.length === 0) {
      triggerAlert("Silakan pilih minimal satu jenis perjalanan dinas (Transport Lokal atau Perjalanan Dinas Biasa)!");
      return false;
    }

    const targetId = targetSubkompRowId || selectedRowId;
    let subkompIdx = worksheetRows.findIndex((r) => r.id === targetId);
    if (subkompIdx < 0) {
      subkompIdx = worksheetRows.map((r) => r.type).lastIndexOf("subkomponen");
    }
    if (subkompIdx < 0) {
      triggerAlert("Silakan pilih Sub Komponen terlebih dahulu!");
      return false;
    }

    const subkompRow = worksheetRows[subkompIdx];

    // Deteksi apakah Akun 524113 atau 524111 sudah ada di bawah Sub Komponen ini
    let existingAkun524113Idx = -1;
    let existingAkun524111Idx = -1;
    for (let i = subkompIdx + 1; i < worksheetRows.length; i++) {
      const t = worksheetRows[i].type;
      if (["program", "kegiatan", "kro", "ro", "komponen", "subkomponen"].includes(t)) {
        break;
      }
      if (t === "akun") {
        if (worksheetRows[i].kode === "524113") existingAkun524113Idx = i;
        if (worksheetRows[i].kode === "524111") existingAkun524111Idx = i;
      }
    }

    // Validasi duplikasi internal pada perjadinBiasaLokasiList sebelum proses simpan
    if (perjadinJenisPilihan.includes("biasa")) {
      const seenLoc = new Set<string>();
      for (const lok of perjadinBiasaLokasiList) {
        const cleanProv = formatDisplayProv(lok.provinsi);
        const cleanKota = formatDisplayKota(lok.kabKota);
        const key = `${cleanProv}__${cleanKota}`;
        if (seenLoc.has(key)) {
          triggerAlert(`Terdapat lokasi tujuan ganda untuk ${cleanKota} di Provinsi ${cleanProv}! Harap pilih kota yang berbeda.`);
          return false;
        }
        seenLoc.add(key);
      }
    }

    let nextRows = [...worksheetRows];

    // 1. OPSI: TRANSPORT LOKAL -> AKUN 524113 Belanja Perjalanan Dinas Dalam Kota
    if (perjadinJenisPilihan.includes("lokal")) {
      const vol1 = Math.max(1, perjadinLokalOrg);
      const vol2 = Math.max(1, perjadinLokalKeg);
      const totalVol = vol1 * vol2;
      const harga = 170000;
      const total = totalVol * harga;

      const detailRow: WorksheetRow = {
        id: `row-detail-524113-${Date.now()}`,
        type: "detail",
        kode: "",
        uraian: "Transport Lokal",
        parentAkunKode: "524113",
        k1Nilai: vol1,
        k1Sat: "orang",
        k2Nilai: vol2,
        k2Sat: "Keg",
        vol: totalVol,
        sat: "OK",
        harga: harga,
        jumlah: total,
        cO: false, cS: false, cU: false, cK: false, cD: false,
      };

      // Periksa posisi akun 524113 di bawah subkomponen
      const cur524113Idx = nextRows.findIndex(
        (r, idx) => idx > subkompIdx && r.type === "akun" && r.kode === "524113"
      );

      if (cur524113Idx >= 0) {
        // Akun 524113 sudah ada: sisipkan baris detail di bawah akun yang ada
        const insertIdx = findInsertionIndexForSubtree(cur524113Idx, "akun");
        nextRows.splice(insertIdx, 0, detailRow);
      } else {
        // Belum ada akun 524113: buat baris akun dan detail di bawah Sub Komponen
        const akunRow: WorksheetRow = {
          id: `row-akun-524113-${Date.now()}`,
          type: "akun",
          kode: "524113",
          uraian: "Belanja Perjalanan Dinas Dalam Kota",
          subUraian: "(KPPN.175-Jakarta VI)",
          sd: "A00",
          jumlah: total,
          parentSubkompKode: subkompRow.kode,
          cO: false, cS: false, cU: false, cK: false, cD: false,
        };
        const insertIdx = findInsertionIndexForSubtree(subkompIdx, "subkomponen");
        nextRows.splice(insertIdx, 0, akunRow, detailRow);
      }
    }

    // 2. OPSI: PERJALANAN DINAS BIASA -> AKUN 524111 Belanja Perjalanan Dinas Biasa
    if (perjadinJenisPilihan.includes("biasa") && perjadinBiasaLokasiList.length > 0) {
      // Cari posisi Akun 524111 di bawah subkomponen
      let cur524111Idx = nextRows.findIndex(
        (r, idx) => idx > subkompIdx && r.type === "akun" && r.kode === "524111"
      );

      // Kumpulkan Header 1 yang sudah ada di bawah Akun 524111
      const existingH1Map = new Map<string, { h1Idx: number; h1Num: number; row: WorksheetRow }>();
      let maxH1Num = 0;

      if (cur524111Idx >= 0) {
        for (let i = cur524111Idx + 1; i < nextRows.length; i++) {
          const row = nextRows[i];
          if (["program", "kegiatan", "kro", "ro", "komponen", "subkomponen", "akun"].includes(row.type)) break;
          if (row.type === "header1") {
            const cleanName = cleanHeaderUraian(row.uraian);
            const numMatch = row.uraian.match(/^(\d+)\./);
            const h1Num = numMatch ? parseInt(numMatch[1], 10) : existingH1Map.size + 1;
            if (h1Num > maxH1Num) maxH1Num = h1Num;
            existingH1Map.set(cleanName, { h1Idx: i, h1Num, row });
          }
        }
      }

      // Validasi apakah ada Header 2 yang sudah terdaftar sebelumnya di worksheet
      if (cur524111Idx >= 0) {
        for (const lok of perjadinBiasaLokasiList) {
          const cleanProv = formatDisplayProv(lok.provinsi);
          const cleanKota = formatDisplayKota(lok.kabKota);
          if (existingH1Map.has(cleanProv)) {
            const h1Info = existingH1Map.get(cleanProv)!;
            // Cek apakah Header 2 dengan kota ini sudah ada di bawah Header 1 tersebut
            for (let i = h1Info.h1Idx + 1; i < nextRows.length; i++) {
              const row = nextRows[i];
              if (["program", "kegiatan", "kro", "ro", "komponen", "subkomponen", "akun", "header1"].includes(row.type)) break;
              if (row.type === "header2") {
                if (cleanHeaderUraian(row.uraian) === cleanKota) {
                  triggerAlert(`Header 2 '${cleanKota}' sudah ada di bawah Provinsi ${cleanProv} pada Akun 524111! Tidak boleh ada duplikasi.`);
                  return false;
                }
              }
            }
          }
        }
      }

      // Buat baris akun 524111 jika belum ada
      if (cur524111Idx < 0) {
        const akun524111Row: WorksheetRow = {
          id: `row-akun-524111-${Date.now()}`,
          type: "akun",
          kode: "524111",
          uraian: "Belanja Perjalanan Dinas Biasa",
          subUraian: "(KPPN.175-Jakarta VI)",
          sd: "A00",
          jumlah: 0,
          parentSubkompKode: subkompRow.kode,
          cO: false, cS: false, cU: false, cK: false, cD: false,
        };
        const insertIdx = findInsertionIndexForSubtree(subkompIdx, "subkomponen");
        nextRows.splice(insertIdx, 0, akun524111Row);
        cur524111Idx = insertIdx;
      }

      // Bangun Header 1, Header 2, dan detail per lokasi tujuan
      let currentH1Counter = maxH1Num;
      const provAssignedMap = new Map<string, number>();

      perjadinBiasaLokasiList.forEach((lok, lokIdx) => {
        const cleanProv = formatDisplayProv(lok.provinsi);
        const cleanKota = formatDisplayKota(lok.kabKota);
        const tarif = getTarifPerjadinBiasa(lok.provinsi, lok.kabKota);

        let h1Num: number;
        let isExistingH1 = false;
        let h1InsertIdx = -1;

        if (existingH1Map.has(cleanProv)) {
          h1Num = existingH1Map.get(cleanProv)!.h1Num;
          isExistingH1 = true;
          h1InsertIdx = existingH1Map.get(cleanProv)!.h1Idx;
        } else if (provAssignedMap.has(cleanProv)) {
          h1Num = provAssignedMap.get(cleanProv)!;
          isExistingH1 = true;
        } else {
          currentH1Counter++;
          h1Num = currentH1Counter;
          provAssignedMap.set(cleanProv, h1Num);
        }

        const letter = "a";
        const header1Uraian = `${h1Num}. ${cleanProv}`;
        const header2Uraian = `${h1Num}${letter}. ${cleanKota}`;

        const header1Id = `row-hdr1-perjadin-${Date.now()}-${lokIdx}`;
        const header2Id = `row-hdr2-perjadin-${Date.now()}-${lokIdx}`;

        let totalHeader2 = 0;
        const detailsForLokasi: WorksheetRow[] = [];

        const addDetail = (
          detLetter: string,
          label: string,
          v1: number,
          s1: string,
          v2: number,
          s2: string,
          v3: number | undefined,
          s3: string | undefined,
          satTotal: string,
          hargaSat: number
        ) => {
          if (v1 <= 0 || v2 <= 0 || (v3 !== undefined && v3 <= 0)) return;
          const totalVol = v1 * v2 * (v3 !== undefined ? v3 : 1);
          const rawTotal = totalVol * hargaSat;
          const roundedTotal = Math.floor(rawTotal / 1000) * 1000;
          totalHeader2 += roundedTotal;

          detailsForLokasi.push({
            id: `row-detail-perjadin-${Date.now()}-${lokIdx}-${detLetter}`,
            type: "detail",
            kode: "",
            uraian: `${h1Num}${detLetter}. ${label}`,
            parentAkunKode: "524111",
            k1Nilai: v1,
            k1Sat: s1,
            k2Nilai: v2,
            k2Sat: s2,
            k3Nilai: v3,
            k3Sat: s3,
            vol: totalVol,
            sat: satTotal,
            harga: hargaSat,
            jumlah: roundedTotal,
            cO: false, cS: false, cU: false, cK: false, cD: false,
          });
        };

        // 1a. Tiket Pesawat Eselon I
        addDetail("a", "Tiket Pesawat (PP) Eselon I", lok.tiket1aOrg, "orang", lok.tiket1aKeg, "Keg", undefined, undefined, "OK", tarif.tiketBisnis);
        // 1b. Tiket Pesawat Eselon II ke Bawah
        addDetail("b", "Tiket Pesawat (PP) Eselon II ke Bawah", lok.tiket1bOrg, "orang", lok.tiket1bKeg, "Keg", undefined, undefined, "OK", tarif.tiketEkonomi);
        // 1c. Taksi Jakarta
        addDetail("c", "Taksi Jakarta", lok.taksi1cOrg, "orang", lok.taksi1cKali, "kali", lok.taksi1cKeg, "Keg", "OK", tarif.taksiJakarta);
        // 1d. Taksi Lokasi Tujuan
        addDetail("d", `Taksi (${cleanProv || "Lokasi Tujuan"})`, lok.taksi1dOrg, "orang", lok.taksi1dKali, "kali", lok.taksi1dKeg, "Keg", "OK", tarif.taksiTujuan);
        // 1e. Penginapan Eselon I
        addDetail("e", "Penginapan Eselon I", lok.inap1eOrg, "orang", lok.inap1eHari, "hari", lok.inap1eKeg, "Keg", "OH", tarif.penginapanEselonI);
        // 1f. Penginapan Eselon II
        addDetail("f", "Penginapan Eselon II", lok.inap1fOrg, "orang", lok.inap1fHari, "hari", lok.inap1fKeg, "Keg", "OH", tarif.penginapanEselonII);
        // 1g. Penginapan Eselon III
        addDetail("g", "Penginapan Eselon III", lok.inap1gOrg, "orang", lok.inap1gHari, "hari", lok.inap1gKeg, "Keg", "OH", tarif.penginapanEselonIII);
        // 1h. Penginapan Gol. III ke bawah
        addDetail("h", "Penginapan Gol. III ke bawah", lok.inap1hOrg, "orang", lok.inap1hHari, "hari", lok.inap1hKeg, "Keg", "OH", tarif.penginapanGolIII);
        // 1i. Uang Harian
        addDetail("i", "Uang Harian", lok.uang1iOrg, "orang", lok.uang1iHari, "hari", lok.uang1iKeg, "Keg", "OH", tarif.uangHarian);
        // 1j. Uang Representasi Eselon I
        addDetail("j", "Uang Representasi Eselon I", lok.rep1jOrg, "orang", lok.rep1jHari, "hari", lok.rep1jKeg, "Keg", "OH", tarif.uangRepresentasiEselonI);
        // 1k. Uang Representasi Eselon II
        addDetail("k", "Uang Representasi Eselon II", lok.rep1kOrg, "orang", lok.rep1kHari, "hari", lok.rep1kKeg, "Keg", "OH", tarif.uangRepresentasiEselonII);

        const rowsForThisLok: WorksheetRow[] = [];
        if (!isExistingH1) {
          rowsForThisLok.push({
            id: header1Id,
            type: "header1",
            kode: "",
            uraian: header1Uraian,
            parentAkunKode: "524111",
            jumlah: totalHeader2,
            cO: false, cS: false, cU: false, cK: false, cD: false,
          });
        }
        rowsForThisLok.push({
          id: header2Id,
          type: "header2",
          kode: "",
          uraian: header2Uraian,
          parentAkunKode: "524111",
          jumlah: totalHeader2,
          cO: false, cS: false, cU: false, cK: false, cD: false,
        });
        rowsForThisLok.push(...detailsForLokasi);

        // Sisipkan ke dalam nextRows di posisi yang tepat
        if (isExistingH1 && h1InsertIdx >= 0) {
          const insertPos = findInsertionIndexForSubtree(h1InsertIdx, "header1");
          nextRows.splice(insertPos, 0, ...rowsForThisLok);
        } else {
          const aIdx = nextRows.findIndex((r) => r.type === "akun" && r.kode === "524111");
          const insertPos = aIdx >= 0 ? findInsertionIndexForSubtree(aIdx, "akun") : nextRows.length;
          nextRows.splice(insertPos, 0, ...rowsForThisLok);
        }
      });
    }

    setWorksheetRows(calculateHierarchyAmounts(nextRows));
    triggerAlert("Berhasil menyusun dan menyimpan rincian Perjalanan Dinas Domestik ke kertas kerja!");
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EKSEKUSI SIMPAN PERJALANAN DINAS LUAR NEGERI (AKUN 524211)
  // ─────────────────────────────────────────────────────────────────────────
  function handleSavePerjadinLN(): boolean {
    if (perjadinLNDestinasiList.length === 0) {
      triggerAlert("Silakan pilih minimal satu negara/kota tujuan luar negeri!");
      return false;
    }

    const timeStamp = Date.now();
    let nextRows = [...worksheetRows];

    // Pastikan Akun 524211 ada
    let akunIdx = nextRows.findIndex((r) => r.type === "akun" && r.kode === "524211");
    if (akunIdx === -1) {
      let insertAkunIdx = nextRows.length;
      const subkompIdx = nextRows.findIndex((r) => r.type === "subkomponen" || r.id === targetSubkompRowId);
      if (subkompIdx >= 0) {
        insertAkunIdx = findInsertionIndexForSubtree(subkompIdx, "subkomponen");
      } else {
        const kompIdx = nextRows.findIndex((r) => r.type === "komponen");
        if (kompIdx >= 0) {
          insertAkunIdx = findInsertionIndexForSubtree(kompIdx, "komponen");
        }
      }

      const newAkun: WorksheetRow = {
        id: `row-akun-524211-${timeStamp}`,
        type: "akun",
        kode: "524211",
        uraian: "Belanja Perjalanan Dinas Biasa - Luar Negeri",
        jumlah: 0,
        cO: false, cS: false, cU: false, cK: false, cD: false,
      };
      nextRows.splice(insertAkunIdx, 0, newAkun);
      akunIdx = insertAkunIdx;
    }

    // Kelompokkan setiap destinasi berdasarkan judulKegiatan masing-masing
    // Karena setiap negara/destinasi dapat memiliki nama kegiatan berbeda
    const groups: Array<{ judul: string; dests: typeof perjadinLNDestinasiList }> = [];
    perjadinLNDestinasiList.forEach((dest) => {
      const judul = (dest.judulKegiatan || perjadinLNJudulKegiatan || "Sidang / Pertemuan Tingkat Internasional").trim();
      const existingGrp = groups.find((g) => cleanHeaderUraian(g.judul) === cleanHeaderUraian(judul));
      if (existingGrp) {
        existingGrp.dests.push(dest);
      } else {
        groups.push({ judul, dests: [dest] });
      }
    });

    // Ambil daftar Header 1 yang sudah ada di bawah akun 524211
    const existingH1s = nextRows.filter((r) => r.type === "header1" && r.parentAkunKode === "524211");
    let nextH1Num = existingH1s.length + 1;

    groups.forEach((grp, grpIdx) => {
      const cleanGrpJudul = cleanHeaderUraian(grp.judul);
      const existingMatch = nextRows.find(
        (r) => r.type === "header1" && r.parentAkunKode === "524211" && cleanHeaderUraian(r.uraian) === cleanGrpJudul
      );

      const isExistingH1 = !!existingMatch;
      let targetH1Uraian = grp.judul;
      if (isExistingH1 && existingMatch) {
        targetH1Uraian = existingMatch.uraian;
      } else {
        targetH1Uraian = `${nextH1Num}. ${cleanHeaderUraian(grp.judul)}`;
        nextH1Num++;
      }

      const header1Id = existingMatch ? existingMatch.id : `h1-ln-${grpIdx}-${timeStamp}`;
      const rowsToAddForGrp: WorksheetRow[] = [];

      if (!isExistingH1) {
        rowsToAddForGrp.push({
          id: header1Id,
          type: "header1",
          kode: "",
          uraian: targetH1Uraian,
          parentAkunKode: "524211",
          jumlah: 0,
          cO: false, cS: false, cU: false, cK: false, cD: false,
        });
      }

      grp.dests.forEach((dest, dIdx) => {
        const numPrefix = `${dIdx + 1}`;
        const header2Uraian = dest.labelHeader2 || `${dest.benua}-${dest.negara} - ${dest.kota}`;
        const header2Id = `h2-ln-${grpIdx}-${dIdx}-${timeStamp}`;
        const tarif = getTarifPerjadinLN(dest.destinasiKey || dest.kota, KURS_USD_ASUMSI_MAKRO);

        const detailsForDest: WorksheetRow[] = [];
        let totalHeader2 = 0;

        const addDetailLN = (
          subLetter: string,
          uraianNama: string,
          vOrg: number,
          vSat1: string,
          vHariOrKali: number,
          vSat2: string,
          vKeg: number,
          vSat3: string,
          finalSat: string,
          biayaSatuan: number
        ) => {
          const totalVol = (vOrg || 0) * (vHariOrKali || 0) * (vKeg || 0);
          const rawSubTotal = totalVol * (biayaSatuan || 0);
          const subTotal = Math.floor(rawSubTotal / 1000) * 1000;
          if (subTotal <= 0 && vOrg <= 0) return;

          totalHeader2 += subTotal;
          detailsForDest.push({
            id: `det-ln-${grpIdx}-${dIdx}-${subLetter}-${timeStamp}`,
            type: "detail",
            kode: "",
            uraian: `${numPrefix}${subLetter}. ${uraianNama}`,
            parentAkunKode: "524211",
            k1Nilai: vOrg > 0 ? vOrg : undefined,
            k1Sat: vOrg > 0 ? vSat1 : undefined,
            k2Nilai: vHariOrKali > 0 ? vHariOrKali : undefined,
            k2Sat: vHariOrKali > 0 ? vSat2 : undefined,
            k3Nilai: vKeg > 0 ? vKeg : undefined,
            k3Sat: vKeg > 0 ? vSat3 : undefined,
            vol: totalVol > 0 ? totalVol : undefined,
            sat: finalSat,
            harga: biayaSatuan,
            jumlah: subTotal,
            cO: false, cS: false, cU: false, cK: false, cD: false,
          });
        };

        // 1a s.d 1d: Tiket Pesawat
        addDetailLN("a", "Tiket Pesawat (PP) Eselon I", dest.tiket1aOrg, "orang", 1, "kali", dest.tiket1aKeg, "Keg", "OK", tarif.tiketBisnisIDR);
        addDetailLN("b", "Tiket Pesawat (PP) Eselon II", dest.tiket1bOrg, "orang", 1, "kali", dest.tiket1bKeg, "Keg", "OK", tarif.tiketBisnisIDR);
        addDetailLN("c", "Tiket Pesawat (PP) Eselon III ke bawah", dest.tiket1cOrg, "orang", 1, "kali", dest.tiket1cKeg, "Keg", "OK", tarif.tiketEkonomiIDR);
        addDetailLN("d", "Tiket Pesawat (PP) Golongan III ke bawah", dest.tiket1dOrg, "orang", 1, "kali", dest.tiket1dKeg, "Keg", "OK", tarif.tiketEkonomiIDR);
        // 1e: Taksi Jakarta
        addDetailLN("e", "Taksi Jakarta", dest.taksi1eOrg, "orang", dest.taksi1eKali, "kali", dest.taksi1eKeg, "Keg", "OK", tarif.taksiJakarta);
        // 1f s.d 1i: Uang Harian Gol A - D
        addDetailLN("f", "Uang Harian Gol A", dest.uang1fOrg, "orang", dest.uang1fHari, "hari", dest.uang1fKeg, "Keg", "OH", tarif.uangHarianGolA_IDR);
        addDetailLN("g", "Uang Harian Gol B", dest.uang1gOrg, "orang", dest.uang1gHari, "hari", dest.uang1gKeg, "Keg", "OH", tarif.uangHarianGolB_IDR);
        addDetailLN("h", "Uang Harian Gol C", dest.uang1hOrg, "orang", dest.uang1hHari, "hari", dest.uang1hKeg, "Keg", "OH", tarif.uangHarianGolC_IDR);
        addDetailLN("i", "Uang Harian Gol D", dest.uang1iOrg, "orang", dest.uang1iHari, "hari", dest.uang1iKeg, "Keg", "OH", tarif.uangHarianGolD_IDR);
        // 1j s.d 1m: Uang Harian Perjalanan Gol A - D (30%)
        addDetailLN("j", "Uang Harian Perjalanan Gol A", dest.perj1jOrg, "orang", dest.perj1jHari, "hari", dest.perj1jKeg, "Keg", "OH", tarif.uangHarianPerjadinGolA_IDR);
        addDetailLN("k", "Uang Harian Perjalanan Gol B", dest.perj1kOrg, "orang", dest.perj1kHari, "hari", dest.perj1kKeg, "Keg", "OH", tarif.uangHarianPerjadinGolB_IDR);
        addDetailLN("l", "Uang Harian Perjalanan Gol C", dest.perj1lOrg, "orang", dest.perj1lHari, "hari", dest.perj1lKeg, "Keg", "OH", tarif.uangHarianPerjadinGolC_IDR);
        addDetailLN("m", "Uang Harian Perjalanan Gol D", dest.perj1mOrg, "orang", dest.perj1mHari, "hari", dest.perj1mKeg, "Keg", "OH", tarif.uangHarianPerjadinGolD_IDR);

        rowsToAddForGrp.push({
          id: header2Id,
          type: "header2",
          kode: "",
          uraian: header2Uraian,
          parentAkunKode: "524211",
          jumlah: totalHeader2,
          cO: false, cS: false, cU: false, cK: false, cD: false,
        });
        rowsToAddForGrp.push(...detailsForDest);
      });

      // Sisipkan ke worksheetRows
      if (isExistingH1 && existingMatch) {
        const h1Idx = nextRows.findIndex((r) => r.id === existingMatch.id);
        const insertPos = findInsertionIndexForSubtree(h1Idx, "header1");
        nextRows.splice(insertPos, 0, ...rowsToAddForGrp);
      } else {
        const aIdx = nextRows.findIndex((r) => r.type === "akun" && r.kode === "524211");
        const insertPos = aIdx >= 0 ? findInsertionIndexForSubtree(aIdx, "akun") : nextRows.length;
        nextRows.splice(insertPos, 0, ...rowsToAddForGrp);
      }
    });

    setWorksheetRows(calculateHierarchyAmounts(nextRows));
    triggerAlert("Berhasil menyusun dan menyimpan rincian Perjalanan Dinas Luar Negeri ke kertas kerja!");
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EKSEKUSI SIMPAN PENYELENGGARAAN KONSINYERING (524114 & 524119)
  // ─────────────────────────────────────────────────────────────────────────
  function handleSaveKonsinyering(): boolean {
    if (konsinyeringJenisPilihan.length === 0) {
      triggerAlert("Silakan pilih minimal satu jenis konsinyering (Dalam Kota atau Luar Kota)!");
      return false;
    }

    const timeStamp = Date.now();
    let nextRows = [...worksheetRows];

    // 1. KONSINYERING DALAM KOTA (AKUN 524114) JIKA DIPILIH
    if (konsinyeringJenisPilihan.includes("dalam_kota")) {
      let akunIdx = nextRows.findIndex((r) => r.type === "akun" && r.kode === "524114");
      if (akunIdx === -1) {
        let insertAkunIdx = nextRows.length;
        const subkompIdx = nextRows.findIndex((r) => r.type === "subkomponen" || r.id === targetSubkompRowId);
        if (subkompIdx >= 0) {
          insertAkunIdx = findInsertionIndexForSubtree(subkompIdx, "subkomponen");
        } else {
          const kompIdx = nextRows.findIndex((r) => r.type === "komponen");
          if (kompIdx >= 0) insertAkunIdx = findInsertionIndexForSubtree(kompIdx, "komponen");
        }

        const newAkun: WorksheetRow = {
          id: `row-akun-524114-${timeStamp}`,
          type: "akun",
          kode: "524114",
          uraian: "Belanja Perjalanan Dinas Paket Meeting Dalam Kota",
          jumlah: 0,
          cO: false, cS: false, cU: false, cK: false, cD: false,
        };
        nextRows.splice(insertAkunIdx, 0, newAkun);
        akunIdx = insertAkunIdx;
      }

      const tarif = getTarifKonsinyeringDalamKota();

      // Kelompokkan setiap kegiatan Dalam Kota berdasarkan namaKegiatan masing-masing
      const groupsDK: Array<{ judul: string; items: typeof konsinyeringDKKegiatanList }> = [];
      konsinyeringDKKegiatanList.forEach((item) => {
        const judul = (item.namaKegiatan || "Konsinyering Penyusunan Rencana Kerja dan Anggaran").trim();
        const existingGrp = groupsDK.find((g) => cleanHeaderUraian(g.judul) === cleanHeaderUraian(judul));
        if (existingGrp) {
          existingGrp.items.push(item);
        } else {
          groupsDK.push({ judul, items: [item] });
        }
      });

      // Ambil existing Header 1 di bawah akun 524114 untuk penomoran berurutan
      const existingH1sDK = nextRows.filter((r) => r.type === "header1" && r.parentAkunKode === "524114");
      let nextH1NumDK = existingH1sDK.length + 1;

      groupsDK.forEach((grp, grpIdx) => {
        const cleanGrpJudul = cleanHeaderUraian(grp.judul);
        const existingMatchDK = nextRows.find(
          (r) => r.type === "header1" && r.parentAkunKode === "524114" && cleanHeaderUraian(r.uraian) === cleanGrpJudul
        );

        const isExistingH1 = !!existingMatchDK;
        let targetH1UraianDK = grp.judul;
        if (isExistingH1 && existingMatchDK) {
          targetH1UraianDK = existingMatchDK.uraian;
        } else {
          targetH1UraianDK = `${nextH1NumDK}. ${cleanGrpJudul}`;
          nextH1NumDK++;
        }

        const header1Id = existingMatchDK ? existingMatchDK.id : `h1-kdk-${grpIdx}-${timeStamp}`;
        const rowsToAddDK: WorksheetRow[] = [];

        if (!isExistingH1) {
          rowsToAddDK.push({
            id: header1Id,
            type: "header1",
            kode: "",
            uraian: targetH1UraianDK,
            parentAkunKode: "524114",
            jumlah: 0,
            cO: false, cS: false, cU: false, cK: false, cD: false,
          });
        }

        grp.items.forEach((item, kIdx) => {
          const numPrefix = `${kIdx + 1}`;
          const header2Uraian = "JAKARTA";
          const header2Id = `h2-kdk-${grpIdx}-${kIdx}-${timeStamp}`;

          const details: WorksheetRow[] = [];
          let totalH2 = 0;

          const addDetailDK = (
            subLetter: string,
            nama: string,
            vOrg: number,
            vSat1: string,
            vHari: number,
            vSat2: string,
            vKeg: number,
            vSat3: string,
            satAkhir: string,
            harga: number
          ) => {
            const totalVol = (vOrg || 0) * (vHari || 0) * (vKeg || 0);
            const rawSubTotal = totalVol * (harga || 0);
            const subTotal = Math.floor(rawSubTotal / 1000) * 1000;
            if (subTotal <= 0 && vOrg <= 0) return;

            totalH2 += subTotal;
            details.push({
              id: `det-kdk-${grpIdx}-${kIdx}-${subLetter}-${timeStamp}`,
              type: "detail",
              kode: "",
              uraian: `${numPrefix}${subLetter}. ${nama}`,
              parentAkunKode: "524114",
              k1Nilai: vOrg > 0 ? vOrg : undefined,
              k1Sat: vOrg > 0 ? vSat1 : undefined,
              k2Nilai: vHari > 0 ? vHari : undefined,
              k2Sat: vHari > 0 ? vSat2 : undefined,
              k3Nilai: vKeg > 0 ? vKeg : undefined,
              k3Sat: vKeg > 0 ? vSat3 : undefined,
              vol: totalVol > 0 ? totalVol : undefined,
              sat: satAkhir,
              harga: harga,
              jumlah: subTotal,
              cO: false, cS: false, cU: false, cK: false, cD: false,
            });
          };

          addDetailDK("a", "Transport Lokal", item.trans1aOrg, "orang", 1, "kali", item.trans1aKeg, "Keg", "OK", tarif.transportLokal);
          addDetailDK("b", "Fullboard Meeting Menteri Setingkat Menteri dan Wakil Menteri", item.fb1bOrg, "orang", item.fb1bHari, "hari", item.fb1bKeg, "Keg", "OP", tarif.fullboardMenteri);
          addDetailDK("c", "Fullboard Meeting Eselon I dan II/Pejabat Fungsional Utama", item.fb1cOrg, "orang", item.fb1cHari, "hari", item.fb1cKeg, "Keg", "OP", tarif.fullboardEselonI_II);
          addDetailDK("d", "Fullboard Meeting Eselon III/Pejabat Fungsional Madya Ke Bawah", item.fb1dOrg, "orang", item.fb1dHari, "hari", item.fb1dKeg, "Keg", "OP", tarif.fullboardEselonIII);
          addDetailDK("e", "Fullday Meeting Menteri Setingkat Menteri dan Wakil Menteri", item.fd1eOrg, "orang", 1, "kali", item.fd1eKeg, "Keg", "OP", tarif.fulldayMenteri);
          addDetailDK("f", "Fullday Meeting Eselon I dan II/Pejabat Fungsional Utama", item.fd1fOrg, "orang", 1, "kali", item.fd1fKeg, "Keg", "OP", tarif.fulldayEselonI_II);
          addDetailDK("g", "Fullday Meeting Eselon III/Pejabat Fungsional Madya Ke Bawah", item.fd1gOrg, "orang", 1, "kali", item.fd1gKeg, "Keg", "OP", tarif.fulldayEselonIII);
          addDetailDK("h", "Uang Harian Fullboard Meeting", item.uh1hOrg, "orang", item.uh1hHari, "hari", item.uh1hKeg, "Keg", "OH", tarif.uangHarianFullboard);

          rowsToAddDK.push(
            {
              id: header2Id,
              type: "header2",
              kode: "",
              uraian: header2Uraian,
              parentAkunKode: "524114",
              jumlah: totalH2,
              cO: false, cS: false, cU: false, cK: false, cD: false,
            },
            ...details
          );
        });

        if (isExistingH1 && existingMatchDK) {
          const h1Idx = nextRows.findIndex((r) => r.id === existingMatchDK.id);
          const insertPos = findInsertionIndexForSubtree(h1Idx, "header1");
          nextRows.splice(insertPos, 0, ...rowsToAddDK);
        } else {
          const aIdx = nextRows.findIndex((r) => r.type === "akun" && r.kode === "524114");
          const insertPos = aIdx >= 0 ? findInsertionIndexForSubtree(aIdx, "akun") : nextRows.length;
          nextRows.splice(insertPos, 0, ...rowsToAddDK);
        }
      });
    }

    // 2. KONSINYERING LUAR KOTA (AKUN 524119) JIKA DIPILIH
    if (konsinyeringJenisPilihan.includes("luar_kota")) {
      let akunIdx = nextRows.findIndex((r) => r.type === "akun" && r.kode === "524119");
      if (akunIdx === -1) {
        let insertAkunIdx = nextRows.length;
        const subkompIdx = nextRows.findIndex((r) => r.type === "subkomponen" || r.id === targetSubkompRowId);
        if (subkompIdx >= 0) {
          insertAkunIdx = findInsertionIndexForSubtree(subkompIdx, "subkomponen");
        } else {
          const kompIdx = nextRows.findIndex((r) => r.type === "komponen");
          if (kompIdx >= 0) insertAkunIdx = findInsertionIndexForSubtree(kompIdx, "komponen");
        }

        const newAkun: WorksheetRow = {
          id: `row-akun-524119-${timeStamp}`,
          type: "akun",
          kode: "524119",
          uraian: "Belanja Perjalanan Dinas Paket Meeting Luar Kota",
          jumlah: 0,
          cO: false, cS: false, cU: false, cK: false, cD: false,
        };
        nextRows.splice(insertAkunIdx, 0, newAkun);
        akunIdx = insertAkunIdx;
      }

      // Kelompokkan setiap lokasi berdasarkan namaKegiatan masing-masing
      // Karena tiap provinsi, nama kegiatannya dapat berbeda
      const groupsLK: Array<{ judul: string; items: typeof konsinyeringLKProvinsiList }> = [];
      konsinyeringLKProvinsiList.forEach((item) => {
        const judul = (item.namaKegiatan || konsinyeringNamaKegiatan || "Konsinyering Penyusunan Rencana Kerja dan Anggaran").trim();
        const existingGrp = groupsLK.find((g) => cleanHeaderUraian(g.judul) === cleanHeaderUraian(judul));
        if (existingGrp) {
          existingGrp.items.push(item);
        } else {
          groupsLK.push({ judul, items: [item] });
        }
      });

      // Ambil existing Header 1 di bawah akun 524119 untuk penomoran berurutan
      const existingH1sLK = nextRows.filter((r) => r.type === "header1" && r.parentAkunKode === "524119");
      let nextH1NumLK = existingH1sLK.length + 1;

      groupsLK.forEach((grp, grpIdx) => {
        const cleanGrpJudul = cleanHeaderUraian(grp.judul);
        const existingMatchLK = nextRows.find(
          (r) => r.type === "header1" && r.parentAkunKode === "524119" && cleanHeaderUraian(r.uraian) === cleanGrpJudul
        );

        const isExistingH1 = !!existingMatchLK;
        let targetH1UraianLK = grp.judul;
        if (isExistingH1 && existingMatchLK) {
          targetH1UraianLK = existingMatchLK.uraian;
        } else {
          targetH1UraianLK = `${nextH1NumLK}. ${cleanGrpJudul}`;
          nextH1NumLK++;
        }

        const header1Id = existingMatchLK ? existingMatchLK.id : `h1-klk-${grpIdx}-${timeStamp}`;
        const rowsToAddLK: WorksheetRow[] = [];

        if (!isExistingH1) {
          rowsToAddLK.push({
            id: header1Id,
            type: "header1",
            kode: "",
            uraian: targetH1UraianLK,
            parentAkunKode: "524119",
            jumlah: 0,
            cO: false, cS: false, cU: false, cK: false, cD: false,
          });
        }

        grp.items.forEach((item, pIdx) => {
          const numPrefix = `${pIdx + 1}`;
          const cleanProv = formatDisplayProv(item.provinsi);
          const header2Uraian = cleanProv;
          const header2Id = `h2-klk-${grpIdx}-${pIdx}-${timeStamp}`;
          const tarif = getTarifKonsinyeringLuarKota(item.provinsi);

          const detailsForProv: WorksheetRow[] = [];
          let totalH2 = 0;

          const addDetailLK = (
            subLetter: string,
            nama: string,
            vOrg: number,
            vSat1: string,
            vHariOrKali: number,
            vSat2: string,
            vKeg: number,
            vSat3: string,
            satAkhir: string,
            harga: number
          ) => {
            const totalVol = (vOrg || 0) * (vHariOrKali || 0) * (vKeg || 0);
            const rawSubTotal = totalVol * (harga || 0);
            const subTotal = Math.floor(rawSubTotal / 1000) * 1000;
            if (subTotal <= 0 && vOrg <= 0) return;

            totalH2 += subTotal;
            detailsForProv.push({
              id: `det-klk-${grpIdx}-${pIdx}-${subLetter}-${timeStamp}`,
              type: "detail",
              kode: "",
              uraian: `${numPrefix}${subLetter}. ${nama}`,
              parentAkunKode: "524119",
              k1Nilai: vOrg > 0 ? vOrg : undefined,
              k1Sat: vOrg > 0 ? vSat1 : undefined,
              k2Nilai: vHariOrKali > 0 ? vHariOrKali : undefined,
              k2Sat: vHariOrKali > 0 ? vSat2 : undefined,
              k3Nilai: vKeg > 0 ? vKeg : undefined,
              k3Sat: vKeg > 0 ? vSat3 : undefined,
              vol: totalVol > 0 ? totalVol : undefined,
              sat: satAkhir,
              harga: harga,
              jumlah: subTotal,
              cO: false, cS: false, cU: false, cK: false, cD: false,
            });
          };

          addDetailLK("a", "Tiket Pesawat (PP) Eselon I", item.tiket1aOrg, "orang", 1, "kali", item.tiket1aKeg, "Keg", "OK", tarif.tiketBisnis);
          addDetailLK("b", "Tiket Pesawat (PP) Eselon II ke Bawah", item.tiket1bOrg, "orang", 1, "kali", item.tiket1bKeg, "Keg", "OK", tarif.tiketEkonomi);
          addDetailLK("c", "Taksi Jakarta", item.taksi1cOrg, "orang", item.taksi1cKali, "kali", item.taksi1cKeg, "Keg", "OK", tarif.taksiJakarta);
          addDetailLK("d", `Taksi (${cleanProv})`, item.taksi1dOrg, "orang", item.taksi1dKali, "kali", item.taksi1dKeg, "Keg", "OK", tarif.taksiTujuan);
          addDetailLK("e", "Penginapan Eselon I", item.inap1eOrg, "orang", item.inap1eHari, "hari", item.inap1eKeg, "Keg", "OH", tarif.penginapanEselonI);
          addDetailLK("f", "Penginapan Eselon II", item.inap1fOrg, "orang", item.inap1fHari, "hari", item.inap1fKeg, "Keg", "OH", tarif.penginapanEselonII);
          addDetailLK("g", "Penginapan Eselon III", item.inap1gOrg, "orang", item.inap1gHari, "hari", item.inap1gKeg, "Keg", "OH", tarif.penginapanEselonIII);
          addDetailLK("h", "Penginapan Gol. III", item.inap1hOrg, "orang", item.inap1hHari, "hari", item.inap1hKeg, "Keg", "OH", tarif.penginapanGolIII);
          addDetailLK("i", "Fullboard Meeting Menteri Setingkat Menteri dan Wakil Menteri", item.fb1iOrg, "orang", item.fb1iHari, "hari", item.fb1iKeg, "Keg", "OP", tarif.fullboardMenteri);
          addDetailLK("j", "Fullboard Meeting Eselon I dan II/Pejabat Fungsional Utama", item.fb1jOrg, "orang", item.fb1jHari, "hari", item.fb1jKeg, "Keg", "OP", tarif.fullboardEselonI_II);
          addDetailLK("k", "Fullboard Meeting Eselon III/Pejabat Fungsional Madya Ke Bawah", item.fb1kOrg, "orang", item.fb1kHari, "hari", item.fb1kKeg, "Keg", "OP", tarif.fullboardEselonIII);
          addDetailLK("l", "Fullday Meeting Menteri Setingkat Menteri dan Wakil Menteri", item.fd1lOrg, "orang", 1, "kali", item.fd1lKeg, "Keg", "OP", tarif.fulldayMenteri);
          addDetailLK("m", "Fullday Meeting Eselon I dan II/Pejabat Fungsional Utama", item.fd1mOrg, "orang", 1, "kali", item.fd1mKeg, "Keg", "OP", tarif.fulldayEselonI_II);
          addDetailLK("n", "Fullday Meeting Eselon III/Pejabat Fungsional Madya Ke Bawah", item.fd1nOrg, "orang", 1, "kali", item.fd1nKeg, "Keg", "OP", tarif.fulldayEselonIII);
          addDetailLK("o", "Uang Harian Fullboard Meeting", item.uhfb1oOrg, "orang", item.uhfb1oHari, "hari", item.uhfb1oKeg, "Keg", "OH", tarif.uangHarianFullboard);
          addDetailLK("p", "Uang Harian", item.uh1pOrg, "orang", item.uh1pHari, "hari", item.uh1pKeg, "Keg", "OH", tarif.uangHarianLuarKota);

          rowsToAddLK.push({
            id: header2Id,
            type: "header2",
            kode: "",
            uraian: header2Uraian,
            parentAkunKode: "524119",
            jumlah: totalH2,
            cO: false, cS: false, cU: false, cK: false, cD: false,
          });
          rowsToAddLK.push(...detailsForProv);
        });

        if (isExistingH1 && existingMatchLK) {
          const h1Idx = nextRows.findIndex((r) => r.id === existingMatchLK.id);
          const insertPos = findInsertionIndexForSubtree(h1Idx, "header1");
          nextRows.splice(insertPos, 0, ...rowsToAddLK);
        } else {
          const aIdx = nextRows.findIndex((r) => r.type === "akun" && r.kode === "524119");
          const insertPos = aIdx >= 0 ? findInsertionIndexForSubtree(aIdx, "akun") : nextRows.length;
          nextRows.splice(insertPos, 0, ...rowsToAddLK);
        }
      });
    }

    const savedTypes: string[] = [];
    if (konsinyeringJenisPilihan.includes("dalam_kota")) savedTypes.push("Dalam Kota (524114)");
    if (konsinyeringJenisPilihan.includes("luar_kota")) savedTypes.push("Luar Kota (524119)");

    setWorksheetRows(calculateHierarchyAmounts(nextRows));
    triggerAlert(`Berhasil menyusun dan menyimpan Konsinyering ${savedTypes.join(" dan ")} ke kertas kerja!`);
    return true;
  }

  // Transisi dari Checklist ke Kertas Kerja (11 Kolom)
  function handleProceedToChecklistKertasKerja() {
    if (selectedBelanjaItems.length === 0) {
      triggerAlert("Silakan pilih minimal 1 item belanja bahan terlebih dahulu!");
      return;
    }

    const generatedRows: GuidedBelanjaBahanRow[] = [];
    selectedBelanjaItems.forEach((itemKey, idx) => {
      if (itemKey === "Lainnya") {
        const v1 = 24;
        const v2 = 20;
        const v3 = 1;
        const totalVol = v1 * v2 * v3;
        const harga = currentKroLocation.isKotaDepok ? 76000 : 81000;
        const rawBiaya = totalVol * harga;
        const totalBiaya = Math.floor(rawBiaya / 1000) * 1000;

        generatedRows.push({
          id: `guided-bahan-${Date.now()}-${idx}`,
          itemKey: "Lainnya",
          uraian: "Konsumsi Rapat Pimpinan",
          v1,
          s1: "orang",
          v2,
          s2: "keg",
          v3,
          s3: "-",
          totalVol,
          satTotal: "OK",
          harga,
          totalBiaya,
          isLainnya: true,
          selected: true, // Otomatis dichecklist agar siap diganti oleh user
        });
      } else {
        const harga = currentKroLocation.tarif[itemKey] || 0;
        let s1 = "orang";
        let s2 = "keg";
        let satTotal = "OK";
        if (itemKey.includes("Seminar Kit") || itemKey.includes("Diklat Kit")) {
          satTotal = "Paket";
        } else if (itemKey === "Pencetakan") {
          s1 = "lembar";
          s2 = "buku";
          satTotal = "Eksemplar";
        }
        const v1 = 1;
        const v2 = 1;
        const v3 = 1;
        const totalVol = 1;
        const rawBiaya = totalVol * harga;
        const totalBiaya = Math.floor(rawBiaya / 1000) * 1000;

        generatedRows.push({
          id: `guided-bahan-${Date.now()}-${idx}`,
          itemKey,
          uraian: itemKey,
          v1,
          s1,
          v2,
          s2,
          v3,
          s3: "-",
          totalVol,
          satTotal,
          harga,
          totalBiaya,
          isLainnya: false,
          selected: false, // Item standar tidak dichecklist secara default
        });
      }
    });

    setGuidedBelanjaRows(generatedRows);
    setGuidedBelanjaStep("kertas_kerja");
  }

  // Toggle checklist pada 1 baris (Mendukung Shift+Click untuk blok multi-baris seperti Excel)
  function handleToggleRowSelection(idx: number, isShiftKey = false) {
    if (isShiftKey && lastSelectedRowIdx !== null) {
      const start = Math.min(lastSelectedRowIdx, idx);
      const end = Math.max(lastSelectedRowIdx, idx);
      setGuidedBelanjaRows((prev) =>
        prev.map((r, i) => (i >= start && i <= end ? { ...r, selected: true } : r))
      );
      setLastSelectedRowIdx(idx);
      return;
    }

    setGuidedBelanjaRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], selected: !next[idx].selected };
      return next;
    });
    setLastSelectedRowIdx(idx);
  }

  // Toggle checklist semua baris
  function handleToggleAllRowsSelection(selectAll: boolean) {
    setGuidedBelanjaRows((prev) =>
      prev.map((r) => ({ ...r, selected: selectAll }))
    );
  }

  // Hapus baris yang dichecklist
  function handleDeleteSelectedGuidedRows() {
    const checkedCount = guidedBelanjaRows.filter((r) => r.selected).length;
    if (checkedCount === 0) {
      triggerAlert("Checklist minimal 1 baris yang ingin dihapus.");
      return;
    }
    if (guidedBelanjaRows.length - checkedCount < 1) {
      triggerAlert("Minimal harus menyisakan 1 baris pada kertas kerja!");
      return;
    }
    setGuidedBelanjaRows((prev) => prev.filter((r) => !r.selected));
    triggerAlert(`Berhasil menghapus ${checkedCount} baris yang dichecklist.`);
  }

  // Ubah baris yang dichecklist menjadi item template tertentu
  function handleApplyTemplateToSelectedRows(templateItemKey: string) {
    const checkedCount = guidedBelanjaRows.filter((r) => r.selected).length;
    if (checkedCount === 0) {
      triggerAlert("Checklist minimal 1 baris yang ingin diganti!");
      return;
    }

    setGuidedBelanjaRows((prev) =>
      prev.map((r) => {
        if (!r.selected) return r;
        if (templateItemKey === "Lainnya") {
          return {
            ...r,
            itemKey: "Lainnya",
            isLainnya: true,
          };
        }
        const harga = currentKroLocation.tarif[templateItemKey] || r.harga;
        let satTotal = r.satTotal || "OK";
        if (templateItemKey.includes("Seminar Kit") || templateItemKey.includes("Diklat Kit")) {
          satTotal = "Paket";
        } else if (templateItemKey === "Pencetakan") {
          satTotal = "Eksemplar";
        }
        const totalVol = (r.v1 || 1) * (r.v2 || 1) * (r.v3 || 1);
        const totalBiaya = Math.floor((totalVol * harga) / 1000) * 1000;
        return {
          ...r,
          itemKey: templateItemKey,
          uraian: templateItemKey,
          satTotal,
          harga,
          totalBiaya,
          isLainnya: false,
        };
      })
    );
    triggerAlert(`Berhasil mengubah ${checkedCount} baris yang dichecklist menjadi ${templateItemKey}!`);
  }

  // Update nilai field pada baris kertas kerja panduan belanja bahan
  function updateGuidedRowField(idx: number, field: keyof GuidedBelanjaBahanRow, value: any) {
    setGuidedBelanjaRows((prev) => {
      const next = [...prev];
      const row = { ...next[idx], [field]: value };

      if (field === "v1" || field === "v2" || field === "v3" || field === "harga") {
        const v1 = parseIndoNumber(row.v1) || 1;
        const v2 = parseIndoNumber(row.v2) || 1;
        const v3 = parseIndoNumber(row.v3) || 1;
        const harga = parseIndoNumber(row.harga) || 0;
        const totalVol = v1 * (v2 > 0 ? v2 : 1) * (v3 > 0 ? v3 : 1);
        const rawBiaya = totalVol * harga;
        const totalBiaya = Math.floor(rawBiaya / 1000) * 1000; // ROUNDDOWN ke ribuan terdekat
        row.totalVol = totalVol;
        row.harga = harga;
        row.totalBiaya = totalBiaya;
      }
      next[idx] = row;
      return next;
    });
  }

  // Duplikat baris
  function handleDuplicateGuidedRow(idx: number) {
    const target = guidedBelanjaRows[idx];
    const dup: GuidedBelanjaBahanRow = {
      ...target,
      id: `guided-bahan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      selected: false,
    };
    const next = [...guidedBelanjaRows];
    next.splice(idx + 1, 0, dup);
    setGuidedBelanjaRows(next);
    triggerAlert("Baris berhasil diduplikasi!");
  }

  // Hapus baris
  function handleDeleteGuidedRow(idx: number) {
    if (guidedBelanjaRows.length <= 1) {
      triggerAlert("Minimal harus ada 1 baris pada kertas kerja!");
      return;
    }
    setGuidedBelanjaRows(guidedBelanjaRows.filter((_, i) => i !== idx));
  }

  // Tambah baris kosong
  function handleAddEmptyGuidedRow() {
    const newRow: GuidedBelanjaBahanRow = {
      id: `guided-bahan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemKey: "Lainnya",
      uraian: "",
      v1: 1,
      s1: "",
      v2: 1,
      s2: "",
      v3: 1,
      s3: "-",
      totalVol: 1,
      satTotal: "",
      harga: 0,
      totalBiaya: 0,
      isLainnya: true,
      selected: true,
    };
    setGuidedBelanjaRows([...guidedBelanjaRows, newRow]);
  }

  // Set total jumlah baris
  function handleSetTotalGuidedRows(targetCount: number) {
    if (targetCount <= 0) return;
    if (targetCount <= guidedBelanjaRows.length) {
      setGuidedBelanjaRows(guidedBelanjaRows.slice(0, targetCount));
    } else {
      const toAdd = targetCount - guidedBelanjaRows.length;
      const added: GuidedBelanjaBahanRow[] = [];
      for (let i = 0; i < toAdd; i++) {
        added.push({
          id: `guided-bahan-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          itemKey: "Lainnya",
          uraian: "",
          v1: 1,
          s1: "",
          v2: 1,
          s2: "",
          v3: 1,
          s3: "-",
          totalVol: 1,
          satTotal: "",
          harga: 0,
          totalBiaya: 0,
          isLainnya: true,
          selected: true,
        });
      }
      setGuidedBelanjaRows([...guidedBelanjaRows, ...added]);
    }
  }

  // Salin 1 baris ke clipboard (format TSV kompatibel Excel)
  function handleCopyGuidedRow(row: GuidedBelanjaBahanRow) {
    const tsv = `${row.uraian}\t${row.v1}\t${row.s1}\t${row.v2}\t${row.s2}\t${row.v3}\t${row.s3}\t${row.totalVol}\t${row.satTotal}\t${row.harga}\t${row.totalBiaya}`;
    navigator.clipboard?.writeText(tsv).then(() => {
      triggerAlert(`Baris "${row.uraian || "Data"}" berhasil disalin ke clipboard!`);
    }).catch(() => {
      triggerAlert("Gagal menyalin ke clipboard.");
    });
  }

  // Parse data yang ditempel (paste) dari Excel / Sheets
  function parsePastedExcelText(text: string) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
    const parsedRows: GuidedBelanjaBahanRow[] = [];

    lines.forEach((line, i) => {
      const rawCols = line.includes("\t") ? line.split("\t") : line.split("|");
      const cols = rawCols.map((c) => c.trim());
      if (cols.length === 0 || !cols[0]) return;

      const uraian = cols[0];
      const v1 = cols.length > 1 ? parseIndoNumber(cols[1]) || 1 : 1;
      const s1 = cols.length > 2 ? cols[2] : "";
      const v2 = cols.length > 3 ? parseIndoNumber(cols[3]) || 1 : 1;
      const s2 = cols.length > 4 ? cols[4] : "";
      const v3 = cols.length > 5 ? parseIndoNumber(cols[5]) || 1 : 1;
      const s3 = cols.length > 6 ? cols[6] : "";

      const totalVol = v1 * (v2 > 0 ? v2 : 1) * (v3 > 0 ? v3 : 1);
      const satTotal = cols.length > 8 && cols[8] ? cols[8] : (s1 ? `${s1}` : "OK");

      let harga = 0;
      if (cols.length >= 10 && cols[9]) {
        harga = parseIndoNumber(cols[9]);
      } else if (cols.length >= 8 && cols[7] && !isNaN(parseIndoNumber(cols[7])) && parseIndoNumber(cols[7]) > 100) {
        harga = parseIndoNumber(cols[7]);
      } else if (currentKroLocation.tarif[uraian]) {
        harga = currentKroLocation.tarif[uraian];
      }

      const rawBiaya = totalVol * harga;
      const totalBiaya = Math.floor(rawBiaya / 1000) * 1000; // ROUNDDOWN ke ribuan terdekat

      parsedRows.push({
        id: `guided-bahan-paste-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        itemKey: "Lainnya",
        uraian,
        v1,
        s1,
        v2,
        s2,
        v3,
        s3,
        totalVol,
        satTotal,
        harga,
        totalBiaya,
        isLainnya: true,
        selected: true,
      });
    });

    return parsedRows;
  }

  // Terapkan data paste teks Excel / Sheets ke tabel secara cerdas
  function applyPastedClipboardData(text: string) {
    if (!text || !text.trim()) return;
    const parsed = parsePastedExcelText(text);
    if (parsed.length === 0) {
      triggerAlert("Format data clipboard tidak sesuai atau tidak ada baris yang valid.");
      return;
    }

    const checkedIndices = guidedBelanjaRows
      .map((r, idx) => (r.selected ? idx : -1))
      .filter((idx) => idx !== -1);

    if (checkedIndices.length > 0) {
      setGuidedBelanjaRows((prev) => {
        const next = [...prev];
        checkedIndices.forEach((rowIdx, i) => {
          if (i < parsed.length) {
            next[rowIdx] = {
              ...parsed[i],
              id: next[rowIdx].id,
              selected: true,
            };
          }
        });
        if (parsed.length > checkedIndices.length) {
          next.push(...parsed.slice(checkedIndices.length));
        }
        return next;
      });
      triggerAlert(`Berhasil memperbarui ${Math.min(checkedIndices.length, parsed.length)} baris terpilih dari Clipboard (Ctrl+V)!`);
    } else {
      setGuidedBelanjaRows(parsed);
      triggerAlert(`Berhasil memuat ${parsed.length} baris data dari Clipboard (Ctrl+V)!`);
    }
  }

  // Terapkan data paste ke Kertas Kerja (mendukung penggantian baris yang dichecklist)
  function handleApplyPastedExcel() {
    if (!pasteExcelInputText.trim()) return;
    applyPastedClipboardData(pasteExcelInputText);
    setPasteExcelModalOpen(false);
    setPasteExcelInputText("");
  }

  // Handler Simpan Belanja Bahan ke Worksheet Utama (Membentuk Akun 521211 & Detail Belanja)
  function handleSaveGuidedBelanjaBahan() {
    const validRows = guidedBelanjaRows.filter((r) => r.uraian.trim() !== "");
    if (validRows.length === 0) {
      triggerAlert("Mohon isi minimal 1 baris rincian belanja bahan!");
      return;
    }

    const targetId = targetSubkompRowId || selectedRowId;
    let subkompIdx = worksheetRows.findIndex((r) => r.id === targetId);
    if (subkompIdx < 0) {
      subkompIdx = worksheetRows.map((r) => r.type).lastIndexOf("subkomponen");
    }

    if (subkompIdx < 0) {
      triggerAlert("Tidak ditemukan baris Sub Komponen acuan untuk menampung Belanja Bahan.");
      return;
    }

    const subkompRow = worksheetRows[subkompIdx];

    // Cek apakah di bawah subkomponen ini sudah ada Akun 521211
    let existingAkunIdx = -1;
    for (let i = subkompIdx + 1; i < worksheetRows.length; i++) {
      const t = worksheetRows[i].type;
      if (t === "program" || t === "kegiatan" || t === "kro" || t === "ro" || t === "komponen" || t === "subkomponen") {
        break;
      }
      if (t === "akun" && worksheetRows[i].kode === "521211") {
        existingAkunIdx = i;
        break;
      }
    }

    const newRowsToInsert: WorksheetRow[] = [];

    // Jika belum ada akun 521211, buat baris level Akun 521211
    if (existingAkunIdx < 0) {
      newRowsToInsert.push({
        id: `row-akun-521211-${Date.now()}`,
        type: "akun",
        kode: "521211",
        uraian: "Belanja Bahan",
        jumlah: 0,
        sd: "A00",
        subUraian: "(KPPN.175-Jakarta VI)",
        parentSubkompKode: subkompRow.kode,
        cO: false,
        cS: false,
        cU: false,
        cK: false,
        cD: false,
      });
    }

    // Bentuk baris level Detail Belanja untuk setiap baris di kertas kerja
    validRows.forEach((r, idx) => {
      newRowsToInsert.push({
        id: `row-detail-bahan-${Date.now()}-${idx}`,
        type: "detail",
        kode: "",
        uraian: r.uraian,
        parentAkunKode: "521211",
        k1Nilai: r.v1,
        k1Sat: r.s1,
        k2Nilai: r.v2,
        k2Sat: r.s2,
        k3Nilai: r.v3,
        k3Sat: r.s3,
        vol: r.totalVol,
        sat: r.satTotal || r.s1 || "OK",
        harga: r.harga,
        jumlah: r.totalBiaya, // ROUNDDOWN ke ribuan terdekat
        badge: r.isLainnya ? "[Verifikasi BINCANG]" : undefined,
        cO: false,
        cS: false,
        cU: false,
        cK: false,
        cD: false,
      });
    });

    setWorksheetRows((prev) => {
      const next = [...prev];
      if (existingAkunIdx >= 0) {
        // Masukkan detail di akhir subtree Akun 521211 yang sudah ada
        const insertIdx = findInsertionIndexForSubtree(existingAkunIdx, "akun");
        next.splice(insertIdx, 0, ...newRowsToInsert);
      } else {
        // Masukkan akun dan detail di akhir subtree Sub Komponen
        const insertIdx = findInsertionIndexForSubtree(subkompIdx, "subkomponen");
        next.splice(insertIdx, 0, ...newRowsToInsert);
      }
      return calculateHierarchyAmounts(next);
    });

    const grandTotal = validRows.reduce((sum, r) => sum + r.totalBiaya, 0);
    triggerAlert(
      `Berhasil menambahkan ${validRows.length} baris Belanja Bahan (Akun 521211) ke kertas kerja! Total: Rp ${formatRupiah(grandTotal)}`
    );

    const nextStep = getNextGuidedStep("panduan_belanja_bahan");
    if (nextStep) {
      handleTransitionToGuidedStep(nextStep.mode);
    } else {
      setModalMode(null);
    }
  }

  // Handler Unggah File Excel (.xls, .xlsx)
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = [".xls", ".xlsx"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      setUploadError("Format file tidak didukung! Harap unggah file berekstensi .xls atau .xlsx");
      setUploadFile(null);
      setUploadPreview([]);
      return;
    }

    setUploadFile(file);
    setUploadError(null);
    setIsProcessingUpload(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!json || json.length < 2) {
          setUploadError("File excel kosong atau tidak memiliki baris data rincian belanja.");
          setIsProcessingUpload(false);
          return;
        }

        // Cari baris header
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(json.length, 10); i++) {
          const rowStr = JSON.stringify(json[i] || []).toLowerCase();
          if (rowStr.includes("akun") || rowStr.includes("uraian") || rowStr.includes("biaya") || rowStr.includes("jumlah") || rowStr.includes("harga")) {
            headerRowIdx = i;
            break;
          }
        }

        const dataRows = headerRowIdx >= 0 ? json.slice(headerRowIdx + 1) : json.slice(1);
        const parsedRows: Array<{
          kodeAkun: string;
          uraianAkun: string;
          uraianDetail: string;
          vol: number;
          satuan: string;
          harga: number;
          jumlah: number;
        }> = [];

        let currentKodeAkun = "521211";
        let currentUraianAkun = "Belanja Bahan";

        for (const row of dataRows) {
          if (!row || !Array.isArray(row) || row.length === 0) continue;
          
          const col0 = String(row[0] || "").trim();
          const col1 = String(row[1] || "").trim();
          const col2 = row[2];
          const col3 = String(row[3] || "").trim();
          const col4 = row[4];
          const col5 = row[5];

          // Deteksi baris akun (misal kode 6 digit numerik diawali 5)
          if (/^5\d{5}$/.test(col0)) {
            currentKodeAkun = col0;
            currentUraianAkun = col1 || (baganAkunStandar.find((b) => b.kode === col0)?.nama || "Belanja");
            continue;
          }

          // Baris detail belanja
          const uraian = col1 || col0;
          if (!uraian || uraian.toLowerCase().includes("total") || uraian.toLowerCase().includes("subtotal")) {
            continue;
          }

          const vol = Number(col2) || 1;
          const sat = col3 || "Kegiatan";
          const harga = Number(col4) || Number(col5) || 0;
          const total = Number(col5) || (vol * harga);

          if (uraian) {
            parsedRows.push({
              kodeAkun: currentKodeAkun,
              uraianAkun: currentUraianAkun,
              uraianDetail: uraian,
              vol: vol,
              satuan: sat,
              harga: harga,
              jumlah: total > 0 ? total : vol * harga,
            });
          }
        }

        if (parsedRows.length === 0) {
          // Fallback parsing sederhana jika format bebas
          for (const row of dataRows) {
            if (!row || row.length === 0) continue;
            const text = String(row[0] || row[1] || "").trim();
            if (!text) continue;
            const num = Number(row[row.length - 1]) || 100000;
            parsedRows.push({
              kodeAkun: currentKodeAkun,
              uraianAkun: currentUraianAkun,
              uraianDetail: text,
              vol: 1,
              satuan: "Paket",
              harga: num,
              jumlah: num,
            });
          }
        }

        setUploadPreview(parsedRows);
        setIsProcessingUpload(false);
      } catch (err: any) {
        setUploadError(`Gagal membaca file excel: ${err?.message || "File rusak atau format tidak dikenali"}`);
        setIsProcessingUpload(false);
      }
    };
    reader.onerror = () => {
      setUploadError("Gagal membaca file melalui browser.");
      setIsProcessingUpload(false);
    };
    reader.readAsArrayBuffer(file);
  }

  // Handler Submit Upload Excel ke Worksheet
  function handleConfirmUpload() {
    if (uploadPreview.length === 0) {
      triggerAlert("Tidak ada data valid yang dapat diimpor dari file.");
      return;
    }

    const totalImport = uploadPreview.reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);
    const targetId = targetSubkompRowId || selectedRowId;
    const targetIdx = worksheetRows.findIndex((r) => r.id === targetId);
    const parentRo = findParentRoForRow(worksheetRows, targetIdx >= 0 ? targetIdx : worksheetRows.length - 1);
    if (parentRo && parentRo.isSbk && parentRo.maxAnggaranRo) {
      const currentRoTotal = Number(parentRo.jumlah) || 0;
      if (currentRoTotal + totalImport > parentRo.maxAnggaranRo) {
        triggerAlert(
          `Peringatan SBK: Total impor sebesar Rp ${formatRupiah(totalImport)} akan melebihi batas maksimal anggaran RO (Rp ${formatRupiah(parentRo.maxAnggaranRo)}). Total anggaran RO saat ini: Rp ${formatRupiah(currentRoTotal)}.`
        );
      }
    }

    // Kelompokkan per akun
    const akunGroups = new Map<string, typeof uploadPreview>();
    for (const item of uploadPreview) {
      if (!akunGroups.has(item.kodeAkun)) {
        akunGroups.set(item.kodeAkun, []);
      }
      akunGroups.get(item.kodeAkun)!.push(item);
    }

    const newRowsToInsert: WorksheetRow[] = [];
    let timeOffset = 0;

    akunGroups.forEach((items, kodeAkun) => {
      const sample = items[0];
      const sumAkun = items.reduce((acc, curr) => acc + curr.jumlah, 0);

      const akunRow: WorksheetRow = {
        id: `row-akun-up-${Date.now()}-${timeOffset++}`,
        type: "akun",
        kode: kodeAkun,
        uraian: sample.uraianAkun,
        subUraian: "(KPPN.175-Jakarta VI)",
        jumlah: sumAkun,
        sd: "A00",
        cO: false,
        cS: false,
        cU: false,
        cK: false,
        cD: false,
      };
      newRowsToInsert.push(akunRow);

      for (const it of items) {
        const detailRow: WorksheetRow = {
          id: `row-det-up-${Date.now()}-${timeOffset++}`,
          type: "detail",
          kode: "",
          uraian: `- ${it.uraianDetail.replace(/^[-*•\s]+/, "")}`,
          vol: it.vol,
          sat: it.satuan,
          harga: it.harga,
          jumlah: it.jumlah,
          parentAkunKode: kodeAkun,
          cO: false,
          cS: true,
          cU: false,
          cK: false,
          cD: false,
        };
        newRowsToInsert.push(detailRow);
      }
    });

    setWorksheetRows((prev) => {
      const targetId = targetSubkompRowId || selectedRowId;
      const targetIdx = prev.findIndex((r) => r.id === targetId);
      const next = [...prev];

      if (targetIdx >= 0) {
        const insertIdx = findInsertionIndexForSubtree(targetIdx, prev[targetIdx].type);
        next.splice(insertIdx, 0, ...newRowsToInsert);
      } else {
        const lastSubkompIdx = prev.map((r) => r.type).lastIndexOf("subkomponen");
        if (lastSubkompIdx >= 0) {
          const insertIdx = findInsertionIndexForSubtree(lastSubkompIdx, "subkomponen");
          next.splice(insertIdx, 0, ...newRowsToInsert);
        } else {
          next.push(...newRowsToInsert);
        }
      }
      return calculateHierarchyAmounts(next);
    });

    if (newRowsToInsert.length > 0) {
      setSelectedRowId(newRowsToInsert[0].id);
    }
    setModalMode(null);
    setUploadFile(null);
    setUploadPreview([]);
    triggerAlert(`Berhasil mengimpor ${uploadPreview.length} rincian belanja dari file excel!`);
  }

  // Handler Download Contoh Template Excel
  function handleDownloadTemplate() {
    const templateData = [
      ["KODE AKUN", "URAIAN RINCIAN BELANJA", "VOLUME", "SATUAN", "HARGA SATUAN", "JUMLAH"],
      ["521211", "Belanja Bahan", "", "", "", ""],
      ["", "Konsumsi Rapat Koordinasi Teknis", 20, "Orang/Kali", 50000, 1000000],
      ["", "Penggandaan Dokumen dan Modul", 50, "Buku", 35000, 1750000],
      ["524111", "Belanja Perjalanan Dinas Biasa", "", "", "", ""],
      ["", "Transportasi Darat Tim Monev ke Lokasi", 4, "Orang/PP", 450000, 1800000],
      ["", "Uang Harian Perjalanan Dinas", 8, "OH", 370000, 2960000],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_RAB");
    XLSX.writeFile(wb, "Template_Import_RAB_SubKomponen.xlsx");
  }

  // Handler Hapus Baris Terpilih (termasuk seluruh baris subtree di bawahnya)
  function handleDeleteSelected() {
    if (!selectedRowId) {
      triggerAlert("Pilih baris yang ingin dihapus terlebih dahulu.");
      return;
    }
    const targetIdx = worksheetRows.findIndex((r) => r.id === selectedRowId);
    if (targetIdx < 0) return;
    const target = worksheetRows[targetIdx];
    const targetRank = getRowHierarchyLevel(target);
    const idsToDelete = new Set<string>([target.id]);

    for (let i = targetIdx + 1; i < worksheetRows.length; i++) {
      if (getRowHierarchyLevel(worksheetRows[i]) > targetRank) {
        idsToDelete.add(worksheetRows[i].id);
      } else {
        break;
      }
    }

    setWorksheetRows((prev) => calculateHierarchyAmounts(prev.filter((r) => !idsToDelete.has(r.id))));
    setSelectedRowId("");
    triggerAlert(`Baris "${target.kode ? target.kode + ' - ' : ''}${target.uraian || selectedRowId}" berhasil dihapus.`);
  }

  // Handler Simpan Data Toolbar Worksheet: Validasi Duplikasi & Pengurutan Ascending
  function handleSaveAndValidateWorksheet() {
    // 1. Validasi Duplikasi pada seluruh hierarki (KRO, RO, Komponen, Sub Komponen, Akun, Header 1, Header 2)
    const validationResult = validateWorksheetDuplicates(worksheetRows);
    if (!validationResult.isValid) {
      setDuplicateErrors(validationResult.errors);
      setDuplicateRowIds(validationResult.duplicateRowIds);
      triggerAlert(`Gagal menyimpan! Ditemukan ${validationResult.errors.length} data duplikat (ditandai warna merah pada tabel).`);
      return;
    }

    // Bersihkan penanda error duplikasi jika valid
    setDuplicateErrors([]);
    setDuplicateRowIds([]);

    // 2. Jika valid, urutkan seluruh tingkatan hierarki secara ascending dan berikan penomoran ulang Header 1 & 2
    const sortedAndRenumbered = sortAndRenumberWorksheet(worksheetRows);

    // 3. Hitung ulang total nilai pada seluruh level hierarki
    const finalRows = calculateHierarchyAmounts(sortedAndRenumbered);

    // 4. Perbarui state worksheet
    setWorksheetRows(finalRows);
    triggerAlert("Worksheet Isian RAB berhasil disimpan! Seluruh tingkatan telah divalidasi dan diurutkan secara ascending.");
  }

  // State Inline Cell Editing (Spreadsheet Excel Style: Klik 2x langsung edit di cell tanpa pop up menu)
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: keyof WorksheetRow } | null>(null);
  const [showChecklistMassalMenu, setShowChecklistMassalMenu] = useState(false);
  const checklistMassalMenuRef = useRef<HTMLDivElement>(null);

  // Close checklist massal dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (checklistMassalMenuRef.current && !checklistMassalMenuRef.current.contains(e.target as Node)) {
        setShowChecklistMassalMenu(false);
      }
    }
    if (showChecklistMassalMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showChecklistMassalMenu]);

  // Handler update cell spreadsheet secara reaktif ala Excel
  function handleCellChange(rowId: string, field: keyof WorksheetRow, value: any) {
    setWorksheetRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const updated = { ...r, [field]: value };
        // Kalkulasi otomatis ala spreadsheet Excel jika mengubah komponen atau harga pada baris detail
        if (updated.type === "detail") {
          if (["k1Nilai", "k2Nilai", "k3Nilai", "harga"].includes(field as string)) {
            const k1 = Number(updated.k1Nilai) || 1;
            const k2 = Number(updated.k2Nilai) || 1;
            const k3 = Number(updated.k3Nilai) || 1;
            const vol = k1 * k2 * k3;
            const hrg = Number(updated.harga) || 0;
            const rawJumlah = vol * hrg;
            updated.vol = vol;
            updated.jumlah = Math.floor(rawJumlah / 1000) * 1000;
          } else if (field === "vol") {
            const vol = Number(updated.vol) || 0;
            const hrg = Number(updated.harga) || 0;
            const rawJumlah = vol * hrg;
            updated.jumlah = Math.floor(rawJumlah / 1000) * 1000;
          } else if (field === "jumlah") {
            const rawJumlah = Number(value) || 0;
            updated.jumlah = Math.floor(rawJumlah / 1000) * 1000;
          }
        }
        return updated;
      })
    );
    // Recalculate hierarchy amounts whenever cell changes
    setWorksheetRows((prev) => calculateHierarchyAmounts(prev));
  }

  // Handler toggle status baris individual (O, S, U, K, D)
  // Mendukung cascade checklist ke seluruh level anak (misal: Header 1 -> Header 2 & Detail, Header 2 -> Detail)
  function handleToggleRowStatus(rowId: string, field: "cO" | "cS" | "cU" | "cK" | "cD") {
    setWorksheetRows((prev) => {
      const targetIdx = prev.findIndex((r) => r.id === rowId);
      if (targetIdx < 0) return prev;
      const targetRow = prev[targetIdx];
      const currentVal = field === "cO" ? (targetRow.cO ?? targetRow.c0 ?? false) : !!targetRow[field];
      const nextVal = !currentVal;

      // Ambil seluruh index subtree baris ini
      const targetRanks: Record<WorksheetRowType, number> = {
        program: 1,
        kegiatan: 2,
        kro: 3,
        ro: 4,
        komponen: 5,
        subkomponen: 6,
        akun: 7,
        header1: 8,
        header2: 9,
        subkomponen_sub: 9,
        detail: 10,
      };
      const parentRank = targetRanks[targetRow.type] || 99;
      const affectedIndices = new Set<number>([targetIdx]);

      for (let i = targetIdx + 1; i < prev.length; i++) {
        const curRank = targetRanks[prev[i].type] || 99;
        if (curRank > parentRank) {
          affectedIndices.add(i);
        } else {
          break;
        }
      }

      return prev.map((r, i) => {
        if (!affectedIndices.has(i)) return r;
        return {
          ...r,
          [field]: nextVal,
          ...(field === "cO" ? { c0: nextVal } : {}),
        };
      });
    });
  }

  // Handler checklist massal per kolom status (O, S, U, K, D)
  function handleToggleStatusMassal(field: "cO" | "cS" | "cU" | "cK" | "cD") {
    setWorksheetRows((prev) => {
      const allChecked = prev.every((r) => (field === "cO" ? !!(r.cO ?? r.c0) : !!r[field]));
      const nextVal = !allChecked;
      return prev.map((r) => ({
        ...r,
        [field]: nextVal,
        ...(field === "cO" ? { c0: nextVal } : {}),
      }));
    });
    const labelMap = {
      cO: "Operator (O)",
      cS: "Satker, approve Eselon II (S)",
      cU: "Unit, approve Eselon I (U)",
      cK: "Kementerian, approve BINCANG (K)",
      cD: "DJA, approve Kemenkeu (D)",
    };
    triggerAlert(`Checklist massal status ${labelMap[field]} berhasil diperbarui!`);
  }

  // Handler checklist massal semua status sekaligus
  function handleChecklistMassalAll(checked: boolean) {
    setWorksheetRows((prev) =>
      prev.map((r) => ({
        ...r,
        cO: checked,
        c0: checked,
        cS: checked,
        cU: checked,
        cK: checked,
        cD: checked,
      }))
    );
    setShowChecklistMassalMenu(false);
    triggerAlert(checked ? "Semua status (O, S, U, K, D) berhasil dichecklist massal!" : "Semua status baris berhasil dikosongkan!");
  }

  // Handler tombol Edit toolbar -> menampilkan ulang dialog box untuk level KRO s.d. Akun, atau inline edit untuk Header & Detail
  function handleToolbarEdit() {
    if (!selectedRowId) {
      triggerAlert("Pilih baris yang ingin diedit terlebih dahulu.");
      return;
    }

    const target = worksheetRows.find((r) => r.id === selectedRowId);
    if (!target) return;

    if (target.type === "kro") {
      setEditingRowId(target.id);
      // Populasi form KRO
      const parts = target.kode.split(".");
      const kroCode = parts.length > 1 ? parts[parts.length - 1] : target.kode;
      setFormKroDialog((prev) => ({
        ...prev,
        kroKode: kroCode,
        kroNama: target.uraian,
        volume: target.vol || prev.volume,
      }));
      setModalMode("kro");
      return;
    }

    if (target.type === "ro") {
      setEditingRowId(target.id);
      // Populasi form RO
      setFormRo((prev) => ({
        ...prev,
        roKode: target.kode,
        roNama: target.uraian,
        volume: Number(target.vol) || 19,
        isSbk: !!target.isSbk,
        sbkKelompok: target.sbkKelompok || "",
        sbkKode: target.sbkKode || "",
        sbkUraian: target.sbkUraian || "",
        sbkBesaran: target.sbkBesaran || 0,
        sbkSatuan: target.sbkSatuan || "",
      }));
      setModalMode("ro");
      return;
    }

    if (target.type === "komponen") {
      setEditingRowId(target.id);
      // Populasi form Komponen
      const targetIdx = worksheetRows.findIndex((r) => r.id === target.id);
      const parentRo = findParentRoForRow(worksheetRows, targetIdx);
      const isOp = isOperasionalRo(parentRo?.kode);
      const badgeMatch = target.badge?.match(/\[(.*?)\]/);
      const sifat = badgeMatch ? badgeMatch[1] : "UTAMA";
      setFormKomponen((prev) => ({
        ...prev,
        kode: target.kode,
        uraian: target.uraian,
        jenisBiaya: isOp ? (target.jenisBiaya || prev.jenisBiaya || "OPERASIONAL") : "NON OPERASIONAL",
        sifatBiaya: sifat === "PENDUKUNG" ? "PENDUKUNG" : "UTAMA",
      }));
      setModalMode("komponen");
      return;
    }

    if (target.type === "subkomponen") {
      setEditingRowId(target.id);
      // Populasi form Sub Komponen
      const isTanpa = !target.kode || target.uraian === "Tanpa Sub Komponen";
      setSubkompType(isTanpa ? "tanpa" : "dengan");
      setFormSubkomponen({
        kode: target.kode || "A",
        uraian: isTanpa ? "" : target.uraian,
      });
      setModalMode("subkomponen");
      return;
    }

    if (target.type === "akun") {
      setEditingRowId(target.id);
      // Populasi form Akun
      setFormAkun({
        kodeAkun: target.kode,
        uraianAkun: target.uraian,
        sd: target.sd || "A00",
        subUraian: target.subUraian || "(KPPN.175-Jakarta VI)",
      });
      setModalMode("akun");
      return;
    }

    // Untuk level Header 1, Header 2, dan Detail Belanja -> inline spreadsheet editing
    setEditingCell({ rowId: selectedRowId, field: "uraian" });
  }

  // Handler Copy (Salin baris terpilih beserta seluruh rincian/subtree di bawahnya)
  function handleCopySelected() {
    let targetIdx = worksheetRows.findIndex((r) => r.id === selectedRowId);

    // Jika selectedRowId belum dipilih, ambil dari baris pertama yang dichecklist
    if (targetIdx < 0) {
      targetIdx = worksheetRows.findIndex((r) => !!(r.cO ?? r.c0 ?? r.cS ?? r.cU ?? r.cK ?? r.cD));
    }

    if (targetIdx < 0) {
      triggerAlert("Pilih atau checklist baris yang ingin disalin (Copy) terlebih dahulu.");
      return;
    }

    const targetRow = worksheetRows[targetIdx];
    const targetRank = getRowHierarchyLevel(targetRow);

    // Ambil baris target beserta SELURUH subtree anak di bawahnya
    // Misal: Header 1 -> seluruh Header 2 & Detail belanja di bawahnya ikut ter-copy
    const subtreeRows: WorksheetRow[] = [targetRow];
    for (let i = targetIdx + 1; i < worksheetRows.length; i++) {
      if (getRowHierarchyLevel(worksheetRows[i]) > targetRank) {
        subtreeRows.push(worksheetRows[i]);
      } else {
        break;
      }
    }

    setCopiedRows(subtreeRows.map((r) => ({ ...r })));
    setSelectedRowId(targetRow.id);

    const desc = subtreeRows.length > 1
      ? `"${targetRow.uraian}" beserta ${subtreeRows.length - 1} rincian di bawahnya`
      : `"${targetRow.uraian}"`;

    triggerAlert(`Berhasil menyalin (Copy) ${desc}. Klik baris tujuan lalu klik ikon Paste untuk menempelkan.`);
  }

  // Handler Paste (Tempelkan baris beserta seluruh rincian anak di bawah baris terpilih)
  function handlePaste() {
    if (copiedRows.length === 0) {
      triggerAlert("Belum ada baris yang disalin (Copy). Silakan klik ikon Copy pada baris yang diinginkan.");
      return;
    }

    const timeStamp = Date.now();
    // Buat ID baru unik untuk setiap baris yang dipaste
    const clonedRows: WorksheetRow[] = copiedRows.map((r, i) => {
      const isTopLevel = i === 0;
      let newUraian = r.uraian;
      if (isTopLevel && (r.type === "header1" || r.type === "header2" || r.type === "subkomponen_sub" || r.type === "detail")) {
        newUraian = r.uraian.includes("(Salinan)") ? r.uraian : `${r.uraian} (Salinan)`;
      }

      return {
        ...r,
        id: `row-${r.type}-pasted-${timeStamp}-${i}`,
        uraian: newUraian,
        cO: false,
        cS: false,
        cU: false,
        cK: false,
        cD: false,
        c0: false,
      };
    });

    setWorksheetRows((prev) => {
      let destIdx = prev.findIndex((r) => r.id === selectedRowId);
      const next = [...prev];

      if (destIdx >= 0) {
        const destRow = prev[destIdx];
        const destRank = getRowHierarchyLevel(destRow);
        const topCopiedRank = getRowHierarchyLevel(clonedRows[0]);

        let insertIdx = destIdx + 1;
        // Jika target paste adalah selevel atau lebih tinggi (misal target Header 1 dan kita paste Header 1),
        // sisipkan setelah seluruh subtree target agar tidak terpotong di tengah-tengah anak
        if (destRank <= topCopiedRank) {
          insertIdx = findInsertionIndexForSubtree(destIdx, destRow.type);
        }
        next.splice(insertIdx, 0, ...clonedRows);
      } else {
        next.push(...clonedRows);
      }

      return calculateHierarchyAmounts(next);
    });

    setSelectedRowId(clonedRows[0].id);
    triggerAlert(`Berhasil menempelkan (Paste) ${clonedRows.length} baris ke kertas kerja!`);
  }

  // Evaluasi kalkulator sederhana
  function handleCalculate() {
    try {
      // sanitasi input sederhana
      const sanitized = calcInput.replace(/[^0-9+\-*/().]/g, "");
      // eslint-disable-next-line no-eval
      const res = Function(`'use strict'; return (${sanitized})`)();
      setCalcResult(String(res));
    } catch (e) {
      setCalcResult("Format perhitungan tidak valid");
    }
  }

  // Helper untuk Inline Cell Editing Spreadsheet Excel
  // HANYA berlaku untuk level Header 1, Header 2, dan Detail Belanja. Level KRO s.d. Akun harus menggunakan tombol edit dialog box.
  function renderEditableCell(
    row: WorksheetRow,
    field: keyof WorksheetRow,
    displayValue: React.ReactNode,
    className = "",
    type: "text" | "number" = "text"
  ) {
    const isEditing = editingCell?.rowId === row.id && editingCell?.field === field;
    if (isEditing) {
      return (
        <input
          type={type}
          autoFocus
          value={row[field] !== undefined ? String(row[field]) : ""}
          onChange={(e) => {
            const val = type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value;
            handleCellChange(row.id, field, val);
          }}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              setEditingCell(null);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-full min-h-[22px] px-1 py-0.5 bg-white text-slate-900 border-2 border-emerald-500 rounded-none shadow-inner outline-none font-inherit text-inherit text-center"
        />
      );
    }

    // Klik 2x hanya dapat mengedit langsung pada level Header 1, Header 2, dan Detail Belanja
    const canInlineEdit = row.type === "subkomponen_sub" || row.type === "header1" || row.type === "header2" || row.type === "detail";

    return (
      <div
        onDoubleClick={(e) => {
          e.stopPropagation();
          setSelectedRowId(row.id);
          if (canInlineEdit) {
            setEditingCell({ rowId: row.id, field });
          } else {
            // Untuk level KRO s.d. Akun, arahkan untuk membuka dialog box
            handleToolbarEdit();
          }
        }}
        title={canInlineEdit ? "Klik 2x untuk edit langsung" : "Pilih baris dan gunakan icon Edit untuk mengubah data melalui dialog"}
        className={`w-full h-full min-h-[20px] ${canInlineEdit ? "cursor-text hover:outline-1 hover:outline-dashed hover:outline-emerald-400/80" : "cursor-pointer"} rounded-xs select-none ${className}`}
      >
        {displayValue}
      </div>
    );
  }

  // Helper render 5 kolom status baris: O, S, U, K, D
  function renderStatusCheckboxes(row: WorksheetRow) {
    return (
      <>
        {/* Kolom O: Operator */}
        <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center" title="O : Operator">
          <input
            type="checkbox"
            checked={!!(row.cO ?? row.c0)}
            onChange={() => {
              setSelectedRowId(row.id);
              handleToggleRowStatus(row.id, "cO");
            }}
            className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
          />
        </td>
        {/* Kolom S: Satker, approve Eselon II */}
        <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center" title="S : Satker, approve Eselon II">
          <input
            type="checkbox"
            checked={!!row.cS}
            onChange={() => {
              setSelectedRowId(row.id);
              handleToggleRowStatus(row.id, "cS");
            }}
            className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
          />
        </td>
        {/* Kolom U: Unit, approve Eselon I */}
        <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center" title="U : Unit, approve Eselon I">
          <input
            type="checkbox"
            checked={!!row.cU}
            onChange={() => {
              setSelectedRowId(row.id);
              handleToggleRowStatus(row.id, "cU");
            }}
            className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
          />
        </td>
        {/* Kolom K: Kementerian, approve BINCANG */}
        <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center" title="K : Kementerian, approve BINCANG">
          <input
            type="checkbox"
            checked={!!row.cK}
            onChange={() => {
              setSelectedRowId(row.id);
              handleToggleRowStatus(row.id, "cK");
            }}
            className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
          />
        </td>
        {/* Kolom D: DJA, approve Kementerian Keuangan */}
        <td className="p-1 text-center" title="D : DJA, approve Kementerian Keuangan">
          <input
            type="checkbox"
            checked={!!row.cD}
            onChange={() => {
              setSelectedRowId(row.id);
              handleToggleRowStatus(row.id, "cD");
            }}
            className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
          />
        </td>
      </>
    );
  }

  return (
    <div className={`min-h-full space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-slate-900 p-4 overflow-y-auto" : "p-4 sm:p-6 max-w-[1550px] mx-auto"}`}>
      
      {/* ── BREADCRUMB & TOP HEADER (Hanya Tampil saat Bukan Fullscreen) ── */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
              <span>Penganggaran & Biaya</span>
              <span>/</span>
              <span>Rencana Anggaran Biaya (RAB)</span>
              <span>/</span>
              <span className="text-[var(--primary)] font-semibold">Isian RAB</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
              <FileSpreadsheet className="h-6 w-6 text-[var(--primary)]" />
              <span>Lembar Kerja Isian Rencana Anggaran Biaya (RAB)</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Kertas kerja format resmi SAKTI / PATIH terintegrasi otomatis dengan <strong>Informasi Kinerja {activeUnit}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIdentitasKak(!showIdentitasKak)}
              className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>{showIdentitasKak ? "Sembunyikan Identitas Kinerja" : "Lihat Identitas Kinerja KAK"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showIdentitasKak ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      )}

      {/* ── IDENTITAS KINERJA ACCORDION ── */}
      {showIdentitasKak && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl p-5 space-y-3 text-xs animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-200 dark:border-indigo-800">
            <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Informasi Kinerja Unit Kerja: {activeUnit} ({ukSingkatan})</span>
            </span>
            <span className="font-mono text-[0.7rem] bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300 font-bold">
              Histori: {activeHistori.status_histori} ({activeHistori.kode_sts_history})
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700 dark:text-slate-300">
            <div>
              <span className="font-bold text-slate-500 block text-[0.68rem]">Program:</span>
              <span className="font-semibold">{identitasKinerja.program}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block text-[0.68rem]">Kegiatan:</span>
              <span className="font-semibold">{identitasKinerja.kegiatan}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block text-[0.68rem]">KRO &amp; RO:</span>
              <span className="font-semibold">{identitasKinerja.kro} &bull; {identitasKinerja.ro}</span>
            </div>
          </div>
        </div>
      )}

      {actionAlert && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAMPILAN UTAMA: WORKSHEET SAKTI / PATIH (PERSIS GAMBAR 1 & GAMBAR 2)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden flex flex-col font-sans">
        
        {/* ── BARIS KONTROL ATAS (2 BARIS SESUAI INSTRUKSI) ── */}
        <div className="p-2.5 bg-[#f8fafc] dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-2.5">
          
          {/* BARIS 1: Tombol '1. Isian KRO' s.d '4. Rekam Sub Komponen' */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleOpenAddModal("kro")}
              title="Isian KRO (Filter Informasi Kinerja Unit Kerja & Inisiatif Baru)"
              className="px-2.5 py-1.5 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-sm shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>1. Isian KRO</span>
            </button>
            <button
              onClick={() => handleOpenAddModal("ro")}
              title="Rekam RO (Hanya dapat ditambahkan di bawah level KRO)"
              className="px-2.5 py-1.5 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-sm shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>2. Rekam RO</span>
            </button>
            <button
              onClick={() => handleOpenAddModal("komponen")}
              title="3. Rekam Komponen (Hanya dapat ditambahkan di bawah level RO)"
              className="px-2.5 py-1.5 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-sm shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>3. Rekam Komponen</span>
            </button>
            <button
              onClick={() => handleOpenAddModal("subkomponen")}
              title="4. Rekam Sub Komponen (Hanya dapat ditambahkan di bawah level Komponen)"
              className="px-2.5 py-1.5 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-sm shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>4. Rekam Sub Komponen</span>
            </button>
          </div>

          {/* BARIS 2: Kiri (Tombol '5. Rekam Akun' s.d '+ Rekam Detail Belanja'), Tengah (Pagu Agregat), Kanan (Deretan Tombol Ikon 1 Baris) */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex-wrap lg:flex-nowrap">
            
            {/* Kiri: Tombol 5. Rekam Akun, 6. Header 1, 7. Header 2, + Rekam Detail Belanja */}
            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
              <button
                onClick={() => handleOpenAddModal("akun")}
                title="5. Rekam Akun (Hanya dapat ditambahkan di bawah level Sub Komponen)"
                className="px-2.5 py-1.5 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-sm shadow-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>5. Rekam Akun</span>
              </button>
              <button
                onClick={() => handleOpenAddModal("header1")}
                title="6. Rekam Header 1 (Hanya dapat ditambahkan di bawah level Akun Belanja)"
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 text-xs font-bold rounded-sm border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>6. Header 1</span>
              </button>
              <button
                onClick={() => handleOpenAddModal("header2")}
                title="7. Rekam Header 2 (Hanya dapat ditambahkan di bawah level Header 1)"
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 text-xs font-bold rounded-sm border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>7. Header 2</span>
              </button>
              <button
                onClick={() => handleOpenAddModal("detail")}
                title="Rekam Detail Belanja (Dapat ditambahkan di bawah Akun, Header 1, Header 2, atau sesama Detail)"
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-sm shadow-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Rekam Detail Belanja</span>
              </button>

              {/* Tombol Panduan Belanja Bahan (Akun 521211) */}
              <button
                onClick={() => {
                  const targetSubId = selectedRow?.type === "subkomponen" ? selectedRow.id : (targetSubkompRowId || null);
                  setTargetSubkompRowId(targetSubId);
                  setSelectedJenisBelanjaList([]);
                  setModalMode("panduan_jenis_belanja");
                }}
                title="Input dengan Panduan (7 Jenis Belanja Sesuai Panduan 2)"
                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-sm shadow-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Input dengan Panduan</span>
              </button>
            </div>

            {/* Tengah: Pagu Agregat Level Tertinggi Kertas Kerja */}
            <div className="flex items-center justify-center my-1 lg:my-0">
              <div className="text-xs font-bold text-slate-900 dark:text-amber-400 bg-[#fef08a] dark:bg-amber-950/60 px-3.5 py-1.5 rounded border border-amber-300 dark:border-amber-700 tracking-tight whitespace-nowrap shadow-xs">
                Pagu : Rp {displayPagu}
              </div>
            </div>

            {/* Kanan: 11 Tombol Ikon Berurutan (Tetap 1 Baris Sebelah Kanan) */}
            <div className="flex items-center gap-0.5 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded p-0.5 bg-white dark:bg-slate-800 shrink-0 flex-nowrap ml-auto">
              {/* Tombol 1: Search */}
              <button
                onClick={() => setShowSearchBar(!showSearchBar)}
                title="Pencarian / Search"
                className={`p-1.5 rounded transition-colors cursor-pointer ${showSearchBar ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Tombol 2: Calculator */}
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                title="Kalkulator / Calculator"
                className={`p-1.5 rounded transition-colors cursor-pointer ${showCalculator ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`}
              >
                <Calculator className="w-4 h-4" />
              </button>

              {/* Tombol 3: Icon untuk memilih 'Tayangkan Semua' atau 'Tayangkan s.d. Komponen' */}
              <div className="relative" ref={tayangkanMenuRef}>
                <button
                  onClick={() => setShowTayangkanMenu(!showTayangkanMenu)}
                  title="Pilihan Tayangan Kertas Kerja (Tayangkan Semua / s.d. Komponen)"
                  className={`p-1.5 rounded transition-colors cursor-pointer ${showTayangkanMenu ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                >
                  <ListFilter className="w-4 h-4" />
                </button>

                {/* Dropdown Menu Tayangkan */}
                {showTayangkanMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xl rounded-lg z-50 py-1.5 text-xs text-slate-800 dark:text-slate-100 font-semibold animate-in fade-in duration-100">
                    <button
                      onClick={() => {
                        setViewScope("semua");
                        setShowTayangkanMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-between ${viewScope === "semua" ? "font-bold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40" : ""}`}
                    >
                      <span>Tayangkan Semua</span>
                      {viewScope === "semua" && <span className="text-[0.65rem] bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300">Aktif</span>}
                    </button>
                    <button
                      onClick={() => {
                        setViewScope("komponen");
                        setShowTayangkanMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer leading-tight flex items-center justify-between ${viewScope === "komponen" ? "font-bold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40" : ""}`}
                    >
                      <div>
                        <div>Tayangkan s.d</div>
                        <div>Komponen</div>
                      </div>
                      {viewScope === "komponen" && <span className="text-[0.65rem] bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300">Aktif</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* Tombol Khusus: Checklist Massal Status Baris (O, S, U, K, D) */}
              <div className="relative" ref={checklistMassalMenuRef}>
                <button
                  onClick={() => setShowChecklistMassalMenu(!showChecklistMassalMenu)}
                  title="Checklist Massal Status Baris (O, S, U, K, D)"
                  className={`p-1.5 rounded transition-colors cursor-pointer ${showChecklistMassalMenu ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                >
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </button>

                {showChecklistMassalMenu && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xl rounded-lg z-50 py-1.5 text-xs text-slate-800 dark:text-slate-100 font-medium animate-in fade-in duration-100">
                    <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-700 text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider">
                      Checklist Massal Status
                    </div>
                    <button
                      onClick={() => handleChecklistMassalAll(true)}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Checklist Semua Status (O, S, U, K, D)</span>
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                    <button
                      onClick={() => {
                        handleToggleStatusMassal("cO");
                        setShowChecklistMassalMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>O : Operator</span>
                      <span className="text-[0.65rem] text-slate-400 font-mono">Toggle Semua</span>
                    </button>
                    <button
                      onClick={() => {
                        handleToggleStatusMassal("cS");
                        setShowChecklistMassalMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>S : Satker, approve Eselon II</span>
                      <span className="text-[0.65rem] text-slate-400 font-mono">Toggle Semua</span>
                    </button>
                    <button
                      onClick={() => {
                        handleToggleStatusMassal("cU");
                        setShowChecklistMassalMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>U : Unit, approve Eselon I</span>
                      <span className="text-[0.65rem] text-slate-400 font-mono">Toggle Semua</span>
                    </button>
                    <button
                      onClick={() => {
                        handleToggleStatusMassal("cK");
                        setShowChecklistMassalMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>K : Kementerian, approve BINCANG</span>
                      <span className="text-[0.65rem] text-slate-400 font-mono">Toggle Semua</span>
                    </button>
                    <button
                      onClick={() => {
                        handleToggleStatusMassal("cD");
                        setShowChecklistMassalMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>D : DJA, approve Kemenkeu</span>
                      <span className="text-[0.65rem] text-slate-400 font-mono">Toggle Semua</span>
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                    <button
                      onClick={() => handleChecklistMassalAll(false)}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <X className="w-3.5 h-3.5 text-rose-500" />
                      <span>Kosongkan / Uncheck Semua Status</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Tombol 4: Hapus baris */}
              <button
                onClick={handleDeleteSelected}
                title="Hapus Baris Terpilih"
                className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Tombol 5: Ubah/edit baris (Inline Spreadsheet Excel) */}
              <button
                onClick={handleToolbarEdit}
                title="Ubah / Edit Baris Terpilih (Langsung di Tabel seperti Excel)"
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer text-[#0078d4]"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {/* Tombol 6: Copy */}
              <button
                onClick={handleCopySelected}
                title="Salin / Copy Baris Terpilih"
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
              </button>

              {/* Tombol 7: Paste */}
              <button
                onClick={handlePaste}
                title="Tempelkan / Paste Baris"
                className={`p-1.5 rounded transition-colors cursor-pointer ${copiedRows.length > 0 ? "text-blue-600 hover:bg-blue-50" : "opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
              >
                <ClipboardPaste className="w-4 h-4" />
              </button>

              {/* Tombol 8: Print/cetak */}
              <button
                onClick={() => window.print()}
                title="Print / Cetak Worksheet"
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Tombol 9: Save/simpan */}
              <button
                onClick={handleSaveAndValidateWorksheet}
                title="Save / Simpan Data (Validasi Duplikasi & Urutkan Ascending)"
                className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-emerald-600 rounded transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
              </button>

              {/* Tombol 10: Refresh / Reset Data */}
              <button
                onClick={() => {
                  setWorksheetRows(initialWorksheet);
                  triggerAlert("Worksheet dikembalikan ke data awal.");
                }}
                title="Muat Ulang / Reset Data"
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Tombol 11: Close / Batal Seleksi */}
              <button
                onClick={() => setSelectedRowId("")}
                title="Close / Batal Pilihan Baris"
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Aplikasi Kalkulator Basic (Persis Gambar Referensi) */}
        {showCalculator && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
            <div className="bg-[#212124] text-white rounded-xl shadow-2xl border border-slate-700/80 w-[300px] overflow-hidden flex flex-col font-sans select-none animate-in fade-in zoom-in-95 duration-150">
              
              {/* Header Window Kalkulator (Undo, Basic ⌄, ☰, ─, □, ✕) */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-[#18181b] border-b border-slate-800 text-xs">
                <button
                  onClick={handleCalcUndo}
                  title="Undo aksi kalkulator terakhir"
                  className="text-slate-300 hover:text-white font-medium cursor-pointer text-xs"
                >
                  Undo
                </button>

                <div className="flex items-center gap-1 font-semibold text-slate-200">
                  <span>Basic</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <div className="flex items-center gap-2.5 text-slate-400">
                  <button title="Menu Kalkulator" className="hover:text-white cursor-pointer text-xs font-mono">
                    ☰
                  </button>
                  <button title="Minimize" className="hover:text-white cursor-pointer text-xs">
                    ─
                  </button>
                  <button title="Maximize" className="hover:text-white cursor-pointer text-xs">
                    □
                  </button>
                  <button
                    onClick={() => setShowCalculator(false)}
                    title="Close"
                    className="w-4 h-4 rounded-full bg-[#0078d4] hover:bg-[#006bbd] text-white flex items-center justify-center text-[0.65rem] font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Layar / Display Kalkulator */}
              <div className="p-4 bg-[#212124] flex flex-col justify-end min-h-[110px] text-right font-mono border-b border-slate-800/60">
                <div className="text-slate-400 text-xs min-h-[18px] overflow-x-auto tracking-wide">
                  {calcHistory.length > 0 ? calcHistory[calcHistory.length - 1] : ""}
                </div>
                <div className="text-3xl font-light text-white tracking-wider overflow-x-auto whitespace-nowrap mt-1">
                  {calcInput || "0"}
                </div>
              </div>

              {/* Grid Tombol Kalkulator (5 Kolom x 5 Baris Persis Gambar) */}
              <div className="p-3 bg-[#1e1e21] grid grid-cols-5 gap-1.5 text-sm font-medium">
                {/* Baris 1: [Backspace Merah]  [ ( ]  [ ) ]  [ mod ]  [ π ] */}
                <button
                  onClick={handleCalcBackspace}
                  title="Hapus Karakter Terakhir (Backspace)"
                  className="bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-lg h-11 flex items-center justify-center font-bold cursor-pointer transition-colors shadow-xs"
                >
                  ⌫
                </button>
                <button
                  onClick={() => handleCalcInput("(")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-slate-200 rounded-lg h-11 flex items-center justify-center cursor-pointer transition-colors"
                >
                  (
                </button>
                <button
                  onClick={() => handleCalcInput(")")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-slate-200 rounded-lg h-11 flex items-center justify-center cursor-pointer transition-colors"
                >
                  )
                </button>
                <button
                  onClick={() => handleCalcInput(" mod ")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-slate-200 rounded-lg h-11 flex items-center justify-center cursor-pointer transition-colors text-xs font-mono"
                >
                  mod
                </button>
                <button
                  onClick={() => handleCalcInput("π")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-slate-200 rounded-lg h-11 flex items-center justify-center cursor-pointer transition-colors font-serif"
                >
                  π
                </button>

                {/* Baris 2: [ 7 ]  [ 8 ]  [ 9 ]  [ ÷ ]  [ √ ] */}
                <button
                  onClick={() => handleCalcInput("7")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-white rounded-lg h-11 flex items-center justify-center font-semibold cursor-pointer transition-colors text-base"
                >
                  7
                </button>
                <button
                  onClick={() => handleCalcInput("8")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-white rounded-lg h-11 flex items-center justify-center font-semibold cursor-pointer transition-colors text-base"
                >
                  8
                </button>
                <button
                  onClick={() => handleCalcInput("9")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-white rounded-lg h-11 flex items-center justify-center font-semibold cursor-pointer transition-colors text-base"
                >
                  9
                </button>
                <button
                  onClick={() => handleCalcInput("÷")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-slate-300 rounded-lg h-11 flex items-center justify-center font-bold cursor-pointer transition-colors text-base"
                >
                  ÷
                </button>
                <button
                  onClick={handleCalcSqrt}
                  title="Akar kuadrat"
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-slate-300 rounded-lg h-11 flex items-center justify-center cursor-pointer transition-colors"
                >
                  √
                </button>

                {/* Baris 3: [ 4 ]  [ 5 ]  [ 6 ]  [ × ]  [ x² ] */}
                <button
                  onClick={() => handleCalcInput("4")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-white rounded-lg h-11 flex items-center justify-center font-semibold cursor-pointer transition-colors text-base"
                >
                  4
                </button>
                <button
                  onClick={() => handleCalcInput("5")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-white rounded-lg h-11 flex items-center justify-center font-semibold cursor-pointer transition-colors text-base"
                >
                  5
                </button>
                <button
                  onClick={() => handleCalcInput("6")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-white rounded-lg h-11 flex items-center justify-center font-semibold cursor-pointer transition-colors text-base"
                >
                  6
                </button>
                <button
                  onClick={() => handleCalcInput("×")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-slate-300 rounded-lg h-11 flex items-center justify-center font-bold cursor-pointer transition-colors text-base"
                >
                  ×
                </button>
                <button
                  onClick={handleCalcSquare}
                  title="Pangkat dua"
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-slate-300 rounded-lg h-11 flex items-center justify-center cursor-pointer transition-colors text-xs font-mono"
                >
                  x²
                </button>

                {/* Baris 4: [ 1 ]  [ 2 ]  [ 3 ]  [ - ]  [ = (rowSpan 2 hijau) ] */}
                <button
                  onClick={() => handleCalcInput("1")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-white rounded-lg h-11 flex items-center justify-center font-semibold cursor-pointer transition-colors text-base"
                >
                  1
                </button>
                <button
                  onClick={() => handleCalcInput("2")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-white rounded-lg h-11 flex items-center justify-center font-semibold cursor-pointer transition-colors text-base"
                >
                  2
                </button>
                <button
                  onClick={() => handleCalcInput("3")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-white rounded-lg h-11 flex items-center justify-center font-semibold cursor-pointer transition-colors text-base"
                >
                  3
                </button>
                <button
                  onClick={() => handleCalcInput("-")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-slate-300 rounded-lg h-11 flex items-center justify-center font-bold cursor-pointer transition-colors text-lg"
                >
                  -
                </button>
                <button
                  onClick={handleCalcEqual}
                  rowSpan={2}
                  title="Hitung Sama Dengan (=)"
                  className="row-span-2 bg-[#65a30d] hover:bg-[#4d7c0f] text-white rounded-lg flex items-center justify-center font-bold text-xl cursor-pointer transition-colors shadow-sm"
                >
                  =
                </button>

                {/* Baris 5: [ 0 ]  [ , ]  [ % ]  [ + ] */}
                <button
                  onClick={() => handleCalcInput("0")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-white rounded-lg h-11 flex items-center justify-center font-semibold cursor-pointer transition-colors text-base"
                >
                  0
                </button>
                <button
                  onClick={() => handleCalcInput(",")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-white rounded-lg h-11 flex items-center justify-center font-bold cursor-pointer transition-colors text-lg"
                >
                  ,
                </button>
                <button
                  onClick={() => handleCalcInput("%")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-slate-300 rounded-lg h-11 flex items-center justify-center cursor-pointer transition-colors"
                >
                  %
                </button>
                <button
                  onClick={() => handleCalcInput("+")}
                  className="bg-[#2c2c31] hover:bg-[#38383e] text-slate-300 rounded-lg h-11 flex items-center justify-center font-bold cursor-pointer transition-colors text-lg"
                >
                  +
                </button>
              </div>

              {/* Footer aksi kalkulator: Masukkan ke baris / Salin hasil */}
              <div className="p-2 bg-[#18181b] border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={handleCalcClear}
                  className="text-slate-400 hover:text-rose-400 text-[0.7rem] px-2 py-1"
                >
                  Clear (C)
                </button>
                {calcInput && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(calcInput);
                      triggerAlert(`Nilai ${calcInput} disalin ke clipboard!`);
                    }}
                    className="text-blue-400 hover:text-blue-300 font-medium text-[0.7rem] px-2 py-1"
                  >
                    Salin Nilai
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Kolom Pencarian Cepat jika dibuka */}
        {showSearchBar && (
          <div className="p-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Filter kode, uraian akun, atau nama item..."
              className="w-full max-w-sm px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none"
              autoFocus
            />
            {filterSearch && (
              <button onClick={() => setFilterSearch("")} className="text-xs text-slate-400 hover:text-slate-600">
                Reset
              </button>
            )}
            <span className="text-[0.68rem] text-slate-500 ml-auto">
              Menampilkan {visibleRows.length} baris ({viewScope === "komponen" ? "Mode s.d. Komponen" : "Mode Semua Baris"})
            </span>
          </div>
        )}

        {/* ── BLOCK AKUMULASI AKUN 3 DIGIT (DIATAS KOLOM KERTAS KERJA) ── */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0078d4]"></span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Akumulasi Akun 3 Digit Kertas Kerja
              </h4>
            </div>
            <span className="text-[0.68rem] text-slate-500 font-medium">
              Sesuai Bagan Akun Standar (BAS)
            </span>
          </div>

          {akumulasiAkun3Digit.length === 0 ? (
            <div className="p-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400 italic bg-white/50 dark:bg-slate-850/40">
              Belum ada baris Akun Belanja pada kertas kerja aktif. Tambahkan baris akun melalui tombol <strong>"5. Rekam Akun"</strong>.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {akumulasiAkun3Digit.map((item) => (
                <div
                  key={item.kode3}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-mono font-black text-xs text-[#0078d4] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                      {item.kode3}
                    </span>
                    <span className="text-[0.65rem] text-slate-400 uppercase font-bold tracking-tight">
                      3-Digit
                    </span>
                  </div>
                  <div className="text-[0.68rem] font-medium text-slate-600 dark:text-slate-300 line-clamp-2 leading-tight mb-1.5">
                    {item.nama3}
                  </div>
                  <div className="text-right font-mono font-bold text-xs text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-700/60">
                    Rp {formatRupiah(item.total)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── TABEL WORKSHEET RESMI DENGAN 6 KOLOM RINCIAN KOMPONEN I S.D. III (GAMBAR 2) ── */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-[0.7rem] sm:text-xs">
            {/* Header Biru Cerah SAKTI dengan Header Bertingkat untuk RINCIAN PERHITUNGAN */}
            <thead>
              <tr className="bg-[#2f80ed] text-white font-bold text-center border-b border-[#1d4ed8]">
                <th rowSpan={2} className="py-2 px-2.5 border-r border-blue-400/40 w-[95px] text-center font-bold">
                  KODE
                </th>
                <th rowSpan={2} className="py-2 px-3 border-r border-blue-400/40 text-left font-bold min-w-[280px]">
                  OUTPUT/SUBOUTPUT/KOMPONEN/SUBKOMPONEN
                </th>
                
                {/* 6 Kolom Rincian Perhitungan Komponen I s.d. Komponen III (Gambar 2) */}
                <th colSpan={6} className="py-1 px-2 border-r border-blue-400/40 text-center font-bold bg-[#2563eb]">
                  RINCIAN PERHITUNGAN
                </th>

                <th rowSpan={2} className="py-2 px-2 border-r border-blue-400/40 w-[55px] text-center font-bold">
                  VOL
                </th>
                <th rowSpan={2} className="py-2 px-2 border-r border-blue-400/40 w-[65px] text-center font-bold">
                  SATUAN
                </th>
                <th rowSpan={2} className="py-2 px-2.5 border-r border-blue-400/40 w-[105px] text-right font-bold">
                  BIAYA SATUAN
                </th>
                <th rowSpan={2} className="py-2 px-2.5 border-r border-blue-400/40 w-[115px] text-right font-bold">
                  JUMLAH
                </th>
                <th rowSpan={2} className="py-2 px-1 border-r border-blue-400/40 w-[30px] text-center font-bold">
                  *T
                </th>
                <th rowSpan={2} className="py-2 px-1 border-r border-blue-400/40 w-[36px] text-center font-bold">
                  SD
                </th>
                {/* 5 Kolom Status Baris: O, S, U, K, D dengan Checklist Massal di Header */}
                <th rowSpan={2} className="py-1 px-1 border-r border-blue-400/40 w-[28px] text-center font-bold" title="O : Operator">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[0.72rem]">O</span>
                    <input
                      type="checkbox"
                      title="Checklist Massal: Operator (O)"
                      checked={visibleRows.length > 0 && visibleRows.every((r) => !!(r.cO ?? r.c0))}
                      onChange={() => handleToggleStatusMassal("cO")}
                      className="w-3 h-3 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </th>
                <th rowSpan={2} className="py-1 px-1 border-r border-blue-400/40 w-[28px] text-center font-bold" title="S : Satker, approve Eselon II">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[0.72rem]">S</span>
                    <input
                      type="checkbox"
                      title="Checklist Massal: Satker, approve Eselon II (S)"
                      checked={visibleRows.length > 0 && visibleRows.every((r) => !!r.cS)}
                      onChange={() => handleToggleStatusMassal("cS")}
                      className="w-3 h-3 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </th>
                <th rowSpan={2} className="py-1 px-1 border-r border-blue-400/40 w-[28px] text-center font-bold" title="U : Unit, approve Eselon I">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[0.72rem]">U</span>
                    <input
                      type="checkbox"
                      title="Checklist Massal: Unit, approve Eselon I (U)"
                      checked={visibleRows.length > 0 && visibleRows.every((r) => !!r.cU)}
                      onChange={() => handleToggleStatusMassal("cU")}
                      className="w-3 h-3 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </th>
                <th rowSpan={2} className="py-1 px-1 border-r border-blue-400/40 w-[28px] text-center font-bold" title="K : Kementerian, approve BINCANG">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[0.72rem]">K</span>
                    <input
                      type="checkbox"
                      title="Checklist Massal: Kementerian, approve BINCANG (K)"
                      checked={visibleRows.length > 0 && visibleRows.every((r) => !!r.cK)}
                      onChange={() => handleToggleStatusMassal("cK")}
                      className="w-3 h-3 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </th>
                <th rowSpan={2} className="py-1 px-1 w-[28px] text-center font-bold" title="D : DJA, approve Kementerian Keuangan">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[0.72rem]">D</span>
                    <input
                      type="checkbox"
                      title="Checklist Massal: DJA, approve Kementerian Keuangan (D)"
                      checked={visibleRows.length > 0 && visibleRows.every((r) => !!r.cD)}
                      onChange={() => handleToggleStatusMassal("cD")}
                      className="w-3 h-3 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </th>
              </tr>

              {/* Sub-Header Kolom Komponen I s.d. III */}
              <tr className="bg-[#2563eb] text-white font-bold text-center border-b border-[#1d4ed8] text-[0.68rem]">
                <th colSpan={2} className="py-1 px-1.5 border-r border-blue-400/40 min-w-[70px]">
                  Komponen I
                </th>
                <th colSpan={2} className="py-1 px-1.5 border-r border-blue-400/40 min-w-[70px]">
                  Komponen II
                </th>
                <th colSpan={2} className="py-1 px-1.5 border-r border-blue-400/40 min-w-[70px]">
                  Komponen III
                </th>
              </tr>
            </thead>

            {/* Isi Baris Worksheet Spreadsheet Excel */}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/80">
              {visibleRows.map((row) => {
                const isSelected = selectedRowId === row.id;
                const isDuplicate = duplicateRowIds.includes(row.id);

                // Badge duplikat merah yang kontras dan jelas
                const duplicateBadge = isDuplicate ? (
                  <span className="inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded text-[0.62rem] font-bold bg-rose-600 text-white shadow-xs shrink-0 tracking-wide">
                    ⚠️ Duplikat
                  </span>
                ) : null;

                // 1. Tipe: PROGRAM
                if (row.type === "program") {
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#0078d4] text-white"
                          : isDuplicate
                          ? "bg-rose-100/90 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 border-l-4 border-l-rose-600"
                          : "hover:bg-amber-50/50"
                      }`}
                    >
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-mono font-bold ${isSelected ? "bg-[#006bbd] text-white" : isDuplicate ? "bg-rose-200/90 dark:bg-rose-900/80 text-rose-950 dark:text-rose-100" : "bg-slate-200/80 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200"}`}>
                        {renderEditableCell(row, "kode", row.kode, "font-mono font-bold text-center")}
                      </td>
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-bold ${isSelected ? "bg-[#0078d4] text-white" : isDuplicate ? "bg-rose-100/90 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100" : "bg-[#fef9c3] dark:bg-yellow-950/40 text-slate-900 dark:text-yellow-200"}`}>
                        <div className="flex items-center justify-between">
                          <span>{renderEditableCell(row, "uraian", row.uraian, "font-bold text-left")}</span>
                          {duplicateBadge}
                        </div>
                      </td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center w-[35px]"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center w-[35px]"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center w-[35px]"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center w-[35px]"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center w-[35px]"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center w-[35px]"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right font-bold tabular-nums">
                        {renderEditableCell(row, "jumlah", formatRupiah(row.jumlah), "text-right font-bold tabular-nums", "number")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      {renderStatusCheckboxes(row)}
                    </tr>
                  );
                }

                // 2. Tipe: KEGIATAN
                if (row.type === "kegiatan") {
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#0078d4] text-white"
                          : isDuplicate
                          ? "bg-rose-100/90 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 border-l-4 border-l-rose-600"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-mono font-bold text-center ${isSelected ? "bg-[#006bbd] text-white" : isDuplicate ? "bg-rose-200/90 dark:bg-rose-900/80 text-rose-950 dark:text-rose-100" : "bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100"}`}>
                        {renderEditableCell(row, "kode", row.kode, "font-mono font-bold text-center")}
                      </td>
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 underline font-semibold ${isDuplicate && !isSelected ? "bg-rose-100/90 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100" : ""}`}>
                        <div className="flex items-center justify-between">
                          <span>{renderEditableCell(row, "uraian", row.uraian, "underline font-semibold text-left")}</span>
                          {duplicateBadge}
                        </div>
                      </td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right font-bold underline tabular-nums">
                        {renderEditableCell(row, "jumlah", formatRupiah(row.jumlah), "text-right font-bold underline tabular-nums", "number")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      {renderStatusCheckboxes(row)}
                    </tr>
                  );
                }

                // 3. Tipe: KRO
                if (row.type === "kro") {
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#0078d4] text-white"
                          : isDuplicate
                          ? "bg-rose-100/90 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 border-l-4 border-l-rose-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-mono text-center ${isSelected ? "bg-[#006bbd] text-white" : isDuplicate ? "bg-rose-200/90 dark:bg-rose-900/80 text-rose-950 dark:text-rose-100 font-semibold" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"}`}>
                        {renderEditableCell(row, "kode", row.kode, "font-mono text-center font-semibold")}
                      </td>
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 ${isDuplicate && !isSelected ? "bg-rose-100/90 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100" : ""}`}>
                        <div className="flex items-center justify-between">
                          <div className="italic font-medium">
                            {renderEditableCell(row, "uraian", row.uraian, "italic font-medium text-left")}
                          </div>
                          {duplicateBadge}
                        </div>
                        {row.subUraian && (
                          <div className={`text-[0.65rem] ${isSelected ? "text-blue-100" : isDuplicate ? "text-rose-800 dark:text-rose-300 font-medium" : "text-slate-500 dark:text-slate-400"}`}>
                            {renderEditableCell(row, "subUraian", row.subUraian, "text-[0.65rem] text-left")}
                          </div>
                        )}
                      </td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center tabular-nums">
                        {renderEditableCell(row, "vol", row.vol, "text-center tabular-nums", "number")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 italic">
                        {renderEditableCell(row, "sat", row.sat, "text-center italic")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right italic font-semibold tabular-nums">
                        {renderEditableCell(row, "jumlah", formatRupiah(row.jumlah), "text-right italic font-semibold tabular-nums", "number")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      {renderStatusCheckboxes(row)}
                    </tr>
                  );
                }

                // 4. Tipe: RO
                if (row.type === "ro") {
                  const isOverLimit = row.isSbk && row.maxAnggaranRo && Number(row.jumlah) > row.maxAnggaranRo;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#0078d4] text-white"
                          : isDuplicate
                          ? "bg-rose-100/90 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 border-l-4 border-l-rose-600"
                          : isOverLimit
                          ? "bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100/80"
                          : "hover:bg-amber-50/40"
                      }`}
                    >
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-mono text-center ${
                        isSelected
                          ? "bg-[#006bbd] text-white"
                          : isDuplicate
                          ? "bg-rose-200/90 dark:bg-rose-900/80 text-rose-950 dark:text-rose-100 font-bold"
                          : isOverLimit
                          ? "bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-100 font-bold"
                          : "bg-[#fef08a] dark:bg-yellow-950/60 text-slate-900 dark:text-yellow-200 font-bold"
                      }`}>
                        {renderEditableCell(row, "kode", row.kode, "font-mono font-bold text-center")}
                      </td>
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 ${
                        isSelected
                          ? ""
                          : isDuplicate
                          ? "bg-rose-100/90 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100 font-bold"
                          : isOverLimit
                          ? "bg-rose-50 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100 font-bold"
                          : "bg-[#fef9c3] dark:bg-yellow-950/40 font-bold text-slate-900 dark:text-yellow-100"
                      }`}>
                        <div className="font-semibold flex items-center gap-1.5 flex-wrap">
                          <span className="flex-1">
                            {renderEditableCell(row, "uraian", row.uraian, "font-semibold text-left")}
                          </span>
                          {duplicateBadge}
                          {row.isSbk && (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.62rem] font-bold shadow-xs ${
                              isSelected
                                ? "bg-amber-300 text-slate-900"
                                : row.sbkKelompok === "SBKK"
                                ? "bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700"
                                : "bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-700"
                            }`}>
                              <span>● {row.sbkKelompok || "SBK"}</span>
                              {row.sbkKode && <span className="font-mono text-[0.6rem] opacity-75">({row.sbkKode})</span>}
                            </span>
                          )}
                          {row.badge && !row.isSbk && (
                            <span className={`font-bold text-xs ${isSelected ? "text-yellow-200" : "text-fuchsia-700 dark:text-fuchsia-400"}`}>
                              {row.badge}
                            </span>
                          )}
                        </div>
                        {row.subUraian && (
                          <div className={`text-[0.65rem] ${isSelected ? "text-blue-100" : isOverLimit || isDuplicate ? "text-rose-700 dark:text-rose-300 font-semibold" : "text-slate-500 dark:text-slate-400 font-normal"}`}>
                            {renderEditableCell(row, "subUraian", row.subUraian, "text-[0.65rem] text-left")}
                          </div>
                        )}
                        {isOverLimit && (
                          <div className="text-[0.65rem] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                            ⚠️ Melebihi Batas SBK Maksimal: Rp {formatRupiah(row.maxAnggaranRo || 0)} (Selisih: +Rp {formatRupiah(Number(row.jumlah) - (row.maxAnggaranRo || 0))})
                          </div>
                        )}
                      </td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center tabular-nums">
                        {renderEditableCell(row, "vol", row.vol, "text-center tabular-nums", "number")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700">
                        {renderEditableCell(row, "sat", row.sat, "text-center")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right"></td>
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 text-right font-bold tabular-nums ${isOverLimit && !isSelected ? "text-rose-600 dark:text-rose-400" : ""}`}>
                        {renderEditableCell(row, "jumlah", formatRupiah(row.jumlah), "text-right font-bold tabular-nums", "number")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      {renderStatusCheckboxes(row)}
                    </tr>
                  );
                }

                // 5. Tipe: KOMPONEN (Kode 052 / 52 Highlight Biru Muda persis Gambar 2, Murni Spreadsheet tanpa tulisan drill-up/down)
                if (row.type === "komponen") {
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#0078d4] text-white"
                          : isDuplicate
                          ? "bg-rose-100/90 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 border-l-4 border-l-rose-600"
                          : "hover:bg-blue-50/60"
                      }`}
                    >
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-mono font-bold text-center ${
                        isSelected
                          ? "bg-[#006bbd] text-white"
                          : isDuplicate
                          ? "bg-rose-200/90 dark:bg-rose-900/80 text-rose-950 dark:text-rose-100"
                          : "bg-[#dbeafe] dark:bg-blue-950/60 text-blue-900 dark:text-blue-200"
                      }`}>
                        {renderEditableCell(row, "kode", row.kode, "font-mono font-bold text-center")}
                      </td>
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-bold ${
                        isSelected
                          ? ""
                          : isDuplicate
                          ? "bg-rose-100/90 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100"
                          : "bg-[#e0e7ff] dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span>{renderEditableCell(row, "uraian", row.uraian, "font-bold text-left")}</span>
                          {duplicateBadge}
                        </div>
                      </td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center font-bold tabular-nums">
                        {renderEditableCell(row, "vol", row.vol, "text-center font-bold tabular-nums", "number")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right font-bold tabular-nums">
                        {renderEditableCell(row, "jumlah", formatRupiah(row.jumlah), "text-right font-bold tabular-nums", "number")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      {renderStatusCheckboxes(row)}
                    </tr>
                  );
                }

                // 6. Tipe: SUBKOMPONEN (Huruf A Miring)
                if (row.type === "subkomponen") {
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#0078d4] text-white"
                          : isDuplicate
                          ? "bg-rose-100/90 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 border-l-4 border-l-rose-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-mono italic text-center font-bold ${isDuplicate && !isSelected ? "bg-rose-200/90 dark:bg-rose-900/80 text-rose-950 dark:text-rose-100" : ""}`}>
                        {renderEditableCell(row, "kode", row.kode, "font-mono italic text-center font-bold")}
                      </td>
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 italic font-medium ${isDuplicate && !isSelected ? "bg-rose-100/90 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100" : ""}`}>
                        <div className="flex items-center justify-between">
                          <span>{renderEditableCell(row, "uraian", row.uraian, "italic font-medium text-left")}</span>
                          {duplicateBadge}
                        </div>
                      </td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right italic font-semibold tabular-nums">
                        {renderEditableCell(row, "jumlah", formatRupiah(row.jumlah), "text-right italic font-semibold tabular-nums", "number")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      {renderStatusCheckboxes(row)}
                    </tr>
                  );
                }

                // 7. Tipe: AKUN BELANJA (521211, 521219, Underlined)
                if (row.type === "akun") {
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#0078d4] text-white"
                          : isDuplicate
                          ? "bg-rose-100/90 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 border-l-4 border-l-rose-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-mono font-bold underline ${isDuplicate && !isSelected ? "bg-rose-200/90 dark:bg-rose-900/80 text-rose-950 dark:text-rose-100" : ""}`}>
                        {renderEditableCell(row, "kode", row.kode, "font-mono font-bold underline text-center")}
                      </td>
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-bold ${isDuplicate && !isSelected ? "bg-rose-100/90 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100" : ""}`}>
                        <div className="flex items-center justify-between">
                          <div>{renderEditableCell(row, "uraian", row.uraian, "font-bold text-left")}</div>
                          {duplicateBadge}
                        </div>
                        {row.subUraian && (
                          <div className={`text-[0.65rem] font-normal ${isSelected ? "text-blue-100" : isDuplicate ? "text-rose-800 dark:text-rose-300 font-medium" : "text-slate-500 dark:text-slate-400"}`}>
                            {renderEditableCell(row, "subUraian", row.subUraian, "text-[0.65rem] text-left")}
                          </div>
                        )}
                      </td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right font-bold tabular-nums">
                        {renderEditableCell(row, "jumlah", formatRupiah(row.jumlah), "text-right font-bold tabular-nums", "number")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center font-bold font-mono">
                        {renderEditableCell(row, "sd", row.sd || "A00", "font-bold font-mono text-center")}
                      </td>
                      {renderStatusCheckboxes(row)}
                    </tr>
                  );
                }

                // 8. Tipe: SUBKOMPONEN SUB-LEVEL (misal: > Singapore, > Taiwan) & HEADER 1 / HEADER 2
                if (row.type === "subkomponen_sub" || row.type === "header1" || row.type === "header2") {
                  const indentClass =
                    row.type === "header2" || row.headerLevel === 2
                      ? "pl-8 text-slate-700 dark:text-slate-300 font-semibold"
                      : "pl-4 text-slate-900 dark:text-white font-bold";
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#0078d4] text-white"
                          : isDuplicate
                          ? "bg-rose-100/90 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 border-l-4 border-l-rose-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 ${isDuplicate && !isSelected ? "bg-rose-200/90 dark:bg-rose-900/80" : ""}`}></td>
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 ${indentClass} ${isDuplicate && !isSelected ? "bg-rose-100/90 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100" : ""}`}>
                        <div className="flex items-center justify-between">
                          <span>{renderEditableCell(row, "uraian", row.uraian, `${indentClass} text-left pl-2`)}</span>
                          {duplicateBadge}
                        </div>
                      </td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right font-bold tabular-nums">
                        {renderEditableCell(row, "jumlah", formatRupiah(row.jumlah), "text-right font-bold tabular-nums", "number")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center"></td>
                      {renderStatusCheckboxes(row)}
                    </tr>
                  );
                }

                // 9. Tipe: DETAIL BELANJA (Item Level - Rincian Komponen I s.d. III Editable ala Spreadsheet Excel)
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedRowId(row.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#0078d4] text-white font-medium shadow-inner"
                        : isDuplicate
                        ? "bg-rose-100/90 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 border-l-4 border-l-rose-600 font-semibold"
                        : "hover:bg-blue-50/40 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <td className={`p-2 border-r border-slate-200 dark:border-slate-700 text-center ${isDuplicate && !isSelected ? "bg-rose-200/90 dark:bg-rose-900/80" : ""}`}>
                      {renderEditableCell(row, "kode", row.kode, "text-center font-mono")}
                    </td>
                    <td className={`p-2 border-r border-slate-200 dark:border-slate-700 pl-6 font-mono text-[0.72rem] ${isDuplicate && !isSelected ? "bg-rose-100/90 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span>{renderEditableCell(row, "uraian", row.uraian, "text-left font-mono")}</span>
                        {duplicateBadge}
                      </div>
                    </td>

                    {/* 6 KOLOM RINCIAN PERHITUNGAN: Komponen I s.d. III (Editable Excel) */}
                    {/* Komponen I (Nilai & Satuan) */}
                    <td className={`p-1 border-r border-slate-200 dark:border-slate-700 text-center tabular-nums font-mono ${!isSelected && (row.k1Nilai === 1 || row.k1Nilai === 18) ? "bg-[#fef08a] text-slate-900 font-bold" : ""}`}>
                      {renderEditableCell(row, "k1Nilai", row.k1Nilai !== undefined ? row.k1Nilai : "", "text-center font-mono tabular-nums", "number")}
                    </td>
                    <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center font-mono text-[0.68rem]">
                      {renderEditableCell(row, "k1Sat", row.k1Sat || "", "text-center font-mono text-[0.68rem]")}
                    </td>

                    {/* Komponen II (Nilai & Satuan) */}
                    <td className={`p-1 border-r border-slate-200 dark:border-slate-700 text-center tabular-nums font-mono ${!isSelected && (row.k2Nilai === 45 || row.k2Nilai === 29) ? "bg-[#fef08a] text-slate-900 font-bold" : ""}`}>
                      {renderEditableCell(row, "k2Nilai", row.k2Nilai !== undefined ? row.k2Nilai : "", "text-center font-mono tabular-nums", "number")}
                    </td>
                    <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center font-mono text-[0.68rem]">
                      {renderEditableCell(row, "k2Sat", row.k2Sat || "", "text-center font-mono text-[0.68rem]")}
                    </td>

                    {/* Komponen III (Nilai & Satuan) */}
                    <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center tabular-nums font-mono">
                      {renderEditableCell(row, "k3Nilai", row.k3Nilai !== undefined ? row.k3Nilai : "", "text-center font-mono tabular-nums", "number")}
                    </td>
                    <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center font-mono text-[0.68rem]">
                      {renderEditableCell(row, "k3Sat", row.k3Sat || "", "text-center font-mono text-[0.68rem]")}
                    </td>

                    {/* VOL Total */}
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center font-bold tabular-nums">
                      {renderEditableCell(row, "vol", row.vol, "text-center font-bold tabular-nums", "number")}
                    </td>
                    {/* SATUAN Akhir */}
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center font-bold">
                      {renderEditableCell(row, "sat", row.sat, "text-center font-bold")}
                    </td>
                    {/* BIAYA SATUAN */}
                    <td className={`p-2 border-r border-slate-200 dark:border-slate-700 text-right tabular-nums ${!isSelected && row.harga ? "bg-[#fef08a] text-slate-900 font-semibold" : ""}`}>
                      {renderEditableCell(row, "harga", row.harga ? formatRupiah(row.harga) : "-", "text-right tabular-nums", "number")}
                    </td>
                    {/* JUMLAH */}
                    <td className={`p-2 border-r border-slate-200 dark:border-slate-700 text-right font-bold tabular-nums ${!isSelected && (row.jumlah === 64443000 || row.jumlah === 266000) ? "bg-[#fef08a] text-slate-900" : ""}`}>
                      {renderEditableCell(row, "jumlah", formatRupiah(row.jumlah), "text-right font-bold tabular-nums", "number")}
                    </td>

                    {/* Status Checkbox *T, SD */}
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center font-mono text-xs">
                      {renderEditableCell(row, "tStar", row.tStar || "", "text-center font-mono")}
                    </td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center font-mono text-xs">
                      {renderEditableCell(row, "sd", row.sd || "", "text-center font-mono")}
                    </td>

                    {/* 5 Kolom Status Checkbox: O, S, U, K, D */}
                    {renderStatusCheckboxes(row)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── FOOTER STATUS BARIS WORKSHEET ── */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <span>Tingkat Tampilan: <strong className="text-slate-900 dark:text-slate-100">{viewScope === "komponen" ? "s.d. Komponen" : "Semua Rincian Belanja"}</strong></span>
            <span>&bull;</span>
            <span>Baris Terpilih: <strong className="text-slate-900 dark:text-slate-100">{selectedRowId ? worksheetRows.find((r) => r.id === selectedRowId)?.uraian || selectedRowId : "Belum ada"}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {selectedRowId && (
              <button
                onClick={handleDeleteSelected}
                className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-800 font-semibold cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Baris</span>
              </button>
            )}
            <div className="font-bold text-slate-800 dark:text-slate-200">
              Total Rincian: <span className="text-[var(--primary)] font-black tabular-nums">Rp {formatRupiah(totalPaguDetail)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL KONFIRMASI TINDAKAN KRO (Edit KRO atau Tambah KRO Baru)
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "konfirmasi_kro" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span>Konfirmasi Tindakan KRO</span>
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 block font-medium">Baris KRO Aktif:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                  {selectedRow?.kode}
                </span>
                <span className="text-slate-800 dark:text-slate-200 block mt-0.5 font-medium">
                  {selectedRow?.uraian}
                </span>
              </div>
              <p className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 leading-relaxed font-medium">
                Di bawah KRO ini sudah terdapat minimal 1 baris level RO. Apakah Anda ingin <strong>mengubah (edit)</strong> data KRO ini atau <strong>menambah KRO baru</strong>?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedRow) {
                    setEditingRowId(selectedRow.id);
                    const parts = selectedRow.kode.split(".");
                    const kroCode = parts.length > 1 ? parts[parts.length - 1] : selectedRow.kode;
                    setFormKroDialog((prev) => ({
                      ...prev,
                      kroKode: kroCode,
                      kroNama: selectedRow.uraian,
                      volume: selectedRow.vol || prev.volume,
                    }));
                    setModalMode("kro");
                  }
                }}
                className="p-3.5 border-2 border-amber-500 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 rounded-xl text-left transition-all cursor-pointer group shadow-xs hover:shadow"
              >
                <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400 mb-1 text-xs">
                  <PenTool className="w-4 h-4" />
                  <span>1. Edit KRO</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Buka formulir untuk mengubah data KRO pada baris yang aktif saat ini.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingRowId(null);
                  setModalMode("kro");
                }}
                className="p-3.5 border-2 border-emerald-600 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 rounded-xl text-left transition-all cursor-pointer group shadow-xs hover:shadow"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 mb-1 text-xs">
                  <Plus className="w-4 h-4" />
                  <span>2. Tambah KRO Baru</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Buka formulir untuk menambahkan KRO baru pada baris berikutnya.
                </p>
              </button>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: FORM REKAM PROGRAM, AKTIVITAS, KRO (Persis Gambar Pengguna)
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "kro" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Form Rekam Program, Aktivitas, KRO
              </h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-800 dark:text-slate-200">
              {/* Program */}
              <div className="flex items-center gap-2">
                <span className="w-28 font-bold text-slate-700 dark:text-slate-300">Program</span>
                <input
                  type="text"
                  readOnly
                  value={formKroDialog.prog1}
                  className="w-16 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-center"
                />
                <input
                  type="text"
                  readOnly
                  value={formKroDialog.prog2}
                  className="w-16 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-center"
                />
                <input
                  type="text"
                  readOnly
                  value={formKroDialog.prog3}
                  className="w-16 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-center"
                />
                <span className="text-[0.7rem] text-slate-500 font-medium truncate max-w-xs">{formKroDialog.progUraian}</span>
              </div>

              {/* Aktivitas */}
              <div className="flex items-center gap-2">
                <span className="w-28 font-bold text-slate-700 dark:text-slate-300">Aktivitas</span>
                <input
                  type="text"
                  readOnly
                  value={formKroDialog.aktivitasKode}
                  className="w-20 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-center"
                />
                <span className="text-[0.7rem] text-slate-500 font-medium truncate max-w-xs">{formKroDialog.aktivitasUraian}</span>
              </div>

              {/* Fungsi & Sub Fungsi */}
              <div className="pl-28 space-y-1 text-slate-600 dark:text-slate-400">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Fungsi:</span> {formKroDialog.fungsiText}
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Sub Fungsi:</span> {formKroDialog.subFungsiText}
                </div>
              </div>

              {/* KRO */}
              <div className="flex items-center gap-2">
                <span className="w-28 font-bold text-slate-700 dark:text-slate-300">KRO</span>
                <input
                  type="text"
                  readOnly
                  value={formKroDialog.kroKode}
                  className="w-20 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-center"
                />
                <button
                  type="button"
                  onClick={() => setShowKroPickerModal(true)}
                  className="px-2.5 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 rounded font-bold cursor-pointer transition-colors"
                >
                  ...
                </button>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formKroDialog.kroNama}</span>
              </div>

              {/* KodeIB */}
              <div className="flex items-center gap-2">
                <span className="w-28 font-bold text-slate-700 dark:text-slate-300">KodeIB</span>
                <input
                  type="text"
                  readOnly
                  value={formKroDialog.kodeIB}
                  className="w-20 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-center"
                />
                <button
                  type="button"
                  onClick={() => setShowIbPickerModal(true)}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-400 rounded font-bold cursor-pointer transition-colors"
                >
                  ...
                </button>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formKroDialog.kodeIBUraian}</span>
              </div>

              {/* Lokasi */}
              <div className="flex items-center gap-2">
                <span className="w-28 font-bold text-slate-700 dark:text-slate-300">Lokasi</span>
                <input
                  type="text"
                  readOnly
                  value={formKroDialog.lokasi1}
                  className="w-16 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-center"
                />
                <input
                  type="text"
                  readOnly
                  value={formKroDialog.lokasi2}
                  className="w-16 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-center"
                />
                <button
                  type="button"
                  onClick={() => setShowLokasiPickerModal(true)}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-400 rounded font-bold cursor-pointer transition-colors"
                >
                  ...
                </button>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formKroDialog.lokasiNama}</span>
              </div>

              {/* Kewenangan */}
              <div className="flex items-center gap-2">
                <span className="w-28 font-bold text-slate-700 dark:text-slate-300">Kewenangan</span>
                <input
                  type="text"
                  readOnly
                  value={formKroDialog.kewenanganKode}
                  className="w-20 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-center"
                />
                <button
                  type="button"
                  onClick={() => setShowKewenanganPickerModal(true)}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-400 rounded font-bold cursor-pointer transition-colors"
                >
                  ...
                </button>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formKroDialog.kewenanganNama}</span>
              </div>

              {/* Volume* */}
              <div className="flex items-center gap-2">
                <span className="w-28 font-bold text-slate-700 dark:text-slate-300">Volume*</span>
                <input
                  type="number"
                  value={formKroDialog.volume}
                  onChange={(e) => setFormKroDialog({ ...formKroDialog, volume: Number(e.target.value) })}
                  className="w-20 px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded font-bold text-center"
                />
              </div>

              {/* Checkbox hitung otomatis value dari item */}
              <div className="pt-1 flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-[0.7rem]">*diisi manual di RO atau</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[0.72rem] font-medium text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={formKroDialog.hitungOtomatis}
                    onChange={(e) => setFormKroDialog({ ...formKroDialog, hitungOtomatis: e.target.checked })}
                    className="w-3.5 h-3.5 accent-[#0078d4]"
                  />
                  <span>hitung otomatis value dari item</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmKro}
                className="px-5 py-2 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-MODAL: PILIH KRO (Difilter Sesuai Informasi Kinerja Unit Kerja pada TOR) ── */}
      {showKroPickerModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pilih KRO ({activeUnit} - {ukSingkatan})
              </h3>
              <button onClick={() => setShowKroPickerModal(false)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg text-xs text-blue-900 dark:text-blue-200">
              Daftar KRO otomatis difilter dari <strong>Informasi Kinerja {activeUnit}</strong> sesuai Kerangka Acuan Kerja (TOR).
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-xs max-h-60 overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold sticky top-0">
                    <th className="p-2.5 text-left border-r border-slate-300 dark:border-slate-700 w-32">Kode KRO</th>
                    <th className="p-2.5 text-left border-r border-slate-300 dark:border-slate-700">Deskripsi / Uraian KRO</th>
                    <th className="p-2.5 text-center w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {(() => {
                    const kroMap = new Map<string, { kodeAktivitas: string; aktivitasUraian: string; kodeKro: string; namaKro: string; prog1: string; prog2: string; prog3: string; progUraian: string }>();

                    filteredInformasiKinerja.forEach((ik) => {
                      const p = parseInformasiKinerjaRow(ik);
                      const key = `${p.aktivitasKode}.${p.kroKode}`;
                      if (!kroMap.has(key)) {
                        kroMap.set(key, {
                          kodeAktivitas: p.aktivitasKode,
                          aktivitasUraian: p.aktivitasUraian,
                          kodeKro: p.kroKode,
                          namaKro: p.kroNama,
                          prog1: p.prog1,
                          prog2: p.prog2,
                          prog3: p.prog3,
                          progUraian: p.progUraian,
                        });
                      }
                    });

                    // Set kumpulan KRO yang sudah ada di kertas kerja saat ini
                    const existingKroCodes = new Set(
                      worksheetRows
                        .filter((r) => r.type === "kro")
                        .map((r) => (r.kode || "").trim().toUpperCase())
                    );
                    const editingRow = editingRowId ? worksheetRows.find((r) => r.id === editingRowId) : null;
                    const editingKroCode = (editingRow?.kode || "").trim().toUpperCase();

                    return Array.from(kroMap.values()).map((kroItem, idx) => {
                      const kodeAktivitasClean = (kroItem.kodeAktivitas || "").trim().toUpperCase();
                      const kodeKroClean = (kroItem.kodeKro || "").trim().toUpperCase();
                      const itemFullKroKode = `${kodeAktivitasClean}.${kodeKroClean}`;
                      const isAlreadyInWorksheet =
                        existingKroCodes.has(itemFullKroKode) ||
                        Array.from(existingKroCodes).some((c) => (kodeKroClean && (c.endsWith(`.${kodeKroClean}`) || c === kodeKroClean)));
                      
                      // Jika sedang mengedit KRO yang sama, jangan disable KRO miliknya sendiri
                      const isDisabled = isAlreadyInWorksheet && (!editingKroCode || (editingKroCode !== itemFullKroKode && (!kodeKroClean || !editingKroCode.endsWith(`.${kodeKroClean}`))));

                      return (
                        <tr
                          key={idx}
                          onClick={() => {
                            if (isDisabled) {
                              triggerAlert(`KRO ${kroItem.kodeAktivitas}.${kroItem.kodeKro} sudah ada di kertas kerja! Pilih KRO lain.`);
                              return;
                            }
                            setFormKroDialog((prev) => ({
                              ...prev,
                              prog1: kroItem.prog1,
                              prog2: kroItem.prog2,
                              prog3: kroItem.prog3,
                              progUraian: kroItem.progUraian,
                              aktivitasKode: kroItem.kodeAktivitas,
                              aktivitasUraian: kroItem.aktivitasUraian,
                              kroKode: kroItem.kodeKro,
                              kroNama: kroItem.namaKro,
                            }));
                            setSelectedKroOption(`${kroItem.kodeAktivitas}.${kroItem.kodeKro}`);
                            setShowKroPickerModal(false);
                          }}
                          className={`transition-colors ${
                            isDisabled
                              ? "bg-slate-100 dark:bg-slate-800/50 opacity-60 cursor-not-allowed text-slate-400"
                              : "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/50"
                          }`}
                          title={isDisabled ? "KRO ini sudah ada di kertas kerja dan tidak dapat dipilih lagi" : undefined}
                        >
                          <td className={`p-2.5 font-mono font-bold border-r border-slate-200 dark:border-slate-700 ${isDisabled ? "text-slate-400" : "text-[#0078d4]"}`}>
                            {kroItem.kodeAktivitas}.{kroItem.kodeKro}
                          </td>
                          <td className="p-2.5 font-medium border-r border-slate-200 dark:border-slate-700">
                            {kroItem.namaKro}
                          </td>
                          <td className="p-2 text-center">
                            {isDisabled ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                Sudah Ada
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                Tersedia
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowKroPickerModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-MODAL: PILIH KODE IB (11 Opsi Inisiatif Baru) ── */}
      {showIbPickerModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pilih Inisiatif Baru (KodeIB)
              </h3>
              <button onClick={() => setShowIbPickerModal(false)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-xs max-h-72 overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold">
                    <th className="p-2.5 text-center border-r border-slate-300 dark:border-slate-700 w-20">Kode</th>
                    <th className="p-2.5 text-left">Keterangan Inisiatif Baru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {IB_OPTIONS.map((ib) => {
                    const isSelected = formKroDialog.kodeIB === ib.kode;
                    return (
                      <tr
                        key={ib.kode}
                        onClick={() => {
                          setFormKroDialog((prev) => ({
                            ...prev,
                            kodeIB: ib.kode,
                            kodeIBUraian: ib.uraian,
                          }));
                          setShowIbPickerModal(false);
                        }}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-amber-100 dark:bg-amber-950 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                      >
                        <td className="p-2.5 text-center font-mono font-bold border-r border-slate-200 dark:border-slate-700 text-[#0078d4]">
                          {ib.kode}
                        </td>
                        <td className="p-2.5 font-medium">{ib.uraian}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowIbPickerModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-MODAL: PILIH LOKASI ── */}
      {showLokasiPickerModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Pilih Lokasi Wilayah (KPPN / Kab / Kota)</h3>
                <p className="text-[11px] text-slate-500">Referensi resmi kode lokasi dan kabupaten/kota SAKTI</p>
              </div>
              <button
                onClick={() => {
                  setShowLokasiPickerModal(false);
                  setLokasiSearchQuery("");
                }}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Input Pencarian Lokasi */}
            <div className="shrink-0">
              <input
                type="text"
                autoFocus
                value={lokasiSearchQuery}
                onChange={(e) => setLokasiSearchQuery(e.target.value)}
                placeholder="Cari nama kota, kabupaten, provinsi, atau kode (misal: Jakarta, Depok, 01.51)..."
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 text-xs pr-1">
              {lokasiData
                .filter((loc) => {
                  if (!lokasiSearchQuery.trim()) return true;
                  const q = lokasiSearchQuery.toLowerCase();
                  return (
                    loc.nama.toLowerCase().includes(q) ||
                    loc.provinsi.toLowerCase().includes(q) ||
                    loc.kppnNama.toLowerCase().includes(q) ||
                    `${loc.k1}.${loc.k2}`.includes(q)
                  );
                })
                .slice(0, 100)
                .map((loc, idx) => (
                  <div
                    key={`${loc.k1}-${loc.k2}-${idx}`}
                    onClick={() => {
                      setFormKroDialog((prev) => ({
                        ...prev,
                        lokasi1: loc.k1,
                        lokasi2: loc.k2,
                        lokasiNama: loc.nama,
                      }));
                      setShowLokasiPickerModal(false);
                      setLokasiSearchQuery("");
                    }}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-[#0078d4] bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        {loc.k1}.{loc.k2}
                      </span>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{loc.nama}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Provinsi: {loc.provinsi}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      KPPN {loc.kppnKode} {loc.kppnNama}
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 shrink-0">
              <span>Total Referensi: <strong>{lokasiData.length}</strong> wilayah</span>
              <button
                type="button"
                onClick={() => {
                  setShowLokasiPickerModal(false);
                  setLokasiSearchQuery("");
                }}
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-MODAL: PILIH KEWENANGAN ── */}
      {showKewenanganPickerModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Pilih Kewenangan</h3>
              <button onClick={() => setShowKewenanganPickerModal(false)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>
            <div className="space-y-1.5 text-xs">
              {[
                { kode: "KP", nama: "Kantor Pusat" },
                { kode: "KD", nama: "Kantor Daerah" },
                { kode: "DK", nama: "Dekonsentrasi" },
                { kode: "TP", nama: "Tugas Pembantuan" },
              ].map((kew) => (
                <div
                  key={kew.kode}
                  onClick={() => {
                    setFormKroDialog((prev) => ({
                      ...prev,
                      kewenanganKode: kew.kode,
                      kewenanganNama: kew.nama,
                    }));
                    setShowKewenanganPickerModal(false);
                  }}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer flex items-center justify-between font-medium"
                >
                  <span className="font-mono font-bold text-[#0078d4]">{kew.kode}</span>
                  <span>{kew.nama}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: FORM PENDETAILAN LOKUS / REKAM RO (Persis Gambar 5)
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "ro" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Form Pendetailan Lokus
              </h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Baris KRO */}
              <div className="flex items-center gap-3">
                <span className="w-20 font-bold text-slate-700 dark:text-slate-300">KRO</span>
                <input
                  type="text"
                  readOnly
                  value={formRo.kroKode.split(".")[1] || "AAH"}
                  className="w-20 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-slate-700 dark:text-slate-300 text-center"
                />
                <span className="text-slate-800 dark:text-slate-200 font-medium">{formRo.kroNama}</span>
              </div>

              {/* Baris RO */}
              <div className="flex items-center gap-2">
                <span className="w-20 font-bold text-slate-700 dark:text-slate-300">RO</span>
                <input
                  type="text"
                  value={formRo.roKode}
                  onChange={(e) => setFormRo({ ...formRo, roKode: e.target.value })}
                  placeholder="001"
                  className="w-20 px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-center"
                />
                <button
                  type="button"
                  onClick={() => setShowRoPicker(true)}
                  className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 rounded font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>RO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSbkPicker(true)}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>SBK</span>
                </button>
              </div>

              {/* Baris Uraian */}
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Uraian</span>
                <input
                  type="text"
                  value={formRo.roNama}
                  onChange={(e) => setFormRo({ ...formRo, roNama: e.target.value })}
                  placeholder="Penyusunan Regulasi PPATK"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-medium bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Baris Volume */}
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Volume {formRo.isSbk && formRo.sbkSatuan ? `(${formRo.sbkSatuan})` : ""}
                </span>
                <input
                  type="number"
                  value={formRo.volume}
                  onChange={(e) => setFormRo({ ...formRo, volume: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                />
              </div>

              {/* Box Keterangan Penggunaan SBK */}
              {formRo.isSbk ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-lg space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-amber-900 dark:text-amber-200">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[0.65rem] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-mono">
                        {formRo.sbkKelompok}
                      </span>
                      <span>{formRo.sbkUraian}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormRo((prev) => ({
                        ...prev,
                        isSbk: false,
                        sbkKelompok: "",
                        sbkKode: "",
                        sbkUraian: "",
                        sbkBesaran: 0,
                        sbkSatuan: "",
                      }))}
                      className="text-amber-700 hover:text-rose-600 text-[0.7rem] underline cursor-pointer"
                    >
                      Batal SBK
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[0.7rem] text-slate-600 dark:text-slate-300 pt-1 border-t border-amber-200 dark:border-amber-800">
                    <div>
                      <span className="text-slate-400 block">Besaran Standar Satuan:</span>
                      <strong className="font-mono text-emerald-700 dark:text-emerald-400">
                        Rp {formatRupiah(formRo.sbkBesaran)} / {formRo.sbkSatuan || "output"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Batas Maksimal Anggaran RO ({formRo.volume || 1} {formRo.sbkSatuan || "output"}):</span>
                      <strong className="font-mono text-amber-800 dark:text-amber-300 text-xs">
                        Rp {formatRupiah((Number(formRo.volume) || 1) * formRo.sbkBesaran)}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-between text-slate-500">
                  <span>RO ini tidak menggunakan batasan Standar Biaya Keluaran (Non-SBK).</span>
                  <button
                    type="button"
                    onClick={() => setShowSbkPicker(true)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold underline cursor-pointer"
                  >
                    + Terapkan SBK
                  </button>
                </div>
              )}

              {/* Baris UIC */}
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">UIC</span>
                <input
                  type="text"
                  value={formRo.uic}
                  onChange={(e) => setFormRo({ ...formRo, uic: e.target.value })}
                  placeholder="Contoh: 0000"
                  className="w-32 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveRo}
                className="px-5 py-2 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-MODAL: PILIH RO (Persis Gambar 4) ── */}
      {showRoPicker && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pilih RO
              </h3>
              <button onClick={() => setShowRoPicker(false)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            {/* Filter Search Bar */}
            <div className="flex items-center gap-2">
              <select className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold">
                <option value="kode">Kode</option>
                <option value="deskripsi">Deskripsi</option>
              </select>
              <input
                type="text"
                value={roSearchQuery}
                onChange={(e) => setRoSearchQuery(e.target.value)}
                placeholder="Ketik kata kunci pencarian..."
                className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
              <button
                type="button"
                className="px-4 py-1.5 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Cari
              </button>
            </div>

            {/* Tabel List RO */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-xs max-h-72 overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold sticky top-0">
                    <th className="p-2.5 text-left border-r border-slate-300 dark:border-slate-700 w-52">Kode</th>
                    <th className="p-2.5 text-left">Deskripsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {availableRosForKro.map((r, idx) => {
                    const isPicked = selectedRoPicker?.id === r.id || selectedRoPicker?.fullKode === r.fullKode;
                    return (
                      <tr
                        key={r.id || idx}
                        onClick={() => setSelectedRoPicker({ id: r.id, kode: r.subKode, nama: r.nama, fullKode: r.fullKode })}
                        className={`cursor-pointer transition-colors ${isPicked ? "bg-blue-100 dark:bg-blue-950 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}
                      >
                        <td className="p-2.5 font-mono font-bold text-[#0078d4] dark:text-blue-400 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          {r.fullKode}
                        </td>
                        <td className="p-2.5 text-slate-800 dark:text-slate-200">{r.nama}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Dummy Sesuai Gambar */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <button className="px-2 py-1 border rounded hover:bg-slate-50 cursor-pointer">⏮</button>
              <button className="px-2 py-1 border rounded hover:bg-slate-50 cursor-pointer">◀</button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded font-bold">1</span>
              <button className="px-2 py-1 border rounded hover:bg-slate-50 cursor-pointer">▶</button>
              <button className="px-2 py-1 border rounded hover:bg-slate-50 cursor-pointer">⏭</button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowRoPicker(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (selectedRoPicker) {
                    setFormRo((prev) => ({
                      ...prev,
                      roKode: selectedRoPicker.kode,
                      roNama: selectedRoPicker.nama,
                    }));
                  }
                  setShowRoPicker(false);
                }}
                className="px-5 py-2 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-MODAL: PILIH SBK (Standar Biaya Keluaran Sesuai Submenu SBK) ── */}
      {showSbkPicker && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-4xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Daftar Standar Biaya Keluaran (SBK)</span>
                  <span className="text-[0.7rem] bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded font-mono">
                    SBKU &amp; SBKK
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih item Standar Biaya Keluaran resmi untuk mengisi otomatis rincian biaya output
                </p>
              </div>
              <button onClick={() => setShowSbkPicker(false)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            {/* Filter Search Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sbkSearchQuery}
                onChange={(e) => setSbkSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan uraian SBK, kode, atau kelompok..."
                className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
              <button
                type="button"
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cari</span>
              </button>
            </div>

            {/* Tabel List SBK */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-xs max-h-80 overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold sticky top-0">
                    <th className="p-2.5 text-left border-r border-slate-300 dark:border-slate-700 w-24">Kelompok</th>
                    <th className="p-2.5 text-left border-r border-slate-300 dark:border-slate-700 w-48">Kode / Kategori</th>
                    <th className="p-2.5 text-left border-r border-slate-300 dark:border-slate-700">Uraian SBK</th>
                    <th className="p-2.5 text-center border-r border-slate-300 dark:border-slate-700 w-24">Satuan</th>
                    <th className="p-2.5 text-right w-36">Besaran (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedSbkList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Tidak ada data SBK yang sesuai dengan kata kunci "{sbkSearchQuery}".
                      </td>
                    </tr>
                  ) : (
                    paginatedSbkList.map((item, idx) => {
                      const isPicked = selectedSbkPicker?.id === item.id;
                      return (
                        <tr
                          key={item.id || idx}
                          onClick={() => setSelectedSbkPicker(item)}
                          className={`cursor-pointer transition-colors ${isPicked ? "bg-amber-100 dark:bg-amber-950 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}
                        >
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-semibold">
                            <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${item.kelompok === "SBKK" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                              {item.kelompok}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-[0.7rem] border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                            <div>{item.kode}</div>
                            <div className="text-[0.65rem] text-slate-400 font-sans">{item.kategori}</div>
                          </td>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">
                            <div className="font-medium text-slate-900 dark:text-slate-100">{item.uraian}</div>
                            {item.satker && <div className="text-[0.68rem] text-slate-400">{item.satker}</div>}
                          </td>
                          <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-700 font-medium">
                            {item.volume} {item.satuan}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {item.besaran.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Footer Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-3 text-slate-500">
                <span>
                  Menampilkan{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {filteredSbkList.length === 0 ? 0 : (sbkPage - 1) * sbkPageSize + 1} -{" "}
                    {Math.min(sbkPage * sbkPageSize, filteredSbkList.length)}
                  </strong>{" "}
                  dari <strong className="text-slate-800 dark:text-slate-200">{filteredSbkList.length}</strong> data SBK
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <div className="flex items-center gap-1.5">
                  <label htmlFor="sbkPageSize" className="text-slate-500 text-[0.7rem]">
                    Per halaman:
                  </label>
                  <select
                    id="sbkPageSize"
                    value={sbkPageSize}
                    onChange={(e) => {
                      setSbkPageSize(Number(e.target.value));
                      setSbkPage(1);
                    }}
                    className="px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={60}>Semua (60)</option>
                  </select>
                </div>
              </div>

              {/* Tombol Halaman & Aksi */}
              <div className="flex items-center gap-3">
                {/* Pagination Controls */}
                {totalSbkPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={sbkPage === 1}
                      onClick={() => setSbkPage(1)}
                      title="Halaman Pertama"
                      className="p-1.5 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={sbkPage === 1}
                      onClick={() => setSbkPage((p) => Math.max(1, p - 1))}
                      title="Halaman Sebelumnya"
                      className="p-1.5 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    
                    <span className="px-2.5 py-1 text-[0.72rem] font-bold text-slate-700 dark:text-slate-200">
                      Hal {sbkPage} / {totalSbkPages}
                    </span>

                    <button
                      type="button"
                      disabled={sbkPage === totalSbkPages}
                      onClick={() => setSbkPage((p) => Math.min(totalSbkPages, p + 1))}
                      title="Halaman Berikutnya"
                      className="p-1.5 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={sbkPage === totalSbkPages}
                      onClick={() => setSbkPage(totalSbkPages)}
                      title="Halaman Terakhir"
                      className="p-1.5 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSbkPicker(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      if (selectedSbkPicker) {
                        const besaranNum = Number(selectedSbkPicker.besaran) || 0;
                        setFormRo((prev) => ({
                          ...prev,
                          isSbk: true,
                          sbkKelompok: selectedSbkPicker.kelompok,
                          sbkKode: selectedSbkPicker.kode,
                          sbkUraian: selectedSbkPicker.uraian,
                          sbkBesaran: besaranNum,
                          sbkSatuan: selectedSbkPicker.satuan || "output",
                          // Bila belum ada uraian RO atau user memilih SBK, simpan info SBK
                          roNama: prev.roNama?.trim() ? prev.roNama : selectedSbkPicker.uraian,
                        }));
                        triggerAlert(
                          `SBK "${selectedSbkPicker.uraian}" berhasil dipilih (Besaran: Rp ${formatRupiah(besaranNum)} / ${selectedSbkPicker.satuan || "output"}).`
                        );
                      }
                      setShowSbkPicker(false);
                    }}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Pilih SBK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 3: FORM REKAM KOMPONEN (Persis Gambar 3)
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "komponen" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Form Rekam Komponen
              </h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Baris Komponen */}
              <div className="flex items-center gap-2">
                <span className="w-28 font-bold text-slate-700 dark:text-slate-300">Komponen</span>
                <input
                  type="text"
                  value={formKomponen.kode}
                  onChange={(e) => setFormKomponen({ ...formKomponen, kode: e.target.value })}
                  maxLength={3}
                  placeholder="052"
                  className="w-20 px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-center"
                />
                <button
                  type="button"
                  onClick={() => setShowKomponenPicker(true)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200 rounded font-semibold cursor-pointer transition-colors"
                >
                  Komponen
                </button>
              </div>

              {/* Baris Uraian Komponen */}
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Uraian komponen</span>
                <input
                  type="text"
                  value={formKomponen.uraian}
                  onChange={(e) => setFormKomponen({ ...formKomponen, uraian: e.target.value })}
                  placeholder="Penyusunan Dokumen Legislasi"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-medium bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Baris Jenis Biaya */}
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Jenis Biaya</span>
                <select
                  value={!isCurrentRoOperasional ? "NON OPERASIONAL" : formKomponen.jenisBiaya}
                  onChange={(e) => setFormKomponen({ ...formKomponen, jenisBiaya: e.target.value })}
                  disabled={!isCurrentRoOperasional}
                  className={`w-56 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-bold ${
                    !isCurrentRoOperasional
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      : "bg-white dark:bg-slate-900"
                  }`}
                  title={
                    !isCurrentRoOperasional
                      ? "Hanya RO 3377.EBA.994 dan 3375.EBA.994 yang dapat memilih jenis biaya OPERASIONAL"
                      : undefined
                  }
                >
                  {isCurrentRoOperasional && <option value="OPERASIONAL">OPERASIONAL</option>}
                  <option value="NON OPERASIONAL">NON OPERASIONAL</option>
                </select>
                {!isCurrentRoOperasional && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    * Otomatis terisi <strong>NON OPERASIONAL</strong> (selain RO 3377.EBA.994 / 3375.EBA.994).
                  </p>
                )}
              </div>

              {/* Baris Sifat Biaya */}
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Sifat Biaya</span>
                <select
                  value={formKomponen.sifatBiaya}
                  onChange={(e) => setFormKomponen({ ...formKomponen, sifatBiaya: e.target.value })}
                  className="w-56 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                >
                  <option value="UTAMA">UTAMA</option>
                  <option value="PENDUKUNG">PENDUKUNG</option>
                </select>
              </div>

              {/* Tombol Hitung Gaji (Persis Gambar 3 - Dinonaktifkan) */}
              <div className="pt-1">
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500 rounded font-semibold text-xs cursor-not-allowed opacity-60 shadow-none transition-colors"
                  title="Tombol Hitung Gaji dinonaktifkan"
                >
                  Hitung Gaji
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveKomponen}
                className="px-5 py-2 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-MODAL: FORM PENCARIAN KOMPONEN (Persis Gambar 2) ── */}
      {showKomponenPicker && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-2xl w-full p-4 sm:p-5 space-y-3.5 shadow-2xl max-h-[90vh] flex flex-col my-auto">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Form Pencarian Komponen
              </h3>
              <button onClick={() => setShowKomponenPicker(false)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            {/* Filter Search Bar */}
            <div className="flex items-center gap-2 shrink-0">
              <select className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold">
                <option value="kode">Kode</option>
                <option value="deskripsi">Deskripsi</option>
              </select>
              <input
                type="text"
                value={komponenSearchQuery}
                onChange={(e) => setKomponenSearchQuery(e.target.value)}
                placeholder="Cari kode atau uraian komponen..."
                className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
              <button
                type="button"
                className="px-4 py-1.5 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Cari
              </button>
            </div>

            {/* Tabel List Komponen (Persis Gambar 2) */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-xs max-h-60 sm:max-h-72 overflow-y-auto flex-1">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold sticky top-0 z-10 shadow-xs">
                    <th className="p-2 text-left border-r border-slate-300 dark:border-slate-700 w-56">Kode</th>
                    <th className="p-2 text-left border-r border-slate-300 dark:border-slate-700">Deskripsi</th>
                    <th className="p-2 text-center w-20">Jenis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {availableKomponensForRo.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-400 italic">
                        Tidak ada komponen yang cocok untuk RO terpilih.
                      </td>
                    </tr>
                  ) : (
                    availableKomponensForRo.map((rowKomp, idx) => {
                      const isPicked = selectedKomponenPicker?.kode === rowKomp.kode;
                      return (
                        <tr
                          key={rowKomp.kode || idx}
                          onClick={() => setSelectedKomponenPicker(rowKomp)}
                          className={`cursor-pointer transition-colors ${isPicked ? "bg-blue-100 dark:bg-blue-950 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}
                        >
                          <td className="p-2 font-mono border-r border-slate-200 dark:border-slate-700">
                            {rowKomp.kode}
                          </td>
                          <td className="p-2 border-r border-slate-200 dark:border-slate-700">
                            {rowKomp.deskripsi}
                          </td>
                          <td className="p-2 text-center font-medium">{rowKomp.jenis}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Dummy Sesuai Gambar */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 shrink-0">
              <button className="px-2 py-0.5 border rounded hover:bg-slate-50 cursor-pointer">⏮</button>
              <button className="px-2 py-0.5 border rounded hover:bg-slate-50 cursor-pointer">◀</button>
              <span className="px-2.5 py-0.5 bg-blue-600 text-white rounded font-bold">1</span>
              <button className="px-2 py-0.5 border rounded hover:bg-slate-50 cursor-pointer">▶</button>
              <button className="px-2 py-0.5 border rounded hover:bg-slate-50 cursor-pointer">⏭</button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-200 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setShowKomponenPicker(false)}
                className="px-4 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (selectedKomponenPicker) {
                    setFormKomponen((prev) => ({
                      ...prev,
                      kode: selectedKomponenPicker.shortKode,
                      uraian: selectedKomponenPicker.deskripsi,
                      jenisBiaya: isCurrentRoOperasional ? (selectedKomponenPicker.jenis || prev.jenisBiaya) : "NON OPERASIONAL",
                    }));
                  }
                  setShowKomponenPicker(false);
                }}
                className="px-5 py-1.5 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 4: FORM REKAM SUB KOMPONEN (Pilihan: Tanpa Sub Komponen / A s.d. Z)
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "subkomponen" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0078d4]" />
                <span>Rekam Sub Komponen</span>
              </h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Tipe Rekam Sub Komponen:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${subkompType === "tanpa" ? "bg-amber-50 border-amber-500 font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200" : "border-slate-300 hover:bg-slate-50"}`}>
                    <input
                      type="radio"
                      name="subkompType"
                      checked={subkompType === "tanpa"}
                      onChange={() => setSubkompType("tanpa")}
                      className="accent-[#0078d4]"
                    />
                    <span>Tanpa Sub Komponen</span>
                  </label>
                  <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${subkompType === "dengan" ? "bg-blue-50 border-blue-500 font-bold text-blue-900 dark:bg-blue-950/60 dark:text-blue-200" : "border-slate-300 hover:bg-slate-50"}`}>
                    <input
                      type="radio"
                      name="subkompType"
                      checked={subkompType === "dengan"}
                      onChange={() => setSubkompType("dengan")}
                      className="accent-[#0078d4]"
                    />
                    <span>Dengan Sub Komponen (A s.d. Z)</span>
                  </label>
                </div>
              </div>

              {subkompType === "dengan" && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kode Huruf (A s.d. Z):</label>
                    <input
                      type="text"
                      value={formSubkomponen.kode}
                      onChange={(e) => setFormSubkomponen({ ...formSubkomponen, kode: e.target.value.toUpperCase().slice(0, 2) })}
                      maxLength={2}
                      placeholder="A"
                      className="w-20 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold text-center text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Sub Komponen:</label>
                    <textarea
                      rows={3}
                      value={formSubkomponen.uraian}
                      onChange={(e) => setFormSubkomponen({ ...formSubkomponen, uraian: e.target.value })}
                      placeholder="Contoh: Penyusunan dan Implementasi Regulasi Kerja Sama"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveSubkomponen}
                className="px-5 py-2 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Simpan Sub Komponen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 5: FORM REKAM AKUN (Bagan Akun Standar - BAS)
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "akun" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#0078d4]" />
                <span>Rekam Akun Belanja (Bagan Akun Standar - BAS)</span>
              </h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Cari Kode &amp; Nomenklatur Akun BAS (6 Digit):
                </label>
                <input
                  type="text"
                  value={akunSearchQuery}
                  onChange={(e) => setAkunSearchQuery(e.target.value)}
                  placeholder="Ketik kode akun (misal: 521211, 524113) atau nama belanja..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              {/* List Pilihan Akun BAS */}
              <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
                {baganAkunStandar
                  .filter((b) => {
                    if (!akunSearchQuery.trim()) return true;
                    const q = akunSearchQuery.toLowerCase();
                    return b.kodeAkun6Digit.includes(q) || b.uraianAkun.toLowerCase().includes(q);
                  })
                  .slice(0, 30)
                  .map((b) => {
                    const isSelected = formAkun.kodeAkun === b.kodeAkun6Digit;
                    return (
                      <div
                        key={b.id}
                        onClick={() =>
                          setFormAkun({
                            ...formAkun,
                            kodeAkun: b.kodeAkun6Digit,
                            uraianAkun: b.uraianAkun,
                          })
                        }
                        className={`p-2.5 flex items-start justify-between cursor-pointer transition-colors ${isSelected ? "bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                      >
                        <div>
                          <div className="font-mono text-xs font-bold text-[#0078d4]">{b.kodeAkun6Digit}</div>
                          <div className="text-slate-800 dark:text-slate-200">{b.uraianAkun}</div>
                          <div className="text-[0.68rem] text-slate-400 font-normal">{b.penggunaanSingkat}</div>
                        </div>
                        {isSelected && <span className="text-blue-600 font-bold text-xs">✓ Dipilih</span>}
                      </div>
                    );
                  })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Sumber Dana (SD):</label>
                  <input
                    type="text"
                    value={formAkun.sd}
                    onChange={(e) => setFormAkun({ ...formAkun, sd: e.target.value })}
                    placeholder="A00"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">KPPN Pembayar:</label>
                  <input
                    type="text"
                    value={formAkun.subUraian}
                    onChange={(e) => setFormAkun({ ...formAkun, subUraian: e.target.value })}
                    placeholder="(KPPN.175-Jakarta VI)"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAkun}
                className="px-5 py-2 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Simpan Akun Belanja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 6: REKAM HEADER 1
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "header1" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0078d4]" />
                <span>Rekam Header 1</span>
              </h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nomenklatur Header 1:</label>
                <input
                  type="text"
                  value={formHeader1.nomenklatur}
                  onChange={(e) => setFormHeader1({ nomenklatur: e.target.value })}
                  placeholder="Contoh: Singapore (FICG Meeting)"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveHeader1}
                className="px-5 py-2 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 7: REKAM HEADER 2
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "header2" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0078d4]" />
                <span>Rekam Header 2</span>
              </h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nomenklatur Header 2:</label>
                <input
                  type="text"
                  value={formHeader2.nomenklatur}
                  onChange={(e) => setFormHeader2({ nomenklatur: e.target.value })}
                  placeholder="Contoh: Pemenuhan permintaan Narasumber dari Negara Lain/Organisasi"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveHeader2}
                className="px-5 py-2 bg-[#0078d4] hover:bg-[#006cc1] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 8: REKAM DETAIL ITEM BELANJA (Komponen I s.d. III)
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "detail" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Rekam Detail Belanja (Komponen I s.d. Komponen III)</span>
              </h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Induk Akun Belanja:</label>
                <select
                  value={formDetail.akunTarget}
                  onChange={(e) => setFormDetail({ ...formDetail, akunTarget: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                >
                  {worksheetRows
                    .filter((r) => r.type === "akun")
                    .map((a) => (
                      <option key={a.id} value={a.kode}>
                        {a.kode} - {a.uraian}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Uraian Rincian Belanja:</label>
                <input
                  type="text"
                  value={formDetail.uraian}
                  onChange={(e) => setFormDetail({ ...formDetail, uraian: e.target.value })}
                  placeholder="Contoh: Konsumsi Rapat, Souvenir, Honorarium..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
                />
              </div>

              {/* Input Komponen I s.d. Komponen III */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-[0.68rem] font-bold text-slate-600 dark:text-slate-300 block mb-1">Komponen I (Nilai & Sat):</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={formDetail.k1Nilai}
                      onChange={(e) => setFormDetail({ ...formDetail, k1Nilai: e.target.value })}
                      placeholder="18"
                      className="w-1/2 p-1.5 border rounded text-center font-bold"
                    />
                    <input
                      type="text"
                      value={formDetail.k1Sat}
                      onChange={(e) => setFormDetail({ ...formDetail, k1Sat: e.target.value.toUpperCase() })}
                      placeholder="ORG"
                      className="w-1/2 p-1.5 border rounded text-center text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[0.68rem] font-bold text-slate-600 dark:text-slate-300 block mb-1">Komponen II (Nilai & Sat):</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={formDetail.k2Nilai}
                      onChange={(e) => setFormDetail({ ...formDetail, k2Nilai: e.target.value })}
                      placeholder="45"
                      className="w-1/2 p-1.5 border rounded text-center font-bold"
                    />
                    <input
                      type="text"
                      value={formDetail.k2Sat}
                      onChange={(e) => setFormDetail({ ...formDetail, k2Sat: e.target.value.toUpperCase() })}
                      placeholder="KEG"
                      className="w-1/2 p-1.5 border rounded text-center text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[0.68rem] font-bold text-slate-600 dark:text-slate-300 block mb-1">Komponen III (Nilai & Sat):</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={formDetail.k3Nilai}
                      onChange={(e) => setFormDetail({ ...formDetail, k3Nilai: e.target.value })}
                      placeholder=""
                      className="w-1/2 p-1.5 border rounded text-center font-bold"
                    />
                    <input
                      type="text"
                      value={formDetail.k3Sat}
                      onChange={(e) => setFormDetail({ ...formDetail, k3Sat: e.target.value.toUpperCase() })}
                      placeholder=""
                      className="w-1/2 p-1.5 border rounded text-center text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Biaya Satuan / Tarif SBM (Rp):</label>
                  <input
                    type="number"
                    value={formDetail.satuanBiaya}
                    onChange={(e) => setFormDetail({ ...formDetail, satuanBiaya: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-right font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Satuan Akhir Volume:</label>
                  <input
                    type="text"
                    value={formDetail.satuanAkhir}
                    onChange={(e) => setFormDetail({ ...formDetail, satuanAkhir: e.target.value })}
                    placeholder="Contoh: OK, OJ, OH"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex justify-between items-center text-xs">
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  Total Volume: <strong>{(Number(formDetail.k1Nilai) || 1) * (Number(formDetail.k2Nilai) || 1) * (Number(formDetail.k3Nilai) || 1)} {formDetail.satuanAkhir}</strong>
                </span>
                <span className="font-bold text-blue-900 dark:text-blue-200">
                  Jumlah: Rp {formatRupiah((Number(formDetail.k1Nilai) || 1) * (Number(formDetail.k2Nilai) || 1) * (Number(formDetail.k3Nilai) || 1) * formDetail.satuanBiaya)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveDetail}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Simpan Detail Belanja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: PILIHAN METODE INPUT SETELAH SUB KOMPONEN
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "pilih_metode" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[#0078d4]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Pilihan Metode Input Rincian Belanja
                  </h3>
                  <p className="text-[0.68rem] text-slate-500 dark:text-slate-400">
                    Sub Komponen berhasil dibuat. Tentukan cara pengisian akun &amp; rincian belanja berikutnya.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid 3 Opsi: Manual, Panduan, Upload File */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Opsi 1: Manual */}
              <div
                onClick={() => {
                  setModalMode(null);
                  triggerAlert("Mode input manual aktif. Silakan gunakan tombol Rekam Akun / Detail Belanja.");
                }}
                className="group relative flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0078d4] dark:hover:border-[#0078d4] bg-white dark:bg-slate-800/80 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 text-slate-700 dark:text-slate-200 group-hover:text-[#0078d4] flex items-center justify-center transition-colors">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0078d4] transition-colors">
                      1. Input Manual
                    </h4>
                    <p className="text-[0.68rem] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Lanjutkan penginputan baris Akun Belanja, Header, dan Detail Anggaran satu per satu menggunakan formulir standar yang sudah ada.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center text-[0.7rem] font-bold text-[#0078d4] group-hover:translate-x-0.5 transition-transform">
                  <span>Pilih Manual</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>

              {/* Opsi 2: Panduan (7 Kategori Belanja Sesuai Panduan 2) */}
              <div
                onClick={() => {
                  setSelectedJenisBelanjaList([]);
                  setModalMode("panduan_jenis_belanja");
                }}
                className="group relative flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-800/80 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      2. Input dengan Panduan
                    </h4>
                    <p className="text-[0.68rem] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Pilih dari 7 jenis belanja (Komponen 001, 002, Belanja Bahan, Jasa, Perjadin DN/LN, Konsinyering) dengan otomatisasi dan tarif SBM.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center text-[0.7rem] font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Pilih Jenis Belanja</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>

              {/* Opsi 3: Upload File (.xls, .xlsx) - Khusus BINCANG & Super Admin */}
              <div
                onClick={() => {
                  if (isPrivileged) {
                    setUploadFile(null);
                    setUploadError(null);
                    setUploadPreview([]);
                    setModalMode("upload_excel");
                  }
                }}
                className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all ${
                  isPrivileged
                    ? "border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 bg-white dark:bg-slate-800/80 hover:bg-violet-50/40 dark:hover:bg-violet-950/20 cursor-pointer shadow-sm hover:shadow group"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 opacity-70 cursor-not-allowed"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isPrivileged
                        ? "bg-slate-100 dark:bg-slate-700 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/60 text-slate-700 dark:text-slate-200 group-hover:text-violet-600"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    }`}>
                      <FileUp className="w-5 h-5" />
                    </div>
                    {isPrivileged ? (
                      <span className="text-[0.62rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                        {currentUserRole}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[0.62rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                        <Lock className="w-2.5 h-2.5" /> Terkunci
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold transition-colors ${
                      isPrivileged ? "text-slate-900 dark:text-white group-hover:text-violet-600" : "text-slate-500"
                    }`}>
                      3. Upload File Excel
                    </h4>
                    <p className="text-[0.68rem] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Unggah berkas rincian belanja ber-ekstensi <strong>.xls</strong> atau <strong>.xlsx</strong> untuk dipetakan secara otomatis.
                    </p>
                    {!isPrivileged && (
                      <div className="mt-2 p-1.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[0.62rem] text-amber-800 dark:text-amber-200 font-medium">
                        *Hanya untuk role <strong>BINCANG</strong> &amp; <strong>Super Admin</strong>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center text-[0.7rem] font-bold ${
                  isPrivileged ? "text-violet-600 group-hover:translate-x-0.5 transition-transform" : "text-slate-400"
                }`}>
                  <span>{isPrivileged ? "Pilih Upload File" : "Akses Terbatas"}</span>
                  {isPrivileged && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[0.68rem] text-slate-400">
              <span>Role aktif Anda saat ini: <strong className="text-slate-700 dark:text-slate-300">{currentUserRole}</strong></span>
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Tutup &amp; Input Nanti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL PANDUAN: MULTI-SELECT 7 PILIHAN JENIS BELANJA (PANDUAN 2)
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "panduan_jenis_belanja" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Input dengan Panduan: Pilihan Jenis Belanja
                  </h3>
                  <p className="text-[0.68rem] text-slate-500 dark:text-slate-400">
                    Pilih jenis belanja yang akan diisi (dapat memilih lebih dari satu pilihan)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalMode("pilih_metode")}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checklist 7 Jenis Belanja */}
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {/* 1. Komponen 001 Gaji dan Tunjangan (Hanya BINCANG & PATIH) */}
              {(() => {
                const isAllowed001 = currentUnitSingkatan === "BINCANG" || currentUnitSingkatan === "PATIH";
                const isChecked = selectedJenisBelanjaList.includes("001");
                return (
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      !isAllowed001
                        ? "bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed"
                        : isChecked
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs cursor-pointer"
                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={!isAllowed001}
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJenisBelanjaList((prev) => [...prev, "001"]);
                        } else {
                          setSelectedJenisBelanjaList((prev) => prev.filter((x) => x !== "001"));
                        }
                      }}
                      className="mt-0.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Komponen 001 Gaji dan Tunjangan
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                          Khusus BINCANG &amp; PATIH
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {currentUnitSingkatan === "BINCANG"
                          ? "Otomatis memuat rincian dari Pusat_RAB Gaji.xlsx"
                          : currentUnitSingkatan === "PATIH"
                          ? "Otomatis memuat rincian dari Pusdiklat_RAB Gaji.xlsx"
                          : "Hanya unit kerja BINCANG dan PATIH yang berwenang mengisi komponen ini."}
                      </p>
                    </div>
                  </label>
                );
              })()}

              {/* 2. Komponen 002 Operasional Kantor (Hanya BIRU & PATIH) */}
              {(() => {
                const isAllowed002 = currentUnitSingkatan === "BIRU" || currentUnitSingkatan === "PATIH" || currentUnitSingkatan === "BINCANG";
                const isChecked = selectedJenisBelanjaList.includes("002");
                return (
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      !isAllowed002
                        ? "bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed"
                        : isChecked
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs cursor-pointer"
                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={!isAllowed002}
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJenisBelanjaList((prev) => [...prev, "002"]);
                        } else {
                          setSelectedJenisBelanjaList((prev) => prev.filter((x) => x !== "002"));
                        }
                      }}
                      className="mt-0.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Komponen 002 Operasional Kantor
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                          Khusus BIRU &amp; PATIH
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {currentUnitSingkatan === "PATIH"
                          ? "Otomatis memuat rincian dari Pusdiklat_RAB kantor.xlsx"
                          : "Otomatis memuat rincian dari Pusat_RAB kantor.xlsx"}
                      </p>
                    </div>
                  </label>
                );
              })()}

              {/* 3. Pengadaan Belanja Bahan */}
              {(() => {
                const isChecked = selectedJenisBelanjaList.includes("bahan");
                return (
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs"
                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJenisBelanjaList((prev) => [...prev, "bahan"]);
                        } else {
                          setSelectedJenisBelanjaList((prev) => prev.filter((x) => x !== "bahan"));
                        }
                      }}
                      className="mt-0.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Pengadaan Belanja Bahan
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Konsumsi rapat, seminar kit, souvenir, diklat kit, dan pencetakan dengan tarif standar SBM ({currentKroLocation.tarifLabel}) &amp; kertas kerja 11 kolom.
                      </p>
                    </div>
                  </label>
                );
              })()}

              {/* 4. Pengadaan Jasa (Konsultan, profesi, lainnya) */}
              {(() => {
                const isChecked = selectedJenisBelanjaList.includes("jasa");
                return (
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs"
                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJenisBelanjaList((prev) => [...prev, "jasa"]);
                        } else {
                          setSelectedJenisBelanjaList((prev) => prev.filter((x) => x !== "jasa"));
                        }
                      }}
                      className="mt-0.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Pengadaan Jasa (Konsultan, profesi, lainnya)
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Jasa Konsultan (Akun 522131), Jasa Profesi Narasumber/Panitia (Akun 522151), dan Jasa Lainnya (Akun 522191).
                      </p>
                    </div>
                  </label>
                );
              })()}

              {/* 5. Perjalanan Dinas Dalam Negeri */}
              {(() => {
                const isChecked = selectedJenisBelanjaList.includes("spd_dn");
                return (
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs"
                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJenisBelanjaList((prev) => [...prev, "spd_dn"]);
                        } else {
                          setSelectedJenisBelanjaList((prev) => prev.filter((x) => x !== "spd_dn"));
                        }
                      }}
                      className="mt-0.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Perjalanan Dinas Dalam Negeri
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Belanja Perjalanan Dinas Biasa / Dalam Kota (Akun 524111 / 524113).
                      </p>
                    </div>
                  </label>
                );
              })()}

              {/* 6. Perjalanan Dinas Luar Negeri */}
              {(() => {
                const isChecked = selectedJenisBelanjaList.includes("spd_ln");
                return (
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs"
                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJenisBelanjaList((prev) => [...prev, "spd_ln"]);
                        } else {
                          setSelectedJenisBelanjaList((prev) => prev.filter((x) => x !== "spd_ln"));
                        }
                      }}
                      className="mt-0.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Perjalanan Dinas Luar Negeri
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Belanja Perjalanan Dinas Luar Negeri (Akun 524211).
                      </p>
                    </div>
                  </label>
                );
              })()}

              {/* 7. Penyelenggaraan Konsinyering */}
              {(() => {
                const isChecked = selectedJenisBelanjaList.includes("konsinyering");
                return (
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs"
                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJenisBelanjaList((prev) => [...prev, "konsinyering"]);
                        } else {
                          setSelectedJenisBelanjaList((prev) => prev.filter((x) => x !== "konsinyering"));
                        }
                      }}
                      className="mt-0.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Penyelenggaraan Konsinyering
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Paket Meeting Fullboard / Fullday / Halfday di luar kantor (Akun 524114 / 524119).
                      </p>
                    </div>
                  </label>
                );
              })()}
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setModalMode("pilih_metode")}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Kembali
              </button>

              <button
                type="button"
                disabled={selectedJenisBelanjaList.length === 0}
                onClick={() => {
                  if (selectedJenisBelanjaList.length === 0) return;
                  
                  // Eksekusi otomatisasi Komponen 001 dan 002 jika dicentang
                  if (selectedJenisBelanjaList.includes("001")) {
                    handleImportKomponen001();
                  }
                  if (selectedJenisBelanjaList.includes("002")) {
                    handleImportKomponen002();
                  }

                  // Cek apakah ada langkah lanjutan interaktif (Jasa, Belanja Bahan, Perjadin DN, Perjadin LN, atau Konsinyering)
                  const firstInteractive = getActiveGuidedSteps()[0];
                  if (firstInteractive) {
                    handleTransitionToGuidedStep(firstInteractive.mode);
                  } else {
                    setModalMode(null);
                  }
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
              >
                <span>Lanjutkan ({selectedJenisBelanjaList.length} Dipilih)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL PANDUAN PENGADAAN JASA (KONSULTAN, PROFESI, LAINNYA) - PANDUAN 2
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "panduan_jasa" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Panduan: Pengadaan Jasa
                </h3>
                <p className="text-[0.68rem] text-slate-500 dark:text-slate-400">
                  Pilih jenis jasa: Konsultan, Profesi, atau Lainnya
                </p>
              </div>
              <button
                onClick={() => setModalMode("panduan_jenis_belanja")}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pilihan 3 Sub-Jasa */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <button
                type="button"
                onClick={() => setJasaSubPilihan("konsultan")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  jasaSubPilihan === "konsultan"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                1. Jasa Konsultan (522131)
              </button>
              <button
                type="button"
                onClick={() => setJasaSubPilihan("profesi")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  jasaSubPilihan === "profesi"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                2. Jasa Profesi (522151)
              </button>
              <button
                type="button"
                onClick={() => setJasaSubPilihan("lainnya")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  jasaSubPilihan === "lainnya"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                3. Jasa Lainnya (522191)
              </button>
            </div>

            {/* Form Jasa Konsultan */}
            {jasaSubPilihan === "konsultan" && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
                  <span className="font-bold">Akun 522131 Belanja Jasa Konsultan</span>
                  <p className="text-[11px] mt-1">
                    Format otomatis sistem: <strong>Jasa Konsultan | 1 | paket | 1 | keg | | | 1 | paket | (Satuan Biaya) | (Total Biaya)</strong>
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Satuan Biaya Jasa Konsultan (Rp)
                  </label>
                  <input
                    type="number"
                    value={jasaKonsultanBiaya}
                    onChange={(e) => setJasaKonsultanBiaya(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold text-base"
                    placeholder="Contoh: 50000000"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Terbilang: Rp {formatIndoNumber(jasaKonsultanBiaya)}
                  </span>
                </div>
              </div>
            )}

            {/* Form Jasa Profesi */}
            {jasaSubPilihan === "profesi" && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
                  <span className="font-bold">Akun 522151 Belanja Jasa Profesi</span>
                  <p className="text-[11px] mt-1">
                    Pilih jenis &amp; level honorarium narasumber / kepanitiaan. Tarif otomatis terisi sesuai SBM.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="jasaProfesiKat"
                      checked={jasaProfesiKategori === "narasumber"}
                      onChange={() => {
                        setJasaProfesiKategori("narasumber");
                        const firstItem = Object.keys(TARIF_JASA_PROFESI_NARASUMBER)[1];
                        setJasaProfesiItem(firstItem);
                        setJasaProfesiTarif(TARIF_JASA_PROFESI_NARASUMBER[firstItem]);
                      }}
                      className="accent-blue-600"
                    />
                    <span>Honorarium Narasumber (OJ)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="jasaProfesiKat"
                      checked={jasaProfesiKategori === "kepanitiaan"}
                      onChange={() => {
                        setJasaProfesiKategori("kepanitiaan");
                        const firstItem = Object.keys(TARIF_JASA_PROFESI_PANITIA)[0];
                        setJasaProfesiItem(firstItem);
                        setJasaProfesiTarif(TARIF_JASA_PROFESI_PANITIA[firstItem]);
                      }}
                      className="accent-blue-600"
                    />
                    <span>Honorarium Kepanitiaan (OK)</span>
                  </label>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Jenis / Level {jasaProfesiKategori === "narasumber" ? "Narasumber" : "Kepanitiaan"}
                  </label>
                  <select
                    value={jasaProfesiItem}
                    onChange={(e) => {
                      const item = e.target.value;
                      setJasaProfesiItem(item);
                      if (jasaProfesiKategori === "narasumber") {
                        setJasaProfesiTarif(TARIF_JASA_PROFESI_NARASUMBER[item] || 0);
                      } else {
                        setJasaProfesiTarif(TARIF_JASA_PROFESI_PANITIA[item] || 0);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                  >
                    {jasaProfesiKategori === "narasumber"
                      ? Object.keys(TARIF_JASA_PROFESI_NARASUMBER).map((k) => (
                          <option key={k} value={k}>
                            {k} (Rp {formatIndoNumber(TARIF_JASA_PROFESI_NARASUMBER[k])})
                          </option>
                        ))
                      : Object.keys(TARIF_JASA_PROFESI_PANITIA).map((k) => (
                          <option key={k} value={k}>
                            {k} (Rp {formatIndoNumber(TARIF_JASA_PROFESI_PANITIA[k])})
                          </option>
                        ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Jumlah Orang
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={jasaProfesiJumlahOrg}
                      onChange={(e) => setJasaProfesiJumlahOrg(Number(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Jumlah Keg / Jam
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={jasaProfesiJumlahKeg}
                      onChange={(e) => setJasaProfesiJumlahKeg(Number(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Total ({jasaProfesiKategori === "narasumber" ? "OJ" : "OK"})
                    </label>
                    <div className="w-full px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold text-center">
                      {(jasaProfesiJumlahOrg || 1) * (jasaProfesiJumlahKeg || 1)} {jasaProfesiKategori === "narasumber" ? "OJ" : "OK"}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Total Biaya Jasa Profesi:</span>
                  <span className="font-mono font-bold text-sm text-[#0078d4]">
                    Rp {formatIndoNumber((jasaProfesiJumlahOrg || 1) * (jasaProfesiJumlahKeg || 1) * jasaProfesiTarif)}
                  </span>
                </div>
              </div>
            )}

            {/* Form Jasa Lainnya */}
            {jasaSubPilihan === "lainnya" && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
                  <span className="font-bold">Akun 522191 Belanja Jasa Lainnya</span>
                  <p className="text-[11px] mt-1">
                    Format otomatis: <strong>(uraian) | (vol1) | paket | (vol2) | keg | | | (totalVol) | paket | (harga) | (total)</strong>
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Uraian Jasa Lainnya
                  </label>
                  <input
                    type="text"
                    value={jasaLainnyaUraian}
                    onChange={(e) => setJasaLainnyaUraian(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                    placeholder="Contoh: Sewa Cloud Server / Layanan Penyelenggaraan Acara"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Volume 1 (Paket)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={jasaLainnyaVol1}
                      onChange={(e) => setJasaLainnyaVol1(Number(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Volume 2 (Kegiatan)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={jasaLainnyaVol2}
                      onChange={(e) => setJasaLainnyaVol2(Number(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Satuan Biaya (Rp)
                  </label>
                  <input
                    type="number"
                    value={jasaLainnyaHarga}
                    onChange={(e) => setJasaLainnyaHarga(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold text-base"
                    placeholder="Contoh: 15000000"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Total: Rp {formatIndoNumber((jasaLainnyaVol1 || 1) * (jasaLainnyaVol2 || 1) * jasaLainnyaHarga)}
                  </span>
                </div>
              </div>
            )}

            {/* Tombol Simpan Jasa */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  const prevStep = getPrevGuidedStep("panduan_jasa");
                  if (prevStep) {
                    handleTransitionToGuidedStep(prevStep.mode);
                  } else {
                    setModalMode("panduan_jenis_belanja");
                  }
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                {getPrevGuidedStep("panduan_jasa")
                  ? `← Kembali ke ${getPrevGuidedStep("panduan_jasa")?.label}`
                  : "Kembali ke Jenis Belanja"}
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSavePengadaanJasa();
                  const nextStep = getNextGuidedStep("panduan_jasa");
                  if (nextStep) {
                    handleTransitionToGuidedStep(nextStep.mode);
                  } else {
                    setModalMode(null);
                  }
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>
                  {getNextGuidedStep("panduan_jasa")
                    ? `Simpan & Lanjut ke ${getNextGuidedStep("panduan_jasa")?.label}`
                    : "Simpan Jasa ke Kertas Kerja"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL PANDUAN PENGISIAN BELANJA BAHAN (AKUN 521211) & KERTAS KERJA 11 KOLOM
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "panduan_belanja_bahan" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto">
          {/* STEP: CHECKLIST ITEM BELANJA BAHAN (LANGSUNG CHECKLIST SESUAI PANDUAN 2) */}
          {guidedBelanjaStep === "checklist" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Pilihan Item Belanja Bahan
                    </h3>
                    <p className="text-[0.68rem] text-slate-500">Langkah 2: Pilih Kebutuhan Belanja Bahan</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalMode(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px]">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                    {currentKroLocation.tarifLabel}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    (Dapat memilih lebih dari 1 pilihan)
                  </span>
                </div>

                {/* Daftar Checkbox 9 Item Belanja Bahan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-72 overflow-y-auto pr-1">
                  {BELANJA_BAHAN_CHECKLIST_ITEMS.map((item) => {
                    const isChecked = selectedBelanjaItems.includes(item);
                    const tarif = currentKroLocation.tarif[item];
                    return (
                      <label
                        key={item}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-500 shadow-xs"
                            : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBelanjaItems([...selectedBelanjaItems, item]);
                            } else {
                              setSelectedBelanjaItems(selectedBelanjaItems.filter((i) => i !== item));
                            }
                          }}
                          className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`block font-bold text-xs ${isChecked ? "text-emerald-900 dark:text-emerald-200" : "text-slate-800 dark:text-slate-200"}`}>
                            {item}
                          </span>
                          {tarif ? (
                            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                              Rp {formatIndoNumber(tarif)}
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold italic">
                              *Verifikasi BINCANG
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {selectedBelanjaItems.includes("Lainnya") && (
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      Item <strong>'Lainnya'</strong> akan ditandai secara otomatis sebagai bagian yang memerlukan verifikasi oleh role <strong>BINCANG</strong>.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    const prevStep = getPrevGuidedStep("panduan_belanja_bahan");
                    if (prevStep) {
                      handleTransitionToGuidedStep(prevStep.mode);
                    } else {
                      setModalMode("panduan_jenis_belanja");
                    }
                  }}
                  className="px-4 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {getPrevGuidedStep("panduan_belanja_bahan")
                    ? `← Kembali ke ${getPrevGuidedStep("panduan_belanja_bahan")?.label}`
                    : "Kembali ke Jenis Belanja"}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Terpilih: <strong>{selectedBelanjaItems.length}</strong> item
                  </span>
                  <button
                    type="button"
                    disabled={selectedBelanjaItems.length === 0}
                    onClick={handleProceedToChecklistKertasKerja}
                    className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <span>Lanjut ke Kertas Kerja</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: KERTAS KERJA PERHITUNGAN BELANJA BAHAN (AKUN 521211) */}
          {guidedBelanjaStep === "kertas_kerja" && (
            <div
              tabIndex={0}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-7xl w-full p-5 space-y-4 shadow-2xl my-auto flex flex-col max-h-[95vh] text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500/30"
              onPaste={(e) => {
                const text = e.clipboardData?.getData("text");
                if (text && (text.includes("\t") || text.includes("|") || text.includes("\n"))) {
                  e.preventDefault();
                  applyPastedClipboardData(text);
                }
              }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
                  // Jika fokus di luar input atau ingin paste clipboard browser
                  navigator.clipboard?.readText().then((text) => {
                    if (text && (text.includes("\t") || text.includes("|") || text.includes("\n"))) {
                      applyPastedClipboardData(text);
                    }
                  }).catch(() => {
                    // Fallback jika permission browser dibatasi
                  });
                }
              }}
            >
              {/* Pro Renja Brand Header Banner */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white rounded-xl shadow-md shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shadow-xs">
                    <Layers className="w-5 h-5 text-sky-200" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2 tracking-wide">
                      <span>Penyusunan Kertas Kerja Belanja Bahan</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/20 text-sky-100 border border-white/30 font-bold uppercase tracking-wider">
                        Akun 521211
                      </span>
                    </h3>
                    <p className="text-[0.7rem] text-sky-100/90 font-medium mt-0.5">
                      {currentKroLocation.tarifLabel} • Kolom 8 Otomatis (Vol 1 × Vol 2 × Vol 3) • Pembulatan Ribuan Terdekat
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddEmptyGuidedRow}
                    className="px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs hover:shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris</span>
                  </button>

                  <div className="flex items-center gap-1 text-xs text-white/90 border-l pl-2 border-white/20">
                    <span className="text-[11px] font-medium">Jml Baris:</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={rowCountInput}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setRowCountInput(val);
                        handleSetTotalGuidedRows(val);
                      }}
                      className="w-12 px-1.5 py-0.5 text-center bg-white/90 text-slate-900 rounded font-mono font-bold text-xs border border-white/40 focus:outline-none focus:bg-white"
                    />
                  </div>

                  <button
                    onClick={() => setModalMode(null)}
                    className="text-white/80 hover:text-white text-xs p-1.5 rounded-lg hover:bg-white/10 cursor-pointer ml-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Bar & Info Paste Shortcut (Ctrl+V) */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                    <ClipboardList className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Salin dari Excel lalu tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px] font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600">Ctrl + V</kbd> untuk tempel langsung.</span>
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px] font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600">Shift + Klik</kbd> pada nomor baris untuk mem-blok rentang baris.
                  </span>
                </div>

                {/* Toolbar Checklist & Aksi Massal */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-blue-900 dark:text-blue-200">
                    <span>
                      Terpilih: <strong className="font-mono font-bold text-blue-700 dark:text-blue-300">{guidedBelanjaRows.filter((r) => r.selected).length}</strong> dari {guidedBelanjaRows.length} baris
                    </span>
                  </div>

                  {guidedBelanjaRows.some((r) => r.selected) && (
                    <button
                      type="button"
                      onClick={handleDeleteSelectedGuidedRows}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Hapus baris yang diblok/dipilih"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Terpilih</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const allChecked = guidedBelanjaRows.every((r) => r.selected);
                      handleToggleAllRowsSelection(!allChecked);
                    }}
                    className="px-2.5 py-1 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {guidedBelanjaRows.every((r) => r.selected) ? "Batal Pilih Semua" : "Pilih Semua Baris"}
                  </button>
                </div>
              </div>

              {/* Tabel Kertas Kerja Belanja Bahan Pro Renja */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto overflow-y-auto flex-1 max-h-[56vh] bg-white dark:bg-slate-900 shadow-xs">
                <table className="w-full border-collapse text-xs text-left">
                  {/* Header Kolom Tabel */}
                  <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px]">
                      <th className="p-2 border-r border-slate-200 dark:border-slate-700 w-12 text-center bg-slate-100 dark:bg-slate-800">
                        <input
                          type="checkbox"
                          checked={guidedBelanjaRows.length > 0 && guidedBelanjaRows.every((r) => r.selected)}
                          onChange={(e) => handleToggleAllRowsSelection(e.target.checked)}
                          className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer align-middle"
                          title="Pilih / Batal Pilih semua baris"
                        />
                      </th>
                      <th className="px-3 py-2 border-r border-slate-200 dark:border-slate-700 min-w-[240px]">
                        1. Uraian Rincian Belanja
                      </th>
                      <th className="px-1.5 py-2 border-r border-slate-200 dark:border-slate-700 w-16 text-center">
                        2. Vol 1
                      </th>
                      <th className="px-1.5 py-2 border-r border-slate-200 dark:border-slate-700 w-20 text-center">
                        3. Sat 1
                      </th>
                      <th className="px-1.5 py-2 border-r border-slate-200 dark:border-slate-700 w-16 text-center">
                        4. Vol 2
                      </th>
                      <th className="px-1.5 py-2 border-r border-slate-200 dark:border-slate-700 w-20 text-center">
                        5. Sat 2
                      </th>
                      <th className="px-1.5 py-2 border-r border-slate-200 dark:border-slate-700 w-16 text-center">
                        6. Vol 3
                      </th>
                      <th className="px-1.5 py-2 border-r border-slate-200 dark:border-slate-700 w-16 text-center">
                        7. Sat 3
                      </th>
                      <th className="px-2 py-2 border-r border-slate-200 dark:border-slate-700 w-20 text-center bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300">
                        8. Vol Total
                      </th>
                      <th className="px-1.5 py-2 border-r border-slate-200 dark:border-slate-700 w-20 text-center">
                        9. Satuan
                      </th>
                      <th className="px-2.5 py-2 border-r border-slate-200 dark:border-slate-700 w-28 text-right">
                        10. Harga (Rp)
                      </th>
                      <th className="px-2.5 py-2 border-r border-slate-200 dark:border-slate-700 w-32 text-right bg-blue-50/80 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300">
                        11. Total (Rp)
                      </th>
                      <th className="px-1.5 py-2 w-20 text-center bg-slate-100 dark:bg-slate-800">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  {/* Body Cell Kertas Kerja */}
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700/80 font-sans">
                    {guidedBelanjaRows.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="p-8 text-center text-slate-400 italic">
                          Belum ada baris data. Klik <strong>+ Tambah Baris</strong> atau tekan <kbd className="font-mono font-bold">Ctrl+V</kbd> untuk menempel data dari Excel.
                        </td>
                      </tr>
                    ) : (
                      guidedBelanjaRows.map((r, idx) => {
                        const rowNum = idx + 1;
                        const isSelectedRow = !!r.selected;
                        return (
                          <tr
                            key={r.id}
                            className={`transition-colors ${
                              isSelectedRow
                                ? "bg-blue-50/60 dark:bg-blue-950/30 ring-1 ring-inset ring-blue-300 dark:ring-blue-800"
                                : r.isLainnya
                                ? "bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50"
                                : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                            }`}
                          >
                            {/* Row Header (Checkbox + Nomor Baris dengan Shift-Click Range Selection) */}
                            <td
                              className={`p-1 text-center font-mono text-[11px] border-r border-slate-200 dark:border-slate-700 select-none cursor-pointer transition-colors ${
                                isSelectedRow
                                  ? "bg-blue-100/80 dark:bg-blue-900/50 font-bold text-blue-900 dark:text-blue-200"
                                  : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                              onClick={(e) => handleToggleRowSelection(idx, e.shiftKey)}
                              title={`Klik untuk memilih baris ${rowNum}. Tahan tombol Shift + Klik untuk blok rentang baris.`}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={isSelectedRow}
                                  onChange={(e) => handleToggleRowSelection(idx, (e.nativeEvent as any).shiftKey)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer"
                                />
                                <span>{rowNum}</span>
                              </div>
                            </td>

                            {/* Kolom 1: Uraian Rincian Belanja */}
                            <td className="p-0 border-r border-slate-200 dark:border-slate-700 relative">
                              <input
                                type="text"
                                value={r.uraian}
                                onFocus={() =>
                                  setActiveCellRef({
                                    cellName: `A${rowNum}`,
                                    colKey: "uraian",
                                    rowIdx: idx,
                                    val: r.uraian,
                                    formula: "",
                                  })
                                }
                                onChange={(e) => {
                                  updateGuidedRowField(idx, "uraian", e.target.value);
                                  setActiveCellRef((prev) => ({ ...prev, val: e.target.value }));
                                }}
                                placeholder="Uraian belanja bahan..."
                                className="w-full h-full px-2.5 py-1.5 text-xs font-medium bg-transparent border-0 outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-800 rounded-xs"
                              />
                              {r.isLainnya && (
                                <span className="absolute bottom-1 right-1.5 text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/90 dark:bg-amber-950 px-1 py-0.2 rounded pointer-events-none">
                                  BINCANG
                                </span>
                              )}
                            </td>

                            {/* Kolom 2: Vol 1 */}
                            <td className="p-0 border-r border-slate-200 dark:border-slate-700">
                              <input
                                type="number"
                                min={1}
                                value={r.v1}
                                onFocus={() =>
                                  setActiveCellRef({
                                    cellName: `B${rowNum}`,
                                    colKey: "v1",
                                    rowIdx: idx,
                                    val: String(r.v1),
                                    formula: "",
                                  })
                                }
                                onChange={(e) => {
                                  updateGuidedRowField(idx, "v1", e.target.value);
                                  setActiveCellRef((prev) => ({ ...prev, val: e.target.value }));
                                }}
                                className="w-full h-full px-1 py-1.5 text-xs font-mono font-bold text-center bg-transparent border-0 outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-800"
                              />
                            </td>

                            {/* Kolom 3: Sat 1 */}
                            <td className="p-0 border-r border-slate-200 dark:border-slate-700">
                              <input
                                type="text"
                                value={r.s1}
                                onFocus={() =>
                                  setActiveCellRef({
                                    cellName: `C${rowNum}`,
                                    colKey: "s1",
                                    rowIdx: idx,
                                    val: r.s1,
                                    formula: "",
                                  })
                                }
                                onChange={(e) => {
                                  updateGuidedRowField(idx, "s1", e.target.value);
                                  setActiveCellRef((prev) => ({ ...prev, val: e.target.value }));
                                }}
                                placeholder="orang"
                                className="w-full h-full px-1 py-1.5 text-xs text-center bg-transparent border-0 outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-800"
                              />
                            </td>

                            {/* Kolom 4: Vol 2 */}
                            <td className="p-0 border-r border-slate-200 dark:border-slate-700">
                              <input
                                type="number"
                                min={1}
                                value={r.v2}
                                onFocus={() =>
                                  setActiveCellRef({
                                    cellName: `D${rowNum}`,
                                    colKey: "v2",
                                    rowIdx: idx,
                                    val: String(r.v2),
                                    formula: "",
                                  })
                                }
                                onChange={(e) => {
                                  updateGuidedRowField(idx, "v2", e.target.value);
                                  setActiveCellRef((prev) => ({ ...prev, val: e.target.value }));
                                }}
                                className="w-full h-full px-1 py-1.5 text-xs font-mono font-bold text-center bg-transparent border-0 outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-800"
                              />
                            </td>

                            {/* Kolom 5: Sat 2 */}
                            <td className="p-0 border-r border-slate-200 dark:border-slate-700">
                              <input
                                type="text"
                                value={r.s2}
                                onFocus={() =>
                                  setActiveCellRef({
                                    cellName: `E${rowNum}`,
                                    colKey: "s2",
                                    rowIdx: idx,
                                    val: r.s2,
                                    formula: "",
                                  })
                                }
                                onChange={(e) => {
                                  updateGuidedRowField(idx, "s2", e.target.value);
                                  setActiveCellRef((prev) => ({ ...prev, val: e.target.value }));
                                }}
                                placeholder="keg"
                                className="w-full h-full px-1 py-1.5 text-xs text-center bg-transparent border-0 outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-800"
                              />
                            </td>

                            {/* Kolom 6: Vol 3 */}
                            <td className="p-0 border-r border-slate-200 dark:border-slate-700">
                              <input
                                type="number"
                                min={1}
                                value={r.v3}
                                onFocus={() =>
                                  setActiveCellRef({
                                    cellName: `F${rowNum}`,
                                    colKey: "v3",
                                    rowIdx: idx,
                                    val: String(r.v3),
                                    formula: "",
                                  })
                                }
                                onChange={(e) => {
                                  updateGuidedRowField(idx, "v3", e.target.value);
                                  setActiveCellRef((prev) => ({ ...prev, val: e.target.value }));
                                }}
                                className="w-full h-full px-1 py-1.5 text-xs font-mono font-bold text-center bg-transparent border-0 outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-800"
                              />
                            </td>

                            {/* Kolom 7: Sat 3 */}
                            <td className="p-0 border-r border-slate-200 dark:border-slate-700">
                              <input
                                type="text"
                                value={r.s3}
                                onFocus={() =>
                                  setActiveCellRef({
                                    cellName: `G${rowNum}`,
                                    colKey: "s3",
                                    rowIdx: idx,
                                    val: r.s3,
                                    formula: "",
                                  })
                                }
                                onChange={(e) => {
                                  updateGuidedRowField(idx, "s3", e.target.value);
                                  setActiveCellRef((prev) => ({ ...prev, val: e.target.value }));
                                }}
                                placeholder="-"
                                className="w-full h-full px-1 py-1.5 text-xs text-center bg-transparent border-0 outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-800"
                              />
                            </td>

                            {/* Kolom 8: Vol Total (Rumus otomatis: Kolom B × D × F) */}
                            <td
                              className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700 text-center font-mono font-bold text-blue-800 dark:text-blue-300 bg-blue-50/40 dark:bg-blue-950/20 select-all"
                              title={`Rumus: Vol 1 (${r.v1}) × Vol 2 (${r.v2}) × Vol 3 (${r.v3})`}
                            >
                              {formatIndoNumber(r.totalVol)}
                            </td>

                            {/* Kolom 9: Satuan Total */}
                            <td className="p-0 border-r border-slate-200 dark:border-slate-700">
                              <input
                                type="text"
                                value={r.satTotal}
                                onFocus={() =>
                                  setActiveCellRef({
                                    cellName: `I${rowNum}`,
                                    colKey: "satTotal",
                                    rowIdx: idx,
                                    val: r.satTotal,
                                    formula: "",
                                  })
                                }
                                onChange={(e) => {
                                  updateGuidedRowField(idx, "satTotal", e.target.value);
                                  setActiveCellRef((prev) => ({ ...prev, val: e.target.value }));
                                }}
                                placeholder="OK"
                                className="w-full h-full px-1 py-1.5 text-xs text-center bg-transparent border-0 outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-800 font-medium"
                              />
                            </td>

                            {/* Kolom 10: Harga Satuan (Rp) */}
                            <td className="p-0 border-r border-slate-200 dark:border-slate-700">
                              <input
                                type="text"
                                value={formatIndoNumber(r.harga)}
                                onFocus={() =>
                                  setActiveCellRef({
                                    cellName: `J${rowNum}`,
                                    colKey: "harga",
                                    rowIdx: idx,
                                    val: String(r.harga),
                                    formula: "",
                                  })
                                }
                                onChange={(e) => {
                                  updateGuidedRowField(idx, "harga", e.target.value);
                                  setActiveCellRef((prev) => ({ ...prev, val: e.target.value }));
                                }}
                                className="w-full h-full px-2.5 py-1.5 text-xs font-mono font-bold text-right bg-transparent border-0 outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-800"
                              />
                            </td>

                            {/* Kolom 11: Total Biaya (ROUNDDOWN ribuan terdekat: Total Vol × Harga) */}
                            <td
                              className="px-2.5 py-1.5 border-r border-slate-200 dark:border-slate-700 text-right font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30 select-all"
                              title="Rumus: Pembulatan ke bawah ribuan terdekat (Total Vol × Harga)"
                            >
                              Rp {formatIndoNumber(r.totalBiaya)}
                            </td>

                            {/* Cell Aksi Baris */}
                            <td className="p-1 text-center bg-slate-50 dark:bg-slate-800/60">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleCopyGuidedRow(r)}
                                  title="Salin Baris (TSV)"
                                  className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateGuidedRow(idx)}
                                  title="Duplikat Baris"
                                  className="p-1 text-slate-400 hover:text-emerald-600 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGuidedRow(idx)}
                                  title="Hapus Baris"
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer Kertas Kerja Pro Renja */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 shrink-0 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuidedBelanjaStep("checklist")}
                    className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    ← Kembali ke Checklist
                  </button>
                  <span className="text-slate-500 font-medium">
                    Total: <strong>{guidedBelanjaRows.length}</strong> baris | Terpilih:{" "}
                    <strong className="text-blue-700 dark:text-blue-400">
                      {guidedBelanjaRows.filter((r) => r.selected).length}
                    </strong>
                  </span>
                  {guidedBelanjaRows.some((r) => r.isLainnya) && (
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      ⚠️ Terdapat item 'Lainnya' yang memerlukan verifikasi BINCANG
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Total Anggaran Belanja Bahan:</span>
                    <span className="text-base font-black font-mono text-blue-700 dark:text-blue-400">
                      Rp {formatIndoNumber(guidedBelanjaRows.reduce((sum, r) => sum + r.totalBiaya, 0))}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveGuidedBelanjaBahan}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {getNextGuidedStep("panduan_belanja_bahan")
                        ? `Simpan & Lanjut ke ${getNextGuidedStep("panduan_belanja_bahan")?.label}`
                        : "Simpan ke Kertas Kerja (Akun 521211)"}
                    </span>
                    {getNextGuidedStep("panduan_belanja_bahan") && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-MODAL: PASTE DATA EXCEL DENGAN TARGET CHECKLIST */}
          {pasteExcelModalOpen && (
            <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-5 space-y-3.5 shadow-2xl">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ClipboardPaste className="w-4 h-4 text-[#107c41]" />
                    <span>Tempel (Paste) Data dari Excel</span>
                  </h4>
                  <button
                    onClick={() => setPasteExcelModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
                  <p className="leading-relaxed">
                    Salin (Copy) baris data dari Excel Anda lalu tempel (Paste) ke kotak di bawah ini. Sistem otomatis membaca kolom ke-1 s.d. ke-10, menghitung total volume (Kolom 8), dan membulatkan total biaya ke ribuan terdekat (Kolom 11).
                  </p>

                  {/* Pilihan Target Baris yang Dituju */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                      Target Penggantian Data:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        pasteTargetOption === "selected"
                          ? "bg-amber-50 border-amber-500 font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200"
                          : "border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}>
                        <input
                          type="radio"
                          name="pasteTarget"
                          checked={pasteTargetOption === "selected"}
                          onChange={() => setPasteTargetOption("selected")}
                          className="accent-[#107c41]"
                        />
                        <span>
                          Ganti Baris Dicentang ({guidedBelanjaRows.filter((r) => r.selected).length})
                        </span>
                      </label>

                      <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        pasteTargetOption === "all"
                          ? "bg-blue-50 border-blue-500 font-bold text-blue-900 dark:bg-blue-950/60 dark:text-blue-200"
                          : "border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}>
                        <input
                          type="radio"
                          name="pasteTarget"
                          checked={pasteTargetOption === "all"}
                          onChange={() => setPasteTargetOption("all")}
                          className="accent-[#107c41]"
                        />
                        <span>Ganti Semua Baris</span>
                      </label>

                      <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        pasteTargetOption === "append"
                          ? "bg-emerald-50 border-emerald-500 font-bold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
                          : "border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}>
                        <input
                          type="radio"
                          name="pasteTarget"
                          checked={pasteTargetOption === "append"}
                          onChange={() => setPasteTargetOption("append")}
                          className="accent-[#107c41]"
                        />
                        <span>Tambah Baris Baru</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    Contoh format TSV Excel: <code>Konsumsi Rapat Pimpinan | 24 | orang | 20 | keg | | | 480 | OK | 76000 | 36480000</code>
                  </div>
                  <textarea
                    rows={6}
                    value={pasteExcelInputText}
                    onChange={(e) => setPasteExcelInputText(e.target.value)}
                    placeholder="Tempel (Paste) data dari Excel di sini..."
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-xs focus:border-[#107c41] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setPasteExcelModalOpen(false);
                      setPasteExcelInputText("");
                    }}
                    className="px-4 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyPastedExcel}
                    className="px-5 py-1.5 bg-[#107c41] hover:bg-[#0c6233] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-colors"
                  >
                    Terapkan ke Kertas Kerja
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL PANDUAN: PERJALANAN DINAS DALAM NEGERI (PANDUAN 3)
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "panduan_perjadin_dn" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-600">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Panduan: Perjalanan Dinas Domestik</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      SBM TA 2027
                    </span>
                  </h3>
                  <p className="text-[0.68rem] text-slate-500 dark:text-slate-400">
                    Otomatisasi pengisian Transport Lokal (Akun 524113) dan Perjalanan Dinas Biasa (Akun 524111) sesuai SBM
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalMode("panduan_jenis_belanja")}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checklist Jenis Perjalanan Dinas: Transport Lokal dan/atau Perjalanan Dinas Biasa */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Pilih Jenis Perjalanan Dinas:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Transport Lokal */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    perjadinJenisPilihan.includes("lokal")
                      ? "bg-sky-50 dark:bg-sky-950/40 border-sky-500 shadow-xs"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={perjadinJenisPilihan.includes("lokal")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPerjadinJenisPilihan((prev) => [...prev, "lokal"]);
                      } else {
                        setPerjadinJenisPilihan((prev) => prev.filter((x) => x !== "lokal"));
                      }
                    }}
                    className="mt-0.5 w-4 h-4 accent-sky-600 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Transport Lokal (Dalam Kota)
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Akun 524113 • Tarif standar SBM <strong>Rp170.000 / OK</strong>
                    </p>
                  </div>
                </label>

                {/* 2. Perjalanan Dinas Biasa */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    perjadinJenisPilihan.includes("biasa")
                      ? "bg-sky-50 dark:bg-sky-950/40 border-sky-500 shadow-xs"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={perjadinJenisPilihan.includes("biasa")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPerjadinJenisPilihan((prev) => [...prev, "biasa"]);
                      } else {
                        setPerjadinJenisPilihan((prev) => prev.filter((x) => x !== "biasa"));
                      }
                    }}
                    className="mt-0.5 w-4 h-4 accent-sky-600 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Perjalanan Dinas Biasa (Luar Kota)
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Akun 524111 • Tiket, Taksi, Penginapan, Uang Harian &amp; Representasi
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* SEKSI 1: INPUT TRANSPORT LOKAL */}
            {perjadinJenisPilihan.includes("lokal") && (
              <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-800/50 bg-sky-50/50 dark:bg-sky-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-sky-600" />
                    <span>Rincian Transport Lokal (Akun 524113)</span>
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-sky-700 dark:text-sky-300">
                    Total: Rp {formatIndoNumber(perjadinLokalOrg * perjadinLokalKeg * 170000)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Jumlah Orang (Vol 1)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        value={perjadinLokalOrg}
                        onChange={(e) => setPerjadinLokalOrg(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold bg-white dark:bg-slate-800"
                      />
                      <span className="text-xs text-slate-500">orang</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Jumlah Kegiatan (Vol 2)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        value={perjadinLokalKeg}
                        onChange={(e) => setPerjadinLokalKeg(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold bg-white dark:bg-slate-800"
                      />
                      <span className="text-xs text-slate-500">Keg</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Tarif SBM (Satuan OK)
                    </label>
                    <div className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      Rp 170.000 / OK
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEKSI 2: INPUT PERJALANAN DINAS BIASA */}
            {perjadinJenisPilihan.includes("biasa") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <span>Daftar Lokasi Tujuan Perjalanan Dinas Biasa (Akun 524111)</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                      <span className="px-2 py-1 text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700/60 border-r border-slate-300 dark:border-slate-700">
                        Jml
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={jumlahLokasiBaruInput}
                        onChange={(e) => setJumlahLokasiBaruInput(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                        className="w-14 px-2 py-1 text-xs font-mono font-bold text-center bg-transparent focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const provEntries = Array.from(new Set(lokasiFullData.map((l) => l.namaLokasi)))
                          .map((name) => {
                            const item = lokasiFullData.find((l) => l.namaLokasi === name);
                            return {
                              namaLokasi: name,
                              kodeProvinsi: item ? item.kodeProvinsi : "",
                            };
                          })
                          .sort((a, b) => a.kodeProvinsi.localeCompare(b.kodeProvinsi) || a.namaLokasi.localeCompare(b.namaLokasi));
                        const firstProv = provEntries[0]?.namaLokasi || "DKI JAKARTA";
                        const kabKotakFiltered = lokasiFullData
                          .filter((l) => l.namaLokasi === firstProv)
                          .sort((a, b) => a.fullKode.localeCompare(b.fullKode));
                        const firstKota = kabKotakFiltered[0]?.namaKabKota || "";

                        const count = Math.max(1, jumlahLokasiBaruInput);
                        const newEntries = Array.from({ length: count }).map((_, i) => ({
                          id: `lok-${Date.now()}-${i}`,
                          provinsi: firstProv,
                          kabKota: firstKota,
                          tiket1aOrg: 0, tiket1aKeg: 1,
                          tiket1bOrg: 1, tiket1bKeg: 1,
                          taksi1cOrg: 1, taksi1cKali: 2, taksi1cKeg: 1,
                          taksi1dOrg: 1, taksi1dKali: 2, taksi1dKeg: 1,
                          inap1eOrg: 0, inap1eHari: 1, inap1eKeg: 1,
                          inap1fOrg: 0, inap1fHari: 1, inap1fKeg: 1,
                          inap1gOrg: 0, inap1gHari: 1, inap1gKeg: 1,
                          inap1hOrg: 1, inap1hHari: 2, inap1hKeg: 1,
                          uang1iOrg: 1, uang1iHari: 3, uang1iKeg: 1,
                          rep1jOrg: 0, rep1jHari: 1, rep1jKeg: 1,
                          rep1kOrg: 0, rep1kHari: 1, rep1kKeg: 1,
                        }));
                        setPerjadinBiasaLokasiList((prev) => [...prev, ...newEntries]);
                      }}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Lokasi Tujuan ({jumlahLokasiBaruInput})</span>
                    </button>
                  </div>
                </div>

                {perjadinBiasaLokasiList.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 text-xs">
                    Belum ada lokasi tujuan yang ditambahkan. Klik tombol <strong>+ Tambah Lokasi Tujuan</strong> di atas.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {perjadinBiasaLokasiList.map((lokasi, idx) => {
                      const num = idx + 1;
                      const provList = Array.from(new Set(lokasiFullData.map((l) => l.namaLokasi)))
                        .map((name) => {
                          const item = lokasiFullData.find((l) => l.namaLokasi === name);
                          return {
                            namaLokasi: name,
                            kodeProvinsi: item ? item.kodeProvinsi : "",
                            label: `${item ? item.kodeProvinsi : ""} - ${name}`,
                          };
                        })
                        .sort((a, b) => a.kodeProvinsi.localeCompare(b.kodeProvinsi) || a.namaLokasi.localeCompare(b.namaLokasi));

                      const kabKotaList = lokasiFullData
                        .filter((l) => l.namaLokasi === lokasi.provinsi)
                        .map((k) => ({
                          ...k,
                          label: `${k.fullKode} - ${k.namaKabKota}`,
                        }))
                        .sort((a, b) => a.fullKode.localeCompare(b.fullKode) || a.namaKabKota.localeCompare(b.namaKabKota));

                      const tarif = getTarifPerjadinBiasa(lokasi.provinsi, lokasi.kabKota);

                      // Hitung total perkiraan per lokasi
                      const totalLokasi =
                        (lokasi.tiket1aOrg * lokasi.tiket1aKeg * tarif.tiketBisnis) +
                        (lokasi.tiket1bOrg * lokasi.tiket1bKeg * tarif.tiketEkonomi) +
                        (lokasi.taksi1cOrg * lokasi.taksi1cKali * lokasi.taksi1cKeg * tarif.taksiJakarta) +
                        (lokasi.taksi1dOrg * lokasi.taksi1dKali * lokasi.taksi1dKeg * tarif.taksiTujuan) +
                        (lokasi.inap1eOrg * lokasi.inap1eHari * lokasi.inap1eKeg * tarif.penginapanEselonI) +
                        (lokasi.inap1fOrg * lokasi.inap1fHari * lokasi.inap1fKeg * tarif.penginapanEselonII) +
                        (lokasi.inap1gOrg * lokasi.inap1gHari * lokasi.inap1gKeg * tarif.penginapanEselonIII) +
                        (lokasi.inap1hOrg * lokasi.inap1hHari * lokasi.inap1hKeg * tarif.penginapanGolIII) +
                        (lokasi.uang1iOrg * lokasi.uang1iHari * lokasi.uang1iKeg * tarif.uangHarian) +
                        (lokasi.rep1jOrg * lokasi.rep1jHari * lokasi.rep1jKeg * tarif.uangRepresentasiEselonI) +
                        (lokasi.rep1kOrg * lokasi.rep1kHari * lokasi.rep1kKeg * tarif.uangRepresentasiEselonII);

                      return (
                        <div
                          key={lokasi.id}
                          className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800/90 shadow-xs"
                        >
                          {/* Header Card Lokasi */}
                          <div className="bg-slate-100 dark:bg-slate-800 p-3.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                                {num}
                              </span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                Lokasi Tujuan #{num}: {lokasi.provinsi} — {lokasi.kabKota}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-300">
                                Subtotal: Rp {formatIndoNumber(totalLokasi)}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setPerjadinBiasaLokasiList((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                title="Hapus Lokasi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Pemilihan Dropdown Lokasi & Kota */}
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                  Header 1: Lokasi Tujuan (Provinsi)
                                </label>
                                <select
                                  value={lokasi.provinsi}
                                  onChange={(e) => {
                                    const newProv = e.target.value;
                                    const nextKabKotak = lokasiFullData.filter((l) => l.namaLokasi === newProv);
                                    setPerjadinBiasaLokasiList((prev) =>
                                      prev.map((item, i) =>
                                        i === idx
                                          ? {
                                              ...item,
                                              provinsi: newProv,
                                              kabKota: nextKabKotak[0]?.namaKabKota || "",
                                            }
                                          : item
                                      )
                                    );
                                  }}
                                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 font-semibold"
                                >
                                  {provList.map((p) => (
                                    <option key={p.namaLokasi} value={p.namaLokasi}>
                                      {p.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                  Header 2: Kota Tujuan (Kabupaten/Kota)
                                </label>
                                <select
                                  value={lokasi.kabKota}
                                  onChange={(e) => {
                                    const newKota = e.target.value;
                                    setPerjadinBiasaLokasiList((prev) =>
                                      prev.map((item, i) => (i === idx ? { ...item, kabKota: newKota } : item))
                                    );
                                  }}
                                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 font-semibold"
                                >
                                  {kabKotaList.map((k) => (
                                    <option key={k.fullKode || k.namaKabKota} value={k.namaKabKota}>
                                      {k.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Form Input Parameter 1a s.d 1k */}
                            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                                  <tr>
                                    <th className="p-2.5 w-12 text-center">Kode</th>
                                    <th className="p-2.5">Uraian Komponen Biaya</th>
                                    <th className="p-2.5 w-48 text-center">Volume Multiplier</th>
                                    <th className="p-2.5 w-24 text-center">Satuan</th>
                                    <th className="p-2.5 w-28 text-right">Tarif SBM (Rp)</th>
                                    <th className="p-2.5 w-32 text-right">Subtotal (Rp)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {/* 1a. Tiket Pesawat Eselon I */}
                                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-2 text-center font-bold text-slate-600">{num}a</td>
                                    <td className="p-2 font-medium">Tiket Pesawat (PP) Eselon I</td>
                                    <td className="p-2">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <input
                                          type="number"
                                          min={0}
                                          value={lokasi.tiket1aOrg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, tiket1aOrg: Math.max(0, Number(e.target.value) || 0) } : item
                                              )
                                            )
                                          }
                                          className="w-16 px-1.5 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">org ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.tiket1aKeg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, tiket1aKeg: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-16 px-1.5 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">keg</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-center text-[11px] font-semibold text-slate-600">OK</td>
                                    <td className="p-2 text-right font-mono text-[11px]">
                                      {formatIndoNumber(tarif.tiketBisnis)}
                                    </td>
                                    <td className="p-2 text-right font-mono font-bold text-sky-700 dark:text-sky-300">
                                      {formatIndoNumber(lokasi.tiket1aOrg * lokasi.tiket1aKeg * tarif.tiketBisnis)}
                                    </td>
                                  </tr>

                                  {/* 1b. Tiket Pesawat Eselon II ke Bawah */}
                                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-2 text-center font-bold text-slate-600">{num}b</td>
                                    <td className="p-2 font-medium">Tiket Pesawat (PP) Eselon II ke Bawah</td>
                                    <td className="p-2">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <input
                                          type="number"
                                          min={0}
                                          value={lokasi.tiket1bOrg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, tiket1bOrg: Math.max(0, Number(e.target.value) || 0) } : item
                                              )
                                            )
                                          }
                                          className="w-16 px-1.5 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">org ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.tiket1bKeg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, tiket1bKeg: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-16 px-1.5 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">keg</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-center text-[11px] font-semibold text-slate-600">OK</td>
                                    <td className="p-2 text-right font-mono text-[11px]">
                                      {formatIndoNumber(tarif.tiketEkonomi)}
                                    </td>
                                    <td className="p-2 text-right font-mono font-bold text-sky-700 dark:text-sky-300">
                                      {formatIndoNumber(lokasi.tiket1bOrg * lokasi.tiket1bKeg * tarif.tiketEkonomi)}
                                    </td>
                                  </tr>

                                  {/* 1c. Taksi Jakarta */}
                                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-2 text-center font-bold text-slate-600">{num}c</td>
                                    <td className="p-2 font-medium">Taksi Jakarta</td>
                                    <td className="p-2">
                                      <div className="flex items-center justify-center gap-1">
                                        <input
                                          type="number"
                                          min={0}
                                          value={lokasi.taksi1cOrg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, taksi1cOrg: Math.max(0, Number(e.target.value) || 0) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">org ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.taksi1cKali}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, taksi1cKali: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">kl ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.taksi1cKeg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, taksi1cKeg: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">keg</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-center text-[11px] font-semibold text-slate-600">OK</td>
                                    <td className="p-2 text-right font-mono text-[11px]">
                                      {formatIndoNumber(tarif.taksiJakarta)}
                                    </td>
                                    <td className="p-2 text-right font-mono font-bold text-sky-700 dark:text-sky-300">
                                      {formatIndoNumber(lokasi.taksi1cOrg * lokasi.taksi1cKali * lokasi.taksi1cKeg * tarif.taksiJakarta)}
                                    </td>
                                  </tr>

                                  {/* 1d. Taksi Lokasi Tujuan */}
                                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-2 text-center font-bold text-slate-600">{num}d</td>
                                    <td className="p-2 font-medium">Taksi ({cleanProvName(lokasi.provinsi) || "Lokasi Tujuan"})</td>
                                    <td className="p-2">
                                      <div className="flex items-center justify-center gap-1">
                                        <input
                                          type="number"
                                          min={0}
                                          value={lokasi.taksi1dOrg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, taksi1dOrg: Math.max(0, Number(e.target.value) || 0) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">org ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.taksi1dKali}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, taksi1dKali: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">kl ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.taksi1dKeg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, taksi1dKeg: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">keg</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-center text-[11px] font-semibold text-slate-600">OK</td>
                                    <td className="p-2 text-right font-mono text-[11px]">
                                      {formatIndoNumber(tarif.taksiTujuan)}
                                    </td>
                                    <td className="p-2 text-right font-mono font-bold text-sky-700 dark:text-sky-300">
                                      {formatIndoNumber(lokasi.taksi1dOrg * lokasi.taksi1dKali * lokasi.taksi1dKeg * tarif.taksiTujuan)}
                                    </td>
                                  </tr>

                                  {/* 1e. Penginapan Eselon I */}
                                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-2 text-center font-bold text-slate-600">{num}e</td>
                                    <td className="p-2 font-medium">Penginapan Eselon I</td>
                                    <td className="p-2">
                                      <div className="flex items-center justify-center gap-1">
                                        <input
                                          type="number"
                                          min={0}
                                          value={lokasi.inap1eOrg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, inap1eOrg: Math.max(0, Number(e.target.value) || 0) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">org ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.inap1eHari}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, inap1eHari: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">hari ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.inap1eKeg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, inap1eKeg: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">keg</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-center text-[11px] font-semibold text-slate-600">OH</td>
                                    <td className="p-2 text-right font-mono text-[11px]">
                                      {formatIndoNumber(tarif.penginapanEselonI)}
                                    </td>
                                    <td className="p-2 text-right font-mono font-bold text-sky-700 dark:text-sky-300">
                                      {formatIndoNumber(lokasi.inap1eOrg * lokasi.inap1eHari * lokasi.inap1eKeg * tarif.penginapanEselonI)}
                                    </td>
                                  </tr>

                                  {/* 1f. Penginapan Eselon II */}
                                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-2 text-center font-bold text-slate-600">{num}f</td>
                                    <td className="p-2 font-medium">Penginapan Eselon II</td>
                                    <td className="p-2">
                                      <div className="flex items-center justify-center gap-1">
                                        <input
                                          type="number"
                                          min={0}
                                          value={lokasi.inap1fOrg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, inap1fOrg: Math.max(0, Number(e.target.value) || 0) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">org ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.inap1fHari}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, inap1fHari: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">hari ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.inap1fKeg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, inap1fKeg: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">keg</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-center text-[11px] font-semibold text-slate-600">OH</td>
                                    <td className="p-2 text-right font-mono text-[11px]">
                                      {formatIndoNumber(tarif.penginapanEselonII)}
                                    </td>
                                    <td className="p-2 text-right font-mono font-bold text-sky-700 dark:text-sky-300">
                                      {formatIndoNumber(lokasi.inap1fOrg * lokasi.inap1fHari * lokasi.inap1fKeg * tarif.penginapanEselonII)}
                                    </td>
                                  </tr>

                                  {/* 1g. Penginapan Eselon III */}
                                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-2 text-center font-bold text-slate-600">{num}g</td>
                                    <td className="p-2 font-medium">Penginapan Eselon III</td>
                                    <td className="p-2">
                                      <div className="flex items-center justify-center gap-1">
                                        <input
                                          type="number"
                                          min={0}
                                          value={lokasi.inap1gOrg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, inap1gOrg: Math.max(0, Number(e.target.value) || 0) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">org ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.inap1gHari}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, inap1gHari: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">hari ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.inap1gKeg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, inap1gKeg: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">keg</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-center text-[11px] font-semibold text-slate-600">OH</td>
                                    <td className="p-2 text-right font-mono text-[11px]">
                                      {formatIndoNumber(tarif.penginapanEselonIII)}
                                    </td>
                                    <td className="p-2 text-right font-mono font-bold text-sky-700 dark:text-sky-300">
                                      {formatIndoNumber(lokasi.inap1gOrg * lokasi.inap1gHari * lokasi.inap1gKeg * tarif.penginapanEselonIII)}
                                    </td>
                                  </tr>

                                  {/* 1h. Penginapan Gol. III ke bawah */}
                                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-2 text-center font-bold text-slate-600">{num}h</td>
                                    <td className="p-2 font-medium">Penginapan Gol. III ke bawah</td>
                                    <td className="p-2">
                                      <div className="flex items-center justify-center gap-1">
                                        <input
                                          type="number"
                                          min={0}
                                          value={lokasi.inap1hOrg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, inap1hOrg: Math.max(0, Number(e.target.value) || 0) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">org ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.inap1hHari}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, inap1hHari: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">hari ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.inap1hKeg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, inap1hKeg: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">keg</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-center text-[11px] font-semibold text-slate-600">OH</td>
                                    <td className="p-2 text-right font-mono text-[11px]">
                                      {formatIndoNumber(tarif.penginapanGolIII)}
                                    </td>
                                    <td className="p-2 text-right font-mono font-bold text-sky-700 dark:text-sky-300">
                                      {formatIndoNumber(lokasi.inap1hOrg * lokasi.inap1hHari * lokasi.inap1hKeg * tarif.penginapanGolIII)}
                                    </td>
                                  </tr>

                                  {/* 1i. Uang Harian */}
                                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-2 text-center font-bold text-slate-600">{num}i</td>
                                    <td className="p-2 font-medium">Uang Harian (Luar Kota)</td>
                                    <td className="p-2">
                                      <div className="flex items-center justify-center gap-1">
                                        <input
                                          type="number"
                                          min={0}
                                          value={lokasi.uang1iOrg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, uang1iOrg: Math.max(0, Number(e.target.value) || 0) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">org ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.uang1iHari}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, uang1iHari: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">hari ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.uang1iKeg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, uang1iKeg: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">keg</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-center text-[11px] font-semibold text-slate-600">OH</td>
                                    <td className="p-2 text-right font-mono text-[11px]">
                                      {formatIndoNumber(tarif.uangHarian)}
                                    </td>
                                    <td className="p-2 text-right font-mono font-bold text-sky-700 dark:text-sky-300">
                                      {formatIndoNumber(lokasi.uang1iOrg * lokasi.uang1iHari * lokasi.uang1iKeg * tarif.uangHarian)}
                                    </td>
                                  </tr>

                                  {/* 1j. Uang Representasi Eselon I */}
                                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-2 text-center font-bold text-slate-600">{num}j</td>
                                    <td className="p-2 font-medium">Uang Representasi Eselon I</td>
                                    <td className="p-2">
                                      <div className="flex items-center justify-center gap-1">
                                        <input
                                          type="number"
                                          min={0}
                                          value={lokasi.rep1jOrg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, rep1jOrg: Math.max(0, Number(e.target.value) || 0) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">org ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.rep1jHari}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, rep1jHari: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">hari ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.rep1jKeg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, rep1jKeg: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">keg</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-center text-[11px] font-semibold text-slate-600">OH</td>
                                    <td className="p-2 text-right font-mono text-[11px]">
                                      {formatIndoNumber(tarif.uangRepresentasiEselonI)}
                                    </td>
                                    <td className="p-2 text-right font-mono font-bold text-sky-700 dark:text-sky-300">
                                      {formatIndoNumber(lokasi.rep1jOrg * lokasi.rep1jHari * lokasi.rep1jKeg * tarif.uangRepresentasiEselonI)}
                                    </td>
                                  </tr>

                                  {/* 1k. Uang Representasi Eselon II */}
                                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-2 text-center font-bold text-slate-600">{num}k</td>
                                    <td className="p-2 font-medium">Uang Representasi Eselon II</td>
                                    <td className="p-2">
                                      <div className="flex items-center justify-center gap-1">
                                        <input
                                          type="number"
                                          min={0}
                                          value={lokasi.rep1kOrg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, rep1kOrg: Math.max(0, Number(e.target.value) || 0) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">org ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.rep1kHari}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, rep1kHari: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">hari ×</span>
                                        <input
                                          type="number"
                                          min={1}
                                          value={lokasi.rep1kKeg}
                                          onChange={(e) =>
                                            setPerjadinBiasaLokasiList((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, rep1kKeg: Math.max(1, Number(e.target.value) || 1) } : item
                                              )
                                            )
                                          }
                                          className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                        />
                                        <span className="text-[10px] text-slate-500">keg</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-center text-[11px] font-semibold text-slate-600">OH</td>
                                    <td className="p-2 text-right font-mono text-[11px]">
                                      {formatIndoNumber(tarif.uangRepresentasiEselonII)}
                                    </td>
                                    <td className="p-2 text-right font-mono font-bold text-sky-700 dark:text-sky-300">
                                      {formatIndoNumber(lokasi.rep1kOrg * lokasi.rep1kHari * lokasi.rep1kKeg * tarif.uangRepresentasiEselonII)}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Footer Aksi Simpan */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-900 z-10">
              <button
                type="button"
                onClick={() => {
                  const prevStep = getPrevGuidedStep("panduan_perjadin_dn");
                  if (prevStep) {
                    handleTransitionToGuidedStep(prevStep.mode);
                  } else {
                    setModalMode("panduan_jenis_belanja");
                  }
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                {getPrevGuidedStep("panduan_perjadin_dn")
                  ? `← Kembali ke ${getPrevGuidedStep("panduan_perjadin_dn")?.label}`
                  : "Kembali ke Jenis Belanja"}
              </button>

              <button
                type="button"
                onClick={() => {
                  const success = handleSavePerjadinDomestik();
                  if (success) {
                    const nextStep = getNextGuidedStep("panduan_perjadin_dn");
                    if (nextStep) {
                      handleTransitionToGuidedStep(nextStep.mode);
                    } else {
                      setModalMode(null);
                    }
                  }
                }}
                disabled={
                  perjadinJenisPilihan.length === 0 ||
                  (perjadinJenisPilihan.includes("biasa") && perjadinBiasaLokasiList.length === 0)
                }
                className="px-6 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>
                  {getNextGuidedStep("panduan_perjadin_dn")
                    ? `Simpan & Lanjut ke ${getNextGuidedStep("panduan_perjadin_dn")?.label}`
                    : "Simpan Perjalanan Dinas ke Kertas Kerja"}
                </span>
                {getNextGuidedStep("panduan_perjadin_dn") && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL PANDUAN: PERJALANAN DINAS LUAR NEGERI (AKUN 524211)
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "panduan_perjadin_ln" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-5xl w-full p-6 space-y-5 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            {/* Header Dialog */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Panduan: Perjalanan Dinas Luar Negeri</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      Akun 524211 • Kurs Rp {formatIndoNumber(KURS_USD_ASUMSI_MAKRO)}/USD
                    </span>
                  </h3>
                  <p className="text-[0.68rem] text-slate-500 dark:text-slate-400">
                    Otomatisasi Tiket Pesawat Luar Negeri, Taksi Jakarta, Uang Harian, dan Uang Harian Perjalanan (30%) mengacu pada Standar Biaya Masukan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalMode("panduan_jenis_belanja")}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Parameter: Tentukan Jumlah Negara Terlebih Dahulu */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
              <div>
                <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block">
                  Tentukan Jumlah Negara Tujuan Terlebih Dahulu:
                </label>
                <span className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                  Tiap negara memiliki nama kegiatan / agenda (Header 1) yang dapat disesuaikan tersendiri
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={perjadinLNJumlahNegara}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(10, Number(e.target.value) || 1));
                    setPerjadinLNJumlahNegara(val);
                    // Sesuaikan jumlah list destinasi
                    setPerjadinLNDestinasiList((prev) => {
                      const allDests = getDaftarDestinasiLN();
                      const next = [...prev];
                      while (next.length < val) {
                        const idx = next.length;
                        const defaultDest = allDests[idx % allDests.length] || allDests[0];
                        next.push({
                          id: `ln-${Date.now()}-${idx}`,
                          judulKegiatan: "Sidang / Pertemuan Tingkat Internasional",
                          destinasiKey: defaultDest?.key || "JAKARTA - AMERIKA UTARA - Chicago",
                          benua: defaultDest?.benua || "AMERIKA UTARA",
                          negara: defaultDest?.negara || "Amerika Serikat",
                          kota: defaultDest?.kota || "Chicago",
                          labelHeader2: defaultDest?.label || "AMERIKA UTARA-Amerika Serikat - Chicago",
                          tiket1aOrg: 1, tiket1aKeg: 1,
                          tiket1bOrg: 1, tiket1bKeg: 1,
                          tiket1cOrg: 1, tiket1cKeg: 1,
                          tiket1dOrg: 0, tiket1dKeg: 1,
                          taksi1eOrg: 3, taksi1eKali: 2, taksi1eKeg: 1,
                          uang1fOrg: 1, uang1fHari: 5, uang1fKeg: 1,
                          uang1gOrg: 1, uang1gHari: 5, uang1gKeg: 1,
                          uang1hOrg: 1, uang1hHari: 5, uang1hKeg: 1,
                          uang1iOrg: 0, uang1iHari: 5, uang1iKeg: 1,
                          perj1jOrg: 1, perj1jHari: 2, perj1jKeg: 1,
                          perj1kOrg: 1, perj1kHari: 2, perj1kKeg: 1,
                          perj1lOrg: 1, perj1lHari: 2, perj1lKeg: 1,
                          perj1mOrg: 0, perj1mHari: 2, perj1mKeg: 1,
                        });
                      }
                      return next.slice(0, val);
                    });
                  }}
                  className="w-20 px-3 py-2 border border-indigo-300 dark:border-indigo-700 rounded-lg text-center text-xs font-mono font-bold bg-white dark:bg-slate-900"
                />
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">negara / lokasi</span>
              </div>
            </div>

            {/* List Formulir Input Setiap Destinasi Luar Negeri */}
            <div className="space-y-6">
              {perjadinLNDestinasiList.map((dest, idx) => {
                const tarif = getTarifPerjadinLN(dest.destinasiKey, KURS_USD_ASUMSI_MAKRO);
                const allDests = getDaftarDestinasiLN();
                const totalItem =
                  (dest.tiket1aOrg * dest.tiket1aKeg * tarif.tiketBisnisIDR) +
                  (dest.tiket1bOrg * dest.tiket1bKeg * tarif.tiketBisnisIDR) +
                  (dest.tiket1cOrg * dest.tiket1cKeg * tarif.tiketEkonomiIDR) +
                  (dest.tiket1dOrg * dest.tiket1dKeg * tarif.tiketEkonomiIDR) +
                  (dest.taksi1eOrg * dest.taksi1eKali * dest.taksi1eKeg * tarif.taksiJakarta) +
                  (dest.uang1fOrg * dest.uang1fHari * dest.uang1fKeg * tarif.uangHarianGolA_IDR) +
                  (dest.uang1gOrg * dest.uang1gHari * dest.uang1gKeg * tarif.uangHarianGolB_IDR) +
                  (dest.uang1hOrg * dest.uang1hHari * dest.uang1hKeg * tarif.uangHarianGolC_IDR) +
                  (dest.uang1iOrg * dest.uang1iHari * dest.uang1iKeg * tarif.uangHarianGolD_IDR) +
                  (dest.perj1jOrg * dest.perj1jHari * dest.perj1jKeg * tarif.uangHarianPerjadinGolA_IDR) +
                  (dest.perj1kOrg * dest.perj1kHari * dest.perj1kKeg * tarif.uangHarianPerjadinGolB_IDR) +
                  (dest.perj1lOrg * dest.perj1lHari * dest.perj1lKeg * tarif.uangHarianPerjadinGolC_IDR) +
                  (dest.perj1mOrg * dest.perj1mHari * dest.perj1mKeg * tarif.uangHarianPerjadinGolD_IDR);

                return (
                  <div
                    key={dest.id}
                    className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-800/80 shadow-xs space-y-4"
                  >
                    {/* Header Destinasi & Pilihan SBM */}
                    <div className="space-y-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>Negara Tujuan #{idx + 1} (Menjadi Header 2):</span>
                              <span className="font-mono text-indigo-700 dark:text-indigo-300">
                                {dest.labelHeader2}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              Merujuk ke Tabel SBM Satuan Biaya Tiket Pesawat LN PP & Uang Harian LN
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                            Pilih Benua - Negara - Kota:
                          </label>
                          <select
                            value={dest.destinasiKey}
                            onChange={(e) => {
                              const selectedKey = e.target.value;
                              const found = allDests.find((d) => d.key === selectedKey);
                              if (found) {
                                setPerjadinLNDestinasiList((prev) =>
                                  prev.map((item, i) =>
                                    i === idx
                                      ? {
                                          ...item,
                                          destinasiKey: found.key,
                                          benua: found.benua,
                                          negara: found.negara,
                                          kota: found.kota,
                                          labelHeader2: found.label,
                                        }
                                      : item
                                  )
                                );
                              }
                            }}
                            className="px-2.5 py-1.5 border border-indigo-300 dark:border-indigo-700 rounded-lg text-xs bg-white dark:bg-slate-900 font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate"
                          >
                            {allDests.map((d) => (
                              <option key={d.key} value={d.key}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Input Judul Kegiatan per Destinasi */}
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 flex items-center gap-1">
                          <span>Nama Kegiatan (Menjadi Header 1):</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={dest.judulKegiatan || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPerjadinLNDestinasiList((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, judulKegiatan: val } : it))
                            );
                          }}
                          placeholder="Contoh: Sidang Tahunan FATF / Kerjasama Bilateral"
                          className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Tabel Input Item 1a s.d 1m */}
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
                            <th className="p-2 w-12 text-center">Kode</th>
                            <th className="p-2">Uraian Rincian Belanja</th>
                            <th className="p-2 text-center">Volume / Rincian Perhitungan</th>
                            <th className="p-2 text-center w-14">Satuan</th>
                            <th className="p-2 text-right">Biaya Satuan (Rp)</th>
                            <th className="p-2 text-right">Jumlah (Rp)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                          {/* 1a. Tiket Pesawat Eselon I */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-2 text-center font-mono font-bold text-slate-500">{idx + 1}a</td>
                            <td className="p-2 font-semibold">Tiket Pesawat (PP) Eselon I</td>
                            <td className="p-2 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={dest.tiket1aOrg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, tiket1aOrg: Number(e.target.value) || 0 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">orang ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.tiket1aKeg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, tiket1aKeg: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">keg</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-semibold text-slate-600">OK</td>
                            <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.tiketBisnisIDR)}</td>
                            <td className="p-2 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {formatIndoNumber(dest.tiket1aOrg * dest.tiket1aKeg * tarif.tiketBisnisIDR)}
                            </td>
                          </tr>

                          {/* 1b. Tiket Pesawat Eselon II */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-2 text-center font-mono font-bold text-slate-500">{idx + 1}b</td>
                            <td className="p-2 font-semibold">Tiket Pesawat (PP) Eselon II</td>
                            <td className="p-2 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={dest.tiket1bOrg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, tiket1bOrg: Number(e.target.value) || 0 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">orang ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.tiket1bKeg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, tiket1bKeg: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">keg</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-semibold text-slate-600">OK</td>
                            <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.tiketBisnisIDR)}</td>
                            <td className="p-2 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {formatIndoNumber(dest.tiket1bOrg * dest.tiket1bKeg * tarif.tiketBisnisIDR)}
                            </td>
                          </tr>

                          {/* 1c. Tiket Pesawat Eselon III ke bawah */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-2 text-center font-mono font-bold text-slate-500">{idx + 1}c</td>
                            <td className="p-2 font-semibold">Tiket Pesawat (PP) Eselon III ke bawah</td>
                            <td className="p-2 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={dest.tiket1cOrg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, tiket1cOrg: Number(e.target.value) || 0 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">orang ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.tiket1cKeg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, tiket1cKeg: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">keg</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-semibold text-slate-600">OK</td>
                            <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.tiketEkonomiIDR)}</td>
                            <td className="p-2 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {formatIndoNumber(dest.tiket1cOrg * dest.tiket1cKeg * tarif.tiketEkonomiIDR)}
                            </td>
                          </tr>

                          {/* 1d. Tiket Pesawat Golongan III ke bawah */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-2 text-center font-mono font-bold text-slate-500">{idx + 1}d</td>
                            <td className="p-2 font-semibold">Tiket Pesawat (PP) Golongan III ke bawah</td>
                            <td className="p-2 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={dest.tiket1dOrg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, tiket1dOrg: Number(e.target.value) || 0 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">orang ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.tiket1dKeg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, tiket1dKeg: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">keg</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-semibold text-slate-600">OK</td>
                            <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.tiketEkonomiIDR)}</td>
                            <td className="p-2 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {formatIndoNumber(dest.tiket1dOrg * dest.tiket1dKeg * tarif.tiketEkonomiIDR)}
                            </td>
                          </tr>

                          {/* 1e. Taksi Jakarta */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-2 text-center font-mono font-bold text-slate-500">{idx + 1}e</td>
                            <td className="p-2 font-semibold">Taksi Jakarta</td>
                            <td className="p-2 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={dest.taksi1eOrg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, taksi1eOrg: Number(e.target.value) || 0 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">orang ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.taksi1eKali}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, taksi1eKali: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">kali ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.taksi1eKeg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, taksi1eKeg: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">keg</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-semibold text-slate-600">OK</td>
                            <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.taksiJakarta)}</td>
                            <td className="p-2 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {formatIndoNumber(dest.taksi1eOrg * dest.taksi1eKali * dest.taksi1eKeg * tarif.taksiJakarta)}
                            </td>
                          </tr>

                          {/* 1f. Uang Harian Gol A */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-2 text-center font-mono font-bold text-slate-500">{idx + 1}f</td>
                            <td className="p-2 font-semibold">Uang Harian Gol A</td>
                            <td className="p-2 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={dest.uang1fOrg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, uang1fOrg: Number(e.target.value) || 0 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">orang ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.uang1fHari}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, uang1fHari: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">hari ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.uang1fKeg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, uang1fKeg: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">keg</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                            <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.uangHarianGolA_IDR)}</td>
                            <td className="p-2 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {formatIndoNumber(dest.uang1fOrg * dest.uang1fHari * dest.uang1fKeg * tarif.uangHarianGolA_IDR)}
                            </td>
                          </tr>

                          {/* 1g. Uang Harian Gol B */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-2 text-center font-mono font-bold text-slate-500">{idx + 1}g</td>
                            <td className="p-2 font-semibold">Uang Harian Gol B</td>
                            <td className="p-2 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={dest.uang1gOrg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, uang1gOrg: Number(e.target.value) || 0 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">orang ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.uang1gHari}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, uang1gHari: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">hari ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.uang1gKeg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, uang1gKeg: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">keg</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                            <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.uangHarianGolB_IDR)}</td>
                            <td className="p-2 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {formatIndoNumber(dest.uang1gOrg * dest.uang1gHari * dest.uang1gKeg * tarif.uangHarianGolB_IDR)}
                            </td>
                          </tr>

                          {/* 1h. Uang Harian Gol C */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-2 text-center font-mono font-bold text-slate-500">{idx + 1}h</td>
                            <td className="p-2 font-semibold">Uang Harian Gol C</td>
                            <td className="p-2 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={dest.uang1hOrg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, uang1hOrg: Number(e.target.value) || 0 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">orang ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.uang1hHari}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, uang1hHari: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">hari ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.uang1hKeg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, uang1hKeg: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">keg</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                            <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.uangHarianGolC_IDR)}</td>
                            <td className="p-2 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {formatIndoNumber(dest.uang1hOrg * dest.uang1hHari * dest.uang1hKeg * tarif.uangHarianGolC_IDR)}
                            </td>
                          </tr>

                          {/* 1i. Uang Harian Gol D */}
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-2 text-center font-mono font-bold text-slate-500">{idx + 1}i</td>
                            <td className="p-2 font-semibold">Uang Harian Gol D</td>
                            <td className="p-2 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={dest.uang1iOrg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, uang1iOrg: Number(e.target.value) || 0 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">orang ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.uang1iHari}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, uang1iHari: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">hari ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.uang1iKeg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, uang1iKeg: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">keg</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                            <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.uangHarianGolD_IDR)}</td>
                            <td className="p-2 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {formatIndoNumber(dest.uang1iOrg * dest.uang1iHari * dest.uang1iKeg * tarif.uangHarianGolD_IDR)}
                            </td>
                          </tr>

                          {/* 1j. Uang Harian Perjalanan Gol A (30%) */}
                          <tr className="hover:bg-slate-50/50 bg-indigo-50/30 dark:bg-indigo-950/20">
                            <td className="p-2 text-center font-mono font-bold text-slate-500">{idx + 1}j</td>
                            <td className="p-2 font-semibold">
                              <span>Uang Harian Perjalanan Gol A</span>
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 ml-1.5 font-normal">(30% dari Gol A)</span>
                            </td>
                            <td className="p-2 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={dest.perj1jOrg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, perj1jOrg: Number(e.target.value) || 0 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">orang ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.perj1jHari}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, perj1jHari: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">hari ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.perj1jKeg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, perj1jKeg: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">keg</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                            <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.uangHarianPerjadinGolA_IDR)}</td>
                            <td className="p-2 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {formatIndoNumber(dest.perj1jOrg * dest.perj1jHari * dest.perj1jKeg * tarif.uangHarianPerjadinGolA_IDR)}
                            </td>
                          </tr>

                          {/* 1k. Uang Harian Perjalanan Gol B (30%) */}
                          <tr className="hover:bg-slate-50/50 bg-indigo-50/30 dark:bg-indigo-950/20">
                            <td className="p-2 text-center font-mono font-bold text-slate-500">{idx + 1}k</td>
                            <td className="p-2 font-semibold">
                              <span>Uang Harian Perjalanan Gol B</span>
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 ml-1.5 font-normal">(30% dari Gol B)</span>
                            </td>
                            <td className="p-2 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={dest.perj1kOrg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, perj1kOrg: Number(e.target.value) || 0 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">orang ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.perj1kHari}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, perj1kHari: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">hari ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.perj1kKeg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, perj1kKeg: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">keg</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                            <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.uangHarianPerjadinGolB_IDR)}</td>
                            <td className="p-2 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {formatIndoNumber(dest.perj1kOrg * dest.perj1kHari * dest.perj1kKeg * tarif.uangHarianPerjadinGolB_IDR)}
                            </td>
                          </tr>

                          {/* 1l. Uang Harian Perjalanan Gol C (30%) */}
                          <tr className="hover:bg-slate-50/50 bg-indigo-50/30 dark:bg-indigo-950/20">
                            <td className="p-2 text-center font-mono font-bold text-slate-500">{idx + 1}l</td>
                            <td className="p-2 font-semibold">
                              <span>Uang Harian Perjalanan Gol C</span>
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 ml-1.5 font-normal">(30% dari Gol C)</span>
                            </td>
                            <td className="p-2 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={dest.perj1lOrg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, perj1lOrg: Number(e.target.value) || 0 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">orang ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.perj1lHari}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, perj1lHari: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">hari ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.perj1lKeg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, perj1lKeg: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">keg</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                            <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.uangHarianPerjadinGolC_IDR)}</td>
                            <td className="p-2 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {formatIndoNumber(dest.perj1lOrg * dest.perj1lHari * dest.perj1lKeg * tarif.uangHarianPerjadinGolC_IDR)}
                            </td>
                          </tr>

                          {/* 1m. Uang Harian Perjalanan Gol D (30%) */}
                          <tr className="hover:bg-slate-50/50 bg-indigo-50/30 dark:bg-indigo-950/20">
                            <td className="p-2 text-center font-mono font-bold text-slate-500">{idx + 1}m</td>
                            <td className="p-2 font-semibold">
                              <span>Uang Harian Perjalanan Gol D</span>
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 ml-1.5 font-normal">(30% dari Gol D)</span>
                            </td>
                            <td className="p-2 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={dest.perj1mOrg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, perj1mOrg: Number(e.target.value) || 0 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">orang ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.perj1mHari}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, perj1mHari: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">hari ×</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={dest.perj1mKeg}
                                  onChange={(e) =>
                                    setPerjadinLNDestinasiList((prev) =>
                                      prev.map((it, i) => (i === idx ? { ...it, perj1mKeg: Number(e.target.value) || 1 } : it))
                                    )
                                  }
                                  className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                />
                                <span className="text-[10px] text-slate-500">keg</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                            <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.uangHarianPerjadinGolD_IDR)}</td>
                            <td className="p-2 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                              {formatIndoNumber(dest.perj1mOrg * dest.perj1mHari * dest.perj1mKeg * tarif.uangHarianPerjadinGolD_IDR)}
                            </td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr className="bg-indigo-50 dark:bg-indigo-950/40 font-bold border-t border-indigo-200 dark:border-indigo-800">
                            <td colSpan={5} className="p-2.5 text-right text-slate-700 dark:text-slate-300">
                              Total Kebutuhan Anggaran Destinasi #{idx + 1} ({dest.labelHeader2}):
                            </td>
                            <td className="p-2.5 text-right font-mono text-indigo-700 dark:text-indigo-300 text-xs">
                              Rp {formatIndoNumber(totalItem)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Aksi */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-900 z-10">
              <button
                type="button"
                onClick={() => {
                  const prevStep = getPrevGuidedStep("panduan_perjadin_ln");
                  if (prevStep) {
                    handleTransitionToGuidedStep(prevStep.mode);
                  } else {
                    setModalMode("panduan_jenis_belanja");
                  }
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                {getPrevGuidedStep("panduan_perjadin_ln")
                  ? `← Kembali ke ${getPrevGuidedStep("panduan_perjadin_ln")?.label}`
                  : "Kembali ke Jenis Belanja"}
              </button>

              <button
                type="button"
                onClick={() => {
                  const success = handleSavePerjadinLN();
                  if (success) {
                    const nextStep = getNextGuidedStep("panduan_perjadin_ln");
                    if (nextStep) {
                      handleTransitionToGuidedStep(nextStep.mode);
                    } else {
                      setModalMode(null);
                    }
                  }
                }}
                disabled={perjadinLNDestinasiList.length === 0}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>
                  {getNextGuidedStep("panduan_perjadin_ln")
                    ? `Simpan & Lanjut ke ${getNextGuidedStep("panduan_perjadin_ln")?.label}`
                    : "Simpan Perjalanan Dinas Luar Negeri ke Kertas Kerja"}
                </span>
                {getNextGuidedStep("panduan_perjadin_ln") && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL PANDUAN: PENYELENGGARAAN KONSINYERING (DALAM / LUAR KOTA)
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "panduan_konsinyering" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-5xl w-full p-6 space-y-5 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            {/* Header Dialog */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Panduan: Penyelenggaraan Konsinyering</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {konsinyeringJenisPilihan.includes("dalam_kota") && konsinyeringJenisPilihan.includes("luar_kota")
                        ? "Akun 524114 & 524119"
                        : konsinyeringJenisPilihan.includes("dalam_kota")
                        ? "Akun 524114 (Dalam Kota)"
                        : "Akun 524119 (Luar Kota)"}
                    </span>
                  </h3>
                  <p className="text-[0.68rem] text-slate-500 dark:text-slate-400">
                    Paket Meeting Fullboard / Fullday di luar kantor sesuai Standar Biaya Masukan (SBM)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalMode("panduan_jenis_belanja")}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checklist Jenis Konsinyering: Dalam Kota dan/atau Luar Kota */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Pilih Jenis Konsinyering yang Akan Diinput (Dapat Dicentang Keduanya):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    konsinyeringJenisPilihan.includes("dalam_kota")
                      ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-xs"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={konsinyeringJenisPilihan.includes("dalam_kota")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setKonsinyeringJenisPilihan((prev) => [...prev, "dalam_kota"]);
                      } else {
                        setKonsinyeringJenisPilihan((prev) => prev.filter((x) => x !== "dalam_kota"));
                      }
                    }}
                    className="mt-0.5 w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Konsinyering Dalam Kota
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      Header 2 terisi &apos;JAKARTA&apos; • Akun 524114 (Belanja Perjalanan Dinas Paket Meeting Dalam Kota).
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    konsinyeringJenisPilihan.includes("luar_kota")
                      ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-xs"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={konsinyeringJenisPilihan.includes("luar_kota")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setKonsinyeringJenisPilihan((prev) => [...prev, "luar_kota"]);
                      } else {
                        setKonsinyeringJenisPilihan((prev) => prev.filter((x) => x !== "luar_kota"));
                      }
                    }}
                    className="mt-0.5 w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Konsinyering Luar Kota
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      Header 2 merujuk pada Provinsi Tujuan • Akun 524119 (Belanja Perjalanan Dinas Paket Meeting Luar Kota).
                    </span>
                  </div>
                </label>
              </div>
            </div>



            {/* FORM KONSINYERING DALAM KOTA */}
            {konsinyeringJenisPilihan.includes("dalam_kota") && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs">
                  <div>
                    <span className="font-bold text-amber-950 dark:text-amber-200 block">
                      Tentukan Jumlah Kegiatan Konsinyering Dalam Kota Terlebih Dahulu ({konsinyeringDKKegiatanList.length}):
                    </span>
                    <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                      Tiap kegiatan konsinyering dalam kota memiliki nama kegiatan (Header 1) yang dapat disesuaikan tersendiri
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setKonsinyeringDKKegiatanList((prev) => [
                        ...prev,
                        {
                          id: `kdk-${Date.now()}-${prev.length}`,
                          namaKegiatan: "Konsinyering Penyusunan Rencana Kerja dan Anggaran",
                          trans1aOrg: 20, trans1aKeg: 1,
                          fb1bOrg: 1, fb1bHari: 2, fb1bKeg: 1,
                          fb1cOrg: 3, fb1cHari: 2, fb1cKeg: 1,
                          fb1dOrg: 16, fb1dHari: 2, fb1dKeg: 1,
                          fd1eOrg: 0, fd1eKeg: 1,
                          fd1fOrg: 0, fd1fKeg: 1,
                          fd1gOrg: 0, fd1gKeg: 1,
                          uh1hOrg: 20, uh1hHari: 2, uh1hKeg: 1,
                        },
                      ]);
                    }}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Kegiatan Konsinyering</span>
                  </button>
                </div>

                {konsinyeringDKKegiatanList.map((item, kIdx) => {
                  const tarif = getTarifKonsinyeringDalamKota();
                  const total =
                    (item.trans1aOrg * item.trans1aKeg * tarif.transportLokal) +
                    (item.fb1bOrg * item.fb1bHari * item.fb1bKeg * tarif.fullboardMenteri) +
                    (item.fb1cOrg * item.fb1cHari * item.fb1cKeg * tarif.fullboardEselonI_II) +
                    (item.fb1dOrg * item.fb1dHari * item.fb1dKeg * tarif.fullboardEselonIII) +
                    (item.fd1eOrg * item.fd1eKeg * tarif.fulldayMenteri) +
                    (item.fd1fOrg * item.fd1fKeg * tarif.fulldayEselonI_II) +
                    (item.fd1gOrg * item.fd1gKeg * tarif.fulldayEselonIII) +
                    (item.uh1hOrg * item.uh1hHari * item.uh1hKeg * tarif.uangHarianFullboard);

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-800/80 shadow-xs space-y-4"
                    >
                      {/* Baris Header Kegiatan & Lokasi JAKARTA */}
                      <div className="space-y-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {kIdx + 1}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>Kegiatan #{kIdx + 1} - Lokasi (Menjadi Header 2):</span>
                                <span className="font-mono text-amber-700 dark:text-amber-400">JAKARTA</span>
                              </div>
                              <span className="text-[10px] text-slate-500">
                                Akun 524114 (Belanja Perjalanan Dinas Paket Meeting Dalam Kota)
                              </span>
                            </div>
                          </div>

                          {konsinyeringDKKegiatanList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setKonsinyeringDKKegiatanList((prev) => prev.filter((_, i) => i !== kIdx))}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer self-start sm:self-auto"
                              title="Hapus Kegiatan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Input Nama Kegiatan (Menjadi Header 1) */}
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 flex items-center gap-1">
                            <span>Nama Kegiatan (Menjadi Header 1):</span>
                            <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.namaKegiatan || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setKonsinyeringDKKegiatanList((prev) =>
                                prev.map((it, i) => (i === kIdx ? { ...it, namaKegiatan: val } : it))
                              );
                            }}
                            placeholder="Contoh: Konsinyering Penyusunan Renja dan RKA-K/L"
                            className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      {/* Tabel 1a s.d 1h Konsinyering Dalam Kota */}
                      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
                              <th className="p-2 w-12 text-center">Kode</th>
                              <th className="p-2">Uraian Rincian Belanja</th>
                              <th className="p-2 text-center">Volume Perhitungan</th>
                              <th className="p-2 text-center w-14">Satuan</th>
                              <th className="p-2 text-right">Biaya Satuan SBM (Rp)</th>
                              <th className="p-2 text-right">Jumlah (Rp)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                            {/* 1a. Transport Lokal */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{kIdx + 1}a</td>
                              <td className="p-2 font-semibold">Transport Lokal</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.trans1aOrg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, trans1aOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.trans1aKeg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, trans1aKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OK</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.transportLokal)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.trans1aOrg * item.trans1aKeg * tarif.transportLokal)}
                              </td>
                            </tr>

                            {/* 1b. Fullboard Meeting Menteri */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{kIdx + 1}b</td>
                              <td className="p-2 font-semibold">Fullboard Meeting Menteri Setingkat Menteri dan Wakil Menteri</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.fb1bOrg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fb1bOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fb1bHari}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fb1bHari: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">hari ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fb1bKeg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fb1bKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OP</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.fullboardMenteri)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.fb1bOrg * item.fb1bHari * item.fb1bKeg * tarif.fullboardMenteri)}
                              </td>
                            </tr>

                            {/* 1c. Fullboard Eselon I dan II */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{kIdx + 1}c</td>
                              <td className="p-2 font-semibold">Fullboard Meeting Eselon I dan II/Pejabat Fungsional Utama</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.fb1cOrg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fb1cOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fb1cHari}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fb1cHari: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">hari ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fb1cKeg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fb1cKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OP</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.fullboardEselonI_II)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.fb1cOrg * item.fb1cHari * item.fb1cKeg * tarif.fullboardEselonI_II)}
                              </td>
                            </tr>

                            {/* 1d. Fullboard Eselon III ke bawah */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{kIdx + 1}d</td>
                              <td className="p-2 font-semibold">Fullboard Meeting Eselon III/Pejabat Fungsional Madya Ke Bawah</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.fb1dOrg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fb1dOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fb1dHari}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fb1dHari: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">hari ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fb1dKeg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fb1dKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OP</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.fullboardEselonIII)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.fb1dOrg * item.fb1dHari * item.fb1dKeg * tarif.fullboardEselonIII)}
                              </td>
                            </tr>

                            {/* 1e. Fullday Menteri */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{kIdx + 1}e</td>
                              <td className="p-2 font-semibold">Fullday Meeting Menteri Setingkat Menteri dan Wakil Menteri</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.fd1eOrg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fd1eOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fd1eKeg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fd1eKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OP</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.fulldayMenteri)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.fd1eOrg * item.fd1eKeg * tarif.fulldayMenteri)}
                              </td>
                            </tr>

                            {/* 1f. Fullday Eselon I dan II */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{kIdx + 1}f</td>
                              <td className="p-2 font-semibold">Fullday Meeting Eselon I dan II/Pejabat Fungsional Utama</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.fd1fOrg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fd1fOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fd1fKeg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fd1fKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OP</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.fulldayEselonI_II)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.fd1fOrg * item.fd1fKeg * tarif.fulldayEselonI_II)}
                              </td>
                            </tr>

                            {/* 1g. Fullday Eselon III */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{kIdx + 1}g</td>
                              <td className="p-2 font-semibold">Fullday Meeting Eselon III/Pejabat Fungsional Madya Ke Bawah</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.fd1gOrg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fd1gOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fd1gKeg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, fd1gKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OP</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.fulldayEselonIII)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.fd1gOrg * item.fd1gKeg * tarif.fulldayEselonIII)}
                              </td>
                            </tr>

                            {/* 1h. Uang Harian Fullboard Meeting */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{kIdx + 1}h</td>
                              <td className="p-2 font-semibold">Uang Harian Fullboard Meeting</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.uh1hOrg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, uh1hOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.uh1hHari}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, uh1hHari: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">hari ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.uh1hKeg}
                                    onChange={(e) =>
                                      setKonsinyeringDKKegiatanList((prev) =>
                                        prev.map((it, i) => (i === kIdx ? { ...it, uh1hKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.uangHarianFullboard)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.uh1hOrg * item.uh1hHari * item.uh1hKeg * tarif.uangHarianFullboard)}
                              </td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr className="bg-amber-50 dark:bg-amber-950/40 font-bold border-t border-amber-200 dark:border-amber-800">
                              <td colSpan={5} className="p-2.5 text-right text-slate-700 dark:text-slate-300">
                                Total Kebutuhan Anggaran Kegiatan #{kIdx + 1} (JAKARTA):
                              </td>
                              <td className="p-2.5 text-right font-mono text-amber-700 dark:text-amber-300 text-xs">
                                Rp {formatIndoNumber(total)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

{/* FORM KONSINYERING LUAR KOTA */}
            {konsinyeringJenisPilihan.includes("luar_kota") && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs">
                  <div>
                    <span className="font-bold text-amber-950 dark:text-amber-200 block">
                      Tentukan Jumlah Kegiatan / Lokasi Terlebih Dahulu ({konsinyeringLKProvinsiList.length}):
                    </span>
                    <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                      Tiap provinsi / lokasi memiliki nama kegiatan (Header 1) yang dapat disesuaikan tersendiri
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const distinctProvs = [...new Set((lokasiData as any[]).map((l) => l.provinsi || l.namaProvinsi || ""))].filter(Boolean);
                      const defProv = distinctProvs[konsinyeringLKProvinsiList.length % distinctProvs.length] || "06 ACEH";
                      setKonsinyeringLKProvinsiList((prev) => [
                        ...prev,
                        {
                          id: `klk-${Date.now()}-${prev.length}`,
                          namaKegiatan: "Konsinyering Penyusunan Rencana Kerja dan Anggaran",
                          provinsi: defProv,
                          tiket1aOrg: 1, tiket1aKeg: 1,
                          tiket1bOrg: 5, tiket1bKeg: 1,
                          taksi1cOrg: 6, taksi1cKali: 2, taksi1cKeg: 1,
                          taksi1dOrg: 6, taksi1dKali: 2, taksi1dKeg: 1,
                          inap1eOrg: 1, inap1eHari: 3, inap1eKeg: 1,
                          inap1fOrg: 1, inap1fHari: 3, inap1fKeg: 1,
                          inap1gOrg: 4, inap1gHari: 3, inap1gKeg: 1,
                          inap1hOrg: 0, inap1hHari: 3, inap1hKeg: 1,
                          fb1iOrg: 1, fb1iHari: 3, fb1iKeg: 1,
                          fb1jOrg: 1, fb1jHari: 3, fb1jKeg: 1,
                          fb1kOrg: 4, fb1kHari: 3, fb1kKeg: 1,
                          fd1lOrg: 0, fd1lKeg: 1,
                          fd1mOrg: 0, fd1mKeg: 1,
                          fd1nOrg: 0, fd1nKeg: 1,
                          uhfb1oOrg: 6, uhfb1oHari: 3, uhfb1oKeg: 1,
                          uh1pOrg: 6, uh1pHari: 3, uh1pKeg: 1,
                        },
                      ]);
                    }}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Kegiatan / Lokasi Provinsi</span>
                  </button>
                </div>

                {konsinyeringLKProvinsiList.map((item, pIdx) => {
                  const tarif = getTarifKonsinyeringLuarKota(item.provinsi);
                  const cleanProv = formatDisplayProv(item.provinsi);
                  const distinctProvs = [...new Set((lokasiData as any[]).map((l) => l.provinsi || l.namaProvinsi || ""))].filter(Boolean);

                  const totalProv =
                    (item.tiket1aOrg * item.tiket1aKeg * tarif.tiketBisnis) +
                    (item.tiket1bOrg * item.tiket1bKeg * tarif.tiketEkonomi) +
                    (item.taksi1cOrg * item.taksi1cKali * item.taksi1cKeg * tarif.taksiJakarta) +
                    (item.taksi1dOrg * item.taksi1dKali * item.taksi1dKeg * tarif.taksiTujuan) +
                    (item.inap1eOrg * item.inap1eHari * item.inap1eKeg * tarif.penginapanEselonI) +
                    (item.inap1fOrg * item.inap1fHari * item.inap1fKeg * tarif.penginapanEselonII) +
                    (item.inap1gOrg * item.inap1gHari * item.inap1gKeg * tarif.penginapanEselonIII) +
                    (item.inap1hOrg * item.inap1hHari * item.inap1hKeg * tarif.penginapanGolIII) +
                    (item.fb1iOrg * item.fb1iHari * item.fb1iKeg * tarif.fullboardMenteri) +
                    (item.fb1jOrg * item.fb1jHari * item.fb1jKeg * tarif.fullboardEselonI_II) +
                    (item.fb1kOrg * item.fb1kHari * item.fb1kKeg * tarif.fullboardEselonIII) +
                    (item.fd1lOrg * item.fd1lKeg * tarif.fulldayMenteri) +
                    (item.fd1mOrg * item.fd1mKeg * tarif.fulldayEselonI_II) +
                    (item.fd1nOrg * item.fd1nKeg * tarif.fulldayEselonIII) +
                    (item.uhfb1oOrg * item.uhfb1oHari * item.uhfb1oKeg * tarif.uangHarianFullboard) +
                    (item.uh1pOrg * item.uh1pHari * item.uh1pKeg * tarif.uangHarianLuarKota);

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-800/80 shadow-xs space-y-4"
                    >
                      {/* Baris Provinsi Tujuan (Header 2) & Nama Kegiatan (Header 1) */}
                      <div className="space-y-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {pIdx + 1}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>Kegiatan #{pIdx + 1} - Lokasi (Menjadi Header 2):</span>
                                <span className="font-mono text-amber-700 dark:text-amber-300">
                                  {cleanProv}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500">
                                Pilihan merujuk pada data master submenu Lokasi
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                              Provinsi Tujuan:
                            </label>
                            <select
                              value={item.provinsi}
                              onChange={(e) => {
                                const newProv = e.target.value;
                                setKonsinyeringLKProvinsiList((prev) =>
                                  prev.map((it, i) => (i === pIdx ? { ...it, provinsi: newProv } : it))
                                );
                              }}
                              className="px-2.5 py-1.5 border border-amber-300 dark:border-amber-700 rounded-lg text-xs bg-white dark:bg-slate-900 font-semibold text-slate-800 dark:text-slate-200"
                            >
                              {distinctProvs.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                            {konsinyeringLKProvinsiList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setKonsinyeringLKProvinsiList((prev) => prev.filter((_, i) => i !== pIdx))}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Hapus Lokasi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Input Nama Kegiatan (Menjadi Header 1) untuk lokasi ini */}
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 flex items-center gap-1">
                            <span>Nama Kegiatan (Menjadi Header 1):</span>
                            <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.namaKegiatan || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setKonsinyeringLKProvinsiList((prev) =>
                                prev.map((it, i) => (i === pIdx ? { ...it, namaKegiatan: val } : it))
                              );
                            }}
                            placeholder="Contoh: Konsinyering Penyusunan Renja dan RKA-K/L"
                            className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      {/* Tabel 1a s.d 1p Konsinyering Luar Kota */}
                      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
                              <th className="p-2 w-12 text-center">Kode</th>
                              <th className="p-2">Uraian Rincian Belanja</th>
                              <th className="p-2 text-center">Volume Perhitungan</th>
                              <th className="p-2 text-center w-14">Satuan</th>
                              <th className="p-2 text-right">Biaya Satuan SBM (Rp)</th>
                              <th className="p-2 text-right">Jumlah (Rp)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                            {/* 1a. Tiket Pesawat Eselon I */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}a</td>
                              <td className="p-2 font-semibold">Tiket Pesawat (PP) Eselon I</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.tiket1aOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, tiket1aOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.tiket1aKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, tiket1aKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OK</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.tiketBisnis)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.tiket1aOrg * item.tiket1aKeg * tarif.tiketBisnis)}
                              </td>
                            </tr>

                            {/* 1b. Tiket Pesawat Eselon II ke Bawah */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}b</td>
                              <td className="p-2 font-semibold">Tiket Pesawat (PP) Eselon II ke Bawah</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.tiket1bOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, tiket1bOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.tiket1bKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, tiket1bKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OK</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.tiketEkonomi)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.tiket1bOrg * item.tiket1bKeg * tarif.tiketEkonomi)}
                              </td>
                            </tr>

                            {/* 1c. Taksi Jakarta */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}c</td>
                              <td className="p-2 font-semibold">Taksi Jakarta</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.taksi1cOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, taksi1cOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.taksi1cKali}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, taksi1cKali: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">kali ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.taksi1cKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, taksi1cKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OK</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.taksiJakarta)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.taksi1cOrg * item.taksi1cKali * item.taksi1cKeg * tarif.taksiJakarta)}
                              </td>
                            </tr>

                            {/* 1d. Taksi Tujuan */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}d</td>
                              <td className="p-2 font-semibold">Taksi ({cleanProv})</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.taksi1dOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, taksi1dOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.taksi1dKali}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, taksi1dKali: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">kali ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.taksi1dKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, taksi1dKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OK</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.taksiTujuan)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.taksi1dOrg * item.taksi1dKali * item.taksi1dKeg * tarif.taksiTujuan)}
                              </td>
                            </tr>

                            {/* 1e. Penginapan Eselon I */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}e</td>
                              <td className="p-2 font-semibold">Penginapan Eselon I</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.inap1eOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, inap1eOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.inap1eHari}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, inap1eHari: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">hari ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.inap1eKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, inap1eKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.penginapanEselonI)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.inap1eOrg * item.inap1eHari * item.inap1eKeg * tarif.penginapanEselonI)}
                              </td>
                            </tr>

                            {/* 1f. Penginapan Eselon II */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}f</td>
                              <td className="p-2 font-semibold">Penginapan Eselon II</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.inap1fOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, inap1fOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.inap1fHari}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, inap1fHari: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">hari ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.inap1fKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, inap1fKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.penginapanEselonII)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.inap1fOrg * item.inap1fHari * item.inap1fKeg * tarif.penginapanEselonII)}
                              </td>
                            </tr>

                            {/* 1g. Penginapan Eselon III */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}g</td>
                              <td className="p-2 font-semibold">Penginapan Eselon III</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.inap1gOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, inap1gOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.inap1gHari}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, inap1gHari: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">hari ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.inap1gKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, inap1gKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.penginapanEselonIII)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.inap1gOrg * item.inap1gHari * item.inap1gKeg * tarif.penginapanEselonIII)}
                              </td>
                            </tr>

                            {/* 1h. Penginapan Gol. III */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}h</td>
                              <td className="p-2 font-semibold">Penginapan Gol. III</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.inap1hOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, inap1hOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.inap1hHari}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, inap1hHari: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">hari ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.inap1hKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, inap1hKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.penginapanGolIII)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.inap1hOrg * item.inap1hHari * item.inap1hKeg * tarif.penginapanGolIII)}
                              </td>
                            </tr>

                            {/* 1i. Fullboard Meeting Menteri */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}i</td>
                              <td className="p-2 font-semibold">Fullboard Meeting Menteri Setingkat Menteri dan Wakil Menteri</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.fb1iOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fb1iOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fb1iHari}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fb1iHari: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">hari ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fb1iKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fb1iKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OP</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.fullboardMenteri)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.fb1iOrg * item.fb1iHari * item.fb1iKeg * tarif.fullboardMenteri)}
                              </td>
                            </tr>

                            {/* 1j. Fullboard Eselon I dan II */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}j</td>
                              <td className="p-2 font-semibold">Fullboard Meeting Eselon I dan II/Pejabat Fungsional Utama</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.fb1jOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fb1jOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fb1jHari}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fb1jHari: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">hari ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fb1jKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fb1jKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OP</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.fullboardEselonI_II)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.fb1jOrg * item.fb1jHari * item.fb1jKeg * tarif.fullboardEselonI_II)}
                              </td>
                            </tr>

                            {/* 1k. Fullboard Eselon III */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}k</td>
                              <td className="p-2 font-semibold">Fullboard Meeting Eselon III/Pejabat Fungsional Madya Ke Bawah</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.fb1kOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fb1kOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fb1kHari}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fb1kHari: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">hari ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fb1kKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fb1kKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OP</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.fullboardEselonIII)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.fb1kOrg * item.fb1kHari * item.fb1kKeg * tarif.fullboardEselonIII)}
                              </td>
                            </tr>

                            {/* 1l. Fullday Menteri */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}l</td>
                              <td className="p-2 font-semibold">Fullday Meeting Menteri Setingkat Menteri dan Wakil Menteri</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.fd1lOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fd1lOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fd1lKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fd1lKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OP</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.fulldayMenteri)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.fd1lOrg * item.fd1lKeg * tarif.fulldayMenteri)}
                              </td>
                            </tr>

                            {/* 1m. Fullday Eselon I dan II */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}m</td>
                              <td className="p-2 font-semibold">Fullday Meeting Eselon I dan II/Pejabat Fungsional Utama</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.fd1mOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fd1mOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fd1mKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fd1mKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OP</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.fulldayEselonI_II)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.fd1mOrg * item.fd1mKeg * tarif.fulldayEselonI_II)}
                              </td>
                            </tr>

                            {/* 1n. Fullday Eselon III */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}n</td>
                              <td className="p-2 font-semibold">Fullday Meeting Eselon III/Pejabat Fungsional Madya Ke Bawah</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.fd1nOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fd1nOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.fd1nKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, fd1nKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OP</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.fulldayEselonIII)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.fd1nOrg * item.fd1nKeg * tarif.fulldayEselonIII)}
                              </td>
                            </tr>

                            {/* 1o. Uang Harian Fullboard Meeting */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}o</td>
                              <td className="p-2 font-semibold">Uang Harian Fullboard Meeting</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.uhfb1oOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, uhfb1oOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.uhfb1oHari}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, uhfb1oHari: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">hari ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.uhfb1oKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, uhfb1oKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.uangHarianFullboard)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.uhfb1oOrg * item.uhfb1oHari * item.uhfb1oKeg * tarif.uangHarianFullboard)}
                              </td>
                            </tr>

                            {/* 1p. Uang Harian */}
                            <tr>
                              <td className="p-2 text-center font-mono font-bold text-slate-500">{pIdx + 1}p</td>
                              <td className="p-2 font-semibold">Uang Harian</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.uh1pOrg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, uh1pOrg: Number(e.target.value) || 0 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">orang ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.uh1pHari}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, uh1pHari: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">hari ×</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.uh1pKeg}
                                    onChange={(e) =>
                                      setKonsinyeringLKProvinsiList((prev) =>
                                        prev.map((it, i) => (i === pIdx ? { ...it, uh1pKeg: Number(e.target.value) || 1 } : it))
                                      )
                                    }
                                    className="w-12 px-1 py-1 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                                  />
                                  <span className="text-[10px] text-slate-500">keg</span>
                                </div>
                              </td>
                              <td className="p-2 text-center font-semibold text-slate-600">OH</td>
                              <td className="p-2 text-right font-mono">{formatIndoNumber(tarif.uangHarianLuarKota)}</td>
                              <td className="p-2 text-right font-mono font-bold text-amber-700 dark:text-amber-300">
                                {formatIndoNumber(item.uh1pOrg * item.uh1pHari * item.uh1pKeg * tarif.uangHarianLuarKota)}
                              </td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr className="bg-amber-50 dark:bg-amber-950/40 font-bold border-t border-amber-200 dark:border-amber-800">
                              <td colSpan={5} className="p-2.5 text-right text-slate-700 dark:text-slate-300">
                                Total Kebutuhan Anggaran Lokasi #{pIdx + 1} ({cleanProv}):
                              </td>
                              <td className="p-2.5 text-right font-mono text-amber-700 dark:text-amber-300 text-xs">
                                Rp {formatIndoNumber(totalProv)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Aksi */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-900 z-10">
              <button
                type="button"
                onClick={() => {
                  const prevStep = getPrevGuidedStep("panduan_konsinyering");
                  if (prevStep) {
                    handleTransitionToGuidedStep(prevStep.mode);
                  } else {
                    setModalMode("panduan_jenis_belanja");
                  }
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                {getPrevGuidedStep("panduan_konsinyering")
                  ? `← Kembali ke ${getPrevGuidedStep("panduan_konsinyering")?.label}`
                  : "Kembali ke Jenis Belanja"}
              </button>

              <button
                type="button"
                disabled={
                  konsinyeringJenisPilihan.length === 0 ||
                  (konsinyeringJenisPilihan.includes("dalam_kota") && konsinyeringDKKegiatanList.length === 0) ||
                  (konsinyeringJenisPilihan.includes("luar_kota") && konsinyeringLKProvinsiList.length === 0)
                }
                onClick={() => {
                  const success = handleSaveKonsinyering();
                  if (success) {
                    const nextStep = getNextGuidedStep("panduan_konsinyering");
                    if (nextStep) {
                      handleTransitionToGuidedStep(nextStep.mode);
                    } else {
                      setModalMode(null);
                    }
                  }
                }}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>
                  {getNextGuidedStep("panduan_konsinyering")
                    ? `Simpan & Lanjut ke ${getNextGuidedStep("panduan_konsinyering")?.label}`
                    : "Simpan Konsinyering ke Kertas Kerja"}
                </span>
                {getNextGuidedStep("panduan_konsinyering") && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: WIZARD PANDUAN PENGISIAN AKUN & DETAIL BELANJA
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "panduan_wizard" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            {/* Header Wizard */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Panduan Penginputan Rincian Belanja
                  </h3>
                  <p className="text-[0.68rem] text-slate-500">Langkah {wizardStep} dari 3</p>
                </div>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center justify-center gap-2">
              <div className={`h-1.5 rounded-full transition-all ${wizardStep === 1 ? "w-8 bg-emerald-600" : "w-3 bg-emerald-200 dark:bg-emerald-900"}`} />
              <div className={`h-1.5 rounded-full transition-all ${wizardStep === 2 ? "w-8 bg-emerald-600" : "w-3 bg-emerald-200 dark:bg-emerald-900"}`} />
              <div className={`h-1.5 rounded-full transition-all ${wizardStep === 3 ? "w-8 bg-emerald-600" : "w-3 bg-emerald-200 dark:bg-emerald-900"}`} />
            </div>

            {/* Step 1: Pilih Kelompok & Jenis Akun BAS */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    1. Pilih Kelompok Belanja (Akun 3 Digit):
                  </label>
                  <select
                    value={wizardKategoriAkun}
                    onChange={(e) => {
                      setWizardKategoriAkun(e.target.value);
                      const filtered = baganAkunStandar.filter((b) => b.kode.startsWith(e.target.value));
                      if (filtered.length > 0) {
                        setWizardAkun(filtered[0].kode);
                        setWizardAkunUraian(filtered[0].nama);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                  >
                    <option value="521">521 - Belanja Barang Operasional / Non Operasional</option>
                    <option value="522">522 - Belanja Jasa Konsultansi &amp; Profesi</option>
                    <option value="524">524 - Belanja Perjalanan Dinas (Luar/Dalam Negeri)</option>
                    <option value="523">523 - Belanja Pemeliharaan</option>
                    <option value="532">532 - Belanja Modal Peralatan dan Mesin</option>
                    <option value="536">536 - Belanja Modal Lainnya / Aset Tak Berwujud</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    2. Pilih Akun BAS 6 Digit:
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
                    {baganAkunStandar
                      .filter((b) => b.kode.startsWith(wizardKategoriAkun))
                      .map((akun) => (
                        <div
                          key={akun.kode}
                          onClick={() => {
                            setWizardAkun(akun.kode);
                            setWizardAkunUraian(akun.nama);
                          }}
                          className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                            wizardAkun === akun.kode
                              ? "bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-900 dark:text-emerald-200 border-l-4 border-emerald-600"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div>
                            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 mr-2">
                              {akun.kode}
                            </span>
                            <span>{akun.nama}</span>
                          </div>
                          {wizardAkun === akun.kode && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Rincian Kegiatan & Uraian Belanja */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <span className="font-medium text-emerald-900 dark:text-emerald-200">Akun Terpilih:</span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                    {wizardAkun} - {wizardAkunUraian}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Uraian Rincian Belanja / Kegiatan:
                  </label>
                  <input
                    type="text"
                    value={wizardItemUraian}
                    onChange={(e) => setWizardItemUraian(e.target.value)}
                    placeholder="Contoh: Konsumsi Rapat Koordinasi, Tiket Pesawat, Jasa Narasumber..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold"
                  />
                  <p className="text-[0.68rem] text-slate-500 mt-1">
                    Tuliskan uraian barang/jasa yang akan dibelanjakan pada akun ini.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Volume & Biaya Satuan */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Volume 1 (Orang / Unit):
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        value={wizardVol1}
                        onChange={(e) => setWizardVol1(Math.max(1, Number(e.target.value)))}
                        className="w-1/2 px-2 py-1.5 border border-slate-300 rounded text-center font-bold"
                      />
                      <input
                        type="text"
                        value={wizardSat1}
                        onChange={(e) => setWizardSat1(e.target.value.toUpperCase())}
                        placeholder="ORG"
                        className="w-1/2 px-2 py-1.5 border border-slate-300 rounded text-center uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Volume 2 (Kegiatan / Hari / Bulan):
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        value={wizardVol2}
                        onChange={(e) => setWizardVol2(Math.max(1, Number(e.target.value)))}
                        className="w-1/2 px-2 py-1.5 border border-slate-300 rounded text-center font-bold"
                      />
                      <input
                        type="text"
                        value={wizardSat2}
                        onChange={(e) => setWizardSat2(e.target.value.toUpperCase())}
                        placeholder="KEG"
                        className="w-1/2 px-2 py-1.5 border border-slate-300 rounded text-center uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tarif Biaya Satuan (Rp):
                  </label>
                  <input
                    type="number"
                    value={wizardHargaSatuan}
                    onChange={(e) => setWizardHargaSatuan(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-right font-bold text-sm"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center text-xs">
                  <span className="font-medium text-emerald-900 dark:text-emerald-200">
                    Total Volume: <strong>{wizardVol1 * wizardVol2} {wizardSat1} {wizardSat2}</strong>
                  </span>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                    Total: Rp {formatRupiah((wizardVol1 * wizardVol2) * wizardHargaSatuan)}
                  </span>
                </div>
              </div>
            )}

            {/* Tombol Navigasi Wizard */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
              {wizardStep > 1 ? (
                <button
                  onClick={() => setWizardStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Kembali
                </button>
              ) : (
                <button
                  onClick={() => setModalMode("pilih_metode")}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Ganti Metode
                </button>
              )}

              {wizardStep < 3 ? (
                <button
                  onClick={() => {
                    if (wizardStep === 2 && !wizardItemUraian.trim()) {
                      triggerAlert("Mohon isi uraian rincian belanja terlebih dahulu!");
                      return;
                    }
                    setWizardStep((prev) => (prev + 1) as any);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSaveFromWizard}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesai &amp; Rekam Belanja</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: UPLOAD FILE EXCEL (.XLS, .XLSX) - KHUSUS BINCANG & SUPER ADMIN
         ══════════════════════════════════════════════════════════════════════ */}
      {modalMode === "upload_excel" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Upload Rincian Belanja (.xls / .xlsx)</span>
                    <span className="text-[0.62rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                      Privilege: {currentUserRole}
                    </span>
                  </h3>
                  <p className="text-[0.68rem] text-slate-500">
                    File excel akan dibaca dan disisipkan langsung di bawah Sub Komponen aktif.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Box Upload Drag-Drop */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-violet-300 dark:border-violet-700 hover:border-violet-500 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-violet-50/30 dark:bg-violet-950/20 cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Klik di sini untuk memilih file atau seret file ke sini
                </p>
                <p className="text-[0.68rem] text-slate-500 mt-0.5">
                  Mendukung file format <strong>.xls</strong> dan <strong>.xlsx</strong>
                </p>
              </div>
              {uploadFile && (
                <div className="mt-2 px-3 py-1 bg-violet-100 dark:bg-violet-900/60 rounded-full text-xs font-bold text-violet-700 dark:text-violet-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            {/* Error Notif jika ada */}
            {uploadError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Download Template & Informasi Format */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#0078d4]" />
                <span className="text-[0.7rem] text-slate-600 dark:text-slate-300">
                  Belum punya format tabel yang sesuai?
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template Excel</span>
              </button>
            </div>

            {/* Preview Data Hasil Parsing */}
            {uploadPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Pratinjau Data yang Terdeteksi ({uploadPreview.length} baris):</span>
                  <span className="text-violet-600">
                    Total: Rp {formatRupiah(uploadPreview.reduce((acc, curr) => acc + curr.jumlah, 0))}
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg text-[0.68rem] divide-y divide-slate-100 dark:divide-slate-800">
                  {uploadPreview.map((item, idx) => (
                    <div key={idx} className="p-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800">
                      <div className="truncate max-w-[65%]">
                        <span className="font-mono font-bold text-slate-600 dark:text-slate-400 mr-1.5">
                          {item.kodeAkun}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.uraianDetail}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 mr-2">{item.vol} {item.satuan}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                          Rp {formatRupiah(item.jumlah)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setModalMode("pilih_metode")}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Kembali ke Pilihan
              </button>
              <button
                disabled={uploadPreview.length === 0 || isProcessingUpload}
                onClick={handleConfirmUpload}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Impor ke Kertas Kerja</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: NOTIFIKASI ERROR DUPLIKASI DATA SAAT SIMPAN WORKSHEET (SIMPEL & ELEGAN)
         ══════════════════════════════════════════════════════════════════════ */}
      {duplicateErrors.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-950/70 text-rose-600 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Gagal Menyimpan: Terdapat Baris Duplikat
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Baris yang bermasalah telah ditandai dengan warna merah di tabel kerja:
                </p>
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3 max-h-48 overflow-y-auto">
              <ul className="space-y-1.5 text-xs text-rose-900 dark:text-rose-200 font-medium">
                {duplicateErrors.map((err, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0">•</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={() => setDuplicateErrors([])}
                className="w-full sm:w-auto px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Tutup &amp; Periksa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IsianRabPage() {
  return (
    <RabErrorBoundary>
      <IsianRabPageContent />
    </RabErrorBoundary>
  );
}
