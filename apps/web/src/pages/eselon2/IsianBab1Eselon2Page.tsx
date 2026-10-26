import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Save,
  CheckCircle2,
  Building2,
  Sparkles,
  Layers,
  Target,
  BarChart3,
  Compass,
  AlertTriangle,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import RichTextEditor from "../../components/ui/RichTextEditor";
import rawRekapRenjaAll from "../../data/rekapSasaranRenjaAllData.json";
import unitKerjaData from "../../data/unitKerjaData.json";

type SubmenuBab1 = "gambaran-umum" | "capaian-kinerja" | "arah-kebijakan" | "analisis-situasi";

export interface CapaianRow {
  id: string;
  sasaranKegiatan: string;
  ikk: string;
  tahun: number;
  target: number | string;
  capaianOutputPct: number;
  capaianAnggaranPct: number;
}

export type LevelKinerja =
  | "Sasaran Strategis"
  | "Sasaran Program"
  | "Sasaran Kegiatan"
  | "Indikator Kinerja Kegiatan";

export interface TargetKinerjaOption {
  level: LevelKinerja;
  kode: string;
  nama: string;
  target: string;
  satuan: string;
}

interface TargetRow {
  id: string;
  kode: string;
  level: LevelKinerja;
  sasaran_indikator: string;
  targetT1: string | number;
  satuan?: string;
}

const KEGIATAN_UNIT_MAP: Record<string, string[]> = {
  "3365": ["PATIH"],
  "3374": ["PEKA"],
  "3375": ["BINCANG"],
  "3376": ["BERMAKNA"],
  "3377": ["BIRU"],
  "3379": ["KREASI"],
  "3380": ["SALAM", "SERASI", "BERMAKNA"],
  "3381": ["LOGIS"],
  "3382": ["REKAN", "PENJAGA", "PATUH"],
  "3384": ["SIASAT", "SIDIK", "SIAGA", "SALAM"],
  "8003": ["KREASI", "BERMITRA"],
  "8004": ["BERMITRA", "BIRU"],
};

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

function getReferensiCapaianForUnit(unitSingkatan: string) {
  return rawRekapRenjaAll
    .filter((row: any) => {
      if (row.type !== "SASARAN_KEGIATAN") return false;
      const kegCode = row.kegiatan?.split(" ")[0];
      const units = KEGIATAN_UNIT_MAP[kegCode] || [];
      return units.includes(unitSingkatan);
    })
    .map((row: any, idx: number) => ({
      id: `ref_${idx}`,
      sasaranKegiatan: row.sasaran_kro || "",
      ikk: row.indikator || "",
      tahun: 2025,
      target: row.target?.["2025"] || row.target?.["2026"] || "100",
      satuan: row.satuan || "",
    }));
}

