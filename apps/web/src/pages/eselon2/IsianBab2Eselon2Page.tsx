import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Save,
  CheckCircle2,
  Package,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Info,
  Building2,
  Layers,
  Sparkles,
  Check,
  RotateCcw,
} from "lucide-react";
import RichTextEditor from "../../components/ui/RichTextEditor";
import informasiKinerjaData from "../../data/informasiKinerjaData.json";
import unitKerjaData from "../../data/unitKerjaData.json";

export interface PaketProkerE2 {
  id: string;
  ro_kode: string;
  ro_nama: string;
  nomenklatur: string;
  uraian: string;
  tujuan: string;
  tahapan: string;
  output: string;
  saved?: boolean;
}

export interface UnitRoInfo {
  ro_kode: string;
  ro_nama: string;
  kro: string;
  kegiatan: string;
  komponenList: string[];
}

function getActiveEselon2Unit() {
  let activeSatkerNama = "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme";
  try {
    const rawHistori = localStorage.getItem("renja_e2_active_histori");
    if (rawHistori) {
      const parsed = JSON.parse(rawHistori);
      if (parsed.kdsatker) activeSatkerNama = parsed.kdsatker;
    }
  } catch (e) {}

  const found = unitKerjaData.find(
    (u) => u.nama === activeSatkerNama || u.singkatan === activeSatkerNama
  );
  if (found) {
    return {
      singkatan: found.singkatan,
      nama: found.nama,
      labelFull: `${found.singkatan} — ${found.nama}`,
    };
  }
  return {
    singkatan: "PATIH",
    nama: activeSatkerNama,
    labelFull: `PATIH — ${activeSatkerNama}`,
  };
}

function getRoListForUnit(unitSingkatan: string): UnitRoInfo[] {
  const filtered = informasiKinerjaData.filter((d: any) => d.unitKerja === unitSingkatan);
  const roMap = new Map<string, UnitRoInfo>();

  filtered.forEach((row: any) => {
    const roFullName = row.ro;
    if (!roFullName) return;

    if (!roMap.has(roFullName)) {
      const parts = roFullName.split(" ");
      const roKode = parts.slice(0, 3).join(" ");
      const roNama = parts.slice(3).join(" ") || roFullName;

      roMap.set(roFullName, {
        ro_kode: roKode,
        ro_nama: roNama,
        kro: row.kro || "",
        kegiatan: row.kegiatan || "",
        komponenList: [],
      });
    }

    if (row.komponen) {
      const info = roMap.get(roFullName)!;
      if (!info.komponenList.includes(row.komponen)) {
        info.komponenList.push(row.komponen);
      }
    }
  });

  return Array.from(roMap.values());
}

