-- ============================================================================
-- SQL DDL & SEED: Referensi Kewenangan Revisi Anggaran
-- Sumber: kewenangan revisi.xlsx
-- Database: pro_renja_db (PostgreSQL)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ref_kewenangan_revisi (
    id SERIAL PRIMARY KEY,
    kode_item VARCHAR(50) NOT NULL UNIQUE,
    jenis_revisi VARCHAR(100) NOT NULL,
    no_butir VARCHAR(50),
    uraian TEXT NOT NULL,
    kewenangan VARCHAR(150) NOT NULL,
    scope VARCHAR(20) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kewenangan_revisi_jenis ON ref_kewenangan_revisi(jenis_revisi);
CREATE INDEX IF NOT EXISTS idx_kewenangan_revisi_scope ON ref_kewenangan_revisi(scope);

-- Seed Data (62 Butir Kewenangan Revisi)
INSERT INTO ref_kewenangan_revisi (kode_item, jenis_revisi, no_butir, uraian, kewenangan, scope, keterangan)
VALUES
  ('rev-item-1', 'Administratif', 'a.0', 'Revisi otomatis berupa sinkronisasi data yang tercantum dalam konsep DIPA dengan data RKA-K/L alokasi anggaran hasil penelaahan', 'Kemenkeu (DJA/DJPb)', 'dipa', 'sebelum DIPA berlaku (pengesahan)'),
  ('rev-item-2', 'Administratif', 'd', 'Perubahan/penambahan penandaan (tagging)', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-3', 'Administratif', 'e.1', 'Halaman IV.A : Blokir', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-4', 'Administratif', 'e.2', 'Halaman IV.B : Catatan', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-5', 'Administratif', 'e', 'Pencantuman/penghapusan/perubahan catatan IV DIPA / DIPA BUN', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-6', 'Administratif', 'e.1.a', 'Pembukaan/pencantuman blokir DIPA K/L dikarenakan antara lain :
1. Alokasi anggaran yang masih harus dilengkapi dokumen sebagai dasar pengalokasian anggaran
2. Alokasi anggaran yang masih terpusat dan belum didistribusikan ke Satker daerah
3. RO Cadangan', 'Kemenkeu (DJA/DJPb)', 'dipa', 'berupa Penelaahan namun untuk blokir dikarenakan pemenuhan kekurangan dokumen sebagai dasar pengalokasian anggaran, maka bersifat pengesahan'),
  ('rev-item-7', 'Administratif', 'e.1.b', 'Pembukaan/pencantuman blokir DIPA BUN dikarenakan antara lain :
1. Alokasi anggaran yang masih harus dilengkapi dokumen sebagai dasar pengalokasian anggaran
2. Alokasi anggaran yang masih terpusat dan belum didistribusikan
3. Perubahan anggaran/perubahan peruntukan anggaran
4. Alokasi anggaran belum dilengkapi reviu APIP K/L', 'Kemenkeu (DJA/DJPb)', 'dipa', 'Penelaahan dan khusus untuk perubahan anggaran/perubahan peruntukan anggaran harus direviu APIP K/L terlebih dahulu'),
  ('rev-item-8', 'Administratif', 'e.1.c', 'Pencantuman/pembukaan blokir dikarenakan kebijakan Penyesuaian Belanja Negara, termasuk berupa pemblokiran mandiri oleh Direktorat Jenderal Anggaran', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-9', 'Administratif', 'e.2.a', 'Pencantuman/penghapusan/perubahan penyelesaian tunggakan melalui mekanisme revisi DIPA/DIPA BUN', 'Kemenkeu (DJA/DJPb)', 'dipa', 'DJA : tunggakan tahun-tahun anggaran sebelumnya dan/atau 1 (satu) tahun sebelumnya yang dipenuhi dari pergeseran anggaran antar-program

Dit. PA : tunggakan tahun-tahun anggaran sebelumnya yang dipenuhi dari pergeseran anggaran dalam 1 (satu) Program antar-Kanwil DJPb

Kanwil DJPb : tunggakan tahun-tahun anggaran sebelumnya yang dipenuhi dari pergeseran anggaran dalam 1 (satu) Program dalam 1 (satu) Kanwil DJPb'),
  ('rev-item-10', 'Administratif', 'e.2.b.', 'Pencantuman/penghapusan/perubahan anggaran yang berasal dari SP SABA', 'Kemenkeu (DJA/DJPb)', 'dipa', 'DJA : penambahan biaya satuan (unit cost) dan/atau perubahan target volume RO total sebagai akibat dari pemanfaatan sisa anggaran

Dit. PA : pergeseran yang tidak mengakibatkan perubahan biaya satuan (unit cost) dan/atau target volume RO total antar-Kanwil DJPb

Kanwil DJPb : pergeseran yang tidak mengakibatkan perubahan biaya satuan (unit cost) dan/atau target volume RO total dalam 1 (satu) satker atau dalam 1 (satu) Kanwil DJPb'),
  ('rev-item-11', 'Administratif', 'e.2.c', 'Pencantuman/penghapusan/perubahan volume dan alokasi anggaran pembangunan/renovasi gedung/bangunan dan/atau kendaraan bermotor', 'Kemenkeu (DJA/DJPb)', 'dipa', 'DJA : pengadaan barang milik negara baru, penurunan volume, dan/atau penambahan alokasi anggaran yang tidak mengakibatkan penambahan volume

Dit. PA : penambahan volume dan/atau penambahan alokasi anggaran yang mengakibatkan penambahan volume

Kanwil DJPb : pengurangan alokasi anggaran'),
  ('rev-item-12', 'Administratif', 'g.1', 'Perubahan kantor bayar (KPPN)/lokasi Satker', 'Kemenkeu (DJA/DJPb)', 'dipa', 'Setelah mendapat persetujuan dari Direktur Jenderal Perbendaharaan c.1. Sekretaris Direktorat Jenderal Perbendaharaan.
Dilanjutkan dengan proses perubahan kode satker dan pergeseran anggaran untuk kantor Satker baru'),
  ('rev-item-13', 'Administratif', 'g.2', 'Ralat/perubahan kode kewenangan', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-14', 'Administratif', 'g.3', 'Ralat/perubahan /penghapusan kode bagian anggaran dan/atau Satker', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-15', 'Administratif', 'g.4', 'Pencantuman/perubahan rencana penarikan dana dan/atau perkiraan penerimaan dalam halaman III DIPA', 'Kemenkeu (DJA/DJPb)', 'dipa', 'DJA : perubahan perkiraan penerimaan secara total, penambahan perkiraan penerimaan dikarenakan perkiraan kenaikan PNBP berdasarkan surat pernyataan KPA untuk menambah volume RO, dan/atau pencantuman perkiraan penerimaan baru

Kanwil DJPb : perubahan yang tidak mengakibatkan perubahan perkiraan penerimaan secara total, penambahan perkiraan penerimaan dikarenakan penggunaan kelebihan realisasi atas target PNBP, dan/atau perubahan rencana penarikan dana'),
  ('rev-item-16', 'Administratif', 'g.9', 'Perubahan pejabat penandatangan DIPA', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-17', 'Administratif', 'g.10', 'Perubahan nomenklatur bagian anggaran dan/atau Satker', 'Kemenkeu (DJA/DJPb)', 'dipa', 'DJA : Satker Pusat atau selain Satker Dekon TP

Kanwil DJPb : Satker Dekon TP'),
  ('rev-item-18', 'Administratif', 'd.1', 'Ralat karena kesalahan aplikasi berupa tidak berfungsinya sebagian atau seluruh fungsi matematis Sistem Aplikasi', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-19', 'Administratif', 'f', 'Revisi administrasi terkait RO Prioritas Nasional', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-20', 'Administratif', 'g', 'Persyaratan pencairan anggaran', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-21', 'Belanja Operasional', 'h.', 'Belanja Operasional ke selain Belanja Operasional', 'Kemenkeu (DJA/DJPb)', 'dipa', 'Dalam hal pergeseran berasal dari Belanja Pegawai Operasional, dilampiri surat persetujuan sebagaimana dimaksud dalam Pasal 146 ayat (2)'),
  ('rev-item-22', 'Belanja Operasional', 'a.1', 'Pemenuhan Belanja Operasional, termasuk penyelesaian pagu minus Belanja Pegawai Operasional (Dalam Satu Kegiatan)', 'KPA Satker (POK)', 'pok', 'Kelengkapan : Surat Persetujuan Pejabat Eselon I dalam hal pergeseran antar Program dalam rangka Pemenuhan Belanja Operasional'),
  ('rev-item-23', 'Belanja Operasional', 'a.2', 'Pemenuhan Belanja Operasional, termasuk penyelesaian pagu minus Belanja Pegawai Operasional (Antar-Kegiatan / Antar-Satker)', 'KPA Satker (POK)', 'pok', 'Kelengkapan : Surat Persetujuan Pejabat Eselon I dalam hal pergeseran antar Program dalam rangka Pemenuhan Belanja Operasional'),
  ('rev-item-24', 'DIPA', 'p.', 'Antar-jenis belanja', 'Kemenkeu (DJA/DJPb)', 'dipa', 'DJA : mengakibatkan penurunan volume RO secara tota dan/atau revisi dalam BAB BUN
Dit. Pa : tidak mengakibatkan penurunan volume RO secara total anatar-Kanwil DJPb
Kanwil DJPb : tidak mengakibatkan penurunan volume RO secara total dalam satu kanwil DJPb'),
  ('rev-item-25', 'DIPA', 'a.3', 'Pergeseran anggaran antar-RO dalam 1 (satu) KRO, Kegiatan, Program, dan Antar-Satker', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-26', 'DIPA', 'a.4', 'Pergeseran anggaran antar-KRO dalam 1 (satu) Kegiatan, Program, dan Satker yang sama', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-27', 'DIPA', 'a.5', 'Pergeseran anggaran antar-Kegiatan dalam 1 (satu) Program dan Satker yang sama dalam program yang sama', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-28', 'DIPA', 'a.6', 'Pergeseran anggaran antar-Kegiatan dalam 1 (satu) Program dan Antar-Satker dalam program yang sama', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-29', 'DIPA', 'a.7', 'Pergeseran anggaran antar-detail dalam 1 (satu) Akun Belanja Modal yang mengakibatkan perubahan volume RO', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-30', 'DIPA', 'a.8', 'Perubahan target RO', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-31', 'KDP', 'y', 'Penyelesaian pekerjaan yang tidak terselesaikan sampai dengan akhir tahun anggaran', 'Kemenkeu (DJA/DJPb)', 'dipa', 'Dit. PA : antar-kanwil DJPb
Kanwil DJPb : dalam 1 (satu) Kanwil DJPb'),
  ('rev-item-32', 'KDP', 'ad', 'Revisi Anggaran yang disampaikan melewati Tahun Anggaran berkenaan yang diusulkan dalam rangka pengesahan dan/atau penyusunan laporan keuangan Pemerintah Pusat', 'Kemenkeu (DJA/DJPb)', 'dipa', 'Dit. PA : antar-Kanwil DJPb
Kanwil DJPb : dalam 1 (satu) Kanwil DJPb'),
  ('rev-item-33', 'Kinerja', 'b', 'Revisi Rumusan Informasi Kinerja pada DIPA induk dan/atau DIPA BUN, termasuk untuk hasil pengendalian dan pemantauan', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-34', 'Kinerja', 'c', 'Perubahan Rumusan Informasi Kinerja dalam basis data RKA-K/L DIPA / RDP BUN DIPA BUN dengan menggunakan Sistem Aplikasi', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-35', 'Perubahan Anggaran DIPA', 'b.1', 'Pergeseran anggaran dari BA BUN ke BA K/L', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-36', 'Perubahan Anggaran DIPA', 'z', 'Pergeseran anggaran pada DIPA K/L untuk anggaran yang berasal dari SP SABA', 'Kemenkeu (DJA/DJPb)', 'dipa', 'DJA : penambahan biaya satuan (unit cost) dan/atau perubahan target volume RO total sebagai akibat dari pemanfaatan sisa anggaran

Dit. PA : pergeseran yang tidak mengakibatkan perubahan biaya satuan (unit cost) dan/atau target volume RO total antar-kanwil DJPb

Kanwil DJPb : pergeseran yang tidak mengakibatkan perubahan biaya satuan (unit cost) dan/atau target volume RO total dalam 1 (satu) satker atau dalam 1 (satu) Kanwil DJPb'),
  ('rev-item-37', 'PN', 'j.', 'Perubahan RO Prioritas Nasional', 'Kemenkeu (DJA/DJPb)', 'dipa', 'Kanwil DJPB : penambahan dan/ atau alokasi RO Prioritas Nasional yang anggarannya bersumber dari hibah yang penarikannya tidak melalui Kuasa BUN dan/atau PNBP termasuk PNBPBLU-'),
  ('rev-item-38', 'PN', 'r', 'RO Prioritas Nasional :
1. Pergeseran anggaran antar-RO Prioritas Nasional
2. Pergeseran anggaran yang mengakibatkan penambahan/pengurangan alokasi dan/atau target RO Prioritas Nasional
3. Pergeseran anggaran yang mengakibatkan perubahan antar-lokasi kegiatan pada RO Prioritas Nasional', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-39', 'PN', 'f.1', 'Perubahan nomenklatur lainnya selain ralat administratif', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-40', 'PN', 'f.2', 'Ralat administratif nomenklatur', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-41', 'PN', 'f.3', 'Perubahan lokasi', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-42', 'PN', 'k', 'Pergeseran anggaran dalam 1 (satu) RO Prioritas Nasional', 'Kemenkeu (DJA/DJPb)', 'dipa', 'K/L : 1 (satu) Satker dan 1 (satu) jenis belanja sepanjang tidak mengubah lokasi'),
  ('rev-item-43', 'PNBP', 'c.1', 'Jenis PNBP, tarif atas jenis PNBP, dan Satker PNBP baru', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-44', 'PNBP', 'c.2', 'Persetujuan penggunaan PNBP baru atau peningkatan persetujuan penggunaan  PNBP oleh Menteri Keuangan', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-45', 'PNBP', 'c.3', 'Penggunaan perkiraan kenaikan PNBP untuk meningkatkan volume RO', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-46', 'PNBP', 'c.4', 'Peningkatan Target PNBP dalam Perubahan APBN', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-47', 'PNBP', 'c.5', 'Penggunaan penerimaan klaim asuransi BMN dalam rangka pengadaan BMN yang dipertanggungkan', 'Kemenkeu (DJA/DJPb)', 'dipa', 'Berupa penambahan RO/KRObaru dalam DIPA • dan/ataumenambah volume RO/KRO.'),
  ('rev-item-48', 'POK', 'e.3', 'Ralat kode akun dalam rangka penerapan kebijakan akuntansi (dalam satu jenis belanja yang sama)', 'KPA Satker (POK)', 'pok', 'dapat dilakukan sepanjang merupakan tindak lanjut adanya peraturan/ketentuan terkait kebijakan akuntansi'),
  ('rev-item-49', 'POK', 'a.9', 'Pergeseran anggaran antar-RO dalam 1 (satu) KRO, Kegiatan, Program, dan Satker yang sama', 'KPA Satker (POK)', 'pok', 'DJA : pada BA BUN
KPA : pada BA K/L'),
  ('rev-item-50', 'POK', 'a.10', 'Pergeseran anggaran antar-komponen dalam 1 (satu) RO yang sama', 'KPA Satker (POK)', 'pok', ''),
  ('rev-item-51', 'POK', 'a.11', 'Pergeseran anggaran antar-subkomponen dalam 1 (satu) Komponen yang sama', 'KPA Satker (POK)', 'pok', ''),
  ('rev-item-52', 'POK', 'a.12', 'Pergeseran anggaran antar-akun dalam 1 (satu) Subkomponen yang sama', 'KPA Satker (POK)', 'pok', ''),
  ('rev-item-53', 'POK', 'a.13', 'Pergeseran anggaran antar-detail dalam 1 (satu) Akun yang sama', 'KPA Satker (POK)', 'pok', ''),
  ('rev-item-54', 'POK', 'a.14', 'Perubahan uraian rincian detail', 'KPA Satker (POK)', 'pok', ''),
  ('rev-item-55', 'POK', 'b.1', 'Pergeseran anggaran dalam 1 (satu) RO dalam 1 (satu) Satker', 'KPA Satker (POK)', 'pok', 'Termasuk pada BA BUN'),
  ('rev-item-56', 'POK', 'b.2', 'Pergeseran anggaran Antar-Detil dalam 1 (satu) Akun dalam 1 (satu) Satker', 'KPA Satker (POK)', 'pok', ''),
  ('rev-item-57', 'POK', 'c.6', 'Penambahan/perubahan akun beserta alokasi anggarannya dalam 1 (satu) RO', 'KPA Satker (POK)', 'pok', 'Termasuk pada BA BUN'),
  ('rev-item-58', 'POK', 'd.2', 'Pemutakhiran data hasil revisi Petunjuk Operasional Kegiatan (belum terakomodir di aplikasi SAKTI)', 'KPA Satker (POK)', 'pok', 'KPA :
1. Tidak mengakibatkan perubahan halaman III DIPA
2. Batas akhir pemutakhiran POK tanggal 27 Desember'),
  ('rev-item-59', 'Program', 'b.7', 'Pergeseran anggaran antar-Program dalam unit eselon 1 yang sama', 'Kemenkeu (DJA/DJPb)', 'dipa', 'tanpa  persetujuan DPR'),
  ('rev-item-60', 'Volume RO', 'o.', 'Pemanfaatan Sisa Anggaran Kontraktual dan/atau Swakelola selain untuk menambah volume RO kecuali untuk pemenuhan Belanja Operasional', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-61', 'Volume RO', 't', 'Penurunan volume RO secara total', 'Kemenkeu (DJA/DJPb)', 'dipa', ''),
  ('rev-item-62', 'Volume RO', 'c.7', 'Pemanfaatan Sisa Anggaran Kontraktual/Swakelola :
1. untuk menambah volume RO yang sama dan/atau RO yang lain (kecuali untuk RO Dukungan Manajemen tidak harus dalam rangka menambah volume RO), termasuk sisa RO Prioritas Nasional
2. untuk pemenuhan Belanja Operasional', 'Kemenkeu (DJA/DJPb)', 'dipa', 'Kelengkapan : surat persetujuan Pejabat Eselon I kecuali yang bersumber dari PNBP BLU')
ON CONFLICT (kode_item) DO UPDATE SET
  jenis_revisi = EXCLUDED.jenis_revisi,
  no_butir = EXCLUDED.no_butir,
  uraian = EXCLUDED.uraian,
  kewenangan = EXCLUDED.kewenangan,
  scope = EXCLUDED.scope,
  keterangan = EXCLUDED.keterangan,
  updated_at = NOW();
