// src/database/schema.ts
// Database Schema for Pro Renja - Referensi Tables
// Using Drizzle ORM with PostgreSQL

import { pgTable, serial, varchar, text, integer, bigint, timestamp, boolean, pgEnum, numeric, jsonb } from 'drizzle-orm/pg-core';

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

// ═══════════════════════════════════════════════════════════════════════════
// 16. RENJA ESELON I - MONITORING SUBMIT & APPROVE
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon1Monitoring = pgTable('renja_eselon1_monitoring', {
  id: serial('id').primaryKey(),
  historiId: integer('histori_id').references(() => renjaEselon1Histori.id, { onDelete: 'cascade' }),
  unitKerja: varchar('unit_kerja', { length: 100 }).notNull(),
  owner: varchar('owner', { length: 50 }).default('Operator').notNull(),
  kodifikasi: varchar('kodifikasi', { length: 20 }).default('D00').notNull(),
  tahapStatus: varchar('tahap_status', { length: 50 }).default('Pagu Indikatif').notNull(),
  revKe: integer('rev_ke').default(0).notNull(),
  statusHistoriFull: varchar('status_histori_full', { length: 150 }),
  sumber: varchar('sumber', { length: 20 }).default('D00'),
  tglRevisi: varchar('tgl_revisi', { length: 50 }),
  isApproved: boolean('is_approved').default(false).notNull(),
  tglApproved: varchar('tgl_approved', { length: 50 }),
  approvedBy: varchar('approved_by', { length: 100 }),
  isDocUploaded: boolean('is_doc_uploaded').default(false).notNull(),
  signedDocName: text('signed_doc_name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon1Monitoring = typeof renjaEselon1Monitoring.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 17. RENJA ESELON II - HISTORI (PILIH HISTORI ESELON II)
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon2Histori = pgTable('renja_eselon2_histori', {
  id: serial('id').primaryKey(),
  unitKode: varchar('unit_kode', { length: 50 }),
  unitNama: varchar('unit_nama', { length: 255 }).notNull(),
  unitSingkatan: varchar('unit_singkatan', { length: 50 }).notNull(),
  kodeStsHistory: varchar('kode_sts_history', { length: 20 }).default('D00').notNull(),
  statusHistori: varchar('status_histori', { length: 50 }).default('Pagu Indikatif').notNull(),
  tahunAnggaran: integer('tahun_anggaran').default(2026).notNull(),
  tglPengajuan: timestamp('tgl_pengajuan').defaultNow(),
  dibuatOleh: varchar('dibuat_oleh', { length: 100 }).default('Operator'),
  isApproved: boolean('is_approved').default(false).notNull(),
  tglApproved: timestamp('tgl_approved'),
  approvedOleh: varchar('approved_oleh', { length: 100 }),
  owner: varchar('owner', { length: 50 }).default('Operator').notNull(),
  sumber: varchar('sumber', { length: 20 }).default('D00'),
  revKe: integer('rev_ke').default(0).notNull(),
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon2Histori = typeof renjaEselon2Histori.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 18. RENJA ESELON II - ISIAN BAB I
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon2Bab1 = pgTable('renja_eselon2_bab1', {
  id: serial('id').primaryKey(),
  historiId: integer('histori_id').references(() => renjaEselon2Histori.id, { onDelete: 'cascade' }),
  unitSingkatan: varchar('unit_singkatan', { length: 50 }),
  unitNama: varchar('unit_nama', { length: 255 }),
  kondisiUmumLatarBelakang: text('kondisi_umum_latar_belakang'),
  kondisiUmumFaktorPendorong: text('kondisi_umum_faktor_pendorong'),
  kebijakanTerkait: text('kebijakan_terkait'),
  disimpanBagianA: boolean('disimpan_bagian_a').default(false),
  disimpanBagianB: boolean('disimpan_bagian_b').default(false),
  disimpanBagianC: boolean('disimpan_bagian_c').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon2Bab1 = typeof renjaEselon2Bab1.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 19. RENJA ESELON II - BAB I EVALUASI KINERJA (CAPAIAN)
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon2Bab1EvaluasiKinerja = pgTable('renja_eselon2_bab1_evaluasi_kinerja', {
  id: serial('id').primaryKey(),
  bab1Id: integer('bab1_id').references(() => renjaEselon2Bab1.id, { onDelete: 'cascade' }),
  urutan: integer('urutan').default(1).notNull(),
  sasaranKegiatan: text('sasaran_kegiatan'),
  ikk: text('ikk'),
  tahun: integer('tahun').default(2025),
  target: varchar('target', { length: 100 }),
  capaianOutputPct: numeric('capaian_output_pct', { precision: 6, scale: 2 }),
  capaianAnggaranPct: numeric('capaian_anggaran_pct', { precision: 6, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon2Bab1EvaluasiKinerja = typeof renjaEselon2Bab1EvaluasiKinerja.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 20. RENJA ESELON II - BAB I TARGET KINERJA
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon2Bab1TargetKinerja = pgTable('renja_eselon2_bab1_target_kinerja', {
  id: serial('id').primaryKey(),
  bab1Id: integer('bab1_id').references(() => renjaEselon2Bab1.id, { onDelete: 'cascade' }),
  urutan: integer('urutan').default(1).notNull(),
  kode: varchar('kode', { length: 50 }),
  sasaranIndikator: text('sasaran_indikator'),
  levelIndikator: varchar('level_indikator', { length: 50 }),
  targetT1: varchar('target_t1', { length: 100 }),
  satuan: varchar('satuan', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon2Bab1TargetKinerja = typeof renjaEselon2Bab1TargetKinerja.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 21. RENJA ESELON II - ISIAN BAB II
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon2Bab2 = pgTable('renja_eselon2_bab2', {
  id: serial('id').primaryKey(),
  historiId: integer('histori_id').references(() => renjaEselon2Histori.id, { onDelete: 'cascade' }),
  unitSingkatan: varchar('unit_singkatan', { length: 50 }),
  unitNama: varchar('unit_nama', { length: 255 }),
  pengantar: text('pengantar'),
  totalPaket: integer('total_paket').default(1).notNull(),
  disimpanSeluruhnya: boolean('disimpan_seluruhnya').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon2Bab2 = typeof renjaEselon2Bab2.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 22. RENJA ESELON II - BAB II RINCIAN PAKET RENCANA KERJA (RO)
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon2Bab2Paket = pgTable('renja_eselon2_bab2_paket', {
  id: serial('id').primaryKey(),
  bab2Id: integer('bab2_id').references(() => renjaEselon2Bab2.id, { onDelete: 'cascade' }),
  noPaket: integer('no_paket').notNull(),
  kodeRo: varchar('kode_ro', { length: 50 }),
  nomenklaturRo: text('nomenklatur_ro').notNull(),
  uraian: text('uraian'),
  tujuan: text('tujuan'),
  tahapan: text('tahapan'),
  output: text('output'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon2Bab2Paket = typeof renjaEselon2Bab2Paket.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 23. RENJA ESELON II - ISIAN BAB III
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon2Bab3 = pgTable('renja_eselon2_bab3', {
  id: serial('id').primaryKey(),
  historiId: integer('histori_id').references(() => renjaEselon2Histori.id, { onDelete: 'cascade' }),
  unitSingkatan: varchar('unit_singkatan', { length: 50 }),
  unitNama: varchar('unit_nama', { length: 255 }),
  kalimatPengantar: text('kalimat_pengantar').default('Berdasarkan Uraian Rencana Kerja pada BAB II dapat disampaikan Rekapitulasi Target Output dan Pendanaan sebagai berikut:').notNull(),
  disimpanSeluruhnya: boolean('disimpan_seluruhnya').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon2Bab3 = typeof renjaEselon2Bab3.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 24. RENJA ESELON II - BAB III REKAPITULASI OUTPUT & PENDANAAN
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon2Bab3Rekap = pgTable('renja_eselon2_bab3_rekap', {
  id: serial('id').primaryKey(),
  bab3Id: integer('bab3_id').references(() => renjaEselon2Bab3.id, { onDelete: 'cascade' }),
  urutan: integer('urutan').default(1).notNull(),
  kode: varchar('kode', { length: 50 }).notNull(),
  level: varchar('level', { length: 50 }).notNull(), // 'Kegiatan' | 'KRO' | 'RO' | 'Komponen'
  uraian: text('uraian').notNull(),
  pagu: varchar('pagu', { length: 100 }),
  target: varchar('target', { length: 100 }),
  isAutoTarget: boolean('is_auto_target').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon2Bab3Rekap = typeof renjaEselon2Bab3Rekap.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 25. RENJA ESELON II - BAB III TARGET PNBP
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon2Bab3Pnbp = pgTable('renja_eselon2_bab3_pnbp', {
  id: serial('id').primaryKey(),
  bab3Id: integer('bab3_id').references(() => renjaEselon2Bab3.id, { onDelete: 'cascade' }),
  urutan: integer('urutan').default(1).notNull(),
  kode: varchar('kode', { length: 50 }).notNull(),
  level: varchar('level', { length: 50 }).notNull(), // 'Kegiatan' | 'KRO' | 'Akun'
  nomenklatur: text('nomenklatur').notNull(),
  targetPnbp: varchar('target_pnbp', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon2Bab3Pnbp = typeof renjaEselon2Bab3Pnbp.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 26. RENJA ESELON II - ISIAN LAMPIRAN
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon2Lampiran = pgTable('renja_eselon2_lampiran', {
  id: serial('id').primaryKey(),
  historiId: integer('histori_id').references(() => renjaEselon2Histori.id, { onDelete: 'cascade' }),
  unitSingkatan: varchar('unit_singkatan', { length: 50 }),
  unitNama: varchar('unit_nama', { length: 255 }),
  disimpanSeluruhnya: boolean('disimpan_seluruhnya').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon2Lampiran = typeof renjaEselon2Lampiran.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 27. RENJA ESELON II - LAMPIRAN KAMUS RO & KOMPONEN
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon2LampiranKamusRo = pgTable('renja_eselon2_lampiran_kamus_ro', {
  id: serial('id').primaryKey(),
  lampiranId: integer('lampiran_id').references(() => renjaEselon2Lampiran.id, { onDelete: 'cascade' }),
  urutan: integer('urutan').default(1).notNull(),
  kode: varchar('kode', { length: 50 }).notNull(),
  level: varchar('level', { length: 50 }).notNull(), // 'RO' | 'Komponen'
  uraian: text('uraian').notNull(),
  jumlahTarget: varchar('jumlah_target', { length: 100 }),
  satuanTarget: varchar('satuan_target', { length: 100 }),
  definisi: text('definisi'),
  rincianTarget: text('rincian_target'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon2LampiranKamusRo = typeof renjaEselon2LampiranKamusRo.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 28. RENJA ESELON II - MONITORING SUBMIT & APPROVE
// ═══════════════════════════════════════════════════════════════════════════

export const renjaEselon2Monitoring = pgTable('renja_eselon2_monitoring', {
  id: serial('id').primaryKey(),
  historiId: integer('histori_id').references(() => renjaEselon2Histori.id, { onDelete: 'cascade' }),
  unitKerja: varchar('unit_kerja', { length: 150 }).notNull(),
  owner: varchar('owner', { length: 50 }).default('Operator').notNull(),
  kodifikasi: varchar('kodifikasi', { length: 20 }).default('D00').notNull(),
  tahapStatus: varchar('tahap_status', { length: 50 }).default('Pagu Indikatif').notNull(),
  revKe: integer('rev_ke').default(0).notNull(),
  statusHistoriFull: varchar('status_histori_full', { length: 150 }),
  sumber: varchar('sumber', { length: 20 }).default('D00'),
  tglRevisi: varchar('tgl_revisi', { length: 50 }),
  isApproved: boolean('is_approved').default(false).notNull(),
  tglApproved: varchar('tgl_approved', { length: 50 }),
  approvedBy: varchar('approved_by', { length: 100 }),
  isDocUploaded: boolean('is_doc_uploaded').default(false).notNull(),
  signedDocName: text('signed_doc_name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RenjaEselon2Monitoring = typeof renjaEselon2Monitoring.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 29. KERANGKA ACUAN KERJA (TOR) - HISTORI
// ═══════════════════════════════════════════════════════════════════════════

export const kakHistori = pgTable('kak_histori', {
  id: serial('id').primaryKey(),
  unitKode: varchar('unit_kode', { length: 50 }),
  unitNama: varchar('unit_nama', { length: 255 }).notNull(),
  unitSingkatan: varchar('unit_singkatan', { length: 50 }),
  kodeStsHistory: varchar('kode_sts_history', { length: 20 }).default('B00').notNull(),
  statusHistori: varchar('status_histori', { length: 50 }).default('DIPA Awal').notNull(),
  tahunAnggaran: integer('tahun_anggaran').default(2027).notNull(),
  tglPengajuan: timestamp('tgl_pengajuan').defaultNow(),
  dibuatOleh: varchar('dibuat_oleh', { length: 100 }).default('Operator'),
  isApproved: boolean('is_approved').default(false).notNull(),
  tglApproved: timestamp('tgl_approved'),
  approvedOleh: varchar('approved_oleh', { length: 100 }),
  owner: varchar('owner', { length: 50 }).default('Operator').notNull(),
  sumber: varchar('sumber', { length: 20 }).default('B00'),
  revKe: integer('rev_ke').default(0).notNull(),
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type KakHistori = typeof kakHistori.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 30. KERANGKA ACUAN KERJA (TOR) - ISIAN DOKUMEN
// ═══════════════════════════════════════════════════════════════════════════

export const kakIsian = pgTable('kak_isian', {
  id: serial('id').primaryKey(),
  historiId: integer('histori_id').references(() => kakHistori.id, { onDelete: 'cascade' }),
  kementerianLembaga: text('kementerian_lembaga'),
  unitEselon1: text('unit_eselon1'),
  program: text('program'),
  sasaranProgram: text('sasaran_program'),
  ikp: text('ikp'),
  kegiatan: text('kegiatan'),
  sasaranKegiatan: text('sasaran_kegiatan'),
  ikk: text('ikk'),
  kro: text('kro'),
  ro: text('ro'),
  satuanRo: text('satuan_ro'),
  dasarHukum: text('dasar_hukum'),
  gambaranUmum: text('gambaran_umum'),
  penerimaManfaat: text('penerima_manfaat'),
  metodePelaksanaan: text('metode_pelaksanaan'),
  totalBiaya: varchar('total_biaya', { length: 100 }),
  terbilangBiaya: text('terbilang_biaya'),
  tempatTanggalTtd: varchar('tempat_tanggal_ttd', { length: 100 }),
  namaPenanggungjawab: varchar('nama_penanggungjawab', { length: 150 }),
  jabatanPenanggungjawab: varchar('jabatan_penanggungjawab', { length: 150 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type KakIsian = typeof kakIsian.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 31. KERANGKA ACUAN KERJA (TOR) - SUBKOMPONEN & TAHAPAN
// ═══════════════════════════════════════════════════════════════════════════

export const kakIsianSubkomponen = pgTable('kak_isian_subkomponen', {
  id: serial('id').primaryKey(),
  kakId: integer('kak_id').references(() => kakIsian.id, { onDelete: 'cascade' }),
  urutan: integer('urutan').default(1).notNull(),
  namaSubkomponen: text('nama_subkomponen').notNull(),
  uraianRangkaian: text('uraian_rangkaian'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type KakIsianSubkomponen = typeof kakIsianSubkomponen.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 32. KERANGKA ACUAN KERJA (TOR) - JADWAL BULANAN
// ═══════════════════════════════════════════════════════════════════════════

export const kakJadwalBulanan = pgTable('kak_jadwal_bulanan', {
  id: serial('id').primaryKey(),
  kakId: integer('kak_id').references(() => kakIsian.id, { onDelete: 'cascade' }),
  urutan: integer('urutan').default(1).notNull(),
  subkomponenNama: text('subkomponen_nama').notNull(),
  volume: varchar('volume', { length: 50 }),
  satuan: varchar('satuan', { length: 50 }),
  jadwalJson: jsonb('jadwal_json'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type KakJadwalBulanan = typeof kakJadwalBulanan.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 33. KERANGKA ACUAN KERJA (TOR) - PENGADAAN (BARANG, JASA, KONSINYERING)
// ═══════════════════════════════════════════════════════════════════════════

export const kakPengadaan = pgTable('kak_pengadaan', {
  id: serial('id').primaryKey(),
  historiId: integer('histori_id').references(() => kakHistori.id, { onDelete: 'cascade' }),
  jenisPengadaan: varchar('jenis_pengadaan', { length: 50 }).notNull(), // 'Pengadaan Barang' | 'Pengadaan Jasa' | 'Konsinyering'
  namaPaket: text('nama_paket').notNull(),
  kodeRup: varchar('kode_rup', { length: 100 }),
  lokasiPengadaan: text('lokasi_pengadaan'),
  jangkaWaktu: varchar('jangka_waktu', { length: 100 }),
  latarBelakang: text('latar_belakang'),
  maksudTujuan: text('maksud_tujuan'),
  temaKonsinyering: text('tema_konsinyering'),
  jumlahPeserta: integer('jumlah_peserta'),
  durasiKonsinyering: varchar('durasi_konsinyering', { length: 100 }),
  kotaPenyelenggaraan: varchar('kota_penyelenggaraan', { length: 100 }),
  grandTotal: numeric('grand_total', { precision: 15, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type KakPengadaan = typeof kakPengadaan.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 34. KERANGKA ACUAN KERJA (TOR) - DETAIL ITEM PENGADAAN
// ═══════════════════════════════════════════════════════════════════════════

export const kakPengadaanItems = pgTable('kak_pengadaan_items', {
  id: serial('id').primaryKey(),
  pengadaanId: integer('pengadaan_id').references(() => kakPengadaan.id, { onDelete: 'cascade' }),
  urutan: integer('urutan').default(1).notNull(),
  namaItem: text('nama_item').notNull(),
  spesifikasiTeknis: text('spesifikasi_teknis'),
  volume: numeric('volume', { precision: 10, scale: 2 }).default('1').notNull(),
  satuan: varchar('satuan', { length: 50 }).notNull(),
  hargaSatuan: numeric('harga_satuan', { precision: 15, scale: 2 }).default('0').notNull(),
  totalHarga: numeric('total_harga', { precision: 15, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type KakPengadaanItems = typeof kakPengadaanItems.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 35. KERANGKA ACUAN KERJA (TOR) - MONITORING SUBMIT & APPROVE
// ═══════════════════════════════════════════════════════════════════════════

export const kakMonitoring = pgTable('kak_monitoring', {
  id: serial('id').primaryKey(),
  historiId: integer('histori_id').references(() => kakHistori.id, { onDelete: 'cascade' }),
  unitKerja: varchar('unit_kerja', { length: 150 }).notNull(),
  owner: varchar('owner', { length: 50 }).default('Operator').notNull(),
  kodifikasi: varchar('kodifikasi', { length: 20 }).default('B00').notNull(),
  tahapStatus: varchar('tahap_status', { length: 50 }).default('DIPA Awal').notNull(),
  revKe: integer('rev_ke').default(0).notNull(),
  statusHistoriFull: varchar('status_histori_full', { length: 150 }),
  sumber: varchar('sumber', { length: 20 }).default('B00'),
  tglRevisi: varchar('tgl_revisi', { length: 50 }),
  isApproved: boolean('is_approved').default(false).notNull(),
  tglApproved: varchar('tgl_approved', { length: 50 }),
  approvedBy: varchar('approved_by', { length: 100 }),
  isDocUploaded: boolean('is_doc_uploaded').default(false).notNull(),
  signedDocName: text('signed_doc_name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type KakMonitoring = typeof kakMonitoring.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// 36. REFERENSI VISI & MISI PPATK (RENSTRA)
// ═══════════════════════════════════════════════════════════════════════════

export const refVisiMisi = pgTable('ref_visi_misi', {
  id: serial('id').primaryKey(),
  periode: varchar('periode', { length: 50 }).default('2025-2029').notNull(),
  visi: text('visi').notNull(),
  misi: jsonb('misi').notNull(),
  tujuan: jsonb('tujuan').notNull(),
  indikatorTujuan: jsonb('indikator_tujuan'),
  status: varchar('status', { length: 20 }).default('Aktif'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RefVisiMisi = typeof refVisiMisi.$inferSelect;
export type NewRefVisiMisi = typeof refVisiMisi.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 37. REFERENSI UNIT KERJA PPATK
// ═══════════════════════════════════════════════════════════════════════════

export const refUnitKerja = pgTable('ref_unit_kerja', {
  id: serial('id').primaryKey(),
  singkatan: varchar('singkatan', { length: 50 }).notNull().unique(),
  initial: varchar('initial', { length: 10 }),
  nama: varchar('nama', { length: 255 }).notNull(),
  cluster: varchar('cluster', { length: 100 }),
  subcluster: varchar('subcluster', { length: 255 }),
  status: varchar('status', { length: 20 }).default('Aktif'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RefUnitKerja = typeof refUnitKerja.$inferSelect;
export type NewRefUnitKerja = typeof refUnitKerja.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 38. REFERENSI SATUAN KERJA (SATKER)
// ═══════════════════════════════════════════════════════════════════════════

export const refSatker = pgTable('ref_satker', {
  id: serial('id').primaryKey(),
  kode: varchar('kode', { length: 50 }).notNull().unique(),
  nama: varchar('nama', { length: 255 }).notNull(),
  jenis: varchar('jenis', { length: 100 }),
  eselon: varchar('eselon', { length: 100 }),
  lokasi: text('lokasi'),
  keterangan: text('keterangan'),
  status: varchar('status', { length: 20 }).default('Aktif'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RefSatker = typeof refSatker.$inferSelect;
export type NewRefSatker = typeof refSatker.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 39. REFERENSI INFORMASI KINERJA (PROGRAM, KEGIATAN, KRO, RO, KOMPONEN)
// ═══════════════════════════════════════════════════════════════════════════

export const refInformasiKinerja = pgTable('ref_informasi_kinerja', {
  id: serial('id').primaryKey(),
  kodeIk: varchar('kode_ik', { length: 50 }).unique(),
  kl: varchar('kl', { length: 255 }).notNull(),
  satker: varchar('satker', { length: 255 }).notNull(),
  program: text('program').notNull(),
  unitKerja: varchar('unit_kerja', { length: 50 }).notNull(),
  kegiatan: text('kegiatan').notNull(),
  kro: text('kro').notNull(),
  ro: text('ro').notNull(),
  komponen: text('komponen').notNull(),
  status: varchar('status', { length: 20 }).default('Aktif'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RefInformasiKinerja = typeof refInformasiKinerja.$inferSelect;
export type NewRefInformasiKinerja = typeof refInformasiKinerja.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 40. REFERENSI SASARAN KINERJA (CASCADING RENJA & RENSTRA)
// ═══════════════════════════════════════════════════════════════════════════

export const refSasaranKinerja = pgTable('ref_sasaran_kinerja', {
  id: serial('id').primaryKey(),
  kodeSasaran: varchar('kode_sasaran', { length: 50 }).unique(),
  no: integer('no'),
  program: text('program').notNull(),
  kegiatan: text('kegiatan'),
  sasaranKro: text('sasaran_kro').notNull(),
  ro: text('ro'),
  indikator: text('indikator').notNull(),
  target: jsonb('target'),
  satuan: varchar('satuan', { length: 50 }),
  type: varchar('50', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).default('Aktif'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RefSasaranKinerja = typeof refSasaranKinerja.$inferSelect;
export type NewRefSasaranKinerja = typeof refSasaranKinerja.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 41. STANDAR BIAYA MASUKAN (SBM)
// ═══════════════════════════════════════════════════════════════════════════

export const standarBiayaMasukan = pgTable('standar_biaya_masukan', {
  id: serial('id').primaryKey(),
  kodeTabel: varchar('kode_tabel', { length: 20 }).notNull(),
  halaman: varchar('halaman', { length: 50 }),
  lampiran: varchar('lampiran', { length: 50 }).notNull(),
  jenisTabel: text('jenis_tabel').notNull(),
  uraian: text('uraian').notNull(),
  satuan: varchar('satuan', { length: 50 }),
  besaran: bigint('besaran', { mode: 'number' }).notNull(),
  dasarHukum: varchar('dasar_hukum', { length: 100 }).default('KMK Nomor 296 Tahun 2026'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type StandarBiayaMasukan = typeof standarBiayaMasukan.$inferSelect;
export type NewStandarBiayaMasukan = typeof standarBiayaMasukan.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════
// 42. SERIES ANGGARAN (2020-2025)
// ═══════════════════════════════════════════════════════════════════════════

export const seriesAnggaran = pgTable('series_anggaran', {
  id: serial('id').primaryKey(),
  tahun: integer('tahun').notNull(),
  kl: varchar('kl', { length: 100 }),
  satker: text('satker'),
  program: text('program'),
  kegiatan: text('kegiatan'),
  kro: text('kro'),
  ro: text('ro'),
  komponen: text('komponen'),
  akun2: text('akun2'),
  akun3: text('akun3'),
  akun6: text('akun6'),
  pagu: numeric('pagu', { precision: 20, scale: 2 }).default('0'),
  blokir: numeric('blokir', { precision: 20, scale: 2 }).default('0'),
  realisasi: numeric('realisasi', { precision: 20, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type SeriesAnggaran = typeof seriesAnggaran.$inferSelect;
export type NewSeriesAnggaran = typeof seriesAnggaran.$inferInsert;



