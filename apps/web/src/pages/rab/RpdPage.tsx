import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarRange,
  Search,
  Download,
  Printer,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  RotateCcw,
  Save,
  Info,
  Filter,
  Layers,
  ChevronDown,
  ChevronRight,
  Calculator,
} from "lucide-react";
import unitKerjaData from "../../data/unitKerjaData.json";
import informasiKinerjaData from "../../data/informasiKinerjaData.json";
import {
  WorksheetRow,
  calculateHierarchyAmounts,
} from "./IsianRabPage";

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

// Helper ekstraksi Program, Kegiatan, KRO, RO, Komponen dari informasiKinerjaData untuk fallback
function parseInformasiKinerjaRow(ikRow: any) {
  if (!ikRow) {
    return {
      progKode: "078.01.BE",
      progUraian: "Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
      aktivitasKode: "3379",
      aktivitasUraian: "Pengelolaan Bidang Hukum dan Regulasi PPATK",
      kroKode: "3379.AAH",
      kroNama: "Peraturan lainnya",
      roKode: "BE.3379.AAH.001",
      roNama: "Penyusunan Regulasi PPATK",
      kompKode: "052",
      kompNama: "Penyusunan Dokumen Legislasi",
    };
  }

  const progMatch = (ikRow.program || "").match(/^(\d{3})[\.\s](\d{2})[\.\s]([A-Z0-9]+)\s*(.*)$/);
  const progKode = progMatch ? `${progMatch[1]}.${progMatch[2]}.${progMatch[3]}` : "078.01.BE";
  const progUraian = progMatch ? progMatch[4].trim() : (ikRow.program || "");

  const kegMatch = (ikRow.kegiatan || "").match(/^(\d{4})\s*(.*)$/);
  const aktivitasKode = kegMatch ? kegMatch[1] : "3379";
  const aktivitasUraian = kegMatch ? kegMatch[2].trim() : (ikRow.kegiatan || "");

  const kroMatch = (ikRow.kro || "").match(/^(\d{4})[\.\s]([A-Z0-9]{3})\s*(.*)$/);
  const kroKode = kroMatch ? `${aktivitasKode}.${kroMatch[2]}` : "3379.AAH";
  const kroNama = kroMatch ? kroMatch[3].trim() : (ikRow.kro || "");

  const roMatch = (ikRow.ro || "").match(/^(\d{4})[\.\s]([A-Z0-9]{3})[\.\s]([A-Z0-9]{3})\s*(.*)$/);
  const roKode = roMatch ? `BE.${aktivitasKode}.${roMatch[2]}.${roMatch[3]}` : "BE.3379.AAH.001";
  const roNama = roMatch ? roMatch[4].trim() : (ikRow.ro || "");

  const kompMatch = (ikRow.komponen || "").match(/^(\d{4})[\.\s]([A-Z0-9]{3})[\.\s]([A-Z0-9]{3})[\.\s]([A-Z0-9]{3})\s*(.*)$/) ||
                    (ikRow.komponen || "").match(/^([A-Z0-9]{3})\s*(.*)$/);
  const kompKode = kompMatch ? (kompMatch.length > 2 && kompMatch[4] ? kompMatch[4] : kompMatch[1]) : "052";
  const kompNama = kompMatch ? (kompMatch.length > 2 && kompMatch[5] ? kompMatch[5].trim() : kompMatch[2].trim()) : (ikRow.komponen || "");

  return {
    progKode, progUraian,
    aktivitasKode, aktivitasUraian,
    kroKode, kroNama,
    roKode, roNama,
    kompKode, kompNama,
  };
}

