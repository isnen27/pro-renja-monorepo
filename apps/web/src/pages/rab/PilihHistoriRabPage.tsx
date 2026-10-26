import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  History,
  CheckCircle2,
  X,
  Copy,
  Building2,
  Layers,
  Lock,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  Check,
  Search,
} from "lucide-react";
import unitKerjaData from "../../data/unitKerjaData.json";

export type StatusHistoriRab =
  | "Pagu Indikatif"
  | "Pagu Anggaran"
  | "Alokasi Anggaran"
  | "DIPA Awal"
  | "Usulan Revisi DIPA"
  | "Usulan Revisi Satker (POK)"
  | "Angka Dasar";

export type UserRole = "Operator" | "Approver" | "BINCANG" | "Super Admin";

export interface HistoriEntryRab {
  kode: string;
  label: string;
  status: StatusHistoriRab;
  rev_ke: number;
  sumber: string;
}

const SATKER_LIST_RAB = unitKerjaData.map((u) => ({
  singkatan: u.singkatan,
  nama: u.nama,
  labelFull: `${u.singkatan} — ${u.nama}`,
}));

export function buildKodifikasiListRab(status: StatusHistoriRab): HistoriEntryRab[] {
  if (status === "Angka Dasar") {
    // G00 s.d. G99 (Khusus BINCANG & Super Admin)
    return Array.from({ length: 100 }, (_, i) => {
      const numStr = String(i).padStart(2, "0");
      const kode = "G" + numStr;
      return {
        kode,
        label: `Angka Dasar - ${kode}`,
        status,
        rev_ke: i,
        sumber: i === 0 ? "G00" : `G${String(i - 1).padStart(2, "0")}`,
      };
    });
  }
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

export default function PilihHistoriRabPage() {
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("renja_e2_user_role");
      if (saved && ["Operator", "Approver", "BINCANG", "Super Admin"].includes(saved)) {
        return saved as UserRole;
      }
    } catch (e) {}
    return "BINCANG";
  });

  useEffect(() => {
    try {
      localStorage.setItem("renja_e2_user_role", activeRole);
      window.dispatchEvent(new Event("renja_role_changed"));
    } catch (e) {}
  }, [activeRole]);

  const isPrivileged = activeRole === "BINCANG" || activeRole === "Super Admin";

  // Cek histori KAK aktif
  const [activeKakHistori, setActiveKakHistori] = useState<{
    kdsatker?: string;
    kode_sts_history?: string;
    status_histori?: string;
    label?: string;
    rev_ke?: number;
    sumber?: string;
  } | null>(() => {
    try {
      const raw = localStorage.getItem("kak_active_histori");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  });

  const [selectedSatker, setSelectedSatker] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("rab_active_histori");
      if (saved) {
        const p = JSON.parse(saved);
        if (p.kdsatker) return p.kdsatker;
      }
      const kak = localStorage.getItem("kak_active_histori");
      if (kak) {
        const p = JSON.parse(kak);
        if (p.kdsatker) return p.kdsatker;
      }
    } catch (e) {}
    return "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme";
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
    if (!satkerSearch.trim()) return SATKER_LIST_RAB;
    const q = satkerSearch.toLowerCase();
    return SATKER_LIST_RAB.filter(
      (s) =>
        s.nama.toLowerCase().includes(q) ||
        s.singkatan.toLowerCase().includes(q) ||
        s.labelFull.toLowerCase().includes(q)
    );
  }, [satkerSearch]);

  const currentSatkerObj = useMemo(() => {
    return (
      SATKER_LIST_RAB.find((s) => s.nama === selectedSatker) || {
        singkatan: "Satker",
        nama: selectedSatker,
        labelFull: selectedSatker,
      }
    );
  }, [selectedSatker]);

  const [selectedStatus, setSelectedStatus] = useState<StatusHistoriRab>(() => {
    try {
      const saved = localStorage.getItem("rab_active_histori");
      if (saved) {
        const p = JSON.parse(saved);
        if (p.status_histori) return p.status_histori as StatusHistoriRab;
      }
      const kak = localStorage.getItem("kak_active_histori");
      if (kak) {
        const p = JSON.parse(kak);
        if (p.status_histori) return p.status_histori as StatusHistoriRab;
      }
    } catch (e) {}
    return "DIPA Awal";
  });

  const [selectedKodifikasi, setSelectedKodifikasi] = useState<string>("B00");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savedLabel, setSavedLabel] = useState<string>("");

  // Sinkronisasi otomatis untuk Operator & Approver: mengikuti KAK terakhir
  useEffect(() => {
    if (!isPrivileged) {
      try {
        const kakRaw = localStorage.getItem("kak_active_histori");
        if (kakRaw) {
          const kak = JSON.parse(kakRaw);
          setActiveKakHistori(kak);
          if (kak.kdsatker) setSelectedSatker(kak.kdsatker);
          if (kak.status_histori) setSelectedStatus(kak.status_histori as StatusHistoriRab);
          if (kak.kode_sts_history) setSelectedKodifikasi(kak.kode_sts_history);
        }
      } catch (e) {}
    }
  }, [isPrivileged]);

  const kodifikasiOptions = buildKodifikasiListRab(selectedStatus);

  useEffect(() => {
    const options = buildKodifikasiListRab(selectedStatus);
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
      is_angka_dasar: selectedStatus === "Angka Dasar",
      saved_at: new Date().toISOString(),
    };

    localStorage.setItem("rab_active_histori", JSON.stringify(dataToSave));
    setSavedLabel(`${selectedSatker} (${selectedStatus} - ${entry.kode})`);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
  }

  // Jika user Operator/Approver, berikan proteksi info bahwa menu ini khusus BINCANG & Super Admin
  if (!isPrivileged) {
    return (
      <div className="min-h-full p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
              <span>Penganggaran & Biaya</span>
              <span>/</span>
              <span>Rencana Anggaran Biaya (RAB)</span>
              <span>/</span>
              <span className="text-[var(--primary)] font-semibold">Pilih Histori</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
              <History className="h-6 w-6 text-[var(--primary)]" />
              <span>Pilih Histori RAB</span>
            </h1>
          </div>
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
        </div>

        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-base font-bold text-[var(--text)]">
              Akses Dibatasi untuk Role BINCANG & Super Admin
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Submenu <strong>Pilih Histori RAB</strong> hanya dapat diakses secara manual oleh Biro Perencanaan & Keuangan (BINCANG) dan Super Admin untuk mengelola tahapan penganggaran serta menerbitkan kodifikasi <strong>Angka Dasar (G00 s.d. G99)</strong>.
            </p>
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs border border-amber-200 text-left space-y-1">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-600" /> Histori Otomatis untuk Peran {activeRole}:
              </span>
              <p className="text-[0.72rem] text-amber-800 dark:text-amber-300">
                Untuk akun Operator dan Approval, data RAB Anda secara otomatis mengikuti histori terakhir pada menu <strong>Kerangka Acuan Kerja (TOR)</strong>:
                <br />
                <strong className="text-slate-900 dark:text-white font-mono mt-1 inline-block">
                  {activeKakHistori ? `${activeKakHistori.kdsatker} [${activeKakHistori.label || activeKakHistori.kode_sts_history}]` : "DIPA Awal - B00"}
                </strong>
              </p>
            </div>
          </div>
          <div className="pt-2">
            <Link
              to="/rab/isian"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow hover:opacity-90 transition-opacity"
            >
              <span>Lanjut ke Isian RAB</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
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
            <span>Rencana Anggaran Biaya (RAB)</span>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Pilih Histori</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <History className="h-6 w-6 text-[var(--primary)]" />
            <span>Pilih Histori Rencana Anggaran Biaya (RAB)</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Dikelola oleh <strong>{activeRole}</strong>: Atur unit kerja, status revisi DIPA/POK, atau terbitkan <strong>Angka Dasar (G00 s.d. G99)</strong> mandiri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
        </div>
      </div>

      {/* ── Banner Info Angka Dasar & KAK ── */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-950 dark:text-indigo-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[0.68rem] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
              Kewenangan Khusus BINCANG & Super Admin
            </div>
            <div className="text-sm font-bold text-[var(--text)]">
              Dapat menetapkan kodifikasi <strong>Angka Dasar (G00 - G99)</strong> tanpa perlu membuat histori Kerangka Acuan Kerja (TOR) terlebih dahulu.
            </div>
          </div>
        </div>
        <div className="text-right text-[0.72rem] text-indigo-700 dark:text-indigo-300">
          Sinkronisasi KAK Aktif: <strong className="font-mono">{activeKakHistori ? activeKakHistori.kode_sts_history : "B00"}</strong>
        </div>
      </div>

      {/* ── Alert Success ── */}
      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>
              Histori RAB aktif berhasil ditetapkan ke: <strong>{savedLabel}</strong>. Seluruh kalkulator dan rincian akun RAB kini terhubung ke histori ini.
            </span>
          </div>
          <button onClick={() => setIsSaved(false)} className="text-emerald-600 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Form Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <Layers className="h-4 w-4 text-[var(--primary)]" />
          <span>Konfigurasi Status Histori Dokumen RAB</span>
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

          {/* Status Histori RAB */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text)]">
              Pilih Status Histori
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as StatusHistoriRab)}
              className="w-full truncate px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 text-xs font-medium text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
            >
              <optgroup label="Khusus BINCANG & Super Admin (Mandiri tanpa KAK)">
                <option value="Angka Dasar">Angka Dasar (G00 s.d. G99) — Input Langsung RAB</option>
              </optgroup>
              <optgroup label="Tahapan DIPA & Usulan Revisi Satker">
                <option value="DIPA Awal">DIPA Awal (Kode B00)</option>
                <option value="Usulan Revisi DIPA">Usulan Revisi DIPA (Kode A01 s.d. A99)</option>
                <option value="Usulan Revisi Satker (POK)">Usulan Revisi Satker - POK (Kode C01 s.d. C99)</option>
              </optgroup>
              <optgroup label="Tahapan Pagu Renja">
                <option value="Pagu Indikatif">Pagu Indikatif (Kode D00, D0a, dst.)</option>
                <option value="Pagu Anggaran">Pagu Anggaran (Kode D01, D02, dst.)</option>
                <option value="Alokasi Anggaran">Alokasi Anggaran (Kode E00, E01, dst.)</option>
              </optgroup>
            </select>
            {selectedStatus === "Angka Dasar" && (
              <p className="text-[0.68rem] text-emerald-600 dark:text-emerald-400 font-semibold">
                ★ Jalur Angka Dasar aktif: Anda dapat langsung mengisi form RAB tanpa perlu menyusun dokumen KAK sebelumnya.
              </p>
            )}
          </div>

          {/* Kodifikasi / Versi Revisi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text)]">
              Pilih Kodifikasi Versi ({selectedStatus})
            </label>
            <select
              value={selectedKodifikasi}
              onChange={(e) => setSelectedKodifikasi(e.target.value)}
              className="w-full truncate px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 text-xs font-mono font-medium text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
            >
              {kodifikasiOptions.map((opt) => (
                <option key={opt.kode} value={opt.kode}>
                  {opt.label} [Sumber: {opt.sumber}]
                </option>
              ))}
            </select>
            <p className="text-[0.68rem] text-[var(--text-muted)]">
              Tersedia {kodifikasiOptions.length} pilihan versi kodifikasi untuk status {selectedStatus}.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[var(--text-muted)]">
            Status Terpilih: <strong className="text-[var(--text)]">{selectedSatker}</strong> ·{" "}
            <span className="font-mono text-[var(--primary)] font-bold">{selectedStatus} - {selectedKodifikasi}</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSaveHistori}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Terapkan Histori RAB
            </button>
            <Link
              to="/rab/isian"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-slate-800 text-xs font-bold text-[var(--text)] hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Isian RAB</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

