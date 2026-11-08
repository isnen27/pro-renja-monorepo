import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  CalendarRange,
  Search,
  Download,
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

// Hierarki order untuk relasi parent-child
const HIERARCHY_LEVEL_ORDER = [
  "program",
  "kegiatan",
  "kro",
  "ro",
  "komponen",
  "subkomponen",
  "akun",
  "header1",
  "header2",
  "subkomponen_sub",
  "detail",
];

function getRowHierarchyLevel(row: WorksheetRow): number {
  if (row.type === "header1") return 7;
  if (row.type === "header2") return 8;
  if (row.type === "subkomponen_sub") {
    if (row.headerLevel === 1) return 7;
    if (row.headerLevel === 2) return 8;
    return 7;
  }
  const idx = HIERARCHY_LEVEL_ORDER.indexOf(row.type);
  return idx >= 0 ? idx : 99;
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

  // Helper index dan daftar anak-anak per baris untuk cascading/rollup
  const descendantMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (let i = 0; i < rawRows.length; i++) {
      const parentRow = rawRows[i];
      const parentLvl = getRowHierarchyLevel(parentRow);
      const descendants: string[] = [];
      for (let j = i + 1; j < rawRows.length; j++) {
        const childRow = rawRows[j];
        const childLvl = getRowHierarchyLevel(childRow);
        if (childLvl <= parentLvl) {
          break; // selesai hierarki anak
        }
        descendants.push(childRow.id);
      }
      map.set(parentRow.id, descendants);
    }
    return map;
  }, [rawRows]);

  // Leaf rows: baris tanpa anak
  const leafRowIds = useMemo(() => {
    const ids = new Set<string>();
    rawRows.forEach((r) => {
      const des = descendantMap.get(r.id) || [];
      if (des.length === 0) {
        ids.add(r.id);
      }
    });
    return ids;
  }, [rawRows, descendantMap]);

  // ══════════════════════════════════════════════════════════════════════════
  // CALCULATED RPD MAP (BOTTOM-UP AGGREGATION PERSIS DENGAN RPD PAGE)
  // ══════════════════════════════════════════════════════════════════════════
  const calculatedRpdMap = useMemo(() => {
    const res: Record<string, MonthlyDistribution> = {};

    // 1. Inisialisasi baris leaf terlebih dahulu
    rawRows.forEach((row) => {
      const isLeaf = leafRowIds.has(row.id);
      const stored = rpdMap[row.id];
      if (isLeaf) {
        if (stored) {
          res[row.id] = {
            checked: [...stored.checked],
            values: [...stored.values],
          };
        } else {
          res[row.id] = {
            checked: new Array(12).fill(false),
            values: new Array(12).fill(0),
          };
        }
      }
    });

    // 2. Rollup bottom-up dari indeks terbawah ke teratas
    for (let i = rawRows.length - 1; i >= 0; i--) {
      const row = rawRows[i];
      if (!leafRowIds.has(row.id)) {
        const descendants = descendantMap.get(row.id) || [];
        const leafDescendants = descendants.filter((id) => leafRowIds.has(id));

        const rolledValues = new Array(12).fill(0);
        const rolledChecked = new Array(12).fill(false);

        leafDescendants.forEach((leafId) => {
          const lDist = res[leafId];
          if (lDist) {
            lDist.values.forEach((v, m) => {
              rolledValues[m] += Number(v) || 0;
              if (lDist.checked[m] || v > 0) {
                rolledChecked[m] = true;
              }
            });
          }
        });

        res[row.id] = {
          checked: rolledChecked,
          values: rolledValues,
        };
      }
    }

    return res;
  }, [rawRows, rpdMap, leafRowIds, descendantMap]);

  // Baris hierarki yang ditampilkan: Program, Kegiatan, KRO, RO, Komponen, SubKomponen
  const hierarchyRows = useMemo(() => {
    const targetTypes = ["program", "kegiatan", "kro", "ro", "komponen", "subkomponen"];
    const filtered = rawRows.filter((r) => targetTypes.includes(r.type));

    return filtered.map((row) => {
      const dist = calculatedRpdMap[row.id] || {
        checked: new Array(12).fill(false),
        values: new Array(12).fill(0),
      };
      const monthlyValues = dist.values || new Array(12).fill(0);
      const totalRpd = monthlyValues.reduce((a, b) => a + (Number(b) || 0), 0);

      return {
        id: row.id,
        type: row.type,
        kode: row.kode,
        uraian: row.uraian,
        pagu: Number(row.jumlah) || 0,
        totalRpd,
        monthlyValues,
      };
    });
  }, [rawRows, calculatedRpdMap]);

  // Kalkulasi agregat total RPD per bulan (sinkron 1:1 dengan kalkulasi di RpdPage)
  const totalPerBulan = useMemo(() => {
    const progRow = rawRows.find((r) => r.type === "program");
    if (progRow && calculatedRpdMap[progRow.id]) {
      return calculatedRpdMap[progRow.id].values;
    }

    const sums = new Array(12).fill(0);
    rawRows.forEach((row) => {
      if (leafRowIds.has(row.id)) {
        const dist = calculatedRpdMap[row.id];
        if (dist && dist.values) {
          dist.values.forEach((v, idx) => {
            sums[idx] += Number(v) || 0;
          });
        }
      }
    });

    return sums;
  }, [rawRows, leafRowIds, calculatedRpdMap]);

  // Total pagu belanja dari Isian RAB
  const grandTotalPagu = useMemo(() => {
    const progRows = rawRows.filter((r) => r.type === "program");
    if (progRows.length > 0) {
      return progRows.reduce((a, b) => a + (Number(b.jumlah) || 0), 0);
    }
    const detailRows = rawRows.filter((r) => r.type === "detail");
    if (detailRows.length > 0) {
      return detailRows.reduce((a, b) => a + (Number(b.jumlah) || 0), 0);
    }
    let leafSum = 0;
    rawRows.forEach((r) => {
      if (leafRowIds.has(r.id)) leafSum += Number(r.jumlah) || 0;
    });
    return leafSum > 0 ? leafSum : 743651000;
  }, [rawRows, leafRowIds]);

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

  // Fungsi Ekspor RPD ke Excel
  const handleExportExcel = () => {
    if (rawRows.length === 0) {
      alert("Tidak ada data RPD untuk diekspor.");
      return;
    }

    const exportData = rawRows.map((row) => {
      const dist = calculatedRpdMap[row.id] || {
        checked: new Array(12).fill(false),
        values: new Array(12).fill(0),
      };
      const vals = dist.values || new Array(12).fill(0);
      const totalRpdRow = vals.reduce((a, b) => a + (Number(b) || 0), 0);

      const obj: Record<string, any> = {
        Tipe: row.type.toUpperCase(),
        Kode: row.kode || "-",
        Uraian: row.uraian,
        "Pagu (Rp)": Number(row.jumlah) || 0,
        "Total RPD (Rp)": totalRpdRow,
      };

      BULAN_NAMES.forEach((bln, idx) => {
        obj[bln] = vals[idx] || 0;
      });

      return obj;
    });

    // Sheet 2: Ringkasan Rekapitulasi RPD Bulanan
    const summaryData = BULAN_NAMES.map((bln, idx) => ({
      Bulan: bln,
      "Alokasi Penarikan Kas (Rp)": totalPerBulan[idx] || 0,
      "Persentase Pagu (%)": grandTotalPagu > 0 ? ((totalPerBulan[idx] / grandTotalPagu) * 100).toFixed(2) : "0.00",
    }));

    const wb = XLSX.utils.book_new();

    const wsDetailed = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, wsDetailed, "Rincian RPD");

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Jadwal RPD Bulanan");

    const fileName = `RPD_Halaman_III_DIPA_${ukSingkatan}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

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
            Tampilan data penarikan kas dalam <strong>angka eksak (Rp)</strong> terintegrasi otomatis dari submenu{" "}
            <strong>Rencana Penarikan Dana (RPD)</strong> untuk Satker/Unit: <strong>{activeUnit}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-xs hover:opacity-90 flex items-center gap-1.5 cursor-pointer transition-all"
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

      {/* ── GRAFIK PERKEMBANGAN RPD PER BULAN (Tepat di Atas Baris Jadwal RPD Bulanan TA 2027) ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Grafik Perkembangan RPD Per Bulan TA 2027</span>
          </h3>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Rerata Bulanan: <strong className="text-slate-800 dark:text-slate-200">Rp {Math.round(grandTotalRpd / 12).toLocaleString("id-ID")}</strong>
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4 pb-2">
          {(() => {
            const maxVal = Math.max(...totalPerBulan, 1);
            return (
              <div className="grid grid-cols-12 gap-2 sm:gap-3 items-end h-44 border-b border-slate-200 dark:border-slate-700 px-1 pb-1">
                {BULAN_NAMES.map((bln, idx) => {
                  const val = totalPerBulan[idx] || 0;
                  const heightPct = Math.max(6, Math.round((val / maxVal) * 100));
                  const isHasVal = val > 0;

                  return (
                    <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip Hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap font-mono">
                        {bln}: Rp {val.toLocaleString("id-ID")}
                      </div>

                      {/* Bar Value Indicator */}
                      {isHasVal && (
                        <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 font-bold mb-1 hidden sm:block truncate max-w-full">
                          {val >= 1_000_000 ? `${(val / 1_000_000).toFixed(1)}Jt` : `${Math.round(val / 1_000)}k`}
                        </span>
                      )}

                      {/* Bar Fill */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          isHasVal
                            ? "bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-indigo-700 dark:to-indigo-500 shadow-xs group-hover:from-indigo-500 group-hover:to-indigo-300"
                            : "bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Sumbu X (Label Bulan) */}
          <div className="grid grid-cols-12 gap-2 sm:gap-3 text-center mt-2">
            {BULAN_NAMES.map((bln, idx) => (
              <span
                key={idx}
                className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400"
              >
                {bln.slice(0, 3)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Rekapitulasi RPD Bulanan: Jadwal RPD Bulanan TA 2027 ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            <span>Jadwal RPD Bulanan TA 2027</span>
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

      {/* ── Rencana Penarikan Kumulatif per Triwulan (Diletakkan setelah Jadwal RPD Bulanan TA 2027) ── */}
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

      {/* ── TABEL RINCIAN PER LEVEL: PROGRAM, KEGIATAN, KRO, RO, KOMPONEN, SUBKOMPONEN (12 BULAN) ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>Rincian RPD Level SubKomponen</span>
          </h3>
          <span className="text-xs text-[var(--text-muted)]">
            Menampilkan <strong className="text-slate-800 dark:text-slate-200">{hierarchyRows.length}</strong> baris hierarki anggaran
          </span>
        </div>

        {/* Panel scroll vertikal dan horizontal dengan sticky header */}
        <div className="overflow-x-auto overflow-y-auto max-h-[560px] relative border border-slate-200 dark:border-slate-800 rounded-xl scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 shadow-xs">
              <tr>
                <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 dark:border-slate-700 min-w-[120px] text-center bg-slate-100 dark:bg-slate-800">
                  Kode
                </th>
                <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 min-w-[280px] bg-slate-100 dark:bg-slate-800">
                  Uraian Hierarki
                </th>
                <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-right min-w-[130px] bg-slate-100 dark:bg-slate-800">
                  Pagu (Rp)
                </th>
                <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-right min-w-[130px] bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                  Total RPD
                </th>
                <th colSpan={12} className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 text-center bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                  Alokasi RPD 12 Bulan (Rp)
                </th>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-850 text-[10px]">
                {BULAN_NAMES.map((bln, idx) => (
                  <th
                    key={idx}
                    className="px-2 py-2 text-center border-r border-slate-200 dark:border-slate-700 min-w-[95px] font-bold bg-slate-50 dark:bg-slate-850"
                  >
                    {bln.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {hierarchyRows.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-8 text-center text-slate-400 text-xs">
                    Belum ada data hierarki anggaran.
                  </td>
                </tr>
              ) : (
                hierarchyRows.map((row) => {
                  const rowBg =
                    row.type === "program"
                      ? "bg-indigo-50/40 dark:bg-indigo-950/20 font-bold"
                      : row.type === "kegiatan"
                      ? "bg-slate-100/60 dark:bg-slate-800/40 font-semibold"
                      : row.type === "kro"
                      ? "bg-slate-50/80 dark:bg-slate-850/60 font-medium"
                      : row.type === "ro"
                      ? "bg-amber-50/20 dark:bg-amber-950/10 font-medium"
                      : row.type === "komponen"
                      ? "bg-blue-50/20 dark:bg-blue-950/10 font-medium"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40";

                  const paddingLeft =
                    row.type === "program"
                      ? 0
                      : row.type === "kegiatan"
                      ? 8
                      : row.type === "kro"
                      ? 16
                      : row.type === "ro"
                      ? 24
                      : row.type === "komponen"
                      ? 32
                      : 40;

                  return (
                    <tr key={row.id} className={`${rowBg} transition-colors`}>
                      {/* Kode */}
                      <td className="px-3 py-2.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 align-top">
                        <span className="font-semibold">{row.kode || "-"}</span>
                      </td>

                      {/* Uraian */}
                      <td className="px-4 py-2.5 border-r border-slate-100 dark:border-slate-800 align-top">
                        <div
                          className="text-slate-900 dark:text-slate-100 line-clamp-2"
                          style={{ paddingLeft: `${paddingLeft}px` }}
                        >
                          <span className="uppercase tracking-tight text-[11px]">{row.uraian}</span>
                        </div>
                      </td>

                      {/* Pagu */}
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800 align-top whitespace-nowrap">
                        {row.pagu > 0 ? `Rp ${row.pagu.toLocaleString("id-ID")}` : "-"}
                      </td>

                      {/* Total RPD */}
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300 border-r border-slate-100 dark:border-slate-800 align-top whitespace-nowrap bg-indigo-50/20 dark:bg-indigo-950/10">
                        {row.totalRpd > 0 ? `Rp ${row.totalRpd.toLocaleString("id-ID")}` : "Rp 0"}
                      </td>

                      {/* 12 Bulan RPD */}
                      {BULAN_NAMES.map((_, mIdx) => {
                        const mVal = row.monthlyValues[mIdx] || 0;
                        return (
                          <td
                            key={mIdx}
                            className={`px-2 py-2 text-right font-mono text-[11px] border-r border-slate-100 dark:border-slate-800 align-top tabular-nums whitespace-nowrap ${
                              mVal > 0
                                ? "text-slate-900 dark:text-white font-semibold bg-indigo-50/30 dark:bg-indigo-950/20"
                                : "text-slate-400"
                            }`}
                          >
                            {mVal > 0 ? mVal.toLocaleString("id-ID") : "0"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
