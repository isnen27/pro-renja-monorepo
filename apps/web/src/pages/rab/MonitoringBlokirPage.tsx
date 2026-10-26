import { useState } from "react";
import { ShieldAlert, Search, Filter, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function MonitoringBlokirPage() {
  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Penganggaran & Biaya</span>
            <span>/</span>
            <span>Rencana Anggaran Biaya (RAB)</span>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Monitoring Blokir</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-amber-600" />
            <span>Monitoring Blokir Anggaran (Tanda Bintang / DS)</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Pemantauan alokasi anggaran yang masih berstatus blokir (DS/Surat Berharga Syariah Negara) dan persyaratan pembukaan blokir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-1">
          <span className="text-[0.68rem] text-amber-700 font-bold uppercase">Total Pagu Terblokir (*):</span>
          <div className="text-xl font-black text-amber-600">Rp 0</div>
          <span className="text-[0.65rem] text-slate-500">Seluruh alokasi DIPA PPATK berstatus Open (Tanpa Tanda Bintang).</span>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-1">
          <span className="text-[0.68rem] text-emerald-700 font-bold uppercase">Pagu Efektif Siap Dibelanjakan:</span>
          <div className="text-xl font-black text-emerald-600">Rp 2.216.650.000</div>
          <span className="text-[0.65rem] text-slate-500">100% Pagu DIPA Awal berstatus aktif.</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-[var(--text)]">Daftar Akun / Komponen dengan Catatan Pemblokiran</h3>
        <p className="text-xs text-slate-500">Tidak ada pos anggaran yang diblokir oleh DJA pada DIPA aktif saat ini.</p>
      </div>
    </div>
  );
}

