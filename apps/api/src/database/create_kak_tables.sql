-- ============================================================================
-- SQL DDL Migration: Tabel Kerangka Acuan Kerja (KAK / TOR)
-- Database: pro_renja_db (PostgreSQL)
-- ============================================================================

-- 1. Histori KAK (Pilih Histori KAK)
CREATE TABLE IF NOT EXISTS kak_histori (
    id SERIAL PRIMARY KEY,
    unit_kode VARCHAR(50),
    unit_nama VARCHAR(255) NOT NULL,
    unit_singkatan VARCHAR(50),
    kode_sts_history VARCHAR(20) NOT NULL DEFAULT 'B00',
    status_histori VARCHAR(50) NOT NULL DEFAULT 'DIPA Awal', -- 'DIPA Awal', 'Usulan Revisi DIPA', 'Usulan Revisi Satker (POK)', dst.
    tahun_anggaran INTEGER NOT NULL DEFAULT 2027,
    tgl_pengajuan TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    dibuat_oleh VARCHAR(100) DEFAULT 'Operator',
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    tgl_approved TIMESTAMP WITHOUT TIME ZONE,
    approved_oleh VARCHAR(100),
    owner VARCHAR(50) NOT NULL DEFAULT 'Operator',
    sumber VARCHAR(20) DEFAULT 'B00',
    rev_ke INTEGER NOT NULL DEFAULT 0,
    keterangan TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 2. Isian Dokumen KAK (Standar sesuai contoh_KAK.pdf)
CREATE TABLE IF NOT EXISTS kak_isian (
    id SERIAL PRIMARY KEY,
    histori_id INTEGER REFERENCES kak_histori(id) ON DELETE CASCADE,
    kementerian_lembaga TEXT,
    unit_eselon1 TEXT,
    program TEXT,
    sasaran_program TEXT,
    ikp TEXT,
    kegiatan TEXT,
    sasaran_kegiatan TEXT,
    ikk TEXT,
    kro TEXT,
    ro TEXT,
    satuan_ro TEXT,
    dasar_hukum TEXT,
    gambaran_umum TEXT,
    penerima_manfaat TEXT,
    metode_pelaksanaan TEXT,
    total_biaya VARCHAR(100),
    terbilang_biaya TEXT,
    tempat_tanggal_ttd VARCHAR(100),
    nama_penanggungjawab VARCHAR(150),
    jabatan_penanggungjawab VARCHAR(150),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 3. Isian Sub-Komponen & Tahapan KAK
CREATE TABLE IF NOT EXISTS kak_isian_subkomponen (
    id SERIAL PRIMARY KEY,
    kak_id INTEGER REFERENCES kak_isian(id) ON DELETE CASCADE,
    urutan INTEGER NOT NULL DEFAULT 1,
    nama_subkomponen TEXT NOT NULL,
    uraian_rangkaian TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 4. Isian Jadwal Bulanan Output KAK (Januari s.d. Desember)
CREATE TABLE IF NOT EXISTS kak_jadwal_bulanan (
    id SERIAL PRIMARY KEY,
    kak_id INTEGER REFERENCES kak_isian(id) ON DELETE CASCADE,
    urutan INTEGER NOT NULL DEFAULT 1,
    subkomponen_nama TEXT NOT NULL,
    volume VARCHAR(50),
    satuan VARCHAR(50),
    jadwal_json JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 5. Isian KAK Pengadaan (Pengadaan Barang, Jasa, Konsinyering)
CREATE TABLE IF NOT EXISTS kak_pengadaan (
    id SERIAL PRIMARY KEY,
    histori_id INTEGER REFERENCES kak_histori(id) ON DELETE CASCADE,
    jenis_pengadaan VARCHAR(50) NOT NULL, -- 'Pengadaan Barang' | 'Pengadaan Jasa' | 'Konsinyering'
    nama_paket TEXT NOT NULL,
    kode_rup VARCHAR(100),
    lokasi_pengadaan TEXT,
    jangka_waktu VARCHAR(100),
    latar_belakang TEXT,
    maksud_tujuan TEXT,
    tema_konsinyering TEXT,
    jumlah_peserta INTEGER,
    durasi_konsinyering VARCHAR(100),
    kota_penyelenggaraan VARCHAR(100),
    grand_total NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 6. Detail Item Spesifikasi Pengadaan
CREATE TABLE IF NOT EXISTS kak_pengadaan_items (
    id SERIAL PRIMARY KEY,
    pengadaan_id INTEGER REFERENCES kak_pengadaan(id) ON DELETE CASCADE,
    urutan INTEGER NOT NULL DEFAULT 1,
    nama_item TEXT NOT NULL,
    spesifikasi_teknis TEXT,
    volume NUMERIC(10, 2) NOT NULL DEFAULT 1,
    satuan VARCHAR(50) NOT NULL,
    harga_satuan NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_harga NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 7. Monitoring Submit & Approve KAK
CREATE TABLE IF NOT EXISTS kak_monitoring (
    id SERIAL PRIMARY KEY,
    histori_id INTEGER REFERENCES kak_histori(id) ON DELETE CASCADE,
    unit_kerja VARCHAR(150) NOT NULL,
    owner VARCHAR(50) NOT NULL DEFAULT 'Operator',
    kodifikasi VARCHAR(20) NOT NULL DEFAULT 'B00',
    tahap_status VARCHAR(50) NOT NULL DEFAULT 'DIPA Awal',
    rev_ke INTEGER NOT NULL DEFAULT 0,
    status_histori_full VARCHAR(150),
    sumber VARCHAR(20) DEFAULT 'B00',
    tgl_revisi VARCHAR(50),
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    tgl_approved VARCHAR(50),
    approved_by VARCHAR(100),
    is_doc_uploaded BOOLEAN NOT NULL DEFAULT FALSE,
    signed_doc_name TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

