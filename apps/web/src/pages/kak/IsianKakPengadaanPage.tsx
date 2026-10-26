import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Wrench,
  Users2,
  Save,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  FileText,
  Plus,
  Trash2,
  Info,
  DollarSign,
  Printer,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  Check,
  Clock,
  MapPin,
  ShieldCheck,
  FileSpreadsheet,
  Copy,
  Edit,
  Eye,
  BarChart3,
  ListFilter,
  CheckSquare,
  BookOpen,
  Briefcase,
  HelpCircle,
  Award,
  UserCheck,
  X,
} from "lucide-react";
import { angkaKeTerbilang } from "./IsianKakPage";
import { getUnitKerjaByNamaOrSingkatan } from "./kakKinerjaHelper";

export type JenisPengadaanKak = "Pengadaan Barang" | "Pengadaan Jasa" | "Konsinyering";

// Item HPS untuk Pengadaan Barang
export interface ItemHpsBarang {
  id: string;
  pekerjaan: string;
  kuantitas: number;
  satuan: string;
  hargaSatuan: number;
  hargaTotal: number;
}

// Item Mutu/Kualitas Spesifikasi Teknis Pengadaan Barang
export interface ItemMutuKualitas {
  id: string;
  namaBarang: string;
  spesifikasiTeknis: string;
  jumlah: number;
}

// Item HPS untuk Pengadaan Jasa (Tenaga Ahli / Personil)
export interface ItemHpsJasaPersonil {
  id: string;
  jenisPersonil: string;
  jumlahOrang: number;
  waktuBulan: number;
  hargaSatuanOB: number;
  jumlahBiaya: number;
}

// Item Milestone Jadwal KAK Jasa (Bagian 9)
export interface MilestoneJadwalJasa {
  id: string;
  mingguKe: string;
  output: string;
  uraian: string;
}

// Item Kebutuhan Tenaga Kerja KAK Jasa (Bagian 10)
export interface KebutuhanTenagaJasa {
  id: string;
  posisi: string;
  jumlah: number;
  waktu: string;
  satuanUpahOB: number;
  kualifikasiPengalaman: string;
  tanggungJawabUtama: string;
}

// Item Tahapan Pelaksanaan KAK Jasa (Bagian 6)
export interface TahapanPelaksanaanJasa {
  id: string;
  nomorTahap: number;
  namaTahapan: string;
  uraianTahapan: string;
}

// Item HPS / Spesifikasi Teknis Konsinyering (Sesuai Gambar Referensi)
export interface ItemHpsKonsinyering {
  id: string;
  uraianPekerjaan: string;
  volumeHari: number;
  satuanHari: string;
  volumePax: number;
  satuanPax: string;
  hargaSatuan: number;
  totalHarga: number;
}

// Data Dokumen Paket Pengadaan Lengkap
export interface PaketPengadaanItem {
  id: string;
  jenis: JenisPengadaanKak;

  // 1. Pengadaan Barang
  hpsNomor: string;
  hpsHariTanggal: string;
  hpsTempat: string;
  hpsJenisPekerjaan: string;
  hpsKodeAkun: string;
  hpsNomorRup: string;
  hpsItems: ItemHpsBarang[];
  barangLatarBelakang: string;
  barangMaksudTujuan: string;
  barangTargetSasaran: string;
  barangSumberDana: string;
  barangMutuItems: ItemMutuKualitas[];
  barangJangkaWaktu: string;
  barangLokasiPekerjaan: string;
  barangPelayanan: string;

  // 2. Pengadaan Jasa (HPS Personil + 13 Bagian KAK)
  hpsJasaNomor?: string;
  hpsJasaHariTanggal?: string;
  hpsJasaTempat?: string;
  hpsJasaJenisPekerjaan?: string;
  hpsJasaKodeAkun?: string;
  hpsJasaRup?: string;
  hpsJasaPersonilItems?: ItemHpsJasaPersonil[];
  jasaLatarBelakang?: string;
  jasaDasarPelaksanaan?: string;
  jasaMaksudTujuan?: string;
  jasaLokasiKegiatan?: string;
  jasaRuangLingkup?: string;
  jasaPendekatan?: string;
  jasaMetodologi?: string;
  jasaTahapanList?: TahapanPelaksanaanJasa[];
  jasaKeluaranDiinginkan?: string;
  jasaSumberPendanaan?: string;
  jasaJangkaWaktu?: string;
  jasaMilestoneList?: MilestoneJadwalJasa[];
  jasaTenagaList?: KebutuhanTenagaJasa[];
  jasaCatatanTambahanTenaga?: string;
  jasaHakKekayaanIntelektual?: string;
  jasaTanggungJawabHki?: string;
  jasaKlausulDisclaimer?: string;
  jasaPenutup?: string;

  // 3. Konsinyering (HPS + 9 Bagian KAK Terstruktur)
  hpsKonsinyeringNomor?: string;
  hpsKonsinyeringHariTanggal?: string;
  hpsKonsinyeringTempat?: string;
  hpsKonsinyeringJenisPekerjaan?: string;
  hpsKonsinyeringKodeAkun?: string;
  hpsKonsinyeringRup?: string;
  hpsKonsinyeringItems?: ItemHpsKonsinyering[];
  hpsKonsinyeringKeterangan?: string;
  konsinyeringDasarHukum?: string;
  konsinyeringGambaranUmum?: string;
  konsinyeringMaksudTujuan?: string;
  konsinyeringManfaat?: string;
  konsinyeringLokasi?: string;
  konsinyeringSumberDana?: string;
  konsinyeringPerkiraanBiaya?: string;
  konsinyeringJangkaWaktu?: string;
  konsinyeringLayanan?: string;
  konsinyeringPejabatNama?: string;
  konsinyeringPejabatNip?: string;
  konsinyeringPejabatJabatan?: string;
  konsinyeringPejabatTanggal?: string;

  // Meta
  totalAnggaran: number;
  createdAt: string;
  updatedAt: string;
}

