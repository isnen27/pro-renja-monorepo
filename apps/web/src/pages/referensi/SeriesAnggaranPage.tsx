import { useState, useMemo } from "react";
import {
  TrendingUp,
  Download,
  Filter,
  Layers,
  Table as TableIcon,
  PieChart as PieChartIcon,
  Search,
  CheckSquare,
  Square,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Building,
  Target,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import seriesAnggaranRaw from "../../data/seriesAnggaranData.json";

// Format currency
function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatMiliar(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(2) + " T";
  }
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + " M";
  }
  return formatRupiah(num);
}

// Tipe baris data series anggaran
export interface SeriesItem {
  tahun: number;
  kl: string;
  satker: string;
  program: string;
  kegiatan: string;
  kro: string;
  ro: string;
  komponen: string;
  akun2: string;
  akun3: string;
  akun6: string;
  pagu: number;
  blokir: number;
  realisasi: number;
}

// Konfigurasi Kolom yang dapat dipilih seperti Pivot Table
interface ColumnConfig {
  key: keyof SeriesItem | "persen" | "sisa";
  label: string;
  category: "dimensi" | "nilai";
  defaultVisible: boolean;
  align?: "left" | "center" | "right";
  isNumeric?: boolean;
}

const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { key: "tahun", label: "Tahun", category: "dimensi", defaultVisible: true, align: "center" },
  { key: "satker", label: "Satuan Kerja", category: "dimensi", defaultVisible: true, align: "left" },
  { key: "program", label: "Program", category: "dimensi", defaultVisible: true, align: "left" },
  { key: "kegiatan", label: "Kegiatan", category: "dimensi", defaultVisible: false, align: "left" },
  { key: "kro", label: "Output (KRO)", category: "dimensi", defaultVisible: false, align: "left" },
  { key: "ro", label: "Sub Output (RO)", category: "dimensi", defaultVisible: false, align: "left" },
  { key: "komponen", label: "Komponen", category: "dimensi", defaultVisible: false, align: "left" },
  { key: "akun2", label: "Akun 2-Digit", category: "dimensi", defaultVisible: true, align: "left" },
  { key: "akun3", label: "Akun 3-Digit", category: "dimensi", defaultVisible: false, align: "left" },
  { key: "akun6", label: "Akun 6-Digit", category: "dimensi", defaultVisible: true, align: "left" },
  { key: "pagu", label: "Pagu Anggaran (Rp)", category: "nilai", defaultVisible: true, align: "right", isNumeric: true },
  { key: "blokir", label: "Pagu Blokir (Rp)", category: "nilai", defaultVisible: false, align: "right", isNumeric: true },
  { key: "realisasi", label: "Realisasi Belanja (Rp)", category: "nilai", defaultVisible: true, align: "right", isNumeric: true },
  { key: "persen", label: "% Realisasi", category: "nilai", defaultVisible: true, align: "center", isNumeric: true },
  { key: "sisa", label: "Sisa Anggaran (Rp)", category: "nilai", defaultVisible: false, align: "right", isNumeric: true },
];

