// src/data/ppatkData.ts
// Data Master & Rujukan Resmi PPATK (Renstra 2025-2029, Renja SETIA 2027, Renja PATIH 2027, TOR & RAB)

export interface RabItem {
  id: string;
  akun: string;
  namaAkun: string;
  item: string;
  faktor1: { jml: number; satuan: string };
  faktor2: { jml: number; satuan: string };
  faktor3: { jml: number; satuan: string };
  faktor4: { jml: number; satuan: string };
  satuanBiaya: number;
  totalVolumeSatuan: string;
}

export const mockRabItems: RabItem[] = [
  // 521211 - Belanja Bahan
  {
    id: "RAB-01",
    akun: "521211",
    namaAkun: "Belanja Bahan",
    item: "Snack Peserta & Panitia",
    faktor1: { jml: 40, satuan: "orang" },
    faktor2: { jml: 2, satuan: "kali" },
    faktor3: { jml: 4, satuan: "hari" },
    faktor4: { jml: 13, satuan: "keg" },
    satuanBiaya: 18000,
    totalVolumeSatuan: "OK",
  },
  {
    id: "RAB-02",
    akun: "521211",
    namaAkun: "Belanja Bahan",
    item: "Makan Peserta & Panitia",
    faktor1: { jml: 40, satuan: "orang" },
    faktor2: { jml: 3, satuan: "kali" },
    faktor3: { jml: 4, satuan: "hari" },
    faktor4: { jml: 13, satuan: "keg" },
    satuanBiaya: 43000,
    totalVolumeSatuan: "OK",
  },
  {
    id: "RAB-03",
    akun: "521211",
    namaAkun: "Belanja Bahan",
    item: "Alat Peraga Penyelenggaraan",
    faktor1: { jml: 3, satuan: "set" },
    faktor2: { jml: 1, satuan: "hari" },
    faktor3: { jml: 1, satuan: "kali" },
    faktor4: { jml: 13, satuan: "keg" },
    satuanBiaya: 150000,
    totalVolumeSatuan: "OH",
  },
  {
    id: "RAB-04",
    akun: "521211",
    namaAkun: "Belanja Bahan",
    item: "Pencetakan Sertifikat & Banner",
    faktor1: { jml: 1, satuan: "dok" },
    faktor2: { jml: 1, satuan: "keg" },
    faktor3: { jml: 1, satuan: "kali" },
    faktor4: { jml: 1, satuan: "paket" },
    satuanBiaya: 2856000,
    totalVolumeSatuan: "Dok",
  },
  // 521811 - Belanja Barang Persediaan Konsumsi
  {
    id: "RAB-05",
    akun: "521811",
    namaAkun: "Belanja Barang Persediaan Barang Konsumsi",
    item: "Diklat Kit (Totebag, Pouch, Block Note, Pulpen, Lanyard, E-Money)",
    faktor1: { jml: 30, satuan: "orang" },
    faktor2: { jml: 13, satuan: "keg" },
    faktor3: { jml: 1, satuan: "kali" },
    faktor4: { jml: 1, satuan: "paket" },
    satuanBiaya: 200000,
    totalVolumeSatuan: "Dok",
  },
  // 521219 - Belanja Barang Non Operasional Lainnya
  {
    id: "RAB-06",
    akun: "521219",
    namaAkun: "Belanja Barang Non Operasional Lainnya",
    item: "Cuci Pakaian Harian Peserta (Laundry)",
    faktor1: { jml: 30, satuan: "orang" },
    faktor2: { jml: 1, satuan: "kali" },
    faktor3: { jml: 2, satuan: "kali" },
    faktor4: { jml: 13, satuan: "keg" },
    satuanBiaya: 24500,
    totalVolumeSatuan: "OK",
  },
  {
    id: "RAB-07",
    akun: "521219",
    namaAkun: "Belanja Barang Non Operasional Lainnya",
    item: "Biaya Pengobatan & P3K Peserta Diklat",
    faktor1: { jml: 1, satuan: "orang" },
    faktor2: { jml: 1, satuan: "kali" },
    faktor3: { jml: 13, satuan: "keg" },
    faktor4: { jml: 1, satuan: "paket" },
    satuanBiaya: 200000,
    totalVolumeSatuan: "Keg",
  },
  // 521213 - Belanja Honor Output Kegiatan
  {
    id: "RAB-08",
    akun: "521213",
    namaAkun: "Belanja Honor Output Kegiatan",
    item: "Honorarium Penceramah / Keynote Speaker",
    faktor1: { jml: 1, satuan: "orang" },
    faktor2: { jml: 4, satuan: "jam" },
    faktor3: { jml: 1, satuan: "hari" },
    faktor4: { jml: 13, satuan: "keg" },
    satuanBiaya: 1000000,
    totalVolumeSatuan: "OJP",
  },
  {
    id: "RAB-09",
    akun: "521213",
    namaAkun: "Belanja Honor Output Kegiatan",
    item: "Honorarium Pengajar di Luar Satker",
    faktor1: { jml: 5, satuan: "orang" },
    faktor2: { jml: 5, satuan: "jam" },
    faktor3: { jml: 4, satuan: "hari" },
    faktor4: { jml: 13, satuan: "keg" },
    satuanBiaya: 300000,
    totalVolumeSatuan: "OJP",
  },
  // 524111 - Belanja Perjalanan Dinas Biasa
  {
    id: "RAB-10",
    akun: "524111",
    namaAkun: "Belanja Perjalanan Dinas Biasa",
    item: "Transport Jakarta - Cimanggis Pengajar",
    faktor1: { jml: 3, satuan: "orang" },
    faktor2: { jml: 1, satuan: "kali" },
    faktor3: { jml: 3, satuan: "hari" },
    faktor4: { jml: 13, satuan: "keg" },
    satuanBiaya: 496000,
    totalVolumeSatuan: "OK",
  },
  {
    id: "RAB-11",
    akun: "524111",
    namaAkun: "Belanja Perjalanan Dinas Biasa",
    item: "Transport Peserta DKI Jakarta - Cimanggis",
    faktor1: { jml: 30, satuan: "orang" },
    faktor2: { jml: 1, satuan: "kali" },
    faktor3: { jml: 1, satuan: "hari" },
    faktor4: { jml: 1, satuan: "keg" },
    satuanBiaya: 496000,
    totalVolumeSatuan: "OK",
  },
  {
    id: "RAB-12",
    akun: "524111",
    namaAkun: "Belanja Perjalanan Dinas Biasa",
    item: "Uang Harian Diklat Peserta",
    faktor1: { jml: 30, satuan: "orang" },
    faktor2: { jml: 1, satuan: "kali" },
    faktor3: { jml: 5, satuan: "hari" },
    faktor4: { jml: 13, satuan: "keg" },
    satuanBiaya: 130000,
    totalVolumeSatuan: "OK",
  },
  {
    id: "RAB-13",
    akun: "524111",
    namaAkun: "Belanja Perjalanan Dinas Biasa",
    item: "Tiket Pesawat PP Jakarta - Denpasar",
    faktor1: { jml: 2, satuan: "orang" },
    faktor2: { jml: 1, satuan: "kali" },
    faktor3: { jml: 13, satuan: "keg" },
    faktor4: { jml: 1, satuan: "hari" },
    satuanBiaya: 3262000,
    totalVolumeSatuan: "OK",
  },
  {
    id: "RAB-14",
    akun: "524111",
    namaAkun: "Belanja Perjalanan Dinas Biasa",
    item: "Tiket Pesawat PP Jakarta - Manado",
    faktor1: { jml: 2, satuan: "orang" },
    faktor2: { jml: 1, satuan: "kali" },
    faktor3: { jml: 13, satuan: "keg" },
    faktor4: { jml: 1, satuan: "hari" },
    satuanBiaya: 7081000,
    totalVolumeSatuan: "OK",
  },
  {
    id: "RAB-15",
    akun: "524111",
    namaAkun: "Belanja Perjalanan Dinas Biasa",
    item: "Tiket Pesawat PP Jakarta - Papua",
    faktor1: { jml: 2, satuan: "orang" },
    faktor2: { jml: 1, satuan: "kali" },
    faktor3: { jml: 13, satuan: "keg" },
    faktor4: { jml: 1, satuan: "hari" },
    satuanBiaya: 7576800,
    totalVolumeSatuan: "OK",
  },
  {
    id: "RAB-16",
    akun: "524111",
    namaAkun: "Belanja Perjalanan Dinas Biasa",
    item: "Tiket Pesawat PP Jakarta - Maluku",
    faktor1: { jml: 3, satuan: "orang" },
    faktor2: { jml: 1, satuan: "kali" },
    faktor3: { jml: 13, satuan: "keg" },
    faktor4: { jml: 1, satuan: "hari" },
    satuanBiaya: 7576800,
    totalVolumeSatuan: "OK",
  },
];