// Helper Format Rupiah
function formatRupiahDecimal(val: number): string {
  if (isNaN(val)) return "0,00";
  return val.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatRupiahBulat(val: number): string {
  if (isNaN(val)) return "0";
  return Math.round(val).toLocaleString("id-ID");
}

export default function IsianKakPengadaanPage() {
  const [activeUnit, setActiveUnit] = useState<string>("Direktorat Strategi dan Kerja Sama Internasional");
  const [activeHistoriLabel, setActiveHistoriLabel] = useState<string>("DIPA Awal - B00");
  const [activeStatusHistori, setActiveStatusHistori] = useState<string>("DIPA Awal");
  const [activeKodeHistori, setActiveKodeHistori] = useState<string>("B00");
  const [savedSuccessAlert, setSavedSuccessAlert] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  // Status Tahapan
  const isTahapanDipaAtauRevisi = Boolean(
    activeStatusHistori === "DIPA Awal" ||
    activeStatusHistori === "Usulan Revisi DIPA" ||
    activeStatusHistori === "Usulan Revisi Satker (POK)" ||
    activeKodeHistori.startsWith("B") ||
    activeKodeHistori.startsWith("A") ||
    activeKodeHistori.startsWith("C")
  );

  const isTahapanPaguRenja = !isTahapanDipaAtauRevisi;

  // ── Tab Navigasi Halaman Utama: Monitoring vs Formulir Input ──
  const [currentMainView, setCurrentMainView] = useState<"monitoring" | "form">("monitoring");

  // ── 3 Pilihan Jenis Pengadaan ──
  const [selectedJenis, setSelectedJenis] = useState<JenisPengadaanKak>("Pengadaan Barang");

  // ── Multi-Item List: Koleksi Paket Pengadaan yang Telah Diinput ──
  const [paketList, setPaketList] = useState<PaketPengadaanItem[]>([]);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  // Filter pada Tab Monitoring
  const [filterMonitoringJenis, setFilterMonitoringJenis] = useState<string>("ALL");

  // State untuk Cetak Hasil Isian Form Pengadaan
  const [printPreviewItem, setPrintPreviewItem] = useState<PaketPengadaanItem | null>(null);

  // ════════════════════════════════════════════════════════════════
  // ── FORM STATE 1: PENGADAAN BARANG (HPS & KAK 5 BAGIAN) ──
  // ════════════════════════════════════════════════════════════════
  const [hpsNomor, setHpsNomor] = useState("HPS-061/PL.01.01/3.1/VIII/2026");
  const [hpsHariTanggal, setHpsHariTanggal] = useState("13 Agustus 2026");
  const [hpsTempat, setHpsTempat] = useState("Pusat Pelaporan dan Analisis Transaksi Keuangan");
  const [hpsJenisPekerjaan, setHpsJenisPekerjaan] = useState("Pengadaan Laptop Kerja pada PPATK Tahun Anggaran 2026");
  const [hpsKodeAkun, setHpsKodeAkun] = useState(
    "078.01.01.3377.EBB.951.053.0A.532111 (Belanja Modal Peralatan dan Mesin – Laptop Administrasi)"
  );
  const [hpsNomorRup, setHpsNomorRup] = useState("67667519");

  const [hpsItems, setHpsItems] = useState<ItemHpsBarang[]>([
    {
      id: "hps_item_1",
      pekerjaan: "Laptop Kerja",
      kuantitas: 27,
      satuan: "Unit",
      hargaSatuan: 34571621.5,
      hargaTotal: 933433780.63,
    },
  ]);

  // Kalkulasi HPS Barang
  const hpsSubTotal = hpsItems.reduce((acc, it) => acc + (it.hargaTotal || 0), 0);
  const hpsDppNilaiLain = hpsSubTotal * (11 / 12);
  const hpsPpn12 = hpsDppNilaiLain * 0.12;
  const hpsGrandTotal = hpsSubTotal + hpsPpn12;
  const hpsGrandTotalBulat = Math.round(hpsGrandTotal);
  const hpsTerbilang = angkaKeTerbilang(hpsGrandTotalBulat);

  // 5 Bagian KAK Pengadaan Barang
  const [barangLatarBelakang, setBarangLatarBelakang] = useState(
    "Dalam rangka mewujudkan kelancaran pelaksanaan tugas dan fungsi analisis serta pemeriksaan transaksi keuangan mencurigakan di lingkungan Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK), ketersediaan perangkat kerja yang andal, aman, dan memiliki komputasi tinggi mutlak diperlukan. Seiring bertambahnya volume data intelijen keuangan serta kebutuhan mobilitas analis, diperlukan pembaruan sarana laptop kerja berstandar tinggi yang mendukung sistem keamanan data dan integrasi aplikasi analitik secara optimal."
  );
  const [barangMaksudTujuan, setBarangMaksudTujuan] = useState(
    "1. Maksud:\nMenyediakan fasilitas perangkat komputasi bergerak (laptop kerja) yang memenuhi standar spesifikasi teknis dan keamanan untuk operasional pegawai di lingkungan PPATK.\n\n2. Tujuan:\n- Meningkatkan produktivitas kerja dan efektivitas proses analisis transaksi keuangan.\n- Mendukung mobilitas pegawai dalam pelaksanaan tugas kedinasan maupun koordinasi lintas instansi.\n- Menjamin keandalan dan keamanan pengolahan data intelijen keuangan PPATK."
  );
  const [barangTargetSasaran, setBarangTargetSasaran] = useState(
    "Target/Sasaran yang ingin dicapai adalah terpenuhinya 27 (dua puluh tujuh) unit laptop kerja standar operasional berkinerja tinggi, siap pakai (ready to use), terkonfigurasi dengan sistem keamanan instansi, serta terdistribusi secara tepat waktu kepada unit kerja penerima di lingkungan PPATK pada Tahun Anggaran 2026."
  );
  const [barangSumberDana, setBarangSumberDana] = useState(
    "Pembiayaan pengadaan ini dibebankan pada DIPA PPATK Tahun Anggaran 2026 dengan rincian pembebanan:\n- Program: Dukungan Manajemen dan Pelaksanaan Tugas Teknis Lainnya PPATK\n- Kegiatan: 3377 (Pengelolaan Sarana Prasarana dan TI PPATK)\n- Output: EBB (Layanan Sarana Prasarana Internal)\n- Akun: 532111 (Belanja Modal Peralatan dan Mesin – Laptop Administrasi)\n- Total Pagu Alokasi Estimasi: Rp1.036.111.497,00 (Satu Miliar Tiga Puluh Enam Juta Seratus Sebelas Ribu Empat Ratus Sembilan Puluh Tujuh Rupiah)"
  );
  const [barangMutuItems, setBarangMutuItems] = useState<ItemMutuKualitas[]>([
    {
      id: "mutu_1",
      namaBarang: "Laptop Kerja (Business Grade)",
      spesifikasiTeknis:
        "Processor min. Intel Core Ultra 7 / AMD Ryzen 7 Pro, RAM 32GB DDR5, Storage 1TB NVMe PCIe Gen4 SSD, Display 14 inch WQXGA/IPS Antiglare, TPM 2.0 Hardware, Fingerprint Reader & IR Camera Windows Hello, OS Windows 11 Pro 64-bit National OEM License, Battery Life min. 10 jam, Bobot maks. 1.4 kg, Garansi Resmi 3 Tahun On-site 24/7.",
      jumlah: 27,
    },
  ]);
  const [barangJangkaWaktu, setBarangJangkaWaktu] = useState("45 (empat puluh lima) Hari Kalender terhitung sejak SPMK diterbitkan");
  const [barangLokasiPekerjaan, setBarangLokasiPekerjaan] = useState(
    "Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK), Jl. Ir. H. Juanda No. 35, Jakarta Pusat 10120"
  );
  const [barangPelayanan, setBarangPelayanan] = useState(
    "1. Layanan Purna Jual & Garansi:\n- Garansi pabrikan minimal 3 (tiga) tahun untuk suku cadang (parts) dan jasa perbaikan (labor), dengan skema on-site support 5x8 Next Business Day.\n- Ketersediaan suku cadang terjamin sekurang-kurangnya selama 5 (lima) tahun sejak masa akhir produksi.\n\n2. Dukungan Teknis & Pelatihan:\n- Penyedia wajib menyediakan service center resmi di area Jabodetabek.\n- Penyedia menyediakan transfer knowledge / pembekalan teknis bagi tim pengelola TI PPATK terkait manajemen recovery dan utilitas perangkat."
  );

  // ════════════════════════════════════════════════════════════════
  // ── FORM STATE 2: PENGADAAN JASA (HPS JASA PERSONIL & 13 BAGIAN KAK) ──
  // ════════════════════════════════════════════════════════════════
  const [hpsJasaNomor, setHpsJasaNomor] = useState("HPS-50.1/PL.01.01/3.1/VII/2026");
  const [hpsJasaHariTanggal, setHpsJasaHariTanggal] = useState("Jumat, 24 Juli 2026");
  const [hpsJasaTempat, setHpsJasaTempat] = useState("Pusat Pelaporan dan Analisis Transaksi Keuangan");
  const [hpsJasaJenisPekerjaan, setHpsJasaJenisPekerjaan] = useState(
    "Pengadaan Jasa Konsultan Penyusunan Buku Perkembangan Sejarah Kejahatan Keuangan di Indonesia TA 2026"
  );
  const [hpsJasaKodeAkun, setHpsJasaKodeAkun] = useState(
    "078.01.WA.8004.EBA.958.056.0A. akun 522131 (Belanja Jasa Konsultan)."
  );
  const [hpsJasaRup, setHpsJasaRup] = useState("67557489");

  const [hpsJasaPersonilItems, setHpsJasaPersonilItems] = useState<ItemHpsJasaPersonil[]>([
    {
      id: "hps_jasa_1",
      jenisPersonil: "KETUA TIM PENULIS",
      jumlahOrang: 1,
      waktuBulan: 3.0,
      hargaSatuanOB: 17500000,
      jumlahBiaya: 52500000,
    },
    {
      id: "hps_jasa_2",
      jenisPersonil: "ANGGOTA TIM PENULIS",
      jumlahOrang: 3,
      waktuBulan: 3.0,
      hargaSatuanOB: 15000000,
      jumlahBiaya: 135000000,
    },
    {
      id: "hps_jasa_3",
      jenisPersonil: "EDITOR",
      jumlahOrang: 1,
      waktuBulan: 1.0,
      hargaSatuanOB: 12000000,
      jumlahBiaya: 12000000,
    },
    {
      id: "hps_jasa_4",
      jenisPersonil: "DESIGNER",
      jumlahOrang: 1,
      waktuBulan: 1.0,
      hargaSatuanOB: 11000000,
      jumlahBiaya: 11000000,
    },
  ]);

  const hpsJasaTotalBiayaPersonil = hpsJasaPersonilItems.reduce((acc, it) => acc + (it.jumlahBiaya || 0), 0);
  const hpsJasaPpn = Number((hpsJasaTotalBiayaPersonil * 0.11).toFixed(0));
  const hpsJasaGrandTotal = hpsJasaTotalBiayaPersonil + hpsJasaPpn;
  const hpsJasaGrandTotalBulat = Math.round(hpsJasaGrandTotal);
  const hpsJasaTerbilang = angkaKeTerbilang(hpsJasaGrandTotalBulat);

  const [jasaLatarBelakang, setJasaLatarBelakang] = useState(
    "Perkembangan kejahatan keuangan di Indonesia terus mengalami transformasi signifikan seiring modernisasi teknologi dan integrasi sistem keuangan. Dibutuhkan penyusunan literatur komprehensif oleh konsultan ahli."
  );
  const [jasaDasarPelaksanaan, setJasaDasarPelaksanaan] = useState(
    "1. UU Nomor 8 Tahun 2010 tentang PPTPPU;\n2. Perpres Nomor 50 Tahun 2011;\n3. DIPA PPATK TA 2026 Nomor SP DIPA-078.01.1.417208/2026."
  );
  const [jasaMaksudTujuan, setJasaMaksudTujuan] = useState(
    "Maksud: Merekrut konsultan ahli untuk menyusun buku sejarah kejahatan keuangan.\nTujuan: Menyajikan referensi komprehensif bagi aparat penegak hukum dan publik."
  );
  const [jasaLokasiKegiatan, setJasaLokasiKegiatan] = useState(
    "Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK), Jl. Ir. H. Juanda No. 35, Jakarta Pusat 10120"
  );
  const [jasaRuangLingkup, setJasaRuangLingkup] = useState(
    "Pengumpulan data arsip sejarah, wawancara tokoh perintis, FGD validasi materi, penyusunan draft naskah, editing, dan perancangan grafis tata letak."
  );
  const [jasaPendekatan, setJasaPendekatan] = useState(
    "Pendekatan historis-yuridis dan empiris berbasis data rezim anti pencucian uang."
  );
  const [jasaMetodologi, setJasaMetodologi] = useState(
    "Studi kepustakaan, in-depth interview, serial FGD, dan uji sahih materi naskah."
  );
  const [jasaTahapanList, setJasaTahapanList] = useState<TahapanPelaksanaanJasa[]>([
    {
      id: "tahap_1",
      nomorTahap: 1,
      namaTahapan: "Tahap Persiapan & Inception Report",
      uraianTahapan: "Penyusunan outline naskah definitif dan instrumen pengumpulan data.",
    },
    {
      id: "tahap_2",
      nomorTahap: 2,
      namaTahapan: "Tahap Pengumpulan Data, Wawancara & FGD",
      uraianTahapan: "Wawancara narasumber perintis rezim APU PPT dan FGD validasi.",
    },
    {
      id: "tahap_3",
      nomorTahap: 3,
      namaTahapan: "Tahap Penyusunan Draft Naskah",
      uraianTahapan: "Penulisan bab per bab dan kompilasi naskah awal.",
    },
    {
      id: "tahap_4",
      nomorTahap: 4,
      namaTahapan: "Tahap Review, Finalisasi Desain & Uji Cetak",
      uraianTahapan: "Editing kebahasaan, perancangan layout artistik, dan cetak dummy buku.",
    },
  ]);
  const [jasaKeluaranDiinginkan, setJasaKeluaranDiinginkan] = useState(
    "1. Laporan Pendahuluan;\n2. Laporan Antara;\n3. Naskah Buku Final siap cetak;\n4. Dummy Book 5 eksemplar."
  );
  const [jasaSumberPendanaan, setJasaSumberPendanaan] = useState(
    "DIPA PPATK TA 2026 akun 522131 (Belanja Jasa Konsultan) dengan total biaya Rp233.655.000,00 termasuk pajak."
  );
  const [jasaJangkaWaktu, setJasaJangkaWaktu] = useState("3 (tiga) Bulan Kalender sejak SPMK diterbitkan");
  const [jasaMilestoneList, setJasaMilestoneList] = useState<MilestoneJadwalJasa[]>([
    { id: "ms_1", mingguKe: "Minggu 1 - 2", output: "Inception Report & Outline", uraian: "Penyusunan outline buku definitif." },
    { id: "ms_2", mingguKe: "Minggu 3 - 6", output: "Hasil Wawancara & FGD", uraian: "Transkrip wawancara dan FGD." },
    { id: "ms_3", mingguKe: "Minggu 7 - 9", output: "Draft Naskah Lengkap", uraian: "Penyelesaian draft lengkap bab 1 sampai penutup." },
    { id: "ms_4", mingguKe: "Minggu 10 - 12", output: "Naskah Siap Cetak & Dummy Book", uraian: "Editing bahasa dan desain cover." },
  ]);
  const [jasaTenagaList, setJasaTenagaList] = useState<KebutuhanTenagaJasa[]>([
    {
      id: "tenaga_1",
      posisi: "Ketua Tim Penulis",
      jumlah: 1,
      waktu: "3 Bulan",
      satuanUpahOB: 17500000,
      kualifikasiPengalaman: "Pendidikan S2/S3 Hukum/Ekonomi, pengalaman min. 8 tahun.",
      tanggungJawabUtama: "Mengkoordinasikan seluruh tim, menyusun metodologi dan bab utama.",
    },
    {
      id: "tenaga_2",
      posisi: "Anggota Tim Penulis",
      jumlah: 3,
      waktu: "3 Bulan",
      satuanUpahOB: 15000000,
      kualifikasiPengalaman: "Pendidikan min. S1 Hukum/Komunikasi, pengalaman min. 5 tahun.",
      tanggungJawabUtama: "Melakukan pengumpulan arsip dan wawancara narasumber.",
    },
    {
      id: "tenaga_3",
      posisi: "Editor",
      jumlah: 1,
      waktu: "1 Bulan",
      satuanUpahOB: 12000000,
      kualifikasiPengalaman: "Pendidikan min. S1 Sastra/Jurnalistik, pengalaman min. 5 tahun.",
      tanggungJawabUtama: "Memeriksa keterbacaan, tata bahasa baku, dan ejaan.",
    },
    {
      id: "tenaga_4",
      posisi: "Designer / Layout Artist",
      jumlah: 1,
      waktu: "1 Bulan",
      satuanUpahOB: 11000000,
      kualifikasiPengalaman: "Pendidikan min. S1 DKV/Desain Grafis, pengalaman min. 4 tahun.",
      tanggungJawabUtama: "Merancang cover buku, infografis, dan tata letak interior.",
    },
  ]);
  const [jasaCatatanTambahanTenaga, setJasaCatatanTambahanTenaga] = useState(
    "Setiap personil tenaga ahli wajib melampirkan Curriculum Vitae (CV), fotokopi ijazah terlegalisir, portofolio karya tulis/desain, serta surat pernyataan kesediaan penugasan penuh selama masa kontrak pekerjaan."
  );
  const [jasaHakKekayaanIntelektual, setJasaHakKekayaanIntelektual] = useState(
    "Seluruh hak cipta, hak kepemilikan intelektual (HKI), dan hak penerbitan naskah buku maupun materi grafis pendukung yang dihasilkan dalam pekerjaan ini menjadi hak milik mutlak Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK)."
  );
  const [jasaTanggungJawabHki, setJasaTanggungJawabHki] = useState(
    "Konsultan bertanggung jawab penuh secara hukum bahwa seluruh naskah, data, tabel, bagan, dan citra ilustrasi yang diserahkan bebas dari plagiarisme atau pelanggaran hak cipta pihak ketiga."
  );
  const [jasaKlausulDisclaimer, setJasaKlausulDisclaimer] = useState(
    "Segala data dan informasi rahasia perbankan atau intelijen keuangan yang diperoleh selama pelaksanaan pekerjaan wajib dijaga kerahasiaannya sesuai ketentuan Pasal 39 UU No. 8 Tahun 2010."
  );
  const [jasaPenutup, setJasaPenutup] = useState(
    "Demikian Kerangka Acuan Kerja (KAK) Pengadaan Jasa Konsultan ini disusun sebagai pedoman teknis pelaksanaan dan acuan pengawasan bagi PPK, Tim Teknis, serta Penyedia Jasa Konsultan."
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ── FORM STATE 3: KONSINYERING (HPS & 9 BAGIAN KAK LENGKAP SESUAI GAMBAR) ──
  // ══════════════════════════════════════════════════════════════════════════

  // 1. Header Dokumen HPS Konsinyering (Sesuai Gambar Referensi User)
  const [hpsKonsinyeringNomor, setHpsKonsinyeringNomor] = useState("HPS-043/PL.01/4/VI/2026");
  const [hpsKonsinyeringHariTanggal, setHpsKonsinyeringHariTanggal] = useState("Jumat, 19 Juni 2026");
  const [hpsKonsinyeringTempat, setHpsKonsinyeringTempat] = useState("Pusat Pelaporan dan Analisis Transaksi Keuangan");
  const [hpsKonsinyeringJenisPekerjaan, setHpsKonsinyeringJenisPekerjaan] = useState(
    "Pengadaan Paket Meeting dalam rangka FGD Harmonisasi Statistik Penanganan Perkara TPPU dan Evaluasi Pemanfaatan Produk Intelijen PPATK"
  );
  const [hpsKonsinyeringKodeAkun, setHpsKonsinyeringKodeAkun] = useState(
    "078.01.BE.3384.BCE.004.053.A akun 524114 (Belanja Perjalanan Dinas Paket Meeting Dalam Kota)"
  );
  const [hpsKonsinyeringRup, setHpsKonsinyeringRup] = useState("67089052");

  // Tabel HPS Konsinyering (Sesuai Kolom pada Gambar: NO, URAIAN PEKERJAAN, VOLUME (hari, Pax), HARGA SATUAN, TOTAL)
  const [hpsKonsinyeringItems, setHpsKonsinyeringItems] = useState<ItemHpsKonsinyering[]>([
    {
      id: "hps_k_1",
      uraianPekerjaan: "Fullday Meeting Eselon III ke Bawah",
      volumeHari: 1,
      satuanHari: "hari",
      volumePax: 60,
      satuanPax: "Pax",
      hargaSatuan: 455000,
      totalHarga: 27300000,
    },
  ]);

  // Kalkulasi HPS Konsinyering
  const hpsKonsinyeringGrandTotal = hpsKonsinyeringItems.reduce((acc, it) => acc + (it.totalHarga || 0), 0);
  const hpsKonsinyeringGrandTotalBulat = Math.round(hpsKonsinyeringGrandTotal);
  const hpsKonsinyeringTerbilang = angkaKeTerbilang(hpsKonsinyeringGrandTotalBulat);

  const [hpsKonsinyeringKeterangan, setHpsKonsinyeringKeterangan] = useState(
    "1. Biaya akan dibebankan pada DIPA PPATK tahun 2026 dengan kode akun 078.01.BE.3384.BCE.004.053.A akun 524114 (Belanja Perjalanan Dinas Paket Meeting Dalam Kota).\n2. Jenis kontrak adalah harga satuan.\n3. Harga sudah termasuk pajak.\n4. Jangka waktu pelaksanaan pekerjaan 25 Juni 2026."
  );

  // 2. Formulir KAK / TOR Konsinyering (9 Bagian Terstruktur Sesuai Permintaan User)
  // 1. Latar Belakang: 1.a Dasar Hukum & 1.b Gambaran Umum
  const [konsinyeringDasarHukum, setKonsinyeringDasarHukum] = useState(
    "1. Undang-Undang Nomor 8 Tahun 2010 tentang Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang;\n2. Peraturan Presiden Nomor 50 Tahun 2011 tentang Tata Cara Pelaksanaan Kewenangan PPATK;\n3. Peraturan Menteri Keuangan tentang Standar Biaya Masukan (SBM) Tahun Anggaran 2026;\n4. DIPA Pusat Pelaporan dan Analisis Transaksi Keuangan Tahun Anggaran 2026."
  );
  const [konsinyeringGambaranUmum, setKonsinyeringGambaranUmum] = useState(
    "Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK) sebagai Financial Intelligence Unit (FIU) bertugas memproduksi hasil analisis dan pemeriksaan intelijen keuangan dalam penanganan perkara tindak pidana pencucian uang (TPPU). Dalam rangka meningkatkan efektivitas pemanfaatan produk intelijen dan harmonisasi data statistik perkara bersama Aparat Penegak Hukum (Polri, Kejaksaan, KPK), diselenggarakan kegiatan Focus Group Discussion (FGD) melalui paket meeting dalam kota."
  );

  // 2. Maksud dan Tujuan
  const [konsinyeringMaksudTujuan, setKonsinyeringMaksudTujuan] = useState(
    "1. Maksud:\nPenyelenggaraan paket meeting fullday guna memfasilitasi koordinasi intensif dan harmonisasi statistik penanganan perkara TPPU.\n\n2. Tujuan:\n- Menyelaraskan pencatatan data statistik penanganan perkara TPPU antara PPATK dan Lembaga Penegak Hukum.\n- Mengevaluasi tingkat pemanfaatan dan efektivitas produk intelijen keuangan yang telah didistribusikan."
  );

  // 3. Manfaat
  const [konsinyeringManfaat, setKonsinyeringManfaat] = useState(
    "1. Tersedianya basis data statistik penanganan perkara TPPU yang akurat, mutakhir, dan terintegrasi secara nasional.\n2. Meningkatnya kualitas feedback pemanfaatan hasil analisis/pemeriksaan intelijen keuangan PPATK.\n3. Terjalinnya sinergi dan akselerasi tindak lanjut penanganan perkara TPPU lintas instansi penegak hukum."
  );

  // 4. Lokasi
  const [konsinyeringLokasi, setKonsinyeringLokasi] = useState(
    "Hotel bintang 4 di wilayah DKI Jakarta (Dalam Kota) dengan fasilitas ruang meeting yang memenuhi standar kapasitas minimal 60 peserta serta protokol keamanan dan kenyamanan rapat dinas."
  );

  // 5. Sumber Dana dan Perkiraan Biaya (Tiap bagian isian masing-masing)
  const [konsinyeringSumberDana, setKonsinyeringSumberDana] = useState(
    "DIPA PPATK Tahun Anggaran 2026 dengan rincian pembebanan anggaran: 078.01.BE.3384.BCE.004.053.A akun 524114 (Belanja Perjalanan Dinas Paket Meeting Dalam Kota)."
  );
  const [konsinyeringPerkiraanBiaya, setKonsinyeringPerkiraanBiaya] = useState(
    "Total estimasi perkiraan biaya penyelenggaraan kegiatan paket meeting adalah sebesar Rp27.300.000,00 (Dua Puluh Tujuh Juta Tiga Ratus Ribu Rupiah) sudah termasuk pajak yang berlaku sesuai ketentuan SBM."
  );

  // 7. Jangka Waktu Pelaksanaan Pekerjaan
  const [konsinyeringJangkaWaktu, setKonsinyeringJangkaWaktu] = useState(
    "1 (satu) hari kalender, direncanakan pelaksanaan pada tanggal 25 Juni 2026 (atau disesuaikan dengan konfirmasi ketersediaan tempat dan jadwal pimpinan)."
  );

  // 8. Layanan
  const [konsinyeringLayanan, setKonsinyeringLayanan] = useState(
    "Penyedia paket meeting wajib menyediakan:\n1. Ruang pertemuan (meeting room) ber-AC dengan kapasitas 60 peserta dengan layout classroom/u-shape;\n2. Fasilitas audio visual (Sound system standar, wireless microphone, screen dan LCD Projector, laser pointer);\n3. Akses internet Wi-Fi dedicated berkecepatan tinggi;\n4. Perlengkapan meeting kit (notepads, ballpoints) dan flipchart;\n5. Konsumsi 1x makan siang (Lunch buffet) dan 2x rehat kopi (Coffee break) dengan variasi menu higienis."
  );

  // 9. Keterangan Pejabat Penandatangan dan tanggal
  const [konsinyeringPejabatNama, setKonsinyeringPejabatNama] = useState("Diana Soraya Noor, S.H., M.H.");
  const [konsinyeringPejabatNip, setKonsinyeringPejabatNip] = useState("19780512 200212 2 001");
  const [konsinyeringPejabatJabatan, setKonsinyeringPejabatJabatan] = useState("Pejabat Pembuat Komitmen (PPK)");
  const [konsinyeringPejabatTanggal, setKonsinyeringPejabatTanggal] = useState("Jakarta, 19 Juni 2026");

  // ── Helper Reset Form ke Default berdasarkan Jenis ──
  function resetFormToNew(jenis: JenisPengadaanKak) {
    setActiveEditingId(null);
    setSelectedJenis(jenis);

    if (jenis === "Pengadaan Barang") {
      setHpsNomor(`HPS-${String(Math.floor(Math.random() * 900) + 100)}/PL.01.01/3.1/VIII/2026`);
      setHpsHariTanggal("13 Agustus 2026");
      setHpsTempat("Pusat Pelaporan dan Analisis Transaksi Keuangan");
      setHpsJenisPekerjaan("Pengadaan Perangkat Pengolahan Data PPATK 2026");
      setHpsKodeAkun("078.01.01.3377.EBB.951.053.0A.532111 (Belanja Modal Peralatan dan Mesin)");
      setHpsNomorRup(String(Math.floor(Math.random() * 90000000) + 10000000));
      setHpsItems([
        {
          id: `hps_${Date.now()}`,
          pekerjaan: "Unit Komputer / Perangkat Baru",
          kuantitas: 10,
          satuan: "Unit",
          hargaSatuan: 25000000,
          hargaTotal: 250000000,
        },
      ]);
    } else if (jenis === "Pengadaan Jasa") {
      setHpsJasaNomor(`HPS-${String(Math.floor(Math.random() * 90) + 10)}.1/PL.01.01/3.1/VII/2026`);
      setHpsJasaHariTanggal("Jumat, 24 Juli 2026");
      setHpsJasaTempat("Pusat Pelaporan dan Analisis Transaksi Keuangan");
      setHpsJasaJenisPekerjaan("Pengadaan Jasa Konsultan Penyusunan Naskah Kebijakan APU PPT 2026");
      setHpsJasaKodeAkun("078.01.WA.8004.EBA.958.056.0A. akun 522131 (Belanja Jasa Konsultan)");
      setHpsJasaRup(String(Math.floor(Math.random() * 90000000) + 10000000));
      setHpsJasaPersonilItems([
        {
          id: `jasa_p_${Date.now()}`,
          jenisPersonil: "KETUA TIM KONSULTAN",
          jumlahOrang: 1,
          waktuBulan: 3,
          hargaSatuanOB: 18000000,
          jumlahBiaya: 54000000,
        },
      ]);
    } else {
      setHpsKonsinyeringNomor(`HPS-043/PL.01/4/VI/2026`);
      setHpsKonsinyeringHariTanggal("Jumat, 19 Juni 2026");
      setHpsKonsinyeringTempat("Pusat Pelaporan dan Analisis Transaksi Keuangan");
      setHpsKonsinyeringJenisPekerjaan(
        "Pengadaan Paket Meeting dalam rangka FGD Harmonisasi Statistik Penanganan Perkara TPPU"
      );
      setHpsKonsinyeringKodeAkun(
        "078.01.BE.3384.BCE.004.053.A akun 524114 (Belanja Perjalanan Dinas Paket Meeting Dalam Kota)"
      );
      setHpsKonsinyeringRup("67089052");
      setHpsKonsinyeringItems([
        {
          id: `hps_k_${Date.now()}`,
          uraianPekerjaan: "Fullday Meeting Eselon III ke Bawah",
          volumeHari: 1,
          satuanHari: "hari",
          volumePax: 60,
          satuanPax: "Pax",
          hargaSatuan: 455000,
          totalHarga: 27300000,
        },
      ]);
    }
  }

  // ── Load Item ke State Form untuk Diedit ──
  function handleEditItem(item: PaketPengadaanItem) {
    setActiveEditingId(item.id);
    setSelectedJenis(item.jenis);

    if (item.jenis === "Pengadaan Barang") {
      setHpsNomor(item.hpsNomor || "");
      setHpsHariTanggal(item.hpsHariTanggal || "");
      setHpsTempat(item.hpsTempat || "");
      setHpsJenisPekerjaan(item.hpsJenisPekerjaan || "");
      setHpsKodeAkun(item.hpsKodeAkun || "");
      setHpsNomorRup(item.hpsNomorRup || "");
      setHpsItems(item.hpsItems?.length ? JSON.parse(JSON.stringify(item.hpsItems)) : []);
      setBarangLatarBelakang(item.barangLatarBelakang || "");
      setBarangMaksudTujuan(item.barangMaksudTujuan || "");
      setBarangTargetSasaran(item.barangTargetSasaran || "");
      setBarangSumberDana(item.barangSumberDana || "");
      setBarangMutuItems(item.barangMutuItems?.length ? JSON.parse(JSON.stringify(item.barangMutuItems)) : []);
      setBarangJangkaWaktu(item.barangJangkaWaktu || "");
      setBarangLokasiPekerjaan(item.barangLokasiPekerjaan || "");
      setBarangPelayanan(item.barangPelayanan || "");
    } else if (item.jenis === "Pengadaan Jasa") {
      if (item.hpsJasaNomor) setHpsJasaNomor(item.hpsJasaNomor);
      if (item.hpsJasaHariTanggal) setHpsJasaHariTanggal(item.hpsJasaHariTanggal);
      if (item.hpsJasaTempat) setHpsJasaTempat(item.hpsJasaTempat);
      if (item.hpsJasaJenisPekerjaan) setHpsJasaJenisPekerjaan(item.hpsJasaJenisPekerjaan);
      if (item.hpsJasaKodeAkun) setHpsJasaKodeAkun(item.hpsJasaKodeAkun);
      if (item.hpsJasaRup) setHpsJasaRup(item.hpsJasaRup);
      if (item.hpsJasaPersonilItems?.length) setHpsJasaPersonilItems(JSON.parse(JSON.stringify(item.hpsJasaPersonilItems)));
      if (item.jasaLatarBelakang) setJasaLatarBelakang(item.jasaLatarBelakang);
      if (item.jasaDasarPelaksanaan) setJasaDasarPelaksanaan(item.jasaDasarPelaksanaan);
      if (item.jasaMaksudTujuan) setJasaMaksudTujuan(item.jasaMaksudTujuan);
      if (item.jasaLokasiKegiatan) setJasaLokasiKegiatan(item.jasaLokasiKegiatan);
      if (item.jasaRuangLingkup) setJasaRuangLingkup(item.jasaRuangLingkup);
      if (item.jasaPendekatan) setJasaPendekatan(item.jasaPendekatan);
      if (item.jasaMetodologi) setJasaMetodologi(item.jasaMetodologi);
      if (item.jasaTahapanList?.length) setJasaTahapanList(JSON.parse(JSON.stringify(item.jasaTahapanList)));
      if (item.jasaKeluaranDiinginkan) setJasaKeluaranDiinginkan(item.jasaKeluaranDiinginkan);
      if (item.jasaSumberPendanaan) setJasaSumberPendanaan(item.jasaSumberPendanaan);
      if (item.jasaJangkaWaktu) setJasaJangkaWaktu(item.jasaJangkaWaktu);
      if (item.jasaMilestoneList?.length) setJasaMilestoneList(JSON.parse(JSON.stringify(item.jasaMilestoneList)));
      if (item.jasaTenagaList?.length) setJasaTenagaList(JSON.parse(JSON.stringify(item.jasaTenagaList)));
      if (item.jasaCatatanTambahanTenaga) setJasaCatatanTambahanTenaga(item.jasaCatatanTambahanTenaga);
      if (item.jasaHakKekayaanIntelektual) setJasaHakKekayaanIntelektual(item.jasaHakKekayaanIntelektual);
      if (item.jasaTanggungJawabHki) setJasaTanggungJawabHki(item.jasaTanggungJawabHki);
      if (item.jasaKlausulDisclaimer) setJasaKlausulDisclaimer(item.jasaKlausulDisclaimer);
      if (item.jasaPenutup) setJasaPenutup(item.jasaPenutup);
    } else {
      if (item.hpsKonsinyeringNomor) setHpsKonsinyeringNomor(item.hpsKonsinyeringNomor);
      if (item.hpsKonsinyeringHariTanggal) setHpsKonsinyeringHariTanggal(item.hpsKonsinyeringHariTanggal);
      if (item.hpsKonsinyeringTempat) setHpsKonsinyeringTempat(item.hpsKonsinyeringTempat);
      if (item.hpsKonsinyeringJenisPekerjaan) setHpsKonsinyeringJenisPekerjaan(item.hpsKonsinyeringJenisPekerjaan);
      if (item.hpsKonsinyeringKodeAkun) setHpsKonsinyeringKodeAkun(item.hpsKonsinyeringKodeAkun);
      if (item.hpsKonsinyeringRup) setHpsKonsinyeringRup(item.hpsKonsinyeringRup);
      if (item.hpsKonsinyeringItems?.length) setHpsKonsinyeringItems(JSON.parse(JSON.stringify(item.hpsKonsinyeringItems)));
      if (item.hpsKonsinyeringKeterangan) setHpsKonsinyeringKeterangan(item.hpsKonsinyeringKeterangan);
      if (item.konsinyeringDasarHukum) setKonsinyeringDasarHukum(item.konsinyeringDasarHukum);
      if (item.konsinyeringGambaranUmum) setKonsinyeringGambaranUmum(item.konsinyeringGambaranUmum);
      if (item.konsinyeringMaksudTujuan) setKonsinyeringMaksudTujuan(item.konsinyeringMaksudTujuan);
      if (item.konsinyeringManfaat) setKonsinyeringManfaat(item.konsinyeringManfaat);
      if (item.konsinyeringLokasi) setKonsinyeringLokasi(item.konsinyeringLokasi);
      if (item.konsinyeringSumberDana) setKonsinyeringSumberDana(item.konsinyeringSumberDana);
      if (item.konsinyeringPerkiraanBiaya) setKonsinyeringPerkiraanBiaya(item.konsinyeringPerkiraanBiaya);
      if (item.konsinyeringJangkaWaktu) setKonsinyeringJangkaWaktu(item.konsinyeringJangkaWaktu);
      if (item.konsinyeringLayanan) setKonsinyeringLayanan(item.konsinyeringLayanan);
      if (item.konsinyeringPejabatNama) setKonsinyeringPejabatNama(item.konsinyeringPejabatNama);
      if (item.konsinyeringPejabatNip) setKonsinyeringPejabatNip(item.konsinyeringPejabatNip);
      if (item.konsinyeringPejabatJabatan) setKonsinyeringPejabatJabatan(item.konsinyeringPejabatJabatan);
      if (item.konsinyeringPejabatTanggal) setKonsinyeringPejabatTanggal(item.konsinyeringPejabatTanggal);
    }

    setCurrentMainView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Salin Isian dari Satu Item (Duplikasi Sebagai Item Baru) ──
  function handleCopyItemAsNew(sourceItem: PaketPengadaanItem) {
    const newItem: PaketPengadaanItem = {
      ...JSON.parse(JSON.stringify(sourceItem)),
      id: `paket_${Date.now()}`,
      hpsNomor: sourceItem.jenis === "Pengadaan Barang" ? `${sourceItem.hpsNomor} (Salinan)` : "",
      hpsJenisPekerjaan: sourceItem.jenis === "Pengadaan Barang" ? `${sourceItem.hpsJenisPekerjaan} (Salinan)` : "",
      hpsJasaNomor: sourceItem.jenis === "Pengadaan Jasa" ? `${sourceItem.hpsJasaNomor} (Salinan)` : "",
      hpsJasaJenisPekerjaan: sourceItem.jenis === "Pengadaan Jasa" ? `${sourceItem.hpsJasaJenisPekerjaan} (Salinan)` : "",
      hpsKonsinyeringNomor: sourceItem.jenis === "Konsinyering" ? `${sourceItem.hpsKonsinyeringNomor} (Salinan)` : "",
      hpsKonsinyeringJenisPekerjaan: sourceItem.jenis === "Konsinyering" ? `${sourceItem.hpsKonsinyeringJenisPekerjaan} (Salinan)` : "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [newItem, ...paketList];
    setPaketList(updatedList);
    saveListToStorage(updatedList);
    setSavedSuccessAlert(
      `Item "${newItem.hpsJenisPekerjaan || newItem.hpsJasaJenisPekerjaan || newItem.hpsKonsinyeringJenisPekerjaan || "Item"}" berhasil disalin sebagai item baru!`
    );
    setTimeout(() => setSavedSuccessAlert(null), 3500);
  }

  // ── Salin Isian dari Item Lain Langsung ke Form Aktif ──
  function handleCopyFillToCurrentForm(sourceItem: PaketPengadaanItem) {
    setSelectedJenis(sourceItem.jenis);
    if (sourceItem.jenis === "Pengadaan Barang") {
      setHpsNomor(`${sourceItem.hpsNomor} (Copy)`);
      setHpsHariTanggal(sourceItem.hpsHariTanggal);
      setHpsTempat(sourceItem.hpsTempat);
      setHpsJenisPekerjaan(`${sourceItem.hpsJenisPekerjaan} (Copy)`);
      setHpsKodeAkun(sourceItem.hpsKodeAkun);
      setHpsNomorRup(sourceItem.hpsNomorRup);
      setHpsItems(JSON.parse(JSON.stringify(sourceItem.hpsItems)));
      setBarangLatarBelakang(sourceItem.barangLatarBelakang);
      setBarangMaksudTujuan(sourceItem.barangMaksudTujuan);
      setBarangTargetSasaran(sourceItem.barangTargetSasaran);
      setBarangSumberDana(sourceItem.barangSumberDana);
      setBarangMutuItems(JSON.parse(JSON.stringify(sourceItem.barangMutuItems)));
      setBarangJangkaWaktu(sourceItem.barangJangkaWaktu);
      setBarangLokasiPekerjaan(sourceItem.barangLokasiPekerjaan);
      setBarangPelayanan(sourceItem.barangPelayanan);
    } else if (sourceItem.jenis === "Pengadaan Jasa") {
      setHpsJasaNomor(`${sourceItem.hpsJasaNomor || ""} (Copy)`);
      setHpsJasaHariTanggal(sourceItem.hpsJasaHariTanggal || "");
      setHpsJasaTempat(sourceItem.hpsJasaTempat || "");
      setHpsJasaJenisPekerjaan(`${sourceItem.hpsJasaJenisPekerjaan || ""} (Copy)`);
      setHpsJasaKodeAkun(sourceItem.hpsJasaKodeAkun || "");
      setHpsJasaRup(sourceItem.hpsJasaRup || "");
      if (sourceItem.hpsJasaPersonilItems) {
        setHpsJasaPersonilItems(JSON.parse(JSON.stringify(sourceItem.hpsJasaPersonilItems)));
      }
      setJasaLatarBelakang(sourceItem.jasaLatarBelakang || "");
      setJasaDasarPelaksanaan(sourceItem.jasaDasarPelaksanaan || "");
      setJasaMaksudTujuan(sourceItem.jasaMaksudTujuan || "");
      setJasaLokasiKegiatan(sourceItem.jasaLokasiKegiatan || "");
      setJasaRuangLingkup(sourceItem.jasaRuangLingkup || "");
      setJasaPendekatan(sourceItem.jasaPendekatan || "");
      setJasaMetodologi(sourceItem.jasaMetodologi || "");
      if (sourceItem.jasaTahapanList) {
        setJasaTahapanList(JSON.parse(JSON.stringify(sourceItem.jasaTahapanList)));
      }
      setJasaKeluaranDiinginkan(sourceItem.jasaKeluaranDiinginkan || "");
      setJasaSumberPendanaan(sourceItem.jasaSumberPendanaan || "");
      setJasaJangkaWaktu(sourceItem.jasaJangkaWaktu || "");
      if (sourceItem.jasaMilestoneList) {
        setJasaMilestoneList(JSON.parse(JSON.stringify(sourceItem.jasaMilestoneList)));
      }
      if (sourceItem.jasaTenagaList) {
        setJasaTenagaList(JSON.parse(JSON.stringify(sourceItem.jasaTenagaList)));
      }
      setJasaCatatanTambahanTenaga(sourceItem.jasaCatatanTambahanTenaga || "");
      setJasaHakKekayaanIntelektual(sourceItem.jasaHakKekayaanIntelektual || "");
      setJasaTanggungJawabHki(sourceItem.jasaTanggungJawabHki || "");
      setJasaKlausulDisclaimer(sourceItem.jasaKlausulDisclaimer || "");
      setJasaPenutup(sourceItem.jasaPenutup || "");
    } else {
      setHpsKonsinyeringNomor(`${sourceItem.hpsKonsinyeringNomor || ""} (Copy)`);
      setHpsKonsinyeringHariTanggal(sourceItem.hpsKonsinyeringHariTanggal || "");
      setHpsKonsinyeringTempat(sourceItem.hpsKonsinyeringTempat || "");
      setHpsKonsinyeringJenisPekerjaan(`${sourceItem.hpsKonsinyeringJenisPekerjaan || ""} (Copy)`);
      setHpsKonsinyeringKodeAkun(sourceItem.hpsKonsinyeringKodeAkun || "");
      setHpsKonsinyeringRup(sourceItem.hpsKonsinyeringRup || "");
      if (sourceItem.hpsKonsinyeringItems) {
        setHpsKonsinyeringItems(JSON.parse(JSON.stringify(sourceItem.hpsKonsinyeringItems)));
      }
      setHpsKonsinyeringKeterangan(sourceItem.hpsKonsinyeringKeterangan || "");
      setKonsinyeringDasarHukum(sourceItem.konsinyeringDasarHukum || "");
      setKonsinyeringGambaranUmum(sourceItem.konsinyeringGambaranUmum || "");
      setKonsinyeringMaksudTujuan(sourceItem.konsinyeringMaksudTujuan || "");
      setKonsinyeringManfaat(sourceItem.konsinyeringManfaat || "");
      setKonsinyeringLokasi(sourceItem.konsinyeringLokasi || "");
      setKonsinyeringSumberDana(sourceItem.konsinyeringSumberDana || "");
      setKonsinyeringPerkiraanBiaya(sourceItem.konsinyeringPerkiraanBiaya || "");
      setKonsinyeringJangkaWaktu(sourceItem.konsinyeringJangkaWaktu || "");
      setKonsinyeringLayanan(sourceItem.konsinyeringLayanan || "");
      setKonsinyeringPejabatNama(sourceItem.konsinyeringPejabatNama || "");
      setKonsinyeringPejabatNip(sourceItem.konsinyeringPejabatNip || "");
      setKonsinyeringPejabatJabatan(sourceItem.konsinyeringPejabatJabatan || "");
      setKonsinyeringPejabatTanggal(sourceItem.konsinyeringPejabatTanggal || "");
    }

    setSavedSuccessAlert(
      `Isian berhasil disalin dari item "${sourceItem.hpsJenisPekerjaan || sourceItem.hpsJasaJenisPekerjaan || sourceItem.hpsKonsinyeringJenisPekerjaan || "Item"}" ke formulir aktif!`
    );
    setTimeout(() => setSavedSuccessAlert(null), 3500);
  }

  // ── Hapus 1 Item ──
  function handleDeleteOneItem(id: string) {
    const itemTarget = paketList.find((p) => p.id === id);
    const itemName = itemTarget
      ? itemTarget.hpsJenisPekerjaan || itemTarget.hpsJasaJenisPekerjaan || itemTarget.hpsKonsinyeringJenisPekerjaan || "Item"
      : "Item";
    if (confirm(`Apakah Anda yakin ingin menghapus item "${itemName}"?`)) {
      const updated = paketList.filter((p) => p.id !== id);
      setPaketList(updated);
      saveListToStorage(updated);
      if (activeEditingId === id) {
        resetFormToNew("Pengadaan Barang");
      }
      setSavedSuccessAlert(`Item "${itemName}" telah dihapus.`);
      setTimeout(() => setSavedSuccessAlert(null), 3000);
    }
  }

  // ── Hapus SELURUH Item yang Telah Diinput ──
  function handleDeleteAllItems() {
    if (paketList.length === 0) return;
    if (confirm("PERINGATAN: Apakah Anda yakin ingin menghapus SELURUH item pengadaan yang telah diinput? Tindakan ini tidak dapat dibatalkan.")) {
      setPaketList([]);
      saveListToStorage([]);
      resetFormToNew("Pengadaan Barang");
      setSavedSuccessAlert("Seluruh item pengadaan telah dihapus.");
      setTimeout(() => setSavedSuccessAlert(null), 3500);
    }
  }

  // ── Cetak Dokumen Spesifik Item Paket ──
  function handlePrintItem(item: PaketPengadaanItem) {
    setPrintPreviewItem(item);
  }

  // Helper Simpan List ke LocalStorage
  function saveListToStorage(list: PaketPengadaanItem[]) {
    try {
      const storageUnitKey = activeUnit.replace(/\s+/g, "_");
      const listKey = `kak_pengadaan_list_${storageUnitKey}_${activeKodeHistori}`;
      localStorage.setItem(listKey, JSON.stringify(list));
      localStorage.setItem(`kak_pengadaan_list_latest_${storageUnitKey}`, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  }

  // ── Init & Memuat Data LocalStorage ──
  useEffect(() => {
    try {
      let unit = "Direktorat Strategi dan Kerja Sama Internasional";
      let label = "DIPA Awal - B00";
      let statusHistori = "DIPA Awal";
      let kodeHistori = "B00";

      const rawHistori = localStorage.getItem("kak_active_histori");
      if (rawHistori) {
        const parsed = JSON.parse(rawHistori);
        if (parsed.kdsatker) unit = parsed.kdsatker;
        if (parsed.label) label = parsed.label;
        if (parsed.status_histori) statusHistori = parsed.status_histori;
        if (parsed.kode_sts_history) kodeHistori = parsed.kode_sts_history;
      }

      setActiveUnit(unit);
      setActiveHistoriLabel(label);
      setActiveStatusHistori(statusHistori);
      setActiveKodeHistori(kodeHistori);

      const isDipaOrRevisi =
        statusHistori === "DIPA Awal" ||
        statusHistori === "Usulan Revisi DIPA" ||
        statusHistori === "Usulan Revisi Satker (POK)" ||
        kodeHistori.startsWith("B") ||
        kodeHistori.startsWith("A") ||
        kodeHistori.startsWith("C");

      const storageUnitKey = unit.replace(/\s+/g, "_");
      const listKey = `kak_pengadaan_list_${storageUnitKey}_${kodeHistori}`;

      // 1. Cek apakah ada list paket di histori aktif
      const savedList = localStorage.getItem(listKey);
      if (savedList) {
        try {
          const parsed = JSON.parse(savedList);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPaketList(parsed);
            return;
          }
        } catch (e) {}
      }

      // 2. Cek histori sebelumnya jika DIPA/Revisi
      if (isDipaOrRevisi) {
        let sourceList: PaketPengadaanItem[] | null = null;
        let sourceHistoriLabel = "";

        const candidateKeys = [
          `kak_pengadaan_list_${storageUnitKey}_B00`,
          `kak_pengadaan_list_${storageUnitKey}_E00`,
          `kak_pengadaan_list_${storageUnitKey}_D01`,
          `kak_pengadaan_list_${storageUnitKey}_D00`,
          `kak_pengadaan_list_latest_${storageUnitKey}`,
        ];

        if (kodeHistori.startsWith("A") || kodeHistori.startsWith("C")) {
          const prefix = kodeHistori[0];
          const num = parseInt(kodeHistori.substring(1), 10);
          if (num > 1) {
            const prevKode = `${prefix}${String(num - 1).padStart(2, "0")}`;
            candidateKeys.unshift(`kak_pengadaan_list_${storageUnitKey}_${prevKode}`);
          }
        }

        for (const k of candidateKeys) {
          const raw = localStorage.getItem(k);
          if (raw) {
            try {
              const p = JSON.parse(raw);
              if (Array.isArray(p) && p.length > 0) {
                sourceList = p;
                sourceHistoriLabel = k;
                break;
              }
            } catch (err) {}
          }
        }

        if (sourceList && sourceList.length > 0) {
          setPaketList(sourceList);
          saveListToStorage(sourceList);
          setCopyNotice(
            `Sebanyak ${sourceList.length} item KAK Pengadaan berhasil disalin otomatis dari histori terakhir (${sourceHistoriLabel}). Anda dapat mengedit, menambah, atau menyesuaikan rincian jika ada usulan revisi.`
          );
          return;
        }
      }

      // 3. Fallback Initial: Jika belum ada list, buat default 3 item (Barang, Jasa, Konsinyering)
      const defaultBarangItem: PaketPengadaanItem = {
        id: "paket_default_barang_1",
        jenis: "Pengadaan Barang",
        hpsNomor: "HPS-061/PL.01.01/3.1/VIII/2026",
        hpsHariTanggal: "13 Agustus 2026",
        hpsTempat: "Pusat Pelaporan dan Analisis Transaksi Keuangan",
        hpsJenisPekerjaan: "Pengadaan Laptop Kerja pada PPATK Tahun Anggaran 2026",
        hpsKodeAkun: "078.01.01.3377.EBB.951.053.0A.532111 (Belanja Modal Peralatan dan Mesin – Laptop Administrasi)",
        hpsNomorRup: "67667519",
        hpsItems: [
          {
            id: "hps_item_1",
            pekerjaan: "Laptop Kerja",
            kuantitas: 27,
            satuan: "Unit",
            hargaSatuan: 34571621.5,
            hargaTotal: 933433780.63,
          },
        ],
        barangLatarBelakang:
          "Dalam rangka mewujudkan kelancaran pelaksanaan tugas dan fungsi analisis serta pemeriksaan transaksi keuangan mencurigakan di lingkungan Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK), ketersediaan perangkat kerja yang andal, aman, dan memiliki komputasi tinggi mutlak diperlukan.",
        barangMaksudTujuan:
          "1. Maksud:\nMenyediakan fasilitas perangkat komputasi bergerak yang memenuhi standar spesifikasi teknis dan keamanan.\n\n2. Tujuan:\n- Meningkatkan produktivitas kerja dan efektivitas proses analisis transaksi keuangan.\n- Mendukung mobilitas pegawai dalam pelaksanaan tugas kedinasan.",
        barangTargetSasaran:
          "Terpenuhinya 27 (dua puluh tujuh) unit laptop kerja standar operasional berkinerja tinggi, siap pakai (ready to use), terkonfigurasi dengan sistem keamanan instansi.",
        barangSumberDana:
          "Pembiayaan pengadaan ini dibebankan pada DIPA PPATK Tahun Anggaran 2026 Akun 532111 (Belanja Modal Peralatan dan Mesin – Laptop Administrasi) dengan total estimasi Rp1.036.111.497,00.",
        barangMutuItems: [
          {
            id: "mutu_1",
            namaBarang: "Laptop Kerja (Business Grade)",
            spesifikasiTeknis:
              "Processor min. Intel Core Ultra 7 / AMD Ryzen 7 Pro, RAM 32GB DDR5, Storage 1TB NVMe PCIe Gen4 SSD, Display 14 inch, TPM 2.0, Win 11 Pro, Garansi Resmi 3 Tahun.",
            jumlah: 27,
          },
        ],
        barangJangkaWaktu: "45 (empat puluh lima) Hari Kalender terhitung sejak SPMK diterbitkan",
        barangLokasiPekerjaan: "Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK), Jl. Ir. H. Juanda No. 35, Jakarta Pusat 10120",
        barangPelayanan:
          "Garansi pabrikan minimal 3 (tiga) tahun untuk suku cadang dan jasa perbaikan on-site support 5x8 Next Business Day.",
        totalAnggaran: 1036111497,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const defaultJasaItem: PaketPengadaanItem = {
        id: "paket_default_jasa_1",
        jenis: "Pengadaan Jasa",
        hpsNomor: "",
        hpsHariTanggal: "",
        hpsTempat: "",
        hpsJenisPekerjaan: "",
        hpsKodeAkun: "",
        hpsNomorRup: "",
        hpsItems: [],
        barangLatarBelakang: "",
        barangMaksudTujuan: "",
        barangTargetSasaran: "",
        barangSumberDana: "",
        barangMutuItems: [],
        barangJangkaWaktu: "",
        barangLokasiPekerjaan: "",
        barangPelayanan: "",
        // Jasa
        hpsJasaNomor: "HPS-50.1/PL.01.01/3.1/VII/2026",
        hpsJasaHariTanggal: "Jumat, 24 Juli 2026",
        hpsJasaTempat: "Pusat Pelaporan dan Analisis Transaksi Keuangan",
        hpsJasaJenisPekerjaan:
          "Pengadaan Jasa Konsultan Penyusunan Buku Perkembangan Sejarah Kejahatan Keuangan di Indonesia TA 2026",
        hpsJasaKodeAkun: "078.01.WA.8004.EBA.958.056.0A. akun 522131 (Belanja Jasa Konsultan).",
        hpsJasaRup: "67557489",
        hpsJasaPersonilItems: [
          {
            id: "p_1",
            jenisPersonil: "KETUA TIM PENULIS",
            jumlahOrang: 1,
            waktuBulan: 3.0,
            hargaSatuanOB: 17500000,
            jumlahBiaya: 52500000,
          },
          {
            id: "p_2",
            jenisPersonil: "ANGGOTA TIM PENULIS",
            jumlahOrang: 3,
            waktuBulan: 3.0,
            hargaSatuanOB: 15000000,
            jumlahBiaya: 135000000,
          },
          {
            id: "p_3",
            jenisPersonil: "EDITOR",
            jumlahOrang: 1,
            waktuBulan: 1.0,
            hargaSatuanOB: 12000000,
            jumlahBiaya: 12000000,
          },
          {
            id: "p_4",
            jenisPersonil: "DESIGNER",
            jumlahOrang: 1,
            waktuBulan: 1.0,
            hargaSatuanOB: 11000000,
            jumlahBiaya: 11000000,
          },
        ],
        jasaLatarBelakang:
          "Perkembangan kejahatan keuangan di Indonesia terus mengalami transformasi signifikan seiring modernisasi teknologi dan integrasi sistem keuangan. Dibutuhkan penyusunan literatur komprehensif oleh konsultan ahli.",
        jasaDasarPelaksanaan:
          "1. UU Nomor 8 Tahun 2010 tentang PPTPPU;\n2. Perpres Nomor 50 Tahun 2011;\n3. DIPA PPATK TA 2026 Nomor SP DIPA-078.01.1.417208/2026.",
        jasaMaksudTujuan:
          "Maksud: Merekrut konsultan ahli untuk menyusun buku sejarah kejahatan keuangan.\nTujuan: Menyajikan referensi komprehensif bagi aparat penegak hukum dan publik.",
        jasaLokasiKegiatan: "Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK), Jl. Ir. H. Juanda No. 35, Jakarta Pusat 10120",
        jasaRuangLingkup:
          "Pengumpulan data arsip sejarah, wawancara tokoh perintis, FGD validasi materi, penyusunan draft naskah, editing, dan perancangan grafis tata letak.",
        jasaPendekatan: "Pendekatan historis-yuridis dan empiris berbasis data rezim anti pencucian uang.",
        jasaMetodologi: "Studi kepustakaan, in-depth interview, serial FGD, dan uji sahih materi naskah.",
        jasaTahapanList: [
          {
            id: "t_1",
            nomorTahap: 1,
            namaTahapan: "Tahap Persiapan & Inception Report",
            uraianTahapan: "Penyusunan outline naskah definitif dan instrumen pengumpulan data.",
          },
          {
            id: "t_2",
            nomorTahap: 2,
            namaTahapan: "Tahap Pengumpulan Data, Wawancara & FGD",
            uraianTahapan: "Wawancara narasumber perintis rezim APU PPT dan FGD validasi.",
          },
          {
            id: "t_3",
            nomorTahap: 3,
            namaTahapan: "Tahap Penyusunan Draft Naskah",
            uraianTahapan: "Penulisan bab per bab dan kompilasi naskah awal.",
          },
          {
            id: "t_4",
            nomorTahap: 4,
            namaTahapan: "Tahap Review, Finalisasi Desain & Uji Cetak",
            uraianTahapan: "Editing kebahasaan, perancangan layout artistik, dan cetak dummy buku.",
          },
        ],
        jasaKeluaranDiinginkan: "Naskah buku final siap cetak, laporan Inception & Interim, serta Dummy Book 5 eksemplar.",
        jasaSumberPendanaan:
          "DIPA PPATK TA 2026 akun 522131 (Belanja Jasa Konsultan) dengan total biaya Rp233.655.000,00 termasuk pajak.",
        jasaJangkaWaktu: "3 (tiga) Bulan Kalender sejak SPMK diterbitkan",
        jasaMilestoneList: [
          { id: "m_1", mingguKe: "Minggu 1 - 2", output: "Inception Report", uraian: "Outline dan rencana kerja." },
          { id: "m_2", mingguKe: "Minggu 3 - 6", output: "Hasil Wawancara & FGD", uraian: "Transkrip wawancara dan FGD." },
          { id: "m_3", mingguKe: "Minggu 7 - 9", output: "Draft Naskah Lengkap", uraian: "Kompilasi seluruh bab buku." },
          { id: "m_4", mingguKe: "Minggu 10 - 12", output: "Dummy Book & File Siap Cetak", uraian: "Layout dan dummy buku 5 eks." },
        ],
        jasaTenagaList: [
          {
            id: "ten_1",
            posisi: "Ketua Tim Penulis",
            jumlah: 1,
            waktu: "3 Bulan",
            satuanUpahOB: 17500000,
            kualifikasiPengalaman: "S2/S3 Hukum/Ekonomi, pengalaman min. 8 tahun.",
            tanggungJawabUtama: "Memimpin koordinasi riset, penulisan, dan penyelarasan materi.",
          },
          {
            id: "ten_2",
            posisi: "Anggota Tim Penulis",
            jumlah: 3,
            waktu: "3 Bulan",
            satuanUpahOB: 15000000,
            kualifikasiPengalaman: "S1 Hukum/Komunikasi/Sejarah, pengalaman min. 5 tahun.",
            tanggungJawabUtama: "Riset dokumen, wawancara narasumber, dan penyusunan draf bab.",
          },
          {
            id: "ten_3",
            posisi: "Editor",
            jumlah: 1,
            waktu: "1 Bulan",
            satuanUpahOB: 12000000,
            kualifikasiPengalaman: "S1 Sastra/Jurnalistik, pengalaman min. 5 tahun editing buku.",
            tanggungJawabUtama: "Penyuntingan bahasa baku, konsistensi terminologi, dan ejaan.",
          },
          {
            id: "ten_4",
            posisi: "Designer",
            jumlah: 1,
            waktu: "1 Bulan",
            satuanUpahOB: 11000000,
            kualifikasiPengalaman: "S1 DKV/Desain Grafis, pengalaman min. 4 tahun desain buku.",
            tanggungJawabUtama: "Perancangan cover, infografis, dan tata letak interior buku.",
          },
        ],
        jasaCatatanTambahanTenaga: "Wajib melampirkan portofolio penulisan/desain dan pakta integritas penugasan penuh.",
        jasaHakKekayaanIntelektual: "Seluruh hak cipta materi buku dan desain menjadi hak milik mutlak PPATK.",
        jasaTanggungJawabHki: "Konsultan bertanggung jawab penuh bebas dari plagiarisme dan tuntutan pihak ketiga.",
        jasaKlausulDisclaimer:
          "Seluruh informasi intelijen keuangan yang dicantumkan telah melalui sanitasi dan wajib menjaga kerahasiaan.",
        jasaPenutup: "Demikian KAK Pengadaan Jasa Konsultan ini dibuat sebagai acuan kerja bersama.",
        totalAnggaran: 233655000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const defaultKonsinyeringItem: PaketPengadaanItem = {
        id: "paket_default_konsinyering_1",
        jenis: "Konsinyering",
        hpsNomor: "",
        hpsHariTanggal: "",
        hpsTempat: "",
        hpsJenisPekerjaan: "",
        hpsKodeAkun: "",
        hpsNomorRup: "",
        hpsItems: [],
        barangLatarBelakang: "",
        barangMaksudTujuan: "",
        barangTargetSasaran: "",
        barangSumberDana: "",
        barangMutuItems: [],
        barangJangkaWaktu: "",
        barangLokasiPekerjaan: "",
        barangPelayanan: "",
        // Konsinyering
        hpsKonsinyeringNomor: "HPS-043/PL.01/4/VI/2026",
        hpsKonsinyeringHariTanggal: "Jumat, 19 Juni 2026",
        hpsKonsinyeringTempat: "Pusat Pelaporan dan Analisis Transaksi Keuangan",
        hpsKonsinyeringJenisPekerjaan:
          "Pengadaan Paket Meeting dalam rangka FGD Harmonisasi Statistik Penanganan Perkara TPPU dan Evaluasi Pemanfaatan Produk Intelijen PPATK",
        hpsKonsinyeringKodeAkun:
          "078.01.BE.3384.BCE.004.053.A akun 524114 (Belanja Perjalanan Dinas Paket Meeting Dalam Kota)",
        hpsKonsinyeringRup: "67089052",
        hpsKonsinyeringItems: [
          {
            id: "hk_1",
            uraianPekerjaan: "Fullday Meeting Eselon III ke Bawah",
            volumeHari: 1,
            satuanHari: "hari",
            volumePax: 60,
            satuanPax: "Pax",
            hargaSatuan: 455000,
            totalHarga: 27300000,
          },
        ],
        hpsKonsinyeringKeterangan:
          "1. Biaya akan dibebankan pada DIPA PPATK tahun 2026 dengan kode akun 078.01.BE.3384.BCE.004.053.A akun 524114 (Belanja Perjalanan Dinas Paket Meeting Dalam Kota).\n2. Jenis kontrak adalah harga satuan.\n3. Harga sudah termasuk pajak.\n4. Jangka waktu pelaksanaan pekerjaan 25 Juni 2026.",
        konsinyeringDasarHukum:
          "1. UU Nomor 8 Tahun 2010 tentang Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang;\n2. Peraturan Presiden Nomor 50 Tahun 2011;\n3. Peraturan Menteri Keuangan tentang Standar Biaya Masukan (SBM) TA 2026;\n4. DIPA PPATK TA 2026.",
        konsinyeringGambaranUmum:
          "PPATK bertugas memproduksi hasil analisis dan pemeriksaan intelijen keuangan dalam penanganan perkara TPPU. Dalam rangka meningkatkan efektivitas pemanfaatan produk intelijen dan harmonisasi data statistik perkara bersama penegak hukum, diselenggarakan paket meeting dalam kota.",
        konsinyeringMaksudTujuan:
          "Maksud: Memfasilitasi koordinasi intensif dan harmonisasi statistik penanganan perkara TPPU.\nTujuan: Menyelaraskan data statistik perkara dan mengevaluasi efektivitas produk intelijen PPATK.",
        konsinyeringManfaat:
          "Tersedianya basis data statistik penanganan perkara TPPU yang akurat dan terintegrasi secara nasional.",
        konsinyeringLokasi: "Hotel bintang 4 di wilayah DKI Jakarta (Dalam Kota) dengan kapasitas 60 peserta.",
        konsinyeringSumberDana:
          "DIPA PPATK TA 2026 kode 078.01.BE.3384.BCE.004.053.A akun 524114 (Belanja Perjalanan Dinas Paket Meeting Dalam Kota).",
        konsinyeringPerkiraanBiaya:
          "Total estimasi biaya penyelenggaraan kegiatan adalah sebesar Rp27.300.000,00 (Dua Puluh Tujuh Juta Tiga Ratus Ribu Rupiah).",
        konsinyeringJangkaWaktu: "1 (satu) hari kalender, direncanakan pelaksanaan pada tanggal 25 Juni 2026.",
        konsinyeringLayanan:
          "Penyedia paket meeting wajib menyediakan ruang pertemuan ber-AC kapasitas 60 peserta, sound system, LCD projector, Wi-Fi, meeting kit, 1x makan siang dan 2x coffee break.",
        konsinyeringPejabatNama: "Diana Soraya Noor, S.H., M.H.",
        konsinyeringPejabatNip: "19780512 200212 2 001",
        konsinyeringPejabatJabatan: "Pejabat Pembuat Komitmen (PPK)",
        konsinyeringPejabatTanggal: "Jakarta, 19 Juni 2026",
        totalAnggaran: 27300000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const initialList = [defaultBarangItem, defaultJasaItem, defaultKonsinyeringItem];
      setPaketList(initialList);
      saveListToStorage(initialList);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // ── Simpan Paket Saat Ini (Tambah Baru atau Update Item yang Sedang Diedit) ──
  function handleSaveCurrentPaket() {
    let totalBiaya = 0;
    if (selectedJenis === "Pengadaan Barang") {
      totalBiaya = hpsGrandTotalBulat;
    } else if (selectedJenis === "Pengadaan Jasa") {
      totalBiaya = hpsJasaGrandTotalBulat;
    } else {
      totalBiaya = hpsKonsinyeringGrandTotalBulat;
    }

    const itemData: PaketPengadaanItem = {
      id: activeEditingId || `paket_${Date.now()}`,
      jenis: selectedJenis,
      // 1. Pengadaan Barang
      hpsNomor,
      hpsHariTanggal,
      hpsTempat,
      hpsJenisPekerjaan,
      hpsKodeAkun,
      hpsNomorRup,
      hpsItems,
      barangLatarBelakang,
      barangMaksudTujuan,
      barangTargetSasaran,
      barangSumberDana,
      barangMutuItems,
      barangJangkaWaktu,
      barangLokasiPekerjaan,
      barangPelayanan,
      // 2. Pengadaan Jasa
      hpsJasaNomor,
      hpsJasaHariTanggal,
      hpsJasaTempat,
      hpsJasaJenisPekerjaan,
      hpsJasaKodeAkun,
      hpsJasaRup,
      hpsJasaPersonilItems,
      jasaLatarBelakang,
      jasaDasarPelaksanaan,
      jasaMaksudTujuan,
      jasaLokasiKegiatan,
      jasaRuangLingkup,
      jasaPendekatan,
      jasaMetodologi,
      jasaTahapanList,
      jasaKeluaranDiinginkan,
      jasaSumberPendanaan,
      jasaJangkaWaktu,
      jasaMilestoneList,
      jasaTenagaList,
      jasaCatatanTambahanTenaga,
      jasaHakKekayaanIntelektual,
      jasaTanggungJawabHki,
      jasaKlausulDisclaimer,
      jasaPenutup,
      // 3. Konsinyering
      hpsKonsinyeringNomor,
      hpsKonsinyeringHariTanggal,
      hpsKonsinyeringTempat,
      hpsKonsinyeringJenisPekerjaan,
      hpsKonsinyeringKodeAkun,
      hpsKonsinyeringRup,
      hpsKonsinyeringItems,
      hpsKonsinyeringKeterangan,
      konsinyeringDasarHukum,
      konsinyeringGambaranUmum,
      konsinyeringMaksudTujuan,
      konsinyeringManfaat,
      konsinyeringLokasi,
      konsinyeringSumberDana,
      konsinyeringPerkiraanBiaya,
      konsinyeringJangkaWaktu,
      konsinyeringLayanan,
      konsinyeringPejabatNama,
      konsinyeringPejabatNip,
      konsinyeringPejabatJabatan,
      konsinyeringPejabatTanggal,
      totalAnggaran: totalBiaya,
      createdAt: activeEditingId
        ? (paketList.find((p) => p.id === activeEditingId)?.createdAt || new Date().toISOString())
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const titleSaved =
      selectedJenis === "Pengadaan Barang"
        ? itemData.hpsJenisPekerjaan
        : selectedJenis === "Pengadaan Jasa"
        ? itemData.hpsJasaJenisPekerjaan
        : itemData.hpsKonsinyeringJenisPekerjaan;

    let updatedList: PaketPengadaanItem[];
    if (activeEditingId) {
      updatedList = paketList.map((p) => (p.id === activeEditingId ? itemData : p));
      setSavedSuccessAlert(`Perubahan pada item "${titleSaved}" berhasil disimpan!`);
    } else {
      updatedList = [itemData, ...paketList];
      setSavedSuccessAlert(`Item baru "${titleSaved}" berhasil ditambahkan ke daftar!`);
    }

    setPaketList(updatedList);
    saveListToStorage(updatedList);
    setActiveEditingId(itemData.id);

    setTimeout(() => setSavedSuccessAlert(null), 3500);
  }

  // ── Handler Items HPS Barang ──
  function handleAddHpsItem() {
    setHpsItems([
      ...hpsItems,
      {
        id: `hps_it_${Date.now()}`,
        pekerjaan: "Komponen / Pekerjaan Tambahan",
        kuantitas: 1,
        satuan: "Unit",
        hargaSatuan: 0,
        hargaTotal: 0,
      },
    ]);
  }

  function handleUpdateHpsItem(id: string, field: keyof ItemHpsBarang, value: any) {
    setHpsItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        if (field === "kuantitas" || field === "hargaSatuan") {
          const qty = Number(field === "kuantitas" ? value : updated.kuantitas) || 0;
          const prc = Number(field === "hargaSatuan" ? value : updated.hargaSatuan) || 0;
          updated.hargaTotal = Number((qty * prc).toFixed(2));
        }
        return updated;
      })
    );
  }

  function handleDeleteHpsItem(id: string) {
    if (hpsItems.length > 1) {
      setHpsItems(hpsItems.filter((i) => i.id !== id));
    }
  }

  // ── Handler Mutu Kualitas Barang ──
  function handleAddMutuItem() {
    setBarangMutuItems([
      ...barangMutuItems,
      {
        id: `mutu_${Date.now()}`,
        namaBarang: "Nama Barang Baru",
        spesifikasiTeknis: "Rincian spesifikasi teknis, standar merek/SNI/fitur...",
        jumlah: 1,
      },
    ]);
  }

  function handleUpdateMutuItem(id: string, field: keyof ItemMutuKualitas, value: any) {
    setBarangMutuItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  }

  function handleDeleteMutuItem(id: string) {
    if (barangMutuItems.length > 1) {
      setBarangMutuItems(barangMutuItems.filter((i) => i.id !== id));
    }
  }

  // ── Handler Items HPS Jasa Personil ──
  function handleAddHpsJasaPersonil() {
    setHpsJasaPersonilItems([
      ...hpsJasaPersonilItems,
      {
        id: `hps_j_${Date.now()}`,
        jenisPersonil: "TENAGA AHLI BARU",
        jumlahOrang: 1,
        waktuBulan: 1.0,
        hargaSatuanOB: 0,
        jumlahBiaya: 0,
      },
    ]);
  }

  function handleUpdateHpsJasaPersonil(id: string, field: keyof ItemHpsJasaPersonil, value: any) {
    setHpsJasaPersonilItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        if (field === "jumlahOrang" || field === "waktuBulan" || field === "hargaSatuanOB") {
          const org = Number(field === "jumlahOrang" ? value : updated.jumlahOrang) || 0;
          const bln = Number(field === "waktuBulan" ? value : updated.waktuBulan) || 0;
          const prc = Number(field === "hargaSatuanOB" ? value : updated.hargaSatuanOB) || 0;
          updated.jumlahBiaya = Number((org * bln * prc).toFixed(2));
        }
        return updated;
      })
    );
  }

  function handleDeleteHpsJasaPersonil(id: string) {
    if (hpsJasaPersonilItems.length > 1) {
      setHpsJasaPersonilItems(hpsJasaPersonilItems.filter((i) => i.id !== id));
    }
  }

  // ── Handler Tahapan Pelaksanaan Jasa (Bagian 6) ──
  function handleSetJumlahTahapanJasa(newCount: number) {
    const targetCount = Math.max(1, Math.min(20, newCount));
    const currentList = [...jasaTahapanList];

    if (targetCount > currentList.length) {
      for (let i = currentList.length + 1; i <= targetCount; i++) {
        currentList.push({
          id: `tahap_${Date.now()}_${i}`,
          nomorTahap: i,
          namaTahapan: `Tahap ${i}: (Tentukan Nama Tahapan)`,
          uraianTahapan: `Uraikan rincian pekerjaan dan aktivitas pelaksanaan pada tahap ke-${i}...`,
        });
      }
    } else if (targetCount < currentList.length) {
      currentList.splice(targetCount);
    }
    setJasaTahapanList(currentList);
  }

  function handleUpdateTahapanJasa(id: string, field: keyof TahapanPelaksanaanJasa, value: any) {
    setJasaTahapanList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  // ── Handler Milestone Jadwal Jasa (Bagian 9) ──
  function handleAddMilestoneJasa() {
    setJasaMilestoneList([
      ...jasaMilestoneList,
      {
        id: `ms_${Date.now()}`,
        mingguKe: `Minggu ke-${jasaMilestoneList.length + 1}`,
        output: "Target Keluaran",
        uraian: "Uraian target pencapaian pekerjaan...",
      },
    ]);
  }

  function handleUpdateMilestoneJasa(id: string, field: keyof MilestoneJadwalJasa, value: any) {
    setJasaMilestoneList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  }

  function handleDeleteMilestoneJasa(id: string) {
    if (jasaMilestoneList.length > 1) {
      setJasaMilestoneList(jasaMilestoneList.filter((m) => m.id !== id));
    }
  }

  // ── Handler Tenaga Ahli KAK Jasa (Bagian 10) ──
  function handleAddTenagaJasa() {
    setJasaTenagaList([
      ...jasaTenagaList,
      {
        id: `ten_${Date.now()}`,
        posisi: "Posisi Tenaga Ahli",
        jumlah: 1,
        waktu: "1 Bulan",
        satuanUpahOB: 0,
        kualifikasiPengalaman: "Pendidikan min. S1, pengalaman relevan...",
        tanggungJawabUtama: "Uraian tugas dan tanggung jawab personil...",
      },
    ]);
  }

  function handleUpdateTenagaJasa(id: string, field: keyof KebutuhanTenagaJasa, value: any) {
    setJasaTenagaList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  function handleDeleteTenagaJasa(id: string) {
    if (jasaTenagaList.length > 1) {
      setJasaTenagaList(jasaTenagaList.filter((t) => t.id !== id));
    }
  }

  // ── Handler Tabel HPS / Spesifikasi Teknis Konsinyering (Sesuai Format Gambar) ──
  function handleAddHpsKonsinyeringItem() {
    setHpsKonsinyeringItems([
      ...hpsKonsinyeringItems,
      {
        id: `hk_${Date.now()}`,
        uraianPekerjaan: "Paket Meeting Tambahan",
        volumeHari: 1,
        satuanHari: "hari",
        volumePax: 30,
        satuanPax: "Pax",
        hargaSatuan: 455000,
        totalHarga: 13650000,
      },
    ]);
  }

  function handleUpdateHpsKonsinyeringItem(id: string, field: keyof ItemHpsKonsinyering, value: any) {
    setHpsKonsinyeringItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        if (field === "volumeHari" || field === "volumePax" || field === "hargaSatuan") {
          const vHari = Number(field === "volumeHari" ? value : updated.volumeHari) || 0;
          const vPax = Number(field === "volumePax" ? value : updated.volumePax) || 0;
          const hSatuan = Number(field === "hargaSatuan" ? value : updated.hargaSatuan) || 0;
          updated.totalHarga = Number((vHari * vPax * hSatuan).toFixed(2));
        }
        return updated;
      })
    );
  }

  function handleDeleteHpsKonsinyeringItem(id: string) {
    if (hpsKonsinyeringItems.length > 1) {
      setHpsKonsinyeringItems(hpsKonsinyeringItems.filter((i) => i.id !== id));
    }
  }

  // Ringkasan Jumlah Item Terinput
  const totalBarangCount = paketList.filter((p) => p.jenis === "Pengadaan Barang").length;
  const totalJasaCount = paketList.filter((p) => p.jenis === "Pengadaan Jasa").length;
  const totalKonsinyeringCount = paketList.filter((p) => p.jenis === "Konsinyering").length;
  const totalAllCount = paketList.length;

  const totalAnggaranKeseluruhan = paketList.reduce((sum, p) => sum + (p.totalAnggaran || 0), 0);

  // Filter paket pada tabel monitoring
  const filteredPaketList =
    filterMonitoringJenis === "ALL"
      ? paketList
      : paketList.filter((p) => p.jenis === filterMonitoringJenis);

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Penganggaran &amp; Biaya</span>
            <span>/</span>
            <span>Kerangka Acuan Kerja (TOR)</span>
            <span>/</span>
            <span className="text-[var(--primary)] font-semibold">Isian KAK/TOR Pengadaan</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2.5">
            <Package className="h-6 w-6 text-[var(--primary)]" />
            <span>Form Input &amp; Monitoring KAK / TOR Pengadaan</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Mendukung Pengadaan Barang (HPS + 5 Bagian KAK), Pengadaan Jasa (HPS Personil + 13 Bagian KAK), serta Konsinyering (HPS Meeting + 9 Bagian KAK Lengkap).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {currentMainView === "form" && (
            <button
              onClick={handleSaveCurrentPaket}
              className="px-5 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{activeEditingId ? "Simpan Perubahan Item" : "Simpan Sebagai Item Baru"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Banner Unit & Histori Aktif dengan Indikator Status Wajib / Opsional ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--border)] shadow-sm text-xs text-[var(--text)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[var(--primary)] border border-indigo-100 dark:border-indigo-900">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[0.68rem] text-[var(--text-muted)] font-semibold">
              Unit Kerja &amp; Histori Aktif Dokumen KAK
            </div>
            <div className="text-sm font-bold text-[var(--text)] flex items-center gap-2 mt-0.5">
              <span>{activeUnit}</span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[var(--primary)] border border-[var(--border)]">
                {activeHistoriLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {isTahapanPaguRenja ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Info className="h-3.5 w-3.5 text-slate-500" />
              <span>Status: <strong>Opsional</strong> (Tahapan Pagu Renja)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-800 shadow-sm animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>Status: <strong>Wajib Diisi</strong> (Tahapan DIPA &amp; Usulan Revisi)</span>
            </div>
          )}

          <Link
            to="/kak/pilih-histori"
            className="text-xs text-[var(--primary)] font-semibold hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Ubah Histori</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Banner Notifikasi Cek Data & Auto-Copy dari Histori Terakhir ── */}
      {copyNotice && (
        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-100 flex items-start justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Pemeriksaan Data Histori Terakhir:</span>
              <p className="text-[0.72rem] text-teal-800 dark:text-teal-200 mt-0.5 leading-relaxed">
                {copyNotice}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCopyNotice(null)}
            className="text-teal-600 hover:text-teal-800 text-xs font-semibold px-2 py-0.5 rounded cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {savedSuccessAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2.5 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{savedSuccessAlert}</span>
          </div>
          <button
            onClick={() => setSavedSuccessAlert(null)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold px-2 text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ── Tab Switcher Utama: Tab Monitoring vs Tab Formulir Input ── */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMainView("monitoring")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              currentMainView === "monitoring"
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Tab Monitoring Item Terinput</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[0.68rem] font-black ${
                currentMainView === "monitoring"
                  ? "bg-white text-[var(--primary)]"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
              }`}
            >
              {totalAllCount} Item
            </span>
          </button>

          <button
            onClick={() => {
              if (!activeEditingId) {
                resetFormToNew(selectedJenis);
              }
              setCurrentMainView("form");
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              currentMainView === "form"
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            <Edit className="h-4 w-4" />
            <span>
              {activeEditingId ? `Edit Item (${selectedJenis})` : `Form Input KAK Pengadaan`}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {paketList.length > 0 && (
            <button
              onClick={handleDeleteAllItems}
              className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Hapus seluruh item pengadaan yang telah diinput"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Seluruh Item ({totalAllCount})</span>
            </button>
          )}

          <button
            onClick={() => {
              resetFormToNew("Konsinyering");
              setCurrentMainView("form");
            }}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Tambah Paket Baru</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── VIEW 1: TAB MONITORING ITEM TERINPUT (RINGKASAN & TABEL REKAP) ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {currentMainView === "monitoring" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Card Statistik Monitoring */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Total Seluruh Item</span>
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-[var(--primary)]">
                  <Package className="h-4 w-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-[var(--text)] mt-2">{totalAllCount}</div>
              <div className="text-[0.68rem] text-[var(--text-muted)] mt-1 font-mono">
                Rp{totalAnggaranKeseluruhan.toLocaleString("id-ID")}
              </div>
            </div>

            <div
              onClick={() => setFilterMonitoringJenis("Pengadaan Barang")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                filterMonitoringJenis === "Pengadaan Barang"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500"
                  : "bg-white dark:bg-slate-900 border-[var(--border)] hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Pengadaan Barang</span>
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                  <Package className="h-4 w-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2">
                {totalBarangCount} <span className="text-xs font-normal text-[var(--text-muted)]">Paket</span>
              </div>
              <div className="text-[0.68rem] text-[var(--text-muted)] mt-1">Form HPS + 5 Bagian KAK</div>
            </div>

            <div
              onClick={() => setFilterMonitoringJenis("Pengadaan Jasa")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                filterMonitoringJenis === "Pengadaan Jasa"
                  ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500"
                  : "bg-white dark:bg-slate-900 border-[var(--border)] hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Pengadaan Jasa</span>
                <span className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                  <Wrench className="h-4 w-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-2">
                {totalJasaCount} <span className="text-xs font-normal text-[var(--text-muted)]">Paket</span>
              </div>
              <div className="text-[0.68rem] text-[var(--text-muted)] mt-1">HPS Personil + 13 Bagian KAK</div>
            </div>

            <div
              onClick={() => setFilterMonitoringJenis("Konsinyering")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                filterMonitoringJenis === "Konsinyering"
                  ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500"
                  : "bg-white dark:bg-slate-900 border-[var(--border)] hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Konsinyering</span>
                <span className="p-2 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                  <Users2 className="h-4 w-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-2">
                {totalKonsinyeringCount} <span className="text-xs font-normal text-[var(--text-muted)]">Paket</span>
              </div>
              <div className="text-[0.68rem] text-[var(--text-muted)] mt-1">HPS Meeting + 9 Bagian KAK</div>
            </div>
          </div>

          {/* Tabel Monitoring Seluruh Item */}
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div>
                <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[var(--primary)]" />
                  <span>Daftar Monitoring Item Paket KAK Pengadaan ({filteredPaketList.length} dari {totalAllCount} item)</span>
                </h2>
                <p className="text-[0.72rem] text-[var(--text-muted)] mt-0.5">
                  Setiap item dapat diedit, disalin isiannya ke item baru/form aktif, atau dihapus secara satuan maupun keseluruhan.
                </p>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[var(--text-muted)] font-semibold flex items-center gap-1 mr-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span>Filter:</span>
                </span>
                {["ALL", "Pengadaan Barang", "Pengadaan Jasa", "Konsinyering"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterMonitoringJenis(f)}
                    className={`px-2.5 py-1 rounded-lg text-[0.72rem] font-semibold transition-all cursor-pointer ${
                      filterMonitoringJenis === f
                        ? "bg-[var(--primary)] text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] hover:bg-slate-200"
                    }`}
                  >
                    {f === "ALL" ? "Semua" : f.replace("Pengadaan ", "")}
                  </button>
                ))}
              </div>
            </div>

            {filteredPaketList.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="p-3 w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[var(--text-muted)]">
                  <Package className="h-6 w-6" />
                </div>
                <div className="text-xs font-semibold text-[var(--text-muted)]">
                  Belum ada item paket pengadaan yang diinput untuk filter ini.
                </div>
                <button
                  onClick={() => {
                    resetFormToNew("Konsinyering");
                    setCurrentMainView("form");
                  }}
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Mulai Input Paket Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-[var(--border)] text-center">
                      <th className="p-2.5 border-r border-[var(--border)] w-12">No.</th>
                      <th className="p-2.5 border-r border-[var(--border)] w-36 text-left">Jenis Pengadaan</th>
                      <th className="p-2.5 border-r border-[var(--border)] min-w-[220px] text-left">Nama Paket / Jenis Pekerjaan</th>
                      <th className="p-2.5 border-r border-[var(--border)] min-w-[140px] text-left">Nomor HPS / RUP</th>
                      <th className="p-2.5 border-r border-[var(--border)] min-w-[140px] text-right">Total Anggaran (Rp)</th>
                      <th className="p-2.5 border-r border-[var(--border)] w-32 text-center">Terakhir Diperbarui</th>
                      <th className="p-2.5 w-44 text-center">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredPaketList.map((item, idx) => {
                      const title =
                        item.jenis === "Pengadaan Barang"
                          ? item.hpsJenisPekerjaan
                          : item.jenis === "Pengadaan Jasa"
                          ? item.hpsJasaJenisPekerjaan || "Pengadaan Jasa"
                          : item.hpsKonsinyeringJenisPekerjaan || "Konsinyering";
                      const refNo =
                        item.jenis === "Pengadaan Barang"
                          ? item.hpsNomor
                          : item.jenis === "Pengadaan Jasa"
                          ? item.hpsJasaNomor || "-"
                          : item.hpsKonsinyeringNomor || "-";
                      const rupNo =
                        item.jenis === "Pengadaan Barang"
                          ? item.hpsNomorRup
                          : item.jenis === "Pengadaan Jasa"
                          ? item.hpsJasaRup
                          : item.hpsKonsinyeringRup;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="p-3 text-center font-mono border-r border-[var(--border)]">{idx + 1}</td>
                          <td className="p-3 border-r border-[var(--border)]">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.68rem] font-bold ${
                                item.jenis === "Pengadaan Barang"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                                  : item.jenis === "Pengadaan Jasa"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                                  : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200"
                              }`}
                            >
                              {item.jenis}
                            </span>
                          </td>
                          <td className="p-3 border-r border-[var(--border)]">
                            <div className="font-bold text-[var(--text)] line-clamp-2">{title || "Tanpa Judul"}</div>
                            <div className="text-[0.68rem] text-[var(--text-muted)] mt-0.5 line-clamp-1">
                              {item.jenis === "Pengadaan Barang"
                                ? `${item.hpsItems?.length || 0} item HPS | ${item.barangLokasiPekerjaan || "-"}`
                                : item.jenis === "Pengadaan Jasa"
                                ? `${item.hpsJasaPersonilItems?.length || 0} Personil | 13 Bagian KAK Lengkap`
                                : `${item.hpsKonsinyeringItems?.length || 0} Rincian Paket Meeting | 9 Bagian KAK`}
                            </div>
                          </td>
                          <td className="p-3 border-r border-[var(--border)] font-mono text-[0.72rem]">
                            <div>{refNo || "-"}</div>
                            {rupNo && <div className="text-[0.65rem] text-[var(--text-muted)]">RUP: {rupNo}</div>}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-[var(--primary)] border-r border-[var(--border)]">
                            Rp{item.totalAnggaran?.toLocaleString("id-ID") || 0}
                          </td>
                          <td className="p-3 text-center text-[0.68rem] text-[var(--text-muted)] border-r border-[var(--border)]">
                            {new Date(item.updatedAt || item.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Cetak Item */}
                              <button
                                onClick={() => handlePrintItem(item)}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer transition-colors"
                                title="Cetak Dokumen KAK & HPS Paket Ini"
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </button>

                              {/* Edit Item */}
                              <button
                                onClick={() => handleEditItem(item)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 cursor-pointer transition-colors"
                                title="Edit Item Ini"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>

                              {/* Salin Isian sebagai Item Baru */}
                              <button
                                onClick={() => handleCopyItemAsNew(item)}
                                className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 cursor-pointer transition-colors"
                                title="Duplikasi Isian Sebagai Item Baru"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>

                              {/* Hapus Item */}
                              <button
                                onClick={() => handleDeleteOneItem(item.id)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-300 cursor-pointer transition-colors"
                                title="Hapus Item Ini"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 font-bold border-t border-[var(--border)] text-xs">
                      <td colSpan={4} className="p-3 text-right border-r border-[var(--border)]">
                        Total Anggaran Seluruh Item Terfilter:
                      </td>
                      <td className="p-3 text-right font-mono text-sm text-[var(--primary)] font-black border-r border-[var(--border)]">
                        Rp
                        {filteredPaketList
                          .reduce((sum, p) => sum + (p.totalAnggaran || 0), 0)
                          .toLocaleString("id-ID")}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── VIEW 2: FORM INPUT & EDIT DOKUMEN KAK PENGADAAN (MULTI-ITEM)     ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {currentMainView === "form" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Baris Status Sedang Edit vs Input Baru + Fitur Copy Isian Antar Item */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--border)] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-[var(--primary)]">
                <Edit className="h-4 w-4" />
              </span>
              <div>
                <div className="font-bold text-[var(--text)] text-sm flex items-center gap-2">
                  <span>{activeEditingId ? "Mode Edit Item:" : "Mode Input Paket Baru:"}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">
                    {activeEditingId ? `ID #${activeEditingId.slice(-6)}` : "Item Baru"}
                  </span>
                </div>
                <div className="text-[0.68rem] text-[var(--text-muted)] mt-0.5">
                  {activeEditingId
                    ? "Perubahan yang Anda simpan akan memperbarui data item ini pada daftar monitoring."
                    : "Item ini akan ditambahkan ke daftar paket pengadaan ketika Anda mengklik tombol simpan."}
                </div>
              </div>
            </div>

            {/* Dropdown / Tombol Copy Isian dari Item Lain */}
            {paketList.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[var(--text-muted)] font-semibold shrink-0 flex items-center gap-1">
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin isian dari:</span>
                </span>
                <select
                  onChange={(e) => {
                    const selId = e.target.value;
                    if (selId) {
                      const found = paketList.find((p) => p.id === selId);
                      if (found) handleCopyFillToCurrentForm(found);
                      e.target.value = "";
                    }
                  }}
                  defaultValue=""
                  className="px-3 py-1.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold max-w-[260px] truncate cursor-pointer"
                >
                  <option value="" disabled>
                    Pilih Item Tersimpan...
                  </option>
                  {paketList.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.jenis}] {p.hpsJenisPekerjaan || p.hpsJasaJenisPekerjaan || p.hpsKonsinyeringJenisPekerjaan || p.id}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => resetFormToNew(selectedJenis)}
                  className="px-3 py-1.5 border border-[var(--border)] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold cursor-pointer shrink-0"
                >
                  Reset Kosong
                </button>
              </div>
            )}
          </div>

          {/* ── Tab Selector 3 Pilihan Pengadaan (Barang, Jasa, Konsinyering) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                setSelectedJenis("Pengadaan Barang");
                if (!activeEditingId) resetFormToNew("Pengadaan Barang");
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedJenis === "Pengadaan Barang"
                  ? "bg-white dark:bg-slate-900 border-[var(--primary)] ring-2 ring-[var(--primary)] shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800/50 border-[var(--border)] hover:bg-white dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    selectedJenis === "Pengadaan Barang" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text)]">Pengadaan Barang</div>
                  <div className="text-[0.68rem] text-[var(--text-muted)] mt-0.5">
                    Formulir HPS + 5 Bagian KAK Pengadaan Barang
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedJenis("Pengadaan Jasa");
                if (!activeEditingId) resetFormToNew("Pengadaan Jasa");
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedJenis === "Pengadaan Jasa"
                  ? "bg-white dark:bg-slate-900 border-[var(--primary)] ring-2 ring-[var(--primary)] shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800/50 border-[var(--border)] hover:bg-white dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    selectedJenis === "Pengadaan Jasa" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text)]">Pengadaan Jasa</div>
                  <div className="text-[0.68rem] text-[var(--text-muted)] mt-0.5">
                    Formulir HPS Personil + 13 Bagian KAK Jasa
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedJenis("Konsinyering");
                if (!activeEditingId) resetFormToNew("Konsinyering");
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedJenis === "Konsinyering"
                  ? "bg-white dark:bg-slate-900 border-[var(--primary)] ring-2 ring-[var(--primary)] shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800/50 border-[var(--border)] hover:bg-white dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    selectedJenis === "Konsinyering" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  <Users2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text)]">Konsinyering</div>
                  <div className="text-[0.68rem] text-[var(--text-muted)] mt-0.5">
                    Formulir HPS Meeting + 9 Bagian KAK Konsinyering
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* ── TAMPILAN 1: PENGADAAN BARANG (HPS + 5 BAGIAN KAK LENGKAP)       ── */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {selectedJenis === "Pengadaan Barang" && (
            <div className="space-y-8">
              {/* BOX 1: FORM INPUT HARGA PERKIRAAN SENDIRI (HPS) BARANG */}
              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="text-center pb-4 border-b border-[var(--border)]">
                  <h2 className="text-base sm:text-lg font-black tracking-wide text-[var(--text)] uppercase">
                    HARGA PERKIRAAN SENDIRI (HPS)
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xs font-bold text-[var(--text)]">Nomor:</span>
                    <input
                      type="text"
                      value={hpsNomor}
                      onChange={(e) => setHpsNomor(e.target.value)}
                      className="font-mono text-xs font-bold px-2 py-0.5 border border-[var(--border)] rounded bg-slate-50 dark:bg-slate-800 text-center min-w-[280px]"
                    />
                  </div>
                </div>

                {/* Header Field Dokumen HPS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0">Hari / Tanggal :</span>
                    <input
                      type="text"
                      value={hpsHariTanggal}
                      onChange={(e) => setHpsHariTanggal(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0">Tempat :</span>
                    <input
                      type="text"
                      value={hpsTempat}
                      onChange={(e) => setHpsTempat(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 md:col-span-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0 mt-1">Jenis Pekerjaan :</span>
                    <input
                      type="text"
                      value={hpsJenisPekerjaan}
                      onChange={(e) => setHpsJenisPekerjaan(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 md:col-span-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0 mt-1">Kode Akun :</span>
                    <textarea
                      rows={2}
                      value={hpsKodeAkun}
                      onChange={(e) => setHpsKodeAkun(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0">Nomor RUP :</span>
                    <input
                      type="text"
                      value={hpsNomorRup}
                      onChange={(e) => setHpsNomorRup(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Tabel HPS Format Resmi */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text)] flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-[var(--primary)]" />
                      <span>Tabel Kalkulasi Rincian Harga Perkiraan Sendiri:</span>
                    </span>
                    <button
                      onClick={handleAddHpsItem}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[var(--text)] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Baris Pekerjaan</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-black/30 dark:border-slate-700 rounded-lg">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-[#bfe6c3] dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 font-bold border-b border-black/30 dark:border-slate-700 text-center">
                          <th className="p-2 border-r border-black/30 dark:border-slate-700 w-12">No.</th>
                          <th className="p-2 border-r border-black/30 dark:border-slate-700 min-w-[220px]">Pekerjaan</th>
                          <th className="p-2 border-r border-black/30 dark:border-slate-700 w-24">Kuantitas</th>
                          <th className="p-2 border-r border-black/30 dark:border-slate-700 w-24">Satuan</th>
                          <th className="p-2 border-r border-black/30 dark:border-slate-700 w-44">Harga Satuan (Rp)</th>
                          <th className="p-2 border-r border-black/30 dark:border-slate-700 w-48">Harga Total (Rp)</th>
                          <th className="p-2 w-12 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/20 dark:divide-slate-800">
                        {hpsItems.map((it, idx) => (
                          <tr key={it.id} className="hover:bg-slate-50/50">
                            <td className="p-2 text-center font-mono border-r border-black/20 dark:border-slate-800">
                              {idx + 1}.
                            </td>
                            <td className="p-2 border-r border-black/20 dark:border-slate-800">
                              <input
                                type="text"
                                value={it.pekerjaan}
                                onChange={(e) => handleUpdateHpsItem(it.id, "pekerjaan", e.target.value)}
                                className="w-full px-2 py-1 bg-transparent border-0 font-medium text-xs focus:ring-1 focus:ring-[var(--primary)] rounded"
                              />
                            </td>
                            <td className="p-2 text-center border-r border-black/20 dark:border-slate-800">
                              <input
                                type="number"
                                value={it.kuantitas}
                                onChange={(e) => handleUpdateHpsItem(it.id, "kuantitas", Number(e.target.value))}
                                className="w-16 px-1 py-1 text-center font-mono font-bold bg-transparent border-0 focus:ring-1 focus:ring-[var(--primary)] rounded text-xs"
                              />
                            </td>
                            <td className="p-2 text-center border-r border-black/20 dark:border-slate-800">
                              <input
                                type="text"
                                value={it.satuan}
                                onChange={(e) => handleUpdateHpsItem(it.id, "satuan", e.target.value)}
                                className="w-16 px-1 py-1 text-center bg-transparent border-0 focus:ring-1 focus:ring-[var(--primary)] rounded text-xs"
                              />
                            </td>
                            <td className="p-2 text-right border-r border-black/20 dark:border-slate-800">
                              <input
                                type="number"
                                step="any"
                                value={it.hargaSatuan}
                                onChange={(e) => handleUpdateHpsItem(it.id, "hargaSatuan", Number(e.target.value))}
                                className="w-full px-2 py-1 text-right font-mono font-bold bg-transparent border-0 focus:ring-1 focus:ring-[var(--primary)] rounded text-xs"
                              />
                            </td>
                            <td className="p-2 text-right font-mono font-bold border-r border-black/20 dark:border-slate-800">
                              Rp{formatRupiahDecimal(it.hargaTotal)}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleDeleteHpsItem(it.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                title="Hapus baris"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* Rincian Bawah Tabel */}
                        <tr className="border-t border-black/40 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 font-bold text-xs">
                          <td colSpan={4} rowSpan={5} className="border-r border-black/30 dark:border-slate-700 p-3 align-top bg-white dark:bg-slate-900">
                            <div className="text-[0.72rem] text-[var(--text-muted)] italic leading-relaxed">
                              * Kalkulasi Sub Total, DPP Nilai Lain (rasio 11/12), PPN 12%, Grand Total, dan Pembulatan otomatis terhitung berdasarkan nilai Kuantitas dan Harga Satuan.
                            </div>
                          </td>
                          <td className="p-2 border-r border-black/30 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200">
                            Sub Total
                          </td>
                          <td className="p-2 text-right font-mono font-bold border-r border-black/30 dark:border-slate-700">
                            Rp{formatRupiahDecimal(hpsSubTotal)}
                          </td>
                          <td></td>
                        </tr>

                        <tr className="border-t border-black/20 dark:border-slate-800 font-bold text-xs">
                          <td className="p-2 border-r border-black/30 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                            DPP Nilai Lain
                          </td>
                          <td className="p-2 text-right font-mono font-bold border-r border-black/30 dark:border-slate-700">
                            Rp{formatRupiahDecimal(hpsDppNilaiLain)}
                          </td>
                          <td></td>
                        </tr>

                        <tr className="border-t border-black/20 dark:border-slate-800 font-bold text-xs">
                          <td className="p-2 border-r border-black/30 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                            PPN 12%
                          </td>
                          <td className="p-2 text-right font-mono font-bold border-r border-black/30 dark:border-slate-700">
                            Rp{formatRupiahDecimal(hpsPpn12)}
                          </td>
                          <td></td>
                        </tr>

                        <tr className="border-t border-black/20 dark:border-slate-800 font-bold text-xs bg-slate-100/60 dark:bg-slate-800/60">
                          <td className="p-2 border-r border-black/30 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                            Grand Total
                          </td>
                          <td className="p-2 text-right font-mono font-bold border-r border-black/30 dark:border-slate-700">
                            Rp{formatRupiahDecimal(hpsGrandTotal)}
                          </td>
                          <td></td>
                        </tr>

                        <tr className="border-t border-black/30 dark:border-slate-700 font-bold text-xs bg-emerald-50/70 dark:bg-emerald-950/40">
                          <td className="p-2 border-r border-black/30 dark:border-slate-700 text-emerald-950 dark:text-emerald-100">
                            Grand Total (Pembulatan)
                          </td>
                          <td className="p-2 text-right font-mono font-black text-emerald-700 dark:text-emerald-400 border-r border-black/30 dark:border-slate-700">
                            Rp{formatRupiahBulat(hpsGrandTotalBulat)},00
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 text-xs space-y-1">
                    <span className="font-semibold text-[var(--text)]">Terbilang:</span>
                    <p className="italic font-serif text-slate-800 dark:text-slate-200 font-semibold text-xs leading-relaxed capitalize bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-[var(--border)]">
                      {hpsTerbilang ? `${hpsTerbilang}` : "Nol Rupiah"}
                    </p>
                  </div>

                  <div className="pt-2 text-xs text-[var(--text)]">
                    <p className="indent-8 leading-relaxed">
                      Demikian dokumen Harga Perkiraan Sendiri ini dibuat untuk digunakan sebagaimana mestinya.
                    </p>
                  </div>
                </div>
              </div>

              {/* BOX 2: FORMULIR KERANGKA ACUAN KERJA (5 BAGIAN) BARANG */}
              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
                <div className="pb-4 border-b border-[var(--border)]">
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text)] flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[var(--primary)]" />
                    <span>KERANGKA ACUAN KERJA (KAK / TOR) PENGADAAN BARANG</span>
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Lengkapi 5 bagian narasi dan spesifikasi teknis Kerangka Acuan Kerja pengadaan barang di bawah ini.
                  </p>
                </div>

                {/* 1. Latar Belakang */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">1</span>
                    <span>Latar Belakang</span>
                  </div>
                  <textarea
                    rows={4}
                    value={barangLatarBelakang}
                    onChange={(e) => setBarangLatarBelakang(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                  />
                </div>

                {/* 2. Maksud dan Tujuan */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">2</span>
                    <span>Maksud dan Tujuan</span>
                  </div>
                  <textarea
                    rows={4}
                    value={barangMaksudTujuan}
                    onChange={(e) => setBarangMaksudTujuan(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                  />
                </div>

                {/* 3. Target / Sasaran */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">3</span>
                    <span>Target / Sasaran</span>
                  </div>
                  <textarea
                    rows={3}
                    value={barangTargetSasaran}
                    onChange={(e) => setBarangTargetSasaran(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                  />
                </div>

                {/* 4. Sumber Dana dan Perkiraan Biaya */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">4</span>
                    <span>Sumber Dana dan Perkiraan Biaya</span>
                  </div>
                  <textarea
                    rows={3}
                    value={barangSumberDana}
                    onChange={(e) => setBarangSumberDana(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                  />
                </div>

                {/* 5. Spesifikasi Teknis */}
                <div className="space-y-6 pt-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)] pb-2 border-b border-[var(--border)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">5</span>
                    <span>Spesifikasi Teknis</span>
                  </div>

                  {/* 5.a Mutu/Kualitas dan Jumlah */}
                  <div className="space-y-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-[var(--text)]">a. Mutu / Kualitas dan Jumlah</div>
                      <button
                        onClick={handleAddMutuItem}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[var(--text)] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Tambah Baris Barang</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-[var(--border)] text-center">
                            <th className="p-2.5 border-r border-[var(--border)] w-10">No.</th>
                            <th className="p-2.5 border-r border-[var(--border)] min-w-[200px] text-left">Nama Barang</th>
                            <th className="p-2.5 border-r border-[var(--border)] min-w-[320px] text-left">Spesifikasi Teknis</th>
                            <th className="p-2.5 border-r border-[var(--border)] w-24">Jumlah</th>
                            <th className="p-2.5 w-12 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {barangMutuItems.map((mb, idx) => (
                            <tr key={mb.id} className="hover:bg-slate-50/50">
                              <td className="p-2 text-center font-mono border-r border-[var(--border)]">{idx + 1}</td>
                              <td className="p-2 border-r border-[var(--border)]">
                                <input
                                  type="text"
                                  value={mb.namaBarang}
                                  onChange={(e) => handleUpdateMutuItem(mb.id, "namaBarang", e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-[var(--border)] rounded-lg text-xs font-semibold"
                                />
                              </td>
                              <td className="p-2 border-r border-[var(--border)]">
                                <textarea
                                  rows={3}
                                  value={mb.spesifikasiTeknis}
                                  onChange={(e) => handleUpdateMutuItem(mb.id, "spesifikasiTeknis", e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-[var(--border)] rounded-lg text-xs leading-relaxed"
                                />
                              </td>
                              <td className="p-2 text-center border-r border-[var(--border)]">
                                <input
                                  type="number"
                                  value={mb.jumlah}
                                  onChange={(e) => handleUpdateMutuItem(mb.id, "jumlah", Number(e.target.value))}
                                  className="w-16 px-1.5 py-1.5 text-center font-mono font-bold bg-white dark:bg-slate-800 border border-[var(--border)] rounded-lg text-xs"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  onClick={() => handleDeleteMutuItem(mb.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
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
                  </div>

                  {/* 5.b Waktu */}
                  <div className="space-y-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">
                    <div className="font-bold text-xs text-[var(--text)]">b. Waktu</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[var(--primary)]" />
                          <span>1) Jangka Pelaksanaan Pekerjaan:</span>
                        </label>
                        <input
                          type="text"
                          value={barangJangkaWaktu}
                          onChange={(e) => setBarangJangkaWaktu(e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[var(--primary)]" />
                          <span>2) Lokasi Pekerjaan:</span>
                        </label>
                        <input
                          type="text"
                          value={barangLokasiPekerjaan}
                          onChange={(e) => setBarangLokasiPekerjaan(e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5.c Pelayanan */}
                  <div className="space-y-2 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">
                    <div className="font-bold text-xs text-[var(--text)] flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-[var(--primary)]" />
                      <span>c. Pelayanan</span>
                    </div>
                    <textarea
                      rows={4}
                      value={barangPelayanan}
                      onChange={(e) => setBarangPelayanan(e.target.value)}
                      className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <button
                    onClick={() => setCurrentMainView("monitoring")}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  >
                    Kembali ke Tab Monitoring
                  </button>

                  <button
                    onClick={handleSaveCurrentPaket}
                    className="px-6 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{activeEditingId ? "Simpan Perubahan Item" : "Simpan Sebagai Item Baru"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* ── TAMPILAN 2: PENGADAAN JASA (HPS PERSONIL + 13 BAGIAN KAK LENGKAP) ── */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {selectedJenis === "Pengadaan Jasa" && (
            <div className="space-y-8">
              {/* DOKUMEN HPS PENGADAAN JASA */}
              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="text-center pb-4 border-b border-[var(--border)]">
                  <h2 className="text-base sm:text-lg font-black tracking-wide text-[var(--text)] uppercase">
                    HARGA PERKIRAAN SENDIRI (HPS)
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xs font-bold text-[var(--text)]">Nomor:</span>
                    <input
                      type="text"
                      value={hpsJasaNomor}
                      onChange={(e) => setHpsJasaNomor(e.target.value)}
                      className="font-mono text-xs font-bold px-2 py-0.5 border border-[var(--border)] rounded bg-slate-50 dark:bg-slate-800 text-center min-w-[280px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0">Hari / tanggal :</span>
                    <input
                      type="text"
                      value={hpsJasaHariTanggal}
                      onChange={(e) => setHpsJasaHariTanggal(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0">Tempat :</span>
                    <input
                      type="text"
                      value={hpsJasaTempat}
                      onChange={(e) => setHpsJasaTempat(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 md:col-span-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0 mt-1">Jenis Pekerjaan :</span>
                    <input
                      type="text"
                      value={hpsJasaJenisPekerjaan}
                      onChange={(e) => setHpsJasaJenisPekerjaan(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 md:col-span-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0 mt-1">Kode :</span>
                    <textarea
                      rows={2}
                      value={hpsJasaKodeAkun}
                      onChange={(e) => setHpsJasaKodeAkun(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0">RUP :</span>
                    <input
                      type="text"
                      value={hpsJasaRup}
                      onChange={(e) => setHpsJasaRup(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text)] flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-[var(--primary)]" />
                      <span>Tabel Rincian Biaya Personil &amp; Pajak (HPS Jasa):</span>
                    </span>
                    <button
                      onClick={handleAddHpsJasaPersonil}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[var(--text)] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Baris Personil</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-black/30 dark:border-slate-700 rounded-lg">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-[#8ebbdb] dark:bg-sky-950/70 text-slate-900 dark:text-sky-100 font-bold border-b border-black/30 dark:border-slate-700 text-center">
                          <th className="p-2.5 border-r border-black/30 dark:border-slate-700 w-12">No.</th>
                          <th className="p-2.5 border-r border-black/30 dark:border-slate-700 min-w-[220px]">Jenis Personil</th>
                          <th className="p-2.5 border-r border-black/30 dark:border-slate-700 w-28">Jumlah (Orang)</th>
                          <th className="p-2.5 border-r border-black/30 dark:border-slate-700 w-28">Waktu (Bulan)</th>
                          <th className="p-2.5 border-r border-black/30 dark:border-slate-700 w-44">Harga Satuan Orang Bulan (Rp)</th>
                          <th className="p-2.5 border-r border-black/30 dark:border-slate-700 w-48">Jumlah Biaya (Rp)</th>
                          <th className="p-2.5 w-12 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/20 dark:divide-slate-800">
                        {hpsJasaPersonilItems.map((jp, idx) => (
                          <tr key={jp.id} className="hover:bg-slate-50/50">
                            <td className="p-2 text-center font-mono border-r border-black/20 dark:border-slate-800">
                              {idx + 1}
                            </td>
                            <td className="p-2 border-r border-black/20 dark:border-slate-800">
                              <input
                                type="text"
                                value={jp.jenisPersonil}
                                onChange={(e) => handleUpdateHpsJasaPersonil(jp.id, "jenisPersonil", e.target.value)}
                                className="w-full px-2 py-1 bg-transparent border-0 font-bold text-xs uppercase focus:ring-1 focus:ring-[var(--primary)] rounded"
                              />
                            </td>
                            <td className="p-2 text-center border-r border-black/20 dark:border-slate-800">
                              <input
                                type="number"
                                value={jp.jumlahOrang}
                                onChange={(e) => handleUpdateHpsJasaPersonil(jp.id, "jumlahOrang", Number(e.target.value))}
                                className="w-16 px-1 py-1 text-center font-mono font-bold bg-transparent border-0 focus:ring-1 focus:ring-[var(--primary)] rounded text-xs"
                              />
                            </td>
                            <td className="p-2 text-center border-r border-black/20 dark:border-slate-800">
                              <input
                                type="number"
                                step="0.5"
                                value={jp.waktuBulan}
                                onChange={(e) => handleUpdateHpsJasaPersonil(jp.id, "waktuBulan", Number(e.target.value))}
                                className="w-16 px-1 py-1 text-center font-mono bg-transparent border-0 focus:ring-1 focus:ring-[var(--primary)] rounded text-xs"
                              />
                            </td>
                            <td className="p-2 text-right border-r border-black/20 dark:border-slate-800">
                              <input
                                type="number"
                                value={jp.hargaSatuanOB}
                                onChange={(e) => handleUpdateHpsJasaPersonil(jp.id, "hargaSatuanOB", Number(e.target.value))}
                                className="w-full px-2 py-1 text-right font-mono font-bold bg-transparent border-0 focus:ring-1 focus:ring-[var(--primary)] rounded text-xs"
                              />
                            </td>
                            <td className="p-2 text-right font-mono font-bold border-r border-black/20 dark:border-slate-800">
                              {formatRupiahBulat(jp.jumlahBiaya)}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleDeleteHpsJasaPersonil(jp.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                title="Hapus baris"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        <tr className="border-t border-black/30 dark:border-slate-700 bg-[#8ebbdb]/30 dark:bg-sky-950/40 font-bold text-xs">
                          <td className="border-r border-black/30 dark:border-slate-700"></td>
                          <td colSpan={4} className="p-2.5 border-r border-black/30 dark:border-slate-700 font-bold uppercase text-slate-900 dark:text-slate-100">
                            TOTAL BIAYA PERSONIL
                          </td>
                          <td className="p-2.5 text-right font-mono font-black text-slate-900 dark:text-slate-100 border-r border-black/30 dark:border-slate-700">
                            {formatRupiahBulat(hpsJasaTotalBiayaPersonil)}
                          </td>
                          <td></td>
                        </tr>

                        <tr className="border-t border-black/20 dark:border-slate-800 bg-[#8ebbdb]/30 dark:bg-sky-950/40 font-bold text-xs">
                          <td className="border-r border-black/30 dark:border-slate-700"></td>
                          <td colSpan={4} className="p-2.5 border-r border-black/30 dark:border-slate-700 font-bold uppercase text-slate-900 dark:text-slate-100">
                            PPN
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100 border-r border-black/30 dark:border-slate-700">
                            {formatRupiahBulat(hpsJasaPpn)}
                          </td>
                          <td></td>
                        </tr>

                        <tr className="border-t border-black/30 dark:border-slate-700 bg-[#8ebbdb]/60 dark:bg-sky-950/80 font-bold text-xs">
                          <td className="border-r border-black/30 dark:border-slate-700"></td>
                          <td colSpan={4} className="p-2.5 border-r border-black/30 dark:border-slate-700 font-black uppercase text-slate-950 dark:text-white">
                            TOTAL BIAYA PERSONIL + PPN
                          </td>
                          <td className="p-2.5 text-right font-mono font-black text-blue-900 dark:text-sky-300 text-sm border-r border-black/30 dark:border-slate-700">
                            {formatRupiahBulat(hpsJasaGrandTotalBulat)}
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 text-xs space-y-1">
                    <span className="font-semibold text-[var(--text)]">Terbilang:</span>
                    <p className="italic font-serif text-slate-900 dark:text-slate-100 font-bold text-xs leading-relaxed capitalize bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-[var(--border)]">
                      {hpsJasaTerbilang ? `${hpsJasaTerbilang}` : "Nol Rupiah"}
                    </p>
                  </div>
                </div>
              </div>

              {/* FORMULIR KAK PENGADAAN JASA (13 BAGIAN) */}
              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
                <div className="pb-4 border-b border-[var(--border)]">
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text)] flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[var(--primary)]" />
                    <span>KERANGKA ACUAN KERJA (KAK / TOR) PENGADAAN JASA</span>
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Lengkapi 13 bagian Kerangka Acuan Kerja (KAK / TOR) Pengadaan Jasa Konsultansi berikut ini.
                  </p>
                </div>

                {/* 1. Latar Belakang */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">1</span>
                    <span>Latar Belakang</span>
                  </div>
                  <textarea
                    rows={4}
                    value={jasaLatarBelakang}
                    onChange={(e) => setJasaLatarBelakang(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                  />
                </div>

                {/* 2. Dasar Pelaksanaan */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">2</span>
                    <span>Dasar Pelaksanaan</span>
                  </div>
                  <textarea
                    rows={4}
                    value={jasaDasarPelaksanaan}
                    onChange={(e) => setJasaDasarPelaksanaan(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                  />
                </div>

                {/* 3. Maksud dan Tujuan */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">3</span>
                    <span>Maksud dan Tujuan</span>
                  </div>
                  <textarea
                    rows={4}
                    value={jasaMaksudTujuan}
                    onChange={(e) => setJasaMaksudTujuan(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                  />
                </div>

                {/* 4. Lokasi Kegiatan */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">4</span>
                    <span>Lokasi Kegiatan</span>
                  </div>
                  <input
                    type="text"
                    value={jasaLokasiKegiatan}
                    onChange={(e) => setJasaLokasiKegiatan(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  />
                </div>

                {/* 5. Ruang Lingkup, Pendekatan dan Metodologi */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)] pb-2 border-b border-[var(--border)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">5</span>
                    <span>Ruang Lingkup, Pendekatan dan Metodologi</span>
                  </div>
                  <div className="space-y-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-xs text-[var(--text)]">a. Ruang Lingkup Pekerjaan:</label>
                      <textarea
                        rows={3}
                        value={jasaRuangLingkup}
                        onChange={(e) => setJasaRuangLingkup(e.target.value)}
                        className="w-full p-3 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-xs text-[var(--text)]">b. Pendekatan Pelaksanaan:</label>
                      <textarea
                        rows={3}
                        value={jasaPendekatan}
                        onChange={(e) => setJasaPendekatan(e.target.value)}
                        className="w-full p-3 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-xs text-[var(--text)]">c. Metodologi Kerja:</label>
                      <textarea
                        rows={3}
                        value={jasaMetodologi}
                        onChange={(e) => setJasaMetodologi(e.target.value)}
                        className="w-full p-3 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Tahapan Pelaksanaan */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">6</span>
                      <span>Tahapan Pelaksanaan</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[var(--text-muted)] font-semibold">Tentukan Jumlah Tahapan:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSetJumlahTahapanJasa(jasaTahapanList.length - 1)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-bold rounded cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={jasaTahapanList.length}
                          onChange={(e) => handleSetJumlahTahapanJasa(Number(e.target.value))}
                          className="w-14 text-center font-bold px-2 py-1 border border-[var(--border)] rounded bg-white dark:bg-slate-800"
                        />
                        <button
                          onClick={() => handleSetJumlahTahapanJasa(jasaTahapanList.length + 1)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-bold rounded cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">
                    <div className="grid grid-cols-1 gap-3">
                      {jasaTahapanList.map((th, index) => (
                        <div key={th.id} className="p-3.5 rounded-xl border border-[var(--border)] bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                          <span className="font-bold text-xs text-[var(--primary)] flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 font-mono text-[0.7rem]">
                              Tahap {index + 1}
                            </span>
                            <span>Judul / Nama Tahapan:</span>
                          </span>
                          <input
                            type="text"
                            value={th.namaTahapan}
                            onChange={(e) => handleUpdateTahapanJasa(th.id, "namaTahapan", e.target.value)}
                            className="w-full px-3 py-1.5 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 text-xs font-semibold"
                          />
                          <div className="space-y-1">
                            <label className="text-[0.7rem] font-semibold text-[var(--text-muted)]">Uraian Pelaksanaan:</label>
                            <textarea
                              rows={2}
                              value={th.uraianTahapan}
                              onChange={(e) => handleUpdateTahapanJasa(th.id, "uraianTahapan", e.target.value)}
                              className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 text-xs leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 7. Keluaran yang Diinginkan */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">7</span>
                    <span>Keluaran yang Diinginkan</span>
                  </div>
                  <textarea
                    rows={4}
                    value={jasaKeluaranDiinginkan}
                    onChange={(e) => setJasaKeluaranDiinginkan(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                  />
                </div>

                {/* 8. Sumber Pendanaan */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">8</span>
                    <span>Sumber Pendanaan</span>
                  </div>
                  <textarea
                    rows={3}
                    value={jasaSumberPendanaan}
                    onChange={(e) => setJasaSumberPendanaan(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                  />
                </div>

                {/* 9. Jangka Waktu Pelaksanaan dan Jadwal */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)] pb-2 border-b border-[var(--border)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">9</span>
                    <span>Jangka Waktu Pelaksanaan dan Jadwal (Milestone)</span>
                  </div>
                  <div className="space-y-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">
                    <input
                      type="text"
                      value={jasaJangkaWaktu}
                      onChange={(e) => setJasaJangkaWaktu(e.target.value)}
                      className="w-full px-3.5 py-2 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    />

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text)]">Rincian Target Pencapaian Keluaran (Milestone):</span>
                        <button
                          onClick={handleAddMilestoneJasa}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[var(--text)] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Tambah Baris Milestone</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-[var(--border)] text-center">
                              <th className="p-2.5 border-r border-[var(--border)] w-36 text-left">Minggu ke-</th>
                              <th className="p-2.5 border-r border-[var(--border)] min-w-[220px] text-left">Keluaran (Output)</th>
                              <th className="p-2.5 border-r border-[var(--border)] min-w-[320px] text-left">Uraian</th>
                              <th className="p-2.5 w-12 text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)]">
                            {jasaMilestoneList.map((m) => (
                              <tr key={m.id} className="hover:bg-slate-50/50">
                                <td className="p-2 border-r border-[var(--border)]">
                                  <input
                                    type="text"
                                    value={m.mingguKe}
                                    onChange={(e) => handleUpdateMilestoneJasa(m.id, "mingguKe", e.target.value)}
                                    className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-[var(--border)] rounded font-semibold text-xs"
                                  />
                                </td>
                                <td className="p-2 border-r border-[var(--border)]">
                                  <input
                                    type="text"
                                    value={m.output}
                                    onChange={(e) => handleUpdateMilestoneJasa(m.id, "output", e.target.value)}
                                    className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-[var(--border)] rounded font-medium text-xs"
                                  />
                                </td>
                                <td className="p-2 border-r border-[var(--border)]">
                                  <textarea
                                    rows={2}
                                    value={m.uraian}
                                    onChange={(e) => handleUpdateMilestoneJasa(m.id, "uraian", e.target.value)}
                                    className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-[var(--border)] rounded text-xs leading-relaxed"
                                  />
                                </td>
                                <td className="p-2 text-center">
                                  <button
                                    onClick={() => handleDeleteMilestoneJasa(m.id)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 10. Jumlah Tenaga yang Diperlukan */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)] pb-2 border-b border-[var(--border)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">10</span>
                    <span>Jumlah Tenaga yang Diperlukan</span>
                  </div>
                  <div className="space-y-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text)]">Tabel Kebutuhan Personil / Tenaga Kerja:</span>
                      <button
                        onClick={handleAddTenagaJasa}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[var(--text)] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Tambah Tenaga Kerja</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-[var(--border)] text-center">
                            <th className="p-2 border-r border-[var(--border)] w-10">No.</th>
                            <th className="p-2 border-r border-[var(--border)] min-w-[150px] text-left">Posisi</th>
                            <th className="p-2 border-r border-[var(--border)] w-16">Jumlah</th>
                            <th className="p-2 border-r border-[var(--border)] w-20">Waktu</th>
                            <th className="p-2 border-r border-[var(--border)] w-28">Satuan Upah (OB)</th>
                            <th className="p-2 border-r border-[var(--border)] min-w-[220px] text-left">Kualifikasi dan Pengalaman</th>
                            <th className="p-2 border-r border-[var(--border)] min-w-[220px] text-left">Tanggung Jawab Utama</th>
                            <th className="p-2 w-10 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {jasaTenagaList.map((t, idx) => (
                            <tr key={t.id} className="hover:bg-slate-50/50">
                              <td className="p-2 text-center font-mono border-r border-[var(--border)]">{idx + 1}</td>
                              <td className="p-2 border-r border-[var(--border)]">
                                <input
                                  type="text"
                                  value={t.posisi}
                                  onChange={(e) => handleUpdateTenagaJasa(t.id, "posisi", e.target.value)}
                                  className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-[var(--border)] rounded font-semibold text-xs"
                                />
                              </td>
                              <td className="p-2 text-center border-r border-[var(--border)]">
                                <input
                                  type="number"
                                  value={t.jumlah}
                                  onChange={(e) => handleUpdateTenagaJasa(t.id, "jumlah", Number(e.target.value))}
                                  className="w-12 px-1 py-1 text-center font-mono font-bold bg-white dark:bg-slate-800 border border-[var(--border)] rounded text-xs"
                                />
                              </td>
                              <td className="p-2 text-center border-r border-[var(--border)]">
                                <input
                                  type="text"
                                  value={t.waktu}
                                  onChange={(e) => handleUpdateTenagaJasa(t.id, "waktu", e.target.value)}
                                  className="w-16 px-1 py-1 text-center bg-white dark:bg-slate-800 border border-[var(--border)] rounded text-xs"
                                />
                              </td>
                              <td className="p-2 text-right border-r border-[var(--border)]">
                                <input
                                  type="number"
                                  value={t.satuanUpahOB}
                                  onChange={(e) => handleUpdateTenagaJasa(t.id, "satuanUpahOB", Number(e.target.value))}
                                  className="w-full px-2 py-1 text-right font-mono bg-white dark:bg-slate-800 border border-[var(--border)] rounded text-xs"
                                />
                              </td>
                              <td className="p-2 border-r border-[var(--border)]">
                                <textarea
                                  rows={2}
                                  value={t.kualifikasiPengalaman}
                                  onChange={(e) => handleUpdateTenagaJasa(t.id, "kualifikasiPengalaman", e.target.value)}
                                  className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-[var(--border)] rounded text-xs leading-relaxed"
                                />
                              </td>
                              <td className="p-2 border-r border-[var(--border)]">
                                <textarea
                                  rows={2}
                                  value={t.tanggungJawabUtama}
                                  onChange={(e) => handleUpdateTenagaJasa(t.id, "tanggungJawabUtama", e.target.value)}
                                  className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-[var(--border)] rounded text-xs leading-relaxed"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  onClick={() => handleDeleteTenagaJasa(t.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="font-semibold text-xs text-[var(--text)]">Catatan Tambahan Personil:</label>
                      <textarea
                        rows={3}
                        value={jasaCatatanTambahanTenaga}
                        onChange={(e) => setJasaCatatanTambahanTenaga(e.target.value)}
                        className="w-full p-3 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* 11. Hak Kekayaan Intelektual Dan Tanggung Jawab */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)] pb-2 border-b border-[var(--border)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">11</span>
                    <span>Hak Kekayaan Intelektual Dan Tanggung Jawab</span>
                  </div>
                  <div className="space-y-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-xs text-[var(--text)]">a. Hak Kekayaan Intelektual (HKI):</label>
                      <textarea
                        rows={3}
                        value={jasaHakKekayaanIntelektual}
                        onChange={(e) => setJasaHakKekayaanIntelektual(e.target.value)}
                        className="w-full p-3 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-xs text-[var(--text)]">b. Tanggung Jawab Hukum Terhadap Pelanggaran HKI:</label>
                      <textarea
                        rows={3}
                        value={jasaTanggungJawabHki}
                        onChange={(e) => setJasaTanggungJawabHki(e.target.value)}
                        className="w-full p-3 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* 12. Klausul Penyangkalan (Disclaimer) dan Catatan Khusus */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">12</span>
                    <span>Klausul Penyangkalan (Disclaimer) dan Catatan Khusus</span>
                  </div>
                  <textarea
                    rows={4}
                    value={jasaKlausulDisclaimer}
                    onChange={(e) => setJasaKlausulDisclaimer(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                  />
                </div>

                {/* 13. Penutup */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">13</span>
                    <span>Penutup</span>
                  </div>
                  <textarea
                    rows={3}
                    value={jasaPenutup}
                    onChange={(e) => setJasaPenutup(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                  />
                </div>

                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <button
                    onClick={() => setCurrentMainView("monitoring")}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  >
                    Kembali ke Tab Monitoring
                  </button>

                  <button
                    onClick={handleSaveCurrentPaket}
                    className="px-6 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{activeEditingId ? "Simpan Perubahan Item" : "Simpan Sebagai Item Baru"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════════════ */}
          {/* ── TAMPILAN 3: KONSINYERING (HPS PAKET MEETING + 9 BAGIAN KAK LENGKAP)      ── */}
          {/* ═════════════════════════════════════════════════════════════════════════════ */}
          {selectedJenis === "Konsinyering" && (
            <div className="space-y-8">
              {/* ────────────────────────────────────────────────────────── */}
              {/* DOKUMEN HPS KONSINYERING (SESUAI GAMBAR REFERENSI USER)    */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="text-center pb-4 border-b border-[var(--border)]">
                  <h2 className="text-base sm:text-lg font-black tracking-wide text-[var(--text)] uppercase">
                    HARGA PERKIRAAN SENDIRI (HPS)
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xs font-bold text-[var(--text)]">Nomor:</span>
                    <input
                      type="text"
                      value={hpsKonsinyeringNomor}
                      onChange={(e) => setHpsKonsinyeringNomor(e.target.value)}
                      className="font-mono text-xs font-bold px-2 py-0.5 border border-[var(--border)] rounded bg-slate-50 dark:bg-slate-800 text-center min-w-[280px]"
                    />
                  </div>
                </div>

                {/* Metadata Dokumen HPS Konsinyering */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0">Hari, tanggal :</span>
                    <input
                      type="text"
                      value={hpsKonsinyeringHariTanggal}
                      onChange={(e) => setHpsKonsinyeringHariTanggal(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0">Tempat :</span>
                    <input
                      type="text"
                      value={hpsKonsinyeringTempat}
                      onChange={(e) => setHpsKonsinyeringTempat(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 md:col-span-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0 mt-1">Jenis Pekerjaan :</span>
                    <textarea
                      rows={2}
                      value={hpsKonsinyeringJenisPekerjaan}
                      onChange={(e) => setHpsKonsinyeringJenisPekerjaan(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 md:col-span-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0 mt-1">Kode :</span>
                    <textarea
                      rows={2}
                      value={hpsKonsinyeringKodeAkun}
                      onChange={(e) => setHpsKonsinyeringKodeAkun(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="w-36 font-semibold text-[var(--text-muted)] shrink-0">RUP :</span>
                    <input
                      type="text"
                      value={hpsKonsinyeringRup}
                      onChange={(e) => setHpsKonsinyeringRup(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border)] rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Tabel HPS Konsinyering Sesuai Gambar User */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text)] flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-[var(--primary)]" />
                      <span>Tabel Rincian Biaya Paket Meeting (HPS Konsinyering):</span>
                    </span>
                    <button
                      onClick={handleAddHpsKonsinyeringItem}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[var(--text)] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Baris Paket</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-black dark:border-slate-700 rounded-lg">
                    <table className="w-full text-xs text-left border-collapse border border-black dark:border-slate-700">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-black border-b border-black dark:border-slate-700 text-center">
                          <th className="p-2 border-r border-black dark:border-slate-700 w-12" rowSpan={2}>
                            NO
                          </th>
                          <th className="p-2 border-r border-black dark:border-slate-700 min-w-[260px]" rowSpan={2}>
                            URAIAN PEKERJAAN
                          </th>
                          <th className="p-2 border-r border-black dark:border-slate-700 text-center" colSpan={4}>
                            VOLUME
                          </th>
                          <th className="p-2 border-r border-black dark:border-slate-700 w-36 text-center" rowSpan={2}>
                            HARGA SATUAN
                          </th>
                          <th className="p-2 border-r border-black dark:border-slate-700 w-44 text-center" rowSpan={2}>
                            TOTAL
                          </th>
                          <th className="p-2 w-12 text-center" rowSpan={2}>
                            AKSI
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/30 dark:divide-slate-800">
                        {hpsKonsinyeringItems.map((k, idx) => (
                          <tr key={k.id} className="hover:bg-slate-50/50">
                            <td className="p-2 text-center font-mono border-r border-black dark:border-slate-700">
                              {idx + 1}
                            </td>
                            <td className="p-2 border-r border-black dark:border-slate-700 font-semibold">
                              <input
                                type="text"
                                value={k.uraianPekerjaan}
                                onChange={(e) =>
                                  handleUpdateHpsKonsinyeringItem(k.id, "uraianPekerjaan", e.target.value)
                                }
                                className="w-full px-2 py-1 bg-transparent border-0 font-medium text-xs focus:ring-1 focus:ring-[var(--primary)] rounded"
                              />
                            </td>
                            <td className="p-2 text-center border-r border-black dark:border-slate-700 w-14">
                              <input
                                type="number"
                                value={k.volumeHari}
                                onChange={(e) =>
                                  handleUpdateHpsKonsinyeringItem(k.id, "volumeHari", Number(e.target.value))
                                }
                                className="w-12 px-1 py-1 text-center font-mono font-bold bg-transparent border-0 focus:ring-1 focus:ring-[var(--primary)] rounded text-xs"
                              />
                            </td>
                            <td className="p-2 text-center border-r border-black dark:border-slate-700 w-16 text-slate-600 dark:text-slate-300">
                              <input
                                type="text"
                                value={k.satuanHari}
                                onChange={(e) =>
                                  handleUpdateHpsKonsinyeringItem(k.id, "satuanHari", e.target.value)
                                }
                                className="w-14 px-1 py-1 text-center bg-transparent border-0 text-xs"
                              />
                            </td>
                            <td className="p-2 text-center border-r border-black dark:border-slate-700 w-14">
                              <input
                                type="number"
                                value={k.volumePax}
                                onChange={(e) =>
                                  handleUpdateHpsKonsinyeringItem(k.id, "volumePax", Number(e.target.value))
                                }
                                className="w-12 px-1 py-1 text-center font-mono font-bold bg-transparent border-0 focus:ring-1 focus:ring-[var(--primary)] rounded text-xs"
                              />
                            </td>
                            <td className="p-2 text-center border-r border-black dark:border-slate-700 w-16 text-slate-600 dark:text-slate-300">
                              <input
                                type="text"
                                value={k.satuanPax}
                                onChange={(e) =>
                                  handleUpdateHpsKonsinyeringItem(k.id, "satuanPax", e.target.value)
                                }
                                className="w-14 px-1 py-1 text-center bg-transparent border-0 text-xs"
                              />
                            </td>
                            <td className="p-2 text-right border-r border-black dark:border-slate-700 font-mono">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[var(--text-muted)]">Rp</span>
                                <input
                                  type="number"
                                  value={k.hargaSatuan}
                                  onChange={(e) =>
                                    handleUpdateHpsKonsinyeringItem(k.id, "hargaSatuan", Number(e.target.value))
                                  }
                                  className="w-full text-right font-mono font-bold bg-transparent border-0 focus:ring-1 focus:ring-[var(--primary)] rounded text-xs"
                                />
                              </div>
                            </td>
                            <td className="p-2 text-right font-mono font-bold border-r border-black dark:border-slate-700">
                              Rp {formatRupiahBulat(k.totalHarga)}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleDeleteHpsKonsinyeringItem(k.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                title="Hapus baris"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* Baris GRAND TOTAL Sesuai Gambar Referensi */}
                        <tr className="border-t-2 border-black dark:border-slate-700 font-black text-xs bg-slate-50/80 dark:bg-slate-800/60">
                          <td colSpan={6} className="p-2.5 text-center uppercase tracking-wider border-r border-black dark:border-slate-700 font-black">
                            GRAND TOTAL
                          </td>
                          <td colSpan={2} className="p-2.5 text-right font-mono font-black text-slate-950 dark:text-white text-sm border-r border-black dark:border-slate-700">
                            Rp {formatRupiahBulat(hpsKonsinyeringGrandTotalBulat)}
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Terbilang Otomatis HPS Konsinyering */}
                  <div className="pt-2 text-xs space-y-1">
                    <span className="font-semibold text-[var(--text)]">Terbilang:</span>
                    <span className="italic font-serif font-bold text-slate-900 dark:text-slate-100 text-xs ml-2 capitalize">
                      {hpsKonsinyeringTerbilang ? `${hpsKonsinyeringTerbilang}` : "Nol Rupiah"}
                    </span>
                  </div>

                  {/* Keterangan Tambahan HPS Konsinyering (Sesuai Gambar 4 Poin) */}
                  <div className="pt-2 text-xs space-y-1">
                    <span className="font-semibold text-[var(--text)]">Keterangan:</span>
                    <textarea
                      rows={5}
                      value={hpsKonsinyeringKeterangan}
                      onChange={(e) => setHpsKonsinyeringKeterangan(e.target.value)}
                      className="w-full p-3 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* FORMULIR KERANGKA ACUAN KERJA (KAK/TOR) KONSINYERING      */}
              {/* (9 BAGIAN LENGKAP SESUAI INSTRUKSI USER)                  */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
                <div className="pb-4 border-b border-[var(--border)]">
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text)] flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[var(--primary)]" />
                    <span>KERANGKA ACUAN KERJA (KAK / TOR) KONSINYERING / PAKET MEETING</span>
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Lengkapi 9 nomor bagian Kerangka Acuan Kerja (KAK / TOR) Penyelenggaraan Konsinyering / FGD / Rapat Paket Meeting di bawah ini.
                  </p>
                </div>

                {/* 1. Latar Belakang (1.a Dasar Hukum & 1.b Gambaran Umum) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)] pb-1 border-b border-[var(--border)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">1</span>
                    <span>Latar Belakang</span>
                  </div>

                  <div className="space-y-4 pl-4 border-l-2 border-purple-200 dark:border-purple-900">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-xs text-[var(--text)] flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-purple-600" />
                        <span>1.a Dasar Hukum:</span>
                      </label>
                      <textarea
                        rows={4}
                        value={konsinyeringDasarHukum}
                        onChange={(e) => setKonsinyeringDasarHukum(e.target.value)}
                        className="w-full p-3 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                        placeholder="Sebutkan undang-undang, PP, Perpres, Permenkeu SBM, dan DIPA terkait..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-xs text-[var(--text)] flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-purple-600" />
                        <span>1.b Gambaran Umum:</span>
                      </label>
                      <textarea
                        rows={4}
                        value={konsinyeringGambaranUmum}
                        onChange={(e) => setKonsinyeringGambaranUmum(e.target.value)}
                        className="w-full p-3 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                        placeholder="Deskripsikan urgensi rapat konsinyering, konteks kegiatan, dan alasan pemilihan paket meeting..."
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Maksud dan Tujuan */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">2</span>
                    <span>Maksud dan Tujuan</span>
                  </div>
                  <textarea
                    rows={4}
                    value={konsinyeringMaksudTujuan}
                    onChange={(e) => setKonsinyeringMaksudTujuan(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                    placeholder="Maksud dan tujuan penyelenggaraan paket meeting/konsinyering..."
                  />
                </div>

                {/* 3. Manfaat */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">3</span>
                    <span>Manfaat</span>
                  </div>
                  <textarea
                    rows={3}
                    value={konsinyeringManfaat}
                    onChange={(e) => setKonsinyeringManfaat(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                    placeholder="Uraikan manfaat langsung dan tidak langsung bagi unit kerja maupun stakeholder terkait..."
                  />
                </div>

                {/* 4. Lokasi */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">4</span>
                    <span>Lokasi</span>
                  </div>
                  <textarea
                    rows={2}
                    value={konsinyeringLokasi}
                    onChange={(e) => setKonsinyeringLokasi(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                    placeholder="Lokasi hotel atau tempat penyelenggaraan paket meeting..."
                  />
                </div>

                {/* 5. Sumber Dana dan Perkiraan Biaya (Tiap bagian isian masing-masing) */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)] pb-2 border-b border-[var(--border)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">5</span>
                    <span>Sumber Dana dan Perkiraan Biaya</span>
                  </div>

                  <div className="space-y-4 pl-4 border-l-2 border-purple-200 dark:border-purple-900">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-xs text-[var(--text)]">a. Sumber Dana (Kode Pembebanan Anggaran):</label>
                      <textarea
                        rows={2}
                        value={konsinyeringSumberDana}
                        onChange={(e) => setKonsinyeringSumberDana(e.target.value)}
                        className="w-full p-3 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed font-mono"
                        placeholder="Contoh: DIPA PPATK TA 2026 kode 078.01.BE.3384.BCE.004.053.A akun 524114..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-xs text-[var(--text)]">b. Perkiraan Biaya:</label>
                      <textarea
                        rows={2}
                        value={konsinyeringPerkiraanBiaya}
                        onChange={(e) => setKonsinyeringPerkiraanBiaya(e.target.value)}
                        className="w-full p-3 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                        placeholder="Total perkiraan biaya dan ketentuan perpajakannya..."
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Spesifikasi Teknis (Isian Tabel Sesuai Gambar) */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">6</span>
                      <span>Spesifikasi Teknis (Tabel Rincian Paket Meeting)</span>
                    </div>
                    <button
                      onClick={handleAddHpsKonsinyeringItem}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[var(--text)] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Baris Spesifikasi</span>
                    </button>
                  </div>

                  <div className="pl-4 border-l-2 border-purple-200 dark:border-purple-900 space-y-2">
                    <div className="overflow-x-auto border border-black dark:border-slate-700 rounded-lg">
                      <table className="w-full text-xs text-left border-collapse border border-black dark:border-slate-700">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-black border-b border-black dark:border-slate-700 text-center">
                            <th className="p-2 border-r border-black dark:border-slate-700 w-12" rowSpan={2}>
                              NO
                            </th>
                            <th className="p-2 border-r border-black dark:border-slate-700 min-w-[260px]" rowSpan={2}>
                              URAIAN PEKERJAAN
                            </th>
                            <th className="p-2 border-r border-black dark:border-slate-700 text-center" colSpan={4}>
                              VOLUME
                            </th>
                            <th className="p-2 border-r border-black dark:border-slate-700 w-36 text-center" rowSpan={2}>
                              HARGA SATUAN
                            </th>
                            <th className="p-2 border-r border-black dark:border-slate-700 w-44 text-center" rowSpan={2}>
                              TOTAL
                            </th>
                            <th className="p-2 w-12 text-center" rowSpan={2}>
                              AKSI
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/30 dark:divide-slate-800">
                          {hpsKonsinyeringItems.map((k, idx) => (
                            <tr key={k.id} className="hover:bg-slate-50/50">
                              <td className="p-2 text-center font-mono border-r border-black dark:border-slate-700">
                                {idx + 1}
                              </td>
                              <td className="p-2 border-r border-black dark:border-slate-700 font-semibold">
                                <input
                                  type="text"
                                  value={k.uraianPekerjaan}
                                  onChange={(e) =>
                                    handleUpdateHpsKonsinyeringItem(k.id, "uraianPekerjaan", e.target.value)
                                  }
                                  className="w-full px-2 py-1 bg-transparent border-0 font-medium text-xs focus:ring-1 focus:ring-[var(--primary)] rounded"
                                />
                              </td>
                              <td className="p-2 text-center border-r border-black dark:border-slate-700 w-14">
                                <input
                                  type="number"
                                  value={k.volumeHari}
                                  onChange={(e) =>
                                    handleUpdateHpsKonsinyeringItem(k.id, "volumeHari", Number(e.target.value))
                                  }
                                  className="w-12 px-1 py-1 text-center font-mono font-bold bg-transparent border-0 focus:ring-1 focus:ring-[var(--primary)] rounded text-xs"
                                />
                              </td>
                              <td className="p-2 text-center border-r border-black dark:border-slate-700 w-16 text-slate-600 dark:text-slate-300">
                                <input
                                  type="text"
                                  value={k.satuanHari}
                                  onChange={(e) =>
                                    handleUpdateHpsKonsinyeringItem(k.id, "satuanHari", e.target.value)
                                  }
                                  className="w-14 px-1 py-1 text-center bg-transparent border-0 text-xs"
                                />
                              </td>
                              <td className="p-2 text-center border-r border-black dark:border-slate-700 w-14">
                                <input
                                  type="number"
                                  value={k.volumePax}
                                  onChange={(e) =>
                                    handleUpdateHpsKonsinyeringItem(k.id, "volumePax", Number(e.target.value))
                                  }
                                  className="w-12 px-1 py-1 text-center font-mono font-bold bg-transparent border-0 focus:ring-1 focus:ring-[var(--primary)] rounded text-xs"
                                />
                              </td>
                              <td className="p-2 text-center border-r border-black dark:border-slate-700 w-16 text-slate-600 dark:text-slate-300">
                                <input
                                  type="text"
                                  value={k.satuanPax}
                                  onChange={(e) =>
                                    handleUpdateHpsKonsinyeringItem(k.id, "satuanPax", e.target.value)
                                  }
                                  className="w-14 px-1 py-1 text-center bg-transparent border-0 text-xs"
                                />
                              </td>
                              <td className="p-2 text-right border-r border-black dark:border-slate-700 font-mono">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[var(--text-muted)]">Rp</span>
                                  <input
                                    type="number"
                                    value={k.hargaSatuan}
                                    onChange={(e) =>
                                      handleUpdateHpsKonsinyeringItem(k.id, "hargaSatuan", Number(e.target.value))
                                    }
                                    className="w-full text-right font-mono font-bold bg-transparent border-0 focus:ring-1 focus:ring-[var(--primary)] rounded text-xs"
                                  />
                                </div>
                              </td>
                              <td className="p-2 text-right font-mono font-bold border-r border-black dark:border-slate-700">
                                Rp {formatRupiahBulat(k.totalHarga)}
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  onClick={() => handleDeleteHpsKonsinyeringItem(k.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                  title="Hapus baris"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}

                          <tr className="border-t-2 border-black dark:border-slate-700 font-black text-xs bg-slate-50/80 dark:bg-slate-800/60">
                            <td colSpan={6} className="p-2.5 text-center uppercase tracking-wider border-r border-black dark:border-slate-700 font-black">
                              GRAND TOTAL
                            </td>
                            <td colSpan={2} className="p-2.5 text-right font-mono font-black text-slate-950 dark:text-white text-sm border-r border-black dark:border-slate-700">
                              Rp {formatRupiahBulat(hpsKonsinyeringGrandTotalBulat)}
                            </td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* 7. Jangka Waktu Pelaksanaan Pekerjaan */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">7</span>
                    <span>Jangka Waktu Pelaksanaan Pekerjaan</span>
                  </div>
                  <input
                    type="text"
                    value={konsinyeringJangkaWaktu}
                    onChange={(e) => setKonsinyeringJangkaWaktu(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    placeholder="Contoh: 1 (satu) hari kalender pada tanggal 25 Juni 2026..."
                  />
                </div>

                {/* 8. Layanan */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">8</span>
                    <span>Layanan</span>
                  </div>
                  <textarea
                    rows={4}
                    value={konsinyeringLayanan}
                    onChange={(e) => setKonsinyeringLayanan(e.target.value)}
                    className="w-full p-3.5 border border-[var(--border)] rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed"
                    placeholder="Rincian fasilitas ruangan, audio-visual, LCD, Wi-Fi, meeting kit, makan siang, dan coffee break..."
                  />
                </div>

                {/* 9. Keterangan Pejabat Penandatangan dan tanggal */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[var(--text)] pb-2 border-b border-[var(--border)]">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[0.65rem]">9</span>
                    <span>Keterangan Pejabat Penandatangan dan Tanggal</span>
                  </div>

                  <div className="p-4 rounded-xl border border-[var(--border)] bg-slate-50/50 dark:bg-slate-800/40 space-y-4 pl-4 border-l-2 border-purple-200 dark:border-purple-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-semibold text-xs text-[var(--text)] flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-purple-600" />
                          <span>Kota dan Tanggal Penandatanganan:</span>
                        </label>
                        <input
                          type="text"
                          value={konsinyeringPejabatTanggal}
                          onChange={(e) => setKonsinyeringPejabatTanggal(e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 text-xs font-medium"
                          placeholder="Contoh: Jakarta, 19 Juni 2026"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-xs text-[var(--text)] flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-purple-600" />
                          <span>Jabatan Penandatangan:</span>
                        </label>
                        <input
                          type="text"
                          value={konsinyeringPejabatJabatan}
                          onChange={(e) => setKonsinyeringPejabatJabatan(e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 text-xs font-medium"
                          placeholder="Contoh: Pejabat Pembuat Komitmen (PPK)"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-xs text-[var(--text)] flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-purple-600" />
                          <span>Nama Lengkap Pejabat:</span>
                        </label>
                        <input
                          type="text"
                          value={konsinyeringPejabatNama}
                          onChange={(e) => setKonsinyeringPejabatNama(e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 text-xs font-bold"
                          placeholder="Contoh: Diana Soraya Noor, S.H., M.H."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-xs text-[var(--text)] flex items-center gap-1.5">
                          <Award className="h-3.5 w-3.5 text-purple-600" />
                          <span>NIP Pejabat:</span>
                        </label>
                        <input
                          type="text"
                          value={konsinyeringPejabatNip}
                          onChange={(e) => setKonsinyeringPejabatNip(e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-800 text-xs font-mono"
                          placeholder="Contoh: 19780512 200212 2 001"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tombol Simpan Bagian Bawah Konsinyering */}
                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <button
                    onClick={() => setCurrentMainView("monitoring")}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  >
                    Kembali ke Tab Monitoring
                  </button>

                  <button
                    onClick={handleSaveCurrentPaket}
                    className="px-6 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{activeEditingId ? "Simpan Perubahan Item" : "Simpan Sebagai Item Baru"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL PREVIEW & CETAK DOKUMEN HASIL ISIAN FORM INPUT PENGADAAN   ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {printPreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in">
            {/* Header Modal (No-Print) */}
            <div className="p-4 border-b border-[var(--border)] bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between no-print">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <Printer className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)]">
                    Cetak Dokumen: {printPreviewItem.jenis}
                  </h3>
                  <p className="text-[0.68rem] text-[var(--text-muted)]">
                    Pratinjau Hasil Isian Lengkap Dokumen KAK &amp; HPS Resmi PPATK
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak / Cetak PDF</span>
                </button>
                <button
                  onClick={() => setPrintPreviewItem(null)}
                  className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                  title="Tutup Pratinjau"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Print Stylesheet Scoped */}
            <style>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 20mm;
                }
                body * {
                  visibility: hidden !important;
                }
                #print-pengadaan-doc, #print-pengadaan-doc * {
                  visibility: visible !important;
                }
                #print-pengadaan-doc {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  display: block !important;
                  background: white !important;
                  color: black !important;
                }
                .no-print {
                  display: none !important;
                }
                .print-break {
                  page-break-after: always !important;
                  break-after: page !important;
                }
                table {
                  border-collapse: collapse !important;
                  width: 100% !important;
                }
                th, td {
                  border: 1px solid #1e293b !important;
                }
              }
            `}</style>

            {/* Konten Dokumen Hasil Isian Form Pengadaan yang Dicetak */}
            <div className="p-6 md:p-10 space-y-8 overflow-y-auto flex-1 font-serif text-slate-900 bg-white text-xs leading-relaxed">
              <div id="print-pengadaan-doc" className="space-y-8">
                {/* ── KOP DOKUMEN RESMI PPATK ── */}
                <div className="text-center pb-4 border-b-2 border-slate-900">
                  <h1 className="text-sm font-bold uppercase tracking-wider font-sans text-slate-900">
                    PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN
                  </h1>
                  <p className="text-[10px] text-slate-600 font-sans mt-0.5">
                    {activeUnit.toUpperCase()} · DOKUMEN PENGADAAN TA 2026
                  </p>
                </div>

                {/* ══════════════════════════════════════════════════════════ */}
                {/* JIKA ITEM: PENGADAAN BARANG                              */}
                {/* ══════════════════════════════════════════════════════════ */}
                {printPreviewItem.jenis === "Pengadaan Barang" && (
                  <div className="space-y-8">
                    {/* BAGIAN I: DOKUMEN HPS BARANG */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <h2 className="text-base font-black font-sans uppercase tracking-wide text-slate-900">
                          HARGA PERKIRAAN SENDIRI (HPS)
                        </h2>
                        <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                          Nomor: {printPreviewItem.hpsNomor || "-"}
                        </p>
                      </div>

                      <table className="w-full text-xs font-sans border-none">
                        <tbody>
                          <tr>
                            <td className="w-36 py-1 font-semibold border-none!">Hari / Tanggal</td>
                            <td className="w-3 py-1 border-none!">:</td>
                            <td className="py-1 border-none!">{printPreviewItem.hpsHariTanggal || "-"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold border-none!">Tempat</td>
                            <td className="py-1 border-none!">:</td>
                            <td className="py-1 border-none!">{printPreviewItem.hpsTempat || "-"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold border-none!">Jenis Pekerjaan</td>
                            <td className="py-1 border-none!">:</td>
                            <td className="py-1 font-semibold border-none!">{printPreviewItem.hpsJenisPekerjaan || "-"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold border-none!">Kode &amp; Akun</td>
                            <td className="py-1 border-none!">:</td>
                            <td className="py-1 border-none! font-mono">{printPreviewItem.hpsKodeAkun || "-"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold border-none!">Nomor RUP</td>
                            <td className="py-1 border-none!">:</td>
                            <td className="py-1 border-none! font-mono">{printPreviewItem.hpsNomorRup || "-"}</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Tabel Rincian HPS */}
                      <table className="w-full text-xs border border-slate-900 border-collapse font-sans mt-3">
                        <thead className="bg-slate-100 font-bold text-center">
                          <tr>
                            <th className="p-2 border border-slate-900 w-10">NO</th>
                            <th className="p-2 border border-slate-900 text-left">PEKERJAAN</th>
                            <th className="p-2 border border-slate-900 w-24">KUANTITAS</th>
                            <th className="p-2 border border-slate-900 w-36 text-right">HARGA SATUAN (RP)</th>
                            <th className="p-2 border border-slate-900 w-40 text-right">HARGA TOTAL (RP)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(printPreviewItem.hpsItems || []).map((it, idx) => (
                            <tr key={it.id || idx}>
                              <td className="p-2 border border-slate-900 text-center font-mono">{idx + 1}</td>
                              <td className="p-2 border border-slate-900 font-medium">{it.pekerjaan}</td>
                              <td className="p-2 border border-slate-900 text-center">
                                {it.kuantitas} {it.satuan}
                              </td>
                              <td className="p-2 border border-slate-900 text-right font-mono">
                                Rp{formatRupiahDecimal(it.hargaSatuan)}
                              </td>
                              <td className="p-2 border border-slate-900 text-right font-mono font-semibold">
                                Rp{formatRupiahDecimal(it.hargaTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold bg-slate-50 font-sans">
                            <td colSpan={4} className="p-2 border border-slate-900 text-right">Jumlah Total:</td>
                            <td className="p-2 border border-slate-900 text-right font-mono">
                              Rp{formatRupiahDecimal(
                                (printPreviewItem.hpsItems || []).reduce((s, i) => s + (i.hargaTotal || 0), 0)
                              )}
                            </td>
                          </tr>
                          <tr className="font-semibold bg-slate-50 font-sans">
                            <td colSpan={4} className="p-2 border border-slate-900 text-right">DPP Nilai Lain (11/12):</td>
                            <td className="p-2 border border-slate-900 text-right font-mono">
                              Rp{formatRupiahDecimal(
                                (printPreviewItem.hpsItems || []).reduce((s, i) => s + (i.hargaTotal || 0), 0) * (11 / 12)
                              )}
                            </td>
                          </tr>
                          <tr className="font-semibold bg-slate-50 font-sans">
                            <td colSpan={4} className="p-2 border border-slate-900 text-right">PPN 12%:</td>
                            <td className="p-2 border border-slate-900 text-right font-mono">
                              Rp{formatRupiahDecimal(
                                (printPreviewItem.hpsItems || []).reduce((s, i) => s + (i.hargaTotal || 0), 0) * (11 / 12) * 0.12
                              )}
                            </td>
                          </tr>
                          <tr className="font-bold bg-slate-100 font-sans text-sm">
                            <td colSpan={4} className="p-2.5 border border-slate-900 text-right">GRAND TOTAL:</td>
                            <td className="p-2.5 border border-slate-900 text-right font-mono text-emerald-800">
                              Rp{formatRupiahBulat(printPreviewItem.totalAnggaran || 0)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>

                      <div className="p-3 bg-slate-50 border border-slate-300 rounded font-sans text-xs space-y-1">
                        <span className="font-bold block">Terbilang:</span>
                        <p className="italic text-slate-800 font-medium capitalize">
                          {angkaKeTerbilang(printPreviewItem.totalAnggaran || 0)}
                        </p>
                      </div>
                    </div>

                    {/* BAGIAN II: 5 BAGIAN KAK PENGADAAN BARANG */}
                    <div className="pt-6 space-y-5 border-t-2 border-slate-300 print-break">
                      <div className="text-center pb-2">
                        <h2 className="text-base font-bold font-sans uppercase tracking-wide text-slate-900">
                          KERANGKA ACUAN KERJA (KAK) / TERMS OF REFERENCE (TOR)
                        </h2>
                        <h3 className="text-sm font-semibold font-sans text-slate-800">
                          {printPreviewItem.hpsJenisPekerjaan || "Pengadaan Barang"}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">1. Latar Belakang</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">
                            {printPreviewItem.barangLatarBelakang || "-"}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">2. Maksud dan Tujuan</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">
                            {printPreviewItem.barangMaksudTujuan || "-"}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">3. Target / Sasaran</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">
                            {printPreviewItem.barangTargetSasaran || "-"}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">4. Sumber Dana dan Perkiraan Biaya</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">
                            {printPreviewItem.barangSumberDana || "-"}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-2">5. Spesifikasi Teknis</h4>
                          
                          <div className="space-y-3 pl-4">
                            <div>
                              <span className="font-semibold block mb-1">a. Mutu/Kualitas dan Jumlah:</span>
                              <table className="w-full text-xs border border-slate-900 border-collapse font-sans">
                                <thead className="bg-slate-100 text-center font-bold">
                                  <tr>
                                    <th className="p-2 border border-slate-900 w-10">No</th>
                                    <th className="p-2 border border-slate-900 text-left">Nama Barang</th>
                                    <th className="p-2 border border-slate-900 text-left">Spesifikasi Teknis</th>
                                    <th className="p-2 border border-slate-900 w-24">Jumlah</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(printPreviewItem.barangMutuItems || []).map((m, mIdx) => (
                                    <tr key={m.id || mIdx}>
                                      <td className="p-2 border border-slate-900 text-center font-mono">{mIdx + 1}</td>
                                      <td className="p-2 border border-slate-900 font-semibold">{m.namaBarang}</td>
                                      <td className="p-2 border border-slate-900 whitespace-pre-line">{m.spesifikasiTeknis}</td>
                                      <td className="p-2 border border-slate-900 text-center font-bold">{m.jumlah} Unit</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="space-y-1 pt-1">
                              <span className="font-semibold block">b. Waktu dan Lokasi:</span>
                              <p className="pl-4"><strong>1) Jangka Waktu Pelaksanaan:</strong> {printPreviewItem.barangJangkaWaktu || "-"}</p>
                              <p className="pl-4"><strong>2) Lokasi Pekerjaan:</strong> {printPreviewItem.barangLokasiPekerjaan || "-"}</p>
                            </div>

                            <div>
                              <span className="font-semibold block mb-0.5">c. Pelayanan / Garansi:</span>
                              <p className="pl-4 text-justify whitespace-pre-line">{printPreviewItem.barangPelayanan || "-"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════ */}
                {/* JIKA ITEM: PENGADAAN JASA                                */}
                {/* ══════════════════════════════════════════════════════════ */}
                {printPreviewItem.jenis === "Pengadaan Jasa" && (
                  <div className="space-y-8">
                    {/* BAGIAN I: DOKUMEN HPS JASA */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <h2 className="text-base font-black font-sans uppercase tracking-wide text-slate-900">
                          HARGA PERKIRAAN SENDIRI (HPS) PENGADAAN JASA
                        </h2>
                        <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                          Nomor: {printPreviewItem.hpsJasaNomor || "-"}
                        </p>
                      </div>

                      <table className="w-full text-xs font-sans border-none">
                        <tbody>
                          <tr>
                            <td className="w-36 py-1 font-semibold border-none!">Hari / Tanggal</td>
                            <td className="w-3 py-1 border-none!">:</td>
                            <td className="py-1 border-none!">{printPreviewItem.hpsJasaHariTanggal || "-"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold border-none!">Tempat</td>
                            <td className="py-1 border-none!">:</td>
                            <td className="py-1 border-none!">{printPreviewItem.hpsJasaTempat || "-"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold border-none!">Jenis Pekerjaan</td>
                            <td className="py-1 border-none!">:</td>
                            <td className="py-1 font-semibold border-none!">{printPreviewItem.hpsJasaJenisPekerjaan || "-"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold border-none!">Kode &amp; Akun</td>
                            <td className="py-1 border-none!">:</td>
                            <td className="py-1 border-none! font-mono">{printPreviewItem.hpsJasaKodeAkun || "-"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold border-none!">Nomor RUP</td>
                            <td className="py-1 border-none!">:</td>
                            <td className="py-1 border-none! font-mono">{printPreviewItem.hpsJasaRup || "-"}</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Tabel Rincian HPS Personil Jasa */}
                      <table className="w-full text-xs border border-slate-900 border-collapse font-sans mt-3">
                        <thead className="bg-slate-100 font-bold text-center">
                          <tr>
                            <th className="p-2 border border-slate-900 w-10">NO</th>
                            <th className="p-2 border border-slate-900 text-left">JENIS PERSONIL / TENAGA AHLI</th>
                            <th className="p-2 border border-slate-900 w-16">JUMLAH (ORG)</th>
                            <th className="p-2 border border-slate-900 w-20">WAKTU (BLN)</th>
                            <th className="p-2 border border-slate-900 w-32 text-right">SATUAN OB (RP)</th>
                            <th className="p-2 border border-slate-900 w-36 text-right">JUMLAH BIAYA (RP)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(printPreviewItem.hpsJasaPersonilItems || []).map((p, idx) => (
                            <tr key={p.id || idx}>
                              <td className="p-2 border border-slate-900 text-center font-mono">{idx + 1}</td>
                              <td className="p-2 border border-slate-900 font-medium">{p.jenisPersonil}</td>
                              <td className="p-2 border border-slate-900 text-center font-mono">{p.jumlahOrang}</td>
                              <td className="p-2 border border-slate-900 text-center font-mono">{p.waktuBulan}</td>
                              <td className="p-2 border border-slate-900 text-right font-mono">
                                Rp{formatRupiahBulat(p.hargaSatuanOB)}
                              </td>
                              <td className="p-2 border border-slate-900 text-right font-mono font-semibold">
                                Rp{formatRupiahBulat(p.jumlahBiaya)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold bg-slate-50 font-sans">
                            <td colSpan={5} className="p-2 border border-slate-900 text-right">Subtotal Remunerasi:</td>
                            <td className="p-2 border border-slate-900 text-right font-mono">
                              Rp{formatRupiahDecimal(
                                (printPreviewItem.hpsJasaPersonilItems || []).reduce((s, i) => s + (i.jumlahBiaya || 0), 0)
                              )}
                            </td>
                          </tr>
                          <tr className="font-semibold bg-slate-50 font-sans">
                            <td colSpan={5} className="p-2 border border-slate-900 text-right">DPP Nilai Lain (11/12):</td>
                            <td className="p-2 border border-slate-900 text-right font-mono">
                              Rp{formatRupiahDecimal(
                                (printPreviewItem.hpsJasaPersonilItems || []).reduce((s, i) => s + (i.jumlahBiaya || 0), 0) * (11 / 12)
                              )}
                            </td>
                          </tr>
                          <tr className="font-semibold bg-slate-50 font-sans">
                            <td colSpan={5} className="p-2 border border-slate-900 text-right">PPN 12%:</td>
                            <td className="p-2 border border-slate-900 text-right font-mono">
                              Rp{formatRupiahDecimal(
                                (printPreviewItem.hpsJasaPersonilItems || []).reduce((s, i) => s + (i.jumlahBiaya || 0), 0) * (11 / 12) * 0.12
                              )}
                            </td>
                          </tr>
                          <tr className="font-bold bg-slate-100 font-sans text-sm">
                            <td colSpan={5} className="p-2.5 border border-slate-900 text-right">GRAND TOTAL:</td>
                            <td className="p-2.5 border border-slate-900 text-right font-mono text-blue-800">
                              Rp{formatRupiahBulat(printPreviewItem.totalAnggaran || 0)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>

                      <div className="p-3 bg-slate-50 border border-slate-300 rounded font-sans text-xs space-y-1">
                        <span className="font-bold block">Terbilang:</span>
                        <p className="italic text-slate-800 font-medium capitalize">
                          {angkaKeTerbilang(printPreviewItem.totalAnggaran || 0)}
                        </p>
                      </div>
                    </div>

                    {/* BAGIAN II: 13 BAGIAN KAK PENGADAAN JASA */}
                    <div className="pt-6 space-y-5 border-t-2 border-slate-300 print-break">
                      <div className="text-center pb-2">
                        <h2 className="text-base font-bold font-sans uppercase tracking-wide text-slate-900">
                          KERANGKA ACUAN KERJA (KAK) / TERMS OF REFERENCE (TOR)
                        </h2>
                        <h3 className="text-sm font-semibold font-sans text-slate-800">
                          {printPreviewItem.hpsJasaJenisPekerjaan || "Pengadaan Jasa"}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">1. Latar Belakang</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">{printPreviewItem.jasaLatarBelakang || "-"}</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">2. Dasar Pelaksanaan</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">{printPreviewItem.jasaDasarPelaksanaan || "-"}</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">3. Maksud dan Tujuan</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">{printPreviewItem.jasaMaksudTujuan || "-"}</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">4. Lokasi Kegiatan</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">{printPreviewItem.jasaLokasiKegiatan || "-"}</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">5. Ruang Lingkup, Pendekatan dan Metodologi</h4>
                          <div className="space-y-2 pl-4">
                            <p><strong>a. Ruang Lingkup:</strong> {printPreviewItem.jasaRuangLingkup || "-"}</p>
                            <p><strong>b. Pendekatan:</strong> {printPreviewItem.jasaPendekatan || "-"}</p>
                            <p><strong>c. Metodologi:</strong> {printPreviewItem.jasaMetodologi || "-"}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-2">6. Tahapan Pelaksanaan</h4>
                          <div className="space-y-2 pl-4">
                            {(printPreviewItem.jasaTahapanList || []).map((t, idx) => (
                              <div key={t.id || idx} className="p-2 border border-slate-300 rounded bg-slate-50 font-sans">
                                <span className="font-bold block text-xs">{t.namaTahapan}</span>
                                <p className="text-[11px] text-slate-700 whitespace-pre-line mt-0.5">{t.uraianTahapan}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">7. Keluaran yang Diinginkan</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">{printPreviewItem.jasaKeluaranDiinginkan || "-"}</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">8. Sumber Pendanaan</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">{printPreviewItem.jasaSumberPendanaan || "-"}</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-2">9. Jangka Waktu Pelaksanaan dan Jadwal Milestone</h4>
                          <p className="mb-2 pl-2"><strong>Waktu Pelaksanaan:</strong> {printPreviewItem.jasaJangkaWaktu || "-"}</p>
                          <table className="w-full text-xs border border-slate-900 border-collapse font-sans">
                            <thead className="bg-slate-100 text-center font-bold">
                              <tr>
                                <th className="p-2 border border-slate-900 w-28">Minggu ke-</th>
                                <th className="p-2 border border-slate-900 w-44 text-left">Keluaran (Output)</th>
                                <th className="p-2 border border-slate-900 text-left">Uraian Target</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(printPreviewItem.jasaMilestoneList || []).map((m, mIdx) => (
                                <tr key={m.id || mIdx}>
                                  <td className="p-2 border border-slate-900 text-center font-semibold">{m.mingguKe}</td>
                                  <td className="p-2 border border-slate-900 font-medium">{m.output}</td>
                                  <td className="p-2 border border-slate-900">{m.uraian}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-2">10. Jumlah Tenaga yang Diperlukan</h4>
                          <table className="w-full text-xs border border-slate-900 border-collapse font-sans mb-2">
                            <thead className="bg-slate-100 text-center font-bold">
                              <tr>
                                <th className="p-2 border border-slate-900 w-8">No</th>
                                <th className="p-2 border border-slate-900 text-left">Posisi</th>
                                <th className="p-2 border border-slate-900 w-14">Jml</th>
                                <th className="p-2 border border-slate-900 w-20">Waktu</th>
                                <th className="p-2 border border-slate-900 w-28 text-right">Upah (OB)</th>
                                <th className="p-2 border border-slate-900 text-left">Kualifikasi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(printPreviewItem.jasaTenagaList || []).map((t, tIdx) => (
                                <tr key={t.id || tIdx}>
                                  <td className="p-2 border border-slate-900 text-center font-mono">{tIdx + 1}</td>
                                  <td className="p-2 border border-slate-900 font-semibold">{t.posisi}</td>
                                  <td className="p-2 border border-slate-900 text-center">{t.jumlah} Org</td>
                                  <td className="p-2 border border-slate-900 text-center">{t.waktu}</td>
                                  <td className="p-2 border border-slate-900 text-right font-mono">Rp{formatRupiahBulat(t.satuanUpahOB)}</td>
                                  <td className="p-2 border border-slate-900 text-[11px]">{t.kualifikasiPengalaman}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {printPreviewItem.jasaCatatanTambahanTenaga && (
                            <p className="text-[11px] text-slate-700 italic">Catatan: {printPreviewItem.jasaCatatanTambahanTenaga}</p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">11. Hak Kekayaan Intelektual dan Tanggung Jawab</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">
                            {printPreviewItem.jasaHakKekayaanIntelektual || "-"} {printPreviewItem.jasaTanggungJawabHki ? `\n${printPreviewItem.jasaTanggungJawabHki}` : ""}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">12. Klausul Penyangkalan (Disclaimer) dan Catatan Khusus</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">{printPreviewItem.jasaKlausulDisclaimer || "-"}</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">13. Penutup</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">{printPreviewItem.jasaPenutup || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════ */}
                {/* JIKA ITEM: KONSINYERING                                  */}
                {/* ══════════════════════════════════════════════════════════ */}
                {printPreviewItem.jenis === "Konsinyering" && (
                  <div className="space-y-8">
                    {/* BAGIAN I: DOKUMEN HPS KONSINYERING */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <h2 className="text-base font-black font-sans uppercase tracking-wide text-slate-900">
                          HARGA PERKIRAAN SENDIRI (HPS)
                        </h2>
                        <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                          Nomor: {printPreviewItem.hpsKonsinyeringNomor || "-"}
                        </p>
                      </div>

                      <table className="w-full text-xs font-sans border-none">
                        <tbody>
                          <tr>
                            <td className="w-36 py-1 font-semibold border-none!">Hari, tanggal</td>
                            <td className="w-3 py-1 border-none!">:</td>
                            <td className="py-1 border-none!">{printPreviewItem.hpsKonsinyeringHariTanggal || "-"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold border-none!">Tempat</td>
                            <td className="py-1 border-none!">:</td>
                            <td className="py-1 border-none!">{printPreviewItem.hpsKonsinyeringTempat || "-"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold border-none!">Jenis Pekerjaan</td>
                            <td className="py-1 border-none!">:</td>
                            <td className="py-1 font-semibold border-none!">{printPreviewItem.hpsKonsinyeringJenisPekerjaan || "-"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold border-none!">Kode</td>
                            <td className="py-1 border-none!">:</td>
                            <td className="py-1 border-none! font-mono">{printPreviewItem.hpsKonsinyeringKodeAkun || "-"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold border-none!">RUP</td>
                            <td className="py-1 border-none!">:</td>
                            <td className="py-1 border-none! font-mono">{printPreviewItem.hpsKonsinyeringRup || "-"}</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Tabel Rincian HPS Meeting Konsinyering */}
                      <table className="w-full text-xs border border-slate-900 border-collapse font-sans mt-3">
                        <thead className="bg-slate-100 font-bold text-center">
                          <tr>
                            <th className="p-2 border border-slate-900 w-10">NO</th>
                            <th className="p-2 border border-slate-900 text-left">URAIAN PEKERJAAN</th>
                            <th className="p-2 border border-slate-900 w-44">VOLUME</th>
                            <th className="p-2 border border-slate-900 w-36 text-right">HARGA SATUAN</th>
                            <th className="p-2 border border-slate-900 w-40 text-right">TOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(printPreviewItem.hpsKonsinyeringItems || []).map((k, idx) => (
                            <tr key={k.id || idx}>
                              <td className="p-2 border border-slate-900 text-center font-mono">{idx + 1}</td>
                              <td className="p-2 border border-slate-900 font-medium">{k.uraianPekerjaan}</td>
                              <td className="p-2 border border-slate-900 text-center">
                                {k.volumeHari} {k.satuanHari || "hari"} × {k.volumePax} {k.satuanPax || "Pax"}
                              </td>
                              <td className="p-2 border border-slate-900 text-right font-mono">
                                Rp{formatRupiahBulat(k.hargaSatuan)}
                              </td>
                              <td className="p-2 border border-slate-900 text-right font-mono font-semibold">
                                Rp{formatRupiahBulat(k.totalHarga)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-bold bg-slate-100 font-sans text-sm">
                            <td colSpan={4} className="p-2.5 border border-slate-900 text-right">GRAND TOTAL:</td>
                            <td className="p-2.5 border border-slate-900 text-right font-mono text-purple-900 font-black">
                              Rp{formatRupiahBulat(printPreviewItem.totalAnggaran || 0)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>

                      <div className="p-3 bg-slate-50 border border-slate-300 rounded font-sans text-xs space-y-1">
                        <span className="font-bold block">Terbilang:</span>
                        <p className="italic text-slate-800 font-medium capitalize">
                          {angkaKeTerbilang(printPreviewItem.totalAnggaran || 0)}
                        </p>
                      </div>

                      {printPreviewItem.hpsKonsinyeringKeterangan && (
                        <div className="pt-2 font-sans text-[11px] text-slate-800 whitespace-pre-line">
                          <span className="font-bold block text-xs mb-1">Keterangan:</span>
                          {printPreviewItem.hpsKonsinyeringKeterangan}
                        </div>
                      )}
                    </div>

                    {/* BAGIAN II: 9 BAGIAN KAK KONSINYERING */}
                    <div className="pt-6 space-y-5 border-t-2 border-slate-300 print-break">
                      <div className="text-center pb-2">
                        <h2 className="text-base font-bold font-sans uppercase tracking-wide text-slate-900">
                          KERANGKA ACUAN KERJA (KAK) / TERMS OF REFERENCE (TOR)
                        </h2>
                        <h3 className="text-sm font-semibold font-sans text-slate-800">
                          {printPreviewItem.hpsKonsinyeringJenisPekerjaan || "Konsinyering"}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">1. Latar Belakang</h4>
                          <div className="pl-4 space-y-2">
                            <div>
                              <span className="font-semibold block">1.a Dasar Hukum:</span>
                              <p className="whitespace-pre-line text-slate-800 pl-2">{printPreviewItem.konsinyeringDasarHukum || "-"}</p>
                            </div>
                            <div>
                              <span className="font-semibold block">1.b Gambaran Umum:</span>
                              <p className="whitespace-pre-line text-slate-800 pl-2 text-justify">{printPreviewItem.konsinyeringGambaranUmum || "-"}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">2. Maksud dan Tujuan</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">{printPreviewItem.konsinyeringMaksudTujuan || "-"}</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">3. Manfaat</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">{printPreviewItem.konsinyeringManfaat || "-"}</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">4. Lokasi</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">{printPreviewItem.konsinyeringLokasi || "-"}</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">5. Sumber Dana dan Perkiraan Biaya</h4>
                          <div className="pl-4 space-y-1">
                            <p><strong>a. Sumber Dana:</strong> {printPreviewItem.konsinyeringSumberDana || "-"}</p>
                            <p><strong>b. Perkiraan Biaya:</strong> {printPreviewItem.konsinyeringPerkiraanBiaya || "-"}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-2">6. Spesifikasi Teknis</h4>
                          <table className="w-full text-xs border border-slate-900 border-collapse font-sans">
                            <thead className="bg-slate-100 text-center font-bold">
                              <tr>
                                <th className="p-2 border border-slate-900 w-10">NO</th>
                                <th className="p-2 border border-slate-900 text-left">URAIAN PEKERJAAN</th>
                                <th className="p-2 border border-slate-900 w-44">VOLUME</th>
                                <th className="p-2 border border-slate-900 w-36 text-right">HARGA SATUAN</th>
                                <th className="p-2 border border-slate-900 w-40 text-right">TOTAL</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(printPreviewItem.hpsKonsinyeringItems || []).map((k, idx) => (
                                <tr key={k.id || idx}>
                                  <td className="p-2 border border-slate-900 text-center font-mono">{idx + 1}</td>
                                  <td className="p-2 border border-slate-900 font-medium">{k.uraianPekerjaan}</td>
                                  <td className="p-2 border border-slate-900 text-center">
                                    {k.volumeHari} {k.satuanHari || "hari"} × {k.volumePax} {k.satuanPax || "Pax"}
                                  </td>
                                  <td className="p-2 border border-slate-900 text-right font-mono">Rp{formatRupiahBulat(k.hargaSatuan)}</td>
                                  <td className="p-2 border border-slate-900 text-right font-mono font-semibold">Rp{formatRupiahBulat(k.totalHarga)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">7. Jangka Waktu Pelaksanaan Pekerjaan</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">{printPreviewItem.konsinyeringJangkaWaktu || "-"}</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm font-sans text-slate-900 mb-1">8. Layanan</h4>
                          <p className="text-justify indent-6 whitespace-pre-line text-slate-800">{printPreviewItem.konsinyeringLayanan || "-"}</p>
                        </div>

                        {/* 9. Penandatangan Pejabat */}
                        <div className="pt-8 flex justify-end">
                          <div className="text-center font-sans text-xs space-y-1 min-w-[260px]">
                            <p className="text-slate-800">{printPreviewItem.konsinyeringPejabatTanggal || "Jakarta, 19 Juni 2026"}</p>
                            <p className="font-bold text-slate-900 pb-16">{printPreviewItem.konsinyeringPejabatJabatan || "Pejabat Pembuat Komitmen"}</p>
                            <p className="font-bold text-slate-900 underline">{printPreviewItem.konsinyeringPejabatNama || "Pejabat Penandatangan"}</p>
                            <p className="text-[11px] text-slate-600 font-mono">NIP. {printPreviewItem.konsinyeringPejabatNip || "-"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer (No-Print) */}
            <div className="p-4 border-t border-[var(--border)] bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between no-print">
              <div className="text-xs text-[var(--text-muted)]">
                Status Histori: <strong>{activeHistoriLabel}</strong> ({activeUnit})
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrintPreviewItem(null)}
                  className="px-4 py-2 border border-[var(--border)] text-xs font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Tutup Pratinjau
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak Dokumen Lengkap</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
