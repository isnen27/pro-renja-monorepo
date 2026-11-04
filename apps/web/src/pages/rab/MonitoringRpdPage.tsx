import { useState, useEffect, useMemo } from "react";
import {
  CalendarRange,
  Search,
  Download,
  Printer,
  TrendingUp,
  BarChart2,
  Building2,
  Calculator,
  Layers,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import unitKerjaData from "../../data/unitKerjaData.json";
import informasiKinerjaData from "../../data/informasiKinerjaData.json";
import { WorksheetRow } from "./IsianRabPage";

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

interface MonthlyDistribution {
  checked: boolean[];
  values: number[];
}

export default function MonitoringRpdPage() {
  // Ambil unit kerja dari histori aktif RAB
  const [activeHistori] = useState(() => {
    try {
      const rabSaved = localStorage.getItem("rab_active_histori");
      if (rabSaved) return JSON.parse(rabSaved);
      const kakSaved = localStorage.getItem("kak_active_histori");
      if (kakSaved) return JSON.parse(kakSaved);
    } catch (e) {}
    return {
      kdsatker: "Biro Hukum dan Kerja Sama",
      kode_sts_history: "B00",
      status_histori: "DIPA Awal",
      label: "DIPA Awal - B00",
    };
  });

  const activeUnit = activeHistori.kdsatker || "Biro Hukum dan Kerja Sama";

  // Temukan singkatan unit kerja
  const ukSingkatan = useMemo(() => {
    const found = unitKerjaData.find(
      (u) =>
        u.nama.toLowerCase() === activeUnit.toLowerCase() ||
        u.singkatan.toLowerCase() === activeUnit.toLowerCase()
    );
    return found ? found.singkatan : "HUKER";
  }, [activeUnit]);

  // State penyimpanan RPD dari submenu Rencana Penarikan Dana (RPD)
  const [rpdMap, setRpdMap] = useState<Record<string, MonthlyDistribution>>({});
  const [rawRows, setRawRows] = useState<WorksheetRow[]>([]);

  // Load data yang sama persis dengan yang disimpan di submenu RPD
  useEffect(() => {
    const loadRpdData = () => {
      try {
        const savedRpd = localStorage.getItem(`rab_rpd_${ukSingkatan}`);
        if (savedRpd) {
          setRpdMap(JSON.parse(savedRpd));
        } else {
          setRpdMap({});
        }

        const savedWs = localStorage.getItem(`rab_worksheet_${ukSingkatan}`);
        if (savedWs) {
          setRawRows(JSON.parse(savedWs));
        } else {
          setRawRows([]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadRpdData();
    window.addEventListener("storage", loadRpdData);
    window.addEventListener("focus", loadRpdData);
    return () => {
      window.removeEventListener("storage", loadRpdData);
      window.removeEventListener("focus", loadRpdData);
    };
  }, [ukSingkatan]);

  // Kalkulasi agregat total RPD per bulan (sinkron 1:1 dengan kalkulasi di RpdPage)
  const totalPerBulan = useMemo(() => {
    const sums = new Array(12).fill(0);

    const activeRowIdsWithValues = Object.keys(rpdMap).filter((id) => {
      const dist = rpdMap[id];
      return dist && dist.values && dist.values.some((v) => Number(v) > 0);
    });

    if (activeRowIdsWithValues.length === 0) {
      return sums;
    }

    const detailIds = new Set(rawRows.filter((r) => r.type === "detail").map((r) => r.id));
    const hasDetailWithValues = activeRowIdsWithValues.some((id) => detailIds.has(id));

    activeRowIdsWithValues.forEach((id) => {
      const dist = rpdMap[id];
      const row = rawRows.find((r) => r.id === id);

      if (hasDetailWithValues && row) {
        if (["program", "kegiatan", "kro", "ro"].includes(row.type)) {
          return;
        }
      }

      if (dist && dist.values) {
        dist.values.forEach((v, idx) => {
          sums[idx] += Number(v) || 0;
        });
      }
    });

    return sums;
  }, [rawRows, rpdMap]);

  // Total pagu belanja dari Isian RAB
  const grandTotalPagu = useMemo(() => {
    const detailRows = rawRows.filter((r) => r.type === "detail");
    if (detailRows.length > 0) {
      return detailRows.reduce((a, b) => a + (Number(b.jumlah) || 0), 0);
    }
    const progRows = rawRows.filter((r) => r.type === "program");
    if (progRows.length > 0) {
      return progRows.reduce((a, b) => a + (Number(b.jumlah) || 0), 0);
    }
    if (rawRows.length > 0) {
      return rawRows.reduce((a, b) => a + (Number(b.jumlah) || 0), 0);
    }
    return 743651000; // default baseline pagu
  }, [rawRows]);

  const grandTotalRpd = useMemo(() => {
    return totalPerBulan.reduce((a, b) => a + b, 0);
  }, [totalPerBulan]);

  // Format compact rupiah
  const formatCompactRupiah = (val: number): string => {
    if (val === 0) return "Rp 0";
    if (val >= 1000000000) {
      return `Rp ${(val / 1000000000).toFixed(1)} M`;
    }
    if (val >= 1000000) {
      return `Rp ${(val / 1000000).toFixed(1)} Jt`;
    }
    if (val >= 1000) {
      return `Rp ${(val / 1000).toLocaleString("id-ID")}k`;
    }
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  // Kalkulasi Triwulan
  const triwulanData = useMemo(() => {
    const tw1 = (totalPerBulan[0] || 0) + (totalPerBulan[1] || 0) + (totalPerBulan[2] || 0);
    const tw2 = (totalPerBulan[3] || 0) + (totalPerBulan[4] || 0) + (totalPerBulan[5] || 0);
    const tw3 = (totalPerBulan[6] || 0) + (totalPerBulan[7] || 0) + (totalPerBulan[8] || 0);
    const tw4 = (totalPerBulan[9] || 0) + (totalPerBulan[10] || 0) + (totalPerBulan[11] || 0);
    return [
      { label: "Triwulan I (Jan - Mar)", nominal: tw1, targetPct: "15%" },
      { label: "Triwulan II (Apr - Jun)", nominal: tw2, targetPct: "40%" },
      { label: "Triwulan III (Jul - Sep)", nominal: tw3, targetPct: "70%" },
      { label: "Triwulan IV (Okt - Des)", nominal: tw4, targetPct: "100%" },
    ];
  }, [totalPerBulan]);

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-20">
      {/* ── Top Header ── */}
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
            <span>Monitoring Rencana Penarikan Dana (RPD) Bulanan</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Tampilan data agregat dan deviasi penarikan kas bulanan tersinkronisasi otomatis dari submenu{" "}
            <strong>Rencana Penarikan Dana (RPD)</strong> untuk Satker/Unit: <strong>{activeUnit}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak RPD</span>
          </button>
          <button
            onClick={() => alert("Mengunduh laporan komparasi RPD Halaman III DIPA format Excel...")}
            className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-xs hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor RPD Excel</span>
          </button>
        </div>
      </div>

      {/* ── Kartu Ringkasan Pagu & Keterisian RPD ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--border)] shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Pagu Belanja (Isian RAB)
          </span>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
            Rp {grandTotalPagu.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Satker {ukSingkatan} • {activeHistori.label}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Total RPD Terdistribusi (Hasil Input RPD)
          </span>
          <div className="text-lg font-bold font-mono text-indigo-700 dark:text-indigo-300 mt-1">
            Rp {grandTotalRpd.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-indigo-600/80 mt-1">
            {grandTotalPagu > 0 ? ((grandTotalRpd / grandTotalPagu) * 100).toFixed(1) : 0}% dari Total Pagu
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--border)] shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Selisih / Sisa Belum Terdistribusi
          </span>
          <div
            className={`text-lg font-bold font-mono mt-1 ${
              grandTotalPagu - grandTotalRpd === 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            Rp {(grandTotalPagu - grandTotalRpd).toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {grandTotalPagu - grandTotalRpd === 0 ? "Alokasi RPD 100% Klop" : "Perlu penyesuaian di submenu RPD"}
          </div>
        </div>
      </div>

      {/* ── Jadwal RPD Bulanan TA 2027 (Nilai Sama Persis dengan Submenu RPD) ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            <span>Jadwal RPD Bulanan TA 2027 (Halaman III DIPA)</span>
          </h3>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Total Kas: <strong className="text-[var(--primary)]">{formatCompactRupiah(grandTotalRpd)}</strong>
          </span>
        </div>

        {/* 12 Bulan Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {BULAN_NAMES.map((bln, idx) => {
            const nominal = totalPerBulan[idx] || 0;
            const pct =
              grandTotalPagu > 0 ? ((nominal / grandTotalPagu) * 100).toFixed(1) : "0.0";
            const isHasValue = nominal > 0;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  isHasValue
                    ? "bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 shadow-2xs"
                    : "bg-slate-50 dark:bg-slate-800/60 border-[var(--border)]"
                }`}
              >
                <span
                  className={`text-[0.68rem] font-bold uppercase ${
                    isHasValue ? "text-indigo-700 dark:text-indigo-300" : "text-slate-500"
                  }`}
                >
                  {bln}
                </span>
                <div
                  className={`font-bold font-mono text-sm mt-1 tabular-nums truncate ${
                    isHasValue ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                  }`}
                  title={`Rp ${nominal.toLocaleString("id-ID")}`}
                >
                  {formatCompactRupiah(nominal)}
                </div>
                <div
                  className={`text-[0.68rem] font-medium mt-0.5 ${
                    isHasValue
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : "text-slate-400"
                  }`}
                >
                  {pct}% Pagu
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Distribusi Kumulatif Triwulan (Target Penyerapan Anggaran) ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>Rencana Penarikan Kumulatif per Triwulan</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {triwulanData.map((tw, idx) => {
            const pct =
              grandTotalPagu > 0
                ? ((tw.nominal / grandTotalPagu) * 100).toFixed(1)
                : "0.0";

            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[var(--border)] bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  {tw.label}
                </div>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                  Rp {tw.nominal.toLocaleString("id-ID")}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Alokasi: <strong className="text-indigo-600 dark:text-indigo-400">{pct}%</strong></span>
                  <span>Target: {tw.targetPct}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
