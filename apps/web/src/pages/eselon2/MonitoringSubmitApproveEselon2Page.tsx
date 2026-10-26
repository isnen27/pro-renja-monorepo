import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Printer,
  CheckSquare,
  Square,
  Trash2,
  Building,
  Calendar,
  History,
  Shield,
  UserCheck,
  FileText,
  CheckCircle2,
  X,
  AlertTriangle,
  Info,
  Filter,
  Search,
  Sparkles,
  Send,
  XCircle,
  Upload,
  FileCheck,
  FileUp,
  Download,
  Building2,
} from "lucide-react";
import { mockPejabat } from "../../data/ppatkData";
import rawRekapRenjaAll from "../../data/rekapSasaranRenjaAllData.json";
import unitKerjaData from "../../data/unitKerjaData.json";
import informasiKinerjaData from "../../data/informasiKinerjaData.json";
import {
  Bab3RekapRow,
  Bab3PnbpRow,
  generateDefaultBab3Rekap,
  generateDefaultBab3Pnbp,
} from "./IsianBab3Eselon2Page";
import {
  LampiranKamusRoRow,
  generateDefaultLampiranForUnit,
} from "./IsianLampiranEselon2Page";

const KEGIATAN_UNIT_MAP: Record<string, string[]> = {
  "3365": ["PATIH"],
  "3374": ["PEKA"],
  "3375": ["BINCANG"],
  "3376": ["BERMAKNA"],
  "3377": ["BIRU"],
  "3379": ["KREASI"],
  "3380": ["SALAM", "SERASI", "BERMAKNA"],
  "3381": ["LOGIS"],
  "3382": ["REKAN", "PENJAGA", "PATUH"],
  "3384": ["SIASAT", "SIDIK", "SIAGA", "SALAM"],
  "8003": ["KREASI", "BERMITRA"],
  "8004": ["BERMITRA", "BIRU"],
};

function getUnitSingkatan(unitKerja: string): string {
  const match = unitKerjaData.find(
    (u) =>
      u.nama.toLowerCase().includes(unitKerja.toLowerCase()) ||
      unitKerja.toLowerCase().includes(u.nama.toLowerCase()) ||
      u.singkatan.toLowerCase() === unitKerja.toLowerCase()
  );
  if (match) return match.singkatan;
  if (
    unitKerja.toLowerCase().includes("pendidikan") ||
    unitKerja.toLowerCase().includes("pelatihan") ||
    unitKerja.toLowerCase().includes("patih") ||
    unitKerja.toLowerCase().includes("pusdiklat")
  ) {
    return "PATIH";
  }
  return "PATIH";
}

function getJabatanDefault(unitKerja: string): string {
  const u = unitKerja.toUpperCase();
  if (u.includes("PUSAT PENDIDIKAN") || u.includes("PUSDIKLAT") || u.includes("PATIH")) {
    return "Kepala Pusat Pendidikan dan Pelatihan APU PPT";
  }
  if (u.includes("PUSAT PEMBERDAYAAN") || u.includes("BERMITRA")) {
    return "Kepala Pusat Pemberdayaan Kemitraan APU PPT";
  }
  if (u.includes("PUSAT TEKNOLOGI") || u.includes("LOGIS")) {
    return "Kepala Pusat Teknologi Informasi";
  }
  if (u.includes("INSPEKTORAT") || u.includes("PEKA")) {
    return "Inspektur";
  }
  if (u.includes("BIRO PERENCANAAN") || u.includes("BINCANG")) {
    return "Kepala Biro Perencanaan dan Keuangan";
  }
  if (u.includes("BIRO SUMBER DAYA") || u.includes("BERMAKNA")) {
    return "Kepala Biro Sumber Daya Manusia, Organisasi dan Tata Laksana";
  }
  if (u.includes("BIRO UMUM") || u.includes("BIRU")) {
    return "Kepala Biro Umum";
  }
  if (u.startsWith("DIREKTORAT")) {
    return `Direktur ${unitKerja.replace(/^Direktorat\s+/i, "")}`;
  }
  return `Kepala ${unitKerja}`;
}

