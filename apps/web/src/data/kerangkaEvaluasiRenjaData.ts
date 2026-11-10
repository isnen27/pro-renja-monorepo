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
    nama: "1. Penyelarasan Strategis",
    bobot: 0.20,
    deskripsi: "Penyelarasan kebijakan strategis berjenjang (Renstra Sasaran Strategis → Sasaran Program → Sasaran Kinerja → Program Kerja), konsistensi indikator kinerja, dan responsivitas terhadap rekomendasi pengawasan.",
    subDimensi: [
      {
        id: "1.1",
        nama: "1.1 Penyelarasan Sasaran Berjenjang",
        bobot: 0.33,
        definisi: "Sasaran Strategis (SS) Renstra PPATK menurun jelas ke Sasaran Program (SP), Sasaran Kinerja (SK), dan Program Kerja dengan alur logika yang kokoh.",
        metodePengukuran: "Petakan pohon kinerja cascading; uji keselarasan kode program/kegiatan; validasi konsistensi target antarlevel hierarki.",
        jenisBukti: "Matriks Penyelarasan Renstra-Renja; bagan pohon kinerja; struktur kodefikasi; narasi alur cascading.",
        indikasiRendah: "Alur cascading tidak eksplisit; kode tidak konsisten; kesenjangan target antar-jenjang tidak dijelaskan (Skor 1-2).",
        indikasiTinggi: "Alur cascading sangat jelas; kode program selaras penuh; seluruh keterkaitan level kinerja transparan dan tertelusur (Skor 4-5).",
      },
      {
        id: "1.2",
        nama: "1.2 Konsistensi Narasi & Indikator Kinerja",
        bobot: 0.33,
        definisi: "Narasi, definisi operasional, dan target indikator kinerja selaras antara Renstra instansi, Renstra unit kerja, dan Renja tahun berjalan.",
        metodePengukuran: "Bandingkan narasi Renstra instansi vs Renja unit; pastikan indikator kinerja selaras dan setiap perbedaan memiliki justifikasi rasional.",
        jenisBukti: "Tabel komparasi indikator Renstra vs Renja; definisi operasional indikator kinerja; kamus indikator.",
        indikasiRendah: "Terdapat kontradiksi narasi tanpa alasan; target diubah tanpa penjelasan; definisi indikator tidak seragam (Skor 1-2).",
        indikasiTinggi: "Narasi sepenuhnya koheren; formulasi target terderivasi logis; definisi operasional indikator seragam (Skor 4-5).",
      },
      {
        id: "1.3",
        nama: "1.3 Responsivitas Rekomendasi Pengawasan",
        bobot: 0.34,
        definisi: "Rencana kerja merespons secara nyata rekomendasi evaluasi kinerja SAKIP, BPK, RB, dan APIP periode sebelumnya.",
        metodePengukuran: "Telusuri bagian Analisis Situasi; petakan rekomendasi pengawasan periode lalu ke dalam rencana aksi nyata tahun berjalan.",
        jenisBukti: "Bab Analisis Kinerja; matriks tindak lanjut rekomendasi; narasi rencana aksi perbaikan programatik.",
        indikasiRendah: "Rekomendasi pengawasan tidak diulas; atau diulas namun tidak ditindaklanjuti dalam rencana aksi nyata (Skor 1-2).",
        indikasiTinggi: "Setiap rekomendasi pengawasan terhubung langsung ke intervensi program kerja; alur tindak lanjut sangat tegas (Skor 4-5).",
      },
    ],
  },
  {
    id: 2,
    nama: "2. Integrasi Tata Kelola",
    bobot: 0.25,
    deskripsi: "Integrasi sistem tata kelola instansi pemerintah mencakup keterpaduan SAKIP & SKP Pegawai, Manajemen Risiko (SPIP), Reformasi Birokrasi (RB), dan Zona Integritas (WBK/WBBM).",
    subDimensi: [
      {
        id: "2.1",
        nama: "2.1 Keterpaduan SAKIP & Target Kinerja Pegawai",
        bobot: 0.25,
        definisi: "Indikator Kinerja Utama (IKU) organisasi terhubung langsung dengan Indikator Kinerja Individu (IKI) / target SKP pegawai dengan mekanisme dialog kinerja.",
        metodePengukuran: "Evaluasi keterkaitan sasaran organisasi terhadap ekspektasi kinerja ASN; periksa mekanisme cascading dialog kinerja.",
        jenisBukti: "Matriks pembagian peran-hasil (MPH); cascading IKU ke IKI/SKP; pedoman manajemen kinerja instansi.",
        indikasiRendah: "Tidak terdapat integrasi kinerja; fokus hanya organisasi atau terputus dengan target kinerja individu ASN (Skor 1-2).",
        indikasiTinggi: "Cascading kinerja organisasi ke individu sangat tegas; alur pembagian peran-hasil jelas dan terukur (Skor 4-5).",
      },
      {
        id: "2.2",
        nama: "2.2 Pengendalian Internal & Mitigasi Risiko (SPIP)",
        bobot: 0.25,
        definisi: "Perumusan program kerja didasarkan pada identifikasi risiko organisasi dan dilengkapi rencana mitigasi risiko operasional.",
        metodePengukuran: "Periksa tabel profil risiko, level maturitas SPIP, dan keterkaitan rencana kegiatan dengan mitigasi risiko teridentifikasi.",
        jenisBukti: "Register risiko unit kerja; analisis risiko pada Bab Analisis Situasi; narasi mitigasi pada tiap kelompok program.",
        indikasiRendah: "Program kerja dirumuskan tanpa konteks risiko; atau risiko hanya berupa pernyataan umum tanpa rencana mitigasi (Skor 1-2).",
        indikasiTinggi: "Program kerja secara presisi memitigasi risiko kunci; prioritas kegiatan berbasis tingkat risiko; maturitas SPIP jelas (Skor 4-5).",
      },
      {
        id: "2.3",
        nama: "2.3 Prioritas Aksi Reformasi Birokrasi (RB)",
        bobot: 0.25,
        definisi: "Mengidentifikasi komponen prioritas Reformasi Birokrasi (RB Tematik/General) dan memuat rencana aksi penutupan gap tata kelola.",
        metodePengukuran: "Evaluasi pemetaan komponen evaluasi RB nilai rendah/sedang dan rencana intervensi programatik unit kerja.",
        jenisBukti: "Tabel pemetaan Komponen RB → Capaian Baseline → Kesenjangan (Gap) → Rencana Aksi Tahun Berjalan.",
        indikasiRendah: "Tidak ada identifikasi komponen prioritas RB; kegiatan bersifat rutin tanpa daya ungkit pembenahan tata kelola (Skor 1-2).",
        indikasiTinggi: "Komponen RB dipetakan dengan baseline nilai objektif; fokus intervensi tahun 2027 terstruktur dan terukur (Skor 4-5).",
      },
      {
        id: "2.4",
        nama: "2.4 Pembangunan Zona Integritas (WBK/WBBM)",
        bobot: 0.25,
        definisi: "Rencana aksi pembangunan Zona Integritas (ZI) realistis, memuat inovasi pelayanan publik/tata kelola, dan menjamin keberlanjutan integritas.",
        metodePengukuran: "Cek tindak lanjut rekomendasi Tim Penilai Internal/Nasional ZI dan kesiapan implementasi inovasi penguatan integritas.",
        jenisBukti: "Lembar kerja pembangunan ZI; inovasi pelayanan publik/tata kelola; rencana aksi mitigasi penyimpangan.",
        indikasiRendah: "Rencana ZI hanya mengulang dokumen masa lalu tanpa pembaruan; rekomendasi evaluator tidak ditindaklanjuti (Skor 1-2).",
        indikasiTinggi: "Peta jalan ZI sangat matang; rekomendasi TPI/TPN direspons tuntas dengan indikator keberhasilan yang nyata (Skor 4-5).",
      },
    ],
  },
  {
    id: 3,
    nama: "3. Analisis Kesenjangan & Akar Masalah",
    bobot: 0.20,
    deskripsi: "Ketajaman identifikasi masalah berbasis data, kedalaman analisis akar penyebab struktural, dan kuantifikasi kesenjangan kinerja.",
    subDimensi: [
      {
        id: "3.1",
        nama: "3.1 Ketajaman Perumusan Masalah Berbasis Data",
        bobot: 0.33,
        definisi: "Masalah dirumuskan secara tajam, spesifik, berbasis data kuantitatif dan fakta objektif, bukan sekadar kalimat normatif umum.",
        metodePengukuran: "Periksa kejelasan rumusan masalah dengan data statistik, tren capaian masa lalu, atau deviasi terhadap target standar.",
        jenisBukti: "Bagian Kondisi Umum & Analisis Situasi; tabel capaian vs target historis; bukti data empiris.",
        indikasiRendah: "Rumusan masalah sangat umum, abstrak, atau klise tanpa didukung data baseline dan fakta lapangan (Skor 1-2).",
        indikasiTinggi: "Masalah terdefinisi sangat tajam dengan data kuantitatif komprehensif, lokus jelas, dan batasan terukur (Skor 4-5).",
      },
      {
        id: "3.2",
        nama: "3.2 Kedalaman Identifikasi Akar Masalah",
        bobot: 0.33,
        definisi: "Analisis penyebab menyentuh akar masalah struktural, regulasi, proses bisnis, atau kompetensi, bukan sekadar gejala permukaan.",
        metodePengukuran: "Uji alur logika sebab-akibat (causal chain) pemecahan masalah (misal diagram pohon masalah, fishbone, atau 5-whys).",
        jenisBukti: "Bagan analisis masalah; uraian analisis kausalitas dalam narasi situasi; kajian kebutuhan intervensi.",
        indikasiRendah: "Hanya menguraikan gejala eksternal (misal: 'anggaran terbatas', 'aplikasi terkendala') tanpa analisis akar hakiki (Skor 1-2).",
        indikasiTinggi: "Mengupas akar masalah struktural, sistemik, dan prosedural secara komprehensif dengan penalaran kausal yang logis (Skor 4-5).",
      },
      {
        id: "3.3",
        nama: "3.3 Kuantifikasi Kesenjangan Kinerja",
        bobot: 0.34,
        definisi: "Kuantifikasi kesenjangan kinerja (gap analysis) terukur nyata antara kondisi eksisting dengan target yang ingin dicapai.",
        metodePengukuran: "Hitung presisi selisih numerik gap kinerja dan uji rasionalitas korelasi antara besaran gap dengan volume rencana kerja.",
        jenisBukti: "Matriks komparasi capaian eksisting vs target; perhitungan kebutuhan sumber daya penutupan gap kinerja.",
        indikasiRendah: "Target ditetapkan tanpa perhitungan gap yang jelas; tidak ada korelasi logis antara gap dengan volume kegiatan (Skor 1-2).",
        indikasiTinggi: "Kesenjangan kinerja dihitung dengan rumus presisi; target penutupan gap realistis sesuai daya dukung anggaran (Skor 4-5).",
      },
    ],
  },
  {
    id: 4,
    nama: "4. Kesiapan Kolaborasi Lintas Unit",
    bobot: 0.15,
    deskripsi: "Kesiapan tata hubungan kerja sama lintas unit di internal instansi, kecukupan kapasitas sumber daya, dan peta jalan maturitas institusi.",
    subDimensi: [
      {
        id: "4.1",
        nama: "4.1 Tata Hubungan & Kerja Sama Antar-Unit",
        bobot: 0.33,
        definisi: "Kejelasan mekanisme kolaborasi, tata hubungan kerja, dan pembagian peran dengan unit kerja lain di internal institusi.",
        metodePengukuran: "Evaluasi matriks pembagian tanggung jawab lintas unit, alur pertukaran data/informasi, atau matriks peran kerja bersama.",
        jenisBukti: "Matriks kerja sama lintas unit; Surat Keputusan tim bersama; Standar Operasional Prosedur (SOP) lintas unit.",
        indikasiRendah: "Program kerja bersifat lintas-fungsi namun dirancang secara silotik tanpa pelibatan unit mitra terkait (Skor 1-2).",
        indikasiTinggi: "Mekanisme orkestrasi lintas unit dirancang matang dengan pembagian output bersama yang jelas dan tegas (Skor 4-5).",
      },
      {
        id: "4.2",
        nama: "4.2 Analisis Kecukupan Sumber Daya & Kapasitas",
        bobot: 0.33,
        definisi: "Kesesuaian kapasitas SDM aparatur, teknologi informasi, dan sarana prasarana penunjang untuk mengeksekusi rencana kerja.",
        metodePengukuran: "Periksa analisis beban kerja, pemetaan keahlian yang dibutuhkan, dan kesiapan infrastruktur pendukung.",
        jenisBukti: "Kajian kebutuhan kompetensi pegawai; rencana pengembangan kapasitas (diklat); kesiapan sarana TI.",
        indikasiRendah: "Target dipatok ambisius tanpa menguji kesiapan kapasitas nyata aparatur dan ketersediaan sarana pendukung (Skor 1-2).",
        indikasiTinggi: "Kapasitas sumber daya eksisting dan kebutuhan tambahan dianalisis tuntas disertai strategi pemenuhannya (Skor 4-5).",
      },
      {
        id: "4.3",
        nama: "4.3 Peta Jalan Peningkatan Kematangan Organisasi",
        bobot: 0.34,
        definisi: "Memiliki baseline tingkat kematangan tata kelola (maturitas SPBE, SPIP, kapabilitas pengawasan) dan tahapan pencapaian bertahap.",
        metodePengukuran: "Periksa penyebutan indeks maturitas resmi saat ini serta target capaian milestone tahun berjalan.",
        jenisBukti: "Laporan hasil evaluasi indeks kematangan; matriks target peningkatan bertahap level maturitas organisasi.",
        indikasiRendah: "Tidak ada informasi baseline tingkat maturitas organisasi; penetapan target kenaikan level bersifat spekulatif (Skor 1-2).",
        indikasiTinggi: "Baseline indeks maturitas tercatat resmi disertai tahapan perbaikan tata kelola yang terukur dan aplikatif (Skor 4-5).",
      },
    ],
  },
  {
    id: 5,
    nama: "5. Rasionalitas Target Kinerja",
    bobot: 0.15,
    deskripsi: "Rasionalitas target berdasarkan analisis tren historis dan identifikasi sensitivitas terhadap faktor lingkungan eksternal.",
    subDimensi: [
      {
        id: "5.1",
        nama: "5.1 Dasar Penetapan Target & Tren Historis",
        bobot: 0.50,
        definisi: "Target kinerja ditetapkan berbasis analisis tren historis capaian 2-3 tahun terakhir atau standar tolok ukur (benchmark) valid.",
        metodePengukuran: "Uji laju pertumbuhan (growth rate) target 2027 dibandingkan rata-rata deviasi capaian tahun-tahun sebelumnya.",
        jenisBukti: "Tabel seri data 3 tahun terakhir; analisis deviasi capaian; kajian justifikasi kenaikan target kinerja.",
        indikasiRendah: "Target dinaikkan secara drastis tanpa dasar data historis atau sebaliknya target ditetapkan stagnan tanpa tantangan (Skor 1-2).",
        indikasiTinggi: "Target kinerja dirumuskan sangat rasional berbasis tren historis dan daya ungkit inovasi yang direncanakan (Skor 4-5).",
      },
      {
        id: "5.2",
        nama: "5.2 Mitigasi Faktor Eksternal & Kontinjensi",
        bobot: 0.50,
        definisi: "Mengidentifikasi faktor lingkungan eksternal (kebijakan nasional, regulasi baru, dinamika mitra) dan menyiapkan rencana alternatif.",
        metodePengukuran: "Cek daftar asumsi strategis, analisis sensitivitas terhadap kendala eksternal, dan rencana mitigasi kontinjensi.",
        jenisBukti: "Tabel identifikasi asumsi kunci; analisis risiko lingkungan makro; skenario alternatif pelaksanaan kegiatan.",
        indikasiRendah: "Rencana kerja mengabaikan faktor risiko lingkungan eksternal dan tidak memiliki alternatif skenario pelaksanaan (Skor 1-2).",
        indikasiTinggi: "Asumsi strategis teridentifikasi lengkap dengan proyeksi dampak dan strategi cadangan bila terjadi disrupsi (Skor 4-5).",
      },
    ],
  },
  {
    id: 6,
    nama: "6. Kepatuhan Tindak Lanjut Pengawasan",
    bobot: 0.05,
    deskripsi: "Kepatuhan terhadap pemantauan dan penyelesaian tindak lanjut temuan BPK serta rekomendasi pengawasan internal Inspektorat.",
    subDimensi: [
      {
        id: "6.1",
        nama: "6.1 Tindak Lanjut Temuan BPK & Rekomendasi APIP",
        bobot: 1.00,
        definisi: "Pemantauan menyeluruh dan rencana aksi penyelesaian tindak lanjut temuan BPK serta rekomendasi pengawasan Inspektorat.",
        metodePengukuran: "Periksa status penyelesaian rekomendasi pengawasan masa lalu dan rencana aksi penuntasan sisa rekomendasi pada tahun berjalan.",
        jenisBukti: "Matriks pemantauan tindak lanjut rekomendasi BPK/APIP; rencana aksi percepatan penyelesaian temuan pengawasan.",
        indikasiRendah: "Temuan pengawasan masa lalu tidak dicantumkan; atau tidak ada target penyelesaian rekomendasi yang tertunda (Skor 1-2).",
        indikasiTinggi: "Seluruh temuan pengawasan terinventarisasi rapi dengan status jelas dan rencana aksi tuntas 100% pada tahun 2027 (Skor 4-5).",
      },
    ],
  },
];
