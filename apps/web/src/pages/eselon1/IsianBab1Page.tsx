import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Save,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Lock,
  ClipboardList,
  TrendingUp,
  Compass,
  BarChart2,
  Layers,
  BarChart3,
} from "lucide-react";

import RichTextEditor from "../../components/ui/RichTextEditor";
import { sasaranRenjaData, programSasaranRenjaData } from "../../data/sasaranRenjaData";

type SubmenuBab1 = "gambaran-umum" | "capaian-kinerja" | "arah-kebijakan" | "analisis-situasi";

// ─── Tipe data ────────────────────────────────────────────────────────────────
interface HistoriActive {
  id: string;
  kdsatker: string;
  kode_sts_history: string;
  status_histori: string;
  label: string;
  tgl_pengajuan: string;
  is_approved: boolean;
}

interface CapaianRow {
  id: string;
  sasaran_program: string;
  ikp: string;
  tahun: number | "";
  target: number | "";
  realisasi: number | "";
  capaian_pct: number | "";
}

interface TargetKinerjaRow {
  id: string;
  kode: string;
  sasaran_indikator: string;
  target_t1: number | "";
  satuan: string;
}

interface Bab1Data {
  // A
  gambaran_sasaran: string;
  gambaran_program_kerja: string;
  // B
  capaian_rows: CapaianRow[];
  capaian_narasi_th_min1: string;
  capaian_narasi_th_min2: string;
  // C
  arah_narasi_renstra: string;
  target_kinerja_rows: TargetKinerjaRow[];
  // D
  analisis_momentum: string;
  analisis_tantangan: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STORAGE_KEY_ACTIVE = "renja_e1_active_histori";
const STORAGE_KEY_BAB1 = (historiId: string) => `renja_e1_bab1_${historiId}`;

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function newCapaianRow(): CapaianRow {
  return {
    id: genId(),
    sasaran_program: "",
    ikp: "",
    tahun: new Date().getFullYear() - 1,
    target: "",
    realisasi: "",
    capaian_pct: "",
  };
}

function newTargetKinerjaRow(): TargetKinerjaRow {
  return {
    id: genId(),
    kode: "",
    sasaran_indikator: "",
    target_t1: "",
    satuan: "%",
  };
}

const DEFAULT_BAB1: Bab1Data = {
  gambaran_sasaran: "",
  gambaran_program_kerja: "",
  capaian_rows: [newCapaianRow()],
  capaian_narasi_th_min1: "",
  capaian_narasi_th_min2: "",
  arah_narasi_renstra: "",
  target_kinerja_rows: [newTargetKinerjaRow()],
  analisis_momentum: "",
  analisis_tantangan: "",
};

const satuanOptions = ["%", "Dokumen", "Laporan", "Kegiatan", "Orang", "Paket", "Indeks", "Nilai", "Lainnya"];

// Unique Sasaran Program Options Utama (5 BE + 1 WA) dari rekap_sasaran_renja_all.xlsx
const uniqueSasaranProgramList = Array.from(
  new Set(programSasaranRenjaData.map((d) => d.sasaran).filter(Boolean))
);

// ─── Sub-komponen: Header Bagian ─────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  letter,
}: {
  icon: React.ReactNode;
  title: string;
  letter: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-white font-bold text-sm"
        style={{ backgroundColor: "var(--primary)" }}
      >
        {letter}
      </div>
      <div className="flex items-center gap-2">
        <span style={{ color: "var(--primary)" }}>{icon}</span>
        <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>
          {title}
        </h3>
      </div>
    </div>
  );
}

