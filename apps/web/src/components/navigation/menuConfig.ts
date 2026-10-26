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
  LineChart,
  Users,
  Shield,
  Activity,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface SubMenuItem {
  label: string;
  href?: string;
  badge?: string;
  badgeVariant?: "primary" | "gray" | "red";
  submenu?: SubMenuItem[];
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
          {
            label: "Isian Bab I",
            href: "/eselon1/bab-1",
            submenu: [
              { label: "Gambaran Umum", href: "/eselon1/bab-1?tab=gambaran-umum" },
              { label: "Capaian Kinerja", href: "/eselon1/bab-1?tab=capaian-kinerja" },
              { label: "Arah Kebijakan, Strategi, & Target Kinerja", href: "/eselon1/bab-1?tab=arah-kebijakan" },
              { label: "Analisis Situasi", href: "/eselon1/bab-1?tab=analisis-situasi" },
            ],
          },
          { label: "Isian Bab II", href: "/eselon1/bab-2" },
          { label: "Monitoring Submit & Approve Data", href: "/eselon1/monitoring" },
        ],
      },
      {
        label: "Renja Eselon II",
        icon: Building,
        submenu: [
          { label: "Pilih Histori", href: "/eselon2/pilih-histori" },
          {
            label: "Isian Bab I",
            href: "/eselon2/bab-1",
            submenu: [
              { label: "Gambaran Umum", href: "/eselon2/bab-1?tab=gambaran-umum" },
              { label: "Capaian Kinerja", href: "/eselon2/bab-1?tab=capaian-kinerja" },
              { label: "Arah Kebijakan, Strategi, & Target Kinerja", href: "/eselon2/bab-1?tab=arah-kebijakan" },
              { label: "Analisis Situasi", href: "/eselon2/bab-1?tab=analisis-situasi" },
            ],
          },
          { label: "Isian Bab II", href: "/eselon2/bab-2" },
          { label: "Isian Bab III", href: "/eselon2/bab-3" },
          { label: "Isian Lampiran", href: "/eselon2/lampiran" },
          { label: "Monitoring Submit & Approve Data", href: "/eselon2/monitoring" },
        ],
      },
    ],
  },
  {
    groupLabel: "Penganggaran & Biaya",
    items: [
      {
        label: "Kerangka Acuan Kerja (TOR)",
        icon: FileSpreadsheet,
        submenu: [
          { label: "Pilih Histori", href: "/kak/pilih-histori" },
          { label: "Isian KAK/TOR", href: "/kak/isian" },
          { label: "Isian KAK/TOR Pengadaan", href: "/kak/pengadaan" },
          { label: "Monitoring Submit & Approve Data", href: "/kak/monitoring" },
        ],
      },
      {
        label: "Rencana Anggaran Biaya (RAB)",
        icon: Calculator,
        submenu: [
          { label: "Pilih Histori", href: "/rab/pilih-histori" },
          { label: "Isian RAB", href: "/rab/isian" },
          { label: "Revisi Anggaran", href: "/rab/revisi" },
          { label: "Automatic Adjustment", href: "/rab/automatic-adjustment" },
          {
            label: "Laporan RAB",
            submenu: [
              { label: "Matriks Usulan Revisi", href: "/rab/matriks-usulan-revisi" },
              { label: "Monitoring Blokir", href: "/rab/monitoring-blokir" },
              { label: "Monitoring RPD", href: "/rab/monitoring-rpd" },
            ],
          },
          { label: "Monitoring Submit & Approve Data", href: "/rab/monitoring" },
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
      {
        label: "Series Anggaran",
        icon: LineChart,
        href: "/referensi/series-anggaran",
        badge: "2020-2025",
        badgeVariant: "primary",
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