function getPejabatPenandatangan(unitKerja: string): { nama: string; jabatan: string } {
  try {
    const saved = localStorage.getItem("renja_data_pejabat");
    const list = saved ? JSON.parse(saved) : mockPejabat;
    if (Array.isArray(list) && list.length > 0) {
      const uTarget = unitKerja.toLowerCase().trim();
      const match = list.find((p: any) => {
        const u = (p.unitKerja || "").toLowerCase();
        const j = (p.jabatan || "").toLowerCase();
        return u.includes(uTarget) || uTarget.includes(u) || j.includes(uTarget);
      });
      if (match && match.nama) {
        return {
          nama: match.nama,
          jabatan: match.jabatan || getJabatanDefault(unitKerja),
        };
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Fallback pejabat resmi
  if (
    unitKerja.toLowerCase().includes("pelatihan") ||
    unitKerja.toLowerCase().includes("patih") ||
    unitKerja.toLowerCase().includes("pusdiklat")
  ) {
    return {
      nama: "Akhyar Effendi, S.E., M.M.",
      jabatan: "Kepala Pusat Pendidikan dan Pelatihan APU PPT",
    };
  }

  return {
    nama: "Pejabat Penandatangan Satker Eselon II",
    jabatan: getJabatanDefault(unitKerja),
  };
}

interface PrintTargetRow {
  isDivider?: boolean;
  dividerLabel?: string;
  kode?: string;
  sasaran?: string;
  indikatorLabel?: string;
  indikatorText?: string;
  target?: string | number;
}

function getTargetKinerjaPrintRows(unitKerja: string): PrintTargetRow[] {
  const singkatan = getUnitSingkatan(unitKerja);

  // Jika unit adalah Pusdiklat APU PPT / PATIH (sesuai persis contoh acuan media gambar):
  if (singkatan === "PATIH") {
    return [
      {
        kode: "SS.1",
        sasaran: "Meningkatnya Efektivitas Kinerja PPATK dalam Pencegahan dan Pemberantasan TPPU, TPPT, dan PPSPM",
        indikatorLabel: "Indikator IKSS 1.2:",
        indikatorText: "Indeks Implementasi Program TPPU TPPT dan PPSPM PPATK. {Indeks}",
        target: "6,8",
      },
      {
        kode: "SP.1",
        sasaran: "Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pemberantasan TPPU, TPPT, dan PPSPM",
        indikatorLabel: "Indikator IKP 1.1:",
        indikatorText: "Indeks Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pemberantasan TPPU, TPPT, dan PPSPM. {Indeks}",
        target: "5",
      },
      {
        isDivider: true,
        dividerLabel: "Sasaran Kegiatan:",
      },
      {
        kode: "SK 1.7",
        sasaran: "Meningkatnya Kompetensi SDM APU PPT dan PPSPM",
        indikatorLabel: "Indikator IKK 1.4.1:",
        indikatorText: "Indeks Efektivitas Pengembangan Kompetensi SDM APU PPT dan PPSPM. {Indeks}",
        target: "4,52",
      },
      {
        kode: "SK 1.8",
        sasaran: "Meningkatnya Kompetensi Aparat Penegak Hukum APU PPT PPPSPM",
        indikatorLabel: "Indikator IKK 1.4.2:",
        indikatorText: "Indeks Efektivitas Pengembangan Kompetensi Aparat Penegak Hukum APU PPT PPSPM. {Indeks}",
        target: "4,48",
      },
    ];
  }

  // Cek apakah satker merupakan klaster Dukungan Manajemen (Biro / Inspektorat / Setia)
  const isDukman = ["BINCANG", "BERMAKNA", "BIRU", "PEKA"].includes(singkatan);

  const rows: PrintTargetRow[] = [];

  // 1. Sasaran Strategis
  if (isDukman) {
    rows.push({
      kode: "SS.2",
      sasaran: "Meningkatnya Kinerja Revitalisasi Birokrasi PPATK (Dukungan Manajemen)",
      indikatorLabel: "Indikator IKSS 2.1:",
      indikatorText: "Nilai Reformasi Birokrasi PPATK. {Nilai}",
      target: "85,5",
    });
  } else {
    rows.push({
      kode: "SS.1",
      sasaran: "Meningkatnya Efektivitas Kinerja PPATK dalam Pencegahan dan Pemberantasan TPPU, TPPT, dan PPSPM",
      indikatorLabel: "Indikator IKSS 1.2:",
      indikatorText: "Indeks Implementasi Program TPPU TPPT dan PPSPM PPATK. {Indeks}",
      target: "6,8",
    });
  }

  // 2. Sasaran Program
  if (isDukman) {
    rows.push({
      kode: "SP.2",
      sasaran: "Meningkatnya Tata Kelola Internal dan Kinerja Birokrasi PPATK",
      indikatorLabel: "Indikator IKP 2.1:",
      indikatorText: "Indeks Pelayanan Internal PPATK. {Indeks}",
      target: "4,2",
    });
  } else {
    rows.push({
      kode: "SP.1",
      sasaran: "Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pemberantasan TPPU, TPPT, dan PPSPM",
      indikatorLabel: "Indikator IKP 1.1:",
      indikatorText: "Indeks Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pemberantasan TPPU, TPPT, dan PPSPM. {Indeks}",
      target: "5",
    });
  }

  // 3. Divider Sasaran Kegiatan
  rows.push({
    isDivider: true,
    dividerLabel: "Sasaran Kegiatan:",
  });

  // 4. SK dan IKK dari referensi rekap sasaran renja
  const kegCodes = Object.keys(KEGIATAN_UNIT_MAP).filter((code) =>
    KEGIATAN_UNIT_MAP[code]?.includes(singkatan)
  );

  const skMap = new Map<string, { kode: string; sasaran: string; ikkLabel: string; ikkText: string; target: string }>();

  rawRekapRenjaAll.forEach((r: any) => {
    if (r.type === "SASARAN_KEGIATAN") {
      const kc = r.kegiatan?.split(" ")[0];
      if (kegCodes.includes(kc)) {
        const sasaran = r.sasaran_kro || "";
        const ikk = r.indikator || "";
        if (sasaran && !skMap.has(sasaran)) {
          const skNum = skMap.size + 1;
          skMap.set(sasaran, {
            kode: `SK 1.${skNum}`,
            sasaran: sasaran.replace(/^\d+\s*-\s*/, ""),
            ikkLabel: `Indikator IKK 1.${skNum}.1:`,
            ikkText: `${ikk.replace(/^\d+\s*-\s*/, "")}. {${r.satuan || "Indeks"}}`,
            target: r.target?.["2027"] || r.target?.["2026"] || "100",
          });
        }
      }
    }
  });

  if (skMap.size > 0) {
    skMap.forEach((v) => {
      rows.push({
        kode: v.kode,
        sasaran: v.sasaran,
        indikatorLabel: v.ikkLabel,
        indikatorText: v.ikkText,
        target: v.target,
      });
    });
  } else {
    rows.push({
      kode: "SK 1.1",
      sasaran: `Pelaksanaan Tugas dan Fungsi Teknis Satker ${unitKerja}`,
      indikatorLabel: "Indikator IKK 1.1.1:",
      indikatorText: `Tingkat Kepatuhan dan Keberhasilan Program Kerja ${unitKerja}. {Indeks}`,
      target: "100",
    });
  }

  return rows;
}

function getCapaianPrintRows(unitKerja: string) {
  try {
    const saved = localStorage.getItem("renja_e2_bab1_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.capaianRows) && parsed.capaianRows.length > 0) {
        return parsed.capaianRows;
      }
    }
  } catch (e) {}

  const singkatan = getUnitSingkatan(unitKerja);
  const kegCodes = Object.keys(KEGIATAN_UNIT_MAP).filter((code) =>
    KEGIATAN_UNIT_MAP[code]?.includes(singkatan)
  );

  const matched = rawRekapRenjaAll.filter((row: any) => {
    if (row.type !== "SASARAN_KEGIATAN") return false;
    const kc = row.kegiatan?.split(" ")[0];
    return kegCodes.includes(kc);
  });

  if (matched.length > 0) {
    return matched.map((r: any) => ({
      sasaranKegiatan: r.sasaran_kro || "",
      ikk: r.indikator || "",
      tahun: 2025,
      target: r.target?.["2025"] || r.target?.["2026"] || "100",
      capaianOutputPct: 101.5,
      capaianAnggaranPct: 99.2,
    }));
  }

  return [
    {
      sasaranKegiatan: "01 - Meningkatnya Kompetensi SDM APU PPT dan PPSPM",
      ikk: "01 - Indeks Efektivitas Pengembangan Kompetensi SDM APU PPT dan PPSPM",
      tahun: 2025,
      target: "4,43",
      capaianOutputPct: 101.5,
      capaianAnggaranPct: 99.2,
    },
    {
      sasaranKegiatan: "02 - Meningkatnya Kompetensi Aparat Penegak Hukum APU PPT PPPSPM",
      ikk: "01 - Indeks Efektivitas Pengembangan Kompetensi Aparat Penegak Hukum APU PPT PPSPM",
      tahun: 2025,
      target: "4,48",
      capaianOutputPct: 100.0,
      capaianAnggaranPct: 98.7,
    },
  ];
}

function getRoListForUnit(unitSingkatan: string) {
  const filtered = informasiKinerjaData.filter((d: any) => d.unitKerja === unitSingkatan);
  const roMap = new Map<string, { ro_kode: string; ro_nama: string; komponenList: string[] }>();

  filtered.forEach((row: any) => {
    const roFullName = row.ro;
    if (!roFullName) return;

    if (!roMap.has(roFullName)) {
      const parts = roFullName.split(" ");
      const roKode = parts.slice(0, 3).join(" ");
      const roNama = parts.slice(3).join(" ") || roFullName;

      roMap.set(roFullName, {
        ro_kode: roKode,
        ro_nama: roNama,
        komponenList: [],
      });
    }

    if (row.komponen) {
      const info = roMap.get(roFullName)!;
      if (!info.komponenList.includes(row.komponen)) {
        info.komponenList.push(row.komponen);
      }
    }
  });

  return Array.from(roMap.values());
}

function getBab2PaketPrintList(unitKerja: string) {
  const singkatan = getUnitSingkatan(unitKerja);
  try {
    const saved = localStorage.getItem("renja_e2_bab2_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        Array.isArray(parsed.paketList) &&
        parsed.paketList.length > 0 &&
        parsed.unitSingkatan === singkatan
      ) {
        return parsed.paketList;
      }
    }
  } catch (e) {}

  const ros = getRoListForUnit(singkatan);
  if (ros.length === 0) {
    return [
      {
        id: "pkt_1",
        nomenklatur: `Paket Rencana Kerja Layanan Operasional & Kinerja Satker`,
        uraian: `<p>Pelaksanaan paket rencana kerja untuk mendukung pencapaian target kinerja Satker ${unitKerja}.</p>`,
        tujuan: `<p>Mencapai target kinerja dan akuntabilitas output secara tepat waktu, efektif, dan efisien.</p>`,
        tahapan: `<p>1. Tahap Perencanaan & Persiapan<br/>2. Tahap Pelaksanaan Teknis<br/>3. Tahap Monitoring & Evaluasi</p>`,
        output: `<p>Terlaksananya seluruh output kinerja dengan capaian 100% serta dokumen laporan pertanggungjawaban lengkap.</p>`,
      },
    ];
  }

  return ros.map((roItem, idx) => ({
    id: `pkt_ro_${idx + 1}`,
    nomenklatur: `Paket Rencana Kerja: ${roItem.ro_nama}`,
    uraian: `<p>Pelaksanaan paket rencana kerja untuk mendukung pencapaian Rincian Output (RO) <strong>${roItem.ro_nama}</strong> pada Satker ${unitKerja}. Paket ini mencakup koordinasi intensif, operasional teknis, serta pengelolaan ${roItem.komponenList.length} komponen penunjang.</p>`,
    tujuan: `<p>Mencapai target kinerja dan akuntabilitas output secara tepat waktu, efektif, dan efisien sesuai standar mutu PPATK.</p>`,
    tahapan: `<p>1. Persiapan dan penataan instrumen pelaksanaan kerja<br/>2. Penyelenggaraan kegiatan teknis dan pembinaan<br/>3. Evaluasi mutu layanan dan pelaporan akuntabilitas kinerja</p>`,
    output: `<p>Terlaksananya output ${roItem.ro_nama} dengan capaian 100% serta dokumen pertanggungjawaban lengkap.</p>`,
  }));
}

function getBab3PrintData(unitKerja: string) {
  const singkatan = getUnitSingkatan(unitKerja);
  let openingSentence =
    "Berdasarkan Uraian Rencana Kerja pada BAB II dapat disampaikan Rekapitulasi Target Output dan Pendanaan sebagai berikut:";
  let rekapRows: Bab3RekapRow[] = [];
  let pnbpRows: Bab3PnbpRow[] = [];

  try {
    const saved = localStorage.getItem("renja_e2_bab3_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.unitSingkatan === singkatan || !parsed.unitSingkatan) {
        if (parsed.openingSentence) openingSentence = parsed.openingSentence;
        if (Array.isArray(parsed.rekapRows) && parsed.rekapRows.length > 0) {
          rekapRows = parsed.rekapRows;
        }
        if (Array.isArray(parsed.pnbpRows) && parsed.pnbpRows.length > 0) {
          pnbpRows = parsed.pnbpRows;
        }
      }
    }
  } catch (e) {}

  if (rekapRows.length === 0) {
    rekapRows = generateDefaultBab3Rekap(singkatan, unitKerja);
  }

  const isPnbp =
    ["PATIH", "BIRU"].includes(singkatan) ||
    unitKerja.toLowerCase().includes("pusdiklat") ||
    unitKerja.toLowerCase().includes("biro umum");
  if (isPnbp && pnbpRows.length === 0) {
    pnbpRows = generateDefaultBab3Pnbp(singkatan);
  }

  return { openingSentence, rekapRows, pnbpRows, isPnbp };
}

