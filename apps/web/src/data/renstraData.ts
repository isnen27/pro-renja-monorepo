// src/data/renstraData.ts
// Referensi Informasi Kinerja - RENSTRA PPATK 2025-2029
// Sumber: rekap_sasaran_renstra.xlsx, NOmenklatur_Renstra.xlsx, Diagram Sasaran - KRISNA.pdf

// ═══════════════════════════════════════════════════════════════════════════════
// 1. VISI PPATK
// ═══════════════════════════════════════════════════════════════════════════════

export interface NomenklaturVisi {
  kode: number;
  uraian: string;
}

export const nomenklaturVisi: NomenklaturVisi[] = [
  {
    kode: 1,
    uraian: "Bersinergi Membangun Indonesia Tanpa Pencucian Uang dalam rangka Mewujudkan Indonesia Maju Menuju Indonesia Emas 2045",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 2. MISI PPATK
// ═══════════════════════════════════════════════════════════════════════════════

export interface NomenklaturMisi {
  kode: number;
  uraian: string;
}

export const nomenklaturMisi: NomenklaturMisi[] = [
  { kode: 1, uraian: "Memperkuat kebijakan pengelolaan laporan transaksi keuangan" },
  { kode: 2, uraian: "Meningkatkan produk intelijen keuangan yang berkualitas" },
  { kode: 3, uraian: "Memperkuat kerja sama di tingkat domestik, regional, dan internasional" },
  { kode: 4, uraian: "Memperkuat tata kelola PPATK dalam pencegahan dan pemberantasan pencucian uang" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 3. TUJUAN PPATK
// ═══════════════════════════════════════════════════════════════════════════════

export interface IndikatorTujuan {
  kode: string;
  nama: string;
  target: { 2025: number | string; 2026: number | string; 2027: number | string; 2028: number | string; 2029: number | string };
  satuan: string;
}

export interface NomenklaturTujuan {
  kode: string;
  uraian: string;
  indikator: IndikatorTujuan[];
}

export const nomenklaturTujuan: NomenklaturTujuan[] = [
  {
    kode: "0.0",
    uraian: "Terintegrasi dan Inklusifnya Upaya Pencegahan dan Pemberantasan Gratifikasi, TPPU, TPPT, dan PPSPM",
    indikator: [
      {
        kode: "IKT 1",
        nama: "Indeks Efektivitas Rezim Anti Pencucian Uang, TPPT, dan PPSPM",
        target: { 2025: 5.52, 2026: 5.6, 2027: 5.6, 2028: 5.6, 2029: 5.83 },
        satuan: "Indeks",
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SASARAN STRATEGIS
// ═══════════════════════════════════════════════════════════════════════════════

export interface IndikatorSasaran {
  kode: string;
  nama: string;
  target: { 2025: number | string; 2026: number | string; 2027: number | string; 2028: number | string; 2029: number | string };
  satuan: string;
}

export interface SasaranStrategis {
  kode: string;
  nama: string;
  program: string;
  indikator: IndikatorSasaran[];
}

export const sasaranStrategis: SasaranStrategis[] = [
  {
    kode: "0.1",
    nama: "Meningkatnya Efektivitas Kinerja PPATK dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM",
    program: "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    indikator: [
      {
        kode: "IKSS 1.1",
        nama: "Indeks Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM",
        target: { 2025: 3, 2026: 4, 2027: 4, 2028: 5, 2029: 5 },
        satuan: "Indeks",
      },
      {
        kode: "IKSS 1.2",
        nama: "Persentase Produk Intelijen Keuangan yang Berkontribusi pada Penerimaan Negara",
        target: { 2025: 25, 2026: 27.5, 2027: 30, 2028: 32.5, 2029: 35 },
        satuan: "Persen",
      },
      {
        kode: "IKSS 1.3",
        nama: "Indeks Pemanfaatan Rekomendasi yang dihasilkan PPATK",
        target: { 2025: 66.7, 2026: 69.0, 2027: 71.4, 2028: 74.0, 2029: 75.8 },
        satuan: "Indeks",
      },
      {
        kode: "IKSS 1.4",
        nama: "Indeks Efektivitas Strategi Regulasi dan Layanan Hukum PPATK",
        target: { 2025: 4.5, 2026: 4.5, 2027: 4.625, 2028: 4.625, 2029: 4.625 },
        satuan: "Indeks",
      },
    ],
  },
  {
    kode: "0.2",
    nama: "Meningkatnya Kinerja Revitalisasi Birokrasi PPATK",
    program: "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    indikator: [
      {
        kode: "IKSS 2.1",
        nama: "Nilai Reformasi Birokrasi PPATK",
        target: { 2025: 81, 2026: 82, 2027: 83, 2028: 84, 2029: 85 },
        satuan: "Nilai",
      },
      {
        kode: "IKSS 2.2",
        nama: "Indeks Efektivitas Pengawasan Intern",
        target: { 2025: 4.0, 2026: 4.1, 2027: 4.2, 2028: 4.3, 2029: 4.4 },
        satuan: "Indeks",
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SASARAN PROGRAM (SP)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SasaranProgram {
  kode: string;
  nama: string;
  kodeSasaran: string;
  kegiatan: string;
  pengampu: string;
  indikator: IndikatorSasaran[];
}

export const sasaranProgram: SasaranProgram[] = [
  {
    kode: "0.1.1",
    nama: "Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pembertantasan TPPU, TPPT dan PPSPM",
    kodeSasaran: "01",
    kegiatan: "3382 - Pengelolaan Data Pelaporan dan Pengawasan Kepatuhan Pihak Pelapor PPATK",
    pengampu: "Kedeputian Pelaporan & Pengawasan Kepatuhan",
    indikator: [
      { kode: "IKP 1.1.1", nama: "Indeks Kebermanfaatan Data", target: { 2025: 3, 2026: 4, 2027: 4, 2028: 5, 2029: 5 }, satuan: "Indeks" },
    ],
  },
  {
    kode: "0.1.2",
    nama: "Meningkatnya Kepatuhan Pihak Pelapor Berbasis Risiko",
    kodeSasaran: "03",
    kegiatan: "3382 - Pengelolaan Data Pelaporan dan Pengawasan Kepatuhan Pihak Pelapor PPATK",
    pengampu: "Kedeputian Pelaporan & Pengawasan Kepatuhan",
    indikator: [
      { kode: "IKP 1.3.1", nama: "Persentase Kepatuhan Pihak Pelapor", target: { 2025: 70, 2026: 72, 2027: 75, 2028: 78, 2029: 80 }, satuan: "Persen" },
    ],
  },
  {
    kode: "0.1.3",
    nama: "Meningkatnya Efektivitas Strategi, Kebijakan dan Regulasi APU PPT dan PPSPM",
    kodeSasaran: "03",
    kegiatan: "3379 - Pengelolaan Bidang Hukum dan Regulasi PPATK",
    pengampu: "Direktorat Hukum dan Regulasi (KREASI)",
    indikator: [
      { kode: "IKP 1.3.2", nama: "Indeks Pemanfaatan Rekomendasi", target: { 2025: 66.7, 2026: 69, 2027: 71.4, 2028: 74, 2029: 75.8 }, satuan: "Indeks" },
    ],
  },
  {
    kode: "0.2.1",
    nama: "Meningkatnya Efektivitas Pengawasan Internal",
    kodeSasaran: "02",
    kegiatan: "WA - Program Dukungan Manajemen",
    pengampu: "Inspektorat (PEKA)",
    indikator: [
      { kode: "IKP 2.2.1", nama: "Tingkat Kapabilitas APIP", target: { 2025: 3.0, 2026: 3.1, 2027: 3.2, 2028: 3.3, 2029: 3.5 }, satuan: "Level" },
      { kode: "IKP 2.2.2", nama: "Persentase penyelesaian tindak lanjut rekomendasi hasil pengawasan dan pemeriksaan Inspektorat dan BPK", target: { 2025: 85, 2026: 87, 2027: 90, 2028: 92, 2029: 95 }, satuan: "Persen" },
    ],
  },
  {
    kode: "0.2.2",
    nama: "Meningkatnya Tata Kelola Internal PPATK",
    kodeSasaran: "02",
    kegiatan: "WA - Program Dukungan Manajemen",
    pengampu: "Sekretariat Utama",
    indikator: [
      { kode: "IKP 2.2.3", nama: "Nilai SAKIP", target: { 2025: "BB", 2026: "BB", 2027: "BBB", 2028: "BBB", 2029: "A" }, satuan: "Rating" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 6. SASARAN KEGIATAN
// ═══════════════════════════════════════════════════════════════════════════════

export interface SasaranKegiatan {
  kode: string;
  nama: string;
  kodeSasaran: string;
  kegiatan: string;
  subKegiatan?: string;
  pengampu: string;
  indikator: IndikatorSasaran[];
}

export const sasaranKegiatan: SasaranKegiatan[] = [
  {
    kode: "0.1.1.01",
    nama: "Meningkatnya Kualitas Data Pelaporan PPATK",
    kodeSasaran: "01",
    kegiatan: "3382 - Pengelolaan Data Pelaporan dan Pengawasan Kepatuhan Pihak Pelapor PPATK",
    subKegiatan: "001",
    pengampu: "Direktorat Pelaporan (REKAN)",
    indikator: [
      { kode: "IKK 1.1.1.1", nama: "Jumlah Laporan Transaksi Keuangan yang Diterima", target: { 2025: 150000, 2026: 160000, 2027: 170000, 2028: 180000, 2029: 190000 }, satuan: "Laporan" },
    ],
  },
  {
    kode: "0.1.1.02",
    nama: "Meningkatnya Registrasi Pihak Pelapor Berdasarkan Tingkat Risiko",
    kodeSasaran: "01",
    kegiatan: "3382 - Pengelolaan Data Pelaporan dan Pengawasan Kepatuhan Pihak Pelapor PPATK",
    subKegiatan: "002",
    pengampu: "Direktorat Pelaporan (REKAN)",
    indikator: [
      { kode: "IKK 1.1.2.1", nama: "Jumlah Pihak Pelapor Terdaftar", target: { 2025: 6500, 2026: 6800, 2027: 7100, 2028: 7400, 2029: 7700 }, satuan: "Entitas" },
    ],
  },
  {
    kode: "0.1.1.03",
    nama: "Meningkatnya Efektivitas Pengawasan Kepatuhan Berbasis Risiko",
    kodeSasaran: "03",
    kegiatan: "3382 - Pengelolaan Data Pelaporan dan Pengawasan Kepatuhan Pihak Pelapor PPATK",
    subKegiatan: "003",
    pengampu: "Direktorat Pengawasan Kepatuhan Penyedia Jasa Keuangan (PENJAGA)",
    indikator: [
      { kode: "IKK 1.3.3.1", nama: "Jumlah Pengawasan Kepatuhan yang Dilakukan", target: { 2025: 250, 2026: 275, 2027: 300, 2028: 325, 2029: 350 }, satuan: "Kasus" },
    ],
  },
  {
    kode: "0.1.2.01",
    nama: "Meningkatnya Kompetensi SDM APU PPT dan PPSPM",
    kodeSasaran: "01",
    kegiatan: "3365 - Pendidikan dan Pelatihan Anti Pencucian Uang PPATK",
    subKegiatan: "001",
    pengampu: "Pusat Pendidikan dan Pelatihan APU PPT (PATIH)",
    indikator: [
      { kode: "IKK 1.1.4.1", nama: "Jumlah SDM yang Dilatih", target: { 2025: 500, 2026: 550, 2027: 600, 2028: 650, 2029: 700 }, satuan: "Orang" },
      { kode: "IKK 1.1.4.2", nama: "Indeks Efektivitas Pengembangan Kompetensi SDM APU PPT", target: { 2025: 4.35, 2026: 4.39, 2027: 4.43, 2028: 4.48, 2029: 4.53 }, satuan: "Indeks" },
    ],
  },
  {
    kode: "0.1.2.02",
    nama: "Meningkatnya Kompetensi Aparat Penegak Hukum APU PPT PPPSPM",
    kodeSasaran: "01",
    kegiatan: "3365 - Pendidikan dan Pelatihan Anti Pencucian Uang PPATK",
    subKegiatan: "002",
    pengampu: "Pusat Pendidikan dan Pelatihan APU PPT (PATIH)",
    indikator: [
      { kode: "IKK 1.1.5.1", nama: "Jumlah APH yang Dilatih", target: { 2025: 200, 2026: 220, 2027: 240, 2028: 260, 2029: 280 }, satuan: "Orang" },
      { kode: "IKK 1.1.5.2", nama: "Indeks Efektivitas Pengembangan Kompetensi Aparat Penegak Hukum", target: { 2025: 4.40, 2026: 4.44, 2027: 4.48, 2028: 4.53, 2029: 4.58 }, satuan: "Indeks" },
    ],
  },
  {
    kode: "0.1.3.01",
    nama: "Meningkatnya Efektivitas Pengelolaan Data, Informasi dan Statistik",
    kodeSasaran: "03",
    kegiatan: "3382 - Pengelolaan Data Pelaporan dan Pengawasan Kepatuhan Pihak Pelapor PPATK",
    subKegiatan: "001",
    pengampu: "Direktorat Pelaporan (REKAN)",
    indikator: [
      { kode: "IKK 1.3.4.1", nama: "Jumlah Analisis dan Publikasi", target: { 2025: 48, 2026: 52, 2027: 56, 2028: 60, 2029: 64 }, satuan: "Publikasi" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 7. RINCIAN OUTPUT (RO)
// ═══════════════════════════════════════════════════════════════════════════════

export interface RincianOutput {
  kode: string;
  nama: string;
  klasifikasi: string;
  kegiatan: string;
  subKegiatan: string;
  komponen: string;
  satuan: string;
  pagu?: number;
}

export const rincianOutput: RincianOutput[] = [
  // REKAN Outputs
  { kode: "3382 BDB 001 001", nama: "Data dan Informasi Pelaporan Transaksi Keuangan", klasifikasi: "BDB - Fasilitasi dan Pembinaan", kegiatan: "3382", subKegiatan: "001", komponen: "001", satuan: "Dokumen" },
  { kode: "3382 BDB 001 002", nama: "Pengelolaan Kualitas Data Pelaporan", klasifikasi: "BDB - Fasilitasi dan Pembinaan", kegiatan: "3382", subKegiatan: "001", komponen: "002", satuan: "Dokumen" },
  { kode: "3382 BKC 001 001", nama: "Pemantauan Lembaga", klasifikasi: "BKC - Pemantauan Lembaga", kegiatan: "3382", subKegiatan: "001", komponen: "001", satuan: "Laporan" },
  { kode: "3382 BMA 001 001", nama: "Data dan Informasi Publik", klasifikasi: "BMA - Data dan Informasi Publik", kegiatan: "3382", subKegiatan: "001", komponen: "001", satuan: "Publikasi" },

  // PATIH Outputs
  { kode: "3365 DCF 001 001", nama: "Penyusunan Program Diklat", klasifikasi: "DCF - Pelatihan Bidang Ekonomi dan Keuangan", kegiatan: "3365", subKegiatan: "001", komponen: "001", satuan: "Program" },
  { kode: "3365 DCF 001 002", nama: "Pelaksanaan Diklat APU PPT", klasifikasi: "DCF - Pelatihan Bidang Ekonomi dan Keuangan", kegiatan: "3365", subKegiatan: "001", komponen: "002", satuan: "Orang" },
  { kode: "3365 DCF 001 003", nama: "Monitoring dan Evaluasi Diklat", klasifikasi: "DCF - Pelatihan Bidang Ekonomi dan Keuangan", kegiatan: "3365", subKegiatan: "001", komponen: "003", satuan: "Laporan" },
  { kode: "3365 DCG 001 001", nama: "Pelatihan bagi Aparat Penegak Hukum", klasifikasi: "DCG - Pelatihan Bidang Politik, Hukum, Pertahanan dan Keamanan", kegiatan: "3365", subKegiatan: "001", komponen: "001", satuan: "Orang" },

  // PENJAGA Outputs
  { kode: "3382 ABA 001 001", nama: "Kebijakan Bidang Ekonomi dan Keuangan", klasifikasi: "ABA - Kebijakan Bidang Ekonomi dan Keuangan", kegiatan: "3382", subKegiatan: "001", komponen: "001", satuan: "Regulasi" },
  { kode: "3382 BDB 002 001", nama: "Fasilitasi dan Pembinaan Lembaga", klasifikasi: "BDB - Fasilitasi dan Pembinaan", kegiatan: "3382", subKegiatan: "002", komponen: "001", satuan: "Kasus" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 8. UNIT KERJA PPATK - Dengan Klaster Deputi
// ═══════════════════════════════════════════════════════════════════════════════

export interface UnitKerja {
  singkatan: string;
  singkatanPendek: string;
  namaUnit: string;
  jenis: string;
  klaster: string;
  deputi?: string;
}

export const unitKerja: UnitKerja[] = [
  // ═══ DEPUTI BIDANG ANALISIS TRANSAKSI KEUANGAN (ASA) ═══
  { singkatan: "SIASAT", singkatanPendek: "S", namaUnit: "Direktorat Analisis dan Pemeriksaan I", jenis: "Direktorat", klaster: "ASA", deputi: "Deputi Bidang Analisis Transaksi Keuangan" },
  { singkatan: "SIDIK", singkatanPendek: "S", namaUnit: "Direktorat Analisis dan Pemeriksaan II", jenis: "Direktorat", klaster: "ASA", deputi: "Deputi Bidang Analisis Transaksi Keuangan" },
  { singkatan: "SIAGA", singkatanPendek: "S", namaUnit: "Direktorat Analisis dan Pemeriksaan III", jenis: "Direktorat", klaster: "ASA", deputi: "Deputi Bidang Analisis Transaksi Keuangan" },

  // ═══ DEPUTI BIDANG STRATEGI DAN KERJA SAMA (TEGAS) ═══
  { singkatan: "SALAM", singkatanPendek: "S", namaUnit: "Direktorat Strategi dan Kerja Sama Dalam Negeri", jenis: "Direktorat", klaster: "TEGAS", deputi: "Deputi Bidang Strategi dan Kerja Sama" },
  { singkatan: "SERASI", singkatanPendek: "S", namaUnit: "Direktorat Strategi dan Kerja Sama Internasional", jenis: "Direktorat", klaster: "TEGAS", deputi: "Deputi Bidang Strategi dan Kerja Sama" },
  { singkatan: "KREASI", singkatanPendek: "K", namaUnit: "Direktorat Hukum dan Regulasi", jenis: "Direktorat", klaster: "TEGAS", deputi: "Deputi Bidang Strategi dan Kerja Sama" },

  // ═══ DEPUTI BIDANG PELAPORAN DAN PENGAWASAN KEPATUHAN (PENGASUH) ═══
  { singkatan: "REKAN", singkatanPendek: "R", namaUnit: "Direktorat Pelaporan", jenis: "Direktorat", klaster: "PENGASUH", deputi: "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan" },
  { singkatan: "PENJAGA", singkatanPendek: "P", namaUnit: "Direktorat Pengawasan Kepatuhan Penyedia Jasa Keuangan", jenis: "Direktorat", klaster: "PENGASUH", deputi: "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan" },
  { singkatan: "PATUH", singkatanPendek: "P", namaUnit: "Direktorat Pengawasan Kepatuhan Penyedia Barang dan/atau Jasa Lain dan Profesi", jenis: "Direktorat", klaster: "PENGASUH", deputi: "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan" },

  // ═══ BIRO ═══
  { singkatan: "BINCANG", singkatanPendek: "B", namaUnit: "Biro Perencanaan dan Keuangan", jenis: "Biro", klaster: "BIRO" },
  { singkatan: "BERMAKNA", singkatanPendek: "B", namaUnit: "Biro Sumber Daya Manusia, Organisasi dan Tata Laksana", jenis: "Biro", klaster: "BIRO" },
  { singkatan: "BIRU", singkatanPendek: "B", namaUnit: "Biro Umum", jenis: "Biro", klaster: "BIRO" },

  // ═══ PUSAT ═══
  { singkatan: "PATIH", singkatanPendek: "P", namaUnit: "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme", jenis: "Pusat", klaster: "PUSAT" },
  { singkatan: "BERMITRA", singkatanPendek: "B", namaUnit: "Pusat Pemberdayaan Kemitraan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme", jenis: "Pusat", klaster: "PUSAT" },
  { singkatan: "LOGIS", singkatanPendek: "L", namaUnit: "Pusat Teknologi Informasi", jenis: "Pusat", klaster: "PUSAT" },

  // ═══ INSPEKTORAT ═══
  { singkatan: "PEKA", singkatanPendek: "P", namaUnit: "Inspektorat", jenis: "Inspektorat", klaster: "INSPEKTORAT" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 9. KELOMPOK RINCIAN OUTPUT (KRO)
// ═══════════════════════════════════════════════════════════════════════════════

export interface KelompokRincianOutput {
  kode: string;
  nama: string;
  klasifikasi: string;
  kegiatan: string;
  unit: string;
}

export const kelompokRincianOutput: KelompokRincianOutput[] = [
  { kode: "3382 BDB", nama: "Fasilitasi dan Pembinaan", klasifikasi: "BDB", kegiatan: "3382", unit: "REKAN" },
  { kode: "3382 BKC", nama: "Pemantauan Lembaga", klasifikasi: "BKC", kegiatan: "3382", unit: "REKAN" },
  { kode: "3382 BMA", nama: "Data dan Informasi Publik", klasifikasi: "BMA", kegiatan: "3382", unit: "REKAN" },
  { kode: "3382 ABA", nama: "Kebijakan Bidang Ekonomi dan Keuangan", klasifikasi: "ABA", kegiatan: "3382", unit: "SIASAT" },
  { kode: "3365 DCF", nama: "Pelatihan Bidang Ekonomi dan Keuangan", klasifikasi: "DCF", kegiatan: "3365", unit: "PATIH" },
  { kode: "3365 DCG", nama: "Pelatihan Bidang Politik, Hukum, Pertahanan dan Keamanan", klasifikasi: "DCG", kegiatan: "3365", unit: "PATIH" },
  { kode: "3379 AAH", nama: "Peraturan lainnya", klasifikasi: "AAH", kegiatan: "3379", unit: "KREASI" },
  { kode: "3379 BCE", nama: "Penanganan Perkara", klasifikasi: "BCE", kegiatan: "3379", unit: "KREASI" },
  { kode: "3380 AEC", nama: "Kerja sama", klasifikasi: "AEC", kegiatan: "3380", unit: "SERASI" },
  { kode: "3380 PEC", nama: "Kerja sama", klasifikasi: "PEC", kegiatan: "3380", unit: "SALAM" },
  { kode: "3381 CAN", nama: "Sarana Bidang Teknologi Informasi dan Komunikasi", klasifikasi: "CAN", kegiatan: "3381", unit: "LOGIS" },
  { kode: "3381 CCL", nama: "OP Sarana Bidang Teknologi Informasi dan Komunikasi", klasifikasi: "CCL", kegiatan: "3381", unit: "LOGIS" },
  { kode: "WA EBA", nama: "Layanan Dukungan Manajemen Internal", klasifikasi: "EBA", kegiatan: "WA", unit: "BINCANG" },
  { kode: "WA EBC", nama: "Layanan Manajemen SDM Internal", klasifikasi: "EBC", kegiatan: "WA", unit: "BERMAKNA" },
  { kode: "WA EBB", nama: "Layanan Sarana dan Prasarana Internal", klasifikasi: "EBB", kegiatan: "WA", unit: "BIRU" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 10. PROGRAM
// ═══════════════════════════════════════════════════════════════════════════════

export interface Program {
  kode: string;
  nama: string;
}

export const programList: Program[] = [
  { kode: "BE", nama: "Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme" },
  { kode: "WA", nama: "Program Dukungan Manajemen" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 11. KEGIATAN
// ═══════════════════════════════════════════════════════════════════════════════

export interface Kegiatan {
  kode: string;
  nama: string;
  program: string;
  unitPengampu: string;
}

export const kegiatanList: Kegiatan[] = [
  { kode: "3382", nama: "Pengelolaan Data Pelaporan dan Pengawasan Kepatuhan Pihak Pelapor PPATK", program: "BE", unitPengampu: "REKAN" },
  { kode: "3365", nama: "Pendidikan dan Pelatihan Anti Pencucian Uang PPATK", program: "BE", unitPengampu: "PATIH" },
  { kode: "3379", nama: "Pengelolaan Bidang Hukum dan Regulasi PPATK", program: "BE", unitPengampu: "KREASI" },
  { kode: "3380", nama: "Pelaksanaan Kerjasama Dalam Negeri dan Internasional TPPU TPPT dan PPSPM", program: "BE", unitPengampu: "SERASI" },
  { kode: "3381", nama: "Pengelolaan Teknologi Informasi PPATK", program: "BE", unitPengampu: "LOGIS" },
  { kode: "WA", nama: "Program Dukungan Manajemen", program: "WA", unitPengampu: "BINCANG" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 12. SATUAN KERJA (SATKER)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SatuanKerja {
  kodeKL: string;
  namaKL: string;
  kodeSatker: string;
  namaSatker: string;
  unitUtama: string;
  tahunAnggaran: number;
}

export const satuanKerja: SatuanKerja[] = [
  {
    kodeKL: "078",
    namaKL: "Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK)",
    kodeSatker: "417654",
    namaSatker: "Pusdiklat Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
    unitUtama: "PATIH",
    tahunAnggaran: 2027,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function getUnitKerjaByKlaster(klaster: string): UnitKerja[] {
  return unitKerja.filter(u => u.klaster === klaster);
}

export function getUnitKerjaByDeputi(deputi: string): UnitKerja[] {
  return unitKerja.filter(u => u.deputi === deputi);
}

export function getKROByUnit(unit: string): KelompokRincianOutput[] {
  return kelompokRincianOutput.filter(k => k.unit === unit);
}

export function getSasaranByProgram(programKode: string): SasaranProgram[] {
  return sasaranProgram.filter(sp => sp.kegiatan.includes(programKode) || sp.program.includes(programKode));
}

export function getIndikatorHierarchy(tahun?: number): any[] {
  return nomenklaturTujuan.map(tujuan => ({
    ...tujuan,
    children: sasaranStrategis.map(ss => ({
      ...ss,
      children: sasaranProgram
        .filter(sp => sp.indikator.length > 0)
        .map(sp => ({
          ...sp,
          children: sasaranKegiatan
            .filter(sk => sk.indikator.length > 0)
            .map(sk => ({
              ...sk,
              children: sk.indikator.map(ind => ({
                ...ind,
                target2027: ind.target[tahun || 2027],
              })),
            })),
        })),
    })),
  }));
}

export const klasterList = [
  { kode: "ASA", nama: "Deputi Bidang Analisis Transaksi Keuangan", warna: "blue" },
  { kode: "TEGAS", nama: "Deputi Bidang Strategi dan Kerja Sama", warna: "green" },
  { kode: "PENGASUH", nama: "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan", warna: "purple" },
  { kode: "BIRO", nama: "Biro", warna: "amber" },
  { kode: "PUSAT", nama: "Pusat", warna: "cyan" },
  { kode: "INSPEKTORAT", nama: "Inspektorat", warna: "red" },
];
