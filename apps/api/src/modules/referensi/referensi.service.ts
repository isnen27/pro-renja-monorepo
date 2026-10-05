// src/modules/referensi/referensi.service.ts
// Service for Referensi (Reference Data) Module

import { db } from '../../database/index.js';
import { baganAkunStandar, dataPejabat, standarBiayaKeluaran, dataOpd } from '../../database/schema.js';
import { eq, like, or, desc, asc, sql, count } from 'drizzle-orm';

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

// Export singleton instances
export const baganAkunService = new BaganAkunService();
export const pejabatService = new PejabatService();
export const sbkService = new SbkService();
export const opdService = new OpdService();
