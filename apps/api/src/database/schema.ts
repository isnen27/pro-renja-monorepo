// src/database/schema.ts
// Database Schema for Pro Renja - Referensi Tables
// Using Drizzle ORM with PostgreSQL

import { pgTable, serial, varchar, text, integer, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

// ═══════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════

export const kategoriBelanjaEnum = pgEnum('kategori_belanja', [
  'Belanja Pegawai',
  'Belanja Barang',
  'Belanja Jasa',
  'Belanja Pemeliharaan',
  'Belanja Perjalanan',
  'Belanja Modal',
]);

export const statusAktifEnum = pgEnum('status_aktif', ['Aktif', 'Tidak Aktif', 'Diproses']);

// ═══════════════════════════════════════════════════════════════════════════
// 1. BAGAN AKUN STANDAR (BAS)
// ═══════════════════════════════════════════════════════════════════════════

export const baganAkunStandar = pgTable('bagan_akun_standar', {
  id: serial('id').primaryKey(),
  no: integer('no').notNull().unique(),
  kelompokBelanja: varchar('kelompok_belanja', { length: 10 }).notNull(),
  kodeAkun3Digit: varchar('kode_akun_3_digit', { length: 10 }).notNull(),
  namaAkun3Digit: text('nama_akun_3_digit').notNull(),
  kodeAkun6Digit: varchar('kode_akun_6_digit', { length: 10 }).notNull().unique(),
  uraianAkun: text('uraian_akun').notNull(),
  penggunaanSingkat: text('penggunaan_singkat').notNull(),
  kelompokBarangJasa: text('kelompok_barang_jasa'),
  kategori: kategoriBelanjaEnum('kategori').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Type for the table
export type BaganAkunStandar = typeof baganAkunStandar.$inferSelect;
export type NewBaganAkunStandar = typeof baganAkunStandar.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 2. DATA PEJABAT (nama table.xlsx: pejabat)
// ═══════════════════════════════════════════════════════════════════════════

export const dataPejabat = pgTable('pejabat', {
  id: serial('id').primaryKey(),
  kodePejabat: varchar('kode_pejabat', { length: 20 }).notNull().unique(),
  nama: text('nama').notNull(),
  nip: varchar('nip', { length: 30 }).notNull(),
  jabatan: text('jabatan').notNull(),
  pangkat: text('pangkat'),
  unitKerja: text('unit_kerja').notNull(),
  email: varchar('email', { length: 100 }),
  noTelepon: varchar('no_telepon', { length: 20 }),
  roleTtd: text('role_ttd').array(),
  status: statusAktifEnum('status').default('Aktif'),
  fotoUrl: text('foto_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type DataPejabat = typeof dataPejabat.$inferSelect;
export type NewDataPejabat = typeof dataPejabat.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 3. STANDAR BIAYA KELUARAN (SBK)
// ═══════════════════════════════════════════════════════════════════════════

export const standarBiayaKeluaran = pgTable('standar_biaya_keluaran', {
  id: serial('id').primaryKey(),
  kode: varchar('kode', { length: 20 }).notNull().unique(),
  nama: text('nama').notNull(),
  satuan: varchar('satuan', { length: 50 }).notNull(),
  paguMaks: integer('pagu_maks').notNull(),
  dasarHukum: text('dasar_hukum'),
  keterangan: text('keterangan'),
  kategori: text('kategori'),
  status: statusAktifEnum('status').default('Aktif'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type StandarBiayaKeluaran = typeof standarBiayaKeluaran.$inferSelect;
export type NewStandarBiayaKeluaran = typeof standarBiayaKeluaran.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 4. PROGRAM KEGIATAN & ANGGARAN (nama table.xlsx: dataAng)
// ═══════════════════════════════════════════════════════════════════════════

export const programKegiatan = pgTable('data_ang', {
  id: serial('id').primaryKey(),
  kodeProgram: varchar('kode_program', { length: 20 }),
  namaProgram: text('nama_program').notNull(),
  kodeKegiatan: varchar('kode_kegiatan', { length: 20 }),
  namaKegiatan: text('nama_kegiatan').notNull(),
  kodeOutput: varchar('kode_output', { length: 20 }),
  namaOutput: text('nama_output'),
  kodeKomponen: varchar('kode_komponen', { length: 20 }),
  namaKomponen: text('nama_komponen'),
  kodeSubKomponen: varchar('kode_sub_komponen', { length: 20 }),
  namaSubKomponen: text('nama_sub_komponen'),
  kodeAkun: varchar('kode_akun', { length: 10 }),
  volume: varchar('volume', { length: 50 }),
  satuan: varchar('satuan', { length: 20 }),
  hargaSatuan: integer('harga_satuan'),
  pagu: integer('pagu'),
  tahunAnggaran: integer('tahun_anggaran').notNull(),
  unitEselon1: text('unit_eselon_1'),
  unitEselon2: text('unit_eselon_2'),
  status: statusAktifEnum('status').default('Diproses'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type ProgramKegiatan = typeof programKegiatan.$inferSelect;
export type NewProgramKegiatan = typeof programKegiatan.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 5. URUSAN PEMERINTAHAN
// ═══════════════════════════════════════════════════════════════════════════

export const urusanPemerintah = pgTable('urusan_pemerintah', {
  id: serial('id').primaryKey(),
  kodeBidang: varchar('kode_bidang', { length: 10 }).notNull(),
  namaBidang: text('nama_bidang').notNull(),
  kodeUrusan: varchar('kode_urusan', { length: 10 }),
  namaUrusan: text('nama_urusan'),
  kodeProgram: varchar('kode_program', { length: 20 }),
  namaProgram: text('nama_program'),
  tahunAnggaran: integer('tahun_anggaran').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type UrusanPemerintah = typeof urusanPemerintah.$inferSelect;
export type NewUrusanPemerintah = typeof urusanPemerintah.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 6. REFERENSI ADMINISTRASI SATKER (nama table.xlsx: refAdmin)
// ═══════════════════════════════════════════════════════════════════════════

export const dataOpd = pgTable('ref_admin', {
  id: serial('id').primaryKey(),
  kodeOpd: varchar('kode_opd', { length: 20 }).notNull().unique(),
  namaOpd: text('nama_opd').notNull(),
  singkatan: varchar('singkatan', { length: 20 }),
  kodeWilayah: varchar('kode_wilayah', { length: 10 }),
  namaWilayah: text('nama_wilayah'),
  alamat: text('alamat'),
  telepon: varchar('telepon', { length: 20 }),
  email: varchar('email', { length: 100 }),
  kepalaOpd: text('kepala_opd'),
  nipKepala: varchar('nip_kepala', { length: 30 }),
  eselon1: text('eselon_1'),
  eselon2: text('eselon_2'),
  jenisOpd: varchar('jenis_opd', { length: 50 }),
  status: statusAktifEnum('status').default('Aktif'),
  tahunAnggaran: integer('tahun_anggaran').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type DataOpd = typeof dataOpd.$inferSelect;
export type NewDataOpd = typeof dataOpd.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 7. REFERENSI URAIAN NOMENKLATUR (nama table.xlsx: refUraian)
// ═══════════════════════════════════════════════════════════════════════════

export const nomenklaturAnggaran = pgTable('ref_uraian', {
  id: serial('id').primaryKey(),
  kode: varchar('kode', { length: 50 }).notNull().unique(),
  jenis: varchar('jenis', { length: 50 }).notNull(), // 'KRO', 'RO', 'Komponen', 'SubKomponen'
  uraian: text('uraian').notNull(),
  kategori: text('kategori'),
  deskripsi: text('deskripsi'),
  tahunAktif: integer('tahun_aktif').notNull(),
  status: statusAktifEnum('status').default('Aktif'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type NomenklaturAnggaran = typeof nomenklaturAnggaran.$inferSelect;
export type NewNomenklaturAnggaran = typeof nomenklaturAnggaran.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 8. USER / PENGGUNA (for authentication)
// ═══════════════════════════════════════════════════════════════════════════

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  namaLengkap: text('nama_lengkap').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('operator'),
  unitKerja: text('unit_kerja'),
  nip: varchar('nip', { length: 30 }),
  status: statusAktifEnum('status').default('Aktif'),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 9. RENJA ESELON I - HISTORI (nama table.xlsx: refSts)
// ═══════════════════════════════════════════════════════════════════════════

export const statusHistoriEnum = pgEnum('status_histori_enum', [
  'Pagu Indikatif',
  'Pagu Anggaran',
  'Alokasi Anggaran',
]);

export const renjaEselon1Histori = pgTable('ref_sts', {
  id: serial('id').primaryKey(),
  kdsatker: varchar('kdsatker', { length: 50 }).notNull(),
  kodeStsHistory: varchar('kode_sts_history', { length: 10 }).notNull(),
  statusHistori: statusHistoriEnum('status_histori').notNull(),
  tglPengajuan: timestamp('tgl_pengajuan').defaultNow().notNull(),
  dibuatOleh: varchar('dibuat_oleh', { length: 50 }),
  isApproved: boolean('is_approved').default(false).notNull(),
  tglApproved: timestamp('tgl_approved'),
  approvedOleh: varchar('approved_oleh', { length: 50 }),
  owner: varchar('owner', { length: 50 }).default('Operator').notNull(),
  sumber: varchar('sumber', { length: 10 }).default('D00'),
  revKe: integer('rev_ke').default(0).notNull(),
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon1Histori = typeof renjaEselon1Histori.$inferSelect;
export type NewRenjaEselon1Histori = typeof renjaEselon1Histori.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 10. RENJA ESELON I - ISIAN BAB I
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon1Bab1 = pgTable('renja_eselon1_bab1', {
  id: serial('id').primaryKey(),
  historiId: integer('histori_id').references(() => renjaEselon1Histori.id, { onDelete: 'cascade' }).notNull().unique(),
  gambaranSasaran: text('gambaran_sasaran'),
  gambaranProgramKerja: text('gambaran_program_kerja'),
  capaianNarasiThMin1: text('capaian_narasi_th_min1'),
  capaianNarasiThMin2: text('capaian_narasi_th_min2'),
  arahNarasiRenstra: text('arah_narasi_renstra'),
  analisisMomentum: text('analisis_momentum'),
  analisisTantangan: text('analisis_tantangan'),
  disimpanBagianA: boolean('disimpan_bagian_a').default(false),
  disimpanBagianB: boolean('disimpan_bagian_b').default(false),
  disimpanBagianC: boolean('disimpan_bagian_c').default(false),
  disimpanBagianD: boolean('disimpan_bagian_d').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon1Bab1 = typeof renjaEselon1Bab1.$inferSelect;
export type NewRenjaEselon1Bab1 = typeof renjaEselon1Bab1.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 11. RENJA ESELON I - BAB I CAPAIAN KINERJA (nama table.xlsx: capaianRO)
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon1Bab1Capaian = pgTable('capaian_ro', {
  id: serial('id').primaryKey(),
  bab1Id: integer('bab1_id').references(() => renjaEselon1Bab1.id, { onDelete: 'cascade' }).notNull(),
  urutan: integer('urutan').default(1).notNull(),
  sasaranProgram: text('sasaran_program'),
  ikp: text('ikp'),
  tahun: integer('tahun'),
  target: text('target'),
  realisasi: text('realisasi'),
  capaianPct: text('capaian_pct'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon1Bab1Capaian = typeof renjaEselon1Bab1Capaian.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 12. RENJA ESELON I - BAB I TARGET KINERJA
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon1Bab1TargetKinerja = pgTable('renja_eselon1_bab1_target_kinerja', {
  id: serial('id').primaryKey(),
  bab1Id: integer('bab1_id').references(() => renjaEselon1Bab1.id, { onDelete: 'cascade' }).notNull(),
  urutan: integer('urutan').default(1).notNull(),
  kode: varchar('kode', { length: 50 }),
  sasaranIndikator: text('sasaran_indikator'),
  targetT1: text('target_t1'),
  satuan: varchar('satuan', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon1Bab1TargetKinerja = typeof renjaEselon1Bab1TargetKinerja.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 13. RENJA ESELON I - ISIAN BAB II
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon1Bab2 = pgTable('renja_eselon1_bab2', {
  id: serial('id').primaryKey(),
  historiId: integer('histori_id').references(() => renjaEselon1Histori.id, { onDelete: 'cascade' }).notNull().unique(),
  pengantarProgramKerja: text('pengantar_program_kerja'),
  adaProkerLintasUnit: boolean('ada_proker_lintas_unit').default(false).notNull(),
  jumlahProkerLintasUnit: integer('jumlah_proker_lintas_unit').default(0).notNull(),
  jumlahProkerUnitKerja: integer('jumlah_proker_unit_kerja').default(0).notNull(),
  disimpanBagian1: boolean('disimpan_bagian_1').default(false),
  disimpanBagian2: boolean('disimpan_bagian_2').default(false),
  disimpanBagian3: boolean('disimpan_bagian_3').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon1Bab2 = typeof renjaEselon1Bab2.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 14. RENJA ESELON I - BAB II PROGRAM KERJA LINTAS UNIT KERJA
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon1Bab2ProkerLintas = pgTable('renja_eselon1_bab2_proker_lintas', {
  id: serial('id').primaryKey(),
  bab2Id: integer('bab2_id').references(() => renjaEselon1Bab2.id, { onDelete: 'cascade' }).notNull(),
  noPaket: integer('no_paket').notNull(),
  nomenklatur: text('nomenklatur').notNull(),
  uraian: text('uraian'),
  tujuan: text('tujuan'),
  outcome: text('outcome'),
  jenisProgramKerja: text('jenis_program_kerja'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon1Bab2ProkerLintas = typeof renjaEselon1Bab2ProkerLintas.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 15. RENJA ESELON I - BAB II PROGRAM KERJA UNIT KERJA
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon1Bab2ProkerUnit = pgTable('renja_eselon1_bab2_proker_unit', {
  id: serial('id').primaryKey(),
  bab2Id: integer('bab2_id').references(() => renjaEselon1Bab2.id, { onDelete: 'cascade' }).notNull(),
  noPaket: integer('no_paket').notNull(),
  nomenklatur: text('nomenklatur').notNull(),
  uraian: text('uraian'),
  tujuan: text('tujuan'),
  outcome: text('outcome'),
  jenisProgramKerja: text('jenis_program_kerja'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon1Bab2ProkerUnit = typeof renjaEselon1Bab2ProkerUnit.$inferSelect;
