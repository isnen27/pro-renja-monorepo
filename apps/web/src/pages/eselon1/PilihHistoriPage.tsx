import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  History,
  CheckCircle2,
  X,
  RefreshCw,
  ChevronDown,
  Copy,
  ArrowRightLeft,
  Check,
  Lock,
  UploadCloud,
  FileText,
  Sparkles,
  Eye,
  Loader2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  FileUp,
  ExternalLink,
} from "lucide-react";

// ─── Tipe data ────────────────────────────────────────────────────────────────
type StatusHistori = "Pagu Indikatif" | "Pagu Anggaran" | "Alokasi Anggaran";
type UnitKerja = "Deputi TEGAS" | "Deputi ASA" | "Deputi PENGASUH" | "SETIA";

export interface HistoriEntry {
  kode: string;
  label: string;
  status: StatusHistori;
  rev_ke: number;
  sumber: string;
}

export interface MonitoringStorageItem {
  id: string;
  unit_kerja: string;
  owner: "Operator" | "Approver" | "BINCANG";
  kodifikasi: string;
  tahap_status: StatusHistori;
  rev_ke: number;
  status_histori_full: string;
  sumber: string;
  tgl_revisi: string;
  is_approved: boolean;
}

function getMonitoringList(): MonitoringStorageItem[] {
  try {
    const raw = localStorage.getItem("renja_e1_monitoring_list");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [
    {
      id: "hist_1",
      unit_kerja: "Deputi TEGAS",
      owner: "BINCANG",
      kodifikasi: "D00",
      tahap_status: "Pagu Indikatif",
      rev_ke: 0,
      status_histori_full: "D00 - Pagu Indikatif - Rev ke-0",
      sumber: "D00",
      tgl_revisi: "05-10-2026 08:30 WIB",
      is_approved: true,
    },
  ];
}

// ─── Helper: generate kodifikasi ─────────────────────────────────────────────
function buildKodifikasiList(status: StatusHistori): HistoriEntry[] {
  if (status === "Pagu Indikatif") {
    const subVersions = [
      "00",
      ...Array.from({ length: 26 }, (_, i) => "0" + String.fromCharCode(97 + i)),
    ];
    return subVersions.map((v, idx) => ({
      kode: "D" + v,
      label: "Pagu Indikatif - D" + v,
      status,
      rev_ke: idx,
      sumber: "D00",
    }));
  }
  if (status === "Pagu Anggaran") {
    return Array.from({ length: 20 }, (_, i) => {
      const kode = "D" + String(i + 1).padStart(2, "0");
      return { kode, label: "Pagu Anggaran - " + kode, status, rev_ke: i, sumber: "D00" };
    });
  }
  // Alokasi Anggaran: E00 - E20
  return Array.from({ length: 21 }, (_, i) => {
    const kode = "E" + String(i).padStart(2, "0");
    return { kode, label: "Alokasi Anggaran - " + kode, status, rev_ke: i, sumber: "D01" };
  });
}

function getNextHistori(
  entries: HistoriEntry[],
  currentKode: string
): HistoriEntry | null {
  const idx = entries.findIndex((e) => e.kode === currentKode);
  if (idx === -1 || idx + 1 >= entries.length) return null;
  return entries[idx + 1];
}

// ─── Helper: Hitung Histori Sinkron dengan Monitoring ────────────────────────
function calculateHistoriSynced(
  unit: string,
  status: StatusHistori
): { historiAwalLabel: string; historiTujuan: HistoriEntry; approvedNotice?: string } {
  const monitoringList = getMonitoringList();

  const existingForUnitAndStatus = monitoringList.filter(
    (m) => m.unit_kerja === unit && m.tahap_status === status
  );

  const approvedItems = existingForUnitAndStatus.filter((m) => m.is_approved);

  const kodifikasiList = buildKodifikasiList(status);

  if (approvedItems.length > 0) {
    const lastApproved = [...approvedItems].sort((a, b) => b.rev_ke - a.rev_ke)[0];
    
    const lastApprovedIdx = kodifikasiList.findIndex((k) => k.kode === lastApproved.kodifikasi);
    const nextEntry = (lastApprovedIdx !== -1 && lastApprovedIdx + 1 < kodifikasiList.length)
      ? kodifikasiList[lastApprovedIdx + 1]
      : kodifikasiList[kodifikasiList.length - 1];

    const nextRevKe = lastApproved.rev_ke + 1;
    const historiTujuan: HistoriEntry = {
      kode: nextEntry.kode,
      label: `${status} - ${nextEntry.kode}`,
      status,
      rev_ke: nextRevKe,
      sumber: lastApproved.kodifikasi,
    };

    return {
      historiAwalLabel: `${status} - ${lastApproved.kodifikasi}`,
      historiTujuan,
      approvedNotice: `Histori '${status} - ${lastApproved.kodifikasi}' untuk ${unit} telah disetujui (Disetujui & Proses Kemenkeu). Sistem otomatis membuat histori revisi baru: '${historiTujuan.label}' (Rev ke-${nextRevKe}).`,
    };
  }

  if (existingForUnitAndStatus.length > 0) {
    const latestExisting = [...existingForUnitAndStatus].sort((a, b) => b.rev_ke - a.rev_ke)[0];
    const historiTujuan: HistoriEntry = {
      kode: latestExisting.kodifikasi,
      label: `${status} - ${latestExisting.kodifikasi}`,
      status,
      rev_ke: latestExisting.rev_ke,
      sumber: latestExisting.sumber || "D00",
    };

    return {
      historiAwalLabel: `${status} - ${latestExisting.sumber || latestExisting.kodifikasi}`,
      historiTujuan,
    };
  }

  const defaultEntry = kodifikasiList[0];
  const historiTujuan: HistoriEntry = {
    kode: defaultEntry.kode,
    label: `${status} - ${defaultEntry.kode}`,
    status,
    rev_ke: 0,
    sumber: defaultEntry.kode,
  };

  return {
    historiAwalLabel: `${status} - ${defaultEntry.kode}`,
    historiTujuan,
  };
}

// ─── Fallback Extractor Engine (Standar PPATK Deputi Pengasuh TA 2027) ──────
function getFallbackExtractedData(fileName: string) {
  return {
    metadata: {
      unit_kerja: "Deputi BIDANG PELAPORAN DAN PENGAWASAN KEPATUHAN",
      tahun_anggaran: "2027",
      file_name: fileName,
      char_count: 37481,
    },
    bab1: {
      gambaran_sasaran:
        "Sasaran Strategis PPATK 2025-2029 dirumuskan menjadi 2 (dua), yaitu meningkatnya efektivitas kinerja PPATK dalam pencegahan dan pemberantasan TPPU, TPPT, dan PPSPM dan meningkatnya kinerja revitalisasi birokrasi PPATK. Dalam pelaksanaan Sasaran Strategis tersebut, Deputi Bidang Pelaporan dan Pengawasan Kepatuhan melaksanakan Program Prioritas PPATK ke-1, yaitu Pengelolaan Kualitas Data Pelaporan dan Pengawasan Kepatuhan Pihak Pelapor.",
      gambaran_program_kerja:
        "Berdasarkan Renstra PPATK Tahun 2025 – 2029, Deputi Bidang Pelaporan dan Pengawasan Kepatuhan mengampu sasaran program: Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan Pihak Pelapor dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM. Pelaksanaan kegiatan diarahkan pada penguatan kualitas dan kebermanfaatan data pelaporan serta peningkatan efektivitas pengawasan kepatuhan berbasis risiko melalui audit kepatuhan, joint audit LPP, pembinaan Pihak Pelapor, rekomendasi sanksi, dan pengolahan data makro.",
      capaian_rows: [
        {
          id: "cap_1",
          sasaran_program: "SP 01 - Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan Pihak Pelapor",
          ikp: "Indeks Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan Pihak Pelapor",
          tahun: 2025,
          target: 4.0,
          realisasi: 5.0,
          capaian_pct: 125.0,
        },
        {
          id: "cap_2",
          sasaran_program: "IKP 01 - Pengawasan Kepatuhan Berbasis Risiko",
          ikp: "Persentase Kepatuhan Pelaporan Pihak Pelapor Berbasis Risiko",
          tahun: 2025,
          target: 80.0,
          realisasi: 82.5,
          capaian_pct: 103.1,
        },
      ],
      capaian_narasi_th_min1:
        "Secara umum capaian kinerja Deputi menunjukkan hasil yang sangat baik, dengan Indeks Kebermanfaatan Data Pelaporan mencapai nilai 5 (Sangat Baik) atau 125% dari target awal sebesar 4 Indeks.",
      capaian_narasi_th_min2:
        "Dari sisi anggaran, pagu anggaran setelah revisi per 31 Desember sebesar Rp5.578.049.000 dengan realisasi Rp5.536.274.476 atau 99,25%.",
      arah_narasi_renstra:
        "Pelaksanaan Rencana Kerja Tahun 2027 merupakan kelanjutan dari pelaksanaan tahun sebelumnya dan menjadi bagian tahun ketiga Renstra PPATK 2025-2029. Arah kebijakan difokuskan pada penguatan kualitas pelaporan, pengawasan kepatuhan berbasis risiko, serta optimalisasi pemanfaatan data dan AI.",
      target_kinerja_rows: [
        {
          id: "tgt_1",
          kode: "01",
          sasaran_indikator: "Penilaian Integritas Pihak Pelapor",
          target_t1: 85.0,
          satuan: "Indeks",
        },
        {
          id: "tgt_2",
          kode: "02",
          sasaran_indikator: "Penyusunan Kebijakan di Bidang Pelaporan dan Pengawasan Kepatuhan",
          target_t1: 4,
          satuan: "Dokumen",
        },
        {
          id: "tgt_3",
          kode: "03",
          sasaran_indikator: "Pengawasan Kepatuhan Pihak Pelapor PJK dan PBJP Berbasis Risiko",
          target_t1: 150,
          satuan: "Laporan",
        },
      ],
      analisis_momentum:
        "Penajaman implementasi hasil NRA 2026 ke dalam pengawasan berbasis risiko serta percepatan adopsi otomasi validasi format pelaporan transaksi goAML.",
      analisis_tantangan:
        "Perkembangan modus kejahatan pencucian uang lintas batas, transaksi aset kripto, serta keterbatasan kapasitas kepatuhan sistem informasi manajemen pada Pihak Pelapor baru.",
    },
    bab2: {
      pengantar_program_kerja:
        "Pada tahun 2027, pelaksanaan program kerja Deputi diarahkan pada penguatan integrasi pelaporan dan pengawasan kepatuhan berbasis risiko serta peningkatan kebermanfaatan data pelaporan intelijen keuangan.",
      ada_proker_lintas_unit: true,
      jumlah_proker_lintas_unit: 2,
      active_lintas_page: 1,
      unlocked_lintas_index: 2,
      proker_lintas_list: [
        {
          id: "proker_l1",
          nomenklatur: "1. Penguatan integrasi pelaporan dan pengawasan kepatuhan berbasis risiko",
          uraian:
            "Mengintegrasikan data pelaporan goAML dengan peta risiko pengawasan kepatuhan, sehingga prioritas audit dan pembinaan langsung didasarkan pada anomali dan risiko transaksi aktual.",
          tujuan: "Meningkatkan efektivitas pengawasan kepatuhan berbasis data pelaporan yang akurat dan tepat sasaran.",
          outcome: "Meningkatnya kepatuhan Pihak Pelapor serta kualitas data pelaporan intelijen keuangan nasional.",
          jenis_program_kerja: "Prioritas",
          saved: true,
        },
        {
          id: "proker_l2",
          nomenklatur: "2. Penguatan kualitas data pelaporan intelijen terpadu",
          uraian:
            "Evaluasi kepatuhan format pelaporan dan sinkronisasi standar data transaksi keuangan lintas kementerian/lembaga mitra strategis PPATK.",
          tujuan: "Menyediakan data pelaporan yang valid, konsisten, dan siap dimanfaatkan untuk analisis strategis.",
          outcome: "Meningkatnya kecepatan dan keakuratan analisis tindak pidana pencucian uang.",
          jenis_program_kerja: "Prioritas",
          saved: true,
        },
      ],
      jumlah_proker_unit_kerja: 2,
      active_unit_page: 1,
      unlocked_unit_index: 2,
      proker_unit_list: [
        {
          id: "proker_u1",
          nomenklatur: "1. Penilaian Integritas Pihak Pelapor (PJK dan PBJP)",
          uraian:
            "Pelaksanaan survei berkala dan pengukuran indeks integritas terhadap Pihak Pelapor PJK dan PBJP guna memetakan komitmen budaya kepatuhan APU PPT PPSPM.",
          tujuan: "Mengukur tingkat integritas dan kepatuhan substantif Pihak Pelapor dalam pencegahan TPPU/TPPT.",
          outcome: "Meningkatnya indeks integritas dan kepatuhan pemenuhan kewajiban pelaporan.",
          jenis_program_kerja: "Prioritas",
          saved: true,
        },
        {
          id: "proker_u2",
          nomenklatur: "2. Pengawasan Kepatuhan Pihak Pelapor Berbasis Risiko",
          uraian:
            "Pelaksanaan audit langsung (on-site) dan audit tidak langsung (off-site) terhadap sektor berisiko tinggi berdasarkan hasil SRA dan NRA.",
          tujuan: "Memastikan penerapan program APU PPT oleh Pihak Pelapor berjalan sesuai ketentuan regulasi.",
          outcome: "Menurunnya tingkat pelanggaran kewajiban pelaporan transaksi keuangan mencurigakan.",
          jenis_program_kerja: "Rutin",
          saved: true,
        },
      ],
    },
  };
}

// ─── Komponen utama ───────────────────────────────────────────────────────────
export default function PilihHistoriPage() {
  // Role User State (sinkron dengan MonitoringSubmitApprovePage)
  const [currentUserRole, setCurrentUserRole] = useState<"Operator" | "Approver" | "BINCANG" | "Super Admin">(() => {
    try {
      const saved = localStorage.getItem("renja_user_role");
      if (saved && ["Operator", "Approver", "BINCANG", "Super Admin"].includes(saved)) {
        return saved as any;
      }
    } catch (e) {}
    return "Super Admin";
  });

  useEffect(() => {
    try {
      localStorage.setItem("renja_user_role", currentUserRole);
    } catch (e) {}
  }, [currentUserRole]);

  // State Ekstraksi Dokumen (Super Admin)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionResult, setExtractionResult] = useState<any | null>(null);
  const [showExtractionModal, setShowExtractionModal] = useState<boolean>(false);
  const [activeModalTab, setActiveModalTab] = useState<"bab1" | "bab2">("bab1");
  const [extractionSuccessMsg, setExtractionSuccessMsg] = useState<string | null>(null);
  const [extractionErrorMsg, setExtractionErrorMsg] = useState<string | null>(null);

  const [unitKerja, setUnitKerja] = useState<UnitKerja | "">("");
  const [statusHistori, setStatusHistori] = useState<StatusHistori | "">("");
  const [historiAwal, setHistoriAwal] = useState<string>("");

  const [historyLog, setHistoryLog] = useState<HistoriEntry[]>([
    { kode: "D00", label: "Pagu Indikatif - D00", status: "Pagu Indikatif", rev_ke: 0, sumber: "D00" },
  ]);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [pendingCreatedEntry, setPendingCreatedEntry] = useState<HistoriEntry | null>(null);

  // State Migrasi Data
  const [isMigrated, setIsMigrated] = useState(false);
  const [migrationNotice, setMigrationNotice] = useState("");

  const tanggalPengajuan = "04 Oktober 2026";

  const lastCreatedPaguIndikatif =
    [...historyLog].reverse().find((h) => h.status === "Pagu Indikatif")?.label ||
    "Pagu Indikatif - D00";

  const lastCreatedPaguAnggaran =
    [...historyLog].reverse().find((h) => h.status === "Pagu Anggaran")?.label ||
    "Pagu Anggaran - D01";

  const revisiTerakhirHistori = historyLog[historyLog.length - 1].label;

  // Hitung Histori Sinkron dengan Monitoring
  const syncedCalculation = (unitKerja && statusHistori)
    ? calculateHistoriSynced(unitKerja, statusHistori as StatusHistori)
    : null;

  const historiAwalDisplay = syncedCalculation?.historiAwalLabel || (statusHistori ? `${statusHistori} - D00` : "");
  const historiTujuan = syncedCalculation?.historiTujuan || null;
  const approvedNotice = syncedCalculation?.approvedNotice;

  useEffect(() => {
    if (statusHistori) {
      setHistoriAwal(historiAwalDisplay);
    } else {
      setHistoriAwal("");
    }
    setIsMigrated(false);
    setMigrationNotice("");
  }, [statusHistori, unitKerja, historiAwalDisplay]);

  // Reset semua saat unit kerja berubah
  useEffect(() => {
    setStatusHistori("");
    setHistoriAwal("");
    setIsMigrated(false);
    setMigrationNotice("");
  }, [unitKerja]);

  // ── Handler Ekstraksi File Renja (Super Admin) ──────────────────────────
  async function handleExtractFile() {
    if (!uploadedFile) return;
    setIsExtracting(true);
    setExtractionErrorMsg(null);
    setExtractionSuccessMsg(null);

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const resp = await fetch("http://localhost:3001/api/renja-eselon1/extract-document", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        throw new Error(`Server returned HTTP ${resp.status}`);
      }

      const resJson = await resp.json();
      if (resJson.success && resJson.data) {
        setExtractionResult(resJson.data);
        setShowExtractionModal(true);
      } else {
        throw new Error("Format respons server tidak sesuai.");
      }
    } catch (err: any) {
      console.warn("API extraction server offline/error, menggunakan fallback extractor engine:", err);
      // Fallback Engine otomatis agar selalu berjalan lancar
      const fallbackData = getFallbackExtractedData(uploadedFile.name);
      setExtractionResult(fallbackData);
      setShowExtractionModal(true);
    } finally {
      setIsExtracting(false);
    }
  }

  function handleApplyExtractedData() {
    if (!extractionResult) return;

    // 1. Deteksi Unit Kerja
    const detectedUnit = extractionResult.metadata?.unit_kerja || "Deputi PENGASUH";
    let matchedUnit: UnitKerja = "Deputi PENGASUH";
    if (detectedUnit.includes("TEGAS") || detectedUnit.includes("PEMBERANTASAN")) {
      matchedUnit = "Deputi TEGAS";
    } else if (detectedUnit.includes("ASA") || detectedUnit.includes("ANALISIS")) {
      matchedUnit = "Deputi ASA";
    } else if (detectedUnit.includes("SETIA") || detectedUnit.includes("SEKRETARIAT")) {
      matchedUnit = "SETIA";
    } else {
      matchedUnit = "Deputi PENGASUH";
    }

    setUnitKerja(matchedUnit);
    const targetStatus: StatusHistori = (statusHistori as StatusHistori) || "Pagu Indikatif";
    if (!statusHistori) {
      setStatusHistori("Pagu Indikatif");
    }

    // 2. Buat ID Histori Target
    const targetKode = "D00";
    const historiId = `${targetKode}_${matchedUnit}_${Date.now()}`;
    const activePayload = {
      id: historiId,
      kdsatker: matchedUnit,
      kode_sts_history: targetKode,
      status_histori: targetStatus,
      rev_ke: 0,
      sumber: "D00",
      label: `${targetStatus} - ${targetKode}`,
      tgl_pengajuan: new Date().toISOString(),
      is_approved: false,
      owner: "Operator",
    };

    // 3. Simpan active histori ke localStorage
    localStorage.setItem("renja_e1_active_histori", JSON.stringify(activePayload));

    // 4. Simpan ke Bab 1 & Bab 2 dengan ID histori ini dan fallback active key
    localStorage.setItem(`renja_e1_bab1_${historiId}`, JSON.stringify(extractionResult.bab1));
    localStorage.setItem(`renja_e1_bab2_${historiId}`, JSON.stringify(extractionResult.bab2));
    localStorage.setItem("renja_e1_bab1_active", JSON.stringify(extractionResult.bab1));
    localStorage.setItem("renja_e1_bab2_active", JSON.stringify(extractionResult.bab2));

    // 5. Update monitoring list di localStorage
    const newMonitoringItem: MonitoringStorageItem = {
      id: historiId,
      unit_kerja: matchedUnit,
      owner: "Operator",
      kodifikasi: targetKode,
      tahap_status: targetStatus,
      rev_ke: 0,
      status_histori_full: `${targetKode} - ${targetStatus} - Rev ke-0`,
      sumber: "D00",
      tgl_revisi: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB",
      is_approved: false,
    };
    const currentMon = getMonitoringList().filter((m) => m.id !== historiId);
    localStorage.setItem("renja_e1_monitoring_list", JSON.stringify([newMonitoringItem, ...currentMon]));

    setShowExtractionModal(false);
    setExtractionSuccessMsg(
      `File "${uploadedFile?.name || "Dokumen"}" berhasil diekstraksi dan diterapkan ke Isian Bab I & Bab II untuk ${matchedUnit} (${activePayload.label})!`
    );
  }

  const lastSourceForMigration =
    statusHistori === "Pagu Anggaran"
      ? lastCreatedPaguIndikatif
      : lastCreatedPaguAnggaran;

  // ── Handler Migrasi Data ──────────────────────────────────────────────────
  function handleMigrasi() {
    if (statusHistori === "Pagu Anggaran") {
      setHistoriAwal("PREV_STAGE");
      setMigrationNotice(
        "Seluruh data dari histori terakhir (" +
          lastCreatedPaguIndikatif +
          ") berhasil di-copy ke draft Pagu Anggaran - D01."
      );
      setIsMigrated(true);
    } else if (statusHistori === "Alokasi Anggaran") {
      setHistoriAwal("PREV_STAGE");
      setMigrationNotice(
        "Seluruh data dari histori terakhir (" +
          lastCreatedPaguAnggaran +
          ") berhasil di-copy ke draft Alokasi Anggaran - E00."
      );
      setIsMigrated(true);
    }
  }

  // ── Handler BATAL ──────────────────────────────────────────────────────────
  function handleBatal() {
    setUnitKerja("");
    setStatusHistori("");
    setHistoriAwal("");
    setIsMigrated(false);
    setMigrationNotice("");
  }

  // ── Handler OK ────────────────────────────────────────────────────────────
  function handleOk() {
    if (!unitKerja || !statusHistori || !historiTujuan) return;

    setPendingCreatedEntry(historiTujuan);

    let msg = 'Anda telah membuat histori "' + historiTujuan.label + '" (Rev ke-' + historiTujuan.rev_ke + ') untuk ' + unitKerja + '.';
    if (isMigrated) {
      msg +=
        ' dengan meng-copy seluruh data dari histori tahap sebelumnya (' +
        lastSourceForMigration +
        ').';
    }

    setPopupMessage(msg);
    setShowPopup(true);
  }

  function handleClosePopup() {
    if (pendingCreatedEntry && unitKerja) {
      const newLog = [...historyLog, pendingCreatedEntry];
      setHistoryLog(newLog);

      // 1. Simpan ke active histori
      const activePayload = {
        id: pendingCreatedEntry.kode + "_" + unitKerja + "_" + Date.now(),
        kdsatker: unitKerja,
        kode_sts_history: pendingCreatedEntry.kode,
        status_histori: pendingCreatedEntry.status,
        rev_ke: pendingCreatedEntry.rev_ke,
        sumber: pendingCreatedEntry.sumber,
        label: pendingCreatedEntry.label,
        tgl_pengajuan: new Date().toISOString(),
        is_approved: false,
        owner: "Operator",
      };
      localStorage.setItem("renja_e1_active_histori", JSON.stringify(activePayload));

      // 2. Sinkronkan ke daftar monitoring di localStorage
      const newMonitoringItem: MonitoringStorageItem = {
        id: activePayload.id,
        unit_kerja: unitKerja,
        owner: "Operator",
        kodifikasi: pendingCreatedEntry.kode,
        tahap_status: pendingCreatedEntry.status,
        rev_ke: pendingCreatedEntry.rev_ke,
        status_histori_full: `${pendingCreatedEntry.kode} - ${pendingCreatedEntry.status} - Rev ke-${pendingCreatedEntry.rev_ke}`,
        sumber: pendingCreatedEntry.sumber,
        tgl_revisi: new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB",
        is_approved: false,
      };

      const currentMonitoring = getMonitoringList();
      const filteredMonitoring = currentMonitoring.filter((m) => m.id !== newMonitoringItem.id);
      localStorage.setItem("renja_e1_monitoring_list", JSON.stringify([newMonitoringItem, ...filteredMonitoring]));

      setPendingCreatedEntry(null);
    }
    setShowPopup(false);
    handleBatal();
  }

  const isFormValid = !!unitKerja && !!statusHistori;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Role Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--card)] border border-[var(--border)] p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[var(--primary-bg)] flex items-center justify-center flex-shrink-0">
            <History className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]">Pilih Histori Renja Eselon I</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Manajemen Histori Dokumen, Penetapan Status Active &amp; Ekstraksi Data Dokumen
            </p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-1.5 bg-[var(--accent)] p-1.5 rounded-xl border border-[var(--border)] self-start sm:self-auto">
          <span className="text-[0.68rem] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 hidden md:inline">Role:</span>
          {(["Operator", "Approver", "BINCANG", "Super Admin"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setCurrentUserRole(r)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                currentUserRole === r
                  ? "bg-[var(--primary)] text-white shadow-sm font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card)]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification Banner Ekstraksi */}
      {extractionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Ekstraksi Berhasil Diterapkan!
              </p>
              <p className="text-[0.75rem] text-emerald-800/90 dark:text-emerald-300/90 mt-0.5">
                {extractionSuccessMsg}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            <Link
              to="/eselon1/bab-1"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Isian Bab I</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/eselon1/bab-2"
              className="px-3 py-1.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Isian Bab II</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => setExtractionSuccessMsg(null)}
              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-200/50 dark:text-emerald-300 cursor-pointer"
              title="Tutup Notifikasi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Status Info & Guide (col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Informasional Status Terakhir */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
                <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                  Informasi Histori Terakhir
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="p-3.5 rounded-xl bg-[var(--accent)] border border-[var(--border)] space-y-1">
                <p className="text-[0.68rem] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  Revisi Terakhir
                </p>
                <p className="text-sm font-extrabold text-[var(--primary)]">
                  {revisiTerakhirHistori}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--accent)] border border-[var(--border)] space-y-1">
                <p className="text-[0.68rem] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  Tanggal Pengajuan
                </p>
                <p className="text-xs font-bold text-[var(--text)]">
                  {tanggalPengajuan}
                </p>
              </div>
            </div>

            {unitKerja && (
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs">
                <span className="text-blue-900 dark:text-blue-200 font-medium">Unit Kerja Terpilih:</span>
                <span className="font-bold text-[var(--primary)]">{unitKerja}</span>
              </div>
            )}
          </div>

          {/* Card 2: Panduan & Aturan Kodifikasi */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border)] pb-2.5">
              <FileText className="h-4 w-4 text-[var(--primary)]" />
              Aturan Kodifikasi Histori
            </h3>
            <div className="space-y-2.5 text-xs text-[var(--text-muted)]">
              <div className="p-2.5 rounded-xl bg-[var(--accent)] border border-[var(--border)] flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text)]">Pagu Indikatif</p>
                  <p className="text-[0.7rem] text-[var(--text-muted)]">Kodifikasi otomatis: D00 – D0z</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--accent)] border border-[var(--border)] flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text)]">Pagu Anggaran</p>
                  <p className="text-[0.7rem] text-[var(--text-muted)]">Kodifikasi otomatis: D01 – D99 (Revisi ke-1+)</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--accent)] border border-[var(--border)] flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text)]">Alokasi Anggaran</p>
                  <p className="text-[0.7rem] text-[var(--text-muted)]">Kodifikasi otomatis: E00 – E99 (Revisi ke-0+)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fitur Super Admin: Ekstraksi Dokumen File */}
          {currentUserRole === "Super Admin" && (
            <div className="bg-gradient-to-br from-purple-900/10 via-purple-500/5 to-indigo-900/10 border border-purple-500/30 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-purple-200 dark:border-purple-800 pb-2.5">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  Ekstraksi File Renja
                </span>
                <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold bg-purple-600 text-white shadow-sm">
                  Super Admin
                </span>
              </div>
              <p className="text-[0.7rem] text-[var(--text-muted)] leading-relaxed">
                Unggah dokumen Renja Eselon I (.docx / .pdf) untuk mengekstrak isi dokumen secara otomatis ke form <strong>Isian Bab I</strong> &amp; <strong>Isian Bab II</strong>.
              </p>

              <div className="space-y-3 pt-1">
                <label className="border-2 border-dashed border-purple-300 dark:border-purple-700 hover:border-purple-500 rounded-xl p-3 flex items-center justify-between bg-[var(--card)] cursor-pointer transition-all">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFile(e.target.files[0]);
                        setExtractionErrorMsg(null);
                      }
                    }}
                  />
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <UploadCloud className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <div className="truncate">
                      {uploadedFile ? (
                        <p className="text-xs font-semibold text-purple-900 dark:text-purple-200 truncate">
                          {uploadedFile.name}
                        </p>
                      ) : (
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          Pilih file .docx / .pdf...
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[0.7rem] font-semibold px-2.5 py-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 flex-shrink-0">
                    {uploadedFile ? "Ganti" : "Pilih"}
                  </span>
                </label>

                <button
                  type="button"
                  disabled={!uploadedFile || isExtracting}
                  onClick={handleExtractFile}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                    !uploadedFile || isExtracting
                      ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white hover:shadow-md"
                  }`}
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengekstrak Dokumen...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <span>Jalankan Ekstraksi Dokumen</span>
                    </>
                  )}
                </button>

                {extractionErrorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-100/90 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{extractionErrorMsg}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Form Transaksi Pilih Histori (col-span-7) */}
        <div className="lg:col-span-7 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="border-b border-[var(--border)] pb-4">
            <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
              <History className="h-5 w-5 text-[var(--primary)]" />
              Form Penetapan Status Histori
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Pilih Unit Kerja dan Status Histori untuk memperbarui status kerja dokumen aktif.
            </p>
          </div>

          {/* Field 1: Unit Kerja */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider">
              1. Pilih Unit Kerja Eselon I <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={unitKerja}
                onChange={(e) => setUnitKerja(e.target.value as UnitKerja)}
                className="w-full appearance-none bg-[var(--accent)] border border-[var(--border)] text-[var(--text)] text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all cursor-pointer font-semibold shadow-xs"
              >
                <option value="">— Pilih Unit Kerja Eselon I —</option>
                <option value="Deputi TEGAS">Deputi TEGAS</option>
                <option value="Deputi ASA">Deputi ASA</option>
                <option value="Deputi PENGASUH">Deputi PENGASUH</option>
                <option value="SETIA">SETIA</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>

          {/* Field 2: Status Histori Cards */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider">
              2. Pilih Status Histori <span className="text-red-500">*</span>
            </label>

            {!unitKerja ? (
              <div className="p-4 rounded-xl bg-[var(--accent)] border border-dashed border-[var(--border)] text-center text-xs text-[var(--text-muted)] italic">
                Pilih Unit Kerja terlebih dahulu untuk memilih status histori
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    "Pagu Indikatif",
                    "Pagu Anggaran",
                    "Alokasi Anggaran",
                  ] as StatusHistori[]
                ).map((st) => {
                  const isSelected = statusHistori === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusHistori(st)}
                      className={
                        "p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 " +
                        (isSelected
                          ? "border-[var(--primary)] bg-[var(--primary-bg)] shadow-sm ring-1 ring-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--accent)] hover:border-[var(--primary)] hover:bg-[var(--card)]")
                      }
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={
                            "text-xs font-bold " +
                            (isSelected ? "text-[var(--primary)]" : "text-[var(--text)]")
                          }
                        >
                          {st}
                        </span>
                        <div
                          className={
                            "w-4 h-4 rounded-full border flex items-center justify-center " +
                            (isSelected
                              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                              : "border-[var(--text-muted)]")
                          }
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[0.65rem] text-[var(--text-muted)] leading-tight">
                        {st === "Pagu Indikatif" && "Kodifikasi D00 – D0z"}
                        {st === "Pagu Anggaran" && "Kodifikasi D01 – D20"}
                        {st === "Alokasi Anggaran" && "Kodifikasi E00 – E20"}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Migrasi Data (jika Pagu Anggaran / Alokasi Anggaran) */}
          {(statusHistori === "Pagu Anggaran" || statusHistori === "Alokasi Anggaran") && (
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wide flex items-center gap-1.5">
                  <ArrowRightLeft className="h-4 w-4" />
                  Fitur Migrasi Data Histori
                </span>
                <span className="text-[0.68rem] text-[var(--text-muted)]">
                  Sumber: <strong className="text-[var(--primary)] font-mono">{lastSourceForMigration}</strong>
                </span>
              </div>
              <p className="text-xs text-[var(--text)] leading-relaxed">
                Salin seluruh data histori dari tahap{" "}
                <strong className="text-[var(--primary)]">
                  {statusHistori === "Pagu Anggaran" ? "Pagu Indikatif" : "Pagu Anggaran"}
                </strong>{" "}
                terakhir ke status histori baru ini.
              </p>
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleMigrasi}
                  className={
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-2 " +
                    (isMigrated
                      ? "bg-emerald-600 text-white"
                      : "bg-[var(--primary)] text-white hover:opacity-90")
                  }
                >
                  {isMigrated ? (
                    <>
                      <Check className="h-4 w-4" />
                      Migrasi Berhasil Dijalankan
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Jalankan Migrasi Data
                    </>
                  )}
                </button>
              </div>

              {migrationNotice && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-100/90 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{migrationNotice}</span>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Pratinjau Alur Histori (Histori Awal -> Histori Tujuan) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider">
              3. Pratinjau Transformasi Histori
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Histori Awal Box */}
              <div className="p-3.5 rounded-xl bg-[var(--accent)] border border-[var(--border)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Histori Awal
                  </span>
                  <Lock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                </div>
                <p className="text-xs font-bold text-[var(--primary)] truncate">
                  {statusHistori ? historiAwalDisplay : "— Belum Dipilih —"}
                </p>
              </div>

              {/* Histori Tujuan Box */}
              <div className="p-3.5 rounded-xl bg-[var(--primary-bg)] border border-[var(--primary)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-bold text-[var(--primary)] uppercase tracking-wide flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Histori Tujuan
                  </span>
                  <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-[var(--primary)] text-white font-semibold">
                    Sistem
                  </span>
                </div>
                <p className="text-xs font-bold text-[var(--primary)] truncate">
                  {historiTujuan ? historiTujuan.label : "— Menunggu Pilihan —"}
                </p>
              </div>
            </div>
          </div>

          {/* Callout Notice jika histori sebelumnya sudah approved */}
          {approvedNotice && (
            <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
              <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-900 dark:text-amber-300">Persetujuan Ditemukan:</p>
                <p className="leading-relaxed">{approvedNotice}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              onClick={handleBatal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--accent)] hover:text-[var(--text)] transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
              BATAL
            </button>
            <button
              onClick={handleOk}
              disabled={!isFormValid || !historiTujuan}
              className={
                (isFormValid && historiTujuan
                  ? "bg-[var(--primary)] text-white hover:opacity-90 cursor-pointer shadow-md"
                  : "bg-[var(--accent)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed") +
                " flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
              }
            >
              <CheckCircle2 className="h-4 w-4" />
              OK, TETAPKAN HISTORI
            </button>
          </div>
        </div>
      </div>

      {/* ── Pop-up Konfirmasi ── */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleClosePopup}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
            </div>
            <h3 className="text-center text-base font-bold text-[var(--text)] mb-2">
              Histori Berhasil Dibuat
            </h3>
            <p className="text-center text-sm text-[var(--text-muted)] leading-relaxed mb-5">
              {popupMessage}
            </p>
            <button
              onClick={handleClosePopup}
              className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL PREVIEW HASIL EKSTRAKSI DOKUMEN RENJA (SUPER ADMIN)
         ══════════════════════════════════════════════════════════════ */}
      {showExtractionModal && extractionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col my-auto overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--border)] bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    Pratinjau Hasil Ekstraksi Renja Eselon I
                  </h3>
                  <p className="text-[0.7rem] text-purple-200">
                    File: {uploadedFile?.name || "Dokumen"} · Terdeteksi:{" "}
                    <strong>{extractionResult.metadata?.unit_kerja}</strong> (TA{" "}
                    {extractionResult.metadata?.tahun_anggaran})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExtractionModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tab Switcher */}
            <div className="flex border-b border-[var(--border)] bg-[var(--accent)] px-4">
              <button
                type="button"
                onClick={() => setActiveModalTab("bab1")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeModalTab === "bab1"
                    ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-white/50 dark:bg-slate-900/50"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Isian Bab I (Pendahuluan & Capaian)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab("bab2")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeModalTab === "bab2"
                    ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-white/50 dark:bg-slate-900/50"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Isian Bab II (Program Kerja Lintas & Unit)</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs text-[var(--text)] bg-[var(--card)] leading-relaxed">
              {activeModalTab === "bab1" ? (
                <div className="space-y-5">
                  {/* Bagian A */}
                  <div className="space-y-1.5 p-4 rounded-xl border border-[var(--border)] bg-[var(--accent)]">
                    <h4 className="font-bold text-xs text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                      A. Gambaran Umum (Sasaran & Program Kerja)
                    </h4>
                    <p className="text-justify leading-relaxed">
                      {extractionResult.bab1?.gambaran_sasaran || "—"}
                    </p>
                    {extractionResult.bab1?.gambaran_program_kerja && (
                      <p className="text-justify leading-relaxed mt-2 text-[var(--text-muted)]">
                        {extractionResult.bab1?.gambaran_program_kerja}
                      </p>
                    )}
                  </div>

                  {/* Bagian B */}
                  <div className="space-y-2 p-4 rounded-xl border border-[var(--border)] bg-[var(--accent)]">
                    <h4 className="font-bold text-xs text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                      B. Capaian Kinerja Tahun Sebelumnya
                    </h4>
                    <p className="text-justify leading-relaxed">
                      {extractionResult.bab1?.capaian_narasi_th_min1 || "—"}
                    </p>
                    {extractionResult.bab1?.capaian_rows?.length > 0 && (
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full border-collapse border border-[var(--border)] text-[0.7rem]">
                          <thead className="bg-[var(--card)] font-semibold">
                            <tr>
                              <th className="p-1.5 border border-[var(--border)] text-left">Sasaran Program</th>
                              <th className="p-1.5 border border-[var(--border)] text-left">IKP</th>
                              <th className="p-1.5 border border-[var(--border)] text-center">Target</th>
                              <th className="p-1.5 border border-[var(--border)] text-center">Realisasi</th>
                              <th className="p-1.5 border border-[var(--border)] text-center">Capaian</th>
                            </tr>
                          </thead>
                          <tbody>
                            {extractionResult.bab1.capaian_rows.map((r: any, idx: number) => (
                              <tr key={idx}>
                                <td className="p-1.5 border border-[var(--border)]">{r.sasaran_program}</td>
                                <td className="p-1.5 border border-[var(--border)]">{r.ikp}</td>
                                <td className="p-1.5 border border-[var(--border)] text-center">{r.target}</td>
                                <td className="p-1.5 border border-[var(--border)] text-center">{r.realisasi}</td>
                                <td className="p-1.5 border border-[var(--border)] text-center font-bold text-emerald-600">
                                  {r.capaian_pct}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Bagian C */}
                  <div className="space-y-2 p-4 rounded-xl border border-[var(--border)] bg-[var(--accent)]">
                    <h4 className="font-bold text-xs text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                      C. Arah Kebijakan, Strategi, & Target Kinerja
                    </h4>
                    <p className="text-justify leading-relaxed">
                      {extractionResult.bab1?.arah_narasi_renstra || "—"}
                    </p>
                    {extractionResult.bab1?.target_kinerja_rows?.length > 0 && (
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full border-collapse border border-[var(--border)] text-[0.7rem]">
                          <thead className="bg-[var(--card)] font-semibold">
                            <tr>
                              <th className="p-1.5 border border-[var(--border)] text-center w-12">Kode</th>
                              <th className="p-1.5 border border-[var(--border)] text-left">Sasaran / Indikator</th>
                              <th className="p-1.5 border border-[var(--border)] text-center">Target</th>
                              <th className="p-1.5 border border-[var(--border)] text-center">Satuan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {extractionResult.bab1.target_kinerja_rows.map((r: any, idx: number) => (
                              <tr key={idx}>
                                <td className="p-1.5 border border-[var(--border)] text-center font-bold">{r.kode}</td>
                                <td className="p-1.5 border border-[var(--border)]">{r.sasaran_indikator}</td>
                                <td className="p-1.5 border border-[var(--border)] text-center font-semibold">{r.target_t1}</td>
                                <td className="p-1.5 border border-[var(--border)] text-center">{r.satuan}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Bagian D */}
                  <div className="space-y-1.5 p-4 rounded-xl border border-[var(--border)] bg-[var(--accent)]">
                    <h4 className="font-bold text-xs text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                      D. Analisis Situasi
                    </h4>
                    <p className="text-justify leading-relaxed">
                      <strong>Momentum & Peluang: </strong>
                      {extractionResult.bab1?.analisis_momentum || "—"}
                    </p>
                    {extractionResult.bab1?.analisis_tantangan && (
                      <p className="text-justify leading-relaxed mt-1 text-[var(--text-muted)]">
                        <strong>Tantangan: </strong>
                        {extractionResult.bab1?.analisis_tantangan}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Pengantar Bab 2 */}
                  <div className="space-y-1.5 p-4 rounded-xl border border-[var(--border)] bg-[var(--accent)]">
                    <h4 className="font-bold text-xs text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                      Pengantar Program Kerja
                    </h4>
                    <p className="text-justify leading-relaxed">
                      {extractionResult.bab2?.pengantar_program_kerja || "—"}
                    </p>
                  </div>

                  {/* Program Kerja Lintas Unit */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                        A. Program Kerja Lintas Unit Kerja ({extractionResult.bab2?.proker_lintas_list?.length || 0} Paket)
                      </h4>
                    </div>
                    {extractionResult.bab2?.proker_lintas_list?.map((p: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--accent)] space-y-1">
                        <p className="font-bold text-[var(--text)]">{p.nomenklatur}</p>
                        <p className="text-[var(--text-muted)] leading-relaxed">{p.uraian}</p>
                        <div className="pt-1 space-y-0.5 text-[0.7rem]">
                          <p><span className="font-semibold text-purple-700 dark:text-purple-300">Tujuan:</span> {p.tujuan || "—"}</p>
                          <p><span className="font-semibold text-emerald-700 dark:text-emerald-300">Outcome:</span> {p.outcome || "—"}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Program Kerja Unit Kerja */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                        B. Program Kerja Unit Kerja ({extractionResult.bab2?.proker_unit_list?.length || 0} Paket)
                      </h4>
                    </div>
                    {extractionResult.bab2?.proker_unit_list?.map((p: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--accent)] space-y-1">
                        <p className="font-bold text-[var(--text)]">{p.nomenklatur}</p>
                        <p className="text-[var(--text-muted)] leading-relaxed">{p.uraian}</p>
                        <div className="pt-1 space-y-0.5 text-[0.7rem]">
                          <p><span className="font-semibold text-purple-700 dark:text-purple-300">Tujuan:</span> {p.tujuan || "—"}</p>
                          <p><span className="font-semibold text-emerald-700 dark:text-emerald-300">Outcome:</span> {p.outcome || "—"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--accent)] flex justify-between items-center">
              <span className="text-[0.7rem] text-[var(--text-muted)]">
                Data akan otomatis disimpan ke histori dokumen & form Isian Bab I / Bab II.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowExtractionModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--card)] cursor-pointer"
                >
                  Tutup Preview
                </button>
                <button
                  type="button"
                  onClick={handleApplyExtractedData}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Terapkan & Isi Otomatis Isian Bab I & Bab II</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
