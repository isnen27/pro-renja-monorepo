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
  FolderKanban,
  Coins,
  Paperclip,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Layers,
} from "lucide-react";
import unitKerjaData from "../../data/unitKerjaData.json";
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

  // Tahap sesuai Panduan4:
  // Pagu Indikatif, Pagu Anggaran, Alokasi ANggaran, DIPA Awal, Usulan Revisi DIPA, Usulan Revisi POK
  const [tahap, setTahap] = useState<string>("Alokasi Anggaran");

  // Unit kerja user sesuai Panduan4:
  // "sistem akan menunjukkan Unit Kerja user sesuai data pada submenu Unit Kerja PPATK tanpa nomor/kode unit kerja,
  // untuk role Super Admin, unit kerjanya PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN"
  const [userUnit, setUserUnit] = useState<string>(() => {
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
    return found ? found.singkatan : "HUKER";
  }, [userUnit]);

  // Tombol yang tersedia di atas Diskusi: Dokumen, Sanding Data, Catatan Penelaahan (Panduan4)
  const [activeTab, setActiveTab] = useState<"forum" | "dokumen" | "sanding_data" | "catatan">("forum");

  // Modal State
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [newUserRole, setNewUserRole] = useState<string>("Unit Kerja");
  const [newUserName, setNewUserName] = useState<string>("");
  const [newUserEmail, setNewUserEmail] = useState<string>("");

  // Peserta Penelaahan Sesuai Panduan4:
  // - Tim Penganggaran (menggantikan DJA)
  // - Tim Perencanaan (menggantikan Bappenas)
  // - Inspektorat (menggantikan K/L)
  // - Unit Kerja (menggantikan Satuan Kerja)
  // Hanya role SuperAdmin dan BINCANG yang dapat menentukan / tambah user
  const canManageParticipants = currentUserRole === "Super Admin" || currentUserRole === "BINCANG";

  const [pesertaList, setPesertaList] = useState({
    penganggaran: ["SUKRASNO (Ketua Tim)", "FAUZI SYAMSURI"],
    perencanaan: ["NOOR ANDRINI WURYANDARI", "TIM PERENCANAAN BIRO REN"],
    inspektorat: ["INSPEKTUR PPATK", "AUDITOR MADYA PENELAAH"],
    unitKerja: ["OPERATOR SATKER PUSAT (453374)", "PEJABAT PEMBUAT KOMITMEN (PPK)"],
  });

  // Alokasi Program & Kinerja Belanja diambil dari hasil input data pada submenu Isian RAB (Panduan4)
  const [worksheetRows, setWorksheetRows] = useState<WorksheetRow[]>([]);
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({
    "078.01.BE": true,
    "078.01.WA": false,
  });
  const [expandedKro, setExpandedKro] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`rab_worksheet_${ukSingkatan}`);
      if (saved) {
        setWorksheetRows(JSON.parse(saved));
      }
    } catch (e) {}
  }, [ukSingkatan]);

  // Hitung total dari worksheet Isian RAB
  const totalPaguDetail = useMemo(() => {
    const details = worksheetRows.filter((r) => r.type === "detail");
    if (details.length > 0) {
      return details.reduce((sum, r) => sum + (Number(r.jumlah) || 0), 0);
    }
    const progs = worksheetRows.filter((r) => r.type === "program");
    if (progs.length > 0) {
      return progs.reduce((sum, r) => sum + (Number(r.jumlah) || 0), 0);
    }
    return 333577080000; // default nominal
  }, [worksheetRows]);

  // Breakdown program s.d RO
  const programBreakdown = useMemo(() => {
    const programs = worksheetRows.filter((r) => r.type === "program");
    if (programs.length > 0) {
      return programs.map((p) => {
        const progKode = p.kode || "";
        const kros = worksheetRows.filter((r) => r.type === "kro");
        const ros = worksheetRows.filter((r) => r.type === "ro");
        return {
          kode: progKode,
          uraian: p.uraian,
          jumlah: Number(p.jumlah) || 0,
          kroList: kros.map((k) => ({
            kode: k.kode,
            uraian: k.uraian,
            jumlah: Number(k.jumlah) || 0,
            roList: ros.filter((ro) => (ro.kode || "").startsWith(k.kode?.slice(0, 4) || "---")),
          })),
        };
      });
    }

    // Default structure jika belum ada custom worksheet
    return [
      {
        kode: "078.01.BE",
        uraian: "Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
        jumlah: 82095202000,
        kroCount: 16,
        roCount: 33,
        satkerCount: 2,
        kegiatanCount: 7,
      },
      {
        kode: "078.01.WA",
        uraian: "Program Dukungan Manajemen",
        jumlah: 251481878000,
        kroCount: 9,
        roCount: 17,
        satkerCount: 2,
        kegiatanCount: 5,
      },
    ];
  }, [worksheetRows]);

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
  const [editorContent, setEditorContent] = useState<string>("");
  const [commentAttachments, setCommentAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const executeCommand = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
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

  const handleAddUser = () => {
    if (!newUserName.trim()) return;
    if (newUserRole === "Tim Penganggaran") {
      setPesertaList((prev) => ({ ...prev, penganggaran: [...prev.penganggaran, newUserName.toUpperCase()] }));
    } else if (newUserRole === "Tim Perencanaan") {
      setPesertaList((prev) => ({ ...prev, perencanaan: [...prev.perencanaan, newUserName.toUpperCase()] }));
    } else if (newUserRole === "Inspektorat") {
      setPesertaList((prev) => ({ ...prev, inspektorat: [...prev.inspektorat, newUserName.toUpperCase()] }));
    } else {
      setPesertaList((prev) => ({ ...prev, unitKerja: [...prev.unitKerja, newUserName.toUpperCase()] }));
    }
    setNewUserName("");
    setNewUserEmail("");
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

          {/* Tahap Sesuai Panduan4:
              Pagu Indikatif, Pagu Anggaran, Alokasi ANggaran, DIPA Awal, Usulan Revisi DIPA, Usulan Revisi POK */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Tahap
            </label>
            <select
              value={tahap}
              onChange={(e) => setTahap(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            >
              <option value="Pagu Indikatif">Pagu Indikatif</option>
              <option value="Pagu Anggaran">Pagu Anggaran</option>
              <option value="Alokasi Anggaran">Alokasi Anggaran</option>
              <option value="DIPA Awal">DIPA Awal</option>
              <option value="Usulan Revisi DIPA">Usulan Revisi DIPA</option>
              <option value="Usulan Revisi POK">Usulan Revisi POK</option>
            </select>
          </div>

          {/* Baris Kementerian / Lembaga (K/L) diganti dengan 'Unit Kerja' sesuai Panduan4 tanpa nomor/kode unit kerja */}
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
              Alokasi Program & Kinerja Belanja (Hasil Isian RAB)
            </h2>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Total Pagu Belanja:{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              Rp {totalPaguDetail.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Tabel Hierarki: Program s.d RO (Panduan4) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100/75 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Kode & Uraian Program / KRO / RO</th>
                <th className="px-5 py-3 text-right">Pagu Rupiah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {programBreakdown.map((prog: any, pIdx: number) => {
                const isProgExpanded = expandedPrograms[prog.kode] ?? true;
                return (
                  <React.Fragment key={pIdx}>
                    {/* Level Program */}
                    <tr
                      onClick={() =>
                        setExpandedPrograms((prev) => ({
                          ...prev,
                          [prog.kode]: !isProgExpanded,
                        }))
                      }
                      className="bg-indigo-50/20 dark:bg-indigo-950/20 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/40 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                          {isProgExpanded ? (
                            <ChevronDown className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          )}
                          <span>
                            {prog.kode} - {prog.uraian}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 pl-6">
                          <span>{prog.satkerCount || 2} Satker</span>
                          <span>•</span>
                          <span>{prog.kegiatanCount || 7} Kegiatan</span>
                          <span>•</span>
                          <span>{prog.kroCount || 16} KRO</span>
                          <span>•</span>
                          <span>{prog.roCount || 33} RO</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100 align-top">
                        Rp {prog.jumlah.toLocaleString("id-ID")}
                      </td>
                    </tr>

                    {/* Level KRO & RO Breakdown jika expanded */}
                    {isProgExpanded && prog.kroList && (
                      <>
                        {prog.kroList.map((kro: any, kIdx: number) => {
                          const isKroExpanded = expandedKro[kro.kode] ?? false;
                          return (
                            <React.Fragment key={kIdx}>
                              <tr
                                onClick={() =>
                                  setExpandedKro((prev) => ({
                                    ...prev,
                                    [kro.kode]: !isKroExpanded,
                                  }))
                                }
                                className="bg-slate-50/50 dark:bg-slate-850/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                              >
                                <td className="px-5 py-2 pl-10 font-semibold text-slate-800 dark:text-slate-200">
                                  <div className="flex items-center gap-1.5">
                                    {isKroExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
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
                              {isKroExpanded && kro.roList && (
                                <>
                                  {kro.roList.map((ro: any, rIdx: number) => (
                                    <tr
                                      key={rIdx}
                                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-[11px]"
                                    >
                                      <td className="px-5 py-1.5 pl-16 text-slate-600 dark:text-slate-400">
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
                                </>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Shortcut Toolbar: Dokumen, Sanding Data, Catatan Penelaahan (Panduan4) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <span>Sanding Data (Histori Terakhir vs Sebelumnya)</span>
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

      {/* ── Panel Sanding Data (Total Pagu Histori Terakhir vs Sebelumnya sesuai Panduan4) ── */}
      {activeTab === "sanding_data" && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-emerald-600" />
              <span>Sanding Data: Total Pagu Antara Histori Terakhir dengan Histori Sebelumnya</span>
            </h3>
            <button
              onClick={() => setActiveTab("forum")}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕ Tutup Panel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                1. Histori Sebelumnya (Rev-0 Pagu Anggaran)
              </span>
              <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
                Rp 328.700.500.000
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Status: Disahkan DJA</div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/10 text-xs">
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                2. Histori Terakhir ({tahap})
              </span>
              <div className="text-lg font-bold font-mono text-indigo-700 dark:text-indigo-300 mt-1">
                Rp {totalPaguDetail.toLocaleString("id-ID")}
              </div>
              <div className="text-[11px] text-indigo-600/80 mt-1">Status: Data Final Isian RAB</div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/10 text-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                3. Selisih / Delta Perubahan
              </span>
              <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1">
                + Rp {(totalPaguDetail - 328700500000).toLocaleString("id-ID")}
              </div>
              <div className="text-[11px] text-emerald-600/80 mt-1">Penyesuaian Alokasi Belanja Prioritas</div>
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

                    {/* Isi Pesan (Render HTML / Text) */}
                    <div
                      className="mt-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line"
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

            {/* Input Form Balasan / Pesan Baru dengan Editing Toolbar & Upload Dokumen (Panduan4) */}
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
                {/* Toolbar Editing Sesuai Form Gambaran Umum Bab I (Panduan4) */}
                <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex-wrap">
                  <button
                    type="button"
                    onClick={() => executeCommand("bold")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand("italic")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand("underline")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Underline"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                  <button
                    type="button"
                    onClick={() => executeCommand("insertUnorderedList")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand("insertOrderedList")}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                  {/* Tombol Upload Dokumen Bersamaan (Panduan4) */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer"
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
                  className="p-3.5 min-h-[90px] text-sm text-slate-800 dark:text-slate-200 outline-none focus:outline-none"
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
              <ul className="space-y-1.5 pl-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                {pesertaList.penganggaran.map((user, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{user}</span>
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
              <ul className="space-y-1.5 pl-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                {pesertaList.perencanaan.map((user, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{user}</span>
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
              <ul className="space-y-1.5 pl-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                {pesertaList.inspektorat.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span className="leading-tight">{item}</span>
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
              <ul className="space-y-1.5 pl-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                {pesertaList.unitKerja.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>{item}</span>
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
                  <span>+ Tambah User</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal Tambah User (Super Admin & BINCANG) ── */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Tambah Peserta Penelaahan</span>
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Kategori Instansi / Tim (Panduan4)
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="Tim Penganggaran">Tim Penganggaran</option>
                  <option value="Tim Perencanaan">Tim Perencanaan</option>
                  <option value="Inspektorat">Inspektorat</option>
                  <option value="Unit Kerja">Unit Kerja</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nama Pejabat / Penelaah
                </label>
                <input
                  type="text"
                  placeholder="Contoh: BUDI SANTOSO"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email / NIP (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="budi@ppatk.go.id"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
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
                disabled={!newUserName.trim()}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Simpan Peserta
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
    </div>
  );
}
