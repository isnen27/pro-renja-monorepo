import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Save,
  CheckCircle2,
  Building2,
  Trash2,
  RotateCcw,
  Info,
} from "lucide-react";
import unitKerjaData from "../../data/unitKerjaData.json";
import informasiKinerjaData from "../../data/informasiKinerjaData.json";

export interface LampiranKamusRoRow {
  id: string;
  kode: string; // e.g. "3365.DCF.001" or "051"
  level: "RO" | "Komponen";
  uraian: string; // e.g. "Pelatihan Bidang APU PPT PPSPM"
  jumlahTarget: string; // e.g. "27 (810)" or "44"
  satuanTarget: string; // e.g. "Kegiatan (Orang)" or "Dokumen"
  definisi: string;
  rincianTarget: string;
}

const STORAGE_KEY_LAMPIRAN_E2 = "renja_e2_lampiran_data";

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

export const DEFAULT_LAMPIRAN_PATIH: LampiranKamusRoRow[] = [
  {
    id: "lamp_ro_1",
    kode: "3365.DCF.001",
    level: "RO",
    uraian: "Pelatihan Bidang APU PPT PPSPM",
    jumlahTarget: "27 (810)",
    satuanTarget: "Kegiatan (Orang)",
    definisi:
      "Output berupa penyelenggaraan kegiatan pendidikan dan pelatihan di bidang Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme (APU PPT) guna meningkatkan pengetahuan, keterampilan, dan kompetensi peserta dalam mendukung implementasi rezim APU PPT dan PPSPM.",
    rincianTarget:
      "Laporan Penyelenggaraan Pendidikan dan Pelatihan Non Aparat Penegak Hukum (27 Kegiatan)",
  },
  {
    id: "lamp_komp_1",
    kode: "051",
    level: "Komponen",
    uraian: "Perencanaan dan Pengembangan Program Pelatihan",
    jumlahTarget: "44",
    satuanTarget: "Dokumen",
    definisi: "-",
    rincianTarget:
      "1. Penyusunan Analisis Kebutuhan Pelatihan (1 dokumen);\n2. Penyusunan/penyempurnaan Kurikulum Pelatihan (17 dokumen);\n3. Dokumen Standar Kompetensi (1 dokumen);\n4. Penyusunan/penyempurnaan Bahan Ajar (24 dokumen);\n5. Dokumen Kriteria Penjenjangan (1 dokumen).",
  },
  {
    id: "lamp_komp_2",
    kode: "052",
    level: "Komponen",
    uraian: "Kerjasama Pendidikan dan Pelatihan",
    jumlahTarget: "1",
    satuanTarget: "Laporan",
    definisi: "-",
    rincianTarget: "Laporan Kerjasama Pendidikan dan Pelatihan (1 Laporan)",
  },
  {
    id: "lamp_komp_3",
    kode: "053",
    level: "Komponen",
    uraian: "Penyelenggaraan Pendidikan dan Pelatihan",
    jumlahTarget: "27",
    satuanTarget: "Kegiatan",
    definisi: "-",
    rincianTarget:
      "Laporan Penyelenggaraan Pendidikan dan Pelatihan Non Aparat Penegak Hukum (27 Kegiatan)",
  },
  {
    id: "lamp_komp_4",
    kode: "054",
    level: "Komponen",
    uraian: "Publikasi Pendidikan dan Pelatihan",
    jumlahTarget: "1",
    satuanTarget: "Laporan",
    definisi: "-",
    rincianTarget: "Laporan Publikasi Pendidikan dan Pelatihan (1 Laporan)",
  },
];

