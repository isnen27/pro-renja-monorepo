export interface SasaranRenjaItem {
  program: string;
  sasaran: string;
  ikp: string;
  isProgramLevel?: boolean;
}

// Sasaran Program & IKP Utama (Tingkat Program BE & WA)
export const programSasaranRenjaData: SasaranRenjaItem[] = [
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "01 - Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pembertantasan TPPU, TPPT dan PPSPM",
    "ikp": "01 - Indeks Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "02 - Meningkatnya Tindak Lanjut Produk Intelijen Keuangan PPATK (PIK)",
    "ikp": "01 - Persentase Produk Inteligen Keuangan yang Berkontribusi pada Penerimaan Negara",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "03 - Meningkatnya Efektivitas Strategi, Kebijakan dan Regulasi APU PPT dan PPSPM",
    "ikp": "01 - Indeks Efektivitas Strategi Regulasi dan Layanan Hukum PPATK",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "03 - Meningkatnya Efektivitas Strategi, Kebijakan dan Regulasi APU PPT dan PPSPM",
    "ikp": "02 - Indeks Pemanfaatan Rekomendasi yang dihasilkan PPATK",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "04 - Meningkatnya Efektivitas Kerjasama APU PPT dan PPSPM",
    "ikp": "01 - Persentase Pemenuhan Kewajiban Kontribusi Tenaga Ahli untuk FATF",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "04 - Meningkatnya Efektivitas Kerjasama APU PPT dan PPSPM",
    "ikp": "02 - Persentase Penyampaian Intervensi Indonesia yang Diterima di Forum Internasional APU PPT PPSPM",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "04 - Meningkatnya Efektivitas Kerjasama APU PPT dan PPSPM",
    "ikp": "03 - Indeks Kerja Sama Dalam Negeri",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "05 - Terwujudnya Transformasi Digital dan Integrasi SIstem Informasi PPATK",
    "ikp": "01 - Indeks Tata Kelola Teknologi Informasi",
    "isProgramLevel": true
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "01 - Meningkatnya Tata Kelola Internal PPATK",
    "ikp": "01 - Nilai Reformasi Birokrasi General",
    "isProgramLevel": true
  }
];

