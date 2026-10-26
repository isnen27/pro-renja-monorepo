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
} from "lucide-react";
import unitKerjaData from "../../data/unitKerjaData.json";
import { baganAkunStandar } from "../../data/baganAkunStandar";
import informasiKinerjaData from "../../data/informasiKinerjaData.json";
import sbkData from "../../data/sbkData.json";
import rekapSasaranRenjaAllData from "../../data/rekapSasaranRenjaAllData.json";
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
  if (row.type === "subkomponen_sub" || row.type === "header1" || row.type === "header2") {
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
      computedAmounts[idx] = Number(row.jumlah) || 0;
      return computedAmounts[idx];
    }
    const children = childrenMap.get(idx) || [];
    if (children.length === 0) {
      computedAmounts[idx] = Number(row.jumlah) || 0;
      return computedAmounts[idx];
    }
    let total = 0;
    for (const childIdx of children) {
      total += getSum(childIdx);
    }
    computedAmounts[idx] = total;
    return total;
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
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export default function IsianRabPage() {
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

  // State Clipboard untuk Copy & Paste baris
  const [copiedRow, setCopiedRow] = useState<WorksheetRow | null>(null);

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
    | "ro"
    | "komponen"
    | "subkomponen"
    | "akun"
    | "header1"
    | "header2"
    | "detail"
    | "edit"
    | "pilih_metode"
    | "panduan_wizard"
    | "upload_excel"
    | null
  >("kro");

  // State Sub Komponen Target untuk input lanjutan setelah rekam Sub Komponen
  const [targetSubkompRowId, setTargetSubkompRowId] = useState<string | null>(null);

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
    };
  });

  // Form Rekam Komponen (Persis Gambar 3)
  const [formKomponen, setFormKomponen] = useState(() => {
    const p = parseInformasiKinerjaRow(filteredInformasiKinerja[0]);
    return {
      kode: p.kompKode,
      uraian: p.kompNama,
      jenisBiaya: "OPERASIONAL",
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
    });
    setFormKomponen({
      kode: p.kompKode,
      uraian: p.kompNama,
      jenisBiaya: "OPERASIONAL",
      sifatBiaya: "UTAMA",
    });
  }, [filteredInformasiKinerja]);

  const [actionAlert, setActionAlert] = useState<string | null>(null);

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

  // List RO yang tersedia untuk KRO aktif (difilter berdasarkan KRO yang dipilih / Unit Kerja aktif)
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

    // Target KRO yang sedang dipilih (contoh: "3382.BKC" atau "3374.EBD")
    const targetKroRaw = (selectedKroOption || formKroDialog.kroKode || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const targetAktivitas = formKroDialog.aktivitasKode || "";

    // 1. Prioritas Utama: Ambil dari Informasi Kinerja Unit Kerja aktif pada TOR
    filteredInformasiKinerja.forEach((ik, idx) => {
      const p = parseInformasiKinerjaRow(ik);
      const isMatch = !targetKroRaw ||
        p.kroKode.toUpperCase() === targetKroRaw ||
        `${p.aktivitasKode}${p.kroKode}`.toUpperCase() === targetKroRaw ||
        p.fullKroKode.toUpperCase().includes(targetKroRaw);

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
        const currentKroKey = `${keg}${kro}`.toUpperCase();
        const fullKode = `${prog}.${keg}.${kro}.${sub}`;

        const isKroMatch =
          !targetKroRaw ||
          targetKroRaw === kro.toUpperCase() ||
          targetKroRaw === currentKroKey ||
          (targetAktivitas === keg && targetKroRaw.includes(kro.toUpperCase()));

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
  }, [filteredInformasiKinerja, selectedKroOption, formKroDialog.kroKode, formKroDialog.aktivitasKode, roSearchQuery]);

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

  // List Komponen yang tersedia untuk RO aktif (difilter Unit Kerja aktif & RO yang dipilih)
  const availableKomponensForRo = useMemo(() => {
    const list: Array<{
      kode: string;
      shortKode: string;
      deskripsi: string;
      jenis: string;
    }> = [];
    const seen = new Set<string>();

    // Dapatkan RO aktif: utamakan baris RO yang dipilih di kertas kerja, jika belum ada ambil RO terakhir di worksheet, lalu formRo
    const selectedRoInWorksheet = worksheetRows.find((r) => r.id === selectedRowId && r.type === "ro");
    const lastRoInWorksheet = [...worksheetRows].reverse().find((r) => r.type === "ro");
    const activeRoRow = selectedRoInWorksheet || lastRoInWorksheet;

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
      subkomponen_sub: 8,
      detail: 9,
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
      // Isian KRO mereset / menambah KRO
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
      }));
      setModalMode("ro");
      return;
    }

    if (targetMode === "komponen") {
      if (curType !== "ro") {
        triggerAlert("Baris baru level Komponen hanya dapat ditambahkan di bawah baris level RO.");
        return;
      }
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

    // Tampilkan s.d. level KRO persis permintaan user
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

    if (editingRowId) {
      setWorksheetRows((prev) => {
        const next = prev.map((r) => {
          if (r.id === editingRowId) {
            return {
              ...r,
              kode: cleanRoKode,
              uraian: formRo.roNama,
              vol: Number(formRo.volume) || r.vol,
            };
          }
          return r;
        });
        return calculateHierarchyAmounts(next);
      });
      setEditingRowId(null);
      setModalMode(null);
      triggerAlert(`RO ${cleanRoKode} - ${formRo.roNama} berhasil diperbarui!`);
      return;
    }

    const newRow: WorksheetRow = {
      id: `row-ro-${Date.now()}`,
      type: "ro",
      kode: cleanRoKode,
      uraian: formRo.roNama,
      badge: "[Kerangka Regulasi 7%]",
      subUraian: "Jumlah Komponen Utama [100.00%]",
      vol: Number(formRo.volume) || 19,
      sat: "peraturan",
      jumlah: 743651000,
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

    if (editingRowId) {
      setWorksheetRows((prev) => {
        const next = prev.map((r) => {
          if (r.id === editingRowId) {
            return {
              ...r,
              kode: formKomponen.kode,
              uraian: formKomponen.uraian,
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
    const newRow: WorksheetRow = {
      id: `row-hdr1-${Date.now()}`,
      type: "subkomponen_sub",
      headerLevel: 1,
      kode: "",
      uraian: `> ${formHeader1.nomenklatur}`,
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
    const newRow: WorksheetRow = {
      id: `row-hdr2-${Date.now()}`,
      type: "subkomponen_sub",
      headerLevel: 2,
      kode: "",
      uraian: `>> ${formHeader2.nomenklatur}`,
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
        const lastHdrIdx = prev.map((r) => r.type).lastIndexOf("subkomponen_sub");
        if (lastHdrIdx >= 0) {
          const insertIdx = findInsertionIndexForSubtree(lastHdrIdx, "subkomponen_sub");
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
    const subtotal = volTotal * formDetail.satuanBiaya;

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
    const subtotal = volTotal * (wizardHargaSatuan || 0);

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

  // Handler Hapus Baris Terpilih
  function handleDeleteSelected() {
    if (!selectedRowId) {
      triggerAlert("Pilih baris yang ingin dihapus terlebih dahulu.");
      return;
    }
    const target = worksheetRows.find((r) => r.id === selectedRowId);
    setWorksheetRows((prev) => calculateHierarchyAmounts(prev.filter((r) => r.id !== selectedRowId)));
    setSelectedRowId("");
    triggerAlert(`Baris "${target?.uraian || selectedRowId}" berhasil dihapus.`);
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
            updated.vol = vol;
            updated.jumlah = vol * hrg;
          } else if (field === "vol") {
            const vol = Number(updated.vol) || 0;
            const hrg = Number(updated.harga) || 0;
            updated.jumlah = vol * hrg;
          }
        }
        return updated;
      })
    );
    // Recalculate hierarchy amounts whenever cell changes
    setWorksheetRows((prev) => calculateHierarchyAmounts(prev));
  }

  // Handler toggle status baris individual (O, S, U, K, D)
  function handleToggleRowStatus(rowId: string, field: "cO" | "cS" | "cU" | "cK" | "cD") {
    setWorksheetRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const currentVal = field === "cO" ? (r.cO ?? r.c0 ?? false) : !!r[field];
        return { ...r, [field]: !currentVal, ...(field === "cO" ? { c0: !currentVal } : {}) };
      })
    );
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
        volume: target.vol || 19,
      }));
      setModalMode("ro");
      return;
    }

    if (target.type === "komponen") {
      setEditingRowId(target.id);
      // Populasi form Komponen
      const badgeMatch = target.badge?.match(/\[(.*?)\]/);
      const sifat = badgeMatch ? badgeMatch[1] : "UTAMA";
      setFormKomponen((prev) => ({
        ...prev,
        kode: target.kode,
        uraian: target.uraian,
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

  // Handler Copy (Salin baris terpilih ke clipboard)
  function handleCopySelected() {
    const target = worksheetRows.find((r) => r.id === selectedRowId);
    if (!target) {
      triggerAlert("Pilih baris yang ingin disalin terlebih dahulu.");
      return;
    }
    setCopiedRow({ ...target });
    triggerAlert(`Baris "${target.uraian}" berhasil disalin (Copy). Klik ikon Paste untuk menempelkan.`);
  }

  // Handler Paste (Tempelkan baris yang disalin di bawah baris terpilih)
  function handlePaste() {
    if (!copiedRow) {
      triggerAlert("Belum ada baris yang disalin (Copy). Silakan klik ikon Copy pada baris yang diinginkan.");
      return;
    }
    const clone: WorksheetRow = {
      ...copiedRow,
      id: `row-${copiedRow.type}-${Date.now()}`,
      uraian: `${copiedRow.uraian} (Salinan)`,
    };

    setWorksheetRows((prev) => {
      const idx = prev.findIndex((r) => r.id === selectedRowId);
      if (idx >= 0) {
        const next = [...prev];
        next.splice(idx + 1, 0, clone);
        return next;
      }
      return [...prev, clone];
    });

    setSelectedRowId(clone.id);
    triggerAlert(`Baris "${clone.uraian}" berhasil ditempelkan (Paste)!`);
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
    const canInlineEdit = row.type === "subkomponen_sub" || row.type === "detail";

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
            onChange={() => handleToggleRowStatus(row.id, "cO")}
            className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
          />
        </td>
        {/* Kolom S: Satker, approve Eselon II */}
        <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center" title="S : Satker, approve Eselon II">
          <input
            type="checkbox"
            checked={!!row.cS}
            onChange={() => handleToggleRowStatus(row.id, "cS")}
            className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
          />
        </td>
        {/* Kolom U: Unit, approve Eselon I */}
        <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center" title="U : Unit, approve Eselon I">
          <input
            type="checkbox"
            checked={!!row.cU}
            onChange={() => handleToggleRowStatus(row.id, "cU")}
            className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
          />
        </td>
        {/* Kolom K: Kementerian, approve BINCANG */}
        <td className="p-1 border-r border-slate-200 dark:border-slate-700 text-center" title="K : Kementerian, approve BINCANG">
          <input
            type="checkbox"
            checked={!!row.cK}
            onChange={() => handleToggleRowStatus(row.id, "cK")}
            className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
          />
        </td>
        {/* Kolom D: DJA, approve Kementerian Keuangan */}
        <td className="p-1 text-center" title="D : DJA, approve Kementerian Keuangan">
          <input
            type="checkbox"
            checked={!!row.cD}
            onChange={() => handleToggleRowStatus(row.id, "cD")}
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
                className={`p-1.5 rounded transition-colors cursor-pointer ${copiedRow ? "text-blue-600 hover:bg-blue-50" : "opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
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
                onClick={() => triggerAlert("Worksheet Isian RAB berhasil disimpan!")}
                title="Save / Simpan Data"
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

                // 1. Tipe: PROGRAM
                if (row.type === "program") {
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      className={`cursor-pointer transition-colors ${isSelected ? "bg-[#0078d4] text-white" : "hover:bg-amber-50/50"}`}
                    >
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-mono font-bold ${isSelected ? "bg-[#006bbd] text-white" : "bg-slate-200/80 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200"}`}>
                        {renderEditableCell(row, "kode", row.kode, "font-mono font-bold text-center")}
                      </td>
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-bold ${isSelected ? "bg-[#0078d4] text-white" : "bg-[#fef9c3] dark:bg-yellow-950/40 text-slate-900 dark:text-yellow-200"}`}>
                        {renderEditableCell(row, "uraian", row.uraian, "font-bold text-left")}
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
                      className={`cursor-pointer transition-colors ${isSelected ? "bg-[#0078d4] text-white" : "hover:bg-slate-100"}`}
                    >
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-mono font-bold text-center ${isSelected ? "bg-[#006bbd] text-white" : "bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100"}`}>
                        {renderEditableCell(row, "kode", row.kode, "font-mono font-bold text-center")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 underline font-semibold">
                        {renderEditableCell(row, "uraian", row.uraian, "underline font-semibold text-left")}
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
                      className={`cursor-pointer transition-colors ${isSelected ? "bg-[#0078d4] text-white" : "hover:bg-slate-50"}`}
                    >
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-mono text-center ${isSelected ? "bg-[#006bbd] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"}`}>
                        {renderEditableCell(row, "kode", row.kode, "font-mono text-center font-semibold")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700">
                        <div className="italic font-medium">
                          {renderEditableCell(row, "uraian", row.uraian, "italic font-medium text-left")}
                        </div>
                        {row.subUraian && (
                          <div className={`text-[0.65rem] ${isSelected ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
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
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      className={`cursor-pointer transition-colors ${isSelected ? "bg-[#0078d4] text-white" : "hover:bg-amber-50/40"}`}
                    >
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-mono text-center ${isSelected ? "bg-[#006bbd] text-white" : "bg-[#fef08a] dark:bg-yellow-950/60 text-slate-900 dark:text-yellow-200 font-bold"}`}>
                        {renderEditableCell(row, "kode", row.kode, "font-mono font-bold text-center")}
                      </td>
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 ${isSelected ? "" : "bg-[#fef9c3] dark:bg-yellow-950/40 font-bold text-slate-900 dark:text-yellow-100"}`}>
                        <div className="font-semibold flex items-center gap-1.5 flex-wrap">
                          <span className="flex-1">
                            {renderEditableCell(row, "uraian", row.uraian, "font-semibold text-left")}
                          </span>
                          {row.badge && (
                            <span className={`font-bold text-xs ${isSelected ? "text-yellow-200" : "text-fuchsia-700 dark:text-fuchsia-400"}`}>
                              {row.badge}
                            </span>
                          )}
                        </div>
                        {row.subUraian && (
                          <div className={`text-[0.65rem] ${isSelected ? "text-blue-100" : "text-slate-500 dark:text-slate-400 font-normal"}`}>
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
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700">
                        {renderEditableCell(row, "sat", row.sat, "text-center")}
                      </td>
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

                // 5. Tipe: KOMPONEN (Kode 052 / 52 Highlight Biru Muda persis Gambar 2, Murni Spreadsheet tanpa tulisan drill-up/down)
                if (row.type === "komponen") {
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      className={`cursor-pointer transition-colors ${isSelected ? "bg-[#0078d4] text-white" : "hover:bg-blue-50/60"}`}
                    >
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-mono font-bold text-center ${isSelected ? "bg-[#006bbd] text-white" : "bg-[#dbeafe] dark:bg-blue-950/60 text-blue-900 dark:text-blue-200"}`}>
                        {renderEditableCell(row, "kode", row.kode, "font-mono font-bold text-center")}
                      </td>
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700 font-bold ${isSelected ? "" : "bg-[#e0e7ff] dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200"}`}>
                        {renderEditableCell(row, "uraian", row.uraian, "font-bold text-left")}
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
                      className={`cursor-pointer transition-colors ${isSelected ? "bg-[#0078d4] text-white" : "hover:bg-slate-50"}`}
                    >
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-mono italic text-center font-bold">
                        {renderEditableCell(row, "kode", row.kode, "font-mono italic text-center font-bold")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 italic font-medium">
                        {renderEditableCell(row, "uraian", row.uraian, "italic font-medium text-left")}
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
                      className={`cursor-pointer transition-colors ${isSelected ? "bg-[#0078d4] text-white" : "hover:bg-slate-50"}`}
                    >
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-mono font-bold underline">
                        {renderEditableCell(row, "kode", row.kode, "font-mono font-bold underline text-center")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">
                        <div>{renderEditableCell(row, "uraian", row.uraian, "font-bold text-left")}</div>
                        {row.subUraian && (
                          <div className={`text-[0.65rem] font-normal ${isSelected ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
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

                // 8. Tipe: SUBKOMPONEN SUB-LEVEL (misal: > Singapore, > Taiwan)
                if (row.type === "subkomponen_sub") {
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      className={`cursor-pointer transition-colors ${isSelected ? "bg-[#0078d4] text-white" : "hover:bg-slate-50"}`}
                    >
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700"></td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold pl-4">
                        {renderEditableCell(row, "uraian", row.uraian, "font-bold text-left pl-2")}
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
                        : "hover:bg-blue-50/40 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center">
                      {renderEditableCell(row, "kode", row.kode, "text-center font-mono")}
                    </td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 pl-6 font-mono text-[0.72rem]">
                      {renderEditableCell(row, "uraian", row.uraian, "text-left font-mono")}
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
                    <th className="p-2.5 text-left">Deskripsi / Uraian KRO</th>
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

                    return Array.from(kroMap.values()).map((kroItem, idx) => {
                      return (
                        <tr
                          key={idx}
                          onClick={() => {
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
                          className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                        >
                          <td className="p-2.5 font-mono font-bold text-[#0078d4] border-r border-slate-200 dark:border-slate-700">
                            {kroItem.kodeAktivitas}.{kroItem.kodeKro}
                          </td>
                          <td className="p-2.5 font-medium">{kroItem.namaKro}</td>
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
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Pilih Lokasi</h3>
              <button onClick={() => setShowLokasiPickerModal(false)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>
            <div className="space-y-1 text-xs">
              {[
                { k1: "01", k2: "51", nama: "KOTA JAKARTA PUSAT" },
                { k1: "01", k2: "52", nama: "KOTA JAKARTA UTARA" },
                { k1: "01", k2: "53", nama: "KOTA JAKARTA BARAT" },
                { k1: "01", k2: "54", nama: "KOTA JAKARTA SELATAN" },
                { k1: "01", k2: "55", nama: "KOTA JAKARTA TIMUR" },
                { k1: "02", k2: "58", nama: "KOTA DEPOK" },
              ].map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setFormKroDialog((prev) => ({
                      ...prev,
                      lokasi1: loc.k1,
                      lokasi2: loc.k2,
                      lokasiNama: loc.nama,
                    }));
                    setShowLokasiPickerModal(false);
                  }}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer flex items-center justify-between font-medium"
                >
                  <span className="font-mono font-bold text-[#0078d4]">{loc.k1}.{loc.k2}</span>
                  <span>{loc.nama}</span>
                </div>
              ))}
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
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Volume</span>
                <input
                  type="number"
                  value={formRo.volume}
                  onChange={(e) => setFormRo({ ...formRo, volume: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                />
              </div>

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
                        setFormRo((prev) => ({
                          ...prev,
                          roNama: selectedSbkPicker.uraian,
                          volume: Number(selectedSbkPicker.volume) || prev.volume,
                        }));
                        triggerAlert(`SBK "${selectedSbkPicker.uraian}" berhasil dipilih.`);
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
                  value={formKomponen.jenisBiaya}
                  onChange={(e) => setFormKomponen({ ...formKomponen, jenisBiaya: e.target.value })}
                  className="w-56 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                >
                  <option value="OPERASIONAL">OPERASIONAL</option>
                  <option value="NON OPERASIONAL">NON OPERASIONAL</option>
                </select>
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

              {/* Tombol Hitung Gaji (Persis Gambar 3) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => triggerAlert("Modul Hitung Gaji otomatis disesuaikan.")}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200 rounded font-semibold text-xs cursor-pointer transition-colors"
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

              {/* Opsi 2: Panduan */}
              <div
                onClick={() => {
                  setWizardStep(1);
                  setModalMode("panduan_wizard");
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
                      Langkah-demi-langkah terpandu untuk memilih kelompok akun BAS yang tepat, menentukan volume, dan tarif satuan biaya.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center text-[0.7rem] font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Buka Panduan</span>
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
    </div>
  );
}
