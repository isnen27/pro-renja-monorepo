import { DimensiEvaluasi } from "./kerangkaEvaluasiRenjaData";

export const KERANGKA_EVALUASI_TOR: DimensiEvaluasi[] = [
  {
    "id": 1,
    "nama": "1. Penyelarasan TOR & Target Kinerja",
    "bobot": 0.25,
    "deskripsi": "Penyelarasan substansi TOR dengan sasaran Renja dan target Rincian Output (RO) unit kerja serta konsistensi spesifikasi target keluaran.",
    "subDimensi": [
      {
        "id": "1.1",
        "nama": "1.1 Keterkaitan Kegiatan dengan Renja & RO",
        "bobot": 0.5,
        "definisi": "Uraian kegiatan di TOR merupakan derivasi langsung dari sasaran Renja dan target Rincian Output (RO) unit kerja.",
        "metodePengukuran": "Bandingkan judul kegiatan, kode RO, dan sasaran TOR dengan dokumen Renja unit kerja.",
        "jenisBukti": "Bagian Latar Belakang TOR; kodefikasi anggaran; matriks keterkaitan Renja-TOR.",
        "indikasiRendah": "Kegiatan di TOR tidak tercantum dalam Renja atau tidak memiliki kaitan logis dengan sasaran RO (Skor 1-2).",
        "indikasiTinggi": "Kegiatan terderivasi sangat presisi dari Renja dengan kontribusi nyata pada pencapaian RO (Skor 4-5)."
      },
      {
        "id": "1.2",
        "nama": "1.2 Konsistensi Spesifikasi Target Keluaran",
        "bobot": 0.5,
        "definisi": "Spesifikasi keluaran (deliverables) didefinisikan konkret mencakup jenis luaran, volume, satuan, dan standar mutu.",
        "metodePengukuran": "Periksa tabel spesifikasi output; pastikan target terukur dan memenuhi kaidah keluaran kegiatan.",
        "jenisBukti": "Tabel spesifikasi output/deliverable; kriteria keberhasilan pelaksanaan kegiatan.",
        "indikasiRendah": "Target luaran ditulis abstrak/generik tanpa spesifikasi volume dan standar mutu yang terukur (Skor 1-2).",
        "indikasiTinggi": "Spesifikasi luaran sangat konkret, terukur jelas, memiliki satuan baku, dan standar kualitas (Skor 4-5)."
      }
    ]
  },
  {
    "id": 2,
    "nama": "2. Kelengkapan Komponen Substansi TOR",
    "bobot": 0.25,
    "deskripsi": "Kelengkapan seluruh komponen standar Kerangka Acuan Kerja (latar belakang, maksud/tujuan, penerima manfaat, indikator keluaran, kurun waktu, dan biaya) serta analisis kebutuhan nyata.",
    "subDimensi": [
      {
        "id": "2.1",
        "nama": "2.1 Kelengkapan Komponen Standar Penganggaran",
        "bobot": 0.5,
        "definisi": "Memenuhi seluruh komponen standar TOR (latar belakang, maksud/tujuan, penerima manfaat, indikator keluaran, kurun waktu, dan biaya).",
        "metodePengukuran": "Cek keberadaan dan kedalaman isi seluruh bab/sub-bab standar Kerangka Acuan Kerja.",
        "jenisBukti": "Struktur dokumen TOR; kelengkapan bab 1 s.d. penutup; keutuhan rincian substansi.",
        "indikasiRendah": "Terdapat bab standar yang hilang atau diisi sangat dangkal tanpa informasi substantif (Skor 1-2).",
        "indikasiTinggi": "Seluruh bab standar penganggaran lengkap, terstruktur rapi, dan memuat informasi mendalam (Skor 4-5)."
      },
      {
        "id": "2.2",
        "nama": "2.2 Kedalaman Analisis Kebutuhan Nyata",
        "bobot": 0.5,
        "definisi": "Latar belakang menyajikan analisis kebutuhan nyata (urgensi) yang didukung data empiris atau mandat regulasi.",
        "metodePengukuran": "Evaluasi argumentasi mengapa kegiatan harus dilaksanakan pada tahun anggaran berjalan beserta data dukungnya.",
        "jenisBukti": "Bagian Dasar Hukum dan Gambaran Umum/Urgensi; data pendukung kebutuhan kegiatan.",
        "indikasiRendah": "Latar belakang bersifat klise tanpa data dukung urgensi mengapa kegiatan perlu dibiayai (Skor 1-2).",
        "indikasiTinggi": "Urgensi pelaksanaan didukung data faktual, amanat regulasi tegas, dan konsekuensi bila tidak didanai (Skor 4-5)."
      }
    ]
  },
  {
    "id": 3,
    "nama": "3. Metode Pelaksanaan & Rencana Jadwal",
    "bobot": 0.25,
    "deskripsi": "Kejelasan tahapan kerja operasional, metode pelaksanaan (swakelola/pihak ketiga), serta realisme jadwal kerja dan rencana penarikan dana.",
    "subDimensi": [
      {
        "id": "3.1",
        "nama": "3.1 Kejelasan Metode & Tahapan Pelaksanaan",
        "bobot": 0.5,
        "definisi": "Tahapan operasional pelaksanaan kegiatan (persiapan, pelaksanaan, evaluasi/pelaporan) diuraikan rinci dan aplikatif.",
        "metodePengukuran": "Evaluasi rincian alur kerja operasional, metode kerja (swakelola/pihak ketiga), dan prosedur teknis.",
        "jenisBukti": "Bagian Cara Pelaksanaan Kegiatan; Standar Operasional Prosedur (SOP) pelaksanaan; alur kerja.",
        "indikasiRendah": "Metode kerja tidak jelas atau tahapan pelaksanaan meloncat tanpa alur kerja yang runtut (Skor 1-2).",
        "indikasiTinggi": "Tahapan kerja diuraikan sangat detail, alur prosedur logis, dan metode pelaksanaan sangat aplikatif (Skor 4-5)."
      },
      {
        "id": "3.2",
        "nama": "3.2 Realisme Jadwal & Rencana Penarikan",
        "bobot": 0.5,
        "definisi": "Jadwal pelaksanaan (timeline) dan rencana penarikan dana bulanan dirumuskan secara realistis dan antisipatif.",
        "metodePengukuran": "Uji kelayakan alokasi waktu tiap tahapan terhadap jadwal lelang/pengadaan dan kapasitas eksekusi.",
        "jenisBukti": "Jadwal pelaksanaan (bar chart/matriks waktu); sinkronisasi dengan rencana penarikan kas.",
        "indikasiRendah": "Jadwal kegiatan menumpuk di akhir tahun anggaran tanpa pertimbangan waktu pengadaan yang memadai (Skor 1-2).",
        "indikasiTinggi": "Jadwal kerja terdistribusi proporsional, mempertimbangkan tahapan lelang, dan sinkron dengan rencana kas (Skor 4-5)."
      }
    ]
  },
  {
    "id": 4,
    "nama": "4. Kesiapan Pelaksana & Mitigasi Risiko",
    "bobot": 0.15,
    "deskripsi": "Kejelasan susunan panitia/tim kerja dan pembagian peran serta identifikasi potensi kendala teknis beserta rencana mitigasinya.",
    "subDimensi": [
      {
        "id": "4.1",
        "nama": "4.1 Matriks Pembagian Peran Pelaksana",
        "bobot": 0.5,
        "definisi": "Kejelasan susunan panitia, tim kerja pelaksana, narasumber/ahli, dan pembagian tanggung jawab peran operasional.",
        "metodePengukuran": "Periksa rincian struktur penanggung jawab kegiatan, kualifikasi yang dibutuhkan, dan pembagian peran.",
        "jenisBukti": "Matriks peran pelaksana kegiatan; rincian penugasan tim kerja; kriteria narasumber/peserta.",
        "indikasiRendah": "Susunan panitia/pelaksana tidak jelas atau pembagian peran operasional tumpang tindih (Skor 1-2).",
        "indikasiTinggi": "Struktur pelaksana kegiatan, kualifikasi narasumber, dan pembagian tugas terdefinisi sangat jelas (Skor 4-5)."
      },
      {
        "id": "4.2",
        "nama": "4.2 Identifikasi Risiko Teknis & Mitigasi",
        "bobot": 0.5,
        "definisi": "Mengidentifikasi potensi kendala teknis pelaksanaan (pengadaan, perizinan, kehadiran peserta) beserta langkah mitigasi.",
        "metodePengukuran": "Evaluasi keberadaan rencana kontinjensi untuk memitigasi risiko kegagalan pelaksanaan kegiatan.",
        "jenisBukti": "Tabel manajemen risiko kegiatan; rencana mitigasi kendala teknis; prosedur kontinjensi.",
        "indikasiRendah": "Tidak ada analisis risiko teknis; kegiatan rentan terhambat kendala di lapangan tanpa antisipasi (Skor 1-2).",
        "indikasiTinggi": "Identifikasi risiko komprehensif dilengkapi rencana kontinjensi konkret untuk menjamin kegiatan berjalan (Skor 4-5)."
      }
    ]
  },
  {
    "id": 5,
    "nama": "5. Kepatuhan Format & Dokumen Pendukung",
    "bobot": 0.1,
    "deskripsi": "Kepatuhan format baku penulisan TOR serta kelengkapan dokumen data dukung teknis yang sah.",
    "subDimensi": [
      {
        "id": "5.1",
        "nama": "5.1 Kepatuhan Sistematika Format Baku KAK",
        "bobot": 0.5,
        "definisi": "Format penulisan TOR mematuhi pedoman baku instansi/Kemenkeu termasuk penomoran, tabel ringkasan, dan otorisasi.",
        "metodePengukuran": "Periksa kesesuaian tata letak, penomoran kodefikasi anggaran, dan lembar tanda tangan pejabat berwenang.",
        "jenisBukti": "Lembar pengesahan TOR bertandatangan pejabat berwenang; format baku Kerangka Acuan Kerja.",
        "indikasiRendah": "Format penulisan tidak baku, kodefikasi salah, atau tidak ditandatangani pejabat berwenang (Skor 1-2).",
        "indikasiTinggi": "Format dokumen 100% mematuhi kaidah baku, kodefikasi presisi, dan terotorisasi sah secara digital/resmi (Skor 4-5)."
      },
      {
        "id": "5.2",
        "nama": "5.2 Kelengkapan Dokumen Data Dukung Teknis",
        "bobot": 0.5,
        "definisi": "Dilengkapi dokumen pendukung yang relevan (kurikulum/silabus, data survei kebutuhan, spesifikasi teknis peralatan).",
        "metodePengukuran": "Cek ketersediaan dan validitas lampiran teknis yang menjadi basis pelaksanaan kegiatan.",
        "jenisBukti": "Lampiran silabus/kurikulum diklat; spesifikasi teknis barang/jasa; daftar calon peserta/instansi.",
        "indikasiRendah": "Tidak menyertakan dokumen pendukung teknis sehingga kelayakan pelaksanaan diragukan (Skor 1-2).",
        "indikasiTinggi": "Lampiran data dukung teknis lengkap, valid, mutakhir, dan memperkuat kelayakan eksekusi (Skor 4-5)."
      }
    ]
  }
];
