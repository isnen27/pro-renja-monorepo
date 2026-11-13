export interface DokumenRabItem {
  id: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  unitKerja: string;
  kodeUnit: string;
  tahunAnggaran: number;
  totalPagu: number;
  status: string;
  nomorSurat: string;
  fullText: string;
}

export const DOKUMEN_RAB_DATA: Record<string, DokumenRabItem> = {
  "PATIH": {
    id: "RAB-PATIH-01",
    kodeKegiatan: "051.0A.3365.BMA.006",
    namaKegiatan: "Penyelenggaraan Pendidikan dan Pelatihan Aparat Penegak Hukum (APH) dan Stakeholder APU PPT",
    unitKerja: "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
    kodeUnit: "PATIH",
    tahunAnggaran: 2027,
    totalPagu: 14850000000,
    status: "Final Disetujui (Signed)",
    nomorSurat: "RAB/3365/DL/2027/01",
    fullText: `RINCIAN KERTAS KERJA RENCANA ANGGARAN BIAYA (RAB)
TAHUN ANGGARAN 2027

Kementerian/Lembaga : Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK)
Unit Kerja / Satker : Pusdiklat APU PPT (Satker 3365)
Program             : Program Pencegahan dan Pemberantasan TPPU dan TPPT (051.0A)
Kegiatan            : Penyelenggaraan Pelatihan dan Peningkatan Kapasitas SDM Rezim APU PPT (BMA)
KRO / RO            : BMA.006 - Aparat Penegak Hukum dan Pengawas Kepatuhan Terlatih (1.450 Orang)
Total Pagu Anggaran : Rp 14.850.000.000,- (Empat Belas Miliar Delapan Ratus Lima Puluh Juta Rupiah)

RINGKASAN REKAPITULASI KOMPONEN BIAYA:
1. Komponen 051: Persiapan dan Pengembangan Kurikulum Diklat
   - Akun 521211 (Belanja Bahan Rapat Koordinasi): Rp 245.000.000,-
   - Akun 522151 (Honorarium Pakar & Penyusun Modul): Rp 480.000.000,-
   Subtotal Komponen 051: Rp 725.000.000,-

2. Komponen 052: Pelaksanaan Pelatihan Aparat Penegak Hukum (13 Angkatan @ 40 Peserta)
   - Akun 521211 (Bahan ATK, Seminar Kit, Modul Cetak): Rp 624.000.000,-
   - Akun 521219 (Konsumsi Peserta & Panitia Fullboard Diklat): Rp 2.496.000.000,-
   - Akun 522151 (Honorarium Pengajar / Fasilitator APH SBM PMK): Rp 1.248.000.000,-
   - Akun 524111 (Biaya Perjalanan Dinas & Akomodasi Narasumber): Rp 832.000.000,-
   Subtotal Komponen 052: Rp 5.200.000.000,-

3. Komponen 053: Pelaksanaan Pelatihan Teknis APU PPT Stakeholder (26 Angkatan @ 35 Peserta)
   - Akun 521211 (Bahan Pembelajaran Digital & Sertifikasi): Rp 819.000.000,-
   - Akun 521219 (Konsumsi Pelatihan Blended): Rp 3.276.000.000,-
   - Akun 522151 (Honorarium Narasumber Ahli Keuangan Digital): Rp 1.638.000.000,-
   - Akun 524111 (Transportasi Pengawas Kepatuhan Daerah): Rp 1.456.000.000,-
   Subtotal Komponen 053: Rp 7.189.000.000,-

4. Komponen 054: Penjaminan Mutu, Sertifikasi & Evaluasi Pasca Diklat
   - Akun 521211 (Bahan Ujian Kompetensi & Lisensi Platform): Rp 520.000.000,-
   - Akun 522151 (Honor Tim Evaluator Level 3 Kirkpatrick & Asesor): Rp 716.000.000,-
   - Akun 524111 (Monitoring Lapangan Dampak Diklat ke Satwil): Rp 500.000.000,-
   Subtotal Komponen 054: Rp 1.736.000.000,-

TOTAL REKAPITULASI PAGU RAB: Rp 14.850.000.000,-

CATATAN KEPATUHAN STANDAR BIAYA:
- Seluruh satuan biaya honorarium mengacu pada PMK SBM TA 2027:
  * Honor Pengajar Diklat Gol IV / Pejabat Eselon II: Rp 300.000,- / JP
  * Honor Narasumber Pakar Non-ASN: Rp 1.700.000,- / OJ
  * Uang Harian Diklat & Paket Fullboard sesuai SBM Jawa Barat (Kampus Depok)
- Kode akun 6-digit sesuai Keputusan Direktur Jenderal Perbendaharaan tentang Bagan Akun Standar (BAS).`
  }
};