function getReferensiTargetKinerjaForUnit(unitSingkatan: string): Record<LevelKinerja, TargetKinerjaOption[]> {
  const kegCodes = Object.keys(KEGIATAN_UNIT_MAP).filter((code) =>
    KEGIATAN_UNIT_MAP[code]?.includes(unitSingkatan)
  );

  const programs = new Set<string>();
  rawRekapRenjaAll.forEach((r: any) => {
    const kc = r.kegiatan?.split(" ")[0];
    if (kegCodes.includes(kc)) {
      const pc = r.program?.split(" ")[0];
      if (pc) programs.add(pc);
    }
  });

  // 1. Sasaran Strategis (SS)
  const ssList: TargetKinerjaOption[] = [];
  if (programs.has("BE") || programs.size === 0) {
    ssList.push({
      level: "Sasaran Strategis",
      kode: "SS.01",
      nama: "01 - Meningkatnya Efektivitas Kinerja PPATK dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM",
      target: "4",
      satuan: "Indeks",
    });
  }
  if (programs.has("WA") || programs.size === 0) {
    ssList.push({
      level: "Sasaran Strategis",
      kode: "SS.02",
      nama: "02 - Meningkatnya Kinerja Revitalisasi Birokrasi PPATK (Dukungan Manajemen)",
      target: "85,5",
      satuan: "Nilai",
    });
  }

  // 2. Sasaran Program (SP)
  const spList: TargetKinerjaOption[] = [];
  const spSeen = new Set<string>();
  rawRekapRenjaAll.forEach((r: any) => {
    if (r.type === "SASARAN_PROGRAM") {
      const pc = r.program?.split(" ")[0];
      if (programs.has(pc) || programs.size === 0) {
        const name = r.sasaran_kro || "";
        if (name && !spSeen.has(name)) {
          spSeen.add(name);
          spList.push({
            level: "Sasaran Program",
            kode: `SP.${String(spList.length + 1).padStart(2, "0")}`,
            nama: name,
            target: r.target?.["2027"] || r.target?.["2026"] || "4",
            satuan: r.satuan || "Indeks",
          });
        }
      }
    }
  });
  if (programs.has("WA") && spList.length === 0) {
    spList.push({
      level: "Sasaran Program",
      kode: "SP.WA",
      nama: "01 - Meningkatnya Tata Kelola Internal dan Kinerja Birokrasi PPATK",
      target: "85,5",
      satuan: "Nilai",
    });
  }

  // 3. Sasaran Kegiatan (SK)
  const skList: TargetKinerjaOption[] = [];
  const skSeen = new Set<string>();
  rawRekapRenjaAll.forEach((r: any) => {
    if (r.type === "SASARAN_KEGIATAN") {
      const kc = r.kegiatan?.split(" ")[0];
      if (kegCodes.includes(kc)) {
        const name = r.sasaran_kro || "";
        if (name && !skSeen.has(name)) {
          skSeen.add(name);
          skList.push({
            level: "Sasaran Kegiatan",
            kode: `SK.${String(skList.length + 1).padStart(2, "0")}`,
            nama: name,
            target: r.target?.["2027"] || r.target?.["2026"] || "100",
            satuan: r.satuan || "",
          });
        }
      }
    }
  });

  // 4. Indikator Kinerja Kegiatan (IKK)
  const ikkList: TargetKinerjaOption[] = [];
  const ikkSeen = new Set<string>();
  rawRekapRenjaAll.forEach((r: any) => {
    if (r.type === "SASARAN_KEGIATAN") {
      const kc = r.kegiatan?.split(" ")[0];
      if (kegCodes.includes(kc)) {
        const name = r.indikator || "";
        if (name && !ikkSeen.has(name)) {
          ikkSeen.add(name);
          ikkList.push({
            level: "Indikator Kinerja Kegiatan",
            kode: `IKK.${String(ikkList.length + 1).padStart(2, "0")}`,
            nama: name,
            target: r.target?.["2027"] || r.target?.["2026"] || "100",
            satuan: r.satuan || "",
          });
        }
      }
    }
  });
  // Tambahkan juga output KRO_RO sebagai IKK tambahan jika relevan
  rawRekapRenjaAll.forEach((r: any) => {
    if (r.type === "KRO_RO") {
      const kc = r.kegiatan?.split(" ")[0];
      if (kegCodes.includes(kc)) {
        const name = r.ro ? `${r.ro} - ${r.indikator}` : r.indikator || "";
        if (name && !ikkSeen.has(name)) {
          ikkSeen.add(name);
          ikkList.push({
            level: "Indikator Kinerja Kegiatan",
            kode: `RO.${String(ikkList.length + 1).padStart(2, "0")}`,
            nama: name,
            target: r.target?.["2027"] || r.target?.["2026"] || "1",
            satuan: r.satuan || "",
          });
        }
      }
    }
  });

  return {
    "Sasaran Strategis": ssList,
    "Sasaran Program": spList,
    "Sasaran Kegiatan": skList,
    "Indikator Kinerja Kegiatan": ikkList,
  };
}

