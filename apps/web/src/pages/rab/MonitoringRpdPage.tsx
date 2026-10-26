import { useState } from "react";
import { CalendarRange, Search, Download, Printer, TrendingUp, BarChart2 } from "lucide-react";

const BULAN_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function MonitoringRpdPage() {
  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Penganggaran & Biaya</span>
            <span>/</span>
            <span>Rencana Anggaran Biaya (RAB)</span>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Monitoring RPD</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <CalendarRange className="h-6 w-6 text-[var(--primary)]" />
            <span>Rencana Penarikan Dana (RPD) Bulanan (Halaman III DIPA)</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Distribusi rencana penarikan kas bulanan dan deviasi realisasi anggaran triwulanan.
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow hover:opacity-90">
          Ekspor RPD Excel
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[var(--text)]">Jadwal RPD Bulanan TA 2027</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {BULAN_NAMES.map((bln, idx) => {
            const nominal = 184720833;
            return (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--border)] space-y-1">
                <span className="text-[0.68rem] font-bold text-slate-500 uppercase">{bln}</span>
                <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                  Rp {(nominal).toLocaleString("id-ID")}
                </div>
                <div className="text-[0.62rem] text-emerald-600 font-medium">8.33% Pagu</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

