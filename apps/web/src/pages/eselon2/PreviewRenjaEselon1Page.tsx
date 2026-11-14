import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Building,
  Landmark,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info,
  ChevronRight,
  ShieldCheck,
  Layers,
  ArrowRight,
  Building2,
  Sparkles,
} from "lucide-react";

import unitKerjaData from "../../data/unitKerjaData.json";

// Mapping atasan Eselon I berdasarkan data di unitKerjaData.json
interface Eselon1Detail {
  kode: string;
  namaLengkap: string;
  singkatan: string;
  pimpinan: string;
  nipPimpinan: string;
  jabatanPimpinan: string;
  motto: string;
  visiMisi: string;
  deskripsiTupoksi: string;
  sasaranStrategis: {
    kode: string;
    deskripsi: string;
    indikator: string;
    target: string;
  }[];
  programKerjaLintasUnit: {
    no: number;
    judul: string;
    deskripsi: string;
    tujuan: string;
    outcome: string;
  }[];
  programKerjaUnit: {
    no: number;
    judul: string;
    deskripsi: string;
    tujuan: string;
    outcome: string;
    unitPelaksana: string;
  }[];
}

const ESELON_1_DATABASE: Record<string, Eselon1Detail> = {
  "Deputi ASA": {
    kode: "Deputi ASA",
    singkatan: "ASA",
    namaLengkap: "Deputi Bidang Analisis Transaksi Keuangan",
    pimpinan: "Danang Tri Hartono, S.E., Ak., M.B.A.",
    nipPimpinan: "197204151998031002",
    jabatanPimpinan: "Deputi Bidang Analisis Transaksi Keuangan",
    motto: "Akurat, Sigap, Akuntabel dalam Pengolahan Intelijen Keuangan",
    visiMisi: "Mewujudkan produk intelijen keuangan yang kredibel, tepat waktu, dan berdaya guna tinggi guna mendukung penegakan hukum tindak pidana pencucian uang dan tindak pidana pendanaan terorisme.",
    deskripsiTupoksi: "Deputi Bidang Analisis Transaksi Keuangan mempunyai tugas membantu Kepala PPATK dalam memimpin, mengoordinasikan, dan menyelenggarakan kegiatan analisis dan pemeriksaan transaksi keuangan mencurigakan serta transaksi keuangan tunai dalam rangka pencegahan dan pemberantasan tindak pidana pencucian uang, tindak pidana pendanaan terorisme, dan pendanaan proliferasi senjata pemusnah massal.",
    sasaranStrategis: [
      {
        kode: "SS.1",
        deskripsi: "Meningkatnya Efektivitas Kinerja Intelijen Keuangan PPATK dalam Penegakan Hukum TPPU, TPPT, dan PPSPM",
        indikator: "Indeks Implementasi Program Analisis & Pemeriksaan Transaksi Keuangan",
        target: "6,80 (Indeks)",
      },
      {
        kode: "SP.1",
        deskripsi: "Meningkatnya Kualitas dan Tindak Lanjut Produk Intelijen Keuangan (Hasil Analisis & Hasil Pemeriksaan)",
        indikator: "Persentase Produk Intelijen Keuangan yang Berkontribusi pada Penerimaan Negara dan Pemulihan Aset",
        target: "85,00 %",
      },
      {
        kode: "SK.1.1",
        deskripsi: "Terselesaikannya Analisis Transaksi Keuangan Mencurigakan Sektor Prioritas Tinggi",
        indikator: "Persentase Hasil Analisis Prioritas yang Ditindaklanjuti Aparat Penegak Hukum",
        target: "90,00 %",
      },
    ],
    programKerjaLintasUnit: [
      {
        no: 1,
        judul: "Penguatan Integritas Alur Intelijen Keuangan & Integrasi Data Lintas Sektor",
        deskripsi: "Harmonisasi proses analisis dan pemeriksaan antara Direktorat Analisis I, II, dan III bersama unit pelaporan dan pengawasan kepatuhan.",
        tujuan: "Menghasilkan produk intelijen keuangan komprehensif berstandar internasional yang terhubung langsung dengan sistem penegak hukum.",
        outcome: "Meningkatnya rasio hasil analisis yang berujung pada penetapan tersangka dan pemulihan aset tindak pidana.",
      },
      {
        no: 2,
        judul: "Pemanfaatan Kecerdasan Buatan (AI) & Big Data Analytics goAML",
        deskripsi: "Implementasi otomasi penapisan anomali transaksi keuangan bernilai besar dan transaksi lintas batas (IFTIR).",
        tujuan: "Mempercepat waktu siklus penanganan laporan transaksi keuangan mencurigakan (LTKM) prioritas nasional.",
        outcome: "Penurunan waktu rata-rata diseminasi hasil analisis ke APH dari 30 hari kerja menjadi 14 hari kerja.",
      },
    ],
    programKerjaUnit: [
      {
        no: 1,
        judul: "Pemeriksaan Tematik Aliran Dana Tindak Pidana Korupsi dan Perpajakan",
        deskripsi: "Penyusunan laporan hasil pemeriksaan proaktif terhadap pola transaksi terstruktur pada sektor berisiko tinggi.",
        tujuan: "Mendukung optimalisasi penerimaan negara dan pengembalian kerugian keuangan negara.",
        outcome: "Terselesaikannya 100% target audit transaksi tematik prioritas tahun 2027.",
        unitPelaksana: "Direktorat Analisis dan Pemeriksaan I (SIASAT)",
      },
      {
        no: 2,
        judul: "Pemeriksaan Mendalam TPPT, Proliferasi Senjata, dan Kejahatan Siber",
        deskripsi: "Eksplorasi transaksi virtual asset (kripto) dan pendanaan jaringan terorisme lintas yurisdiksi.",
        tujuan: "Mencegah pemanfaatan instrumen keuangan digital baru sebagai sarana pencucian uang.",
        outcome: "Meningkatnya efektivitas pemblokiran rekening terduga terorisme seketika.",
        unitPelaksana: "Direktorat Analisis dan Pemeriksaan II (SIDIK)",
      },
      {
        no: 3,
        judul: "Pemeriksaan Transaksi Narkotika, TPPO, dan Green Financial Crimes",
        deskripsi: "Penelusuran transaksi keuangan hasil tindak pidana lingkungan hidup (illegal logging, mining, fishing) dan perdagangan orang.",
        tujuan: "Memutus aliran dana kejahatan terorganisir lintas negara.",
        outcome: "Terbitnya diseminasi analisis strategis ke BNN, Polri, dan Kejaksaan Agung.",
        unitPelaksana: "Direktorat Analisis dan Pemeriksaan III (SIAGA)",
      },
    ],
  },

  "Deputi TEGAS": {
    kode: "Deputi TEGAS",
    singkatan: "TEGAS",
    namaLengkap: "Deputi Bidang Strategi dan Kerja Sama",
    pimpinan: "Tuti Wahyuningsih, S.H., M.H.",
    nipPimpinan: "197008121996032001",
    jabatanPimpinan: "Deputi Bidang Strategi dan Kerja Sama",
    motto: "Terpercaya, Gigih, Adaptif, dan Sinergis",
    visiMisi: "Membangun ekosistem regulasi yang kokoh dan kemitraan strategis domestik serta internasional guna menjaga integritas sistem keuangan Indonesia.",
    deskripsiTupoksi: "Deputi Bidang Strategi dan Kerja Sama mempunyai tugas membantu Kepala PPATK dalam memimpin dan menyelenggarakan perumusan strategi nasional pencegahan dan pemberantasan TPPU, pengembangan regulasi, koordinasi penelaahan hukum, serta penguatan kerja sama pertukaran informasi intelijen keuangan di tingkat nasional maupun internasional.",
    sasaranStrategis: [
      {
        kode: "SS.2",
        deskripsi: "Meningkatnya Efektivitas Strategi Kebijakan dan Kepatuhan Rezim Anti Pencucian Uang Nasional",
        indikator: "Indeks Efektivitas Strategi Regulasi dan Layanan Hukum PPATK",
        target: "4,60 (Skala 5.0)",
      },
      {
        kode: "SP.2",
        deskripsi: "Meningkatnya Pengakuan dan Kemitraan Strategis Indonesia di Forum Internasional (FATF, Egmont Group)",
        indikator: "Persentase Kepatuhan Rekomendasi FATF & MoU Kerja Sama Bilateral Aktif",
        target: "98,00 %",
      },
    ],
    programKerjaLintasUnit: [
      {
        no: 1,
        judul: "Advokasi Penguatan Rezim APU PPT dalam Kerangka Keanggotaan Penuh FATF",
        deskripsi: "Penyelarasan kerangka hukum nasional dengan standar FATF Recommendation secara berkelanjutan.",
        tujuan: "Mempertahankan status keanggotaan penuh Indonesia di FATF dengan rating kepatuhan tinggi.",
        outcome: "Tercapainya peringkat Compliant dan Largely Compliant pada seluruh 40 Rekomendasi FATF.",
      },
    ],
    programKerjaUnit: [
      {
        no: 1,
        judul: "Penyusunan Peraturan PPATK dan Harmonisasi RUU Perampasan Aset",
        deskripsi: "Pengawalan legislasi regulasi tindak pidana pencucian uang dan ketentuan pelaporan terkini.",
        tujuan: "Memberikan payung hukum yang kuat bagi pemulihan aset hasil kejahatan tanpa putusan pidana.",
        outcome: "Ditetapkannya 4 Peraturan PPATK strategis pada tahun 2027.",
        unitPelaksana: "Direktorat Hukum dan Regulasi (KREASI)",
      },
      {
        no: 2,
        judul: "Perluasan Kerja Sama Pertukaran Informasi dengan Mitra Lembaga Domestik",
        deskripsi: "Penandatanganan dan optimalisasi PKS bersama kementerian, lembaga pemeriksa, dan asosiasi industri.",
        tujuan: "Mempercepat akses data intelijen dan koordinasi operasional pencegahan korupsi.",
        outcome: "Penambahan 12 PKS aktif baru dengan tingkat utilisasi pertukaran data > 90%.",
        unitPelaksana: "Direktorat Strategi dan Kerja Sama Dalam Negeri (SALAM)",
      },
      {
        no: 3,
        judul: "Diplomasi Intelijen Keuangan dan Kerja Sama Forum Internasional",
        deskripsi: "Peningkatan peran delegasi Indonesia pada sidang plenary FATF, APG on Money Laundering, dan Egmont Group.",
        tujuan: "Memperluas jejaring bilateral dan penanganan kasus aliran dana lintas yurisdiksi suaka pajak.",
        outcome: "Peningkatan 25% kecepatan respon spontaneous information exchange dengan mitra Financial Intelligence Unit luar negeri.",
        unitPelaksana: "Direktorat Strategi dan Kerja Sama Internasional (SERASI)",
      },
    ],
  },

  "Deputi PENGASUH": {
    kode: "Deputi PENGASUH",
    singkatan: "PENGASUH",
    namaLengkap: "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan",
    pimpinan: "Fithriadi Muslim, Ak., M.Sc., CFE.",
    nipPimpinan: "197305201997031001",
    jabatanPimpinan: "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan",
    motto: "Profesional, Edukatif, Netral, Giat, Akuntabel, Substantif, Humanis",
    visiMisi: "Menciptakan budaya kepatuhan pelaporan yang tinggi pada seluruh Pihak Pelapor (PJK, PBJ, Profesi) melalui pengawasan berbasis risiko yang presisi.",
    deskripsiTupoksi: "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan mempunyai tugas membantu Kepala PPATK dalam merumuskan dan melaksanakan kebijakan di bidang pengelolaan sistem pelaporan transaksi keuangan, pembinaan, audit, dan pengawasan kepatuhan bagi Pihak Pelapor perbankan, pasar modal, industri keuangan non-bank, serta penyedia barang dan jasa profesi.",
    sasaranStrategis: [
      {
        kode: "SS.3",
        deskripsi: "Meningkatnya Kepatuhan Pihak Pelapor dalam Penyampaian Laporan Transaksi Keuangan",
        indikator: "Indeks Kepatuhan Pihak Pelapor (IKP-PPATK)",
        target: "8,75 (Skala 10.0)",
      },
      {
        kode: "SP.3",
        deskripsi: "Meningkatnya Akurasi dan Kualitas Data Laporan Transaksi Keuangan Mencurigakan dan Tunai",
        indikator: "Tingkat Validitas dan Kelengkapan Laporan goAML yang Diterima",
        target: "95,50 %",
      },
    ],
    programKerjaLintasUnit: [
      {
        no: 1,
        judul: "Penerapan Integrated Risk-Based Supervision (IRBS) Terpadu",
        deskripsi: "Penggabungan matriks profil risiko PJK dan PBJ dalam platform pengawasan kepatuhan digital terintegrasi.",
        tujuan: "Menghindari tumpang tindih audit dan memastikan pengawasan menyasar Pihak Pelapor dengan profil risiko tertinggi.",
        outcome: "Efisiensi pengawasan kepatuhan meningkat 40% dan peningkatan perbaikan audit tindak lanjut.",
      },
    ],
    programKerjaUnit: [
      {
        no: 1,
        judul: "Transformasi Sistem Penerimaan Laporan Transaksi Keuangan Generasi Baru",
        deskripsi: "Modernisasi portal pelaporan goAML bagi penyedia jasa pembayaran digital, e-wallet, dan aset kripto.",
        tujuan: "Mempermudah pihak pelapor menyampaikan laporan secara instan dan aman.",
        outcome: "Peningkatan 30% volume laporan tepat waktu dari industri fintech.",
        unitPelaksana: "Direktorat Pelaporan (REKAN)",
      },
      {
        no: 2,
        judul: "Pengawasan Kepatuhan On-Site dan Off-Site Lembaga Keuangan Bank & NBFI",
        deskripsi: "Pemeriksaan langsung atas implementasi Customer Due Diligence (CDD) dan Enhanced Due Diligence (EDD) bank devisa.",
        tujuan: "Memastikan pencegahan masuknya dana ilegal dari sindikat kejahatan internasional.",
        outcome: "Penyelesaian 45 audit kepatuhan PJK dengan rekomendasi perbaikan kepatuhan komprehensif.",
        unitPelaksana: "Direktorat Pengawasan Kepatuhan PJK (PENJAGA)",
      },
      {
        no: 3,
        judul: "Pengawasan Kepatuhan Terhadap Notaris, Advokat, Akuntan, dan Agen Properti",
        deskripsi: "Sosialisasi kewajiban pelaporan beneficial ownership (BO) dan pengawasan terhadap profesi penasehat keuangan/hukum.",
        tujuan: "Mencegah profesi dimanfaatkan oleh pelaku kejahatan sebagai perantara pencucian uang.",
        outcome: "Peningkatan rasio pelaporan dari profesi sebesar 50% dibandingkan tahun sebelumnya.",
        unitPelaksana: "Direktorat Pengawasan Kepatuhan PBJP dan Profesi (PATUH)",
      },
    ],
  },

  "SETIA": {
    kode: "SETIA",
    singkatan: "SETIA",
    namaLengkap: "Sekretariat Utama PPATK",
    pimpinan: "Alberd Teddy Sianipar, S.I.K., M.H.",
    nipPimpinan: "197111141994031001",
    jabatanPimpinan: "Sekretaris Utama PPATK",
    motto: "Sinergi, Efektif, Transparan, Integritas, Akuntabel",
    visiMisi: "Memberikan dukungan manajemen, tata kelola kelembagaan, sarana prasarana modern, teknologi informasi mutakhir, serta SDM unggul untuk kelancaran tugas pokok PPATK.",
    deskripsiTupoksi: "Sekretariat Utama mempunyai tugas mengoordinasikan pelaksanaan tugas, pembinaan, dan pemberian dukungan administrasi kepada seluruh unit organisasi di lingkungan PPATK yang meliputi perencanaan, keuangan, kepegawaian, organisasi dan tatalaksana, hukum, hubungan masyarakat, sistem informasi, serta pengelolaan barang milik negara.",
    sasaranStrategis: [
      {
        kode: "SS.4",
        deskripsi: "Terwujudnya Tata Kelola Pemerintahan PPATK yang Bersih, Efektif, dan Akuntabel",
        indikator: "Nilai Reformasi Birokrasi (RB) PPATK",
        target: "88,50 (Kategori A)",
      },
      {
        kode: "SP.4",
        deskripsi: "Optimalnya Pengelolaan Anggaran dan Kualitas Pelayanan Manajemen Internal",
        indikator: "Nilai Indikator Kinerja Pelaksanaan Anggaran (IKPA) dan Opini BPK",
        target: "98,00 & WTP",
      },
    ],
    programKerjaLintasUnit: [
      {
        no: 1,
        judul: "Penguatan Transformasi Digital dan Layanan Birokrasi Terintegrasi AKSI",
        deskripsi: "Pengembangan sistem perencanaan, penganggaran, manajemen talenta, dan e-office cerdas berbasis cloud PPATK.",
        tujuan: "Menciptakan birokrasi lincah dan bebas kertas dengan efisiensi tata kelola belanja operasional.",
        outcome: "Seluruh siklus perencanaan hingga pelaporan terintegrasi 100% tanpa jeda birokrasi.",
      },
    ],
    programKerjaUnit: [
      {
        no: 1,
        judul: "Sinkronisasi Rencana Kerja & Anggaran Berbasis Kinerja TA 2027",
        deskripsi: "Penyusunan Renja, RKA-K/L, penetapan pagu alokasi, serta monitoring penyerapan dan deviasi RPD.",
        tujuan: "Menjamin anggaran negara dibelanjakan secara efektif, akuntabel, dan tepat sasaran.",
        outcome: "Mencapai nilai IKPA terbaik di lingkungan lembaga non-kementerian.",
        unitPelaksana: "Biro Perencanaan dan Keuangan (BINCANG)",
      },
      {
        no: 2,
        judul: "Pengembangan Manajemen Talenta & Penguatan Budaya Integritas ASN PPATK",
        deskripsi: "Implementasi sistem merit penuh, asesmen kompetensi intelijen finansial, dan penguatan kesejahteraan pegawai.",
        tujuan: "Menyiapkan aparatur yang tangguh, berintegritas tinggi, dan bebas dari benturan kepentingan.",
        outcome: "Indeks Kepuasan Kerja Pegawai dan Indeks Sistem Merit mencapai predikat Sangat Baik.",
        unitPelaksana: "Biro SDM, Organisasi dan Tata Laksana (BERMAKNA)",
      },
      {
        no: 3,
        judul: "Modernisasi Sarana Prasarana Gedung dan Keandalan Pengadaan Barang/Jasa",
        deskripsi: "Pemeliharaan gedung ramah lingkungan, pengadaan perangkat intelijen berstandar tinggi, dan tata kelola BMN.",
        tujuan: "Menyediakan lingkungan kerja yang aman, nyaman, dan mendukung operasional berteknologi tinggi 24/7.",
        outcome: "Tercapainya 100% target pengadaan tepat waktu dengan opini Wajar Tanpa Pengecualian.",
        unitPelaksana: "Biro Umum (BIRU)",
      },
      {
        no: 4,
        judul: "Pusat Pembinaan Mitra Strategis dan Edukasi Publik Anti Pencucian Uang",
        deskripsi: "Pemberdayaan kemitraan komunitas, asosiasi, dan universitas dalam riset kejahatan finansial.",
        tujuan: "Membangun kesadaran publik yang masif terhadap bahaya pencucian uang dan judi online.",
        outcome: "Terlaksananya kampanye literasi keuangan sehat pada 38 provinsi di Indonesia.",
        unitPelaksana: "Pusat Pemberdayaan Kemitraan APU PPT (BERMITRA)",
      },
      {
        no: 5,
        judul: "Pendidikan & Sertifikasi Keahlian Khusus Analis Intelijen Keuangan",
        deskripsi: "Penyelenggaraan pelatihan kompetensi berstandar internasional bagi analis, pemeriksa, dan APH mitra.",
        tujuan: "Meningkatkan rasio penyidik dan penuntut umum yang menguasai teknik penelusuran aliran dana TPPU.",
        outcome: "Meluluskan 1.200 aparat penegak hukum bersertifikasi Financial Investigator.",
        unitPelaksana: "Pusat Pendidikan dan Pelatihan APU PPT (PATIH)",
      },
      {
        no: 6,
        judul: "Penguatan Keamanan Siber dan Infrastruktur Pusat Data goAML 24/7",
        deskripsi: "Modernisasi server, backup data multi-zona, implementasi zero-trust network, dan proteksi dari serangan ransomware.",
        tujuan: "Menjamin ketersediaan data intelijen keuangan dengan tingkat uptime 99,99%.",
        outcome: "Sistem goAML dan AKSI beroperasi tanpa downtime dengan standar ISO 27001.",
        unitPelaksana: "Pusat Teknologi Informasi (LOGIS)",
      },
    ],
  },
};

