import informasiKinerjaData from "../../data/informasiKinerjaData.json";
import unitKerjaData from "../../data/unitKerjaData.json";
import rekapRenjaNestedTree from "../../data/rekapRenjaNestedTree.json";

export interface KakIdentitasKinerja {
  unitSingkatan: string;
  unitNama: string;
  unitEselon1: string;
  kementerianLembaga: string;
  program: string;
  sasaranProgram: string;
  ikp: string;
  kegiatan: string;
  sasaranKegiatan: string;
  ikk: string;
  kro: string;
  ro: string;
  roKode: string;
  roNama: string;
  indikatorRoDefault: string;
  volumeRoDefault: string;
  satuanRo: string;
  komponenList: string[];
  subKomponenDefault: {
    namaSubKomponen: string;
    uraianRangkaian: string;
  }[];
}

export function getUnitKerjaByNamaOrSingkatan(nameOrSingkatan: string) {
  const q = (nameOrSingkatan || "").trim().toLowerCase();
  const match = unitKerjaData.find(
    (u) =>
      u.nama.toLowerCase() === q ||
      u.singkatan.toLowerCase() === q ||
      u.nama.toLowerCase().includes(q) ||
      q.includes(u.nama.toLowerCase()) ||
      u.singkatan.toLowerCase().includes(q)
  );
  if (match) return match;

  // Fallback defaults
  if (q.includes("pelatihan") || q.includes("diklat") || q.includes("patih")) {
    return unitKerjaData.find((u) => u.singkatan === "PATIH") || unitKerjaData[0];
  }
  if (q.includes("internasional") || q.includes("serasi")) {
    return unitKerjaData.find((u) => u.singkatan === "SERASI") || unitKerjaData[0];
  }
  if (q.includes("teknologi") || q.includes("logis")) {
    return unitKerjaData.find((u) => u.singkatan === "LOGIS") || unitKerjaData[0];
  }
  return unitKerjaData.find((u) => u.singkatan === "SERASI") || unitKerjaData[0];
}

// Menentukan Satuan RO standar berdasarkan kategori KRO/RO
function getSatuanRoDefault(roText: string, kroText: string): string {
  const combined = (roText + " " + kroText).toLowerCase();
  if (combined.includes("pelatihan") || combined.includes("diklat") || combined.includes("sdm")) {
    return "Orang/Sertifikat";
  }
  if (combined.includes("kerja sama") || combined.includes("kesepakatan") || combined.includes("intervensi")) {
    return "Laporan/Dokumen Kesepakatan";
  }
  if (combined.includes("sarana") || combined.includes("pti") || combined.includes("infrastruktur") || combined.includes("aplikasi")) {
    return "Perangkat/Sistem Layanan";
  }
  if (combined.includes("regulasi") || combined.includes("hukum") || combined.includes("peraturan") || combined.includes("legislasi")) {
    return "Peraturan/Dokumen Hukum";
  }
  if (combined.includes("analisis") || combined.includes("pemeriksaan") || combined.includes("intelijen")) {
    return "Laporan Hasil Analisis (LHA/LHP)";
  }
  if (combined.includes("pengawasan") || combined.includes("kepatuhan") || combined.includes("audit")) {
    return "Laporan Hasil Pengawasan";
  }
  if (combined.includes("layanan") || combined.includes("dukungan")) {
    return "Layanan";
  }
  return "Laporan/Dokumen";
}

// Menentukan Unit Eselon I
function getUnitEselon1(subcluster: string): string {
  if (subcluster.includes("Strategi dan Kerja Sama")) {
    return "(078.01) Deputi Bidang Strategi dan Kerja Sama";
  }
  if (subcluster.includes("Pelaporan dan Pengawasan")) {
    return "(078.01) Deputi Bidang Pelaporan dan Pengawasan Kepatuhan";
  }
  if (subcluster.includes("Analisis Transaksi")) {
    return "(078.02) Deputi Bidang Analisis dan Pemeriksaan Transaksi Keuangan";
  }
  if (subcluster.includes("Sekretariat") || subcluster.includes("SETIA") || subcluster.includes("Biro")) {
    return "(078.01) Sekretariat Utama";
  }
  if (subcluster.includes("Pengawasan Internal")) {
    return "(078.01) Inspektorat PPATK";
  }
  return "(078) PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN";
}

