import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  Printer,
  Calendar,
  History,
  CheckCircle2,
  X,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
  Download,
  Eye,
} from "lucide-react";
import { mockPejabat } from "../../data/ppatkData";
import unitKerjaData from "../../data/unitKerjaData.json";
import { StatusHistoriRab, UserRole } from "./PilihHistoriRabPage";

export interface MonitoringItemRab {
  id: string;
  unit_kerja: string;
  owner: "Operator" | "Approver" | "BINCANG";
  kodifikasi: string;
  tahap_status: StatusHistoriRab;
  rev_ke: number;
  status_histori_full: string;
  sumber: string;
  tgl_revisi: string;
  is_approved: boolean;
  tgl_approved?: string;
  approved_by?: string;
  is_doc_uploaded?: boolean;
  signed_doc_name?: string;
  total_anggaran: number;
  keterangan?: string;
}

const INITIAL_MONITORING_RAB: MonitoringItemRab[] = [
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
  {
    id: "hist_rab_3",
    unit_kerja: "Pusat Teknologi Informasi",
    owner: "BINCANG",
    kodifikasi: "A01",
    tahap_status: "Usulan Revisi DIPA",
    rev_ke: 1,
    status_histori_full: "A01 - Usulan Revisi DIPA - Rev ke-1",
    sumber: "B00",
    tgl_revisi: "16-10-2026 16:45 WIB",
    is_approved: true,
    tgl_approved: "17-10-2026 09:15 WIB",
    approved_by: "BINCANG",
    is_doc_uploaded: true,
    signed_doc_name: "RAB_Pustik_Revisi_Server_A01_signed.pdf",
    total_anggaran: 3820000000,
    keterangan: "Pergeseran Anggaran Infrastruktur Cloud & Security",
  },
];