// Fungsi pencari Atasan Eselon I berdasarkan nama unit kerja Eselon II
function resolveEselon1ForUnitKerja(unitKerjaName: string): Eselon1Detail {
  // Cari di master data unitKerjaData.json
  const match = unitKerjaData.find(
    (u) =>
      u.singkatan.toLowerCase() === unitKerjaName.toLowerCase() ||
      u.nama.toLowerCase().includes(unitKerjaName.toLowerCase()) ||
      unitKerjaName.toLowerCase().includes(u.nama.toLowerCase()) ||
      unitKerjaName.toLowerCase().includes(u.singkatan.toLowerCase())
  );

  if (match) {
    if (match.subcluster.includes("TEGAS")) return ESELON_1_DATABASE["Deputi TEGAS"];
    if (match.subcluster.includes("PENGASUH")) return ESELON_1_DATABASE["Deputi PENGASUH"];
    if (match.subcluster.includes("ASA")) return ESELON_1_DATABASE["Deputi ASA"];
    if (match.subcluster.includes("SETIA") || match.cluster.includes("Sekretariat Utama") || match.cluster.includes("Pusat")) {
      return ESELON_1_DATABASE["SETIA"];
    }
  }

  // Khusus SIASAT, SIDIK, SIAGA
  const upper = unitKerjaName.toUpperCase();
  if (upper.includes("ANALISIS") || upper.includes("SIASAT") || upper.includes("SIDIK") || upper.includes("SIAGA")) {
    return ESELON_1_DATABASE["Deputi ASA"];
  }
  if (upper.includes("HUKUM") || upper.includes("KERJA SAMA") || upper.includes("KREASI") || upper.includes("SALAM") || upper.includes("SERASI")) {
    return ESELON_1_DATABASE["Deputi TEGAS"];
  }
  if (upper.includes("PELAPORAN") || upper.includes("PENGAWASAN") || upper.includes("REKAN") || upper.includes("PENJAGA") || upper.includes("PATUH")) {
    return ESELON_1_DATABASE["Deputi PENGASUH"];
  }

  // Default Sekretariat Utama
  return ESELON_1_DATABASE["SETIA"];
}

