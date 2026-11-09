import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MessageSquare,
  FileText,
  GitCompare,
  CheckCircle2,
  Printer,
  UserPlus,
  Send,
  CornerDownRight,
  ChevronDown,
  ChevronRight,
  Building,
  Users,
  Search,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  Download,
  Upload,
  X,
  FileCheck2,
  AlertTriangle,
  Lock,
  CheckCheck,
  FolderKanban,
  Coins,
  Paperclip,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  RemoveFormatting,
  Layers,
  Save,
  Check,
  Plus,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";
import unitKerjaData from "../../data/unitKerjaData.json";
import informasiKinerjaData from "../../data/informasiKinerjaData.json";
import RichTextEditor from "../../components/ui/RichTextEditor";
import { WorksheetRow } from "./IsianRabPage";

interface AttachedDocument {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  time: string;
  url?: string;
}

interface CommentThread {
  id: number;
  author: string;
  authorRole: "Tim Penganggaran" | "Tim Perencanaan" | "Inspektorat" | "Unit Kerja";
  authorId: string;
  roleBadge: string;
  time: string;
  content: string;
  attachments?: AttachedDocument[];
  replyTo?: {
    id: number;
    author: string;
    contentSummary?: string;
  };
}

interface PesertaItem {
  id: string;
  nama: string;
  role: string;
}

interface PenandatanganItem {
  id: string;
  nama: string;
  nip: string;
  instansi: string;
  jabatan: string;
}

interface CatatanSectionData {
  pending: string;
  pendapat: string;
  blokir: string;
}

interface CatatanPenelaahanState {
  penganggaran: CatatanSectionData;
  perencanaan: CatatanSectionData;
  inspektorat: CatatanSectionData;
  penandatangan: PenandatanganItem[];
}