function getLampiranPrintData(unitKerja: string) {
  const singkatan = getUnitSingkatan(unitKerja);
  let kamusRows: LampiranKamusRoRow[] = [];

  try {
    const saved = localStorage.getItem("renja_e2_lampiran_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.unitSingkatan === singkatan || !parsed.unitSingkatan) {
        if (Array.isArray(parsed.kamusRows) && parsed.kamusRows.length > 0) {
          kamusRows = parsed.kamusRows;
        }
      }
    }
  } catch (e) {}

  if (kamusRows.length === 0) {
    kamusRows = generateDefaultLampiranForUnit(singkatan, unitKerja);
  }

  return kamusRows;
}

type UserRole = "Operator" | "Approver" | "BINCANG" | "Super Admin";
type FilterMode = "all" | "latest" | "pending" | "approved";
type StatusHistoriType = "Pagu Indikatif" | "Pagu Anggaran" | "Alokasi Anggaran";

export interface MonitoringItemE2 {
  id: string;
  unit_kerja: string;
  owner: "Operator" | "Approver" | "BINCANG";
  kodifikasi: string;
  tahap_status: StatusHistoriType;
  rev_ke: number;
  status_histori_full: string;
  sumber: string;
  tgl_revisi: string;
  is_approved: boolean;
  tgl_approved?: string;
  approved_by?: string;
  is_doc_uploaded?: boolean;
  signed_doc_name?: string;
}

const INITIAL_MONITORING_DATA_E2: MonitoringItemE2[] = [
  {
    id: "hist_e2_1",
    unit_kerja: "Pusat Pendidikan dan Pelatihan APU PPT",
    owner: "Operator",
    kodifikasi: "D00",
    tahap_status: "Pagu Indikatif",
    rev_ke: 0,
    status_histori_full: "D00 - Pagu Indikatif - Rev ke-0",
    sumber: "D00",
    tgl_revisi: "05-10-2026 08:30 WIB",
    is_approved: false,
    is_doc_uploaded: false,
  },
  {
    id: "hist_e2_2",
    unit_kerja: "Direktorat Pelaporan dan Pengawasan Kepatuhan",
    owner: "Approver",
    kodifikasi: "D01",
    tahap_status: "Pagu Anggaran",
    rev_ke: 1,
    status_histori_full: "D01 - Pagu Anggaran - Rev ke-1",
    sumber: "D00",
    tgl_revisi: "05-10-2026 09:45 WIB",
    is_approved: false,
    is_doc_uploaded: true,
    signed_doc_name: "Draft_Renja_Direktorat_Pelaporan_Signed.pdf",
  },
  {
    id: "hist_e2_3",
    unit_kerja: "Direktorat Analisis dan Pemeriksaan",
    owner: "BINCANG",
    kodifikasi: "E00",
    tahap_status: "Alokasi Anggaran",
    rev_ke: 0,
    status_histori_full: "E00 - Alokasi Anggaran - Rev ke-0",
    sumber: "D01",
    tgl_revisi: "05-10-2026 10:15 WIB",
    is_approved: true,
    tgl_approved: "05-10-2026 10:30 WIB",
    approved_by: "Super Admin",
    is_doc_uploaded: true,
    signed_doc_name: "Renja_Eselon2_Analisis_TTD_Digital.pdf",
  },
];

const STORAGE_KEY_MONITORING_E2 = "renja_e2_monitoring_list";

