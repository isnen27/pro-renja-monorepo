/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import unitKerjaData from "./unitKerjaData.json";

export interface UserAccount {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  unitKerja: string;
  password: string;
  peran: string[];
  status: "Online" | "Offline";
  terakhirLogin: string;
}

export interface SystemNotification {
  id: string;
  judul: string;
  pesan: string;
  kategori: "Penting" | "Info" | "Peringatan" | "Tindak Lanjut";
  waktu: string;
  targetUnit?: string;
  targetPeran?: string;
  dibaca?: boolean;
}

export const DAFTAR_PERAN = [
  "Operator Eselon I",
  "Approver Eselon I",
  "Operator Eselon II",
  "Approver Eselon II",
  "BINCANG",
  "Tim Perencanaan",
  "Tim Penganggaran",
  "PEKA",
  "Super Admin",
] as const;

export type PeranType = (typeof DAFTAR_PERAN)[number];

// Daftar Unit Kerja Resmi (Nomenklatur Submenu Unit Kerja PPATK)
export const DAFTAR_UNIT_KERJA_PPATK: { kode: string; nama: string; labelLengkap: string }[] = [
  { kode: "SETIA", nama: "Sekretariat Utama", labelLengkap: "SETIA - Sekretariat Utama (Eselon I)" },
  { kode: "TEGAS", nama: "Deputi Bidang Strategi dan Kerja Sama", labelLengkap: "TEGAS - Deputi Bidang Strategi dan Kerja Sama (Eselon I)" },
  { kode: "PENGASUH", nama: "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan", labelLengkap: "PENGASUH - Deputi Bidang Pelaporan dan Pengawasan Kepatuhan (Eselon I)" },
  { kode: "ASA", nama: "Deputi Bidang Analisis dan Pemeriksaan", labelLengkap: "ASA - Deputi Bidang Analisis dan Pemeriksaan (Eselon I)" },
  ...unitKerjaData.map((u) => ({
    kode: u.singkatan,
    nama: u.nama,
    labelLengkap: `${u.singkatan} - ${u.nama}`,
  })),
];

// Kata kunci jabatan pejabat resmi PPATK
export const KATA_KUNCI_PEJABAT = [
  "kepala ppatk",
  "deputi",
  "kepala pusat",
  "kepala biro",
  "direktur",
  "sekretaris utama",
  "inspektur",
];

export function isPejabatJabatan(jabatan: string): boolean {
  if (!jabatan) return false;
  const lower = jabatan.toLowerCase();
  return KATA_KUNCI_PEJABAT.some((k) => lower.includes(k));
}

// Validasi Aturan Bisnis Pemberian Peran
export function validateRoles(
  nama: string,
  roles: string[]
): { valid: boolean; message?: string } {
  // Aturan 1: Super Admin hanya dapat disematkan pada user Isnen Hadi Al Ghozali
  const hasSuperAdmin = roles.includes("Super Admin");
  const isTargetSuperAdmin =
    nama.trim().toLowerCase() === "isnen hadi al ghozali";

  if (hasSuperAdmin && !isTargetSuperAdmin) {
    return {
      valid: false,
      message:
        "Peran 'Super Admin' hanya dapat disematkan secara khusus pada user 'Isnen Hadi Al Ghozali'.",
    };
  }

  // Aturan 2: Role Operator dan Approver tidak dapat disematkan dalam 1 user
  const hasOperator =
    roles.includes("Operator Eselon I") || roles.includes("Operator Eselon II");
  const hasApprover =
    roles.includes("Approver Eselon I") || roles.includes("Approver Eselon II");

  if (hasOperator && hasApprover) {
    return {
      valid: false,
      message:
        "Pemisahan Fungsi (Segregation of Duties): Peran 'Operator' dan 'Approver' tidak dapat disematkan pada pengguna yang sama secara bersamaan.",
    };
  }

  return { valid: true };
}

