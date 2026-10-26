-- ============================================================================
-- SQL DDL Migration: Tabel Lengkap Renja Eselon I & Eselon II
-- Database: pro_renja_db (PostgreSQL)
-- ============================================================================

-- 1. Tabel Monitoring Renja Eselon I
CREATE TABLE IF NOT EXISTS renja_eselon1_monitoring (
    id SERIAL PRIMARY KEY,
    histori_id INTEGER REFERENCES ref_sts(id) ON DELETE CASCADE,
    unit_kerja VARCHAR(100) NOT NULL,
    owner VARCHAR(50) NOT NULL DEFAULT 'Operator',
    kodifikasi VARCHAR(20) NOT NULL DEFAULT 'D00',
    tahap_status VARCHAR(50) NOT NULL DEFAULT 'Pagu Indikatif',
    rev_ke INTEGER NOT NULL DEFAULT 0,
    status_histori_full VARCHAR(150),
    sumber VARCHAR(20) DEFAULT 'D00',
    tgl_revisi VARCHAR(50),
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    tgl_approved VARCHAR(50),
    approved_by VARCHAR(100),
    is_doc_uploaded BOOLEAN NOT NULL DEFAULT FALSE,
    signed_doc_name TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 2. Renja Eselon II - Histori (Pilih Histori Eselon II)
CREATE TABLE IF NOT EXISTS renja_eselon2_histori (
    id SERIAL PRIMARY KEY,
    unit_kode VARCHAR(50),
    unit_nama VARCHAR(255) NOT NULL,
    unit_singkatan VARCHAR(50) NOT NULL,
    kode_sts_history VARCHAR(20) NOT NULL DEFAULT 'D00',
    status_histori VARCHAR(50) NOT NULL DEFAULT 'Pagu Indikatif',
    tahun_anggaran INTEGER NOT NULL DEFAULT 2026,
    tgl_pengajuan TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    dibuat_oleh VARCHAR(100) DEFAULT 'Operator',
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    tgl_approved TIMESTAMP WITHOUT TIME ZONE,
    approved_oleh VARCHAR(100),
    owner VARCHAR(50) NOT NULL DEFAULT 'Operator',
    sumber VARCHAR(20) DEFAULT 'D00',
    rev_ke INTEGER NOT NULL DEFAULT 0,
    keterangan TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 3. Renja Eselon II - Isian Bab I
CREATE TABLE IF NOT EXISTS renja_eselon2_bab1 (
    id SERIAL PRIMARY KEY,
    histori_id INTEGER REFERENCES renja_eselon2_histori(id) ON DELETE CASCADE,
    unit_singkatan VARCHAR(50),
    unit_nama VARCHAR(255),
    kondisi_umum_latar_belakang TEXT,
    kondisi_umum_faktor_pendorong TEXT,
    kebijakan_terkait TEXT,
    disimpan_bagian_a BOOLEAN DEFAULT FALSE,
    disimpan_bagian_b BOOLEAN DEFAULT FALSE,
    disimpan_bagian_c BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 4. Renja Eselon II - Bab I Evaluasi Kinerja (Capaian)
CREATE TABLE IF NOT EXISTS renja_eselon2_bab1_evaluasi_kinerja (
    id SERIAL PRIMARY KEY,
    bab1_id INTEGER REFERENCES renja_eselon2_bab1(id) ON DELETE CASCADE,
    urutan INTEGER NOT NULL DEFAULT 1,
    sasaran_kegiatan TEXT,
    ikk TEXT,
    tahun INTEGER DEFAULT 2025,
    target VARCHAR(100),
    capaian_output_pct NUMERIC(6,2),
    capaian_anggaran_pct NUMERIC(6,2),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 5. Renja Eselon II - Bab I Target Kinerja
CREATE TABLE IF NOT EXISTS renja_eselon2_bab1_target_kinerja (
    id SERIAL PRIMARY KEY,
    bab1_id INTEGER REFERENCES renja_eselon2_bab1(id) ON DELETE CASCADE,
    urutan INTEGER NOT NULL DEFAULT 1,
    kode VARCHAR(50),
    sasaran_indikator TEXT,
    level_indikator VARCHAR(50),
    target_t1 VARCHAR(100),
    satuan VARCHAR(50),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 6. Renja Eselon II - Isian Bab II
CREATE TABLE IF NOT EXISTS renja_eselon2_bab2 (
    id SERIAL PRIMARY KEY,
    histori_id INTEGER REFERENCES renja_eselon2_histori(id) ON DELETE CASCADE,
    unit_singkatan VARCHAR(50),
    unit_nama VARCHAR(255),
    pengantar TEXT,
    total_paket INTEGER NOT NULL DEFAULT 1,
    disimpan_seluruhnya BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 7. Renja Eselon II - Bab II Rincian Paket Rencana Kerja (RO)
CREATE TABLE IF NOT EXISTS renja_eselon2_bab2_paket (
    id SERIAL PRIMARY KEY,
    bab2_id INTEGER REFERENCES renja_eselon2_bab2(id) ON DELETE CASCADE,
    no_paket INTEGER NOT NULL,
    kode_ro VARCHAR(50),
    nomenklatur_ro TEXT NOT NULL,
    uraian TEXT,
    tujuan TEXT,
    tahapan TEXT,
    output TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 8. Renja Eselon II - Isian Bab III
CREATE TABLE IF NOT EXISTS renja_eselon2_bab3 (
    id SERIAL PRIMARY KEY,
    histori_id INTEGER REFERENCES renja_eselon2_histori(id) ON DELETE CASCADE,
    unit_singkatan VARCHAR(50),
    unit_nama VARCHAR(255),
    kalimat_pengantar TEXT NOT NULL DEFAULT 'Berdasarkan Uraian Rencana Kerja pada BAB II dapat disampaikan Rekapitulasi Target Output dan Pendanaan sebagai berikut:',
    disimpan_seluruhnya BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 9. Renja Eselon II - Bab III Rekapitulasi Output & Pendanaan
CREATE TABLE IF NOT EXISTS renja_eselon2_bab3_rekap (
    id SERIAL PRIMARY KEY,
    bab3_id INTEGER REFERENCES renja_eselon2_bab3(id) ON DELETE CASCADE,
    urutan INTEGER NOT NULL DEFAULT 1,
    kode VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL, -- 'Kegiatan' | 'KRO' | 'RO' | 'Komponen'
    uraian TEXT NOT NULL,
    pagu VARCHAR(100),
    target VARCHAR(100),
    is_auto_target BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 10. Renja Eselon II - Bab III Target PNBP (Khusus PATIH & BIRU)
CREATE TABLE IF NOT EXISTS renja_eselon2_bab3_pnbp (
    id SERIAL PRIMARY KEY,
    bab3_id INTEGER REFERENCES renja_eselon2_bab3(id) ON DELETE CASCADE,
    urutan INTEGER NOT NULL DEFAULT 1,
    kode VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL, -- 'Kegiatan' | 'KRO' | 'Akun'
    nomenklatur TEXT NOT NULL,
    target_pnbp VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 11. Renja Eselon II - Isian Lampiran (Kamus RO & Komponen)
CREATE TABLE IF NOT EXISTS renja_eselon2_lampiran (
    id SERIAL PRIMARY KEY,
    histori_id INTEGER REFERENCES renja_eselon2_histori(id) ON DELETE CASCADE,
    unit_singkatan VARCHAR(50),
    unit_nama VARCHAR(255),
    disimpan_seluruhnya BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 12. Renja Eselon II - Lampiran Kamus RO & Komponen Items
CREATE TABLE IF NOT EXISTS renja_eselon2_lampiran_kamus_ro (
    id SERIAL PRIMARY KEY,
    lampiran_id INTEGER REFERENCES renja_eselon2_lampiran(id) ON DELETE CASCADE,
    urutan INTEGER NOT NULL DEFAULT 1,
    kode VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL, -- 'RO' | 'Komponen'
    uraian TEXT NOT NULL,
    jumlah_target VARCHAR(100),
    satuan_target VARCHAR(100),
    definisi TEXT,
    rincian_target TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 13. Renja Eselon II - Monitoring Submit & Approve
CREATE TABLE IF NOT EXISTS renja_eselon2_monitoring (
    id SERIAL PRIMARY KEY,
    histori_id INTEGER REFERENCES renja_eselon2_histori(id) ON DELETE CASCADE,
    unit_kerja VARCHAR(150) NOT NULL,
    owner VARCHAR(50) NOT NULL DEFAULT 'Operator',
    kodifikasi VARCHAR(20) NOT NULL DEFAULT 'D00',
    tahap_status VARCHAR(50) NOT NULL DEFAULT 'Pagu Indikatif',
    rev_ke INTEGER NOT NULL DEFAULT 0,
    status_histori_full VARCHAR(150),
    sumber VARCHAR(20) DEFAULT 'D00',
    tgl_revisi VARCHAR(50),
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    tgl_approved VARCHAR(50),
    approved_by VARCHAR(100),
    is_doc_uploaded BOOLEAN NOT NULL DEFAULT FALSE,
    signed_doc_name TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