export function generateDefaultLampiranForUnit(unitSingkatan: string, unitNama: string): LampiranKamusRoRow[] {
  if (unitSingkatan === "PATIH") return DEFAULT_LAMPIRAN_PATIH;

  const rows: LampiranKamusRoRow[] = [];
  const filtered = informasiKinerjaData.filter((d: any) => d.unitKerja === unitSingkatan);

  const roMap = new Map<string, { roKode: string; roNama: string; komponen: string[] }>();
  filtered.forEach((row: any) => {
    if (!row.ro) return;
    if (!roMap.has(row.ro)) {
      const parts = row.ro.split(" ");
      const roKode = parts.slice(0, 3).join(".");
      const roNama = parts.slice(3).join(" ") || row.ro;
      roMap.set(row.ro, { roKode, roNama, komponen: [] });
    }
    if (row.komponen) {
      roMap.get(row.ro)!.komponen.push(row.komponen);
    }
  });

  let counter = 1;
  roMap.forEach((val) => {
    rows.push({
      id: `lamp_gen_ro_${counter++}`,
      kode: val.roKode || `3380.EBA.00${counter}`,
      level: "RO",
      uraian: val.roNama,
      jumlahTarget: "10 (300)",
      satuanTarget: "Layanan (Orang)",
      definisi: `Penyelenggaraan layanan program kegiatan ${val.roNama} pada ${unitNama} sesuai tata kelola standar operasional prosedur PPATK.`,
      rincianTarget: `Laporan Pelaksanaan ${val.roNama} (10 Layanan)`,
    });

    val.komponen.forEach((kmp) => {
      const kParts = kmp.split(" ");
      const kKode = kParts[3] || `05${counter}`;
      const kNama = kParts.slice(4).join(" ") || kmp;
      rows.push({
        id: `lamp_gen_komp_${counter++}`,
        kode: kKode,
        level: "Komponen",
        uraian: kNama,
        jumlahTarget: "1",
        satuanTarget: "Laporan",
        definisi: "-",
        rincianTarget: `Laporan Pelaksanaan ${kNama} (1 Laporan)`,
      });
    });
  });

  if (rows.length === 0) {
    rows.push({
      id: "lamp_fallback_1",
      kode: "3380.EBA.001",
      level: "RO",
      uraian: `Layanan Operasional Tugas dan Fungsi ${unitSingkatan}`,
      jumlahTarget: "1",
      satuanTarget: "Layanan",
      definisi: `Pelaksanaan tugas dan fungsi satker ${unitNama} secara akuntabel dan transparan.`,
      rincianTarget: `Laporan Akuntabilitas Kinerja ${unitSingkatan} (1 Laporan)`,
    });
  }

  return rows;
}