function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export default function MonitoringSubmitApproveRabPage() {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("renja_e2_user_role");
      if (saved && ["Operator", "Approver", "BINCANG", "Super Admin"].includes(saved)) {
        return saved as UserRole;
      }
    } catch (e) {}
    return "BINCANG";
  });

  const isPrivileged = currentUserRole === "BINCANG" || currentUserRole === "Super Admin";

  const [monitoringList, setMonitoringList] = useState<MonitoringItemRab[]>(() => {
    try {
      const saved = localStorage.getItem("rab_monitoring_list");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_MONITORING_RAB;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "approved" | "pending">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("renja_e2_user_role", currentUserRole);
      window.dispatchEvent(new Event("renja_role_changed"));
    } catch (e) {}
  }, [currentUserRole]);

  useEffect(() => {
    try {
      localStorage.setItem("rab_monitoring_list", JSON.stringify(monitoringList));
    } catch (e) {}
  }, [monitoringList]);

  function handleApprove(id: string) {
    setMonitoringList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              is_approved: true,
              tgl_approved: new Date().toLocaleString("id-ID") + " WIB",
              approved_by: currentUserRole,
            }
          : item
      )
    );
    setActionSuccess("Data RAB berhasil disetujui (Approved)!");
    setTimeout(() => setActionSuccess(null), 3000);
  }

  function handleReject(id: string) {
    setMonitoringList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              is_approved: false,
              tgl_approved: undefined,
              approved_by: undefined,
            }
          : item
      )
    );
    setActionSuccess("Status persetujuan RAB dibatalkan / dikembalikan.");
    setTimeout(() => setActionSuccess(null), 3000);
  }

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
              <span className="text-[var(--primary)] font-semibold">Monitoring Submit & Approve</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
              <ClipboardCheck className="h-6 w-6 text-[var(--primary)]" />
              <span>Monitoring Submit &amp; Approve RAB</span>
            </h1>
          </div>
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

        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-base font-bold text-[var(--text)]">
              Akses Dibatasi untuk Role BINCANG & Super Admin
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Submenu <strong>Monitoring Submit & Approve Data RAB</strong> adalah kewenangan khusus Biro Perencanaan & Keuangan (BINCANG) dan Super Admin untuk memvalidasi dan mengesahkan seluruh usulan anggaran unit kerja.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/rab/isian"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow hover:opacity-90 transition-opacity"
            >
              <span>Kembali ke Isian RAB</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredList = monitoringList.filter((item) => {
    const matchSearch =
      item.unit_kerja.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kodifikasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tahap_status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || item.tahap_status === filterStatus;
    const matchMode =
      filterMode === "all" ||
      (filterMode === "approved" && item.is_approved) ||
      (filterMode === "pending" && !item.is_approved);
    return matchSearch && matchStatus && matchMode;
  });

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Penganggaran & Biaya</span>
            <span>/</span>
            <span>Rencana Anggaran Biaya (RAB)</span>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Monitoring Submit &amp; Approve</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <ClipboardCheck className="h-6 w-6 text-[var(--primary)]" />
            <span>Monitoring Submit &amp; Approve Data RAB</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Pantau status pengajuan, verifikasi pagu rincian belanja, dan persetujuan kodifikasi DIPA, POK, dan <strong>Angka Dasar (G00-G99)</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── Toolbar Filter ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--border)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari satker, kodifikasi, atau status..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-slate-800 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 text-[var(--text)] font-medium cursor-pointer"
          >
            <option value="all">Semua Tahap Status</option>
            <option value="Angka Dasar">Angka Dasar (G)</option>
            <option value="DIPA Awal">DIPA Awal (B)</option>
            <option value="Usulan Revisi DIPA">Usulan Revisi DIPA (A)</option>
            <option value="Usulan Revisi Satker (POK)">Revisi Satker POK (C)</option>
          </select>

          <div className="inline-flex rounded-xl border border-[var(--border)] p-1 bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterMode === "all" ? "bg-white dark:bg-slate-700 text-[var(--text)] shadow-sm" : "text-[var(--text-muted)]"
              }`}
            >
              Semua ({monitoringList.length})
            </button>
            <button
              onClick={() => setFilterMode("approved")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterMode === "approved" ? "bg-emerald-600 text-white shadow-sm" : "text-[var(--text-muted)]"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterMode("pending")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterMode === "pending" ? "bg-amber-500 text-white shadow-sm" : "text-[var(--text-muted)]"
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-4">Satuan Kerja / Unit Kerja</th>
                <th className="py-3 px-3">Kodifikasi &amp; Tahapan</th>
                <th className="py-3 px-3">Tanggal Pengajuan</th>
                <th className="py-3 px-3 text-right">Total Anggaran</th>
                <th className="py-3 px-3 text-center">Status Validasi</th>
                <th className="py-3 px-4 text-center">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[var(--text)] max-w-xs">
                    <div className="font-bold">{item.unit_kerja}</div>
                    <div className="text-[0.68rem] text-[var(--text-muted)] mt-0.5">{item.keterangan || "-"}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-[var(--primary)] border border-indigo-200 dark:border-indigo-800 text-[0.7rem]">
                      {item.kodifikasi}
                    </span>
                    <div className="text-[0.7rem] text-[var(--text-muted)] mt-1 font-medium">{item.tahap_status}</div>
                  </td>
                  <td className="py-3.5 px-3 text-[var(--text-muted)] text-[0.72rem]">
                    <div className="flex items-center gap-1 font-medium text-[var(--text)]">
                      <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                      <span>{item.tgl_revisi}</span>
                    </div>
                    <div className="text-[0.65rem] text-[var(--text-muted)] mt-0.5">Oleh: {item.owner}</div>
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatRupiah(item.total_anggaran)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {item.is_approved ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                        {item.approved_by && (
                          <div className="text-[0.62rem] text-slate-400 mt-0.5">oleh {item.approved_by}</div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <History className="w-3 h-3" />
                        <span>Menunggu Validasi</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link
                        to="/rab/isian"
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-white dark:bg-slate-800 text-[0.7rem] font-bold text-[var(--text)] hover:bg-slate-100 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Detail</span>
                      </Link>
                      {item.is_approved ? (
                        <button
                          onClick={() => handleReject(item.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-[0.7rem] font-bold text-red-600 hover:bg-red-100 cursor-pointer"
                        >
                          Batal Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[0.7rem] font-bold shadow-sm transition-colors cursor-pointer"
                        >
                          Setujui RAB
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

