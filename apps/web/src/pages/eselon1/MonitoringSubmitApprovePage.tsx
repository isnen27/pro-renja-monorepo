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
} from "lucide-react";

import { mockPejabat } from "../../data/ppatkData";

// ─── Helper Penandatangan Data Pejabat ────────────────────────────────────────
function getJabatanDefault(unitKerja: string) {
  const u = unitKerja.toUpperCase();
  if (u.includes("PENGASUH")) return "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan";
  if (u.includes("TEGAS")) return "Deputi Bidang Pemberantasan";
  if (u.includes("ASA")) return "Deputi Bidang Analisis dan Pemeriksaan";
  if (u.includes("SEKRETARIAT") || u.includes("SETIA") || u.includes("SU")) return "Sekretaris Utama";
  if (u.includes("PATIH") || u.includes("PUSDIKLAT")) return "Kepala Pusat Pendidikan dan Pelatihan APU PPT";
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

  return {
    nama: "Data Pejabat tidak ditemukan",
    jabatan: getJabatanDefault(unitKerja),
  };
}

// ─── Tipe Data ────────────────────────────────────────────────────────────────
type UserRole = "Operator" | "Approver" | "BINCANG" | "Super Admin";
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
  is_doc_uploaded?: boolean; // TTD digital draft Renja Eselon I uploaded
  signed_doc_name?: string; // File name of uploaded TTD digital doc
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
    is_doc_uploaded: false,
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
    is_doc_uploaded: true,
    signed_doc_name: "Draft_Renja_Deputi_ASA_D01_Signed.pdf",
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
    is_doc_uploaded: true,
    signed_doc_name: "Renja_PENGASUH_E00_TTD_Digital.pdf",
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
    is_doc_uploaded: false,
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
    is_doc_uploaded: false,
  },
];

const STORAGE_KEY_MONITORING = "renja_e1_monitoring_list";