// Seluruh Sasaran Program & IKP (Tingkat Program & Kegiatan)
export const sasaranRenjaData: SasaranRenjaItem[] = [
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "01 - Meningkatnya Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pembertantasan TPPU, TPPT dan PPSPM",
    "ikp": "01 - Indeks Kebermanfaatan Data Pelaporan PPATK dan Kepatuhan dalam Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "02 - Meningkatnya Tindak Lanjut Produk Intelijen Keuangan PPATK (PIK)",
    "ikp": "01 - Persentase Produk Inteligen Keuangan yang Berkontribusi pada Penerimaan Negara",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "03 - Meningkatnya Efektivitas Strategi, Kebijakan dan Regulasi APU PPT dan PPSPM",
    "ikp": "01 - Indeks Efektivitas Strategi Regulasi dan Layanan Hukum PPATK",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "03 - Meningkatnya Efektivitas Strategi, Kebijakan dan Regulasi APU PPT dan PPSPM",
    "ikp": "02 - Indeks Pemanfaatan Rekomendasi yang dihasilkan PPATK",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "04 - Meningkatnya Efektivitas Kerjasama APU PPT dan PPSPM",
    "ikp": "01 - Persentase Pemenuhan Kewajiban Kontribusi Tenaga Ahli untuk FATF",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "04 - Meningkatnya Efektivitas Kerjasama APU PPT dan PPSPM",
    "ikp": "02 - Persentase Penyampaian Intervensi Indonesia yang Diterima di Forum Internasional APU PPT PPSPM",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "04 - Meningkatnya Efektivitas Kerjasama APU PPT dan PPSPM",
    "ikp": "03 - Indeks Kerja Sama Dalam Negeri",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "05 - Terwujudnya Transformasi Digital dan Integrasi SIstem Informasi PPATK",
    "ikp": "01 - Indeks Tata Kelola Teknologi Informasi",
    "isProgramLevel": true
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "01 - Meningkatnya Kompetensi SDM APU PPT dan PPSPM",
    "ikp": "01 - Indeks Efektivitas Pengembangan Kompetensi SDM APU PPT dan PPSPM",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "02 - Meningkatnya Kompetensi Aparat Penegak Hukum APU PPT PPPSPM",
    "ikp": "01 - Indeks Efektivitas Pengembangan Kompetensi Aparat Penegak Hukum APU PPT PPSPM",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "01 - Meningkatnya Efektivitas Strategi dalam Bidang Regulasi Nasional terkait APUPPT PPSPM",
    "ikp": "01 - Persentase Pemenuhan Permintaan Penyusunan Regulasi PPATK",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "01 - Meningkatnya Efektivitas Strategi dalam Bidang Regulasi Nasional terkait APUPPT PPSPM",
    "ikp": "02 - Persentase Pemenuhan Layanan Hukum PPATK",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "02 - Peningkatan Kontribusi PPATK dalam Forum APU PPT PPSPM",
    "ikp": "01 - Persentase Penyampaian Intervensi Indonesia yang Diterima di Forum Teknis FATF dan FSRB",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "02 - Peningkatan Kontribusi PPATK dalam Forum APU PPT PPSPM",
    "ikp": "02 - Persentase Pemenuhan Kajian Implementasi Standar Internasional",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "03 - Meningkatnya Efektivitas Implementasi Kerjasama Dalam Negeri",
    "ikp": "01 - Persentase Implementasi Perjanjian Kerja sama Dalam Negeri di Bidang Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "03 - Meningkatnya Efektivitas Implementasi Kerjasama Dalam Negeri",
    "ikp": "02 - Persentase Penerapan Indikator Operational Alert (OA) dari Kebijakan Public Private Partnership",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "04 - Meningkatnya Efektivitas Kerjasama Internasional",
    "ikp": "01 - Indeks Efektivitas Kerja Sama Internasional",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "05 - Meningkatnya Implementasi Standar dan Konvensi Internasional di Bidang Pencegahan dan Pemberantasan TPPU, TPPT, dan PPSPM",
    "ikp": "01 - Persentase Implementasi Rekomendasi Standar dan Konvensi Internasional di Bidang Pencegahan dan Pemberantasan TPPU, TPPT dan PPSPM",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "01 - Meningkatnya Pengelolaan Teknologi Informasi yang Berkualitas, Sistematis dan Terintegrasi",
    "ikp": "01 - Persentase Implementasi Roadmap IT Masterplan",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "01 - Meningkatnya Pengelolaan Teknologi Informasi yang Berkualitas, Sistematis dan Terintegrasi",
    "ikp": "02 - Persentase Uptime Sistem Core",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "01 - Meningkatnya Kualitas Data Pelaporan PPATK",
    "ikp": "01 - Indeks Peningkatan Kualitas Data Pelaporan PPATK",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "02 - Meningkatnya Efektivitas Pengelolaan Data, Informasi dan Statistik",
    "ikp": "01 - Indeks Efektivitas Pengelolaan Data, Informasi dan Statistik",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "03 - Meningkatnya Kepatuhan Pihak Pelapor Berbasis Risiko",
    "ikp": "01 - Indeks Efektivitas Pengawasan Kepatuhan Pihak Pelapor Berbasis Risiko (Penyedia Jasa Keuangan)",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "03 - Meningkatnya Kepatuhan Pihak Pelapor Berbasis Risiko",
    "ikp": "02 - Indeks Efektivitas Pengawasan Kepatuhan Pihak Pelapor Berbasis Risiko (Penyedia Barang dan Jasa)",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "04 - Meningkatnya Registrasi Pihak Pelapor Berdasarkan Tingkat Risiko Pihak Pelapor",
    "ikp": "01 - Persentase Pihak Pelapor yang Melakukan Registrasi GoAML Berdasarkan Kategori Risiko Tinggi-Menengah",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "05 - Penguatan Kebijakan Pelaporan Guna Peningkatan Tata Kelola Pelaporan yang Adaptif dalam Mendukung Pencegahan dan Pemberantasan TPPU, TPPT, dan PPSPM",
    "ikp": "01 - Indeks Evaluasi Kebijakan Pelaporan",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "01 - Meningkatnya Produk Intelijen Keuangan PPATK (PIK) Proaktif yang ditindaklanjuti oleh Penyidik dan Instansi Lainnya",
    "ikp": "01 - Persentase Pemanfaatan Produk Intelijen Keuangan Proaktif",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "02 - Terpenuhinya Permintaan Data dan Informasi Intelijen PPATK",
    "ikp": "01 - Persentase Pemenuhan Permintaan Informasi terkait Kelayakan dan Kepatuhan Pengisian Jabatan Pejabat Negara dan/atau Jabatan Strategis yang Memenuhi Jangka Waktu sesuai dengan Standar Layanan Minimal",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "02 - Terpenuhinya Permintaan Data dan Informasi Intelijen PPATK",
    "ikp": "02 - Persentase Pemenuhan Permintaan Data dan Informasi Intelijen oleh PPATK",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "02 - Terpenuhinya Permintaan Data dan Informasi Intelijen PPATK",
    "ikp": "03 - Persentase Pemanfaatan atas Produk Intelijen Keuangan Reaktif",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "03 - Meningkatnya Penegakan Hukum TPPU, TPPT dan PPSPM yang Berasal dari Produk Intelijen Keuangan PPATK",
    "ikp": "01 - Indeks Kualitas Dukungan Penanganan Kasus TPPU/TPPT",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "03 - Meningkatnya Penegakan Hukum TPPU, TPPT dan PPSPM yang Berasal dari Produk Intelijen Keuangan PPATK",
    "ikp": "02 - Persentase Pemantauan Tindak Lanjut Produk Intelijen Keuangan (PIK) PPATK",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "01 - Meningkatnya Implementasi Hasil Rekomendasi Koordinasi Nasional TPPU TPPT PPSPM",
    "ikp": "01 - Persentase Tindak Lanjut Hasil Rekomendasi Koordinasi Nasional TPPU TPPT PPSPM",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "01 - Meningkatnya Implementasi Hasil Rekomendasi Koordinasi Nasional TPPU TPPT PPSPM",
    "ikp": "02 - Persentase Capaian Implementasi STRANAS TPPU, TPPT dan PPSPM",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "02 - Meningkatnya Pemanfaatan Penilaian Risiko Nasional dan Sektoral",
    "ikp": "01 - Persentase Tindak Lanjut Rekomendasi NRA SRA",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "03 - Meningkatnya Pemanfaatan Hasil Analisis Strategis",
    "ikp": "01 - Persentase Pemanfaatan Hasil Analisis Strategis",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "04 - Meningkatnya Efektivitas Kinerja PPATK dalam Mendukung Penegakan Rezim APUPPT PPSPM",
    "ikp": "01 - Persentase Pemenuhan Tindak Lanjut Rekomendasi Hasil Indeks Efektivitas Kinerja Rezim APUPPT PPSPM untuk PPATK",
    "isProgramLevel": false
  },
  {
    "program": "BE - Program Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU) dan Pendanaan Terorisme",
    "sasaran": "05 - Meningkatnya Pemanfaatan Kajian Hukum",
    "ikp": "01 - Persentase Tindak Lanjut Rekomendasi Kajian Hukum",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "01 - Meningkatnya Tata Kelola Internal PPATK",
    "ikp": "01 - Nilai Reformasi Birokrasi General",
    "isProgramLevel": true
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "02 - Meningkatnya Efektivitas Pengawasan Internal PPATK",
    "ikp": "01 - Tingkat Kapabilitas APIP",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "02 - Meningkatnya Efektivitas Pengawasan Internal PPATK",
    "ikp": "02 - Tingkat Kepatuhan terhadap SAIPI",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "02 - Meningkatnya Efektivitas Pengawasan Internal PPATK",
    "ikp": "03 - Persentase Penyelesaian Tindak Lanjut Rekomendasi Hasil Pengawasan dan Pemeriksaan Inspektorat dan BPK",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "01 - Meningkatnya Kualitas Sistem Perencanaan, Penganggaran, dan Pengelolaan Kinerja PPATK",
    "ikp": "01 - Nilai Indeks Perencanaan dan Pembangunan Nasional",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "01 - Meningkatnya Kualitas Sistem Perencanaan, Penganggaran, dan Pengelolaan Kinerja PPATK",
    "ikp": "02 - Nilai Kualitas Pengelolaan Akuntabilitas Kinerja PPATK",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "02 - Terlaksananya Pengelolaan Keuangan yang Akuntabel",
    "ikp": "01 - Persentase Pemenuhan Kriteria Laporan Keuangan PPATK yang Berkualitas",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "02 - Terlaksananya Pengelolaan Keuangan yang Akuntabel",
    "ikp": "02 - Persentase Akurasi Penerbitan Surat Perintah Membayar",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "01 - Meningkatnya Kualitas Layanan Sumber Daya Manusia",
    "ikp": "01 - Indeks Kualitas Layanan Sumber Daya Manusia",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "02 - Meningkatnya Kompetensi dan Kinerja Pegawai",
    "ikp": "01 - Indeks Pengembangan Kompetensi dan Kinerja Pegawai",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "03 - Terwujudnya Tata Kelola Manajemen Internal yang Berkualitas",
    "ikp": "01 - Persentase Capaian Rencana Aksi Reformasi Birokrasi",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "01 - Meningkatnya Kualitas Pengelolaan Layanan Umum PPATK",
    "ikp": "01 - Indeks Kinerja Layanan Kerumahtanggaan PPATK",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "01 - Meningkatnya Kualitas Pengelolaan Layanan Umum PPATK",
    "ikp": "02 - Indeks Kinerja Pengelolaan BMN PPATK",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "01 - Meningkatnya Kualitas Pengelolaan Layanan Umum PPATK",
    "ikp": "03 - Indeks Layanan Pengadaan Barang/Jasa",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "01 - Meningkatnya Kualitas Pengelolaan Layanan Umum PPATK",
    "ikp": "04 - Indeks Kinerja Layanan Ketatausahaan Pimpinan",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "01 - Meningkatnya Kualitas Pengelolaan Layanan Umum PPATK",
    "ikp": "05 - Indeks Kepuasan Layanan Menejemen internal Pusdiklat",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "02 - Meningkatnya Efektivitas Pengelolaan Arsip PPATK",
    "ikp": "01 - Persentase Tindak Lanjut Rekomendasi Hasil Pengawasan Kearsipan",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "01 - Meningkatnya Efektivitas Layanan Hubungan Masyarakat dan Informasi APUPPT PPSPM",
    "ikp": "01 - Indeks Layanan Hubungan Masyarakat dan Informasi APUPPT PPSPM",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "02 - Meningkatnya Kualitas Pemberdayaan Kemitraan APU PPT",
    "ikp": "01 - Indeks Ekosistem Kemitraan",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "02 - Meningkatnya Kualitas Pemberdayaan Kemitraan APU PPT",
    "ikp": "02 - Skor Pemenuhan Layanan Bantuan dan Pengaduan Masyarakat (SPLBPM)",
    "isProgramLevel": false
  },
  {
    "program": "WA - Program Dukungan Manajemen",
    "sasaran": "02 - Meningkatnya Kualitas Pemberdayaan Kemitraan APU PPT",
    "ikp": "03 - Indeks Literasi APUPPT",
    "isProgramLevel": false
  }
];