// Master Bagan Akun Standar (BAS 6 Digit)
// Imported from complete BAS reference data (baganAkunStandar.ts)
export { baganAkunStandar as mockBaganAkunStandar } from './baganAkunStandar';
export type { BaganAkunStandar } from './baganAkunStandar';

// Master Data Pejabat PPATK
export const mockPejabat = [
  {
    id: "PEJ-01",
    nama: "Dr. Ivan Yustiavandana, S.H., LL.M.",
    nip: "197103141998031001",
    jabatan: "Kepala PPATK",
    pangkat: "Utama / IV.e",
    unitKerja: "Pusat Pelaporan dan Analisis Transaksi Keuangan",
    roleTtd: ["Pengesahan Renstra", "Persetujuan Akhir"],
    status: "Aktif",
  },
  {
    id: "PEJ-02",
    nama: "Ir. Alberd Teddy Benhard Sianipar, S.I.K., M.H.",
    nip: "197508211999031002",
    jabatan: "Sekretaris Utama",
    pangkat: "Utama Madya / IV.d",
    unitKerja: "Sekretariat Utama",
    roleTtd: ["Penandatangan Renja SETIA (Eselon I)", "KPA Satker Sestama"],
    status: "Aktif",
  },
  {
    id: "PEJ-03",
    nama: "Fithriadi",
    nip: "197604121999031001",
    jabatan: "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan",
    pangkat: "Utama Madya / IV.d",
    unitKerja: "Deputi PENGASUH",
    roleTtd: ["Penandatangan Renja Deputi PENGASUH (Eselon I)"],
    status: "Aktif",
  },
  {
    id: "PEJ-04",
    nama: "Danang Tri Hartono, S.H., M.H.",
    nip: "197508211999031003",
    jabatan: "Deputi Bidang Pemberantasan",
    pangkat: "Utama Madya / IV.d",
    unitKerja: "Deputi TEGAS",
    roleTtd: ["Penandatangan Renja Deputi TEGAS (Eselon I)"],
    status: "Aktif",
  },
  {
    id: "PEJ-05",
    nama: "Fitri Rachmadi",
    nip: "197709182000031002",
    jabatan: "Deputi Bidang Analisis dan Pemeriksaan",
    pangkat: "Utama Madya / IV.d",
    unitKerja: "Deputi ASA",
    roleTtd: ["Penandatangan Renja Deputi ASA (Eselon I)"],
    status: "Aktif",
  },
  {
    id: "PEJ-06",
    nama: "Akhyar Effendi, S.E., M.M.",
    nip: "198602231993031001",
    jabatan: "Kepala Pusat Pendidikan dan Pelatihan APU PPT",
    pangkat: "Pembina Tk. I / IV.b",
    unitKerja: "Pusdiklat APU PPT (PATIH)",
    roleTtd: ["Penandatangan Renja PATIH (Eselon II)", "KPA Satker Pusdiklat", "Pengesahan TOR Diklat"],
    status: "Aktif",
  },
  {
    id: "PEJ-07",
    nama: "Budi Santoso, S.Sos., M.Ak.",
    nip: "198205122006041003",
    jabatan: "Pejabat Pembuat Komitmen (PPK) Diklat APU PPT",
    pangkat: "Penata Tk. I / III.d",
    unitKerja: "Pusdiklat APU PPT",
    roleTtd: ["Penandatangan RAB Pagu Indikatif", "Penyusun KAK/TOR"],
    status: "Aktif",
  },
  {
    id: "PEJ-08",
    nama: "Sari Wulandari, S.E.",
    nip: "198809152010122002",
    jabatan: "Bendahara Pengeluaran Pusdiklat",
    pangkat: "Penata Muda / III.a",
    unitKerja: "Pusdiklat APU PPT",
    roleTtd: ["Verifikasi Keuangan", "LPJ Bendahara"],
    status: "Aktif",
  },
];

