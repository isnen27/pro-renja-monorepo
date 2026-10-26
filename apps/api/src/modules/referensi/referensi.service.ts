// src/modules/referensi/referensi.service.ts
// Service for Referensi (Reference Data) Module
import { db } from '../../database/index.js';
import {
  baganAkunStandar,
  dataPejabat,
  standarBiayaKeluaran,
  dataOpd,
  refVisiMisi,
  refUnitKerja,
  refSatker,
  refInformasiKinerja,
  refSasaranKinerja,
  standarBiayaMasukan,
  seriesAnggaran,
} from '../../database/schema.js';
import { eq, like, or, desc, asc, sql, count, and } from 'drizzle-orm';

// ═══════════════════════════════════════════════════════════════════════════
// BAGAN AKUN STANDAR SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export interface GetAkunParams {
  search?: string;
  kategori?: string;
  kode3Digit?: string;
  page?: number;
  limit?: number;
  sortBy?: 'kode' | 'uraian' | 'no';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class BaganAkunService {
  /**
   * Get all akun with pagination and filtering
   */
  async getAkun(params: GetAkunParams = {}): Promise<PaginatedResult<typeof baganAkunStandar.$inferSelect>> {
    const {
      search,
      kategori,
      kode3Digit,
      page = 1,
      limit = 50,
      sortBy = 'no',
      sortOrder = 'asc',
    } = params;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(baganAkunStandar.kodeAkun6Digit, `%${search}%`),
          like(baganAkunStandar.uraianAkun, `%${search}%`),
          like(baganAkunStandar.penggunaanSingkat, `%${search}%`)
        )
      );
    }
    if (kategori) {
      conditions.push(eq(baganAkunStandar.kategori, kategori as any));
    }
    if (kode3Digit) {
      conditions.push(eq(baganAkunStandar.kodeAkun3Digit, kode3Digit));
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(baganAkunStandar)
      .where(conditions.length > 0 ? conditions[0] : undefined);

    // Get data with sorting
    const orderColumn = sortBy === 'kode' ? baganAkunStandar.kodeAkun6Digit
      : sortBy === 'uraian' ? baganAkunStandar.uraianAkun
      : baganAkunStandar.no;

    const orderDirection = sortOrder === 'asc' ? asc : desc;

    const data = await db
      .select()
      .from(baganAkunStandar)
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(orderDirection === asc ? orderColumn : orderColumn)
      .limit(limit)
      .offset(offset);

    return {
      data,
      total: total || 0,
      page,
      limit,
      totalPages: Math.ceil((total || 0) / limit),
    };
  }

  /**
   * Get akun by kode 6 digit
   */
  async getAkunByKode(kode: string) {
    const result = await db
      .select()
      .from(baganAkunStandar)
      .where(eq(baganAkunStandar.kodeAkun6Digit, kode))
      .limit(1);
    return result[0] || null;
  }

  /**
   * Get all unique kategori
   */
  async getKategoriList() {
    const result = await db
      .select({
        kategori: baganAkunStandar.kategori,
      })
      .from(baganAkunStandar)
      .groupBy(baganAkunStandar.kategori);

    return result.map(r => r.kategori).filter(Boolean);
  }

  /**
   * Get akun grouped by 3-digit kode
   */
  async getAkunGroupedBy3Digit() {
    const result = await db
      .select({
        kode3Digit: baganAkunStandar.kodeAkun3Digit,
        nama3Digit: baganAkunStandar.namaAkun3Digit,
      })
      .from(baganAkunStandar)
      .groupBy(baganAkunStandar.kodeAkun3Digit, baganAkunStandar.namaAkun3Digit)
      .orderBy(baganAkunStandar.kodeAkun3Digit);

    return result;
  }

  /**
   * Get summary statistics
   */
  async getSummary() {
    const [{ total }] = await db.select({ total: count() }).from(baganAkunStandar);

    const byKategori = await db
      .select({
        kategori: baganAkunStandar.kategori,
        count: count(),
      })
      .from(baganAkunStandar)
      .groupBy(baganAkunStandar.kategori);

    return {
      totalAkun: total || 0,
      byKategori,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PEJABAT SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class PejabatService {
  async getAll() {
    return db.select().from(dataPejabat).orderBy(desc(dataPejabat.createdAt));
  }

  async getById(id: number) {
    const result = await db
      .select()
      .from(dataPejabat)
      .where(eq(dataPejabat.id, id))
      .limit(1);
    return result[0] || null;
  }

  async getByKode(kode: string) {
    const result = await db
      .select()
      .from(dataPejabat)
      .where(eq(dataPejabat.kodePejabat, kode))
      .limit(1);
    return result[0] || null;
  }

  async getByUnitKerja(unitKerja: string) {
    return db
      .select()
      .from(dataPejabat)
      .where(eq(dataPejabat.unitKerja, unitKerja));
  }

  async getAktif() {
    return db
      .select()
      .from(dataPejabat)
      .where(eq(dataPejabat.status, 'Aktif' as any));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SBK SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class SbkService {
  async getAll() {
    return db.select().from(standarBiayaKeluaran).orderBy(standarBiayaKeluaran.kode);
  }

  async getById(id: number) {
    const result = await db
      .select()
      .from(standarBiayaKeluaran)
      .where(eq(standarBiayaKeluaran.id, id))
      .limit(1);
    return result[0] || null;
  }

  async getByKode(kode: string) {
    const result = await db
      .select()
      .from(standarBiayaKeluaran)
      .where(eq(standarBiayaKeluaran.kode, kode))
      .limit(1);
    return result[0] || null;
  }

  async getAktif() {
    return db
      .select()
      .from(standarBiayaKeluaran)
      .where(eq(standarBiayaKeluaran.status, 'Aktif' as any));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// OPD SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class OpdService {
  async getAll(tahunAnggaran?: number) {
    if (tahunAnggaran) {
      return db
        .select()
        .from(dataOpd)
        .where(eq(dataOpd.tahunAnggaran, tahunAnggaran))
        .orderBy(dataOpd.namaOpd);
    }
    return db.select().from(dataOpd).orderBy(dataOpd.namaOpd);
  }

  async getById(id: number) {
    const result = await db
      .select()
      .from(dataOpd)
      .where(eq(dataOpd.id, id))
      .limit(1);
    return result[0] || null;
  }

  async getByKode(kode: string) {
    const result = await db
      .select()
      .from(dataOpd)
      .where(eq(dataOpd.kodeOpd, kode))
      .limit(1);
    return result[0] || null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VISI & MISI PPATK SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class VisiMisiService {
  async getVisiMisi() {
    const result = await db.select().from(refVisiMisi).limit(1);
    return result[0] || null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIT KERJA SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class UnitKerjaService {
  async getAll() {
    return db.select().from(refUnitKerja).orderBy(refUnitKerja.nama);
  }

  async getBySingkatan(singkatan: string) {
    const result = await db
      .select()
      .from(refUnitKerja)
      .where(eq(refUnitKerja.singkatan, singkatan))
      .limit(1);
    return result[0] || null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SATKER SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class SatkerService {
  async getAll() {
    return db.select().from(refSatker).orderBy(refSatker.kode);
  }

  async getByKode(kode: string) {
    const result = await db
      .select()
      .from(refSatker)
      .where(eq(refSatker.kode, kode))
      .limit(1);
    return result[0] || null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INFORMASI KINERJA SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class InformasiKinerjaService {
  async getAll(unitKerja?: string) {
    if (unitKerja) {
      return db
        .select()
        .from(refInformasiKinerja)
        .where(eq(refInformasiKinerja.unitKerja, unitKerja))
        .orderBy(refInformasiKinerja.id);
    }
    return db.select().from(refInformasiKinerja).orderBy(refInformasiKinerja.id);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SASARAN KINERJA (RENJA ALL) SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class SasaranKinerjaService {
  async getAll(program?: string, type?: string) {
    const conditions = [];
    if (program && program !== 'Semua') {
      conditions.push(like(refSasaranKinerja.program, `%${program}%`));
    }
    if (type && type !== 'Semua') {
      conditions.push(eq(refSasaranKinerja.type, type));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(refSasaranKinerja)
        .where(conditions[0])
        .orderBy(refSasaranKinerja.id);
    }
    return db.select().from(refSasaranKinerja).orderBy(refSasaranKinerja.id);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STANDAR BIAYA MASUKAN (SBM) SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export interface GetSbmParams {
  search?: string;
  kodeTabel?: string;
  lampiran?: string;
  page?: number;
  limit?: number;
}

export class SbmService {
  async getAll(params: GetSbmParams = {}): Promise<PaginatedResult<typeof standarBiayaMasukan.$inferSelect>> {
    const { search, kodeTabel, lampiran, page = 1, limit = 50 } = params;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(standarBiayaMasukan.uraian, `%${search}%`),
          like(standarBiayaMasukan.jenisTabel, `%${search}%`),
          like(standarBiayaMasukan.kodeTabel, `%${search}%`)
        )
      );
    }
    if (kodeTabel) {
      conditions.push(eq(standarBiayaMasukan.kodeTabel, kodeTabel));
    }
    if (lampiran) {
      conditions.push(eq(standarBiayaMasukan.lampiran, lampiran));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await db
      .select({ total: count() })
      .from(standarBiayaMasukan)
      .where(whereClause);

    const data = await db
      .select()
      .from(standarBiayaMasukan)
      .where(whereClause)
      .orderBy(standarBiayaMasukan.id)
      .limit(limit)
      .offset(offset);

    return {
      data,
      total: total || 0,
      page,
      limit,
      totalPages: Math.ceil((total || 0) / limit),
    };
  }

  async getById(id: number) {
    const result = await db
      .select()
      .from(standarBiayaMasukan)
      .where(eq(standarBiayaMasukan.id, id))
      .limit(1);
    return result[0] || null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SERIES ANGGARAN SERVICE (2020-2025)
// ═══════════════════════════════════════════════════════════════════════════

export interface GetSeriesAnggaranParams {
  tahun?: number;
  program?: string;
  kegiatan?: string;
  akun2?: string;
  akun6?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class SeriesAnggaranService {
  async getAll(params: GetSeriesAnggaranParams = {}) {
    const { tahun, program, kegiatan, akun2, akun6, search, page = 1, limit = 100 } = params;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (tahun) {
      conditions.push(eq(seriesAnggaran.tahun, tahun));
    }
    if (program) {
      conditions.push(like(seriesAnggaran.program, `%${program}%`));
    }
    if (kegiatan) {
      conditions.push(like(seriesAnggaran.kegiatan, `%${kegiatan}%`));
    }
    if (akun2) {
      conditions.push(like(seriesAnggaran.akun2, `%${akun2}%`));
    }
    if (akun6) {
      conditions.push(like(seriesAnggaran.akun6, `%${akun6}%`));
    }
    if (search) {
      conditions.push(
        or(
          like(seriesAnggaran.program, `%${search}%`),
          like(seriesAnggaran.kegiatan, `%${search}%`),
          like(seriesAnggaran.kro, `%${search}%`),
          like(seriesAnggaran.ro, `%${search}%`),
          like(seriesAnggaran.komponen, `%${search}%`),
          like(seriesAnggaran.akun6, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(seriesAnggaran)
      .where(whereClause);

    const data = await db
      .select()
      .from(seriesAnggaran)
      .where(whereClause)
      .orderBy(desc(seriesAnggaran.tahun), asc(seriesAnggaran.id))
      .limit(limit)
      .offset(offset);

    return {
      data,
      total: totalResult?.count || 0,
      page,
      limit,
      totalPages: Math.ceil((totalResult?.count || 0) / limit),
    };
  }

  async getSummary() {
    const summary = await db
      .select({
        tahun: seriesAnggaran.tahun,
        totalRows: count(),
        totalPagu: sql<number>`COALESCE(SUM(${seriesAnggaran.pagu}), 0)`,
        totalBlokir: sql<number>`COALESCE(SUM(${seriesAnggaran.blokir}), 0)`,
        totalRealisasi: sql<number>`COALESCE(SUM(${seriesAnggaran.realisasi}), 0)`,
      })
      .from(seriesAnggaran)
      .groupBy(seriesAnggaran.tahun)
      .orderBy(asc(seriesAnggaran.tahun));

    return summary;
  }
}

// Export singleton instances
export const baganAkunService = new BaganAkunService();
export const pejabatService = new PejabatService();
export const sbkService = new SbkService();
export const opdService = new OpdService();
export const visiMisiService = new VisiMisiService();
export const unitKerjaService = new UnitKerjaService();
export const satkerService = new SatkerService();
export const informasiKinerjaService = new InformasiKinerjaService();
export const sasaranKinerjaService = new SasaranKinerjaService();
export const sbmService = new SbmService();
export const seriesAnggaranService = new SeriesAnggaranService();