export default function SeriesAnggaranPage() {
  const allData: SeriesItem[] = seriesAnggaranRaw as SeriesItem[];

  // Filter States
  const [selectedTahun, setSelectedTahun] = useState<number | "all">("all");
  const [selectedSatker, setSelectedSatker] = useState<string>("all");
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [selectedAkun2, setSelectedAkun2] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pivot Table Column Selection
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key)
  );
  const [showColumnChooser, setShowColumnChooser] = useState(false);

  // Group By (Pivot Aggregation Level)
  const [groupByField, setGroupByField] = useState<"detail" | "tahun" | "satker" | "program" | "akun2">("detail");

  // Sorting & Pagination
  const [sortField, setSortField] = useState<string>("pagu");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Active View Tab: "pivot_table" vs "dashboard_charts"
  const [activeTab, setActiveTab] = useState<"table" | "dashboard">("table");

  // Extract Unique Filter Options
  const satkerOptions = useMemo(() => {
    const set = new Set<string>();
    allData.forEach((d) => d.satker && set.add(d.satker));
    return Array.from(set).sort();
  }, [allData]);

  const programOptions = useMemo(() => {
    const set = new Set<string>();
    allData.forEach((d) => d.program && set.add(d.program));
    return Array.from(set).sort();
  }, [allData]);

  const akun2Options = useMemo(() => {
    const set = new Set<string>();
    allData.forEach((d) => d.akun2 && set.add(d.akun2));
    return Array.from(set).sort();
  }, [allData]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return allData.filter((item) => {
      if (selectedTahun !== "all" && item.tahun !== selectedTahun) return false;
      if (selectedSatker !== "all" && item.satker !== selectedSatker) return false;
      if (selectedProgram !== "all" && item.program !== selectedProgram) return false;
      if (selectedAkun2 !== "all" && item.akun2 !== selectedAkun2) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const str = `${item.program} ${item.kegiatan} ${item.kro} ${item.ro} ${item.komponen} ${item.akun6} ${item.satker}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [allData, selectedTahun, selectedSatker, selectedProgram, selectedAkun2, searchQuery]);

  // Aggregated KPI Stats
  const kpiStats = useMemo(() => {
    let totalPagu = 0;
    let totalBlokir = 0;
    let totalRealisasi = 0;

    filteredData.forEach((d) => {
      totalPagu += d.pagu || 0;
      totalBlokir += d.blokir || 0;
      totalRealisasi += d.realisasi || 0;
    });

    const sisa = totalPagu - totalRealisasi;
    const persen = totalPagu > 0 ? (totalRealisasi / totalPagu) * 100 : 0;

    return { totalPagu, totalBlokir, totalRealisasi, sisa, persen, totalRows: filteredData.length };
  }, [filteredData]);

  // Annual Summary for Trend Charts
  const annualTrends = useMemo(() => {
    const map = new Map<number, { tahun: number; pagu: number; realisasi: number; blokir: number }>();
    [2020, 2021, 2022, 2023, 2024, 2025].forEach((y) => {
      map.set(y, { tahun: y, pagu: 0, realisasi: 0, blokir: 0 });
    });

    allData.forEach((d) => {
      if (map.has(d.tahun)) {
        const item = map.get(d.tahun)!;
        item.pagu += d.pagu || 0;
        item.realisasi += d.realisasi || 0;
        item.blokir += d.blokir || 0;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.tahun - b.tahun);
  }, [allData]);

  // Program Breakdown for Charts
  const programBreakdown = useMemo(() => {
    const map = new Map<string, { label: string; pagu: number; realisasi: number }>();
    filteredData.forEach((d) => {
      const progKey = d.program || "Lainnya";
      const cleanLabel = progKey.replace(/^078\s+\d+\s+[A-Z0-9]+\s+/i, "");
      if (!map.has(progKey)) {
        map.set(progKey, { label: cleanLabel, pagu: 0, realisasi: 0 });
      }
      const p = map.get(progKey)!;
      p.pagu += d.pagu || 0;
      p.realisasi += d.realisasi || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.pagu - a.pagu);
  }, [filteredData]);

  // Akun 2 Digit Breakdown
  const akunBreakdown = useMemo(() => {
    const map = new Map<string, { label: string; pagu: number; realisasi: number }>();
    filteredData.forEach((d) => {
      const akun = d.akun2 || "52 Belanja Barang";
      if (!map.has(akun)) {
        map.set(akun, { label: akun, pagu: 0, realisasi: 0 });
      }
      const a = map.get(akun)!;
      a.pagu += d.pagu || 0;
      a.realisasi += d.realisasi || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.pagu - a.pagu);
  }, [filteredData]);

  // Pivot Grouped or Detailed Data
  const displayedRows = useMemo(() => {
    if (groupByField === "detail") {
      // Sorting
      const sorted = [...filteredData].sort((a: any, b: any) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === "persen") {
          valA = a.pagu > 0 ? a.realisasi / a.pagu : 0;
          valB = b.pagu > 0 ? b.realisasi / b.pagu : 0;
        } else if (sortField === "sisa") {
          valA = (a.pagu || 0) - (a.realisasi || 0);
          valB = (b.pagu || 0) - (b.realisasi || 0);
        }
        if (valA === valB) return 0;
        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }
        return sortDirection === "asc"
          ? String(valA || "").localeCompare(String(valB || ""))
          : String(valB || "").localeCompare(String(valA || ""));
      });
      return sorted;
    }

    // Pivot Group Aggregation
    const groupMap = new Map<string, any>();
    filteredData.forEach((d: any) => {
      const gKey = String(d[groupByField] || "Lainnya");
      if (!groupMap.has(gKey)) {
        groupMap.set(gKey, {
          [groupByField]: gKey,
          tahun: groupByField === "tahun" ? d.tahun : "Multi-Tahun",
          satker: groupByField === "satker" ? d.satker : "-",
          program: groupByField === "program" ? d.program : "-",
          kegiatan: "-",
          kro: "-",
          ro: "-",
          komponen: "-",
          akun2: groupByField === "akun2" ? d.akun2 : "-",
          akun3: "-",
          akun6: "-",
          pagu: 0,
          blokir: 0,
          realisasi: 0,
          itemCount: 0,
        });
      }
      const agg = groupMap.get(gKey)!;
      agg.pagu += d.pagu || 0;
      agg.blokir += d.blokir || 0;
      agg.realisasi += d.realisasi || 0;
      agg.itemCount += 1;
    });

    const list = Array.from(groupMap.values());
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === "persen") {
        valA = a.pagu > 0 ? a.realisasi / a.pagu : 0;
        valB = b.pagu > 0 ? b.realisasi / b.pagu : 0;
      } else if (sortField === "sisa") {
        valA = a.pagu - a.realisasi;
        valB = b.pagu - b.realisasi;
      }
      if (valA === valB) return 0;
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      return sortDirection === "asc"
        ? String(valA || "").localeCompare(String(valB || ""))
        : String(valB || "").localeCompare(String(valA || ""));
    });
    return list;
  }, [filteredData, groupByField, sortField, sortDirection]);

  // Paginated Rows
  const totalPages = Math.ceil(displayedRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedRows.slice(start, start + pageSize);
  }, [displayedRows, currentPage, pageSize]);

  // Toggle Column Visibility
  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedTahun("all");
    setSelectedSatker("all");
    setSelectedProgram("all");
    setSelectedAkun2("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Handle Export to Excel (.xlsx)
  const handleExportXlsx = () => {
    const exportData = displayedRows.map((row: any) => {
      const obj: Record<string, any> = {};
      AVAILABLE_COLUMNS.filter((c) => visibleColumns.includes(c.key)).forEach((col) => {
        if (col.key === "persen") {
          const pct = row.pagu > 0 ? ((row.realisasi / row.pagu) * 100).toFixed(2) : "0.00";
          obj[col.label] = `${pct}%`;
        } else if (col.key === "sisa") {
          obj[col.label] = (row.pagu || 0) - (row.realisasi || 0);
        } else {
          obj[col.label] = row[col.key] ?? "";
        }
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Series_Anggaran");

    const fileName = `Series_Anggaran_PPATK_${selectedTahun === "all" ? "2020-2025" : selectedTahun}_Export.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Handle Export to CSV (.csv)
  const handleExportCsv = () => {
    const activeCols = AVAILABLE_COLUMNS.filter((c) => visibleColumns.includes(c.key));
    const headerRow = activeCols.map((c) => `"${c.label}"`).join(",");

    const rows = displayedRows.map((row: any) => {
      return activeCols
        .map((col) => {
          let val = "";
          if (col.key === "persen") {
            val = row.pagu > 0 ? `${((row.realisasi / row.pagu) * 100).toFixed(2)}%` : "0.00%";
          } else if (col.key === "sisa") {
            val = String((row.pagu || 0) - (row.realisasi || 0));
          } else {
            val = String(row[col.key] ?? "");
          }
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = [headerRow, ...rows].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Series_Anggaran_PPATK_${selectedTahun === "all" ? "2020-2025" : selectedTahun}_Export.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── HEADER BANNER ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-blue-300" />
              <span>Database Referensi Seri Historis (2020–2025)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Series Anggaran PPATK
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Eksplorasi interaktif tren alokasi Pagu DIPA, Pagu Blokir, dan Realisasi Belanja PPATK tahun anggaran 2020 s.d. 2025. Dilengkapi fitur pivot custom column dan multi-format data export.
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportXlsx}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              title="Unduh data tabel dalam format Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh .XLSX</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              title="Unduh data tabel dalam format CSV (.csv)"
            >
              <Download className="w-4 h-4" />
              <span>Unduh .CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Pivot Table vs Visualisasi Grafik */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-blue-800/60">
          <button
            onClick={() => setActiveTab("table")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "table"
                ? "bg-white text-slate-900 shadow-md"
                : "bg-blue-950/60 text-slate-300 hover:bg-blue-900/60"
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Tabel & Pivot Data</span>
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-white text-slate-900 shadow-md"
                : "bg-blue-950/60 text-slate-300 hover:bg-blue-900/60"
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            <span>Dashboard & Analisis Tren</span>
          </button>
        </div>
      </div>

      {/* ── KPI HIGHLIGHT CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Pagu */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-[0.7rem] uppercase tracking-wider font-bold text-slate-400 mb-1">
            Total Pagu Alokasi
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            Rp {formatRupiah(kpiStats.totalPagu)}
          </div>
          <div className="text-[0.68rem] text-slate-500 mt-1 flex items-center gap-1">
            <span>Setara:</span>
            <strong className="text-blue-600 dark:text-blue-400 font-bold">{formatMiliar(kpiStats.totalPagu)}</strong>
          </div>
        </div>

        {/* Total Realisasi */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-[0.7rem] uppercase tracking-wider font-bold text-slate-400 mb-1">
            Total Realisasi Belanja
          </div>
          <div className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            Rp {formatRupiah(kpiStats.totalRealisasi)}
          </div>
          <div className="text-[0.68rem] text-slate-500 mt-1 flex items-center gap-1">
            <span>Persentase Capaian:</span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{kpiStats.persen.toFixed(2)}%</strong>
          </div>
        </div>

        {/* Sisa Anggaran */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-[0.7rem] uppercase tracking-wider font-bold text-slate-400 mb-1">
            Sisa Alokasi Anggaran
          </div>
          <div className="text-xl md:text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
            Rp {formatRupiah(kpiStats.sisa)}
          </div>
          <div className="text-[0.68rem] text-slate-500 mt-1 flex items-center gap-1">
            <span>Selisih:</span>
            <strong className="text-indigo-700 dark:text-indigo-300 font-bold">{formatMiliar(kpiStats.sisa)}</strong>
          </div>
        </div>

        {/* Total Baris Terindeks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-[0.7rem] uppercase tracking-wider font-bold text-slate-400 mb-1">
            Dataset Terindeks
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {kpiStats.totalRows.toLocaleString("id-ID")}{" "}
            <span className="text-xs font-normal text-slate-400">baris</span>
          </div>
          <div className="text-[0.68rem] text-slate-500 mt-1 flex items-center gap-1">
            <span>Rentang Waktu:</span>
            <strong className="text-slate-700 dark:text-slate-300 font-bold">2020 – 2025</strong>
          </div>
        </div>
      </div>

      {/* ── FILTER & CONTROLS TOOLBAR ─────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {/* Filter Tahun */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 font-medium">Tahun:</span>
              <select
                value={selectedTahun}
                onChange={(e) => {
                  setSelectedTahun(e.target.value === "all" ? "all" : Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="all">Semua Tahun (2020–2025)</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>

            {/* Filter Satker */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 font-medium">Satker:</span>
              <select
                value={selectedSatker}
                onChange={(e) => {
                  setSelectedSatker(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-bold text-slate-800 dark:text-slate-200 outline-none max-w-[200px] truncate cursor-pointer"
              >
                <option value="all">Semua Satuan Kerja</option>
                {satkerOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Akun 2 Digit */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 font-medium">Jenis Belanja:</span>
              <select
                value={selectedAkun2}
                onChange={(e) => {
                  setSelectedAkun2(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-bold text-slate-800 dark:text-slate-200 outline-none max-w-[180px] truncate cursor-pointer"
              >
                <option value="all">Semua Jenis Belanja</option>
                {akun2Options.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filter Button */}
            {(selectedTahun !== "all" || selectedSatker !== "all" || selectedProgram !== "all" || selectedAkun2 !== "all" || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          {/* Search Bar & Column Chooser */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari program, output, akun..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Pivot Columns Chooser Button */}
            <div className="relative">
              <button
                onClick={() => setShowColumnChooser(!showColumnChooser)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showColumnChooser
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                }`}
                title="Pilih kolom yang akan ditampilkan seperti Pivot Table"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Pilih Kolom ({visibleColumns.length})</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Column Chooser Modal Dropdown */}
              {showColumnChooser && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kolom Tampilan Pivot</span>
                    </span>
                    <button
                      onClick={() => setVisibleColumns(AVAILABLE_COLUMNS.map((c) => c.key))}
                      className="text-[0.68rem] text-blue-600 font-semibold hover:underline"
                    >
                      Pilih Semua
                    </button>
                  </div>

                  {/* Dimensi */}
                  <div className="space-y-1">
                    <div className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                      Dimensi Klasifikasi
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {AVAILABLE_COLUMNS.filter((c) => c.category === "dimensi").map((col) => {
                        const isChecked = visibleColumns.includes(col.key);
                        return (
                          <label
                            key={col.key}
                            className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[0.72rem] font-medium cursor-pointer transition-colors ${
                              isChecked
                                ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200"
                                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleColumn(col.key)}
                              className="w-3 h-3 accent-blue-600"
                            />
                            <span className="truncate">{col.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nilai / Metrik */}
                  <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                      Metrik & Nilai Anggaran
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {AVAILABLE_COLUMNS.filter((c) => c.category === "nilai").map((col) => {
                        const isChecked = visibleColumns.includes(col.key);
                        return (
                          <label
                            key={col.key}
                            className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[0.72rem] font-medium cursor-pointer transition-colors ${
                              isChecked
                                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleColumn(col.key)}
                              className="w-3 h-3 accent-emerald-600"
                            />
                            <span className="truncate">{col.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => setShowColumnChooser(false)}
                      className="px-3 py-1 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg text-xs font-bold"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pivot Grouping Selector */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex-wrap">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Kelompokkan Agregasi (Pivot Group):</span>
          </span>
          <div className="flex items-center gap-1">
            {[
              { id: "detail", label: "Baris Detail (Tanpa Agregasi)" },
              { id: "tahun", label: "Per Tahun Anggaran" },
              { id: "satker", label: "Per Satuan Kerja" },
              { id: "program", label: "Per Program" },
              { id: "akun2", label: "Per Jenis Belanja (Akun 2-Digit)" },
            ].map((grp) => (
              <button
                key={grp.id}
                onClick={() => {
                  setGroupByField(grp.id as any);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  groupByField === grp.id
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {grp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB 1: PIVOT TABLE DATA ──────────────────────────────────── */}
      {activeTab === "table" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-3 w-12 text-center border-r border-slate-200 dark:border-slate-700">No</th>
                  {AVAILABLE_COLUMNS.filter((c) => visibleColumns.includes(c.key)).map((col) => (
                    <th
                      key={col.key}
                      onClick={() => {
                        if (sortField === col.key) {
                          setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                        } else {
                          setSortField(col.key);
                          setSortDirection("desc");
                        }
                      }}
                      className={`py-3 px-3.5 border-r border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors select-none whitespace-nowrap ${
                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-1.5 ${
                          col.align === "right"
                            ? "justify-end"
                            : col.align === "center"
                            ? "justify-center"
                            : "justify-start"
                        }`}
                      >
                        <span>{col.label}</span>
                        {sortField === col.key ? (
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-50" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 1} className="py-12 text-center text-slate-400">
                      Tidak ada data yang sesuai dengan kriteria filter saat ini.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row: any, idx: number) => {
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                    const persenVal = row.pagu > 0 ? (row.realisasi / row.pagu) * 100 : 0;
                    const sisaVal = (row.pagu || 0) - (row.realisasi || 0);

                    return (
                      <tr
                        key={row.id || `${rowNumber}-${idx}`}
                        className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors group"
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 border-r border-slate-200 dark:border-slate-800 font-mono text-[0.7rem]">
                          {rowNumber}
                        </td>
                        {AVAILABLE_COLUMNS.filter((c) => visibleColumns.includes(c.key)).map((col) => {
                          if (col.key === "tahun") {
                            return (
                              <td
                                key={col.key}
                                className="py-2.5 px-3.5 text-center font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800"
                              >
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-mono text-[0.7rem]">
                                  {row.tahun}
                                </span>
                              </td>
                            );
                          }

                          if (col.key === "pagu") {
                            return (
                              <td
                                key={col.key}
                                className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 tabular-nums whitespace-nowrap"
                              >
                                {formatRupiah(row.pagu || 0)}
                              </td>
                            );
                          }

                          if (col.key === "realisasi") {
                            return (
                              <td
                                key={col.key}
                                className="py-2.5 px-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-slate-800 tabular-nums whitespace-nowrap"
                              >
                                {formatRupiah(row.realisasi || 0)}
                              </td>
                            );
                          }

                          if (col.key === "blokir") {
                            return (
                              <td
                                key={col.key}
                                className="py-2.5 px-3.5 text-right font-mono text-slate-500 border-r border-slate-200 dark:border-slate-800 tabular-nums whitespace-nowrap"
                              >
                                {formatRupiah(row.blokir || 0)}
                              </td>
                            );
                          }

                          if (col.key === "sisa") {
                            return (
                              <td
                                key={col.key}
                                className="py-2.5 px-3.5 text-right font-mono font-semibold text-indigo-600 dark:text-indigo-400 border-r border-slate-200 dark:border-slate-800 tabular-nums whitespace-nowrap"
                              >
                                {formatRupiah(sisaVal)}
                              </td>
                            );
                          }

                          if (col.key === "persen") {
                            const isGood = persenVal >= 90;
                            const isMed = persenVal >= 75 && persenVal < 90;
                            return (
                              <td
                                key={col.key}
                                className="py-2.5 px-3.5 text-center border-r border-slate-200 dark:border-slate-800 whitespace-nowrap"
                              >
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold text-[0.7rem] font-mono ${
                                    isGood
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                                      : isMed
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                                      : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                                  }`}
                                >
                                  {persenVal.toFixed(2)}%
                                </span>
                              </td>
                            );
                          }

                          // Text Dimensi Biasa
                          return (
                            <td
                              key={col.key}
                              className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 max-w-xs truncate"
                              title={String(row[col.key] || "")}
                            >
                              {row[col.key] || "-"}
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

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 gap-3 text-xs">
            <div className="flex items-center gap-3 text-slate-500">
              <span>
                Menampilkan{" "}
                <strong className="text-slate-900 dark:text-white">
                  {displayedRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
                  {Math.min(currentPage * pageSize, displayedRows.length)}
                </strong>{" "}
                dari <strong className="text-slate-900 dark:text-white">{displayedRows.length.toLocaleString("id-ID")}</strong> baris data
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <div className="flex items-center gap-1.5">
                <span>Per halaman:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Navigasi Tombol Halaman */}
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                « Awal
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                ‹ Prev
              </button>
              <span className="px-3 py-1 font-bold text-slate-900 dark:text-white font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Next ›
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Akhir »
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: DASHBOARD & ANALISIS TREN (2020 - 2025) ───────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Grafik 1: Tren Pagu vs Realisasi Tahunan */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tren Pagu vs Realisasi Tahunan (2020 – 2025)
                </h3>
                <p className="text-xs text-slate-500">
                  Perbandingan nominal DIPA alokasi dan realisasi serapan anggaran PPATK per tahun anggaran
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-blue-600" />
                  <span>Pagu DIPA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span>Realisasi</span>
                </div>
              </div>
            </div>

            {/* Custom Interactive SVG / Bar Chart Representation */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-3">
              {annualTrends.map((yr) => {
                const pct = yr.pagu > 0 ? (yr.realisasi / yr.pagu) * 100 : 0;
                const maxVal = 420_000_000_000;
                const paguHeight = Math.min(100, Math.round((yr.pagu / maxVal) * 100));
                const realHeight = Math.min(100, Math.round((yr.realisasi / maxVal) * 100));

                return (
                  <div
                    key={yr.tahun}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between hover:border-blue-300 transition-all shadow-xs"
                  >
                    <div className="text-center font-bold text-sm text-slate-900 dark:text-white mb-2">
                      TA {yr.tahun}
                    </div>

                    {/* Bar visualization */}
                    <div className="h-28 flex items-end justify-center gap-2 py-1">
                      <div
                        style={{ height: `${paguHeight}%` }}
                        className="w-5 bg-blue-600 rounded-t transition-all"
                        title={`Pagu TA ${yr.tahun}: Rp ${formatRupiah(yr.pagu)}`}
                      />
                      <div
                        style={{ height: `${realHeight}%` }}
                        className="w-5 bg-emerald-500 rounded-t transition-all"
                        title={`Realisasi TA ${yr.tahun}: Rp ${formatRupiah(yr.realisasi)}`}
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-center space-y-1">
                      <div className="text-[0.65rem] text-slate-400">Pagu: {formatMiliar(yr.pagu)}</div>
                      <div className="text-[0.68rem] font-bold text-emerald-600 dark:text-emerald-400">
                        Real: {formatMiliar(yr.realisasi)}
                      </div>
                      <div className="text-[0.7rem] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 inline-block font-mono">
                        {pct.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown Program & Akun Belanja */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Program Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Distribusi Anggaran Berdasarkan Program
              </h3>
              <div className="space-y-3">
                {programBreakdown.map((prog, idx) => {
                  const pctOfTotal = kpiStats.totalPagu > 0 ? (prog.pagu / kpiStats.totalPagu) * 100 : 0;
                  const serapan = prog.pagu > 0 ? (prog.realisasi / prog.pagu) * 100 : 0;
                  return (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-tight">
                          {prog.label}
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {formatMiliar(prog.pagu)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${pctOfTotal}%` }}
                          className="bg-blue-600 h-full rounded-full transition-all"
                        />
                      </div>
                      <div className="flex justify-between items-center text-[0.68rem] text-slate-500">
                        <span>Porsi Alokasi: {pctOfTotal.toFixed(1)}%</span>
                        <span>
                          Realisasi: {formatMiliar(prog.realisasi)} (<strong>{serapan.toFixed(1)}%</strong>)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Akun 2 Digit Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Komposisi Belanja (Akun 2-Digit)
              </h3>
              <div className="space-y-3">
                {akunBreakdown.map((item, idx) => {
                  const pct = kpiStats.totalPagu > 0 ? (item.pagu / kpiStats.totalPagu) * 100 : 0;
                  const serapan = item.pagu > 0 ? (item.realisasi / item.pagu) * 100 : 0;
                  return (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {item.label}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          Rp {formatRupiah(item.pagu)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${pct}%` }}
                          className="bg-emerald-500 h-full rounded-full transition-all"
                        />
                      </div>
                      <div className="flex justify-between items-center text-[0.68rem] text-slate-500">
                        <span>Porsi: {pct.toFixed(1)}%</span>
                        <span>
                          Realisasi: Rp {formatRupiah(item.realisasi)} (<strong>{serapan.toFixed(1)}%</strong>)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