// Master Data Pengguna Aplikasi
export const mockPengguna = [
  {
    id: "USR-01",
    nama: "Budi Santoso, S.Sos",
    email: "budi.santoso@ppatk.go.id",
    role: "Admin Perencanaan & PPK",
    unitKerja: "Pusdiklat APUPPT",
    status: "Online",
    terakhirLogin: "Hari ini, 09:12 WIB",
  },
  {
    id: "USR-02",
    nama: "Danang Tri Hartono, S.H.",
    email: "danang.tri@ppatk.go.id",
    role: "Plt. Sestama (Approver Eselon I)",
    unitKerja: "Sekretariat Utama",
    status: "Offline",
    terakhirLogin: "Kemarin, 16:45 WIB",
  },
  {
    id: "USR-03",
    nama: "Akhyar Effendi, S.E.",
    email: "akhyar.effendi@ppatk.go.id",
    role: "Kapusdiklat (Approver Eselon II)",
    unitKerja: "Pusdiklat APUPPT",
    status: "Online",
    terakhirLogin: "Hari ini, 08:30 WIB",
  },
  {
    id: "USR-04",
    nama: "Ahmad Fauzi",
    email: "ahmad.fauzi@ppatk.go.id",
    role: "Operator Anggaran Satker",
    unitKerja: "Biro Perencanaan dan Keuangan",
    status: "Online",
    terakhirLogin: "Hari ini, 09:40 WIB",
  },
  {
    id: "USR-05",
    nama: "Rina Marlina",
    email: "rina.marlina@ppatk.go.id",
    role: "Auditor Internal / Pengawas",
    unitKerja: "Inspektorat",
    status: "Offline",
    terakhirLogin: "2 hari lalu",
  },
];