// Default initial worksheet jika user langsung mengakses RPD sebelum membuka Isian RAB
function buildFallbackWorksheet(ukSingkatan: string): WorksheetRow[] {
  const filtered = informasiKinerjaData.filter((r) => r.unitKerja === ukSingkatan);
  const ikRow = filtered[0] || informasiKinerjaData[0];
  const parsed = parseInformasiKinerjaRow(ikRow);

  const rawRows: WorksheetRow[] = [
    {
      id: "row-prog",
      type: "program",
      kode: parsed.progKode,
      uraian: parsed.progUraian,
      jumlah: 743651000,
    },
    {
      id: "row-keg",
      type: "kegiatan",
      kode: parsed.aktivitasKode,
      uraian: parsed.aktivitasUraian,
      jumlah: 743651000,
    },
    {
      id: "row-kro",
      type: "kro",
      kode: parsed.kroKode,
      uraian: parsed.kroNama,
      vol: 19,
      sat: "peraturan",
      jumlah: 743651000,
    },
    {
      id: "row-ro",
      type: "ro",
      kode: parsed.roKode,
      uraian: parsed.roNama,
      vol: 19,
      sat: "peraturan",
      jumlah: 743651000,
    },
    {
      id: "row-komp",
      type: "komponen",
      kode: parsed.kompKode,
      uraian: parsed.kompNama,
      jumlah: 578910000,
    },
    {
      id: "row-komp-054",
      type: "komponen",
      kode: "054",
      uraian: "Pengelolaan JDIH",
      jumlah: 164741000,
    },
    {
      id: "row-subkomp-A",
      type: "subkomponen",
      kode: "A",
      uraian: "Penyusunan dan Implementasi Regulasi Kerja Sama",
      jumlah: 181573000,
    },
    {
      id: "row-akun-521211",
      type: "akun",
      kode: "521211",
      uraian: "Belanja Bahan",
      jumlah: 64709000,
    },
    {
      id: "row-det-1",
      type: "detail",
      kode: "",
      uraian: "- Konsumsi Rapat Koordinasi",
      jumlah: 64443000,
    },
    {
      id: "row-det-2",
      type: "detail",
      kode: "",
      uraian: "- Souvenir Kunjungan Tamu Internasional",
      jumlah: 266000,
    },
    {
      id: "row-akun-521219",
      type: "akun",
      kode: "521219",
      uraian: "Belanja Barang Non Operasional Lainnya",
      jumlah: 4491000,
    },
    {
      id: "row-det-3",
      type: "detail",
      kode: "",
      uraian: "- Jamuan Tamu Internasional",
      jumlah: 4491000,
    },
  ];

  return calculateHierarchyAmounts(rawRows);
}

