import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Save,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Printer,
  FileSpreadsheet,
  HelpCircle,
  Clock,
  DollarSign,
  User,
  Users,
  RotateCcw,
  Check,
  Info,
  ArrowRight,
  AlertTriangle,
  X,
} from "lucide-react";
import unitKerjaData from "../../data/unitKerjaData.json";
import { mockPejabat } from "../../data/ppatkData";
import {
  getIdentitasKinerjaByUnitKerja,
  getAvailableRoForUnit,
  getUnitKerjaByNamaOrSingkatan,
} from "./kakKinerjaHelper";

interface KomponenTahapan {
  id: string;
  namaKomponen: string;
  uraianRangkaian: string;
  isExtra?: boolean;
  alasanPenambahan?: string;
}

interface JadwalBulananRow {
  id: string;
  komponenNama: string;
  volume: string;
  satuan: string;
  jadwal: Record<string, number | string>;
}

const BULAN_LIST = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const DEFAULT_DASAR_HUKUM_LIST = [
  "Undang-undang Nomor 8 Tahun 2010 tentang Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang.",
  "Peraturan Presiden Nomor 50 tahun 2011 tentang Tata Cara Pelaksanaan Kewenangan PPATK.",
  "Peraturan PPATK Nomor 5 Tahun 2022 Tentang Organisasi Dan Tata Kerja Pusat Pelaporan Dan Analisis Transaksi Keuangan.",
];

const DEFAULT_GAMBARAN_UMUM = `Perkembangan globalisasi, transformasi digital, serta semakin terintegrasinya sistem keuangan internasional telah meningkatkan kompleksitas ancaman tindak pidana pencucian uang, pendanaan terorisme, dan pendanaan proliferasi senjata pemusnah massal. Karakteristik kejahatan keuangan yang bersifat lintas batas (transnational crime), didukung oleh perkembangan teknologi informasi, aset virtual, dan kemudahan perpindahan dana lintas yurisdiksi, menuntut adanya tata kelola pelaksanaan kegiatan kerja yang efektif, akuntabel, dan berorientasi hasil.

Sesuai tugas pokok dan fungsi serta rencana strategis Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK), Kerangka Acuan Kerja (KAK) ini disusun sebagai pedoman operasional pelaksanaan program kerja dan rincian output (RO) guna memastikan ketercapaian target indikator kinerja yang telah ditetapkan.`;

const DEFAULT_PENERIMA_MANFAAT = `Penerima manfaat langsung: Seluruh pemangku kepentingan rezim APU PPT di lingkungan Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK), Kementerian/Lembaga terkait, Lembaga Pengawas dan Pengatur (LPP), Pihak Pelapor (PJK/PBJ/Profesi), Aparat Penegak Hukum (APH), serta masyarakat umum guna mendukung terwujudnya sistem keuangan nasional yang berintegritas.`;

// Fungsi konversi angka nominal ke kalimat terbilang bahasa Indonesia
export function angkaKeTerbilang(nominal: number): string {
  if (isNaN(nominal) || nominal <= 0) return "nol rupiah";

  const satuan = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
    "sepuluh",
    "sebelas",
  ];

  function bilang(n: number): string {
    n = Math.floor(n);
    if (n < 12) {
      return satuan[n];
    } else if (n < 20) {
      return bilang(n - 10) + " belas";
    } else if (n < 100) {
      return bilang(Math.floor(n / 10)) + " puluh " + bilang(n % 10);
    } else if (n < 200) {
      return "seratus " + bilang(n - 100);
    } else if (n < 1000) {
      return bilang(Math.floor(n / 100)) + " ratus " + bilang(n % 100);
    } else if (n < 2000) {
      return "seribu " + bilang(n - 1000);
    } else if (n < 1000000) {
      return bilang(Math.floor(n / 1000)) + " ribu " + bilang(n % 1000);
    } else if (n < 1000000000) {
      return bilang(Math.floor(n / 1000000)) + " juta " + bilang(n % 1000000);
    } else if (n < 1000000000000) {
      return bilang(Math.floor(n / 1000000000)) + " miliar " + bilang(n % 1000000000);
    } else if (n < 1000000000000000) {
      return bilang(Math.floor(n / 1000000000000)) + " triliun " + bilang(n % 1000000000000);
    }
    return "";
  }

  const hasil = bilang(nominal).replace(/\s+/g, " ").trim();
  return hasil ? `${hasil} rupiah` : "nol rupiah";
}

