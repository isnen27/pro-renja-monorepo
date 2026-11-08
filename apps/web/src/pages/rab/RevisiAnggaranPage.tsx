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
  Lock,
  Unlock,
  Check,
  CheckSquare,
  HelpCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import unitKerjaData from "../../data/unitKerjaData.json";
import kewenanganRevisiData from "../../data/kewenanganRevisiData.json";
import { WorksheetRow } from "./IsianRabPage";
import RichTextEditor, { AttachedDocument } from "../../components/ui/RichTextEditor";

export default function RevisiAnggaranPage() {
  // Modal Pratinjau Cetak Matriks Usulan Revisi
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Baca histori aktif dari localStorage untuk menentukan hak akses tab Revisi
  const activeHistoriObj = useMemo(() => {
    try {
      const saved = localStorage.getItem("rab_active_histori");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  }, []);

  const kodeHistori = (activeHistoriObj?.kode_sts_history || "A01").toUpperCase();
  const labelHistori = activeHistoriObj?.label || activeHistoriObj?.status_histori || `Histori ${kodeHistori}`;

  // Logika pembagian tab revisi:
  // - Kode C01 - C99 : yang terbuka hanya tab Revisi POK (tab Revisi DIPA dikunci).
  // - Selain C01 - C99 (misal A01..A99, B00, D00, D01, G00, dsb.) : yang terbuka hanya tab Revisi DIPA (tab Revisi POK dikunci).
  const isPokHistori = /^C\d{2}$/i.test(kodeHistori);
  const isDipaTabAllowed = !isPokHistori; // Selain C01 - C99 hanya tab Revisi DIPA yang terbuka
  const isPokTabAllowed = isPokHistori;   // Hanya C01 - C99 yang membuka tab Revisi POK

  // Tab yang aktif ditentukan otomatis berdasarkan kode histori
  const [activeTab, setActiveTab] = useState<"dipa" | "pok">(() => {
    if (isPokTabAllowed) return "pok";
    return "dipa";
  });

  // Sinkronisasi tab saat histori berubah
  useEffect(() => {
    if (isPokTabAllowed) {
      setActiveTab("pok");
    } else {
      setActiveTab("dipa");
    }
  }, [isPokTabAllowed]);

  // Kalkulasi nomor revisi 'Semula Ke-' dan 'Menjadi Ke-' otomatis dari riwayat histori
  // Aturan pengguna:
  // 1. "misalnya semula ada history C01, lalu user membuka history C02, maka sistem membaca Semula ke-01, menjadi ke-02"
  // 2. "jika histori aktif tidak memiliki history sebelumnya, maka isian tidak aktif"
  //
  // Penentuan histori sebelumnya (hasPreviousHistory):
  // - Kode status berakhiran '01' s.d. '99' (misal C01 -> sumber B00 atau C02 -> sumber C01, A01, dsb.) memiliki riwayat sebelumnya.
  // - Kode status yang merupakan status awal / baseline tanpa histori sebelumnya (misal 'B00', 'D00', 'G00', atau rev_ke === 0):
  //   dianggap TIDAK memiliki histori sebelumnya, sehingga isian input Semula & Menjadi menjadi nonaktif (disabled) atau readonly.
  const historyInfo = useMemo(() => {
    const rawKode = kodeHistori;
    const revKe = activeHistoriObj?.rev_ke;
    const sumber = activeHistoriObj?.sumber;

    // Cek apakah histori aktif memiliki histori sebelumnya
    // Kondisi memiliki riwayat sebelumnya:
    // - Jika kode berformat [Huruf][Angka > 0], contoh C01, C02, A01, A02, D01, dst.
    // - Atau jika rev_ke > 0
    // - Atau jika sumber ada dan bukan sama persis dengan kode status itu sendiri
    let hasPrevious = false;
    let menjadiNum = 0;
    let semulaNum = 0;

    const matchDigits = rawKode.match(/\d+/);
    if (matchDigits) {
      menjadiNum = parseInt(matchDigits[0], 10);
    } else if (typeof revKe === "number") {
      menjadiNum = revKe;
    }

    if (menjadiNum > 0) {
      hasPrevious = true;
      // Jika ada sumber yang spesifik (misal C02 bersumber C01 -> semula = 1)
      if (sumber) {
        const matchSumber = String(sumber).match(/\d+/);
        if (matchSumber) {
          semulaNum = parseInt(matchSumber[0], 10);
        } else {
          semulaNum = Math.max(0, menjadiNum - 1);
        }
      } else {
        semulaNum = Math.max(0, menjadiNum - 1);
      }
    } else {
      // Jika rev_ke === 0 atau kode 'B00', 'D00', 'G00' -> tidak memiliki histori sebelumnya
      hasPrevious = false;
      semulaNum = 0;
      menjadiNum = 0;
    }

    const semulaStr = String(semulaNum).padStart(2, "0");
    const menjadiStr = String(menjadiNum).padStart(2, "0");

    return {
      hasPrevious,
      // Terisi otomatis: jika memiliki previous pakai semulaStr, jika awal (misal 00) tampilkan "00" dan "01"
      semulaStr: hasPrevious ? semulaStr : "00",
      menjadiStr: hasPrevious ? menjadiStr : "01",
    };
  }, [activeHistoriObj, kodeHistori]);

  // Nomor revisi terisi otomatis sesuai history
  const [revisiSemulaKe, setRevisiSemulaKe] = useState<string>(() => historyInfo.semulaStr);
  const [revisiMenjadiKe, setRevisiMenjadiKe] = useState<string>(() => historyInfo.menjadiStr);

  // Update revisiSemulaKe & revisiMenjadiKe ketika histori berubah
  useEffect(() => {
    setRevisiSemulaKe(historyInfo.semulaStr);
    setRevisiMenjadiKe(historyInfo.menjadiStr);
  }, [historyInfo.semulaStr, historyInfo.menjadiStr]);

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

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Kertas kerja dari Isian RAB
  const [rawRows, setRawRows] = useState<WorksheetRow[]>([]);

  // State expand/collapse per level seperti pada ForumPenelaahanPage
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Pilihan Uraian Revisi Berdasarkan File 'kewenangan revisi.xlsx' (apps/web/src/data/kewenanganRevisiData.json)
  // Sebelum mengisi keterangan revisi, user terlebih dahulu memilih uraian revisi yang diajukan
  const [selectedUraianRevisiIds, setSelectedUraianRevisiIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`rab_selected_uraian_revisi_${ukSingkatan}_${kodeHistori}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default awal untuk demo jika belum ada yang dipilih
    return isPokTabAllowed ? ["rev-item-52", "rev-item-53"] : ["rev-item-59"];
  });

  const [searchUraianKewenangan, setSearchUraianKewenangan] = useState<string>("");

  // Klaster Jenis Revisi Aktif (sesuai kolom JENIS REVISI pada kewenangan revisi.xlsx)
  const [selectedJenisRevisiCluster, setSelectedJenisRevisiCluster] = useState<string>(() => {
    return isPokTabAllowed ? "POK" : "Semua Klaster";
  });

  // Sinkronisasi default cluster ketika tab beralih
  useEffect(() => {
    if (activeTab === "pok") {
      setSelectedJenisRevisiCluster("POK");
    } else {
      setSelectedJenisRevisiCluster("Semua Klaster");
    }
  }, [activeTab]);

  // Daftar opsi uraian revisi yang relevan dengan tab aktif (DIPA / POK)
  const availableUraianList = useMemo(() => {
    return kewenanganRevisiData.filter((item) => {
      if (activeTab === "pok") {
        return item.scope === "pok";
      } else {
        return item.scope === "dipa";
      }
    });
  }, [activeTab]);

  // Daftar klaster Jenis Revisi unik yang tersedia pada tab aktif
  const availableClusters = useMemo(() => {
    const set = new Set<string>();
    availableUraianList.forEach((item) => {
      if (item.jenisRevisi) set.add(item.jenisRevisi);
    });
    return Array.from(set).sort();
  }, [availableUraianList]);

  // Saring opsi uraian berdasarkan klaster dan pencarian
  const filteredAvailableUraianList = useMemo(() => {
    let list = availableUraianList;

    // Filter klaster JENIS REVISI jika bukan "Semua Klaster"
    if (selectedJenisRevisiCluster && selectedJenisRevisiCluster !== "Semua Klaster") {
      list = list.filter((item) => item.jenisRevisi === selectedJenisRevisiCluster);
    }

    if (!searchUraianKewenangan.trim()) return list;
    const q = searchUraianKewenangan.toLowerCase();
    return list.filter(
      (item) =>
        item.uraian.toLowerCase().includes(q) ||
        (item.no && item.no.toLowerCase().includes(q)) ||
        (item.jenisRevisi && item.jenisRevisi.toLowerCase().includes(q)) ||
        item.kewenangan.toLowerCase().includes(q) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(q))
    );
  }, [availableUraianList, selectedJenisRevisiCluster, searchUraianKewenangan]);

  // Objek-objek uraian yang sedang terpilih
  const selectedUraianObjects = useMemo(() => {
    return kewenanganRevisiData.filter((item) => selectedUraianRevisiIds.includes(item.id));
  }, [selectedUraianRevisiIds]);

  // Handler toggle pilihan uraian revisi
  const handleToggleUraianRevisi = (id: string) => {
    if (!historyInfo.hasPrevious) return;
    setSelectedUraianRevisiIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(`rab_selected_uraian_revisi_${ukSingkatan}_${kodeHistori}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Handler uncheck cepat satu uraian
  const handleRemoveSelectedUraian = (id: string) => {
    if (!historyInfo.hasPrevious) return;
    setSelectedUraianRevisiIds((prev) => {
      const next = prev.filter((x) => x !== id);
      try {
        localStorage.setItem(`rab_selected_uraian_revisi_${ukSingkatan}_${kodeHistori}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Handler bersihkan semua pilihan
  const handleClearAllSelectedUraian = () => {
    if (!historyInfo.hasPrevious) return;
    setSelectedUraianRevisiIds([]);
    try {
      localStorage.setItem(`rab_selected_uraian_revisi_${ukSingkatan}_${kodeHistori}`, JSON.stringify([]));
    } catch (e) {}
  };

  // Tujuan Usulan Revisi & Penjabaran Alasan Pentingnya Usulan Revisi
  const [tujuanRevisi, setTujuanRevisi] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`rab_revisi_tujuan_${ukSingkatan}_${kodeHistori}`);
      if (saved !== null) return saved;
    } catch (e) {}
    return "Optimalisasi dan penataan alokasi anggaran belanja operasional dan pendukung kegiatan prioritas tahun anggaran berjalan guna mendukung kelancaran pelaksanaan tugas dan fungsi unit kerja.";
  });

  const [alasanPentingRevisi, setAlasanPentingRevisi] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`rab_revisi_alasan_${ukSingkatan}_${kodeHistori}`);
      if (saved !== null) return saved;
    } catch (e) {}
    return "Revisi anggaran mendesak dilakukan untuk mengakomodasi pergeseran kebutuhan riil pelaksanaan kegiatan di lapangan yang belum teralokasikan secara optimal pada DIPA/POK semula, serta mencegah terjadinya potensi kendala administratif dan keterlambatan realisasi output kinerja institusi.";
  });

  // Dokumen Lampiran Pendukung Revisi
  const [tujuanAttachments, setTujuanAttachments] = useState<AttachedDocument[]>(() => {
    try {
      const saved = localStorage.getItem(`rab_revisi_tujuan_att_${ukSingkatan}_${kodeHistori}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [alasanAttachments, setAlasanAttachments] = useState<AttachedDocument[]>(() => {
    try {
      const saved = localStorage.getItem(`rab_revisi_alasan_att_${ukSingkatan}_${kodeHistori}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: "doc-sample-1", name: "Surat_Permohonan_Revisi_E2.pdf", size: "245.8 KB" },
      { id: "doc-sample-2", name: "Matriks_Perubahan_IKU_2026.xlsx", size: "82.4 KB" },
    ];
  });

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

  // Muat worksheet dari Isian RAB
  useEffect(() => {
    let loadedRows: WorksheetRow[] = [];
    try {
      const saved = localStorage.getItem(`rab_worksheet_${ukSingkatan}`);
      if (saved) {
        loadedRows = JSON.parse(saved);
      }
    } catch (e) {}

    // Fallback default jika belum ada data Isian RAB
    if (loadedRows.length === 0) {
      loadedRows = [
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
    }
    setRawRows(loadedRows);

    // Default expand: inisialisasi semua node terbuka agar user langsung melihat rincian
    const initialExpanded: Record<string, boolean> = {};
    loadedRows.forEach((r) => {
      initialExpanded[r.id] = true;
      if (r.kode) initialExpanded[r.kode] = true;
    });
    setExpandedNodes(initialExpanded);
  }, [ukSingkatan]);

  // Hierarki order rating (Hanya s.d. level akun)
  const levelOrder: Record<string, number> = {
    program: 1,
    kegiatan: 2,
    kro: 3,
    ro: 4,
    komponen: 5,
    subkomponen: 6,
    subkomponen_sub: 6,
    akun: 7,
  };

  // Bangun struktur hierarki Program -> Kegiatan -> KRO -> RO -> Komponen -> Subkomponen -> Akun
  // Catatan: Detail belanja dan sub-level di bawah akun (seperti header1, header2, detail) diabaikan/tidak dimunculkan.
  interface HierarchicalItem {
    raw: WorksheetRow;
    level: "program" | "kegiatan" | "kro" | "ro" | "komponen" | "subkomponen" | "akun";
    depth: number;
    parentId: string | null;
    children: HierarchicalItem[];
  }

  const hierarchicalTree = useMemo(() => {
    // Saring baris: hanya ambil level program s.d. akun.
    // Abaikan detail belanja, header1, header2, dsb. yang berada di bawah level akun.
    // Matriks revisi hanya menampilkan s.d. level Akun.
    // "subkomponen_sub" (baris lokasi seperti ACEH, GORONTALO, dll) sengaja dihapus
    // karena detail anggaran di bawah level Akun tidak perlu ditampilkan di matriks revisi.
    const allowedTypes = new Set([
      "program",
      "kegiatan",
      "kro",
      "ro",
      "komponen",
      "subkomponen",
      "akun",
    ]);
    const validRows = rawRows.filter((r) => allowedTypes.has(r.type));

    const tree: HierarchicalItem[] = [];
    let currentProg: HierarchicalItem | null = null;
    let currentKeg: HierarchicalItem | null = null;
    let currentKro: HierarchicalItem | null = null;
    let currentRo: HierarchicalItem | null = null;
    let currentKomp: HierarchicalItem | null = null;
    let currentSubk: HierarchicalItem | null = null;

    for (const r of validRows) {
      const type = r.type;

      if (type === "program") {
        currentProg = { raw: r, level: "program", depth: 0, parentId: null, children: [] };
        tree.push(currentProg);
        currentKeg = null;
        currentKro = null;
        currentRo = null;
        currentKomp = null;
        currentSubk = null;
      } else if (type === "kegiatan") {
        currentKeg = {
          raw: r,
          level: "kegiatan",
          depth: 1,
          parentId: currentProg ? currentProg.raw.id : null,
          children: [],
        };
        if (currentProg) currentProg.children.push(currentKeg);
        else tree.push(currentKeg);
        currentKro = null;
        currentRo = null;
        currentKomp = null;
        currentSubk = null;
      } else if (type === "kro") {
        currentKro = {
          raw: r,
          level: "kro",
          depth: 2,
          parentId: currentKeg ? currentKeg.raw.id : currentProg ? currentProg.raw.id : null,
          children: [],
        };
        if (currentKeg) currentKeg.children.push(currentKro);
        else if (currentProg) currentProg.children.push(currentKro);
        else tree.push(currentKro);
        currentRo = null;
        currentKomp = null;
        currentSubk = null;
      } else if (type === "ro") {
        currentRo = {
          raw: r,
          level: "ro",
          depth: 3,
          parentId: currentKro ? currentKro.raw.id : currentKeg ? currentKeg.raw.id : null,
          children: [],
        };
        if (currentKro) currentKro.children.push(currentRo);
        else if (currentKeg) currentKeg.children.push(currentRo);
        else tree.push(currentRo);
        currentKomp = null;
        currentSubk = null;
      } else if (type === "komponen") {
        currentKomp = {
          raw: r,
          level: "komponen",
          depth: 4,
          parentId: currentRo ? currentRo.raw.id : currentKro ? currentKro.raw.id : null,
          children: [],
        };
        if (currentRo) currentRo.children.push(currentKomp);
        else if (currentKro) currentKro.children.push(currentKomp);
        else tree.push(currentKomp);
        currentSubk = null;
      } else if (type === "subkomponen" || type === "subkomponen_sub") {
        currentSubk = {
          raw: r,
          level: "subkomponen",
          depth: 5,
          parentId: currentKomp ? currentKomp.raw.id : currentRo ? currentRo.raw.id : null,
          children: [],
        };
        if (currentKomp) currentKomp.children.push(currentSubk);
        else if (currentRo) currentRo.children.push(currentSubk);
        else tree.push(currentSubk);
      } else if (type === "akun") {
        // Baris level akun adalah daun/level terbawah yang dimunculkan
        const akunItem: HierarchicalItem = {
          raw: r,
          level: "akun",
          depth: 6,
          parentId: currentSubk ? currentSubk.raw.id : currentKomp ? currentKomp.raw.id : null,
          children: [],
        };
        if (currentSubk) currentSubk.children.push(akunItem);
        else if (currentKomp) currentKomp.children.push(akunItem);
        else if (currentRo) currentRo.children.push(akunItem);
        else tree.push(akunItem);
      }
    }

    return tree;
  }, [rawRows]);

  // Ratakan pohon dengan filter status expand/collapse per baris
  const flattenedDisplayList = useMemo(() => {
    const result: { item: HierarchicalItem; isVisible: boolean }[] = [];

    function traverse(nodes: HierarchicalItem[], parentExpanded: boolean) {
      for (const node of nodes) {
        // Cek search query
        let matchesSearch = true;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const kode = (node.raw.kode || "").toLowerCase();
          const uraian = (node.raw.uraian || "").toLowerCase();
          matchesSearch = kode.includes(q) || uraian.includes(q);
        }

        const isNodeExpanded = expandedNodes[node.raw.id] !== false;

        if (parentExpanded && (matchesSearch || searchQuery.trim() === "")) {
          result.push({ item: node, isVisible: true });
        }

        if (node.children.length > 0) {
          // Anak hanya muncul jika parent ini terbuka dan parent-parent sebelumnya terbuka
          traverse(node.children, parentExpanded && isNodeExpanded);
        }
      }
    }

    traverse(hierarchicalTree, true);
    return result.map((r) => r.item);
  }, [hierarchicalTree, expandedNodes, searchQuery]);

  // Kalkulasi data baris (Semula, Menjadi, Selisih, Keterangan)
  const calculatedRows = useMemo(() => {
    return flattenedDisplayList.map((node) => {
      const row = node.raw;
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
        node,
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
  }, [flattenedDisplayList, customMenjadiMap, keteranganMap]);

  // Akun-akun yang belum diisi keterangannya (Kewajiban pengisian keterangan ada di level akun saja)
  const uncompletedAkunRows = useMemo(() => {
    return calculatedRows.filter((r) => r.type === "akun" && !r.keterangan.trim());
  }, [calculatedRows]);

  // Toggle expand/collapse per node
  const toggleNodeExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const current = prev[nodeId] !== false;
      return { ...prev, [nodeId]: !current };
    });
  };

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
      localStorage.setItem(`rab_revisi_tujuan_${ukSingkatan}_${kodeHistori}`, tujuanRevisi);
      localStorage.setItem(`rab_revisi_alasan_${ukSingkatan}_${kodeHistori}`, alasanPentingRevisi);
      localStorage.setItem(`rab_revisi_tujuan_att_${ukSingkatan}_${kodeHistori}`, JSON.stringify(tujuanAttachments));
      localStorage.setItem(`rab_revisi_alasan_att_${ukSingkatan}_${kodeHistori}`, JSON.stringify(alasanAttachments));
      setSaveStatus("Matriks Revisi Anggaran berhasil disimpan!");
      setTimeout(() => setSaveStatus(""), 4000);
    } catch (e) {
      alert("Gagal menyimpan data revisi.");
    }
  };

  // Ekspor Matriks ke File Excel (.xlsx) sesuai permintaan user
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Cantumkan Uraian Revisi Terpilih pada Bagian Awal Excel
    const selectedUraianObjects = availableUraianList.filter((u) => selectedUraianRevisiIds.includes(u.id));
    const uraianSummary = selectedUraianObjects.map((u) => `• [${u.no || '-'}] ${u.uraian}`).join('\n');

    const excelRows: any[][] = [
      [`MATRIKS REVISI ANGGARAN (${activeTab === "dipa" ? "REVISI DIPA" : "REVISI POK"})`],
      [`Unit Kerja: ${userUnit} (${ukSingkatan})`, `Histori: ${labelHistori} (${kodeHistori})`],
      [`Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")}`],
      [`Dasar Uraian Revisi (${selectedUraianObjects.length} dipilih):`, uraianSummary || "-"],
      [`Tujuan Usulan Revisi:`, tujuanRevisi || "-"],
      [`Penjabaran Alasan Pentingnya Usulan Revisi:`, alasanPentingRevisi || "-"],
      [],
      [
        "KODE",
        "URAIAN",
        `SEMULA REVISI KE- ${revisiSemulaKe}`,
        "",
        "",
        `MENJADI REVISI KE- ${revisiMenjadiKe}`,
        "",
        "",
        "SELISIH",
        "",
        "",
        "KETERANGAN",
      ],
      [
        "",
        "",
        "Vol",
        "Jumlah (Rp)",
        "@",
        "Vol",
        "Jumlah (Rp)",
        "@",
        "Vol",
        "Jumlah (Rp)",
        "@",
        "(Wajib pada level Akun)",
      ],
    ];

    calculatedRows.forEach((r) => {
      const indent = "  ".repeat(r.node.depth);
      const prefixLevel =
        r.type === "program"
          ? "[PROGRAM] "
          : r.type === "kegiatan"
          ? "[KEGIATAN] "
          : r.type === "kro"
          ? "[KRO] "
          : r.type === "ro"
          ? "[RO] "
          : r.type === "komponen"
          ? "[KOMP] "
          : r.type === "subkomponen" || r.type === "subkomponen_sub"
          ? "[SUBKOMP] "
          : "[AKUN] ";

      excelRows.push([
        r.kode || "",
        `${indent}${prefixLevel}${r.uraian || ""}`,
        r.volSemula || "",
        r.jumlahSemula || 0,
        r.blokirSemula || 0,
        r.volMenjadi || "",
        r.jumlahMenjadi || 0,
        r.blokirMenjadi || 0,
        r.selisihVol || 0,
        r.selisihJumlah || 0,
        r.selisihBlokir || 0,
        r.keterangan || (r.type === "akun" ? "" : "-"),
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(excelRows);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
      { s: { r: 3, c: 1 }, e: { r: 3, c: 11 } },
      { s: { r: 5, c: 0 }, e: { r: 6, c: 0 } },
      { s: { r: 5, c: 1 }, e: { r: 6, c: 1 } },
      { s: { r: 5, c: 2 }, e: { r: 5, c: 4 } },
      { s: { r: 5, c: 5 }, e: { r: 5, c: 7 } },
      { s: { r: 5, c: 8 }, e: { r: 5, c: 10 } },
      { s: { r: 5, c: 11 }, e: { r: 6, c: 11 } },
    ];

    ws["!cols"] = [
      { wch: 18 },
      { wch: 55 },
      { wch: 10 },
      { wch: 18 },
      { wch: 8 },
      { wch: 10 },
      { wch: 18 },
      { wch: 8 },
      { wch: 10 },
      { wch: 18 },
      { wch: 8 },
      { wch: 45 },
    ];

    const sheetName = activeTab === "dipa" ? "Matriks_Revisi_DIPA" : "Matriks_Revisi_POK";
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const fileName = `Matriks_Revisi_${activeTab.toUpperCase()}_${ukSingkatan}_TA2027.xlsx`;
    XLSX.writeFile(wb, fileName);
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
          <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-2 flex-wrap">
            <span>Unit Kerja: <strong className="text-slate-800 dark:text-slate-200">{userUnit}</strong></span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-semibold font-mono text-[11px]">
              Histori Aktif: {labelHistori} ({kodeHistori})
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ekspor Excel (.xlsx)</span>
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

      {/* ── Kartu Pilihan Jenis Revisi (DIPA vs POK) Berdasarkan Kode Histori ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TAB REVISI DIPA (Terbuka untuk semua histori selain C01 - C99) */}
        <div
          onClick={() => {
            if (isDipaTabAllowed) {
              setActiveTab("dipa");
            }
          }}
          className={`p-5 rounded-2xl border transition-all ${
            activeTab === "dipa"
              ? "bg-white dark:bg-slate-900 border-[var(--primary)] shadow-md ring-2 ring-indigo-500/20"
              : !isDipaTabAllowed
              ? "bg-slate-100/70 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-55 cursor-not-allowed"
              : "bg-slate-50 dark:bg-slate-800/40 border-[var(--border)] opacity-80 hover:opacity-100 cursor-pointer"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--primary)] font-mono">Kode Selain C01 - C99</span>
              {isDipaTabAllowed && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 text-blue-600" /> Histori Aktif ({kodeHistori})
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {!isDipaTabAllowed && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Terkunci (POK Aktif)
                </span>
              )}
              <span className="text-[0.68rem] px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-bold">
                Kewenangan DJA/DJPb
              </span>
            </div>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span>Revisi DIPA (Antar Program/KRO/Kegiatan)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Pergeseran anggaran yang memerlukan persetujuan Direktorat Jenderal Anggaran (DJA). Terbuka untuk seluruh kode histori selain C01 - C99.
          </p>
        </div>

        {/* TAB REVISI POK (Hanya terbuka khusus kode C01 - C99) */}
        <div
          onClick={() => {
            if (isPokTabAllowed) {
              setActiveTab("pok");
            }
          }}
          className={`p-5 rounded-2xl border transition-all ${
            activeTab === "pok"
              ? "bg-white dark:bg-slate-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
              : !isPokTabAllowed
              ? "bg-slate-100/70 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-55 cursor-not-allowed"
              : "bg-slate-50 dark:bg-slate-800/40 border-[var(--border)] opacity-80 hover:opacity-100 cursor-pointer"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 font-mono">Kode C01 - C99</span>
              {isPokTabAllowed && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" /> Histori Aktif ({kodeHistori})
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {!isPokTabAllowed && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Terkunci (DIPA Aktif)
                </span>
              )}
              <span className="text-[0.68rem] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold">
                Kewenangan KPA Satker
              </span>
            </div>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span>Revisi POK (Petunjuk Operasional Kegiatan)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Pergeseran dalam satu akun, antar detail rincian, atau subkomponen internal satker. Terbuka otomatis khusus saat histori aktif berawalan kode <strong>C01 s.d. C99</strong>.
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

      {/* ── Banner Peringatan Jika Histori Aktif Tidak Memiliki Histori Sebelumnya (Kertas Kerja Nonaktif) ── */}
      {!historyInfo.hasPrevious ? (
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-100">
                Kertas Kerja Matriks Revisi Tidak Aktif (Hanya Baca / Read-Only)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Histori aktif saat ini (<span className="font-mono font-bold">{kodeHistori}</span>) merupakan tahapan awal dan belum memiliki riwayat histori sebelumnya. Pengisian catatan keterangan usulan revisi dan perubahan revisi dinonaktifkan.
              </div>
            </div>
          </div>
        </div>
      ) : uncompletedAkunRows.length > 0 ? (
        /* ── Peringatan Wajib Keterangan Level Akun (Hanya jika kertas kerja aktif) ── */
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Terdapat <strong>{uncompletedAkunRows.length} akun</strong> belanja yang kolom <strong>Keterangan</strong>-nya belum diisi. Kewajiban pengisian keterangan berada di level Akun untuk menjelaskan alasan usulan revisi.
            </span>
          </div>
        </div>
      ) : null}

      {/* ── CARD PEMILIHAN URAIAN REVISI (SESUAI FILE KEWENANGAN REVISI.XLSX) ── */}
      {/* Jika histori baru sudah terbentuk, sebelum mengisi keterangan revisi, user terlebih dahulu memilih uraian revisi yang diajukan */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>1. Pemilihan Uraian Revisi Anggaran ({activeTab === "dipa" ? "Kewenangan Kemenkeu/DJA/DJPb" : "Kewenangan KPA Satker"})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sesuai matriks <strong>Kewenangan Revisi</strong>: Pilih klaster jenis revisi dan checklist satu atau beberapa uraian revisi yang melandasi usulan revisi ini.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 w-fit">
              {selectedUraianRevisiIds.length} Uraian Dipilih
            </span>
            {selectedUraianRevisiIds.length > 0 && historyInfo.hasPrevious && (
              <button
                onClick={handleClearAllSelectedUraian}
                className="text-[11px] text-red-600 hover:text-red-700 dark:text-red-400 hover:underline cursor-pointer"
              >
                Hapus Semua
              </button>
            )}
          </div>
        </div>

        {/* ── Tampilan 2 Kolom: Kiri (Klaster Vertikal Scrollable) & Kanan (Pencarian & Checklist Uraian) ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* 1. Kolom Kiri: Klaster Jenis Revisi Vertikal & Scrollable */}
          <div className="md:col-span-4 lg:col-span-3.5 flex flex-col space-y-2 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Klaster Revisi</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {availableClusters.length} Klaster
              </span>
            </div>

            {/* List Vertikal Scrollable */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {/* Opsi Semua Klaster */}
              <button
                type="button"
                onClick={() => setSelectedJenisRevisiCluster("Semua Klaster")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-2 border ${
                  selectedJenisRevisiCluster === "Semua Klaster"
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full ${selectedJenisRevisiCluster === "Semua Klaster" ? "bg-white" : "bg-blue-500"}`} />
                  <span className="truncate">Semua Klaster</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                    selectedJenisRevisiCluster === "Semua Klaster"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {availableUraianList.length}
                </span>
              </button>

              {/* Opsi Tiap Klaster Jenis Revisi */}
              {availableClusters.map((clusterName) => {
                const countInCluster = availableUraianList.filter((item) => item.jenisRevisi === clusterName).length;
                const isSelected = selectedJenisRevisiCluster === clusterName;

                // Hitung berapa item yang terpilih dalam klaster ini
                const selectedInClusterCount = availableUraianList
                  .filter((item) => item.jenisRevisi === clusterName && selectedUraianRevisiIds.includes(item.id))
                  .length;

                return (
                  <button
                    key={clusterName}
                    type="button"
                    onClick={() => setSelectedJenisRevisiCluster(clusterName)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-2 border ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-slate-300 dark:bg-slate-600"}`} />
                      <span className="truncate" title={clusterName}>{clusterName}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {selectedInClusterCount > 0 && (
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                            isSelected
                              ? "bg-emerald-400 text-emerald-950"
                              : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          }`}
                          title={`${selectedInClusterCount} butir terpilih`}
                        >
                          ✓ {selectedInClusterCount}
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {countInCluster}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Kolom Kanan: Pencarian & Daftar Checklist Uraian */}
          <div className="md:col-span-8 lg:col-span-8.5 flex flex-col space-y-2.5">
            {/* Header info klaster aktif & pencarian */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  disabled={!historyInfo.hasPrevious}
                  value={searchUraianKewenangan}
                  onChange={(e) => setSearchUraianKewenangan(e.target.value)}
                  placeholder={`Cari uraian revisi pada ${selectedJenisRevisiCluster}...期`.replace("期", "")}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {searchUraianKewenangan && (
                <button
                  type="button"
                  onClick={() => setSearchUraianKewenangan("")}
                  className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Daftar Opsi Uraian Revisi Berdasarkan Kewenangan dan Klaster */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-slate-50/30 dark:bg-slate-850/20 scrollbar-thin">
              {filteredAvailableUraianList.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Tidak ada uraian revisi yang sesuai pada klaster atau kata kunci pencarian.
                </div>
              ) : (
                filteredAvailableUraianList.map((item) => {
                  const isChecked = selectedUraianRevisiIds.includes(item.id);
                  const isDisabled = !historyInfo.hasPrevious;

                  return (
                    <label
                      key={item.id}
                      onClick={() => !isDisabled && handleToggleUraianRevisi(item.id)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all text-xs select-none ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30"
                          : isChecked
                          ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-400 dark:border-blue-700 shadow-2xs cursor-pointer"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.no && (
                            <span className="font-mono font-bold px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] border border-slate-200 dark:border-slate-700">
                              {item.no}
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.2 bg-blue-100/80 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded font-semibold border border-blue-200 dark:border-blue-800">
                            {item.jenisRevisi}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-semibold">
                            {item.kewenangan}
                          </span>
                        </div>
                        <div className="font-medium text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                          {item.uraian}
                        </div>
                        {item.keterangan && (
                          <div className="text-[11px] text-slate-500 italic bg-white/70 dark:bg-slate-900/60 p-1.5 rounded border border-slate-100 dark:border-slate-800 whitespace-pre-line">
                            <strong>Keterangan/Catatan:</strong> {item.keterangan}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── BOX KHUSUS URAIAN TERPILIH DI BAWAHNYA ── */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Daftar Uraian Revisi Terpilih ({selectedUraianObjects.length} Butir)</span>
            </h4>
            {selectedUraianObjects.length > 0 && (
              <span className="text-[10px] text-slate-400">
                Klik ikon silang (✕) untuk membatalkan checklist
              </span>
            )}
          </div>

          {selectedUraianObjects.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/30 text-center text-xs text-slate-400">
              Belum ada uraian revisi yang dipilih. Silakan checklist uraian revisi pada klaster di atas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {selectedUraianObjects.map((item) => (
                <div
                  key={`selected-${item.id}`}
                  className="flex items-start justify-between gap-2.5 p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 text-xs shadow-2xs group hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.no && (
                        <span className="font-mono font-bold px-1.5 py-0.2 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 rounded text-[10px] border border-blue-200 dark:border-blue-800">
                          {item.no}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.2 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 rounded font-semibold">
                        {item.jenisRevisi}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded font-semibold">
                        {item.kewenangan}
                      </span>
                    </div>
                    <div className="font-medium text-slate-800 dark:text-slate-100 leading-snug line-clamp-3" title={item.uraian}>
                      {item.uraian}
                    </div>
                  </div>
                  {historyInfo.hasPrevious && (
                    <button
                      onClick={() => handleRemoveSelectedUraian(item.id)}
                      title="Batalkan checklist uraian ini"
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Peringatan jika belum memilih uraian revisi */}
        {historyInfo.hasPrevious && selectedUraianRevisiIds.length === 0 && (
          <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-2.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Silakan pilih minimal 1 (satu) <strong>Uraian Revisi</strong> di atas sebelum mengisi rincian penjelasan pada kolom keterangan akun.
            </span>
          </div>
        )}
      </div>

      {/* ── Bagian Pengisian Tujuan & Penjabaran Alasan Pentingnya Usulan Revisi (Diatas Matriks) ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Urgensi Usulan Revisi Anggaran
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Isikan tujuan revisi serta penjabaran komprehensif mengenai urgensi dan pentingnya usulan perubahan anggaran yang diajukan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* 1. Tujuan Usulan Revisi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>1. Tujuan Usulan Revisi</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {tujuanRevisi.replace(/<[^>]*>/g, "").length} karakter
              </span>
            </div>
            <RichTextEditor
              value={tujuanRevisi}
              onChange={(val) => {
                setTujuanRevisi(val);
                try {
                  localStorage.setItem(`rab_revisi_tujuan_${ukSingkatan}_${kodeHistori}`, val);
                } catch (err) {}
              }}
              placeholder="Jelaskan maksud dan tujuan diajukannya usulan revisi anggaran ini secara ringkas dan terukur..."
              minHeight="110px"
              allowAttachments={true}
              attachments={tujuanAttachments}
              onAttachmentsChange={(newAtts) => {
                setTujuanAttachments(newAtts);
                try {
                  localStorage.setItem(`rab_revisi_tujuan_att_${ukSingkatan}_${kodeHistori}`, JSON.stringify(newAtts));
                } catch (err) {}
              }}
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
              Contoh: Penataan anggaran belanja pemeliharaan gedung dan peralatan kantor untuk memenuhi kebutuhan operasional triwulan IV.
            </p>
          </div>

          {/* 2. Penjabaran Alasan Pentingnya Usulan Revisi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>2. Penjabaran Alasan Pentingnya Usulan Revisi</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {alasanPentingRevisi.replace(/<[^>]*>/g, "").length} karakter
              </span>
            </div>
            <RichTextEditor
              value={alasanPentingRevisi}
              onChange={(val) => {
                setAlasanPentingRevisi(val);
                try {
                  localStorage.setItem(`rab_revisi_alasan_${ukSingkatan}_${kodeHistori}`, val);
                } catch (err) {}
              }}
              placeholder="Uraikan urgensi, pertimbangan mendalam, dampak jika usulan revisi tidak dilaksanakan, serta keterkaitan dengan capaian IKU..."
              minHeight="110px"
              allowAttachments={true}
              attachments={alasanAttachments}
              onAttachmentsChange={(newAtts) => {
                setAlasanAttachments(newAtts);
                try {
                  localStorage.setItem(`rab_revisi_alasan_att_${ukSingkatan}_${kodeHistori}`, JSON.stringify(newAtts));
                } catch (err) {}
              }}
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
              Contoh: Kenaikan volume kegiatan audit mengharuskan pergeseran pos anggaran perjalanan dinas agar target pemeriksaan semester II terpenuhi.
            </p>
          </div>
        </div>
      </div>

      {/* ── TABEL MATRIKS REVISI (MENGGANTIKAN DAFTAR PENGAJUAN REVISI AKTIF) ── */}
      <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden space-y-0">
        {/* Tab Header "Matriks" Persis Seperti Screenshot */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 px-5 pt-3 pb-0 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white dark:bg-slate-900 border-t-2 border-l border-r border-t-blue-600 border-slate-200 dark:border-slate-700 rounded-t-lg font-bold text-xs text-slate-800 dark:text-slate-100 shadow-2xs flex items-center gap-1.5 -mb-px z-10 cursor-default">
              <TableIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Matriks {activeTab === "dipa" ? "Revisi DIPA" : "Revisi POK"}</span>
            </button>
          </div>

          {/* Kontrol Nomor Revisi & Pencarian */}
          <div className="flex items-center gap-3 pb-2.5 flex-wrap">
            {/* Input Revisi Semula Ke & Menjadi Ke: Terisi otomatis dari sistem dan tidak dapat diedit user */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Revisi:</span>
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs shadow-xs select-none"
                title={`Terisi otomatis dari histori: Semula Ke- ${revisiSemulaKe} (Terkunci / Tidak dapat diedit)`}
              >
                <span className="text-slate-400">Semula Ke-</span>
                <span className="w-8 font-mono font-bold text-center text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-600 py-0.5 inline-block">
                  {revisiSemulaKe}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs shadow-xs select-none"
                title={`Terisi otomatis dari histori: Menjadi Ke- ${revisiMenjadiKe} (Terkunci / Tidak dapat diedit)`}
              >
                <span className="text-slate-400">Menjadi Ke-</span>
                <span className="w-8 font-mono font-bold text-center text-blue-600 dark:text-blue-400 border-b border-blue-400/50 py-0.5 inline-block">
                  {revisiMenjadiKe}
                </span>
              </div>
            </div>

            {/* Info level tampilan matriks */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <Layers className="w-3 h-3 text-slate-400" />
              <span className="font-medium">Drill Down s.d.:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">s.d. Akun Belanja</span>
            </div>

            {/* Kotak Cari Cepat */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kode / uraian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
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
                  className="py-3 px-3 border-r border-blue-400/40 w-[120px] text-center font-bold tracking-wider"
                >
                  KODE
                </th>
                <th
                  rowSpan={2}
                  className="py-3 px-4 border-r border-blue-400/40 text-left font-bold min-w-[320px] tracking-wider"
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
                  className="py-3 px-3 text-left font-bold min-w-[280px] tracking-wider bg-[#1b65b6]"
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

                  const hasChildren = row.node.children.length > 0;
                  const isExpanded = expandedNodes[row.id] !== false;

                  // Styling baris persis seperti kertas kerja Isian RAB & Forum Penelaahan
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

                  // Indentasi visual sesuai kedalaman node
                  const indentPadding = `${row.node.depth * 14}px`;

                  return (
                    <tr key={row.id || idx} className={`transition-colors ${rowBg}`}>
                      {/* 1. KODE */}
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700/80 ${kodeClass}`}>
                        {row.kode}
                      </td>

                      {/* 2. URAIAN (DENGAN DRILL DOWN EXPAND/COLLAPSE CHEVRON SEPERTI FORUM PENELAAHAN) */}
                      <td className={`p-2 border-r border-slate-200 dark:border-slate-700/80 ${uraianClass}`}>
                        <div
                          className="flex items-center gap-1.5"
                          style={{ paddingLeft: indentPadding }}
                        >
                          {/* Toggle Expand / Collapse Icon jika node memiliki turunan */}
                          {hasChildren ? (
                            <button
                              type="button"
                              onClick={() => toggleNodeExpand(row.id)}
                              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded cursor-pointer transition-colors"
                              title={isExpanded ? "Tutup rincian" : "Buka rincian"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                              )}
                            </button>
                          ) : (
                            <span className="w-5 inline-block" />
                          )}

                          {isProgram && <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">PROGRAM</span>}
                          {isKegiatan && <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">KEGIATAN</span>}
                          {isKro && <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">KRO</span>}
                          {isRo && <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-bold">RO</span>}
                          {isKomponen && <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold">KOMP</span>}
                          {isSubkomponen && <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 font-bold">SUBKOMP</span>}
                          {isAkun && <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">AKUN</span>}
                          <span className={hasChildren ? "cursor-pointer" : ""} onClick={() => hasChildren && toggleNodeExpand(row.id)}>
                            {row.uraian}
                          </span>
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

                      {/* 12. KETERANGAN (WAJIB DIISI USER DI LEVEL AKUN SAJA JIKA KERTAS KERJA AKTIF) */}
                      <td className="p-1.5 bg-white dark:bg-slate-900/90">
                        {isAkun ? (
                          <div className="space-y-1">
                            <textarea
                              rows={2}
                              value={row.keterangan}
                              onChange={(e) =>
                                historyInfo.hasPrevious && handleKeteranganChange(row.id, row.kode, e.target.value)
                              }
                              disabled={!historyInfo.hasPrevious}
                              readOnly={!historyInfo.hasPrevious}
                              placeholder={
                                historyInfo.hasPrevious
                                  ? "Ketik keterangan usulan revisi akun belanja ini (Wajib)..."
                                  : "Kertas kerja tidak aktif (tidak memiliki histori revisi sebelumnya)"
                              }
                              className={`w-full text-xs p-1.5 rounded-lg border transition-all resize-y ${
                                !historyInfo.hasPrevious
                                  ? "border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/40 text-slate-500 cursor-not-allowed placeholder:italic"
                                  : !row.keterangan.trim()
                                  ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 text-slate-800 dark:text-slate-100 placeholder:text-amber-600/70 focus:ring-2 focus:ring-amber-500"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                              }`}
                            />
                            {historyInfo.hasPrevious && !row.keterangan.trim() && (
                              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Wajib diisi</span>
                              </div>
                            )}
                            {!historyInfo.hasPrevious && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                <span>Tidak aktif</span>
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
              Menampilkan <strong>{calculatedRows.length}</strong> baris s.d. level Akun ({calculatedRows.filter((r) => r.type === "akun").length} Akun Belanja) — Detail belanja di bawah Akun tidak ditampilkan.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ekspor Matriks Excel</span>
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

      {/* ── Modal Pratinjau Cetak Matriks Usulan Revisi (Format Lembar Cetak Standar DIPA / POK) ── */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl max-w-5xl w-full p-6 space-y-4 shadow-2xl my-8 print:border-none print:shadow-none print:p-0 print:m-0">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] print:hidden">
              <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                <Printer className="h-4 w-4 text-blue-600" />
                <span>Pratinjau Cetak: Matriks Usulan Revisi Anggaran ({activeTab === "dipa" ? "DIPA" : "POK"})</span>
              </h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Lembar Dokumen Matriks Siap Cetak */}
            <div className="bg-white text-black p-6 sm:p-8 rounded-xl border border-slate-300 font-sans text-xs leading-relaxed space-y-4 shadow-inner print:border-none print:shadow-none print:p-0">
              {/* Kop Header Laporan */}
              <div className="text-center space-y-1 border-b-2 border-black pb-3">
                <div className="font-bold tracking-wider text-sm uppercase">
                  PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN
                </div>
                <div className="text-xs uppercase font-bold text-slate-800">
                  MATRIKS USULAN REVISI ANGGARAN ({activeTab === "dipa" ? "REVISI DIPA" : "REVISI POK"})
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  TAHUN ANGGARAN 2027
                </div>
              </div>

              {/* Metadata Dokumen */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-slate-200">
                <div>
                  <div><span className="font-bold">Unit Kerja:</span> {userUnit} ({ukSingkatan})</div>
                  <div><span className="font-bold">Histori / Status:</span> {labelHistori} ({kodeHistori})</div>
                </div>
                <div className="text-right">
                  <div><span className="font-bold">Nomor Revisi:</span> Semula Ke- {revisiSemulaKe} &rarr; Menjadi Ke- {revisiMenjadiKe}</div>
                  <div><span className="font-bold">Tanggal Cetak:</span> {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
                </div>
              </div>

              {/* 1. TUJUAN USULAN REVISI */}
              <div className="border border-slate-300 rounded p-3 bg-slate-50/50 space-y-1">
                <div className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                  1. Tujuan Usulan Revisi
                </div>
                <div className="text-slate-800 text-[11px] leading-relaxed">
                  {tujuanRevisi || "Optimalisasi belanja operasional dan pendukung kegiatan prioritas tahun anggaran berjalan."}
                </div>
              </div>

              {/* 2. PENJABARAN ALASAN PENTINGNYA USULAN REVISI */}
              <div className="border border-slate-300 rounded p-3 bg-slate-50/50 space-y-1">
                <div className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                  2. Penjabaran Alasan Pentingnya Usulan Revisi
                </div>
                <div className="text-slate-800 text-[11px] leading-relaxed">
                  {alasanPentingRevisi || "Pergeseran kebutuhan riil pelaksanaan kegiatan di lapangan yang belum teralokasikan secara optimal pada DIPA/POK semula."}
                </div>
              </div>

              {/* 3. URAIAN REVISI ANGGARAN (KEWENANGAN KPA SATKER) */}
              <div className="border border-slate-300 rounded p-3 bg-slate-50/50 space-y-1.5">
                <div className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                  3. Uraian Revisi Anggaran (Kewenangan KPA Satker)
                </div>
                <div className="text-slate-800 text-[11px]">
                  {selectedUraianRevisiIds.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {availableUraianList
                        .filter((u) => selectedUraianRevisiIds.includes(u.id))
                        .map((u) => (
                          <li key={u.id}>
                            <strong>[{u.no || "-"}]</strong> {u.uraian}{" "}
                            <span className="text-slate-500 font-semibold">({u.kewenangan})</span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">Belum ada butir kewenangan revisi yang dipilih.</p>
                  )}
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
                        <th className="p-1 border-r border-black" colSpan={3}>SEMULA (REV. {revisiSemulaKe})</th>
                        <th className="p-1 border-r border-black" colSpan={3}>MENJADI (REV. {revisiMenjadiKe})</th>
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
                      {calculatedRows.map((r, i) => {
                        const isAkun = r.type === "akun";
                        const indent = r.node.depth * 8;
                        return (
                          <tr key={r.id || i} className={r.type === "program" ? "bg-slate-100 font-bold" : r.type === "kegiatan" ? "font-semibold" : ""}>
                            <td className="p-1 border-r border-black font-mono text-center align-top">{r.kode}</td>
                            <td className="p-1 border-r border-black align-top">
                              <span style={{ paddingLeft: `${indent}px` }}>{r.uraian}</span>
                            </td>
                            <td className="p-1 border-r border-black text-center align-top font-mono">{r.volSemula > 0 ? r.volSemula : ""}</td>
                            <td className="p-1 border-r border-black text-right align-top font-mono">{r.jumlahSemula > 0 ? r.jumlahSemula.toLocaleString("id-ID") : "0"}</td>
                            <td className="p-1 border-r border-black text-center align-top font-mono text-slate-500">{r.blokirSemula > 0 ? r.blokirSemula.toLocaleString("id-ID") : "0"}</td>
                            <td className="p-1 border-r border-black text-center align-top font-mono font-bold text-blue-800">{r.volMenjadi > 0 ? r.volMenjadi : ""}</td>
                            <td className="p-1 border-r border-black text-right align-top font-mono font-bold text-blue-800">{r.jumlahMenjadi > 0 ? r.jumlahMenjadi.toLocaleString("id-ID") : "0"}</td>
                            <td className="p-1 border-r border-black text-center align-top font-mono text-slate-500">{r.blokirMenjadi > 0 ? r.blokirMenjadi.toLocaleString("id-ID") : "0"}</td>
                            <td className="p-1 border-r border-black text-center align-top font-mono">{r.selisihVol !== 0 ? (r.selisihVol > 0 ? `+${r.selisihVol}` : r.selisihVol) : "0"}</td>
                            <td className="p-1 border-r border-black text-right align-top font-mono font-bold">{r.selisihJumlah !== 0 ? (r.selisihJumlah > 0 ? `+${r.selisihJumlah.toLocaleString("id-ID")}` : r.selisihJumlah.toLocaleString("id-ID")) : "0"}</td>
                            <td className="p-1 border-r border-black text-center align-top font-mono text-slate-500">0</td>
                            <td className="p-1 align-top text-[9px]">{isAkun ? (r.keterangan || "-") : "-"}</td>
                          </tr>
                        );
                      })}
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
