import { useState, useEffect } from "react";
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
} from "lucide-react";

import unitKerjaData from "../../data/unitKerjaData.json";

// ─── Tipe data ────────────────────────────────────────────────────────────────
type StatusHistori = "Pagu Indikatif" | "Pagu Anggaran" | "Alokasi Anggaran";
type UserRole = "Operator" | "Approver" | "BINCANG" | "Super Admin";

export interface HistoriEntry {
  kode: string;
  label: string;
  status: StatusHistori;
  rev_ke: number;
  sumber: string;
}

export interface MonitoringStorageItem {
  id: string;
  unit_kerja: string;
  owner: "Operator" | "Approver" | "BINCANG";
  kodifikasi: string;
  tahap_status: StatusHistori;
  rev_ke: number;
  status_histori_full: string;
  sumber: string;
  tgl_revisi: string;
  is_approved: boolean;
}

// Data Satker Eselon II dari Referensi Unit Kerja PPATK
const SATKER_LIST_E2 = unitKerjaData.map((u) => ({
  singkatan: u.singkatan,
  nama: u.nama,
  labelFull: `${u.singkatan} — ${u.nama}`,
}));

function getMonitoringList(): MonitoringStorageItem[] {
  try {
    const raw = localStorage.getItem("renja_e2_monitoring_list");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [
    {
      id: "hist_e2_1",
      unit_kerja: "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
      owner: "BINCANG",
      kodifikasi: "D00",
      tahap_status: "Pagu Indikatif",
      rev_ke: 0,
      status_histori_full: "D00 - Pagu Indikatif - Rev ke-0",
      sumber: "D00",
      tgl_revisi: "05-10-2026 08:30 WIB",
      is_approved: true,
    },
  ];
}

function buildKodifikasiList(status: StatusHistori): HistoriEntry[] {
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

export interface Eselon1ActiveHistori {
  kode_sts_history: string;
  status_histori: StatusHistori;
  label: string;
  rev_ke?: number;
  unit_kerja?: string;
}

export function getEselon1UnitForEselon2Satker(satkerNama: string): string {
  const unitObj = unitKerjaData.find((u) => u.nama === satkerNama || u.singkatan === satkerNama);
  if (!unitObj) return "SETIA";

  if (unitObj.subcluster?.includes("TEGAS")) return "Deputi TEGAS";
  if (unitObj.subcluster?.includes("ASA")) return "Deputi ASA";
  if (unitObj.subcluster?.includes("PENGASUH")) return "Deputi PENGASUH";

  // Cluster Biro, Inspektorat & Pusat Pendukung (BINCANG, BERMAKNA, BIRU, PEKA, BERMITRA, PATIH, LOGIS)
  // menginduk pada Sekretariat Utama (SETIA)
  return "SETIA";
}

function getEselon1ActiveHistori(targetE1Unit: string = "SETIA"): Eselon1ActiveHistori {
  try {
    const raw = localStorage.getItem("renja_e1_active_histori");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.status_histori && parsed.kode_sts_history && (!parsed.unit_kerja || parsed.unit_kerja === targetE1Unit)) {
        return {
          kode_sts_history: parsed.kode_sts_history,
          status_histori: parsed.status_histori as StatusHistori,
          label: parsed.label || `${parsed.status_histori} - ${parsed.kode_sts_history}`,
          rev_ke: parsed.rev_ke ?? 0,
          unit_kerja: targetE1Unit,
        };
      }
    }
  } catch (e) {
    console.error(e);
  }

  try {
    const rawList = localStorage.getItem("renja_e1_monitoring_list");
    if (rawList) {
      const list = JSON.parse(rawList);
      if (Array.isArray(list) && list.length > 0) {
        const matched = list.find((item: any) => item.unit_kerja === targetE1Unit) || list[0];
        return {
          kode_sts_history: matched.kodifikasi || "D01",
          status_histori: (matched.tahap_status as StatusHistori) || "Pagu Anggaran",
          label: `${matched.tahap_status || "Pagu Anggaran"} - ${matched.kodifikasi || "D01"}`,
          rev_ke: matched.rev_ke ?? 0,
          unit_kerja: targetE1Unit,
        };
      }
    }
  } catch (e) {
    console.error(e);
  }

  return {
    kode_sts_history: "D01",
    status_histori: "Pagu Anggaran",
    label: "Pagu Anggaran - D01",
    rev_ke: 0,
    unit_kerja: targetE1Unit,
  };
}

