-- init.sql
-- Initial database setup for Pro Renja

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
DO $$ BEGIN
    CREATE TYPE kategori_belanja AS ENUM (
        'Belanja Pegawai',
        'Belanja Barang',
        'Belanja Jasa',
        'Belanja Pemeliharaan',
        'Belanja Perjalanan',
        'Belanja Modal'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_aktif AS ENUM ('Aktif', 'Tidak Aktif', 'Diproses');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Log initialization
DO $$ BEGIN
    RAISE NOTICE 'Pro Renja database initialized successfully';
END $$;
