export interface DokumenTorItem {
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

export const DOKUMEN_TOR_DATA: Record<string, DokumenTorItem> = {
  "PATIH": {
    id: "TOR-PATIH-01",
    kodeKegiatan: "051.0A.3365.BMA.006",
    namaKegiatan: "Penyelenggaraan Pendidikan dan Pelatihan Aparat Penegak Hukum (APH) dan Stakeholder APU PPT",
    unitKerja: "Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
    kodeUnit: "PATIH",
    tahunAnggaran: 2027,
    totalPagu: 14850000000,
    status: "Final Disetujui (Signed)",
    nomorSurat: "TOR/3365/DL/2027/01",
    fullText: `KERANGKA ACUAN KERJA (TOR / KAK)
TAHUN ANGGARAN 2027

Kementerian/Lembaga : Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK)
Unit Eselon I       : Sekretariat Utama
Unit Eselon II      : Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme (Pusdiklat APU PPT - PATIH)
Program             : Program Pencegahan dan Pemberantasan TPPU dan TPPT
Sasaran Program     : Meningkatnya Efektivitas Kinerja Pencegahan dan Pemberantasan TPPU dan TPPT
Kegiatan            : Penyelenggaraan Pelatihan dan Peningkatan Kapasitas SDM Rezim APU PPT
Keluaran (Output)   : Aparat Penegak Hukum dan Pengawas Kepatuhan yang Terlatih (1.450 Orang)
Alokasi Anggaran    : Rp 14.850.000.000,-

1. LATAR BELAKANG
A. Dasar Hukum
1. Undang-Undang Nomor 8 Tahun 2010 tentang Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang.
2. Undang-Undang Nomor 9 Tahun 2013 tentang Pencegahan dan Pemberantasan Tindak Pidana Pendanaan Terorisme.
3. Peraturan Presiden Nomor 50 Tahun 2011 tentang Tata Kelola PPATK.
4. Rencana Strategis (Renstra) PPATK 2025-2029 dan Rencana Kerja (Renja) Pusdiklat APU PPT TA 2027.

B. Gambaran Umum & Urgensi Kebutuhan
Tindak pidana pencucian uang dan pendanaan terorisme semakin berkembang dengan memanfaatkan kemajuan teknologi finansial, aset kripto, dan jaringan korporasi lintas yurisdiksi. Hasil National Risk Assessment (NRA) Tahun 2026 dan rekomendasi Financial Action Task Force (FATF) menggarisbawahi pentingnya penguatan investigasi keuangan paralel (parallel financial investigation) dan pemulihan aset (asset recovery) oleh Aparat Penegak Hukum (Kepolisian, Kejaksaan, KPK) serta Pengawas Kepatuhan.
Tanpa peningkatan kompetensi terstruktur, kesenjangan kemampuan teknis aparat penyidik dan pemeriksa dapat menghambat efektivitas penegakan hukum dan penelusuran aliran dana tindak pidana asal.

2. MAKSUD DAN TUJUAN
A. Maksud: Menyelenggarakan rangkaian pendidikan dan pelatihan teknis investigasi keuangan, audit kepatuhan, dan penelusuran aset bagi penegak hukum dan stakeholder APU PPT.
B. Tujuan: 
- Meningkatkan pemahaman regulasi dan tipologi modus pencucian uang mutakhir.
- Meningkatkan keterampilan praktis pelacakan transaksi keuangan mencurigakan dan aset digital.
- Mencapai target IKK Diklat: 1.450 peserta dengan indeks efektivitas minimal 4,50 (skala 5).

3. PENERIMA MANFAAT
Penerima manfaat langsung kegiatan ini adalah penyidik Polri, jaksa tindak pidana khusus Kejaksaan RI, penyidik KPK, hakim peradilan tipikor, analis transaksi PPATK, serta auditor kepatuhan LPP dan PBJ.

4. INDIKATOR DAN SPESIFIKASI KELUARAN (DELIVERABLES)
- Indikator Kinerja Kegiatan: Indeks Efektivitas Pengembangan Kompetensi Aparat Penegak Hukum minimal 4,50.
- Volume Keluaran: 13 Angkatan Diklat APH (520 peserta) dan 26 Angkatan Diklat Teknis APU PPT (930 peserta). Total: 1.450 peserta tersertifikasi.
- Standar Mutu: Akreditasi Lembaga Pelatihan Bintang 4 LAN RI dan ISO 9001:2015.

5. METODE DAN CARA PELAKSANAAN
Kegiatan dilaksanakan dengan metode Blended Learning (kombinasi e-learning mandiri via AML Learning Hub selama 5 hari kerja dan tatap muka intensif / workshop simulasi kasus selama 5 hari di Kampus Pusdiklat APU PPT).
Tahapan Pelaksanaan:
a. Tahap Persiapan (Januari - Februari 2027): Rapat koordinasi kurikulum, penyusunan silabus, pemutakhiran modul, dan pengadaan bahan ajar.
b. Tahap Pelaksanaan (Maret - Oktober 2027): Penyelenggaraan kelas diklat, evaluasi pre-test dan post-test, serta uji kompetensi.
c. Tahap Evaluasi & Pelaporan (November - Desember 2027): Evaluasi dampak pasca-diklat (Level 3 Kirkpatrick) dan penyusunan laporan akuntabilitas kinerja.

6. TEMPAT DAN JADWAL WAKTU PELAKSANAAN
- Tempat: Auditorium dan Ruang Kelas Smart Classroom Kampus Pusdiklat APU PPT, Depok.
- Kurun Waktu: Januari s.d. Desember 2027 dengan distribusi kelas bulanan merata sesuai Rencana Penarikan Dana (RPD).

7. STRUKTUR PELAKSANA & MANAJEMEN RISIKO
Penanggung Jawab: Kepala Pusat Pendidikan dan Pelatihan APU PPT
Ketua Pelaksana   : Koordinator Bidang Penyelenggaraan Pembelajaran
Mitigasi Risiko:
- Risiko keterlambatan konfirmasi peserta instansi mitra dimitigasi dengan pengiriman nota dinas pemanggilan H-30 serta penyediaan kuota cadangan (waiting list).
- Risiko kendala infrastruktur IT sistem ujian online dimitigasi dengan penyediaan server backup lokal dan jaringan internet dedicated 500 Mbps.`
  }
};