export default function RpdPage() {
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

  // Muat worksheet dari submenu Isian RAB (histori terakhir yang tersimpan)
  const [rawRows, setRawRows] = useState<WorksheetRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // State notifikasi simpan
  const [saveSuccess, setSaveSuccess] = useState(false);

  // State penyimpanan RPD per row id: { [rowId]: { checked: boolean[12], values: number[12] } }
  const [rpdMap, setRpdMap] = useState<Record<string, MonthlyDistribution>>(() => {
    try {
      const saved = localStorage.getItem(`rab_rpd_${ukSingkatan}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Load data worksheet dari localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`rab_worksheet_${ukSingkatan}`);
      if (saved) {
        const parsed: WorksheetRow[] = JSON.parse(saved);
        setRawRows(parsed);
      } else {
        // Gunakan fallback data jika belum tersimpan di localStorage
        const fallback = buildFallbackWorksheet(ukSingkatan);
        setRawRows(fallback);
      }
    } catch (e) {
      console.error(e);
      setRawRows(buildFallbackWorksheet(ukSingkatan));
    } finally {
      setLoading(false);
    }
  }, [ukSingkatan]);

  // Simpan RPD ke localStorage & beri feedback visual
  const handleSaveRpd = () => {
    try {
      localStorage.setItem(`rab_rpd_${ukSingkatan}`, JSON.stringify(rpdMap));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert("Gagal menyimpan data RPD.");
    }
  };

  // Filter baris kertas kerja: Fokus pada Output/Suboutput/Komponen/Subkomponen/Akun/Detail
  const displayRows = useMemo(() => {
    return rawRows.filter((row) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchKode = (row.kode || "").toLowerCase().includes(q);
        const matchUraian = (row.uraian || "").toLowerCase().includes(q);
        if (!matchKode && !matchUraian) return false;
      }
      if (filterType !== "all") {
        if (row.type !== filterType) return false;
      }
      return true;
    });
  }, [rawRows, searchTerm, filterType]);

  // Helper mendapatkan distribusi baris
  const getRowDistribution = (rowId: string): MonthlyDistribution => {
    if (rpdMap[rowId]) {
      return rpdMap[rowId];
    }
    return {
      checked: new Array(12).fill(false),
      values: new Array(12).fill(0),
    };
  };

  // Handler Checklist Bulan
  const handleToggleMonth = (rowId: string, monthIdx: number, rowJumlah: number) => {
    const current = getRowDistribution(rowId);
    const newChecked = [...current.checked];
    newChecked[monthIdx] = !newChecked[monthIdx];

    const activeCount = newChecked.filter(Boolean).length;
    const newValues = new Array(12).fill(0);

    if (activeCount > 0 && rowJumlah > 0) {
      // Pembagian rata ke bulan yang dicentang
      const splitAmount = Math.floor(rowJumlah / activeCount);
      const remainder = rowJumlah - splitAmount * activeCount;

      let applied = 0;
      newChecked.forEach((isChecked, idx) => {
        if (isChecked) {
          const addRemainder = applied === 0 ? remainder : 0;
          newValues[idx] = splitAmount + addRemainder;
          applied++;
        }
      });
    }

    const updated = {
      ...rpdMap,
      [rowId]: {
        checked: newChecked,
        values: newValues,
      },
    };

    setRpdMap(updated);
    try {
      localStorage.setItem(`rab_rpd_${ukSingkatan}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // Handler jika user mengetik manual angka bulan
  const handleValueChange = (rowId: string, monthIdx: number, val: number) => {
    const current = getRowDistribution(rowId);
    const newValues = [...current.values];
    newValues[monthIdx] = Math.max(0, val);

    const newChecked = [...current.checked];
    newChecked[monthIdx] = val > 0;

    const updated = {
      ...rpdMap,
      [rowId]: {
        checked: newChecked,
        values: newValues,
      },
    };

    setRpdMap(updated);
    try {
      localStorage.setItem(`rab_rpd_${ukSingkatan}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PERHITUNGAN AGREGAT RPD PER BULAN (SEPERTI WIDGET REKAPITULASI PENARIKAN KAS)
  // Menghitung seluruh baris yang diinput oleh user.
  // Jika baris berelasi induk-anak (misal komponen vs detail), kita prioritaskan baris leaf (paling spesifik)
  // agar tidak terhitung ganda. Namun jika user mencentang langsung di level komponen atau RO, tetap terhitung!
  // ══════════════════════════════════════════════════════════════════════════
  const totalPerBulan = useMemo(() => {
    const sums = new Array(12).fill(0);

    // Kumpulkan seluruh rowId yang memiliki nilai terisi > 0 di rpdMap
    const activeRowIdsWithValues = Object.keys(rpdMap).filter((id) => {
      const dist = rpdMap[id];
      return dist && dist.values && dist.values.some((v) => Number(v) > 0);
    });

    if (activeRowIdsWithValues.length === 0) {
      return sums;
    }

    // Identifikasi apakah ada level anak yang terisi di bawah level induk
    // Prioritas level spesifik: detail -> subkomponen_sub -> header2 -> header1 -> akun -> subkomponen -> komponen -> ro -> kro -> kegiatan -> program
    const detailIds = new Set(rawRows.filter((r) => r.type === "detail").map((r) => r.id));
    const hasDetailWithValues = activeRowIdsWithValues.some((id) => detailIds.has(id));

    activeRowIdsWithValues.forEach((id) => {
      const dist = rpdMap[id];
      const row = rawRows.find((r) => r.id === id);

      // Jika ada detail yang terisi, baris agregat di atas akun/detail (seperti program/kegiatan/kro/ro)
      // tidak dijumlahkan dobel jika user menginput di keduanya.
      // Jika user hanya menginput di level komponen atau ro, baris tersebut pasti ikut dijumlahkan!
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

  const grandTotalRpd = useMemo(() => {
    return totalPerBulan.reduce((a, b) => a + b, 0);
  }, [totalPerBulan]);

  const grandTotalPagu = useMemo(() => {
    const detailRows = rawRows.filter((r) => r.type === "detail");
    if (detailRows.length > 0) {
      return detailRows.reduce((a, b) => a + (Number(b.jumlah) || 0), 0);
    }
    const progRows = rawRows.filter((r) => r.type === "program");
    if (progRows.length > 0) {
      return progRows.reduce((a, b) => a + (Number(b.jumlah) || 0), 0);
    }
    return rawRows.reduce((a, b) => a + (Number(b.jumlah) || 0), 0);
  }, [rawRows]);

  // Helper pemformat angka nominal
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

  return (
    <div className="space-y-6 pb-20">
      {/* ── Top Header ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5 sm:p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 mt-0.5">
              <CalendarRange className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Rencana Penarikan Dana (RPD)
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <Calculator className="w-3.5 h-3.5" />
                  Halaman III DIPA 12 Bulan
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Unit: {activeUnit} ({ukSingkatan})
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Formulir rincian penarikan dana bulanan otomatis terintegrasi dari kertas kerja Isian RAB (histori {activeHistori.label}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveRpd}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white transition-all cursor-pointer shadow-sm ${
                saveSuccess
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>RPD Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan RPD</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Summary RPD Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Pagu Belanja (Isian RAB)
            </span>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
              Rp {grandTotalPagu.toLocaleString("id-ID")}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Total RPD Terdistribusi (12 Bulan)
            </span>
            <div className="text-lg font-bold font-mono text-indigo-700 dark:text-indigo-300 mt-1">
              Rp {grandTotalRpd.toLocaleString("id-ID")}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
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
          </div>
        </div>
      </div>

      {/* ── Mini Widget RPD Per Bulan (Agregat) - Update Real-Time saat user centang / ubah nilai / simpan ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5 overflow-hidden transition-all">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            <span>REKAPITULASI PENARIKAN KAS BULANAN (SEMUA OUTPUT/KOMPONEN)</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Total Terdistribusi: <strong className="text-indigo-600 dark:text-indigo-400">{formatCompactRupiah(grandTotalRpd)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2 text-center text-xs">
          {BULAN_NAMES.map((bln, idx) => {
            const val = totalPerBulan[idx] || 0;
            const pct =
              grandTotalPagu > 0
                ? ((val / grandTotalPagu) * 100).toFixed(1)
                : "0.0";
            const isHasValue = val > 0;

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border transition-all ${
                  isHasValue
                    ? "border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-2xs"
                    : "border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850"
                }`}
              >
                <div className={`text-[10px] font-bold uppercase ${isHasValue ? "text-indigo-700 dark:text-indigo-300" : "text-slate-500"}`}>
                  {bln.slice(0, 3)}
                </div>
                <div
                  className={`font-bold font-mono mt-1 text-[11px] truncate ${
                    isHasValue
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                  title={`Rp ${val.toLocaleString("id-ID")}`}
                >
                  {formatCompactRupiah(val)}
                </div>
                <div
                  className={`text-[10px] font-semibold mt-0.5 ${
                    isHasValue
                      ? "text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-purple-600 dark:text-purple-400"
                  }`}
                >
                  {pct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode atau uraian output/komponen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="all">Semua Hierarki</option>
            <option value="kegiatan">Kegiatan</option>
            <option value="kro">KRO (Klasifikasi Rincian Output)</option>
            <option value="ro">RO (Rincian Output)</option>
            <option value="komponen">Komponen</option>
            <option value="subkomponen">Subkomponen</option>
            <option value="akun">Akun</option>
            <option value="detail">Detail Belanja</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Menampilkan <span className="font-bold text-slate-700 dark:text-slate-300">{displayRows.length}</span> baris kertas kerja
        </div>
      </div>

      {/* ── Tabel Kertas Kerja RPD Sesuai Panduan4 ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Header 2 Baris: Baris 1 Kode, Uraian, Jumlah, RPD (Colspan 12); Baris 2: Jan s.d. Des */}
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 dark:border-slate-700 min-w-[120px] text-center">
                  Kode
                </th>
                <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 min-w-[280px]">
                  Output / Suboutput / Komponen / Subkomponen / Detail
                </th>
                <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 dark:border-slate-700 min-w-[140px] text-right">
                  Jumlah (Rp)
                </th>
                <th colSpan={12} className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 text-center bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                  Rencana Penarikan Dana (RPD)
                </th>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-850 text-[10px]">
                {BULAN_NAMES.map((bln, idx) => (
                  <th
                    key={idx}
                    className="px-2 py-2 text-center border-r border-slate-200 dark:border-slate-700 min-w-[95px] font-bold"
                  >
                    {bln.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={15} className="py-8 text-center text-slate-400 text-xs">
                    Memuat rincian kertas kerja...
                  </td>
                </tr>
              ) : displayRows.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada baris kertas kerja ditemukan. Pastikan data Isian RAB untuk unit {activeUnit} telah diisi dan disimpan.
                  </td>
                </tr>
              ) : (
                displayRows.map((row) => {
                  const isDetailOrSub = row.type === "detail" || row.type === "subkomponen" || row.type === "akun";
                  const rowJumlah = Number(row.jumlah) || 0;
                  const distribution = getRowDistribution(row.id);

                  // Penanda warna baris hierarki
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

                  return (
                    <tr key={row.id} className={`${rowBg} transition-colors`}>
                      {/* Kolom 1: Kode */}
                      <td className="px-3 py-2.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 align-top">
                        <span className="font-semibold">{row.kode || "-"}</span>
                      </td>

                      {/* Kolom 2: Uraian */}
                      <td className="px-4 py-2.5 border-r border-slate-100 dark:border-slate-800 align-top">
                        <div
                          className="text-slate-900 dark:text-slate-100 line-clamp-2"
                          style={{
                            paddingLeft: `${
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
                                : row.type === "subkomponen"
                                ? 40
                                : row.type === "akun"
                                ? 48
                                : 56
                            }px`,
                          }}
                        >
                          <span className="uppercase tracking-tight text-[11px]">{row.uraian}</span>
                        </div>
                      </td>

                      {/* Kolom 3: Jumlah */}
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800 align-top whitespace-nowrap">
                        {rowJumlah > 0 ? rowJumlah.toLocaleString("id-ID") : "-"}
                      </td>

                      {/* Kolom 4 s.d. 15: 12 Bulan RPD */}
                      {BULAN_NAMES.map((_, mIdx) => {
                        const isChecked = distribution.checked[mIdx] || false;
                        const mVal = distribution.values[mIdx] || 0;

                        return (
                          <td
                            key={mIdx}
                            className={`px-1.5 py-1.5 text-center border-r border-slate-100 dark:border-slate-800 align-top ${
                              isChecked ? "bg-indigo-50/50 dark:bg-indigo-950/30" : ""
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              {/* Checkbox Bulan */}
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleMonth(row.id, mIdx, rowJumlah)}
                                className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
                              />

                              {/* Kolom Isian Angka */}
                              <input
                                type="number"
                                value={mVal === 0 ? "" : mVal}
                                onChange={(e) =>
                                  handleValueChange(row.id, mIdx, Number(e.target.value) || 0)
                                }
                                placeholder="0"
                                className="w-full text-[10px] font-mono text-right px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
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