// Master Standar Biaya Keluaran (SBK) & Standar Biaya Masukan (SBM)
export const mockSbk = [
  {
    kode: "SBK-01",
    nama: "SBK Penyelenggaraan Diklat Klasikal APH (Berasrama)",
    satuan: "Orang / 5 Hari",
    paguMaks: 5665000,
    dasarHukum: "Keputusan Kepala PPATK / PMK SBK",
    keterangan: "Meliputi konsumsi, diklat kit, pengajar, uang harian, dan tiket pesawat PP wilayah risiko",
  },
  {
    kode: "SBK-02",
    nama: "SBK Penyelenggaraan Diklat Pihak Pelapor (Non-APH)",
    satuan: "Orang / 3 Hari",
    paguMaks: 3880000,
    dasarHukum: "Keputusan Kepala PPATK",
    keterangan: "Pelatihan teknis identifikasi TKM, KUPVA, PJK, PBJ",
  },
  {
    kode: "SBK-03",
    nama: "SBK Penyusunan Dokumen Analisis Strategis / Tipologi",
    satuan: "Dokumen Laporan",
    paguMaks: 350000000,
    dasarHukum: "Standar Biaya Keluaran Kedeputian Analisis",
    keterangan: "Kajian tipologi money laundering & financing of terrorism",
  },
];

export const mockSbm: any[] = [];

