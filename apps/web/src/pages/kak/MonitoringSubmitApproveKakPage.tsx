import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  Printer,
  Trash2,
  Calendar,
  History,
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
  Building2,
  Clock,
  ArrowRight,
  Download,
  ShieldCheck,
  Layers,
  FileUp,
  Table,
} from "lucide-react";
import { mockPejabat } from "../../data/ppatkData";
import unitKerjaData from "../../data/unitKerjaData.json";
import { StatusHistoriKak } from "./PilihHistoriKakPage";

export interface MonitoringItemKak {
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
  tgl_approved?: string;
  approved_by?: string;
  is_doc_uploaded?: boolean;
  signed_doc_name?: string;
  nama_kegiatan?: string;
  total_anggaran?: number;
}

const INITIAL_MONITORING_KAK: MonitoringItemKak[] = [
  {
    id: "hist_kak_1",
    unit_kerja: "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
    owner: "Operator",
    kodifikasi: "B00",
    tahap_status: "DIPA Awal",
    rev_ke: 0,
    status_histori_full: "B00 - DIPA Awal - Rev ke-0",
    sumber: "B00",
    tgl_revisi: "08-10-2026 14:20 WIB",
    is_approved: false,
    is_doc_uploaded: false,
    nama_kegiatan: "Penyelenggaraan Pelatihan Teknis Penanganan Tindak Pidana Pencucian Uang bagi Penegak Hukum",
    total_anggaran: 845000000,
  },
  {
    id: "hist_kak_2",
    unit_kerja: "Direktorat Strategi dan Kerja Sama Internasional",
    owner: "Approver",
    kodifikasi: "B00",
    tahap_status: "DIPA Awal",
    rev_ke: 0,
    status_histori_full: "B00 - DIPA Awal - Rev ke-0",
    sumber: "B00",
    tgl_revisi: "07-10-2026 10:15 WIB",
    is_approved: false,
    is_doc_uploaded: true,
    signed_doc_name: "KAK_Strategi_Kerjasama_B00_signed.pdf",
    nama_kegiatan: "Koordinasi dan Penguatan Forum Kerja Sama Internasional Financial Action Task Force (FATF)",
    total_anggaran: 1250000000,
  },
  {
    id: "hist_kak_3",
    unit_kerja: "Pusat Teknologi Informasi",
    owner: "BINCANG",
    kodifikasi: "A01",
    tahap_status: "Usulan Revisi DIPA",
    rev_ke: 1,
    status_histori_full: "A01 - Usulan Revisi DIPA - Rev ke-1",
    sumber: "B00",
    tgl_revisi: "10-10-2026 09:45 WIB",
    is_approved: true,
    tgl_approved: "11-10-2026 15:30 WIB",
    approved_by: "Super Admin",
    is_doc_uploaded: true,
    signed_doc_name: "KAK_Pustik_Pemeliharaan_Server_A01_signed.pdf",
    nama_kegiatan: "Pengembangan dan Pemeliharaan Infrastruktur Pusat Data dan Keamanan Informasi PPATK",
    total_anggaran: 3820000000,
  },
  {
    id: "hist_kak_4",
    unit_kerja: "Biro Umum",
    owner: "Operator",
    kodifikasi: "C01",
    tahap_status: "Usulan Revisi Satker (POK)",
    rev_ke: 1,
    status_histori_full: "C01 - Usulan Revisi Satker (POK) - Rev ke-1",
    sumber: "B00",
    tgl_revisi: "11-10-2026 13:00 WIB",
    is_approved: false,
    is_doc_uploaded: false,
    nama_kegiatan: "Pengadaan Sarana dan Prasarana Pendukung Operasional Gedung Kantor PPATK",
    total_anggaran: 620000000,
  },
];

type UserRole = "Operator" | "Approver" | "BINCANG" | "Super Admin";
type FilterMode = "all" | "pending" | "approved";

const STORAGE_KEY_MONITORING_KAK = "kak_monitoring_list";