// Sinkronisasi otomatis deretan RO & Komponen dari Isian Bab III
export function syncLampiranRowsFromBab3(
  unitSingkatan: string,
  unitNama: string,
  existingRows: LampiranKamusRoRow[] = []
): LampiranKamusRoRow[] {
  // 1. Dapatkan daftar baris RO dan Komponen dari Bab III (localStorage atau default)
  let bab3Rows: { id?: string; kode: string; level: string; uraian: string; target?: string }[] = [];
  try {
    const rawBab3 = localStorage.getItem("renja_e2_bab3_data");
    if (rawBab3) {
      const parsed = JSON.parse(rawBab3);
      if (Array.isArray(parsed.rekapRows) && parsed.rekapRows.length > 0) {
        bab3Rows = parsed.rekapRows;
      }
    }
  } catch (e) {}

  if (bab3Rows.length === 0) {
    if (unitSingkatan === "PATIH") {
      bab3Rows = [
        { kode: "001", level: "RO", uraian: "Pelatihan bidang APU PPT PPSPM", target: "27 Kegiatan (810 Orang)" },
        { kode: "051", level: "Komponen", uraian: "Perencanaan dan Pengembangan Program Pelatihan", target: "44 Dokumen" },
        { kode: "052", level: "Komponen", uraian: "Kerjasama Pendidikan dan Pelatihan", target: "1 Laporan" },
        { kode: "053", level: "Komponen", uraian: "Penyelenggaraan Pendidikan dan Pelatihan", target: "27 Kegiatan" },
        { kode: "054", level: "Komponen", uraian: "Publikasi Pendidikan dan Pelatihan", target: "1 Laporan" },
      ];
    } else {
      const filtered = informasiKinerjaData.filter((d: any) => d.unitKerja === unitSingkatan);
      const distinctRo = Array.from(new Set(filtered.map((d: any) => d.ro).filter(Boolean)));
      distinctRo.forEach((roStr, ridx) => {
        const parts = (roStr as string).split(" ");
        const kode = parts[2] || `00${ridx + 1}`;
        const uraian = parts.slice(3).join(" ") || (roStr as string);
        bab3Rows.push({ kode, level: "RO", uraian, target: "10 Layanan (300 Orang)" });
      });

      const distinctKomp = Array.from(new Set(filtered.map((d: any) => d.komponen).filter(Boolean)));
      distinctKomp.forEach((kompStr, cidx) => {
        const parts = (kompStr as string).split(" ");
        const kode = parts[3] || `05${cidx + 1}`;
        const uraian = parts.slice(4).join(" ") || (kompStr as string);
        bab3Rows.push({ kode, level: "Komponen", uraian, target: "1 Dokumen" });
      });

      if (bab3Rows.length === 0) {
        bab3Rows = [
          { kode: "001", level: "RO", uraian: `Layanan Manajemen Operasional ${unitNama}`, target: "1 Layanan" },
          { kode: "051", level: "Komponen", uraian: "Operasional dan Pemeliharaan Sarana Perkantoran", target: "1 Laporan" },
        ];
      }
    }
  }

  // Filter hanya baris bertipe RO dan Komponen dari Bab III
  const bab3TargetItems = bab3Rows.filter((r) => r.level === "RO" || r.level === "Komponen");

  // Peta existing rows untuk mempertahankan definisi/rincianTarget jika sudah diedit user sebelumnya
  const existingMap = new Map<string, LampiranKamusRoRow>();
  existingRows.forEach((r) => {
    existingMap.set(`${r.level}_${r.kode.trim()}`, r);
    existingMap.set(r.uraian.trim().toLowerCase(), r);
  });

  return bab3TargetItems.map((bItem, idx) => {
    const keyKode = `${bItem.level}_${bItem.kode.trim()}`;
    const keyUraian = bItem.uraian.trim().toLowerCase();
    const existing = existingMap.get(keyKode) || existingMap.get(keyUraian);

    if (existing) {
      return {
        ...existing,
        kode: bItem.kode,
        level: bItem.level as "RO" | "Komponen",
        uraian: bItem.uraian,
      };
    }

    // Default formatting jika belum ada
    let jml = "1";
    let sat = "Laporan";
    if (bItem.target) {
      const parts = bItem.target.split(" ");
      if (parts.length >= 2) {
        jml = parts[0];
        sat = parts.slice(1).join(" ");
      }
    } else if (bItem.level === "RO") {
      jml = "10 (300)";
      sat = "Layanan (Orang)";
    }

    return {
      id: `lamp_b3_${idx + 1}_${Date.now()}`,
      kode: bItem.kode,
      level: bItem.level as "RO" | "Komponen",
      uraian: bItem.uraian,
      jumlahTarget: jml,
      satuanTarget: sat,
      definisi:
        bItem.level === "RO"
          ? `Penyelenggaraan layanan program kegiatan ${bItem.uraian} pada ${unitNama} sesuai tata kelola standar operasional prosedur PPATK.`
          : "-",
      rincianTarget: `Laporan Pelaksanaan ${bItem.uraian} (${jml} ${sat})`,
    };
  });
}

