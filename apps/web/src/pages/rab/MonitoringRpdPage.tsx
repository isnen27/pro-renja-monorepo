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

  // ══════════════════════════════════════════════════════════════════════════
  // EKSTRAKSI BARIS LEVEL SUBKOMPONEN (SESUAI PERMINTAAN USER)
  // "data yang ditampilkan untuk level SubKomponen, baik data per bulan maupun per triwulan"
  // ══════════════════════════════════════════════════════════════════════════
  const subkomponenList = useMemo(() => {
    const subkompRows = rawRows.filter((r) => r.type === "subkomponen");
    if (subkompRows.length > 0) {
      return subkompRows.map((sk) => {
        const dist = rpdMap[sk.id] || {
          checked: new Array(12).fill(false),
          values: new Array(12).fill(0),
        };
        const monthlyValues = dist.values || new Array(12).fill(0);
        const total = monthlyValues.reduce((a, b) => a + (Number(b) || 0), 0);

        // Triwulan Subkomponen
        const tw1 = (monthlyValues[0] || 0) + (monthlyValues[1] || 0) + (monthlyValues[2] || 0);
        const tw2 = (monthlyValues[3] || 0) + (monthlyValues[4] || 0) + (monthlyValues[5] || 0);
        const tw3 = (monthlyValues[6] || 0) + (monthlyValues[7] || 0) + (monthlyValues[8] || 0);
        const tw4 = (monthlyValues[9] || 0) + (monthlyValues[10] || 0) + (monthlyValues[11] || 0);

        return {
          id: sk.id,
          kode: sk.kode,
          uraian: sk.uraian,
          pagu: Number(sk.jumlah) || 0,
          totalRpd: total,
          monthlyValues,
          tw1,
          tw2,
          tw3,
          tw4,
        };
      });
    }

    // Default 1 subkomponen jika belum ada worksheet custom
    return [
      {
        id: "default-sk-A",
        kode: "A",
        uraian: "Penyusunan dan Implementasi Regulasi Kerja Sama",
        pagu: 181573000,
        totalRpd: 181573000,
        monthlyValues: new Array(12).fill(0),
        tw1: 0,
        tw2: 0,
        tw3: 0,
        tw4: 0,
      },
    ];
  }, [rawRows, rpdMap]);

  // Kalkulasi agregat total RPD per bulan (sinkron 1:1 dengan kalkulasi di RpdPage)
  const totalPerBulan = useMemo(() => {
    const sums = new Array(12).fill(0);

    const detailRows = rawRows.filter((r) => r.type === "detail");
    const activeBaseRows =
      detailRows.length > 0
        ? detailRows
        : rawRows.filter((r) => r.type === "subkomponen" || r.type === "komponen");

    activeBaseRows.forEach((row) => {
      const dist = rpdMap[row.id];
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
    return 743651000;
  }, [rawRows]);

  const grandTotalRpd = useMemo(() => {
    return totalPerBulan.reduce((a, b) => a + b, 0);
  }, [totalPerBulan]);

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
            Tampilan data penarikan kas dalam <strong>angka eksak (Rp)</strong> untuk level <strong>SubKomponen</strong>, tersinkronisasi otomatis dari submenu{" "}
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

      {/* ── Kartu Ringkasan Pagu & Keterisian RPD (Angka Eksak) ── */}
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

      {/* ── Rekapitulasi RPD Bulanan (Angka Eksak) ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            <span>Jadwal RPD Bulanan TA 2027 (Angka Eksak)</span>
          </h3>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Total Kas: <strong className="text-[var(--primary)] font-mono">Rp {grandTotalRpd.toLocaleString("id-ID")}</strong>
          </span>
        </div>

        {/* 12 Bulan Grid dengan Angka Eksak */}
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
                  className={`font-bold font-mono text-xs mt-1 tabular-nums truncate ${
                    isHasValue ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                  }`}
                  title={`Rp ${nominal.toLocaleString("id-ID")}`}
                >
                  Rp {nominal.toLocaleString("id-ID")}
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

      {/* ── TABEL RINCIAN PER SUBKOMPONEN (BULANAN & TRIWULAN DALAM ANGKA EKSAK) ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>Rincian RPD Level SubKomponen (Angka Eksak Bulanan & Triwulanan)</span>
          </h3>
          <span className="text-xs text-[var(--text-muted)]">
            Menampilkan <strong className="text-slate-800 dark:text-slate-200">{subkomponenList.length}</strong> SubKomponen
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-3 border-r border-slate-200 dark:border-slate-700 min-w-[50px] text-center">Kode</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 min-w-[220px]">Uraian SubKomponen</th>
                <th className="px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-right min-w-[120px]">Pagu (Rp)</th>
                <th className="px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-right min-w-[120px] bg-indigo-50/50 dark:bg-indigo-950/30">Total RPD</th>
                <th className="px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-right min-w-[100px]">Triwulan I</th>
                <th className="px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-right min-w-[100px]">Triwulan II</th>
                <th className="px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-right min-w-[100px]">Triwulan III</th>
                <th className="px-3 py-3 text-right min-w-[100px]">Triwulan IV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {subkomponenList.map((sk) => (
                <tr key={sk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 border-r border-slate-100 dark:border-slate-800 text-center">
                    {sk.kode}
                  </td>
                  <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                    <span className="font-semibold uppercase">{sk.uraian}</span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800">
                    Rp {sk.pagu.toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300 border-r border-slate-100 dark:border-slate-800 bg-indigo-50/20 dark:bg-indigo-950/10">
                    Rp {sk.totalRpd.toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                    Rp {sk.tw1.toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                    Rp {sk.tw2.toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                    Rp {sk.tw3.toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    Rp {sk.tw4.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Rencana Penarikan Kumulatif per Triwulan (Angka Eksak) ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>Rencana Penarikan Kumulatif per Triwulan (Angka Eksak)</span>
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