function calculateHistoriSynced(
  unit: string,
  status: StatusHistori,
  eselon1Active: Eselon1ActiveHistori
): { historiAwalLabel: string; historiTujuan: HistoriEntry; approvedNotice?: string } {
  const monitoringList = getMonitoringList();

  const existingForUnitAndStatus = monitoringList.filter(
    (m) => m.unit_kerja === unit && m.tahap_status === status
  );

  const approvedItems = existingForUnitAndStatus.filter((m) => m.is_approved);
  const kodifikasiList = buildKodifikasiList(status);

  if (approvedItems.length > 0) {
    const lastApproved = [...approvedItems].sort((a, b) => b.rev_ke - a.rev_ke)[0];
    const lastApprovedIdx = kodifikasiList.findIndex((k) => k.kode === lastApproved.kodifikasi);
    const nextEntry =
      lastApprovedIdx !== -1 && lastApprovedIdx + 1 < kodifikasiList.length
        ? kodifikasiList[lastApprovedIdx + 1]
        : kodifikasiList[kodifikasiList.length - 1];

    const nextRevKe = lastApproved.rev_ke + 1;
    const historiTujuan: HistoriEntry = {
      kode: nextEntry.kode,
      label: `${status} - ${nextEntry.kode}`,
      status,
      rev_ke: nextRevKe,
      sumber: lastApproved.kodifikasi,
    };

    return {
      historiAwalLabel: `${status} - ${lastApproved.kodifikasi}`,
      historiTujuan,
      approvedNotice: `Histori '${status} - ${lastApproved.kodifikasi}' untuk Satker ini telah disetujui (Disetujui & Proses Kemenkeu). Sistem otomatis membuat histori revisi baru: '${historiTujuan.label}' (Rev ke-${nextRevKe}).`,
    };
  }

  if (existingForUnitAndStatus.length > 0) {
    const latestExisting = [...existingForUnitAndStatus].sort((a, b) => b.rev_ke - a.rev_ke)[0];
    const historiTujuan: HistoriEntry = {
      kode: latestExisting.kodifikasi,
      label: `${status} - ${latestExisting.kodifikasi}`,
      status,
      rev_ke: latestExisting.rev_ke,
      sumber: latestExisting.sumber || "D00",
    };

    return {
      historiAwalLabel: `${status} - ${latestExisting.sumber || latestExisting.kodifikasi}`,
      historiTujuan,
    };
  }

  let targetEntry = kodifikasiList[0];
  if (status === eselon1Active.status_histori) {
    const matchedE1Kode = kodifikasiList.find((k) => k.kode === eselon1Active.kode_sts_history);
    if (matchedE1Kode) {
      targetEntry = matchedE1Kode;
    }
  }

  const historiTujuan: HistoriEntry = {
    kode: targetEntry.kode,
    label: `${status} - ${targetEntry.kode}`,
    status,
    rev_ke: targetEntry.rev_ke || 0,
    sumber: targetEntry.kode,
  };

  return {
    historiAwalLabel: `${status} - ${targetEntry.kode}`,
    historiTujuan,
  };
}

