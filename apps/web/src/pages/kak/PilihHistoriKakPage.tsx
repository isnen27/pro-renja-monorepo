import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  History,
  CheckCircle2,
  X,
  RefreshCw,
  ChevronDown,
  Copy,
  ArrowRightLeft,
  Check,
  Lock,
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Building2,
  Layers,
  Search,
} from "lucide-react";

import unitKerjaData from "../../data/unitKerjaData.json";

// ─── Tipe data ────────────────────────────────────────────────────────────────
export type StatusHistoriKak =
  | "Pagu Indikatif"
  | "Pagu Anggaran"
  | "Alokasi Anggaran"
  | "DIPA Awal"
  | "Usulan Revisi DIPA"
  | "Usulan Revisi Satker (POK)";

export type UserRole = "Operator" | "Approver" | "BINCANG" | "Super Admin";

export interface HistoriEntryKak {
  kode: string;
  label: string;
  status: StatusHistoriKak;
  rev_ke: number;
  sumber: string;
}

export interface MonitoringStorageItemKak {
  id: string;
  unit_kerja: string;
  owner: "Operator" | "Approver" | "BINCANG";
  kodifikasi: string;
  tahap_status: StatusHistoriKak;
  rev_ke: number;
  status_histori_full: string;
  sumber: string;
  tgl_revisi: string;
  is_approved: boolean;
}

// Data Satker dari Referensi Unit Kerja PPATK
const SATKER_LIST_KAK = unitKerjaData.map((u) => ({
  singkatan: u.singkatan,
  nama: u.nama,
  labelFull: `${u.singkatan} — ${u.nama}`,
}));

export function buildKodifikasiListKak(status: StatusHistoriKak): HistoriEntryKak[] {
  if (status === "DIPA Awal") {
    return [
      {
        kode: "B00",
        label: "DIPA Awal - B00",
        status,
        rev_ke: 0,
        sumber: "B00",
      },
    ];
  }
  if (status === "Usulan Revisi DIPA") {
    // A01 s.d. A99
    return Array.from({ length: 99 }, (_, i) => {
      const numStr = String(i + 1).padStart(2, "0");
      const kode = "A" + numStr;
      return {
        kode,
        label: `Usulan Revisi DIPA - ${kode}`,
        status,
        rev_ke: i + 1,
        sumber: i === 0 ? "B00" : `A${String(i).padStart(2, "0")}`,
      };
    });
  }
  if (status === "Usulan Revisi Satker (POK)") {
    // C01 s.d. C99
    return Array.from({ length: 99 }, (_, i) => {
      const numStr = String(i + 1).padStart(2, "0");
      const kode = "C" + numStr;
      return {
        kode,
        label: `Usulan Revisi Satker (POK) - ${kode}`,
        status,
        rev_ke: i + 1,
        sumber: i === 0 ? "B00" : `C${String(i).padStart(2, "0")}`,
      };
    });
  }
  if (status === "Pagu Indikatif") {
    const subVersions = [
      "00",
      ...Array.from({ length: 26 }, (_, i) => "0" + String.fromCharCode(97 + i)),
    ];
    return subVersions.map((v, idx) => ({
      kode: "D" + v,
      label: "Pagu Indikatif - D" + v,
      status,
      rev_ke: idx,
      sumber: "D00",
    }));
  }
  if (status === "Pagu Anggaran") {
    return Array.from({ length: 20 }, (_, i) => {
      const kode = "D" + String(i + 1).padStart(2, "0");
      return { kode, label: "Pagu Anggaran - " + kode, status, rev_ke: i, sumber: "D00" };
    });
  }
  return Array.from({ length: 21 }, (_, i) => {
    const kode = "E" + String(i).padStart(2, "0");
    return { kode, label: "Alokasi Anggaran - " + kode, status, rev_ke: i, sumber: "D01" };
  });
}