// ─── Sub-komponen: Tombol Simpan ─────────────────────────────────────────────
function SaveButton({
  onClick,
  saved,
  disabled,
  label = "Simpan",
}: {
  onClick: () => void;
  saved: boolean;
  disabled: boolean;
  label?: string;
}) {
  return (
    <div className="flex justify-end mt-4">
      <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all shadow-sm"
        style={{
          backgroundColor: disabled
            ? "var(--border)"
            : saved
            ? "#16a34a"
            : "var(--primary)",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {saved ? (
          <>
            <CheckCircle2 size={16} /> Tersimpan
          </>
        ) : (
          <>
            <Save size={16} /> {label}
          </>
        )}
      </button>
    </div>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function IsianBab1Page() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = (searchParams.get("tab") as SubmenuBab1) || "gambaran-umum";
  const [activeTab, setActiveTab] = useState<SubmenuBab1>(tabParam);

  useEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab") as SubmenuBab1);
    }
  }, [searchParams]);

  function handleTabChange(tab: SubmenuBab1) {
    setActiveTab(tab);
    setSearchParams({ tab });
  }

  const [activeHistori, setActiveHistori] = useState<HistoriActive | null>(null);
  const [bab1, setBab1] = useState<Bab1Data>(DEFAULT_BAB1);

  // Saved state per bagian
  const [savedA, setSavedA] = useState(false);
  const [savedB, setSavedB] = useState(false);
  const [savedC, setSavedC] = useState(false);
  const [savedD, setSavedD] = useState(false);

  const isLocked = !activeHistori || activeHistori.is_approved;

  // ─── Load data dari localStorage ─────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (raw) {
        let h: HistoriActive = JSON.parse(raw);

        // Check if monitoring list has updated approval/owner status
        const monitoringRaw = localStorage.getItem("renja_e1_monitoring_list");
        if (monitoringRaw) {
          const monitoringList = JSON.parse(monitoringRaw);
          const found = monitoringList.find(
            (m: any) => m.id === h.id || m.kodifikasi === h.kode_sts_history
          );
          if (found && found.is_approved) {
            h.is_approved = true;
          }
        }

        setActiveHistori(h);
        // load bab1 data untuk histori ini
        const bab1Raw = localStorage.getItem(STORAGE_KEY_BAB1(h.id));
        if (bab1Raw) {
          setBab1(JSON.parse(bab1Raw));
        } else {
          setBab1(DEFAULT_BAB1);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // ─── Reset saved indicator saat data berubah ────────────────────────────
  const updateBab1 = useCallback(
    (updater: (prev: Bab1Data) => Bab1Data, bagian: "A" | "B" | "C" | "D") => {
      setBab1((prev) => updater(prev));
      if (bagian === "A") setSavedA(false);
      if (bagian === "B") setSavedB(false);
      if (bagian === "C") setSavedC(false);
      if (bagian === "D") setSavedD(false);
    },
    []
  );

  // ─── Simpan ke localStorage ───────────────────────────────────────────────
  function saveBagian(bagian: "A" | "B" | "C" | "D") {
    if (!activeHistori) return;
    localStorage.setItem(STORAGE_KEY_BAB1(activeHistori.id), JSON.stringify(bab1));
    if (bagian === "A") setSavedA(true);
    if (bagian === "B") setSavedB(true);
    if (bagian === "C") setSavedC(true);
    if (bagian === "D") setSavedD(true);
  }

  // ─── Capaian Kinerja helpers ──────────────────────────────────────────────
  function hitungCapaian(target: number | "", realisasi: number | ""): number | "" {
    if (target === "" || realisasi === "" || Number(target) === 0) return "";
    return Math.round((Number(realisasi) / Number(target)) * 10000) / 100;
  }

  function updateCapaianRow(id: string, field: keyof CapaianRow, value: string | number) {
    updateBab1((prev) => {
      const rows = prev.capaian_rows.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        // Jika sasaran_program diubah, reset ikp jika tidak valid
        if (field === "sasaran_program") {
          const validIKPs = sasaranRenjaData
            .filter((d) => d.sasaran === value)
            .map((d) => d.ikp);
          if (!validIKPs.includes(r.ikp)) {
            updated.ikp = validIKPs.length > 0 ? validIKPs[0] : "";
          }
        }
        // Jika ikp dipilih user, sistem memilihkan otomatis Sasaran Program yang sesuai
        if (field === "ikp" && value) {
          const match = sasaranRenjaData.find((d) => d.ikp === value);
          if (match && match.sasaran) {
            updated.sasaran_program = match.sasaran;
          }
        }
        // Auto-hitung capaian_pct
        if (field === "target" || field === "realisasi") {
          updated.capaian_pct = hitungCapaian(
            field === "target" ? (value as number) : r.target,
            field === "realisasi" ? (value as number) : r.realisasi
          );
        }
        return updated;
      });
      return { ...prev, capaian_rows: rows };
    }, "B");
  }

  function addCapaianRow() {
    updateBab1(
      (prev) => ({ ...prev, capaian_rows: [...prev.capaian_rows, newCapaianRow()] }),
      "B"
    );
  }

  function removeCapaianRow(id: string) {
    updateBab1(
      (prev) => ({
        ...prev,
        capaian_rows: prev.capaian_rows.filter((r) => r.id !== id),
      }),
      "B"
    );
  }

  // ─── Target Kinerja helpers ───────────────────────────────────────────────
  function updateTargetRow(id: string, field: keyof TargetKinerjaRow, value: string | number) {
    updateBab1((prev) => {
      const rows = prev.target_kinerja_rows.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      );
      return { ...prev, target_kinerja_rows: rows };
    }, "C");
  }

  function addTargetRow() {
    updateBab1(
      (prev) => ({
        ...prev,
        target_kinerja_rows: [...prev.target_kinerja_rows, newTargetKinerjaRow()],
      }),
      "C"
    );
  }

  function removeTargetRow(id: string) {
    updateBab1(
      (prev) => ({
        ...prev,
        target_kinerja_rows: prev.target_kinerja_rows.filter((r) => r.id !== id),
      }),
      "C"
    );
  }

  // ─── Get IKP options for a given selected Sasaran Program ───────────────
  function getIkpOptionsForSasaran(selectedSasaran: string): string[] {
    if (!selectedSasaran) {
      return Array.from(new Set(sasaranRenjaData.map((d) => d.ikp).filter(Boolean)));
    }
    return Array.from(
      new Set(
        sasaranRenjaData
          .filter((d) => d.sasaran === selectedSasaran)
          .map((d) => d.ikp)
          .filter(Boolean)
      )
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
      {/* ── Header halaman ── */}
      <div className="flex items-center gap-3">
        <BookOpen size={24} style={{ color: "var(--primary)" }} />
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>
            Isian Bab I — Renja Eselon I
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Pendahuluan & Analisis Situasi
          </p>
        </div>
      </div>

      {/* ── Info Histori Aktif ── */}
      {activeHistori ? (
        <div
          className="flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm"
          style={{
            borderColor: activeHistori.is_approved ? "#f59e0b" : "var(--primary)",
            backgroundColor: activeHistori.is_approved
              ? "#fffbeb"
              : "var(--primary-bg)",
          }}
        >
          {activeHistori.is_approved ? (
            <Lock size={18} className="text-amber-500 flex-shrink-0" />
          ) : (
            <CheckCircle2
              size={18}
              style={{ color: "var(--primary)" }}
              className="flex-shrink-0"
            />
          )}
          <div className="text-sm">
            <span className="font-semibold" style={{ color: "var(--text)" }}>
              Histori Aktif:
            </span>{" "}
            <span style={{ color: "var(--text)" }}>{activeHistori.label}</span>
            <span className="mx-2 opacity-40">|</span>
            <span style={{ color: "var(--text-muted)" }}>
              Unit Kerja: {activeHistori.kdsatker}
            </span>
            <span className="mx-2 opacity-40">|</span>
            <span style={{ color: "var(--text-muted)" }}>
              {new Date(activeHistori.tgl_pengajuan).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
            {activeHistori.is_approved && (
              <span className="ml-3 text-amber-600 font-semibold">
                ⚠ Data telah disetujui & dikirim ke BINCANG (Form Terkunci/Readonly). Buat histori baru di Pilih Histori untuk mengisi kembali.
              </span>
            )}
          </div>
        </div>
      ) : (
        <div
          className="flex items-center gap-3 rounded-xl border px-4 py-3"
          style={{ borderColor: "#f87171", backgroundColor: "#fef2f2" }}
        >
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-700">
            Belum ada histori aktif. Silakan buat histori terlebih dahulu di menu{" "}
            <strong>Pilih Histori</strong> sebelum mengisi Bab I.
          </p>
        </div>
      )}

      {/* ── Navigation Submenu Tabs (4 Submenu Paging) ── */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto scrollbar-none whitespace-nowrap">
        {[
          { id: "gambaran-umum", label: "1. Gambaran Umum", icon: ClipboardList },
          { id: "capaian-kinerja", label: "2. Capaian Kinerja", icon: TrendingUp },
          { id: "arah-kebijakan", label: "3. Arah Kebijakan, Strategi, & Target Kinerja", icon: Compass },
          { id: "analisis-situasi", label: "4. Analisis Situasi", icon: BarChart2 },
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

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* BAGIAN A — GAMBARAN UMUM                                           */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "gambaran-umum" && (
        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
        >
          <SectionHeader
            icon={<ClipboardList size={18} />}
            letter="A"
            title="Gambaran Umum"
          />

          <RichTextEditor
            label="Sasaran yang akan dicapai tahun berikutnya"
            value={bab1.gambaran_sasaran}
            onChange={(v) =>
              updateBab1((prev) => ({ ...prev, gambaran_sasaran: v }), "A")
            }
            disabled={isLocked}
            placeholder="Ketik sasaran yang akan dicapai tahun berikutnya..."
            minHeight="120px"
          />

          <RichTextEditor
            label="Program kerja prioritas dan rutin tahun berikutnya"
            value={bab1.gambaran_program_kerja}
            onChange={(v) =>
              updateBab1((prev) => ({ ...prev, gambaran_program_kerja: v }), "A")
            }
            disabled={isLocked}
            placeholder="Ketik program kerja prioritas dan rutin tahun berikutnya..."
            minHeight="120px"
          />

          <SaveButton
            onClick={() => saveBagian("A")}
            saved={savedA}
            disabled={isLocked}
            label="Simpan Bagian A"
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* BAGIAN B — CAPAIAN KINERJA                                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "capaian-kinerja" && (
        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
        >
          <SectionHeader
            icon={<TrendingUp size={18} />}
            letter="B"
            title="Capaian Kinerja"
          />

          {/* Tabel Capaian */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border-collapse min-w-[800px]">
              <thead>
                <tr style={{ backgroundColor: "var(--primary-bg)" }}>
                  {["Sasaran Program", "IKP", "Tahun", "Target", "Realisasi", "Capaian (%)", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-3 py-2 font-semibold text-xs border-b"
                        style={{ borderColor: "var(--border)", color: "var(--text)" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {bab1.capaian_rows.map((row, idx) => {
                  const ikpList = getIkpOptionsForSasaran(row.sasaran_program);
                  return (
                    <tr
                      key={row.id}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "var(--card)" : "var(--primary-bg)",
                      }}
                    >
                      {/* Sasaran Program */}
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                        <select
                          value={row.sasaran_program}
                          disabled={isLocked}
                          onChange={(e) =>
                            updateCapaianRow(row.id, "sasaran_program", e.target.value)
                          }
                          className="w-full rounded border px-2 py-1 text-xs focus:outline-none"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: isLocked ? "var(--primary-bg)" : "var(--card)",
                            color: "var(--text)",
                            minWidth: 200,
                          }}
                        >
                          <option value="">-- Pilih Sasaran Program --</option>
                          {uniqueSasaranProgramList.map((sp) => (
                            <option key={sp} value={sp}>
                              {sp}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* IKP (Indikator Kinerja Program) - Dynamically Filtered */}
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                        <select
                          value={row.ikp}
                          disabled={isLocked}
                          onChange={(e) => updateCapaianRow(row.id, "ikp", e.target.value)}
                          className="w-full rounded border px-2 py-1 text-xs focus:outline-none"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: isLocked ? "var(--primary-bg)" : "var(--card)",
                            color: "var(--text)",
                            minWidth: 220,
                          }}
                        >
                          <option value="">-- Pilih IKP --</option>
                          {ikpList.map((ikpItem) => (
                            <option key={ikpItem} value={ikpItem}>
                              {ikpItem}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Tahun */}
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                        <input
                          type="number"
                          value={row.tahun}
                          disabled={isLocked}
                          onChange={(e) =>
                            updateCapaianRow(row.id, "tahun", parseInt(e.target.value) || "")
                          }
                          className="w-full rounded border px-2 py-1 text-xs text-center focus:outline-none"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: isLocked ? "var(--primary-bg)" : "var(--card)",
                            color: "var(--text)",
                            width: 65,
                          }}
                        />
                      </td>

                      {/* Target */}
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                        <input
                          type="number"
                          step="0.01"
                          value={row.target}
                          disabled={isLocked}
                          onChange={(e) =>
                            updateCapaianRow(
                              row.id,
                              "target",
                              e.target.value === "" ? "" : parseFloat(e.target.value)
                            )
                          }
                          className="w-full rounded border px-2 py-1 text-xs text-right focus:outline-none"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: isLocked ? "var(--primary-bg)" : "var(--card)",
                            color: "var(--text)",
                            width: 85,
                          }}
                        />
                      </td>

                      {/* Realisasi */}
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                        <input
                          type="number"
                          step="0.01"
                          value={row.realisasi}
                          disabled={isLocked}
                          onChange={(e) =>
                            updateCapaianRow(
                              row.id,
                              "realisasi",
                              e.target.value === "" ? "" : parseFloat(e.target.value)
                            )
                          }
                          className="w-full rounded border px-2 py-1 text-xs text-right focus:outline-none"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: isLocked ? "var(--primary-bg)" : "var(--card)",
                            color: "var(--text)",
                            width: 85,
                          }}
                        />
                      </td>

                      {/* Capaian % — read only, auto-kalkulasi */}
                      <td className="px-2 py-1.5 border-b text-center" style={{ borderColor: "var(--border)" }}>
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
                          style={{
                            backgroundColor:
                              row.capaian_pct === ""
                                ? "var(--primary-bg)"
                                : Number(row.capaian_pct) >= 100
                                ? "#dcfce7"
                                : Number(row.capaian_pct) >= 80
                                ? "#fef9c3"
                                : "#fee2e2",
                            color:
                              row.capaian_pct === ""
                                ? "var(--text-muted)"
                                : Number(row.capaian_pct) >= 100
                                ? "#15803d"
                                : Number(row.capaian_pct) >= 80
                                ? "#854d0e"
                                : "#b91c1c",
                          }}
                        >
                          {row.capaian_pct === "" ? "—" : `${row.capaian_pct}%`}
                        </span>
                      </td>

                      {/* Hapus baris */}
                      <td className="px-2 py-1.5 border-b text-center" style={{ borderColor: "var(--border)" }}>
                        <button
                          onClick={() => removeCapaianRow(row.id)}
                          disabled={isLocked || bab1.capaian_rows.length === 1}
                          className="p-1 rounded transition-colors hover:bg-red-50"
                          title="Hapus baris"
                        >
                          <Trash2
                            size={14}
                            className={
                              isLocked || bab1.capaian_rows.length === 1
                                ? "text-gray-300"
                                : "text-red-400"
                            }
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tombol tambah baris */}
          <button
            onClick={addCapaianRow}
            disabled={isLocked}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors mb-5"
            style={{
              borderColor: isLocked ? "var(--border)" : "var(--primary)",
              color: isLocked ? "var(--text-muted)" : "var(--primary)",
              backgroundColor: "transparent",
              cursor: isLocked ? "not-allowed" : "pointer",
            }}
          >
            <Plus size={14} />
            Tambah Baris
          </button>

          {/* Narasi T-1 dan T-2 */}
          <RichTextEditor
            label="Narasi penjelasan capaian kinerja T-1 (satu tahun sebelumnya)"
            value={bab1.capaian_narasi_th_min1}
            onChange={(v) =>
              updateBab1((prev) => ({ ...prev, capaian_narasi_th_min1: v }), "B")
            }
            disabled={isLocked}
            placeholder="Ketik narasi penjelasan capaian kinerja T-1..."
            minHeight="100px"
          />
          <RichTextEditor
            label="Narasi penjelasan capaian kinerja T-2 (dua tahun sebelumnya)"
            value={bab1.capaian_narasi_th_min2}
            onChange={(v) =>
              updateBab1((prev) => ({ ...prev, capaian_narasi_th_min2: v }), "B")
            }
            disabled={isLocked}
            placeholder="Ketik narasi penjelasan capaian kinerja T-2..."
            minHeight="100px"
          />

          <SaveButton
            onClick={() => saveBagian("B")}
            saved={savedB}
            disabled={isLocked}
            label="Simpan Bagian B"
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* BAGIAN C — ARAH KEBIJAKAN, STRATEGI, DAN TARGET KINERJA            */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "arah-kebijakan" && (
        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
        >
          <SectionHeader
            icon={<Compass size={18} />}
            letter="C"
            title="Arah Kebijakan, Strategi, dan Target Kinerja"
          />

          <RichTextEditor
            label="Narasi implementasi Renstra PPATK 2025–2029"
            value={bab1.arah_narasi_renstra}
            onChange={(v) =>
              updateBab1((prev) => ({ ...prev, arah_narasi_renstra: v }), "C")
            }
            disabled={isLocked}
            placeholder="Ketik narasi implementasi Renstra PPATK 2025-2029..."
            minHeight="120px"
          />

          {/* Tabel Target Indikator Kinerja T+1 */}
          <div className="mb-2">
            <p className="text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
              Tabel Target Indikator Kinerja Tahun T+1
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "var(--primary-bg)" }}>
                    {["Kode", "Sasaran / Indikator", "Target T+1", "Satuan", ""].map((h) => (
                      <th
                        key={h}
                        className="text-left px-3 py-2 font-semibold text-xs border-b"
                        style={{ borderColor: "var(--border)", color: "var(--text)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bab1.target_kinerja_rows.map((row, idx) => (
                    <tr
                      key={row.id}
                      style={{
                        backgroundColor:
                          idx % 2 === 0 ? "var(--card)" : "var(--primary-bg)",
                      }}
                    >
                      {/* Kode */}
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                        <input
                          type="text"
                          value={row.kode}
                          disabled={isLocked}
                          onChange={(e) => updateTargetRow(row.id, "kode", e.target.value)}
                          placeholder="mis. SS.01"
                          className="rounded border px-2 py-1 text-xs focus:outline-none"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: isLocked ? "var(--primary-bg)" : "var(--card)",
                            color: "var(--text)",
                            width: 90,
                          }}
                        />
                      </td>

                      {/* Sasaran / Indikator */}
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                        <input
                          type="text"
                          value={row.sasaran_indikator}
                          disabled={isLocked}
                          onChange={(e) =>
                            updateTargetRow(row.id, "sasaran_indikator", e.target.value)
                          }
                          placeholder="Uraian sasaran atau indikator"
                          className="w-full rounded border px-2 py-1 text-xs focus:outline-none"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: isLocked ? "var(--primary-bg)" : "var(--card)",
                            color: "var(--text)",
                            minWidth: 240,
                          }}
                        />
                      </td>

                      {/* Target T+1 */}
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                        <input
                          type="number"
                          step="0.01"
                          value={row.target_t1}
                          disabled={isLocked}
                          onChange={(e) =>
                            updateTargetRow(
                              row.id,
                              "target_t1",
                              e.target.value === "" ? "" : parseFloat(e.target.value)
                            )
                          }
                          className="rounded border px-2 py-1 text-xs text-right focus:outline-none"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: isLocked ? "var(--primary-bg)" : "var(--card)",
                            color: "var(--text)",
                            width: 90,
                          }}
                        />
                      </td>

                      {/* Satuan */}
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                        <select
                          value={row.satuan}
                          disabled={isLocked}
                          onChange={(e) => updateTargetRow(row.id, "satuan", e.target.value)}
                          className="rounded border px-2 py-1 text-xs focus:outline-none"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: isLocked ? "var(--primary-bg)" : "var(--card)",
                            color: "var(--text)",
                            width: 110,
                          }}
                        >
                          {satuanOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Hapus */}
                      <td className="px-2 py-1.5 border-b text-center" style={{ borderColor: "var(--border)" }}>
                        <button
                          onClick={() => removeTargetRow(row.id)}
                          disabled={isLocked || bab1.target_kinerja_rows.length === 1}
                          className="p-1 rounded hover:bg-red-50 transition-colors"
                          title="Hapus baris"
                        >
                          <Trash2
                            size={14}
                            className={
                              isLocked || bab1.target_kinerja_rows.length === 1
                                ? "text-gray-300"
                                : "text-red-400"
                            }
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={addTargetRow}
            disabled={isLocked}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors mb-4"
            style={{
              borderColor: isLocked ? "var(--border)" : "var(--primary)",
              color: isLocked ? "var(--text-muted)" : "var(--primary)",
              backgroundColor: "transparent",
              cursor: isLocked ? "not-allowed" : "pointer",
            }}
          >
            <Plus size={14} />
            Tambah Baris
          </button>

          {/* Pratinjau Format Cetak Dokumen Resmi (3 Kolom Sesuai Gambar Standar PPATK) */}
          <div className="pt-5 border-t mb-5 space-y-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Pratinjau Format Cetak Dokumen Resmi (Standar PPATK)
                </h4>
                <p className="text-[0.68rem] text-[var(--text-muted)]">
                  Format tabel 3 kolom saat dokumen dicetak (memuat seluruh level: SS, SP, Sasaran Kegiatan, &amp; IKK)
                </p>
              </div>
              <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
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
                  <tr>
                    <td className="p-2 border border-slate-900 text-center font-bold align-middle">
                      SS.1
                    </td>
                    <td className="border border-slate-900 p-0 align-top">
                      <div className="p-2.5 font-bold text-slate-900 leading-snug">
                        Meningkatnya Efektivitas Kinerja PPATK dalam Pencegahan dan Pemberantasan TPPU, TPPT, dan PPSPM
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
                        6,8
                      </div>
                    </td>
                  </tr>

                  {/* Row SP */}
                  <tr>
                    <td className="p-2 border border-slate-900 text-center font-bold align-middle">
                      SP.1
                    </td>
                    <td className="border border-slate-900 p-0 align-top">
                      <div className="p-2.5 font-bold text-slate-900 leading-snug">
                        Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pemberantasan TPPU, TPPT, dan PPSPM
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
                        5
                      </div>
                    </td>
                  </tr>

                  {/* Divider Row: Sasaran Kegiatan */}
                  <tr>
                    <td className="p-2 border border-slate-900"></td>
                    <td className="p-2 border border-slate-900 font-medium">
                      <span className="underline">Sasaran Kegiatan:</span>
                    </td>
                    <td className="p-2 border border-slate-900"></td>
                  </tr>

                  {/* Row SK & IKK */}
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
                </tbody>
              </table>
            </div>
          </div>

          <SaveButton
            onClick={() => saveBagian("C")}
            saved={savedC}
            disabled={isLocked}
            label="Simpan Bagian C"
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* BAGIAN D — ANALISIS SITUASI                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "analisis-situasi" && (
        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
        >
          <SectionHeader
            icon={<BarChart2 size={18} />}
            letter="D"
            title="Analisis Situasi"
          />

          <RichTextEditor
            label="Momentum dan peluang"
            value={bab1.analisis_momentum}
            onChange={(v) =>
              updateBab1((prev) => ({ ...prev, analisis_momentum: v }), "D")
            }
            disabled={isLocked}
            placeholder="Ketik momentum dan peluang..."
            minHeight="120px"
          />

          <RichTextEditor
            label="Tantangan dan permasalahan"
            value={bab1.analisis_tantangan}
            onChange={(v) =>
              updateBab1((prev) => ({ ...prev, analisis_tantangan: v }), "D")
            }
            disabled={isLocked}
            placeholder="Ketik tantangan dan permasalahan..."
            minHeight="120px"
          />

          <SaveButton
            onClick={() => saveBagian("D")}
            saved={savedD}
            disabled={isLocked}
            label="Simpan Bagian D"
          />
        </div>
      )}
    </div>
  );
}
