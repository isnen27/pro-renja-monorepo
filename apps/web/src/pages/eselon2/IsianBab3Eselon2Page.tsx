import { useState, useEffect } from "react";
import {
  DollarSign,
  Save,
  CheckCircle2,
  Building2,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Info,
  Layers,
  Sparkles,
  Link2,
} from "lucide-react";
import unitKerjaData from "../../data/unitKerjaData.json";
import informasiKinerjaData from "../../data/informasiKinerjaData.json";
import { LampiranKamusRoRow } from "./IsianLampiranEselon2Page";

export interface Bab3RekapRow {
  id: string;
  kode: string; // e.g. "3365", "DCF", "001", "051"
  level: "Kegiatan" | "KRO" | "RO" | "Komponen";
  uraian: string;
  pagu: string; // e.g. "Rp.5.354.767.000,00"
  target: string; // e.g. "27 Kegiatan (810 Orang)"
  isAutoTarget?: boolean;
}

export interface Bab3PnbpRow {
  id: string;
  kode: string; // e.g. "3365", "DCF", "425421", "425151"
  level: "Kegiatan" | "KRO" | "Akun";
  nomenklatur: string;
  targetPnbp: string; // e.g. "Rp.691.200.000,00"
}

const STORAGE_KEY_BAB3_E2 = "renja_e2_bab3_data";
const STORAGE_KEY_LAMPIRAN_E2 = "renja_e2_lampiran_data";

export function formatLampiranTarget(jumlahTarget: string, satuanTarget: string): string {
  if (!jumlahTarget && !satuanTarget) return "-";
  if (!satuanTarget) return jumlahTarget;
  if (!jumlahTarget) return satuanTarget;

  const matchJml = jumlahTarget.match(/^([^(]+)\s*\(([^)]+)\)$/);
  const matchSat = satuanTarget.match(/^([^(]+)\s*\(([^)]+)\)$/);
  if (matchJml && matchSat) {
    return `${matchJml[1].trim()} ${matchSat[1].trim()} (${matchJml[2].trim()} ${matchSat[2].trim()})`;
  }
  return `${jumlahTarget} ${satuanTarget}`.trim();
}

function getActiveEselon2Unit() {
  let activeSatkerNama = "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme";
  try {
    const rawHistori = localStorage.getItem("renja_e2_active_histori");
    if (rawHistori) {
      const parsed = JSON.parse(rawHistori);
      if (parsed.kdsatker) activeSatkerNama = parsed.kdsatker;
    }
  } catch (e) {}

  const found = unitKerjaData.find(
    (u) => u.nama === activeSatkerNama || u.singkatan === activeSatkerNama
  );
  if (found) {
    return {
      singkatan: found.singkatan,
      nama: found.nama,
      labelFull: `${found.singkatan} — ${found.nama}`,
    };
  }
  return {
    singkatan: "PATIH",
    nama: activeSatkerNama,
    labelFull: `PATIH — ${activeSatkerNama}`,
  };
}

export const DEFAULT_BAB3_REKAP_PATIH: Bab3RekapRow[] = [
  {
    id: "rek_keg_1",
    kode: "3365",
    level: "Kegiatan",
    uraian: "Pendidikan dan Pelatihan Anti Pencucian Uang PPATK",
    pagu: "Rp.5.354.767.000,00",
    target: "40 Kegiatan (1.200 Orang)",
    isAutoTarget: false,
  },
  {
    id: "rek_kro_1",
    kode: "DCF",
    level: "KRO",
    uraian: "Pelatihan Bidang Ekonomi dan Keuangan",
    pagu: "Rp.3.145.403.000,00",
    target: "27 Kegiatan (810 Orang)",
    isAutoTarget: false,
  },
  {
    id: "rek_ro_1",
    kode: "001",
    level: "RO",
    uraian: "Pelatihan bidang APU PPT PPSPM",
    pagu: "Rp.3.145.403.000,00",
    target: "27 Kegiatan (810 Orang)",
    isAutoTarget: true,
  },
  {
    id: "rek_komp_1",
    kode: "051",
    level: "Komponen",
    uraian: "Perencanaan dan Pengembangan Program Pelatihan",
    pagu: "Rp.223.586.000,00",
    target: "44 Dokumen",
    isAutoTarget: true,
  },
  {
    id: "rek_komp_2",
    kode: "052",
    level: "Komponen",
    uraian: "Kerjasama Pendidikan dan Pelatihan",
    pagu: "Rp.61.626.000,00",
    target: "1 Laporan",
    isAutoTarget: true,
  },
  {
    id: "rek_komp_3",
    kode: "053",
    level: "Komponen",
    uraian: "Penyelenggaraan Pendidikan dan Pelatihan",
    pagu: "Rp.1.678.590.000,00",
    target: "27 Kegiatan",
    isAutoTarget: true,
  },
  {
    id: "rek_komp_4",
    kode: "054",
    level: "Komponen",
    uraian: "Publikasi Pendidikan dan Pelatihan",
    pagu: "Rp.600.000.000,00",
    target: "1 Laporan",
    isAutoTarget: true,
  },
];