export default function IsianBab1Eselon2Page() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tab aktif (Gambaran Umum / Capaian Kinerja / Arah Kebijakan / Analisis Situasi)
  const tabParam = (searchParams.get("tab") as SubmenuBab1) || "gambaran-umum";
  const [activeTab, setActiveTab] = useState<SubmenuBab1>(tabParam);

  const [activeUnit, setActiveUnit] = useState(() => getActiveEselon2Unit());

  // Ambil referensi capaian kegiatan dari Referensi Informasi Kinerja sesuai Unit Kerja aktif
  const refCapaianList = useMemo(() => {
    return getReferensiCapaianForUnit(activeUnit.singkatan);
  }, [activeUnit.singkatan]);

  const uniqueSasaranList = useMemo(() => {
    return Array.from(new Set(refCapaianList.map((r) => r.sasaranKegiatan).filter(Boolean)));
  }, [refCapaianList]);

  // Ambil referensi target kinerja berjenjang (SS, SP, SK, IKK) sesuai Unit Kerja aktif
  const refTargetKinerja = useMemo(() => {
    return getReferensiTargetKinerjaForUnit(activeUnit.singkatan);
  }, [activeUnit.singkatan]);

  useEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab") as SubmenuBab1);
    }
  }, [searchParams]);

  useEffect(() => {
    const unit = getActiveEselon2Unit();
    setActiveUnit(unit);
  }, []);

  function handleTabChange(tab: SubmenuBab1) {
    setActiveTab(tab);
    setSearchParams({ tab });
  }

  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);

  // Form State Bab I Eselon II
  // 1. Gambaran Umum
  const [gambaranUmumText, setGambaranUmumText] = useState(
    "<p>Pusat Pendidikan dan Pelatihan APU PPT (Pusdiklat APU PPT) bertugas menyelenggarakan pendidikan, pelatihan, dan pengembangan sumber daya manusia di bidang Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU), Tindak Pidana Pendanaan Terorisme (TPPT), dan Pendanaan Sensitif Lainnya.</p>"
  );
  const [gambaranProkerText, setGambaranProkerText] = useState(
    "<p>Pada Tahun Anggaran 2027, Pusdiklat APU PPT memfokuskan pelaksanaan 40 paket pelatihan teknis berbasis kompetensi untuk seluruh Pihak Pelapor, Aparat Penegak Hukum (APH), dan internal PPATK.</p>"
  );

  // 2. Capaian Kinerja (bersumber dari Referensi Informasi Kinerja per Unit Kerja)
  const [capaianRows, setCapaianRows] = useState<CapaianRow[]>(() => {
    try {
      const saved = localStorage.getItem("renja_e2_bab1_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.capaianRows && Array.isArray(parsed.capaianRows) && parsed.capaianRows.length > 0) {
          return parsed.capaianRows.map((r: any) => ({
            id: r.id || `c_${Math.random()}`,
            sasaranKegiatan: r.sasaranKegiatan || "",
            ikk: r.ikk || "",
            tahun: r.tahun || 2025,
            target: r.target ?? 100,
            capaianOutputPct: r.capaianOutputPct ?? r.capaianPct ?? 100,
            capaianAnggaranPct: r.capaianAnggaranPct ?? 98.5,
          }));
        }
      }
    } catch (e) {}

    const initialRefs = getReferensiCapaianForUnit(getActiveEselon2Unit().singkatan);
    if (initialRefs.length > 0) {
      return initialRefs.map((ref, idx) => ({
        id: `c_${idx + 1}`,
        sasaranKegiatan: ref.sasaranKegiatan,
        ikk: ref.ikk,
        tahun: 2025,
        target: ref.target,
        capaianOutputPct: 100,
        capaianAnggaranPct: 98.5,
      }));
    }

    return [
      {
        id: "c1",
        sasaranKegiatan: "01 - Meningkatnya Kompetensi SDM APU PPT dan PPSPM",
        ikk: "01 - Indeks Efektivitas Pengembangan Kompetensi SDM APU PPT dan PPSPM",
        tahun: 2025,
        target: 4.43,
        capaianOutputPct: 101.5,
        capaianAnggaranPct: 99.2,
      },
      {
        id: "c2",
        sasaranKegiatan: "02 - Meningkatnya Kompetensi Aparat Penegak Hukum APU PPT PPPSPM",
        ikk: "01 - Indeks Efektivitas Pengembangan Kompetensi Aparat Penegak Hukum APU PPT PPSPM",
        tahun: 2025,
        target: 4.48,
        capaianOutputPct: 100.0,
        capaianAnggaranPct: 98.7,
      },
    ];
  });

  const [narasiCapaianT1, setNarasiCapaianT1] = useState(
    "<p>Capaian kinerja Satker Eselon II pada T-1 (2025) melampaui target yang ditetapkan dengan rata-rata capaian output sebesar 101.5% dan capaian realisasi anggaran mencapai 99.2%.</p>"
  );

  // 3. Arah Kebijakan, Strategi, & Target Kinerja (T+1)
  const [narasiArahKebijakan, setNarasiArahKebijakan] = useState(
    "<p>Arah kebijakan Satker Eselon II Tahun 2027 mengacu pada Renstra PPATK 2025-2029 dengan fokus otomasi e-learning APU PPT dan sertifikasi keahlian analis keuangan.</p>"
  );
  const [targetRows, setTargetRows] = useState<TargetRow[]>(() => {
    try {
      const saved = localStorage.getItem("renja_e2_bab1_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.targetRows) && parsed.targetRows.length > 0) {
          return parsed.targetRows;
        }
      }
    } catch (e) {}

    return [
      {
        id: "t_ss",
        kode: "SS.1",
        level: "Sasaran Strategis",
        sasaran_indikator: "01 - Meningkatnya Efektivitas Kinerja PPATK dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM",
        targetT1: "6,8",
        satuan: "Indeks",
      },
      {
        id: "t_sp",
        kode: "SP.1",
        level: "Sasaran Program",
        sasaran_indikator: "01 - Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM",
        targetT1: "5",
        satuan: "Indeks",
      },
      {
        id: "t_sk",
        kode: "SK 1.7",
        level: "Sasaran Kegiatan",
        sasaran_indikator: "01 - Meningkatnya Kompetensi SDM APU PPT dan PPSPM",
        targetT1: "4,52",
        satuan: "Indeks",
      },
      {
        id: "t_ikk",
        kode: "IKK 1.4.1",
        level: "Indikator Kinerja Kegiatan",
        sasaran_indikator: "01 - Indeks Efektivitas Pengembangan Kompetensi SDM APU PPT dan PPSPM",
        targetT1: "4,52",
        satuan: "Indeks",
      },
    ];
  });

  // 4. Analisis Situasi
  const [analisisMomentumText, setAnalisisMomentumText] = useState(
    "<p>Momentum utama: Adopsi teknologi AI-assisted learning platform serta integrasi sistem sertifikasi keahlian APU PPT berskala internasional.</p>"
  );
  const [analisisTantanganText, setAnalisisTantanganText] = useState(
    "<p>Tantangan: Dinamika kejahatan keuangan berbasis kripto dan kecerdasan buatan membutuhkan update kurikulum pelatihan yang fleksibel dan cepat.</p>"
  );

  function handleSaveForm() {
    // Simpan ke localStorage
    const dataBab1E2 = {
      gambaranUmumText,
      gambaranProkerText,
      capaianRows,
      narasiCapaianT1,
      narasiArahKebijakan,
      targetRows,
      analisisMomentumText,
      analisisTantanganText,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("renja_e2_bab1_data", JSON.stringify(dataBab1E2));
    setSavedSuccessAlert(true);
    setTimeout(() => setSavedSuccessAlert(false), 3000);
  }

  return (
    <div className="min-h-full p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Banner Notification Save ── */}
      {savedSuccessAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-sm font-semibold flex items-center justify-between shadow-md animate-bounce">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Data Isian Bab I Renja Eselon II BERHASIL disimpan ke sistem!</span>
          </div>
        </div>
      )}

      {/* ── Header Top Bar ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 shadow-sm font-bold">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary text-[0.65rem] font-bold">RENJA ESELON II</span>
              <span className="text-xs text-[var(--text-muted)] font-mono">/eselon2/bab-1</span>
            </div>
            <h1 className="text-lg font-bold text-[var(--text)]">Isian Bab I — Renja Eselon II</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Gambaran Umum Satker, Capaian Kinerja T-1 & T-2, Arah Kebijakan & Target T+1, serta Analisis Situasi.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveForm}
          className="px-5 py-2.5 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>Simpan Isian Bab I</span>
        </button>
      </div>

      {/* ── Navigation Submenu Tabs (4 Submenu) ── */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto scrollbar-none whitespace-nowrap">
        {[
          { id: "gambaran-umum", label: "1. Gambaran Umum", icon: Layers },
          { id: "capaian-kinerja", label: "2. Capaian Kinerja", icon: BarChart3 },
          { id: "arah-kebijakan", label: "3. Arah Kebijakan, Strategi, & Target", icon: Compass },
          { id: "analisis-situasi", label: "4. Analisis Situasi", icon: AlertTriangle },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as SubmenuBab1)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-[var(--primary)] text-white shadow-sm ring-2 ring-[var(--primary)]/30"
                  : "bg-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Content Tab 1: Gambaran Umum ── */}
      {activeTab === "gambaran-umum" && (
        <div className="space-y-6">
          <div className="aksi-card p-6 bg-[var(--card)] border border-[var(--border)] space-y-4">
            <h2 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-[var(--primary)]" />
              Bagian A: Gambaran Umum Satker & Program Kerja Eselon II
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  1. Gambaran Umum Tugas & Fungsi Satuan Kerja Eselon II:
                </label>
                <RichTextEditor
                  value={gambaranUmumText}
                  onChange={setGambaranUmumText}
                  placeholder="Ketik narasi gambaran umum tugas & fungsi Satker..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  2. Gambaran Program Kerja & Fokus Kegiatan Satker TA 2027:
                </label>
                <RichTextEditor
                  value={gambaranProkerText}
                  onChange={setGambaranProkerText}
                  placeholder="Ketik narasi gambaran program kerja Satker..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Content Tab 2: Capaian Kinerja ── */}
      {activeTab === "capaian-kinerja" && (
        <div className="space-y-6">
          <div className="aksi-card p-6 bg-[var(--card)] border border-[var(--border)] space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  Bagian B: Evaluasi Capaian Kinerja Eselon II
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Evaluasi sasaran dan indikator kinerja kegiatan berdasarkan referensi informasi kinerja.
                </p>
              </div>
              <button
                onClick={() => {
                  const availableRef =
                    refCapaianList.find((ref) => !capaianRows.some((r) => r.ikk === ref.ikk)) ||
                    refCapaianList[0];
                  const newRow: CapaianRow = {
                    id: `c_${Date.now()}`,
                    sasaranKegiatan: availableRef?.sasaranKegiatan || "Sasaran Kinerja Kegiatan Baru",
                    ikk: availableRef?.ikk || "Indikator Kinerja Kegiatan Baru",
                    tahun: 2025,
                    target: availableRef?.target || 100,
                    capaianOutputPct: 100,
                    capaianAnggaranPct: 98.5,
                  };
                  setCapaianRows([...capaianRows, newRow]);
                }}
                className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah IKK</span>
              </button>
            </div>

            {/* Banner Unit Kerja Aktif */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
              <Building2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
              <span>
                Unit Kerja Terpilih: <strong>{activeUnit.labelFull}</strong> (Nomenklatur Sasaran &amp; Indikator Kinerja Kegiatan bersumber dari Referensi Informasi Kinerja)
              </span>
            </div>

            {/* Datalists for Sasaran Kinerja & IKK */}
            <datalist id="sasaran-kegiatan-list">
              {uniqueSasaranList.map((s, idx) => (
                <option key={idx} value={s} />
              ))}
            </datalist>
            <datalist id="ikk-kegiatan-list">
              {refCapaianList.map((ref, idx) => (
                <option key={idx} value={ref.ikk} />
              ))}
            </datalist>

            {/* Tabel Interactive Capaian Kinerja */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--accent)] border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-[0.65rem] font-bold">
                    <th className="p-3 text-center">Sasaran Kinerja Kegiatan</th>
                    <th className="p-3 text-center">Indikator Kinerja Kegiatan</th>
                    <th className="p-3 text-center w-20">Tahun</th>
                    <th className="p-3 text-center w-24">Target</th>
                    <th className="p-3 text-center w-32 leading-tight">
                      Capaian Output<br />(%)
                    </th>
                    <th className="p-3 text-center w-32 leading-tight">
                      Capaian Anggaran<br />(%)
                    </th>
                    <th className="p-3 text-center w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium">
                  {capaianRows.map((row) => (
                    <tr key={row.id} className="hover:bg-[var(--accent)]/30 transition-colors">
                      <td className="p-3">
                        <input
                          type="text"
                          list="sasaran-kegiatan-list"
                          value={row.sasaranKegiatan}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCapaianRows(
                              capaianRows.map((r) =>
                                r.id === row.id ? { ...r, sasaranKegiatan: val } : r
                              )
                            );
                          }}
                          className="w-full bg-[var(--accent)]/40 border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                          placeholder="Pilih / ketik Sasaran Kinerja Kegiatan..."
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          list="ikk-kegiatan-list"
                          value={row.ikk}
                          onChange={(e) => {
                            const val = e.target.value;
                            const matched = refCapaianList.find((rf) => rf.ikk === val);
                            setCapaianRows(
                              capaianRows.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      ikk: val,
                                      sasaranKegiatan: matched?.sasaranKegiatan || r.sasaranKegiatan,
                                      target: matched?.target || r.target,
                                    }
                                  : r
                              )
                            );
                          }}
                          className="w-full bg-[var(--accent)]/40 border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                          placeholder="Pilih / ketik Indikator Kinerja Kegiatan..."
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={row.tahun}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCapaianRows(
                              capaianRows.map((r) => (r.id === row.id ? { ...r, tahun: val } : r))
                            );
                          }}
                          className="w-16 text-center bg-[var(--accent)]/40 border border-[var(--border)] rounded-lg px-1 py-1.5 text-xs font-mono font-semibold"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="text"
                          value={row.target}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCapaianRows(
                              capaianRows.map((r) => (r.id === row.id ? { ...r, target: val } : r))
                            );
                          }}
                          className="w-20 text-right bg-[var(--accent)]/40 border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs font-mono"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          step="0.1"
                          value={row.capaianOutputPct}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCapaianRows(
                              capaianRows.map((r) =>
                                r.id === row.id ? { ...r, capaianOutputPct: val } : r
                              )
                            );
                          }}
                          className="w-24 text-right bg-[var(--accent)]/40 border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          step="0.1"
                          value={row.capaianAnggaranPct}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCapaianRows(
                              capaianRows.map((r) =>
                                r.id === row.id ? { ...r, capaianAnggaranPct: val } : r
                              )
                            );
                          }}
                          className="w-24 text-right bg-[var(--accent)]/40 border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-blue-600 dark:text-blue-400"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setCapaianRows(capaianRows.filter((r) => r.id !== row.id))}
                          className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg cursor-pointer transition-colors"
                          title="Hapus baris"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Narasi Evaluasi Capaian Kinerja (Hanya T-1, T-2 telah dihapus) */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  Narasi Evaluasi Capaian Kinerja T-1 (2025):
                </label>
                <RichTextEditor
                  value={narasiCapaianT1}
                  onChange={setNarasiCapaianT1}
                  placeholder="Ketik narasi capaian kinerja T-1..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Content Tab 3: Arah Kebijakan, Strategi, & Target ── */}
      {activeTab === "arah-kebijakan" && (
        <div className="space-y-6">
          <div className="aksi-card p-6 bg-[var(--card)] border border-[var(--border)] space-y-5">
            <h2 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-4 w-4 text-purple-600" />
              Bagian C: Arah Kebijakan, Strategi, dan Target Kinerja (T+1)
            </h2>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                Narasi Arah Kebijakan & Strategi Satker Renstra PPATK 2025-2029:
              </label>
              <RichTextEditor
                value={narasiArahKebijakan}
                onChange={setNarasiArahKebijakan}
                placeholder="Ketik narasi arah kebijakan Satker..."
              />
            </div>

            {/* Tabel Target Kinerja T+1 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Matriks Target Indikator Kinerja Kegiatan (IKK) TA 2027 (T+1):
                </label>
                <button
                  onClick={() => {
                    const defaultLevel: LevelKinerja = "Sasaran Kegiatan";
                    const availableItems = refTargetKinerja[defaultLevel] || [];
                    const firstItem = availableItems[0];
                    const newT: TargetRow = {
                      id: `t_${Date.now()}`,
                      kode: firstItem?.kode || `IKK-0${targetRows.length + 1}`,
                      level: defaultLevel,
                      sasaran_indikator: firstItem?.nama || "Pilih / Ketik Kinerja...",
                      targetT1: firstItem?.target || "100",
                      satuan: firstItem?.satuan || "%",
                    };
                    setTargetRows([...targetRows, newT]);
                  }}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Target T+1</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--accent)] border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-[0.65rem] font-bold">
                      <th className="p-3 text-center w-28">Kode</th>
                      <th className="p-3 text-center">
                        Sasaran Strategis / Sasaran Program / Sasaran Kegiatan / Indikator Kinerja Kegiatan
                      </th>
                      <th className="p-3 text-center w-40">Target</th>
                      <th className="p-3 text-center w-16">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] font-medium">
                    {targetRows.map((t) => {
                      const currentLevel = t.level || "Sasaran Kegiatan";
                      const optionsForLevel = refTargetKinerja[currentLevel] || [];

                      return (
                        <tr key={t.id} className="hover:bg-[var(--accent)]/30 transition-colors">
                          {/* Kolom 1: Kode */}
                          <td className="p-3 text-center align-top w-28">
                            <input
                              type="text"
                              value={t.kode}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTargetRows(
                                  targetRows.map((row) => (row.id === t.id ? { ...row, kode: val } : row))
                                );
                              }}
                              className="w-full text-center bg-[var(--accent)]/40 border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-purple-600 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                              placeholder="mis. IKK.01"
                            />
                          </td>

                          {/* Kolom 2: Sasaran Strategis / Sasaran Program / Sasaran Kegiatan / Indikator Kinerja Kegiatan */}
                          <td className="p-3 align-top space-y-2">
                            {/* Pilihan Level Indikator Kinerja */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[0.68rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                Level:
                              </span>
                              {(
                                [
                                  "Sasaran Strategis",
                                  "Sasaran Program",
                                  "Sasaran Kegiatan",
                                  "Indikator Kinerja Kegiatan",
                                ] as LevelKinerja[]
                              ).map((lvl) => {
                                const isSelected = (t.level || "Sasaran Kegiatan") === lvl;
                                return (
                                  <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => {
                                      const newOptions = refTargetKinerja[lvl] || [];
                                      const matched = newOptions[0];
                                      setTargetRows(
                                        targetRows.map((row) =>
                                          row.id === t.id
                                            ? {
                                                ...row,
                                                level: lvl,
                                                kode: matched?.kode || row.kode,
                                                sasaran_indikator: matched?.nama || "",
                                                targetT1: matched?.target || row.targetT1,
                                                satuan: matched?.satuan || row.satuan,
                                              }
                                            : row
                                        )
                                      );
                                    }}
                                    className={`px-2.5 py-1 rounded-md text-[0.68rem] font-bold transition-all cursor-pointer border ${
                                      isSelected
                                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                        : "bg-[var(--accent)]/50 text-[var(--text)] border-[var(--border)] hover:bg-[var(--accent)]"
                                    }`}
                                  >
                                    {lvl}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Dropdown / Input Pilihan Nomenklatur berdasarkan data Referensi Informasi Kinerja */}
                            <div className="flex items-center gap-2">
                              <select
                                value={
                                  optionsForLevel.some((opt) => opt.nama === t.sasaran_indikator)
                                    ? t.sasaran_indikator
                                    : "__CUSTOM__"
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val !== "__CUSTOM__") {
                                    const matched = optionsForLevel.find((opt) => opt.nama === val);
                                    setTargetRows(
                                      targetRows.map((row) =>
                                        row.id === t.id
                                          ? {
                                              ...row,
                                              sasaran_indikator: val,
                                              kode: matched?.kode || row.kode,
                                              targetT1: matched?.target || row.targetT1,
                                              satuan: matched?.satuan || row.satuan,
                                            }
                                          : row
                                      )
                                    );
                                  }
                                }}
                                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text)] font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
                              >
                                <option value="">-- Pilih {currentLevel} dari Referensi ({activeUnit.singkatan}) --</option>
                                {optionsForLevel.map((opt, optIdx) => (
                                  <option key={`${opt.kode}_${optIdx}`} value={opt.nama}>
                                    [{opt.kode}] {opt.nama}
                                  </option>
                                ))}
                                <option value="__CUSTOM__">-- Ketik Kustom Lainnya --</option>
                              </select>
                            </div>

                            {/* Text Input untuk penyesuaian teks fleksibel bila memilih kustom */}
                            {(!optionsForLevel.some((opt) => opt.nama === t.sasaran_indikator) ||
                              !t.sasaran_indikator) && (
                              <input
                                type="text"
                                value={t.sasaran_indikator}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTargetRows(
                                    targetRows.map((row) =>
                                      row.id === t.id ? { ...row, sasaran_indikator: val } : row
                                    )
                                  );
                                }}
                                placeholder={`Ketik nomenklatur ${currentLevel}...`}
                                className="w-full bg-[var(--accent)]/40 border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                              />
                            )}
                          </td>

                          {/* Kolom 3: Target */}
                          <td className="p-3 text-right align-top w-40">
                            <div className="flex items-center gap-1 justify-end">
                              <input
                                type="text"
                                value={t.targetT1}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTargetRows(
                                    targetRows.map((row) => (row.id === t.id ? { ...row, targetT1: val } : row))
                                  );
                                }}
                                className="w-20 text-right bg-[var(--accent)]/40 border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-purple-600 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                                placeholder="Target"
                              />
                              <input
                                type="text"
                                value={t.satuan || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTargetRows(
                                    targetRows.map((row) => (row.id === t.id ? { ...row, satuan: val } : row))
                                  );
                                }}
                                className="w-14 text-center bg-[var(--accent)]/40 border border-[var(--border)] rounded-lg px-1 py-1.5 text-xs font-mono text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                                placeholder="Satuan"
                              />
                            </div>
                          </td>

                          {/* Kolom Aksi */}
                          <td className="p-3 text-center align-top w-16">
                            <button
                              onClick={() => setTargetRows(targetRows.filter((row) => row.id !== t.id))}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Hapus baris"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Pratinjau Format Cetak Dokumen Resmi (3 Kolom Sesuai Gambar Standar PPATK) ── */}
              <div className="pt-6 border-t border-[var(--border)] space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
                    <div>
                      <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                        Pratinjau Format Cetak Dokumen Resmi (Standar PPATK)
                      </h3>
                      <p className="text-[0.68rem] text-[var(--text-muted)]">
                        Memuat seluruh level indikator: Sasaran Strategis, Sasaran Program, Sasaran Kegiatan, &amp; IKK
                      </p>
                    </div>
                  </div>
                  <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
                    Tampilan Cetak Dokumen
                  </span>
                </div>

                <div className="overflow-x-auto bg-white p-4 rounded-xl border border-slate-300 shadow-sm text-slate-900 font-sans">
                  <table className="w-full text-xs border-collapse border border-slate-900 font-sans">
                    <thead className="bg-slate-200 font-bold text-center">
                      <tr>
                        <th className="p-2 border border-slate-900 w-24">Kode</th>
                        <th className="p-2 border border-slate-900">
                          Sasaran Strategis/Sasaran Program/Sasaran<br />
                          Kegiatan/Indikator Kinerja
                        </th>
                        <th className="p-2 border border-slate-900 w-24">
                          Target<br />
                          2027
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Row SS */}
                      {(() => {
                        const ssItem = targetRows.find((r) => r.level === "Sasaran Strategis");
                        const kodeSS = ssItem?.kode || "SS.1";
                        const namaSS = ssItem?.sasaran_indikator || "01 - Meningkatnya Efektivitas Kinerja PPATK dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM";
                        const targetSS = ssItem?.targetT1 || "6,8";
                        return (
                          <tr>
                            <td className="p-2 border border-slate-900 text-center font-bold align-middle">
                              {kodeSS}
                            </td>
                            <td className="border border-slate-900 p-0 align-top">
                              <div className="p-2.5 font-bold text-slate-900 leading-snug">
                                {namaSS.replace(/^\d+\s*-\s*/, "")}
                              </div>
                              <div className="border-t border-slate-900 p-2 text-xs space-y-0.5">
                                <div className="italic underline font-medium">Indikator IKSS 1.2:</div>
                                <div className="italic text-slate-800">
                                  Indeks Implementasi Program TPPU TPPT dan PPSPM PPATK. {"{Indeks}"}
                                </div>
                              </div>
                            </td>
                            <td className="border border-slate-900 p-0 text-center align-bottom">
                              <div className="p-2.5">&nbsp;</div>
                              <div className="border-t border-slate-900 p-2 text-xs font-semibold">
                                {targetSS}
                              </div>
                            </td>
                          </tr>
                        );
                      })()}

                      {/* Row SP */}
                      {(() => {
                        const spItem = targetRows.find((r) => r.level === "Sasaran Program");
                        const kodeSP = spItem?.kode || "SP.1";
                        const namaSP = spItem?.sasaran_indikator || "01 - Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM";
                        const targetSP = spItem?.targetT1 || "5";
                        return (
                          <tr>
                            <td className="p-2 border border-slate-900 text-center font-bold align-middle">
                              {kodeSP}
                            </td>
                            <td className="border border-slate-900 p-0 align-top">
                              <div className="p-2.5 font-bold text-slate-900 leading-snug">
                                {namaSP.replace(/^\d+\s*-\s*/, "")}
                              </div>
                              <div className="border-t border-slate-900 p-2 text-xs space-y-0.5">
                                <div className="italic underline font-medium">Indikator IKP 1.1:</div>
                                <div className="italic text-slate-800">
                                  Indeks Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pemberantasan TPPU, TPPT, dan PPSPM. {"{Indeks}"}
                                </div>
                              </div>
                            </td>
                            <td className="border border-slate-900 p-0 text-center align-bottom">
                              <div className="p-2.5">&nbsp;</div>
                              <div className="border-t border-slate-900 p-2 text-xs font-semibold">
                                {targetSP}
                              </div>
                            </td>
                          </tr>
                        );
                      })()}

                      {/* Divider Row: Sasaran Kegiatan */}
                      <tr>
                        <td className="p-2 border border-slate-900"></td>
                        <td className="p-2 border border-slate-900 font-medium">
                          <span className="underline">Sasaran Kegiatan:</span>
                        </td>
                        <td className="p-2 border border-slate-900"></td>
                      </tr>

                      {/* Rows SK & IKK */}
                      {(() => {
                        const skItems = targetRows.filter((r) => r.level === "Sasaran Kegiatan");
                        const ikkItems = targetRows.filter((r) => r.level === "Indikator Kinerja Kegiatan");

                        if (skItems.length === 0) {
                          return (
                            <tr>
                              <td className="p-2 border border-slate-900 text-center font-bold align-middle">
                                SK 1.7
                              </td>
                              <td className="border border-slate-900 p-0 align-top">
                                <div className="p-2.5 font-bold text-slate-900 leading-snug">
                                  Meningkatnya Kompetensi SDM APU PPT dan PPSPM
                                </div>
                                <div className="border-t border-slate-900 p-2 text-xs space-y-0.5">
                                  <div className="italic underline font-medium">Indikator IKK 1.4.1:</div>
                                  <div className="italic text-slate-800">
                                    Indeks Efektivitas Pengembangan Kompetensi SDM APU PPT dan PPSPM. {"{Indeks}"}
                                  </div>
                                </div>
                              </td>
                              <td className="border border-slate-900 p-0 text-center align-bottom">
                                <div className="p-2.5">&nbsp;</div>
                                <div className="border-t border-slate-900 p-2 text-xs font-semibold">
                                  4,52
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return skItems.map((sk, skIdx) => {
                          const pairedIkk = ikkItems[skIdx] || ikkItems[0];
                          const kodeSK = sk.kode || `SK 1.${skIdx + 7}`;
                          const ikkLabel = pairedIkk?.kode ? `Indikator ${pairedIkk.kode}:` : `Indikator IKK 1.${skIdx + 4}.1:`;
                          const ikkNama = pairedIkk?.sasaran_indikator || "Indeks Efektivitas Pengembangan Kompetensi SDM APU PPT dan PPSPM";
                          const targetVal = pairedIkk?.targetT1 || sk.targetT1 || "4,52";

                          return (
                            <tr key={`sk_${skIdx}`}>
                              <td className="p-2 border border-slate-900 text-center font-bold align-middle">
                                {kodeSK}
                              </td>
                              <td className="border border-slate-900 p-0 align-top">
                                <div className="p-2.5 font-bold text-slate-900 leading-snug">
                                  {sk.sasaran_indikator.replace(/^\d+\s*-\s*/, "")}
                                </div>
                                <div className="border-t border-slate-900 p-2 text-xs space-y-0.5">
                                  <div className="italic underline font-medium">{ikkLabel}</div>
                                  <div className="italic text-slate-800">
                                    {ikkNama.replace(/^\d+\s*-\s*/, "")}. {"{" + (pairedIkk?.satuan || "Indeks") + "}"}
                                  </div>
                                </div>
                              </td>
                              <td className="border border-slate-900 p-0 text-center align-bottom">
                                <div className="p-2.5">&nbsp;</div>
                                <div className="border-t border-slate-900 p-2 text-xs font-semibold">
                                  {targetVal}
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Content Tab 4: Analisis Situasi ── */}
      {activeTab === "analisis-situasi" && (
        <div className="space-y-6">
          <div className="aksi-card p-6 bg-[var(--card)] border border-[var(--border)] space-y-4">
            <h2 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Bagian D: Analisis Situasi Satker (Momentum & Tantangan)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  1. Analisis Peluang & Momentum Strategis Satker TA 2027:
                </label>
                <RichTextEditor
                  value={analisisMomentumText}
                  onChange={setAnalisisMomentumText}
                  placeholder="Ketik narasi peluang & momentum..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  2. Analisis Tantangan, Kendala, & Rintangan Satker TA 2027:
                </label>
                <RichTextEditor
                  value={analisisTantanganText}
                  onChange={setAnalisisTantanganText}
                  placeholder="Ketik narasi tantangan & rintangan..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