function getMonitoringListKak(): MonitoringStorageItemKak[] {
  try {
    const raw = localStorage.getItem("kak_monitoring_list");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [
    {
      id: "hist_kak_1",
      unit_kerja: "Direktorat Strategi dan Kerja Sama Internasional",
      owner: "BINCANG",
      kodifikasi: "B00",
      tahap_status: "DIPA Awal",
      rev_ke: 0,
      status_histori_full: "B00 - DIPA Awal - Rev ke-0",
      sumber: "B00",
      tgl_revisi: "05-10-2026 08:30 WIB",
      is_approved: true,
    },
    {
      id: "hist_kak_2",
      unit_kerja: "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
      owner: "Operator",
      kodifikasi: "B00",
      tahap_status: "DIPA Awal",
      rev_ke: 0,
      status_histori_full: "B00 - DIPA Awal - Rev ke-0",
      sumber: "B00",
      tgl_revisi: "06-10-2026 09:15 WIB",
      is_approved: true,
    },
  ];
}

export default function PilihHistoriKakPage() {
  // Pengaturan role yang sama dengan menu Renja Eselon II
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("renja_e2_user_role");
      if (saved && ["Operator", "Approver", "BINCANG", "Super Admin"].includes(saved)) {
        return saved as UserRole;
      }
    } catch (e) {}
    return "Operator";
  });

  useEffect(() => {
    try {
      localStorage.setItem("renja_e2_user_role", activeRole);
    } catch (e) {}
  }, [activeRole]);

  // Cek apakah sudah ada histori Renja Eselon II
  const [activeEselon2Histori, setActiveEselon2Histori] = useState<{
    kdsatker?: string;
    kode_sts_history?: string;
    status_histori?: string;
    label?: string;
    rev_ke?: number;
    sumber?: string;
    saved_at?: string;
  } | null>(() => {
    try {
      const raw = localStorage.getItem("renja_e2_active_histori");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  });

  const [selectedSatker, setSelectedSatker] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("kak_active_histori");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.kdsatker) return parsed.kdsatker;
      }
    } catch (e) {}
    // Jika ada histori Eselon II, defaultkan ke satker Eselon II tersebut
    try {
      const e2Raw = localStorage.getItem("renja_e2_active_histori");
      if (e2Raw) {
        const e2 = JSON.parse(e2Raw);
        if (e2.kdsatker) return e2.kdsatker;
      }
    } catch (e) {}
    return "Direktorat Strategi dan Kerja Sama Internasional";
  });

  // State untuk Dropdown Unit Kerja Kustom (Anti-Glitch & Anti-Overflow)
  const [isSatkerDropdownOpen, setIsSatkerDropdownOpen] = useState(false);
  const [satkerSearch, setSatkerSearch] = useState("");
  const satkerDropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        satkerDropdownRef.current &&
        !satkerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSatkerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter list unit kerja saat pencarian
  const filteredSatkerList = useMemo(() => {
    if (!satkerSearch.trim()) return SATKER_LIST_KAK;
    const q = satkerSearch.toLowerCase();
    return SATKER_LIST_KAK.filter(
      (s) =>
        s.nama.toLowerCase().includes(q) ||
        s.singkatan.toLowerCase().includes(q) ||
        s.labelFull.toLowerCase().includes(q)
    );
  }, [satkerSearch]);

  const currentSatkerObj = useMemo(() => {
    return (
      SATKER_LIST_KAK.find((s) => s.nama === selectedSatker) || {
        singkatan: "Satker",
        nama: selectedSatker,
        labelFull: selectedSatker,
      }
    );
  }, [selectedSatker]);

  // Validasi apakah Renja Eselon II berkode E00 s.d. E99 (Alokasi Anggaran)
  const isEselon2AlokasiAnggaran = Boolean(
    activeEselon2Histori?.status_histori === "Alokasi Anggaran" ||
    (activeEselon2Histori?.kode_sts_history && activeEselon2Histori.kode_sts_history.startsWith("E"))
  );

  const e2Status = (activeEselon2Histori?.status_histori as StatusHistoriKak) || "Pagu Indikatif";
  const isPaguIndikatifAllowed = e2Status === "Pagu Indikatif";
  const isPaguAnggaranAllowed = e2Status === "Pagu Anggaran";
  const isAlokasiAnggaranAllowed = e2Status === "Alokasi Anggaran" || isEselon2AlokasiAnggaran;
  const isDipaDanRevisiAllowed = isEselon2AlokasiAnggaran;

  const [selectedStatus, setSelectedStatus] = useState<StatusHistoriKak>(() => {
    try {
      const saved = localStorage.getItem("kak_active_histori");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.status_histori) {
          // Validasi apakah status yang tersimpan diizinkan
          const st = parsed.status_histori as StatusHistoriKak;
          if (["DIPA Awal", "Usulan Revisi DIPA", "Usulan Revisi Satker (POK)"].includes(st)) {
            if (isEselon2AlokasiAnggaran) return st;
          } else if (st === e2Status) {
            return st;
          }
        }
      }
    } catch (e) {}
    // Default: jika Eselon II sudah Alokasi Anggaran (E), izinkan DIPA Awal, jika belum harus selaras dengan status Eselon II
    return isEselon2AlokasiAnggaran ? "DIPA Awal" : e2Status;
  });

  // Pastikan status terpilih selalu valid dengan aturan Eselon II
  useEffect(() => {
    const isDipaGroup = ["DIPA Awal", "Usulan Revisi DIPA", "Usulan Revisi Satker (POK)"].includes(selectedStatus);
    if (isDipaGroup && !isDipaDanRevisiAllowed) {
      // Jika user memilih DIPA padahal Eselon II belum E00-E99, paksa selaras dengan Eselon II
      setSelectedStatus(e2Status);
    } else if (!isDipaGroup && selectedStatus !== e2Status) {
      // Jika memilih tahap Pagu Renja, harus selaras persis dengan status Eselon II
      setSelectedStatus(e2Status);
    }
  }, [activeEselon2Histori, isDipaDanRevisiAllowed, e2Status]);

  const [selectedKodifikasi, setSelectedKodifikasi] = useState<string>("B00");
  const [salinDariSatker, setSalinDariSatker] = useState<string>("");
  const [salinDariStatus, setSalinDariStatus] = useState<StatusHistoriKak>("DIPA Awal");
  const [salinDariKodifikasi, setSalinDariKodifikasi] = useState<string>("B00");

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savedLabel, setSavedLabel] = useState<string>("");
  const [isCopyModalOpen, setIsCopyModalOpen] = useState<boolean>(false);
  const [isCopying, setIsCopying] = useState<boolean>(false);
  const [copySuccessAlert, setCopySuccessAlert] = useState<string | null>(null);

  // Fungsi sinkronisasi cek ulang status Renja Eselon II
  function checkEselon2Status() {
    try {
      const raw = localStorage.getItem("renja_e2_active_histori");
      if (raw) {
        const parsed = JSON.parse(raw);
        setActiveEselon2Histori(parsed);
        if (parsed.kdsatker) {
          setSelectedSatker(parsed.kdsatker);
        }
      } else {
        setActiveEselon2Histori(null);
      }
    } catch (e) {
      setActiveEselon2Histori(null);
    }
  }

  const kodifikasiOptions = buildKodifikasiListKak(selectedStatus);
  const salinKodifikasiOptions = buildKodifikasiListKak(salinDariStatus);

  useEffect(() => {
    const options = buildKodifikasiListKak(selectedStatus);
    if (!options.some((o) => o.kode === selectedKodifikasi)) {
      setSelectedKodifikasi(options[0]?.kode || "B00");
    }
  }, [selectedStatus]);

  function handleSaveHistori() {
    const entry = kodifikasiOptions.find((o) => o.kode === selectedKodifikasi) || kodifikasiOptions[0];
    const dataToSave = {
      kdsatker: selectedSatker,
      kode_sts_history: entry.kode,
      status_histori: selectedStatus,
      label: `${selectedStatus} - ${entry.kode}`,
      rev_ke: entry.rev_ke,
      sumber: entry.sumber,
      saved_at: new Date().toISOString(),
    };

    localStorage.setItem("kak_active_histori", JSON.stringify(dataToSave));
    setSavedLabel(`${selectedSatker} (${selectedStatus} - ${entry.kode})`);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
  }

  function handleExecuteCopy() {
    setIsCopying(true);
    setTimeout(() => {
      setIsCopying(false);
      setIsCopyModalOpen(false);
      setCopySuccessAlert(
        `Data KAK/TOR berhasil disalin dari ${salinDariSatker || "Satker Sumber"} [${salinDariStatus} - ${salinDariKodifikasi}] ke histori aktif.`
      );
      setTimeout(() => setCopySuccessAlert(null), 5000);
    }, 1200);
  }

  // Jika belum ada histori Renja Eselon II, kunci tampilan dengan petunjuk ramah pengguna
  if (!activeEselon2Histori) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
              <span>Penganggaran & Biaya</span>
              <span>/</span>
              <span>Kerangka Acuan Kerja (TOR)</span>
              <span>/</span>
              <span className="text-[var(--primary)] font-semibold">Pilih Histori</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
              <History className="h-6 w-6 text-[var(--primary)]" />
              <span>Pilih Histori Kerangka Acuan Kerja (TOR)</span>
            </h1>
          </div>

          {/* Role Switcher sinkron dengan Renja Eselon II */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-[var(--border)] text-xs">
            <span className="text-[var(--text-muted)] font-semibold px-2">Peran:</span>
            {(["Operator", "Approver", "BINCANG", "Super Admin"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeRole === r
                    ? "bg-white dark:bg-slate-700 text-[var(--text)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Lock State Card */}
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-amber-300 dark:border-amber-800 rounded-3xl p-8 sm:p-12 text-center shadow-sm space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-[var(--text)]">
              Submenu Pilih Histori KAK/TOR Belum Dapat Dibuka
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Submenu <strong>Pilih Histori Kerangka Acuan Kerja (TOR)</strong> hanya dapat terbuka jika{" "}
              <strong>sudah ada histori Renja Eselon II aktif</strong>. Dokumen KAK/TOR merupakan instrumen turunan operasional yang berbasis pada rincian pagu dan output Rencana Kerja Eselon II.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 max-w-lg mx-auto text-left text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Langkah Tindak Lanjut:</span>
              <p className="text-[0.7rem] text-amber-800 dark:text-amber-300 leading-normal">
                1. Buka menu <strong>Renja Eselon II</strong> → <strong>Pilih Histori</strong>.<br />
                2. Tentukan Satuan Kerja serta versi kodifikasi (misal: D00 / Pagu Indikatif).<br />
                3. Klik tombol <strong>Terapkan Histori</strong>. Setelah histori tersimpan, halaman KAK ini akan langsung aktif.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/eselon2/pilih-histori"
              className="px-6 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Buka Pilih Histori Renja Eselon II</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={checkEselon2Status}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-[var(--text)] flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
              <span>Cek Ulang Status Histori</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Breadcrumb & Title ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Penganggaran & Biaya</span>
            <span>/</span>
            <span>Kerangka Acuan Kerja (TOR)</span>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Pilih Histori</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <History className="h-6 w-6 text-[var(--primary)]" />
            <span>Pilih Histori Kerangka Acuan Kerja (TOR)</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Pilih unit kerja, tahapan status revisi, dan kodifikasi histori dokumen KAK/TOR aktif.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role Switcher sama dengan Renja Eselon II */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-[var(--border)] text-xs">
            <span className="text-[var(--text-muted)] font-semibold px-2">Peran:</span>
            {(["Operator", "Approver", "BINCANG", "Super Admin"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeRole === r
                    ? "bg-white dark:bg-slate-700 text-[var(--text)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCopyModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 text-xs font-semibold text-[var(--text)] hover:bg-[var(--accent)] flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Copy className="h-4 w-4 text-[var(--text-muted)]" />
            <span>Salin Data KAK</span>
          </button>
        </div>
      </div>

      {/* ── Banner Rujukan Histori Renja Eselon II Aktif ── */}
      {activeEselon2Histori && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-950 dark:text-indigo-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[0.68rem] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                Terhubung dengan Histori Renja Eselon II Aktif
              </div>
              <div className="text-sm font-bold text-[var(--text)]">
                {activeEselon2Histori.kdsatker || "Unit Kerja Terpilih"} ·{" "}
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  [{activeEselon2Histori.status_histori || "Pagu"} - {activeEselon2Histori.kode_sts_history || "D00"}]
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/eselon2/pilih-histori"
            className="px-3.5 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-50 flex items-center gap-1.5 transition-colors shrink-0"
          >
            <span>Ubah Histori Eselon II</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* ── Alert Success ── */}
      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>
              Histori KAK/TOR aktif berhasil diperbarui ke: <strong>{savedLabel}</strong>. Seluruh isian KAK dan monitoring kini terhubung ke versi ini.
            </span>
          </div>
          <button onClick={() => setIsSaved(false)} className="text-emerald-600 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {copySuccessAlert && (
        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 flex items-center justify-between text-xs text-teal-800 dark:text-teal-200 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-teal-600 shrink-0" />
            <span>{copySuccessAlert}</span>
          </div>
          <button onClick={() => setCopySuccessAlert(null)} className="text-teal-600 hover:text-teal-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Form Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <Layers className="h-4 w-4 text-[var(--primary)]" />
          <span>Konfigurasi Status Histori Dokumen KAK</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unit Kerja / Satker (Custom Responsive Anti-Glitch & Anti-Overflow Dropdown) */}
          <div className="space-y-1.5 md:col-span-2 relative" ref={satkerDropdownRef}>
            <label className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span>Pilih Unit Kerja / Satuan Kerja</span>
            </label>

            {/* Custom Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setIsSatkerDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 text-xs font-medium text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer text-left shadow-sm"
              aria-haspopup="listbox"
              aria-expanded={isSatkerDropdownOpen}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="shrink-0 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold font-mono text-[0.68rem] border border-indigo-200 dark:border-indigo-800">
                  {currentSatkerObj.singkatan}
                </span>
                <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                  {currentSatkerObj.nama}
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                  isSatkerDropdownOpen ? "rotate-180 text-[var(--primary)]" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu Popup (Bounded to screen width, prevents overflow) */}
            {isSatkerDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 w-full max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-xl border border-[var(--border)] shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                {/* Search Bar inside Dropdown */}
                <div className="p-2.5 border-b border-[var(--border)] bg-slate-50 dark:bg-slate-900/60">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={satkerSearch}
                      onChange={(e) => setSatkerSearch(e.target.value)}
                      placeholder="Ketik nama atau singkatan unit kerja..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-white dark:bg-slate-800 text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] placeholder:text-slate-400"
                      autoFocus
                    />
                    {satkerSearch && (
                      <button
                        type="button"
                        onClick={() => setSatkerSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* List items with max-height & custom scrollbar */}
                <div className="max-h-64 overflow-y-auto divide-y divide-[var(--border)]/50 text-xs">
                  {filteredSatkerList.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Unit kerja tidak ditemukan
                    </div>
                  ) : (
                    filteredSatkerList.map((s) => {
                      const isSelected = s.nama === selectedSatker;
                      return (
                        <button
                          key={s.singkatan}
                          type="button"
                          onClick={() => {
                            setSelectedSatker(s.nama);
                            setIsSatkerDropdownOpen(false);
                            setSatkerSearch("");
                          }}
                          className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? "bg-indigo-50/70 dark:bg-indigo-950/40 text-[var(--primary)] font-bold"
                              : "text-[var(--text)]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span
                              className={`shrink-0 px-2 py-0.5 rounded text-[0.65rem] font-mono font-bold ${
                                isSelected
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              {s.singkatan}
                            </span>
                            <span className="truncate leading-snug">
                              {s.nama}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Histori KAK */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text)]">
              Pilih Status Histori
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as StatusHistoriKak)}
              className="w-full truncate px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 text-xs font-medium text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
            >
              <optgroup label="Tahapan DIPA & Usulan Revisi (Aktif jika Eselon II Alokasi Anggaran E00-E99)">
                <option value="DIPA Awal" disabled={!isDipaDanRevisiAllowed}>
                  DIPA Awal (Kode B00) {!isDipaDanRevisiAllowed ? "— [Terkunci: Butuh Alokasi Anggaran E00-E99]" : ""}
                </option>
                <option value="Usulan Revisi DIPA" disabled={!isDipaDanRevisiAllowed}>
                  Usulan Revisi DIPA (Kode A01 s.d. A99) {!isDipaDanRevisiAllowed ? "— [Terkunci: Butuh Alokasi Anggaran E00-E99]" : ""}
                </option>
                <option value="Usulan Revisi Satker (POK)" disabled={!isDipaDanRevisiAllowed}>
                  Usulan Revisi Satker - POK (Kode C01 s.d. C99) {!isDipaDanRevisiAllowed ? "— [Terkunci: Butuh Alokasi Anggaran E00-E99]" : ""}
                </option>
              </optgroup>
              <optgroup label="Tahapan Pagu Renja (Wajib Selaras dengan Status Eselon II)">
                <option value="Pagu Indikatif" disabled={!isPaguIndikatifAllowed}>
                  Pagu Indikatif (Kode D00, D0a, dst.) {isPaguIndikatifAllowed ? "— [Selaras dengan Eselon II]" : "— [Terkunci: Eselon II tidak di tahap ini]"}
                </option>
                <option value="Pagu Anggaran" disabled={!isPaguAnggaranAllowed}>
                  Pagu Anggaran (Kode D01, D02, dst.) {isPaguAnggaranAllowed ? "— [Selaras dengan Eselon II]" : "— [Terkunci: Eselon II tidak di tahap ini]"}
                </option>
                <option value="Alokasi Anggaran" disabled={!isAlokasiAnggaranAllowed}>
                  Alokasi Anggaran (Kode E00, E01, dst.) {isAlokasiAnggaranAllowed ? "— [Selaras dengan Eselon II]" : "— [Terkunci: Eselon II tidak di tahap ini]"}
                </option>
              </optgroup>
            </select>
            <p className="text-[0.68rem] text-[var(--text-muted)]">
              {isDipaDanRevisiAllowed ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Status Eselon II berada pada Alokasi Anggaran ({activeEselon2Histori?.kode_sts_history || "E00"}). Anda dapat memilih Tahap DIPA/Revisi atau Alokasi Anggaran.
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  ⚠️ Status Eselon II saat ini adalah &quot;{e2Status}&quot; ({activeEselon2Histori?.kode_sts_history || "D00"}). Untuk Tahap Pagu Renja, pilihan dikunci agar selaras dengan Eselon II. Tahap DIPA & Revisi baru dapat dipilih jika Eselon II mencapai Alokasi Anggaran (E00–E99).
                </span>
              )}
            </p>
          </div>

          {/* Kodifikasi / Versi Revisi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text)]">
              Pilih Versi Kodifikasi / Nomor Revisi
            </label>
            <select
              value={selectedKodifikasi}
              onChange={(e) => setSelectedKodifikasi(e.target.value)}
              className="w-full truncate px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 text-xs font-mono font-bold text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
            >
              {kodifikasiOptions.map((opt) => (
                <option key={opt.kode} value={opt.kode}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[0.68rem] text-[var(--text-muted)]">
              Pilih nomor revisi spesifik yang sedang aktif dikerjakan.
            </p>
          </div>
        </div>

        {/* ── Summary Box & Bottom Action Buttons ── */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div>
            <div className="text-[var(--text-muted)] text-[0.7rem]">Kombinasi Histori KAK Terpilih:</div>
            <div className="text-sm font-bold text-[var(--text)] mt-0.5">
              {selectedSatker} · <span className="font-mono text-[var(--primary)]">[{selectedStatus} - {selectedKodifikasi}]</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/kak/isian"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--accent)] flex items-center gap-1.5 transition-colors"
            >
              <span>Buka Isian KAK</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/kak/monitoring"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--accent)] flex items-center gap-1.5 transition-colors"
            >
              <span>Monitoring KAK</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={handleSaveHistori}
              className="px-6 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Terapkan Histori</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal Salin Data KAK ── */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                <Copy className="h-4 w-4 text-[var(--primary)]" />
                <span>Salin Data Kerangka Acuan Kerja (TOR)</span>
              </h3>
              <button onClick={() => setIsCopyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[var(--text)]">Salin dari Unit Kerja:</label>
                <select
                  value={salinDariSatker || selectedSatker}
                  onChange={(e) => setSalinDariSatker(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 text-[var(--text)]"
                >
                  {SATKER_LIST_KAK.map((s) => (
                    <option key={s.singkatan} value={s.nama}>
                      {s.labelFull}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text)]">Tahapan Status Sumber:</label>
                  <select
                    value={salinDariStatus}
                    onChange={(e) => setSalinDariStatus(e.target.value as StatusHistoriKak)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 text-[var(--text)]"
                  >
                    <option value="DIPA Awal">DIPA Awal (B00)</option>
                    <option value="Usulan Revisi DIPA">Usulan Revisi DIPA (A01-A99)</option>
                    <option value="Usulan Revisi Satker (POK)">Usulan Revisi POK (C01-C99)</option>
                    <option value="Pagu Indikatif">Pagu Indikatif</option>
                    <option value="Pagu Anggaran">Pagu Anggaran</option>
                    <option value="Alokasi Anggaran">Alokasi Anggaran</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text)]">Versi Kodifikasi Sumber:</label>
                  <select
                    value={salinDariKodifikasi}
                    onChange={(e) => setSalinDariKodifikasi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 font-mono text-[var(--text)]"
                  >
                    {salinKodifikasiOptions.map((o) => (
                      <option key={o.kode} value={o.kode}>
                        {o.kode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[0.72rem] leading-relaxed">
                Menyalin data akan menimpa narasi gambaran umum, rincian tahapan pelaksanaan, jadwal bulanan, dan RAB pada target histori aktif <strong>[{selectedStatus} - {selectedKodifikasi}]</strong>.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold hover:bg-[var(--accent)]"
              >
                Batal
              </button>
              <button
                disabled={isCopying}
                onClick={handleExecuteCopy}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50"
              >
                {isCopying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{isCopying ? "Menyalin..." : "Proses Salin"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

