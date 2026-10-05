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
} from "lucide-react";

// ─── Tipe Data ────────────────────────────────────────────────────────────────
type UserRole = "Operator" | "Approver" | "Super Admin";
type FilterMode = "all" | "latest" | "pending" | "approved";
type StatusHistoriType = "Pagu Indikatif" | "Pagu Anggaran" | "Alokasi Anggaran";

export interface MonitoringItem {
  id: string;
  unit_kerja: string;
  owner: "Operator" | "Approver" | "BINCANG";
  kodifikasi: string; // e.g. "D00"
  tahap_status: StatusHistoriType;
  rev_ke: number; // e.g. 0 -> "Rev ke-0"
  status_histori_full: string; // e.g. "D00 - Pagu Indikatif - Rev ke-0"
  sumber: string; // e.g. "D00"
  tgl_revisi: string; // e.g. "05-10-2026 09:15"
  is_approved: boolean;
  tgl_approved?: string;
  approved_by?: string;
}

// ─── Mock Initial Data Monitoring ─────────────────────────────────────────────
const INITIAL_MONITORING_DATA: MonitoringItem[] = [
  {
    id: "hist_1",
    unit_kerja: "Deputi TEGAS",
    owner: "Operator",
    kodifikasi: "D00",
    tahap_status: "Pagu Indikatif",
    rev_ke: 0,
    status_histori_full: "D00 - Pagu Indikatif - Rev ke-0",
    sumber: "D00",
    tgl_revisi: "05-10-2026 08:30 WIB",
    is_approved: false,
  },
  {
    id: "hist_2",
    unit_kerja: "Deputi ASA",
    owner: "Approver",
    kodifikasi: "D01",
    tahap_status: "Pagu Anggaran",
    rev_ke: 1,
    status_histori_full: "D01 - Pagu Anggaran - Rev ke-1",
    sumber: "D00",
    tgl_revisi: "05-10-2026 09:45 WIB",
    is_approved: false,
  },
  {
    id: "hist_3",
    unit_kerja: "Deputi PENGASUH",
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
  },
  {
    id: "hist_4",
    unit_kerja: "Deputi TEGAS",
    owner: "Approver",
    kodifikasi: "D01",
    tahap_status: "Pagu Anggaran",
    rev_ke: 1,
    status_histori_full: "D01 - Pagu Anggaran - Rev ke-1",
    sumber: "D00",
    tgl_revisi: "05-10-2026 10:45 WIB",
    is_approved: false,
  },
  {
    id: "hist_5",
    unit_kerja: "Sekretariat Utama",
    owner: "Operator",
    kodifikasi: "E01",
    tahap_status: "Alokasi Anggaran",
    rev_ke: 1,
    status_histori_full: "E01 - Alokasi Anggaran - Rev ke-1",
    sumber: "E00",
    tgl_revisi: "05-10-2026 11:00 WIB",
    is_approved: false,
  },
];

const STORAGE_KEY_MONITORING = "renja_e1_monitoring_list";

