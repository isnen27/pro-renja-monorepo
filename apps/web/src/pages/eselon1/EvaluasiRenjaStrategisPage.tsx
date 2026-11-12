import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FileCheck2,
  Cpu,
  Bot,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Info,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Building2,
  Save,
  HelpCircle,
  ExternalLink,
  Sliders,
  Check,
  FileText,
  Search,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Copy,
  Printer,
  FileDown,
} from "lucide-react";
import {
  KERANGKA_EVALUASI_RENJA_STRATEGIS,
  DimensiEvaluasi,
  SubDimensiEvaluasi,
} from "../../data/kerangkaEvaluasiRenjaData";
import {
  LocalAiConfig,
  DEFAULT_LOCAL_AI_CONFIG,
  getLocalAiConfig,
  saveLocalAiConfig,
  runLocalAiEvaluation,
  AiEvaluationResponse,
} from "../../services/localAiEvaluationService";
import {
  DOKUMEN_RENJA_ESELON1_DATA,
  DokumenRenjaEselon1Item,
} from "../../data/dokumenRenjaEselon1Data";
import unitKerjaData from "../../data/unitKerjaData.json";

interface EvaluasiItemState {
  skor: number; // 1 to 5
  catatan: string;
  kutipanEviden?: string;
  rekomendasi?: string;
}

