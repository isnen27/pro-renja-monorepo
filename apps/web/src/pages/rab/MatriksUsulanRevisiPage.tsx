import React, { useState, useMemo, useEffect } from "react";
import {
  Printer,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  X,
  ChevronRight,
  ChevronDown,
  Info,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import unitKerjaData from "../../data/unitKerjaData.json";
import kewenanganRevisiData from "../../data/kewenanganRevisiData.json";
import { WorksheetRow } from "./IsianRabPage";

interface RevisionMonitoringItem {
  id: string;
  idRevisi: string;
  kewenangan: "KPA" | "Kanwil DJPb" | "DJA";
  kdsatker: string;
  satkerNama: string;
  kodeHistori: string;
  uraianSingkat: string;
  tujuanRevisi?: string;
  alasanPentingRevisi?: string;
  uraianKewenanganKpa?: { no: string; uraian: string; kewenangan: string }[];
  validasiPmk: boolean;
  tahap1Pengajuan: { date: string; time: string; status: "done" | "pending" | "none" };
  tahap2Penelitian: { date?: string; time?: string; status: "done" | "pending" | "none" };
  tahap3Penelaahan: { date?: string; time?: string; status: "done" | "pending" | "none" };
  tahap4Penetapan: { date?: string; time?: string; status: "done" | "pending" | "none" };
  tahapStatus: number; // 1, 2, 3, 4
  statusLabel: string;
}

export default function MatriksUsulanRevisiPage() {
  // Filter Tanggal Sesuai Gambar Referensi Pengguna
  const [startDate, setStartDate] = useState<string>("2026-10-06");
  const [endDate, setEndDate] = useState<string>("2026-11-06");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedKewenanganFilter, setSelectedKewenanganFilter] = useState<string>("Semua");

  // Modal Cetak Matriks
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [selectedItemForPrint, setSelectedItemForPrint] = useState<RevisionMonitoringItem | null>(null);

  // Ambil data unit kerja & histori aktif
  const activeHistoriObj = useMemo(() => {
    try {
      const saved = localStorage.getItem("rab_active_histori");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  }, []);

  const kodeHistori = (activeHistoriObj?.kode_sts_history || "C02").toUpperCase();
  const satkerNama = activeHistoriObj?.kdsatker || "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme";

  // Data Dummy Monitoring Revisi Sesuai Format Gambar Pengguna (ID Revisi: 2026.417654.007, Revisi: KPA)
  const [monitoringList, setMonitoringList] = useState<RevisionMonitoringItem[]>(() => {
    try {
      const saved = localStorage.getItem("rab_revisi_monitoring_list");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
    {
      id: "rev-mon-1",
      idRevisi: "2026.417654.007",
      kewenangan: "KPA",
      kdsatker: "417654",
      satkerNama: "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
      kodeHistori: "C02",
      uraianSingkat: "Pergeseran pos anggaran antar rincian belanja operasional dan honorarium kegiatan diklat semester II",
      tujuanRevisi: "Optimalisasi belanja operasional dan pergeseran pagu rincian belanja antar akun pada subkomponen yang sama guna mendukung pelaksanaan diklat semester II.",
      alasanPentingRevisi: "Pergeseran pagu rincian mendesak dilakukan untuk mencukupi kebutuhan riil honorarium narasumber dan akomodasi kegiatan diklat penegakan hukum tindak pidana pencucian uang.",
      uraianKewenanganKpa: [
        { no: "a.11", uraian: "Pergeseran anggaran antar-subkomponen dalam 1 (satu) Komponen yang sama", kewenangan: "KPA Satker (POK)" },
        { no: "a.12", uraian: "Pergeseran anggaran antar-akun dalam 1 (satu) Subkomponen yang sama", kewenangan: "KPA Satker (POK)" }
      ],
      validasiPmk: true,
      tahap1Pengajuan: { date: "23-10-2026", time: "16:24", status: "done" },
      tahap2Penelitian: { status: "none" },
      tahap3Penelaahan: { status: "none" },
      tahap4Penetapan: { date: "23-10-2026", time: "16:35", status: "done" },
      tahapStatus: 4,
      statusLabel: "Selesai Ditetapkan KPA",
    },
    {
      id: "rev-mon-2",
      idRevisi: "2026.417654.006",
      kewenangan: "KPA",
      kdsatker: "417654",
      satkerNama: "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
      kodeHistori: "C01",
      uraianSingkat: "Penyesuaian akun bahan dan konsumsi rapat pendukung koordinasi pelatihan",
      validasiPmk: true,
      tahap1Pengajuan: { date: "15-10-2026", time: "09:12", status: "done" },
      tahap2Penelitian: { status: "none" },
      tahap3Penelaahan: { status: "none" },
      tahap4Penetapan: { date: "15-10-2026", time: "11:40", status: "done" },
      tahapStatus: 4,
      statusLabel: "Selesai Ditetapkan KPA",
    },
    {
      id: "rev-mon-3",
      idRevisi: "2026.417654.005",
      kewenangan: "Kanwil DJPb",
      kdsatker: "417654",
      satkerNama: "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
      kodeHistori: "A02",
      uraianSingkat: "Revisi DIPA antar KRO percepatan implementasi kurikulum anti-money laundering",
      validasiPmk: true,
      tahap1Pengajuan: { date: "08-10-2026", time: "10:05", status: "done" },
      tahap2Penelitian: { date: "09-10-2026", time: "14:20", status: "done" },
      tahap3Penelaahan: { date: "12-10-2026", time: "11:15", status: "done" },
      tahap4Penetapan: { date: "14-10-2026", time: "15:00", status: "done" },
      tahapStatus: 4,
      statusLabel: "Disahkan Kanwil DJPb",
    },
    {
      id: "rev-mon-4",
      idRevisi: "2026.417654.008",
      kewenangan: "DJA",
      kdsatker: "417654",
      satkerNama: "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
      kodeHistori: "A03",
      uraianSingkat: "Usulan revisi anggaran antar unit kerja eselon I",
      validasiPmk: true,
      tahap1Pengajuan: { date: "02-11-2026", time: "14:10", status: "done" },
      tahap2Penelitian: { date: "04-11-2026", time: "16:45", status: "done" },
      tahap3Penelaahan: { status: "pending" },
      tahap4Penetapan: { status: "none" },
      tahapStatus: 2,
      statusLabel: "Proses Penelaahan DJA",
    },
  ];
  });

  // Listen to custom event or storage change when forum is closed
  useEffect(() => {
    const checkStorage = () => {
      try {
        const saved = localStorage.getItem("rab_revisi_monitoring_list");
        if (saved) setMonitoringList(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener("storage", checkStorage);
    window.addEventListener("rab_monitoring_updated", checkStorage);
    return () => {
      window.removeEventListener("storage", checkStorage);
      window.removeEventListener("rab_monitoring_updated", checkStorage);
    };
  }, []);

  // Filter Data Monitoring
  const filteredMonitoringList = useMemo(() => {
    return monitoringList.filter((item) => {
      if (selectedKewenanganFilter !== "Semua" && item.kewenangan !== selectedKewenanganFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.idRevisi.toLowerCase().includes(q) ||
          item.kewenangan.toLowerCase().includes(q) ||
          item.uraianSingkat.toLowerCase().includes(q) ||
          item.satkerNama.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [monitoringList, searchQuery, selectedKewenanganFilter]);

  // Buka Modal Cetak Matriks
  const handleOpenPrintModal = (item: RevisionMonitoringItem) => {
    setSelectedItemForPrint(item);
    setShowPrintModal(true);
  };

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* ── Top Header & Breadcrumb ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Penganggaran & Biaya</span>
            <span>/</span>
            <span>Rencana Anggaran Biaya (RAB)</span>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Monitoring Revisi</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-[var(--primary)]" />
            <span>Monitoring Revisi</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-2 flex-wrap">
            <span>Unit Kerja: <strong className="text-slate-800 dark:text-slate-200">{satkerNama}</strong></span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-semibold font-mono text-[11px]">
              Histori Aktif: {kodeHistori}
            </span>
          </p>
        </div>

        {/* Tombol Cetak Matriks yang direlokasi dari Submenu Revisi Anggaran */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenPrintModal(filteredMonitoringList[0] || monitoringList[0])}
            className="px-3.5 py-2 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak Matriks</span>
          </button>
        </div>
      </div>

      {/* ── KARTU MONITORING REVISI PERSIS SEPERTI GAMBAR PENGGUNA ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Header Title Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Monitoring Revisi
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {filteredMonitoringList.length} Berkas Ditemukan
          </span>
        </div>

        {/* Filter Bar: Range Tanggal S.D & Input Pencarian Sesuai Gambar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900">
          {/* Tanggal Mulai s.d. Tanggal Selesai */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-mono outline-none bg-transparent"
              />
              <span className="p-1.5 bg-blue-500 text-white flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </span>
            </div>

            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono px-1">
              S.D
            </span>

            <div className="flex items-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-mono outline-none bg-transparent"
              />
              <span className="p-1.5 bg-blue-500 text-white flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Filter Kewenangan */}
            <select
              value={selectedKewenanganFilter}
              onChange={(e) => setSelectedKewenanganFilter(e.target.value)}
              className="ml-2 px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 outline-none font-medium cursor-pointer"
            >
              <option value="Semua">Semua Kewenangan</option>
              <option value="KPA">KPA Satker</option>
              <option value="Kanwil DJPb">Kanwil DJPb</option>
              <option value="DJA">DJA</option>
            </select>
          </div>

          {/* Kotak Input Pencarian dengan Ikon Kaca Pembesar & Silang Sesuai Gambar */}
          <div className="w-full md:w-80 flex items-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
            <input
              type="text"
              placeholder="Pencarian"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="p-1.5 bg-blue-500 text-white flex items-center justify-center">
              <Search className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Tabel Monitoring Sesuai Struktur Kolom Gambar Referensi Pengguna */}
        {/* Kolom: ID Revisi | Validasi PMK | Tahap 1 (Pengajuan) | Tahap 2 (Penelitian) | Tahap 3 (Penelaahan) | Tahap 4 (Penetapan) | Tahap Status */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#24699f] text-white font-semibold text-center border-b border-[#1c5583]">
                <th className="py-2.5 px-4 text-left border-r border-blue-400/30 min-w-[240px]">
                  ID Revisi
                </th>
                <th className="py-2.5 px-2 border-r border-blue-400/30 w-[85px] text-center">
                  <div>Validasi</div>
                  <div className="text-[10px] font-normal opacity-90">PMK</div>
                </th>
                <th className="py-2.5 px-3 border-r border-blue-400/30 w-[115px] text-center">
                  <div>Tahap 1</div>
                  <div className="text-[10px] font-normal opacity-90">(Pengajuan)</div>
                </th>
                <th className="py-2.5 px-3 border-r border-blue-400/30 w-[115px] text-center">
                  <div>Tahap 2</div>
                  <div className="text-[10px] font-normal opacity-90">(Penelitian)</div>
                </th>
                <th className="py-2.5 px-3 border-r border-blue-400/30 w-[115px] text-center">
                  <div>Tahap 3</div>
                  <div className="text-[10px] font-normal opacity-90">(Penelaahan)</div>
                </th>
                <th className="py-2.5 px-3 border-r border-blue-400/30 w-[115px] text-center">
                  <div>Tahap 4</div>
                  <div className="text-[10px] font-normal opacity-90">(Penetapan)</div>
                </th>
                <th className="py-2.5 px-3 w-[85px] text-center">
                  <div>Tahap</div>
                  <div className="text-[10px] font-normal opacity-90">Status</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredMonitoringList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan data revisi yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredMonitoringList.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* ID Revisi & Keterangan Kewenangan */}
                      <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 align-middle">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleOpenPrintModal(item)}
                            className="font-bold font-mono text-sm text-[#0078d4] dark:text-blue-400 hover:underline cursor-pointer text-left"
                            title="Klik untuk membuka dokumen Matriks Revisi"
                          >
                            {item.idRevisi}
                          </button>
                          <button
                            onClick={() => handleOpenPrintModal(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Cetak Matriks Usulan Revisi Ini"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Revisi: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{item.kewenangan}</strong>
                          <span className="mx-1.5">•</span>
                          <span className="font-mono text-slate-400">Kode {item.kodeHistori}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                          {item.uraianSingkat}
                        </div>
                      </td>

                      {/* Validasi PMK: Tanda Centang */}
                      <td className="py-3 px-2 border-r border-slate-200 dark:border-slate-800 text-center align-middle font-bold text-slate-800 dark:text-slate-200">
                        {item.validasiPmk ? (
                          <span className="text-sm font-black">✓</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Tahap 1: Pengajuan (Kotak Hijau seperti di gambar jika selesai) */}
                      <td className={`py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-center align-middle ${
                        item.tahap1Pengajuan.status === "done"
                          ? "bg-[#27ae60] text-white font-mono text-[11px]"
                          : "bg-transparent text-slate-400"
                      }`}>
                        {item.tahap1Pengajuan.status === "done" ? (
                          <div className="space-y-0.5 font-medium leading-tight">
                            <div>{item.tahap1Pengajuan.date}</div>
                            <div className="text-[10px] opacity-90 flex items-center justify-center gap-0.5">
                              <Clock className="w-2.5 h-2.5 inline" />
                              <span>{item.tahap1Pengajuan.time}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Tahap 2: Penelitian */}
                      <td className={`py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-center align-middle ${
                        item.tahap2Penelitian.status === "done"
                          ? "bg-[#27ae60] text-white font-mono text-[11px]"
                          : item.tahap2Penelitian.status === "pending"
                          ? "bg-amber-100 text-amber-800 font-mono text-[11px]"
                          : "bg-transparent text-slate-400"
                      }`}>
                        {item.tahap2Penelitian.status === "done" ? (
                          <div className="space-y-0.5 font-medium leading-tight">
                            <div>{item.tahap2Penelitian.date}</div>
                            <div className="text-[10px] opacity-90 flex items-center justify-center gap-0.5">
                              <Clock className="w-2.5 h-2.5 inline" />
                              <span>{item.tahap2Penelitian.time}</span>
                            </div>
                          </div>
                        ) : item.tahap2Penelitian.status === "pending" ? (
                          <span className="text-[10px] font-bold">Proses</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Tahap 3: Penelaahan */}
                      <td className={`py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-center align-middle ${
                        item.tahap3Penelaahan.status === "done"
                          ? "bg-[#27ae60] text-white font-mono text-[11px]"
                          : item.tahap3Penelaahan.status === "pending"
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-mono text-[11px]"
                          : "bg-transparent text-slate-400"
                      }`}>
                        {item.tahap3Penelaahan.status === "done" ? (
                          <div className="space-y-0.5 font-medium leading-tight">
                            <div>{item.tahap3Penelaahan.date}</div>
                            <div className="text-[10px] opacity-90 flex items-center justify-center gap-0.5">
                              <Clock className="w-2.5 h-2.5 inline" />
                              <span>{item.tahap3Penelaahan.time}</span>
                            </div>
                          </div>
                        ) : item.tahap3Penelaahan.status === "pending" ? (
                          <span className="text-[10px] font-bold animate-pulse">Penelaahan</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Tahap 4: Penetapan (Kotak Hijau jika selesai) */}
                      <td className={`py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-center align-middle ${
                        item.tahap4Penetapan.status === "done"
                          ? "bg-[#27ae60] text-white font-mono text-[11px]"
                          : "bg-transparent text-slate-400"
                      }`}>
                        {item.tahap4Penetapan.status === "done" ? (
                          <div className="space-y-0.5 font-medium leading-tight">
                            <div>{item.tahap4Penetapan.date}</div>
                            <div className="text-[10px] opacity-90 flex items-center justify-center gap-0.5">
                              <Clock className="w-2.5 h-2.5 inline" />
                              <span>{item.tahap4Penetapan.time}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Tahap Status (Angka Besar di Kotak Hijau Sesuai Gambar: e.g. "4") */}
                      <td className="py-2 px-3 text-center align-middle bg-[#27ae60] text-white font-bold text-lg font-mono">
                        {item.tahapStatus}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL PRATINJAU CETAK MATRIKS USULAN REVISI (DIRELOKASI KE SINI) ── */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl max-w-5xl w-full p-6 space-y-4 shadow-2xl my-8 print:border-none print:shadow-none print:p-0 print:m-0">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] print:hidden">
              <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                <Printer className="h-4 w-4 text-blue-600" />
                <span>
                  Pratinjau Cetak: Matriks Usulan Revisi Anggaran ({selectedItemForPrint?.idRevisi || "2026.417654.007"})
                </span>
              </h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Lembar Dokumen Matriks Siap Cetak (Polos, Bersih, Sesuai Standar DIPA / POK) */}
            <div className="bg-white text-black p-6 sm:p-8 rounded-xl border border-slate-300 font-sans text-xs leading-relaxed space-y-4 shadow-inner print:border-none print:shadow-none print:p-0">
              {/* Kop Header Laporan */}
              <div className="text-center space-y-1 border-b-2 border-black pb-3">
                <div className="font-bold tracking-wider text-sm uppercase">
                  PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN
                </div>
                <div className="text-xs uppercase font-bold text-slate-800">
                  MATRIKS USULAN REVISI ANGGARAN (KEWENANGAN {selectedItemForPrint?.kewenangan.toUpperCase() || "KPA"})
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  TAHUN ANGGARAN 2027
                </div>
              </div>

              {/* Metadata Dokumen */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-slate-200">
                <div>
                  <div><span className="font-bold">Unit Kerja:</span> {satkerNama}</div>
                  <div><span className="font-bold">ID Dokumen Revisi:</span> <span className="font-mono font-bold text-blue-700">{selectedItemForPrint?.idRevisi}</span></div>
                  <div><span className="font-bold">Kewenangan Pengesahan:</span> {selectedItemForPrint?.kewenangan}</div>
                </div>
                <div className="text-right">
                  <div><span className="font-bold">Kode Histori:</span> {selectedItemForPrint?.kodeHistori || "C02"}</div>
                  <div><span className="font-bold">Status Penetapan:</span> {selectedItemForPrint?.statusLabel}</div>
                  <div><span className="font-bold">Tanggal Cetak:</span> {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
                </div>
              </div>

              {/* 1. TUJUAN USULAN REVISI */}
              <div className="border border-slate-300 rounded p-3 bg-slate-50/50 space-y-1">
                <div className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                  1. Tujuan Usulan Revisi
                </div>
                <div className="text-slate-800 text-[11px] leading-relaxed">
                  {selectedItemForPrint?.tujuanRevisi ||
                    "Optimalisasi alokasi belanja operasional dan pergeseran pagu rincian antar akun kegiatan pendukung tata kelola guna percepatan pencapaian target output kinerja satker."}
                </div>
              </div>

              {/* 2. PENJABARAN ALASAN PENTINGNYA USULAN REVISI */}
              <div className="border border-slate-300 rounded p-3 bg-slate-50/50 space-y-1">
                <div className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                  2. Penjabaran Alasan Pentingnya Usulan Revisi
                </div>
                <div className="text-slate-800 text-[11px] leading-relaxed">
                  {selectedItemForPrint?.alasanPentingRevisi ||
                    "Penyesuaian dan realokasi anggaran sangat mendesak dilakukan untuk mengakomodasi kebutuhan riil pelaksanaan kegiatan prioritas di lapangan yang belum tercukupi pada alokasi semula, serta mengantisipasi potensi kendala teknis dan administratif dalam pelaksanaan anggaran tahun berjalan."}
                </div>
              </div>

              {/* 3. URAIAN REVISI ANGGARAN (KEWENANGAN KPA SATKER) */}
              <div className="border border-slate-300 rounded p-3 bg-slate-50/50 space-y-1.5">
                <div className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                  3. Uraian Revisi Anggaran (Kewenangan KPA Satker)
                </div>
                <div className="text-slate-800 text-[11px]">
                  <ul className="list-disc list-inside space-y-1">
                    {selectedItemForPrint?.uraianKewenanganKpa && selectedItemForPrint.uraianKewenanganKpa.length > 0 ? (
                      selectedItemForPrint.uraianKewenanganKpa.map((item, idx) => (
                        <li key={idx}>
                          <strong>[{item.no}]</strong> {item.uraian}{" "}
                          <span className="text-slate-500 font-semibold">({item.kewenangan})</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li>
                          <strong>[a.11]</strong> Pergeseran anggaran antar-subkomponen dalam 1 (satu) Komponen yang sama{" "}
                          <span className="text-slate-500 font-semibold">(KPA Satker - POK)</span>
                        </li>
                        <li>
                          <strong>[a.12]</strong> Pergeseran anggaran antar-akun dalam 1 (satu) Subkomponen yang sama{" "}
                          <span className="text-slate-500 font-semibold">(KPA Satker - POK)</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* 4. MATRIKS REVISI */}
              <div className="space-y-1.5 pt-1">
                <div className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                  4. Matriks Revisi
                </div>
                <div className="border border-black overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-black bg-slate-100 font-bold text-center">
                        <th className="p-1.5 border-r border-black w-24" rowSpan={2}>KODE</th>
                        <th className="p-1.5 border-r border-black" rowSpan={2}>URAIAN</th>
                        <th className="p-1 border-r border-black" colSpan={3}>SEMULA</th>
                        <th className="p-1 border-r border-black" colSpan={3}>MENJADI</th>
                        <th className="p-1 border-r border-black" colSpan={3}>SELISIH</th>
                        <th className="p-1.5" rowSpan={2}>KETERANGAN</th>
                      </tr>
                      <tr className="border-b border-black bg-slate-50 font-semibold text-center text-[9px]">
                        <th className="p-1 border-r border-black w-10">Vol</th>
                        <th className="p-1 border-r border-black w-20">Jumlah</th>
                        <th className="p-1 border-r border-black w-8">@</th>
                        <th className="p-1 border-r border-black w-10">Vol</th>
                        <th className="p-1 border-r border-black w-20">Jumlah</th>
                        <th className="p-1 border-r border-black w-8">@</th>
                        <th className="p-1 border-r border-black w-10">Vol</th>
                        <th className="p-1 border-r border-black w-20">Jumlah</th>
                        <th className="p-1 border-r border-black w-8">@</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      <tr className="bg-slate-100 font-bold">
                        <td className="p-1 border-r border-black font-mono text-center">015.01.WA</td>
                        <td className="p-1 border-r border-black">PROGRAM DUKUNGAN MANAJEMEN</td>
                        <td className="p-1 border-r border-black text-center font-mono"></td>
                        <td className="p-1 border-r border-black text-right font-mono">112.500.000</td>
                        <td className="p-1 border-r border-black text-center font-mono text-slate-500">0</td>
                        <td className="p-1 border-r border-black text-center font-mono"></td>
                        <td className="p-1 border-r border-black text-right font-mono text-blue-800">112.500.000</td>
                        <td className="p-1 border-r border-black text-center font-mono text-slate-500">0</td>
                        <td className="p-1 border-r border-black text-center font-mono">0</td>
                        <td className="p-1 border-r border-black text-right font-mono">0</td>
                        <td className="p-1 border-r border-black text-center font-mono">0</td>
                        <td className="p-1 text-[9px]">-</td>
                      </tr>
                      <tr>
                        <td className="p-1 border-r border-black font-mono text-center">521211</td>
                        <td className="p-1 border-r border-black pl-3">Belanja Bahan</td>
                        <td className="p-1 border-r border-black text-center font-mono">811</td>
                        <td className="p-1 border-r border-black text-right font-mono">64.709.000</td>
                        <td className="p-1 border-r border-black text-center font-mono text-slate-500">0</td>
                        <td className="p-1 border-r border-black text-center font-mono text-blue-800">811</td>
                        <td className="p-1 border-r border-black text-right font-mono text-blue-800">62.000.000</td>
                        <td className="p-1 border-r border-black text-center font-mono text-slate-500">0</td>
                        <td className="p-1 border-r border-black text-center font-mono">0</td>
                        <td className="p-1 border-r border-black text-right font-mono font-bold text-rose-700">-2.709.000</td>
                        <td className="p-1 border-r border-black text-center font-mono">0</td>
                        <td className="p-1 text-[9px]">Pergeseran ke akun 521219 untuk pemenuhan jamuan tamu kedinasan</td>
                      </tr>
                      <tr>
                        <td className="p-1 border-r border-black font-mono text-center">521219</td>
                        <td className="p-1 border-r border-black pl-3">Belanja Barang Non Operasional Lainnya</td>
                        <td className="p-1 border-r border-black text-center font-mono">20</td>
                        <td className="p-1 border-r border-black text-right font-mono">4.491.000</td>
                        <td className="p-1 border-r border-black text-center font-mono text-slate-500">0</td>
                        <td className="p-1 border-r border-black text-center font-mono text-blue-800">20</td>
                        <td className="p-1 border-r border-black text-right font-mono text-blue-800">7.200.000</td>
                        <td className="p-1 border-r border-black text-center font-mono text-slate-500">0</td>
                        <td className="p-1 border-r border-black text-center font-mono">0</td>
                        <td className="p-1 border-r border-black text-right font-mono font-bold text-emerald-700">+2.709.000</td>
                        <td className="p-1 border-r border-black text-center font-mono">0</td>
                        <td className="p-1 text-[9px]">Penambahan alokasi jamuan tamu internasional</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Modal Action */}
            <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--accent)] cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Lembar Matriks</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
