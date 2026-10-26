# Dokumen Alur Proses Bisnis & Hak Akses Role
## Menu Rencana Kerja (Renja) Eselon II — PPATK

Dokumen ini menjelaskan alur proses bisnis end-to-end, keterkaitan antar submenu, serta rincian hak akses dan kewajiban masing-masing **Role User** pada modul **Renja Eselon II / Satker** aplikasi Perencanaan Kerja (Pro-Renja) PPATK.

---

## 1. Submenu Modul Renja Eselon II

Modul Renja Eselon II terdiri dari 6 (enam) submenu utama yang saling terintegrasi:

| No | Submenu | Path Route | Deskripsi & Fungsi Utama |
|---|---|---|---|
| 1 | **Pilih Histori** | `/eselon2/pilih-histori` | Memilih tahapan status histori aktif Satker (Pagu Indikatif `D00`/`D0a-D0z`, Pagu Anggaran `D01-D99`, Alokasi Anggaran `E00-E99`), migrasi data antar tahapan, dan mengelola versi revisi. |
| 2 | **Isian Bab I** | `/eselon2/bab-1` | Terdiri dari 4 Sub-Tab Utama:<br>• **Gambaran Umum**: Tugas, fungsi, & fokus program kerja Satker.<br>• **Capaian Kinerja**: Tabel Indikator Kinerja Kegiatan (IKK) + Narasi T-1 & T-2.<br>• **Arah Kebijakan, Strategi, & Target Kinerja**: Narasi Renstra + Tabel Target T+1.<br>• **Analisis Situasi**: Peluang/Momentum & Tantangan/Rintangan Satker. |
| 3 | **Isian Bab II** | `/eselon2/bab-2` | Narasi Pengantar Program Kerja Satker & Rincian Paket Program Kerja Satker Eselon II (Judul, Latar Belakang, Tujuan, & Outcome). |
| 4 | **Isian Bab III** | `/eselon2/bab-3` | Kebutuhan SDM, Dukungan Sarana Prasarana (Sarpras), serta Matriks Rencana Anggaran Kegiatan Satker TA 2027. |
| 5 | **Isian Lampiran** | `/eselon2/lampiran` | • **Lampiran 1**: Matriks Kerangka Regulasi & Kebijakan Eselon II.<br>• **Lampiran 2**: Matriks Rincian Output (RO) & Komponen Kegiatan. |
| 6 | **Monitoring Submit & Approve Data** | `/eselon2/monitoring` | Pemantauan status histori pengajuan Satker, pengunggahan dokumen TTE oleh Approver, unduh TTE oleh role lain, dan workflow approval bertingkat. |

---

## 2. Rincian Peran & Hak Akses Role User (Eselon II)

Proses bisnis untuk submenu **Pilih Histori** dan **Monitoring Submit & Approve Data** pada Renja Eselon II mengikuti aturan bisnis yang **sama persis** dengan Renja Eselon I:

### 👤 A. Role OPERATOR (Satker / Unit Kerja Eselon II)
* **Pilih Histori**: Memilih tahapan histori aktif Satker dan menjalankan migrasi revisi.
* **Isian Bab I - Bab III & Lampiran**: Mengisi seluruh formulir RichText, tabel IKK, paket proker, matriks anggaran, dan rincian output (RO).
* **Monitoring**:
  * 🟢 **Kirim Data**: Berhak mengirimkan pengajuan data ke **Approver Satker** (`Kirim ke Approver`).
  * 🟢 **Unduh Dokumen TTE**: Dapat mengunduh ulang dokumen TTE yang diunggah oleh Approver.
  * ❌ **Upload Dokumen TTE**: Tidak memiliki akses upload TTE.
  * ❌ **Hapus Data**: Tombol Hapus selalu non-aktif untuk Operator.

### 🛡️ B. Role APPROVER (Kepala Satker / Kasubbag / Kabag / Deputi)
* ⚠️ **WAJIB Upload Dokumen TTE**: Wajib mengunggah dokumen draft Renja Eselon II yang telah ditandatangani secara elektronik (`Upload TTD *`) sebelum dapat menyetujui pengajuan.
* 🟢 **SETUJU**: Mengirimkan data usulan Satker ke pihak **BINCANG**.
* 🔴 **TOLAK**: Mengembalikan data usulan ke **Operator**.
* 🔒 **Proteksi Hapus**: Tidak dapat menghapus data jika status sudah **"Disetujui & Proses Kemenkeu"**.

### 🏛️ C. Role BINCANG (Biro Perencanaan dan Keuangan)
* 🟢 **Verifikasi & Final Approval**: Memeriksa usulan dari seluruh Satker Eselon II dan menyetujui menjadi **"Disetujui & Proses Kemenkeu"**.
* 🟢 **Unduh Dokumen TTE**: Memeriksa dan mengunduh ulang dokumen TTE dari Approver.
* 🔴 **TOLAK**: Mengembalikan pengajuan ke pihak **Approver Satker**.
* 🔒 **Proteksi Hapus**: Tidak dapat menghapus data jika status sudah **"Disetujui & Proses Kemenkeu"**.

### 🔑 D. Role SUPER ADMIN
* Memiliki akses simulasi penuh (*role switcher*) untuk beralih antar role saat pengujian seluruh menu Renja Eselon II.

---

## 3. Matriks Hak Akses & Fitur Renja Eselon II

| Fitur / Submenu | Operator | Approver | BINCANG | Super Admin |
|---|:---:|:---:|:---:|:---:|
| Pilih Histori Eselon II | ✅ Ya | ✅ Ya | ✅ Ya | ✅ Ya |
| Isian Bab I (4 Submenu) | ✅ Edit | 👁️ Lihat | 👁️ Lihat | ✅ Edit |
| Isian Bab II (Proker Satker) | ✅ Edit | 👁️ Lihat | 👁️ Lihat | ✅ Edit |
| Isian Bab III (SDM & Anggaran) | ✅ Edit | 👁️ Lihat | 👁️ Lihat | ✅ Edit |
| Isian Lampiran (Regulasi & RO) | ✅ Edit | 👁️ Lihat | 👁️ Lihat | ✅ Edit |
| **Kirim Data ke Approver** | ✅ Ya | ➖ N/A | ➖ N/A | ✅ Ya |
| **Upload Dokumen TTE Digital** | ❌ Tidak | ✅ **Wajib** | ❌ Tidak | ✅ Ya |
| **Unduh Dokumen TTE Digital** | ✅ Ya | ✅ Ya | ✅ Ya | ✅ Ya |
| **Setuju / Kirim ke BINCANG** | ❌ Tidak | ✅ Ya | ➖ N/A | ✅ Ya |
| **Setuju (Proses Kemenkeu)** | ❌ Tidak | ➖ N/A | ✅ Ya | ✅ Ya |
| **Hapus Data (Belum Disetujui)** | ❌ Tidak | ✅ Ya | ✅ Ya | ✅ Ya |
| **Hapus Data (Disetujui & Kemenkeu)** | 🔒 **Disabled** | 🔒 **Disabled** | 🔒 **Disabled** | ✅ Ya |

---

*Dokumen ini dibuat secara otomatis sebagai standar operasional sistem Pro-Renja Eselon II PPATK.*

