-- ============================================================================
-- SQL DDL Migration: Tabel RAB (Rincian Anggaran Biaya) & Template Otomatisasi
-- Database: pro_renja_db (PostgreSQL)
-- ============================================================================

-- 1. Tabel Master Template Komponen 001 & 002 (Gaji dan Operasional Kantor)
CREATE TABLE IF NOT EXISTS ref_rab_template (
    id SERIAL PRIMARY KEY,
    tipe_template VARCHAR(50) NOT NULL, -- 'pusatGaji' | 'pusdiklatGaji' | 'pusatKantor' | 'pusdiklatKantor'
    komponen_kode VARCHAR(10) NOT NULL, -- '001' | '002'
    unit_kerja_target VARCHAR(50) NOT NULL, -- 'BINCANG' | 'PATIH' | 'BIRU'
    file_sumber VARCHAR(100) NOT NULL, -- 'Pusat_RAB Gaji.xlsx', 'Pusdiklat_RAB Gaji.xlsx', etc.
    urutan INTEGER NOT NULL DEFAULT 1,
    row_type VARCHAR(50) NOT NULL, -- 'subkomponen' | 'akun' | 'detail'
    kode VARCHAR(50),
    uraian TEXT NOT NULL,
    sub_uraian TEXT,
    sd VARCHAR(20) DEFAULT 'A00',
    vol VARCHAR(50),
    sat VARCHAR(50),
    k1_nilai VARCHAR(50),
    k1_sat VARCHAR(50),
    k2_nilai VARCHAR(50),
    k2_sat VARCHAR(50),
    k3_nilai VARCHAR(50),
    k3_sat VARCHAR(50),
    harga NUMERIC(20, 2) DEFAULT 0,
    jumlah NUMERIC(20, 2) DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Index untuk mempercepat query berdasarkan tipe_template dan komponen_kode
CREATE INDEX IF NOT EXISTS idx_rab_template_tipe ON ref_rab_template(tipe_template);
CREATE INDEX IF NOT EXISTS idx_rab_template_komp ON ref_rab_template(komponen_kode);

-- 2. Tabel Histori & Worksheet RAB Unit Kerja
CREATE TABLE IF NOT EXISTS rab_isian_worksheet (
    id SERIAL PRIMARY KEY,
    unit_singkatan VARCHAR(50) NOT NULL,
    unit_nama VARCHAR(255),
    tahun_anggaran INTEGER NOT NULL DEFAULT 2027,
    status_histori VARCHAR(50) DEFAULT 'DIPA Awal',
    kode_sts_history VARCHAR(20) DEFAULT 'B00',
    worksheet_json JSONB NOT NULL,
    total_pagu NUMERIC(20, 2) DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_rab_unit UNIQUE (unit_singkatan, tahun_anggaran, kode_sts_history)
);
