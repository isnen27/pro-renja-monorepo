-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: 0001_renja_eselon1.sql
-- Deskripsi: Schema tabel untuk Renja Eselon I
-- Nomenklatur kolom mengacu pada SPAN API (KODE_STS_HISTORY, KDSATKER, dll.)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── ENUM ───────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE status_histori_enum AS ENUM (
    'Pagu Indikatif',
    'Pagu Anggaran',
    'Alokasi Anggaran'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE unit_kerja_eselon1_enum AS ENUM (
    'Deputi TEGAS',
    'Deputi ASA',
    'Deputi PENGASUH'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 1. TABEL HISTORI RENJA ESELON I ────────────────────────────────────────
-- Setiap histori yang dibuat di submenu Pilih Histori.
-- Kolom kode_sts_history & kdsatker mengikuti nomenklatur SPAN API.
CREATE TABLE IF NOT EXISTS renja_eselon1_histori (
  id                SERIAL PRIMARY KEY,
  kdsatker          VARCHAR(20) NOT NULL,               -- SPAN: kode unit kerja (Deputi TEGAS / ASA / PENGASUH)
  kode_sts_history  VARCHAR(5)  NOT NULL,               -- SPAN: KODE_STS_HISTORY (D00, D01..D99, E00..E99)
  status_histori    status_histori_enum NOT NULL,        -- Label fase anggaran
  tgl_pengajuan     TIMESTAMP   NOT NULL DEFAULT NOW(),  -- Tanggal histori dibuat
  dibuat_oleh       VARCHAR(50),                         -- Username pembuat
  is_approved       BOOLEAN     NOT NULL DEFAULT FALSE,
  tgl_approved      TIMESTAMP,
  approved_oleh     VARCHAR(50),
  keterangan        TEXT,                                -- Catatan opsional
  created_at        TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP   NOT NULL DEFAULT NOW(),
  -- Constraint: kombinasi unit kerja + kode histori harus unik
  CONSTRAINT uq_renja_e1_histori UNIQUE (kdsatker, kode_sts_history)
);

COMMENT ON TABLE renja_eselon1_histori IS 'Histori status anggaran Renja Eselon I (mengikuti nomenklatur SPAN API)';
COMMENT ON COLUMN renja_eselon1_histori.kdsatker IS 'Kode satker/unit kerja — SPAN: KDSATKER';
COMMENT ON COLUMN renja_eselon1_histori.kode_sts_history IS 'Kode status history — SPAN: KODE_STS_HISTORY (D00=Pagu Indikatif awal, D01-D99=Pagu Anggaran, E00-E99=Alokasi Anggaran)';

-- ─── 2. TABEL ISIAN BAB I ───────────────────────────────────────────────────
-- Satu record per histori. Relasi 1:1 ke renja_eselon1_histori.
CREATE TABLE IF NOT EXISTS renja_eselon1_bab1 (
  id                        SERIAL PRIMARY KEY,
  histori_id                INTEGER NOT NULL REFERENCES renja_eselon1_histori(id) ON DELETE CASCADE,
  -- A. Gambaran Umum
  gambaran_sasaran          TEXT,    -- Sasaran yang akan dicapai tahun berikutnya
  gambaran_program_kerja    TEXT,    -- Program kerja prioritas dan rutin tahun berikutnya
  -- B. Capaian Kinerja (narasi)
  capaian_narasi_th_min1    TEXT,    -- Narasi penjelasan capaian T-1
  capaian_narasi_th_min2    TEXT,    -- Narasi penjelasan capaian T-2
  -- C. Arah Kebijakan, Strategi, dan Target Kinerja
  arah_narasi_renstra       TEXT,    -- Narasi implementasi Renstra PPATK 2025-2029
  -- D. Analisis Situasi
  analisis_momentum         TEXT,    -- Momentum dan peluang
  analisis_tantangan        TEXT,    -- Tantangan dan permasalahan
  -- Metadata simpan per bagian
  disimpan_bagian_a         BOOLEAN  DEFAULT FALSE,
  disimpan_bagian_b         BOOLEAN  DEFAULT FALSE,
  disimpan_bagian_c         BOOLEAN  DEFAULT FALSE,
  disimpan_bagian_d         BOOLEAN  DEFAULT FALSE,
  created_at                TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_renja_e1_bab1_histori UNIQUE (histori_id)
);

COMMENT ON TABLE renja_eselon1_bab1 IS 'Isian Bab I Renja Eselon I — relasi 1:1 ke histori';

-- ─── 3. TABEL CAPAIAN KINERJA (ROWS TABEL BAB I BAGIAN B) ──────────────────
-- Setiap baris tabel Capaian Kinerja di Bagian B.
CREATE TABLE IF NOT EXISTS renja_eselon1_bab1_capaian (
  id              SERIAL PRIMARY KEY,
  bab1_id         INTEGER NOT NULL REFERENCES renja_eselon1_bab1(id) ON DELETE CASCADE,
  urutan          INTEGER NOT NULL DEFAULT 1,             -- Urutan baris dalam tabel
  sasaran_program VARCHAR(500),                           -- Pilihan Sasaran Program
  ikp             VARCHAR(500),                           -- Indikator Kinerja Program
  tahun           INTEGER,                                -- Tahun data capaian
  target          NUMERIC(20, 4),
  realisasi       NUMERIC(20, 4),
  -- capaian_pct dihitung di aplikasi (PostgreSQL generated column butuh versi 12+)
  capaian_pct     NUMERIC(10, 4),                         -- Capaian (%) = realisasi/target*100
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE renja_eselon1_bab1_capaian IS 'Baris tabel Capaian Kinerja pada Bab I Bagian B';
COMMENT ON COLUMN renja_eselon1_bab1_capaian.ikp IS 'Indikator Kinerja Program (IKP)';

-- ─── 4. TABEL TARGET KINERJA (ROWS TABEL BAB I BAGIAN C) ───────────────────
-- Setiap baris tabel Target Indikator Kinerja T+1 di Bagian C.
CREATE TABLE IF NOT EXISTS renja_eselon1_bab1_target_kinerja (
  id                SERIAL PRIMARY KEY,
  bab1_id           INTEGER NOT NULL REFERENCES renja_eselon1_bab1(id) ON DELETE CASCADE,
  urutan            INTEGER NOT NULL DEFAULT 1,
  kode              VARCHAR(50),                           -- Kode indikator kinerja
  sasaran_indikator TEXT,                                  -- Uraian sasaran/indikator
  target_t1         NUMERIC(20, 4),                        -- Target tahun T+1
  satuan            VARCHAR(50),                           -- Satuan target
  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE renja_eselon1_bab1_target_kinerja IS 'Baris tabel Target Indikator Kinerja T+1 pada Bab I Bagian C';

-- ─── INDEX ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_renja_e1_histori_kdsatker      ON renja_eselon1_histori (kdsatker);
CREATE INDEX IF NOT EXISTS idx_renja_e1_histori_kode_sts      ON renja_eselon1_histori (kode_sts_history);
CREATE INDEX IF NOT EXISTS idx_renja_e1_bab1_histori          ON renja_eselon1_bab1 (histori_id);
CREATE INDEX IF NOT EXISTS idx_renja_e1_bab1_capaian_bab1     ON renja_eselon1_bab1_capaian (bab1_id);
CREATE INDEX IF NOT EXISTS idx_renja_e1_bab1_target_bab1      ON renja_eselon1_bab1_target_kinerja (bab1_id);