// Data Renstra PPATK 2025-2029
export const mockRenstra = {
  visi: "Bersinergi Membangun Indonesia Tanpa Pencucian Uang dalam rangka Mewujudkan Indonesia Maju Menuju Indonesia Emas 2045",
  misi: [
    "Memperkuat kebijakan pengelolaan laporan transaksi keuangan.",
    "Meningkatkan produk intelijen keuangan yang berkualitas.",
    "Memperkuat kerjasama di tingkat domestik, regional, dan internasional.",
    "Memperkuat tata kelola PPATK dalam pencegahan dan pemberantasan pencucian uang.",
  ],
  tujuan: "Terwujudnya efektivitas kinerja rezim Anti Pencucian Uang, Pencegahan Pendanaan Terorisme (APU PPT) dan Pencegahan Pendanaan Proliferasi Senjata Pemusnah Massal (PPSPM) yang Terintegrasi dan Inklusif",
  sasaranStrategis: [
    {
      kode: "SS.1",
      nama: "Meningkatnya Efektivitas Kinerja PPATK dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM",
      indikator: [
        { kode: "IKSS 1.1", nama: "Indeks Efektivitas Kinerja PPATK", satuan: "Indeks", t2025: 7.0, t2026: 7.3, t2027: 7.3, t2028: 7.3, t2029: 8.0 },
        { kode: "IKSS 1.2", nama: "Indeks Implementasi Program TPPU TPPT dan PPSPM PPATK", satuan: "Indeks", t2025: 5.8, t2026: 6.3, t2027: 6.8, t2028: 7.2, t2029: 7.7 },
      ],
    },
    {
      kode: "SS.2",
      nama: "Meningkatnya Kinerja Revitalisasi Birokrasi PPATK",
      indikator: [
        { kode: "IKSS 2.1", nama: "Nilai Reformasi Birokrasi PPATK", satuan: "Nilai", t2025: 81, t2026: 82, t2027: 83, t2028: 84, t2029: 85 },
      ],
    },
  ],
  sasaranProgram: [
    { kode: "SP.1", nama: "Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan Pihak Pelapor", pengampu: "Kedeputian Pelaporan & Pengawasan Kepatuhan" },
    { kode: "SP.2", nama: "Meningkatnya Tindak Lanjut Produk Intelijen Keuangan PPATK (PIK)", pengampu: "Kedeputian Analisis dan Pemeriksaan" },
    { kode: "SP.3", nama: "Meningkatnya Efektivitas Strategi, Kebijakan dan Regulasi APU PPT dan PPSPM", pengampu: "Kedeputian Strategi dan Kerja Sama" },
    { kode: "SP.4", nama: "Meningkatnya Efektivitas Kerja Sama APU PPT dan PPSPM", pengampu: "Kedeputian Strategi dan Kerja Sama" },
    { kode: "SP.5", nama: "Terwujudnya Transformasi Digital dan Integrasi Sistem Informasi PPATK", pengampu: "Pusat Teknologi Informasi" },
    { kode: "SP.6", nama: "Meningkatnya Tata Kelola Internal PPATK", pengampu: "Sekretariat Utama" },
  ],
  pendanaanKegiatan2027: [
    { kode: "3365", nama: "Pendidikan dan Pelatihan APU PPT (Pusdiklat)", pagu2027: 6914365000 },
    { kode: "3384", nama: "Pelaksanaan Analisis Transaksi dan Pemeriksaan", pagu2027: 41108346000 },
    { kode: "3381", nama: "Pengelolaan Teknologi Informasi PPATK", pagu2027: 555000000000 },
    { kode: "3375", nama: "Pengelolaan Perencanaan dan Keuangan PPATK", pagu2027: 205960605000 },
    { kode: "3377", nama: "Penyelenggaraan Ketatausahaan, Kerumahtanggaan, Perlengkapan", pagu2027: 255673008000 },
  ],
  regulasiRenstra: [
    { no: 1, nama: "RUU Perampasan Aset", urgensi: "Merampas aset tindak pidana tanpa penghukuman pelaku (in rem), pemulihan kerugian negara", unit: "Dit. Hukum dan Regulasi", target: "2025-2029" },
    { no: 2, nama: "RUU Pembatasan Transaksi Uang Kartal", urgensi: "Menekan penggunaan uang tunai sebagai sarana tindak pidana TPPU", unit: "Dit. Hukum dan Regulasi", target: "2025-2029" },
    { no: 3, nama: "Perka Juknis Audit Kepatuhan & Khusus bagi Pihak Pelapor", urgensi: "Standar baku audit kepatuhan berbasis risiko", unit: "Dit. Pengawasan Kepatuhan", target: "2025" },
    { no: 4, nama: "Perka Pedoman DTTOT & Pemblokiran Serta Merta", urgensi: "Pemenuhan Rekomendasi 6 FATF", unit: "Dit. Pengawasan PBJ/Profesi", target: "2025" },
    { no: 5, nama: "Perka Tata Cara Analisis dan Pemeriksaan", urgensi: "Penyempurnaan Perka 19/2013 mengikuti perkembangan modus TPPU", unit: "Deputi Analisis & Pemeriksaan", target: "2025" },
    { no: 6, nama: "Perpres No. 88 Tahun 2025 tentang Komite TPPU", urgensi: "Penguatan koordinasi nasional pencegahan & pemberantasan TPPU", unit: "Dit. Strategi & Kerjasama", target: "2025" },
    { no: 7, nama: "Perka Manajemen Talenta ASN PPATK", urgensi: "Sistem merit karir pegawai berbasis talent pool & kompetensi", unit: "Biro SDM & Ortala", target: "2026-2027" },
    { no: 8, nama: "Perka Standar Operasional Prosedur (SOP)", urgensi: "Standarisasi alur kerja proses bisnis PPATK", unit: "Biro SDM & Ortala", target: "2025-2026" },
    { no: 9, nama: "Perka Proses Bisnis PPATK Level 0-2", urgensi: "Penyempurnaan SK 44/2023", unit: "Biro SDM & Ortala", target: "2026-2027" },
    { no: 10, nama: "Perubahan Perka No. 2 Tahun 2024 tentang SAKIP", urgensi: "Penyempurnaan sistem pengelolaan akuntabilitas kinerja", unit: "Biro Perencanaan & Keuangan", target: "2025" },
  ],
};
