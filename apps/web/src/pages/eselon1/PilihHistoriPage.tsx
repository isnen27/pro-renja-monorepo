import { useState, useEffect } from "react";
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
} from "lucide-react";

// ─── Tipe data ────────────────────────────────────────────────────────────────
type StatusHistori = "Pagu Indikatif" | "Pagu Anggaran" | "Alokasi Anggaran";
type UnitKerja = "Deputi TEGAS" | "Deputi ASA" | "Deputi PENGASUH" | "SETIA";

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

function getMonitoringList(): MonitoringStorageItem[] {
  try {
    const raw = localStorage.getItem("renja_e1_monitoring_list");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [
    {
      id: "hist_1",
      unit_kerja: "Deputi TEGAS",
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

// ─── Helper: generate kodifikasi ─────────────────────────────────────────────
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
  // Alokasi Anggaran: E00 - E20
  return Array.from({ length: 21 }, (_, i) => {
    const kode = "E" + String(i).padStart(2, "0");
    return { kode, label: "Alokasi Anggaran - " + kode, status, rev_ke: i, sumber: "D01" };
  });
}

function getNextHistori(
  entries: HistoriEntry[],
  currentKode: string
): HistoriEntry | null {
  const idx = entries.findIndex((e) => e.kode === currentKode);
  if (idx === -1 || idx + 1 >= entries.length) return null;
  return entries[idx + 1];
}

// ─── Helper: Hitung Histori Sinkron dengan Monitoring ────────────────────────
function calculateHistoriSynced(
  unit: string,
  status: StatusHistori
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
    const nextEntry = (lastApprovedIdx !== -1 && lastApprovedIdx + 1 < kodifikasiList.length)
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
      approvedNotice: `Histori '${status} - ${lastApproved.kodifikasi}' untuk ${unit} telah disetujui (Disetujui & Proses Kemenkeu). Sistem otomatis membuat histori revisi baru: '${historiTujuan.label}' (Rev ke-${nextRevKe}).`,
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

  const defaultEntry = kodifikasiList[0];
  const historiTujuan: HistoriEntry = {
    kode: defaultEntry.kode,
    label: `${status} - ${defaultEntry.kode}`,
    status,
    rev_ke: 0,
    sumber: defaultEntry.kode,
  };

  return {
    historiAwalLabel: `${status} - ${defaultEntry.kode}`,
    historiTujuan,
  };
}

// ─── Komponen utama ───────────────────────────────────────────────────────────
export default function PilihHistoriPage() {
  const [unitKerja, setUnitKerja] = useState<UnitKerja | "">("");
  const [statusHistori, setStatusHistori] = useState<StatusHistori | "">("");
  const [historiAwal, setHistoriAwal] = useState<string>("");

  const [historyLog, setHistoryLog] = useState<HistoriEntry[]>([
    { kode: "D00", label: "Pagu Indikatif - D00", status: "Pagu Indikatif", rev_ke: 0, sumber: "D00" },
  ]);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [pendingCreatedEntry, setPendingCreatedEntry] = useState<HistoriEntry | null>(null);

  // State Migrasi Data
  const [isMigrated, setIsMigrated] = useState(false);
  const [migrationNotice, setMigrationNotice] = useState("");

  const tanggalPengajuan = "04 Oktober 2026";

  const lastCreatedPaguIndikatif =
    [...historyLog].reverse().find((h) => h.status === "Pagu Indikatif")?.label ||
    "Pagu Indikatif - D00";

  const lastCreatedPaguAnggaran =
    [...historyLog].reverse().find((h) => h.status === "Pagu Anggaran")?.label ||
    "Pagu Anggaran - D01";

  const revisiTerakhirHistori = historyLog[historyLog.length - 1].label;

  // Hitung Histori Sinkron dengan Monitoring
  const syncedCalculation = (unitKerja && statusHistori)
    ? calculateHistoriSynced(unitKerja, statusHistori as StatusHistori)
    : null;

  const historiAwalDisplay = syncedCalculation?.historiAwalLabel || (statusHistori ? `${statusHistori} - D00` : "");
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

  // Reset semua saat unit kerja berubah
  useEffect(() => {
    setStatusHistori("");
    setHistoriAwal("");
    setIsMigrated(false);
    setMigrationNotice("");
  }, [unitKerja]);

  const lastSourceForMigration =
    statusHistori === "Pagu Anggaran"
      ? lastCreatedPaguIndikatif
      : lastCreatedPaguAnggaran;

  // ── Handler Migrasi Data ──────────────────────────────────────────────────
  function handleMigrasi() {
    if (statusHistori === "Pagu Anggaran") {
      setHistoriAwal("PREV_STAGE");
      setMigrationNotice(
        "Seluruh data dari histori terakhir (" +
          lastCreatedPaguIndikatif +
          ") berhasil di-copy ke draft Pagu Anggaran - D01."
      );
      setIsMigrated(true);
    } else if (statusHistori === "Alokasi Anggaran") {
      setHistoriAwal("PREV_STAGE");
      setMigrationNotice(
        "Seluruh data dari histori terakhir (" +
          lastCreatedPaguAnggaran +
          ") berhasil di-copy ke draft Alokasi Anggaran - E00."
      );
      setIsMigrated(true);
    }
  }

  // ── Handler BATAL ──────────────────────────────────────────────────────────
  function handleBatal() {
    setUnitKerja("");
    setStatusHistori("");
    setHistoriAwal("");
    setIsMigrated(false);
    setMigrationNotice("");
  }

  // ── Handler OK ────────────────────────────────────────────────────────────
  function handleOk() {
    if (!unitKerja || !statusHistori || !historiTujuan) return;

    setPendingCreatedEntry(historiTujuan);

    let msg = 'Anda telah membuat histori "' + historiTujuan.label + '" (Rev ke-' + historiTujuan.rev_ke + ') untuk ' + unitKerja + '.';
    if (isMigrated) {
      msg +=
        ' dengan meng-copy seluruh data dari histori tahap sebelumnya (' +
        lastSourceForMigration +
        ').';
    }

    setPopupMessage(msg);
    setShowPopup(true);
  }

  function handleClosePopup() {
    if (pendingCreatedEntry && unitKerja) {
      const newLog = [...historyLog, pendingCreatedEntry];
      setHistoryLog(newLog);

      // 1. Simpan ke active histori
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
      localStorage.setItem("renja_e1_active_histori", JSON.stringify(activePayload));

      // 2. Sinkronkan ke daftar monitoring di localStorage
      const newMonitoringItem: MonitoringStorageItem = {
        id: activePayload.id,
        unit_kerja: unitKerja,
        owner: "Operator",
        kodifikasi: pendingCreatedEntry.kode,
        tahap_status: pendingCreatedEntry.status,
        rev_ke: pendingCreatedEntry.rev_ke,
        status_histori_full: `${pendingCreatedEntry.kode} - ${pendingCreatedEntry.status} - Rev ke-${pendingCreatedEntry.rev_ke}`,
        sumber: pendingCreatedEntry.sumber,
        tgl_revisi: new Date().toLocaleDateString("id-ID", {
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
      localStorage.setItem("renja_e1_monitoring_list", JSON.stringify([newMonitoringItem, ...filteredMonitoring]));

      setPendingCreatedEntry(null);
    }
    setShowPopup(false);
    handleBatal();
  }

  const isFormValid = !!unitKerja && !!statusHistori;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[var(--primary-bg)] flex items-center justify-center flex-shrink-0">
          <History className="h-5 w-5 text-[var(--primary)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Pilih Histori</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Renja Eselon I — Manajemen Histori Dokumen
          </p>
        </div>
      </div>

      {/* Card Form */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        {/* ── Baris 1: Revisi Terakhir ── */}
        <div className="flex items-stretch border-b border-[var(--border)]">
          <div className="w-48 flex-shrink-0 bg-[var(--accent)] px-4 py-4 flex items-center">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
              Revisi Terakhir
            </span>
          </div>
          <div className="flex-1 px-4 py-4 flex items-center gap-6">
            <div>
              <p className="text-[0.7rem] text-[var(--text-muted)] mb-0.5">
                Status & Kodifikasi Histori Terakhir
              </p>
              <p className="text-sm font-semibold text-[var(--primary)]">
                {revisiTerakhirHistori}
              </p>
            </div>
            <div className="w-px h-8 bg-[var(--border)]" />
            <div>
              <p className="text-[0.7rem] text-[var(--text-muted)] mb-0.5">
                Tanggal Pengajuan
              </p>
              <p className="text-sm font-semibold text-[var(--text)]">
                {tanggalPengajuan}
              </p>
            </div>
          </div>
        </div>

        {/* ── Baris 2: Unit Kerja ── */}
        <div className="flex items-stretch border-b border-[var(--border)]">
          <div className="w-48 flex-shrink-0 bg-[var(--accent)] px-4 py-4 flex items-center">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
              Unit Kerja
            </span>
          </div>
          <div className="flex-1 px-4 py-3 flex items-center">
            <div className="relative w-full">
              <select
                value={unitKerja}
                onChange={(e) => setUnitKerja(e.target.value as UnitKerja)}
                className="w-full appearance-none bg-[var(--accent)] border border-[var(--border)] text-[var(--text)] text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all cursor-pointer"
              >
                <option value="">— Pilih Unit Kerja —</option>
                <option value="Deputi TEGAS">Deputi TEGAS</option>
                <option value="Deputi ASA">Deputi ASA</option>
                <option value="Deputi PENGASUH">Deputi PENGASUH</option>
                <option value="SETIA">SETIA</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Baris 3: Status Histori ── */}
        <div className="flex items-stretch border-b border-[var(--border)]">
          <div className="w-48 flex-shrink-0 bg-[var(--accent)] px-4 py-4 flex items-start">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
              Status Histori
            </span>
          </div>
          <div className="flex-1 px-4 py-3 flex flex-col gap-2">
            {(
              [
                "Pagu Indikatif",
                "Pagu Anggaran",
                "Alokasi Anggaran",
              ] as StatusHistori[]
            ).map((st) => (
              <label
                key={st}
                className={
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all " +
                  (statusHistori === st
                    ? "border-[var(--primary)] bg-[var(--primary-bg)]"
                    : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--accent)]")
                }
              >
                <input
                  type="radio"
                  name="statusHistori"
                  value={st}
                  checked={statusHistori === st}
                  onChange={() => setStatusHistori(st)}
                  className="accent-[var(--primary)]"
                  disabled={!unitKerja}
                />
                <div className="flex-1">
                  <p
                    className={
                      "text-sm font-medium " +
                      (statusHistori === st
                        ? "text-[var(--primary)]"
                        : "text-[var(--text)]")
                    }
                  >
                    {st}
                  </p>
                  <p className="text-[0.65rem] text-[var(--text-muted)]">
                    {st === "Pagu Indikatif" && "Kodifikasi: D00 – D0z"}
                    {st === "Pagu Anggaran" && "Kodifikasi: D01 – D99 (Min. D01–D20)"}
                    {st === "Alokasi Anggaran" && "Kodifikasi: E00 – E99 (Min. E00–E20)"}
                  </p>
                </div>
              </label>
            ))}
            {!unitKerja && (
              <p className="text-[0.65rem] text-[var(--text-muted)] italic pl-1">
                Pilih Unit Kerja terlebih dahulu
              </p>
            )}
          </div>
        </div>

        {/* ── Baris Tambahan: Migrasi Data (jika Pagu Anggaran / Alokasi Anggaran) ── */}
        {(statusHistori === "Pagu Anggaran" || statusHistori === "Alokasi Anggaran") && (
          <div className="flex items-stretch border-b border-[var(--border)] bg-blue-50/40 dark:bg-blue-950/20">
            <div className="w-48 flex-shrink-0 bg-blue-100/50 dark:bg-blue-900/30 px-4 py-4 flex items-center">
              <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wide flex items-center gap-1.5">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Migrasi Data
              </span>
            </div>
            <div className="flex-1 px-4 py-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-[var(--text)]">
                    Migrasi dari Status Histori Tahap Sebelumnya (
                    <span className="font-semibold text-[var(--primary)]">
                      {statusHistori === "Pagu Anggaran"
                        ? "Pagu Indikatif"
                        : "Pagu Anggaran"}
                    </span>
                    )
                  </p>
                  <p className="text-[0.68rem] text-[var(--text-muted)] mt-0.5">
                    Copy data histori{" "}
                    <span className="font-semibold text-[var(--text)]">
                      {statusHistori === "Pagu Anggaran"
                        ? "Pagu Indikatif"
                        : "Pagu Anggaran"}
                    </span>{" "}
                    terakhir yang dibuat user:{" "}
                    <span className="font-mono font-bold text-[var(--primary)]">
                      {lastSourceForMigration}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleMigrasi}
                  className={
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex-shrink-0 " +
                    (isMigrated
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-[var(--primary)] text-white hover:opacity-90 shadow-sm")
                  }
                >
                  {isMigrated ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Data Berhasil Dimigrasi
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Jalankan Migrasi Data
                    </>
                  )}
                </button>
              </div>

              {migrationNotice && (
                <div className="mt-1 px-3 py-2 rounded-md bg-green-100/80 dark:bg-green-900/40 border border-green-200 dark:border-green-800 flex items-center gap-2 text-xs text-green-800 dark:text-green-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span>{migrationNotice}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Baris 4: Histori Awal ── */}
        <div className="flex items-stretch border-b border-[var(--border)]">
          <div className="w-48 flex-shrink-0 bg-[var(--accent)] px-4 py-4 flex items-center">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
              Histori Awal
            </span>
          </div>
          <div className="flex-1 px-4 py-3 flex items-center">
            {statusHistori ? (
              <div className="relative w-full">
                <div className="flex items-center justify-between w-full bg-[var(--accent)] border border-[var(--border)] text-[var(--text)] text-sm rounded-lg px-3 py-2 opacity-90">
                  <span className="font-medium text-[var(--primary)]">{historiAwalDisplay}</span>
                  <Lock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] italic">
                Pilih Status Histori terlebih dahulu
              </p>
            )}
          </div>
        </div>

        {/* ── Baris 5: Histori Tujuan ── */}
        <div className="flex items-stretch border-b border-[var(--border)]">
          <div className="w-48 flex-shrink-0 bg-[var(--accent)] px-4 py-4 flex items-center">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
              Histori Tujuan
            </span>
          </div>
          <div className="flex-1 px-4 py-4 flex items-center gap-2">
            {historiTujuan ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary-bg)] border border-[var(--primary)] text-[var(--primary)] text-sm font-semibold">
                  <RefreshCw className="h-3.5 w-3.5" />
                  {historiTujuan.label}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  (Dibuat otomatis oleh sistem)
                </span>
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)] italic">
                {unitKerja && statusHistori
                  ? "Pilihan histori sedang diproses..."
                  : "Akan otomatis terisi setelah Unit Kerja & Status Histori dipilih"}
              </p>
            )}
          </div>
        </div>

        {/* Callout Notice jika status histori sebelumnya sudah disetujui */}
        {approvedNotice && (
          <div className="p-4 bg-amber-50/90 dark:bg-amber-950/40 border-t border-b border-amber-300 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-900 dark:text-amber-300">Status Persetujuan Ditemukan:</p>
              <p className="leading-relaxed">{approvedNotice}</p>
            </div>
          </div>
        )}

        {/* ── Tombol OK & BATAL ── */}
        <div className="flex items-center justify-end gap-3 px-4 py-4 bg-[var(--accent)]">
          <button
            onClick={handleBatal}
            className="flex items-center gap-2 px-5 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-all cursor-pointer"
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
              " flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all"
            }
          >
            <CheckCircle2 className="h-4 w-4" />
            OK
          </button>
        </div>
      </div>

      {/* ── Pop-up Konfirmasi ── */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleClosePopup}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
            </div>
            <h3 className="text-center text-base font-bold text-[var(--text)] mb-2">
              Histori Berhasil Dibuat
            </h3>
            <p className="text-center text-sm text-[var(--text-muted)] leading-relaxed mb-5">
              {popupMessage}
            </p>
            <button
              onClick={handleClosePopup}
              className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
