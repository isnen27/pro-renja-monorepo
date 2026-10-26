import { useState } from "react";
import { Link } from "react-router-dom";
import {
  GitPullRequest,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  FileText,
  DollarSign,
  Plus,
} from "lucide-react";

export default function RevisiAnggaranPage() {
  const [activeTab, setActiveTab] = useState<"dipa" | "pok">("dipa");

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Penganggaran & Biaya</span>
            <span>/</span>
            <span>Rencana Anggaran Biaya (RAB)</span>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Revisi Anggaran</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <GitPullRequest className="h-6 w-6 text-[var(--primary)]" />
            <span>Pengelolaan Revisi Anggaran (DIPA &amp; POK)</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Pengajuan pergeseran anggaran antar akun, antar komponen, dan revisi administratif belanja.
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow hover:opacity-90 transition-opacity">
          + Buat Usulan Revisi Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTab("dipa")}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === "dipa"
              ? "bg-white dark:bg-slate-900 border-[var(--primary)] shadow-md"
              : "bg-slate-50 dark:bg-slate-800/40 border-[var(--border)] opacity-80"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--primary)] font-mono">Kode A01 - A99</span>
            <span className="text-[0.68rem] px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-bold">Kewenangan DJA/DJPb</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Revisi DIPA (Antar Program/KRO/Kegiatan)</h3>
          <p className="text-xs text-slate-500 mt-1">Pergeseran anggaran yang memerlukan persetujuan Direktorat Jenderal Anggaran.</p>
        </div>

        <div
          onClick={() => setActiveTab("pok")}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === "pok"
              ? "bg-white dark:bg-slate-900 border-[var(--primary)] shadow-md"
              : "bg-slate-50 dark:bg-slate-800/40 border-[var(--border)] opacity-80"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 font-mono">Kode C01 - C99</span>
            <span className="text-[0.68rem] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold">Kewenangan KPA Satker</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Revisi POK (Petunjuk Operasional Kegiatan)</h3>
          <p className="text-xs text-slate-500 mt-1">Pergeseran dalam satu akun, antar detail rincian, atau subkomponen internal satker.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[var(--text)]">Daftar Pengajuan Revisi Aktif</h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-[var(--border)]">
              <tr>
                <th className="py-2.5 px-3">No. Revisi</th>
                <th className="py-2.5 px-3">Jenis Revisi</th>
                <th className="py-2.5 px-3">Uraian Alasan Pergeseran</th>
                <th className="py-2.5 px-3 text-right">Pagu Semula</th>
                <th className="py-2.5 px-3 text-right">Pagu Menjadi</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-[var(--primary)]">REV-2027-01</td>
                <td className="py-3 px-3">Revisi POK (C01)</td>
                <td className="py-3 px-3">Optimalisasi sisa belanja bahan diklat kit ke belanja konsumsi pelatihan</td>
                <td className="py-3 px-3 text-right tabular-nums">Rp 120.000.000</td>
                <td className="py-3 px-3 text-right tabular-nums font-bold text-emerald-600">Rp 120.000.000</td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-emerald-100 text-emerald-800">Disetujui KPA</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