// Master Awal Pengguna Aplikasi
export const INITIAL_USERS: UserAccount[] = [
  {
    id: "USR-00",
    nip: "199008152014031001",
    nama: "Isnen Hadi Al Ghozali",
    jabatan: "Kepala Biro Perencanaan dan Keuangan",
    unitKerja: "BINCANG - Biro Perencanaan dan Keuangan",
    password: "Password#2027!",
    peran: ["BINCANG", "Tim Perencanaan", "Super Admin"],
    status: "Online",
    terakhirLogin: "Hari ini, 09:30 WIB",
  },
  {
    id: "USR-01",
    nip: "197103141998031001",
    nama: "Dr. Ivan Yustiavandana, S.H., LL.M.",
    jabatan: "Kepala PPATK",
    unitKerja: "SETIA - Sekretariat Utama (Eselon I)",
    password: "PpatkPusat#2027",
    peran: ["Approver Eselon I"],
    status: "Online",
    terakhirLogin: "Hari ini, 08:45 WIB",
  },
  {
    id: "USR-02",
    nip: "197508211999031002",
    nama: "Ir. Alberd Teddy Benhard Sianipar, S.I.K., M.H.",
    jabatan: "Sekretaris Utama",
    unitKerja: "SETIA - Sekretariat Utama (Eselon I)",
    password: "Sestama#Aksi27",
    peran: ["Approver Eselon I"],
    status: "Online",
    terakhirLogin: "Hari ini, 09:15 WIB",
  },
  {
    id: "USR-03",
    nip: "197508211999031003",
    nama: "Danang Tri Hartono, S.H., M.H.",
    jabatan: "Deputi Bidang Strategi dan Kerja Sama",
    unitKerja: "TEGAS - Deputi Bidang Strategi dan Kerja Sama (Eselon I)",
    password: "Tegas#Aksi2027",
    peran: ["Approver Eselon I", "BINCANG"],
    status: "Offline",
    terakhirLogin: "Kemarin, 16:40 WIB",
  },
  {
    id: "USR-04",
    nip: "198602231993031001",
    nama: "Akhyar Effendi, S.E., M.M.",
    jabatan: "Kepala Pusat Pendidikan dan Pelatihan APU PPT",
    unitKerja: "PATIH - Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
    password: "Patih#2027Diklat",
    peran: ["Approver Eselon II"],
    status: "Online",
    terakhirLogin: "Hari ini, 08:20 WIB",
  },
  {
    id: "USR-05",
    nip: "197604121999031001",
    nama: "Dr. Fithriadi Muslim, S.H., M.H.",
    jabatan: "Direktur Hukum dan Regulasi",
    unitKerja: "KREASI - Direktorat Hukum dan Regulasi",
    password: "Kreasi#Regulasi27",
    peran: ["Approver Eselon II"],
    status: "Online",
    terakhirLogin: "Hari ini, 09:10 WIB",
  },
  {
    id: "USR-06",
    nip: "197802102002121001",
    nama: "Indra Laksmana, Ak., M.M.",
    jabatan: "Inspektur PPATK",
    unitKerja: "PEKA - Inspektorat",
    password: "Peka#Audit2027",
    peran: ["PEKA"],
    status: "Online",
    terakhirLogin: "Hari ini, 08:50 WIB",
  },
  {
    id: "USR-07",
    nip: "198205122006041003",
    nama: "Budi Santoso, S.Sos., M.Ak.",
    jabatan: "Penyusun Rencana Kerja & Anggaran Satker Pusdiklat",
    unitKerja: "PATIH - Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
    password: "Budi#Operator27",
    peran: ["Operator Eselon II"],
    status: "Online",
    terakhirLogin: "Hari ini, 09:40 WIB",
  },
  {
    id: "USR-08",
    nip: "198904102012121002",
    nama: "Ahmad Fauzi, S.E.",
    jabatan: "Pengadministrasi Anggaran dan Perencanaan",
    unitKerja: "BINCANG - Biro Perencanaan dan Keuangan",
    password: "Fauzi#Bincang27",
    peran: ["Tim Penganggaran", "Tim Perencanaan"],
    status: "Offline",
    terakhirLogin: "Kemarin, 17:10 WIB",
  },
  {
    id: "USR-09",
    nip: "198809152010122002",
    nama: "Sari Wulandari, S.E.",
    jabatan: "Bendahara Pengeluaran Pusdiklat",
    unitKerja: "PATIH - Pusat Pendidikan dan Pelatihan Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme",
    password: "Sari#Bendahara27",
    peran: ["Operator Eselon II"],
    status: "Offline",
    terakhirLogin: "2 hari lalu",
  },
];

// Master Awal Notifikasi Sistem
export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "NOTIF-01",
    judul: "Batas Waktu Penyusunan Renja Eselon II",
    pesan: "Seluruh Unit Kerja Eselon II diharapkan menyelesaikan pengisian rancangan Renja Eselon II TA 2027 sebelum 25 November 2026.",
    kategori: "Penting",
    waktu: "10 menit yang lalu",
    targetPeran: "Semua",
  },
  {
    id: "NOTIF-02",
    judul: "Validasi Standar Biaya Masukan (SBM) PMK 39/2024",
    pesan: "Penyusunan RAB Rinci wajib memedomani pagu plafon akun 521211 dan 524111 sesuai PMK Standar Biaya Masukan.",
    kategori: "Info",
    waktu: "1 jam yang lalu",
    targetPeran: "Operator Eselon II",
  },
  {
    id: "NOTIF-03",
    judul: "Konsensus Penilaian Renja PATIH Selesai",
    pesan: "Tim Perencanaan, Tim Penganggaran, dan Inspektorat telah menyelesaikan reviu konsensus evaluasi Renja Pusdiklat APU PPT dengan skor 88.5 (Sangat Baik).",
    kategori: "Info",
    waktu: "3 jam yang lalu",
    targetUnit: "PATIH",
  },
  {
    id: "NOTIF-04",
    judul: "Tindak Lanjut Reviu KAK / TOR Pengadaan",
    pesan: "Catatan reviu APIP terkait HPS pengadaan perangkat IT pendukung diklat telah diunggah ke lembar telaah.",
    kategori: "Tindak Lanjut",
    waktu: "Kemarin, 14:20 WIB",
    targetPeran: "Approver Eselon II",
  },
];

// Helper LocalStorage untuk Users
const STORAGE_USERS_KEY = "aksi_ppatk_users_data";
const STORAGE_NOTIF_KEY = "aksi_ppatk_notifications_data";

export function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Gagal membaca data pengguna dari localStorage:", e);
  }
  return INITIAL_USERS;
}

export function saveStoredUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event("aksi_users_updated"));
  } catch (e) {
    console.error("Gagal menyimpan data pengguna ke localStorage:", e);
  }
}

// Helper LocalStorage untuk Notifications
export function getStoredNotifications(): SystemNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIF_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Gagal membaca data notifikasi dari localStorage:", e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveStoredNotifications(notifs: SystemNotification[]): void {
  try {
    localStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(notifs));
    window.dispatchEvent(new Event("aksi_notifications_updated"));
  } catch (e) {
    console.error("Gagal menyimpan data notifikasi ke localStorage:", e);
  }
}
