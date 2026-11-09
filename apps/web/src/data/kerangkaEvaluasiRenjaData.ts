export interface SubDimensiEvaluasi {
  id: string; // e.g. "1.1"
  nama: string;
  bobot: number; // e.g. 0.33
  definisi: string;
  metodePengukuran: string;
  jenisBukti: string;
  indikasiRendah: string;
  indikasiTinggi: string;
}

export interface DimensiEvaluasi {
  id: number;
  nama: string;
  bobot: number; // e.g. 0.20
  deskripsi: string;
  subDimensi: SubDimensiEvaluasi[];
}

export const KERANGKA_EVALUASI_RENJA_STRATEGIS: DimensiEvaluasi[] = [
  {
    id: 1,
    nama: "1. Alignment Strategis",
    bobot: 0.20,
    deskripsi: "Keselarasan kebijakan strategis dari Renstra SS → SP → SK → Program Kerja dan tindak lanjut evaluasi.",
    subDimensi: [
      {
        id: "1.1",
        nama: "1.1 Cascading (Renstra SS → SP → SK → Program)",
        bobot: 0.33,
        definisi: "Renstra Sasaran Strategis (SS) menurun jelas ke Sasaran Program (SP), Sasaran Kinerja (SK), dan Program Aksi dengan hubungan logis.",
        metodePengukuran: "Petakan cascading; validasi hubungan & kode; cek target consistency lintas-level.",
        jenisBukti: "Matriks Renstra-Renja; struktur kodefikasi; narasi alur cascading; target harmonisasi.",
        indikasiRendah: "Cascading tidak eksplisit; kode tidak konsisten; target gap tidak dijelaskan (Skor 1-2).",
        indikasiTinggi: "Cascading jelas; kode konsisten; semua level linkage transparan dan dapat dilacak (Skor 4-5).",
      },
      {
        id: "1.2",
        nama: "1.2 Konsistensi Naratif & Metrik",
        bobot: 0.33,
        definisi: "Narasi & indikator konsisten antara Renstra PPATK, Renstra Unit, dan Renja tahun berjalan.",
        metodePengukuran: "Bandingkan narasi Renstra PPATK vs Renja; cek indikator sama atau perbedaannya dijustifikasi secara rasional.",
        jenisBukti: "Renstra PPATK vs Renja; tabel perbandingan target; definisi indikator kinerja.",
        indikasiRendah: "Narasi berbeda tanpa justifikasi; target berubah tanpa penjelasan; definisi tidak konsisten (Skor 1-2).",
        indikasiTinggi: "Narasi selaras dengan variasi ter-eksplain; target derivasi jelas; definisi seragam (Skor 4-5).",
      },
      {
        id: "1.3",
        nama: "1.3 Responsiveness Evaluasi Lalu",
        bobot: 0.34,
        definisi: "Program kerja 2027 merespons rekomendasi SAKIP, BPK, RB, dan APIP periode sebelumnya.",
        metodePengukuran: "Cari rekomendasi dalam Analisis Situasi; petakan ke program aksi konkret.",
        jenisBukti: "Bab Analisis Situasi; rekomendasi dengan program kerja terkait; narasi perbaikan.",
        indikasiRendah: "Rekomendasi tidak disebutkan, atau disebutkan tapi tanpa program aksi konkret (Skor 1-2).",
        indikasiTinggi: "Setiap rekomendasi dapat di-link ke program kerja; narasi menghubungkan temuan ke aksi riil (Skor 4-5).",
      },
    ],
  },
  {
    id: 2,
    nama: "2. Integrasi Tata Kelola",
    bobot: 0.25,
    deskripsi: "Integrasi sistem tata kelola internal mencakup SAKIP, Manajemen Risiko (SPIP), Reformasi Birokrasi (RB), dan Zona Integritas (ZI).",
    subDimensi: [
      {
        id: "2.1",
        nama: "2.1 Integrasi SAKIP (Org + Individual KPI)",
        bobot: 0.25,
        definisi: "KPI organisasi (Renja) ter-link dengan KPI individu ASN (SKP); memiliki mekanisme cascading yang jelas.",
        metodePengukuran: "Cari narasi integrasi KPI; metode linking; sistem monitoring individual vs organisasi.",
        jenisBukti: "Narasi integrasi KPI; matriks org-individual linking; SOP manajemen kinerja.",
        indikasiRendah: "Tidak ada integrasi KPI; hanya fokus organisasi atau samar tanpa mekanisme konkret (Skor 1-2).",
        indikasiTinggi: "Cascading KPI eksplisit; linking mechanism jelas; sistem informasi memantau individual vs org (Skor 4-5).",
      },
      {
        id: "2.2",
        nama: "2.2 Cakupan Manajemen Risiko (SPIP)",
        bobot: 0.25,
        definisi: "Program kerja didasarkan pada identifikasi risiko dan terdapat mitigasi risiko per program.",
        metodePengukuran: "Cari manajemen risiko, identifikasi risiko, mitigasi; link program kerja ke risiko spesifik.",
        jenisBukti: "Faktor risiko dalam Analisis Situasi; program kerja dengan narasi mitigasi risiko; maturitas SPIP.",
        indikasiRendah: "Program kerja tanpa konteks risiko; atau risiko umum tanpa dikaitkan ke program (Skor 1-2).",
        indikasiTinggi: "Program kerja jelas memitigasi risiko teridentifikasi; prioritas berbasis tingkat risiko (Skor 4-5).",
      },
      {
        id: "2.3",
        nama: "2.3 Fokus RB Component & Prioritization",
        bobot: 0.25,
        definisi: "Identifikasi komponen RB (indikator utama) yang menjadi fokus dan justifikasi prioritas program penutupan gap.",
        metodePengukuran: "Baca narasi komponen RB bobot tinggi vs sub-optimal; link program kerja ke penutupan gap.",
        jenisBukti: "Tabel pemetaan Komponen RB → Nilai Baseline → Gap → Program Aksi.",
        indikasiRendah: "Tidak ada identifikasi komponen RB prioritas; program kerja generik tanpa keterkaitan (Skor 1-2).",
        indikasiTinggi: "Komponen RB dipetakan dengan baseline nilai; fokus program terstruktur per komponen (Skor 4-5).",
      },
      {
        id: "2.4",
        nama: "2.4 Zona Integritas Roadmap & Sustainability",
        bobot: 0.25,
        definisi: "Roadmap Zona Integritas (WBK/WBBM) realistis: keterlibatan pimpinan, inovasi, dan keberlanjutan.",
        metodePengukuran: "Cari narasi ZI & rekomendasi evaluasi ZI lalu; periksa program mengatasi rekomendasi.",
        jenisBukti: "Analisis situasi ZI; rencana aksi pembangunan ZI; inovasi pelayanan publik.",
        indikasiRendah: "Roadmap ZI normatif tanpa tindak lanjut evaluasi sebelumnya (Skor 1-2).",
        indikasiTinggi: "Roadmap ZI terperinci, menindaklanjuti rekomendasi TPN/TPI dengan indikator dampak nyata (Skor 4-5).",
      },
    ],
  },
  {
    id: 3,
    nama: "3. Analisis Gap & Root Cause",
    bobot: 0.20,
    deskripsi: "Kedalaman identifikasi masalah strategis, analisis akar penyebab, dan justifikasi kuantitatif penetapan target.",
    subDimensi: [
      {
        id: "3.1",
        nama: "3.1 Artikulasi Problem (Konkret vs Vague)",
        bobot: 0.33,
        definisi: "Masalah dirumuskan secara spesifik, berbasis data, bukan sekadar kalimat normatif umum.",
        metodePengukuran: "Cari problem statement spesifik dengan angka baseline, komparasi standar, atau tren historis.",
        jenisBukti: "Bab I Kondisi Umum & Analisis Situasi; tabel capaian vs target; data statistik.",
        indikasiRendah: "Pernyataan masalah sangat umum / klise tanpa dukungan data dan fakta (Skor 1-2).",
        indikasiTinggi: "Masalah sangat terinci dengan eviden metrik numerik dan lokus yang jelas (Skor 4-5).",
      },
      {
        id: "3.2",
        nama: "3.2 Depth Analisis Root Cause",
        bobot: 0.33,
        definisi: "Analisis penyebab masalah menyentuh faktor fundamental (proses, kompetensi, regulasi, teknologi), bukan hanya gejala.",
        metodePengukuran: "Evaluasi logika sebab-akibat (causal linking) antara isu dengan akar penyebab.",
        jenisBukti: "Narasi analisis situasi; pohon masalah / fishbone / 5-whys dalam dokumen.",
        indikasiRendah: "Hanya menyebutkan gejala eksternal (misal 'anggaran kurang', 'aplikasi error') tanpa analisis akar (Skor 1-2).",
        indikasiTinggi: "Menguraikan akar penyebab struktural, prosedural, atau kultural secara berjenjang (Skor 4-5).",
      },
      {
        id: "3.3",
        nama: "3.3 Gap Quantification & Target Rationale",
        bobot: 0.34,
        definisi: "Kuantifikasi kesenjangan kinerja terukur dan menghubungkan intervensi program dengan penutupan gap.",
        metodePengukuran: "Periksa besaran selisih antara kondisi saat ini vs target harapan serta kalkulasi kebutuhan aksi.",
        jenisBukti: "Matriks perbandingan indikator; kalkulasi kebutuhan sumber daya per gap.",
        indikasiRendah: "Target melompat tanpa kalkulasi gap dan tanpa rasionalisasi sumber daya (Skor 1-2).",
        indikasiTinggi: "Gap dihitung presisi, target realistis terhubung langsung dengan volume intervensi (Skor 4-5).",
      },
    ],
  },
  {
    id: 4,
    nama: "4. Kesiapan Implementasi Lintas-Unit",
    bobot: 0.15,
    deskripsi: "Kesiapan koordinasi lintas unit kerja di lingkungan PPATK, kecukupan sumber daya, dan peta jalan kematangan institusi.",
    subDimensi: [
      {
        id: "4.1",
        nama: "4.1 Mekanisme Koordinasi Lintas-Unit",
        bobot: 0.33,
        definisi: "Terdapat kejelasan pembagian peran, koordinasi antar unit eselon II/I, dan penyelesaian ketergantungan.",
        metodePengukuran: "Periksa ada/tidaknya penjelasan peran mitra kerja internal, alur koordinasi, atau matriks RACI.",
        jenisBukti: "Narasi kolaborasi; tim kerja lintas unit; Service Level Agreement (SLA) internal.",
        indikasiRendah: "Program bernuansa lintas-unit namun ditulis seolah bekerja sendirian (silotik) (Skor 1-2).",
        indikasiTinggi: "Mekanisme orkestrasi lintas-unit dirumuskan detail dengan pembagian output bersama (Skor 4-5).",
      },
      {
        id: "4.2",
        nama: "4.2 Kapasitas & Resource Adequacy",
        bobot: 0.33,
        definisi: "Kesesuaian kapasitas SDM, sarana prasarana, dan TI yang dibutuhkan untuk mengeksekusi program kerja.",
        metodePengukuran: "Evaluasi apakah kebutuhan kompetensi dan sarpras pendukung terpetakan realistis.",
        jenisBukti: "Analisis beban kerja kualitatif; peta kebutuhan diklat; pemenuhan sarpras TI.",
        indikasiRendah: "Asumsi kapasitas tidak dibahas, target ambisius tanpa dukungan SDM/sarpras (Skor 1-2).",
        indikasiTinggi: "Kapasitas eksisting dan gap kapabilitas dianalisis tuntas beserta langkah pemenuhannya (Skor 4-5).",
      },
      {
        id: "4.3",
        nama: "4.3 Institutional Maturity Baseline & Path",
        bobot: 0.34,
        definisi: "Memiliki baseline tingkat maturitas (SPIP, SPBE, Kapabilitas Pengawasan) dan tahapan pencapaian bertahap.",
        metodePengukuran: "Cek penyebutan level maturitas eksisting dan milestone tahunan/triwulanan.",
        jenisBukti: "Data indeks maturitas; grafik lintasan target kematangan tata kelola.",
        indikasiRendah: "Tidak memiliki data baseline maturitas; target dipatok acak (Skor 1-2).",
        indikasiTinggi: "Baseline maturitas terdata resmi dengan peta jalan kenaikan level yang logis (Skor 4-5).",
      },
    ],
  },
  {
    id: 5,
    nama: "5. Kredibilitas Target & Realism",
    bobot: 0.15,
    deskripsi: "Rasionalitas target berdasarkan tren historis dan identifikasi sensitivitas terhadap faktor lingkungan eksternal.",
    subDimensi: [
      {
        id: "5.1",
        nama: "5.1 Target Rationale & Historical Delta",
        bobot: 0.50,
        definisi: "Target ditetapkan berbasis tren capaian 2-3 tahun sebelumnya atau benchmark yang dapat dipertanggungjawabkan.",
        metodePengukuran: "Bandingkan delta target 2027 dengan laju perbaikan tahun-tahun sebelumnya.",
        jenisBukti: "Tabel tren 3 tahun; analisis deviasi; pembenaran rasional atas akselerasi target.",
        indikasiRendah: "Target melonjak tidak wajar tanpa justifikasi penambahan kapasitas atau sumber daya (Skor 1-2).",
        indikasiTinggi: "Target didasarkan pada perhitungan tren historis yang diperkuat daya ungkit intervensi baru (Skor 4-5).",
      },
      {
        id: "5.2",
        nama: "5.2 Sensitivity External Factors",
        bobot: 0.50,
        definisi: "Mengidentifikasi faktor eksternal (kebijakan nasional, perubahan regulasi, risiko fiskal) dan mitigasinya.",
        metodePengukuran: "Cari analisis asumsi makro/eksternal dan rencana kontinjensi.",
        jenisBukti: "Daftar asumsi kunci; matriks risiko eksternal; skenario alternatif pelaksanaan program.",
        indikasiRendah: "Mengabaikan faktor eksternal dan tidak memiliki rencana kontinjensi (Skor 1-2).",
        indikasiTinggi: "Faktor eksternal dipetakan dengan probabilitas dan skenario alternatif bila asumsi meleset (Skor 4-5).",
      },
    ],
  },
  {
    id: 6,
    nama: "6. Compliance & Risk Management",
    bobot: 0.05,
    deskripsi: "Kepatuhan terhadap tindak lanjut temuan pemeriksaan eksternal (BPK) dan pengawasan internal (APIP).",
    subDimensi: [
      {
        id: "6.1",
        nama: "6.1 BPK Findings & APIP Monitoring (RB Compliance)",
        bobot: 1.00,
        definisi: "Memuat pemantauan dan rencana penyelesaian tindak lanjut temuan BPK/APIP agar tidak terulang.",
        metodePengukuran: "Cek kejelasan status tindak lanjut temuan dan program mitigasi preventif.",
        jenisBukti: "Matriks pemantauan temuan BPK/APIP; rencana aksi penyelesaian rekomendasi dalam Renja 2027.",
        indikasiRendah: "Temuan audit masa lalu diabaikan atau tanpa timeline penyelesaian yang jelas (Skor 1-2).",
        indikasiTinggi: "Seluruh rekomendasi temuan memiliki langkah perbaikan konkret dan target tuntas pada 2027 (Skor 4-5).",
      },
    ],
  },
];
