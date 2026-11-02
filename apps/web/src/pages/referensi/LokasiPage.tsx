import { useState, useMemo } from "react";
import {
  MapPin,
  Download,
  Filter,
  Search,
  RefreshCw,
  Building2,
  Landmark,
  Layers,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import lokasiFullDataRaw from "../../data/lokasiFullData.json";

export interface LokasiItem {
  no: number;
  kppnKode: string;
  kppnNama: string;
  kodeLokasi: string;
  namaLokasi: string;
  kodeProvinsi: string;
  kodeKabKota: string;
  namaKabKota: string;
  fullKode: string;
}

export default function LokasiPage() {
  const [data] = useState<LokasiItem[]>(lokasiFullDataRaw);
  const [search, setSearch] = useState("");
  const [filterProvinsi, setFilterProvinsi] = useState<string>("ALL");
  const [filterKppn, setFilterKppn] = useState<string>("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // List unik Provinsi
  const provinsiList = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => set.add(d.namaLokasi));
    return Array.from(set).sort();
  }, [data]);

  // List unik KPPN
  const kppnList = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => set.add(`${d.kppnKode} - ${d.kppnNama}`));
    return Array.from(set).sort();
  }, [data]);

  // Filtered Data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Filter Provinsi
      if (filterProvinsi !== "ALL" && item.namaLokasi !== filterProvinsi) {
        return false;
      }
      // Filter KPPN
      if (filterKppn !== "ALL" && `${item.kppnKode} - ${item.kppnNama}` !== filterKppn) {
        return false;
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchSearch =
          item.kppnKode.toLowerCase().includes(q) ||
          item.kppnNama.toLowerCase().includes(q) ||
          item.namaLokasi.toLowerCase().includes(q) ||
          item.namaKabKota.toLowerCase().includes(q) ||
          item.fullKode.toLowerCase().includes(q) ||
          item.kodeLokasi.toLowerCase().includes(q);
        if (!matchSearch) return false;
      }
      return true;
    });
  }, [data, search, filterProvinsi, filterKppn]);

  // Total Halaman
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Reset page saat filter berubah
  function handleFilterChange(callback: () => void) {
    callback();
    setCurrentPage(1);
  }

  // Export Excel
  function exportToExcel() {
    const exportRows = filteredData.map((d, idx) => ({
      No: idx + 1,
      "Kode KPPN": d.kppnKode,
      "Nama KPPN": d.kppnNama,
      "Kode Lokasi": d.kodeLokasi,
      "Provinsi / Lokasi": d.namaLokasi,
      "Kode Provinsi": d.kodeProvinsi,
      "Kode Kab/Kota": d.kodeKabKota,
      "Kode Gabungan": d.fullKode,
      "Nama Kabupaten / Kota": d.namaKabKota,
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Referensi Lokasi SAKTI");
    XLSX.writeFile(wb, `Referensi_Lokasi_SAKTI_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs text-white border border-white/20 shadow-xs">
              <MapPin className="h-6 w-6 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Referensi Lokasi &amp; KPPN</h1>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-xs border border-white/30">
                  SAKTI
                </span>
              </div>
              <p className="text-xs text-sky-100/90 mt-1">
                Data master pemetaan KPPN bayar, kode lokasi provinsi, dan kabupaten/kota untuk perencanaan anggaran &amp; KRO
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Ekspor Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--muted-foreground)]">Total Baris Pemetaan</p>
              <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{data.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)] mt-2">Kombinasi KPPN &amp; Wilayah</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--muted-foreground)]">Wilayah Kab / Kota Unik</p>
              <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
                {new Set(data.map((d) => d.fullKode)).size}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)] mt-2">Kode Wilayah Standar SAKTI</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--muted-foreground)]">Jumlah Provinsi</p>
              <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{provinsiList.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)] mt-2">Seluruh Indonesia</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--muted-foreground)]">Jumlah KPPN Bayar</p>
              <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{kppnList.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)] mt-2">Kantor Pelayanan Perbendaharaan</p>
        </div>
      </div>

      {/* Filter & Kontrol Pencarian */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Kolom Pencarian */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
              placeholder="Cari nama kabupaten/kota, provinsi, KPPN, atau kode lokasi (misal: 01.51, Jakarta, Depok)..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-4 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => handleFilterChange(() => setSearch(""))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <Filter className="h-3.5 w-3.5" />
              <span>Provinsi:</span>
            </div>
            <select
              value={filterProvinsi}
              onChange={(e) => handleFilterChange(() => setFilterProvinsi(e.target.value))}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Provinsi ({provinsiList.length})</option>
              {provinsiList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] ml-2">
              <span>KPPN:</span>
            </div>
            <select
              value={filterKppn}
              onChange={(e) => handleFilterChange(() => setFilterKppn(e.target.value))}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[200px]"
            >
              <option value="ALL">Semua KPPN ({kppnList.length})</option>
              {kppnList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>

            {(search || filterProvinsi !== "ALL" || filterKppn !== "ALL") && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterProvinsi("ALL");
                  setFilterKppn("ALL");
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--accent)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--accent)]/80 transition-colors cursor-pointer"
                title="Reset Semua Filter"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Info Hasil Filter */}
        <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)] pt-1">
          <span>
            Menampilkan <strong>{filteredData.length}</strong> dari total <strong>{data.length}</strong> data referensi lokasi
          </span>
          <div className="flex items-center gap-2">
            <span>Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-[11px] text-[var(--foreground)]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Data Lokasi */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--accent)] text-[var(--muted-foreground)] font-semibold">
                <th className="w-12 px-3 py-3 text-center">No</th>
                <th className="w-28 px-3 py-3 text-center">Kode KPPN</th>
                <th className="px-4 py-3">Nama KPPN</th>
                <th className="w-24 px-3 py-3 text-center">Kode Lokasi</th>
                <th className="px-4 py-3">Provinsi / Lokasi</th>
                <th className="w-28 px-3 py-3 text-center bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300">
                  Kode Wilayah
                </th>
                <th className="px-4 py-3 font-bold text-[var(--foreground)]">Kabupaten / Kota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-sans">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-[var(--muted-foreground)] italic">
                    Tidak ditemukan data lokasi yang cocok dengan kata kunci atau filter pencarian Anda.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={`${item.kppnKode}-${item.fullKode}-${idx}`}
                      className="hover:bg-[var(--accent)]/50 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-center font-mono text-[11px] text-[var(--muted-foreground)]">
                        {rowNumber}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-[var(--foreground)]">
                        {item.kppnKode}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-[var(--foreground)]">
                        {item.kppnNama}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-[var(--muted-foreground)]">
                        {item.kodeLokasi}
                      </td>
                      <td className="px-4 py-2.5 text-[var(--muted-foreground)]">
                        {item.namaLokasi}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20">
                        {item.fullKode}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-[var(--foreground)]">
                        {item.namaKabKota}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Navigasi Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--background)] px-4 py-3 text-xs text-[var(--muted-foreground)]">
            <div>
              Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold hover:bg-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                    if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-7 w-7 rounded-md font-mono text-xs font-bold transition-colors cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-[var(--border)] hover:bg-[var(--accent)] text-[var(--foreground)]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold hover:bg-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>Berikutnya</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