export const DEFAULT_BAB3_PNBP_PATIH: Bab3PnbpRow[] = [
  {
    id: "pnbp_patih_1",
    kode: "3365",
    level: "Kegiatan",
    nomenklatur: "Pendidikan dan Pelatihan Anti Pencucian Uang PPATK",
    targetPnbp: "Rp.691.200.000,00",
  },
  {
    id: "pnbp_patih_2",
    kode: "DCF",
    level: "KRO",
    nomenklatur: "Pelatihan Bidang Ekonomi dan Keuangan",
    targetPnbp: "-",
  },
  {
    id: "pnbp_patih_3",
    kode: "425421",
    level: "Akun",
    nomenklatur: "Pendapatan Layanan Pendidikan dan/atau Pelatihan",
    targetPnbp: "Rp547.200.000,00",
  },
  {
    id: "pnbp_patih_4",
    kode: "425151",
    level: "Akun",
    nomenklatur: "Pendapatan Penggunaan Sarana dan Prasarana sesuai dengan Tusi",
    targetPnbp: "Rp.144.000.000,00",
  },
];

export const DEFAULT_BAB3_PNBP_BIRU: Bab3PnbpRow[] = [
  {
    id: "pnbp_biru_1",
    kode: "3364",
    level: "Kegiatan",
    nomenklatur: "Dukungan Manajemen PPATK",
    targetPnbp: "Rp200.000.000,00",
  },
  {
    id: "pnbp_biru_2",
    kode: "EBA",
    level: "KRO",
    nomenklatur: "Layanan Dukungan Manajemen Internal",
    targetPnbp: "-",
  },
  {
    id: "pnbp_biru_3",
    kode: "425151",
    level: "Akun",
    nomenklatur: "Pendapatan Penggunaan Sarana dan Prasarana sesuai dengan Tusi",
    targetPnbp: "Rp150.000.000,00",
  },
  {
    id: "pnbp_biru_4",
    kode: "425764",
    level: "Akun",
    nomenklatur: "Pendapatan Sewa Tanah, Gedung, dan Bangunan",
    targetPnbp: "Rp50.000.000,00",
  },
];

export function generateDefaultBab3Rekap(unitSingkatan: string, unitNama: string): Bab3RekapRow[] {
  if (unitSingkatan === "PATIH") return DEFAULT_BAB3_REKAP_PATIH;

  const rows: Bab3RekapRow[] = [];
  const filtered = informasiKinerjaData.filter((d: any) => d.unitKerja === unitSingkatan);

  if (filtered.length === 0) {
    return [
      {
        id: "rek_fb_keg",
        kode: "3364",
        level: "Kegiatan",
        uraian: `Dukungan Pelaksanaan Tugas dan Fungsi ${unitSingkatan}`,
        pagu: "Rp.1.500.000.000,00",
        target: "1 Layanan (100%)",
        isAutoTarget: false,
      },
      {
        id: "rek_fb_kro",
        kode: "EBA",
        level: "KRO",
        uraian: `Layanan Dukungan Tata Kelola Internal ${unitSingkatan}`,
        pagu: "Rp.1.500.000.000,00",
        target: "1 Layanan",
        isAutoTarget: false,
      },
      {
        id: "rek_fb_ro",
        kode: "001",
        level: "RO",
        uraian: `Layanan Manajemen Operasional ${unitNama}`,
        pagu: "Rp.1.500.000.000,00",
        target: "1 Layanan",
        isAutoTarget: true,
      },
      {
        id: "rek_fb_komp",
        kode: "051",
        level: "Komponen",
        uraian: "Operasional dan Pemeliharaan Sarana Perkantoran",
        pagu: "Rp.1.500.000.000,00",
        target: "1 Laporan",
        isAutoTarget: true,
      },
    ];
  }

  // Kegiatan unik
  const distinctKeg = Array.from(new Set(filtered.map((d: any) => d.kegiatan).filter(Boolean)));
  distinctKeg.forEach((kegStr, kidx) => {
    const kParts = (kegStr as string).split(" ");
    const kKode = kParts[0] || "3364";
    const kUraian = kParts.slice(1).join(" ") || (kegStr as string);
    rows.push({
      id: `rek_gen_keg_${kidx + 1}`,
      kode: kKode,
      level: "Kegiatan",
      uraian: kUraian,
      pagu: "Rp.4.500.000.000,00",
      target: "1 Layanan (100%)",
      isAutoTarget: false,
    });
  });

  // KRO unik
  const distinctKro = Array.from(new Set(filtered.map((d: any) => d.kro).filter(Boolean)));
  distinctKro.forEach((kroStr, kidx) => {
    const parts = (kroStr as string).split(" ");
    const kode = parts[1] || parts[0] || "DCF";
    const uraian = parts.slice(2).join(" ") || (kroStr as string);
    rows.push({
      id: `rek_gen_kro_${kidx + 1}`,
      kode: kode,
      level: "KRO",
      uraian: uraian,
      pagu: "Rp.2.800.000.000,00",
      target: "1 Layanan",
      isAutoTarget: false,
    });
  });

  // RO unik
  const distinctRo = Array.from(new Set(filtered.map((d: any) => d.ro).filter(Boolean)));
  distinctRo.forEach((roStr, ridx) => {
    const parts = (roStr as string).split(" ");
    const kode = parts[2] || `00${ridx + 1}`;
    const uraian = parts.slice(3).join(" ") || (roStr as string);
    rows.push({
      id: `rek_gen_ro_${ridx + 1}`,
      kode: kode,
      level: "RO",
      uraian: uraian,
      pagu: "Rp.2.800.000.000,00",
      target: "10 Layanan (300 Orang)",
      isAutoTarget: true,
    });
  });

  // Komponen unik
  const distinctKomp = Array.from(new Set(filtered.map((d: any) => d.komponen).filter(Boolean)));
  distinctKomp.forEach((kompStr, cidx) => {
    const parts = (kompStr as string).split(" ");
    const kode = parts[3] || `05${cidx + 1}`;
    const uraian = parts.slice(4).join(" ") || (kompStr as string);
    rows.push({
      id: `rek_gen_komp_${cidx + 1}`,
      kode: kode,
      level: "Komponen",
      uraian: uraian,
      pagu: "Rp.250.000.000,00",
      target: "1 Dokumen",
      isAutoTarget: true,
    });
  });

  return rows;
}

