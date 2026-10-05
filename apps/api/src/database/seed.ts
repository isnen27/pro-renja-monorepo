// src/database/seed.ts
// Seed Data for Bagan Akun Standar (BAS)
// Run with: npx tsx src/database/seed.ts

import { db } from './index.js';
import { baganAkunStandar } from './schema.js';

type KategoriBelanja = 'Belanja Pegawai' | 'Belanja Barang' | 'Belanja Jasa' | 'Belanja Pemeliharaan' | 'Belanja Perjalanan' | 'Belanja Modal';

interface SeedData {
  no: number;
  kelompokBelanja: string;
  kodeAkun3Digit: string;
  namaAkun3Digit: string;
  kodeAkun6Digit: string;
  uraianAkun: string;
  penggunaanSingkat: string;
  kategori: KategoriBelanja;
  kelompokBarangJasa?: string;
}

const seedData: SeedData[] = [
  // ═══════════════════════════════════════════════════════════════════
  // 051 BELANJA PEGAWAI - BELANJA GAJI DAN TUNJANGAN
  // ═══════════════════════════════════════════════════════════════════
  { no: 1, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511111', uraianAkun: 'Belanja Gaji Pokok PNS', penggunaanSingkat: 'Mencatat pembayaran gaji pokok Pegawai Negeri Sipil (PNS).', kategori: 'Belanja Pegawai' },
  { no: 2, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511119', uraianAkun: 'Belanja Pembulatan Gaji PNS', penggunaanSingkat: 'Mencatat pembayaran pembulatan gaji pokok PNS.', kategori: 'Belanja Pegawai' },
  { no: 3, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511121', uraianAkun: 'Belanja Tunj. Suami/Istri PNS', penggunaanSingkat: 'Mencatat pembayaran tunjangan suami/istri PNS.', kategori: 'Belanja Pegawai' },
  { no: 4, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511122', uraianAkun: 'Belanja Tunj. Anak PNS', penggunaanSingkat: 'Mencatat pembayaran tunjangan anak PNS.', kategori: 'Belanja Pegawai' },
  { no: 5, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511123', uraianAkun: 'Belanja Tunj. Struktural PNS', penggunaanSingkat: 'Mencatat pembayaran tunjangan struktural PNS.', kategori: 'Belanja Pegawai' },
  { no: 6, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511124', uraianAkun: 'Belanja Tunj. Fungsional PNS', penggunaanSingkat: 'Mencatat pembayaran tunjangan fungsional PNS.', kategori: 'Belanja Pegawai' },
  { no: 7, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511125', uraianAkun: 'Belanja Tunj. PPh PNS', penggunaanSingkat: 'Mencatat pembayaran tunjangan PPh PNS.', kategori: 'Belanja Pegawai' },
  { no: 8, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511126', uraianAkun: 'Belanja Tunj. Beras PNS', penggunaanSingkat: 'Mencatat pembayaran tunjangan beras PNS, dalam bentuk uang dan/atau natura.', kategori: 'Belanja Pegawai' },
  { no: 9, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511129', uraianAkun: 'Belanja Uang Makan PNS', penggunaanSingkat: 'Mencatat pembayaran uang makan/tunjangan uang makan PNS.', kategori: 'Belanja Pegawai' },
  { no: 10, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511151', uraianAkun: 'Belanja Tunjangan Umum PNS', penggunaanSingkat: 'Mencatat pembayaran tunjangan umum/tambahan tunjangan umum PNS.', kategori: 'Belanja Pegawai' },
  { no: 11, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511311', uraianAkun: 'Belanja Gaji Pokok Pejabat Negara', penggunaanSingkat: 'Mencatat pembayaran gaji pokok Pejabat Negara.', kategori: 'Belanja Pegawai' },
  { no: 12, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511324', uraianAkun: 'Belanja Tunj. PPh Pejabat Negara', penggunaanSingkat: 'Mencatat pembayaran tunjangan PPh Pejabat Negara.', kategori: 'Belanja Pegawai' },
  { no: 13, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511611', uraianAkun: 'Belanja Gaji Pokok PPPK', penggunaanSingkat: 'Mencatat pembayaran gaji pokok Pegawai Pemerintah dengan Perjanjian Kerja (PPPK).', kategori: 'Belanja Pegawai' },
  { no: 14, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511619', uraianAkun: 'Belanja Pembulatan Gaji PPPK', penggunaanSingkat: 'Mencatat pembayaran pembulatan gaji pokok PPPK.', kategori: 'Belanja Pegawai' },
  { no: 15, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511621', uraianAkun: 'Belanja Tunjangan Suami/Istri PPPK', penggunaanSingkat: 'Mencatat pembayaran tunjangan suami/istri PPPK.', kategori: 'Belanja Pegawai' },
  { no: 16, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511622', uraianAkun: 'Belanja Tunjangan Anak PPPK', penggunaanSingkat: 'Mencatat pembayaran tunjangan anak PPPK.', kategori: 'Belanja Pegawai' },
  { no: 17, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511624', uraianAkun: 'Belanja Tunjangan Fungsional PPPK', penggunaanSingkat: 'Mencatat pembayaran tunjangan fungsional PPPK.', kategori: 'Belanja Pegawai' },
  { no: 18, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511625', uraianAkun: 'Belanja Tunjangan Beras PPPK', penggunaanSingkat: 'Mencatat pembayaran tunjangan beras PPPK, dalam bentuk uang dan/atau natura.', kategori: 'Belanja Pegawai' },
  { no: 19, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511628', uraianAkun: 'Belanja Uang Makan PPPK', penggunaanSingkat: 'Mencatat pembayaran uang makan PPPK.', kategori: 'Belanja Pegawai' },
  { no: 20, kelompokBelanja: '051', kodeAkun3Digit: '511', namaAkun3Digit: 'BELANJA GAJI DAN TUNJANGAN', kodeAkun6Digit: '511633', uraianAkun: 'Belanja Tunjangan Umum PPPK', penggunaanSingkat: 'Mencatat pembayaran tunjangan umum/tambahan tunjangan umum PPPK.', kategori: 'Belanja Pegawai' },

  // ═══════════════════════════════════════════════════════════════════
  // 051 BELANJA PEGAWAI - BELANJA HONORARIUM/LEMBUR/TUNJANGAN KHUSUS
  // ═══════════════════════════════════════════════════════════════════
  { no: 21, kelompokBelanja: '051', kodeAkun3Digit: '512', namaAkun3Digit: 'BELANJA HONORARIUM/LEMBUR/TUNJANGAN KHUSUS & BELANJA PEGAWAI TRANSITO', kodeAkun6Digit: '512111', uraianAkun: 'Belanja Uang Honor Tetap', penggunaanSingkat: 'Mencatat pembayaran uang honor tetap.', kategori: 'Belanja Pegawai' },
  { no: 22, kelompokBelanja: '051', kodeAkun3Digit: '512', namaAkun3Digit: 'BELANJA HONORARIUM/LEMBUR/TUNJANGAN KHUSUS & BELANJA PEGAWAI TRANSITO', kodeAkun6Digit: '512211', uraianAkun: 'Belanja Uang Lembur', penggunaanSingkat: 'Mencatat pembayaran uang lembur, termasuk uang makan yang dibayarkan dalam rangka lembur.', kategori: 'Belanja Pegawai' },
  { no: 23, kelompokBelanja: '051', kodeAkun3Digit: '512', namaAkun3Digit: 'BELANJA HONORARIUM/LEMBUR/TUNJANGAN KHUSUS & BELANJA PEGAWAI TRANSITO', kodeAkun6Digit: '512212', uraianAkun: 'Belanja Uang Lembur PPPK', penggunaanSingkat: 'Mencatat pembayaran uang lembur PPPK.', kategori: 'Belanja Pegawai' },
  { no: 24, kelompokBelanja: '051', kodeAkun3Digit: '512', namaAkun3Digit: 'BELANJA HONORARIUM/LEMBUR/TUNJANGAN KHUSUS & BELANJA PEGAWAI TRANSITO', kodeAkun6Digit: '512411', uraianAkun: 'Belanja Pegawai (Tunjangan Khusus/Kegiatan/Kinerja)', penggunaanSingkat: 'Mencatat pembayaran tunjangan khusus/kegiatan/kinerja dan pembiayaan kepegawaian lainnya di dalam negeri sesuai ketentuan.', kategori: 'Belanja Pegawai' },
  { no: 25, kelompokBelanja: '051', kodeAkun3Digit: '512', namaAkun3Digit: 'BELANJA HONORARIUM/LEMBUR/TUNJANGAN KHUSUS & BELANJA PEGAWAI TRANSITO', kodeAkun6Digit: '512414', uraianAkun: 'Belanja Pegawai Tunjangan Khusus/Kegiatan/Kinerja PPPK', penggunaanSingkat: 'Mencatat pembayaran tunjangan khusus/kegiatan/kinerja dan pembiayaan kepegawaian lainnya bagi PPPK sesuai ketentuan.', kategori: 'Belanja Pegawai' },

  // ═══════════════════════════════════════════════════════════════════
  // 052 BELANJA BARANG DAN JASA - BELANJA BARANG
  // ═══════════════════════════════════════════════════════════════════
  { no: 26, kelompokBelanja: '052', kodeAkun3Digit: '521', namaAkun3Digit: 'BELANJA BARANG', kodeAkun6Digit: '521111', uraianAkun: 'Belanja Keperluan Perkantoran', penggunaanSingkat: 'Membiayai keperluan sehari-hari perkantoran yang langsung nampak operasional dan tidak menghasilkan persediaan; termasuk kebutuhan administrasi kantor di bawah batas kapitalisasi.', kategori: 'Belanja Barang' },
  { no: 27, kelompokBelanja: '052', kodeAkun3Digit: '521', namaAkun3Digit: 'BELANJA BARANG', kodeAkun6Digit: '521114', uraianAkun: 'Belanja Pengiriman Surat Dinas Pos Pusat', penggunaanSingkat: 'Membiayai pengiriman surat/dokumen dalam rangka kedinasan.', kategori: 'Belanja Barang' },
  { no: 28, kelompokBelanja: '052', kodeAkun3Digit: '521', namaAkun3Digit: 'BELANJA BARANG', kodeAkun6Digit: '521115', uraianAkun: 'Belanja Honor Operasional Satuan Kerja', penggunaanSingkat: 'Mencatat honor tidak tetap yang terkait dengan operasional satuan kerja, seperti honor pengelola kegiatan/keuangan sesuai ketentuan.', kategori: 'Belanja Barang' },
  { no: 29, kelompokBelanja: '052', kodeAkun3Digit: '521', namaAkun3Digit: 'BELANJA BARANG', kodeAkun6Digit: '521119', uraianAkun: 'Belanja Barang Operasional Lainnya', penggunaanSingkat: 'Mencatat barang operasional yang tidak dapat ditampung pada akun operasional terkait lainnya dan tidak menghasilkan persediaan.', kategori: 'Belanja Barang' },
  { no: 30, kelompokBelanja: '052', kodeAkun3Digit: '521', namaAkun3Digit: 'BELANJA BARANG', kodeAkun6Digit: '521211', uraianAkun: 'Belanja Bahan', penggunaanSingkat: 'Mencatat bahan pendukung kegiatan yang habis dipakai, terutama untuk kegiatan nonoperasional, dan tidak menghasilkan persediaan.', kelompokBarangJasa: 'Konsumsi, ATK, modul, banner, sertifikat', kategori: 'Belanja Barang' },
  { no: 31, kelompokBelanja: '052', kodeAkun3Digit: '521', namaAkun3Digit: 'BELANJA BARANG', kodeAkun6Digit: '521213', uraianAkun: 'Belanja Honor Output Kegiatan', penggunaanSingkat: 'Mencatat honor tidak tetap yang terkait langsung dengan pelaksanaan output kegiatan dan umumnya bersifat insidentil.', kelompokBarangJasa: 'Honor penceramah, narasumber, pengajar diklat', kategori: 'Belanja Barang' },
  { no: 32, kelompokBelanja: '052', kodeAkun3Digit: '521', namaAkun3Digit: 'BELANJA BARANG', kodeAkun6Digit: '521219', uraianAkun: 'Belanja Barang Non Operasional Lainnya', penggunaanSingkat: 'Mencatat pengeluaran barang nonoperasional yang tidak dapat ditampung pada akun nonoperasional lainnya dan tidak menghasilkan persediaan.', kelompokBarangJasa: 'Jasa laundry, obat-obatan P3K, jasa penunjang', kategori: 'Belanja Barang' },
  { no: 33, kelompokBelanja: '052', kodeAkun3Digit: '521', namaAkun3Digit: 'BELANJA BARANG', kodeAkun6Digit: '521231', uraianAkun: 'Belanja Barang Pemberian Penghargaan dalam bentuk uang', penggunaanSingkat: 'Mencatat belanja bantuan pemerintah untuk pemberian penghargaan dalam bentuk uang sesuai ketentuan yang berlaku.', kategori: 'Belanja Barang' },
  { no: 34, kelompokBelanja: '052', kodeAkun3Digit: '521', namaAkun3Digit: 'BELANJA BARANG', kodeAkun6Digit: '521811', uraianAkun: 'Belanja Barang Persediaan Barang Konsumsi', penggunaanSingkat: 'Mencatat belanja barang yang menghasilkan persediaan berupa barang konsumsi, seperti ATK, bahan cetakan, dan alat rumah tangga.', kelompokBarangJasa: 'Diklat kit, souvenir, seragam peserta', kategori: 'Belanja Barang' },
  { no: 35, kelompokBelanja: '052', kodeAkun3Digit: '521', namaAkun3Digit: 'BELANJA BARANG', kodeAkun6Digit: '521832', uraianAkun: 'Belanja Barang Persediaan Lainnya', penggunaanSingkat: 'Mencatat belanja barang yang menghasilkan persediaan selain kelompok persediaan barang konsumsi.', kategori: 'Belanja Barang' },

  // ═══════════════════════════════════════════════════════════════════
  // 052 BELANJA BARANG DAN JASA - BELANJA JASA
  // ═══════════════════════════════════════════════════════════════════
  { no: 36, kelompokBelanja: '052', kodeAkun3Digit: '522', namaAkun3Digit: 'BELANJA JASA', kodeAkun6Digit: '522111', uraianAkun: 'Belanja Langganan Listrik', penggunaanSingkat: 'Mencatat pembayaran langganan listrik, termasuk denda keterlambatan sesuai ketentuan.', kategori: 'Belanja Jasa' },
  { no: 37, kelompokBelanja: '052', kodeAkun3Digit: '522', namaAkun3Digit: 'BELANJA JASA', kodeAkun6Digit: '522112', uraianAkun: 'Belanja Langganan Telepon', penggunaanSingkat: 'Mencatat pembayaran langganan telepon, termasuk denda keterlambatan sesuai ketentuan.', kategori: 'Belanja Jasa' },
  { no: 38, kelompokBelanja: '052', kodeAkun3Digit: '522', namaAkun3Digit: 'BELANJA JASA', kodeAkun6Digit: '522113', uraianAkun: 'Belanja Langganan Air', penggunaanSingkat: 'Mencatat pembayaran langganan air, termasuk denda keterlambatan sesuai ketentuan.', kategori: 'Belanja Jasa' },
  { no: 39, kelompokBelanja: '052', kodeAkun3Digit: '522', namaAkun3Digit: 'BELANJA JASA', kodeAkun6Digit: '522119', uraianAkun: 'Belanja Langganan Daya dan Jasa Lainnya', penggunaanSingkat: 'Mencatat pembayaran langganan daya dan jasa lainnya yang tidak termasuk listrik, telepon, atau air.', kategori: 'Belanja Jasa' },
  { no: 40, kelompokBelanja: '052', kodeAkun3Digit: '522', namaAkun3Digit: 'BELANJA JASA', kodeAkun6Digit: '522131', uraianAkun: 'Belanja Jasa Konsultan', penggunaanSingkat: 'Mencatat pembayaran jasa konsultan secara kontraktual yang tidak menghasilkan aset lainnya.', kategori: 'Belanja Jasa' },
  { no: 41, kelompokBelanja: '052', kodeAkun3Digit: '522', namaAkun3Digit: 'BELANJA JASA', kodeAkun6Digit: '522141', uraianAkun: 'Belanja Sewa', penggunaanSingkat: 'Mencatat pembayaran sewa, misalnya sewa kantor/gedung/ruangan atau sewa lainnya.', kategori: 'Belanja Jasa' },
  { no: 42, kelompokBelanja: '052', kodeAkun3Digit: '522', namaAkun3Digit: 'BELANJA JASA', kodeAkun6Digit: '522151', uraianAkun: 'Belanja Jasa Profesi', penggunaanSingkat: 'Mencatat pembayaran jasa profesi/honorarium narasumber, pembicara, praktisi, atau pakar sesuai ketentuan.', kategori: 'Belanja Jasa' },
  { no: 43, kelompokBelanja: '052', kodeAkun3Digit: '522', namaAkun3Digit: 'BELANJA JASA', kodeAkun6Digit: '522191', uraianAkun: 'Belanja Jasa Lainnya', penggunaanSingkat: 'Mencatat pembayaran jasa yang tidak dapat ditampung pada kelompok akun jasa lainnya yang lebih spesifik.', kategori: 'Belanja Jasa' },

  // ═══════════════════════════════════════════════════════════════════
  // 052 BELANJA BARANG DAN JASA - BELANJA PEMELIHARAAN
  // ═══════════════════════════════════════════════════════════════════
  { no: 44, kelompokBelanja: '052', kodeAkun3Digit: '523', namaAkun3Digit: 'BELANJA PEMELIHARAAN', kodeAkun6Digit: '523111', uraianAkun: 'Belanja Pemeliharaan Gedung dan Bangunan', penggunaanSingkat: 'Mencatat pemeliharaan/perbaikan gedung dan bangunan untuk mempertahankan kondisi normal dan tidak memenuhi kriteria kapitalisasi.', kategori: 'Belanja Pemeliharaan' },
  { no: 45, kelompokBelanja: '052', kodeAkun3Digit: '523', namaAkun3Digit: 'BELANJA PEMELIHARAAN', kodeAkun6Digit: '523113', uraianAkun: 'Belanja Asuransi Gedung dan Bangunan', penggunaanSingkat: 'Mencatat pembayaran asuransi gedung dan bangunan sesuai kebutuhan dan ketentuan penganggaran.', kategori: 'Belanja Pemeliharaan' },
  { no: 46, kelompokBelanja: '052', kodeAkun3Digit: '523', namaAkun3Digit: 'BELANJA PEMELIHARAAN', kodeAkun6Digit: '523121', uraianAkun: 'Belanja Pemeliharaan Peralatan dan Mesin', penggunaanSingkat: 'Mencatat pemeliharaan/perbaikan peralatan dan mesin agar tetap dalam kondisi normal dan tidak memenuhi kriteria kapitalisasi.', kategori: 'Belanja Pemeliharaan' },
  { no: 47, kelompokBelanja: '052', kodeAkun3Digit: '523', namaAkun3Digit: 'BELANJA PEMELIHARAAN', kodeAkun6Digit: '523199', uraianAkun: 'Belanja Pemeliharaan Lainnya', penggunaanSingkat: 'Mencatat pemeliharaan/perbaikan aset atau objek lainnya yang tidak dapat ditampung pada akun pemeliharaan yang lebih spesifik.', kategori: 'Belanja Pemeliharaan' },

  // ═══════════════════════════════════════════════════════════════════
  // 052 BELANJA BARANG DAN JASA - BELANJA PERJALANAN DINAS
  // ═══════════════════════════════════════════════════════════════════
  { no: 48, kelompokBelanja: '052', kodeAkun3Digit: '524', namaAkun3Digit: 'BELANJA PERJALANAN DINAS', kodeAkun6Digit: '524111', uraianAkun: 'Belanja Perjalanan Dinas Biasa', penggunaanSingkat: 'Mencatat perjalanan dinas jabatan melewati batas kota dan perjalanan dinas pindah sesuai ketentuan perjalanan dinas dalam negeri.', kelompokBarangJasa: 'Tiket pesawat, taksi bandara, uang harian diklat', kategori: 'Belanja Perjalanan' },
  { no: 49, kelompokBelanja: '052', kodeAkun3Digit: '524', namaAkun3Digit: 'BELANJA PERJALANAN DINAS', kodeAkun6Digit: '524113', uraianAkun: 'Belanja Perjalanan Dinas Dalam Kota', penggunaanSingkat: 'Mencatat perjalanan dinas yang dilaksanakan di dalam kota sesuai ketentuan perjalanan dinas dalam kota.', kategori: 'Belanja Perjalanan' },
  { no: 50, kelompokBelanja: '052', kodeAkun3Digit: '524', namaAkun3Digit: 'BELANJA PERJALANAN DINAS', kodeAkun6Digit: '524114', uraianAkun: 'Belanja Perjalanan Dinas Paket Meeting Dalam Kota', penggunaanSingkat: 'Mencatat perjalanan dinas untuk rapat, seminar, dan kegiatan sejenis dalam kota dengan mekanisme paket meeting sesuai ketentuan.', kategori: 'Belanja Perjalanan' },
  { no: 51, kelompokBelanja: '052', kodeAkun3Digit: '524', namaAkun3Digit: 'BELANJA PERJALANAN DINAS', kodeAkun6Digit: '524119', uraianAkun: 'Belanja Perjalanan Dinas Paket Meeting Luar Kota', penggunaanSingkat: 'Mencatat perjalanan dinas paket meeting di luar kota sesuai ketentuan, termasuk komponen biaya yang diperbolehkan.', kategori: 'Belanja Perjalanan' },
  { no: 52, kelompokBelanja: '052', kodeAkun3Digit: '524', namaAkun3Digit: 'BELANJA PERJALANAN DINAS', kodeAkun6Digit: '524211', uraianAkun: 'Belanja Perjalanan Dinas Biasa - Luar Negeri', penggunaanSingkat: 'Mencatat perjalanan dinas biasa ke/dari luar negeri, antara lain untuk pembinaan, konsultasi, pengawasan/pemeriksaan.', kategori: 'Belanja Perjalanan' },
  { no: 53, kelompokBelanja: '052', kodeAkun3Digit: '524', namaAkun3Digit: 'BELANJA PERJALANAN DINAS', kodeAkun6Digit: '524219', uraianAkun: 'Belanja Perjalanan Dinas Lainnya - Luar Negeri', penggunaanSingkat: 'Mencatat perjalanan dinas luar negeri lainnya yang tidak tertampung pada perjalanan dinas biasa atau tetap.', kategori: 'Belanja Perjalanan' },

  // ═══════════════════════════════════════════════════════════════════
  // 053 BELANJA MODAL
  // ═══════════════════════════════════════════════════════════════════
  { no: 54, kelompokBelanja: '053', kodeAkun3Digit: '532', namaAkun3Digit: 'BELANJA MODAL PERALATAN DAN MESIN', kodeAkun6Digit: '532111', uraianAkun: 'Belanja Modal Peralatan dan Mesin', penggunaanSingkat: 'Mencatat pengadaan peralatan dan mesin beserta biaya langsung sampai aset siap digunakan.', kelompokBarangJasa: 'Laptop, server, CCTV, smartlock, videotron', kategori: 'Belanja Modal' },
  { no: 55, kelompokBelanja: '053', kodeAkun3Digit: '533', namaAkun3Digit: 'BELANJA MODAL GEDUNG DAN BANGUNAN', kodeAkun6Digit: '533121', uraianAkun: 'Belanja Penambahan Nilai Gedung dan Bangunan', penggunaanSingkat: 'Mencatat belanja modal setelah perolehan gedung/bangunan yang meningkatkan masa manfaat, kapasitas, atau standar kinerja.', kelompokBarangJasa: 'Renovasi auditorium, canopy, pintu asrama', kategori: 'Belanja Modal' },
  { no: 56, kelompokBelanja: '053', kodeAkun3Digit: '536', namaAkun3Digit: 'BELANJA MODAL LAINNYA', kodeAkun6Digit: '536111', uraianAkun: 'Belanja Modal Lainnya', penggunaanSingkat: 'Mencatat perolehan Aset Tetap Lainnya/Aset Lainnya yang tidak termasuk tanah, peralatan dan mesin, gedung dan bangunan.', kelompokBarangJasa: 'Software, lisensi, hak kekayaan intelektual', kategori: 'Belanja Modal' },
];

async function seed() {
  console.log('🌱 Starting database seed for Bagan Akun Standar...');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.delete(baganAkunStandar);

    // Insert new data
    console.log('📝 Inserting seed data...');
    for (const item of seedData) {
      await db.insert(baganAkunStandar).values(item);
    }

    console.log(`✅ Successfully seeded ${seedData.length} akun belanja records!`);
    console.log('📊 Summary by kategori:');

    const counts = seedData.reduce((acc, item) => {
      acc[item.kategori] = (acc[item.kategori] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(counts).forEach(([kategori, count]) => {
      console.log(`   - ${kategori}: ${count} akun`);
    });

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
