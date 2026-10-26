import { useState } from "react";
import { Table, Search, Download, Printer, ArrowRightLeft, FileSpreadsheet } from "lucide-react";

export default function MatriksUsulanRevisiPage() {
  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Penganggaran & Biaya</span>
            <span>/</span>
            <span>Rencana Anggaran Biaya (RAB)</span>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Matriks Usulan Revisi</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <Table className="h-6 w-6 text-[var(--primary)]" />
            <span>Matriks Perubahan Usulan Revisi (Semula - Menjadi)</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Matriks komparasi komprehensif alokasi belanja semula vs menjadi beserta justifikasi revisi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3.5 py-2 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-sm">
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak Matriks</span>
          </button>
          <button className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow hover:opacity-90 flex items-center gap-1.5">
            <Download className="w-4 h-4" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center text-xs">
          <span className="font-bold text-[var(--text)]">Matriks Komparasi Semula - Menjadi</span>
          <span className="text-slate-500">Satker: Pusdiklat APU PPT (417654)</span>
        </div>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-[var(--border)]">
              <tr>
                <th className="py-2.5 px-3">Kode Akun &amp; Item</th>
                <th className="py-2.5 px-3 text-center">Vol Semula</th>
                <th className="py-2.5 px-3 text-right">Pagu Semula</th>
                <th className="py-2.5 px-3 text-center">Vol Menjadi</th>
                <th className="py-2.5 px-3 text-right">Pagu Menjadi</th>
                <th className="py-2.5 px-3 text-right">Selisih (+/-)</th>
                <th className="py-2.5 px-3">Justifikasi Revisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-mono font-bold text-[var(--primary)]">521211</div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">Makan Peserta Diklat</div>
                </td>
                <td className="py-3 px-3 text-center">390 OK</td>
                <td className="py-3 px-3 text-right tabular-nums">Rp 120.400.000</td>
                <td className="py-3 px-3 text-center font-bold text-indigo-600">420 OK</td>
                <td className="py-3 px-3 text-right tabular-nums font-bold text-indigo-600">Rp 129.670.000</td>
                <td className="py-3 px-3 text-right font-bold text-emerald-600 tabular-nums">+Rp 9.270.000</td>
                <td className="py-3 px-3 text-slate-500 text-[0.68rem]">Penambahan kuota 30 peserta penegak hukum daerah</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