export function generateDefaultBab3Pnbp(unitSingkatan: string): Bab3PnbpRow[] {
  if (unitSingkatan === "PATIH") return DEFAULT_BAB3_PNBP_PATIH;
  if (unitSingkatan === "BIRU") return DEFAULT_BAB3_PNBP_BIRU;
  return [];
}

export default function IsianBab3Eselon2Page() {
  const [activeUnit, setActiveUnit] = useState(() => getActiveEselon2Unit());
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);
  const [syncAlert, setSyncAlert] = useState(false);

  // Modal edit / add row Rekapitulasi
  const [editingRekapRow, setEditingRekapRow] = useState<Bab3RekapRow | null>(null);
  const [isAddRekapModalOpen, setIsAddRekapModalOpen] = useState(false);
  const [newRekapRow, setNewRekapRow] = useState<Omit<Bab3RekapRow, "id">>({
    kode: "",
    level: "Komponen",
    uraian: "",
    pagu: "Rp.0,00",
    target: "-",
    isAutoTarget: true,
  });

  // Modal edit / add row PNBP
  const [editingPnbpRow, setEditingPnbpRow] = useState<Bab3PnbpRow | null>(null);
  const [isAddPnbpModalOpen, setIsAddPnbpModalOpen] = useState(false);
  const [newPnbpRow, setNewPnbpRow] = useState<Omit<Bab3PnbpRow, "id">>({
    kode: "",
    level: "Akun",
    nomenklatur: "",
    targetPnbp: "Rp0,00",
  });

  // Opening text Bab III sesuai permintaan user
  const [openingSentence, setOpeningSentence] = useState(
    "Berdasarkan Uraian Rencana Kerja pada BAB II dapat disampaikan Rekapitulasi Target Output dan Pendanaan sebagai berikut:"
  );

  // Data Tabel Rekapitulasi Bab III
  const [rekapRows, setRekapRows] = useState<Bab3RekapRow[]>(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY_BAB3_E2);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (Array.isArray(parsed.rekapRows) && parsed.rekapRows.length > 0) {
          return parsed.rekapRows;
        }
      }
    } catch (e) {}
    return generateDefaultBab3Rekap(getActiveEselon2Unit().singkatan, getActiveEselon2Unit().nama);
  });

  // Data Tabel PNBP (khusus PATIH & BIRU)
  const isPnbpUnit =
    ["PATIH", "BIRU"].includes(activeUnit.singkatan) ||
    activeUnit.nama.toLowerCase().includes("pusdiklat") ||
    activeUnit.nama.toLowerCase().includes("biro umum");

  const [pnbpRows, setPnbpRows] = useState<Bab3PnbpRow[]>(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY_BAB3_E2);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (Array.isArray(parsed.pnbpRows) && parsed.pnbpRows.length > 0) {
          return parsed.pnbpRows;
        }
      }
    } catch (e) {}
    return generateDefaultBab3Pnbp(getActiveEselon2Unit().singkatan);
  });

  // Auto-sinkronisasi nilai Target dari isian Submenu Bagian Lampiran
  function syncTargetsFromLampiran(currentRows: Bab3RekapRow[]): {
    updated: Bab3RekapRow[];
    changedCount: number;
  } {
    let changedCount = 0;
    try {
      const rawLampiran = localStorage.getItem(STORAGE_KEY_LAMPIRAN_E2);
      if (!rawLampiran) return { updated: currentRows, changedCount: 0 };
      const parsed = JSON.parse(rawLampiran);
      if (!Array.isArray(parsed.kamusRows)) return { updated: currentRows, changedCount: 0 };

      const kamusRows: LampiranKamusRoRow[] = parsed.kamusRows;

      // Buat lookup maps
      const codeMap = new Map<string, string>();
      const uraianMap = new Map<string, string>();

      kamusRows.forEach((kr) => {
        const formattedTarget = formatLampiranTarget(kr.jumlahTarget, kr.satuanTarget);
        if (kr.kode) {
          const cleanCode = kr.kode.trim();
          codeMap.set(cleanCode, formattedTarget);
          // E.g. dari "3365.DCF.001" simpan juga "001"
          const parts = cleanCode.split(".");
          if (parts.length > 1) {
            codeMap.set(parts[parts.length - 1].trim(), formattedTarget);
          }
        }
        if (kr.uraian) {
          uraianMap.set(kr.uraian.trim().toLowerCase(), formattedTarget);
        }
      });

      const updated = currentRows.map((r) => {
        // Hanya sinkronkan untuk level RO dan Komponen atau yang flagged isAutoTarget !== false
        if (r.level === "Kegiatan" || r.level === "KRO") {
          return r;
        }

        const matchByCode = codeMap.get(r.kode.trim());
        const matchByUraian = uraianMap.get(r.uraian.trim().toLowerCase());
        const targetFromLampiran = matchByCode || matchByUraian;

        if (targetFromLampiran && targetFromLampiran !== r.target) {
          changedCount++;
          return {
            ...r,
            target: targetFromLampiran,
            isAutoTarget: true,
          };
        }
        return r;
      });

      return { updated, changedCount };
    } catch (e) {
      return { updated: currentRows, changedCount: 0 };
    }
  }

  // Sinkronisasi saat komponen di-mount
  useEffect(() => {
    const unit = getActiveEselon2Unit();
    setActiveUnit(unit);

    setRekapRows((prev) => {
      const { updated, changedCount } = syncTargetsFromLampiran(prev);
      if (changedCount > 0) {
        setSyncAlert(true);
        setTimeout(() => setSyncAlert(false), 4000);
      }
      return updated;
    });
  }, []);

  // Simpan data ke localStorage
  function handleSaveForm() {
    const dataBab3 = {
      unitSingkatan: activeUnit.singkatan,
      unitNama: activeUnit.nama,
      openingSentence,
      rekapRows,
      pnbpRows: isPnbpUnit ? pnbpRows : [],
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_BAB3_E2, JSON.stringify(dataBab3));
    setSavedSuccessAlert(true);
    setTimeout(() => setSavedSuccessAlert(false), 3000);
  }

  // Reset ke data default acuan resmi
  function handleResetDefault() {
    if (
      confirm(
        `Reset tabel Rekapitulasi dan PNBP kembali ke data acuan default untuk ${activeUnit.labelFull}?`
      )
    ) {
      const resetRekap = generateDefaultBab3Rekap(activeUnit.singkatan, activeUnit.nama);
      const { updated } = syncTargetsFromLampiran(resetRekap);
      setRekapRows(updated);

      const resetPnbp = generateDefaultBab3Pnbp(activeUnit.singkatan);
      setPnbpRows(resetPnbp);
    }
  }

  // Sinkronisasi ulang secara eksplisit
  function handleManualSyncFromLampiran() {
    const { updated, changedCount } = syncTargetsFromLampiran(rekapRows);
    setRekapRows(updated);
    setSyncAlert(true);
    setTimeout(() => setSyncAlert(false), 3000);
  }

  // Update field Pagu manual langsung di tabel
  function handlePaguChange(id: string, newPagu: string) {
    setRekapRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, pagu: newPagu } : r))
    );
  }

  // Update field Target PNBP manual langsung di tabel
  function handlePnbpTargetChange(id: string, newTarget: string) {
    setPnbpRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, targetPnbp: newTarget } : r))
    );
  }

  // Hapus baris Rekap
  function handleDeleteRekapRow(id: string) {
    if (confirm("Hapus baris Rekapitulasi ini?")) {
      setRekapRows((prev) => prev.filter((r) => r.id !== id));
      if (editingRekapRow?.id === id) setEditingRekapRow(null);
    }
  }

  // Hapus baris PNBP
  function handleDeletePnbpRow(id: string) {
    if (confirm("Hapus baris target PNBP ini?")) {
      setPnbpRows((prev) => prev.filter((r) => r.id !== id));
      if (editingPnbpRow?.id === id) setEditingPnbpRow(null);
    }
  }

  // Tambah baris Rekap baru
  function handleAddRekapRowSubmit() {
    const newRow: Bab3RekapRow = {
      id: `rek_usr_${Date.now()}`,
      ...newRekapRow,
    };
    setRekapRows([...rekapRows, newRow]);
    setIsAddRekapModalOpen(false);
    setNewRekapRow({
      kode: "",
      level: "Komponen",
      uraian: "",
      pagu: "Rp.0,00",
      target: "-",
      isAutoTarget: true,
    });
  }

  // Tambah baris PNBP baru
  function handleAddPnbpRowSubmit() {
    const newRow: Bab3PnbpRow = {
      id: `pnbp_usr_${Date.now()}`,
      ...newPnbpRow,
    };
    setPnbpRows([...pnbpRows, newRow]);
    setIsAddPnbpModalOpen(false);
    setNewPnbpRow({
      kode: "",
      level: "Akun",
      nomenklatur: "",
      targetPnbp: "Rp0,00",
    });
  }

  // Simpan edit row Rekap modal
  function handleSaveEditRekapRow() {
    if (!editingRekapRow) return;
    setRekapRows((prev) =>
      prev.map((r) => (r.id === editingRekapRow.id ? editingRekapRow : r))
    );
    setEditingRekapRow(null);
  }

  // Simpan edit row PNBP modal
  function handleSaveEditPnbpRow() {
    if (!editingPnbpRow) return;
    setPnbpRows((prev) =>
      prev.map((r) => (r.id === editingPnbpRow.id ? editingPnbpRow : r))
    );
    setEditingPnbpRow(null);
  }

  return (
    <div className="min-h-full p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Banner Notification Save ── */}
      {savedSuccessAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-sm font-semibold flex items-center justify-between shadow-md animate-bounce">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Data Isian Bab III Renja Eselon II BERHASIL disimpan ke sistem!</span>
          </div>
        </div>
      )}

      {/* ── Banner Notification Sync Lampiran ── */}
      {syncAlert && (
        <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-300 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-sky-600 shrink-0" />
            <span>Kolom Target berhasil disinkronisasi dari Submenu Isian Lampiran (Kamus RO).</span>
          </div>
        </div>
      )}

      {/* ── Header Top Bar ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-[#006080] dark:text-teal-300 flex items-center justify-center shrink-0 shadow-sm font-bold">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary text-[0.65rem] font-bold">RENJA ESELON II</span>
              <span className="text-xs text-[var(--text-muted)] font-mono">/eselon2/bab-3</span>
            </div>
            <h1 className="text-lg font-bold text-[var(--text)]">Isian Bab III — Renja Eselon II</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Rekapitulasi Target Output dan Pendanaan Rencana Kerja serta Target PNBP Satker.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleResetDefault}
            className="px-3.5 py-2 bg-[var(--accent)] hover:bg-[var(--border)] text-[var(--text)] rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[var(--border)] transition-colors cursor-pointer"
            title="Kembalikan data ke acuan standar default gambar referensi"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            <span>Reset Default</span>
          </button>
          <button
            onClick={handleManualSyncFromLampiran}
            className="px-3.5 py-2 bg-sky-50 dark:bg-sky-950/40 border border-sky-300 text-sky-800 dark:text-sky-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-sky-100 transition-colors cursor-pointer"
            title="Tarik pembaruan target dari Submenu Isian Lampiran"
          >
            <Link2 className="h-3.5 w-3.5 text-sky-600" />
            <span>Sinkronkan Lampiran</span>
          </button>
          <button
            onClick={handleSaveForm}
            className="px-5 py-2 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Isian Bab III</span>
          </button>
        </div>
      </div>

      {/* ── Info Unit Kerja Aktif ── */}
      <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <Building2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
          <span className="text-[var(--text-muted)]">Unit Kerja Aktif:</span>
          <span className="font-bold text-[var(--text)] bg-[var(--accent)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
            {activeUnit.labelFull}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Info className="h-3.5 w-3.5 text-sky-500 shrink-0" />
          <span>Kolom Pagu diisi manual. Kolom Target terhubung langsung dengan Submenu Isian Lampiran.</span>
        </div>
      </div>

      {/* ── Konten Utama Bab III ── */}
      <div className="aksi-card p-6 md:p-8 bg-[var(--card)] border border-[var(--border)] space-y-6 shadow-sm">
        {/* Judul Bab III */}
        <div className="text-center space-y-1">
          <span className="text-[0.7rem] font-bold tracking-widest text-[var(--primary)] uppercase">
            BAB III RENJA ESELON II
          </span>
          <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-[var(--text)]">
            REKAPITULASI TARGET OUTPUT DAN PENDANAAN RENCANA KERJA
          </h2>
        </div>

        {/* Kalimat Pembuka Bab III */}
        <div className="bg-[var(--accent)]/50 p-4 rounded-xl border border-[var(--border)] space-y-1.5">
          <label className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Kalimat Pembuka Bab III:
          </label>
          <input
            type="text"
            value={openingSentence}
            onChange={(e) => setOpeningSentence(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3.5 py-2 text-xs md:text-sm text-[var(--text)] font-serif italic focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <p className="text-[0.65rem] text-[var(--text-muted)] italic">
            *Dapat disesuaikan sesuai kebutuhan redaksional dokumen resmi Renja.
          </p>
        </div>

        {/* ── TABEL 1: REKAPITULASI TARGET OUTPUT DAN PENDANAAN ── */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wide flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#006080]" />
                Tabel Rekapitulasi Target Output dan Pendanaan
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Struktur Kegiatan, Kelompok Rincian Output (KRO), Rincian Output (RO), dan Komponen TA 2027
              </p>
            </div>
            <button
              onClick={() => setIsAddRekapModalOpen(true)}
              className="px-3 py-1.5 bg-[var(--primary)] hover:opacity-90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Baris</span>
            </button>
          </div>

          {/* Table Container dengan style putih polos */}
          <div className="overflow-x-auto rounded-xl border border-[var(--border)] shadow-sm bg-[var(--card)]">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-[var(--text)] font-bold border-b border-[var(--border)]">
                  <th className="py-3 px-3 text-center border-r border-[var(--border)] w-24">
                    Kode
                  </th>
                  <th className="py-3 px-4 text-center border-r border-[var(--border)]">
                    <div>Uraian</div>
                    <div className="text-[0.7rem] font-semibold text-[var(--text-muted)]">
                      Kegiatan/KRO/RO/Komponen
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center border-r border-[var(--border)] w-48">
                    Pagu
                  </th>
                  <th className="py-3 px-4 text-center border-r border-[var(--border)] w-52">
                    Target
                  </th>
                  <th className="py-3 px-2 text-center w-20 no-print">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {rekapRows.map((row) => {
                  const isKegiatan = row.level === "Kegiatan";
                  const isKro = row.level === "KRO";
                  const isRo = row.level === "RO";

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--border)] hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Kolom 1: Kode (Putih polos, font bold) */}
                      <td className="bg-white dark:bg-slate-900 text-[var(--text)] font-bold font-mono text-center py-2.5 px-3 border-r border-[var(--border)] align-middle select-all">
                        {row.kode}
                      </td>

                      {/* Kolom 2: Uraian Kegiatan/KRO/RO/Komponen (Putih polos) */}
                      <td
                        className={`bg-white dark:bg-slate-900 text-[var(--text)] border-r border-[var(--border)] py-2.5 px-4 align-middle ${
                          isKegiatan
                            ? "font-bold text-[var(--text)] text-xs"
                            : isKro
                            ? "font-semibold text-[var(--text)] pl-6"
                            : isRo
                            ? "font-semibold text-[var(--text)] pl-8"
                            : "font-normal text-[var(--text)] pl-10"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{row.uraian}</span>
                          <span className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[var(--border)]">
                            {row.level}
                          </span>
                        </div>
                      </td>

                      {/* Kolom 3: Pagu (Diisi manual, editable) */}
                      <td className="bg-white dark:bg-slate-900 text-[var(--text)] border-r border-[var(--border)] py-2 px-3 align-middle">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={row.pagu}
                            onChange={(e) => handlePaguChange(row.id, e.target.value)}
                            className={`w-full bg-slate-50 dark:bg-slate-800 border border-[var(--border)] rounded px-2.5 py-1 text-xs text-[var(--text)] text-right focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${
                              isKegiatan || isKro ? "font-bold" : "font-medium"
                            }`}
                            placeholder="Rp.0,00"
                          />
                        </div>
                      </td>

                      {/* Kolom 4: Target (Berdasarkan isian submenu bagian Lampiran) */}
                      <td className="bg-white dark:bg-slate-900 text-[var(--text)] border-r border-[var(--border)] py-2.5 px-3 text-center align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`text-[var(--text)] ${
                              isKegiatan || isKro || isRo ? "font-bold" : "font-medium"
                            }`}
                          >
                            {row.target || "-"}
                          </span>
                          {row.isAutoTarget && (
                            <span
                              title="Target tersinkronisasi otomatis dari Submenu Lampiran"
                              className="text-[var(--primary)] shrink-0"
                            >
                              <Link2 className="h-3 w-3 inline" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kolom 5: Aksi (No print) */}
                      <td className="bg-white dark:bg-slate-900 text-[var(--text)] py-2 px-2 text-center align-middle no-print">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingRekapRow(row)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)] hover:text-[var(--text)] rounded transition-colors cursor-pointer"
                            title="Edit Baris"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRekapRow(row.id)}
                            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 rounded transition-colors cursor-pointer"
                            title="Hapus Baris"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[0.65rem] text-[var(--text-muted)] italic flex items-center gap-1">
            <Info className="h-3 w-3 text-sky-500 shrink-0" />
            <span>
              Catatan: Kolom <strong>Pagu</strong> dapat diedit langsung pada tabel. Nilai kolom <strong>Target</strong> diperbarui otomatis saat Anda mengisi atau mengubah Submenu Isian Lampiran.
            </span>
          </p>
        </div>

        {/* ── TABEL 2: TARGET PNBP (KHUSUS UNIT KERJA PATIH & BIRU) ── */}
        {isPnbpUnit && (
          <div className="space-y-3 pt-6 border-t border-[var(--border)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Target Penerimaan Negara Bukan Pajak (PNBP) TA 2027
                  </h3>
                  <span className="badge badge-warning text-[0.6rem] font-bold">
                    Khusus {activeUnit.singkatan}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Struktur 3 Level Hierarki Kode: Kode Kegiatan, Kode KRO, dan Kode Akun Pendapatan
                </p>
              </div>

              <button
                onClick={() => setIsAddPnbpModalOpen(true)}
                className="px-3 py-1.5 bg-[var(--primary)] hover:opacity-90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Akun PNBP</span>
              </button>
            </div>

            {/* Table PNBP Container putih polos */}
            <div className="overflow-x-auto rounded-xl border border-[var(--border)] shadow-sm bg-[var(--card)]">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-[var(--text)] font-bold border-b border-[var(--border)]">
                    <th className="py-3 px-3 text-center border-r border-[var(--border)] w-28">
                      Kode
                    </th>
                    <th className="py-3 px-4 text-center border-r border-[var(--border)]">
                      Nomenklatur PNBP
                    </th>
                    <th className="py-3 px-4 text-center border-r border-[var(--border)] w-56">
                      Target PNBP
                    </th>
                    <th className="py-3 px-2 text-center w-20 no-print">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pnbpRows.map((pRow) => {
                    const isKegiatan = pRow.level === "Kegiatan";
                    const isKro = pRow.level === "KRO";
                    const isAkun = pRow.level === "Akun";

                    return (
                      <tr
                        key={pRow.id}
                        className="border-b border-[var(--border)] hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Kolom 1: Kode */}
                        <td className="bg-white dark:bg-slate-900 text-[var(--text)] font-bold font-mono text-center py-2.5 px-3 border-r border-[var(--border)] align-middle select-all">
                          {pRow.kode}
                        </td>

                        {/* Kolom 2: Nomenklatur PNBP */}
                        <td
                          className={`bg-white dark:bg-slate-900 text-[var(--text)] border-r border-[var(--border)] py-2.5 px-4 align-middle ${
                            isKegiatan
                              ? "font-bold text-[var(--text)] text-xs"
                              : isKro
                              ? "font-semibold text-[var(--text)] pl-6"
                              : "font-medium text-[var(--text)] pl-8"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{pRow.nomenklatur}</span>
                            <span className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[var(--border)]">
                              {pRow.level === "Akun" ? "Akun Pendapatan" : pRow.level}
                            </span>
                          </div>
                        </td>

                        {/* Kolom 3: Target PNBP */}
                        <td className="bg-white dark:bg-slate-900 text-[var(--text)] border-r border-[var(--border)] py-2 px-3 align-middle text-right">
                          <input
                            type="text"
                            value={pRow.targetPnbp}
                            onChange={(e) => handlePnbpTargetChange(pRow.id, e.target.value)}
                            placeholder="Rp0,00"
                            className={`w-full bg-slate-50 dark:bg-slate-800 border border-[var(--border)] rounded px-2.5 py-1 text-xs text-[var(--text)] text-right focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${
                              isKegiatan ? "font-bold" : "font-semibold"
                            }`}
                          />
                        </td>

                        {/* Kolom 4: Aksi */}
                        <td className="bg-white dark:bg-slate-900 text-[var(--text)] py-2 px-2 text-center align-middle no-print">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditingPnbpRow(pRow)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)] hover:text-[var(--text)] rounded transition-colors cursor-pointer"
                              title="Edit PNBP"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePnbpRow(pRow.id)}
                              className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 rounded transition-colors cursor-pointer"
                              title="Hapus PNBP"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[0.65rem] text-[var(--text-muted)] italic">
              *Tabel Target PNBP hanya berlaku dan tampil bagi Satuan Kerja penghasil PNBP (Pusdiklat APU PPT / Biro Umum).
            </p>
          </div>
        )}
      </div>

      {/* ── MODAL TAMBAH BARIS REKAPITULASI ── */}
      {isAddRekapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#006080]" />
              Tambah Baris Rekapitulasi Output & Pendanaan
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[var(--text-muted)] block mb-1">
                  Tingkat Level:
                </label>
                <select
                  value={newRekapRow.level}
                  onChange={(e) =>
                    setNewRekapRow({
                      ...newRekapRow,
                      level: e.target.value as Bab3RekapRow["level"],
                    })
                  }
                  className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2 font-medium"
                >
                  <option value="Kegiatan">Kegiatan (e.g. 3365)</option>
                  <option value="KRO">Kelompok Rincian Output / KRO (e.g. DCF)</option>
                  <option value="RO">Rincian Output / RO (e.g. 001)</option>
                  <option value="Komponen">Komponen (e.g. 051, 052)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[var(--text-muted)] block mb-1">
                  Kode Anggaran:
                </label>
                <input
                  type="text"
                  value={newRekapRow.kode}
                  onChange={(e) => setNewRekapRow({ ...newRekapRow, kode: e.target.value })}
                  placeholder="Contoh: 055 atau 3365"
                  className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--text-muted)] block mb-1">
                  Uraian Nomenklatur:
                </label>
                <input
                  type="text"
                  value={newRekapRow.uraian}
                  onChange={(e) => setNewRekapRow({ ...newRekapRow, uraian: e.target.value })}
                  placeholder="Ketik uraian kegiatan/KRO/RO/Komponen..."
                  className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[var(--text-muted)] block mb-1">
                    Pagu Anggaran:
                  </label>
                  <input
                    type="text"
                    value={newRekapRow.pagu}
                    onChange={(e) => setNewRekapRow({ ...newRekapRow, pagu: e.target.value })}
                    placeholder="Rp.100.000.000,00"
                    className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2 text-right font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[var(--text-muted)] block mb-1">
                    Target Output:
                  </label>
                  <input
                    type="text"
                    value={newRekapRow.target}
                    onChange={(e) => setNewRekapRow({ ...newRekapRow, target: e.target.value })}
                    placeholder="1 Dokumen / 27 Kegiatan"
                    className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => setIsAddRekapModalOpen(false)}
                className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--border)] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleAddRekapRowSubmit}
                className="px-4 py-2 bg-[#006080] hover:bg-[#004d66] text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                Simpan Baris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDIT BARIS REKAPITULASI ── */}
      {editingRekapRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-[#006080]" />
              Edit Baris Rekapitulasi Output & Pendanaan
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[var(--text-muted)] block mb-1">
                  Tingkat Level:
                </label>
                <select
                  value={editingRekapRow.level}
                  onChange={(e) =>
                    setEditingRekapRow({
                      ...editingRekapRow,
                      level: e.target.value as Bab3RekapRow["level"],
                    })
                  }
                  className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2 font-medium"
                >
                  <option value="Kegiatan">Kegiatan</option>
                  <option value="KRO">KRO</option>
                  <option value="RO">RO</option>
                  <option value="Komponen">Komponen</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[var(--text-muted)] block mb-1">
                  Kode Anggaran:
                </label>
                <input
                  type="text"
                  value={editingRekapRow.kode}
                  onChange={(e) =>
                    setEditingRekapRow({ ...editingRekapRow, kode: e.target.value })
                  }
                  className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--text-muted)] block mb-1">
                  Uraian Nomenklatur:
                </label>
                <input
                  type="text"
                  value={editingRekapRow.uraian}
                  onChange={(e) =>
                    setEditingRekapRow({ ...editingRekapRow, uraian: e.target.value })
                  }
                  className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[var(--text-muted)] block mb-1">
                    Pagu Anggaran:
                  </label>
                  <input
                    type="text"
                    value={editingRekapRow.pagu}
                    onChange={(e) =>
                      setEditingRekapRow({ ...editingRekapRow, pagu: e.target.value })
                    }
                    className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2 text-right font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[var(--text-muted)] block mb-1">
                    Target Output:
                  </label>
                  <input
                    type="text"
                    value={editingRekapRow.target}
                    onChange={(e) =>
                      setEditingRekapRow({ ...editingRekapRow, target: e.target.value })
                    }
                    className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => setEditingRekapRow(null)}
                className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--border)] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditRekapRow}
                className="px-4 py-2 bg-[#006080] hover:bg-[#004d66] text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL TAMBAH BARIS PNBP ── */}
      {isAddPnbpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#006080]" />
              Tambah Baris Target PNBP
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[var(--text-muted)] block mb-1">
                  Hierarki Tingkat Kode:
                </label>
                <select
                  value={newPnbpRow.level}
                  onChange={(e) =>
                    setNewPnbpRow({
                      ...newPnbpRow,
                      level: e.target.value as Bab3PnbpRow["level"],
                    })
                  }
                  className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2 font-medium"
                >
                  <option value="Kegiatan">Level 1: Kode Kegiatan (e.g. 3365)</option>
                  <option value="KRO">Level 2: Kode KRO (e.g. DCF)</option>
                  <option value="Akun">Level 3: Kode Akun Pendapatan (e.g. 425421, 425151)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[var(--text-muted)] block mb-1">
                  Kode:
                </label>
                <input
                  type="text"
                  value={newPnbpRow.kode}
                  onChange={(e) => setNewPnbpRow({ ...newPnbpRow, kode: e.target.value })}
                  placeholder="Contoh: 425421 atau 3365"
                  className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--text-muted)] block mb-1">
                  Nomenklatur PNBP:
                </label>
                <input
                  type="text"
                  value={newPnbpRow.nomenklatur}
                  onChange={(e) => setNewPnbpRow({ ...newPnbpRow, nomenklatur: e.target.value })}
                  placeholder="Ketik nomenklatur PNBP..."
                  className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--text-muted)] block mb-1">
                  Target PNBP:
                </label>
                <input
                  type="text"
                  value={newPnbpRow.targetPnbp}
                  onChange={(e) => setNewPnbpRow({ ...newPnbpRow, targetPnbp: e.target.value })}
                  placeholder="Rp.0,00 atau - jika KRO"
                  className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2 text-right font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => setIsAddPnbpModalOpen(false)}
                className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--border)] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleAddPnbpRowSubmit}
                className="px-4 py-2 bg-[#006080] hover:bg-[#004d66] text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                Simpan PNBP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDIT BARIS PNBP ── */}
      {editingPnbpRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-[#006080]" />
              Edit Baris Target PNBP
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[var(--text-muted)] block mb-1">
                  Hierarki Tingkat Kode:
                </label>
                <select
                  value={editingPnbpRow.level}
                  onChange={(e) =>
                    setEditingPnbpRow({
                      ...editingPnbpRow,
                      level: e.target.value as Bab3PnbpRow["level"],
                    })
                  }
                  className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2 font-medium"
                >
                  <option value="Kegiatan">Level 1: Kode Kegiatan</option>
                  <option value="KRO">Level 2: Kode KRO</option>
                  <option value="Akun">Level 3: Kode Akun Pendapatan</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[var(--text-muted)] block mb-1">
                  Kode:
                </label>
                <input
                  type="text"
                  value={editingPnbpRow.kode}
                  onChange={(e) =>
                    setEditingPnbpRow({ ...editingPnbpRow, kode: e.target.value })
                  }
                  className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--text-muted)] block mb-1">
                  Nomenklatur PNBP:
                </label>
                <input
                  type="text"
                  value={editingPnbpRow.nomenklatur}
                  onChange={(e) =>
                    setEditingPnbpRow({ ...editingPnbpRow, nomenklatur: e.target.value })
                  }
                  className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--text-muted)] block mb-1">
                  Target PNBP:
                </label>
                <input
                  type="text"
                  value={editingPnbpRow.targetPnbp}
                  onChange={(e) =>
                    setEditingPnbpRow({ ...editingPnbpRow, targetPnbp: e.target.value })
                  }
                  className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg p-2 text-right font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => setEditingPnbpRow(null)}
                className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--border)] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditPnbpRow}
                className="px-4 py-2 bg-[#006080] hover:bg-[#004d66] text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
