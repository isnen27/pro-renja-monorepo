# Database Setup Guide - Pro Renja Monorepo

## Prerequisites

1. **Docker & Docker Compose** harus sudah terinstall
2. **Node.js** v18+ untuk running migrations dan seed

## Quick Start

### 1. Start PostgreSQL Container

```bash
cd apps/api
npm run db:up
```

Ini akan memulai container PostgreSQL dengan konfigurasi:
- Database: `pro_renja_db`
- Username: `postgres`
- Password: `postgres`
- Port: `5432`

### 2. Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env dan sesuaikan jika perlu
```

### 3. Generate & Push Schema

```bash
# Generate migration files (optional, untuk melihat perubahan)
npm run db:generate

# Push schema langsung ke database (tidak perlu migration)
npm run db:push
```

### 4. Seed Data

```bash
# Seed Bagan Akun Standar (BAS)
npm run db:seed
```

### 5. Run API

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## API Endpoints

### Bagan Akun Standar (BAS)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/referensi/akun` | Get paginated list of akun |
| GET | `/api/referensi/akun/:kode` | Get single akun by kode 6 digit |
| GET | `/api/referensi/akun/kategori/list` | Get list of all kategori |
| GET | `/api/referensi/akun/summary` | Get summary statistics |

#### Query Parameters

```
GET /api/referensi/akun?search=honor&kategori=Belanja%20Barang&page=1&limit=50
```

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search in kode, uraian, penggunaan |
| kategori | string | Filter by kategori |
| kode3digit | string | Filter by 3-digit kode |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 50) |
| sortBy | string | Sort field: kode, uraian, no |
| sortOrder | string | asc or desc |

### Pejabat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/referensi/pejabat` | Get all pejabat |
| GET | `/api/referensi/pejabat/:id` | Get pejabat by ID |
| GET | `/api/referensi/pejabat/aktif` | Get active pejabat only |

### SBK

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/referensi/sbk` | Get all SBK |
| GET | `/api/referensi/sbk/:id` | Get SBK by ID |

### OPD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/referensi/opd` | Get all OPD |
| GET | `/api/referensi/opd/:id` | Get OPD by ID |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/referensi/health` | Health check endpoint |

## Database Schema

### Tables

1. **bagan_akun_standar** - Master kode akun belanja
2. **data_pejabat** - Data pejabat PPATK
3. **standar_biaya_keluaran** - SBK reference
4. **program_kegiatan** - Program dan kegiatan
5. **urusan_pemerintah** - Urusan pemerintahan
6. **data_opd** - Organisasi Perangkat Daerah
7. **nomenklatur_anggaran** - KRO, RO, Komponen
8. **users** - User authentication

## Docker Commands

```bash
# Start database
docker-compose up -d postgres

# Stop database
docker-compose down

# Restart database
docker-compose restart postgres

# View logs
docker-compose logs -f postgres

# Access psql
docker exec -it pro-renja-postgres psql -U postgres -d pro_renja_db
```

## Troubleshooting

### Connection Refused

Pastikan PostgreSQL container sedang running:
```bash
docker ps | grep postgres
```

### Migration Error

Hapus database dan buat ulang:
```bash
docker-compose down -v
docker-compose up -d postgres
npm run db:push
npm run db:seed
```

## pgAdmin (Optional)

Start pgAdmin untuk management via GUI:
```bash
docker-compose --profile admin up -d pgadmin
```

Access pgAdmin di `http://localhost:5050`
- Email: admin@ppatk.go.id
- Password: admin123
