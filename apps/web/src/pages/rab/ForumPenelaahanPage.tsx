import React, { useState } from "react";
import {
  MessageSquare,
  FileText,
  History,
  GitCompare,
  BarChart3,
  CheckCircle2,
  Printer,
  UserPlus,
  Send,
  CornerDownRight,
  ChevronDown,
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
} from "lucide-react";

interface CommentThread {
  id: number;
  author: string;
  authorRole: "DJA" | "Bappenas" | "PPATK";
  authorId: string;
  roleBadge: string;
  time: string;
  content: string;
  replyTo?: {
    id: number;
    author: string;
    contentSummary?: string;
  };
}

export default function ForumPenelaahanPage() {
  // State Filter & Status
  const [tahunAnggaran] = useState<string>("2026");
  const [tahap, setTahap] = useState<string>("Alokasi Anggaran");
  const isClosed = true;

  // Active shortcut tab/modal
  const [activeTab, setActiveTab] = useState<
    "forum" | "dokumen" | "history" | "sanding_data" | "sanding_tpnbp" | "ssb" | "catatan"
  >("forum");

  // Modal State
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [newUserRole, setNewUserRole] = useState<string>("Kementerian/Lembaga");
  const [newUserName, setNewUserName] = useState<string>("");
  const [newUserEmail, setNewUserEmail] = useState<string>("");

  // Peserta list
  const [pesertaList, setPesertaList] = useState({
    dja: ["SUKRASNO", "FAUZI SYAMSURI"],
    bappenas: ["NOOR ANDRINI WURYANDARI"],
    kl: [
      "PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN (PPATK)",
      "BIRO PERENCANAAN PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN (PPATK)",
      "Pusat Pelaporan dan Analisis Transaksi Keuangan",
    ],
    satker: ["OPERATOR SATKER PUSAT (453374)", "PEJABAT PEMBUAT KOMITMEN (PPK)"],
  });

  // Threads list (mirip data asli dari screenshot SAKTI penelaahan PPATK)
  const [threads, setThreads] = useState<CommentThread[]>([
    {
      id: 16,
      author: "SUKRASNO",
      authorRole: "DJA",
      authorId: "aprdja_630931_197701012000011001",
      roleBadge: "DJA",
      time: "Kamis, 16 Oktober 2025 09:15 WIB",
      content:
        "Selamat pagi Bapak/Ibu Penelaah dari Bappenas dan PPATK.\n\nBerdasarkan data RKAKL PPATK 2026 yang diupload di forum ini, terpantau masih terdapat 3 KRO yang belum memenuhi kriteria SSB (Standar Struktur Biaya) dimana komponen pendukungnya melebihi % threshold batas kewajaran. Mohon tanggapan dan penyesuaian pada KRO terkait.",
    },
    {
      id: 17,
      author: "KAMANTO PUJIONO",
      authorRole: "PPATK",
      authorId: "ppatk_198205142006041002",
      roleBadge: "PPATK (Biro Perencanaan)",
      time: "Kamis, 16 Oktober 2025 11:42 WIB",
      replyTo: {
        id: 16,
        author: "SUKRASNO",
        contentSummary: "Selamat pagi Bapak/Ibu Penelaah...",
      },
      content:
        "Yth. Tim Penelaah DJA & Bappenas,\n\nTerima kasih atas catatan telaahnya. Kami telah melakukan relokasi akun belanja pendukung ke komponen utama pada Program 078.01.BE (Pencegahan & Pemberantasan TPPU) serta memperbarui rincian kertas kerja konsinyering dan perjalanan dinas. Mohon berkenan diteliti kembali.",
    },
    {
      id: 18,
      author: "SUKRASNO",
      authorRole: "DJA",
      authorId: "aprdja_630931_197701012000011001",
      roleBadge: "DJA",
      time: "Kamis, 16 Oktober 2025 02:43 PM WIB",
      replyTo: {
        id: 17,
        author: "KAMANTO PUJIONO",
      },
      content:
        "Terima kasih Pak. Alhamdulillah seluruh KRO PPATK pada data RKAKL 2026 telah memenuhi kriteria SSB (tidak ada yang merah).\n\nSekali lagi terima kasih atas kerjasamanya.",
    },
  ]);

  // Reply / New Comment form state
  const [replyingTo, setReplyingTo] = useState<CommentThread | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  const handleSendComment = () => {
    if (!newCommentText.trim()) return;

    const nextId = threads.length > 0 ? Math.max(...threads.map((t) => t.id)) + 1 : 1;
    const now = new Date();
    const timeStr = `${now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;

    const newThread: CommentThread = {
      id: nextId,
      author: "ISNEN HADI",
      authorRole: "PPATK",
      authorId: "ppatk_317410_operator_453374",
      roleBadge: "PPATK (Operator)",
      time: timeStr,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            author: replyingTo.author,
            contentSummary: replyingTo.content.substring(0, 45) + "...",
          }
        : undefined,
      content: newCommentText.trim(),
    };

    setThreads((prev) => [...prev, newThread]);
    setNewCommentText("");
    setReplyingTo(null);
  };

  const handleAddUser = () => {
    if (!newUserName.trim()) return;
    if (newUserRole === "DJA") {
      setPesertaList((prev) => ({ ...prev, dja: [...prev.dja, newUserName.toUpperCase()] }));
    } else if (newUserRole === "Bappenas") {
      setPesertaList((prev) => ({ ...prev, bappenas: [...prev.bappenas, newUserName.toUpperCase()] }));
    } else if (newUserRole === "Satuan Kerja") {
      setPesertaList((prev) => ({ ...prev, satker: [...prev.satker, newUserName.toUpperCase()] }));
    } else {
      setPesertaList((prev) => ({ ...prev, kl: [...prev.kl, newUserName.toUpperCase()] }));
    }
    setNewUserName("");
    setNewUserEmail("");
    setShowAddUserModal(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Alert Banner / Title ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 sm:p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 mt-0.5">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Forum Penelaahan 078.01
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tahap Alokasi Anggaran Sudah Di Close
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Tahun Anggaran {tahunAnggaran}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Forum interaksi penelaahan rencana kerja anggaran bersama Tim Penelaah DJA, Bappenas, dan Biro Perencanaan PPATK
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Cetak Forum</span>
            </button>
          </div>
        </div>

        {/* ── Filter Form Fields (Header SAKTI Style) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          {/* Tahun Anggaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Tahun Anggaran
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={tahunAnggaran}
                className="w-full text-sm font-semibold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Tahap */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Tahap
            </label>
            <div className="relative">
              <select
                value={tahap}
                onChange={(e) => setTahap(e.target.value)}
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              >
                <option value="Pagu Indikatif">Pagu Indikatif</option>
                <option value="Pagu Anggaran">Pagu Anggaran</option>
                <option value="Alokasi Anggaran">Alokasi Anggaran</option>
                <option value="DIPA Petikan">DIPA Petikan / Revisi</option>
              </select>
            </div>
          </div>

          {/* K/L */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Kementerian / Lembaga (K/L)
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-sm font-bold rounded-xl border border-indigo-200 dark:border-indigo-800">
                078.01
              </span>
              <input
                type="text"
                readOnly
                value="Pusat Pelaporan dan Analisis Transaksi Keuangan"
                className="w-full text-sm font-medium px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 truncate cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Ringkasan Pagu & Program (Sesuai Data SAKTI PPATK 078.01) ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Alokasi Program & Kinerja Belanja
            </h2>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Total Pagu Alokasi: <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">Rp 333.577.080.000</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/75 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Kode & Uraian Program</th>
                <th className="px-5 py-3 text-right">Rupiah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-slate-800 dark:text-slate-100">
                    078.01.BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="inline-flex items-center gap-1 font-mono">2 Satker</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono">7 Kegiatan</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono">16 KRO</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono">33 RO</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                  82.095.202.000
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-slate-800 dark:text-slate-100">
                    078.01.WA - Program Dukungan Manajemen
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="inline-flex items-center gap-1 font-mono">2 Satker</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono">5 Kegiatan</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono">9 KRO</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono">17 RO</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                  251.481.878.000
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Shortcut Toolbar / Tabs Action ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          onClick={() => setActiveTab(activeTab === "dokumen" ? "forum" : "dokumen")}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
            activeTab === "dokumen"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
          }`}
        >
          <FileText className="w-4 h-4 text-blue-500" />
          <span>Dokumen</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === "history" ? "forum" : "history")}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
            activeTab === "history"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
          }`}
        >
          <History className="w-4 h-4 text-cyan-500" />
          <span>History</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === "sanding_data" ? "forum" : "sanding_data")}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
            activeTab === "sanding_data"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
          }`}
        >
          <GitCompare className="w-4 h-4 text-emerald-500" />
          <span>Sanding Data</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === "sanding_tpnbp" ? "forum" : "sanding_tpnbp")}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
            activeTab === "sanding_tpnbp"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-violet-500" />
          <span>Sanding TPNBP</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === "ssb" ? "forum" : "ssb")}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
            activeTab === "ssb"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>SSB (Standar Biaya)</span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === "catatan" ? "forum" : "catatan")}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
            activeTab === "catatan"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-rose-500" />
          <span>Catatan Penelaahan</span>
        </button>
      </div>

      {/* ── Tab Content Overlay / Panel jika salah satu tab aktif selain forum utama ── */}
      {activeTab === "dokumen" && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Dokumen Pendukung Penelaahan
            </h3>
            <button
              onClick={() => setActiveTab("forum")}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ✕ Tutup Panel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200">Surat Pengantar Telaah</div>
              <div className="text-slate-500 mt-1">SPT-PPATK-TA2026.pdf (1.2 MB)</div>
              <span className="inline-block mt-2 text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">Terverifikasi</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200">Kertas Kerja Rincian KAK/TOR</div>
              <div className="text-slate-500 mt-1">KAK_Konsinyering_Perjadin_2026.xlsx (3.8 MB)</div>
              <span className="inline-block mt-2 text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">Terverifikasi</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200">ADK RKAKL 2026 Final</div>
              <div className="text-slate-500 mt-1">ADK_07801_Alokasi2026.zip (5.4 MB)</div>
              <span className="inline-block mt-2 text-[10px] text-indigo-600 font-semibold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">Sinkron SAKTI</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ssb" && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Monitoring Kriteria Standar Struktur Biaya (SSB)
            </h3>
            <button
              onClick={() => setActiveTab("forum")}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ✕ Tutup Panel
            </button>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Hasil Pengecekan Sistem Otomatis:</span>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full font-bold">100% Memenuhi Kriteria (Hijau)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Seluruh 25 KRO pada Program BE dan WA telah dicek terhadap proporsi Belanja Komponen Utama vs Pendukung (Honor, Perjadin, Paket Meeting/Konsinyering). Tidak ada peringatan batas merah (melebihi standar SSB DJA).
            </p>
          </div>
        </div>
      )}

      {activeTab === "sanding_data" && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-emerald-600" />
              Sanding Data: Pagu Indikatif vs Pagu Anggaran vs Alokasi
            </h3>
            <button
              onClick={() => setActiveTab("forum")}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ✕ Tutup Panel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-slate-400 uppercase text-[10px] font-bold">1. Pagu Indikatif</div>
              <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">Rp 310.250.000.000</div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-slate-400 uppercase text-[10px] font-bold">2. Pagu Anggaran</div>
              <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">Rp 328.700.500.000</div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20">
              <div className="text-emerald-600 dark:text-emerald-400 uppercase text-[10px] font-bold">3. Alokasi Anggaran (Final)</div>
              <div className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1">Rp 333.577.080.000</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout: Chat / Forum Feed (75%) & Peserta Penelaahan Sidebar (25%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Forum Feed & Reply Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
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
                const isDja = thread.authorRole === "DJA";
                const isBappenas = thread.authorRole === "Bappenas";

                return (
                  <div
                    key={thread.id}
                    className={`rounded-2xl border p-4.5 sm:p-5 transition-all ${
                      isDja
                        ? "border-blue-100 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/10"
                        : isBappenas
                        ? "border-amber-100 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10"
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
                            isDja
                              ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              : isBappenas
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
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

                    {/* Isi Pesan */}
                    <div className="mt-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                      {thread.content}
                    </div>

                    {/* Tombol Balas */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
                      <button
                        onClick={() => {
                          setReplyingTo(thread);
                          const el = document.getElementById("reply-editor");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form Balasan / Pesan Baru */}
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
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Tulis catatan penelaahan atau tanggapan..."
                  className="w-full text-sm p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 resize-y"
                />

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    Gunakan forum ini untuk koordinasi penelaahan dokumen anggaran PPATK bersama DJA & Bappenas.
                  </p>
                  <button
                    onClick={handleSendComment}
                    disabled={!newCommentText.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Pesan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Peserta Penelaahan */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Peserta Penelaahan
              </h3>
            </div>

            {/* Direktorat Jenderal Anggaran (DJA) */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Direktorat Jendral Anggaran</span>
                <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                  {pesertaList.dja.length} Orang
                </span>
              </div>
              <ul className="space-y-1.5 pl-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                {pesertaList.dja.map((user, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{user}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bappenas */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Bappenas</span>
                <span className="text-[10px] font-mono bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">
                  {pesertaList.bappenas.length} Orang
                </span>
              </div>
              <ul className="space-y-1.5 pl-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                {pesertaList.bappenas.map((user, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{user}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kementerian / Lembaga */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Kementerian/Lembaga</span>
                <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                  PPATK
                </span>
              </div>
              <ul className="space-y-2 pl-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                {pesertaList.kl.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />
                    <span className="leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Satuan Kerja */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Satuan Kerja</span>
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                  Satker
                </span>
              </div>
              <ul className="space-y-1.5 pl-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                {pesertaList.satker.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tombol Tambah User */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Tambah User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Tambah User ── */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                Tambah Peserta Penelaahan
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Kategori Instansi
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="Direktorat Jendral Anggaran">Direktorat Jendral Anggaran (DJA)</option>
                  <option value="Bappenas">Bappenas</option>
                  <option value="Kementerian/Lembaga">Kementerian/Lembaga (PPATK)</option>
                  <option value="Satuan Kerja">Satuan Kerja</option>
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
                  placeholder="budi@kemenkeu.go.id"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-3.5 py-2 text-xs font-medium rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddUser}
                disabled={!newUserName.trim()}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Simpan Peserta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Cetak Forum ── */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                Cetak Transkrip Forum Penelaahan
              </h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                Transkrip akan mengekspor seluruh catatan dan risalah forum penelaahan tahap <strong>{tahap}</strong> TA {tahunAnggaran} K/L 078.01 (PPATK) dalam format Berita Acara Penelaahan (BAP) resmi.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 font-mono text-[11px]">
                <div>• Format: Berita Acara Penelaahan (PDF)</div>
                <div>• Total Thread: {threads.length} Catatan</div>
                <div>• Status Kriteria SSB: Memenuhi</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-3.5 py-2 text-xs font-medium rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