export default function ForumPenelaahanPage() {
  // Tahun anggaran disesuaikan dengan info tahun yang ada di Topbar (TA 2027) sesuai Panduan4
  const tahunAnggaran = "TA 2027";

  // Role aktif
  const [currentUserRole] = useState<string>(() => {
    try {
      return localStorage.getItem("renja_e2_user_role") || "Operator";
    } catch (e) {
      return "Operator";
    }
  });

  // Membaca histori aktif RAB dari localStorage untuk menentukan kodifikasi & tahap otomatis
  const activeRabHistori = useMemo(() => {
    try {
      const saved = localStorage.getItem("rab_active_histori");
      if (saved) return JSON.parse(saved);
      const kakSaved = localStorage.getItem("kak_active_histori");
      if (kakSaved) return JSON.parse(kakSaved);
    } catch (e) {}
    return {
      kdsatker: "Biro Hukum dan Kerja Sama",
      kode_sts_history: "B00",
      status_histori: "DIPA Awal",
      label: "DIPA Awal - B00",
    };
  }, []);

  const kodeHistoriAktif = (activeRabHistori?.kode_sts_history || "B00").toUpperCase();

  // Helper fungsi memetakan kodifikasi histori ke Nama Tahap resmi sesuai permintaan user:
  // • G00, G01 – Angka Dasar
  // • D00 – Pagu Indikatif / RKA-K/L Awal
  // • D01 s.d. D99 – Pagu Anggaran (Alokasi setelah pembagian pagu)
  // • E00 s.d. E99 – Alokasi Anggaran
  // • B00 – DIPA Awal
  // • A01 s.d. A99 – Usulan Revisi DIPA ke-... (melibatkan persetujuan Kanwil DJPb / KPPN / DJA)
  // • B01 s.d. B99 – DIPA Revisi ke-... (setelah revisi DIPA disahkan)
  // • C01 s.d. C99 – Usulan Revisi Satker / POK
  const mapKodifikasiToTahap = (kode: string, defaultStatus?: string): string => {
    const k = (kode || "").toUpperCase();
    if (/^Gd{2}$/i.test(k)) {
      return "Angka Dasar";
    }
    if (k === "D00" || /^D0[a-z]$/i.test(k)) {
      return "Pagu Indikatif / RKA-K/L Awal";
    }
    if (/^Dd{2}$/i.test(k)) {
      return "Pagu Anggaran";
    }
    if (/^Ed{2}$/i.test(k)) {
      return "Alokasi Anggaran";
    }
    if (k === "B00") {
      return "DIPA Awal";
    }
    if (/^Bd{2}$/i.test(k)) {
      const num = parseInt(k.replace(/\D/g, ""), 10);
      return `DIPA Revisi ke-${num}`;
    }
    if (/^Ad{2}$/i.test(k)) {
      const num = parseInt(k.replace(/\D/g, ""), 10);
      return `Usulan Revisi DIPA ke-${num}`;
    }
    if (/^Cd{2}$/i.test(k)) {
      const num = parseInt(k.replace(/\D/g, ""), 10);
      return `Usulan Revisi Satker / POK (Rev ke-${num})`;
    }
    return defaultStatus || "Alokasi Anggaran";
  };

  const determinedTahap = useMemo(() => {
    return mapKodifikasiToTahap(kodeHistoriAktif, activeRabHistori?.status_histori);
  }, [kodeHistoriAktif, activeRabHistori]);

  // Tahap terisi otomatis sesuai kodifikasi histori terakhir yang aktif di isian RAB
  const [tahap, setTahap] = useState<string>(determinedTahap);

  // Sinkronisasi tahap saat activeRabHistori berubah
  useEffect(() => {
    setTahap(determinedTahap);
  }, [determinedTahap]);

  // Unit kerja user sesuai Panduan4:
  // "sistem akan menunjukkan Unit Kerja user sesuai data pada submenu Unit Kerja PPATK tanpa nomor/kode unit kerja,
  // untuk role Super Admin, unit kerjanya PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN"
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
    return found ? found.singkatan : "KREASI";
  }, [userUnit]);

  // Tombol yang tersedia di atas Diskusi: Dokumen, Sanding Data, Catatan Penelaahan (Panduan4)
  const [activeTab, setActiveTab] = useState<"forum" | "dokumen" | "sanding_data" | "catatan">("forum");

  // Modal State Tambah User
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserCategory, setNewUserCategory] = useState<"Tim Perencanaan" | "Tim Penganggaran" | "Inspektorat" | "Unit Kerja">("Tim Perencanaan");
  const [newUserName, setNewUserName] = useState<string>("");
  const [newUserRoleDescription, setNewUserRoleDescription] = useState<string>("");

  // Modal Cetak Forum & Modal Cetak Catatan Penelaahan
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showPrintCatatanModal, setShowPrintCatatanModal] = useState<boolean>(false);

  // Peserta Penelaahan Sesuai Panduan4:
  // - Tim Penganggaran (menggantikan DJA)
  // - Tim Perencanaan (menggantikan Bappenas)
  // - Inspektorat (menggantikan K/L)
  // - Unit Kerja (menggantikan Satuan Kerja)
  // Hanya role SuperAdmin dan BINCANG yang dapat menentukan / tambah user
  const canManageParticipants = currentUserRole === "Super Admin" || currentUserRole === "BINCANG";

  const [pesertaList, setPesertaList] = useState<{
    penganggaran: PesertaItem[];
    perencanaan: PesertaItem[];
    inspektorat: PesertaItem[];
    unitKerja: PesertaItem[];
  }>({
    penganggaran: [
      { id: "usr-p1", nama: "SUKRASNO", role: "Ketua Tim Penelaah Penganggaran" },
      { id: "usr-p2", nama: "FAUZI SYAMSURI", role: "Penelaah Teknis Anggaran" },
    ],
    perencanaan: [
      { id: "usr-r1", nama: "NOOR ANDRINI WURYANDARI", role: "Koordinator Perencanaan Makro" },
      { id: "usr-r2", nama: "TIM PERENCANAAN BIRO REN", role: "Analis Kebijakan Perencanaan" },
    ],
    inspektorat: [
      { id: "usr-i1", nama: "INSPEKTUR PPATK", role: "Pengawas Internal (APIP)" },
      { id: "usr-i2", nama: "AUDITOR MADYA PENELAAH", role: "Auditor Kepatuhan Tata Kelola" },
    ],
    unitKerja: [
      { id: "usr-u1", nama: "OPERATOR SATKER PUSAT (453374)", role: "Operator Penyusun Kertas Kerja" },
      { id: "usr-u2", nama: "PEJABAT PEMBUAT KOMITMEN (PPK)", role: "PPK Pengampu Belanja" },
    ],
  });

  // Alokasi Program & Kinerja Belanja diambil dari hasil input data pada submenu Isian RAB (Panduan4)
  const [worksheetRows, setWorksheetRows] = useState<WorksheetRow[]>([]);
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({});
  const [expandedKegiatans, setExpandedKegiatans] = useState<Record<string, boolean>>({});
  const [expandedKros, setExpandedKros] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`rab_worksheet_${ukSingkatan}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setWorksheetRows(parsed);
      }
    } catch (e) {}
  }, [ukSingkatan]);

  // Total pagu dari worksheet Isian RAB
  const totalPaguDetail = useMemo(() => {
    const progs = worksheetRows.filter((r) => r.type === "program");
    if (progs.length > 0) {
      return progs.reduce((sum, r) => sum + (Number(r.jumlah) || 0), 0);
    }
    const details = worksheetRows.filter((r) => r.type === "detail");
    if (details.length > 0) {
      return details.reduce((sum, r) => sum + (Number(r.jumlah) || 0), 0);
    }
    return 733980500; // default nominal pagu aktif
  }, [worksheetRows]);

  // ── Identifikasi Histori Sebelum & Histori Aktif untuk Sanding Data ──
  const sandingInfo = useMemo(() => {
    const rawKode = kodeHistoriAktif;
    const sumber = activeRabHistori?.sumber;
    const revKe = activeRabHistori?.rev_ke;

    let prevKode = "";
    let prevLabel = "";
    let hasPrevious = false;

    // Cek kode histori
    const matchDigits = rawKode.match(/\d+/);
    const num = matchDigits ? parseInt(matchDigits[0], 10) : (typeof revKe === "number" ? revKe : 0);

    if (num > 0) {
      hasPrevious = true;
      if (sumber && sumber !== rawKode) {
        prevKode = sumber;
      } else {
        const prefix = rawKode.replace(/\d+/g, "");
        prevKode = `${prefix}${String(num - 1).padStart(2, "0")}`;
      }
    } else if (rawKode.startsWith("C") || rawKode.startsWith("A")) {
      hasPrevious = true;
      prevKode = "B00";
    } else if (rawKode.startsWith("E")) {
      hasPrevious = true;
      prevKode = "D01";
    } else if (rawKode.startsWith("D") && rawKode !== "D00") {
      hasPrevious = true;
      prevKode = "D00";
    }

    if (hasPrevious) {
      prevLabel = mapKodifikasiToTahap(prevKode) + " (" + prevKode + ")";
    } else {
      prevLabel = "Baseline Awal (Tidak ada histori sebelum)";
    }

    const currentLabel = `${tahap} (${rawKode})`;

    // Ambil worksheet histori sebelum jika tersimpan di localStorage, atau fallback perbandingan pagu dinamis
    let prevWorksheetRows: WorksheetRow[] = [];
    try {
      const savedPrev = localStorage.getItem(`rab_worksheet_${ukSingkatan}_${prevKode}`);
      if (savedPrev) {
        prevWorksheetRows = JSON.parse(savedPrev);
      }
    } catch (e) {}

    return {
      hasPrevious,
      prevKode,
      prevLabel,
      currentKode: rawKode,
      currentLabel,
      prevWorksheetRows,
    };
  }, [kodeHistoriAktif, activeRabHistori, tahap, ukSingkatan]);

  // Breakdown program s.d RO dinamis sesuai Isian RAB
  const programBreakdown = useMemo(() => {
    const programRows = worksheetRows.filter((r) => r.type === "program");

    if (programRows.length > 0) {
      const kegiatansInWorksheet = worksheetRows.filter((r) => r.type === "kegiatan");
      const krosInWorksheet = worksheetRows.filter((r) => r.type === "kro");
      const rosInWorksheet = worksheetRows.filter((r) => r.type === "ro");

      return programRows.map((p) => {
        const pKode = p.kode || "";
        const satkerSet = new Set<string>();
        informasiKinerjaData.forEach((ik) => {
          if (ik.program?.startsWith(pKode)) {
            if (ik.satker) satkerSet.add(ik.satker);
          }
        });
        if (satkerSet.size === 0) {
          satkerSet.add("453374 PUSAT (PPATK)");
          satkerSet.add("690558 PUSDIKLAT APU PPT");
        }

        const kegiatans = kegiatansInWorksheet
          .filter((k) => {
            if ((k as any).parentProgramKode) return (k as any).parentProgramKode === pKode;
            if (programRows.length === 1) return true;
            const match = informasiKinerjaData.find(
              (ik) => ik.program?.startsWith(pKode) && ik.kegiatan?.startsWith(k.kode)
            );
            return !!match;
          })
          .map((k) => {
            const kKode = k.kode || "";
            const kros = krosInWorksheet
              .filter((kr) => {
                if ((kr as any).parentKegiatanKode) return (kr as any).parentKegiatanKode === kKode;
                return kr.kode?.startsWith(kKode);
              })
              .map((kr) => {
                const krKode = kr.kode || "";
                const ros = rosInWorksheet
                  .filter((ro) => {
                    if ((ro as any).parentKroKode) return (ro as any).parentKroKode === krKode;
                    return ro.kode?.includes(krKode) || ro.kode?.startsWith(krKode);
                  })
                  .map((ro) => ({
                    kode: ro.kode,
                    uraian: ro.uraian,
                    jumlah: Number(ro.jumlah) || 0,
                  }));
                return {
                  kode: krKode,
                  uraian: kr.uraian,
                  jumlah: Number(kr.jumlah) || 0,
                  ros,
                };
              });

            return {
              kode: kKode,
              uraian: k.uraian,
              jumlah: Number(k.jumlah) || 0,
              kros,
            };
          });

        const totalKro = kegiatans.reduce((sum, k) => sum + k.kros.length, 0);
        const totalRo = kegiatans.reduce(
          (sum, k) => sum + k.kros.reduce((s2, kr) => s2 + kr.ros.length, 0),
          0
        );

        return {
          kode: pKode,
          uraian: p.uraian,
          jumlah: Number(p.jumlah) || 0,
          satkerCount: satkerSet.size,
          kegiatanCount: kegiatans.length,
          kroCount: totalKro,
          roCount: totalRo,
          kegiatans,
        };
      });
    }

    // Fallback: bangun dari informasiKinerjaData sesuai Unit Kerja user jika worksheet Isian RAB belum diisi
    let matchedItems = informasiKinerjaData.filter((ik) => ik.unitKerja === ukSingkatan);
    if (matchedItems.length === 0) {
      matchedItems = informasiKinerjaData;
    }

    const byProg: Record<
      string,
      {
        kode: string;
        uraian: string;
        satkers: Set<string>;
        kegiatans: Record<
          string,
          {
            kode: string;
            uraian: string;
            kros: Record<
              string,
              {
                kode: string;
                uraian: string;
                ros: Record<string, { kode: string; uraian: string }>;
              }
            >;
          }
        >;
      }
    > = {};

    matchedItems.forEach((ik) => {
      const pCode = ik.program?.split(" ")[0] || "078.01.WA";
      const pName = ik.program?.substring(pCode.length).trim() || "Program Dukungan Manajemen";
      const kCode = ik.kegiatan?.split(" ")[0] || "3377";
      const kName = ik.kegiatan?.substring(kCode.length).trim() || "Penyelenggaraan Ketatausahaan, Kerumahtanggaan, Perlengkapan PPATK";
      const kroCode = ik.kro?.split(" ")[0] || "3377.EBA";
      const kroName = ik.kro?.substring(kroCode.length).trim() || "Layanan Dukungan Manajemen Internal";
      const roCode = ik.ro?.split(" ")[0] || "WA.3377.EBA.956";
      const roName = ik.ro?.substring(roCode.length).trim() || "Layanan BMN";

      if (!byProg[pCode]) {
        byProg[pCode] = {
          kode: pCode,
          uraian: pName,
          satkers: new Set(),
          kegiatans: {},
        };
      }
      if (ik.satker) byProg[pCode].satkers.add(ik.satker);

      if (!byProg[pCode].kegiatans[kCode]) {
        byProg[pCode].kegiatans[kCode] = {
          kode: kCode,
          uraian: kName,
          kros: {},
        };
      }
      if (!byProg[pCode].kegiatans[kCode].kros[kroCode]) {
        byProg[pCode].kegiatans[kCode].kros[kroCode] = {
          kode: kroCode,
          uraian: kroName,
          ros: {},
        };
      }
      if (!byProg[pCode].kegiatans[kCode].kros[kroCode].ros[roCode]) {
        byProg[pCode].kegiatans[kCode].kros[kroCode].ros[roCode] = {
          kode: roCode,
          uraian: roName,
        };
      }
    });

    return Object.values(byProg).map((p) => {
      const kegList = Object.values(p.kegiatans).map((k) => ({
        kode: k.kode,
        uraian: k.uraian,
        jumlah: totalPaguDetail,
        kros: Object.values(k.kros).map((kr) => ({
          kode: kr.kode,
          uraian: kr.uraian,
          jumlah: totalPaguDetail,
          ros: Object.values(kr.ros).map((ro) => ({
            kode: ro.kode,
            uraian: ro.uraian,
            jumlah: totalPaguDetail,
          })),
        })),
      }));

      const kroCount = kegList.reduce((acc, k) => acc + k.kros.length, 0);
      const roCount = kegList.reduce(
        (acc, k) => acc + k.kros.reduce((a, kr) => a + kr.ros.length, 0),
        0
      );

      return {
        kode: p.kode,
        uraian: p.uraian,
        jumlah: totalPaguDetail,
        satkerCount: p.satkers.size || 2,
        kegiatanCount: kegList.length,
        kroCount,
        roCount,
        kegiatans: kegList,
      };
    });
  }, [worksheetRows, ukSingkatan, totalPaguDetail]);

  // Inisialisasi status expand untuk level Program secara default terbuka
  useEffect(() => {
    if (programBreakdown.length > 0) {
      setExpandedPrograms((prev) => {
        const nextState = { ...prev };
        programBreakdown.forEach((p, idx) => {
          if (nextState[p.kode] === undefined) {
            nextState[p.kode] = idx === 0; // program pertama terbuka
          }
        });
        return nextState;
      });
    }
  }, [programBreakdown]);

  // ── State Catatan Penelaahan (Tim Penganggaran, Tim Perencanaan, Inspektorat & Penanda tangan Catatan Penelaahan) ──
  const defaultCatatanState: CatatanPenelaahanState = {
    penganggaran: {
      pending: "• Kesesuaian SBM Uang Harian Konsinyering Luar Kota pada KRO Layanan Dukungan Manajemen telah diverifikasi.\n• Dokumen kelengkapan RAB operasional perkantoran telah dilampirkan.",
      pendapat: "Alokasi anggaran belanja barang operasional dan modal telah sesuai dengan Standar Biaya Masukan (SBM) dan tidak melebihi batasan Standar Struktur Biaya (SSB).",
      blokir: "Nihil. Seluruh akun belanja dibuka dan tidak ada pagu yang diberi tanda '@'/Blokir.",
    },
    perencanaan: {
      pending: "• Keterkaitan IKU Target Output Satuan Kerja dengan Renja Eselon II telah selaras.\n• Seluruh komponen belanja mendukung langsung Sasaran Strategis Organisasi PPATK TA 2027.",
      pendapat: "Usulan program kerja dan target output relevan dan telah memenuhi indikator kinerja program prioritas nasional PPATK.",
      blokir: "Nihil.",
    },
    inspektorat: {
      pending: "• Kelengkapan TOR/KAK dan analisis standar harga satuan belanja modal telah diverifikasi.\n• Rekomendasi tindak lanjut LHP tahun anggaran sebelumnya telah dipenuhi oleh Unit Kerja.",
      pendapat: "Secara administratif dan prinsip akuntabilitas pengelolaan anggaran negara telah memenuhi ketentuan peraturan perundang-undangan.",
      blokir: "Nihil.",
    },
    penandatangan: [
      {
        id: "ttd-1",
        nama: "SUKRASNO",
        nip: "197701012000011001",
        instansi: "Tim Penganggaran",
        jabatan: "Ketua Tim Penelaah Penganggaran",
      },
      {
        id: "ttd-2",
        nama: "NOOR ANDRINI WURYANDARI",
        nip: "198003152005022001",
        instansi: "Tim Perencanaan",
        jabatan: "Koordinator Perencanaan Makro",
      },
      {
        id: "ttd-3",
        nama: "INSPEKTUR PPATK",
        nip: "197508201999031002",
        instansi: "Inspektorat",
        jabatan: "Pengawas Internal (APIP)",
      },
    ],
  };

  const [catatanData, setCatatanData] = useState<CatatanPenelaahanState>(() => {
    try {
      const saved = localStorage.getItem(`rab_catatan_penelaahan_${ukSingkatan}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultCatatanState;
  });

  const [catatanAccordion, setCatatanAccordion] = useState<{
    penganggaran: boolean;
    perencanaan: boolean;
    inspektorat: boolean;
    penandatangan: boolean;
  }>({
    penganggaran: true,
    perencanaan: true,
    inspektorat: true,
    penandatangan: true,
  });

  const [catatanSaveStatus, setCatatanSaveStatus] = useState<string>("");

  // State Tutup Forum Penelaahan (Khusus role BINCANG & Super Admin)
  const isBincangOrSuperAdmin = currentUserRole === "BINCANG" || currentUserRole === "Super Admin";
  const [isForumClosed, setIsForumClosed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("rab_forum_tutup_status");
      return saved === "closed";
    } catch (e) {
      return false;
    }
  });
  const [showTutupForumModal, setShowTutupForumModal] = useState<boolean>(false);
  const [tutupForumSuccessMsg, setTutupForumSuccessMsg] = useState<string>("");

  const handleTutupForum = () => {
    try {
      // 1. Simpan status tutup forum di localStorage
      localStorage.setItem("rab_forum_tutup_status", "closed");
      setIsForumClosed(true);

      // 2. Tandai Tahap 3 (Penelaahan) selesai pada monitoring revisi
      const now = new Date();
      const dateStr = now.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
      const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

      let currentMonitoringList = [];
      try {
        const savedList = localStorage.getItem("rab_revisi_monitoring_list");
        if (savedList) {
          currentMonitoringList = JSON.parse(savedList);
        }
      } catch (e) {}

      if (!currentMonitoringList || currentMonitoringList.length === 0) {
        // Ambil default list jika belum pernah tersimpan
        currentMonitoringList = [
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
      }

      // Update item yang sedang di tahap 3 atau rev-mon-4
      const updatedList = currentMonitoringList.map((item: any) => {
        if (item.id === "rev-mon-4" || item.tahap3Penelaahan?.status === "pending" || !item.tahap3Penelaahan?.date) {
          return {
            ...item,
            tahap3Penelaahan: {
              date: dateStr,
              time: timeStr,
              status: "done",
            },
            tahapStatus: 3,
            statusLabel: "Penelaahan Selesai Ditetapkan",
          };
        }
        return item;
      });

      localStorage.setItem("rab_revisi_monitoring_list", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("rab_monitoring_updated"));

      setShowTutupForumModal(false);
      setTutupForumSuccessMsg("Forum Penelaahan berhasil ditutup! Tahap 3 (Penelaahan) telah resmi diselesaikan.");
      setTimeout(() => setTutupForumSuccessMsg(""), 5000);
    } catch (e) {
      alert("Gagal menutup Forum Penelaahan.");
    }
  };

  const handleSaveCatatan = () => {
    try {
      localStorage.setItem(`rab_catatan_penelaahan_${ukSingkatan}`, JSON.stringify(catatanData));
      setCatatanSaveStatus("Catatan Penelaahan berhasil disimpan!");
      setTimeout(() => setCatatanSaveStatus(""), 3500);
    } catch (e) {
      alert("Gagal menyimpan Catatan Penelaahan.");
    }
  };

  const handleAddPenandatangan = () => {
    const newTtd: PenandatanganItem = {
      id: `ttd-${Date.now()}`,
      nama: "PEJABAT PENANDATANGAN",
      nip: "-",
      instansi: "Tim Penelaah",
      jabatan: "Penelaah",
    };
    setCatatanData((prev) => ({
      ...prev,
      penandatangan: [...prev.penandatangan, newTtd],
    }));
  };

  const handleRemovePenandatangan = (id: string) => {
    setCatatanData((prev) => ({
      ...prev,
      penandatangan: prev.penandatangan.filter((t) => t.id !== id),
    }));
  };

  const handleUpdatePenandatangan = (id: string, field: keyof PenandatanganItem, val: string) => {
    setCatatanData((prev) => ({
      ...prev,
      penandatangan: prev.penandatangan.map((t) => (t.id === id ? { ...t, [field]: val } : t)),
    }));
  };

  // Dokumen yang pernah diupload ke forum (Panduan4: tombol Dokumen)
  const [uploadedDocuments, setUploadedDocuments] = useState<AttachedDocument[]>([
    {
      id: "doc-1",
      name: "SPT-PPATK-TA2027.pdf",
      size: "1.2 MB",
      uploadedBy: "ISNEN HADI",
      time: "16 Okt 2026 09:10 WIB",
    },
    {
      id: "doc-2",
      name: "KAK_Konsinyering_Perjadin_2027.xlsx",
      size: "3.8 MB",
      uploadedBy: "KAMANTO PUJIONO",
      time: "16 Okt 2026 11:40 WIB",
    },
    {
      id: "doc-3",
      name: "ADK_07801_Alokasi2027_Final.zip",
      size: "5.4 MB",
      uploadedBy: "SUKRASNO",
      time: "16 Okt 2026 14:40 WIB",
    },
  ]);

  // Threads list percakapan penelaahan
  const [threads, setThreads] = useState<CommentThread[]>([
    {
      id: 16,
      author: "SUKRASNO",
      authorRole: "Tim Penganggaran",
      authorId: "aprdja_630931_197701012000011001",
      roleBadge: "Tim Penganggaran",
      time: "Kamis, 16 Oktober 2026 09:15 WIB",
      content:
        "Selamat pagi Bapak/Ibu Penelaah dari Tim Perencanaan dan PPATK.\n\nBerdasarkan data RKAKL PPATK 2027 yang diupload di forum ini, terpantau masih terdapat 3 KRO yang belum memenuhi kriteria Standar Struktur Biaya (SSB) dimana komponen pendukungnya melebihi ambang batas kewajaran. Mohon tanggapan dan penyesuaian pada KRO terkait.",
      attachments: [
        {
          id: "att-16",
          name: "Catatan_Telaah_SSB_PPATK.pdf",
          size: "450 KB",
          uploadedBy: "SUKRASNO",
          time: "16 Okt 2026 09:15 WIB",
        },
      ],
    },
    {
      id: 17,
      author: "KAMANTO PUJIONO",
      authorRole: "Unit Kerja",
      authorId: "ppatk_198205142006041002",
      roleBadge: "Unit Kerja (Biro Perencanaan)",
      time: "Kamis, 16 Oktober 2026 11:42 WIB",
      replyTo: {
        id: 16,
        author: "SUKRASNO",
        contentSummary: "Selamat pagi Bapak/Ibu Penelaah...",
      },
      content:
        "Yth. Tim Penganggaran & Tim Perencanaan,\n\nTerima kasih atas catatan telaahnya. Kami telah melakukan relokasi akun belanja pendukung ke komponen utama pada Program 078.01.BE (Pencegahan & Pemberantasan TPPU) serta memperbarui rincian kertas kerja konsinyering dan perjalanan dinas. Mohon berkenan diteliti kembali pada berkas terlampir.",
      attachments: [
        {
          id: "att-17",
          name: "Revisi_KertasKerja_Konsinyering_Perjadin.xlsx",
          size: "2.1 MB",
          uploadedBy: "KAMANTO PUJIONO",
          time: "16 Okt 2026 11:42 WIB",
        },
      ],
    },
    {
      id: 18,
      author: "SUKRASNO",
      authorRole: "Tim Penganggaran",
      authorId: "aprdja_630931_197701012000011001",
      roleBadge: "Tim Penganggaran",
      time: "Kamis, 16 Oktober 2026 02:43 PM WIB",
      replyTo: {
        id: 17,
        author: "KAMANTO PUJIONO",
      },
      content:
        "Terima kasih Pak. Alhamdulillah seluruh KRO PPATK pada data RKAKL 2027 telah memenuhi kriteria SSB (tidak ada yang merah).\n\nSekali lagi terima kasih atas kerjasamanya.",
    },
  ]);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<CommentThread | null>(null);

  // Form Rich Text & Upload Dokumen bersamaan submit komentar (Panduan4)
  const editorRef = useRef<HTMLDivElement>(null);
  const [, setEditorContent] = useState<string>("");
  const [commentAttachments, setCommentAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const executeCommand = (cmd: string, val?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const url = prompt("Masukkan URL tautan (contoh: https://ppatk.go.id):");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setCommentAttachments((prev) => [...prev, ...filesArray]);
    }
  };

  const removeAttachment = (idx: number) => {
    setCommentAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSendComment = () => {
    const rawText = editorRef.current ? editorRef.current.innerText.trim() : "";
    if (!rawText && commentAttachments.length === 0) return;

    const nextId = threads.length > 0 ? Math.max(...threads.map((t) => t.id)) + 1 : 1;
    const now = new Date();
    const timeStr = `${now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;

    const newDocs: AttachedDocument[] = commentAttachments.map((f, i) => ({
      id: `att-${nextId}-${i}`,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedBy: "ISNEN HADI",
      time: timeStr,
    }));

    // Update bank dokumen yang pernah diupload
    if (newDocs.length > 0) {
      setUploadedDocuments((prev) => [...newDocs, ...prev]);
    }

    const newThread: CommentThread = {
      id: nextId,
      author: "ISNEN HADI",
      authorRole: "Unit Kerja",
      authorId: "ppatk_317410_operator_453374",
      roleBadge: "Unit Kerja (Operator)",
      time: timeStr,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            author: replyingTo.author,
            contentSummary: replyingTo.content.substring(0, 45) + "...",
          }
        : undefined,
      content: editorRef.current ? editorRef.current.innerHTML : rawText,
      attachments: newDocs.length > 0 ? newDocs : undefined,
    };

    setThreads((prev) => [...prev, newThread]);
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    setEditorContent("");
    setCommentAttachments([]);
    setReplyingTo(null);
  };

  // Simpan Peserta Penelaahan Baru
  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserRoleDescription.trim()) return;
    const newItem: PesertaItem = {
      id: `usr-${Date.now()}`,
      nama: newUserName.trim().toUpperCase(),
      role: newUserRoleDescription.trim(),
    };

    if (newUserCategory === "Tim Penganggaran") {
      setPesertaList((prev) => ({ ...prev, penganggaran: [...prev.penganggaran, newItem] }));
    } else if (newUserCategory === "Tim Perencanaan") {
      setPesertaList((prev) => ({ ...prev, perencanaan: [...prev.perencanaan, newItem] }));
    } else if (newUserCategory === "Inspektorat") {
      setPesertaList((prev) => ({ ...prev, inspektorat: [...prev.inspektorat, newItem] }));
    } else {
      setPesertaList((prev) => ({ ...prev, unitKerja: [...prev.unitKerja, newItem] }));
    }
    setNewUserName("");
    setNewUserRoleDescription("");
    setShowAddUserModal(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── Top Alert Banner / Title ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5 sm:p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 mt-0.5">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Nama laman cukup Forum Penelaahan (Panduan4) */}
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Forum Penelaahan
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tahap {tahap} Aktif
                </span>
                {/* Tahun anggaran disesuaikan dengan info tahun yang ada di Topbar: TA 2027 (Panduan4) */}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                  {tahunAnggaran}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Forum interaksi penelaahan rencana kerja anggaran bersama Tim Penganggaran, Tim Perencanaan, Inspektorat, dan Unit Kerja.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Cetak Forum: Menampilkan draft cetak dari Diskusi & Catatan Penelaahan (Panduan4) */}
            <button
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Cetak Forum</span>
            </button>
          </div>
        </div>

        {/* Notifikasi Tutup Forum Berhasil */}
        {tutupForumSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{tutupForumSuccessMsg}</span>
            </div>
            <button
              onClick={() => setTutupForumSuccessMsg("")}
              className="text-emerald-600 hover:text-emerald-800 cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Filter Form Fields ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          {/* Tahun Anggaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Tahun Anggaran
            </label>
            <input
              type="text"
              readOnly
              value={tahunAnggaran}
              className="w-full text-sm font-semibold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 cursor-not-allowed font-mono"
            />
          </div>

          {/* Tahap Sesuai Panduan4 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Tahap
            </label>
            <div className="space-y-1">
              <select
                value={tahap}
                onChange={(e) => setTahap(e.target.value)}
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
              >
                <option value={tahap}>{tahap} (Otomatis dari Histori {kodeHistoriAktif})</option>
                <option value="Angka Dasar">Angka Dasar (G00, G01)</option>
                <option value="Pagu Indikatif / RKA-K/L Awal">Pagu Indikatif / RKA-K/L Awal (D00)</option>
                <option value="Pagu Anggaran">Pagu Anggaran (D01 s.d. D99)</option>
                <option value="Alokasi Anggaran">Alokasi Anggaran (E00 s.d. E99)</option>
                <option value="DIPA Awal">DIPA Awal (B00)</option>
                <option value="Usulan Revisi DIPA ke-1">Usulan Revisi DIPA (A01 s.d. A99)</option>
                <option value="DIPA Revisi ke-1">DIPA Revisi (B01 s.d. B99)</option>
                <option value="Usulan Revisi Satker / POK (Rev ke-1)">Usulan Revisi Satker / POK (C01 s.d. C99)</option>
              </select>
              <p className="text-[10px] text-slate-400 font-medium">
                Terisi otomatis berdasarkan kodifikasi histori aktif: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{kodeHistoriAktif}</strong>
              </p>
            </div>
          </div>

          {/* Unit Kerja */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Unit Kerja
            </label>
            <input
              type="text"
              readOnly
              value={userUnit}
              className="w-full text-sm font-medium px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 truncate cursor-not-allowed uppercase"
            />
          </div>
        </div>
      </div>

      {/* ── Alokasi Program & Kinerja Belanja (Data Dinamis Isian RAB s.d. Level RO) ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Alokasi Program & Kinerja Belanja
            </h2>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Total Pagu Belanja:{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              Rp {totalPaguDetail.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Tabel Hierarki: Program -> Kegiatan -> KRO -> RO (Expand / Collapse) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100/75 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Kode & Uraian Program / Kegiatan / KRO / RO</th>
                <th className="px-5 py-3 text-right">Pagu Rupiah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {programBreakdown.map((prog: any, pIdx: number) => {
                const isProgExpanded = expandedPrograms[prog.kode] ?? true;
                return (
                  <React.Fragment key={`prog-${pIdx}`}>
                    {/* Level Program */}
                    <tr
                      onClick={() =>
                        setExpandedPrograms((prev) => ({
                          ...prev,
                          [prog.kode]: !isProgExpanded,
                        }))
                      }
                      className="bg-indigo-50/25 dark:bg-indigo-950/25 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                          {isProgExpanded ? (
                            <ChevronDown className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          )}
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">
                            {prog.kode}
                          </span>
                          <span>- {prog.uraian}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 pl-6">
                          <span>{prog.satkerCount} Satker</span>
                          <span>•</span>
                          <span>{prog.kegiatanCount} Kegiatan</span>
                          <span>•</span>
                          <span>{prog.kroCount} KRO</span>
                          <span>•</span>
                          <span>{prog.roCount} RO</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100 align-top">
                        Rp {prog.jumlah.toLocaleString("id-ID")}
                      </td>
                    </tr>

                    {/* Level Kegiatan */}
                    {isProgExpanded &&
                      prog.kegiatans &&
                      prog.kegiatans.map((keg: any, kIdx: number) => {
                        const isKegExpanded = expandedKegiatans[keg.kode] ?? true;
                        return (
                          <React.Fragment key={`keg-${kIdx}`}>
                            <tr
                              onClick={() =>
                                setExpandedKegiatans((prev) => ({
                                  ...prev,
                                  [keg.kode]: !isKegExpanded,
                                }))
                              }
                              className="bg-slate-50/70 dark:bg-slate-850/70 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 cursor-pointer text-xs transition-colors"
                            >
                              <td className="px-5 py-2.5 pl-10 font-bold text-slate-800 dark:text-slate-200">
                                <div className="flex items-center gap-2">
                                  {isKegExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                  )}
                                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                                    {keg.kode}
                                  </span>
                                  <span>{keg.uraian}</span>
                                </div>
                              </td>
                              <td className="px-5 py-2.5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                                Rp {keg.jumlah.toLocaleString("id-ID")}
                              </td>
                            </tr>

                            {/* Level KRO */}
                            {isKegExpanded &&
                              keg.kros &&
                              keg.kros.map((kro: any, krIdx: number) => {
                                const isKroExpanded = expandedKros[kro.kode] ?? true;
                                return (
                                  <React.Fragment key={`kro-${krIdx}`}>
                                    <tr
                                      onClick={() =>
                                        setExpandedKros((prev) => ({
                                          ...prev,
                                          [kro.kode]: !isKroExpanded,
                                        }))
                                      }
                                      className="bg-white/60 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs transition-colors"
                                    >
                                      <td className="px-5 py-2 pl-16 font-semibold text-slate-700 dark:text-slate-300">
                                        <div className="flex items-center gap-2">
                                          {isKroExpanded ? (
                                            <ChevronDown className="w-3 h-3 text-slate-400" />
                                          ) : (
                                            <ChevronRight className="w-3 h-3 text-slate-400" />
                                          )}
                                          <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                                            {kro.kode}
                                          </span>
                                          <span>{kro.uraian}</span>
                                        </div>
                                      </td>
                                      <td className="px-5 py-2 text-right font-mono text-slate-700 dark:text-slate-300">
                                        Rp {kro.jumlah.toLocaleString("id-ID")}
                                      </td>
                                    </tr>

                                    {/* Level RO */}
                                    {isKroExpanded &&
                                      kro.ros &&
                                      kro.ros.map((ro: any, rIdx: number) => (
                                        <tr
                                          key={`ro-${rIdx}`}
                                          className="hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 text-[11px] transition-colors"
                                        >
                                          <td className="px-5 py-1.5 pl-24 text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-2">
                                              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                                {ro.kode}
                                              </span>
                                              <span>{ro.uraian}</span>
                                            </div>
                                          </td>
                                          <td className="px-5 py-1.5 text-right font-mono text-slate-600 dark:text-slate-400">
                                            Rp {(Number(ro.jumlah) || 0).toLocaleString("id-ID")}
                                          </td>
                                        </tr>
                                      ))}
                                  </React.Fragment>
                                );
                              })}
                          </React.Fragment>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Shortcut Toolbar: Dokumen, Sanding Data, Catatan Penelaahan (Panduan4) ── */}
      {/* ── Shortcut Toolbar: Dokumen, Sanding Data, Catatan Penelaahan, & Tutup Forum (Panduan4) ── */}
      <div className={`grid grid-cols-1 ${isBincangOrSuperAdmin ? "sm:grid-cols-4" : "sm:grid-cols-3"} gap-3`}>
        <button
          onClick={() => setActiveTab(activeTab === "dokumen" ? "forum" : "dokumen")}
          className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            activeTab === "dokumen"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
          }`}
        >
          <FileText className="w-4 h-4 text-blue-500" />
          <span>Dokumen ({uploadedDocuments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === "sanding_data" ? "forum" : "sanding_data")}
          className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            activeTab === "sanding_data"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
          }`}
        >
          <GitCompare className="w-4 h-4 text-emerald-500" />
          <span>Sanding Data</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === "catatan" ? "forum" : "catatan")}
          className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            activeTab === "catatan"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-rose-500" />
          <span>Catatan Penelaahan</span>
        </button>

        {/* Tombol Tutup Forum (Hanya muncul pada role BINCANG & Super Admin) */}
        {isBincangOrSuperAdmin && (
          <button
            onClick={() => setShowTutupForumModal(true)}
            disabled={isForumClosed}
            className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isForumClosed
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 cursor-not-allowed"
                : "bg-rose-600 hover:bg-rose-700 text-white border-rose-600 hover:border-rose-700"
            }`}
            title="Tutup Forum Penelaahan dan selesaikan Tahap 3 (Penelaahan)"
          >
            {isForumClosed ? (
              <>
                <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Tahap 3 Selesai (Forum Ditutup)</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Tutup Forum</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Panel Tombol Dokumen (Seluruh dokumen yang pernah diupload ke forum sesuai Panduan4) ── */}
      {activeTab === "dokumen" && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Seluruh Dokumen yang Pernah Di-upload ke Forum</span>
            </h3>
            <button
              onClick={() => setActiveTab("forum")}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕ Tutup Panel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {uploadedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1 shadow-2xs"
              >
                <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                  {doc.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {doc.size} • Diupload oleh: <strong className="text-slate-700 dark:text-slate-300">{doc.uploadedBy}</strong>
                </div>
                <div className="text-[10px] text-slate-400">{doc.time}</div>
                <button
                  onClick={() => alert(`Mengunduh berkas: ${doc.name}`)}
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Dokumen</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Panel Sanding Data (History Sebelumnya vs History Terakhir level Program, Kegiatan, KRO, RO + Selisih) ── */}
      {activeTab === "sanding_data" && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-slate-900 p-5 space-y-5 animate-in fade-in duration-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-emerald-600" />
                <span>Sanding Data: Histori Sebelum vs Histori Aktif Isian RAB</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Komparasi riil rincian pagu anggaran dari Isian RAB antara <strong>{sandingInfo.prevLabel}</strong> dengan <strong>{sandingInfo.currentLabel}</strong> pada level Program s.d. RO.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("forum")}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer self-start sm:self-auto"
            >
              ✕ Tutup Panel
            </button>
          </div>

          {/* Kartu Ringkasan Total */}
          {(() => {
            // Hitung total pagu sebelum & delta riil
            const prevTotal = sandingInfo.hasPrevious
              ? (sandingInfo.prevWorksheetRows.length > 0
                  ? sandingInfo.prevWorksheetRows.filter((r: any) => r.type === "detail").reduce((s: number, r: any) => s + (Number(r.jumlah) || 0), 0)
                  : Math.round(totalPaguDetail * 0.95))
              : totalPaguDetail;
            const deltaTotal = totalPaguDetail - prevTotal;

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    1. Histori Sebelum {sandingInfo.prevKode ? `(${sandingInfo.prevKode})` : ""}
                  </span>
                  <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
                    Rp {prevTotal.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate" title={sandingInfo.prevLabel}>
                    {sandingInfo.prevLabel}
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                    2. Histori Aktif ({sandingInfo.currentKode})
                  </span>
                  <div className="text-lg font-bold font-mono text-indigo-700 dark:text-indigo-300 mt-1">
                    Rp {totalPaguDetail.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[11px] text-indigo-600/80 mt-1 truncate" title={sandingInfo.currentLabel}>
                    {sandingInfo.currentLabel}
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                    3. Selisih / Delta
                  </span>
                  <div className={`text-lg font-bold font-mono mt-1 ${deltaTotal >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600"}`}>
                    {deltaTotal >= 0 ? "+" : ""} Rp {deltaTotal.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[11px] text-emerald-600/80 mt-1">
                    {deltaTotal >= 0 ? "Peningkatan Alokasi Pagu" : "Penyesuaian / Efisiensi Pagu"}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Tabel Sanding Data Rincian Level Program, Kegiatan, KRO, RO */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Kode & Uraian (Program / Kegiatan / KRO / RO)</th>
                  <th className="px-4 py-3 text-right">Histori Sebelum ({sandingInfo.prevKode || "-"})</th>
                  <th className="px-4 py-3 text-right">Histori Aktif ({sandingInfo.currentKode})</th>
                  <th className="px-4 py-3 text-right">Selisih (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {programBreakdown.map((prog: any, pIdx: number) => {
                  const prevProg = sandingInfo.hasPrevious
                    ? (sandingInfo.prevWorksheetRows.find((r: any) => r.type === "program" && r.kode === prog.kode)?.jumlah ?? Math.round(prog.jumlah * 0.95))
                    : prog.jumlah;
                  const deltaProg = prog.jumlah - prevProg;
                  return (
                    <React.Fragment key={`sand-prog-${pIdx}`}>
                      {/* Baris Program */}
                      <tr className="bg-indigo-50/30 dark:bg-indigo-950/30 font-bold">
                        <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 mr-2">
                            {prog.kode}
                          </span>
                          <span>{prog.uraian}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                          Rp {prevProg.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-indigo-700 dark:text-indigo-300">
                          Rp {prog.jumlah.toLocaleString("id-ID")}
                        </td>
                        <td className={`px-4 py-2.5 text-right font-mono ${deltaProg >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                          {deltaProg >= 0 ? "+" : ""} Rp {deltaProg.toLocaleString("id-ID")}
                        </td>
                      </tr>

                      {/* Baris Kegiatan */}
                      {prog.kegiatans?.map((keg: any, kIdx: number) => {
                        const prevKeg = sandingInfo.hasPrevious
                          ? (sandingInfo.prevWorksheetRows.find((r: any) => r.type === "kegiatan" && r.kode === keg.kode)?.jumlah ?? Math.round(keg.jumlah * 0.95))
                          : keg.jumlah;
                        const deltaKeg = keg.jumlah - prevKeg;
                        return (
                          <React.Fragment key={`sand-keg-${kIdx}`}>
                            <tr className="bg-slate-50/60 dark:bg-slate-850/60 font-semibold">
                              <td className="px-4 py-2 pl-8 text-slate-800 dark:text-slate-200">
                                <span className="font-mono text-blue-600 dark:text-blue-400 mr-2">
                                  {keg.kode}
                                </span>
                                <span>{keg.uraian}</span>
                              </td>
                              <td className="px-4 py-2 text-right font-mono text-slate-600 dark:text-slate-400">
                                Rp {prevKeg.toLocaleString("id-ID")}
                              </td>
                              <td className="px-4 py-2 text-right font-mono text-slate-800 dark:text-slate-200">
                                Rp {keg.jumlah.toLocaleString("id-ID")}
                              </td>
                              <td className={`px-4 py-2 text-right font-mono ${deltaKeg >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                                {deltaKeg >= 0 ? "+" : ""} Rp {deltaKeg.toLocaleString("id-ID")}
                              </td>
                            </tr>

                            {/* Baris KRO */}
                            {keg.kros?.map((kro: any, krIdx: number) => {
                              const prevKro = sandingInfo.hasPrevious
                                ? (sandingInfo.prevWorksheetRows.find((r: any) => r.type === "kro" && r.kode === kro.kode)?.jumlah ?? Math.round(kro.jumlah * 0.95))
                                : kro.jumlah;
                              const deltaKro = kro.jumlah - prevKro;
                              return (
                                <React.Fragment key={`sand-kro-${krIdx}`}>
                                  <tr className="bg-white dark:bg-slate-900">
                                    <td className="px-4 py-1.5 pl-12 text-slate-700 dark:text-slate-300 font-medium">
                                      <span className="font-mono text-purple-600 dark:text-purple-400 mr-2">
                                        {kro.kode}
                                      </span>
                                      <span>{kro.uraian}</span>
                                    </td>
                                    <td className="px-4 py-1.5 text-right font-mono text-slate-500">
                                      Rp {prevKro.toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-4 py-1.5 text-right font-mono text-slate-700 dark:text-slate-300">
                                      Rp {kro.jumlah.toLocaleString("id-ID")}
                                    </td>
                                    <td className={`px-4 py-1.5 text-right font-mono ${deltaKro >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                                      {deltaKro >= 0 ? "+" : ""} Rp {deltaKro.toLocaleString("id-ID")}
                                    </td>
                                  </tr>

                                  {/* Baris RO */}
                                  {kro.ros?.map((ro: any, rIdx: number) => {
                                    const roJumlah = Number(ro.jumlah) || 0;
                                    const prevRo = sandingInfo.hasPrevious
                                      ? (sandingInfo.prevWorksheetRows.find((r: any) => r.type === "ro" && r.kode === ro.kode)?.jumlah ?? Math.round(roJumlah * 0.95))
                                      : roJumlah;
                                    const deltaRo = roJumlah - prevRo;
                                    return (
                                      <tr
                                        key={`sand-ro-${rIdx}`}
                                        className="bg-slate-50/30 dark:bg-slate-850/30 text-[11px]"
                                      >
                                        <td className="px-4 py-1.5 pl-16 text-slate-600 dark:text-slate-400">
                                          <span className="font-mono text-slate-500 mr-2">
                                            {ro.kode}
                                          </span>
                                          <span>{ro.uraian}</span>
                                        </td>
                                        <td className="px-4 py-1.5 text-right font-mono text-slate-500">
                                          Rp {prevRo.toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-4 py-1.5 text-right font-mono text-slate-700 dark:text-slate-300">
                                          Rp {roJumlah.toLocaleString("id-ID")}
                                        </td>
                                        <td className={`px-4 py-1.5 text-right font-mono ${deltaRo >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                                          {deltaRo >= 0 ? "+" : ""} Rp {deltaRo.toLocaleString("id-ID")}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </React.Fragment>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Panel Catatan Penelaahan (Tim Perencanaan, Tim Penganggaran, Inspektorat & Penanda tangan Catatan Penelaahan) ── */}
      {activeTab === "catatan" && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-slate-900 p-5 space-y-6 animate-in fade-in duration-200 shadow-xs">
          {/* Header Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Formulir Catatan Penelaahan Anggaran
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Catatan resmi penelaahan Rencana Kerja Anggaran yang diisi oleh Tim Penganggaran, Tim Perencanaan, dan Inspektorat.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrintCatatanModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>Unduh Report</span>
              </button>
              <button
                onClick={() => setActiveTab("forum")}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer px-2 py-1"
              >
                ✕ Tutup Panel
              </button>
            </div>
          </div>

          {/* Alert Status Simpan */}
          {catatanSaveStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{catatanSaveStatus}</span>
            </div>
          )}

          {/* Section 1: Catatan Tim Penganggaran (DJA) */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
            <button
              onClick={() =>
                setCatatanAccordion((prev) => ({
                  ...prev,
                  penganggaran: !prev.penganggaran,
                }))
              }
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-750 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                {catatanAccordion.penganggaran ? (
                  <ChevronDown className="w-4 h-4 text-blue-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                )}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Catatan Tim Penganggaran
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                  Tim Penganggaran
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {catatanAccordion.penganggaran ? "Sembunyikan Form" : "Tampilkan Form"}
              </span>
            </button>

            {catatanAccordion.penganggaran && (
              <div className="p-4 bg-white dark:bg-slate-900 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    A. Catatan Khusus dan/atau Pending :
                  </label>
                  <RichTextEditor
                    value={catatanData.penganggaran.pending}
                    onChange={(val) =>
                      setCatatanData((prev) => ({
                        ...prev,
                        penganggaran: { ...prev.penganggaran, pending: val },
                      }))
                    }
                    placeholder="Tuliskan catatan khusus atau hal-hal pending oleh Tim Penganggaran..."
                    minHeight="90px"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    B. Penilaian / Pendapat Petugas :
                  </label>
                  <RichTextEditor
                    value={catatanData.penganggaran.pendapat}
                    onChange={(val) =>
                      setCatatanData((prev) => ({
                        ...prev,
                        penganggaran: { ...prev.penganggaran, pendapat: val },
                      }))
                    }
                    placeholder="Tuliskan penilaian/pendapat petugas Tim Penganggaran..."
                    minHeight="90px"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    C. Anggaran yang Diberikan Tanda &quot;@&quot; / Blokir :
                  </label>
                  <RichTextEditor
                    value={catatanData.penganggaran.blokir}
                    onChange={(val) =>
                      setCatatanData((prev) => ({
                        ...prev,
                        penganggaran: { ...prev.penganggaran, blokir: val },
                      }))
                    }
                    placeholder="Tuliskan rincian anggaran yang diberi tanda @/blokir..."
                    minHeight="80px"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Catatan Tim Perencanaan (Bappenas) */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
            <button
              onClick={() =>
                setCatatanAccordion((prev) => ({
                  ...prev,
                  perencanaan: !prev.perencanaan,
                }))
              }
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-750 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                {catatanAccordion.perencanaan ? (
                  <ChevronDown className="w-4 h-4 text-amber-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-amber-600" />
                )}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Catatan Tim Perencanaan
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                  Tim Perencanaan
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {catatanAccordion.perencanaan ? "Sembunyikan Form" : "Tampilkan Form"}
              </span>
            </button>

            {catatanAccordion.perencanaan && (
              <div className="p-4 bg-white dark:bg-slate-900 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    A. Catatan Khusus dan/atau Pending :
                  </label>
                  <RichTextEditor
                    value={catatanData.perencanaan.pending}
                    onChange={(val) =>
                      setCatatanData((prev) => ({
                        ...prev,
                        perencanaan: { ...prev.perencanaan, pending: val },
                      }))
                    }
                    placeholder="Tuliskan catatan khusus atau hal-hal pending oleh Tim Perencanaan..."
                    minHeight="90px"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    B. Penilaian / Pendapat Petugas :
                  </label>
                  <RichTextEditor
                    value={catatanData.perencanaan.pendapat}
                    onChange={(val) =>
                      setCatatanData((prev) => ({
                        ...prev,
                        perencanaan: { ...prev.perencanaan, pendapat: val },
                      }))
                    }
                    placeholder="Tuliskan penilaian/pendapat petugas Tim Perencanaan..."
                    minHeight="90px"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    C. Anggaran yang Diberikan Tanda &quot;@&quot; / Blokir :
                  </label>
                  <RichTextEditor
                    value={catatanData.perencanaan.blokir}
                    onChange={(val) =>
                      setCatatanData((prev) => ({
                        ...prev,
                        perencanaan: { ...prev.perencanaan, blokir: val },
                      }))
                    }
                    placeholder="Tuliskan rincian anggaran yang diberi tanda @/blokir..."
                    minHeight="80px"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Catatan Inspektorat (K/L) */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
            <button
              onClick={() =>
                setCatatanAccordion((prev) => ({
                  ...prev,
                  inspektorat: !prev.inspektorat,
                }))
              }
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-750 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                {catatanAccordion.inspektorat ? (
                  <ChevronDown className="w-4 h-4 text-purple-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-purple-600" />
                )}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Catatan Inspektorat
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                  Inspektorat
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {catatanAccordion.inspektorat ? "Sembunyikan Form" : "Tampilkan Form"}
              </span>
            </button>

            {catatanAccordion.inspektorat && (
              <div className="p-4 bg-white dark:bg-slate-900 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    A. Catatan Khusus dan/atau Pending :
                  </label>
                  <RichTextEditor
                    value={catatanData.inspektorat.pending}
                    onChange={(val) =>
                      setCatatanData((prev) => ({
                        ...prev,
                        inspektorat: { ...prev.inspektorat, pending: val },
                      }))
                    }
                    placeholder="Tuliskan catatan khusus atau hal-hal pending oleh Inspektorat..."
                    minHeight="90px"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    B. Penilaian / Pendapat Petugas :
                  </label>
                  <RichTextEditor
                    value={catatanData.inspektorat.pendapat}
                    onChange={(val) =>
                      setCatatanData((prev) => ({
                        ...prev,
                        inspektorat: { ...prev.inspektorat, pendapat: val },
                      }))
                    }
                    placeholder="Tuliskan penilaian/pendapat auditor/petugas Inspektorat..."
                    minHeight="90px"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    C. Anggaran yang Diberikan Tanda &quot;@&quot; / Blokir :
                  </label>
                  <RichTextEditor
                    value={catatanData.inspektorat.blokir}
                    onChange={(val) =>
                      setCatatanData((prev) => ({
                        ...prev,
                        inspektorat: { ...prev.inspektorat, blokir: val },
                      }))
                    }
                    placeholder="Tuliskan rincian anggaran yang diberi tanda @/blokir..."
                    minHeight="80px"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Penanda tangan Catatan Penelaahan (Menggantikan Penanda tangan K/L) */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
            <button
              onClick={() =>
                setCatatanAccordion((prev) => ({
                  ...prev,
                  penandatangan: !prev.penandatangan,
                }))
              }
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-750 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                {catatanAccordion.penandatangan ? (
                  <ChevronDown className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-emerald-600" />
                )}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Penanda tangan Catatan Penelaahan
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                  {catatanData.penandatangan.length} Penandatangan
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {catatanAccordion.penandatangan ? "Sembunyikan Daftar" : "Tampilkan Daftar"}
              </span>
            </button>

            {catatanAccordion.penandatangan && (
              <div className="p-4 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Daftar pejabat/petugas penanda tangan berita acara dan catatan penelaahan:
                  </p>
                  <button
                    onClick={handleAddPenandatangan}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Penandatangan</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {catatanData.penandatangan.map((ttd, idx) => (
                    <div
                      key={ttd.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative"
                    >
                      <button
                        onClick={() => handleRemovePenandatangan(ttd.id)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Penandatangan #{idx + 1}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Nama Pejabat:
                        </label>
                        <input
                          type="text"
                          value={ttd.nama}
                          onChange={(e) => handleUpdatePenandatangan(ttd.id, "nama", e.target.value)}
                          className="w-full text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          NIP:
                        </label>
                        <input
                          type="text"
                          value={ttd.nip}
                          onChange={(e) => handleUpdatePenandatangan(ttd.id, "nip", e.target.value)}
                          className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Instansi / Tim:
                        </label>
                        <input
                          type="text"
                          value={ttd.instansi}
                          onChange={(e) => handleUpdatePenandatangan(ttd.id, "instansi", e.target.value)}
                          className="w-full text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                          Jabatan Penelaah:
                        </label>
                        <input
                          type="text"
                          value={ttd.jabatan}
                          onChange={(e) => handleUpdatePenandatangan(ttd.id, "jabatan", e.target.value)}
                          className="w-full text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer: Tombol Simpan & Cetak Catatan Penelaahan (Paling Bawah) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perubahan pada catatan penelaahan akan tersimpan pada profil unit kerja: <strong className="text-slate-700 dark:text-slate-300">{userUnit}</strong>.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSaveCatatan}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Catatan Penelaahan</span>
              </button>
              <button
                onClick={() => setShowPrintCatatanModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Catatan Penelaahan</span>
              </button>
              {/* Tombol Tutup Forum di samping Catatan Penelaahan (Hanya untuk BINCANG & Super Admin) */}
              {isBincangOrSuperAdmin && (
                <button
                  onClick={() => setShowTutupForumModal(true)}
                  disabled={isForumClosed}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer ${
                    isForumClosed
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-not-allowed"
                      : "bg-rose-600 text-white hover:bg-rose-700"
                  }`}
                  title="Tutup Forum Penelaahan dan selesaikan Tahap 3 (Penelaahan)"
                >
                  {isForumClosed ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Tahap 3 Selesai (Forum Ditutup)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Tutup Forum</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout: Chat / Forum Feed (75%) & Peserta Penelaahan Sidebar (25%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Forum Feed & Reply Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Diskusi & Catatan Penelaahan
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {threads.length} Pesan Terkirim
              </span>
            </div>

            {/* List Chat / Thread */}
            <div className="space-y-4 pt-4">
              {threads.map((thread) => {
                const isPenganggaran = thread.authorRole === "Tim Penganggaran";
                const isPerencanaan = thread.authorRole === "Tim Perencanaan";
                const isInspektorat = thread.authorRole === "Inspektorat";

                return (
                  <div
                    key={thread.id}
                    className={`rounded-2xl border p-4.5 sm:p-5 transition-all ${
                      isPenganggaran
                        ? "border-blue-100 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/10"
                        : isPerencanaan
                        ? "border-amber-100 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10"
                        : isInspektorat
                        ? "border-purple-100 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/10"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850/30"
                    }`}
                  >
                    {/* Header Item Komentar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {thread.author}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          - ({thread.authorId})
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            isPenganggaran
                              ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              : isPerencanaan
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              : isInspektorat
                              ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                              : "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                          }`}
                        >
                          {thread.roleBadge}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        <span className="text-xs text-slate-500 font-mono">
                          {thread.time}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                          #{thread.id}
                        </span>
                      </div>
                    </div>

                    {/* Reference to parent thread jika reply */}
                    {thread.replyTo && (
                      <div className="mt-2.5 ml-1 pl-3 border-l-2 border-indigo-400/60 dark:border-indigo-500/50 text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <span>
                          Membalas pesan <strong className="text-slate-700 dark:text-slate-300">#{thread.replyTo.id} {thread.replyTo.author}</strong>
                          {thread.replyTo.contentSummary ? `: "${thread.replyTo.contentSummary}"` : ""}
                        </span>
                      </div>
                    )}

                    {/* Isi Pesan (Render HTML / Text dengan class rich-text-content) */}
                    <div
                      className="rich-text-content mt-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: thread.content }}
                    />

                    {/* Lampiran Dokumen jika ada (Panduan4) */}
                    {thread.attachments && thread.attachments.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <Paperclip className="w-3 h-3" /> Lampiran Berkas ({thread.attachments.length}):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {thread.attachments.map((att, i) => (
                            <div
                              key={i}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                            >
                              <FileText className="w-3.5 h-3.5 text-indigo-500" />
                              <span className="font-medium truncate max-w-[200px]">{att.name}</span>
                              <span className="text-[10px] text-slate-400">({att.size})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tombol Balas */}
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
                      <button
                        onClick={() => {
                          setReplyingTo(thread);
                          const el = document.getElementById("reply-editor");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form Balasan / Pesan Baru dengan Editing Toolbar Lengkap Persis Gambar */}
            <div id="reply-editor" className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              {replyingTo && (
                <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
                  <div className="flex items-center gap-2">
                    <CornerDownRight className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>
                      Membalas pesan <strong>#{replyingTo.id} {replyingTo.author}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Form Editor Lengkap */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                {/* Toolbar Editing Sesuai Screenshot Lengkap (16 Tombol Formatting) */}
                <div className="flex items-center gap-0.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex-wrap">
                  {/* Undo */}
                  <button
                    type="button"
                    onClick={() => executeCommand("undo")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Undo"
                  >
                    <Undo className="w-3.5 h-3.5" />
                  </button>
                  {/* Redo */}
                  <button
                    type="button"
                    onClick={() => executeCommand("redo")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Redo"
                  >
                    <Redo className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                  {/* Heading 1 */}
                  <button
                    type="button"
                    onClick={() => executeCommand("formatBlock", "<h1>")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer font-bold text-xs"
                    title="Heading 1"
                  >
                    <Heading1 className="w-3.5 h-3.5" />
                  </button>
                  {/* Heading 2 */}
                  <button
                    type="button"
                    onClick={() => executeCommand("formatBlock", "<h2>")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer font-bold text-xs"
                    title="Heading 2"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                  {/* Bold */}
                  <button
                    type="button"
                    onClick={() => executeCommand("bold")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer font-bold"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  {/* Italic */}
                  <button
                    type="button"
                    onClick={() => executeCommand("italic")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  {/* Underline */}
                  <button
                    type="button"
                    onClick={() => executeCommand("underline")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Underline"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  {/* Strikethrough */}
                  <button
                    type="button"
                    onClick={() => executeCommand("strikeThrough")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                  {/* Align Left */}
                  <button
                    type="button"
                    onClick={() => executeCommand("justifyLeft")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Align Left"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  {/* Align Center */}
                  <button
                    type="button"
                    onClick={() => executeCommand("justifyCenter")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Align Center"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  {/* Align Right */}
                  <button
                    type="button"
                    onClick={() => executeCommand("justifyRight")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Align Right"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  {/* Align Justify */}
                  <button
                    type="button"
                    onClick={() => executeCommand("justifyFull")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Align Justify"
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                  {/* Bullet List */}
                  <button
                    type="button"
                    onClick={() => executeCommand("insertUnorderedList")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  {/* Numbered List */}
                  <button
                    type="button"
                    onClick={() => executeCommand("insertOrderedList")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                  {/* Link */}
                  <button
                    type="button"
                    onClick={addLink}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Sisipkan Tautan"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                  {/* Clear Format Tx */}
                  <button
                    type="button"
                    onClick={() => executeCommand("removeFormat")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Hapus Pemformatan (Tx)"
                  >
                    <RemoveFormatting className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                  {/* Tombol Upload Dokumen Bersamaan (Panduan4) */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer"
                    title="Lampirkan Dokumen"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Lampirkan Dokumen</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* Editable Area */}
                <div
                  ref={editorRef}
                  contentEditable
                  className="rich-text-content p-3.5 min-h-[95px] text-sm text-slate-800 dark:text-slate-200 outline-none focus:outline-none leading-relaxed"
                  onInput={(e) => setEditorContent(e.currentTarget.innerHTML)}
                  placeholder="Ketik catatan penelaahan atau tanggapan..."
                />

                {/* List Berkas Terlampir yang siap di-submit */}
                {commentAttachments.length > 0 && (
                  <div className="px-3.5 pb-2.5 pt-1 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                    {commentAttachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-xs text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span className="truncate max-w-[180px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between mt-3">
                <p className="text-[11px] text-slate-400">
                  Koordinasi penelaahan dokumen anggaran PPATK bersama Tim Penganggaran, Perencanaan & Inspektorat.
                </p>
                <button
                  onClick={handleSendComment}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Pesan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Peserta Penelaahan Sesuai Panduan4 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Peserta Penelaahan</span>
              </h3>
            </div>

            {/* Tim Penganggaran (menggantikan DJA sesuai Panduan4) */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Tim Penganggaran</span>
                <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                  {pesertaList.penganggaran.length} Orang
                </span>
              </div>
              <ul className="space-y-2 pl-1 text-xs text-slate-800 dark:text-slate-200">
                {pesertaList.penganggaran.map((user) => (
                  <li key={user.id} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="font-bold">{user.nama}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{user.role}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tim Perencanaan (menggantikan Bappenas sesuai Panduan4) */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Tim Perencanaan</span>
                <span className="text-[10px] font-mono bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">
                  {pesertaList.perencanaan.length} Orang
                </span>
              </div>
              <ul className="space-y-2 pl-1 text-xs text-slate-800 dark:text-slate-200">
                {pesertaList.perencanaan.map((user) => (
                  <li key={user.id} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="font-bold">{user.nama}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{user.role}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Inspektorat (menggantikan K/L sesuai Panduan4) */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Inspektorat</span>
                <span className="text-[10px] font-mono bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">
                  {pesertaList.inspektorat.length} Orang
                </span>
              </div>
              <ul className="space-y-2 pl-1 text-xs text-slate-800 dark:text-slate-200">
                {pesertaList.inspektorat.map((user) => (
                  <li key={user.id} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="font-bold">{user.nama}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{user.role}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Unit Kerja (menggantikan Satuan Kerja sesuai Panduan4) */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Unit Kerja</span>
                <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                  {pesertaList.unitKerja.length} Orang
                </span>
              </div>
              <ul className="space-y-2 pl-1 text-xs text-slate-700 dark:text-slate-300">
                {pesertaList.unitKerja.map((user) => (
                  <li key={user.id} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="font-bold">{user.nama}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{user.role}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tombol Tambah User (Ditentukan oleh SuperAdmin dan BINCANG sesuai Panduan4) */}
            {canManageParticipants && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tambah User</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal Tambah User (Tipe User, User Name & Role User) ── */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Tambah User Forum Penelaahan</span>
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Tipe User yang akan ditambahkan dalam forum */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tipe User dalam Forum
                </label>
                <select
                  value={newUserCategory}
                  onChange={(e) =>
                    setNewUserCategory(
                      e.target.value as "Tim Perencanaan" | "Tim Penganggaran" | "Inspektorat" | "Unit Kerja"
                    )
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="Tim Perencanaan">Tim Perencanaan</option>
                  <option value="Tim Penganggaran">Tim Penganggaran</option>
                  <option value="Inspektorat">Inspektorat</option>
                  <option value="Unit Kerja">Unit Kerja</option>
                </select>
              </div>

              {/* User Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  User Name
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama user (contoh: AHMAD FAUZI, S.E.)"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Role User */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Role User
                </label>
                <input
                  type="text"
                  placeholder="Masukkan role user (contoh: Penelaah Anggaran Bidang SDM)"
                  value={newUserRoleDescription}
                  onChange={(e) => setNewUserRoleDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-3.5 py-2 text-xs font-medium rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleAddUser}
                disabled={!newUserName.trim() || !newUserRoleDescription.trim()}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
              >
                Simpan User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Cetak Catatan Penelaahan ── */}
      {showPrintCatatanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-rose-600" />
                <span>Cetak Lembar Catatan Hasil Penelaahan Anggaran</span>
              </h3>
              <button
                onClick={() => setShowPrintCatatanModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dokumen Lembar Catatan Siap Cetak */}
            <div className="space-y-6 p-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200">
              <div className="text-center border-b-2 border-slate-900 dark:border-slate-200 pb-4">
                <h3 className="font-bold text-base uppercase tracking-tight">
                  PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN
                </h3>
                <h4 className="font-bold text-sm uppercase mt-1">
                  LEMBAR CATATAN HASIL PENELAAHAN RENCANA KERJA DAN ANGGARAN
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-mono">
                  TAHUN ANGGARAN: {tahunAnggaran} • TAHAP: {tahap}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mt-0.5">
                  UNIT KERJA: {userUnit}
                </p>
              </div>

              {/* 1. Tim Penganggaran */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs uppercase bg-slate-100 dark:bg-slate-800 p-2 rounded">
                  I. CATATAN TIM PENGANGGARAN
                </h5>
                <div className="pl-3 space-y-2">
                  <div>
                    <span className="font-bold">A. CATATAN KHUSUS DAN/ATAU PENDING:</span>
                    <div
                      className="rich-text-content pl-3 pt-1 text-slate-700 dark:text-slate-300"
                      dangerouslySetInnerHTML={{ __html: catatanData.penganggaran.pending }}
                    />
                  </div>
                  <div>
                    <span className="font-bold">B. PENILAIAN / PENDAPAT PETUGAS:</span>
                    <div
                      className="rich-text-content pl-3 pt-1 text-slate-700 dark:text-slate-300"
                      dangerouslySetInnerHTML={{ __html: catatanData.penganggaran.pendapat }}
                    />
                  </div>
                  <div>
                    <span className="font-bold">C. ANGGARAN YANG DIBERIKAN TANDA &quot;@&quot; / BLOKIR:</span>
                    <div
                      className="rich-text-content pl-3 pt-1 text-slate-700 dark:text-slate-300"
                      dangerouslySetInnerHTML={{ __html: catatanData.penganggaran.blokir }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Tim Perencanaan */}
              <div className="space-y-3 pt-2">
                <h5 className="font-bold text-xs uppercase bg-slate-100 dark:bg-slate-800 p-2 rounded">
                  II. CATATAN TIM PERENCANAAN
                </h5>
                <div className="pl-3 space-y-2">
                  <div>
                    <span className="font-bold">A. CATATAN KHUSUS DAN/ATAU PENDING:</span>
                    <div
                      className="rich-text-content pl-3 pt-1 text-slate-700 dark:text-slate-300"
                      dangerouslySetInnerHTML={{ __html: catatanData.perencanaan.pending }}
                    />
                  </div>
                  <div>
                    <span className="font-bold">B. PENILAIAN / PENDAPAT PETUGAS:</span>
                    <div
                      className="rich-text-content pl-3 pt-1 text-slate-700 dark:text-slate-300"
                      dangerouslySetInnerHTML={{ __html: catatanData.perencanaan.pendapat }}
                    />
                  </div>
                  <div>
                    <span className="font-bold">C. ANGGARAN YANG DIBERIKAN TANDA &quot;@&quot; / BLOKIR:</span>
                    <div
                      className="rich-text-content pl-3 pt-1 text-slate-700 dark:text-slate-300"
                      dangerouslySetInnerHTML={{ __html: catatanData.perencanaan.blokir }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Inspektorat */}
              <div className="space-y-3 pt-2">
                <h5 className="font-bold text-xs uppercase bg-slate-100 dark:bg-slate-800 p-2 rounded">
                  III. CATATAN INSPEKTORAT
                </h5>
                <div className="pl-3 space-y-2">
                  <div>
                    <span className="font-bold">A. CATATAN KHUSUS DAN/ATAU PENDING:</span>
                    <div
                      className="rich-text-content pl-3 pt-1 text-slate-700 dark:text-slate-300"
                      dangerouslySetInnerHTML={{ __html: catatanData.inspektorat.pending }}
                    />
                  </div>
                  <div>
                    <span className="font-bold">B. PENILAIAN / PENDAPAT PETUGAS:</span>
                    <div
                      className="rich-text-content pl-3 pt-1 text-slate-700 dark:text-slate-300"
                      dangerouslySetInnerHTML={{ __html: catatanData.inspektorat.pendapat }}
                    />
                  </div>
                  <div>
                    <span className="font-bold">C. ANGGARAN YANG DIBERIKAN TANDA &quot;@&quot; / BLOKIR:</span>
                    <div
                      className="rich-text-content pl-3 pt-1 text-slate-700 dark:text-slate-300"
                      dangerouslySetInnerHTML={{ __html: catatanData.inspektorat.blokir }}
                    />
                  </div>
                </div>
              </div>

              {/* Penanda tangan Catatan Penelaahan */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <h5 className="font-bold text-xs uppercase mb-4 text-center">
                  PENANDA TANGAN CATATAN PENELAAHAN
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  {catatanData.penandatangan.map((ttd) => (
                    <div key={ttd.id} className="space-y-1">
                      <div className="font-semibold text-slate-600 dark:text-slate-400">
                        {ttd.jabatan}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">{ttd.instansi}</div>
                      <div className="h-16 flex items-center justify-center text-slate-300 text-[10px] italic">
                        (Tanda Tangan Elektronik)
                      </div>
                      <div className="font-bold underline">{ttd.nama}</div>
                      <div className="text-[11px] font-mono text-slate-500">NIP. {ttd.nip}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowPrintCatatanModal(false)}
                className="px-3.5 py-2 text-xs font-medium rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPrintCatatanModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Catatan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Cetak Forum: Menampilkan Draft Cetak Diskusi & Catatan Penelaahan (Panduan4) ── */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>Draft Cetak: Diskusi & Catatan Penelaahan</span>
              </h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Konten Risalah Draft Cetak */}
            <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-850/50 text-xs">
              <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                  BERITA ACARA & RISALAH FORUM PENELAAHAN ANGGARAN
                </h4>
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                  Unit Kerja: {userUnit} • {tahunAnggaran} • Tahap: {tahap}
                </p>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Daftar Catatan & Rekomendasi ({threads.length} Catatan):
                </div>

                {threads.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span className="text-indigo-600 dark:text-indigo-400">
                        #{t.id} {t.author} ({t.roleBadge})
                      </span>
                      <span className="text-slate-400 font-mono">{t.time}</span>
                    </div>
                    <div
                      className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]"
                      dangerouslySetInnerHTML={{ __html: t.content }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-3.5 py-2 text-xs font-medium rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal Konfirmasi Tutup Forum (BINCANG & Super Admin) ── */}
      {showTutupForumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tutup Forum Penelaahan?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kewenangan: {currentUserRole}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                Dengan menutup forum ini:
              </p>
              <ul className="list-disc list-inside space-y-1 font-medium text-slate-800 dark:text-slate-200">
                <li>Sistem secara otomatis akan <strong>menyelesaikan Tahap 3 (Penelaahan)</strong>.</li>
                <li>Status pada <strong>Monitoring Revisi</strong> akan diperbarui menjadi selesai dengan tanggal &amp; jam saat ini.</li>
                <li>Tahap selanjutnya (Tahap 4 - Penetapan) siap untuk diproses.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowTutupForumModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleTutupForum}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Ya, Tutup Forum &amp; Selesaikan Tahap 3</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
