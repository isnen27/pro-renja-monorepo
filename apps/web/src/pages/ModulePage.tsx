import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Building,
  Landmark,
  Shield,
  UserCheck,
  ChevronRight,
  GitFork,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  LayoutGrid,
  List,
  Layers,
  Filter,
  SlidersHorizontal,
  BookOpen,
  AlertCircle,
  FileText,
} from "lucide-react";
import { menuConfig } from "../components/navigation/menuConfig";
import {
  mockRabItems,
  mockPejabat,
  mockPengguna,
  mockSbk,
  type RabItem,
} from "../data/ppatkData";
import {
  allSbmList,
  allSbmPmk32List,
  sbmTablesList,
  allSbkList,
  sbkuList,
  sbkkList,
  type SbkItem,
  type SbmItem,
} from "../data/sbmPmk32Data";
import {
  baganAkunStandar as fullBaganAkunStandar,
  kategoriAkun,
} from "../data/baganAkunStandar";

import rawInformasiKinerja from "../data/informasiKinerjaData.json";
import rawSatkerData from "../data/satkerData.json";
import rawUnitKerjaData from "../data/unitKerjaData.json";
import rawRenstraNomenklatur from "../data/renstraNomenklaturData.json";
import rawRekapRenjaAll from "../data/rekapSasaranRenjaAllData.json";
import rawRenjaTree from "../data/rekapRenjaNestedTree.json";