export default function PilihHistoriEselon2Page() {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("renja_e2_user_role");
      if (saved && ["Operator", "Approver", "BINCANG", "Super Admin"].includes(saved)) {
        return saved as UserRole;
      }
    } catch (e) {}
    return "Operator";
  });

  const [unitKerja, setUnitKerja] = useState<string>("Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme");
  const parentE1Unit = getEselon1UnitForEselon2Satker(unitKerja);
  const eselon1Active = getEselon1ActiveHistori(parentE1Unit);
  const [statusHistori, setStatusHistori] = useState<StatusHistori | "">(
    () => eselon1Active.status_histori
  );
  const [historiAwal, setHistoriAwal] = useState<string>("");
  const [isMigrated, setIsMigrated] = useState<boolean>(false);
  const [migrationNotice, setMigrationNotice] = useState<string>("");

  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string>("");
  const [pendingCreatedEntry, setPendingCreatedEntry] = useState<HistoriEntry | null>(null);

  const [historyLog, setHistoryLog] = useState<HistoriEntry[]>([
    { kode: "D00", label: "Pagu Indikatif - D00", status: "Pagu Indikatif", rev_ke: 0, sumber: "D00" },
  ]);

  const tanggalPengajuan = "05 Oktober 2026";
  const revisiTerakhirHistori = historyLog[historyLog.length - 1].label;

  const isStageAllowed = !statusHistori || statusHistori === eselon1Active.status_histori;

  const syncedCalculation =
    unitKerja && statusHistori
      ? calculateHistoriSynced(unitKerja, statusHistori as StatusHistori, eselon1Active)
      : null;

  const historiAwalDisplay =
    syncedCalculation?.historiAwalLabel || (statusHistori ? `${statusHistori} - D00` : "");
  const historiTujuan = syncedCalculation?.historiTujuan || null;
  const approvedNotice = syncedCalculation?.approvedNotice;

  useEffect(() => {
    if (statusHistori) {
      setHistoriAwal(historiAwalDisplay);
    } else {
      setHistoriAwal("");
    }
    setIsMigrated(false);
    setMigrationNotice("");
  }, [statusHistori, unitKerja, historiAwalDisplay]);

  function handleBatal() {
    setStatusHistori("");
    setHistoriAwal("");
    setIsMigrated(false);
    setMigrationNotice("");
  }

  function handleMigrasi() {
    if (!statusHistori || !unitKerja) return;
    setIsMigrated(true);
    const sourceStatus = statusHistori === "Pagu Anggaran" ? "Pagu Indikatif" : "Pagu Anggaran";
    setMigrationNotice(
      `Migrasi data dari ${sourceStatus} ke ${statusHistori} untuk ${unitKerja} BERHASIL dijalankan.`
    );
  }

  function handleOk() {
    if (!unitKerja || !statusHistori || !historiTujuan) return;

    setPendingCreatedEntry(historiTujuan);
    const msg = `Status histori aktif Renja Eselon II telah ditetapkan ke: "${historiTujuan.label}" untuk ${unitKerja}.`;
    setPopupMessage(msg);
    setShowPopup(true);
  }

  function handleClosePopup() {
    if (pendingCreatedEntry && unitKerja) {
      const activePayload = {
        id: pendingCreatedEntry.kode + "_" + unitKerja + "_" + Date.now(),
        kdsatker: unitKerja,
        kode_sts_history: pendingCreatedEntry.kode,
        status_histori: pendingCreatedEntry.status,
        rev_ke: pendingCreatedEntry.rev_ke,
        sumber: pendingCreatedEntry.sumber,
        label: pendingCreatedEntry.label,
        tgl_pengajuan: new Date().toISOString(),
        is_approved: false,
        owner: "Operator",
      };
      localStorage.setItem("renja_e2_active_histori", JSON.stringify(activePayload));

      const newMonitoringItem: MonitoringStorageItem = {
        id: activePayload.id,
        unit_kerja: unitKerja,
        owner: "Operator",
        kodifikasi: pendingCreatedEntry.kode,
        tahap_status: pendingCreatedEntry.status,
        rev_ke: pendingCreatedEntry.rev_ke,
        status_histori_full: `${pendingCreatedEntry.kode} - ${pendingCreatedEntry.status} - Rev ke-${pendingCreatedEntry.rev_ke}`,
        sumber: pendingCreatedEntry.sumber,
        tgl_revisi:
          new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) + " WIB",
        is_approved: false,
      };

      const currentMonitoring = getMonitoringList();
      const filteredMonitoring = currentMonitoring.filter((m) => m.id !== newMonitoringItem.id);
      localStorage.setItem(
        "renja_e2_monitoring_list",
        JSON.stringify([newMonitoringItem, ...filteredMonitoring])
      );

      setPendingCreatedEntry(null);
    }
    setShowPopup(false);
    handleBatal();
  }

  const isFormValid = !!unitKerja && !!statusHistori && isStageAllowed;

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Role Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--card)] border border-[var(--border)] p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center flex-shrink-0 font-bold">
            <History className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]">Pilih Histori Renja Eselon II</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Manajemen Histori Dokumen Satker &amp; Penetapan Status Active Eselon II
            </p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-1.5 bg-[var(--accent)] p-1.5 rounded-xl border border-[var(--border)] self-start sm:self-auto">
          <span className="text-[0.68rem] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 hidden md:inline">Role:</span>
          {(["Operator", "Approver", "BINCANG", "Super Admin"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setCurrentUserRole(r)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                currentUserRole === r
                  ? "bg-[var(--primary)] text-white shadow-sm font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card)]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Status Info & Guide (col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Informasional Status Terakhir */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
                <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                  Informasi Histori Terakhir
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="p-3.5 rounded-xl bg-[var(--accent)] border border-[var(--border)] space-y-1">
                <p className="text-[0.68rem] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  Revisi Terakhir
                </p>
                <p className="text-sm font-extrabold text-[var(--primary)]">
                  {revisiTerakhirHistori}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--accent)] border border-[var(--border)] space-y-1">
                <p className="text-[0.68rem] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  Tanggal Pengajuan
                </p>
                <p className="text-xs font-bold text-[var(--text)]">
                  {tanggalPengajuan}
                </p>
              </div>
            </div>

            {unitKerja && (
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-1 text-xs">
                <span className="text-blue-900 dark:text-blue-200 font-medium block">Satuan Kerja Terpilih:</span>
                <span className="font-bold text-[var(--primary)] block leading-snug">{unitKerja}</span>
              </div>
            )}
          </div>

          {/* Card 2: Histori Aktif Renja Eselon I (Acuan) */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[var(--primary)]" />
                <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                  Histori Aktif Renja Eselon I (Acuan)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Induk: {parentE1Unit}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-1.5">
              <div className="flex items-center justify-between text-[0.68rem] text-[var(--text-muted)] font-medium">
                <span>Unit Eselon I Induk:</span>
                <span className="font-bold text-[var(--primary)]">{parentE1Unit}</span>
              </div>
              <div className="flex items-center justify-between text-[0.68rem] text-[var(--text-muted)] font-medium">
                <span>Tahap Active Eselon I:</span>
                <span className="font-bold text-[var(--primary)]">{eselon1Active.status_histori}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text)] pt-1 border-t border-blue-200/60 dark:border-blue-900/60">
                <span>Kodifikasi Active:</span>
                <span className="text-[var(--primary)] bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-700">
                  {eselon1Active.label}
                </span>
              </div>
            </div>
            <p className="text-[0.68rem] text-[var(--text-muted)] leading-relaxed">
              Unit Kerja cluster Biro, Inspektorat &amp; Pusat Pendukung menginduk pada <strong>Sekretariat Utama (SETIA)</strong>.
            </p>
          </div>

          {/* Card 3: Panduan & Aturan Kodifikasi */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border)] pb-2.5">
              <FileText className="h-4 w-4 text-[var(--primary)]" />
              Aturan Kodifikasi Histori Eselon II
            </h3>
            <div className="space-y-2.5 text-xs text-[var(--text-muted)]">
              <div className="p-2.5 rounded-xl bg-[var(--accent)] border border-[var(--border)] flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text)]">Pagu Indikatif</p>
                  <p className="text-[0.7rem] text-[var(--text-muted)]">Kodifikasi otomatis: D00 – D0z</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--accent)] border border-[var(--border)] flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text)]">Pagu Anggaran</p>
                  <p className="text-[0.7rem] text-[var(--text-muted)]">Kodifikasi otomatis: D01 – D99 (Min. D01–D20)</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--accent)] border border-[var(--border)] flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text)]">Alokasi Anggaran</p>
                  <p className="text-[0.7rem] text-[var(--text-muted)]">Kodifikasi otomatis: E00 – E99 (Min. E00–E20)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Form Transaksi Pilih Histori (col-span-7) */}
        <div className="lg:col-span-7 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="border-b border-[var(--border)] pb-4">
            <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
              <History className="h-5 w-5 text-[var(--primary)]" />
              Form Penetapan Status Histori Satker
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Pilih Satuan Kerja Eselon II dan Status Histori untuk menetapkan revisi aktif.
            </p>
          </div>

          {/* Field 1: Satuan Kerja Eselon II */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider">
              1. Pilih Satuan Kerja / Unit Kerja Eselon II <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={unitKerja}
                onChange={(e) => setUnitKerja(e.target.value)}
                className="w-full appearance-none bg-[var(--accent)] border border-[var(--border)] text-[var(--text)] text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all cursor-pointer font-semibold shadow-xs"
              >
                <option value="">— Pilih Satuan Kerja / Unit Kerja Eselon II —</option>
                {SATKER_LIST_E2.map((u) => (
                  <option key={u.singkatan} value={u.nama}>
                    {u.labelFull}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>

          {/* Field 2: Status Histori Cards */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider">
              2. Pilih Status Histori <span className="text-red-500">*</span>
            </label>

            {!unitKerja ? (
              <div className="p-4 rounded-xl bg-[var(--accent)] border border-dashed border-[var(--border)] text-center text-xs text-[var(--text-muted)] italic">
                Pilih Satuan Kerja terlebih dahulu untuk memilih status histori
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    "Pagu Indikatif",
                    "Pagu Anggaran",
                    "Alokasi Anggaran",
                  ] as StatusHistori[]
                ).map((st) => {
                  const isSelected = statusHistori === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusHistori(st)}
                      className={
                        "p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 " +
                        (isSelected
                          ? "border-[var(--primary)] bg-[var(--primary-bg)] shadow-sm ring-1 ring-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--accent)] hover:border-[var(--primary)] hover:bg-[var(--card)]")
                      }
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={
                            "text-xs font-bold " +
                            (isSelected ? "text-[var(--primary)]" : "text-[var(--text)]")
                          }
                        >
                          {st}
                        </span>
                        <div
                          className={
                            "w-4 h-4 rounded-full border flex items-center justify-center " +
                            (isSelected
                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                              : "border-[var(--text-muted)]")
                          }
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[0.65rem] text-[var(--text-muted)] leading-tight">
                        {st === "Pagu Indikatif" && "Kodifikasi D00 – D0z"}
                        {st === "Pagu Anggaran" && "Kodifikasi D01 – D20"}
                        {st === "Alokasi Anggaran" && "Kodifikasi E00 – E20"}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stage Mismatch Notice */}
          {!isStageAllowed && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Tahap Histori Tidak Sesuai dengan Eselon I</span>
              </div>
              <p className="leading-relaxed">
                Tahap yang Anda pilih (<strong>{statusHistori}</strong>) tidak sesuai dengan tahap aktif pada Renja Eselon I (<strong>{eselon1Active.status_histori} - {eselon1Active.kode_sts_history}</strong>).
                Revisi Eselon II hanya dapat dibuat pada tahap yang sama dengan Eselon I.
              </p>
              <button
                type="button"
                onClick={() => setStatusHistori(eselon1Active.status_histori)}
                className="mt-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Samakan Tahap dengan Eselon I ({eselon1Active.status_histori})
              </button>
            </div>
          )}

          {/* Section 3: Migrasi Data (jika Pagu Anggaran / Alokasi Anggaran) */}
          {(statusHistori === "Pagu Anggaran" || statusHistori === "Alokasi Anggaran") && (
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wide flex items-center gap-1.5">
                  <ArrowRightLeft className="h-4 w-4" />
                  Fitur Migrasi Data Histori
                </span>
                <span className="text-[0.68rem] text-[var(--text-muted)]">
                  Tahap: <strong className="text-[var(--primary)]">{statusHistori === "Pagu Anggaran" ? "Pagu Indikatif" : "Pagu Anggaran"}</strong>
                </span>
              </div>
              <p className="text-xs text-[var(--text)] leading-relaxed">
                Salin seluruh data histori dari tahap{" "}
                <strong className="text-[var(--primary)]">
                  {statusHistori === "Pagu Anggaran" ? "Pagu Indikatif" : "Pagu Anggaran"}
                </strong>{" "}
                terakhir ke status histori baru ini.
              </p>
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleMigrasi}
                  className={
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-2 " +
                    (isMigrated
                      ? "bg-emerald-600 text-white"
                      : "bg-[var(--primary)] text-white hover:opacity-90")
                  }
                >
                  {isMigrated ? (
                    <>
                      <Check className="h-4 w-4" />
                      Migrasi Berhasil Dijalankan
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Jalankan Migrasi Data
                    </>
                  )}
                </button>
              </div>

              {migrationNotice && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-100/90 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{migrationNotice}</span>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Pratinjau Alur Histori (Histori Awal -> Histori Tujuan) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider">
              3. Pratinjau Transformasi Histori
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Histori Awal Box */}
              <div className="p-3.5 rounded-xl bg-[var(--accent)] border border-[var(--border)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Histori Awal
                  </span>
                  <Lock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                </div>
                <p className="text-xs font-bold text-[var(--primary)] truncate">
                  {statusHistori ? historiAwalDisplay : "— Belum Dipilih —"}
                </p>
              </div>

              {/* Histori Tujuan Box */}
              <div className="p-3.5 rounded-xl bg-[var(--primary-bg)] border border-[var(--primary)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-bold text-[var(--primary)] uppercase tracking-wide flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Histori Tujuan
                  </span>
                  <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-[var(--primary)] text-white font-semibold">
                    Sistem
                  </span>
                </div>
                <p className="text-xs font-bold text-[var(--primary)] truncate">
                  {historiTujuan ? historiTujuan.label : "— Menunggu Pilihan —"}
                </p>
              </div>
            </div>
          </div>

          {/* Callout Notice jika histori sebelumnya sudah approved */}
          {approvedNotice && (
            <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
              <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-900 dark:text-amber-300">Persetujuan Ditemukan:</p>
                <p className="leading-relaxed">{approvedNotice}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              onClick={handleBatal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--accent)] hover:text-[var(--text)] transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
              BATAL
            </button>
            <button
              onClick={handleOk}
              disabled={!isFormValid || !historiTujuan}
              className={
                (isFormValid && historiTujuan
                  ? "bg-[var(--primary)] text-white hover:opacity-90 cursor-pointer shadow-md"
                  : "bg-[var(--accent)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed") +
                " flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
              }
            >
              <CheckCircle2 className="h-4 w-4" />
              OK, TETAPKAN HISTORI
            </button>
          </div>
        </div>
      </div>

      {/* ── Pop-up Konfirmasi ── */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleClosePopup}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-bold text-base text-[var(--text)]">Konfirmasi Status Histori</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{popupMessage}</p>
            </div>
            <button
              onClick={handleClosePopup}
              className="w-full py-2.5 bg-[var(--primary)] text-white font-semibold text-xs rounded-xl hover:opacity-90 transition-opacity shadow cursor-pointer"
            >
              OK, Lanjutkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