export default function EvaluasiRenjaStrategisPage() {
  // Unit kerja Eselon I yang dievaluasi
  const eselon1Options = useMemo(() => [
    { kode: "SETIA", nama: "Sekretariat Utama" },
    { kode: "TEGAS", nama: "Deputi Bidang Strategi dan Kerja Sama" },
    { kode: "PENGASUH", nama: "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan" },
    { kode: "ASA", nama: "Deputi Bidang Analisis Transaksi Keuangan" },
  ], []);

  const [selectedEselon1, setSelectedEselon1] = useState<string>("SETIA");
  const [tahunAnggaran] = useState<number>(2027);

  // State nilai skoring per subDimensiId (e.g. "1.1": { skor: 4, catatan: "..." })
  const storageKey = `evaluasi_renja_eselon1_${selectedEselon1}_${tahunAnggaran}`;

  const [scores, setScores] = useState<Record<string, EvaluasiItemState>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default initial empty scores (skor 0 = belum dinilai)
    const init: Record<string, EvaluasiItemState> = {};
    KERANGKA_EVALUASI_RENJA_STRATEGIS.forEach((d) => {
      d.subDimensi.forEach((s) => {
        init[s.id] = { skor: 0, catatan: "" };
      });
    });
    return init;
  });

  // Reload when unit changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setScores(JSON.parse(saved));
        return;
      }
    } catch (e) {}
    const init: Record<string, EvaluasiItemState> = {};
    KERANGKA_EVALUASI_RENJA_STRATEGIS.forEach((d) => {
      d.subDimensi.forEach((s) => {
        init[s.id] = { skor: 0, catatan: "" };
      });
    });
    setScores(init);
  }, [selectedEselon1, storageKey]);

  // Local AI Configuration Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [aiConfig, setAiConfig] = useState<LocalAiConfig>(getLocalAiConfig());
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);

  // State Dokumen Viewer Panel
  const [showDocPanel, setShowDocPanel] = useState<boolean>(true);
  const [docSearchQuery, setDocSearchQuery] = useState<string>("");
  const [highlightKeyword, setHighlightKeyword] = useState<string>("");
  const docScrollRef = useRef<HTMLDivElement>(null);

  // State Tab Dimensi Aktif (Scroll / Tab Samping pada Lembar Kerja)
  // 0 = Tampilkan Semua (dengan card horizontal scrollable), 1..6 = Tampilkan Dimensi Tertentu
  const [activeDimensiTab, setActiveDimensiTab] = useState<number>(0);
  const dimensiScrollRef = useRef<HTMLDivElement>(null);

  // Data Dokumen Renja Unit Terpilih
  const activeDocument: DokumenRenjaEselon1Item = useMemo(() => {
    return DOKUMEN_RENJA_ESELON1_DATA[selectedEselon1] || {
      unit: selectedEselon1,
      kode: selectedEselon1,
      nomorDoc: `Renja-${selectedEselon1}-2027`,
      fileName: `Draft_Renja_${selectedEselon1}_Signed.pdf`,
      tanggalSubmit: "05 Oktober 2026",
      statusDokumen: "Dokumen Terunggah Resmi",
      fullText: "Dokumen Renja lengkap belum tersedia untuk unit kerja ini.",
    };
  }, [selectedEselon1]);

  const showNotification = (msg: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Kalkulasi Skor per Dimensi & Total
  const { rekapPerDimensi, totalSkorSkala5, totalSkorSkala100, isAllComplete } = useMemo(() => {
    let grandWeightedSum = 0;
    let allComplete = true;

    const rekap = KERANGKA_EVALUASI_RENJA_STRATEGIS.map((dim) => {
      let subWeightedSum = 0;
      let dimComplete = true;

      dim.subDimensi.forEach((sub) => {
        const item = scores[sub.id];
        const val = item?.skor || 0;
        if (val === 0) {
          dimComplete = false;
          allComplete = false;
        }
        subWeightedSum += val * sub.bobot;
      });

      const dimContribution = subWeightedSum * dim.bobot;
      grandWeightedSum += dimContribution;

      return {
        dimensiId: dim.id,
        nama: dim.nama,
        bobotDimensi: dim.bobot,
        skorDimensi: subWeightedSum,
        kontribusi: dimContribution,
        isComplete: dimComplete,
      };
    });

    const skala100 = (grandWeightedSum / 5) * 100;

    return {
      rekapPerDimensi: rekap,
      totalSkorSkala5: grandWeightedSum,
      totalSkorSkala100: skala100,
      isAllComplete: allComplete,
    };
  }, [scores]);

  // Handler ubah skor manual
  const handleScoreChange = (subId: string, newScore: number) => {
    setScores((prev) => ({
      ...prev,
      [subId]: {
        ...(prev[subId] || { catatan: "" }),
        skor: newScore,
      },
    }));
  };

  // Handler ubah catatan manual
  const handleCatatanChange = (subId: string, newCatatan: string) => {
    setScores((prev) => ({
      ...prev,
      [subId]: {
        ...(prev[subId] || { skor: 0 }),
        catatan: newCatatan,
      },
    }));
  };

  // Simpan evaluasi ke localStorage
  const handleSaveEvaluation = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(scores));
      showNotification(`Evaluasi Renja ${selectedEselon1} Tahun ${tahunAnggaran} berhasil disimpan!`, "success");
    } catch (e) {
      showNotification("Gagal menyimpan hasil evaluasi.", "error");
    }
  };

  // Simpan pengaturan AI
  const handleSaveConfig = () => {
    saveLocalAiConfig(aiConfig);
    setShowConfigModal(false);
    showNotification("Pengaturan koneksi Local AI Agent berhasil diperbarui!", "success");
  };

  // Trigger Evaluasi Menggunakan Local AI Agent
  const handleTriggerLocalAi = async () => {
    setIsAiRunning(true);
    setAiStatusMsg("Mempersiapkan dokumen dan prompt evaluasi...");

    try {
      // Ambil teks dokumen Renja lengkap dari unit kerja yang sedang dievaluasi
      const docToAnalyze = activeDocument.fullText && activeDocument.fullText.length > 50
        ? activeDocument.fullText
        : `RENCANA KERJA UNIT ${selectedEselon1} TAHUN ANGGARAN ${tahunAnggaran}...`;

      const aiResult: AiEvaluationResponse = await runLocalAiEvaluation(
        docToAnalyze,
        selectedEselon1,
        (status) => setAiStatusMsg(status)
      );

      // Sinkronkan hasil AI ke lembar kerja
      setScores((prev) => {
        const next = { ...prev };
        aiResult.hasilPerSubDimensi.forEach((res) => {
          next[res.subDimensiId] = {
            skor: res.skor,
            catatan: res.justifikasi,
            kutipanEviden: res.kutipanEviden,
            rekomendasi: res.rekomendasiPerbaikan,
          };
        });
        return next;
      });

      showNotification(
        `AI Agent Lokal berhasil mengevaluasi dokumen Renja ${selectedEselon1}! Skor: ${aiResult.skorTotalSkala100.toFixed(1)}/100. Silakan verifikasi dan sesuaikan skor bila diperlukan.`,
        "success"
      );
    } catch (err: any) {
      showNotification(`Gagal menjalankan Local AI Agent: ${err.message}`, "error");
    } finally {
      setIsAiRunning(false);
      setAiStatusMsg("");
    }
  };

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* ── Top Header & Breadcrumb ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Perencanaan &amp; Kinerja</span>
            <span>/</span>
            <Link to="/eselon1/bab-2" className="hover:underline">Renja Eselon I</Link>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Evaluasi Renja Eselon I</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <FileCheck2 className="h-6 w-6 text-indigo-600" />
            <span>Evaluasi Renja Eselon I (Tingkat Strategis)</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Kerangka analitis evaluasi dokumen Renja Eselon I berbasis 6 Dimensi &amp; 15 Sub-Dimensi dengan dukungan Local AI Agent (Offline/On-Premise).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Panel Dokumen */}
          <button
            type="button"
            onClick={() => setShowDocPanel(!showDocPanel)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold shadow-xs cursor-pointer transition-colors ${
              showDocPanel
                ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            }`}
            title="Tampilkan / Sembunyikan Dokumen Renja Sumber di Samping Lembar Kerja"
          >
            {showDocPanel ? <PanelLeftClose className="w-4 h-4 text-indigo-600" /> : <PanelLeftOpen className="w-4 h-4 text-slate-500" />}
            <span>{showDocPanel ? "Sembunyikan Dokumen" : "Lihat Dokumen Sumber"}</span>
          </button>

          {/* Tombol Pengaturan Local AI */}
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer transition-colors"
            title="Konfigurasi Endpoint & Model Local AI Agent"
          >
            <Settings2 className="w-4 h-4 text-slate-500" />
            <span>Setup Local AI</span>
          </button>

          {/* Tombol Jalankan Analisis AI Lokal */}
          <button
            type="button"
            disabled={isAiRunning}
            onClick={handleTriggerLocalAi}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer transition-all ${
              isAiRunning
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-98"
            }`}
            title="Jalankan AI Agent Lokal untuk menilai otomatis dokumen Renja ini"
          >
            {isAiRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Bot className="w-4 h-4 text-indigo-200" />
            )}
            <span>{isAiRunning ? "AI Sedang Menilai..." : "Analisis AI Agent Lokal"}</span>
          </button>

          {/* Tombol Simpan Evaluasi */}
          <button
            type="button"
            onClick={handleSaveEvaluation}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Evaluasi</span>
          </button>
        </div>
      </div>

      {/* ── Notification Feedback Alert ── */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : notification.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
              : "bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.msg}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100 cursor-pointer">✕</button>
        </div>
      )}

      {/* AI Processing Status Banner */}
      {isAiRunning && (
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-3 animate-pulse">
          <Cpu className="w-5 h-5 text-indigo-600 shrink-0 animate-spin" />
          <div className="space-y-0.5">
            <span className="font-bold">Local AI Agent sedang bekerja secara offline (tanpa koneksi internet)...</span>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300">{aiStatusMsg}</p>
          </div>
        </div>
      )}

      {/* ── FILTER & SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Card Pemilih Unit Eselon I */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--border)] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unit Kerja Eselon I:</span>
          <select
            value={selectedEselon1}
            onChange={(e) => setSelectedEselon1(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {eselon1Options.map((opt) => (
              <option key={opt.kode} value={opt.kode}>
                {opt.kode} - {opt.nama}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400">Tahun Anggaran Evaluasi: {tahunAnggaran}</p>
        </div>

        {/* Skor Skala 1-5 */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
            Skor Tertimbang (Skala 1 - 5):
          </span>
          <div className="text-2xl font-black text-indigo-600 font-mono">
            {totalSkorSkala5.toFixed(2)} <span className="text-xs font-semibold text-slate-500">/ 5.00</span>
          </div>
          <p className="text-[10px] text-slate-500">Weighted Average dari 6 Dimensi</p>
        </div>

        {/* Skor Konversi Skala 0-100 */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Nilai Akhir (Skala 0 - 100):
          </span>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {totalSkorSkala100.toFixed(1)} <span className="text-xs font-semibold text-slate-500">/ 100</span>
          </div>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
            {totalSkorSkala100 >= 85 ? "SANGAT BAIK" : totalSkorSkala100 >= 65 ? "BAIK / MEMADAI" : "PERLU PERBAIKAN"}
          </span>
        </div>

        {/* Status Mode AI Agent */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>Engine Evaluator:</span>
          </span>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pt-1">
            {aiConfig.protocol.toUpperCase()} ({aiConfig.modelName})
          </div>
          <p className="text-[10px] text-emerald-600 font-medium">
            ● Siap di-embed model lokal (Offline On-Premise)
          </p>
        </div>
      </div>

      {/* ── SPLIT VIEW: DOKUMEN SUMBER & LEMBAR KERJA EVALUASI ── */}
      <div className={`grid grid-cols-1 ${showDocPanel ? "xl:grid-cols-12" : "grid-cols-1"} gap-6 items-start`}>
        {/* PANEL KIRI: VIEWER DOKUMEN RENJA LENGKAP UNIT KERJA */}
        {showDocPanel && (
          <div className="xl:col-span-5 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden flex flex-col xl:sticky xl:top-6 xl:max-h-[calc(100vh-3.5rem)]">
            {/* Header Viewer */}
            <div className="p-4 bg-slate-900 text-white flex flex-col gap-2.5 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-xs tracking-wide">Dokumen Renja Resmi Unit Kerja</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDocPanel(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Tutup Panel Dokumen"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              {/* Info Dokumen Terpilih */}
              <div className="bg-slate-800/80 rounded-xl p-2.5 space-y-1 text-xs border border-slate-700/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-indigo-300 truncate max-w-[240px]">{activeDocument.unit}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {activeDocument.kode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate flex items-center gap-1 font-mono">
                    <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{activeDocument.fileName}</span>
                  </span>
                  <span>{activeDocument.tanggalSubmit}</span>
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-0.5 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{activeDocument.statusDokumen}</span>
                </div>
              </div>

              {/* Search Bar Kata Kunci Eviden dalam Dokumen */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                  placeholder="Cari narasi / kata kunci eviden (misal: SAKIP, risiko, audit, target)..."
                  className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {docSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDocSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Tag Bab / Kata Kunci Populer */}
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px]">
              <span className="text-slate-400 font-bold uppercase shrink-0">Lompat Kata:</span>
              {[
                "BAB I",
                "BAB II",
                "Program Prioritas",
                "Indikator Kinerja",
                "Risiko",
                "Audit",
                "Monev",
                "SAKIP",
              ].map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => setDocSearchQuery(keyword)}
                  className={`px-2 py-0.5 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                    docSearchQuery.toLowerCase() === keyword.toLowerCase()
                      ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {keyword}
                </button>
              ))}
            </div>

            {/* Isi Dokumen Scrollable */}
            <div
              ref={docScrollRef}
              className="p-5 overflow-y-auto space-y-4 font-serif text-xs leading-relaxed text-slate-800 dark:text-slate-200 flex-1 max-h-[600px] xl:max-h-none select-text"
            >
              {activeDocument.fullText ? (
                activeDocument.fullText
                  .split(/\n\n+/)
                  .filter((p) => p.trim().length > 0)
                  .map((paragraph, pIdx) => {
                    const isHeading =
                      paragraph.startsWith("BAB ") ||
                      paragraph.startsWith("RENCANA KERJA") ||
                      paragraph.match(/^[A-Z]\.\s+[A-Z\s]+$/) ||
                      paragraph.match(/^[0-9]+\.\s+[A-Z\s]+$/);

                    // Pengecekan Highlight pencarian
                    const matchQuery =
                      docSearchQuery.trim() !== "" &&
                      paragraph.toLowerCase().includes(docSearchQuery.toLowerCase().trim());

                    if (isHeading) {
                      return (
                        <h4
                          key={pIdx}
                          className={`font-sans font-bold text-sm tracking-wide pt-3 pb-1 border-b ${
                            matchQuery
                              ? "bg-amber-100 dark:bg-amber-900/40 text-indigo-900 dark:text-indigo-200 border-indigo-400 px-2 rounded"
                              : "text-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          {paragraph}
                        </h4>
                      );
                    }

                    return (
                      <p
                        key={pIdx}
                        className={`text-justify indent-6 ${
                          matchQuery
                            ? "bg-amber-100/80 dark:bg-amber-900/30 p-2 rounded-lg border-l-4 border-amber-500 font-sans"
                            : ""
                        }`}
                      >
                        {paragraph}
                      </p>
                    );
                  })
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p>Teks dokumen belum tersedia.</p>
                </div>
              )}
            </div>

            {/* Footer Panel Dokumen */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500 font-sans">
              <span>{activeDocument.fullText ? `${activeDocument.fullText.split(/\s+/).length.toLocaleString()} kata teks lengkap` : "0 kata"}</span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                Gunakan narasi di atas untuk mengoreksi skor &amp; eviden AI
              </span>
            </div>
          </div>
        )}

        {/* PANEL KANAN: LEMBAR KERJA EVALUASI RENJA STRATEGIS */}
        <div className={`${showDocPanel ? "xl:col-span-7" : "col-span-1"} space-y-5`}>
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>Lembar Kerja Evaluasi Renja Strategis</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nilai setiap sub-dimensi pada skala 1-5 (1-2: Lemah/Gap Signifikan, 3: Memadai, 4-5: Kuat/Komprehensif). Kolom skor tertimbang dihitung otomatis.
                </p>
              </div>

              {/* Status Kelengkapan Lembar Kerja */}
              <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                  isAllComplete
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                }`}>
                  {isAllComplete ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>15/15 Sub-Dimensi Lengkap</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Sebagian Belum Dinilai</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* NAVIGASI SCROLL / TAB SAMPING PER DIMENSI */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pilih Dimensi (Scroll Samping):</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {activeDimensiTab === 0
                    ? "Menampilkan Semua Dimensi (6 Dimensi)"
                    : `Fokus Dimensi ke-${activeDimensiTab} dari 6`}
                </span>
              </div>

              {/* Scroll Container Horizontal */}
              <div
                ref={dimensiScrollRef}
                className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth"
              >
                {/* Opsi Tampilkan Semua */}
                <button
                  type="button"
                  onClick={() => setActiveDimensiTab(0)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    activeDimensiTab === 0
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750"
                  }`}
                >
                  <span>Semua Dimensi</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                    activeDimensiTab === 0 ? "bg-indigo-700 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}>
                    15 Sub
                  </span>
                </button>

                {/* 6 Tombol Dimensi */}
                {KERANGKA_EVALUASI_RENJA_STRATEGIS.map((dim) => {
                  const dimRekap = rekapPerDimensi.find((r) => r.dimensiId === dim.id);
                  const isSelected = activeDimensiTab === dim.id;

                  return (
                    <button
                      key={dim.id}
                      type="button"
                      onClick={() => setActiveDimensiTab(dim.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750"
                      }`}
                      title={dim.nama}
                    >
                      <span>{dim.nama}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        isSelected
                          ? "bg-indigo-700 text-white font-bold"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}>
                        {dimRekap?.skorDimensi.toFixed(2) || "0.00"} / 5
                      </span>
                      {dimRekap?.isComplete && (
                        <Check className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-300" : "text-emerald-600"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DAFTAR KARTU DIMENSI (DIFILTER BERDASARKAN TAB AKTIF) */}
            <div className="space-y-6">
              {KERANGKA_EVALUASI_RENJA_STRATEGIS
                .filter((dim) => activeDimensiTab === 0 || dim.id === activeDimensiTab)
                .map((dim) => {
                const dimRekap = rekapPerDimensi.find((r) => r.dimensiId === dim.id);

                return (
                  <div key={dim.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs animate-in fade-in">
                    {/* Header Dimensi */}
                    <div className="bg-[#1e588a] text-white p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs sm:text-sm tracking-wide">{dim.nama}</span>
                        <span className="block text-[11px] text-blue-100 font-light">{dim.deskripsi}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                        <span className="bg-blue-900/60 px-2.5 py-1 rounded-lg">Bobot Dimensi: {(dim.bobot * 100).toFixed(0)}%</span>
                        <span className="bg-white/10 px-2.5 py-1 rounded-lg font-bold">
                          Skor Dimensi: {dimRekap?.skorDimensi.toFixed(2) || "0.00"} / 5
                        </span>
                      </div>
                    </div>

                    {/* Sub-Dimensi Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                            <th className="py-2.5 px-3 w-12 text-center">NO</th>
                            <th className="py-2.5 px-3 min-w-[240px]">SUB-DIMENSI &amp; KRITERIA PENILAIAN</th>
                            <th className="py-2.5 px-3 w-20 text-center">BOBOT SUB</th>
                            <th className="py-2.5 px-3 w-36 text-center">SKOR (1 - 5)</th>
                            <th className="py-2.5 px-3 w-24 text-right">TERTIMBANG</th>
                            <th className="py-2.5 px-3 min-w-[280px]">CATATAN ANALISIS &amp; BUKTI EVIDEN</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-sans">
                          {dim.subDimensi.map((sub, idx) => {
                            const itemState = scores[sub.id] || { skor: 0, catatan: "" };
                            const subWeighted = (itemState.skor || 0) * sub.bobot;

                            return (
                              <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="p-3 font-mono text-center font-bold text-slate-500 align-top">
                                  {sub.id}
                                </td>

                                <td className="p-3 align-top space-y-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{sub.nama}</span>
                                    {showDocPanel && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const term = sub.jenisBukti.split(/[,;]/)[0]?.trim() || sub.nama.split(" ")[1];
                                          setDocSearchQuery(term);
                                        }}
                                        className="text-[9px] font-semibold text-indigo-600 hover:text-indigo-800 underline shrink-0 cursor-pointer"
                                        title={`Cari referensi '${sub.jenisBukti.split(/[,;]/)[0]}' di dokumen`}
                                      >
                                        Telusuri Dokumen
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{sub.definisi}</p>
                                  <div className="pt-1 text-[10px] space-y-0.5 text-slate-500">
                                    <span className="block font-medium text-slate-600 dark:text-slate-400">Bukti: {sub.jenisBukti}</span>
                                    <span className="block text-emerald-700 dark:text-emerald-400 font-medium">✓ Indikasi Tinggi: {sub.indikasiTinggi}</span>
                                  </div>
                                </td>

                                <td className="p-3 text-center font-mono font-semibold text-slate-600 dark:text-slate-400 align-top">
                                  {(sub.bobot * 100).toFixed(0)}%
                                </td>

                                {/* Pilihan Skor 1 - 5 */}
                                <td className="p-3 align-top text-center">
                                  <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-600 p-0.5 bg-slate-50 dark:bg-slate-800">
                                    {[1, 2, 3, 4, 5].map((val) => {
                                      const isSelected = itemState.skor === val;
                                      return (
                                        <button
                                          key={val}
                                          type="button"
                                          onClick={() => handleScoreChange(sub.id, val)}
                                          className={`w-6 sm:w-7 h-7 rounded text-xs font-bold transition-all cursor-pointer ${
                                            isSelected
                                              ? val >= 4
                                                ? "bg-emerald-600 text-white shadow-xs"
                                                : val === 3
                                                ? "bg-amber-500 text-white shadow-xs"
                                                : "bg-rose-600 text-white shadow-xs"
                                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                          }`}
                                          title={`Beri Skor ${val}`}
                                        >
                                          {val}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <span className="block text-[10px] text-slate-400 font-mono mt-1">
                                    {itemState.skor > 0 ? `Skor: ${itemState.skor}` : "(Belum)"}
                                  </span>
                                </td>

                                <td className="p-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 align-top">
                                  {subWeighted.toFixed(2)}
                                </td>

                                {/* Catatan Analisis & Eviden */}
                                <td className="p-3 align-top space-y-2">
                                  <textarea
                                    value={itemState.catatan}
                                    onChange={(e) => handleCatatanChange(sub.id, e.target.value)}
                                    placeholder="Masukkan catatan temuan analisis atau dasar penetapan skor..."
                                    rows={2}
                                    className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner resize-y"
                                  />
                                  {itemState.kutipanEviden && (
                                    <div className="p-2 rounded bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[10px] text-indigo-900 dark:text-indigo-200 space-y-0.5">
                                      <span className="font-bold flex items-center justify-between">
                                        <span className="flex items-center gap-1">
                                          <Sparkles className="w-3 h-3 text-indigo-600" />
                                          <span>Kutipan Eviden Dokumen:</span>
                                        </span>
                                        {showDocPanel && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const snippet = itemState.kutipanEviden?.split(/\s+/).slice(0, 4).join(" ") || "";
                                              setDocSearchQuery(snippet);
                                            }}
                                            className="text-[9px] text-indigo-600 underline font-normal cursor-pointer"
                                            title="Sorot kutipan ini di dokumen"
                                          >
                                            Sorot di Dokumen
                                          </button>
                                        )}
                                      </span>
                                      <p className="italic">"{itemState.kutipanEviden}"</p>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL SETUP / EMBEDDING LOCAL AI AGENT ── */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Konfigurasi Local AI Agent (On-Premise / Offline)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 space-y-1">
                <span className="font-bold block">Infrastruktur AI Offline Tanpa Internet:</span>
                <p className="text-[11px] leading-relaxed">
                  Infrastruktur ini disiapkan agar Anda dapat menghubungkan server inferensi model AI yang Anda training sendiri di server lokal kantor (misalnya menggunakan <strong>Ollama</strong>, <strong>vLLM</strong>, <strong>LM Studio</strong>, atau <strong>Llama.cpp</strong>) tanpa mengirim data Renja ke luar jaringan internet.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Protokol Komunikasi:</label>
                <select
                  value={aiConfig.protocol}
                  onChange={(e) => setAiConfig({ ...aiConfig, protocol: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="mock">Simulasi Terpadu (In-Memory Engine)</option>
                  <option value="ollama">Ollama REST API (/api/generate)</option>
                  <option value="openai-compatible">OpenAI-Compatible Local Endpoint (vLLM / LM Studio / LocalAI)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Endpoint URL Server Lokal:</label>
                <input
                  type="text"
                  value={aiConfig.endpoint}
                  onChange={(e) => setAiConfig({ ...aiConfig, endpoint: e.target.value })}
                  placeholder="http://localhost:11434/api/generate"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">Contoh: http://localhost:11434/api/generate atau http://192.168.1.100:8000/v1/chat/completions</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nama Model AI (Fine-tuned Model):</label>
                <input
                  type="text"
                  value={aiConfig.modelName}
                  onChange={(e) => setAiConfig({ ...aiConfig, modelName: e.target.value })}
                  placeholder="renja-evaluator-local"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Temperature (Tingkat Ketepatan):</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={aiConfig.temperature}
                  onChange={(e) => setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) || 0.2 })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">Rekomendasi: 0.1 - 0.2 untuk evaluasi analitis yang konsisten.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