export default function MonitoringSubmitApprovePage() {
  // State Role User (Operator / Approver / BINCANG / Super Admin)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("renja_user_role");
      if (saved && ["Operator", "Approver", "BINCANG", "Super Admin"].includes(saved)) {
        return saved as UserRole;
      }
    } catch (e) {}
    return "Approver";
  });

  useEffect(() => {
    try {
      localStorage.setItem("renja_user_role", currentUserRole);
    } catch (e) {}
  }, [currentUserRole]);

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
  const [uploadingDocItem, setUploadingDocItem] = useState<MonitoringItem | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>("");
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

  // Handler untuk mengunduh ulang dokumen TTE (Operator, BINCANG, Super Admin)
  function handleDownloadSignedDoc(item: MonitoringItem) {
    if (!item.is_doc_uploaded) return;

    const fileName =
      item.signed_doc_name ||
      `Draft_Renja_${item.unit_kerja.replace(/\s+/g, "_")}_${item.kodifikasi}_Signed.pdf`;

    const content = `[DOKUMEN DRAFT RENJA ESELON I TTD DIGITAL]\nUnit Kerja: ${item.unit_kerja}\nStatus Histori: ${item.status_histori_full}\nTanggal Revisi: ${item.tgl_revisi}\nNama File: ${fileName}\n\nDokumen ini telah resmi ditandatangani secara elektronik (TTE) oleh Pejabat Penandatangan PPATK.`;
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
      setShowRoleNotice("Aksi Persetujuan hanya dapat dilakukan oleh User Approval, BINCANG, & Super Admin.");
      setTimeout(() => setShowRoleNotice(null), 4000);
      return;
    }

    const targetItem = dataList.find((d) => d.id === id);
    if (targetItem && !targetItem.is_doc_uploaded) {
      setNoticeModalMessage(
        "Persetujuan Gagal! Dokumen draft Renja Eselon I yang telah ditandatangani secara elektronik (TTD Digital) WAJIB diunggah pada kolom Aksi sebelum data dikirim ke BINCANG."
      );
      return;
    }

    setDataList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            owner: "BINCANG",
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
          activeItem.owner = "BINCANG";
          localStorage.setItem("renja_e1_active_histori", JSON.stringify(activeItem));
        }
      }
    } catch (e) {
      console.error(e);
    }

    setNoticeModalMessage("Data telah disetujui Approver dan dikirim ke BINCANG.");
  }

  // Approver / Super Admin: Tolak (Kembalikan ke Operator)
  function handleRejectByApprover(id: string) {
    if (currentUserRole === "Operator") {
      setShowRoleNotice("Aksi Penolakan hanya dapat dilakukan oleh User Approval, BINCANG, & Super Admin.");
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

  // BINCANG / Super Admin: Setuju (Disetujui & Proses Kemenkeu)
  function handleApproveByBincang(id: string) {
    if (currentUserRole === "Operator" || currentUserRole === "Approver") {
      setShowRoleNotice("Aksi Persetujuan Akhir hanya dapat dilakukan oleh User BINCANG & Super Admin.");
      setTimeout(() => setShowRoleNotice(null), 4000);
      return;
    }

    const targetItem = dataList.find((d) => d.id === id);
    if (targetItem && !targetItem.is_doc_uploaded) {
      setNoticeModalMessage(
        "Persetujuan Akhir Gagal! Dokumen draft Renja Eselon I TTD Digital WAJIB diunggah pada kolom Aksi terlebih dahulu."
      );
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

    setNoticeModalMessage("Data telah disetujui BINCANG dan diproses ke Kemenkeu.");
  }

  // BINCANG / Super Admin: Tolak (Kembalikan ke Approver)
  function handleRejectByBincang(id: string) {
    if (currentUserRole === "Operator" || currentUserRole === "Approver") {
      setShowRoleNotice("Aksi Penolakan BINCANG hanya dapat dilakukan oleh User BINCANG & Super Admin.");
      setTimeout(() => setShowRoleNotice(null), 4000);
      return;
    }

    setDataList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            owner: "Approver",
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
          activeItem.owner = "Approver";
          localStorage.setItem("renja_e1_active_histori", JSON.stringify(activeItem));
        }
      }
    } catch (e) {
      console.error(e);
    }

    setNoticeModalMessage("Data ditolak oleh BINCANG dan dikembalikan ke Approver.");
  }

  function handleRequestDelete(item: MonitoringItem) {
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
          <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 shadow-sm font-bold">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary text-[0.65rem] font-bold">RENJA ESELON I</span>
              <span className="text-xs text-[var(--text-muted)] font-mono">/eselon1/monitoring</span>
            </div>
            <h1 className="text-lg font-bold text-[var(--text)]">Monitoring Submit & Approve Data Eselon I</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Pemantauan status histori, persetujuan checklist, dan pencetakan hasil Renja Satker Eselon I.
            </p>
          </div>
        </div>

        {/* Role Switcher Sandbox Toggle */}
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
              placeholder="Cari Unit Kerja Eselon I..."
              className="text-xs bg-[var(--accent)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text)] w-full lg:w-64"
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
                <th className="p-3 font-bold">Unit Kerja Eselon I</th>
                <th className="p-3 font-bold">Owner</th>
                <th className="p-3 font-bold">Status Histori</th>
                <th className="p-3 font-bold text-center">Sumber</th>
                <th className="p-3 font-bold">Tanggal Revisi</th>
                <th className="p-3 font-bold text-center whitespace-nowrap">AKSI</th>
                <th className="p-3 font-bold text-center whitespace-nowrap">Persetujuan</th>
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
                    className="hover:bg-[var(--accent)]/30"
                  >
                    {/* 1. Unit Kerja */}
                    <td className="p-3 font-bold text-[var(--text)] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-[var(--primary)] shrink-0" />
                        <span>{item.unit_kerja}</span>
                      </div>
                    </td>

                    {/* 2. Owner */}
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

                    {/* 3. Status Histori */}
                    <td className="p-3 whitespace-nowrap font-semibold">{item.status_histori_full}</td>

                    {/* 4. Sumber */}
                    <td className="p-3 text-center font-mono font-bold text-indigo-700">{item.sumber}</td>

                    {/* 5. Tanggal Revisi */}
                    <td className="p-3 text-slate-500 whitespace-nowrap">{item.tgl_revisi}</td>

                    {/* 6. Kolom AKSI (Cetak, Upload Dokumen TTD, Hapus) */}
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
                                    `Draft_Renja_${item.unit_kerja.replace(/\s+/g, "_")}_${item.kodifikasi}_Signed.pdf`
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
                                  `Draft_Renja_${item.unit_kerja.replace(/\s+/g, "_")}_${item.kodifikasi}_Signed.pdf`
                                );
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              title="Upload Draft Renja Eselon I TTD Elektronik (Wajib untuk Approve/Kirim ke BINCANG)"
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

                    {/* 7. Kolom Persetujuan */}
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
            <div className="p-4 border-b border-[var(--border)] bg-[var(--accent)] flex justify-between items-center no-print">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-[var(--primary)]" />
                <div>
                  <h3 className="font-bold text-sm text-[var(--text)]">
                    Cetak Dokumen Renja Eselon I ({selectedPrintItem.status_histori_full})
                  </h3>
                  <p className="text-[0.7rem] text-[var(--text-muted)]">
                    Format Dokumen Resmi Standar PPATK (Tanpa Footer)
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
                  #print-renja-doc, #print-renja-doc * {
                    visibility: visible !important;
                  }
                  #print-renja-doc {
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

              <div id="print-renja-doc" className="space-y-10">
                {/* ──────────────── 1. HALAMAN JUDUL (COVER PAGE) ──────────────── */}
                <div className="min-h-[720px] flex flex-col justify-between items-center text-center py-12 print-break border-b-2 border-slate-200 print:border-none">
                  {/* Top Logo & Organization Name */}
                  <div className="space-y-4 pt-6">
                    <img
                      src="/logo-ppatk.png"
                      alt="Logo PPATK"
                      className="w-32 h-auto mx-auto object-contain drop-shadow-sm"
                    />
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 font-sans pt-1">
                      PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN
                    </p>
                  </div>

                  {/* Document Title */}
                  <div className="space-y-4 py-8">
                    <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900 font-sans">
                      DOKUMEN RENCANA KERJA
                    </h1>
                    <h2 className="text-xl font-bold uppercase tracking-wide text-slate-800 font-sans max-w-xl mx-auto leading-normal">
                      {selectedPrintItem.unit_kerja === "Deputi PENGASUH"
                        ? "DEPUTI BIDANG PELAPORAN DAN PENGAWASAN KEPATUHAN"
                        : selectedPrintItem.unit_kerja === "Deputi TEGAS"
                        ? "DEPUTI BIDANG PEMBERANTASAN"
                        : selectedPrintItem.unit_kerja === "Deputi ASA"
                        ? "DEPUTI BIDANG ANALISIS DAN PEMERIKSAAN"
                        : "SEKRETARIAT UTAMA"}
                    </h2>
                  </div>

                  {/* Year & History Status */}
                  <div className="space-y-2 pb-8">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-slate-900 font-sans">
                      TAHUN ANGGARAN {tahunAnggaran}
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

                  {/* Section A */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm tracking-wide text-slate-900 font-sans">
                      A. GAMBARAN UMUM
                    </h3>
                    <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
                      Sasaran Strategis PPATK 2025-2029 dirumuskan menjadi 2 (dua), yaitu meningkatnya efektivitas kinerja PPATK dalam pencegahan dan pemberantasan TPPU, TPPT, dan PPSPM dan meningkatnya kinerja revitalisasi birokrasi PPATK. Dalam pelaksanaan Sasaran Strategis tersebut, Deputi Bidang Pelaporan dan Pengawasan Kepatuhan melaksanakan Program Prioritas PPATK ke-1, yaitu Pengelolaan Kualitas Data Pelaporan dan Pengawasan Kepatuhan Pihak Pelapor.
                    </p>
                    <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
                      Selanjutnya, berdasarkan Renstra PPATK Tahun 2025 – 2029, mengampu 1 (satu) sasaran program, yaitu Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan Pihak Pelapor dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM. Pencapaian Sasaran Program tersebut diarahkan pada 2 (dua) aspek yang saling terintegrasi, yaitu peningkatan kualitas dan kebermanfaatan data pelaporan PPATK serta peningkatan kepatuhan Pihak Pelapor berbasis risiko.
                    </p>
                    <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
                      Dalam rangka mencapai Sasaran Program Tahun {tahunAnggaran}, pelaksanaan kegiatan diarahkan pada penguatan kualitas dan kebermanfaatan data pelaporan serta peningkatan efektivitas pengawasan kepatuhan Pihak Pelapor berbasis risiko melalui audit kepatuhan/audit khusus, joint audit bersama Lembaga Pengawas dan Pengatur (LPP), pemantauan tindak lanjut, pembinaan, rekomendasi/pengenaan sanksi, penyusunan/evaluasi kebijakan, penilaian integritas, serta pengolahan data makro PPATK.
                    </p>
                  </div>

                  {/* Section B */}
                  <div className="space-y-3 pt-4">
                    <h3 className="font-bold text-sm tracking-wide text-slate-900 font-sans">
                      B. CAPAIAN KINERJA
                    </h3>
                    <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
                      Secara umum, capaian kinerja Deputi Bidang Pelaporan dan Pengawasan Kepatuhan pada tahun sebelumnya menunjukkan hasil yang sangat baik. Berdasarkan hasil pengukuran kinerja, Indeks Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan Pihak Pelapor dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM mencapai 5 Indeks, dengan persentase capaian sebesar 125% dari target sebesar 4 Indeks.
                    </p>
                    <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
                      Capaian tersebut didukung oleh 3 (tiga) komponen utama, yaitu Pengelolaan Data Pelaporan, Pengawasan Kepatuhan PJK, dan Pengawasan Kepatuhan PBJP, dengan rata-rata persentase capaian sebesar 80,48%. Rata-rata capaian ketiga komponen tersebut selanjutnya menjadi dasar dalam penentuan nilai Indeks sesuai dengan metodologi pengukuran yang digunakan sebagai berikut:
                    </p>

                    {/* Tabel Skala Indeks */}
                    <div className="py-2">
                      <table className="w-full text-xs border-collapse border border-slate-900 text-center font-sans">
                        <thead className="bg-slate-100 font-bold">
                          <tr>
                            <th className="p-2 border border-slate-900 w-1/3">Persentase</th>
                            <th className="p-2 border border-slate-900 w-1/4">Indeks</th>
                            <th className="p-2 border border-slate-900">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-1.5 border border-slate-900">0% ≤ x ≤ 20%</td>
                            <td className="p-1.5 border border-slate-900">1</td>
                            <td className="p-1.5 border border-slate-900">Tidak Baik</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 border border-slate-900">20% &lt; x ≤ 40%</td>
                            <td className="p-1.5 border border-slate-900">2</td>
                            <td className="p-1.5 border border-slate-900">Kurang Baik</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 border border-slate-900">40% &lt; x ≤ 60%</td>
                            <td className="p-1.5 border border-slate-900">3</td>
                            <td className="p-1.5 border border-slate-900">Cukup Baik</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 border border-slate-900">60% &lt; x ≤ 80%</td>
                            <td className="p-1.5 border border-slate-900">4</td>
                            <td className="p-1.5 border border-slate-900">Baik</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 border border-slate-900 font-semibold bg-emerald-50">80% &lt; x ≤ 100%</td>
                            <td className="p-1.5 border border-slate-900 font-semibold bg-emerald-50">5</td>
                            <td className="p-1.5 border border-slate-900 font-semibold bg-emerald-50">Sangat Baik</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
                      Dari sisi anggaran, pagu anggaran Deputi setelah revisi per 31 Desember sebesar Rp5.578.049.000, dengan realisasi sebesar Rp5.536.274.476 atau 99,25%. Realisasi anggaran tersebut mencerminkan efektivitas dan akuntabilitas penyerapan pagu untuk mendukung pencapaian sasaran program.
                    </p>

                    {/* Tabel Capaian Sasaran Program */}
                    <div className="py-2">
                      <table className="w-full text-xs border-collapse border border-slate-900 font-sans">
                        <thead className="bg-slate-100 font-bold text-center">
                          <tr>
                            <th className="p-2 border border-slate-900 w-12">Kode</th>
                            <th className="p-2 border border-slate-900">Sasaran Program / IKP</th>
                            <th className="p-2 border border-slate-900 w-20">Target</th>
                            <th className="p-2 border border-slate-900 w-20">Realisasi</th>
                            <th className="p-2 border border-slate-900 w-24">Capaian (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border border-slate-900 text-center font-bold">SP 01</td>
                            <td className="p-2 border border-slate-900">
                              <span className="font-semibold block">Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan Pihak Pelapor</span>
                              <span className="text-[0.7rem] text-slate-600">Indeks Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan Pihak Pelapor</span>
                            </td>
                            <td className="p-2 border border-slate-900 text-center">4.0</td>
                            <td className="p-2 border border-slate-900 text-center">5.0</td>
                            <td className="p-2 border border-slate-900 text-center font-bold text-emerald-700">125.0%</td>
                          </tr>
                          <tr>
                            <td className="p-2 border border-slate-900 text-center font-bold">IKP 01</td>
                            <td className="p-2 border border-slate-900">
                              <span className="font-semibold block">Persentase Kepatuhan Pelaporan Pihak Pelapor Berbasis Risiko</span>
                            </td>
                            <td className="p-2 border border-slate-900 text-center">80.0%</td>
                            <td className="p-2 border border-slate-900 text-center">82.5%</td>
                            <td className="p-2 border border-slate-900 text-center font-bold text-emerald-700">103.1%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section C */}
                  <div className="space-y-3 pt-4">
                    <h3 className="font-bold text-sm tracking-wide text-slate-900 font-sans">
                      C. ARAH KEBIJAKAN, STRATEGI, DAN TARGET KINERJA TAHUN {tahunAnggaran}
                    </h3>
                    <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
                      Pelaksanaan Rencana Kerja Tahun {tahunAnggaran} merupakan kelanjutan dari pelaksanaan tahun sebelumnya dan menjadi bagian integral dari tahun ketiga pelaksanaan Renstra PPATK Tahun 2025 - 2029. Arah kebijakan diarahkan pada penguatan kualitas pelaporan, pengawasan kepatuhan berbasis risiko, serta optimalisasi pemanfaatan data dan teknologi dalam pencegahan dan pemberantasan TPPU, TPPT, dan PPSPM.
                    </p>

                    {/* Tabel Target Kinerja (Format 3 Kolom Sesuai Gambar Standar PPATK) */}
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
                          {/* Row SS */}
                          <tr>
                            <td className="p-2 border border-slate-900 text-center font-bold align-middle">
                              SS.1
                            </td>
                            <td className="border border-slate-900 p-0 align-top">
                              <div className="p-2.5 font-bold text-slate-900 leading-snug">
                                Meningkatnya Efektivitas Kinerja PPATK dalam Pencegahan dan Pemberantasan TPPU, TPPT, dan PPSPM
                              </div>
                              <div className="border-t border-slate-900 p-2 text-xs space-y-0.5">
                                <div className="italic underline font-medium">Indikator IKSS 1.2:</div>
                                <div className="italic text-slate-800">
                                  Indeks Implementasi Program TPPU TPPT dan PPSPM PPATK. {"{Indeks}"}
                                </div>
                              </div>
                            </td>
                            <td className="border border-slate-900 p-0 text-center align-bottom">
                              <div className="p-2.5">&nbsp;</div>
                              <div className="border-t border-slate-900 p-2 text-xs font-semibold">
                                6,8
                              </div>
                            </td>
                          </tr>

                          {/* Row SP */}
                          <tr>
                            <td className="p-2 border border-slate-900 text-center font-bold align-middle">
                              SP.1
                            </td>
                            <td className="border border-slate-900 p-0 align-top">
                              <div className="p-2.5 font-bold text-slate-900 leading-snug">
                                Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pemberantasan TPPU, TPPT, dan PPSPM
                              </div>
                              <div className="border-t border-slate-900 p-2 text-xs space-y-0.5">
                                <div className="italic underline font-medium">Indikator IKP 1.1:</div>
                                <div className="italic text-slate-800">
                                  Indeks Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pemberantasan TPPU, TPPT, dan PPSPM. {"{Indeks}"}
                                </div>
                              </div>
                            </td>
                            <td className="border border-slate-900 p-0 text-center align-bottom">
                              <div className="p-2.5">&nbsp;</div>
                              <div className="border-t border-slate-900 p-2 text-xs font-semibold">
                                5
                              </div>
                            </td>
                          </tr>

                          {/* Divider Row: Sasaran Kegiatan */}
                          <tr>
                            <td className="p-2 border border-slate-900"></td>
                            <td className="p-2 border border-slate-900 font-medium">
                              <span className="underline">Sasaran Kegiatan:</span>
                            </td>
                            <td className="p-2 border border-slate-900"></td>
                          </tr>

                          {/* Row SK & IKK */}
                          <tr>
                            <td className="p-2 border border-slate-900 text-center font-bold align-middle">
                              SK 1.7
                            </td>
                            <td className="border border-slate-900 p-0 align-top">
                              <div className="p-2.5 font-bold text-slate-900 leading-snug">
                                Meningkatnya Kompetensi SDM APU PPT dan PPSPM
                              </div>
                              <div className="border-t border-slate-900 p-2 text-xs space-y-0.5">
                                <div className="italic underline font-medium">Indikator IKK 1.4.1:</div>
                                <div className="italic text-slate-800">
                                  Indeks Efektivitas Pengembangan Kompetensi SDM APU PPT dan PPSPM. {"{Indeks}"}
                                </div>
                              </div>
                            </td>
                            <td className="border border-slate-900 p-0 text-center align-bottom">
                              <div className="p-2.5">&nbsp;</div>
                              <div className="border-t border-slate-900 p-2 text-xs font-semibold">
                                4,52
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section D */}
                  <div className="space-y-3 pt-4">
                    <h3 className="font-bold text-sm tracking-wide text-slate-900 font-sans">
                      D. ANALISIS SITUASI TAHUN {tahunAnggaran}
                    </h3>
                    <div className="space-y-2 text-xs text-slate-800">
                      <p className="text-justify leading-relaxed">
                        <strong>1. Penajaman implementasi hasil NRA 2026 ke dalam pengawasan berbasis risiko:</strong> Hasil National Risk Assessment (NRA) 2026 menjadi rujukan utama dalam menentukan sektor dan Pihak Pelapor berisiko tinggi yang menjadi prioritas audit dan pembinaan kepatuhan.
                      </p>
                      <p className="text-justify leading-relaxed">
                        <strong>2. Penguatan kualitas pelaporan dan peningkatan kebermanfaatan data:</strong> Peningkatan otomasi validasi format laporan transaksi goAML guna meminimalisir kesalahan pelaporan dan mempercepat kecepatan analisis intelijen keuangan.
                      </p>
                      <p className="text-justify leading-relaxed">
                        <strong>3. Transformasi pengawasan melalui pemanfaatan data dan teknologi:</strong> Optimalisasi analitik big data dan kecerdasan buatan untuk mendeteksi anomali kepatuhan secara dini.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ──────────────── 3. BAB II PROGRAM KERJA TAHUN 2027 ──────────────── */}
                <div className="space-y-6 pt-6 print-break">
                  <div className="text-center space-y-1 pb-4">
                    <h2 className="text-base font-bold uppercase tracking-wider font-sans">
                      BAB II
                    </h2>
                    <h2 className="text-base font-bold uppercase tracking-wider font-sans">
                      PROGRAM KERJA TAHUN {tahunAnggaran}
                    </h2>
                  </div>

                  <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
                    Pada tahun {tahunAnggaran}, pelaksanaan program kerja Deputi diarahkan pada pencapaian Sasaran Program melalui keterpaduan kegiatan lintas unit kerja dan program kerja spesifik masing-masing unit kerja guna meningkatkan kepatuhan Pihak Pelapor dan kualitas produk intelijen keuangan nasional.
                  </p>

                  {/* Bagian A: Program Kerja Lintas Unit */}
                  <div className="space-y-4 pt-2">
                    <h3 className="font-bold text-sm tracking-wide text-slate-900 font-sans">
                      A. Program Kerja Lintas Unit Kerja
                    </h3>
                    <div className="space-y-4 text-xs text-slate-800">
                      <div className="space-y-1 bg-slate-50 p-3.5 rounded border border-slate-200">
                        <p className="font-bold text-slate-900">
                          1. Penguatan integrasi pelaporan dan pengawasan kepatuhan berbasis risiko
                        </p>
                        <p className="text-justify text-slate-700 leading-relaxed">
                          Mengintegrasikan alur data pelaporan goAML dengan peta risiko pengawasan kepatuhan, sehingga prioritas audit dan pembinaan langsung didasarkan pada anomali dan risiko transaksi aktual.
                        </p>
                        <div className="pt-1.5 space-y-1">
                          <p>
                            <span className="font-semibold text-slate-900">Tujuan:</span> Meningkatkan efektivitas pengawasan kepatuhan berbasis data pelaporan yang akurat dan tepat sasaran.
                          </p>
                          <p>
                            <span className="font-semibold text-slate-900">Outcome:</span> Meningkatnya kepatuhan Pihak Pelapor serta kualitas data pelaporan intelijen keuangan nasional.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1 bg-slate-50 p-3.5 rounded border border-slate-200">
                        <p className="font-bold text-slate-900">
                          2. Penguatan kualitas data pelaporan intelijen terpadu
                        </p>
                        <p className="text-justify text-slate-700 leading-relaxed">
                          Evaluasi kepatuhan format pelaporan dan sinkronisasi standar data transaksi keuangan lintas kementerian/lembaga mitra strategis PPATK.
                        </p>
                        <div className="pt-1.5 space-y-1">
                          <p>
                            <span className="font-semibold text-slate-900">Tujuan:</span> Menyediakan data pelaporan yang valid, konsisten, dan siap dimanfaatkan untuk analisis strategis.
                          </p>
                          <p>
                            <span className="font-semibold text-slate-900">Outcome:</span> Meningkatnya kecepatan dan keakuratan analisis tindak pidana pencucian uang.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bagian B: Program Kerja Unit Kerja */}
                  <div className="space-y-4 pt-4">
                    <h3 className="font-bold text-sm tracking-wide text-slate-900 font-sans">
                      B. Program Kerja Unit Kerja ({selectedPrintItem.unit_kerja})
                    </h3>
                    <div className="space-y-4 text-xs text-slate-800">
                      <div className="space-y-1 bg-slate-50 p-3.5 rounded border border-slate-200">
                        <p className="font-bold text-slate-900">
                          1. Penilaian Integritas Pihak Pelapor (PJK dan PBJP)
                        </p>
                        <p className="text-justify text-slate-700 leading-relaxed">
                          Pelaksanaan survei berkala dan pengukuran indeks integritas terhadap Pihak Pelapor PJK dan PBJP guna memetakan komitmen budaya kepatuhan APU PPT PPSPM.
                        </p>
                        <div className="pt-1.5 space-y-1">
                          <p>
                            <span className="font-semibold text-slate-900">Tujuan:</span> Mengukur tingkat integritas dan kepatuhan substantif Pihak Pelapor dalam pencegahan TPPU/TPPT.
                          </p>
                          <p>
                            <span className="font-semibold text-slate-900">Outcome:</span> Meningkatnya indeks integritas dan kepatuhan pemenuhan kewajiban pelaporan.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1 bg-slate-50 p-3.5 rounded border border-slate-200">
                        <p className="font-bold text-slate-900">
                          2. Pengawasan Kepatuhan Pihak Pelapor Berbasis Risiko
                        </p>
                        <p className="text-justify text-slate-700 leading-relaxed">
                          Pelaksanaan audit langsung (on-site) dan audit tidak langsung (off-site) terhadap sektor berisiko tinggi berdasarkan hasil SRA dan NRA.
                        </p>
                        <div className="pt-1.5 space-y-1">
                          <p>
                            <span className="font-semibold text-slate-900">Tujuan:</span> Memastikan penerapan program APU PPT oleh Pihak Pelapor berjalan sesuai ketentuan regulasi.
                          </p>
                          <p>
                            <span className="font-semibold text-slate-900">Outcome:</span> Menurunnya tingkat pelanggaran kewajiban pelaporan transaksi keuangan mencurigakan.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ──────────────── 4. BLOK TANDA TANGAN (SIGNATURE BLOCK) ──────────────── */}
                  {(() => {
                    const pejabat = getPejabatPenandatangan(selectedPrintItem.unit_kerja);
                    return (
                      <div className="pt-12 flex justify-end">
                        <div className="text-center font-sans text-xs space-y-1 min-w-[240px]">
                          <p className="text-slate-800">Jakarta, 22 September 2026</p>
                          <p className="font-bold text-slate-900 pb-16">
                            {pejabat.jabatan}
                          </p>
                          <p className={`font-bold ${pejabat.nama === "Data Pejabat tidak ditemukan" ? "text-red-600 italic" : "text-slate-900 underline"}`}>
                            {pejabat.nama}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
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
          6. MODAL POP-UP NOTIFIKASI PENGIRIMAN KE BINCANG / APPROVER
         ══════════════════════════════════════════════════════════════ */}
      {noticeModalMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setNoticeModalMessage(null)}
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
              Notifikasi
            </h3>
            <p className="text-sm text-[var(--text)] font-semibold leading-relaxed">
              {noticeModalMessage}
            </p>
            <button
              onClick={() => setNoticeModalMessage(null)}
              className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-xs hover:opacity-90 transition-opacity shadow-md cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          7. MODAL UPLOAD DOKUMEN DRAFT RENJA ESELON I (TTD ELEKTRONIK)
         ══════════════════════════════════════════════════════════════ */}
      {uploadingDocItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setUploadingDocItem(null)}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-5 animate-in fade-in zoom-in duration-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold shrink-0">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text)]">
                    Upload Dokumen Draft Renja TTD Elektronik
                  </h3>
                  <p className="text-[0.7rem] text-[var(--text-muted)]">
                    {uploadingDocItem.unit_kerja} ({uploadingDocItem.status_histori_full})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUploadingDocItem(null)}
                className="p-1 rounded-lg hover:bg-[var(--accent)] text-[var(--text-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Syarat Mandatory (Wajib)</span>
                </p>
                <p className="text-[0.75rem] text-amber-800 dark:text-amber-300 leading-relaxed">
                  Unggah file draft Renja Eselon I yang telah ditandatangani secara elektronik (TTD Digital) oleh Pejabat Penandatangan. Approver tidak dapat menyetujui/mengirim data ke BINCANG jika dokumen ini belum diunggah.
                </p>
              </div>

              {/* File Dropzone Area */}
              <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-6 text-center hover:border-[var(--primary)] transition-colors bg-[var(--accent)]/30 space-y-3 cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFileName(e.target.files[0].name);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--primary)] shadow-sm">
                  <FileUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text)]">
                    Klik atau Seret file dokumen ke sini
                  </p>
                  <p className="text-[0.7rem] text-[var(--text-muted)] pt-0.5">
                    Format yang didukung: PDF (.pdf) atau Word (.docx) maks 25 MB
                  </p>
                </div>
              </div>

              {/* Selected file preview field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Nama File Dokumen TTD:
                </label>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[var(--primary)] shrink-0" />
                  <input
                    type="text"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    className="w-full text-xs bg-[var(--accent)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text)] font-mono focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                    placeholder="Draft_Renja_Eselon1_Signed.pdf"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setUploadingDocItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--accent)] cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!uploadFileName.trim()) {
                    alert("Nama file dokumen tidak boleh kosong.");
                    return;
                  }
                  // Update dataList item
                  setDataList((prev) =>
                    prev.map((d) =>
                      d.id === uploadingDocItem.id
                        ? {
                            ...d,
                            is_doc_uploaded: true,
                            signed_doc_name: uploadFileName.trim(),
                          }
                        : d
                    )
                  );
                  // Sinkronkan ke active histori jika sesuai
                  try {
                    const activeRaw = localStorage.getItem("renja_e1_active_histori");
                    if (activeRaw) {
                      const activeItem = JSON.parse(activeRaw);
                      if (activeItem.id === uploadingDocItem.id || activeItem.kode_sts_history === uploadingDocItem.kodifikasi) {
                        activeItem.is_doc_uploaded = true;
                        activeItem.signed_doc_name = uploadFileName.trim();
                        localStorage.setItem("renja_e1_active_histori", JSON.stringify(activeItem));
                      }
                    }
                  } catch (e) {
                    console.error(e);
                  }
                  setUploadingDocItem(null);
                  setNoticeModalMessage(
                    `Dokumen Draft Renja Eselon I TTD Digital ("${uploadFileName.trim()}") BERHASIL diunggah. Data usulan kini siap dikirim / disetujui.`
                  );
                }}
                className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:opacity-90 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileCheck className="h-4 w-4" />
                <span>Simpan & Upload Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
