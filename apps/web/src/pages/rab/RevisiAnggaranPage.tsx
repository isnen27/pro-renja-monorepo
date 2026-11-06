import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  GitPullRequest,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  FileText,
  DollarSign,
  Plus,
  Save,
  Printer,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
  Layers,
  Table as TableIcon,
  X,
  FileSpreadsheet,
} from "lucide-react";
import unitKerjaData from "../../data/unitKerjaData.json";
import { WorksheetRow } from "./IsianRabPage";

export default function RevisiAnggaranPage() {
  const [activeTab, setActiveTab] = useState<"dipa" | "pok">("dipa");

  // Identifikasi Unit Kerja user
  const [userUnit] = useState<string>(() => {
    try {
      const role = localStorage.getItem("renja_e2_user_role") || "Operator";
      if (role === "Super Admin") {
        return "PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN";
      }
      const rabSaved = localStorage.getItem("rab_active_histori");
      if (rabSaved) {
        const p = JSON.parse(rabSaved);
        if (p.kdsatker) return p.kdsatker;
      }
      const kakSaved = localStorage.getItem("kak_active_histori");
      if (kakSaved) {
        const p = JSON.parse(kakSaved);
        if (p.kdsatker) return p.kdsatker;
      }
      const renjaSaved = localStorage.getItem("renja_e2_active_histori");
      if (renjaSaved) {
        const p = JSON.parse(renjaSaved);
        if (p.unit_kerja) return p.unit_kerja;
      }
    } catch (e) {}
    return "PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN";
  });

  const ukSingkatan = useMemo(() => {
    const found = unitKerjaData.find(
      (u) =>
        u.nama.toLowerCase() === userUnit.toLowerCase() ||
        u.singkatan.toLowerCase() === userUnit.toLowerCase()
    );
    return found ? found.singkatan : "BIRU";
  }, [userUnit]);

  // Nomor revisi
  const [revisiSemulaKe, setRevisiSemulaKe] = useState<string>("10");
  const [revisiMenjadiKe, setRevisiMenjadiKe] = useState<string>("08");

  // Filter drill down: s.d. level mana yang ditampilkan
  const [maxHierarchyLevel, setMaxHierarchyLevel] = useState<
    "program" | "kegiatan" | "kro" | "ro" | "komponen" | "subkomponen" | "akun"
  >("akun");

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Kertas kerja dari Isian RAB
  const [rawRows, setRawRows] = useState<WorksheetRow[]>([]);

  // Keterangan revisi (hanya wajib di level akun)
  const [keteranganMap, setKeteranganMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`rab_revisi_keterangan_${ukSingkatan}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      "row-akun-524111": "Pergeseran anggaran perjalanan dinas biasa untuk koordinasi teknis percepatan output regulasi APU PPT.",
      "row-akun-524113": "Optimalisasi biaya transport lokal dalam rangka kegiatan rapat penyusunan SOP tata kelola.",
      "row-akun-521211": "Penyesuaian kebutuhan bahan pendukung operasional perkantoran.",
    };
  });

  // Nilai perubahan 'Menjadi' per baris akun
  const [customMenjadiMap, setCustomMenjadiMap] = useState<Record<string, { vol?: number; jumlah?: number; blokir?: number }>>(() => {
    try {
      const saved = localStorage.getItem(`rab_revisi_menjadi_${ukSingkatan}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Alert simpan
  const [saveStatus, setSaveStatus] = useState<string>("");

  // State collapse per baris
  const [collapsedRows, setCollapsedRows] = useState<Record<string, boolean>>({});

  // Muat worksheet dari Isian RAB
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`rab_worksheet_${ukSingkatan}`);
      if (saved) {
        const parsed: WorksheetRow[] = JSON.parse(saved);
        setRawRows(parsed);
        return;
      }
    } catch (e) {}

    // Fallback default jika belum ada data Isian RAB
    const fallbackRows: WorksheetRow[] = [
      {
        id: "row-prog-078.01.WA",
        type: "program",
        kode: "078.01.WA",
        uraian: "PROGRAM DUKUNGAN MANAJEMEN",
        jumlah: 733980500,
        vol: 1,
      },
      {
        id: "row-keg-3377",
        type: "kegiatan",
        kode: "3377",
        uraian: "PENYELENGGARAAN KETATAUSAHAAN, KERUMAHTANGGAAN, PERLENGKAPAN PPATK",
        jumlah: 733980500,
        vol: 1,
      },
      {
        id: "row-kro-3377.EBA",
        type: "kro",
        kode: "3377.EBA",
        uraian: "LAYANAN DUKUNGAN MANAJEMEN INTERNAL",
        jumlah: 733980500,
        vol: 1,
      },
      {
        id: "row-ro-WA.3377.EBA.956",
        type: "ro",
        kode: "WA.3377.EBA.956",
        uraian: "LAYANAN BMN",
        jumlah: 733980500,
        vol: 1,
      },
      {
        id: "row-komp-051",
        type: "komponen",
        kode: "051",
        uraian: "LAYANAN MANAJEMEN BMN PPATK",
        jumlah: 587567500,
        vol: 1,
      },
      {
        id: "row-subkomp-A",
        type: "subkomponen",
        kode: "A",
        uraian: "TANPA SUB KOMPONEN",
        jumlah: 379095500,
        vol: 1,
      },
      {
        id: "row-akun-524111",
        type: "akun",
        kode: "524111",
        uraian: "BELANJA PERJALANAN DINAS BIASA",
        jumlah: 207452000,
        vol: 15,
      },
      {
        id: "row-akun-524113",
        type: "akun",
        kode: "524113",
        uraian: "BELANJA PERJALANAN DINAS DALAM KOTA",
        jumlah: 14620000,
        vol: 87,
      },
      {
        id: "row-akun-521211",
        type: "akun",
        kode: "521211",
        uraian: "BELANJA BAHAN",
        jumlah: 64709000,
        vol: 810,
      },
    ];
    setRawRows(fallbackRows);
  }, [ukSingkatan]);

  // Hierarki order rating
  const levelOrder: Record<string, number> = {
    program: 1,
    kegiatan: 2,
    kro: 3,
    ro: 4,
    komponen: 5,
    subkomponen: 6,
    subkomponen_sub: 6,
    header1: 6,
    header2: 6,
    akun: 7,
  };

  const maxLevelValue = levelOrder[maxHierarchyLevel] || 7;

  // Saring baris berdasarkan rentang level Program s.d. Akun (Detail belanja diabaikan sesuai permintaan: Program s.d. Akun)
  const displayRows = useMemo(() => {
    return rawRows.filter((r) => {
      // Abaikan detail belanja item level
      if (r.type === "detail") return false;

      // Filter berdasarkan pilihan level drill down
      const rowLevel = levelOrder[r.type] || 99;
      if (rowLevel > maxLevelValue) return false;

      // Filter berdasarkan pencarian kata kunci jika ada
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchKode = (r.kode || "").toLowerCase().includes(q);
        const matchUraian = (r.uraian || "").toLowerCase().includes(q);
        return matchKode || matchUraian;
      }

      return true;
    });
  }, [rawRows, maxLevelValue, searchQuery]);

  // Kalkulasi data baris (Semula, Menjadi, Selisih, Keterangan)
  const calculatedRows = useMemo(() => {
    return displayRows.map((row) => {
      const volSemula = Number(row.vol) || (row.type === "akun" ? 1 : 0);
      const jumlahSemula = Number(row.jumlah) || 0;
      const blokirSemula = 0; // tanda @ / blokir semula

      const custom = customMenjadiMap[row.id] || customMenjadiMap[row.kode] || {};

      // Jika ada custom 'Menjadi', gunakan itu; jika tidak, secara default sama dengan semula
      const volMenjadi = custom.vol !== undefined ? custom.vol : volSemula;
      const jumlahMenjadi = custom.jumlah !== undefined ? custom.jumlah : jumlahSemula;
      const blokirMenjadi = custom.blokir !== undefined ? custom.blokir : blokirSemula;

      // Selisih = Menjadi - Semula
      const selisihVol = volMenjadi - volSemula;
      const selisihJumlah = jumlahMenjadi - jumlahSemula;
      const selisihBlokir = blokirMenjadi - blokirSemula;

      const keterangan = keteranganMap[row.id] || keteranganMap[row.kode] || "";

      return {
        ...row,
        volSemula,
        jumlahSemula,
        blokirSemula,
        volMenjadi,
        jumlahMenjadi,
        blokirMenjadi,
        selisihVol,
        selisihJumlah,
        selisihBlokir,
        keterangan,
      };
    });
  }, [displayRows, customMenjadiMap, keteranganMap]);

  // Akun-akun yang belum diisi keterangannya (Kewajiban pengisian keterangan ada di level akun saja)
  const uncompletedAkunRows = useMemo(() => {
    return calculatedRows.filter((r) => r.type === "akun" && !r.keterangan.trim());
  }, [calculatedRows]);

  // Handler update keterangan per akun
  const handleKeteranganChange = (rowId: string, rowKode: string, val: string) => {
    setKeteranganMap((prev) => {
      const updated = { ...prev, [rowId]: val, [rowKode]: val };
      return updated;
    });
  };

  // Simpan Matriks Revisi
  const handleSaveRevisi = () => {
    try {
      localStorage.setItem(`rab_revisi_keterangan_${ukSingkatan}`, JSON.stringify(keteranganMap));
      localStorage.setItem(`rab_revisi_menjadi_${ukSingkatan}`, JSON.stringify(customMenjadiMap));
      setSaveStatus("Matriks Revisi Anggaran berhasil disimpan!");
      setTimeout(() => setSaveStatus(""), 4000);
    } catch (e) {
      alert("Gagal menyimpan data revisi.");
    }
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
            <span className="text-[var(--primary)] font-semibold">Revisi Anggaran</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <GitPullRequest className="h-6 w-6 text-[var(--primary)]" />
            <span>Pengelolaan Revisi Anggaran (DIPA &amp; POK)</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Pengajuan pergeseran anggaran antar akun, antar komponen, dan revisi administratif belanja Unit Kerja:{" "}
            <strong className="text-slate-800 dark:text-slate-200">{userUnit}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak Matriks</span>
          </button>
          <button
            onClick={handleSaveRevisi}
            className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-xs hover:opacity-90 flex items-center gap-1.5 cursor-pointer transition-opacity"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Matriks</span>
          </button>
        </div>
      </div>

      {/* ── Kartu Pilihan Jenis Revisi (DIPA vs POK) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTab("dipa")}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === "dipa"
              ? "bg-white dark:bg-slate-900 border-[var(--primary)] shadow-md ring-2 ring-indigo-500/20"
              : "bg-slate-50 dark:bg-slate-800/40 border-[var(--border)] opacity-80 hover:opacity-100"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--primary)] font-mono">Kode A01 - A99</span>
            <span className="text-[0.68rem] px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-bold">
              Kewenangan DJA/DJPb
            </span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Revisi DIPA (Antar Program/KRO/Kegiatan)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Pergeseran anggaran yang memerlukan persetujuan Direktorat Jenderal Anggaran (DJA).
          </p>
        </div>

        <div
          onClick={() => setActiveTab("pok")}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === "pok"
              ? "bg-white dark:bg-slate-900 border-[var(--primary)] shadow-md ring-2 ring-emerald-500/20"
              : "bg-slate-50 dark:bg-slate-800/40 border-[var(--border)] opacity-80 hover:opacity-100"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 font-mono">Kode C01 - C99</span>
            <span className="text-[0.68rem] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold">
              Kewenangan KPA Satker
            </span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Revisi POK (Petunjuk Operasional Kegiatan)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Pergeseran dalam satu akun, antar detail rincian, atau subkomponen internal satker.
          </p>
        </div>
      </div>

      {/* ── Status Notifikasi Simpan ── */}
      {saveStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{saveStatus}</span>
          </div>
          <button onClick={() => setSaveStatus("")} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Peringatan Wajib Keterangan Level Akun ── */}
      {uncompletedAkunRows.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Terdapat <strong>{uncompletedAkunRows.length} akun</strong> belanja yang kolom <strong>Keterangan</strong>-nya belum diisi. Kewajiban pengisian keterangan berada di level Akun untuk menjelaskan alasan usulan revisi.
            </span>
          </div>
        </div>
      )}

      {/* ── TABEL MATRIKS REVISI (MENGGANTIKAN DAFTAR PENGAJUAN REVISI AKTIF) ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden space-y-0">
        {/* Tab Header "Matriks" Persis Seperti Screenshot */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 px-5 pt-3 pb-0 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white dark:bg-slate-900 border-t-2 border-l border-r border-t-blue-600 border-slate-200 dark:border-slate-700 rounded-t-lg font-bold text-xs text-slate-800 dark:text-slate-100 shadow-2xs flex items-center gap-1.5 -mb-px z-10 cursor-default">
              <TableIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Matriks</span>
            </button>
          </div>

          {/* Kontrol Drill-Down Hierarki & Nomor Revisi */}
          <div className="flex items-center gap-3 pb-2.5 flex-wrap">
            {/* Input Revisi Semula Ke & Menjadi Ke */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Revisi:</span>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-400">Semula Ke-</span>
                <input
                  type="text"
                  value={revisiSemulaKe}
                  onChange={(e) => setRevisiSemulaKe(e.target.value)}
                  className="w-8 font-mono font-bold text-center border-b border-slate-300 dark:border-slate-600 focus:outline-none"
                />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-400">Menjadi Ke-</span>
                <input
                  type="text"
                  value={revisiMenjadiKe}
                  onChange={(e) => setRevisiMenjadiKe(e.target.value)}
                  className="w-8 font-mono font-bold text-center border-b border-slate-300 dark:border-slate-600 focus:outline-none text-blue-600"
                />
              </div>
            </div>

            {/* Menu Drill-Down Hierarki: User dapat memilih menampilkan s.d. level mana */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Drill Down s.d. :</span>
              </span>
              <select
                value={maxHierarchyLevel}
                onChange={(e) => setMaxHierarchyLevel(e.target.value as any)}
                className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                <option value="program">Level Program Saja</option>
                <option value="kegiatan">s.d. Kegiatan</option>
                <option value="kro">s.d. KRO (Klasifikasi Rincian Output)</option>
                <option value="ro">s.d. RO (Rincian Output)</option>
                <option value="komponen">s.d. Komponen</option>
                <option value="subkomponen">s.d. Subkomponen</option>
                <option value="akun">s.d. Akun Belanja (Lengkap)</option>
              </select>
            </div>

            {/* Kotak Cari Cepat */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kode / uraian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
              />
            </div>
          </div>
        </div>

        {/* ── TABEL MATRIKS DRILL DOWN REVISI ANGGARAN (PERSIS GAMBAR REFERENSI USER) ── */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-left text-xs border-collapse">
            {/* Header Biru Pekat SAKTI Matriks Revisi Sesuai Gambar User */}
            <thead>
              <tr className="bg-[#1b65b6] text-white font-bold text-center border-b border-[#144d8b]">
                <th
                  rowSpan={2}
                  className="py-3 px-3 border-r border-blue-400/40 w-[110px] text-center font-bold tracking-wider"
                >
                  KODE
                </th>
                <th
                  rowSpan={2}
                  className="py-3 px-4 border-r border-blue-400/40 text-left font-bold min-w-[280px] tracking-wider"
                >
                  URAIAN
                </th>

                {/* SEMULA REVISI KE- 10 */}
                <th
                  colSpan={3}
                  className="py-1.5 px-2 border-r border-blue-400/40 text-center font-bold tracking-wider bg-[#15569d]"
                >
                  SEMULA REVISI KE- {revisiSemulaKe}
                </th>

                {/* MENJADI REVISI KE- 08 */}
                <th
                  colSpan={3}
                  className="py-1.5 px-2 border-r border-blue-400/40 text-center font-bold tracking-wider bg-[#124d8f]"
                >
                  MENJADI REVISI KE- {revisiMenjadiKe}
                </th>

                {/* SELISIH */}
                <th
                  colSpan={3}
                  className="py-1.5 px-2 border-r border-blue-400/40 text-center font-bold tracking-wider bg-[#0f447f]"
                >
                  SELISIH
                </th>

                {/* KOLOM PALING KANAN DIGANTI DENGAN KETERANGAN (WAJIB DIISI USER DI LEVEL AKUN) */}
                <th
                  rowSpan={2}
                  className="py-3 px-3 text-left font-bold min-w-[260px] tracking-wider bg-[#1b65b6]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>KETERANGAN</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-400 text-slate-900 rounded font-bold font-mono">
                      Wajib (Akun)
                    </span>
                  </div>
                </th>
              </tr>

              {/* Sub-Header Kolom: Vol | Jumlah | @ */}
              <tr className="bg-[#185ea9] text-white font-bold text-center border-b border-[#144d8b] text-[11px]">
                {/* Semula */}
                <th className="py-1.5 px-2 border-r border-blue-400/40 w-[60px]">Vol</th>
                <th className="py-1.5 px-2 border-r border-blue-400/40 w-[115px]">Jumlah</th>
                <th className="py-1.5 px-1 border-r border-blue-400/40 w-[45px]">@</th>

                {/* Menjadi */}
                <th className="py-1.5 px-2 border-r border-blue-400/40 w-[60px]">Vol</th>
                <th className="py-1.5 px-2 border-r border-blue-400/40 w-[115px]">Jumlah</th>
                <th className="py-1.5 px-1 border-r border-blue-400/40 w-[45px]">@</th>

                {/* Selisih */}
                <th className="py-1.5 px-2 border-r border-blue-400/40 w-[60px]">Vol</th>
                <th className="py-1.5 px-2 border-r border-blue-400/40 w-[115px]">Jumlah</th>
                <th className="py-1.5 px-1 border-r border-blue-400/40 w-[45px]">@</th>
              </tr>
            </thead>

            {/* Isi Baris Kertas Kerja Matriks Revisi */}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/80 font-medium">
              {calculatedRows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    Tidak ada baris data yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                calculatedRows.map((row, idx) => {
                  const isProgram = row.type === "program";
                  const isKegiatan = row.type === "kegiatan";
                  const isKro = row.type === "kro";
                  const isRo = row.type === "ro";
                  const isKomponen = row.type === "komponen";
                  const isSubkomponen = row.type === "subkomponen" || row.type === "subkomponen_sub";
                  const isAkun = row.type === "akun";

                  // Styling baris persis seperti kertas kerja Isian RAB
                  let rowBg = "hover:bg-slate-50 dark:hover:bg-slate-800/40";
                  let kodeClass = "font-mono font-bold text-center";
                  let uraianClass = "font-medium text-left";

                  if (isProgram) {
                    rowBg = "bg-slate-200/90 dark:bg-slate-750 font-bold text-slate-900 dark:text-slate-100";
                    kodeClass = "bg-slate-300 dark:bg-slate-700 font-mono font-bold text-center";
                    uraianClass = "font-bold text-slate-900 dark:text-slate-100";
                  } else if (isKegiatan) {
                    rowBg = "bg-slate-100/90 dark:bg-slate-800/80 font-semibold text-slate-900 dark:text-slate-100";
                    kodeClass = "bg-slate-200 dark:bg-slate-750 font-mono font-bold text-center";
                    uraianClass = "font-semibold underline text-slate-900 dark:text-slate-100";
                  } else if (isKro) {
                    rowBg = "bg-slate-50/90 dark:bg-slate-850/60 text-slate-800 dark:text-slate-200";
                    kodeClass = "font-mono text-center font-semibold text-indigo-600 dark:text-indigo-400";
                    uraianClass = "italic font-medium";
                  } else if (isRo) {
                    rowBg = "bg-[#fef9c3]/70 dark:bg-yellow-950/30 text-slate-900 dark:text-yellow-100";
                    kodeClass = "bg-[#fef08a] dark:bg-yellow-950/60 font-mono font-bold text-center text-slate-900 dark:text-yellow-200";
                    uraianClass = "font-semibold";
                  } else if (isKomponen) {
                    rowBg = "bg-[#e0e7ff]/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200";
                    kodeClass = "bg-[#dbeafe] dark:bg-blue-950/60 font-mono font-bold text-center text-blue-900 dark:text-blue-200";
                    uraianClass = "font-bold";
                  } else if (isSubkomponen) {
                    rowBg = "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200";
                    kodeClass = "font-mono italic font-bold text-center text-purple-600 dark:text-purple-400";
                    uraianClass = "italic font-semibold";
                  } else if (isAkun) {
                    rowBg = "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold";
                    kodeClass = "font-mono font-bold underline text-center text-slate-900 dark:text-slate-100";
                    uraianClass = "font-bold text-slate-900 dark:text-slate-100";
                  }

                  // Selisih style (hijau jika positif/ada kenaikan, merah jika minus)
                  const selisihJml = row.selisihJumlah;
                  const isMinus = selisihJml < 0;
                  const isPlus = selisihJml > 0;

                  return (
                    <tr key={row.id || idx} className={`transition-colors ${rowBg}`}>
                      {/* 1. KODE */}
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700/80 ${kodeClass}`}>
                        {row.kode}
                      </td>

                      {/* 2. URAIAN */}
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700/80 ${uraianClass}`}>
                        <div className="flex items-center gap-1.5">
                          {isProgram && <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">PROGRAM</span>}
                          {isKegiatan && <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">KEGIATAN</span>}
                          {isKro && <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">KRO</span>}
                          {isRo && <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-bold">RO</span>}
                          {isKomponen && <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold">KOMP</span>}
                          {isSubkomponen && <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 font-bold">SUBKOMP</span>}
                          {isAkun && <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">AKUN</span>}
                          <span>{row.uraian}</span>
                        </div>
                      </td>

                      {/* 3. SEMULA: Vol */}
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700/80 text-center font-mono tabular-nums">
                        {row.volSemula > 0 ? row.volSemula : ""}
                      </td>

                      {/* 4. SEMULA: Jumlah */}
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700/80 text-right font-mono tabular-nums">
                        {row.jumlahSemula > 0 ? row.jumlahSemula.toLocaleString("id-ID") : "0"}
                      </td>

                      {/* 5. SEMULA: @ (Blokir) */}
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700/80 text-center font-mono text-[11px] text-slate-400">
                        {row.blokirSemula > 0 ? row.blokirSemula.toLocaleString("id-ID") : "0"}
                      </td>

                      {/* 6. MENJADI: Vol */}
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700/80 text-center font-mono tabular-nums text-blue-700 dark:text-blue-300">
                        {row.volMenjadi > 0 ? row.volMenjadi : ""}
                      </td>

                      {/* 7. MENJADI: Jumlah */}
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700/80 text-right font-mono tabular-nums font-bold text-blue-700 dark:text-blue-300">
                        {row.jumlahMenjadi > 0 ? row.jumlahMenjadi.toLocaleString("id-ID") : "0"}
                      </td>

                      {/* 8. MENJADI: @ (Blokir) */}
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700/80 text-center font-mono text-[11px] text-slate-400">
                        {row.blokirMenjadi > 0 ? row.blokirMenjadi.toLocaleString("id-ID") : "0"}
                      </td>

                      {/* 9. SELISIH: Vol */}
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700/80 text-center font-mono tabular-nums">
                        {row.selisihVol !== 0 ? (
                          <span className={row.selisihVol > 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                            {row.selisihVol > 0 ? `+${row.selisihVol}` : row.selisihVol}
                          </span>
                        ) : (
                          "0"
                        )}
                      </td>

                      {/* 10. SELISIH: Jumlah */}
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700/80 text-right font-mono tabular-nums font-bold">
                        {selisihJml !== 0 ? (
                          <span className={isPlus ? "text-emerald-600" : isMinus ? "text-rose-600" : ""}>
                            {isPlus ? `+${selisihJml.toLocaleString("id-ID")}` : selisihJml.toLocaleString("id-ID")}
                          </span>
                        ) : (
                          "0"
                        )}
                      </td>

                      {/* 11. SELISIH: @ (Blokir) */}
                      <td className="p-2 border-r border-slate-200 dark:border-slate-700/80 text-center font-mono text-[11px] text-slate-400">
                        0
                      </td>

                      {/* 12. KETERANGAN (WAJIB DIISI USER DI LEVEL AKUN SAJA) */}
                      <td className="p-1.5 bg-white dark:bg-slate-900/90">
                        {isAkun ? (
                          <div className="space-y-1">
                            <textarea
                              rows={2}
                              value={row.keterangan}
                              onChange={(e) => handleKeteranganChange(row.id, row.kode, e.target.value)}
                              placeholder="Ketik keterangan usulan revisi akun belanja ini (Wajib)..."
                              className={`w-full text-xs p-1.5 rounded-lg border transition-all resize-y ${
                                !row.keterangan.trim()
                                  ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 text-slate-800 dark:text-slate-100 placeholder:text-amber-600/70 focus:ring-2 focus:ring-amber-500"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                              }`}
                            />
                            {!row.keterangan.trim() && (
                              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Wajib diisi</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic px-2 py-1">
                            {isProgram
                              ? "Agregasi Program"
                              : isKegiatan
                              ? "Agregasi Kegiatan"
                              : isKro
                              ? "Agregasi KRO"
                              : isRo
                              ? "Agregasi RO"
                              : isKomponen
                              ? "Agregasi Komponen"
                              : "Agregasi Subkomponen"}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer Panel Matriks Revisi ── */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>
              Menampilkan <strong>{calculatedRows.length}</strong> baris drill-down ({calculatedRows.filter((r) => r.type === "akun").length} Akun Belanja).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const csvData = calculatedRows.map((r) => ({
                  Kode: r.kode,
                  Uraian: r.uraian,
                  "Vol Semula": r.volSemula,
                  "Pagu Semula": r.jumlahSemula,
                  "Vol Menjadi": r.volMenjadi,
                  "Pagu Menjadi": r.jumlahMenjadi,
                  "Selisih Vol": r.selisihVol,
                  "Selisih Jumlah": r.selisihJumlah,
                  Keterangan: r.keterangan || "",
                }));
                const blob = new Blob([JSON.stringify(csvData, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Matriks_Revisi_${ukSingkatan}_TA2027.json`;
                a.click();
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Matriks</span>
            </button>
            <button
              onClick={handleSaveRevisi}
              className="px-4 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan Matriks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