export default function MonitoringSubmitApprovePage() {
  // State Role User (Operator / Approver / Super Admin)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("Approver");

  // State Data Monitoring
  const [dataList, setDataList] = useState<MonitoringItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MONITORING);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MONITORING_DATA;
  });

  // State Filters
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>("Semua");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modals state
  const [selectedPrintItem, setSelectedPrintItem] = useState<MonitoringItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MonitoringItem | null>(null);
  const [showRoleNotice, setShowRoleNotice] = useState<string | null>(null);
  const [noticeModalMessage, setNoticeModalMessage] = useState<string | null>(null);

  // Simpan dataList ke localStorage setiap kali ada perubahan
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MONITORING, JSON.stringify(dataList));
  }, [dataList]);

  // Cek apakah ada histori aktif yang baru saja dibuat di Pilih Histori
  useEffect(() => {
    try {
      const activeRaw = localStorage.getItem("renja_e1_active_histori");
      if (activeRaw) {
        const activeItem = JSON.parse(activeRaw);
        setDataList((prev) => {
          const exists = prev.some((d) => d.id === activeItem.id || d.kodifikasi === activeItem.kode_sts_history);
          if (!exists) {
            const newItem: MonitoringItem = {
              id: activeItem.id || `hist_${Date.now()}`,
              unit_kerja: activeItem.kdsatker || "Deputi TEGAS",
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

  // ── Info Header Teratas ───────────────────────────────────────────────────
  const tahunAnggaran = "2027";
  const latestRevisionItem = dataList[0] || INITIAL_MONITORING_DATA[0];
  const lastRevDate = latestRevisionItem?.tgl_revisi || "05 Oktober 2026";
  const activeTahapan = latestRevisionItem?.tahap_status || "Pagu Anggaran";

  // ── Handlers ─────────────────────────────────────────────────────────────
  // Operator: Kirim Data ke Approver
  function handleSendByOperator(id: string) {
    setDataList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated: MonitoringItem = {
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
          return updated;
        }
        return item;
      })
    );

    // Sinkronkan ke active histori di localStorage
    try {
      const activeRaw = localStorage.getItem("renja_e1_active_histori");
      if (activeRaw) {
        const activeItem = JSON.parse(activeRaw);
        if (activeItem.id === id || activeItem.kode_sts_history) {
          activeItem.owner = "Approver";
          localStorage.setItem("renja_e1_active_histori", JSON.stringify(activeItem));
        }
      }
    } catch (e) {
      console.error(e);
    }

    setNoticeModalMessage("Data berhasil dikirim ke Approver.");
  }

  // Approver / Super Admin: Setuju (Kirim ke BINCANG)
  function handleApproveByApprover(id: string) {
    if (currentUserRole === "Operator") {
      setShowRoleNotice("Aksi Persetujuan hanya dapat dilakukan oleh User Approval & Super Admin.");
      setTimeout(() => setShowRoleNotice(null), 4000);
      return;
    }

    setDataList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            owner: "BINCANG",
            is_approved: true,
            tgl_approved:
              new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }) + " WIB",
            approved_by: currentUserRole,
          };
        }
        return item;
      })
    );

    // Sinkronkan ke active histori di localStorage
    try {
      const activeRaw = localStorage.getItem("renja_e1_active_histori");
      if (activeRaw) {
        const activeItem = JSON.parse(activeRaw);
        if (activeItem.id === id || activeItem.kode_sts_history) {
          activeItem.is_approved = true;
          activeItem.owner = "BINCANG";
          localStorage.setItem("renja_e1_active_histori", JSON.stringify(activeItem));
        }
      }
    } catch (e) {
      console.error(e);
    }

    setNoticeModalMessage("Data telah disetujui dan berhasil dikirim ke BINCANG.");
  }

  // Approver / Super Admin: Tolak (Kembalikan ke Operator)
  function handleRejectByApprover(id: string) {
    if (currentUserRole === "Operator") {
      setShowRoleNotice("Aksi Penolakan hanya dapat dilakukan oleh User Approval & Super Admin.");
      setTimeout(() => setShowRoleNotice(null), 4000);
      return;
    }

    setDataList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            owner: "Operator",
            is_approved: false,
          };
        }
        return item;
      })
    );

    // Sinkronkan ke active histori di localStorage
    try {
      const activeRaw = localStorage.getItem("renja_e1_active_histori");
      if (activeRaw) {
        const activeItem = JSON.parse(activeRaw);
        if (activeItem.id === id || activeItem.kode_sts_history) {
          activeItem.is_approved = false;
          activeItem.owner = "Operator";
          localStorage.setItem("renja_e1_active_histori", JSON.stringify(activeItem));
        }
      }
    } catch (e) {
      console.error(e);
    }

    setNoticeModalMessage("Data ditolak dan dikembalikan ke Operator.");
  }

  function handleRequestDelete(item: MonitoringItem) {
    if (currentUserRole === "Operator") {
      setShowRoleNotice("Tombol Hapus hanya aktif untuk User Approval & Super Admin.");
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

  // ── Logic Filtering ────────────────────────────────────────────────────────
  const filteredData = dataList.filter((item) => {
    // Unit Kerja Filter
    if (selectedUnitFilter !== "Semua" && item.unit_kerja !== selectedUnitFilter) {
      return false;
    }
    // Search Filter
    if (
      searchTerm &&
      !item.unit_kerja.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.status_histori_full.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.owner.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    // Mode Filter
    if (filterMode === "approved") return item.is_approved;
    if (filterMode === "pending") return !item.is_approved;
    if (filterMode === "latest") {
      // Hanya ambil entry revisi paling akhir per Unit Kerja
      const highestForUnit = dataList
        .filter((d) => d.unit_kerja === item.unit_kerja)
        .sort((a, b) => b.rev_ke - a.rev_ke)[0];
      return highestForUnit?.id === item.id;
    }
    return true; // "all"
  });

  return (
    <div className="min-h-full p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Banner Notification for Operator restriction ── */}
      {showRoleNotice && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-sm font-semibold flex items-center justify-between shadow-md animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{showRoleNotice}</span>
          </div>
          <button onClick={() => setShowRoleNotice(null)} className="p-1 hover:bg-amber-200/50 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Top Bar: Title & User Role Switcher ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[var(--primary-bg)] flex items-center justify-center text-[var(--primary)] shrink-0 shadow-sm">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary text-[0.65rem] font-bold">RENJA ESELON I</span>
              <span className="text-xs text-[var(--text-muted)] font-mono">/eselon1/monitoring</span>
            </div>
            <h1 className="text-lg font-bold text-[var(--text)]">Monitoring Submit & Approve Data</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Pemantauan status histori pengajuan, persetujuan checklist, dan pencetakan hasil input Bab I & Bab II.
            </p>
          </div>
        </div>

        {/* Role Switcher Sandbox Toggle */}
        <div className="flex items-center gap-2 bg-[var(--accent)] p-1.5 rounded-xl border border-[var(--border)]">
          <span className="text-[0.68rem] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 flex items-center gap-1">
            <UserCheck className="h-3.5 w-3.5" />
            Simulasi Role:
          </span>
          {(["Operator", "Approver", "Super Admin"] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setCurrentUserRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentUserRole === r
                  ? r === "Operator"
                    ? "bg-blue-600 text-white shadow"
                    : r === "Approver"
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-purple-600 text-white shadow"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card)]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          1. INFORMASI PENTING TERATAS (INFO HEADER BARIS UTAMA)
         ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tahun Anggaran */}
        <div className="aksi-card p-4 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/20 via-[var(--card)] to-[var(--card)] dark:from-blue-950/20 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 font-bold text-sm">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[0.68rem] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
              Tahun Anggaran
            </span>
            <div className="text-base font-black text-[var(--text)] flex items-center gap-1.5">
              <span>{tahunAnggaran}</span>
              <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Unit Kerja Info */}
        <div className="aksi-card p-4 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/20 via-[var(--card)] to-[var(--card)] dark:from-emerald-950/20 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-sm">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[0.68rem] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
              Unit Kerja Renja
            </span>
            <div className="text-sm font-bold text-[var(--text)] truncate max-w-[170px]">
              {selectedUnitFilter === "Semua" ? "Seluruh Deputi / UK" : selectedUnitFilter}
            </div>
          </div>
        </div>

        {/* Card 3: Tahapan Status Histori */}
        <div className="aksi-card p-4 border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/20 via-[var(--card)] to-[var(--card)] dark:from-purple-950/20 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 font-bold text-sm">
            <History className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[0.68rem] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
              Tahapan Status Histori
            </span>
            <div className="text-sm font-bold text-purple-700 dark:text-purple-300">
              {activeTahapan}
            </div>
          </div>
        </div>

        {/* Card 4: Tanggal Revisi Terakhir */}
        <div className="aksi-card p-4 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/20 via-[var(--card)] to-[var(--card)] dark:from-amber-950/20 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 font-bold text-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[0.68rem] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
              Tanggal Revisi Terakhir
            </span>
            <div className="text-xs font-bold text-[var(--text)]">
              {lastRevDate}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          2. FILTER TAMPILAN & BARIS PENCARIAN
         ══════════════════════════════════════════════════════════════ */}
      <div className="aksi-card p-5 bg-[var(--card)] border border-[var(--border)] space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Radio Buttons Filter Mode */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Filter Tampilan:
            </span>
            {[
              { id: "all", label: "Seluruh Data", count: dataList.length },
              {
                id: "latest",
                label: "Data Usulan Terakhir",
                count: new Set(dataList.map((d) => d.unit_kerja)).size,
              },
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterMode === f.id
                    ? "bg-[var(--primary)] text-white shadow-sm ring-2 ring-[var(--primary)]/30"
                    : "bg-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[0.65rem] font-mono ${
                    filterMode === f.id
                      ? "bg-white/20 text-white"
                      : "bg-[var(--card)] text-[var(--primary)]"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Unit Kerja Dropdown & Search */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial">
              <select
                value={selectedUnitFilter}
                onChange={(e) => setSelectedUnitFilter(e.target.value)}
                className="w-full appearance-none bg-[var(--accent)] border border-[var(--border)] text-[var(--text)] text-xs rounded-xl px-3 py-2 pr-8 font-semibold cursor-pointer focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="Semua">Semua Unit Kerja</option>
                <option value="Deputi TEGAS">Deputi TEGAS</option>
                <option value="Deputi ASA">Deputi ASA</option>
                <option value="Deputi PENGASUH">Deputi PENGASUH</option>
                <option value="Sekretariat Utama">Sekretariat Utama</option>
              </select>
            </div>

            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Cari status / unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          3. TABEL MONITORING & SUBMIT DATA
         ══════════════════════════════════════════════════════════════ */}
      <div className="aksi-card overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="p-4 border-b border-[var(--border)] bg-[var(--accent)]/40 flex justify-between items-center">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text)] flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--primary)]" />
            Tabel Monitoring Submit & Approve ({filteredData.length} Dokumen)
          </h3>
          <span className="text-[0.68rem] font-semibold text-[var(--text-muted)]">
            Role Aktif: <strong className="text-[var(--primary)]">{currentUserRole}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--accent)] border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[0.65rem]">
                <th className="p-3 font-bold">Unit Kerja</th>
                <th className="p-3 font-bold">Owner</th>
                <th className="p-3 font-bold">Status Histori</th>
                <th className="p-3 font-bold text-center">Sumber</th>
                <th className="p-3 font-bold">Tanggal Revisi</th>
                <th className="p-3 font-bold text-center">
                  {currentUserRole === "Operator" ? "Kirim Data" : "Persetujuan (Tolak / Setuju)"}
                </th>
                <th className="p-3 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)] italic">
                    Tidak ada data histori pengajuan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[var(--accent)]/40 transition-colors group"
                  >
                    {/* 1. Unit Kerja */}
                    <td className="p-3 font-bold text-[var(--text)]">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-[var(--primary)] shrink-0" />
                        <span>{item.unit_kerja}</span>
                      </div>
                    </td>

                    {/* 2. Owner */}
                    <td className="p-3">
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

                    {/* 3. Status Histori */}
                    <td className="p-3">
                      <div className="font-semibold text-[var(--text)] leading-tight">
                        {item.status_histori_full}
                      </div>
                      <span className="text-[0.65rem] text-[var(--text-muted)] font-mono">
                        Tahap: {item.tahap_status}
                      </span>
                    </td>

                    {/* 4. Sumber */}
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-[var(--accent)] font-mono text-[0.7rem] font-bold text-[var(--primary)] border border-[var(--border)]">
                        {item.sumber}
                      </span>
                    </td>

                    {/* 5. Tanggal Revisi */}
                    <td className="p-3 text-[var(--text-muted)] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        <span>{item.tgl_revisi}</span>
                      </div>
                    </td>

                    {/* 6. Kolom Kirim Data (Operator) / Persetujuan Tolak & Setuju (Approver) */}
                    <td className="p-3 text-center">
                      {currentUserRole === "Operator" ? (
                        // Role OPERATOR: Tombol Kirim Data
                        item.owner === "Operator" ? (
                          <button
                            onClick={() => handleSendByOperator(item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-sm transition-all cursor-pointer"
                            title="Kirim data histori ke Approver"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Kirim ke Approver</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[0.68rem] font-bold bg-[var(--accent)] text-[var(--text-muted)] border border-[var(--border)]">
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                            <span>Sudah Dikirim ({item.owner})</span>
                          </span>
                        )
                      ) : (
                        // Role APPROVAL / SUPER ADMIN: Choice TOLAK atau SETUJU
                        item.owner === "BINCANG" || item.is_approved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[0.68rem] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Disetujui (BINCANG)</span>
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 justify-center">
                            {/* Tombol TOLAK */}
                            <button
                              onClick={() => handleRejectByApprover(item.id)}
                              className="px-2.5 py-1 rounded-xl bg-red-100 text-red-700 hover:bg-red-600 hover:text-white dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-800 border border-red-300 dark:border-red-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                              title="Tolak & kembalikan ke Operator"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>TOLAK</span>
                            </button>

                            {/* Tombol SETUJU */}
                            <button
                              onClick={() => handleApproveByApprover(item.id)}
                              className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                              title="Setuju & kirim data ke BINCANG"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>SETUJU</span>
                            </button>
                          </div>
                        )
                      )}
                    </td>

                    {/* 7. Tombol Aksi: Cetak, Persetujuan, Hapus */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Tombol Cetak */}
                        <button
                          onClick={() => setSelectedPrintItem(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
                          title="Cetak Dokumen Hasil Input Bab I & Bab II"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Cetak</span>
                        </button>

                        {/* Tombol Hapus */}
                        <button
                          onClick={() => handleRequestDelete(item)}
                          disabled={currentUserRole === "Operator"}
                          title={
                            currentUserRole === "Operator"
                              ? "Tombol Hapus hanya aktif untuk User Approval & Super Admin"
                              : "Hapus data histori pengajuan"
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            currentUserRole === "Operator"
                              ? "opacity-40 cursor-not-allowed bg-[var(--accent)] text-[var(--text-muted)]"
                              : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900 cursor-pointer"
                          }`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          4. MODAL PRINT PREVIEW (HASIL INPUT BAB I & BAB II + HALAMAN JUDUL)
         ══════════════════════════════════════════════════════════════ */}
      {selectedPrintItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col my-auto overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--border)] bg-[var(--accent)] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="font-bold text-sm text-[var(--text)]">
                  Cetak Dokumen Renja Eselon I ({selectedPrintItem.status_histori_full})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[var(--primary)] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print / Export PDF</span>
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
            <div className="p-8 space-y-8 overflow-y-auto flex-1 font-serif text-[var(--text)] bg-white dark:bg-slate-900 leading-relaxed text-sm print:p-0">
              {/* ──────────────── HALAMAN JUDUL (COVER PAGE) ──────────────── */}
              <div className="border-4 border-double border-slate-700 dark:border-slate-300 p-8 text-center space-y-6 min-h-[450px] flex flex-col justify-between rounded-xl bg-slate-50 dark:bg-slate-950">
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-blue-900 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md font-sans">
                    PPATK
                  </div>
                  <span className="text-xs font-sans uppercase font-bold tracking-widest text-blue-900 dark:text-blue-300 block">
                    PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN
                  </span>
                </div>

                <div className="space-y-2 py-6">
                  <h1 className="text-xl font-bold uppercase tracking-wider font-sans text-slate-900 dark:text-white">
                    DOKUMEN RENCANA KERJA (RENJA) ESELON I
                  </h1>
                  <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 font-sans">
                    TAHUN ANGGARAN {tahunAnggaran}
                  </h2>
                  <p className="text-xs font-sans text-slate-600 dark:text-slate-400 pt-2 font-medium">
                    STATUS HISTORI: {selectedPrintItem.status_histori_full}
                  </p>
                </div>

                <div className="border-t border-slate-300 dark:border-slate-700 pt-4 font-sans text-xs space-y-1">
                  <p className="font-bold">{selectedPrintItem.unit_kerja}</p>
                  <p className="text-slate-500">Jakarta, {selectedPrintItem.tgl_revisi}</p>
                </div>
              </div>

              {/* ──────────────── ISIAN BAB I ──────────────── */}
              <div className="space-y-4 font-sans border-t border-[var(--border)] pt-6">
                <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-1">
                  <h2 className="text-base font-bold uppercase tracking-wide">
                    BAB I · PENDAHULUAN & CAPAIAN KINERJA
                  </h2>
                </div>

                {/* Section A */}
                <div className="space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wide text-blue-900 dark:text-blue-300">
                    A. Gambaran Umum Sasaran & Program Kerja Eselon I
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal text-justify">
                    Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK) sebagai lembaga sentral pencegahan dan pemberantasan TPPU, TPPT, serta PPSPM terus berkomitmen untuk memperkuat tata kelola internal serta kebermanfaatan produk intelijen keuangan nasional.
                  </p>
                </div>

                {/* Section B Table */}
                <div className="space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wide text-blue-900 dark:text-blue-300">
                    B. Capaian Kinerja Tahun Sebelumnya
                  </h3>
                  <table className="w-full text-xs border border-slate-300 dark:border-slate-700 text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                      <tr>
                        <th className="p-2 border border-slate-300 dark:border-slate-700">Sasaran Program</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700">Indikator Kinerja Program (IKP)</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700 text-center">Target</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700 text-center">Realisasi</th>
                        <th className="p-2 border border-slate-300 dark:border-slate-700 text-center">Capaian (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border border-slate-300 dark:border-slate-700">SP 01 - Kebermanfaatan Data Pelaporan PPATK</td>
                        <td className="p-2 border border-slate-300 dark:border-slate-700">Indeks Kebermanfaatan Data Pelaporan</td>
                        <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">4.0</td>
                        <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">4.2</td>
                        <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-bold text-emerald-600">105.0%</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-300 dark:border-slate-700">SP 02 - Produk Intelijen Keuangan (PIK)</td>
                        <td className="p-2 border border-slate-300 dark:border-slate-700">Persentase Produk Intelijen Penerimaan Negara</td>
                        <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">30%</td>
                        <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">34%</td>
                        <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-bold text-emerald-600">113.3%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ──────────────── ISIAN BAB II ──────────────── */}
              <div className="space-y-4 font-sans border-t border-[var(--border)] pt-6">
                <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-1">
                  <h2 className="text-base font-bold uppercase tracking-wide">
                    BAB II · RENCANA PROGRAM KERJA & ANGGARAN
                  </h2>
                </div>

                {/* Program Kerja Lintas Unit */}
                <div className="space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wide text-blue-900 dark:text-blue-300">
                    A. Program Kerja Lintas Unit Kerja
                  </h3>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-1 text-xs">
                    <div className="font-bold">1. Program Kerja Lintas Unit #1: Sinergi Intelijen Keuangan Bersama</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Penguatan analisis bersama lintas kedeputian dalam penanganan kasus prioritas nasional.
                    </p>
                  </div>
                </div>

                {/* Program Kerja Unit Kerja */}
                <div className="space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wide text-blue-900 dark:text-blue-300">
                    B. Program Kerja Unit Kerja ({selectedPrintItem.unit_kerja})
                  </h3>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-1 text-xs">
                    <div className="font-bold">1. Digitalisasi Layanan Analisis dan Pelaporan PPATK</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Pengembangan platform automasi berbasis AI untuk percepatan diseminasi produk intelijen keuangan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--accent)] flex justify-end gap-3">
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
                <span>Cetak Dokumen Lengkap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          5. MODAL KONFIRMASI HAPUS
         ══════════════════════════════════════════════════════════════ */}
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
      {/* ══════════════════════════════════════════════════════════════
          6. MODAL POP-UP NOTIFIKASI PENGIRIMAN KE BINCANG
         ══════════════════════════════════════════════════════════════ */}
      {approvalNoticeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setApprovalNoticeModal(null)}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shadow-sm">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-base font-bold text-[var(--text)]">
              Persetujuan Berhasil
            </h3>
            <p className="text-sm text-[var(--text)] font-semibold leading-relaxed">
              Data telah disetujui dan berhasil dikirim ke BINCANG.
            </p>
            <button
              onClick={() => setApprovalNoticeModal(null)}
              className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-xs hover:opacity-90 transition-opacity shadow-md cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