export default function IsianLampiranEselon2Page() {
  const [activeUnit, setActiveUnit] = useState(() => getActiveEselon2Unit());
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);

  const [kamusRows, setKamusRows] = useState<LampiranKamusRoRow[]>(() => {
    let loaded: LampiranKamusRoRow[] = [];
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY_LAMPIRAN_E2);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (Array.isArray(parsed.kamusRows) && parsed.kamusRows.length > 0) {
          loaded = parsed.kamusRows;
        }
      }
    } catch (e) {}
    const unit = getActiveEselon2Unit();
    return syncLampiranRowsFromBab3(unit.singkatan, unit.nama, loaded);
  });

  // Sinkronisasi otomatis jika unit kerja aktif berganti di Pilih Histori
  useEffect(() => {
    const unit = getActiveEselon2Unit();
    setActiveUnit(unit);
  }, []);

  function handleSaveForm() {
    const dataLampiran = {
      unitSingkatan: activeUnit.singkatan,
      unitNama: activeUnit.nama,
      kamusRows,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_LAMPIRAN_E2, JSON.stringify(dataLampiran));
    setSavedSuccessAlert(true);
    setTimeout(() => setSavedSuccessAlert(false), 3000);
  }

  function handleResetDefault() {
    if (confirm(`Reset tabel Kamus RO kembali ke data acuan Bab III untuk ${activeUnit.labelFull}?`)) {
      const resetData = syncLampiranRowsFromBab3(activeUnit.singkatan, activeUnit.nama, []);
      setKamusRows(resetData);
    }
  }

  function handleDeleteRow(id: string) {
    if (confirm("Hapus baris Kamus Rincian Output ini?")) {
      setKamusRows(kamusRows.filter((r) => r.id !== id));
    }
  }

  function handleUpdateRowField(id: string, field: keyof LampiranKamusRoRow, value: string) {
    setKamusRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }

  return (
    <div className="min-h-full p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Banner Notification Save ── */}
      {savedSuccessAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-sm font-semibold flex items-center justify-between shadow-md animate-bounce">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Data Isian Lampiran Kamus Rincian Output BERHASIL disimpan! Target di Bab III otomatis tersinkronisasi.</span>
          </div>
        </div>
      )}

      {/* ── Header Top Bar ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 shadow-sm font-bold">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary text-[0.65rem] font-bold">RENJA ESELON II</span>
              <span className="text-xs text-[var(--text-muted)] font-mono">/eselon2/lampiran</span>
            </div>
            <h1 className="text-lg font-bold text-[var(--text)]">Isian Lampiran — Renja Eselon II</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Kamus Rincian Output (RO) & Komponen — Rujukan resmi target output bagi Submenu Isian Bab III.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefault}
            className="px-3.5 py-2 bg-[var(--accent)] hover:bg-[var(--border)] text-[var(--text)] rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[var(--border)] transition-colors cursor-pointer"
            title="Kembalikan data ke acuan standar default"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            <span>Reset Default</span>
          </button>
          <button
            onClick={handleSaveForm}
            className="px-5 py-2 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Lampiran</span>
          </button>
        </div>
      </div>

      {/* ── Banner Unit Kerja Aktif ── */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200">
        <div className="flex items-center gap-2.5">
          <Building2 className="h-4 w-4 text-teal-600 shrink-0" />
          <span>
            Unit Kerja Terpilih: <strong>{activeUnit.labelFull}</strong> (Data Target RO & Komponen di bawah akan diintegrasikan langsung ke Kolom Target Bab III)
          </span>
        </div>
        <span className="text-[0.68rem] font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
          Kamus RO TA 2027
        </span>
      </div>

      {/* ── Container Tabel Kamus Rincian Output ── */}
      <div className="aksi-card bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] space-y-4 shadow-sm">
        {/* Judul Dokumen Kamus Sesuai Format Gambar */}
        <div className="text-center py-2 space-y-1">
          <h2 className="text-sm md:text-base font-extrabold uppercase tracking-wide text-[var(--text)]">
            KAMUS RINCIAN OUTPUT PADA {activeUnit.nama.toUpperCase()}
          </h2>
          <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
            TAHUN 2027
          </h3>
        </div>

        {/* Tabel Interaktif dengan Format Putih Polos */}
        <div className="overflow-x-auto border border-[var(--border)] rounded-xl shadow-sm bg-[var(--card)]">
          <table className="w-full text-xs border-collapse">
            <thead>
              {/* Header Baris 1: Putih / Abu Netral */}
              <tr className="bg-slate-100 dark:bg-slate-800 text-[var(--text)] font-bold text-center border-b border-[var(--border)]">
                <th className="p-3 w-32 border-r border-[var(--border)]">
                  Kode<br />Anggaran
                </th>
                <th className="p-3 w-64 border-r border-[var(--border)]">
                  Uraian RO/Komponen
                </th>
                <th className="p-3 w-28 border-r border-[var(--border)]">
                  Jumlah<br />Target
                </th>
                <th className="p-3 w-32 border-r border-[var(--border)]">
                  Satuan Target
                </th>
                <th className="p-3 w-72 border-r border-[var(--border)]">
                  Definisi
                </th>
                <th className="p-3 border-r border-[var(--border)]">
                  Rincian Target
                </th>
                <th className="p-3 w-16 text-center">
                  Aksi
                </th>
              </tr>
              {/* Header Baris 2: Nomor Kolom */}
              <tr className="bg-slate-200/60 dark:bg-slate-800/60 text-[var(--text-muted)] font-bold text-center text-[0.7rem] border-b border-[var(--border)]">
                <th className="py-1 border-r border-[var(--border)]">1</th>
                <th className="py-1 border-r border-[var(--border)]">2</th>
                <th className="py-1 border-r border-[var(--border)]">3</th>
                <th className="py-1 border-r border-[var(--border)]">4</th>
                <th className="py-1 border-r border-[var(--border)]">5</th>
                <th className="py-1 border-r border-[var(--border)]">6</th>
                <th className="py-1">#</th>
              </tr>
            </thead>
            <tbody>
              {kamusRows.map((row) => (
                <tr
                  key={row.id}
                  className="bg-white dark:bg-slate-900 border-b border-[var(--border)] hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Kolom 1: Kode Anggaran (Putih polos) */}
                  <td className="p-2.5 bg-white dark:bg-slate-900 text-[var(--text)] text-center font-bold font-mono align-top border-r border-[var(--border)]">
                    <input
                      type="text"
                      value={row.kode}
                      onChange={(e) => handleUpdateRowField(row.id, "kode", e.target.value)}
                      className="w-full text-center bg-slate-50 dark:bg-slate-800 border border-[var(--border)] rounded px-1 py-1 text-[var(--text)] font-bold font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                    <span className="text-[0.62rem] text-[var(--text-muted)] uppercase tracking-wider block pt-1">
                      {row.level}
                    </span>
                  </td>

                  {/* Kolom 2: Uraian RO / Komponen */}
                  <td className="p-2.5 align-top font-semibold text-[var(--text)] border-r border-[var(--border)]">
                    <textarea
                      rows={2}
                      value={row.uraian}
                      onChange={(e) => handleUpdateRowField(row.id, "uraian", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-[var(--border)] rounded-lg p-2 text-xs text-[var(--text)] font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-y"
                    />
                  </td>

                  {/* Kolom 3: Jumlah Target */}
                  <td className="p-2.5 align-top text-center border-r border-[var(--border)]">
                    <input
                      type="text"
                      value={row.jumlahTarget}
                      onChange={(e) => handleUpdateRowField(row.id, "jumlahTarget", e.target.value)}
                      className="w-full text-center bg-slate-50 dark:bg-slate-800 border border-[var(--border)] rounded-lg p-2 text-xs font-mono font-bold text-[var(--text)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      placeholder="mis. 27 (810)"
                    />
                  </td>

                  {/* Kolom 4: Satuan Target */}
                  <td className="p-2.5 align-top text-center border-r border-[var(--border)]">
                    <input
                      type="text"
                      value={row.satuanTarget}
                      onChange={(e) => handleUpdateRowField(row.id, "satuanTarget", e.target.value)}
                      className="w-full text-center bg-slate-50 dark:bg-slate-800 border border-[var(--border)] rounded-lg p-2 text-xs font-semibold text-[var(--text)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      placeholder="Kegiatan (Orang)"
                    />
                  </td>

                  {/* Kolom 5: Definisi */}
                  <td className="p-2.5 align-top text-[var(--text)] border-r border-[var(--border)]">
                    <textarea
                      rows={3}
                      value={row.definisi}
                      onChange={(e) => handleUpdateRowField(row.id, "definisi", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-[var(--border)] rounded-lg p-2 text-xs text-[var(--text)] leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-y"
                      placeholder="Ketik uraian definisi output..."
                    />
                  </td>

                  {/* Kolom 6: Rincian Target */}
                  <td className="p-2.5 align-top text-[var(--text)] border-r border-[var(--border)]">
                    <textarea
                      rows={3}
                      value={row.rincianTarget}
                      onChange={(e) => handleUpdateRowField(row.id, "rincianTarget", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-[var(--border)] rounded-lg p-2 text-xs text-[var(--text)] leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-y font-sans"
                      placeholder="Ketik rincian target output..."
                    />
                  </td>

                  {/* Aksi */}
                  <td className="p-2.5 align-top text-center">
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
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

        {/* Info Sinkronisasi Otomatis */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-[0.72rem] text-blue-800 dark:text-blue-300">
          <Info className="h-4 w-4 shrink-0 text-blue-600" />
          <span>
            Nilai <strong>Jumlah Target</strong> dan <strong>Satuan Target</strong> pada tabel Kamus Rincian Output ini akan secara otomatis terhubung dan ditampilkan pada kolom <strong>Target</strong> di <strong>Submenu Isian Bab III</strong> (Rekapitulasi Target Output dan Pendanaan Rencana Kerja).
          </span>
        </div>
      </div>
    </div>
  );
}
