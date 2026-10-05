// src/components/navigation/menuConfig.ts
// Konfigurasi menu untuk AKSI - Sistem Informasi Perencanaan dan Penganggaran PPATK

import {
  LayoutDashboard,
  Landmark,
  Building,
  FileSpreadsheet,
  Calculator,
  Target,
  Scale,
  FolderTree,
  BadgeCheck,
  Building2,
  Users,
  Shield,
  Activity,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface SubMenuItem {
  label: string;
  href: string;
  badge?: string;
  badgeVariant?: "primary" | "gray" | "red";
}

export interface MenuItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: "primary" | "gray" | "red";
  submenu?: SubMenuItem[];
}

export interface MenuGroup {
  groupLabel: string;
  items: MenuItem[];
}

export const menuConfig: MenuGroup[] = [
  {
    groupLabel: "Beranda",
    items: [
      {
        label: "Dashboard Eksekutif",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    groupLabel: "Rencana Kerja",
    items: [
      {
        label: "Renja Eselon I",
        icon: Landmark,
        submenu: [
          { label: "Pilih Histori", href: "/eselon1/pilih-histori" },
          { label: "Isian Bab I", href: "/eselon1/bab-1" },
          { label: "Isian Bab II", href: "/eselon1/bab-2" },
          { label: "Monitoring Submit & Approve Data", href: "/eselon1/monitoring" },
        ],
      },
      {
        label: "Renja Eselon II",
        icon: Building,
        submenu: [
          { label: "Profil & Capaian Kinerja Satker", href: "/patih/profil-satker" },
          { label: "Rencana Output & 40 Pelatihan", href: "/patih/rencana-output" },
          { label: "Belanja Modal Sarpras Internal", href: "/patih/sarpras" },
          { label: "Rekapitulasi Pagu & Target PNBP", href: "/patih/rekapitulasi-pnbp" },
          { label: "Kamus Rincian Output (RO)", href: "/patih/kamus-ro" },
        ],
      },
      {
        label: "Kerangka Acuan Kerja (TOR)",
        icon: FileSpreadsheet,
        badge: "APH",
        badgeVariant: "red",
        submenu: [
          { label: "Penyusunan KAK/TOR Rinci", href: "/kak/penyusunan" },
          { label: "Distribusi Jadwal Triwulan (TW I-IV)", href: "/kak/jadwal-triwulan" },
        ],
      },
    ],
  },
  {
    groupLabel: "Penganggaran & Biaya",
    items: [
      {
        label: "Rencana Anggaran Biaya (RAB)",
        icon: Calculator,
        badge: "Rp 2,2 M",
        badgeVariant: "primary",
        submenu: [
          { label: "Input RAB Rinci (Kalkulator 4 Faktor)", href: "/rab/input-rinci" },
          { label: "Kertas Kerja RKA-K/L (Rekap Akun)", href: "/rab/kertas-kerja" },
          { label: "Pengelolaan Tahapan Pagu", href: "/rab/tahapan-pagu" },
        ],
      },
    ],
  },
  {
    groupLabel: "REFERENSI",
    items: [
      {
        label: "Standar Biaya",
        icon: Scale,
        submenu: [
          { label: "Standar Biaya Masukan (SBM)", href: "/standar-biaya/sbm" },
          { label: "Standar Biaya Keluaran (SBK)", href: "/standar-biaya/sbk" },
        ],
      },
      {
        label: "Referensi Informasi Kinerja",
        icon: Target,
        badge: "Baru",
        badgeVariant: "primary",
        submenu: [
          { label: "Visi & Misi PPATK", href: "/referensi/visi-misi" },
          { label: "Visualisasi Sasaran Kinerja", href: "/referensi/visualisasi-sasaran-kinerja" },
          { label: "Informasi Kinerja", href: "/referensi/informasi-kinerja" },
          { label: "Unit Kerja PPATK", href: "/referensi/unit-kerja" },
          { label: "Satuan Kerja", href: "/referensi/satuan-kerja" },
        ],
      },
      {
        label: "Bagan Akun Standar (BAS)",
        icon: FolderTree,
        href: "/referensi/bas",
      },
      {
        label: "Data Pejabat",
        icon: BadgeCheck,
        href: "/referensi/pejabat",
      },
    ],
  },
  {
    groupLabel: "Administrasi & Pengguna",
    items: [
      {
        label: "Manajemen Pengguna",
        icon: Users,
        submenu: [
          { label: "Daftar Pengguna & Role", href: "/admin/pengguna" },
          { label: "Tambah Pengguna Baru", href: "/admin/pengguna/tambah" },
        ],
      },
      {
        label: "Hak Akses & Peran",
        icon: Shield,
        href: "/admin/peran",
      },
      {
        label: "Log Aktivitas",
        icon: Activity,
        href: "/admin/log",
      },
      {
        label: "Pengaturan Sistem",
        icon: Settings,
        href: "/admin/pengaturan",
      },
    ],
  },
];