function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export default function MonitoringSubmitApproveKakPage() {
  // Pengaturan role yang sama persis dengan Renja Eselon II (renja_e2_user_role)
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

  const [dataList, setDataList] = useState<MonitoringItemKak[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MONITORING_KAK);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MONITORING_KAK;
  });

  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");

  const [selectedPrintItem, setSelectedPrintItem] = useState<MonitoringItemKak | null>(null);
  const [selectedMatriksPrintItem, setSelectedMatriksPrintItem] = useState<MonitoringItemKak | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MonitoringItemKak | null>(null);
  const [uploadingDocItem, setUploadingDocItem] = useState<MonitoringItemKak | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>("");
  const [showRoleNotice, setShowRoleNotice] = useState<string | null>(null);
  const [noticeModalMessage, setNoticeModalMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MONITORING_KAK, JSON.stringify(dataList));
  }, [dataList]);

  // Cek histori aktif KAK dan sinkronkan ke data monitoring
  useEffect(() => {
    try {
      const activeRaw = localStorage.getItem("kak_active_histori");
      if (activeRaw) {
        const activeItem = JSON.parse(activeRaw);
        setDataList((prev) => {
          const exists = prev.some(
            (d) => d.kodifikasi === activeItem.kode_sts_history && d.unit_kerja === activeItem.kdsatker
          );
          if (!exists) {
            const newItem: MonitoringItemKak = {
              id: `hist_kak_${Date.now()}`,
              unit_kerja: activeItem.kdsatker || "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
              owner: "Operator",
              kodifikasi: activeItem.kode_sts_history || "B00",
              tahap_status: (activeItem.status_histori as StatusHistoriKak) || "DIPA Awal",
              rev_ke: activeItem.rev_ke || 0,
              status_histori_full: `${activeItem.kode_sts_history || "B00"} - ${activeItem.status_histori || "DIPA Awal"} - Rev ke-${activeItem.rev_ke || 0}`,
              sumber: activeItem.sumber || "B00",
              tgl_revisi:
                new Date().toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }) + " WIB",
              is_approved: false,
              is_doc_uploaded: false,
              nama_kegiatan: "Kerangka Acuan Kerja Pelaksanaan Program & Rincian Output Satker",
              total_anggaran: 500000000,
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

  // Unduh dokumen TTE
  function handleDownloadSignedDoc(item: MonitoringItemKak) {
    if (!item.is_doc_uploaded) return;

    const fileName =
      item.signed_doc_name ||
      `KAK_${item.unit_kerja.replace(/\s+/g, "_")}_${item.kodifikasi}_Signed.pdf`;

    const content = `[DOKUMEN KERANGKA ACUAN KERJA (TOR) TTD DIGITAL]\nSatker: ${item.unit_kerja}\nStatus Histori: ${item.status_histori_full}\nTanggal Revisi: ${item.tgl_revisi}\nNama File: ${fileName}\n\nDokumen Kerangka Acuan Kerja ini telah diverifikasi dan ditandatangani secara elektronik (TTE) sesuai standar regulasi Kemenkeu & PPATK.`;
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

  // Operator kirim ke Approver
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
    setNoticeModalMessage("Dokumen KAK/TOR berhasil dikirim ke Approver untuk verifikasi dan penandatanganan elektronik.");
  }

  // Approver Setuju
  function handleApproveByApprover(id: string) {
    if (currentUserRole === "Operator") {
      setShowRoleNotice("Aksi Persetujuan hanya dapat dilakukan oleh User Approval, BINCANG, & Super Admin.");
      setTimeout(() => setShowRoleNotice(null), 4000);
      return;
    }

    const targetItem = dataList.find((d) => d.id === id);
    if (targetItem && !targetItem.is_doc_uploaded) {
      setNoticeModalMessage(
        "Persetujuan Gagal! Dokumen KAK/TOR TTD Digital WAJIB diunggah oleh Approver pada kolom AKSI sebelum data dikirim ke BINCANG."
      );
      return;
    }

    const nowStr =
      new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";

    setDataList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, owner: "BINCANG", is_approved: false } : item))
    );

    // Otomatis kirim histori ke menu Rencana Anggaran Biaya (RAB)
    if (targetItem) {
      try {
        const rawRab = localStorage.getItem("rab_monitoring_list");
        let rabList: any[] = [];
        if (rawRab) {
          try {
            rabList = JSON.parse(rawRab);
          } catch {}
        }
        if (!Array.isArray(rabList) || rabList.length === 0) {
          rabList = [
            {
              id: "hist_rab_1",
              unit_kerja: "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
              owner: "BINCANG",
              kodifikasi: "G00",
              tahap_status: "Angka Dasar",
              rev_ke: 0,
              status_histori_full: "G00 - Angka Dasar - Rev ke-0",
              sumber: "G00",
              tgl_revisi: "15-10-2026 10:00 WIB",
              is_approved: true,
              tgl_approved: "15-10-2026 14:30 WIB",
              approved_by: "Super Admin",
              is_doc_uploaded: true,
              signed_doc_name: "RAB_Pusdiklat_AngkaDasar_G00_signed.pdf",
              total_anggaran: 2216650000,
              keterangan: "Penyusunan Angka Dasar Pusdiklat APUPPT TA 2027",
            },
            {
              id: "hist_rab_2",
              unit_kerja: "Direktorat Strategi dan Kerja Sama Internasional",
              owner: "Operator",
              kodifikasi: "B00",
              tahap_status: "DIPA Awal",
              rev_ke: 0,
              status_histori_full: "B00 - DIPA Awal - Rev ke-0",
              sumber: "B00",
              tgl_revisi: "14-10-2026 11:20 WIB",
              is_approved: false,
              is_doc_uploaded: false,
              total_anggaran: 1250000000,
              keterangan: "Penganggaran Kerjasama FATF & Forum Bilateral",
            },
          ];
        }

        const existingIdx = rabList.findIndex(
          (r) =>
            r.unit_kerja === targetItem.unit_kerja &&
            r.kodifikasi === targetItem.kodifikasi &&
            r.tahap_status === targetItem.tahap_status
        );

        if (existingIdx >= 0) {
          rabList[existingIdx] = {
            ...rabList[existingIdx],
            owner: "BINCANG",
            tgl_revisi: nowStr,
            is_doc_uploaded: targetItem.is_doc_uploaded ?? rabList[existingIdx].is_doc_uploaded,
            signed_doc_name: targetItem.signed_doc_name ?? rabList[existingIdx].signed_doc_name,
            total_anggaran: targetItem.total_anggaran || rabList[existingIdx].total_anggaran,
            keterangan: `Sinkronisasi Terkirim dari KAK: ${targetItem.nama_kegiatan || targetItem.status_histori_full}`,
          };
        } else {
          rabList.unshift({
            id: `hist_rab_${Date.now()}`,
            unit_kerja: targetItem.unit_kerja,
            owner: "BINCANG",
            kodifikasi: targetItem.kodifikasi,
            tahap_status: targetItem.tahap_status,
            rev_ke: targetItem.rev_ke,
            status_histori_full: targetItem.status_histori_full,
            sumber: targetItem.sumber,
            tgl_revisi: nowStr,
            is_approved: false,
            is_doc_uploaded: targetItem.is_doc_uploaded || false,
            signed_doc_name:
              targetItem.signed_doc_name ||
              `RAB_${targetItem.unit_kerja.replace(/\s+/g, "_")}_${targetItem.kodifikasi}.pdf`,
            total_anggaran: targetItem.total_anggaran || 2216650000,
            keterangan: `Sinkronisasi Terkirim dari KAK: ${targetItem.nama_kegiatan || targetItem.status_histori_full}`,
          });
        }

        localStorage.setItem("rab_monitoring_list", JSON.stringify(rabList));

        // Sinkronkan juga histori aktif RAB
        localStorage.setItem(
          "rab_active_histori",
          JSON.stringify({
            kdsatker: targetItem.unit_kerja,
            status_histori: targetItem.tahap_status,
            kode_sts_history: targetItem.kodifikasi,
            rev_ke: targetItem.rev_ke,
            sumber: targetItem.sumber,
            label: targetItem.status_histori_full,
            synced_at: nowStr,
          })
        );
        window.dispatchEvent(new Event("storage"));
      } catch (e) {
        console.error("Gagal sinkronisasi ke histori RAB:", e);
      }
    }

    setNoticeModalMessage(
      "Dokumen KAK telah disetujui Approver Satker dan diteruskan ke Biro Perencanaan & Keuangan (BINCANG). Histori pada menu Rencana Anggaran Biaya (RAB) otomatis ikut terkirim."
    );
  }

  // Approver Tolak
  function handleRejectByApprover(id: string) {
    if (currentUserRole === "Operator") return;
    setDataList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, owner: "Operator", is_approved: false } : item))
    );
    setNoticeModalMessage("Dokumen KAK ditolak oleh Approver dan dikembalikan ke Operator Satker untuk disempurnakan.");
  }

  // BINCANG Setuju (Final Approval)
  function handleApproveByBincang(id: string) {
    if (currentUserRole === "Operator" || currentUserRole === "Approver") return;

    const targetItem = dataList.find((d) => d.id === id);
    if (targetItem && !targetItem.is_doc_uploaded) {
      setNoticeModalMessage("Persetujuan Akhir Gagal! Dokumen TTE KAK belum diunggah.");
      return;
    }

    const nowStr =
      new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";

    setDataList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              owner: "BINCANG",
              is_approved: true,
              tgl_approved: nowStr,
              approved_by: currentUserRole,
            }
          : item
      )
    );

    // Sinkronisasi status approved ke menu RAB
    if (targetItem) {
      try {
        const rawRab = localStorage.getItem("rab_monitoring_list");
        if (rawRab) {
          let rabList: any[] = JSON.parse(rawRab);
          rabList = rabList.map((r) => {
            if (
              r.unit_kerja === targetItem.unit_kerja &&
              r.kodifikasi === targetItem.kodifikasi &&
              r.tahap_status === targetItem.tahap_status
            ) {
              return {
                ...r,
                is_approved: true,
                tgl_approved: nowStr,
                approved_by: currentUserRole,
              };
            }
            return r;
          });
          localStorage.setItem("rab_monitoring_list", JSON.stringify(rabList));
          window.dispatchEvent(new Event("storage"));
        }
      } catch (e) {
        console.error("Gagal sinkronisasi approved ke RAB:", e);
      }
    }

    setNoticeModalMessage(
      "Dokumen KAK telah disetujui BINCANG dan status resmi menjadi: Disetujui & Proses Kemenkeu. Histori RAB terkait turut disetujui."
    );
  }

  // BINCANG Tolak
  function handleRejectByBincang(id: string) {
    if (currentUserRole === "Operator" || currentUserRole === "Approver") return;
    setDataList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, owner: "Approver", is_approved: false } : item))
    );
    setNoticeModalMessage("Dokumen KAK ditolak oleh BINCANG dan dikembalikan ke Approver Satker.");
  }

  // Hapus Data
  function handleRequestDelete(item: MonitoringItemKak) {
    if (item.is_approved && ["Operator", "Approver", "BINCANG"].includes(currentUserRole)) {
      setShowRoleNotice(
        "Penghapusan Ditolak! Dokumen KAK dengan status 'Disetujui & Proses Kemenkeu' tidak dapat dihapus."
      );
      setTimeout(() => setShowRoleNotice(null), 4000);
      return;
    }
    setItemToDelete(item);
  }

  function handleConfirmDelete() {
    if (!itemToDelete) return;
    setDataList((prev) => prev.filter((d) => d.id !== itemToDelete.id));
    setItemToDelete(null);
    setNoticeModalMessage("Dokumen KAK berhasil dihapus dari daftar monitoring.");
  }

  // Simpan Upload Dokumen TTE
  function handleSaveUploadedDoc() {
    if (!uploadingDocItem) return;
    const finalName = uploadFileName.trim() || `KAK_${uploadingDocItem.kodifikasi}_Signed.pdf`;
    setDataList((prev) =>
      prev.map((item) =>
        item.id === uploadingDocItem.id
          ? {
              ...item,
              is_doc_uploaded: true,
              signed_doc_name: finalName,
            }
          : item
      )
    );
    setUploadingDocItem(null);
    setNoticeModalMessage(`Dokumen TTD Elektronik "${finalName}" berhasil diunggah.`);
  }

  // Filter Data
  const filteredData = dataList.filter((item) => {
    const matchSearch =
      (item.unit_kerja || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.kodifikasi || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.status_histori_full || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nama_kegiatan || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "Semua" || item.tahap_status === statusFilter;
    const matchMode =
      filterMode === "all"
        ? true
        : filterMode === "pending"
        ? !item.is_approved
        : item.is_approved;

    return matchSearch && matchStatus && matchMode;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Header & Breadcrumb ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Penganggaran & Biaya</span>
            <span>/</span>
            <span>Kerangka Acuan Kerja (TOR)</span>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Monitoring Submit & Approve Data</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <ClipboardCheck className="h-6 w-6 text-[var(--primary)]" />
            <span>Monitoring Submit & Approve Data KAK/TOR</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Pemantauan pengajuan, verifikasi pejabat satker, tanda tangan elektronik (TTE), dan approval Kemenkeu.
          </p>
        </div>

        {/* Role Switcher sama persis dengan menu Renja Eselon II */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-[var(--border)] text-xs">
          <span className="text-[var(--text-muted)] font-semibold px-2">Peran:</span>
          {(["Operator", "Approver", "BINCANG", "Super Admin"] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setCurrentUserRole(r)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                currentUserRole === r
                  ? "bg-white dark:bg-slate-700 text-[var(--text)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Role Alert Warning */}
      {showRoleNotice && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{showRoleNotice}</span>
          </div>
          <button onClick={() => setShowRoleNotice(null)} className="text-amber-600 hover:text-amber-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Filter Bar & Search (Style Eselon II) ── */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
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
                  : "bg-[var(--accent)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text)]"
              }`}
            >
              <span>{f.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[0.65rem] font-mono bg-white/20">
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto text-xs bg-[var(--accent)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text)] font-medium cursor-pointer"
          >
            <option value="Semua">Semua Tahapan Status</option>
            <option value="DIPA Awal">DIPA Awal (B00)</option>
            <option value="Usulan Revisi DIPA">Usulan Revisi DIPA (A01-A99)</option>
            <option value="Usulan Revisi Satker (POK)">Usulan Revisi Satker (C01-C99)</option>
            <option value="Pagu Indikatif">Pagu Indikatif</option>
            <option value="Pagu Anggaran">Pagu Anggaran</option>
            <option value="Alokasi Anggaran">Alokasi Anggaran</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Satker atau Kodifikasi..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-[var(--accent)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {/* ── Tabel Monitoring (Persis Gaya Screenshot Eselon II) ── */}
      {/* ── Tabel Monitoring (Persis Gaya Eselon II Tanpa Tumpukan Teks) ── */}
      <div className="aksi-card overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--accent)] border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-[0.65rem]">
                <th className="p-3 font-bold whitespace-nowrap">Satker Eselon II</th>
                <th className="p-3 font-bold whitespace-nowrap">Owner</th>
                <th className="p-3 font-bold whitespace-nowrap">Status Histori</th>
                <th className="p-3 font-bold text-center whitespace-nowrap">Sumber</th>
                <th className="p-3 font-bold whitespace-nowrap">Tanggal Revisi</th>
                <th className="p-3 font-bold text-center whitespace-nowrap">AKSI</th>
                <th className="p-3 font-bold text-center whitespace-nowrap">Persetujuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">
                    Tidak ada data histori KAK yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--accent)]/30 transition-colors">
                    {/* Kolom 1: Satker Eselon II - whitespace-nowrap mencegah teks menumpuk ke kolom sebelah */}
                    <td className="p-3 font-bold text-[var(--text)] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
                        <span>{item.unit_kerja}</span>
                      </div>
                    </td>

                    {/* Kolom 2: Owner */}
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

                    {/* Kolom 3: Status Histori */}
                    <td className="p-3 whitespace-nowrap font-semibold">
                      {item.status_histori_full}
                    </td>

                    {/* Kolom 4: Sumber */}
                    <td className="p-3 text-center font-mono font-bold text-indigo-700 dark:text-indigo-400 whitespace-nowrap">
                      {item.sumber}
                    </td>

                    {/* Kolom 5: Tanggal Revisi */}
                    <td className="p-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {item.tgl_revisi}
                    </td>

                    {/* Kolom 6: AKSI (Cetak, Upload TTD *, Hapus) */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                        {/* Tombol Cetak - Indigo/Purple pill */}
                        <button
                          onClick={() => setSelectedPrintItem(item)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#2e1065] hover:bg-[#3b0764] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          title="Cetak Dokumen Kerangka Acuan Kerja (TOR)"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Cetak</span>
                        </button>

                        {/* Tombol Cetak Matriks Usulan Revisi - Blue pill */}
                        <button
                          onClick={() => setSelectedMatriksPrintItem(item)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          title="Cetak Matriks Perubahan Usulan Revisi (Semula - Menjadi)"
                        >
                          <Table className="h-3.5 w-3.5" />
                          <span>Cetak Matriks</span>
                        </button>

                        {/* Tombol Upload TTD / ✓ TTD Uploaded */}
                        {currentUserRole === "Approver" || currentUserRole === "Super Admin" ? (
                          item.is_doc_uploaded ? (
                            <button
                              onClick={() => {
                                setUploadingDocItem(item);
                                setUploadFileName(
                                  item.signed_doc_name ||
                                    `KAK_${item.unit_kerja.replace(/\s+/g, "_")}_${item.kodifikasi}_Signed.pdf`
                                );
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#dcfce7] text-[#059669] border border-[#34d399] text-xs font-bold flex items-center gap-1.5 hover:bg-[#bbf7d0] transition-colors shadow-sm cursor-pointer"
                              title={`Dokumen TTE Terunggah: ${item.signed_doc_name}. Klik untuk mengganti.`}
                            >
                              <FileCheck className="h-3.5 w-3.5 text-[#059669]" />
                              <span>✓ TTD Uploaded</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setUploadingDocItem(item);
                                setUploadFileName(
                                  `KAK_${item.unit_kerja.replace(/\s+/g, "_")}_${item.kodifikasi}_Signed.pdf`
                                );
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              title="Upload Dokumen KAK TTD Elektronik (Wajib untuk Approve/Kirim ke BINCANG)"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              <span>Upload TTD *</span>
                            </button>
                          )
                        ) : item.is_doc_uploaded ? (
                          <button
                            onClick={() => handleDownloadSignedDoc(item)}
                            className="px-3 py-1.5 rounded-xl bg-[#dcfce7] text-[#059669] border border-[#34d399] text-xs font-bold flex items-center gap-1.5 hover:bg-[#bbf7d0] transition-colors shadow-sm cursor-pointer"
                            title={`Unduh Dokumen TTE: ${item.signed_doc_name || "KAK_Signed.pdf"}`}
                          >
                            <FileCheck className="h-3.5 w-3.5 text-[#059669]" />
                            <span>✓ TTD Uploaded</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setUploadingDocItem(item);
                              setUploadFileName(
                                `KAK_${item.unit_kerja.replace(/\s+/g, "_")}_${item.kodifikasi}_Signed.pdf`
                              );
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            title="Upload Dokumen KAK TTD Elektronik"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload TTD *</span>
                          </button>
                        )}

                        {/* Tombol Hapus - Soft red square with trash icon */}
                        {(() => {
                          const isApprovedKemenkeu = item.is_approved;
                          const isRestrictedRole = ["Operator", "Approver", "BINCANG"].includes(currentUserRole);
                          const isDeleteDisabled =
                            (isApprovedKemenkeu && isRestrictedRole) || currentUserRole === "Operator";

                          let deleteTitle = "Hapus data histori pengajuan KAK";
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

                    {/* Kolom 7: Persetujuan (Pill buttons sesuai gambar) */}
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
                              title="Kirim data KAK ke Approver"
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
                                !item.is_doc_uploaded
                                  ? "bg-[#059669]/60 cursor-not-allowed"
                                  : "bg-[#059669] hover:bg-[#047857]"
                              }`}
                              title={
                                !item.is_doc_uploaded
                                  ? "Wajib Upload Dokumen TTD Elektronik dulu pada kolom Aksi"
                                  : "Setuju &amp; kirim data ke BINCANG"
                              }
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
                              className="px-3 py-1 rounded-full bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                              title="Setujui KAK &amp; proses pengajuan ke Kemenkeu"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>SETUJU</span>
                            </button>
                          </div>
                        ) : item.owner === "Approver" ? (
                          <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd]">
                            <span>Proses Review Approver</span>
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

      {/* ── Modal Cetak KAK ── */}
      {selectedPrintItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <Printer className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="text-base font-bold text-[var(--text)]">
                  Cetak Dokumen Kerangka Acuan Kerja (TOR)
                </h3>
              </div>
              <button
                onClick={() => setSelectedPrintItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview KAK Lembar Kerja */}
            <div className="bg-white text-black p-8 rounded-xl border border-slate-300 font-serif text-xs leading-relaxed space-y-6 shadow-inner">
              <div className="text-center space-y-1 border-b pb-4 border-black">
                <div className="font-bold tracking-wider text-sm uppercase">Pusat Pelaporan dan Analisis Transaksi Keuangan</div>
                <div className="text-xs uppercase font-semibold">Kerangka Acuan Kerja (Term of Reference)</div>
                <div className="text-xs font-bold text-slate-700">Tahun Anggaran 2027</div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="font-bold col-span-1">Kementerian / Lembaga</div>
                <div className="col-span-3">: Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK)</div>

                <div className="font-bold col-span-1">Unit Organisasi Eselon I</div>
                <div className="col-span-3">: Sekretariat Utama / Deputi Bidang Analisis dan Pemeriksaan</div>

                <div className="font-bold col-span-1">Unit Kerja Eselon II</div>
                <div className="col-span-3 font-semibold">: {selectedPrintItem.unit_kerja}</div>

                <div className="font-bold col-span-1">Program</div>
                <div className="col-span-3">: Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang dan Pendanaan Terorisme</div>

                <div className="font-bold col-span-1">Status Histori / Kode</div>
                <div className="col-span-3 font-mono font-bold">: {selectedPrintItem.status_histori_full}</div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="font-bold uppercase text-[0.75rem]">I. Latar Belakang</div>
                  <p className="mt-1 text-justify leading-normal">
                    Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK) sebagai focal point rezim Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme (APUPPT) berkomitmen memastikan implementasi rencana strategis yang transparan dan akuntabel. Kerangka Acuan Kerja (KAK) ini disusun untuk memberikan pedoman pelaksanaan kegiatan {selectedPrintItem.nama_kegiatan || "operasional satuan kerja"} guna mencapai target rincian output yang ditetapkan.
                  </p>
                </div>

                <div>
                  <div className="font-bold uppercase text-[0.75rem]">II. Penerima Manfaat</div>
                  <p className="mt-1 text-justify leading-normal">
                    Penerima manfaat langsung mencakup seluruh pemangku kepentingan APUPPT, Penyedia Jasa Keuangan (PJK), Lembaga Pengawas dan Pengatur (LPP), Aparat Penegak Hukum (APH), serta masyarakat Indonesia dalam rangka menjaga integritas sistem keuangan nasional.
                  </p>
                </div>

                <div>
                  <div className="font-bold uppercase text-[0.75rem]">III. Strategi Pencapaian Keluaran (Output)</div>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>Penyusunan rencana teknis operasional dan penyiapan bahan materi kerja.</li>
                    <li>Pelaksanaan koordinasi berkala dan pengawasan implementasi target berkala.</li>
                    <li>Evaluasi efektivitas kegiatan dan penyusunan pelaporan akuntabilitas kinerja.</li>
                  </ul>
                </div>

                <div>
                  <div className="font-bold uppercase text-[0.75rem]">IV. Waktu Pelaksanaan &amp; Rincian Biaya</div>
                  <p className="mt-1">
                    Kegiatan direncanakan terlaksana pada Triwulan I s.d. Triwulan IV Tahun Anggaran 2027 dengan pagu alokasi anggaran sebesar:{" "}
                    <strong>{formatRupiah(selectedPrintItem.total_anggaran || 750000000)}</strong>.
                  </p>
                </div>
              </div>

              {/* Tanda Tangan */}
              <div className="pt-8 flex justify-end">
                <div className="text-center w-64 space-y-14">
                  <div>
                    <div>Jakarta, {selectedPrintItem.tgl_revisi.split(" ")[0] || "08 Oktober 2026"}</div>
                    <div className="font-bold">Pejabat Pembuat Komitmen / Approver,</div>
                  </div>
                  <div>
                    <div className="font-bold underline">
                      {selectedPrintItem.approved_by || "Akhyar Effendi, S.E., M.M."}
                    </div>
                    <div className="text-[0.65rem] text-slate-600">NIP. 19740512 199903 1 002</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPrintItem(null)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--accent)] cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-xl bg-[#2e1065] hover:bg-[#3b0764] text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Lembar Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Cetak Matriks Usulan Revisi (Semula - Menjadi) ── */}
      {selectedMatriksPrintItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                <Table className="h-4 w-4 text-blue-600" />
                <span>Pratinjau Cetak Matriks Usulan Revisi (Semula - Menjadi)</span>
              </h3>
              <button
                onClick={() => setSelectedMatriksPrintItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Lembar Dokumen Matriks */}
            <div className="bg-white text-black p-6 sm:p-8 rounded-xl border border-slate-300 font-serif text-xs leading-relaxed space-y-5 shadow-inner">
              <div className="text-center space-y-1 border-b pb-4 border-black">
                <div className="font-bold tracking-wider text-sm uppercase">Pusat Pelaporan dan Analisis Transaksi Keuangan</div>
                <div className="text-xs uppercase font-semibold">Matriks Perubahan Usulan Revisi Anggaran (Semula - Menjadi)</div>
                <div className="text-xs font-bold text-slate-700">Tahun Anggaran 2027</div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1 text-[0.72rem]">
                <div className="font-bold col-span-1">Satuan Kerja / Unit</div>
                <div className="col-span-3 font-semibold">: {selectedMatriksPrintItem.unit_kerja}</div>

                <div className="font-bold col-span-1">Histori / Kodifikasi</div>
                <div className="col-span-3 font-mono font-bold">: {selectedMatriksPrintItem.status_histori_full} (Sumber: {selectedMatriksPrintItem.sumber})</div>

                <div className="font-bold col-span-1">Nama Kegiatan</div>
                <div className="col-span-3">: {selectedMatriksPrintItem.nama_kegiatan || "Operasional Satker dan Peningkatan Kapasitas APUPPT"}</div>

                <div className="font-bold col-span-1">Tanggal Pengusulan</div>
                <div className="col-span-3">: {selectedMatriksPrintItem.tgl_revisi}</div>
              </div>

              {/* Tabel Matriks Semula - Menjadi */}
              <div className="border border-black overflow-x-auto">
                <table className="w-full text-left border-collapse text-[0.68rem]">
                  <thead>
                    <tr className="border-b border-black bg-slate-100 font-bold text-center">
                      <th className="p-2 border-r border-black" rowSpan={2}>Kode &amp; Uraian Akun</th>
                      <th className="p-1 border-r border-black" colSpan={2}>Semula</th>
                      <th className="p-1 border-r border-black" colSpan={2}>Menjadi</th>
                      <th className="p-2 border-r border-black" rowSpan={2}>Selisih (+/-)</th>
                      <th className="p-2" rowSpan={2}>Justifikasi / Penjelasan Revisi</th>
                    </tr>
                    <tr className="border-b border-black bg-slate-50 font-semibold text-center text-[0.65rem]">
                      <th className="p-1.5 border-r border-black">Volume</th>
                      <th className="p-1.5 border-r border-black">Alokasi (Rp)</th>
                      <th className="p-1.5 border-r border-black">Volume</th>
                      <th className="p-1.5 border-r border-black">Alokasi (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black font-sans">
                    <tr>
                      <td className="p-2 border-r border-black font-serif">
                        <div className="font-bold font-mono">521211</div>
                        <div>Belanja Bahan / Konsumsi Kegiatan Diklat APUPPT</div>
                      </td>
                      <td className="p-2 border-r border-black text-center">390 OK</td>
                      <td className="p-2 border-r border-black text-right tabular-nums">120.400.000</td>
                      <td className="p-2 border-r border-black text-center font-bold">420 OK</td>
                      <td className="p-2 border-r border-black text-right font-bold tabular-nums">129.670.000</td>
                      <td className="p-2 border-r border-black text-right font-bold text-emerald-700 tabular-nums">+9.270.000</td>
                      <td className="p-2 text-slate-700 text-[0.65rem]">Penambahan kuota 30 peserta penegak hukum daerah</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-black font-serif">
                        <div className="font-bold font-mono">522151</div>
                        <div>Belanja Jasa Profesi / Narasumber Pakar TPPU</div>
                      </td>
                      <td className="p-2 border-r border-black text-center">24 OJ</td>
                      <td className="p-2 border-r border-black text-right tabular-nums">21.600.000</td>
                      <td className="p-2 border-r border-black text-center font-bold">28 OJ</td>
                      <td className="p-2 border-r border-black text-right font-bold tabular-nums">25.200.000</td>
                      <td className="p-2 border-r border-black text-right font-bold text-emerald-700 tabular-nums">+3.600.000</td>
                      <td className="p-2 text-slate-700 text-[0.65rem]">Penyesuaian jam pelajaran materi spesialisasi pelacakan aset kripto</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-black font-serif">
                        <div className="font-bold font-mono">524111</div>
                        <div>Belanja Perjalanan Dinas Paket Meeting Dalam Kota</div>
                      </td>
                      <td className="p-2 border-r border-black text-center">1 Keg</td>
                      <td className="p-2 border-r border-black text-right tabular-nums">85.000.000</td>
                      <td className="p-2 border-r border-black text-center font-bold">1 Keg</td>
                      <td className="p-2 border-r border-black text-right font-bold tabular-nums">72.130.000</td>
                      <td className="p-2 border-r border-black text-right font-bold text-red-700 tabular-nums">-12.870.000</td>
                      <td className="p-2 text-slate-700 text-[0.65rem]">Optimalisasi dan relokasi anggaran untuk penambahan peserta diklat</td>
                    </tr>
                    <tr className="bg-slate-100 font-bold border-t border-black">
                      <td className="p-2 border-r border-black text-center uppercase" colSpan={2}>Jumlah Total Alokasi</td>
                      <td className="p-2 border-r border-black text-right tabular-nums">227.000.000</td>
                      <td className="p-2 border-r border-black text-center">-</td>
                      <td className="p-2 border-r border-black text-right tabular-nums">227.000.000</td>
                      <td className="p-2 border-r border-black text-right tabular-nums">0</td>
                      <td className="p-2 text-center text-slate-600 font-normal">Pergeseran Anggaran Dalam 1 Output (Nol Rupiah)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Catatan dan Lembar Pengesahan */}
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="space-y-1 text-[0.68rem]">
                  <div className="font-bold">Catatan Penelaahan / Review:</div>
                  <p className="text-slate-600 italic leading-snug">
                    1. Revisi tidak merubah target kinerja sasaran strategis satker.<br/>
                    2. Sumber dana revisi berasal dari efisiensi perjalanan dinas dalam keluaran yang sama.<br/>
                    3. Telah disinkronkan otomatis dengan dokumen Kerangka Acuan Kerja (KAK) dan Rencana Anggaran Biaya (RAB).
                  </p>
                </div>

                <div className="text-center space-y-12">
                  <div>
                    <div>Jakarta, {selectedMatriksPrintItem.tgl_revisi.split(" ")[0] || "08 Oktober 2026"}</div>
                    <div className="font-bold">Pejabat Pembuat Komitmen / Approver Satker,</div>
                  </div>
                  <div>
                    <div className="font-bold underline">
                      {selectedMatriksPrintItem.approved_by || "Akhyar Effendi, S.E., M.M."}
                    </div>
                    <div className="text-[0.65rem] text-slate-600">NIP. 19740512 199903 1 002</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/rab/matriks-usulan-revisi"
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5"
              >
                <span>Buka di Menu Laporan RAB &rarr;</span>
              </Link>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedMatriksPrintItem(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--accent)] cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak Matriks Usulan Revisi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Upload Dokumen TTE ── */}
      {uploadingDocItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                <Upload className="h-4 w-4 text-amber-500" />
                <span>Upload Dokumen KAK Bertanda Tangan Elektronik</span>
              </h3>
              <button onClick={() => setUploadingDocItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-[var(--border)] space-y-1">
                <div className="font-bold text-[var(--text)]">{uploadingDocItem.unit_kerja}</div>
                <div className="text-[var(--text-muted)] font-mono text-[0.7rem]">{uploadingDocItem.status_histori_full}</div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[var(--text)]">Nama File Dokumen TTE (.pdf):</label>
                <input
                  type="text"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="Contoh: KAK_Satker_DIPA_Signed.pdf"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-white dark:bg-slate-800 text-[var(--text)] font-mono text-xs"
                />
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center space-y-2">
                <FileUp className="h-8 w-8 text-amber-500 mx-auto" />
                <div className="font-semibold text-[var(--text)]">Pilih berkas PDF atau seret ke sini</div>
                <div className="text-[0.68rem] text-[var(--text-muted)]">Mendukung format PDF tersertifikasi BSrE / TTE Resmi</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setUploadingDocItem(null)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--accent)] cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveUploadedDoc}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Simpan Dokumen TTE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Konfirmasi Hapus ── */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-sm font-bold text-[var(--text)]">Konfirmasi Hapus Dokumen KAK</h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Apakah Anda yakin ingin menghapus data pengajuan KAK untuk <strong>{itemToDelete.unit_kerja}</strong> dengan status <strong>{itemToDelete.status_histori_full}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--accent)] cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Notifikasi Aksi ── */}
      {noticeModalMessage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[var(--text)]">Informasi Status</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{noticeModalMessage}</p>
            </div>
            <button
              onClick={() => setNoticeModalMessage(null)}
              className="w-full py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              OK, Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
