import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Save,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Users,
  Briefcase,
  Plus,
  Minus,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
} from "lucide-react";

import RichTextEditor from "../../components/ui/RichTextEditor";

// ─── Tipe Data ────────────────────────────────────────────────────────────────
interface HistoriActive {
  id: string;
  kdsatker: string;
  kode_sts_history: string;
  status_histori: string;
  label: string;
  tgl_pengajuan: string;
  is_approved: boolean;
}

interface PaketProker {
  id: string;
  nomenklatur: string;
  uraian: string;
  tujuan: string;
  outcome: string;
  jenis_program_kerja: string;
  saved?: boolean;
}

interface Bab2Data {
  // Bagian 1
  pengantar_program_kerja: string;
  // Bagian 2
  ada_proker_lintas_unit: boolean;
  jumlah_proker_lintas_unit: number;
  active_lintas_page: number; // 1-indexed (Halaman aktif Bagian 2)
  unlocked_lintas_index: number; // Max page yang sudah terbuka
  proker_lintas_list: PaketProker[];
  // Bagian 3
  jumlah_proker_unit_kerja: number;
  active_unit_page: number; // 1-indexed (Halaman aktif Bagian 3)
  unlocked_unit_index: number; // Max page yang sudah terbuka
  proker_unit_list: PaketProker[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STORAGE_KEY_ACTIVE = "renja_e1_active_histori";
const STORAGE_KEY_BAB2 = (historiId: string) => `renja_e1_bab2_${historiId}`;

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function createDefaultPaket(): PaketProker {
  return {
    id: genId(),
    nomenklatur: "",
    uraian: "",
    tujuan: "",
    outcome: "",
    jenis_program_kerja: "",
    saved: false,
  };
}

const DEFAULT_BAB2: Bab2Data = {
  pengantar_program_kerja: "",
  ada_proker_lintas_unit: false,
  jumlah_proker_lintas_unit: 1,
  active_lintas_page: 1,
  unlocked_lintas_index: 1,
  proker_lintas_list: [createDefaultPaket()],
  jumlah_proker_unit_kerja: 1,
  active_unit_page: 1,
  unlocked_unit_index: 1,
  proker_unit_list: [createDefaultPaket()],
};

// ─── Sub-komponen: Header Bagian ─────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  number,
}: {
  icon: React.ReactNode;
  title: string;
  number: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-white font-bold text-sm"
        style={{ backgroundColor: "var(--primary)" }}
      >
        {number}
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

// ─── Sub-komponen: Tombol Simpan Bagian 1 ────────────────────────────────────
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

// ─── Komponen Utama Isian Bab II ──────────────────────────────────────────────
export default function IsianBab2Page() {
  const [activeHistori, setActiveHistori] = useState<HistoriActive | null>(null);
  const [bab2, setBab2] = useState<Bab2Data>(DEFAULT_BAB2);

  // Saved indicators per bagian
  const [saved1, setSaved1] = useState(false);
  const [saved2, setSaved2] = useState(false);
  const [saved3, setSaved3] = useState(false);

  // Toast feedback notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Pop-Up Dialog State saat merubah YA ke TIDAK
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  const isLocked = !activeHistori || activeHistori.is_approved;

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handler saat merubah pilihan YA ke TIDAK pada Program Kerja Lintas Unit Kerja
  function handleSelectTidakProkerLintas() {
    if (isLocked) return;

    // Cek apakah ada data yang pernah diisi / disimpan
    const hasData = bab2.proker_lintas_list.some(
      (pkt) =>
        pkt.saved ||
        pkt.nomenklatur.trim() !== "" ||
        pkt.uraian.trim() !== "" ||
        pkt.tujuan.trim() !== "" ||
        pkt.outcome.trim() !== "" ||
        pkt.jenis_program_kerja.trim() !== ""
    );

    if (hasData) {
      setShowConfirmDeleteModal(true);
    } else {
      updateBab2((prev) => ({ ...prev, ada_proker_lintas_unit: false }), 2);
    }
  }

  // Jika user memilih YA pada Pop-Up -> Data dihapus permanen
  function handleConfirmDeleteData() {
    setShowConfirmDeleteModal(false);
    updateBab2(
      (prev) => ({
        ...prev,
        ada_proker_lintas_unit: false,
        jumlah_proker_lintas_unit: 1,
        active_lintas_page: 1,
        unlocked_lintas_index: 1,
        proker_lintas_list: [createDefaultPaket()],
      }),
      2
    );

    if (activeHistori) {
      setTimeout(() => {
        setBab2((latest) => {
          localStorage.setItem(STORAGE_KEY_BAB2(activeHistori.id), JSON.stringify(latest));
          return latest;
        });
      }, 50);
    }
    setToastMessage("Data Program Kerja Lintas Unit Kerja telah dihapus permanen.");
  }

  // Jika user memilih TIDAK pada Pop-Up -> Data hanya menjadi cache sementara & hilang saat log out
  function handleConfirmCacheData() {
    setShowConfirmDeleteModal(false);
    updateBab2((prev) => ({ ...prev, ada_proker_lintas_unit: false }), 2);
    setToastMessage("Data disimpan sebagai cache sementara & akan hilang saat log out.");
  }

  // ─── Load state dari localStorage ─────────────────────────────────────────
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

        const bab2Raw = localStorage.getItem(STORAGE_KEY_BAB2(h.id));
        if (bab2Raw) {
          const parsed: Bab2Data = JSON.parse(bab2Raw);
          parsed.active_lintas_page = parsed.active_lintas_page || 1;
          parsed.unlocked_lintas_index = parsed.unlocked_lintas_index || 1;
          parsed.active_unit_page = parsed.active_unit_page || 1;
          parsed.unlocked_unit_index = parsed.unlocked_unit_index || 1;
          setBab2(parsed);
        } else {
          setBab2(DEFAULT_BAB2);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // ─── Helper Updater ───────────────────────────────────────────────────────
  const updateBab2 = useCallback(
    (updater: (prev: Bab2Data) => Bab2Data, bagian: 1 | 2 | 3) => {
      setBab2((prev) => updater(prev));
      if (bagian === 1) setSaved1(false);
      if (bagian === 2) setSaved2(false);
      if (bagian === 3) setSaved3(false);
    },
    []
  );

  // ─── Save Bagian 1 ke localStorage ────────────────────────────────────────
  function saveBagian1() {
    if (!activeHistori) return;
    localStorage.setItem(STORAGE_KEY_BAB2(activeHistori.id), JSON.stringify(bab2));
    setSaved1(true);
    setToastMessage("Bagian 1: Narasi Pengantar Program Kerja berhasil disimpan!");
  }

  // ─── Save Paket Lintas Unit Kerja & Pindah Halaman ───────────────────────
  function handleSavePaketLintas(idx: number) {
    if (!activeHistori) return;
    const pageNum = idx + 1; // 1-indexed
    const isLastPage = pageNum >= bab2.jumlah_proker_lintas_unit;
    const nextPage = isLastPage ? pageNum : pageNum + 1;

    updateBab2((prev) => {
      const updatedList = prev.proker_lintas_list.map((pkt, i) =>
        i === idx ? { ...pkt, saved: true } : pkt
      );
      const newUnlocked = isLastPage
        ? prev.jumlah_proker_lintas_unit
        : Math.max(prev.unlocked_lintas_index, pageNum + 1);

      return {
        ...prev,
        proker_lintas_list: updatedList,
        unlocked_lintas_index: newUnlocked,
        active_lintas_page: nextPage,
      };
    }, 2);

    setTimeout(() => {
      setBab2((latest) => {
        localStorage.setItem(STORAGE_KEY_BAB2(activeHistori.id), JSON.stringify(latest));
        return latest;
      });
    }, 50);

    if (isLastPage) {
      setSaved2(true);
      setToastMessage(`Program ke-${pageNum} tersimpan! Semua ${bab2.jumlah_proker_lintas_unit} Program Kerja Lintas Unit Kerja telah diselesaikan.`);
    } else {
      setToastMessage(`Program ke-${pageNum} tersimpan! Otomatis pindah ke Program ke-${nextPage}.`);
    }
  }

  // ─── Save Paket Unit Kerja & Pindah Halaman ──────────────────────────────
  function handleSavePaketUnit(idx: number) {
    if (!activeHistori) return;
    const pageNum = idx + 1; // 1-indexed
    const isLastPage = pageNum >= bab2.jumlah_proker_unit_kerja;
    const nextPage = isLastPage ? pageNum : pageNum + 1;

    updateBab2((prev) => {
      const updatedList = prev.proker_unit_list.map((pkt, i) =>
        i === idx ? { ...pkt, saved: true } : pkt
      );
      const newUnlocked = isLastPage
        ? prev.jumlah_proker_unit_kerja
        : Math.max(prev.unlocked_unit_index, pageNum + 1);

      return {
        ...prev,
        proker_unit_list: updatedList,
        unlocked_unit_index: newUnlocked,
        active_unit_page: nextPage,
      };
    }, 3);

    setTimeout(() => {
      setBab2((latest) => {
        localStorage.setItem(STORAGE_KEY_BAB2(activeHistori.id), JSON.stringify(latest));
        return latest;
      });
    }, 50);

    if (isLastPage) {
      setSaved3(true);
      setToastMessage(`Program ke-${pageNum} tersimpan! Semua ${bab2.jumlah_proker_unit_kerja} Program Kerja Unit Kerja telah diselesaikan.`);
    } else {
      setToastMessage(`Program ke-${pageNum} tersimpan! Otomatis pindah ke Program ke-${nextPage}.`);
    }
  }

  // ─── Adjust jumlah paket Lintas Unit Kerja ────────────────────────────────
  function handleJumlahLintasChange(count: number) {
    const newCount = Math.max(1, count);
    updateBab2((prev) => {
      const currentList = [...prev.proker_lintas_list];
      if (newCount > currentList.length) {
        const diff = newCount - currentList.length;
        for (let i = 0; i < diff; i++) {
          currentList.push(createDefaultPaket());
        }
      } else if (newCount < currentList.length) {
        currentList.splice(newCount);
      }
      const newActivePage = Math.min(prev.active_lintas_page, newCount);
      return {
        ...prev,
        jumlah_proker_lintas_unit: newCount,
        active_lintas_page: newActivePage,
        proker_lintas_list: currentList,
      };
    }, 2);
  }

  function updatePaketLintas(id: string, field: keyof PaketProker, value: string) {
    updateBab2((prev) => {
      const updatedList = prev.proker_lintas_list.map((pkt) =>
        pkt.id === id ? { ...pkt, [field]: value, saved: false } : pkt
      );
      return { ...prev, proker_lintas_list: updatedList };
    }, 2);
  }

  // ─── Adjust jumlah paket Unit Kerja ───────────────────────────────────────
  function handleJumlahUnitChange(count: number) {
    const newCount = Math.max(1, count);
    updateBab2((prev) => {
      const currentList = [...prev.proker_unit_list];
      if (newCount > currentList.length) {
        const diff = newCount - currentList.length;
        for (let i = 0; i < diff; i++) {
          currentList.push(createDefaultPaket());
        }
      } else if (newCount < currentList.length) {
        currentList.splice(newCount);
      }
      const newActivePage = Math.min(prev.active_unit_page, newCount);
      return {
        ...prev,
        jumlah_proker_unit_kerja: newCount,
        active_unit_page: newActivePage,
        proker_unit_list: currentList,
      };
    }, 3);
  }

  function updatePaketUnit(id: string, field: keyof PaketProker, value: string) {
    updateBab2((prev) => {
      const updatedList = prev.proker_unit_list.map((pkt) =>
        pkt.id === id ? { ...pkt, [field]: value, saved: false } : pkt
      );
      return { ...prev, proker_unit_list: updatedList };
    }, 3);
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-600 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-xl animate-fade-in">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Pop-up Dialog Konfirmasi Hapus Data saat merubah YA ke TIDAK */}
      {showConfirmDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div
            className="rounded-2xl p-6 max-w-md w-full shadow-2xl border space-y-4"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle size={24} />
              <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>
                Konfirmasi Hapus Data
              </h3>
            </div>
            
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              Apakah data yang telah disimpan akan dihapus?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              {/* Tombol TIDAK -> Data menjadi cache sementara */}
              <button
                type="button"
                onClick={handleConfirmCacheData}
                className="px-4 py-2 rounded-lg text-xs font-semibold border transition-colors shadow-sm"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--primary-bg)",
                  color: "var(--text)",
                }}
              >
                TIDAK (Cache Sementara)
              </button>

              {/* Tombol YA -> Data dihapus permanen */}
              <button
                type="button"
                onClick={handleConfirmDeleteData}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                YA (Hapus Permanen)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex items-center gap-3">
        <BookOpen size={24} style={{ color: "var(--primary)" }} />
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>
            Isian Bab II — Renja Eselon I
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Program Kerja & Indikator Kinerja
          </p>
        </div>
      </div>

      {/* Info Histori Aktif Banner */}
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
            <strong>Pilih Histori</strong> sebelum mengisi Bab II.
          </p>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* BAGIAN 1 — NARASI PENGANTAR PROGRAM KERJA                           */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl border p-5 shadow-sm"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <SectionHeader
          icon={<Layers size={18} />}
          number="1"
          title="Narasi Pengantar Program Kerja"
        />

        <RichTextEditor
          label="Narasi Pengantar Program Kerja"
          value={bab2.pengantar_program_kerja}
          onChange={(v) =>
            updateBab2((prev) => ({ ...prev, pengantar_program_kerja: v }), 1)
          }
          disabled={isLocked}
          placeholder="Ketik narasi pengantar program kerja di sini..."
          minHeight="140px"
        />

        <SaveButton
          onClick={saveBagian1}
          saved={saved1}
          disabled={isLocked}
          label="Simpan Bagian 1"
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* BAGIAN 2 — PROGRAM KERJA LINTAS UNIT KERJA                           */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl border p-5 shadow-sm"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <SectionHeader
          icon={<Users size={18} />}
          number="2"
          title="Program Kerja Lintas Unit Kerja"
        />

        {/* Pertanyaan: Apakah terdapat Program Kerja Lintas Unit Kerja? */}
        <div
          className="rounded-xl border p-4 mb-5"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--primary-bg)",
          }}
        >
          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>
            Apakah terdapat Program Kerja Lintas Unit Kerja?
          </label>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="ada_proker_lintas"
                checked={bab2.ada_proker_lintas_unit === true}
                onChange={() =>
                  updateBab2((prev) => ({ ...prev, ada_proker_lintas_unit: true }), 2)
                }
                disabled={isLocked}
                className="w-4 h-4 text-blue-600"
              />
              <span className="font-semibold text-gray-800">YA</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="ada_proker_lintas"
                checked={bab2.ada_proker_lintas_unit === false}
                onChange={handleSelectTidakProkerLintas}
                disabled={isLocked}
                className="w-4 h-4 text-blue-600"
              />
              <span className="font-semibold text-gray-800">TIDAK</span>
            </label>
          </div>
        </div>

        {/* Jika YA, tampilkan paket box isian secara RINGKAS dengan 4 TOMBOL NAVIGASI */}
        {bab2.ada_proker_lintas_unit ? (
          <div className="space-y-5">
            {/* Input Numerik & 4 Tombol Navigasi Ringkas: [Sebelum] [Posisi Aktif] [Lanjut] [Akhir] */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-blue-50/70 p-3.5 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-800">
                  Jumlah Program Kerja Lintas Unit Kerja:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isLocked || bab2.jumlah_proker_lintas_unit <= 1}
                    onClick={() =>
                      handleJumlahLintasChange(bab2.jumlah_proker_lintas_unit - 1)
                    }
                    className="p-1 rounded border bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <Minus size={14} />
                  </button>

                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={bab2.jumlah_proker_lintas_unit}
                    disabled={isLocked}
                    onChange={(e) =>
                      handleJumlahLintasChange(parseInt(e.target.value) || 1)
                    }
                    className="w-16 rounded border px-2 py-1 text-sm font-extrabold text-center focus:outline-none shadow-sm"
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      borderColor: "#cbd5e1",
                    }}
                  />

                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() =>
                      handleJumlahLintasChange(bab2.jumlah_proker_lintas_unit + 1)
                    }
                    className="p-1 rounded border bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* 4 TOMBOL NAVIGASI RINGKAS: Sebelum | Posisi Aktif | Lanjut | Akhir */}
              <div className="flex items-center gap-2">
                {/* 1. Sebelum */}
                <button
                  type="button"
                  disabled={bab2.active_lintas_page <= 1}
                  onClick={() =>
                    updateBab2(
                      (prev) => ({
                        ...prev,
                        active_lintas_page: Math.max(1, prev.active_lintas_page - 1),
                      }),
                      2
                    )
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 shadow-sm"
                >
                  <ChevronLeft size={14} /> Sebelum
                </button>

                {/* 2. Posisi Input Program Aktif */}
                <div className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm flex items-center gap-1.5">
                  <span>Program {bab2.active_lintas_page}</span>
                  <span className="opacity-75">/ {bab2.jumlah_proker_lintas_unit}</span>
                </div>

                {/* 3. Lanjut */}
                <button
                  type="button"
                  disabled={
                    bab2.active_lintas_page >= bab2.jumlah_proker_lintas_unit ||
                    bab2.active_lintas_page + 1 > bab2.unlocked_lintas_index
                  }
                  onClick={() =>
                    updateBab2(
                      (prev) => ({
                        ...prev,
                        active_lintas_page: Math.min(
                          prev.jumlah_proker_lintas_unit,
                          prev.active_lintas_page + 1
                        ),
                      }),
                      2
                    )
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 shadow-sm"
                >
                  Lanjut <ChevronRight size={14} />
                </button>

                {/* 4. Akhir */}
                <button
                  type="button"
                  disabled={
                    bab2.active_lintas_page >= bab2.jumlah_proker_lintas_unit ||
                    bab2.unlocked_lintas_index < bab2.jumlah_proker_lintas_unit
                  }
                  onClick={() =>
                    updateBab2(
                      (prev) => ({
                        ...prev,
                        active_lintas_page: Math.min(
                          prev.jumlah_proker_lintas_unit,
                          prev.unlocked_lintas_index
                        ),
                      }),
                      2
                    )
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 shadow-sm"
                >
                  Akhir <ChevronsRight size={14} />
                </button>
              </div>
            </div>

            {/* JENDELA TUNGGAL: Hanya menampilkan Program Kerja ke-[active_lintas_page] */}
            {(() => {
              const currentIdx = bab2.active_lintas_page - 1;
              const paket = bab2.proker_lintas_list[currentIdx] || createDefaultPaket();

              return (
                <div
                  className="rounded-xl border p-5 space-y-4 shadow-sm"
                  style={{
                    borderColor: "var(--primary)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="text-base font-bold text-[var(--primary)] flex items-center gap-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {bab2.active_lintas_page}
                      </span>
                      Program Kerja Lintas Unit Kerja ke-{bab2.active_lintas_page}
                    </h4>

                    {paket.saved ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <Check size={14} /> Tersimpan
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-medium">
                        Belum Disimpan
                      </span>
                    )}
                  </div>

                  {/* Nomenklatur Program Kerja Lintas Unit Kerja */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700">
                      Nomenklatur Program Kerja Lintas Unit Kerja
                    </label>
                    <input
                      type="text"
                      value={paket.nomenklatur}
                      disabled={isLocked}
                      onChange={(e) =>
                        updatePaketLintas(paket.id, "nomenklatur", e.target.value)
                      }
                      placeholder={`Ketik Nomenklatur Program Kerja Lintas Unit Kerja ke-${bab2.active_lintas_page}...`}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: isLocked ? "var(--primary-bg)" : "var(--card)",
                        color: "var(--text)",
                      }}
                    />
                  </div>

                  {/* 4 Box Isian Narasi WYSIWYG Editor */}
                  <RichTextEditor
                    label="Uraian"
                    value={paket.uraian}
                    onChange={(v) => updatePaketLintas(paket.id, "uraian", v)}
                    disabled={isLocked}
                    placeholder="Ketik uraian program kerja..."
                    minHeight="100px"
                  />

                  <RichTextEditor
                    label="Tujuan"
                    value={paket.tujuan}
                    onChange={(v) => updatePaketLintas(paket.id, "tujuan", v)}
                    disabled={isLocked}
                    placeholder="Ketik tujuan program kerja..."
                    minHeight="100px"
                  />

                  <RichTextEditor
                    label="Outcome"
                    value={paket.outcome}
                    onChange={(v) => updatePaketLintas(paket.id, "outcome", v)}
                    disabled={isLocked}
                    placeholder="Ketik outcome program kerja..."
                    minHeight="100px"
                  />

                  <RichTextEditor
                    label="Jenis Program kerja"
                    value={paket.jenis_program_kerja}
                    onChange={(v) =>
                      updatePaketLintas(paket.id, "jenis_program_kerja", v)
                    }
                    disabled={isLocked}
                    placeholder="Ketik jenis program kerja..."
                    minHeight="100px"
                  />

                  {/* Footer Navigasi Halaman & Tombol Simpan */}
                  <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-3">
                    {/* Keterangan Halaman */}
                    <div className="text-xs font-semibold text-gray-500">
                      Halaman {bab2.active_lintas_page} dari {bab2.jumlah_proker_lintas_unit} Program Kerja Lintas Unit Kerja
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Tombol Sebelum */}
                      {bab2.active_lintas_page > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateBab2(
                              (prev) => ({
                                ...prev,
                                active_lintas_page: prev.active_lintas_page - 1,
                              }),
                              2
                            )
                          }
                          className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold border text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                        >
                          <ChevronLeft size={14} /> Sebelum (Program ke-{bab2.active_lintas_page - 1})
                        </button>
                      )}

                      {/* Tombol Simpan & Pindah Halaman */}
                      <button
                        type="button"
                        onClick={() => handleSavePaketLintas(currentIdx)}
                        disabled={isLocked}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-sm"
                        style={{
                          backgroundColor: paket.saved ? "#16a34a" : "var(--primary)",
                        }}
                      >
                        {paket.saved ? (
                          <>
                            <CheckCircle2 size={14} /> Tersimpan (Perbarui Program ke-{bab2.active_lintas_page})
                          </>
                        ) : bab2.active_lintas_page < bab2.jumlah_proker_lintas_unit ? (
                          <>
                            <Save size={14} /> Simpan dan lanjut ke Program ke-{bab2.active_lintas_page + 1} <ChevronRight size={14} />
                          </>
                        ) : (
                          <>
                            <Save size={14} /> Simpan Program ke-{bab2.active_lintas_page}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
            <p className="text-sm text-gray-500">
              Tidak ada Program Kerja Lintas Unit Kerja. Lanjut mengisi Bagian 3
              (Program Kerja Unit Kerja).
            </p>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* BAGIAN 3 — PROGRAM KERJA UNIT KERJA                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl border p-5 shadow-sm"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <SectionHeader
          icon={<Briefcase size={18} />}
          number="3"
          title="Program Kerja Unit Kerja"
        />

        <div className="space-y-5">
          {/* Input Numerik & 4 Tombol Navigasi Ringkas: [Sebelum] [Posisi Aktif] [Lanjut] [Akhir] */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-blue-50/70 p-3.5 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-800">
                Jumlah Program Kerja Unit Kerja:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isLocked || bab2.jumlah_proker_unit_kerja <= 1}
                  onClick={() =>
                    handleJumlahUnitChange(bab2.jumlah_proker_unit_kerja - 1)
                  }
                  className="p-1 rounded border bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  <Minus size={14} />
                </button>

                <input
                  type="number"
                  min={1}
                  max={50}
                  value={bab2.jumlah_proker_unit_kerja}
                  disabled={isLocked}
                  onChange={(e) =>
                    handleJumlahUnitChange(parseInt(e.target.value) || 1)
                  }
                  className="w-16 rounded border px-2 py-1 text-sm font-extrabold text-center focus:outline-none shadow-sm"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    borderColor: "#cbd5e1",
                  }}
                />

                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() =>
                    handleJumlahUnitChange(bab2.jumlah_proker_unit_kerja + 1)
                  }
                  className="p-1 rounded border bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* 4 TOMBOL NAVIGASI RINGKAS: Sebelum | Posisi Aktif | Lanjut | Akhir */}
            <div className="flex items-center gap-2">
              {/* 1. Sebelum */}
              <button
                type="button"
                disabled={bab2.active_unit_page <= 1}
                onClick={() =>
                  updateBab2(
                    (prev) => ({
                      ...prev,
                      active_unit_page: Math.max(1, prev.active_unit_page - 1),
                    }),
                    3
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 shadow-sm"
              >
                <ChevronLeft size={14} /> Sebelum
              </button>

              {/* 2. Posisi Input Program Aktif */}
              <div className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm flex items-center gap-1.5">
                <span>Program {bab2.active_unit_page}</span>
                <span className="opacity-75">/ {bab2.jumlah_proker_unit_kerja}</span>
              </div>

              {/* 3. Lanjut */}
              <button
                type="button"
                disabled={
                  bab2.active_unit_page >= bab2.jumlah_proker_unit_kerja ||
                  bab2.active_unit_page + 1 > bab2.unlocked_unit_index
                }
                onClick={() =>
                  updateBab2(
                    (prev) => ({
                      ...prev,
                      active_unit_page: Math.min(
                        prev.jumlah_proker_unit_kerja,
                        prev.active_unit_page + 1
                      ),
                    }),
                    3
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 shadow-sm"
              >
                Lanjut <ChevronRight size={14} />
              </button>

              {/* 4. Akhir */}
              <button
                type="button"
                disabled={
                  bab2.active_unit_page >= bab2.jumlah_proker_unit_kerja ||
                  bab2.unlocked_unit_index < bab2.jumlah_proker_unit_kerja
                }
                onClick={() =>
                  updateBab2(
                    (prev) => ({
                      ...prev,
                      active_unit_page: Math.min(
                        prev.jumlah_proker_unit_kerja,
                        prev.unlocked_unit_index
                      ),
                    }),
                    3
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 shadow-sm"
              >
                Akhir <ChevronsRight size={14} />
              </button>
            </div>
          </div>

          {/* JENDELA TUNGGAL: Hanya menampilkan Program Kerja ke-[active_unit_page] */}
          {(() => {
            const currentIdx = bab2.active_unit_page - 1;
            const paket = bab2.proker_unit_list[currentIdx] || createDefaultPaket();

            return (
              <div
                className="rounded-xl border p-5 space-y-4 shadow-sm"
                style={{
                  borderColor: "var(--primary)",
                  backgroundColor: "var(--card)",
                }}
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <h4 className="text-base font-bold text-[var(--primary)] flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                      {bab2.active_unit_page}
                    </span>
                    Program Kerja Unit Kerja ke-{bab2.active_unit_page}
                  </h4>

                  {paket.saved ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      <Check size={14} /> Tersimpan
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-medium">
                      Belum Disimpan
                    </span>
                  )}
                </div>

                {/* Nomenklatur Program Kerja Unit Kerja */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700">
                    Nomenklatur Program Kerja Unit Kerja
                  </label>
                  <input
                    type="text"
                    value={paket.nomenklatur}
                    disabled={isLocked}
                    onChange={(e) =>
                      updatePaketUnit(paket.id, "nomenklatur", e.target.value)
                    }
                    placeholder={`Ketik Nomenklatur Program Kerja Unit Kerja ke-${bab2.active_unit_page}...`}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: isLocked ? "var(--primary-bg)" : "var(--card)",
                      color: "var(--text)",
                    }}
                  />
                </div>

                {/* 4 Box Isian Narasi WYSIWYG Editor */}
                <RichTextEditor
                  label="Uraian"
                  value={paket.uraian}
                  onChange={(v) => updatePaketUnit(paket.id, "uraian", v)}
                  disabled={isLocked}
                  placeholder="Ketik uraian program kerja..."
                  minHeight="100px"
                />

                <RichTextEditor
                  label="Tujuan"
                  value={paket.tujuan}
                  onChange={(v) => updatePaketUnit(paket.id, "tujuan", v)}
                  disabled={isLocked}
                  placeholder="Ketik tujuan program kerja..."
                  minHeight="100px"
                />

                <RichTextEditor
                  label="Outcome"
                  value={paket.outcome}
                  onChange={(v) => updatePaketUnit(paket.id, "outcome", v)}
                  disabled={isLocked}
                  placeholder="Ketik outcome program kerja..."
                  minHeight="100px"
                />

                <RichTextEditor
                  label="Jenis Program kerja"
                  value={paket.jenis_program_kerja}
                  onChange={(v) =>
                    updatePaketUnit(paket.id, "jenis_program_kerja", v)
                  }
                  disabled={isLocked}
                  placeholder="Ketik jenis program kerja..."
                  minHeight="100px"
                />

                {/* Footer Navigasi Halaman & Tombol Simpan */}
                <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-3">
                  {/* Keterangan Halaman */}
                  <div className="text-xs font-semibold text-gray-500">
                    Halaman {bab2.active_unit_page} dari {bab2.jumlah_proker_unit_kerja} Program Kerja Unit Kerja
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Tombol Sebelum */}
                    {bab2.active_unit_page > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateBab2(
                            (prev) => ({
                              ...prev,
                              active_unit_page: prev.active_unit_page - 1,
                            }),
                            3
                          )
                        }
                        className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold border text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                      >
                        <ChevronLeft size={14} /> Sebelum (Program ke-{bab2.active_unit_page - 1})
                      </button>
                    )}

                    {/* Tombol Simpan & Pindah Halaman */}
                    <button
                      type="button"
                      onClick={() => handleSavePaketUnit(currentIdx)}
                      disabled={isLocked}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-sm"
                      style={{
                        backgroundColor: paket.saved ? "#16a34a" : "var(--primary)",
                      }}
                    >
                      {paket.saved ? (
                        <>
                          <CheckCircle2 size={14} /> Tersimpan (Perbarui Program ke-{bab2.active_unit_page})
                        </>
                      ) : bab2.active_unit_page < bab2.jumlah_proker_unit_kerja ? (
                        <>
                          <Save size={14} /> Simpan dan lanjut ke Program ke-{bab2.active_unit_page + 1} <ChevronRight size={14} />
                        </>
                      ) : (
                        <>
                          <Save size={14} /> Simpan Program ke-{bab2.active_unit_page}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