export function parseNominalFromString(val: string): number {
  if (!val) return 0;
  // Hapus semua karakter non-angka
  const cleaned = val.replace(/[^0-9]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function getPejabatSatker(unitNameOrSingkatan: string): { nama: string; jabatan: string } {
  const uk = getUnitKerjaByNamaOrSingkatan(unitNameOrSingkatan);
  const q = uk.nama.toLowerCase();

  if (q.includes("pelatihan") || uk.singkatan === "PATIH") {
    return {
      nama: "Akhyar Effendi, S.E., M.M.",
      jabatan: "Kepala Pusat Pendidikan dan Pelatihan APU PPT",
    };
  }
  if (q.includes("internasional") || uk.singkatan === "SERASI") {
    return {
      nama: "Diana Soraya Noor, S.H., M.H.",
      jabatan: "Direktur Strategi dan Kerja Sama Internasional",
    };
  }
  if (q.includes("teknologi") || uk.singkatan === "LOGIS") {
    return {
      nama: "Kepala Pusat Teknologi Informasi",
      jabatan: "Kepala Pusat Teknologi Informasi PPATK",
    };
  }
  if (q.includes("hukum") || uk.singkatan === "KREASI") {
    return {
      nama: "Direktur Hukum dan Regulasi",
      jabatan: "Direktur Hukum dan Regulasi PPATK",
    };
  }
  if (q.includes("inspektorat") || uk.singkatan === "PEKA") {
    return {
      nama: "Inspektur",
      jabatan: "Inspektur PPATK",
    };
  }
  if (q.includes("perencanaan") || uk.singkatan === "BINCANG") {
    return {
      nama: "Kepala Biro Perencanaan dan Keuangan",
      jabatan: "Kepala Biro Perencanaan dan Keuangan PPATK",
    };
  }
  if (q.includes("umum") || uk.singkatan === "BIRU") {
    return {
      nama: "Kepala Biro Umum",
      jabatan: "Kepala Biro Umum PPATK",
    };
  }

  return {
    nama: `Pejabat Pembuat Komitmen ${uk.singkatan}`,
    jabatan: `Kepala / Direktur ${uk.nama}`,
  };
}

export default function IsianKakPage() {
  const [activeUnit, setActiveUnit] = useState<string>("Direktorat Strategi dan Kerja Sama Internasional");
  const [activeHistoriLabel, setActiveHistoriLabel] = useState<string>("DIPA Awal - B00");
  const [selectedRoIdx, setSelectedRoIdx] = useState<number>(0);
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);
  const [autoFillNotice, setAutoFillNotice] = useState<string | null>(null);

  // ── Identitas Header KAK (Diisi Otomatis berdasarkan Informasi Kinerja - Read Only) ──
  const [kementerianLembaga, setKementerianLembaga] = useState("(078) PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN");
  const [unitEselon1, setUnitEselon1] = useState("(078) PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN");
  const [program, setProgram] = useState("(078.BE) Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang dan Pendanaan Terorisme");
  const [sasaranProgram, setSasaranProgram] = useState("Meningkatnya efektivitas kerjasama APU PPT dan PPSPM");
  const [ikp, setIkp] = useState(
    "IKP 4.1: Persentase Pemenuhan Kewajiban Kontribusi Tenaga Ahli untuk FATF\nIKP 4.2: Persentase Penyampaian Intervensi Indonesia yang Diterima di Forum Internasional APUPPT PPSPM"
  );
  const [kegiatan, setKegiatan] = useState("(3380) Pelaksanaan Kerja Sama Internasional");
  const [sasaranKegiatan, setSasaranKegiatan] = useState("SK 4.1: Meningkatnya Efektivitas Kerja Sama APUPPT PPSPM");
  const [ikk, setIkk] = useState(
    "IKK 4.1.1: Persentase Penyampaian Intervensi Indonesia yang Diterima di Forum Teknis FATF dan FSRB\nIKK 4.1.2: Persentase Pemenuhan Kajian Implementasi Standar Internasional\nIKK 4.2.1: Indeks Efektivitas Kerjasama Internasional"
  );
  const [kro, setKro] = useState("AEC.001 – Laporan Hasil Intervensi dan Implementasi Pelaksanaan Kerja Sama Internasional");
  const [ro, setRo] = useState(
    "051: Pelaksanaan Kerja Sama Internasional, dengan Sub-Komponen A: Kerja Sama Internasional Penguatan Information Exchange, Supervisory, dan FIU (IO 2,4,6); Sub-Komponen B: Kerja Sama Internasional Penguatan Pemberantasan TPPU, TPPT dan PPSPM (IO 2,3,4,6); Sub-Komponen C: Penguatan Strategi Kerja Sama Internasional Multilateral dan Bilateral (IO 2,4,6)"
  );
  const [satuanRo, setSatuanRo] = useState("Laporan/Dokumen Kesepakatan");

  // ── Isian Tambahan yang Dapat Diedit (Indikator RO & Volume RO) ──
  const [indikatorRo, setIndikatorRo] = useState("Jumlah Laporan Hasil Intervensi dan Implementasi Pelaksanaan Kerja Sama Internasional");
  const [volumeRo, setVolumeRo] = useState("1");

  // ── Bagian A: Latar Belakang ──
  // Dibatasi maksimal 5 peraturan yang berhubungan langsung
  const [dasarHukumList, setDasarHukumList] = useState<string[]>(DEFAULT_DASAR_HUKUM_LIST);
  const [gambaranUmum, setGambaranUmum] = useState(DEFAULT_GAMBARAN_UMUM);

  // ── Bagian B: Penerima Manfaat ──
  const [penerimaManfaat, setPenerimaManfaat] = useState(DEFAULT_PENERIMA_MANFAAT);

  // ── Bagian C: Strategi Pencapaian Keluaran (Metode & Komponen) ──
  const [metodePelaksanaan, setMetodePelaksanaan] = useState("Dilakukan secara kombinasi antara swakelola, penyedia, dan pengadaan langsung.");
  const [komponenList, setKomponenList] = useState<KomponenTahapan[]>([
    {
      id: "komp_1",
      namaKomponen: "Komponen A: Kerja Sama Internasional Penguatan Information Exchange, Supervisory, dan FIU (IO 2,4,6)",
      uraianRangkaian: "1. Pertemuan dalam Forum Egmont Group Meeting dan Plenary Meeting\n2. Penyelenggaraan Joint Casework Meeting & Technical Assistance bilateral dan regional.",
    },
    {
      id: "komp_2",
      namaKomponen: "Komponen B: Kerja Sama Internasional Penguatan Pemberantasan TPPU, TPPT dan PPSPM (IO 2,3,4,6)",
      uraianRangkaian: "1. Partisipasi pada Financial Action Task Force (FATF) Plenary & Working Group Meetings\n2. Pertemuan Asia/Pacific Group on Money Laundering (APG) Annual Meeting & Forum Asset Recovery.",
    },
  ]);

  // Modal Alasan Penambahan Komponen
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [extraReasonText, setExtraReasonText] = useState("");
  const [extraKomponenName, setExtraKomponenName] = useState("");

  // Toast status per bagian
  const [sectionSaveAlert, setSectionSaveAlert] = useState<string | null>(null);

  // ── Bagian D: Kurun Waktu & Jadwal Bulanan ──
  const [jadwalRows, setJadwalRows] = useState<JadwalBulananRow[]>([
    {
      id: "jdw_1",
      komponenNama: "Laporan Kerja Sama Internasional Penguatan Information Exchange, Supervisory, dan FIU (IO 2,4,6)",
      volume: "8",
      satuan: "Dokumen/Kesepakatan",
      jadwal: { Jan: "", Feb: 1, Mar: 1, Apr: 1, Mei: "", Jun: 1, Jul: 1, Agu: "", Sep: 1, Okt: 1, Nov: 1, Des: "" },
    },
    {
      id: "jdw_2",
      komponenNama: "Laporan Kerja Sama Internasional Penguatan Pemberantasan TPPU, TPPT dan PPSPM (IO 2,3,4,6)",
      volume: "5",
      satuan: "Dokumen/Kesepakatan",
      jadwal: { Jan: "", Feb: "", Mar: "", Apr: 1, Mei: 1, Jun: "", Jul: 1, Agu: "", Sep: 1, Okt: "", Nov: 1, Des: "" },
    },
  ]);

  // ── Bagian E: Biaya yang Diperlukan & Penandatangan ──
  const [totalBiaya, setTotalBiaya] = useState("Rp3.683.193.000");
  const [terbilangBiaya, setTerbilangBiaya] = useState("tiga miliar enam ratus delapan puluh tiga juta seratus sembilan puluh tiga ribu rupiah");
  const [tempatTanggalTtd, setTempatTanggalTtd] = useState("Jakarta, 8 Oktober 2026");
  const [namaPenanggungjawab, setNamaPenanggungjawab] = useState("Diana Soraya Noor, S.H., M.H.");
  const [jabatanPenanggungjawab, setJabatanPenanggungjawab] = useState("Direktur Strategi dan Kerja Sama Internasional");

  // Daftar RO yang dimiliki Unit Kerja aktif dari Informasi Kinerja
  const currentUnitInfo = getUnitKerjaByNamaOrSingkatan(activeUnit);
  const availableRos = getAvailableRoForUnit(currentUnitInfo.singkatan);

  // Jumlah maksimal komponen sesuai jumlah pada submenu Informasi Kinerja
  const maxKomponenFromIK = Math.max(
    1,
    availableRos[selectedRoIdx]?.komponenList?.length || 3
  );

  // ── Fungsi Pengisian Otomatis Berdasarkan Unit Kerja & RO Aktif ──
  function populateFromInformasiKinerja(unitName: string, roIdx: number = 0, notify: boolean = false) {
    const data = getIdentitasKinerjaByUnitKerja(unitName, roIdx);

    setKementerianLembaga(data.kementerianLembaga);
    setUnitEselon1(data.unitEselon1);
    setProgram(data.program);
    setSasaranProgram(data.sasaranProgram);
    setIkp(data.ikp);
    setKegiatan(data.kegiatan);
    setSasaranKegiatan(data.sasaranKegiatan);
    setIkk(data.ikk);
    setKro(data.kro);
    setRo(data.ro);
    setSatuanRo(data.satuanRo);

    // Set nilai awal indikator RO dan volume RO
    setIndikatorRo(data.indikatorRoDefault);
    setVolumeRo(data.volumeRoDefault);

    // Update pejabat satker
    const pj = getPejabatSatker(unitName);
    setNamaPenanggungjawab(pj.nama);
    setJabatanPenanggungjawab(pj.jabatan);

    // Update Komponen jika default tersedia
    if (data.subKomponenDefault && data.subKomponenDefault.length > 0) {
      const newKomps: KomponenTahapan[] = data.subKomponenDefault.map((s, idx) => ({
        id: `komp_${idx + 1}`,
        namaKomponen: s.namaSubKomponen,
        uraianRangkaian: s.uraianRangkaian,
      }));
      setKomponenList(newKomps);

      const newJadwals: JadwalBulananRow[] = data.subKomponenDefault.map((s, idx) => ({
        id: `jdw_${idx + 1}`,
        komponenNama: s.namaSubKomponen,
        volume: String(idx === 0 ? (data.volumeRoDefault || "8") : "4"),
        satuan: data.satuanRo,
        jadwal: {
          Jan: "", Feb: 1, Mar: 1, Apr: 1, Mei: "", Jun: 1,
          Jul: 1, Agu: "", Sep: 1, Okt: 1, Nov: 1, Des: ""
        },
      }));
      setJadwalRows(newJadwals);
    }

    if (notify) {
      setAutoFillNotice(
        `Isian KAK/TOR berhasil diisi otomatis berdasarkan data Informasi Kinerja untuk "${data.unitNama}" (${data.unitSingkatan})!`
      );
      setTimeout(() => setAutoFillNotice(null), 4000);
    }
  }

  // ── Load Saat Pertama Kali Render Berdasarkan Histori Aktif ──
  useEffect(() => {
    try {
      let unitToLoad = "Direktorat Strategi dan Kerja Sama Internasional";
      let historiLabel = "DIPA Awal - B00";

      // 1. Ambil unit kerja dari Pilih Histori KAK
      const rawKakHistori = localStorage.getItem("kak_active_histori");
      if (rawKakHistori) {
        const parsed = JSON.parse(rawKakHistori);
        if (parsed.kdsatker) unitToLoad = parsed.kdsatker;
        if (parsed.label) historiLabel = parsed.label;
      } else {
        // Fallback ke Renja Eselon II jika KAK belum dipilih
        const rawE2 = localStorage.getItem("renja_e2_active_histori");
        if (rawE2) {
          const parsedE2 = JSON.parse(rawE2);
          if (parsedE2.kdsatker) unitToLoad = parsedE2.kdsatker;
          if (parsedE2.label) historiLabel = parsedE2.label;
        }
      }

      setActiveUnit(unitToLoad);
      setActiveHistoriLabel(historiLabel);

      // 2. OTOMATIS ISI FORMULIR BERDASARKAN INFORMASI KINERJA UNIT KERJA TERSEBUT
      populateFromInformasiKinerja(unitToLoad, 0, false);

      // 3. Muat narasi tambahan jika sebelumnya pernah disimpan user
      const savedDataKey = `kak_isian_data_${unitToLoad.replace(/\s+/g, "_")}`;
      const savedCustom = localStorage.getItem(savedDataKey) || localStorage.getItem("kak_isian_data");
      if (savedCustom) {
        const p = JSON.parse(savedCustom);
        if (p.indikatorRo) setIndikatorRo(p.indikatorRo);
        if (p.volumeRo) setVolumeRo(p.volumeRo);
        if (Array.isArray(p.dasarHukumList)) {
          setDasarHukumList(p.dasarHukumList.slice(0, 5));
        } else if (typeof p.dasarHukum === "string") {
          const lines = p.dasarHukum
            .split("\n")
            .map((l: string) => l.replace(/^[0-9]+[.)]\s*/, "").trim())
            .filter((l: string) => l.length > 0);
          if (lines.length > 0) setDasarHukumList(lines.slice(0, 5));
        }
        if (p.gambaranUmum) setGambaranUmum(p.gambaranUmum);
        if (p.penerimaManfaat) setPenerimaManfaat(p.penerimaManfaat);
        if (p.metodePelaksanaan) setMetodePelaksanaan(p.metodePelaksanaan);
        if (Array.isArray(p.komponenList)) setKomponenList(p.komponenList);
        if (p.totalBiaya) setTotalBiaya(p.totalBiaya);
        if (p.terbilangBiaya) setTerbilangBiaya(p.terbilangBiaya);
        if (p.tempatTanggalTtd) setTempatTanggalTtd(p.tempatTanggalTtd);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  function handleSaveFull(notifySection?: string) {
    const dataToSave = {
      activeUnit,
      activeHistoriLabel,
      kementerianLembaga,
      unitEselon1,
      program,
      sasaranProgram,
      ikp,
      kegiatan,
      sasaranKegiatan,
      ikk,
      kro,
      ro,
      indikatorRo,
      volumeRo,
      satuanRo,
      dasarHukumList,
      dasarHukum: dasarHukumList.map((d, i) => `${i + 1}. ${d}`).join("\n"),
      gambaranUmum,
      penerimaManfaat,
      metodePelaksanaan,
      komponenList,
      jadwalRows,
      totalBiaya,
      terbilangBiaya,
      tempatTanggalTtd,
      namaPenanggungjawab,
      jabatanPenanggungjawab,
      updatedAt: new Date().toISOString(),
    };
    const savedDataKey = `kak_isian_data_${activeUnit.replace(/\s+/g, "_")}`;
    localStorage.setItem(savedDataKey, JSON.stringify(dataToSave));
    localStorage.setItem("kak_isian_data", JSON.stringify(dataToSave));

    if (notifySection) {
      setSectionSaveAlert(`Perubahan pada ${notifySection} berhasil disimpan!`);
      setTimeout(() => setSectionSaveAlert(null), 3000);
    } else {
      setSavedSuccessAlert(true);
      setTimeout(() => setSavedSuccessAlert(false), 3500);
    }
  }

  function handleAddDasarHukum() {
    if (dasarHukumList.length >= 5) return;
    setDasarHukumList([
      ...dasarHukumList,
      "Peraturan perundang-undangan / keputusan terkait pelaksanaan tugas pokok dan fungsi...",
    ]);
  }

  function handleRemoveDasarHukum(index: number) {
    setDasarHukumList(dasarHukumList.filter((_, idx) => idx !== index));
  }

  function handleUpdateDasarHukum(index: number, val: string) {
    const updated = [...dasarHukumList];
    updated[index] = val;
    setDasarHukumList(updated);
  }

  function handleInitiateAddKomponen() {
    // Cek apakah jumlah komponen saat ini sudah mencapai atau melebihi kuota Informasi Kinerja
    if (komponenList.length >= maxKomponenFromIK) {
      const nextIdx = komponenList.length + 1;
      const huruf = String.fromCharCode(64 + nextIdx);
      setExtraKomponenName(`Komponen ${huruf}: Rincian Tahapan Output Tambahan`);
      setExtraReasonText("");
      setIsReasonModalOpen(true);
    } else {
      // Masih di dalam kuota, langsung tambahkan
      const nextIdx = komponenList.length + 1;
      const huruf = String.fromCharCode(64 + nextIdx);
      const newId = `komp_${Date.now()}`;
      const newNama = `Komponen ${huruf}: Rincian Tahapan Output Terkait`;
      setKomponenList([
        ...komponenList,
        {
          id: newId,
          namaKomponen: newNama,
          uraianRangkaian: "Uraikan rangkaian kegiatan, tahapan pelaksanaan, atau nama forum teknis terkait...",
        },
      ]);
      setJadwalRows([
        ...jadwalRows,
        {
          id: `jdw_${Date.now()}`,
          komponenNama: newNama,
          volume: "1",
          satuan: satuanRo,
          jadwal: { Jan: "", Feb: "", Mar: "", Apr: "", Mei: "", Jun: "", Jul: "", Agu: "", Sep: "", Okt: "", Nov: "", Des: "" },
        },
      ]);
    }
  }

  function handleConfirmExtraKomponen() {
    if (!extraReasonText.trim()) return;

    const newId = `komp_${Date.now()}`;
    const newNama = extraKomponenName.trim() || `Komponen Tambahan #${komponenList.length + 1}`;
    setKomponenList([
      ...komponenList,
      {
        id: newId,
        namaKomponen: newNama,
        uraianRangkaian: "Uraikan rangkaian kegiatan, tahapan pelaksanaan, atau nama forum teknis terkait...",
        isExtra: true,
        alasanPenambahan: extraReasonText.trim(),
      },
    ]);
    setJadwalRows([
      ...jadwalRows,
      {
        id: `jdw_${Date.now()}`,
        komponenNama: newNama,
        volume: "1",
        satuan: satuanRo,
        jadwal: { Jan: "", Feb: "", Mar: "", Apr: "", Mei: "", Jun: "", Jul: "", Agu: "", Sep: "", Okt: "", Nov: "", Des: "" },
      },
    ]);

    setIsReasonModalOpen(false);
    setExtraReasonText("");
  }

  function handleJadwalChange(rowId: string, bulan: string, value: string) {
    setJadwalRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, jadwal: { ...r.jadwal, [bulan]: value } } : r))
    );
  }

  function handleSatuanChange(rowId: string, value: string) {
    setJadwalRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, satuan: value } : r))
    );
  }

  function handleTotalBiayaChange(value: string) {
    setTotalBiaya(value);
    const nominal = parseNominalFromString(value);
    if (nominal > 0) {
      setTerbilangBiaya(angkaKeTerbilang(nominal));
    } else {
      setTerbilangBiaya("nol rupiah");
    }
  }

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Penganggaran & Biaya</span>
            <span>/</span>
            <span>Kerangka Acuan Kerja (TOR)</span>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Isian KAK/TOR</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <FileSpreadsheet className="h-6 w-6 text-[var(--primary)]" />
            <span>Form Input Kerangka Acuan Kerja (KAK / TOR)</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Formulir penyusunan Kerangka Acuan Kerja terotomatisasi dengan data resmi submenu <strong>Informasi Kinerja</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => populateFromInformasiKinerja(activeUnit, selectedRoIdx, true)}
            className="px-3.5 py-2 rounded-xl border border-[var(--primary)]/40 bg-indigo-50/70 dark:bg-indigo-950/40 text-xs font-bold text-[var(--primary)] hover:bg-indigo-100 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Muat ulang seluruh isian otomatis dari master Informasi Kinerja"
          >
            <Sparkles className="h-4 w-4" />
            <span>Sinkronkan Informasi Kinerja</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800 text-xs font-semibold hover:bg-[var(--accent)] flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4 text-[var(--text-muted)]" />
            <span>Cetak Draft KAK</span>
          </button>
          <button
            onClick={() => handleSaveFull()}
            className="px-5 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Seluruh KAK</span>
          </button>
        </div>
      </div>

      {/* ── Banner Unit & Status Histori Aktif ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-950 dark:text-indigo-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[0.68rem] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
              Unit Kerja Terpilih dari Submenu Pilih Histori
            </div>
            <div className="text-sm font-bold text-[var(--text)]">
              {activeUnit} · <span className="font-mono text-indigo-600 dark:text-indigo-400">[{activeHistoriLabel}]</span>
            </div>
          </div>
        </div>
        <Link
          to="/kak/pilih-histori"
          className="px-3.5 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-50 flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span>Ganti Unit Kerja di Pilih Histori</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Alert Auto-Fill */}
      {autoFillNotice && (
        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200 flex items-center gap-2.5 animate-in fade-in">
          <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
          <span>{autoFillNotice}</span>
        </div>
      )}

      {/* Toast Alert Per-Bagian */}
      {sectionSaveAlert && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="font-semibold">{sectionSaveAlert}</span>
          </div>
          <button onClick={() => setSectionSaveAlert(null)} className="text-blue-600 hover:text-blue-800">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {savedSuccessAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Seluruh isian data Kerangka Acuan Kerja (KAK) berhasil disimpan ke histori aktif!</span>
        </div>
      )}

      {/* ── FORM SECTIONS ── */}
      <div className="space-y-6">
        {/* 1. IDENTITAS HEADER DOKUMEN KAK (TERISI OTOMATIS DARI INFORMASI KINERJA) */}
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2 uppercase tracking-wide">
              <span className="w-6 h-6 rounded-lg bg-[var(--primary)] text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Identitas Program &amp; Indikator Kinerja KAK</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.68rem] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>Otomatis Terisi dari Informasi Kinerja</span>
              </div>
              <button
                onClick={() => handleSaveFull("Bagian 1: Identitas Program & RO")}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[var(--primary)] hover:text-white border border-[var(--border)] text-xs font-bold text-[var(--text)] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Bagian 1</span>
              </button>
            </div>
          </div>

          {/* Opsi Pemilih Nomenklatur RO jika Unit Kerja memiliki lebih dari 1 RO di Informasi Kinerja */}
          {availableRos.length > 1 && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--border)] space-y-1.5 text-xs">
              <label className="font-bold text-[var(--text)] flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[var(--primary)]" />
                <span>Pilih Nomenklatur RO Unit Kerja ({availableRos.length} RO terdaftar di Informasi Kinerja):</span>
              </label>
              <select
                value={selectedRoIdx}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setSelectedRoIdx(idx);
                  populateFromInformasiKinerja(activeUnit, idx, true);
                }}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 text-[var(--text)] font-semibold cursor-pointer"
              >
                {availableRos.map((roItem, idx) => (
                  <option key={idx} value={idx}>
                    {roItem.ro} ({roItem.komponenList.length} komponen)
                  </option>
                ))}
              </select>
              <p className="text-[0.68rem] text-[var(--text-muted)]">
                Pilih RO yang akan dibuatkan dokumen KAK-nya. Isian KRO, Sasaran Kegiatan, dan Komponen di bawah akan langsung menyesuaikan.
              </p>
            </div>
          )}

          {/* Form Fields Identitas KAK (Field Informasi Kinerja Terkunci/Read-Only + Baris Indikator & Volume RO Dapat Diedit) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Kementerian / Lembaga (Read Only) */}
            <div className="space-y-1">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Kementerian/Lembaga:</span>
                <span className="text-[0.68rem] text-slate-400 font-normal">[Informasi Kinerja]</span>
              </label>
              <input
                type="text"
                readOnly
                value={kementerianLembaga}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700/80 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 cursor-not-allowed select-text font-medium"
              />
            </div>

            {/* Unit Eselon I (Read Only) */}
            <div className="space-y-1">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Unit Eselon I:</span>
                <span className="text-[0.68rem] text-slate-400 font-normal">[Informasi Kinerja]</span>
              </label>
              <input
                type="text"
                readOnly
                value={unitEselon1}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700/80 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 cursor-not-allowed select-text font-medium"
              />
            </div>

            {/* Program (Read Only) */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Program:</span>
                <span className="text-[0.68rem] text-slate-400 font-normal">[Informasi Kinerja]</span>
              </label>
              <input
                type="text"
                readOnly
                value={program}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700/80 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 cursor-not-allowed select-text font-medium"
              />
            </div>

            {/* Sasaran Program (Read Only) */}
            <div className="space-y-1">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Sasaran Program:</span>
                <span className="text-[0.68rem] text-slate-400 font-normal">[Informasi Kinerja]</span>
              </label>
              <textarea
                rows={2}
                readOnly
                value={sasaranProgram}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700/80 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 cursor-not-allowed select-text leading-normal font-medium"
              />
            </div>

            {/* Indikator Kinerja Program (IKP) (Read Only) */}
            <div className="space-y-1">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Indikator Kinerja Program (IKP):</span>
                <span className="text-[0.68rem] text-slate-400 font-normal">[Informasi Kinerja]</span>
              </label>
              <textarea
                rows={2}
                readOnly
                value={ikp}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700/80 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 cursor-not-allowed select-text leading-normal font-medium"
              />
            </div>

            {/* Kegiatan (Read Only) */}
            <div className="space-y-1">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Kegiatan:</span>
                <span className="text-[0.68rem] text-slate-400 font-normal">[Informasi Kinerja]</span>
              </label>
              <input
                type="text"
                readOnly
                value={kegiatan}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700/80 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 cursor-not-allowed select-text font-medium"
              />
            </div>

            {/* Sasaran Kegiatan (Read Only) */}
            <div className="space-y-1">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Sasaran Kegiatan:</span>
                <span className="text-[0.68rem] text-slate-400 font-normal">[Informasi Kinerja]</span>
              </label>
              <input
                type="text"
                readOnly
                value={sasaranKegiatan}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700/80 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 cursor-not-allowed select-text font-medium"
              />
            </div>

            {/* Indikator Kinerja Kegiatan (IKK) (Read Only) */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Indikator Kinerja Kegiatan (IKK):</span>
                <span className="text-[0.68rem] text-slate-400 font-normal">[Informasi Kinerja]</span>
              </label>
              <textarea
                rows={2}
                readOnly
                value={ikk}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700/80 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 cursor-not-allowed select-text leading-normal font-medium"
              />
            </div>

            {/* Klasifikasi Rincian Output (KRO) (Read Only) */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Klasifikasi Rincian Output (KRO):</span>
                <span className="text-[0.68rem] text-slate-400 font-normal">[Informasi Kinerja]</span>
              </label>
              <input
                type="text"
                readOnly
                value={kro}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700/80 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 cursor-not-allowed select-text font-medium"
              />
            </div>

            {/* Rincian Output (RO) (Read Only) */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Rincian Output (RO):</span>
                <span className="text-[0.68rem] text-slate-400 font-normal">[Informasi Kinerja]</span>
              </label>
              <textarea
                rows={3}
                readOnly
                value={ro}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700/80 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 cursor-not-allowed select-text leading-normal font-medium"
              />
            </div>

            {/* Indikator RO (Dapat Diedit) */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Indikator RO:</span>
                <span className="text-[0.68rem] text-[var(--primary)] font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  * Dapat Diedit
                </span>
              </label>
              <textarea
                rows={2}
                value={indikatorRo}
                onChange={(e) => setIndikatorRo(e.target.value)}
                placeholder="Masukkan tolok ukur / indikator capaian Rincian Output (RO)..."
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] font-medium leading-normal"
              />
              <p className="text-[0.68rem] text-[var(--text-muted)]">
                Tuliskan indikator pencapaian hasil pelaksanaan Rincian Output yang terukur.
              </p>
            </div>

            {/* Volume RO (Dapat Diedit) */}
            <div className="space-y-1">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Volume RO:</span>
                <span className="text-[0.68rem] text-[var(--primary)] font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  * Dapat Diedit
                </span>
              </label>
              <input
                type="text"
                value={volumeRo}
                onChange={(e) => setVolumeRo(e.target.value)}
                placeholder="Contoh: 1, 8, 12, dst."
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] font-bold text-sm"
              />
              <p className="text-[0.68rem] text-[var(--text-muted)]">
                Jumlah volume target keluaran yang direncanakan.
              </p>
            </div>

            {/* Satuan RO (Read Only dari Informasi Kinerja) */}
            <div className="space-y-1">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Satuan RO:</span>
                <span className="text-[0.68rem] text-slate-400 font-normal">[Informasi Kinerja]</span>
              </label>
              <input
                type="text"
                readOnly
                value={satuanRo}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700/80 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 cursor-not-allowed select-text font-medium"
              />
              <p className="text-[0.68rem] text-[var(--text-muted)]">
                Satuan target resmi (misal: Laporan/Dokumen Kesepakatan, Orang/Sertifikat, Layanan).
              </p>
            </div>
          </div>
        </div>

        {/* 2. BAGIAN A: LATAR BELAKANG */}
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2 uppercase tracking-wide">
              <span className="w-6 h-6 rounded-lg bg-slate-700 text-white text-xs flex items-center justify-center font-bold">A</span>
              <span>Latar Belakang</span>
            </h2>
            <button
              onClick={() => handleSaveFull("Bagian A: Latar Belakang")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[var(--primary)] hover:text-white border border-[var(--border)] text-xs font-bold text-[var(--text)] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Simpan Bagian A</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* A.1 Dasar Hukum - Maksimal 5 Peraturan */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-[var(--border)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-[var(--text)] flex items-center gap-2">
                    <span>1. Dasar Hukum</span>
                    <span className="px-2 py-0.5 rounded-full text-[0.68rem] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Maks. 5 Peraturan Langsung ({dasarHukumList.length}/5)
                    </span>
                  </div>
                  <p className="text-[0.68rem] text-[var(--text-muted)] mt-0.5">
                    Hanya peraturan perundang-undangan, PP, Perpres, atau Peraturan PPATK yang berhubungan langsung dengan pelaksanaan RO.
                  </p>
                </div>
                {dasarHukumList.length < 5 && (
                  <button
                    onClick={handleAddDasarHukum}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white dark:bg-slate-800 hover:bg-[var(--accent)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Peraturan</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5 pt-1">
                {dasarHukumList.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-[var(--text-muted)] mt-2 shrink-0 w-5">
                      {idx + 1}.
                    </span>
                    <textarea
                      rows={2}
                      value={item}
                      onChange={(e) => handleUpdateDasarHukum(idx, e.target.value)}
                      placeholder={`Peraturan rujukan #${idx + 1} (UU/PP/Perpres/Peraturan PPATK)...`}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 text-[var(--text)] font-sans leading-relaxed focus:ring-1 focus:ring-[var(--primary)] text-xs"
                    />
                    {dasarHukumList.length > 1 && (
                      <button
                        onClick={() => handleRemoveDasarHukum(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg border border-transparent hover:border-rose-200 mt-1 cursor-pointer"
                        title="Hapus peraturan ini"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* A.2 Gambaran Umum */}
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text)]">2. Gambaran Umum:</label>
              <textarea
                rows={6}
                value={gambaranUmum}
                onChange={(e) => setGambaranUmum(e.target.value)}
                className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 font-sans leading-relaxed focus:bg-white text-[var(--text)]"
                placeholder="Tuliskan urgensi, kondisi umum, tantangan strategis pelaksanaan kegiatan..."
              />
            </div>
          </div>
        </div>

        {/* 3. BAGIAN B: PENERIMA MANFAAT */}
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2 uppercase tracking-wide">
              <span className="w-6 h-6 rounded-lg bg-slate-700 text-white text-xs flex items-center justify-center font-bold">B</span>
              <span>Penerima Manfaat</span>
            </h2>
            <button
              onClick={() => handleSaveFull("Bagian B: Penerima Manfaat")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[var(--primary)] hover:text-white border border-[var(--border)] text-xs font-bold text-[var(--text)] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Simpan Bagian B</span>
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-[var(--text)]">Uraian Penerima Manfaat:</label>
            <textarea
              rows={3}
              value={penerimaManfaat}
              onChange={(e) => setPenerimaManfaat(e.target.value)}
              className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 font-sans leading-relaxed focus:bg-white text-[var(--text)]"
              placeholder="Uraikan siapa saja stakeholder atau unit/instansi yang menerima manfaat..."
            />
          </div>
        </div>

        {/* 4. BAGIAN C: STRATEGI PENCAPAIAN KELUARAN */}
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2 uppercase tracking-wide">
                <span className="w-6 h-6 rounded-lg bg-slate-700 text-white text-xs flex items-center justify-center font-bold">C</span>
                <span>Strategi Pencapaian Keluaran (Metode &amp; Komponen)</span>
              </h2>
              <div className="text-[0.68rem] text-[var(--text-muted)] mt-0.5">
                Jumlah komponen Informasi Kinerja: <strong>{maxKomponenFromIK}</strong> | Saat ini: <strong>{komponenList.length} komponen</strong>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInitiateAddKomponen}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-slate-800 hover:bg-[var(--accent)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Komponen</span>
              </button>
              <button
                onClick={() => handleSaveFull("Bagian C: Strategi Pencapaian Keluaran")}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[var(--primary)] hover:text-white border border-[var(--border)] text-xs font-bold text-[var(--text)] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Bagian C</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text)]">Metode Pelaksanaan:</label>
              <input
                type="text"
                value={metodePelaksanaan}
                onChange={(e) => setMetodePelaksanaan(e.target.value)}
                placeholder="mis. Swakelola / Penyedia / Pengadaan Langsung / Kombinasi"
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-[var(--text)] focus:bg-white"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Tahapan Pelaksanaan (Komponen RO):</span>
                <span className="text-[0.68rem] text-slate-500 font-normal">
                  *Nomenklatur Sub-Komponen telah diperbarui menjadi Komponen
                </span>
              </div>
              {komponenList.map((komp, idx) => (
                <div
                  key={komp.id}
                  className={`p-4 rounded-xl border ${
                    komp.isExtra
                      ? "border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20"
                      : "border-[var(--border)] bg-slate-50/60 dark:bg-slate-800/40"
                  } space-y-2 relative`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--primary)] text-xs">
                        Tahapan Komponen #{idx + 1}
                      </span>
                      {komp.isExtra && (
                        <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 border border-amber-300">
                          Komponen Tambahan (Melebihi Kuota IK)
                        </span>
                      )}
                    </div>
                    {komponenList.length > 1 && (
                      <button
                        onClick={() => {
                          setKomponenList(komponenList.filter((s) => s.id !== komp.id));
                          setJadwalRows(jadwalRows.filter((_, i) => i !== idx));
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Hapus komponen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {komp.isExtra && komp.alasanPenambahan && (
                    <div className="p-2.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40 border border-amber-200 text-[0.68rem] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <Info className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Alasan Penambahan Komponen:</strong> {komp.alasanPenambahan}
                      </div>
                    </div>
                  )}

                  <input
                    type="text"
                    value={komp.namaKomponen}
                    onChange={(e) =>
                      setKomponenList(
                        komponenList.map((s) => (s.id === komp.id ? { ...s, namaKomponen: e.target.value } : s))
                      )
                    }
                    placeholder="Nama Komponen (mis. Komponen A: ...)"
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 text-[var(--text)] font-semibold"
                  />
                  <textarea
                    rows={2}
                    value={komp.uraianRangkaian}
                    onChange={(e) =>
                      setKomponenList(
                        komponenList.map((s) => (s.id === komp.id ? { ...s, uraianRangkaian: e.target.value } : s))
                      )
                    }
                    placeholder="Rincian pertemuan teknis, kegiatan rapat, lokakarya, atau output tahapan komponen ini..."
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 text-[var(--text)] leading-normal"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. BAGIAN D: KURUN WAKTU PENCAPAIAN & JADWAL BULANAN */}
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2 uppercase tracking-wide">
              <span className="w-6 h-6 rounded-lg bg-slate-700 text-white text-xs flex items-center justify-center font-bold">D</span>
              <span>Kurun Waktu Pencapaian Keluaran (Matriks Bulanan)</span>
            </h2>
            <button
              onClick={() => handleSaveFull("Bagian D: Jadwal Bulanan")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[var(--primary)] hover:text-white border border-[var(--border)] text-xs font-bold text-[var(--text)] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Simpan Bagian D</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[var(--border)] rounded-xl overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-800 text-[var(--text)]">
                <tr>
                  <th className="p-2.5 border-r border-b border-[var(--border)] min-w-[200px]">Komponen / Aktivitas</th>
                  <th className="p-2.5 border-r border-b border-[var(--border)] text-center w-16">Vol</th>
                  <th className="p-2.5 border-r border-b border-[var(--border)] text-center min-w-[100px]">Satuan</th>
                  {BULAN_LIST.map((b) => (
                    <th key={b} className="p-2 border-r border-b border-[var(--border)] text-center w-9 font-mono text-[0.7rem]">
                      {b}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {jadwalRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 border-r border-[var(--border)] font-medium text-[var(--text)]">
                      {row.komponenNama}
                    </td>
                    <td className="p-2 border-r border-[var(--border)] text-center font-mono">
                      <input
                        type="text"
                        value={row.volume}
                        onChange={(e) =>
                          setJadwalRows(
                            jadwalRows.map((r) => (r.id === row.id ? { ...r, volume: e.target.value } : r))
                          )
                        }
                        className="w-12 text-center border border-[var(--border)] rounded px-1 py-0.5 bg-white dark:bg-slate-800 text-[var(--text)]"
                      />
                    </td>
                    <td className="p-2 border-r border-[var(--border)] text-center">
                      <input
                        type="text"
                        value={row.satuan}
                        onChange={(e) => handleSatuanChange(row.id, e.target.value)}
                        placeholder="Satuan (mis. Dokumen, Laporan, Orang)"
                        className="w-28 text-center text-[0.7rem] border border-[var(--border)] rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 text-[var(--text)] font-medium focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </td>
                    {BULAN_LIST.map((b) => (
                      <td key={b} className="p-1 border-r border-[var(--border)] text-center">
                        <input
                          type="text"
                          value={row.jadwal[b] || ""}
                          onChange={(e) => handleJadwalChange(row.id, b, e.target.value)}
                          placeholder="-"
                          className="w-7 text-center font-mono text-[0.7rem] border border-[var(--border)] rounded py-0.5 bg-white dark:bg-slate-800"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. BAGIAN E: BIAYA & PENANDATANGAN */}
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2 uppercase tracking-wide">
              <span className="w-6 h-6 rounded-lg bg-slate-700 text-white text-xs flex items-center justify-center font-bold">E</span>
              <span>Biaya yang Diperlukan &amp; Penandatangan</span>
            </h2>
            <button
              onClick={() => handleSaveFull("Bagian E: Biaya & Penandatangan")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[var(--primary)] hover:text-white border border-[var(--border)] text-xs font-bold text-[var(--text)] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Simpan Bagian E</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Total Biaya yang Diperlukan:</span>
                <span className="text-[0.65rem] text-[var(--text-muted)] font-normal">Contoh: Rp3.683.193.000</span>
              </label>
              <input
                type="text"
                value={totalBiaya}
                onChange={(e) => handleTotalBiayaChange(e.target.value)}
                placeholder="Contoh: Rp3.683.193.000"
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 font-mono font-bold text-[var(--primary)] text-sm focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>Terbilang:</span>
                <span className="text-[0.65rem] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  ⚡ Terisi Otomatis
                </span>
              </label>
              <input
                type="text"
                readOnly
                value={terbilangBiaya}
                placeholder="Terbilang akan terisi otomatis dari angka total biaya..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700/80 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 font-serif italic text-slate-800 dark:text-slate-200 cursor-not-allowed select-text font-medium leading-relaxed"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[var(--text)]">Tempat &amp; Tanggal Dokumen:</label>
              <input
                type="text"
                value={tempatTanggalTtd}
                onChange={(e) => setTempatTanggalTtd(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[var(--text)]">Nama Pejabat Penandatangan:</label>
              <input
                type="text"
                value={namaPenanggungjawab}
                onChange={(e) => setNamaPenanggungjawab(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-[var(--text)]">Jabatan Pejabat Penandatangan:</label>
              <input
                type="text"
                value={jabatanPenanggungjawab}
                onChange={(e) => setJabatanPenanggungjawab(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* ── Action Bottom Buttons ── */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl shadow-sm">
          <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
            <Info className="h-4 w-4 text-[var(--primary)] shrink-0" />
            <span>Dokumen KAK yang tersimpan akan otomatis terbaca pada submenu <strong>Monitoring Submit &amp; Approve Data</strong>.</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/kak/pengadaan"
              className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold hover:bg-[var(--accent)] text-[var(--text)] transition-colors"
            >
              Lanjut ke KAK Pengadaan →
            </Link>
            <button
              onClick={() => handleSaveFull()}
              className="px-6 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Seluruh Dokumen KAK</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL ALASAN PENAMBAHAN KOMPONEN (JIKA MELEBIHI KUOTA INFORMASI KINERJA) ── */}
      {isReasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)]">
                    Alasan Penambahan Komponen
                  </h3>
                  <p className="text-[0.68rem] text-[var(--text-muted)]">
                    Melebihi Kuota Komponen Terdaftar di Informasi Kinerja ({maxKomponenFromIK} Komponen)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReasonModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Jumlah Komponen yang direncanakan melebihi kuota rincian Komponen pada master <strong>Informasi Kinerja ({maxKomponenFromIK} Komponen)</strong>. Mohon isi nomenklatur serta alasan justifikasi penambahan komponen sebelum melanjutkan:
            </p>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[var(--text)]">Nama / Nomenklatur Komponen Tambahan:</label>
                <input
                  type="text"
                  value={extraKomponenName}
                  onChange={(e) => setExtraKomponenName(e.target.value)}
                  placeholder="Contoh: Komponen C: Penguatan Strategi Kerja Sama Internasional Multilateral"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-[var(--text)] font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--text)] flex items-center justify-between">
                  <span>Alasan &amp; Justifikasi Penambahan Komponen:</span>
                  <span className="text-rose-500 font-bold">* Wajib Diisi</span>
                </label>
                <textarea
                  rows={3}
                  value={extraReasonText}
                  onChange={(e) => setExtraReasonText(e.target.value)}
                  placeholder="Tuliskan justifikasi urgensi, pemecahan tahapan aktivitas baru, atau kebutuhan operasional khusus..."
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-[var(--text)] leading-normal focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setIsReasonModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold hover:bg-[var(--accent)] text-[var(--text)] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!extraReasonText.trim()}
                onClick={handleConfirmExtraKomponen}
                className="px-5 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Tambahkan Komponen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