export default function IsianBab2Eselon2Page() {
  const [activeUnit, setActiveUnit] = useState(() => getActiveEselon2Unit());
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);

  // Ambil daftar RO spesifik milik Unit Kerja aktif dari Referensi Informasi Kinerja
  const roListForUnit = useMemo(() => {
    return getRoListForUnit(activeUnit.singkatan);
  }, [activeUnit.singkatan]);

  const jumlahRoUnit = roListForUnit.length > 0 ? roListForUnit.length : 1;

  const [pengantarProkerText, setPengantarProkerText] = useState(
    "<p>Rencana Kerja Satker Eselon II Tahun 2027 memfokuskan pencapaian target Indikator Kinerja Kegiatan (IKK) melalui pelaksanaan paket rencana kerja prioritas berbasis Rincian Output (RO).</p>"
  );

  // Buat paket awal sesuai dengan RO yang dimiliki Unit Kerja
  function generateDefaultPaketList(ros: UnitRoInfo[]): PaketProkerE2[] {
    if (ros.length === 0) {
      return [
        {
          id: `pkt_1`,
          ro_kode: "RO.01",
          ro_nama: "Layanan Dukungan Operasional & Kinerja Satker",
          nomenklatur: "Paket Rencana Kerja Layanan Operasional & Kinerja",
          uraian: "<p>Ketik narasi uraian rencana kerja pelaksanaan tugas pokok dan fungsi satker...</p>",
          tujuan: "<p>Ketik tujuan strategis pencapaian target kinerja satker...</p>",
          tahapan: "<p>1. Tahap Perencanaan & Persiapan<br/>2. Tahap Pelaksanaan Teknis<br/>3. Tahap Monitoring & Evaluasi</p>",
          output: "<p>Ketik target keluaran / output spesifik yang dihasilkan...</p>",
          saved: false,
        },
      ];
    }

    return ros.map((roItem, idx) => ({
      id: `pkt_ro_${idx + 1}`,
      ro_kode: roItem.ro_kode,
      ro_nama: roItem.ro_nama,
      nomenklatur: `Paket Rencana Kerja: ${roItem.ro_nama}`,
      uraian: `<p>Pelaksanaan paket rencana kerja untuk mendukung pencapaian Rincian Output (RO) <strong>${roItem.ro_nama}</strong> pada Satker ${activeUnit.singkatan}. Paket ini mencakup koordinasi intensif, operasional teknis, serta pengelolaan ${roItem.komponenList.length} komponen penunjang.</p>`,
      tujuan: `<p>Mencapai target kinerja dan akuntabilitas output secara tepat waktu, efektif, dan efisien sesuai standar mutu PPATK.</p>`,
      tahapan: `<p>1. Persiapan dan penataan instrumen pelaksanaan kerja<br/>2. Penyelenggaraan kegiatan teknis dan pembinaan<br/>3. Evaluasi mutu layanan dan pelaporan akuntabilitas kinerja</p>`,
      output: `<p>Terlaksananya output ${roItem.ro_nama} dengan capaian 100% serta dokumen laporan pertanggungjawaban lengkap.</p>`,
      saved: false,
    }));
  }

  const [paketList, setPaketList] = useState<PaketProkerE2[]>(() => {
    try {
      const savedRaw = localStorage.getItem("renja_e2_bab2_data");
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed.unitSingkatan === activeUnit.singkatan && Array.isArray(parsed.paketList) && parsed.paketList.length > 0) {
          return parsed.paketList;
        }
      }
    } catch (e) {}
    return generateDefaultPaketList(roListForUnit);
  });

  const [activePaketIndex, setActivePaketIndex] = useState<number>(0);

  // Update paket list jika unit berganti di localStorage
  useEffect(() => {
    const currentActive = getActiveEselon2Unit();
    setActiveUnit(currentActive);
    const newRos = getRoListForUnit(currentActive.singkatan);
    setPaketList(generateDefaultPaketList(newRos));
    setActivePaketIndex(0);
  }, []);

  const currentPaket = paketList[activePaketIndex] || paketList[0];
  const currentRoInfo = roListForUnit[activePaketIndex];

  function handleUpdateCurrentPaket(field: keyof PaketProkerE2, value: string) {
    setPaketList((prev) =>
      prev.map((p, idx) => (idx === activePaketIndex ? { ...p, [field]: value, saved: false } : p))
    );
  }

  function handleSaveForm() {
    const updatedList = paketList.map((p, idx) =>
      idx === activePaketIndex ? { ...p, saved: true } : p
    );
    setPaketList(updatedList);

    const dataBab2E2 = {
      unitSingkatan: activeUnit.singkatan,
      unitNama: activeUnit.nama,
      pengantarProkerText,
      paketList: updatedList,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("renja_e2_bab2_data", JSON.stringify(dataBab2E2));
    setSavedSuccessAlert(true);
    setTimeout(() => setSavedSuccessAlert(false), 3000);
  }

  function handleResetToDefault() {
    if (confirm("Reset seluruh paket rencana kerja sesuai jumlah Rincian Output (RO) referensi Unit Kerja?")) {
      const resetList = generateDefaultPaketList(roListForUnit);
      setPaketList(resetList);
      setActivePaketIndex(0);
    }
  }

  return (
    <div className="min-h-full p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Banner Notification Save ── */}
      {savedSuccessAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-sm font-semibold flex items-center justify-between shadow-md animate-bounce">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Data Isian Bab II Renja Eselon II BERHASIL disimpan!</span>
          </div>
        </div>
      )}

      {/* ── Header Top Bar ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 shadow-sm font-bold">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary text-[0.65rem] font-bold">RENJA ESELON II</span>
              <span className="text-xs text-[var(--text-muted)] font-mono">/eselon2/bab-2</span>
            </div>
            <h1 className="text-lg font-bold text-[var(--text)]">Isian Bab II — Renja Eselon II</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Rencana Kerja & Rincian Paket Program Kerja Satker Berbasis Rincian Output (RO).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefault}
            className="px-3.5 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-[var(--text)] rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[var(--border)] transition-all cursor-pointer"
            title="Sinkronkan ulang jumlah paket dengan data Rincian Output (RO) referensi"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            <span>Sinkronkan RO</span>
          </button>

          <button
            onClick={handleSaveForm}
            className="px-5 py-2 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Isian Bab II</span>
          </button>
        </div>
      </div>

      {/* ── Banner Informasi Unit Kerja & Alokasi Paket Rencana Kerja (RO) ── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                Unit Kerja: {activeUnit.labelFull}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                Pilih Histori Aktif
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Alokasi paket rencana kerja disesuaikan secara otomatis dengan jumlah Rincian Output (RO) yang dimiliki oleh unit kerja ini.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 bg-[var(--card)] px-4 py-2.5 rounded-xl border border-[var(--border)] shadow-sm">
          <Layers className="h-4 w-4 text-purple-600" />
          <div className="text-left">
            <span className="text-[0.65rem] uppercase font-bold text-[var(--text-muted)] block leading-tight">
              Ketersediaan Paket
            </span>
            <span className="text-xs font-bold text-[var(--text)]">
              <strong className="text-purple-600 text-sm font-black font-mono">{jumlahRoUnit}</strong> Paket Rencana Kerja ({jumlahRoUnit} RO)
            </span>
          </div>
        </div>
      </div>

      {/* ── Bagian 1: Pengantar Program Kerja Satker ── */}
      <div className="aksi-card p-6 bg-[var(--card)] border border-[var(--border)] space-y-4">
        <h2 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--primary)]" />
          Bagian 1: Pengantar Program Kerja Satker Eselon II
        </h2>
        <div>
          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
            Narasi Pengantar Program Kerja Satker TA 2027:
          </label>
          <RichTextEditor
            value={pengantarProkerText}
            onChange={setPengantarProkerText}
            placeholder="Ketik narasi pengantar program kerja..."
          />
        </div>
      </div>

      {/* ── Bagian 2: Paket Rencana Kerja Satker (Sesuai Jumlah RO Unit Kerja) ── */}
      <div className="aksi-card p-6 bg-[var(--card)] border border-[var(--border)] space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
              <Package className="h-4 w-4 text-indigo-600" />
              Bagian 2: Rincian Paket Rencana Kerja Satker Eselon II ({paketList.length} Paket)
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Tiap paket rencana kerja terdiri dari isian narasi <strong>Uraian</strong>, <strong>Tujuan</strong>, <strong>Tahapan</strong>, dan <strong>Output</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newIdx = paketList.length + 1;
                const newPaket: PaketProkerE2 = {
                  id: `pkt_custom_${Date.now()}`,
                  ro_kode: `RO-Kustom-${newIdx}`,
                  ro_nama: `Rencana Kerja Tambahan ${newIdx}`,
                  nomenklatur: `Paket Rencana Kerja Tambahan ${newIdx}`,
                  uraian: "<p>Ketik narasi uraian rencana kerja...</p>",
                  tujuan: "<p>Ketik tujuan rencana kerja...</p>",
                  tahapan: "<p>1. Tahap Persiapan<br/>2. Tahap Pelaksanaan<br/>3. Tahap Evaluasi</p>",
                  output: "<p>Ketik keluaran/output yang dihasilkan...</p>",
                  saved: false,
                };
                setPaketList([...paketList, newPaket]);
                setActivePaketIndex(paketList.length);
              }}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Paket Kustom</span>
            </button>
          </div>
        </div>

        {/* ── Navigasi Tab / Paging Paket Rencana Kerja ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {paketList.map((pkt, idx) => {
              const isActive = idx === activePaketIndex;
              const roSource = roListForUnit[idx];

              return (
                <button
                  key={pkt.id}
                  onClick={() => setActivePaketIndex(idx)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                    isActive
                      ? "bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-500/20"
                      : "bg-[var(--accent)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--accent)]/80"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.65rem] font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-black/10 dark:bg-white/10 text-[var(--text-muted)]"
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="text-left">
                    <span className="block truncate max-w-[180px]">
                      {pkt.ro_kode ? `[${pkt.ro_kode}]` : `Paket ${idx + 1}`}
                    </span>
                  </div>
                  {pkt.saved && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-300" : "bg-emerald-500"}`} title="Tersimpan" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Pagination Bar */}
          <div className="flex items-center justify-between bg-[var(--accent)]/50 p-3 rounded-xl border border-[var(--border)]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePaketIndex(Math.max(0, activePaketIndex - 1))}
                disabled={activePaketIndex === 0}
                className="p-1.5 rounded-lg border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--card)] cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-[var(--text)] font-mono">
                Paket {activePaketIndex + 1} dari {paketList.length} Paket Rencana Kerja
              </span>
              <button
                onClick={() => setActivePaketIndex(Math.min(paketList.length - 1, activePaketIndex + 1))}
                disabled={activePaketIndex === paketList.length - 1}
                className="p-1.5 rounded-lg border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--card)] cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {currentPaket?.saved ? (
                <span className="text-[0.68rem] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Tersimpan
                </span>
              ) : (
                <span className="text-[0.68rem] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-800">
                  Belum Disimpan
                </span>
              )}

              {paketList.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm("Hapus paket rencana kerja ini?")) {
                      const updated = paketList.filter((_, idx) => idx !== activePaketIndex);
                      setPaketList(updated);
                      setActivePaketIndex(Math.max(0, activePaketIndex - 1));
                    }
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Form Isian Paket Aktif (Uraian, Tujuan, Tahapan, Output) ── */}
        {currentPaket && (
          <div className="space-y-5 pt-2 border-t border-[var(--border)]">
            {/* Header Info Paket & RO Terkait */}
            <div className="p-3.5 rounded-xl bg-[var(--accent)]/30 border border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <div>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-purple-600 block">
                  Rincian Output (RO) Terkait:
                </span>
                <span className="text-xs font-bold text-[var(--text)]">
                  {currentRoInfo
                    ? `${currentRoInfo.ro_kode} — ${currentRoInfo.ro_nama}`
                    : currentPaket.ro_nama || currentPaket.nomenklatur}
                </span>
                {currentRoInfo?.kro && (
                  <span className="text-[0.7rem] text-[var(--text-muted)] block mt-0.5">
                    KRO: {currentRoInfo.kro}
                  </span>
                )}
              </div>

              {currentRoInfo?.komponenList && currentRoInfo.komponenList.length > 0 && (
                <div className="text-right">
                  <span className="text-[0.65rem] font-bold text-[var(--text-muted)] block">
                    Komponen Penunjang:
                  </span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {currentRoInfo.komponenList.length} Komponen
                  </span>
                </div>
              )}
            </div>

            {/* Field Nomenklatur Paket */}
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                Nomenklatur / Judul Paket Rencana Kerja:
              </label>
              <input
                type="text"
                value={currentPaket.nomenklatur}
                onChange={(e) => handleUpdateCurrentPaket("nomenklatur", e.target.value)}
                placeholder="Ketik judul/nomenklatur paket rencana kerja..."
                className="w-full bg-[var(--accent)]/40 border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text)] font-bold focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
              />
            </div>

            {/* 4 Box Isian Narasi: Uraian, Tujuan, Tahapan, Output */}
            <div className="space-y-4">
              {/* 1. Uraian */}
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                  1. Uraian Paket Rencana Kerja:
                </label>
                <RichTextEditor
                  value={currentPaket.uraian}
                  onChange={(val) => handleUpdateCurrentPaket("uraian", val)}
                  placeholder="Ketik narasi uraian paket rencana kerja..."
                  minHeight="120px"
                />
              </div>

              {/* 2. Tujuan */}
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                  2. Tujuan Paket Rencana Kerja:
                </label>
                <RichTextEditor
                  value={currentPaket.tujuan}
                  onChange={(val) => handleUpdateCurrentPaket("tujuan", val)}
                  placeholder="Ketik tujuan pelaksanaan paket rencana kerja..."
                  minHeight="120px"
                />
              </div>

              {/* 3. Tahapan */}
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                  3. Tahapan Pelaksanaan Paket Rencana Kerja:
                </label>
                <RichTextEditor
                  value={currentPaket.tahapan}
                  onChange={(val) => handleUpdateCurrentPaket("tahapan", val)}
                  placeholder="Ketik rincian tahapan pelaksanaan paket rencana kerja..."
                  minHeight="120px"
                />
              </div>

              {/* 4. Output */}
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                  4. Output / Keluaran yang Dihasilkan:
                </label>
                <RichTextEditor
                  value={currentPaket.output}
                  onChange={(val) => handleUpdateCurrentPaket("output", val)}
                  placeholder="Ketik target output / keluaran yang dihasilkan..."
                  minHeight="120px"
                />
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
              <div>
                {activePaketIndex > 0 ? (
                  <button
                    onClick={() => setActivePaketIndex(activePaketIndex - 1)}
                    className="px-4 py-2 border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] text-[var(--text)] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Sebelumnya (Paket {activePaketIndex})</span>
                  </button>
                ) : <div />}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveForm}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan Paket Ini</span>
                </button>

                {activePaketIndex < paketList.length - 1 && (
                  <button
                    onClick={() => setActivePaketIndex(activePaketIndex + 1)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Selanjutnya (Paket {activePaketIndex + 2})</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