export default function MonitoringSubmitApproveEselon2Page() {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("renja_e2_user_role");
      if (saved && ["Operator", "Approver", "BINCANG", "Super Admin"].includes(saved)) {
        return saved as UserRole;
      }
    } catch (e) {}
    return "Approver";
  });

  useEffect(() => {
    try {
      localStorage.setItem("renja_e2_user_role", currentUserRole);
    } catch (e) {}
  }, [currentUserRole]);

  const [dataList, setDataList] = useState<MonitoringItemE2[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MONITORING_E2);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MONITORING_DATA_E2;
  });

  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>("Semua");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [selectedPrintItem, setSelectedPrintItem] = useState<MonitoringItemE2 | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MonitoringItemE2 | null>(null);
  const [uploadingDocItem, setUploadingDocItem] = useState<MonitoringItemE2 | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>("");
  const [showRoleNotice, setShowRoleNotice] = useState<string | null>(null);
  const [noticeModalMessage, setNoticeModalMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MONITORING_E2, JSON.stringify(dataList));
  }, [dataList]);

  // Cek histori aktif Eselon II
  useEffect(() => {
    try {
      const activeRaw = localStorage.getItem("renja_e2_active_histori");
      if (activeRaw) {
        const activeItem = JSON.parse(activeRaw);
        setDataList((prev) => {
          const exists = prev.some((d) => d.id === activeItem.id || d.kodifikasi === activeItem.kode_sts_history);
          if (!exists) {
            const newItem: MonitoringItemE2 = {
              id: activeItem.id || `hist_e2_${Date.now()}`,
              unit_kerja: activeItem.kdsatker || "Pusat Pendidikan dan Pelatihan APU PPT",
              owner: activeItem.owner || "Operator",
              kodifikasi: activeItem.kode_sts_history || "D00",
              tahap_status: (activeItem.status_histori as StatusHistoriType) || "Pagu Indikatif",
              rev_ke: 0,
              status_histori_full: `${activeItem.kode_sts_history || "D00"} - ${activeItem.status_histori || "Pagu Indikatif"} - Rev ke-0`,
              sumber: "D00",
              tgl_revisi: new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }) + " WIB",
              is_approved: false,
            };
            return [newItem, ...prev];
          }
          return prev;
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const tahunAnggaran = "2027";
  const latestRevisionItem = dataList[0] || INITIAL_MONITORING_DATA_E2[0];
  const lastRevDate = latestRevisionItem?.tgl_revisi || "05 Oktober 2026";
  const activeTahapan = latestRevisionItem?.tahap_status || "Pagu Anggaran";

  // Unduh Dokumen TTE oleh Role Lain (Operator, BINCANG)
  function handleDownloadSignedDoc(item: MonitoringItemE2) {
    if (!item.is_doc_uploaded) return;

    const fileName =
      item.signed_doc_name ||
      `Draft_Renja_Eselon2_${item.unit_kerja.replace(/\s+/g, "_")}_${item.kodifikasi}_Signed.pdf`;

    const content = `[DOKUMEN DRAFT RENJA ESELON II TTD DIGITAL]\nSatker: ${item.unit_kerja}\nStatus Histori: ${item.status_histori_full}\nTanggal Revisi: ${item.tgl_revisi}\nNama File: ${fileName}\n\nDokumen ini telah resmi ditandatangani secara elektronik (TTE) oleh Pejabat Penandatangan Satker Eselon II PPATK.`;
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNoticeModalMessage(`Dokumen TTE "${fileName}" berhasil diunduh.`);
  }

  function handleSendByOperator(id: string) {
    setDataList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            owner: "Approver",
            is_approved: false,
            tgl_revisi:
              new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }) + " WIB",
          };
        }
        return item;
      })
    );
    setNoticeModalMessage("Data usulan Renja Eselon II berhasil dikirim ke Approver.");
  }

  function handleApproveByApprover(id: string) {
    if (currentUserRole === "Operator") {
      setShowRoleNotice("Aksi Persetujuan hanya dapat dilakukan oleh User Approval, BINCANG, & Super Admin.");
      setTimeout(() => setShowRoleNotice(null), 4000);
      return;
    }

    const targetItem = dataList.find((d) => d.id === id);
    if (targetItem && !targetItem.is_doc_uploaded) {
      setNoticeModalMessage(
        "Persetujuan Gagal! Dokumen draft Renja Eselon II TTD Digital WAJIB diunggah oleh Approver pada kolom Aksi sebelum data dikirim ke BINCANG."
      );
      return;
    }

    setDataList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, owner: "BINCANG", is_approved: false } : item))
    );
    setNoticeModalMessage("Data telah disetujui Approver Satker dan dikirim ke BINCANG.");
  }

  function handleRejectByApprover(id: string) {
    if (currentUserRole === "Operator") return;
    setDataList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, owner: "Operator", is_approved: false } : item))
    );
    setNoticeModalMessage("Data ditolak oleh Approver dan dikembalikan ke Operator.");
  }

  function handleApproveByBincang(id: string) {
    if (currentUserRole === "Operator" || currentUserRole === "Approver") return;

    const targetItem = dataList.find((d) => d.id === id);
    if (targetItem && !targetItem.is_doc_uploaded) {
      setNoticeModalMessage("Persetujuan Akhir Gagal! Dokumen TTE belum diunggah oleh Approver.");
      return;
    }

    setDataList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              owner: "BINCANG",
              is_approved: true,
              tgl_approved: new Date().toLocaleDateString("id-ID") + " WIB",
              approved_by: currentUserRole,
            }
          : item
      )
    );
    setNoticeModalMessage("Data Renja Eselon II telah disetujui BINCANG & diproses ke Kemenkeu.");
  }

  function handleRejectByBincang(id: string) {
    if (currentUserRole === "Operator" || currentUserRole === "Approver") return;
    setDataList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, owner: "Approver", is_approved: false } : item))
    );
    setNoticeModalMessage("Data ditolak oleh BINCANG dan dikembalikan ke Approver.");
  }

  function handleRequestDelete(item: MonitoringItemE2) {
    if (item.is_approved && ["Operator", "Approver", "BINCANG"].includes(currentUserRole)) {
      setShowRoleNotice(
        "Penghapusan Ditolak! Data dengan status 'Disetujui & Proses Kemenkeu' tidak dapat dihapus."
      );
      setTimeout(() => setShowRoleNotice(null), 4000);
      return;
    }
    if (currentUserRole === "Operator") {
      setShowRoleNotice("Tombol Hapus hanya aktif untuk User Approval, BINCANG, & Super Admin.");
      setTimeout(() => setShowRoleNotice(null), 4000);
      return;
    }
    setItemToDelete(item);
  }

  function confirmDelete() {
    if (itemToDelete) {
      setDataList((prev) => prev.filter((d) => d.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  }

  const filteredData = dataList.filter((item) => {
    if (selectedUnitFilter !== "Semua" && item.unit_kerja !== selectedUnitFilter) return false;
    if (
      searchTerm &&
      !item.unit_kerja.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.status_histori_full.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    if (filterMode === "approved") return item.is_approved;
    if (filterMode === "pending") return !item.is_approved;
    return true;
  });

  return (
    <div className="min-h-full p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Role Restriction Alert ── */}
      {showRoleNotice && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-sm font-semibold flex items-center justify-between shadow-md animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>{showRoleNotice}</span>
          </div>
          <button onClick={() => setShowRoleNotice(null)} className="p-1 hover:bg-amber-200/50 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 shadow-sm font-bold">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary text-[0.65rem] font-bold">RENJA ESELON II</span>
              <span className="text-xs text-[var(--text-muted)] font-mono">/eselon2/monitoring</span>
            </div>
            <h1 className="text-lg font-bold text-[var(--text)]">Monitoring Submit & Approve Data Eselon II</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Pemantauan status histori, persetujuan checklist, dan pencetakan hasil Renja Satker Eselon II.
            </p>
          </div>
        </div>

        {/* Role Switcher Sandbox */}
        <div className="flex items-center gap-2 bg-[var(--accent)] p-1.5 rounded-xl border border-[var(--border)]">
          <span className="text-[0.68rem] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 flex items-center gap-1">
            <UserCheck className="h-3.5 w-3.5" />
            Simulasi Role:
          </span>
          {(["Operator", "Approver", "BINCANG", "Super Admin"] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setCurrentUserRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentUserRole === r
                  ? r === "Operator"
                    ? "bg-blue-600 text-white shadow"
                    : r === "Approver"
                    ? "bg-emerald-600 text-white shadow"
                    : r === "BINCANG"
                    ? "bg-amber-600 text-white shadow"
                    : "bg-purple-600 text-white shadow"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter Tampilan (Single Line) ── */}
      <div className="aksi-card p-5 bg-[var(--card)] border border-[var(--border)] space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full whitespace-nowrap shrink-0">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0 whitespace-nowrap">
              <Filter className="h-3.5 w-3.5" />
              Filter Tampilan:
            </span>
            {[
              { id: "all", label: "Seluruh Data", count: dataList.length },
              {
                id: "pending",
                label: "Data Belum Disetujui",
                count: dataList.filter((d) => !d.is_approved).length,
              },
              {
                id: "approved",
                label: "Data Sudah Disetujui",
                count: dataList.filter((d) => d.is_approved).length,
              },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id as FilterMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  filterMode === f.id
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "bg-[var(--accent)] text-[var(--text-muted)] border border-[var(--border)]"
                }`}
              >
                <span>{f.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[0.65rem] font-mono bg-white/20">
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Satker Eselon II..."
              className="text-xs bg-[var(--accent)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text)]"
            />
          </div>
        </div>
      </div>

      {/* ── Tabel Monitoring ── */}
      <div className="aksi-card overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--accent)] border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-[0.65rem]">
                <th className="p-3 font-bold">Satker Eselon II</th>
                <th className="p-3 font-bold">Owner</th>
                <th className="p-3 font-bold">Status Histori</th>
                <th className="p-3 font-bold text-center">Sumber</th>
                <th className="p-3 font-bold">Tanggal Revisi</th>
                <th className="p-3 font-bold text-center whitespace-nowrap">AKSI</th>
                <th className="p-3 font-bold text-center whitespace-nowrap">Persetujuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--accent)]/30">
                  <td className="p-3 font-bold text-[var(--text)] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
                      <span>{item.unit_kerja}</span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold font-mono inline-flex items-center gap-1 ${
                        item.owner === "Operator"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          : item.owner === "Approver"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                      }`}
                    >
                      <UserCheck className="h-3 w-3" />
                      {item.owner}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap font-semibold">{item.status_histori_full}</td>
                  <td className="p-3 text-center font-mono font-bold text-indigo-700">{item.sumber}</td>
                  <td className="p-3 text-slate-500 whitespace-nowrap">{item.tgl_revisi}</td>

                  {/* Kolom AKSI (Cetak, Upload Dokumen TTD, Hapus) */}
                  <td className="p-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      {/* Tombol Cetak - Indigo/Blue rounded pill */}
                      <button
                        onClick={() => setSelectedPrintItem(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2e1065] hover:bg-[#3b0764] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="Cetak Dokumen Hasil Input Bab I & Bab II"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Cetak</span>
                      </button>

                      {/* Tombol Upload TTD / TTD Uploaded */}
                      {currentUserRole === "Approver" || currentUserRole === "Super Admin" ? (
                        item.is_doc_uploaded ? (
                          <button
                            onClick={() => {
                              setUploadingDocItem(item);
                              setUploadFileName(
                                item.signed_doc_name ||
                                  `Draft_Renja_Eselon2_${item.unit_kerja.replace(/\s+/g, "_")}_${item.kodifikasi}_Signed.pdf`
                              );
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#dcfce7] text-[#059669] border border-[#34d399] text-xs font-bold flex items-center gap-1.5 hover:bg-[#bbf7d0] transition-colors shadow-sm cursor-pointer"
                            title={`Dokumen TTD Terunggah: ${item.signed_doc_name}. Klik untuk mengganti.`}
                          >
                            <FileCheck className="h-3.5 w-3.5 text-[#059669]" />
                            <span>✓ TTD Uploaded</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setUploadingDocItem(item);
                              setUploadFileName(
                                `Draft_Renja_Eselon2_${item.unit_kerja.replace(/\s+/g, "_")}_${item.kodifikasi}_Signed.pdf`
                              );
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            title="Upload Draft Renja Eselon II TTD Elektronik (Wajib untuk Approve/Kirim ke BINCANG)"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload TTD *</span>
                          </button>
                        )
                      ) : item.is_doc_uploaded ? (
                        <button
                          onClick={() => handleDownloadSignedDoc(item)}
                          className="px-3 py-1.5 rounded-xl bg-[#dcfce7] text-[#059669] border border-[#34d399] text-xs font-bold flex items-center gap-1.5 hover:bg-[#bbf7d0] transition-colors shadow-sm cursor-pointer"
                          title={`Unduh Dokumen TTE: ${item.signed_doc_name || "Draft_Renja_Signed.pdf"}`}
                        >
                          <FileCheck className="h-3.5 w-3.5 text-[#059669]" />
                          <span>✓ TTD Uploaded</span>
                        </button>
                      ) : null}

                      {/* Tombol Hapus - soft red square with red trash icon */}
                      {(() => {
                        const isApprovedKemenkeu = item.is_approved;
                        const isRestrictedRole = ["Operator", "Approver", "BINCANG"].includes(currentUserRole);
                        const isDeleteDisabled =
                          (isApprovedKemenkeu && isRestrictedRole) || currentUserRole === "Operator";

                        let deleteTitle = "Hapus data histori pengajuan";
                        if (isApprovedKemenkeu && isRestrictedRole) {
                          deleteTitle = "Data dengan status Disetujui & Proses Kemenkeu tidak dapat dihapus";
                        } else if (currentUserRole === "Operator") {
                          deleteTitle = "Tombol Hapus hanya aktif untuk User Approval, BINCANG, & Super Admin";
                        }

                        return (
                          <button
                            onClick={() => handleRequestDelete(item)}
                            disabled={isDeleteDisabled}
                            title={deleteTitle}
                            className={`p-2 rounded-xl transition-colors shrink-0 ${
                              isDeleteDisabled
                                ? "opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200"
                                : "bg-[#fee2e2] text-[#ef4444] hover:bg-[#fecaca] cursor-pointer"
                            }`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        );
                      })()}
                    </div>
                  </td>

                  {/* Persetujuan */}
                  <td className="p-3 text-center whitespace-nowrap">
                    {item.is_approved ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#e6fffa] text-[#047857] border border-[#6ee7b7] shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-[#059669]" />
                        <span>Disetujui &amp; Proses Kemenkeu</span>
                      </span>
                    ) : currentUserRole === "Operator" ? (
                      item.owner === "Operator" ? (
                        <div className="inline-flex flex-col items-center">
                          <button
                            onClick={() => handleSendByOperator(item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                            title="Kirim data histori ke Approver"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Kirim ke Approver</span>
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd]">
                          <span>Menunggu Operator</span>
                        </span>
                      )
                    ) : currentUserRole === "Approver" ? (
                      item.owner === "Approver" ? (
                        <div className="inline-flex items-center gap-2 justify-center">
                          <button
                            onClick={() => handleRejectByApprover(item.id)}
                            className="px-3 py-1 rounded-full bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5] hover:bg-[#fecaca] text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Tolak &amp; kembalikan ke Operator"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>TOLAK</span>
                          </button>
                          <button
                            onClick={() => handleApproveByApprover(item.id)}
                            className={`px-3 py-1 rounded-full text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              !item.is_doc_uploaded ? "bg-[#059669]/60 cursor-not-allowed" : "bg-[#059669] hover:bg-[#047857]"
                            }`}
                            title={!item.is_doc_uploaded ? "Wajib Upload Dokumen TTD Elektronik dulu pada kolom Aksi" : "Setuju &amp; kirim data ke BINCANG"}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>SETUJU</span>
                          </button>
                        </div>
                      ) : item.owner === "BINCANG" ? (
                        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd]">
                          <span>Proses Approval BINCANG</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd]">
                          <span>Menunggu Operator</span>
                        </span>
                      )
                    ) : currentUserRole === "BINCANG" || currentUserRole === "Super Admin" ? (
                      item.owner === "BINCANG" ? (
                        <div className="inline-flex items-center gap-2 justify-center">
                          <button
                            onClick={() => handleRejectByBincang(item.id)}
                            className="px-3 py-1 rounded-full bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5] hover:bg-[#fecaca] text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Tolak &amp; kembalikan histori ke Approver"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>TOLAK</span>
                          </button>
                          <button
                            onClick={() => handleApproveByBincang(item.id)}
                            className={`px-3 py-1 rounded-full text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              !item.is_doc_uploaded ? "bg-[#059669]/60 cursor-not-allowed" : "bg-[#059669] hover:bg-[#047857]"
                            }`}
                            title={!item.is_doc_uploaded ? "Wajib Upload Dokumen TTD Elektronik dulu pada kolom Aksi" : "Setuju &amp; proses data ke Kemenkeu"}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>SETUJU</span>
                          </button>
                        </div>
                      ) : item.owner === "Approver" ? (
                        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd]">
                          <span>Proses Approval Satker</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd]">
                          <span>Menunggu Operator</span>
                        </span>
                      )
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Upload TTE */}
      {uploadingDocItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="font-bold text-sm text-[var(--text)]">Upload Draft Renja Eselon II TTD Digital</h3>
            <input
              type="text"
              value={uploadFileName}
              onChange={(e) => setUploadFileName(e.target.value)}
              className="w-full text-xs bg-[var(--accent)] border rounded-xl p-2.5"
            />
            <div className="flex gap-2">
              <button onClick={() => setUploadingDocItem(null)} className="flex-1 py-2 text-xs border rounded-xl">
                Batal
              </button>
              <button
                onClick={() => {
                  setDataList((prev) =>
                    prev.map((d) =>
                      d.id === uploadingDocItem.id
                        ? { ...d, is_doc_uploaded: true, signed_doc_name: uploadFileName }
                        : d
                    )
                  );
                  setUploadingDocItem(null);
                  setNoticeModalMessage("Dokumen TTE Renja Eselon II berhasil diunggah.");
                }}
                className="flex-1 py-2 text-xs bg-[var(--primary)] text-white font-bold rounded-xl"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setItemToDelete(null)}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400">
                <AlertTriangle className="h-7 w-7" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-[var(--text)]">Konfirmasi Hapus Data</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Apakah Anda yakin ingin menghapus data histori pengajuan{" "}
                <strong className="text-[var(--text)]">{itemToDelete.status_histori_full}</strong> ({itemToDelete.unit_kerja})?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--accent)]"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 shadow-md cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cetak Dokumen Renja Eselon II */}
      {selectedPrintItem && (() => {
        const targetKinerjaRows = getTargetKinerjaPrintRows(selectedPrintItem.unit_kerja);
        const capaianRows = getCapaianPrintRows(selectedPrintItem.unit_kerja);
        const paketBab2List = getBab2PaketPrintList(selectedPrintItem.unit_kerja);
        const bab3Data = getBab3PrintData(selectedPrintItem.unit_kerja);
        const lampiranData = getLampiranPrintData(selectedPrintItem.unit_kerja);
        const pejabat = getPejabatPenandatangan(selectedPrintItem.unit_kerja);

        let savedBab1: any = null;
        try {
          const rawB1 = localStorage.getItem("renja_e2_bab1_data");
          if (rawB1) savedBab1 = JSON.parse(rawB1);
        } catch (e) {}

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col my-auto overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 border-b border-[var(--border)] bg-[var(--accent)] flex justify-between items-center no-print">
                <div className="flex items-center gap-2">
                  <Printer className="h-5 w-5 text-[var(--primary)]" />
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text)]">
                      Cetak Dokumen Renja Eselon II ({selectedPrintItem.status_histori_full})
                    </h3>
                    <p className="text-[0.7rem] text-[var(--text-muted)]">
                      Format Dokumen Resmi Standar PPATK (Tanpa Footer) — {selectedPrintItem.unit_kerja}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-[var(--primary)] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Cetak / Print PDF</span>
                  </button>
                  <button
                    onClick={() => setSelectedPrintItem(null)}
                    className="p-1.5 rounded-xl hover:bg-[var(--card)] text-[var(--text-muted)]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Scrollable Document Content */}
              <div className="p-8 md:p-12 space-y-12 overflow-y-auto flex-1 font-serif text-slate-900 leading-relaxed text-sm bg-white print:p-0 print:space-y-8">
                <style>{`
                  @media print {
                    @page {
                      size: A4 portrait;
                      margin: 1in;
                    }
                    * {
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                    }
                    html, body, #root, #root > *, main {
                      overflow: visible !important;
                      height: auto !important;
                      max-height: none !important;
                      position: static !important;
                    }
                    .fixed, .overflow-y-auto, .overflow-hidden, [class*="max-h-"] {
                      position: static !important;
                      overflow: visible !important;
                      max-height: none !important;
                      height: auto !important;
                      display: block !important;
                      background: transparent !important;
                      box-shadow: none !important;
                      border: none !important;
                      padding: 0 !important;
                      margin: 0 !important;
                    }
                    body * {
                      visibility: hidden !important;
                    }
                    #print-renja-doc-e2, #print-renja-doc-e2 * {
                      visibility: visible !important;
                    }
                    #print-renja-doc-e2 {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      display: block !important;
                      background: white !important;
                      color: black !important;
                    }
                    table {
                      border-collapse: collapse !important;
                      width: 100% !important;
                    }
                    th, td {
                      border: 1px solid #0f172a !important;
                    }
                    thead th {
                      background-color: #e2e8f0 !important;
                    }
                    tr {
                      page-break-inside: avoid !important;
                      break-inside: avoid !important;
                    }
                    .print-break {
                      page-break-after: always !important;
                      break-after: page !important;
                      display: block !important;
                      clear: both !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }
                `}</style>

                <div id="print-renja-doc-e2" className="space-y-10">
                  {/* ──────────────── 1. HALAMAN JUDUL (COVER PAGE) ──────────────── */}
                  <div className="min-h-[720px] flex flex-col justify-between items-center text-center py-12 print-break border-b-2 border-slate-200 print:border-none">
                    <div className="space-y-4 pt-6">
                      <img
                        src="/logo-ppatk.png"
                        alt="Logo PPATK"
                        className="w-32 h-auto mx-auto object-contain drop-shadow-sm"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 font-sans pt-1">
                        PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN
                      </p>
                    </div>

                    <div className="space-y-4 py-8">
                      <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900 font-sans">
                        DOKUMEN RENCANA KERJA
                      </h1>
                      <h2 className="text-xl font-bold uppercase tracking-wide text-slate-800 font-sans max-w-xl mx-auto leading-normal">
                        {selectedPrintItem.unit_kerja.toUpperCase()}
                      </h2>
                    </div>

                    <div className="space-y-2 pb-8">
                      <h3 className="text-lg font-bold uppercase tracking-widest text-slate-900 font-sans">
                        TAHUN ANGGARAN 2027
                      </h3>
                      <p className="text-xs text-slate-500 font-sans tracking-wide">
                        STATUS HISTORI: {selectedPrintItem.status_histori_full}
                      </p>
                    </div>
                  </div>

                  {/* ──────────────── 2. BAB I KONDISI UMUM ──────────────── */}
                  <div className="space-y-6 pt-6 print-break">
                    <div className="text-center space-y-1 pb-4">
                      <h2 className="text-base font-bold uppercase tracking-wider font-sans">
                        BAB I
                      </h2>
                      <h2 className="text-base font-bold uppercase tracking-wider font-sans">
                        KONDISI UMUM
                      </h2>
                    </div>

                    {/* Section A: Gambaran Umum */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-sm tracking-wide text-slate-900 font-sans">
                        A. GAMBARAN UMUM
                      </h3>
                      {savedBab1?.gambaranUmumText ? (
                        <div
                          className="text-justify text-xs leading-relaxed text-slate-800 space-y-2"
                          dangerouslySetInnerHTML={{ __html: savedBab1.gambaranUmumText }}
                        />
                      ) : (
                        <>
                          <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
                            Rencana Kerja Tahun 2027 pada Satker {selectedPrintItem.unit_kerja} merupakan pedoman pelaksanaan operasional program dalam mendukung pencapaian Sasaran Strategis Renstra PPATK 2025–2029. Pelaksanaan tugas pokok dan fungsi satker diarahkan pada penguatan efektivitas pencegahan dan pemberantasan tindak pidana pencucian uang (TPPU), pendanaan terorisme (TPPT), serta pendanaan proliferasi senjata pemusnah massal (PPSPM).
                          </p>
                          <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
                            Dalam rangka mewujudkan akuntabilitas kinerja yang optimal, seluruh aktivitas kerja dirancang secara sistematis, terukur, dan selaras dengan arah kebijakan nasional serta arahan pimpinan PPATK.
                          </p>
                        </>
                      )}
                    </div>

                    {/* Section B: Evaluasi Capaian Kinerja Eselon II */}
                    <div className="space-y-3 pt-4">
                      <h3 className="font-bold text-sm tracking-wide text-slate-900 font-sans">
                        B. EVALUASI CAPAIAN KINERJA ESELON II
                      </h3>
                      <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
                        Evaluasi capaian kinerja Satker {selectedPrintItem.unit_kerja} pada tahun sebelumnya (T-1 TA 2025) menunjukkan pemenuhan target yang sangat baik terhadap indikator kinerja kegiatan yang diampu, baik dari aspek capaian fisik output maupun realisasi penyerapan anggaran:
                      </p>

                      {/* Tabel Capaian Kinerja (6 Kolom: Header Rata Tengah) */}
                      <div className="py-2">
                        <table className="w-full text-xs border-collapse border border-slate-900 font-sans">
                          <thead className="bg-slate-100 font-bold text-center">
                            <tr>
                              <th className="p-2 border border-slate-900 text-center">
                                Sasaran Kinerja Kegiatan
                              </th>
                              <th className="p-2 border border-slate-900 text-center">
                                Indikator Kinerja Kegiatan
                              </th>
                              <th className="p-2 border border-slate-900 text-center w-16">
                                Tahun
                              </th>
                              <th className="p-2 border border-slate-900 text-center w-20">
                                Target
                              </th>
                              <th className="p-2 border border-slate-900 text-center w-24 leading-tight">
                                Capaian Output<br />(%)
                              </th>
                              <th className="p-2 border border-slate-900 text-center w-24 leading-tight">
                                Capaian Anggaran<br />(%)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {capaianRows.map((crow: any, cidx: number) => (
                              <tr key={`cap_${cidx}`}>
                                <td className="p-2 border border-slate-900 font-medium">
                                  {crow.sasaranKegiatan}
                                </td>
                                <td className="p-2 border border-slate-900">
                                  {crow.ikk}
                                </td>
                                <td className="p-2 border border-slate-900 text-center font-mono">
                                  {crow.tahun || 2025}
                                </td>
                                <td className="p-2 border border-slate-900 text-center font-mono font-semibold">
                                  {crow.target}
                                </td>
                                <td className="p-2 border border-slate-900 text-center font-mono font-bold text-emerald-800">
                                  {crow.capaianOutputPct || 100}%
                                </td>
                                <td className="p-2 border border-slate-900 text-center font-mono font-bold text-blue-800">
                                  {crow.capaianAnggaranPct || 99}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Narasi Evaluasi Capaian Kinerja T-1 (2025) */}
                      <div className="pt-2 text-justify text-xs leading-relaxed text-slate-800">
                        {savedBab1?.narasiCapaianT1 ? (
                          <div dangerouslySetInnerHTML={{ __html: savedBab1.narasiCapaianT1 }} />
                        ) : (
                          <p className="indent-8">
                            Berdasarkan hasil evaluasi capaian kinerja T-1 (2025), seluruh kegiatan operasional dan prioritas satker terlaksana sesuai target indikator kinerja dengan tingkat efektivitas dan akuntabilitas penyerapan anggaran yang memuaskan.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Section C: Arah Kebijakan, Strategi, & Target Kinerja (T+1) */}
                    <div className="space-y-3 pt-4">
                      <h3 className="font-bold text-sm tracking-wide text-slate-900 font-sans">
                        C. ARAH KEBIJAKAN, STRATEGI, DAN TARGET KINERJA TAHUN 2027
                      </h3>
                      {savedBab1?.narasiArahKebijakan ? (
                        <div
                          className="text-justify text-xs leading-relaxed text-slate-800 space-y-2"
                          dangerouslySetInnerHTML={{ __html: savedBab1.narasiArahKebijakan }}
                        />
                      ) : (
                        <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
                          Arah kebijakan Satker {selectedPrintItem.unit_kerja} Tahun 2027 berpedoman pada Renstra PPATK Tahun 2025–2029 guna mendukung percepatan transformasi digital, peningkatan integritas pihak pelapor, dan penguatan kompetensi teknis pencegahan serta pemberantasan TPPU, TPPT, dan PPSPM.
                        </p>
                      )}

                      {/* Matriks Target Indikator Kinerja Kegiatan TA 2027 (Format 3 Kolom Sesuai Gambar Standar PPATK) */}
                      <div className="py-2">
                        <table className="w-full text-xs border-collapse border border-slate-900 font-sans">
                          <thead className="bg-slate-200 font-bold text-center">
                            <tr>
                              <th className="p-2 border border-slate-900 w-24">Kode</th>
                              <th className="p-2 border border-slate-900">
                                Sasaran Strategis/Sasaran Program/Sasaran<br />
                                Kegiatan/Indikator Kinerja
                              </th>
                              <th className="p-2 border border-slate-900 w-24">
                                Target<br />
                                2027
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {targetKinerjaRows.map((r, rIdx) => {
                              if (r.isDivider) {
                                return (
                                  <tr key={`div_${rIdx}`}>
                                    <td className="p-2 border border-slate-900"></td>
                                    <td className="p-2 border border-slate-900 font-medium">
                                      <span className="underline">{r.dividerLabel || "Sasaran Kegiatan:"}</span>
                                    </td>
                                    <td className="p-2 border border-slate-900"></td>
                                  </tr>
                                );
                              }

                              return (
                                <tr key={`row_${rIdx}`}>
                                  {/* Kolom 1: Kode */}
                                  <td className="p-2 border border-slate-900 text-center font-bold align-middle">
                                    {r.kode}
                                  </td>

                                  {/* Kolom 2: Sasaran Strategis/Program/Kegiatan & Indikator Kinerja */}
                                  <td className="border border-slate-900 p-0 align-top">
                                    <div className="p-2.5 font-bold text-slate-900 leading-snug">
                                      {r.sasaran}
                                    </div>
                                    {r.indikatorLabel && (
                                      <div className="border-t border-slate-900 p-2 text-xs space-y-0.5">
                                        <div className="italic underline font-medium">{r.indikatorLabel}</div>
                                        <div className="italic text-slate-800">{r.indikatorText}</div>
                                      </div>
                                    )}
                                  </td>

                                  {/* Kolom 3: Target 2027 (Selaras dengan Indikator) */}
                                  <td className="border border-slate-900 p-0 text-center align-bottom">
                                    <div className="p-2.5">&nbsp;</div>
                                    <div className="border-t border-slate-900 p-2 text-xs font-semibold">
                                      {r.target ?? "-"}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Section D: Analisis Situasi */}
                    <div className="space-y-3 pt-4">
                      <h3 className="font-bold text-sm tracking-wide text-slate-900 font-sans">
                        D. ANALISIS SITUASI TAHUN 2027
                      </h3>
                      <div className="space-y-2 text-xs text-slate-800">
                        <p className="text-justify leading-relaxed">
                          <strong>1. Momentum Strategis Satker TA 2027:</strong>{" "}
                          {savedBab1?.analisisMomentumText ? (
                            <span dangerouslySetInnerHTML={{ __html: savedBab1.analisisMomentumText }} />
                          ) : (
                            "Pemanfaatan sistem otomatisasi proses kerja dan digitalisasi tata kelola untuk meningkatkan efisiensi dan kualitas pencapaian output."
                          )}
                        </p>
                        <p className="text-justify leading-relaxed">
                          <strong>2. Tantangan dan Mitigasi Resiko TA 2027:</strong>{" "}
                          {savedBab1?.analisisTantanganText ? (
                            <span dangerouslySetInnerHTML={{ __html: savedBab1.analisisTantanganText }} />
                          ) : (
                            "Kompleksitas perkembangan modus kejahatan transaksi keuangan memerlukan adaptasi kurikulum dan peningkatan kapasitas sumber daya secara berkelanjutan."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ──────────────── 3. BAB II RENCANA KERJA TAHUN 2027 ──────────────── */}
                  <div className="space-y-6 pt-6 print-break">
                    <div className="text-center space-y-1 pb-4">
                      <h2 className="text-base font-bold uppercase tracking-wider font-sans">
                        BAB II
                      </h2>
                      <h2 className="text-base font-bold uppercase tracking-wider font-sans">
                        RENCANA KERJA TAHUN 2027
                      </h2>
                    </div>

                    <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
                      Pelaksanaan Rencana Kerja Satker {selectedPrintItem.unit_kerja} Tahun 2027 diuraikan ke dalam paket-paket rencana kerja prioritas berbasis Rincian Output (RO) yang menjadi tanggung jawab satker:
                    </p>

                    {/* Paket Rencana Kerja Sesuai RO */}
                    <div className="space-y-5 text-xs text-slate-800">
                      {paketBab2List.map((pkt: any, pidx: number) => (
                        <div key={`pkt_${pidx}`} className="space-y-2 bg-slate-50 p-4 rounded border border-slate-300">
                          <p className="font-bold text-slate-900 text-sm">
                            {pidx + 1}. {pkt.nomenklatur || `Paket Rencana Kerja: ${pkt.ro_nama || "Operasional"}`}
                          </p>

                          <div className="space-y-2 pt-1">
                            <div>
                              <span className="font-bold text-slate-900 block">a. Uraian Rencana Kerja:</span>
                              <div
                                className="text-justify text-slate-700 leading-relaxed pt-0.5"
                                dangerouslySetInnerHTML={{ __html: pkt.uraian || "-" }}
                              />
                            </div>

                            <div>
                              <span className="font-bold text-slate-900 block">b. Tujuan:</span>
                              <div
                                className="text-justify text-slate-700 leading-relaxed pt-0.5"
                                dangerouslySetInnerHTML={{ __html: pkt.tujuan || "-" }}
                              />
                            </div>

                            <div>
                              <span className="font-bold text-slate-900 block">c. Tahapan Pelaksanaan:</span>
                              <div
                                className="text-justify text-slate-700 leading-relaxed pt-0.5"
                                dangerouslySetInnerHTML={{ __html: pkt.tahapan || "-" }}
                              />
                            </div>

                            <div>
                              <span className="font-bold text-slate-900 block">d. Output Kegiatan:</span>
                              <div
                                className="text-justify text-slate-700 leading-relaxed pt-0.5"
                                dangerouslySetInnerHTML={{ __html: pkt.output || "-" }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ──────────────── 4. BAB III REKAPITULASI TARGET OUTPUT DAN PENDANAAN RENCANA KERJA ──────────────── */}
                  <div className="space-y-6 pt-6 print-break">
                    <div className="text-center space-y-1 pb-4">
                      <h2 className="text-base font-bold uppercase tracking-wider font-sans">
                        BAB III
                      </h2>
                      <h2 className="text-base font-bold uppercase tracking-wider font-sans">
                        REKAPITULASI TARGET OUTPUT DAN PENDANAAN RENCANA KERJA
                      </h2>
                    </div>

                    <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
                      {bab3Data.openingSentence}
                    </p>

                    {/* Tabel 1: Rekapitulasi Target Output dan Pendanaan (Putih Polos) */}
                    <div className="space-y-2">
                      <table className="w-full text-[10px] border-collapse border border-slate-400">
                        <thead>
                          <tr className="bg-slate-100 text-slate-900 font-bold">
                            <th className="py-2 px-2 text-center border border-slate-400 w-20">
                              Kode
                            </th>
                            <th className="py-2 px-3 text-center border border-slate-400">
                              <div>Uraian</div>
                              <div className="text-[9px] font-semibold text-slate-600">
                                Kegiatan/KRO/RO/Komponen
                              </div>
                            </th>
                            <th className="py-2 px-3 text-center border border-slate-400 w-36">
                              Pagu
                            </th>
                            <th className="py-2 px-3 text-center border border-slate-400 w-44">
                              Target
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {bab3Data.rekapRows.map((row) => (
                            <tr key={`print_rek_${row.id}`} className="bg-white border-b border-slate-400">
                              <td className="bg-white text-slate-900 font-bold font-mono text-center py-1.5 px-2 border border-slate-400 align-middle">
                                {row.kode}
                              </td>
                              <td
                                className={`bg-white text-slate-900 border border-slate-400 py-1.5 px-3 align-middle ${
                                  row.level === "Kegiatan"
                                    ? "font-bold text-slate-950"
                                    : row.level === "KRO"
                                    ? "font-semibold pl-5"
                                    : row.level === "RO"
                                    ? "font-semibold pl-7"
                                    : "font-normal pl-9"
                                }`}
                              >
                                {row.uraian}
                              </td>
                              <td className="bg-white text-slate-900 border border-slate-400 py-1.5 px-3 text-right font-semibold align-middle">
                                {row.pagu}
                              </td>
                              <td className="bg-white text-slate-900 border border-slate-400 py-1.5 px-3 text-center font-medium align-middle">
                                {row.target || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Tabel 2: Target PNBP (Khusus PATIH & BIRU - Putih Polos) */}
                    {bab3Data.isPnbp && bab3Data.pnbpRows.length > 0 && (
                      <div className="space-y-2 pt-4">
                        <div className="text-center space-y-0.5">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            TARGET PENERIMAAN NEGARA BUKAN PAJAK (PNBP) TAHUN 2027
                          </h3>
                          <p className="text-[10px] text-slate-600 italic">
                            (Hierarki 3 Level: Kode Kegiatan, Kode KRO, dan Kode Akun Pendapatan)
                          </p>
                        </div>
                        <table className="w-full text-[10px] border-collapse border border-slate-400">
                          <thead>
                            <tr className="bg-slate-100 text-slate-900 font-bold">
                              <th className="py-2 px-2 text-center border border-slate-400 w-24">
                                Kode
                              </th>
                              <th className="py-2 px-3 text-center border border-slate-400">
                                Nomenklatur PNBP
                              </th>
                              <th className="py-2 px-3 text-center border border-slate-400 w-44">
                                Target PNBP
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {bab3Data.pnbpRows.map((pRow) => (
                              <tr key={`print_pnbp_${pRow.id}`} className="bg-white border-b border-slate-400">
                                <td className="bg-white text-slate-900 font-bold font-mono text-center py-1.5 px-2 border border-slate-400 align-middle">
                                  {pRow.kode}
                                </td>
                                <td
                                  className={`bg-white text-slate-900 border border-slate-400 py-1.5 px-3 align-middle ${
                                    pRow.level === "Kegiatan"
                                      ? "font-bold text-slate-950"
                                      : pRow.level === "KRO"
                                      ? "font-semibold pl-5"
                                      : "font-medium pl-7"
                                  }`}
                                >
                                  {pRow.nomenklatur}
                                </td>
                                <td className="bg-white text-slate-900 border border-slate-400 py-1.5 px-3 text-right font-semibold align-middle">
                                  {pRow.targetPnbp || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* ──────────────── 5. LAMPIRAN: KAMUS RINCIAN OUTPUT (Putih Polos) ──────────────── */}
                  <div className="space-y-6 pt-6 print-break">
                    <div className="text-center space-y-1 pb-4">
                      <h2 className="text-sm font-bold uppercase tracking-wider font-sans">
                        KAMUS RINCIAN OUTPUT PADA {selectedPrintItem.unit_kerja.toUpperCase()}
                      </h2>
                      <h2 className="text-sm font-bold uppercase tracking-wider font-sans">
                        TAHUN 2027
                      </h2>
                    </div>

                    <table className="w-full text-[9px] border-collapse border border-slate-400">
                      <thead>
                        <tr className="bg-slate-100 text-slate-900 font-bold">
                          <th className="py-2 px-1 text-center border border-slate-400 w-20">
                            Kode Anggaran
                          </th>
                          <th className="py-2 px-2 text-center border border-slate-400 w-44">
                            Uraian RO/Komponen
                          </th>
                          <th className="py-2 px-1 text-center border border-slate-400 w-20">
                            Jumlah Target
                          </th>
                          <th className="py-2 px-1 text-center border border-slate-400 w-20">
                            Satuan Target
                          </th>
                          <th className="py-2 px-2 text-center border border-slate-400">
                            Definisi
                          </th>
                          <th className="py-2 px-2 text-center border border-slate-400 w-44">
                            Rincian Target
                          </th>
                        </tr>
                        <tr className="bg-slate-50 text-slate-800 font-bold text-center">
                          <th className="py-1 border border-slate-400">1</th>
                          <th className="py-1 border border-slate-400">2</th>
                          <th className="py-1 border border-slate-400">3</th>
                          <th className="py-1 border border-slate-400">4</th>
                          <th className="py-1 border border-slate-400">5</th>
                          <th className="py-1 border border-slate-400">6</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lampiranData.map((kRow) => (
                          <tr key={`print_lamp_${kRow.id}`} className="bg-white border-b border-slate-400">
                            <td className="bg-white text-slate-900 font-bold font-mono text-center py-2 px-1 border border-slate-400 align-top">
                              {kRow.kode}
                            </td>
                            <td className="bg-white text-slate-900 border border-slate-400 py-2 px-2 align-top font-medium">
                              {kRow.uraian}
                            </td>
                            <td className="bg-white text-slate-900 border border-slate-400 py-2 px-1 text-center align-top font-semibold">
                              {kRow.jumlahTarget}
                            </td>
                            <td className="bg-white text-slate-900 border border-slate-400 py-2 px-1 text-center align-top">
                              {kRow.satuanTarget}
                            </td>
                            <td className="bg-white text-slate-900 border border-slate-400 py-2 px-2 align-top text-justify leading-snug">
                              {kRow.definisi}
                            </td>
                            <td className="bg-white text-slate-900 border border-slate-400 py-2 px-2 align-top text-justify leading-snug whitespace-pre-line">
                              {kRow.rincianTarget}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* ──────────────── 6. BLOK TANDA TANGAN ──────────────── */}
                    <div className="pt-12 flex justify-end">
                      <div className="text-center font-sans text-xs space-y-1 min-w-[260px]">
                        <p className="text-slate-800">Jakarta, 22 September 2026</p>
                        <p className="font-bold text-slate-900 pb-16">
                          {pejabat.jabatan}
                        </p>
                        <p className="font-bold text-slate-900 underline">
                          {pejabat.nama}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer (Screen only) */}
              <div className="p-4 border-t border-[var(--border)] bg-[var(--accent)] flex justify-end gap-3 no-print">
                <button
                  onClick={() => setSelectedPrintItem(null)}
                  className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] text-[var(--text)] font-semibold text-xs rounded-xl hover:bg-[var(--accent)] transition-colors cursor-pointer"
                >
                  Tutup Preview
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-[var(--primary)] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak Dokumen Lengkap (Tanpa Footer)</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Notice Modal */}
      {noticeModalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
            <p className="text-sm font-semibold text-[var(--text)]">{noticeModalMessage}</p>
            <button
              onClick={() => setNoticeModalMessage(null)}
              className="w-full py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

