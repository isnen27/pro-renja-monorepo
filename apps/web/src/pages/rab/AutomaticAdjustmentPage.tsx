import { useState } from "react";
import { Link } from "react-router-dom";
import {
  SlidersHorizontal,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  DollarSign,
  Building2,
  Save,
  Search,
  ArrowRight,
} from "lucide-react";
import { UserRole } from "./PilihHistoriRabPage";

export default function AutomaticAdjustmentPage() {
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

  const [aaPct, setAaPct] = useState<number>(5);
  const [targetAkun, setTargetAkun] = useState<string>("524111,521211,521219");
  const [isApplied, setIsApplied] = useState(false);

  if (!isPrivileged) {
    return (
      <div className="min-h-full p-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-base font-bold text-[var(--text)]">
              Akses Dibatasi untuk Role BINCANG & Super Admin
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Submenu <strong>Automatic Adjustment (AA)</strong> merupakan kebijakan penguncian dan pencadangan anggaran APBN Kementerian/Lembaga yang hanya dapat dikelola oleh Biro Perencanaan & Keuangan (BINCANG) dan Super Admin.
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

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Penganggaran & Biaya</span>
            <span>/</span>
            <span>Rencana Anggaran Biaya (RAB)</span>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Automatic Adjustment</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <SlidersHorizontal className="h-6 w-6 text-[var(--primary)]" />
            <span>Automatic Adjustment (Pencadangan Anggaran)</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Simulasi dan penandaan persentase Automatic Adjustment (AA) atas pos-pos belanja non-prioritas sesuai arahan Kementerian Keuangan.
          </p>
        </div>
      </div>

      {isApplied && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan Automatic Adjustment {aaPct}% berhasil diterapkan pada akun prioritas efisiensi!</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-[var(--border)] space-y-1">
            <span className="text-[0.7rem] text-slate-500 font-bold uppercase">Total Pagu Indikatif:</span>
            <div className="text-lg font-black text-slate-900 dark:text-white">Rp 2.216.650.000</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-1">
            <span className="text-[0.7rem] text-amber-700 dark:text-amber-400 font-bold uppercase">Pencadangan AA ({aaPct}%):</span>
            <div className="text-lg font-black text-amber-600">Rp {(2216650000 * (aaPct / 100)).toLocaleString("id-ID")}</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1">
            <span className="text-[0.7rem] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Sisa Pagu Efektif:</span>
            <div className="text-lg font-black text-emerald-600">Rp {(2216650000 * (1 - aaPct / 100)).toLocaleString("id-ID")}</div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[var(--text)] block mb-1">Besaran Persentase Automatic Adjustment (%):</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={aaPct}
                onChange={(e) => setAaPct(Number(e.target.value))}
                className="w-32 px-3 py-2 rounded-lg border border-[var(--border)] bg-white dark:bg-slate-800 text-[var(--text)] font-bold text-center"
              />
              <span className="text-slate-500">Persen dari total belanja barang & operasional yang dapat diefisienkan.</span>
            </div>
          </div>

          <div>
            <label className="font-bold text-[var(--text)] block mb-1">Akun Sasaran Automatic Adjustment:</label>
            <input
              type="text"
              value={targetAkun}
              onChange={(e) => setTargetAkun(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white dark:bg-slate-800 text-[var(--text)] font-mono font-semibold"
            />
            <p className="text-[0.68rem] text-slate-400 mt-1">
              Rekomendasi: 524111 (Perjalanan Dinas Biasa), 521211 (Belanja Bahan), 521219 (Non Operasional Lainnya).
            </p>
          </div>

          <button
            onClick={() => {
              setIsApplied(true);
              setTimeout(() => setIsApplied(false), 4000);
            }}
            className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow hover:opacity-90 transition-opacity cursor-pointer"
          >
            Terapkan Automatic Adjustment
          </button>
        </div>
      </div>
    </div>
  );
}

