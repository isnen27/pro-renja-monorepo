import { DimensiEvaluasi } from "./kerangkaEvaluasiRenjaData";

export const KERANGKA_EVALUASI_RAB: DimensiEvaluasi[] = [
  {
    "id": 1,
    "nama": "1. Konsistensi Rincian Belanja dengan TOR",
    "bobot": 0.3,
    "deskripsi": "Konsistensi rincian volume output/peserta serta pemetaan seluruh komponen dan subkomponen biaya di RAB terhadap dokumen TOR.",
    "subDimensi": [
      {
        "id": "1.1",
        "nama": "1.1 Keselarasan Volume & Peserta terhadap TOR",
        "bobot": 0.5,
        "definisi": "Volume keluaran, jumlah peserta, jumlah hari, dan frekuensi di RAB konsisten persis dengan spesifikasi target di TOR.",
        "metodePengukuran": "Bandingkan jumlah peserta, frekuensi kegiatan, dan durasi pada tabel RAB dengan angka di dokumen TOR.",
        "jenisBukti": "Tabel rincian RAB vs Bab Penerima Manfaat/Keluaran di TOR; matriks keselarasan volume.",
        "indikasiRendah": "Terdapat selisih jumlah peserta, hari kegiatan, atau volume luaran antara lembar RAB dan dokumen TOR (Skor 1-2).",
        "indikasiTinggi": "Seluruh volume, target peserta, dan hari pelaksanaan antara RAB dan TOR sinkron sempurna 100% (Skor 4-5)."
      },
      {
        "id": "1.2",
        "nama": "1.2 Kesesuaian Komponen & Subkomponen Biaya",
        "bobot": 0.5,
        "definisi": "Seluruh komponen biaya yang direncanakan di TOR (perencanaan, koordinasi, pelaksanaan, evaluasi) terpetakan lengkap di RAB.",
        "metodePengukuran": "Pastikan tidak ada item biaya siluman di RAB yang tidak diuraikan di TOR, atau sebaliknya kegiatan di TOR tanpa alokasi biaya.",
        "jenisBukti": "Tabel komponen biaya di TOR vs rincian akun belanja di RAB; struktur subkomponen anggaran.",
        "indikasiRendah": "Muncul pos belanja baru di RAB yang tidak berdasar aktivitas di TOR, atau pos kegiatan TOR tanpa anggaran (Skor 1-2).",
        "indikasiTinggi": "Setiap komponen aktivitas di TOR memiliki alokasi belanja yang proporsional dan terpetakan rapi di RAB (Skor 4-5)."
      }
    ]
  },
  {
    "id": 2,
    "nama": "2. Kepatuhan Standar Biaya & Kode Akun",
    "bobot": 0.3,
    "deskripsi": "Kepatuhan tarif satuan biaya terhadap PMK Standar Biaya Masukan (SBM/SBK) serta ketepatan penggunaan Bagan Akun Standar (BAS).",
    "subDimensi": [
      {
        "id": "2.1",
        "nama": "2.1 Kepatuhan Standar Biaya Masukan (SBM/SBK)",
        "bobot": 0.5,
        "definisi": "Kepatuhan satuan biaya terhadap PMK Standar Biaya Masukan (honor narasumber, uang harian, konsumsi, penginapan).",
        "metodePengukuran": "Uji kepatuhan tarif satuan biaya per item di RAB terhadap batas maksimal PMK SBM yang berlaku.",
        "jenisBukti": "Tabel satuan biaya RAB; peraturan PMK SBM tahun anggaran berkenaan; justifikasi harga pasar.",
        "indikasiRendah": "Satuan biaya melampaui batas pagu tertinggi PMK SBM tanpa dilengkapi justifikasi kelayakan resmi (Skor 1-2).",
        "indikasiTinggi": "Seluruh satuan biaya mematuhi pagu maksimal PMK SBM dan didukung dasar regulasi yang tepat (Skor 4-5)."
      },
      {
        "id": "2.2",
        "nama": "2.2 Ketepatan Penggunaan Bagan Akun Standar",
        "bobot": 0.5,
        "definisi": "Penggunaan kode akun 6 digit (BAS) tepat sesuai peruntukan belanja (521211 bahan, 522151 jasa profesi, 524111 transport).",
        "metodePengukuran": "Periksa kebenaran pembebanan akun belanja; hindari salah akun belanja modal vs belanja barang atau jasa.",
        "jenisBukti": "Kode akun 6-digit pada rincian RAB; uraian jenis belanja; pedoman Bagan Akun Standar (BAS).",
        "indikasiRendah": "Ditemukan kesalahan kode akun yang berpotensi temuan audit (misal: honor di akun bahan, aset di akun jasa) (Skor 1-2).",
        "indikasiTinggi": "Seluruh kode akun 6-digit tepat sesuai peruntukan dan regulasi Bagan Akun Standar (BAS) (Skor 4-5)."
      }
    ]
  },
  {
    "id": 3,
    "nama": "3. Akurasi Aritmetika & Perhitungan Rincian",
    "bobot": 0.25,
    "deskripsi": "Akurasi matematis perhitungan perkalian volume x satuan biaya serta ketelitian penjumlahan subtotal komponen dan total pagu.",
    "subDimensi": [
      {
        "id": "3.1",
        "nama": "3.1 Akurasi Perkalian Volume & Satuan Biaya",
        "bobot": 0.5,
        "definisi": "Kebenaran matematis perkalian volume x frekuensi x satuan biaya pada setiap baris rincian belanja.",
        "metodePengukuran": "Uji formula sel Excel (misal =B4*C4*D4); pastikan tidak ada kesalahan pembulatan, hardcoded angka salah, atau rumus putus.",
        "jenisBukti": "Formula sel lembar kerja RAB; pemeriksaan silang baris rincian belanja (audit aritmetika).",
        "indikasiRendah": "Ditemukan kesalahan formula perkalian, angka hardcoded yang tidak cocok, atau kesalahan aritmetika (Skor 1-2).",
        "indikasiTinggi": "Seluruh formula perhitungan baris rincian 100% akurat tanpa kesalahan aritmetika (Skor 4-5)."
      },
      {
        "id": "3.2",
        "nama": "3.2 Akurasi Rekapitulasi Subtotal & Total",
        "bobot": 0.5,
        "definisi": "Kebenaran penjumlahan subtotal per komponen, total per akun belanja, dan agregasi total pagu lembar RAB.",
        "metodePengukuran": "Uji kesesuaian formula penjumlahan SUM/SUMIFS dari rincian ke subtotal hingga total pagu anggaran.",
        "jenisBukti": "Formula subtotal komponen (051, 052, 053); tabel rekapitulasi per akun; total pagu kegiatan.",
        "indikasiRendah": "Terdapat pos rincian belanja yang terlewat dalam penjumlahan subtotal atau total tidak konsisten (Skor 1-2).",
        "indikasiTinggi": "Kalkulasi agregasi berjenjang dari rincian hingga total pagu 100% terhubung secara presisi (Skor 4-5)."
      }
    ]
  },
  {
    "id": 4,
    "nama": "4. Efisiensi & Kewajaran Biaya Satuan",
    "bobot": 0.15,
    "deskripsi": "Kewajaran rasio biaya satuan per peserta/keluaran serta kelengkapan bukti pendukung survei harga pasar untuk belanja non-SBM.",
    "subDimensi": [
      {
        "id": "4.1",
        "nama": "4.1 Kewajaran Biaya Satuan per Peserta/Output",
        "bobot": 0.5,
        "definisi": "Kewajaran rasio biaya total dibagi jumlah peserta (cost per participant) atau per rincian keluaran kegiatan.",
        "metodePengukuran": "Hitung biaya rata-rata per peserta/hari diklat dan bandingkan dengan standar biaya penyelenggaraan kegiatan sejenis.",
        "jenisBukti": "Kalkulasi unit cost per peserta; tabel perbandingan biaya historis penyelenggaraan kegiatan.",
        "indikasiRendah": "Biaya per peserta dinilai terlalu tinggi tanpa justifikasi nilai tambah atau metode pelaksanaan (Skor 1-2).",
        "indikasiTinggi": "Biaya satuan per peserta sangat rasional, mencerminkan efisiensi anggaran dan prinsip kehematan (Skor 4-5)."
      },
      {
        "id": "4.2",
        "nama": "4.2 Bukti Pendukung Kewajaran Harga Pasar",
        "bobot": 0.5,
        "definisi": "Tersedia data dukung kewajaran harga pasar (minimal 3 penawaran harga vendor / e-katalog) untuk belanja non-SBM.",
        "metodePengukuran": "Cek keberadaan dokumen survei harga pasar atau katalog elektronik untuk pengadaan sewa/perangkat penunjang.",
        "jenisBukti": "Lampiran bukti survei harga pasar; tangkapan layar e-Katalog LKPP; surat penawaran penyedia.",
        "indikasiRendah": "Pos belanja non-SBM tidak didukung dokumen survei harga pasar yang dapat dipertanggungjawabkan (Skor 1-2).",
        "indikasiTinggi": "Seluruh pos biaya non-SBM didukung bukti survei harga resmi yang akuntabel dan transparan (Skor 4-5)."
      }
    ]
  }
];