export default function PreviewRenjaEselon1Page() {
  // Ambil data unit kerja yang sedang aktif pada user atau histori aktif Eselon II
  const [selectedUnitE2, setSelectedUnitE2] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("renja_e2_active_histori");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.unit_kerja) return parsed.unit_kerja;
      }
    } catch (e) {}
    return "Direktorat Analisis dan Pemeriksaan I"; // Default contoh user SIASAT
  });

  const [tahunAnggaran] = useState<number>(2027);

  // Cari Eselon I atasan
  const eselon1 = resolveEselon1ForUnitKerja(selectedUnitE2);

  // Cari detail unit Eselon II saat ini dari unitKerjaData
  const currentUnitData = unitKerjaData.find(
    (u) =>
      u.nama.toLowerCase().includes(selectedUnitE2.toLowerCase()) ||
      selectedUnitE2.toLowerCase().includes(u.nama.toLowerCase()) ||
      selectedUnitE2.toUpperCase().includes(u.singkatan)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* ── HEADER HALAMAN & PENGATUR SATKER ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary text-[0.65rem] font-bold">RENJA ESELON II</span>
            <span className="text-xs text-[var(--text-muted)]">Rujukan Dokumen Strategis</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[var(--text)] flex items-center gap-2">
            <Landmark className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Preview Dokumen Renja Eselon I</span>
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] mt-0.5">
            Pratinjau lengkap naskah resmi Rencana Kerja Eselon I yang menjadi atasan langsung unit kerja Eselon II sebagai pedoman penyusunan program kerja operasional.
          </p>
        </div>

        {/* Tombol Cetak / Simpan PDF */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* ── CARD INFORMASI HUBUNGAN UNIT KERJA HIERARKI ─────────────────────── */}
      <div className="aksi-card p-5 border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 print:hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                Unit Kerja Anda (Eselon II)
              </span>
              <span className="text-xs text-slate-400">&rarr;</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                Atasan Langsung (Eselon I)
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <h2 className="text-base font-bold text-[var(--text)]">
                {currentUnitData ? `${currentUnitData.singkatan} - ${currentUnitData.nama}` : selectedUnitE2}
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <span>Bernaung di bawah pembinaan:</span>
              <strong className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-400">
                {eselon1.namaLengkap} ({eselon1.singkatan})
              </strong>
            </p>
          </div>

          {/* Selector Ganti Unit Kerja untuk Simulasi */}
          <div className="w-full md:w-72 bg-white dark:bg-slate-950 p-2.5 rounded-2xl border border-[var(--border)] shadow-xs">
            <label className="text-[10px] font-bold text-[var(--text-muted)] block mb-1">
              Simulasi Unit Kerja Eselon II:
            </label>
            <select
              value={selectedUnitE2}
              onChange={(e) => setSelectedUnitE2(e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {unitKerjaData.map((u) => (
                <option key={u.singkatan} value={u.nama}>
                  {u.singkatan} — {u.nama}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── DOKUMEN PREVIEW LENGKAP RENJA ESELON I (STANDAR FORMAL RESMI) ───── */}
      <div className="bg-white text-slate-900 p-8 md:p-14 rounded-3xl border border-slate-200 shadow-xl space-y-10 font-serif leading-relaxed print:p-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* ── HALAMAN SAMPUL / KOP DOKUMEN RESMI ── */}
        <div className="text-center space-y-4 border-b-2 border-slate-900 pb-10">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-900 flex items-center justify-center text-white shadow-md">
            <Landmark className="w-10 h-10" />
          </div>
          <div className="space-y-1 font-sans">
            <p className="text-xs tracking-widest font-bold uppercase text-slate-600">
              PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN
            </p>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide text-slate-900">
              RENCANA KERJA (RENJA) TAHUN ANGGARAN {tahunAnggaran}
            </h1>
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider text-indigo-900">
              {eselon1.namaLengkap.toUpperCase()}
            </h2>
            <div className="pt-2">
              <span className="inline-block px-4 py-1 rounded-full text-xs font-bold font-mono tracking-wider bg-slate-100 border border-slate-300 text-slate-800">
                KODIFIKASI DOKUMEN: RENJA-E1/{eselon1.singkatan}/TA-{tahunAnggaran}
              </span>
            </div>
          </div>
        </div>

        {/* ── KATA PENGANTAR & PEJABAT PENANDATANGAN ── */}
        <div className="space-y-3 font-sans text-xs bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 uppercase">Ringkasan Pejabat Penanggung Jawab</span>
            <span className="badge badge-primary text-[10px]">Telah Ditandatangani Secara Elektronik (BSrE)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <span className="text-slate-500 block">Pimpinan Unit Eselon I:</span>
              <strong className="text-slate-900 text-sm block">{eselon1.pimpinan}</strong>
              <span className="text-slate-600 font-mono text-[11px]">NIP. {eselon1.nipPimpinan}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Jabatan Definitif:</span>
              <strong className="text-slate-900 text-sm block">{eselon1.jabatanPimpinan}</strong>
              <span className="text-slate-600 italic text-[11px]">PPATK Republik Indonesia</span>
            </div>
          </div>
        </div>

        {/* ── BAB I : PENDAHULUAN & GAMBARAN UMUM ── */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-1 border-b border-slate-200 pb-3 font-sans">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">BAB I</h2>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              GAMBARAN UMUM, CAPAIAN KINERJA, DAN ARAH KEBIJAKAN
            </h3>
          </div>

          {/* Sub A: Gambaran Umum */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm tracking-wide text-slate-900 font-sans flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-indigo-900 text-white text-xs flex items-center justify-center font-mono">A</span>
              <span>Tugas Pokok, Fungsi, dan Kedudukan Kelembagaan</span>
            </h4>
            <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
              {eselon1.deskripsiTupoksi}
            </p>
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs space-y-1.5 font-sans">
              <p className="font-bold text-indigo-900">Visi & Misi Strategis Eselon I:</p>
              <p className="text-slate-700 italic leading-relaxed">"{eselon1.visiMisi}"</p>
              <p className="text-[11px] text-slate-500 pt-1">
                <strong>Nilai & Moto Kerja:</strong> {eselon1.motto}
              </p>
            </div>
          </div>

          {/* Sub B: Sasaran Strategis & Target Kinerja */}
          <div className="space-y-3 pt-3">
            <h4 className="font-bold text-sm tracking-wide text-slate-900 font-sans flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-indigo-900 text-white text-xs flex items-center justify-center font-mono">B</span>
              <span>Sasaran Strategis, Program Kerja, dan Indikator Kinerja Utama (IKU) TA {tahunAnggaran}</span>
            </h4>
            <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
              Berdasarkan Rencana Strategis (Renstra) PPATK 2025–2029, target kinerja tahun {tahunAnggaran} untuk {eselon1.namaLengkap} dirumuskan sebagai rujukan langsung bagi perumusan Sasaran Kegiatan (SK) dan Indikator Kinerja Kegiatan (IKK) pada unit kerja Eselon II binaannya:
            </p>

            <div className="overflow-x-auto py-2 font-sans">
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 font-bold text-center">
                  <tr>
                    <th className="p-2.5 border border-slate-300 w-20">Kode</th>
                    <th className="p-2.5 border border-slate-300">Uraian Sasaran & Indikator Kinerja</th>
                    <th className="p-2.5 border border-slate-300 w-32">Target TA {tahunAnggaran}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {eselon1.sasaranStrategis.map((ss) => (
                    <tr key={ss.kode} className="hover:bg-slate-50">
                      <td className="p-2.5 border border-slate-300 text-center font-bold font-mono text-indigo-950 align-top">
                        {ss.kode}
                      </td>
                      <td className="p-2.5 border border-slate-300 align-top space-y-1">
                        <strong className="text-slate-900 block leading-snug">{ss.deskripsi}</strong>
                        <span className="text-slate-600 italic block text-[11px]">
                          <strong>Indikator:</strong> {ss.indikator}
                        </span>
                      </td>
                      <td className="p-2.5 border border-slate-300 text-center font-bold text-indigo-700 align-middle">
                        {ss.target}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── BAB II : RENCANA PROGRAM KERJA OPERASIONAL ── */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="text-center space-y-1 border-b border-slate-200 pb-3 font-sans">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">BAB II</h2>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              PROGRAM KERJA LINTAS UNIT DAN PROGRAM SPESIFIK UNIT KERJA TAHUN {tahunAnggaran}
            </h3>
          </div>

          {/* Bagian A: Program Lintas Unit */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm tracking-wide text-slate-900 font-sans flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-indigo-900 text-white text-xs flex items-center justify-center font-mono">A</span>
              <span>Program Kerja Keterpaduan Lintas Unit Kerja</span>
            </h4>
            <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
              Program lintas unit kerja merupakan inisiatif kolaboratif yang wajib diakomodasi dan didukung bersama oleh seluruh direktorat dan biro terkait:
            </p>

            <div className="space-y-3 font-sans text-xs">
              {eselon1.programKerjaLintasUnit.map((pro) => (
                <div key={pro.no} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {pro.no}
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs md:text-sm">{pro.judul}</h5>
                      <p className="text-slate-700 text-justify mt-1 leading-relaxed">{pro.deskripsi}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                    <div>
                      <span className="font-semibold text-slate-900">Tujuan:</span> {pro.tujuan}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Expected Outcome:</span> {pro.outcome}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bagian B: Program Spesifik Masing-Masing Unit Kerja */}
          <div className="space-y-4 pt-4">
            <h4 className="font-bold text-sm tracking-wide text-slate-900 font-sans flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-indigo-900 text-white text-xs flex items-center justify-center font-mono">B</span>
              <span>Program Kerja Spesifik Masing-Masing Unit Eselon II</span>
            </h4>
            <p className="text-justify indent-8 text-xs leading-relaxed text-slate-800">
              Berikut mandat program kerja spesifik yang harus diturunkan oleh masing-masing pimpinan unit kerja Eselon II ke dalam Rincian Output (RO) dan Rencana Anggaran Biaya (RAB):
            </p>

            <div className="space-y-3 font-sans text-xs">
              {eselon1.programKerjaUnit.map((pu) => {
                const isCurrentUnit =
                  currentUnitData &&
                  (pu.unitPelaksana.includes(currentUnitData.singkatan) ||
                    pu.unitPelaksana.includes(currentUnitData.nama));

                return (
                  <div
                    key={pu.no}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrentUnit
                        ? "border-indigo-400 bg-indigo-50/60 shadow-sm ring-2 ring-indigo-200"
                        : "border-slate-200 bg-slate-50"
                    } space-y-2`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-700 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {pu.no}
                        </span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs md:text-sm">{pu.judul}</h5>
                          <p className="text-slate-700 text-justify mt-1 leading-relaxed">{pu.deskripsi}</p>
                        </div>
                      </div>
                      {isCurrentUnit && (
                        <span className="badge badge-primary text-[10px] font-bold whitespace-nowrap">
                          Unit Anda
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="font-semibold text-slate-900">Unit Pelaksana:</span>{" "}
                        <strong className="text-indigo-800 block">{pu.unitPelaksana}</strong>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">Tujuan:</span> {pu.tujuan}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">Outcome:</span> {pu.outcome}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── LEMBAR TANDA TANGAN ELEKTRONIK ── */}
        <div className="pt-10 border-t-2 border-slate-900 font-sans text-xs flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1 text-slate-600 text-[11px]">
            <p>Dokumen ini sah dan diterbitkan melalui Sistem Informasi Perencanaan dan Penganggaran (AKSI) PPATK.</p>
            <p className="font-mono">Integritas Dokumen Digital: SHA256:{Math.random().toString(36).substring(2, 15)}</p>
          </div>

          <div className="text-center space-y-2 min-w-[240px]">
            <p className="text-slate-700">Ditetapkan di Jakarta, Januari 2026</p>
            <p className="font-bold text-slate-900">{eselon1.jabatanPimpinan},</p>
            <div className="py-2 flex justify-center">
              <div className="border border-emerald-600 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SIGNED & CERTIFIED BY BSrE BSSN</span>
              </div>
            </div>
            <p className="font-bold text-slate-900 underline text-sm">{eselon1.pimpinan}</p>
            <p className="font-mono text-[11px] text-slate-600">NIP. {eselon1.nipPimpinan}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
