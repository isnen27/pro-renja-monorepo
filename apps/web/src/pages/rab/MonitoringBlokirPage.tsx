import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  ArrowRight,
  SlidersHorizontal,
  Info,
  Layers,
} from "lucide-react";
import { JENIS_BLOKIR_OPTIONS } from "./AutomaticAdjustmentPage";

interface BlokirItem {
  id: string;
  kode: string;
  uraian: string;
  jumlah: number;
  blokir: number;
  jenisBlokir: string;
  unitKerja: string;
  tglBlokir?: string;
}

export default function MonitoringBlokirPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("Semua Unit");

  // Baca data blokir dari localStorage yang disimpan oleh BINCANG / Super Admin di Automatic Adjustment
  const [blockedItems, setBlockedItems] = useState<BlokirItem[]>(() => {
    try {
      const saved = localStorage.getItem("rab_monitoring_blokir_data");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem("rab_monitoring_blokir_data");
        if (saved) setBlockedItems(JSON.parse(saved));
        else setBlockedItems([]);
      } catch (e) {}
    };

    window.addEventListener("storage", handleStorageUpdate);
    window.addEventListener("rab_aa_updated", handleStorageUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("rab_aa_updated", handleStorageUpdate);
    };
  }, []);

  const totalPaguDipa = 2216650000;
  const totalBlokir = useMemo(() => {
    return blockedItems.reduce((acc, curr) => acc + (Number(curr.blokir) || 0), 0);
  }, [blockedItems]);

  const effectivePagu = Math.max(0, totalPaguDipa - totalBlokir);

  const filteredItems = useMemo(() => {
    return blockedItems.filter((item) => {
      if (selectedUnit !== "Semua Unit" && item.unitKerja !== selectedUnit) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.kode.toLowerCase().includes(q) ||
          item.uraian.toLowerCase().includes(q) ||
          item.unitKerja.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [blockedItems, selectedUnit, searchQuery]);

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* ── Top Header & Breadcrumb ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Penganggaran &amp; Biaya</span>
            <span>/</span>
            <span>Rencana Anggaran Biaya (RAB)</span>
            <span>/</span>
            <span>Laporan RAB</span>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Monitoring Blokir</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-amber-600" />
            <span>Monitoring Blokir Anggaran (Tanda Bintang / DS / AA)</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Pemantauan seluruh alokasi anggaran yang berstatus blokir (tanda bintang '*') hasil penetapan Automatic Adjustment atau ketentuan Kementerian Keuangan.
          </p>
        </div>

        <Link
          to="/rab/automatic-adjustment"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Kelola Automatic Adjustment</span>
        </Link>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1.5 shadow-xs">
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
            Total Pagu Terblokir (* / @):
          </span>
          <div className="text-2xl font-black text-amber-600 font-mono">
            Rp {totalBlokir.toLocaleString("id-ID")}
          </div>
          <span className="text-[11px] text-slate-500">
            {blockedItems.length > 0
              ? `${blockedItems.length} pos anggaran dibekukan penggunaannya.`
              : "Nihil. Belum ada pos anggaran yang diblokir."}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5 shadow-xs">
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
            Pagu Efektif Siap Dibelanjakan:
          </span>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            Rp {effectivePagu.toLocaleString("id-ID")}
          </div>
          <span className="text-[11px] text-slate-500">
            Alokasi riil yang tersedia untuk pelaksanaan kegiatan.
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-1.5 shadow-xs">
          <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider">
            Total Alokasi DIPA Indikatif:
          </span>
          <div className="text-2xl font-black text-blue-600 font-mono">
            Rp {totalPaguDipa.toLocaleString("id-ID")}
          </div>
          <span className="text-[11px] text-slate-500">
            Pagu total DIPA TA 2027 (tidak berkurang oleh blokir).
          </span>
        </div>
      </div>

      {/* ── Tabel Monitoring Blokir ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode atau uraian pos terblokir..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-slate-800 text-[var(--text)] text-xs w-full sm:w-72"
            />
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Total {filteredItems.length} pos anggaran terdaftar
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Tidak Ada Pos Anggaran yang Sedang Diblokir
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Seluruh pos anggaran pada DIPA aktif saat ini berstatus terbuka (*T / bebas blokir). Pemblokiran dapat dikonfigurasi melalui menu <strong>Automatic Adjustment</strong> oleh role BINCANG atau Super Admin.
            </p>
          </div>
        ) : (
          <div className="border border-black overflow-x-auto rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#24699f] text-white font-bold text-center border-b border-black">
                  <th className="py-2.5 px-3 border-r border-blue-400/40 w-32">KODE</th>
                  <th className="py-2.5 px-3 border-r border-blue-400/40 text-left min-w-[280px]">
                    OUTPUT / SUBOUTPUT / KOMPONEN / SUBKOMPONEN
                  </th>
                  <th className="py-2.5 px-3 border-r border-blue-400/40 w-32 text-center">UNIT KERJA</th>
                  <th className="py-2.5 px-3 border-r border-blue-400/40 w-36 text-right">TOTAL PAGU (Rp)</th>
                  <th className="py-2.5 px-3 border-r border-blue-400/40 w-36 text-right bg-amber-700 text-white">
                    PAGU DIBLOKIR (*) (Rp)
                  </th>
                  <th className="py-2.5 px-3 border-r border-blue-400/40 text-left min-w-[320px]">
                    JENIS / ALASAN PEMBLOKIRAN
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-sans">
                {filteredItems.map((item) => {
                  const jenisObj = JENIS_BLOKIR_OPTIONS.find((j) => j.kode === item.jenisBlokir);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-mono text-center font-bold">
                        {item.kode || "-"}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700">
                        <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="text-amber-600 font-bold">*</span>
                          <span>{item.uraian}</span>
                        </div>
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-center font-mono font-bold text-slate-600 dark:text-slate-400">
                        {item.unitKerja}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right font-mono text-slate-500">
                        {item.jumlah.toLocaleString("id-ID")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-right font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/20">
                        {item.blokir.toLocaleString("id-ID")}
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300">
                        {jenisObj?.label || item.jenisBlokir}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