export default function ModulePage() {
  const location = useLocation();
  const path = location.pathname;

  // State for RAB
  const [rabList, setRabList] = useState<RabItem[]>(mockRabItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAkun, setSelectedAkun] = useState("Semua");
  const [, setShowAddModal] = useState(false);

  const [sbmSearch, setSbmSearch] = useState("");
  const [sbmTableFilter, setSbmTableFilter] = useState("Semua");
  const [sbmCategoryFilter, setSbmCategoryFilter] = useState("Semua");
  const [sbmRowsPerPage, setSbmRowsPerPage] = useState(20);
  const [sbmCurrentPage, setSbmCurrentPage] = useState(1);
  const [isSbmDropdownOpen, setIsSbmDropdownOpen] = useState(false);
  const [sbmDropdownSearch, setSbmDropdownSearch] = useState("");
  const sbmDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sbmDropdownRef.current && !sbmDropdownRef.current.contains(event.target as Node)) {
        setIsSbmDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // State for SBK Explorer - Clustered (SBKU & SBKK)
  const [sbkClusterFilter, setSbkClusterFilter] = useState<"Semua" | "SBKU" | "SBKK">("Semua");
  const [sbkCategoryFilter, setSbkCategoryFilter] = useState<string>("Semua");
  const [sbkSearch, setSbkSearch] = useState("");
  const [sbkViewMode, setSbkViewMode] = useState<"table" | "grid">("table");
  const [sbkRowsPerPage, setSbkRowsPerPage] = useState(15);
  const [sbkCurrentPage, setSbkCurrentPage] = useState(1);

  // State for BAS
  const [basSearch, setBasSearch] = useState("");
  const [basKategoriFilter, setBasKategoriFilter] = useState("Semua");

  // State for Referensi Informasi Kinerja - Multi-level Drill-Down & Filters
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>("WA"); // Default WA as requested
  const [selectedKegiatanFilter, setSelectedKegiatanFilter] = useState<string>("Semua");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("Semua");
  const [kinerjaSearch, setKinerjaSearch] = useState("");
  const [kinerjaRowsPerPage, setKinerjaRowsPerPage] = useState(20);
  const [kinerjaCurrentPage, setKinerjaCurrentPage] = useState(1);
  const [activeTabKinerja, setActiveTabKinerja] = useState<"sasaran" | "komponen">("sasaran");
  
  // Interactive Diagram Visualisasi Step-by-Step Level & Branch State
  const [visibleDiagramLevel, setVisibleDiagramLevel] = useState<number>(1); // Default Level 1 (SS)
  const [activeSsDiagram, setActiveSsDiagram] = useState<"ALL" | "SS01" | "SS02">("ALL");
  const [activeProgramDiagram, setActiveProgramDiagram] = useState<"ALL" | "BE" | "WA">("ALL");
  const [activeKegiatanDiagram, setActiveKegiatanDiagram] = useState<string>("ALL");

  // Expanded card tracking for drill-down view down to RO level
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    "01 - Meningkatnya efektivitas pengawasan internal PPATK": true,
    "3374 - Pengawasan Internal PPATK": true,
  });

  const toggleItemExpand = (key: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const setAllItemsExpand = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    rawRekapRenjaAll.forEach((row: any) => {
      if (row.sasaran_kro) next[row.sasaran_kro] = expand;
      if (row.kegiatan) next[row.kegiatan] = expand;
    });
    setExpandedItems(next);
  };

  // New item form state for RAB
  const [newItem, setNewItem] = useState({
    akun: "521211",
    namaAkun: "Belanja Bahan",
    item: "",
    f1Jml: 1,
    f1Sat: "orang",
    f2Jml: 1,
    f2Sat: "kali",
    f3Jml: 1,
    f3Sat: "hari",
    f4Jml: 1,
    f4Sat: "keg",
    satuanBiaya: 0,
    satuanVol: "OK",
  });

  // Calculate RAB totals dynamically
  const rabTotals = useMemo(() => {
    let grandTotal = 0;
    const perAkun: Record<string, number> = {};

    rabList.forEach((item) => {
      const vol = item.faktor1.jml * item.faktor2.jml * item.faktor3.jml * item.faktor4.jml;
      const subtotal = vol * item.satuanBiaya;
      grandTotal += subtotal;
      perAkun[item.akun] = (perAkun[item.akun] || 0) + subtotal;
    });

    return { grandTotal, perAkun };
  }, [rabList]);

  // Determine current menu context
  const { currentItem, currentGroup, currentSub } = useMemo(() => {
    for (const group of menuConfig) {
      for (const item of group.items) {
        if (item.href === path) {
          return { currentItem: item, currentGroup: group, currentSub: null };
        }
        if (item.submenu) {
          const sub = item.submenu.find((s) => s.href === path);
          if (sub) {
            return { currentItem: item, currentGroup: group, currentSub: sub };
          }
        }
      }
    }
    const parts = path.split("/").filter(Boolean);
    const label = parts.length > 0 ? parts[parts.length - 1].replace(/-/g, " ") : "Modul";
    return {
      currentItem: { label: label.charAt(0).toUpperCase() + label.slice(1) },
      currentGroup: { groupLabel: parts[0] ? parts[0].toUpperCase() : "AKSI PPATK" },
      currentSub: null,
    };
  }, [path]);

  const title = currentSub ? currentSub.label : currentItem?.label || "Modul PPATK";
  const parentTitle = currentSub ? currentItem?.label : currentGroup?.groupLabel;

  // Filter SBM list (only items with besaran > 0 and excluding any header rows)
  const filteredSbmList = useMemo(() => {
    const q = sbmSearch.toLowerCase().trim();
    const headerKeywords = [
      'no', 'no.', 'no/uraian', 'uraian', 'satuan', 'besaran', 'no/ibukota provinsi',
      'ibukota provinsi', 'kabupaten/kota tujuan', 'no/provinsi', 'provinsi', 'kota',
      'golongan', 'satuan biaya tiket', 'nilai', 'jumlah', 'published', 'business', 'first'
    ];

    return allSbmList.filter((item) => {
      if (item.besaran <= 0 || !item.besaran) return false;
      const uLower = item.uraian.toLowerCase().trim();
      if (headerKeywords.includes(uLower)) return false;

      const matchText =
        !q ||
        item.uraian.toLowerCase().includes(q) ||
        item.jenisTabel.toLowerCase().includes(q) ||
        item.kodeTabel.toLowerCase().includes(q) ||
        (item.spesifikasi && item.spesifikasi.toLowerCase().includes(q));
      const matchTable = sbmTableFilter === "Semua" || item.kodeTabel === sbmTableFilter;
      const matchCat = sbmCategoryFilter === "Semua" || item.kategori === sbmCategoryFilter;
      return matchText && matchTable && matchCat;
    });
  }, [sbmSearch, sbmTableFilter, sbmCategoryFilter]);

  const sbmTotalPages = Math.max(1, Math.ceil(filteredSbmList.length / sbmRowsPerPage));
  const paginatedSbmList = useMemo(() => {
    const start = (sbmCurrentPage - 1) * sbmRowsPerPage;
    return filteredSbmList.slice(start, start + sbmRowsPerPage);
  }, [filteredSbmList, sbmCurrentPage, sbmRowsPerPage]);

  // Unique categories for SBK based on selected cluster
  const sbkAvailableCategories = useMemo(() => {
    let items = allSbkList;
    if (sbkClusterFilter !== "Semua") {
      items = items.filter((s) => s.kelompok === sbkClusterFilter);
    }
    const cats = new Set<string>();
    items.forEach((s) => {
      if (s.kategori) cats.add(s.kategori);
    });
    return Array.from(cats);
  }, [sbkClusterFilter]);

  // Filtered SBK list
  const filteredSbkList = useMemo(() => {
    const q = sbkSearch.toLowerCase().trim();
    return allSbkList.filter((item) => {
      const matchCluster = sbkClusterFilter === "Semua" || item.kelompok === sbkClusterFilter;
      const matchCat = sbkCategoryFilter === "Semua" || item.kategori === sbkCategoryFilter;
      const matchSearch =
        !q ||
        item.kode.toLowerCase().includes(q) ||
        item.uraian.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q) ||
        item.satker.toLowerCase().includes(q) ||
        item.satuan.toLowerCase().includes(q);
      return matchCluster && matchCat && matchSearch;
    });
  }, [sbkClusterFilter, sbkCategoryFilter, sbkSearch]);

  const sbkTotalPages = Math.max(1, Math.ceil(filteredSbkList.length / sbkRowsPerPage));
  const paginatedSbkList = useMemo(() => {
    const start = (sbkCurrentPage - 1) * sbkRowsPerPage;
    return filteredSbkList.slice(start, start + sbkRowsPerPage);
  }, [filteredSbkList, sbkCurrentPage, sbkRowsPerPage]);

  // Filter Rekap Sasaran Renja All (Tab 1)
  const filteredRekapRenja = useMemo(() => {
    const q = kinerjaSearch.toLowerCase().trim();
    return rawRekapRenjaAll.filter((row: any) => {
      const matchProg = selectedProgramFilter === "Semua" || row.program.startsWith(selectedProgramFilter);
      const matchKeg = selectedKegiatanFilter === "Semua" || row.kegiatan.includes(selectedKegiatanFilter);
      const matchType = selectedTypeFilter === "Semua" || row.type === selectedTypeFilter;
      const matchSearch =
        !q ||
        row.program.toLowerCase().includes(q) ||
        row.kegiatan.toLowerCase().includes(q) ||
        row.sasaran_kro.toLowerCase().includes(q) ||
        row.ro.toLowerCase().includes(q) ||
        row.indikator.toLowerCase().includes(q);
      return matchProg && matchKeg && matchType && matchSearch;
    });
  }, [selectedProgramFilter, selectedKegiatanFilter, selectedTypeFilter, kinerjaSearch]);

  // Filter Informasi Kinerja Komponen (Tab 2)
  const filteredKomponenList = useMemo(() => {
    const q = kinerjaSearch.toLowerCase().trim();
    // Ekstrak kode kegiatan (misal "3384" dari "3384 - Pelaksanaan...")
    const selectedKegiatanCode =
      selectedKegiatanFilter !== "Semua" ? selectedKegiatanFilter.split(" ")[0].trim() : "";

    const rawFiltered = rawInformasiKinerja.filter((row: any) => {
      // 1. Program Filter
      const matchProg =
        selectedProgramFilter === "Semua" || row.program.includes(selectedProgramFilter);

      // 2. Kegiatan Filter
      const matchKeg =
        !selectedKegiatanCode ||
        row.kegiatan.startsWith(selectedKegiatanCode) ||
        row.kro.startsWith(selectedKegiatanCode) ||
        row.ro.startsWith(selectedKegiatanCode);

      // 3. Search Filter
      const matchSearch =
        !q ||
        row.kro.toLowerCase().includes(q) ||
        row.ro.toLowerCase().includes(q) ||
        row.komponen.toLowerCase().includes(q) ||
        row.unitKerja.toLowerCase().includes(q) ||
        row.kegiatan.toLowerCase().includes(q);

      return matchProg && matchKeg && matchSearch;
    });

    // 4. Level Filter
    if (selectedTypeFilter === "KRO_RO") {
      // Tampilkan rekap per KRO & Rincian Output (RO) yang unik
      const seen = new Set<string>();
      const kroRoList: any[] = [];
      rawFiltered.forEach((row: any) => {
        const key = `${row.kro}|||${row.ro}`;
        if (!seen.has(key)) {
          seen.add(key);
          const relatedComponents = rawFiltered.filter(
            (r: any) => r.kro === row.kro && r.ro === row.ro
          );
          kroRoList.push({
            ...row,
            id: `ro_${row.id}`,
            komponen:
              relatedComponents.length === 1
                ? relatedComponents[0].komponen
                : `${relatedComponents.length} Komponen (${relatedComponents.map((c: any) => c.komponen.split(" ")[0]).join(", ")})`,
          });
        }
      });
      return kroRoList;
    }

    if (selectedTypeFilter === "SASARAN_PROGRAM") {
      // Tampilkan rekap agregat per Program
      const seen = new Set<string>();
      const spList: any[] = [];
      rawFiltered.forEach((row: any) => {
        if (!seen.has(row.program)) {
          seen.add(row.program);
          const related = rawFiltered.filter((r: any) => r.program === row.program);
          spList.push({
            ...row,
            id: `sp_${row.id}`,
            kegiatan: "Semua Kegiatan Program",
            kro: `${new Set(related.map((r: any) => r.kro)).size} KRO`,
            ro: `${new Set(related.map((r: any) => r.ro)).size} Rincian Output (RO)`,
            komponen: `${related.length} Komponen Kegiatan`,
          });
        }
      });
      return spList;
    }

    if (selectedTypeFilter === "SASARAN_KEGIATAN") {
      // Tampilkan rekap agregat per Kegiatan
      const seen = new Set<string>();
      const skList: any[] = [];
      rawFiltered.forEach((row: any) => {
        if (!seen.has(row.kegiatan)) {
          seen.add(row.kegiatan);
          const related = rawFiltered.filter((r: any) => r.kegiatan === row.kegiatan);
          skList.push({
            ...row,
            id: `sk_${row.id}`,
            kro: `${new Set(related.map((r: any) => r.kro)).size} KRO`,
            ro: `${new Set(related.map((r: any) => r.ro)).size} Rincian Output (RO)`,
            komponen: `${related.length} Komponen Kegiatan`,
          });
        }
      });
      return skList;
    }

    return rawFiltered;
  }, [selectedProgramFilter, selectedKegiatanFilter, selectedTypeFilter, kinerjaSearch]);

  const currentTabTotalItems =
    activeTabKinerja === "sasaran" ? filteredRekapRenja.length : filteredKomponenList.length;
  const currentTabTotalPages = Math.max(1, Math.ceil(currentTabTotalItems / kinerjaRowsPerPage));
  const paginatedRekapRenja = useMemo(() => {
    const start = (kinerjaCurrentPage - 1) * kinerjaRowsPerPage;
    return filteredRekapRenja.slice(start, start + kinerjaRowsPerPage);
  }, [filteredRekapRenja, kinerjaCurrentPage, kinerjaRowsPerPage]);

  // List of Kegiatan under selected program
  const availableKegiatanList = useMemo(() => {
    const kegs = new Set<string>();
    rawRekapRenjaAll.forEach((row: any) => {
      if (selectedProgramFilter === "Semua" || row.program.startsWith(selectedProgramFilter)) {
        if (row.kegiatan) kegs.add(row.kegiatan);
      }
    });
    return Array.from(kegs);
  }, [selectedProgramFilter]);

  // Grouped Hierarchical View of Sasaran for Drill-Down / Drill-Up down to RO level
  const hierarchicalRenjaGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        program: string;
        kegiatan: string;
        sasaran_kro: string;
        type: string;
        ro: string;
        indicators: any[];
      }
    > = {};

    filteredRekapRenja.forEach((row: any) => {
      const groupKey = `${row.program}|||${row.kegiatan}|||${row.sasaran_kro}|||${row.ro}`;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          program: row.program,
          kegiatan: row.kegiatan,
          sasaran_kro: row.sasaran_kro,
          type: row.type,
          ro: row.ro,
          indicators: [],
        };
      }
      groups[groupKey].indicators.push(row);
    });

    return Object.values(groups);
  }, [filteredRekapRenja]);

  const handleAddRabItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.item) return;

    const bas = fullBaganAkunStandar.find((b) => b.kodeAkun6Digit === newItem.akun);
    const added: RabItem = {
      id: `RAB-${Date.now().toString().slice(-4)}`,
      akun: newItem.akun,
      namaAkun: bas ? bas.uraianAkun : newItem.namaAkun,
      item: newItem.item,
      faktor1: { jml: Number(newItem.f1Jml), satuan: newItem.f1Sat },
      faktor2: { jml: Number(newItem.f2Jml), satuan: newItem.f2Sat },
      faktor3: { jml: Number(newItem.f3Jml), satuan: newItem.f3Sat },
      faktor4: { jml: Number(newItem.f4Jml), satuan: newItem.f4Sat },
      satuanBiaya: Number(newItem.satuanBiaya),
      totalVolumeSatuan: newItem.satuanVol,
    };

    setRabList([...rabList, added]);
    setShowAddModal(false);
    setNewItem({
      akun: "521211",
      namaAkun: "Belanja Bahan",
      item: "",
      f1Jml: 1,
      f1Sat: "orang",
      f2Jml: 1,
      f2Sat: "kali",
      f3Jml: 1,
      f3Sat: "hari",
      f4Jml: 1,
      f4Sat: "keg",
      satuanBiaya: 0,
      satuanVol: "OK",
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb & Top Header ── */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2" aria-label="Breadcrumb">
          <Link to="/dashboard" className="hover:text-[var(--primary)] transition-colors">
            PPATK
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>{parentTitle}</span>
          {currentSub && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-[var(--text)] font-semibold">{title}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)] flex items-center gap-2.5">
              <span>{title}</span>
              <span className="badge badge-primary text-xs">TA 2027</span>
            </h1>
            <p className="text-xs md:text-sm text-[var(--text-muted)] mt-1">
              Sistem Informasi Perencanaan dan Penganggaran Pusat Pelaporan dan Analisis Transaksi Keuangan.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          1. MODUL KHUSUS: RENCANA ANGGARAN BIAYA (RAB) RINCI
         ══════════════════════════════════════════════════════════════ */}
      {path.startsWith("/rab") && (
        <div className="space-y-6">
          <div className="aksi-card p-5 border-l-4 border-l-[var(--primary)] bg-gradient-to-r from-[var(--card)] via-[var(--card)] to-[var(--primary-bg)]/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    RO: 3365.DCG.001
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">Kementerian/Lembaga: (078) PPATK</span>
                </div>
                <h2 className="text-base font-bold text-[var(--text)]">
                  Pendidikan dan Pelatihan Bagi Aparat Penegak Hukum (APH) TPPU TPPT PPSPM
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Unit Eselon II: Pusat Pendidikan dan Pelatihan APUPPT · Volume: 390 Orang (13 Kegiatan)
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-[var(--text-muted)] font-medium">Total Pagu Terhitung:</span>
                <p className="text-2xl font-black text-[var(--primary)] tabular-nums">
                  Rp {rabTotals.grandTotal.toLocaleString("id-ID")}
                </p>
                <span className="text-[0.7rem] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Sesuai Pagu Indikatif Renja Pusdiklat
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { kode: "521211", label: "Belanja Bahan" },
              { kode: "521811", label: "Barang Persediaan" },
              { kode: "521219", label: "Non Operasional" },
              { kode: "521213", label: "Honor Output" },
              { kode: "524111", label: "Perjalanan Dinas" },
            ].map((ak) => (
              <div key={ak.kode} className="aksi-card p-3 border-t-2 border-t-[var(--primary)]">
                <span className="text-[0.65rem] font-bold text-[var(--text-muted)]">{ak.kode} · {ak.label}</span>
                <p className="text-sm font-bold text-[var(--text)] mt-1 tabular-nums">
                  Rp {(rabTotals.perAkun[ak.kode] || 0).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>

          <div className="aksi-card overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari item pengeluaran..."
                    className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--accent)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                <select
                  value={selectedAkun}
                  onChange={(e) => setSelectedAkun(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="Semua">Semua Akun Belanja</option>
                  <option value="521211">521211 - Belanja Bahan</option>
                  <option value="521811">521811 - Persediaan</option>
                  <option value="521213">521213 - Honor Output</option>
                  <option value="524111">524111 - Perjalanan Dinas</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--primary)] text-white hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
              >
                + Tambah Item RAB Rinci
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--accent)] text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
                  <tr>
                    <th className="py-2.5 px-3">Kode Akun</th>
                    <th className="py-2.5 px-3">Item Pengeluaran / Uraian Detail</th>
                    <th className="py-2.5 px-2 text-center">Faktor 1</th>
                    <th className="py-2.5 px-2 text-center">Faktor 2</th>
                    <th className="py-2.5 px-2 text-center">Faktor 3</th>
                    <th className="py-2.5 px-2 text-center">Faktor 4</th>
                    <th className="py-2.5 px-3 text-right">Harga Satuan (SBM)</th>
                    <th className="py-2.5 px-3 text-right">Subtotal Pagu (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {rabList
                    .filter(
                      (item) =>
                        (selectedAkun === "Semua" || item.akun === selectedAkun) &&
                        (item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.namaAkun.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((r) => {
                      const vol = r.faktor1.jml * r.faktor2.jml * r.faktor3.jml * r.faktor4.jml;
                      const total = vol * r.satuanBiaya;
                      return (
                        <tr key={r.id} className="hover:bg-[var(--accent)]/40 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-[var(--primary)]">{r.akun}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-[var(--text)]">{r.item}</div>
                            <div className="text-[0.65rem] text-[var(--text-muted)]">{r.namaAkun}</div>
                          </td>
                          <td className="py-2.5 px-2 text-center">{r.faktor1.jml} {r.faktor1.satuan}</td>
                          <td className="py-2.5 px-2 text-center">{r.faktor2.jml} {r.faktor2.satuan}</td>
                          <td className="py-2.5 px-2 text-center">{r.faktor3.jml} {r.faktor3.satuan}</td>
                          <td className="py-2.5 px-2 text-center">{r.faktor4.jml} {r.faktor4.satuan}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums">Rp {r.satuanBiaya.toLocaleString("id-ID")}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-[var(--primary)] tabular-nums">
                            Rp {total.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          2. MODUL KHUSUS: STANDAR BIAYA MASUKAN (SBM) & KELUARAN (SBK)
             RUJUKAN: KMK NOMOR 296 TAHUN 2026
         ══════════════════════════════════════════════════════════════ */}
      {path.startsWith("/standar-biaya") && (
        <div className="space-y-6">
          {/* ──────────────────────────────────────────────────────────
              2A. SUBMENU SBM: STANDAR BIAYA MASUKAN (KMK 296/2026)
              66 Tabel (37 Batas Tertinggi + 29 Dapat Dilampaui)
             ────────────────────────────────────────────────────────── */}
          {path === "/standar-biaya/sbm" && (
            <div className="space-y-5">
              {/* Header Box Rujukan Regulasi KMK 296/2026 - Putih Polos */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        Regulasi Rujukan: KMK Nomor 296 Tahun 2026
                      </span>
                      <span className="text-[0.68rem] font-semibold text-slate-500">
                        Tahun Anggaran 2026 / 2027
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">
                      Standar Biaya Masukan (SBM) TA 2026 / 2027
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Keputusan Menteri Keuangan Nomor 296 Tahun 2026 tentang Standar Biaya Masukan — Terdiri atas Lampiran I (Batas Tertinggi) dan Lampiran II (Dapat Dilampaui / Estimasi).
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-left">
                      <div className="text-[0.65rem] text-slate-500 font-medium">Total Terintegrasi</div>
                      <div className="text-xs font-bold text-slate-900">
                        {sbmTablesList.length} Tabel · {allSbmList.length.toLocaleString("id-ID")} Data
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Metrics Cards - Putih Polos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="text-[0.7rem] text-slate-500 font-medium">Lampiran I (Batas Tertinggi)</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {sbmTablesList.filter((t) => t.lampiran.includes("Batas Tertinggi")).length} Tabel ·{" "}
                      {allSbmList.filter((i) => i.lampiran.includes("Batas Tertinggi")).length.toLocaleString("id-ID")} Item
                    </div>
                    <div className="text-[0.65rem] text-slate-400 mt-0.5">Tidak dapat dilampaui dalam perencanaan</div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="text-[0.7rem] text-slate-500 font-medium">Lampiran II (Dapat Dilampaui)</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {sbmTablesList.filter((t) => t.lampiran.includes("Dapat Dilampaui")).length} Tabel ·{" "}
                      {allSbmList.filter((i) => i.lampiran.includes("Dapat Dilampaui")).length.toLocaleString("id-ID")} Item
                    </div>
                    <div className="text-[0.65rem] text-slate-400 mt-0.5">Besaran estimasi yang dapat disesuaikan</div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="text-[0.7rem] text-slate-500 font-medium">Dasar Hukum</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">KMK No. 296 Th. 2026</div>
                  </div>
                </div>
              </div>

              {/* Toolbar Pencarian & Filter SBM */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                  <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={sbmSearch}
                      onChange={(e) => {
                        setSbmSearch(e.target.value);
                        setSbmCurrentPage(1);
                      }}
                      placeholder="Cari komponen biaya, spesifikasi, provinsi, dsb..."
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Filter Kategori Lampiran SBM */}
                    <select
                      value={sbmCategoryFilter}
                      onChange={(e) => {
                        setSbmCategoryFilter(e.target.value);
                        setSbmTableFilter("Semua");
                        setSbmCurrentPage(1);
                      }}
                      className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                    >
                      <option value="Semua">Semua Lampiran ({sbmTablesList.length} Tabel)</option>
                      <option value="Lampiran I (Batas Tertinggi)">
                        Lampiran I: Batas Tertinggi ({sbmTablesList.filter((t) => t.lampiran.includes("Batas Tertinggi")).length} Tabel)
                      </option>
                      <option value="Lampiran II (Dapat Dilampaui)">
                        Lampiran II: Dapat Dilampaui ({sbmTablesList.filter((t) => t.lampiran.includes("Dapat Dilampaui")).length} Tabel)
                      </option>
                    </select>

                    {/* Filter Dropdown Tabel SBM Kustom (Responsif, Anti-Glitch & Anti-Overflow) */}
                    <div className="relative" ref={sbmDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsSbmDropdownOpen(!isSbmDropdownOpen)}
                        className="w-full sm:w-[320px] md:w-[380px] lg:w-[420px] flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 hover:border-slate-400 transition-colors text-left"
                      >
                        <span className="truncate font-medium">
                          {sbmTableFilter === "Semua" ? (
                            `Semua Jenis Tabel SBM (${sbmTablesList.filter((t) => sbmCategoryFilter === "Semua" || t.lampiran === sbmCategoryFilter).length} Tabel)`
                          ) : (
                            (() => {
                              const activeT = sbmTablesList.find((t) => t.kodeTabel === sbmTableFilter);
                              return activeT ? `${activeT.page}: ${activeT.jenisTabel}` : sbmTableFilter;
                            })()
                          )}
                        </span>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${isSbmDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isSbmDropdownOpen && (
                        <div className="absolute right-0 sm:right-auto sm:left-0 mt-1 w-[90vw] sm:w-[420px] md:w-[480px] max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col">
                          {/* Search inside dropdown */}
                          <div className="p-2 border-b border-slate-100 bg-slate-50">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                              <input
                                type="text"
                                value={sbmDropdownSearch}
                                onChange={(e) => setSbmDropdownSearch(e.target.value)}
                                placeholder="Cari nama atau nomor tabel..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-slate-400"
                                autoFocus
                              />
                            </div>
                          </div>

                          {/* List items with max-height and custom scrollbar */}
                          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setSbmTableFilter("Semua");
                                setSbmCurrentPage(1);
                                setIsSbmDropdownOpen(false);
                                setSbmDropdownSearch("");
                              }}
                              className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                                sbmTableFilter === "Semua" ? "bg-slate-100/80 font-bold text-slate-900" : "text-slate-700"
                              }`}
                            >
                              <span>Semua Jenis Tabel SBM</span>
                              <span className="text-[0.65rem] text-slate-400 px-1.5 py-0.5 rounded bg-slate-100">
                                {sbmTablesList.filter((t) => sbmCategoryFilter === "Semua" || t.lampiran === sbmCategoryFilter).length} Tabel
                              </span>
                            </button>

                            {sbmTablesList
                              .filter((t) => sbmCategoryFilter === "Semua" || t.lampiran === sbmCategoryFilter)
                              .filter((t) => {
                                if (!sbmDropdownSearch) return true;
                                const q = sbmDropdownSearch.toLowerCase();
                                return (
                                  t.page.toLowerCase().includes(q) ||
                                  t.jenisTabel.toLowerCase().includes(q) ||
                                  t.kodeTabel.toLowerCase().includes(q)
                                );
                              })
                              .map((t) => {
                                const isSelected = sbmTableFilter === t.kodeTabel;
                                return (
                                  <button
                                    key={t.kodeTabel}
                                    type="button"
                                    onClick={() => {
                                      setSbmTableFilter(t.kodeTabel);
                                      setSbmCurrentPage(1);
                                      setIsSbmDropdownOpen(false);
                                      setSbmDropdownSearch("");
                                    }}
                                    className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-2.5 ${
                                      isSelected ? "bg-slate-100/80 font-bold text-slate-900" : "text-slate-700"
                                    }`}
                                  >
                                    <div className="flex-1 min-w-0 pr-1">
                                      <div className="font-semibold text-slate-900 break-words leading-tight">
                                        {t.page}: {t.jenisTabel}
                                      </div>
                                      <div className="text-[0.65rem] text-slate-400 mt-0.5">
                                        {t.lampiran}
                                      </div>
                                    </div>
                                    <span className="shrink-0 text-[0.65rem] font-medium text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                                      {t.itemCount} item
                                    </span>
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-bar Pagination & Info Data */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-medium">Baris per halaman:</span>
                    <select
                      value={sbmRowsPerPage}
                      onChange={(e) => {
                        setSbmRowsPerPage(Number(e.target.value));
                        setSbmCurrentPage(1);
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </select>

                    <span className="text-xs text-slate-600">
                      Menampilkan{" "}
                      <strong className="text-slate-900">
                        {filteredSbmList.length > 0 ? (sbmCurrentPage - 1) * sbmRowsPerPage + 1 : 0}
                      </strong>{" "}
                      -{" "}
                      <strong className="text-slate-900">
                        {Math.min(sbmCurrentPage * sbmRowsPerPage, filteredSbmList.length)}
                      </strong>{" "}
                      dari <strong className="text-slate-900">{filteredSbmList.length}</strong> data SBM
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSbmCurrentPage(1)}
                      disabled={sbmCurrentPage === 1}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      « Awal
                    </button>
                    <button
                      onClick={() => setSbmCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={sbmCurrentPage === 1}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      ‹ Sebelumnya
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-900 bg-slate-100 rounded-lg border border-slate-200">
                      {sbmCurrentPage} / {sbmTotalPages}
                    </span>
                    <button
                      onClick={() => setSbmCurrentPage((p) => Math.min(sbmTotalPages, p + 1))}
                      disabled={sbmCurrentPage >= sbmTotalPages}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      Selanjutnya ›
                    </button>
                    <button
                      onClick={() => setSbmCurrentPage(sbmTotalPages)}
                      disabled={sbmCurrentPage >= sbmTotalPages}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      Akhir »
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabel SBM - Putih Polos & Header Center */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-white text-slate-800 font-bold border-b-2 border-slate-200">
                      <tr>
                        <th className="py-3 px-3 text-center border-r border-slate-200 w-12">No</th>
                        <th className="py-3 px-3 text-center border-r border-slate-200 w-32">Ketentuan SBM</th>
                        <th className="py-3 px-3 text-center border-r border-slate-200 w-64">Jenis Tabel & Halaman</th>
                        <th className="py-3 px-3 text-center border-r border-slate-200">Uraian Komponen Biaya SBM & Spesifikasi</th>
                        <th className="py-3 px-3 text-center border-r border-slate-200 w-28">Satuan</th>
                        <th className="py-3 px-3 text-center w-36">Besaran / Tarif (Rp/ $)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {paginatedSbmList.length > 0 ? (
                        paginatedSbmList.map((item, idx) => {
                          const rowNum = (sbmCurrentPage - 1) * sbmRowsPerPage + idx + 1;
                          const isBatasTertinggi = item.kategori.includes("Batas Tertinggi");
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3 text-center text-slate-500 font-mono border-r border-slate-100">
                                {rowNum}
                              </td>
                              <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                                <span
                                  className={`text-[0.68rem] px-2 py-0.5 rounded font-semibold border ${
                                    isBatasTertinggi
                                      ? "bg-slate-100 text-slate-800 border-slate-300"
                                      : "bg-white text-slate-700 border-slate-300"
                                  }`}
                                >
                                  {isBatasTertinggi ? "Lampiran I (Maksimal)" : "Lampiran II (Estimasi)"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 border-r border-slate-100">
                                <div className="font-semibold text-slate-900 text-[0.75rem]">{item.jenisTabel}</div>
                                <div className="text-[0.65rem] text-slate-500 font-mono mt-0.5">
                                  {item.halaman} ({item.kodeTabel})
                                </div>
                              </td>
                              <td className="py-2.5 px-3 border-r border-slate-100">
                                <div className="font-medium text-slate-900">{item.uraian}</div>
                                {item.spesifikasi && (
                                  <div className="text-[0.68rem] text-slate-500 italic mt-0.5">
                                    {item.spesifikasi}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center font-semibold text-slate-700 border-r border-slate-100 whitespace-nowrap">
                                {item.satuan}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                                {item.besaran.toLocaleString("id-ID")}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            Tidak ada data Standar Biaya Masukan (SBM) yang sesuai dengan kriteria pencarian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              2B. SUBMENU SBK: STANDAR BIAYA KELUARAN (KMK 296/2026)
              Dua Kelompok Tercluster:
              1. Standar Biaya Keluaran Umum (SBKU) - 57 Output K/L
              2. Standar Biaya Keluaran Khusus (SBKK) - 3 Output PPATK
             ────────────────────────────────────────────────────────── */}
          {path === "/standar-biaya/sbk" && (
            <div className="space-y-5">
              {/* Header Box Rujukan Regulasi KMK 296/2026 & Sumber DataSBKAll.xlsx - Putih Polos */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        Regulasi Rujukan: KMK Nomor 296 Tahun 2026
                      </span>
                      <span className="text-[0.68rem] font-semibold text-slate-500">
                        Sumber: DataSBKAll.xlsx
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">
                      Standar Biaya Keluaran (SBK) TA 2027
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pedoman besaran biaya per satu satuan keluaran (output) kegiatan yang berlaku bagi Kementerian/Lembaga (SBKU) serta Satker Khusus PPATK (SBKK).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-left">
                      <div className="text-[0.65rem] text-slate-500 font-medium">Total Output Terintegrasi</div>
                      <div className="text-xs font-bold text-slate-900">60 Standar Biaya Keluaran</div>
                    </div>
                  </div>
                </div>

                {/* 3 Metrics Cards Ringkasan SBK - Putih Polos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => {
                      setSbkClusterFilter("SBKU");
                      setSbkCategoryFilter("Semua");
                      setSbkCurrentPage(1);
                    }}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      sbkClusterFilter === "SBKU"
                        ? "border-slate-800 bg-slate-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[0.7rem] font-bold text-slate-600">CLUSTER 1: SBKU</span>
                      <span className="text-[0.65rem] px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
                        57 Output
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-1">Standar Biaya Keluaran Umum</div>
                    <div className="text-[0.68rem] text-slate-500 mt-0.5">
                      Berlaku lintas K/L (10 Kategori Bidang Keluaran)
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setSbkClusterFilter("SBKK");
                      setSbkCategoryFilter("Semua");
                      setSbkCurrentPage(1);
                    }}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      sbkClusterFilter === "SBKK"
                        ? "border-slate-800 bg-slate-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[0.7rem] font-bold text-slate-600">CLUSTER 2: SBKK PPATK</span>
                      <span className="text-[0.65rem] px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
                        3 Output
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-1">Standar Biaya Keluaran Khusus</div>
                    <div className="text-[0.68rem] text-slate-500 mt-0.5">
                      Khusus Satker PPATK (Pusdiklat & Analisis Pemeriksaan)
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setSbkClusterFilter("Semua");
                      setSbkCategoryFilter("Semua");
                      setSbkCurrentPage(1);
                    }}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      sbkClusterFilter === "Semua"
                        ? "border-slate-800 bg-slate-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[0.7rem] font-bold text-slate-600">SEMUA KELOMPOK</span>
                      <span className="text-[0.65rem] px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
                        60 Output
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-1">Katalog Lengkap SBK TA 2027</div>
                    <div className="text-[0.68rem] text-slate-500 mt-0.5">
                      Gabungan SBKU (Umum) & SBKK (Khusus PPATK)
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Selector Cluster SBK - Putih Polos */}
              <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setSbkClusterFilter("Semua");
                      setSbkCategoryFilter("Semua");
                      setSbkCurrentPage(1);
                    }}
                    className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      sbkClusterFilter === "Semua"
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Semua Kelompok SBK (60)
                  </button>

                  <button
                    onClick={() => {
                      setSbkClusterFilter("SBKU");
                      setSbkCategoryFilter("Semua");
                      setSbkCurrentPage(1);
                    }}
                    className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      sbkClusterFilter === "SBKU"
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Standar Biaya Keluaran Umum — SBKU (57)
                  </button>

                  <button
                    onClick={() => {
                      setSbkClusterFilter("SBKK");
                      setSbkCategoryFilter("Semua");
                      setSbkCurrentPage(1);
                    }}
                    className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      sbkClusterFilter === "SBKK"
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Standar Biaya Keluaran Khusus — SBKK PPATK (3)
                  </button>
                </div>

                {/* View Switcher: Tabel vs Grid Card */}
                <div className="flex items-center gap-1 self-end sm:self-auto border border-slate-200 rounded-lg p-1 bg-white">
                  <button
                    onClick={() => setSbkViewMode("table")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                      sbkViewMode === "table"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                    title="Tampilan Tabel"
                  >
                    <List className="h-3.5 w-3.5" />
                    <span>Tabel</span>
                  </button>
                  <button
                    onClick={() => setSbkViewMode("grid")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                      sbkViewMode === "grid"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                    title="Tampilan Kartu Grid"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Kartu</span>
                  </button>
                </div>
              </div>

              {/* Penjelasan Khusus Cluster SBKK PPATK jika dipilih */}
              {sbkClusterFilter === "SBKK" && (
                <div className="bg-white border-2 border-slate-300 rounded-xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                      Khusus PPATK
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">
                      Rincian Standar Biaya Keluaran Khusus (SBKK) Pusat Pelaporan dan Analisis Transaksi Keuangan
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600">
                    Berdasarkan KMK Nomor 296 Tahun 2026, PPATK memiliki 3 output khusus yang memiliki standar plafon biaya mandiri:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div className="text-[0.65rem] font-bold text-slate-500 font-mono">3365.DCF.001</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">Diklat APU PPT</div>
                      <div className="text-[0.68rem] text-slate-600 mt-0.5">Pusat Pendidikan & Pelatihan APUPPT</div>
                      <div className="text-xs font-black text-slate-900 mt-1">Rp 81.156.000 / Orang</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div className="text-[0.65rem] font-bold text-slate-500 font-mono">3384.QCE.003</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">Analisis Sektor Perjudian</div>
                      <div className="text-[0.68rem] text-slate-600 mt-0.5">Kedeputian Analisis & Pemeriksaan</div>
                      <div className="text-xs font-black text-slate-900 mt-1">Rp 132.245.000 / Perkara</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div className="text-[0.65rem] font-bold text-slate-500 font-mono">3384.QCE.004</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">Analisis Sektor Lingkungan Hidup</div>
                      <div className="text-[0.68rem] text-slate-600 mt-0.5">Kedeputian Analisis & Pemeriksaan</div>
                      <div className="text-xs font-black text-slate-900 mt-1">Rp 106.698.000 / Perkara</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Toolbar Filter Kategori, Pencarian & Pagination SBK */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                  <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={sbkSearch}
                      onChange={(e) => {
                        setSbkSearch(e.target.value);
                        setSbkCurrentPage(1);
                      }}
                      placeholder="Cari kode output, nomenklatur, kategori, atau satker..."
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Filter Kategori SBK Berdasarkan Cluster Terpilih */}
                    <select
                      value={sbkCategoryFilter}
                      onChange={(e) => {
                        setSbkCategoryFilter(e.target.value);
                        setSbkCurrentPage(1);
                      }}
                      className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer max-w-[320px]"
                    >
                      <option value="Semua">Semua Kategori Bidang Keluaran ({sbkAvailableCategories.length})</option>
                      {sbkAvailableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    {/* Baris Per Halaman */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Baris:</span>
                      <select
                        value={sbkRowsPerPage}
                        onChange={(e) => {
                          setSbkRowsPerPage(Number(e.target.value));
                          setSbkCurrentPage(1);
                        }}
                        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-bold focus:outline-none cursor-pointer"
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                        <option value={60}>60 (Semua)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Info Pagination SBK */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-600">
                    Menampilkan{" "}
                    <strong className="text-slate-900">
                      {filteredSbkList.length > 0 ? (sbkCurrentPage - 1) * sbkRowsPerPage + 1 : 0}
                    </strong>{" "}
                    -{" "}
                    <strong className="text-slate-900">
                      {Math.min(sbkCurrentPage * sbkRowsPerPage, filteredSbkList.length)}
                    </strong>{" "}
                    dari <strong className="text-slate-900">{filteredSbkList.length}</strong> keluaran SBK
                    {sbkClusterFilter !== "Semua" && (
                      <span className="ml-1.5 text-slate-500">
                        (Filter: Cluster <strong>{sbkClusterFilter}</strong>)
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSbkCurrentPage(1)}
                      disabled={sbkCurrentPage === 1}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      « Awal
                    </button>
                    <button
                      onClick={() => setSbkCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={sbkCurrentPage === 1}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      ‹ Sebelumnya
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-900 bg-slate-100 rounded-lg border border-slate-200">
                      {sbkCurrentPage} / {sbkTotalPages}
                    </span>
                    <button
                      onClick={() => setSbkCurrentPage((p) => Math.min(sbkTotalPages, p + 1))}
                      disabled={sbkCurrentPage >= sbkTotalPages}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      Selanjutnya ›
                    </button>
                    <button
                      onClick={() => setSbkCurrentPage(sbkTotalPages)}
                      disabled={sbkCurrentPage >= sbkTotalPages}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      Akhir »
                    </button>
                  </div>
                </div>
              </div>

              {/* TAMPILAN 1: TABEL SBK (PUTIH POLOS & HEADER CENTER) */}
              {sbkViewMode === "table" && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-white text-slate-800 font-bold border-b-2 border-slate-200">
                        <tr>
                          <th className="py-3 px-3 text-center border-r border-slate-200 w-12">No</th>
                          <th className="py-3 px-3 text-center border-r border-slate-200 w-28">Cluster & Kode</th>
                          <th className="py-3 px-3 text-center border-r border-slate-200 w-44">Kategori Bidang</th>
                          <th className="py-3 px-3 text-center border-r border-slate-200">Uraian Nomenklatur Keluaran (Output)</th>
                          <th className="py-3 px-3 text-center border-r border-slate-200 w-24">Satuan & Vol</th>
                          <th className="py-3 px-3 text-center border-r border-slate-200 w-36">Besaran Plafon (Rp)</th>
                          <th className="py-3 px-3 text-center w-52">Satuan Kerja / K/L Penerap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {paginatedSbkList.length > 0 ? (
                          paginatedSbkList.map((sbk, idx) => {
                            const rowNum = (sbkCurrentPage - 1) * sbkRowsPerPage + idx + 1;
                            const isKhusus = sbk.kelompok === "SBKK";
                            return (
                              <tr key={sbk.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-3 text-center text-slate-500 font-mono border-r border-slate-100">
                                  {rowNum}
                                </td>
                                <td className="py-3 px-3 border-r border-slate-100">
                                  <div className="flex flex-col items-start gap-1">
                                    <span
                                      className={`text-[0.65rem] px-2 py-0.5 rounded font-bold border ${
                                        isKhusus
                                          ? "bg-slate-900 text-white border-slate-900"
                                          : "bg-slate-100 text-slate-800 border-slate-300"
                                      }`}
                                    >
                                      {sbk.kelompok}
                                    </span>
                                    <span className="font-mono text-[0.68rem] text-slate-700 font-semibold">
                                      {sbk.kode}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 border-r border-slate-100">
                                  <span className="text-[0.72rem] font-semibold text-slate-700">
                                    {sbk.kategori}
                                  </span>
                                </td>
                                <td className="py-3 px-3 border-r border-slate-100">
                                  <div className="font-semibold text-slate-900 text-[0.78rem] leading-snug">
                                    {sbk.uraian}
                                  </div>
                                  <div className="text-[0.65rem] text-slate-400 mt-0.5">
                                    Dasar Regulasi: {sbk.dasarHukum}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                                  <div className="font-bold text-slate-900">{sbk.volume}</div>
                                  <div className="text-[0.68rem] text-slate-500">{sbk.satuan}</div>
                                </td>
                                <td className="py-3 px-3 text-right font-black text-slate-900 tabular-nums border-r border-slate-100 whitespace-nowrap">
                                  Rp {sbk.besaran.toLocaleString("id-ID")}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="text-[0.72rem] font-medium text-slate-700">
                                    {sbk.satker}
                                  </div>
                                  {isKhusus && (
                                    <span className="inline-block mt-0.5 text-[0.65rem] font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                                      ★ Khusus PPATK
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-500">
                              Tidak ada data Standar Biaya Keluaran (SBK) yang sesuai dengan filter pencarian.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAMPILAN 2: GRID KARTU SBK (PUTIH POLOS) */}
              {sbkViewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedSbkList.map((sbk) => {
                    const isKhusus = sbk.kelompok === "SBKK";
                    return (
                      <div
                        key={sbk.id}
                        className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm hover:border-slate-400 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[0.68rem] font-bold px-2 py-0.5 rounded border ${
                                isKhusus
                                  ? "bg-slate-900 text-white border-slate-900"
                                  : "bg-slate-100 text-slate-800 border-slate-300"
                              }`}
                            >
                              {sbk.kelompok} · {sbk.kategori}
                            </span>
                            <span className="text-[0.68rem] font-mono font-bold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              {sbk.kode}
                            </span>
                          </div>

                          <h3 className="font-bold text-xs text-slate-900 leading-snug">
                            {sbk.uraian}
                          </h3>

                          <p className="text-[0.7rem] text-slate-500">
                            Penerap: <strong className="text-slate-800">{sbk.satker}</strong>
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 text-[0.7rem]">Volume Output:</span>
                            <span className="font-bold text-slate-800">
                              {sbk.volume} {sbk.satuan}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-medium">Besaran Plafon:</span>
                            <span className="text-base font-black text-slate-900 tabular-nums">
                              Rp {sbk.besaran.toLocaleString("id-ID")}
                            </span>
                          </div>

                          <div className="text-[0.62rem] text-slate-400 font-medium pt-1 border-t border-slate-50">
                            Regulasi: {sbk.dasarHukum}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          3. MODUL MASTER: BAGAN AKUN STANDAR (BAS 6 DIGIT) - LENGKAP
         ══════════════════════════════════════════════════════════════ */}
      {path === "/referensi/bas" && (
        <div className="space-y-4">
          <div className="aksi-card p-5 border-l-4 border-l-[var(--primary)] bg-gradient-to-r from-[var(--card)] to-[var(--primary-bg)]/15">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-primary text-[0.65rem] font-bold">BAS 6 DIGIT</span>
                  <span className="text-xs text-[var(--text-muted)]">Klasifikasi Akun Penganggaran Belanja SAKTI</span>
                </div>
                <h2 className="text-base font-bold text-[var(--text)]">Bagan Akun Standar (BAS) - Referensi Lengkap</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {fullBaganAkunStandar.length} Kode Akun untuk Klasifikasi Belanja Pemerintah
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {kategoriAkun.map((kat) => (
              <button
                key={kat.value}
                onClick={() => setBasKategoriFilter(kat.value === basKategoriFilter ? "Semua" : kat.value)}
                className={`aksi-card p-3 text-left transition-all ${
                  basKategoriFilter === kat.value
                    ? "border-[var(--primary)] bg-[var(--primary-bg)]/20"
                    : "hover:border-[var(--primary)]/50"
                }`}
              >
                <span className="text-[0.65rem] font-bold text-[var(--text-muted)]">{kat.label}</span>
                <p className="text-lg font-black text-[var(--primary)] mt-1">{kat.count}</p>
                <span className="text-[0.65rem] text-[var(--text-muted)]">akun</span>
              </button>
            ))}
          </div>

          <div className="aksi-card p-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={basSearch}
                    onChange={(e) => setBasSearch(e.target.value)}
                    placeholder="Cari kode atau nama akun..."
                    className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--accent)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                <select
                  value={basKategoriFilter}
                  onChange={(e) => setBasKategoriFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="Semua">Semua Kategori</option>
                  {kategoriAkun.map((kat) => (
                    <option key={kat.value} value={kat.value}>
                      {kat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span>
                  Ditemukan: <strong className="text-[var(--text)]">{fullBaganAkunStandar.length} akun</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="aksi-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--accent)] text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
                  <tr>
                    <th className="py-2.5 px-3 w-24">No</th>
                    <th className="py-2.5 px-3 w-28">Kode 6 Digit</th>
                    <th className="py-2.5 px-3">Uraian Akun Belanja</th>
                    <th className="py-2.5 px-3 w-40">Kelompok (3 Digit)</th>
                    <th className="py-2.5 px-3 w-36">Kategori</th>
                    <th className="py-2.5 px-3">Penggunaan Singkat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {fullBaganAkunStandar
                    .filter((ak) => {
                      const matchSearch =
                        !basSearch ||
                        ak.kodeAkun6Digit.includes(basSearch.toUpperCase()) ||
                        ak.uraianAkun.toLowerCase().includes(basSearch.toLowerCase()) ||
                        ak.penggunaanSingkat.toLowerCase().includes(basSearch.toLowerCase());
                      const matchKategori = basKategoriFilter === "Semua" || ak.kategori === basKategoriFilter;
                      return matchSearch && matchKategori;
                    })
                    .map((ak) => (
                      <tr key={ak.id} className="hover:bg-[var(--accent)]/40 transition-colors">
                        <td className="py-2.5 px-3 text-[var(--text-muted)]">{ak.no}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-sm text-[var(--primary)]">{ak.kodeAkun6Digit}</td>
                        <td className="py-2.5 px-3 font-semibold text-[var(--text)]">{ak.uraianAkun}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-[0.7rem]">{ak.kodeAkun3Digit}</span>
                          <div className="text-[0.65rem] text-[var(--text-muted)] truncate max-w-[200px]">
                            {ak.namaAkun3Digit}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center text-[0.68rem] px-2 py-0.5 rounded-full font-semibold ${
                              ak.kategori === "Belanja Pegawai"
                                ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                                : ak.kategori === "Belanja Barang"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                : ak.kategori === "Belanja Jasa"
                                ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300"
                                : ak.kategori === "Belanja Pemeliharaan"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                : ak.kategori === "Belanja Perjalanan"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-gray-50 text-gray-700 dark:bg-gray-950/40 dark:text-gray-300"
                            }`}
                          >
                            {ak.kategori}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[var(--text-muted)] max-w-md">{ak.penggunaanSingkat}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          4. REFERENSI INFORMASI KINERJA: VISI & MISI
         ══════════════════════════════════════════════════════════════ */}
      {path === "/referensi/visi-misi" && (
        <div className="space-y-4">
          <div className="aksi-card p-6 border-l-4 border-l-[var(--primary)] bg-gradient-to-br from-[var(--card)] to-[var(--primary-bg)]/10">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--primary)]">
              VISI PPATK 2025-2029
            </span>
            <p className="text-sm font-semibold text-[var(--primary)] italic mt-2 leading-relaxed">
              "{rawRenstraNomenklatur.visi}"
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--text)]">Misi PPATK</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rawRenstraNomenklatur.misi.map((misiStr, idx) => (
                <div key={idx} className="aksi-card p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary-bg)] text-[var(--primary)] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-[var(--text)] leading-relaxed">{misiStr}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="aksi-card p-5">
            <h3 className="text-sm font-bold text-[var(--text)] mb-3">Tujuan PPATK</h3>
            <div className="p-4 rounded-xl bg-[var(--accent)]/50 border border-[var(--border)]">
              {rawRenstraNomenklatur.tujuan.map((tujuanStr, idx) => (
                <div key={idx}>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="badge badge-primary">TUJUAN 0.{idx}</span>
                  </div>
                  <p className="text-xs text-[var(--text)] leading-relaxed mb-3">{tujuanStr}</p>
                  {rawRenstraNomenklatur.indikatorTujuan.map((ind) => (
                    <div key={ind.nama} className="bg-[var(--card)] p-3 rounded-lg border border-[var(--border)]">
                      <div className="text-xs font-semibold text-[var(--text)] mb-2">{ind.nama}</div>
                      <div className="grid grid-cols-5 gap-2 text-center">
                        {[2025, 2026, 2027, 2028, 2029].map((tahun) => {
                          const key = `t${tahun}` as keyof typeof ind;
                          return (
                            <div key={tahun} className="p-2 rounded bg-[var(--accent)]">
                              <div className="text-[0.65rem] text-[var(--text-muted)]">{tahun}</div>
                              <div className="font-bold text-[var(--primary)]">{ind[key]}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          5. SUBMENU KHUSUS: VISUALISASI SASARAN KINERJA (STEP-BY-STEP DRILL-DOWN)
         ══════════════════════════════════════════════════════════════ */}
      {path === "/referensi/visualisasi-sasaran-kinerja" && (
        <div className="space-y-6">
          <div className="aksi-card p-5 border-l-4 border-l-[var(--primary)] bg-gradient-to-r from-[var(--card)] to-[var(--primary-bg)]/15">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-primary text-[0.65rem] font-bold">DIAGRAM DUKMAN & KRISNA</span>
                  <span className="text-xs text-[var(--text-muted)]">Visualisasi Hierarki Step-by-Step Perka PPATK</span>
                </div>
                <h2 className="text-base font-bold text-[var(--text)]">Visualisasi Sasaran Kinerja PPATK</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Klik pada setiap level diagram untuk membuka cabang hierarki di bawahnya (Drill-Down Bertahap sampai RO)
                </p>
              </div>
              <Link
                to="/referensi/informasi-kinerja"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--primary)] text-white hover:opacity-90 flex items-center gap-1.5 shadow-sm transition-opacity"
              >
                <span>Buka Tabel Informasi Kinerja (Drill-Down RO)</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Interactive Step-by-Step Cascading Flowchart dengan Filter Cabang Presisi */}
          <div className="aksi-card p-6 space-y-6 overflow-x-auto">
            {/* Active Branch Breadcrumb Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[var(--accent)] border border-[var(--border)] text-xs">
              <div className="flex flex-wrap items-center gap-1.5 font-medium">
                <span className="text-[var(--text-muted)]">Cabang Diagram Aktif:</span>
                <span className="px-2 py-0.5 rounded bg-[var(--card)] font-bold text-[var(--primary)] shadow-sm">
                  Level 0: PPATK (078)
                </span>
                {activeSsDiagram !== "ALL" && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">
                      Level 1: {activeSsDiagram === "SS01" ? "SS 01 (Teknis)" : "SS 02 (Dukman)"}
                    </span>
                  </>
                )}
                {activeProgramDiagram !== "ALL" && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                      Level 2: Program {activeProgramDiagram}
                    </span>
                  </>
                )}
                {activeKegiatanDiagram !== "ALL" && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold font-mono">
                      Level 3 & 4: {activeKegiatanDiagram.split(" - ")[0]}
                    </span>
                  </>
                )}
              </div>

              {(activeSsDiagram !== "ALL" || activeProgramDiagram !== "ALL" || activeKegiatanDiagram !== "ALL") && (
                <button
                  onClick={() => {
                    setActiveSsDiagram("ALL");
                    setActiveProgramDiagram("ALL");
                    setActiveKegiatanDiagram("ALL");
                    setVisibleDiagramLevel(1);
                  }}
                  className="px-2.5 py-1 text-[0.7rem] font-bold rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  ↺ Reset Cabang (Tampilkan Semua)
                </button>
              )}
            </div>

            {/* Level 0: KEMENTERIAN / LEMBAGA (PPATK) */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setVisibleDiagramLevel(visibleDiagramLevel >= 1 ? 0 : 1)}
                className="w-full max-w-xl p-4 text-center rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-lg border border-blue-400/40 cursor-pointer hover:opacity-95 transition-all"
              >
                <span className="text-[0.65rem] uppercase font-bold tracking-widest text-blue-300 block mb-1">
                  LEVEL 0 · KEMENTERIAN / LEMBAGA
                </span>
                <h3 className="text-base font-black tracking-wide">
                  078 - PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN (PPATK)
                </h3>
                <span className="text-[0.68rem] text-blue-200 block mt-1">
                  {visibleDiagramLevel >= 1 ? "▲ Klik untuk menutup cabang Level 1" : "▼ Klik untuk membuka Level 1 (Sasaran Strategis)"}
                </span>
              </button>

              {visibleDiagramLevel >= 1 && <div className="w-0.5 h-6 bg-[var(--primary)] opacity-40 my-1" />}
            </div>

            {/* Level 1: SASARAN STRATEGIS */}
            {visibleDiagramLevel >= 1 && (
              <div className="space-y-4 flex flex-col items-center">
                <div className="text-center">
                  <span className="text-[0.68rem] font-bold text-[var(--primary)] uppercase tracking-wider bg-[var(--primary-bg)]/30 px-3.5 py-1 rounded-full">
                    LEVEL 1 · SASARAN STRATEGIS (PERKA PPATK)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                  {/* SS 01 Card */}
                  <button
                    onClick={() => {
                      if (activeSsDiagram === "SS01" && visibleDiagramLevel >= 2) {
                        setActiveSsDiagram("ALL");
                        setActiveProgramDiagram("ALL");
                        setActiveKegiatanDiagram("ALL");
                        setVisibleDiagramLevel(1);
                      } else {
                        setActiveSsDiagram("SS01");
                        setActiveProgramDiagram("BE");
                        setActiveKegiatanDiagram("ALL");
                        setVisibleDiagramLevel(2);
                      }
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      activeSsDiagram === "SS01"
                        ? "border-[var(--primary)] bg-[var(--primary-bg)]/20 shadow-md ring-2 ring-[var(--primary)]/30"
                        : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/60"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="badge badge-primary font-mono text-xs">SS 01</span>
                      {activeSsDiagram === "SS01" && (
                        <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-[var(--primary)] text-white">
                          Aktif (Terbuka)
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs text-[var(--text)] leading-snug">
                      01 - Meningkatnya Efektivitas Kinerja PPATK dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM
                    </h4>
                    <p className="text-[0.7rem] text-[var(--text-muted)] mt-1">
                      Mengampu Program Utama Teknis (078.01.BE) & Kegiatan Utama.
                    </p>
                    <div className="mt-2 text-[0.68rem] font-bold text-[var(--primary)] flex items-center gap-1">
                      <span>
                        {activeSsDiagram === "SS01" && visibleDiagramLevel >= 2
                          ? "▲ Tutup Cabang Program BE"
                          : "▼ Klik untuk Buka HANYA Program BE (078.01.BE)"}
                      </span>
                    </div>
                  </button>

                  {/* SS 02 Card */}
                  <button
                    onClick={() => {
                      if (activeSsDiagram === "SS02" && visibleDiagramLevel >= 2) {
                        setActiveSsDiagram("ALL");
                        setActiveProgramDiagram("ALL");
                        setActiveKegiatanDiagram("ALL");
                        setVisibleDiagramLevel(1);
                      } else {
                        setActiveSsDiagram("SS02");
                        setActiveProgramDiagram("WA");
                        setActiveKegiatanDiagram("ALL");
                        setVisibleDiagramLevel(2);
                      }
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      activeSsDiagram === "SS02"
                        ? "border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/30"
                        : "border-[var(--border)] bg-[var(--card)] hover:border-emerald-500/60"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="badge badge-gray font-mono text-xs">SS 02</span>
                      {activeSsDiagram === "SS02" && (
                        <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          Aktif (Terbuka)
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs text-[var(--text)] leading-snug">
                      02 - Meningkatnya Kinerja Revitalisasi Birokrasi PPATK (Dukungan Manajemen)
                    </h4>
                    <p className="text-[0.7rem] text-[var(--text-muted)] mt-1">
                      Mengampu Program Dukungan Manajemen (078.01.WA) & 5 Kegiatan Dukman.
                    </p>
                    <div className="mt-2 text-[0.68rem] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>
                        {activeSsDiagram === "SS02" && visibleDiagramLevel >= 2
                          ? "▲ Tutup Cabang Program WA"
                          : "▼ Klik untuk Buka HANYA Program WA (078.01.WA)"}
                      </span>
                    </div>
                  </button>
                </div>

                {visibleDiagramLevel >= 2 && <div className="w-0.5 h-6 bg-[var(--primary)] opacity-40 my-1" />}
              </div>
            )}

            {/* Level 2: PROGRAM & SASARAN PROGRAM (FILTERED ACCORDING TO SS 01 / SS 02 SELECTION) */}
            {visibleDiagramLevel >= 2 && (
              <div className="space-y-4 flex flex-col items-center">
                <div className="text-center">
                  <span className="text-[0.68rem] font-bold text-[var(--primary)] uppercase tracking-wider bg-[var(--primary-bg)]/30 px-3.5 py-1 rounded-full">
                    LEVEL 2 · PROGRAM & SASARAN PROGRAM (SP)
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-5xl">
                  {/* Program BE Card (Only visible if SS01 or ALL selected) */}
                  {(activeSsDiagram === "SS01" || activeSsDiagram === "ALL" || activeProgramDiagram === "BE") && (
                    <div
                      className={`p-4 rounded-xl border-2 space-y-3 transition-all ${
                        activeProgramDiagram === "BE"
                          ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-500/20"
                          : "border-blue-500/40 bg-gradient-to-b from-blue-50/20 to-[var(--card)] dark:from-blue-950/20"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="badge badge-primary font-mono text-xs">078.01.BE</span>
                        <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold">
                          Program Teknis Utama
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[var(--text)] leading-snug">
                        Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme
                      </h4>

                      {/* List 5 Sasaran Program (SP) for Program 078.01.BE */}
                      <div className="space-y-2 border-t border-blue-200 dark:border-blue-900/40 pt-2.5">
                        <div className="flex justify-between items-center text-[0.68rem] font-bold text-blue-700 dark:text-blue-300">
                          <span>SASARAN PROGRAM (5 SP):</span>
                          <span className="text-[0.62rem] font-semibold text-[var(--text-muted)] bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded">
                            rekap_sasaran_renja_all.xlsx
                          </span>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                          {rawRenjaTree
                            .find((p: any) => p.nama.startsWith("BE"))
                            ?.sasaran_program.map((sp: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-lg bg-[var(--accent)] border border-blue-200 dark:border-blue-900/40 text-[0.72rem] space-y-1"
                              >
                                <div className="font-bold text-[var(--primary)] leading-snug">
                                  SP: {sp.nama}
                                </div>
                                <div className="space-y-1 pl-2 border-l-2 border-blue-500/60">
                                  {sp.indikator.map((ind: any, iIdx: number) => (
                                    <div key={iIdx} className="text-[0.68rem] text-[var(--text-muted)] flex justify-between gap-1 items-start">
                                      <span className="leading-tight">
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">IKP:</span> {ind.nama}
                                      </span>
                                      <span className="font-mono font-semibold text-[var(--primary)] shrink-0 text-[0.65rem] bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                        Target 2027: {ind.target_2027} {ind.satuan}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (activeProgramDiagram === "BE" && visibleDiagramLevel >= 3) {
                            setActiveProgramDiagram("ALL");
                            setActiveKegiatanDiagram("ALL");
                            setVisibleDiagramLevel(2);
                          } else {
                            setActiveProgramDiagram("BE");
                            setActiveKegiatanDiagram("ALL");
                            setVisibleDiagramLevel(3);
                          }
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>
                          {activeProgramDiagram === "BE" && visibleDiagramLevel >= 3
                            ? "▲ Tutup Kegiatan Program BE"
                            : "▼ Drill-Down ke Kegiatan BE (3365, 3379, 3380...)"}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Program WA Card (Only visible if SS02 or ALL selected) */}
                  {(activeSsDiagram === "SS02" || activeSsDiagram === "ALL" || activeProgramDiagram === "WA") && (
                    <div
                      className={`p-4 rounded-xl border-2 space-y-3 transition-all ${
                        activeProgramDiagram === "WA"
                          ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-500/20"
                          : "border-emerald-500/40 bg-gradient-to-b from-emerald-50/20 to-[var(--card)] dark:from-emerald-950/20"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="badge badge-gray font-mono text-xs">078.01.WA</span>
                        <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold">
                          Program Dukungan Manajemen
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[var(--text)] leading-snug">
                        Program Dukungan Manajemen (Dukman)
                      </h4>

                      {/* List Sasaran Program (SP) for Program 078.01.WA */}
                      <div className="space-y-2 border-t border-emerald-200 dark:border-emerald-900/40 pt-2.5">
                        <div className="flex justify-between items-center text-[0.68rem] font-bold text-emerald-700 dark:text-emerald-300">
                          <span>SASARAN PROGRAM (1 SP):</span>
                          <span className="text-[0.62rem] font-semibold text-[var(--text-muted)] bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">
                            rekap_sasaran_renja_all.xlsx
                          </span>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                          {((rawRenjaTree.find((p: any) => p.nama.startsWith("WA"))?.sasaran_program?.length ?? 0) > 0
                            ? rawRenjaTree.find((p: any) => p.nama.startsWith("WA"))!.sasaran_program
                            : [
                                {
                                  nama: "01 - Meningkatnya Tata Kelola Internal PPATK",
                                  indikator: [
                                    {
                                      nama: "01 - Nilai Reformasi Birokrasi General",
                                      target_2027: "77",
                                      satuan: "Indeks"
                                    }
                                  ]
                                }
                              ]
                          ).map((sp: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-lg bg-[var(--accent)] border border-emerald-200 dark:border-emerald-900/40 text-[0.72rem] space-y-1"
                              >
                                <div className="font-bold text-emerald-700 dark:text-emerald-400 leading-snug">
                                  SP: {sp.nama}
                                </div>
                                <div className="space-y-1 pl-2 border-l-2 border-emerald-500/60">
                                  {sp.indikator.map((ind: any, iIdx: number) => (
                                    <div key={iIdx} className="text-[0.68rem] text-[var(--text-muted)] flex justify-between gap-1 items-start">
                                      <span className="leading-tight">
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">IKP:</span> {ind.nama}
                                      </span>
                                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-300 shrink-0 text-[0.65rem] bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                        Target 2027: {ind.target_2027} {ind.satuan}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (activeProgramDiagram === "WA" && visibleDiagramLevel >= 3) {
                            setActiveProgramDiagram("ALL");
                            setActiveKegiatanDiagram("ALL");
                            setVisibleDiagramLevel(2);
                          } else {
                            setActiveProgramDiagram("WA");
                            setActiveKegiatanDiagram("ALL");
                            setVisibleDiagramLevel(3);
                          }
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>
                          {activeProgramDiagram === "WA" && visibleDiagramLevel >= 3
                            ? "▲ Tutup Kegiatan Dukman (WA)"
                            : "▼ Drill-Down ke Kegiatan Dukman (3374, 3375, 3376...)"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {visibleDiagramLevel >= 3 && <div className="w-0.5 h-6 bg-[var(--primary)] opacity-40 my-1" />}
              </div>
            )}

            {/* Level 3: KEGIATAN & SASARAN KEGIATAN (FILTERED ACCORDING TO PROGRAM BE / WA SELECTION) */}
            {visibleDiagramLevel >= 3 && (
              <div className="space-y-4 flex flex-col items-center w-full">
                <div className="text-center">
                  <span className="text-[0.68rem] font-bold text-[var(--primary)] uppercase tracking-wider bg-[var(--primary-bg)]/30 px-3.5 py-1 rounded-full">
                    LEVEL 3 · KEGIATAN & SASARAN KEGIATAN (PROGRAM {activeProgramDiagram === "ALL" ? "BE & WA" : activeProgramDiagram})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-7xl">
                  {rawRenjaTree
                    .filter((prog) => activeProgramDiagram === "ALL" || prog.nama.startsWith(activeProgramDiagram))
                    .flatMap((prog) =>
                      prog.kegiatan.map((keg: any) => {
                        const isSelectedKeg = activeKegiatanDiagram === keg.kode_nama;

                        return (
                          <div
                            key={keg.kode_nama}
                            className={`aksi-card p-4 border-2 transition-all flex flex-col justify-between space-y-3 bg-[var(--card)] shadow-sm ${
                              isSelectedKeg
                                ? "border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/10 dark:bg-purple-950/10"
                                : "border-[var(--border)] hover:border-[var(--primary)]"
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <span className="badge badge-primary font-mono text-xs">
                                  {keg.kode_nama.split(" - ")[0]}
                                </span>
                                <span className="text-[0.65rem] text-[var(--text-muted)] font-semibold font-mono">
                                  {prog.nama.slice(0, 2)}
                                </span>
                              </div>

                              <h5 className="font-bold text-xs text-[var(--text)] leading-snug mb-1.5">
                                {keg.kode_nama}
                              </h5>

                              {/* Unit Kerja Badges for Kegiatan */}
                              {keg.unit_kerja && (
                                <div className="flex flex-wrap items-center gap-1 mb-2">
                                  <span className="text-[0.6rem] font-bold text-[var(--text-muted)] uppercase">Unit Kerja:</span>
                                  {(Array.isArray(keg.unit_kerja) ? keg.unit_kerja : [keg.unit_kerja]).map((uk: string, uIdx: number) => (
                                    <span
                                      key={uIdx}
                                      className="px-1.5 py-0.5 rounded text-[0.6rem] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                    >
                                      {uk}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* List of Sasaran Kegiatan under this Kegiatan */}
                              <div className="space-y-2 border-t border-[var(--border)] pt-2">
                                <span className="text-[0.65rem] font-bold text-[var(--primary)] uppercase tracking-wider block">
                                  Sasaran Kegiatan ({keg.sasaran.length}):
                                </span>
                                {keg.sasaran.map((sas: any, sIdx: number) => (
                                  <div
                                    key={sIdx}
                                    className="p-2 rounded-lg bg-[var(--accent)]/50 border border-[var(--border)]/60 text-xs space-y-1"
                                  >
                                    <div className="font-semibold text-[var(--text)] text-[0.72rem] leading-tight">
                                      {sas.nama}
                                    </div>
                                    <div className="space-y-0.5 pl-2 border-l-2 border-[var(--primary)]/40">
                                      {sas.indikator.map((ind: any, iIdx: number) => (
                                        <div key={iIdx} className="text-[0.68rem] text-[var(--text-muted)] flex justify-between gap-1">
                                          <span className="truncate">{ind.nama}</span>
                                          <span className="font-mono font-semibold text-[var(--primary)] shrink-0">
                                            {ind.target_2027} {ind.satuan}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                if (isSelectedKeg && visibleDiagramLevel >= 4) {
                                  setActiveKegiatanDiagram("ALL");
                                  setVisibleDiagramLevel(3);
                                } else {
                                  setActiveKegiatanDiagram(keg.kode_nama);
                                  setVisibleDiagramLevel(4);
                                }
                              }}
                              className={`w-full py-1.5 text-[0.7rem] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-2 ${
                                isSelectedKeg && visibleDiagramLevel >= 4
                                  ? "bg-purple-600 text-white hover:bg-purple-700"
                                  : "bg-[var(--accent)] hover:bg-[var(--primary)] hover:text-white"
                              }`}
                            >
                              <span>
                                {isSelectedKeg && visibleDiagramLevel >= 4
                                  ? "▲ Tutup KRO & RO"
                                  : `▼ Drill-Down HANYA KRO & RO (${keg.kode_nama.split(" - ")[0]})`}
                              </span>
                              <span className="text-[0.65rem] opacity-75">({keg.kro.length} KRO)</span>
                            </button>
                          </div>
                        );
                      })
                    )}
                </div>

                {visibleDiagramLevel >= 4 && <div className="w-0.5 h-6 bg-[var(--primary)] opacity-40 my-1" />}
              </div>
            )}

            {/* Level 4: KRO & RINCIAN OUTPUT (FILTERED ACCORDING TO SELECTED KEGIATAN) */}
            {visibleDiagramLevel >= 4 && (
              <div className="space-y-4 flex flex-col items-center w-full">
                <div className="text-center">
                  <span className="text-[0.68rem] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 px-3.5 py-1 rounded-full border border-purple-300 dark:border-purple-800">
                    LEVEL 4 · KELOMPOK RINCIAN OUTPUT (KRO) & RO (
                    {activeKegiatanDiagram === "ALL" ? "SEMUA KEGIATAN" : `KEGIATAN ${activeKegiatanDiagram.split(" - ")[0]}`}
                    )
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-7xl">
                  {rawRenjaTree
                    .filter((prog) => activeProgramDiagram === "ALL" || prog.nama.startsWith(activeProgramDiagram))
                    .flatMap((prog) =>
                      prog.kegiatan
                        .filter((keg: any) => activeKegiatanDiagram === "ALL" || keg.kode_nama === activeKegiatanDiagram)
                        .flatMap((keg: any) =>
                          keg.kro.map((kroItem: any, kroIdx: number) => (
                            <div
                              key={`${keg.kode_nama}-${kroIdx}`}
                              className="p-4 rounded-xl border border-purple-300 dark:border-purple-800 bg-gradient-to-b from-purple-50/30 to-[var(--card)] dark:from-purple-950/30 dark:to-[var(--card)] space-y-3 shadow-sm"
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[0.65rem] font-bold font-mono px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200">
                                  {keg.kode_nama.split(" - ")[0]}
                                </span>
                                <span className="text-[0.65rem] text-purple-700 dark:text-purple-300 font-bold uppercase truncate max-w-[150px]">
                                  {kroItem.nama.split(" - ")[0]}
                                </span>
                              </div>

                              <h6 className="font-bold text-xs text-[var(--text)] leading-snug">
                                KRO: {kroItem.nama}
                              </h6>

                              {/* List of RO under this KRO */}
                              <div className="space-y-2 border-t border-purple-200 dark:border-purple-800/60 pt-2">
                                <span className="text-[0.65rem] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">
                                  Rincian Output (RO) ({kroItem.ro.length}):
                                </span>
                                {kroItem.ro.map((roItem: any, rIdx: number) => (
                                  <div
                                    key={rIdx}
                                    className="p-2.5 rounded-lg bg-[var(--card)] border border-purple-200 dark:border-purple-800 space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <div className="font-bold text-xs text-[var(--primary)] font-mono leading-tight flex-1">
                                        {roItem.nama}
                                      </div>
                                      {roItem.unit_kerja && (
                                        <div className="flex flex-wrap gap-0.5 shrink-0">
                                          {(Array.isArray(roItem.unit_kerja) ? roItem.unit_kerja : [roItem.unit_kerja]).map((uk: string, uIdx: number) => (
                                            <span
                                              key={uIdx}
                                              className="px-1.5 py-0.5 rounded text-[0.58rem] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                            >
                                              {uk}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {roItem.indikator.map((ind: any, iIdx: number) => (
                                      <div
                                        key={iIdx}
                                        className="p-1.5 rounded bg-[var(--accent)] text-[0.7rem] flex flex-col gap-0.5"
                                      >
                                        <span className="font-medium text-[var(--text)]">{ind.nama}</span>
                                        <div className="flex justify-between items-center text-[0.65rem] text-[var(--text-muted)] font-mono">
                                          <span>Target 2027–2029:</span>
                                          <span className="font-bold text-[var(--primary)]">
                                            {ind.target_2027} / {ind.target_2028} / {ind.target_2029} {ind.satuan}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          6. SUBMENU UTAMA: INFORMASI KINERJA (Drill-Up & Drill-Down RO)
         ══════════════════════════════════════════════════════════════ */}
      {(path === "/referensi/informasi-kinerja" ||
        path === "/referensi/output-kro" ||
        path === "/referensi/komponen") && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="aksi-card p-5 border-l-4 border-l-[var(--primary)] bg-gradient-to-r from-[var(--card)] to-[var(--primary-bg)]/15">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-primary text-[0.65rem] font-bold">REKAP SASARAN RENJA PPATK (ALL)</span>
                  <span className="text-xs text-[var(--text-muted)]">Target Kinerja 2027–2030 (Drill-Down sampai Level RO)</span>
                </div>
                <h2 className="text-base font-bold text-[var(--text)]">
                  Informasi Kinerja PPATK (Program, Sasaran, Kegiatan, KRO & RO)
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Eksplorasi data sasaran kinerja, indikator, target 5 tahunan (2025-2030), dan rincian output kegiatan.
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-[var(--accent)] p-1 rounded-xl border border-[var(--border)]">
                <button
                  onClick={() => {
                    setActiveTabKinerja("sasaran");
                    setKinerjaCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTabKinerja === "sasaran"
                      ? "bg-[var(--primary)] text-white shadow"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  Hierarki Sasaran & RO ({filteredRekapRenja.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTabKinerja("komponen");
                    setKinerjaCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTabKinerja === "komponen"
                      ? "bg-[var(--primary)] text-white shadow"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  Katalog Komponen ({filteredKomponenList.length})
                </button>
              </div>
            </div>
          </div>

          {/* Active Program Bar & Drill-Up Action */}
          <div className="aksi-card p-4 border border-[var(--primary)]/30 bg-gradient-to-r from-[var(--primary-bg)]/20 via-[var(--card)] to-[var(--card)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm shadow">
                  {selectedProgramFilter === "Semua" ? "ALL" : selectedProgramFilter}
                </div>
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--primary)] block">
                    Program Aktif:
                  </span>
                  <h3 className="font-bold text-sm text-[var(--text)]">
                    {selectedProgramFilter === "WA"
                      ? "WA - Program Dukungan Manajemen"
                      : selectedProgramFilter === "BE"
                      ? "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme"
                      : "Semua Program (BE & WA)"}
                  </h3>
                </div>
              </div>

              {/* Drill-Up and Quick Filter Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedProgramFilter !== "Semua" && (
                  <button
                    onClick={() => {
                      setSelectedProgramFilter("Semua");
                      setSelectedKegiatanFilter("Semua");
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:opacity-90 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <span>▲ Drill-Up ke Semua Program</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedProgramFilter(selectedProgramFilter === "WA" ? "BE" : "WA")}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] text-[var(--text)] transition-colors cursor-pointer"
                >
                  Ganti ke Program {selectedProgramFilter === "WA" ? "BE" : "WA"} ➜
                </button>
              </div>
            </div>
          </div>

          {/* Filter & Toolbar */}
          <div className="aksi-card p-4 space-y-3">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={kinerjaSearch}
                  onChange={(e) => {
                    setKinerjaSearch(e.target.value);
                    setKinerjaCurrentPage(1);
                  }}
                  placeholder="Cari Sasaran, Indikator, Kegiatan, atau KRO/RO..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--accent)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <select
                  value={selectedProgramFilter}
                  onChange={(e) => {
                    setSelectedProgramFilter(e.target.value);
                    setSelectedKegiatanFilter("Semua");
                    setKinerjaCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="Semua">Semua Program</option>
                  <option value="WA">WA - Program Dukungan Manajemen</option>
                  <option value="BE">BE - Program Pencegahan & Pemberantasan TPPU</option>
                </select>

                <select
                  value={selectedKegiatanFilter}
                  onChange={(e) => {
                    setSelectedKegiatanFilter(e.target.value);
                    setKinerjaCurrentPage(1);
                  }}
                  className="max-w-[240px] px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="Semua">Semua Kegiatan</option>
                  {availableKegiatanList.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTypeFilter}
                  onChange={(e) => {
                    setSelectedTypeFilter(e.target.value);
                    setKinerjaCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="Semua">Semua Level</option>
                  <option value="SASARAN_PROGRAM">Sasaran Program (SP)</option>
                  <option value="SASARAN_KEGIATAN">Sasaran Kegiatan</option>
                  <option value="KRO_RO">KRO & Rincian Output (RO)</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAllItemsExpand(true)}
                    className="px-2.5 py-1.5 text-[0.7rem] font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)]"
                    title="Buka semua rincian"
                  >
                    Buka Semua
                  </button>
                  <button
                    onClick={() => setAllItemsExpand(false)}
                    className="px-2.5 py-1.5 text-[0.7rem] font-medium rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)]"
                    title="Tutup semua rincian"
                  >
                    Tutup Semua
                  </button>
                </div>
              </div>
            </div>

            {/* Pagination Controls & Rows Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-muted)] font-medium">Baris per halaman:</span>
                <select
                  value={kinerjaRowsPerPage}
                  onChange={(e) => {
                    setKinerjaRowsPerPage(Number(e.target.value));
                    setKinerjaCurrentPage(1);
                  }}
                  className="px-3 py-1 text-xs rounded-xl border border-[var(--border)] bg-[var(--accent)] text-[var(--text)] font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
                >
                  <option value={10}>10 baris</option>
                  <option value={20}>20 baris</option>
                  <option value={50}>50 baris</option>
                  <option value={100}>100 baris</option>
                </select>

                <span className="text-xs text-[var(--text-muted)]">
                  Menampilkan {currentTabTotalItems > 0 ? (kinerjaCurrentPage - 1) * kinerjaRowsPerPage + 1 : 0} -{" "}
                  {Math.min(kinerjaCurrentPage * kinerjaRowsPerPage, currentTabTotalItems)} dari{" "}
                  <strong className="text-[var(--text)]">{currentTabTotalItems}</strong> data{" "}
                  {activeTabKinerja === "sasaran" ? "Renja All" : "Komponen"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setKinerjaCurrentPage(1)}
                  disabled={kinerjaCurrentPage === 1}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] disabled:opacity-40 hover:bg-[var(--accent)] cursor-pointer"
                >
                  « First
                </button>
                <button
                  onClick={() => setKinerjaCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={kinerjaCurrentPage === 1}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] disabled:opacity-40 hover:bg-[var(--accent)] cursor-pointer"
                >
                  ‹ Prev
                </button>
                <span className="px-3 py-1 text-xs font-bold text-[var(--primary)] bg-[var(--primary-bg)]/20 rounded-lg">
                  {kinerjaCurrentPage} / {currentTabTotalPages}
                </span>
                <button
                  onClick={() => setKinerjaCurrentPage((p) => Math.min(currentTabTotalPages, p + 1))}
                  disabled={kinerjaCurrentPage >= currentTabTotalPages}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] disabled:opacity-40 hover:bg-[var(--accent)] cursor-pointer"
                >
                  Next ›
                </button>
                <button
                  onClick={() => setKinerjaCurrentPage(currentTabTotalPages)}
                  disabled={kinerjaCurrentPage >= currentTabTotalPages}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--card)] disabled:opacity-40 hover:bg-[var(--accent)] cursor-pointer"
                >
                  Last »
                </button>
              </div>
            </div>
          </div>

          {/* ── TAB 1: STRUKTUR HIERARKI SASARAN RENJA ALL & RO DENGAN DRILL-DOWN / DRILL-UP ── */}
          {activeTabKinerja === "sasaran" && (
            <div className="space-y-4">
              <div className="space-y-3">
                {hierarchicalRenjaGroups
                  .slice((kinerjaCurrentPage - 1) * kinerjaRowsPerPage, kinerjaCurrentPage * kinerjaRowsPerPage)
                  .map((group, gIdx) => {
                    const isExpanded = expandedItems[group.sasaran_kro] ?? true;
                    const isRO = Boolean(group.ro);

                    return (
                      <div
                        key={gIdx}
                        className={`aksi-card overflow-hidden border transition-all ${
                          group.type === "SASARAN_PROGRAM"
                            ? "border-blue-500/40 bg-gradient-to-r from-blue-50/10 to-[var(--card)]"
                            : group.type === "SASARAN_KEGIATAN"
                            ? "border-emerald-500/30 bg-gradient-to-r from-emerald-50/10 to-[var(--card)]"
                            : "border-[var(--border)]"
                        }`}
                      >
                        {/* Group Header with Drill-Down Toggle */}
                        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border)]">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => toggleItemExpand(group.sasaran_kro)}
                              className="mt-0.5 p-1 rounded-lg bg-[var(--accent)] hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer"
                              title={isExpanded ? "Tutup rincian indikator" : "Buka rincian indikator"}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={`text-[0.65rem] px-2 py-0.5 rounded font-bold font-mono ${
                                  group.type === "SASARAN_PROGRAM"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                    : group.type === "SASARAN_KEGIATAN"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                                }`}>
                                  {group.type.replace(/_/g, " ")}
                                </span>

                                {group.kegiatan && (
                                  <span className="text-[0.68rem] text-[var(--text-muted)] font-mono truncate">
                                    Kegiatan: {group.kegiatan}
                                  </span>
                                )}

                                {isRO && (
                                  <span className="badge badge-primary text-[0.65rem]">
                                    RO: {group.ro}
                                  </span>
                                )}
                              </div>

                              <h3 className="font-bold text-sm text-[var(--text)] leading-snug">
                                {group.sasaran_kro}
                              </h3>
                            </div>
                          </div>

                          {/* Drill Action buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <span className="text-xs text-[var(--text-muted)] font-medium">
                              {group.indicators.length} Indikator
                            </span>

                            <button
                              onClick={() => toggleItemExpand(group.sasaran_kro)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--accent)] hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span>{isExpanded ? "Tutup" : "Drill-Down ▾"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Indikator List (Expanded) */}
                        {isExpanded && (
                          <div className="p-0 overflow-x-auto bg-[var(--card)]">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[var(--accent)]/60 text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
                                <tr>
                                  <th className="py-2.5 px-4 w-12 text-center">No</th>
                                  <th className="py-2.5 px-3">Indikator Kinerja</th>
                                  <th className="py-2.5 px-2 text-center w-16">2025</th>
                                  <th className="py-2.5 px-2 text-center w-16">2026</th>
                                  <th className="py-2.5 px-2 text-center w-16 bg-[var(--primary-bg)]/20 text-[var(--primary)] font-black">
                                    2027
                                  </th>
                                  <th className="py-2.5 px-2 text-center w-16">2028</th>
                                  <th className="py-2.5 px-2 text-center w-16">2029</th>
                                  <th className="py-2.5 px-2 text-center w-16">2030</th>
                                  <th className="py-2.5 px-3 text-center w-24">Satuan</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--border)]">
                                {group.indicators.map((ind: any, iIdx: number) => (
                                  <tr key={iIdx} className="hover:bg-[var(--accent)]/40 transition-colors">
                                    <td className="py-2.5 px-4 text-center text-[var(--text-muted)] font-mono">
                                      {ind.no || iIdx + 1}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <div className="font-semibold text-[var(--text)] leading-snug">
                                        {ind.indikator}
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-2 text-center font-mono font-medium text-[var(--text)]">
                                      {ind.target["2025"] || "-"}
                                    </td>
                                    <td className="py-2.5 px-2 text-center font-mono font-medium text-[var(--text)]">
                                      {ind.target["2026"] || "-"}
                                    </td>
                                    <td className="py-2.5 px-2 text-center font-mono font-bold text-[var(--primary)] bg-[var(--primary-bg)]/10">
                                      {ind.target["2027"] || "-"}
                                    </td>
                                    <td className="py-2.5 px-2 text-center font-mono font-medium text-[var(--text)]">
                                      {ind.target["2028"] || "-"}
                                    </td>
                                    <td className="py-2.5 px-2 text-center font-mono font-medium text-[var(--text)]">
                                      {ind.target["2029"] || "-"}
                                    </td>
                                    <td className="py-2.5 px-2 text-center font-mono font-medium text-[var(--text)]">
                                      {ind.target["2030"] || "-"}
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-semibold text-[var(--text-muted)] whitespace-nowrap">
                                      <span className="px-2 py-0.5 rounded bg-[var(--accent)] text-[0.7rem]">
                                        {ind.satuan || "-"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ── TAB 2: KATALOG KOMPONEN LENGKAP (443 DATA) ── */}
          {activeTabKinerja === "komponen" && (
            <div className="aksi-card overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)]">Daftar Komponen & Sub-Komponen Kegiatan</h3>
                  <p className="text-xs text-[var(--text-muted)]">Pemetaan KRO, RO, dan Komponen teknis PPATK</p>
                </div>
                <span className="text-xs font-semibold text-[var(--primary)]">
                  {filteredKomponenList.length} Komponen
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--accent)] text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
                    <tr>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Program & Kegiatan</th>
                      <th className="py-2.5 px-3">KRO (Kelompok Rincian Output)</th>
                      <th className="py-2.5 px-3">RO (Rincian Output)</th>
                      <th className="py-2.5 px-3">Komponen Kegiatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredKomponenList
                      .slice((kinerjaCurrentPage - 1) * kinerjaRowsPerPage, kinerjaCurrentPage * kinerjaRowsPerPage)
                      .map((row: any) => (
                        <tr key={row.id} className="hover:bg-[var(--accent)]/40 transition-colors">
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="badge badge-primary font-bold">{row.unitKerja}</span>
                          </td>
                          <td className="py-2.5 px-3 max-w-xs">
                            <div className="font-semibold text-[var(--text)]">{row.kegiatan}</div>
                            <div className="text-[0.65rem] text-[var(--text-muted)] truncate">{row.program}</div>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[var(--text)] max-w-xs">{row.kro}</td>
                          <td className="py-2.5 px-3 font-medium text-[var(--text)] max-w-xs">{row.ro}</td>
                          <td className="py-2.5 px-3 text-[var(--text-muted)] max-w-xs">{row.komponen}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          7. REFERENSI INFORMASI KINERJA: UNIT KERJA
         ══════════════════════════════════════════════════════════════ */}
      {path === "/referensi/unit-kerja" && (
        <div className="space-y-6">
          <div className="aksi-card p-5 border-l-4 border-l-[var(--primary)] bg-gradient-to-r from-[var(--card)] to-[var(--primary-bg)]/15">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-primary text-[0.65rem] font-bold">STRUKTUR ORGANISASI PPATK</span>
                </div>
                <h2 className="text-base font-bold text-[var(--text)]">Unit Kerja PPATK</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Daftar unit kerja di lingkungan PPATK
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)] pb-2">
              <Building className="h-4 w-4 text-[var(--primary)]" />
              <span>Direktorat (Dipimpin oleh Deputi Bidang)</span>
            </h3>

            {[
              {
                title: "Deputi Bidang Analisis Transaksi Keuangan (ASA)",
                subcluster: "Deputi Bidang Analisis Transaksi Keuangan (ASA)",
                badgeColor: "bg-blue-500",
                units: rawUnitKerjaData.filter(
                  (u: any) => u.subcluster === "Deputi Bidang Analisis Transaksi Keuangan (ASA)"
                ),
              },
              {
                title: "Deputi Bidang Strategi dan Kerja Sama (TEGAS)",
                subcluster: "Deputi Bidang Strategi dan Kerja Sama (TEGAS)",
                badgeColor: "bg-emerald-500",
                units: rawUnitKerjaData.filter(
                  (u: any) => u.subcluster === "Deputi Bidang Strategi dan Kerja Sama (TEGAS)"
                ),
              },
              {
                title: "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan (PENGASUH)",
                subcluster: "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan (PENGASUH)",
                badgeColor: "bg-purple-500",
                units: rawUnitKerjaData.filter(
                  (u: any) => u.subcluster === "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan (PENGASUH)"
                ),
              },
            ].map((subGroup) => (
              <div key={subGroup.title} className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--primary)] bg-[var(--accent)]/60 px-3 py-1.5 rounded-lg">
                  <span className={`w-2.5 h-2.5 rounded-full ${subGroup.badgeColor}`} />
                  <span>{subGroup.title}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {subGroup.units.map((unit: any) => (
                    <div key={unit.singkatan} className="aksi-card p-4 flex items-center gap-4 hover:border-[var(--primary)] transition-all">
                      <div className="w-12 h-12 rounded-xl bg-[var(--primary-bg)] text-[var(--primary)] flex items-center justify-center font-black text-2xl shadow-inner">
                        {unit.initial || unit.singkatan[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-[var(--primary)]">{unit.singkatan}</div>
                        <div className="text-xs text-[var(--text-muted)] line-clamp-2">{unit.nama}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4 border-t border-[var(--border)]">
            <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
              <Landmark className="h-4 w-4 text-[var(--primary)]" />
              <span>Biro, Inspektorat & Pusat Pendukung</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rawUnitKerjaData
                .filter((u: any) => u.cluster !== "Direktorat")
                .map((unit: any) => (
                  <div key={unit.singkatan} className="aksi-card p-4 flex items-center gap-4 hover:border-[var(--primary)] transition-all">
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent)] text-[var(--text)] flex items-center justify-center font-black text-2xl shadow-inner">
                      {unit.initial || unit.singkatan[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-[var(--primary)]">{unit.singkatan}</div>
                      <div className="text-xs text-[var(--text-muted)] line-clamp-2">{unit.nama}</div>
                      <div className="text-[0.65rem] text-[var(--text-muted)] mt-0.5 italic">{unit.cluster}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          8. REFERENSI INFORMASI KINERJA: SATUAN KERJA
         ══════════════════════════════════════════════════════════════ */}
      {path === "/referensi/satuan-kerja" && (
        <div className="space-y-4">
          <div className="aksi-card p-5 border-l-4 border-l-[var(--primary)] bg-gradient-to-r from-[var(--card)] to-[var(--primary-bg)]/15">
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-primary text-[0.65rem] font-bold">KEMENTERIAN / LEMBAGA & SATKER</span>
            </div>
            <h2 className="text-base font-bold text-[var(--text)]">Satuan Kerja (SATKER) PPATK</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Daftar Satuan Kerja Pengelola Anggaran di Lingkungan PPATK
            </p>
          </div>

          <div className="aksi-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--accent)] font-bold border-b border-[var(--border)]">
                  <tr>
                    <th className="py-2.5 px-3">Kode Satker / KL</th>
                    <th className="py-2.5 px-3">Nama Satuan Kerja</th>
                    <th className="py-2.5 px-3">Jenis Satker</th>
                    <th className="py-2.5 px-3">Eselon / Unit Utama</th>
                    <th className="py-2.5 px-3">Lokasi</th>
                    <th className="py-2.5 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {rawSatkerData.map((sat: any) => (
                    <tr key={sat.kode} className="hover:bg-[var(--accent)]/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-sm text-[var(--primary)]">{sat.kode}</td>
                      <td className="py-3 px-3 font-semibold text-[var(--text)]">{sat.nama}</td>
                      <td className="py-3 px-3 text-[var(--text-muted)]">{sat.jenis}</td>
                      <td className="py-3 px-3">
                        <span className="badge badge-primary">{sat.eselon}</span>
                      </td>
                      <td className="py-3 px-3 text-[var(--text-muted)]">{sat.lokasi}</td>
                      <td className="py-3 px-3 text-[var(--text-muted)]">{sat.keterangan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          9. DATA PEJABAT PPATK
         ══════════════════════════════════════════════════════════════ */}
      {path === "/referensi/pejabat" && (
        <div className="aksi-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">Data Pejabat Penandatangan Dokumen PPATK</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Basis data pejabat yang berwenang menandatangani Renstra, Renja SETIA, Renja PATIH, TOR, dan RAB
              </p>
            </div>
            <UserCheck className="h-6 w-6 text-emerald-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockPejabat.map((pej) => (
              <div
                key={pej.id}
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] transition-all space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text)]">{pej.nama}</h3>
                    <p className="text-xs text-[var(--primary)] font-semibold">{pej.jabatan}</p>
                  </div>
                  <span className="badge badge-primary text-[0.65rem]">{pej.status}</span>
                </div>

                <div className="text-xs text-[var(--text-muted)] space-y-0.5">
                  <p>
                    NIP: <span className="font-mono text-[var(--text)]">{pej.nip}</span>
                  </p>
                  <p>
                    Pangkat/Gol: <span className="text-[var(--text)]">{pej.pangkat}</span>
                  </p>
                  <p>
                    Unit Kerja: <span className="text-[var(--text)]">{pej.unitKerja}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border)]">
                  <span className="text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                    Wewenang Penandatanganan:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {pej.roleTtd.map((r, i) => (
                      <span
                        key={i}
                        className="text-[0.65rem] px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--text)] font-medium"
                      >
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          10. MANAJEMEN PENGGUNA & HAK AKSES
         ══════════════════════════════════════════════════════════════ */}
      {(path.startsWith("/admin/pengguna") || path.startsWith("/admin/peran")) && (
        <div className="aksi-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">Manajemen Pengguna & Hak Akses AKSI PPATK</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Kelola akun operator, perencana, verifikator anggaran, dan pejabat penandatangan
              </p>
            </div>
            <Shield className="h-6 w-6 text-purple-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--accent)] text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
                <tr>
                  <th className="py-2.5 px-3">Nama Pegawai</th>
                  <th className="py-2.5 px-3">Email Dinas PPATK</th>
                  <th className="py-2.5 px-3">Peran / Hak Akses</th>
                  <th className="py-2.5 px-3">Unit Kerja</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {mockPengguna.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--accent)]/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[var(--text)]">{u.nama}</td>
                    <td className="py-3 px-3 font-mono text-[var(--text-muted)]">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className="badge badge-primary">{u.role}</span>
                    </td>
                    <td className="py-3 px-3 text-[var(--text)]">{u.unitKerja}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[0.68rem] px-2 py-0.5 rounded-full ${
                          u.status === "Online"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${u.status === "Online" ? "bg-green-500" : "bg-slate-400"}`}
                        />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => alert(`Kelola hak akses untuk ${u.nama}`)}
                        className="text-[var(--primary)] font-semibold hover:underline cursor-pointer"
                      >
                        Edit Izin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          11. TAMPILAN MODUL UMUM LAINNYA (SETIA / PATIH / KAK / MONEV)
         ══════════════════════════════════════════════════════════════ */}
      {!path.startsWith("/rab") &&
        !path.startsWith("/renstra") &&
        !path.startsWith("/standar-biaya") &&
        !path.startsWith("/referensi/visi-misi") &&
        !path.startsWith("/referensi/visualisasi-sasaran-kinerja") &&
        !path.startsWith("/referensi/informasi-kinerja") &&
        !path.startsWith("/referensi/unit-kerja") &&
        !path.startsWith("/referensi/satuan-kerja") &&
        path !== "/referensi/bas" &&
        path !== "/referensi/pejabat" &&
        !path.startsWith("/admin/pengguna") &&
        !path.startsWith("/admin/peran") && (
          <div className="space-y-4">
            <div className="aksi-card p-6 border-l-4 border-l-[var(--primary)] bg-gradient-to-r from-[var(--card)] to-[var(--accent)]/30">
              <h2 className="text-base font-bold text-[var(--text)]">{title}</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Dokumen resmi perencanaan terintegrasi dalam sistem AKSI PPATK Tahun Anggaran 2027.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="badge badge-primary">Eselon I: Sekretariat Utama (SETIA)</span>
                <span className="badge badge-gray">Eselon II: Pusdiklat APU PPT (PATIH)</span>
                <span className="badge badge-red">RO: Diklat Aparat Penegak Hukum (APH)</span>
              </div>
            </div>

            <div className="aksi-card p-8 text-center space-y-3">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-[var(--primary)] opacity-80" />
              <h3 className="font-bold text-sm text-[var(--text)]">Formulir Kerja & Matriks Terhubung</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                Seluruh data pada menu ini langsung terkoneksi dengan <b>Renstra PPATK 2025–2029</b>, <b>Bagan Akun Standar</b>, serta rincian <b>Standar Biaya Keluaran (SBK)</b>.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  to="/rab/input-rinci"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--primary)] text-white hover:opacity-90 transition-opacity"
                >
                  Buka Input RAB Rinci ➜
                </Link>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