// Dapatkan seluruh RO yang dimiliki oleh unit kerja dari informasiKinerjaData.json
export function getAvailableRoForUnit(unitSingkatan: string) {
  const rows = informasiKinerjaData.filter((r) => r.unitKerja === unitSingkatan);
  const roMap = new Map<
    string,
    {
      kro: string;
      ro: string;
      kegiatan: string;
      program: string;
      satker: string;
      kl: string;
      komponenList: string[];
    }
  >();

  rows.forEach((r) => {
    const roVal = r.ro || "";
    if (!roVal) return;
    if (!roMap.has(roVal)) {
      roMap.set(roVal, {
        kro: r.kro || "",
        ro: roVal,
        kegiatan: r.kegiatan || "",
        program: r.program || "",
        satker: r.satker || "",
        kl: r.kl || "",
        komponenList: [],
      });
    }
    if (r.komponen) {
      const entry = roMap.get(roVal)!;
      if (!entry.komponenList.includes(r.komponen)) {
        entry.komponenList.push(r.komponen);
      }
    }
  });

  return Array.from(roMap.values());
}

// Dapatkan data identitas KAK lengkap untuk Unit Kerja tertentu
export function getIdentitasKinerjaByUnitKerja(
  unitNameOrSingkatan: string,
  selectedRoIndex: number = 0
): KakIdentitasKinerja {
  const uk = getUnitKerjaByNamaOrSingkatan(unitNameOrSingkatan);
  const singkatan = uk.singkatan;
  const availableRos = getAvailableRoForUnit(singkatan);

  const activeRoData = availableRos[selectedRoIndex] || availableRos[0];
  const komponenList = activeRoData?.komponenList || [];

  // 1. Identitas KL & Eselon I
  const kementerianLembaga = "(078) PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN";
  const unitEselon1 = getUnitEselon1(uk.subcluster);

  // 2. Program & Kegiatan
  let program = "(078.BE) Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang dan Pendanaan Terorisme";
  if (
    activeRoData?.program?.includes("WA") ||
    uk.cluster.includes("Biro") ||
    uk.singkatan === "PEKA" ||
    uk.singkatan === "BINCANG" ||
    uk.singkatan === "BIRU"
  ) {
    program = "(078.WA) Program Dukungan Manajemen";
  }

  // 3. Mapping data per unit kerja (Spesifik sesuai profil resmi PPATK)
  let sasaranProgram = "Meningkatnya efektivitas kerjasama APU PPT dan PPSPM";
  let ikp =
    "IKP 4.1: Persentase Pemenuhan Kewajiban Kontribusi Tenaga Ahli untuk FATF\nIKP 4.2: Persentase Penyampaian Intervensi Indonesia yang Diterima di Forum Internasional APUPPT PPSPM";
  let kegiatan = "(3380) Pelaksanaan Kerja Sama Internasional";
  let sasaranKegiatan = "SK 4.1: Meningkatnya Efektivitas Kerja Sama APUPPT PPSPM";
  let ikk =
    "IKK 4.1.1: Persentase Penyampaian Intervensi Indonesia yang Diterima di Forum Teknis FATF dan FSRB\nIKK 4.1.2: Persentase Pemenuhan Kajian Implementasi Standar Internasional\nIKK 4.2.1: Indeks Efektivitas Kerjasama Internasional";
  let kro = "AEC.001 – Laporan Hasil Intervensi dan Implementasi Pelaksanaan Kerja Sama Internasional";
  let ro =
    "051: Pelaksanaan Kerja Sama Internasional, dengan Sub-Komponen A: Kerja Sama Internasional Penguatan Information Exchange, Supervisory, dan FIU (IO 2,4,6); Sub-Komponen B: Kerja Sama Internasional Penguatan Pemberantasan TPPU, TPPT dan PPSPM (IO 2,3,4,6); Sub-Komponen C: Penguatan Strategi Kerja Sama Internasional Multilateral dan Bilateral (IO 2,4,6)";
  let satuanRo = "Laporan/Dokumen Kesepakatan";

  switch (singkatan) {
    case "SERASI": // Direktorat Strategi dan Kerja Sama Internasional (Sesuai contoh acuan gambar pengguna)
      kegiatan = "(3380) Pelaksanaan Kerja Sama Internasional";
      sasaranProgram = "Meningkatnya efektivitas kerjasama APU PPT dan PPSPM";
      ikp =
        "IKP 4.1: Persentase Pemenuhan Kewajiban Kontribusi Tenaga Ahli untuk FATF\nIKP 4.2: Persentase Penyampaian Intervensi Indonesia yang Diterima di Forum Internasional APUPPT PPSPM";
      sasaranKegiatan = "SK 4.1: Meningkatnya Efektivitas Kerja Sama APUPPT PPSPM";
      ikk =
        "IKK 4.1.1: Persentase Penyampaian Intervensi Indonesia yang Diterima di Forum Teknis FATF dan FSRB\nIKK 4.1.2: Persentase Pemenuhan Kajian Implementasi Standar Internasional\nIKK 4.2.1: Indeks Efektivitas Kerjasama Internasional";
      kro = "AEC.001 – Laporan Hasil Intervensi dan Implementasi Pelaksanaan Kerja Sama Internasional";
      ro =
        "051: Pelaksanaan Kerja Sama Internasional, dengan Sub-Komponen A: Kerja Sama Internasional Penguatan Information Exchange, Supervisory, dan FIU (IO 2,4,6); Sub-Komponen B: Kerja Sama Internasional Penguatan Pemberantasan TPPU, TPPT dan PPSPM (IO 2,3,4,6); Sub-Komponen C: Penguatan Strategi Kerja Sama Internasional Multilateral dan Bilateral (IO 2,4,6)";
      satuanRo = "Laporan/Dokumen Kesepakatan";
      break;

    case "PATIH": // Pusat Pendidikan dan Pelatihan APU PPT
      kegiatan = "(3365) Pendidikan dan Pelatihan Anti Pencucian Uang PPATK";
      sasaranProgram = "Meningkatnya Kompetensi SDM dan Aparat Penegak Hukum di Bidang APU PPT dan PPSPM";
      ikp =
        "IKP 1.1: Persentase SDM APUPPT yang Memenuhi Standar Kompetensi Nasional\nIKP 1.2: Indeks Kepuasan Layanan Pembelajaran Pusdiklat APUPPT";
      sasaranKegiatan = "SK 1.1: Meningkatnya Kompetensi SDM APU PPT dan PPSPM";
      ikk =
        "IKK 1.1.1: Indeks Efektivitas Pengembangan Kompetensi SDM APU PPT dan PPSPM\nIKK 1.2.1: Indeks Efektivitas Pengembangan Kompetensi Aparat Penegak Hukum APU PPT PPSPM";
      kro = activeRoData?.kro || "3365.DCF – Pelatihan Bidang Ekonomi dan Keuangan";
      ro =
        "001: Pelatihan Bidang APU PPT PPSPM, dengan Komponen: Perencanaan dan Pengembangan Diklat, Kerjasama Diklat, Penyelenggaraan Diklat, Persiapan Sertifikasi, Penjaminan Mutu & Evaluasi Diklat";
      satuanRo = "Orang/Sertifikat Pelatihan";
      break;

    case "LOGIS": // Pusat Teknologi Informasi
      kegiatan = "(3381) Pengelolaan Teknologi Informasi PPATK";
      sasaranProgram = "Terwujudnya Transformasi Digital dan Integrasi Sistem Informasi PPATK";
      ikp = "IKP 5.1: Indeks Tata Kelola Teknologi Informasi";
      sasaranKegiatan = "SK 1.1: Meningkatnya Pengelolaan Teknologi Informasi yang Berkualitas, Sistematis dan Terintegrasi";
      ikk =
        "IKK 1.1.1: Persentase Implementasi Roadmap IT Masterplan\nIKK 1.1.2: Persentase Uptime Sistem Core PPATK (GoAML & SIPENDAR)";
      kro = activeRoData?.kro || "3381.CAN – Sarana Bidang Teknologi Informasi dan Komunikasi";
      ro =
        "001: Sarana PTI, dengan Komponen: Infrastruktur Teknologi Informasi; Pengembangan Sistem Aplikasi Intelijen Keuangan; Pengelolaan Keamanan Informasi dan Data Center";
      satuanRo = "Perangkat/Sistem Layanan";
      break;

    case "KREASI": // Direktorat Hukum dan Regulasi
      kegiatan = "(3379) Pengelolaan Bidang Hukum dan Regulasi PPATK";
      sasaranProgram = "Meningkatnya Efektivitas Strategi, Kebijakan dan Regulasi APU PPT dan PPSPM";
      ikp =
        "IKP 3.1: Indeks Efektivitas Strategi Regulasi dan Layanan Hukum PPATK\nIKP 3.2: Indeks Pemanfaatan Rekomendasi yang Dihasilkan PPATK";
      sasaranKegiatan = "SK 1.1: Meningkatnya Efektivitas Strategi dalam Bidang Regulasi Nasional terkait APUPPT PPSPM";
      ikk =
        "IKK 1.1.1: Persentase Pemenuhan Permintaan Penyusunan Regulasi PPATK\nIKK 1.1.2: Persentase Pemenuhan Layanan Hukum PPATK";
      kro = activeRoData?.kro || "3379.AAH – Peraturan Lainnya";
      ro =
        "001: Penyusunan Regulasi PPATK, dengan Komponen: Penyusunan Dokumen Legislasi, Advokasi dan Penelaahan Hukum, Pengkajian Regulasi TPPU/TPPT/PPSPM";
      satuanRo = "Peraturan/Dokumen Hukum";
      break;

    case "SALAM": // Direktorat Strategi dan Kerja Sama Dalam Negeri
      kegiatan = "(3380) Pelaksanaan Kerjasama Dalam Negeri dan Internasional TPPU TPPT dan PPSPM";
      sasaranProgram = "Meningkatnya Efektivitas Kerjasama APU PPT dan PPSPM";
      ikp = "IKP 4.3: Indeks Kerja Sama Dalam Negeri";
      sasaranKegiatan = "SK 3.1: Meningkatnya Efektivitas Implementasi Kerjasama Dalam Negeri";
      ikk =
        "IKK 3.1.1: Persentase Implementasi Perjanjian Kerja Sama Dalam Negeri di Bidang APU PPT dan PPSPM\nIKK 3.1.2: Persentase Penerapan Indikator Operational Alert (OA) Public Private Partnership";
      kro = activeRoData?.kro || "3380.AEC – Kerja Sama";
      ro =
        "002: Pelaksanaan Implementasi Standar dan Konvensi Internasional Dalam Negeri, dengan Komponen: Koordinasi Pelaksanaan Implementasi Standar, Kerja Sama Antar Lembaga dan Penegak Hukum";
      satuanRo = "Laporan/Dokumen Kerja Sama";
      break;

    case "REKAN": // Direktorat Pelaporan
      kegiatan = "(3382) Pengelolaan Data Pelaporan dan Pengawasan Kepatuhan Pihak Pelapor PPATK";
      sasaranProgram = "Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM";
      ikp = "IKP 1.1: Indeks Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan Pihak Pelapor";
      sasaranKegiatan = "SK 1.1: Meningkatnya Kualitas Data Pelaporan PPATK";
      ikk =
        "IKK 1.1.1: Indeks Peningkatan Kualitas Data Pelaporan PPATK\nIKK 1.2.1: Indeks Efektivitas Pengelolaan Data, Informasi dan Statistik";
      kro = activeRoData?.kro || "3382.BMA – Data dan Informasi Publik";
      ro =
        "001: Penyusunan Laporan Statistik APU PPT PPSPM & Pengelolaan Kualitas Data Pelaporan, dengan Komponen: Pemutakhiran Data Direktori Pihak Pelapor; Pengolahan Data Transaksi Keuangan";
      satuanRo = "Laporan Statistik/Basis Data";
      break;

    case "PENJAGA": // Direktorat Pengawasan Kepatuhan PJK
      kegiatan = "(3382) Pengelolaan Data Pelaporan dan Pengawasan Kepatuhan Pihak Pelapor PPATK";
      sasaranProgram = "Meningkatnya Kepatuhan Pihak Pelapor Berbasis Risiko";
      ikp = "IKP 1.1: Indeks Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan Pihak Pelapor";
      sasaranKegiatan = "SK 3.1: Meningkatnya Kepatuhan Pihak Pelapor Berbasis Risiko (Penyedia Jasa Keuangan)";
      ikk =
        "IKK 3.1.1: Indeks Efektivitas Pengawasan Kepatuhan Pihak Pelapor Berbasis Risiko (PJK)\nIKK 4.1.1: Persentase Pihak Pelapor PJK yang Melakukan Registrasi GoAML";
      kro = activeRoData?.kro || "3382.BKC – Pemantauan Lembaga";
      ro =
        "001: Pengawasan Kepatuhan Pihak Pelapor Penyedia Jasa Keuangan, dengan Komponen: Audit Kepatuhan On-site dan Off-site; Pengawasan Sektor Perbankan dan Non-Bank";
      satuanRo = "Laporan Hasil Pengawasan";
      break;

    case "PATUH": // Direktorat Pengawasan Kepatuhan PBJ & Profesi
      kegiatan = "(3382) Pengelolaan Data Pelaporan dan Pengawasan Kepatuhan Pihak Pelapor PPATK";
      sasaranProgram = "Meningkatnya Kepatuhan Pihak Pelapor Berbasis Risiko";
      ikp = "IKP 1.1: Indeks Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan Pihak Pelapor";
      sasaranKegiatan = "SK 3.2: Meningkatnya Kepatuhan Pihak Pelapor Berbasis Risiko (Penyedia Barang dan Jasa)";
      ikk =
        "IKK 3.2.1: Indeks Efektivitas Pengawasan Kepatuhan Pihak Pelapor Berbasis Risiko (PBJ dan Profesi)\nIKK 4.1.1: Persentase Profesi dan PBJ yang Teregistrasi GoAML";
      kro = activeRoData?.kro || "3382.BKC – Pemantauan Lembaga";
      ro =
        "002: Pengawasan Kepatuhan Pihak Pelapor Penyedia Barang dan Jasa dan Profesi, dengan Komponen: Pengawasan Advokat, Notaris, PPAT, Akuntan, dan Agen Properti; Sosialisasi Kewajiban Pelaporan";
      satuanRo = "Laporan Hasil Pengawasan";
      break;

    case "SIASAT": // Direktorat Analisis dan Pemeriksaan I
    case "SIDIK": // Direktorat Analisis dan Pemeriksaan II
    case "SIAGA": // Direktorat Analisis dan Pemeriksaan III
      kegiatan = "(3384) Pelaksanaan Analisis Transaksi dan Pemeriksaan PPATK";
      sasaranProgram = "Meningkatnya Tindak Lanjut Produk Intelijen Keuangan PPATK (PIK)";
      ikp = "IKP 2.1: Persentase Produk Intelijen Keuangan yang Berkontribusi pada Penerimaan Negara dan Penegakan Hukum";
      sasaranKegiatan = "SK 1.1: Meningkatnya Produk Intelijen Keuangan PPATK (PIK) Proaktif yang Ditindaklanjuti oleh Penyidik";
      ikk =
        "IKK 1.1.1: Persentase Pemanfaatan Produk Intelijen Keuangan Proaktif\nIKK 3.1.1: Indeks Kualitas Dukungan Penanganan Kasus TPPU/TPPT";
      kro = activeRoData?.kro || "3384.BCE – Penanganan Perkara";
      ro =
        singkatan === "SIASAT"
          ? "001: Hasil Analisis dan Hasil Pemeriksaan Proaktif PPATK, dengan Komponen: Analisis Transaksi Keuangan Mencurigakan Sektor Perpajakan & Kepabeanan"
          : singkatan === "SIDIK"
          ? "002: Hasil Analisis dan Pemeriksaan Sektor Narkotika, Korupsi, dan Perjudian, dengan Komponen: Joint Analysis dengan Penyidik APH (KPK, Polri, BNN)"
          : "001: Hasil Analisis Khusus Pendanaan Terorisme dan Proliferasi Senjata Pemusnah Massal, dengan Komponen: Penetapan Daftar Terduga Teroris (DTTOT)";
      satuanRo = "Laporan Hasil Analisis (LHA/LHP)";
      break;

    case "BINCANG": // Biro Perencanaan dan Keuangan
      kegiatan = "(3375) Pengelolaan Perencanaan dan Keuangan PPATK";
      sasaranProgram = "Meningkatnya Tata Kelola Internal PPATK";
      ikp = "IKP 1.1: Nilai Reformasi Birokrasi General";
      sasaranKegiatan = "SK 1.1: Meningkatnya Kualitas Sistem Perencanaan, Penganggaran, dan Pengelolaan Kinerja PPATK";
      ikk =
        "IKK 1.1.1: Nilai Indeks Perencanaan dan Pembangunan Nasional\nIKK 1.1.2: Nilai Kualitas Pengelolaan Akuntabilitas Kinerja PPATK\nIKK 2.1.1: Persentase Pemenuhan Kriteria Laporan Keuangan PPATK";
      kro = activeRoData?.kro || "3375.EBA – Layanan Dukungan Manajemen Internal";
      ro =
        "952: Layanan Perencanaan dan Penganggaran, dengan Komponen: Penyusunan Dokumen Renja & RKA-K/L; Pengelolaan Kinerja dan Pelaporan Akuntabilitas (LAKIP)";
      satuanRo = "Dokumen Rencana/Laporan Keuangan";
      break;

    case "BERMAKNA": // Biro SDM, Organisasi dan Tata Laksana
      kegiatan = "(3376) Pengelolaan Sumber Daya Manusia, Organisasi, dan Ketatalaksanaan PPATK";
      sasaranProgram = "Meningkatnya Kualitas Layanan Sumber Daya Manusia dan Tata Kelola Internal";
      ikp = "IKP 1.1: Indeks Sistem Merit dan Kualitas SDM PPATK";
      sasaranKegiatan = "SK 1.1: Meningkatnya Kualitas Layanan Sumber Daya Manusia";
      ikk =
        "IKK 1.1.1: Indeks Kualitas Layanan Sumber Daya Manusia\nIKK 2.1.1: Indeks Pengembangan Kompetensi dan Kinerja Pegawai";
      kro = activeRoData?.kro || "3376.EBC – Layanan Manajemen SDM Internal";
      ro =
        "954: Layanan Manajemen SDM, dengan Komponen: Pengelolaan Jabatan Fungsional; Asesmen Pegawai; Pembinaan Kesejahteraan Pegawai";
      satuanRo = "Layanan Kepegawaian";
      break;

    case "BIRU": // Biro Umum
      kegiatan = "(3377) Penyelenggaraan Ketatausahaan, Kerumahtanggaan, Perlengkapan PPATK";
      sasaranProgram = "Meningkatnya Kualitas Pengelolaan Layanan Umum dan Sarana Prasarana";
      ikp = "IKP 1.1: Indeks Kepuasan Layanan Sarana dan Prasarana Internal";
      sasaranKegiatan = "SK 1.1: Meningkatnya Kualitas Pengelolaan Layanan Umum PPATK";
      ikk =
        "IKK 1.1.1: Indeks Kinerja Layanan Kerumahtanggaan PPATK\nIKK 1.1.2: Indeks Kinerja Pengelolaan BMN PPATK\nIKK 1.1.3: Indeks Layanan Pengadaan Barang/Jasa";
      kro = activeRoData?.kro || "3377.EBB – Layanan Sarana dan Prasarana Internal";
      ro =
        "951: Layanan Sarana Internal, dengan Komponen: Pemeliharaan Gedung Kantor; Pengadaan Alat Pengolah Data; Pengelolaan Rumah Tangga dan Perlengkapan";
      satuanRo = "Layanan Sarana & Prasarana";
      break;

    case "PEKA": // Inspektorat
      kegiatan = "(3374) Pengawasan Internal PPATK";
      sasaranProgram = "Meningkatnya Efektivitas Pengawasan Internal PPATK";
      ikp = "IKP 1.1: Nilai Kapabilitas APIP PPATK";
      sasaranKegiatan = "SK 2.1: Meningkatnya Efektivitas Pengawasan Internal PPATK";
      ikk =
        "IKK 2.1.1: Tingkat Kapabilitas APIP PPATK\nIKK 2.1.2: Persentase Penyelesaian Tindak Lanjut Rekomendasi Hasil Pengawasan dan Pemeriksaan BPK";
      kro = activeRoData?.kro || "3374.EBD – Layanan Manajemen Kinerja Internal";
      ro =
        "965: Layanan Audit Internal, dengan Komponen: Audit Kinerja Berkala; Reviu Laporan Keuangan; Evaluasi Reformasi Birokrasi dan ZI-WBK";
      satuanRo = "Laporan Hasil Pengawasan";
      break;

    case "BERMITRA": // Pusat Pemberdayaan Kemitraan
      kegiatan = "(8004) Pelaksanaan Hubungan Masyarakat dan Pemberdayaan Kemitraan APU, PPT, dan PPSPM";
      sasaranProgram = "Meningkatnya Kemitraan Strategis dan Partisipasi Publik dalam Rezim APUPPT";
      ikp = "IKP 4.3: Indeks Ekosistem Kemitraan dan Literasi Publik APUPPT";
      sasaranKegiatan = "SK 1.1: Meningkatnya Efektivitas Layanan Hubungan Masyarakat dan Informasi APUPPT PPSPM";
      ikk =
        "IKK 1.1.1: Indeks Layanan Hubungan Masyarakat dan Informasi APUPPT PPSPM\nIKK 2.1.1: Indeks Ekosistem Kemitraan\nIKK 2.1.3: Indeks Literasi APUPPT";
      kro = activeRoData?.kro || "8004.EBA – Layanan Dukungan Manajemen Internal";
      ro =
        "001: Pelaksanaan Pemberdayaan Kemitraan APU PPT PPATK, dengan Komponen: Forum Kemitraan Strategis; Publikasi dan Sosialisasi Edukatif Publik; Diseminasi Konten Informasi Anti Pencucian Uang";
      satuanRo = "Layanan Edukasi / Kemitraan";
      break;

    default:
      if (activeRoData) {
        kegiatan = activeRoData.kegiatan || kegiatan;
        kro = activeRoData.kro || kro;
        ro = activeRoData.ro || ro;
        satuanRo = getSatuanRoDefault(ro, kro);
      }
      break;
  }

  // Jika ada data RO dari Informasi Kinerja yang dipilih user:
  if (activeRoData && selectedRoIndex > 0) {
    kro = activeRoData.kro || kro;
    ro = activeRoData.ro;
    if (komponenList.length > 0) {
      ro += `, dengan Komponen: ${komponenList.map((k) => k.replace(/^[0-9A-Z\s]+/, "")).join("; ")}`;
    }
    satuanRo = getSatuanRoDefault(activeRoData.ro, activeRoData.kro);
  }

  // Siapkan komponen default berdasarkan komponen yang ada
  const subKomponenDefault =
    komponenList.length > 0
      ? komponenList.slice(0, 3).map((komp, idx) => {
          const huruf = String.fromCharCode(65 + idx);
          const cleanKompName = komp.replace(/^[0-9A-Z\s]+/, "").trim();
          return {
            namaSubKomponen: `Komponen ${huruf}: ${cleanKompName || komp}`,
            uraianRangkaian: `Rangkaian pelaksanaan kegiatan operasional teknis untuk mendukung ${cleanKompName}.`,
          };
        })
      : [
          {
            namaSubKomponen: "Komponen A: Perencanaan dan Penyiapan Bahan Teknis",
            uraianRangkaian: "Penyusunan kerangka teknis operasional, rapat persiapan, dan penyusunan instrumen pendukung.",
          },
          {
            namaSubKomponen: "Komponen B: Pelaksanaan Kegiatan Operasional Utama",
            uraianRangkaian: "Penyelenggaraan kegiatan teknis, rapat koordinasi berkala, dan monitoring ketercapaian target.",
          },
        ];

  const indikatorRoDefault =
    singkatan === "SERASI"
      ? "Jumlah Laporan Hasil Intervensi dan Implementasi Pelaksanaan Kerja Sama Internasional"
      : singkatan === "PATIH"
      ? "Jumlah SDM yang Mengikuti Pelatihan Teknis APU PPT PPSPM"
      : singkatan === "LOGIS"
      ? "Jumlah Layanan Sarana dan Infrastruktur PTI yang Beroperasi Optimal"
      : `Jumlah Dokumen / Laporan Pelaksanaan ${activeRoData?.ro ? activeRoData.ro.replace(/^[0-9A-Z\s]+/, "") : uk.nama}`;

  const volumeRoDefault =
    singkatan === "SERASI" ? "1" : singkatan === "PATIH" ? "12" : singkatan === "LOGIS" ? "1" : "1";

  return {
    unitSingkatan: singkatan,
    unitNama: uk.nama,
    unitEselon1,
    kementerianLembaga,
    program,
    sasaranProgram,
    ikp,
    kegiatan,
    sasaranKegiatan,
    ikk,
    kro,
    ro,
    roKode: activeRoData?.ro ? activeRoData.ro.split(" ")[2] || "001" : "051",
    roNama: activeRoData?.ro || ro,
    indikatorRoDefault,
    volumeRoDefault,
    satuanRo,
    komponenList,
    subKomponenDefault,
  };
}

