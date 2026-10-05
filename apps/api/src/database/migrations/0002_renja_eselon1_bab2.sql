-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: 0002_renja_eselon1_bab2.sql
-- Deskripsi: Schema tabel untuk Renja Eselon I - Isian Bab II (Program Kerja)
-- Menggunakan PostgreSQL & terhubung dengan tabel renja_eselon1_histori
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. TABEL ISIAN BAB II ───────────────────────────────────────────────────
-- Record 1:1 relasi ke renja_eselon1_histori.
CREATE TABLE IF NOT EXISTS renja_eselon1_bab2 (
  id                          SERIAL PRIMARY KEY,
  histori_id                  INTEGER NOT NULL REFERENCES renja_eselon1_histori(id) ON DELETE CASCADE,
  -- Bagian 1: Narasi Pengantar Program Kerja
  pengantar_program_kerja     TEXT,
  -- Bagian 2: Flag & Jumlah Program Kerja Lintas Unit Kerja
  ada_proker_lintas_unit      BOOLEAN NOT NULL DEFAULT FALSE,
  jumlah_proker_lintas_unit   INTEGER NOT NULL DEFAULT 0,
  -- Bagian 3: Jumlah Program Kerja Unit Kerja
  jumlah_proker_unit_kerja    INTEGER NOT NULL DEFAULT 0,
  -- Metadata simpan per bagian
  disimpan_bagian_1           BOOLEAN DEFAULT FALSE,
  disimpan_bagian_2           BOOLEAN DEFAULT FALSE,
  disimpan_bagian_3           BOOLEAN DEFAULT FALSE,
  created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_renja_e1_bab2_histori UNIQUE (histori_id)
);

COMMENT ON TABLE renja_eselon1_bab2 IS 'Isian Bab II Renja Eselon I — relasi 1:1 ke histori';

-- ─── 2. TABEL PROGRAM KERJA LINTAS UNIT KERJA (BAGIAN 2) ───────────────────
CREATE TABLE IF NOT EXISTS renja_eselon1_bab2_proker_lintas (
  id                  SERIAL PRIMARY KEY,
  bab2_id             INTEGER NOT NULL REFERENCES renja_eselon1_bab2(id) ON DELETE CASCADE,
  no_paket            INTEGER NOT NULL,                     -- Nomor paket (1 s.d. jumlah)
  nomenklatur         VARCHAR(500) NOT NULL,                -- Nomenklatur Program Kerja Lintas Unit Kerja
  uraian              TEXT,                                 -- WYSIWYG rich text
  tujuan              TEXT,                                 -- WYSIWYG rich text
  outcome             TEXT,                                 -- WYSIWYG rich text
  jenis_program_kerja TEXT,                                 -- WYSIWYG rich text
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_renja_e1_bab2_proker_lintas_paket UNIQUE (bab2_id, no_paket)
);

COMMENT ON TABLE renja_eselon1_bab2_proker_lintas IS 'Paket Isian Program Kerja Lintas Unit Kerja pada Bab II Bagian 2';

-- ─── 3. TABEL PROGRAM KERJA UNIT KERJA (BAGIAN 3) ──────────────────────────
CREATE TABLE IF NOT EXISTS renja_eselon1_bab2_proker_unit (
  id                  SERIAL PRIMARY KEY,
  bab2_id             INTEGER NOT NULL REFERENCES renja_eselon1_bab2(id) ON DELETE CASCADE,
  no_paket            INTEGER NOT NULL,                     -- Nomor paket (1 s.d. jumlah)
  nomenklatur         VARCHAR(500) NOT NULL,                -- Nomenklatur Program Kerja Unit Kerja
  uraian              TEXT,                                 -- WYSIWYG rich text
  tujuan              TEXT,                                 -- WYSIWYG rich text
  outcome             TEXT,                                 -- WYSIWYG rich text
  jenis_program_kerja TEXT,                                 -- WYSIWYG rich text
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_renja_e1_bab2_proker_unit_paket UNIQUE (bab2_id, no_paket)
);

COMMENT ON TABLE renja_eselon1_bab2_proker_unit IS 'Paket Isian Program Kerja Unit Kerja pada Bab II Bagian 3';

-- ─── INDEX ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_renja_e1_bab2_histori ON renja_eselon1_bab2 (histori_id);
CREATE INDEX IF NOT EXISTS idx_renja_e1_bab2_proker_lintas_bab2 ON renja_eselon1_bab2_proker_lintas (bab2_id);
CREATE INDEX IF NOT EXISTS idx_renja_e1_bab2_proker_unit_bab2 ON renja_eselon1_bab2_proker_unit (bab2_id);
