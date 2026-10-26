// src/modules/referensi/referensi.controller.ts
// REST API Controller for Referensi (Reference Data) Module

import { Controller, Get, Param, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {
  baganAkunService,
  pejabatService,
  sbkService,
  opdService,
  visiMisiService,
  unitKerjaService,
  satkerService,
  informasiKinerjaService,
  sasaranKinerjaService,
  sbmService,
} from './referensi.service.js';

@Controller('api/referensi')
export class ReferensiController {
  // ═══════════════════════════════════════════════════════════════════════════
  // BAGAN AKUN STANDAR ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/referensi/akun
   * Get paginated list of akun belanja
   */
  @Get('akun')
  async getAkun(
    @Query('search') search?: string,
    @Query('kategori') kategori?: string,
    @Query('kode3digit') kode3Digit?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'kode' | 'uraian' | 'no',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await baganAkunService.getAkun({
      search,
      kategori,
      kode3Digit,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy,
      sortOrder,
    });

    return {
      success: true,
      message: 'Data akun belanja berhasil diambil',
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * GET /api/referensi/akun/:kode
   * Get single akun by kode 6 digit
   */
  @Get('akun/:kode')
  async getAkunByKode(@Param('kode') kode: string) {
    const result = await baganAkunService.getAkunByKode(kode);

    if (!result) {
      return {
        success: false,
        message: `Akun dengan kode ${kode} tidak ditemukan`,
        data: null,
      };
    }

    return {
      success: true,
      message: 'Data akun berhasil diambil',
      data: result,
    };
  }

  /**
   * GET /api/referensi/akun/kategori/list
   * Get list of all kategori
   */
  @Get('akun/kategori/list')
  async getKategoriList() {
    const result = await baganAkunService.getKategoriList();

    return {
      success: true,
      message: 'Daftar kategori berhasil diambil',
      data: result,
    };
  }

  /**
   * GET /api/referensi/akun/kelompok/list
   * Get akun grouped by 3-digit kode
   */
  @Get('akun/kelompok/list')
  async getAkunGroupedBy3Digit() {
    const result = await baganAkunService.getAkunGroupedBy3Digit();

    return {
      success: true,
      message: 'Daftar kelompok akun berhasil diambil',
      data: result,
    };
  }

  /**
   * GET /api/referensi/akun/summary
   * Get summary statistics
   */
  @Get('akun/summary')
  async getAkunSummary() {
    const result = await baganAkunService.getSummary();

    return {
      success: true,
      message: 'Summary berhasil diambil',
      data: result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PEJABAT ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/referensi/pejabat
   * Get all pejabat
   */
  @Get('pejabat')
  async getPejabat() {
    const result = await pejabatService.getAll();

    return {
      success: true,
      message: 'Data pejabat berhasil diambil',
      data: result,
    };
  }

  /**
   * GET /api/referensi/pejabat/:id
   * Get pejabat by ID
   */
  @Get('pejabat/:id')
  async getPejabatById(@Param('id') id: string) {
    const result = await pejabatService.getById(parseInt(id, 10));

    if (!result) {
      return {
        success: false,
        message: `Pejabat dengan ID ${id} tidak ditemukan`,
        data: null,
      };
    }

    return {
      success: true,
      message: 'Data pejabat berhasil diambil',
      data: result,
    };
  }

  /**
   * GET /api/referensi/pejabat/aktif
   * Get active pejabat only
   */
  @Get('pejabat/aktif')
  async getPejabatAktif() {
    const result = await pejabatService.getAktif();

    return {
      success: true,
      message: 'Data pejabat aktif berhasil diambil',
      data: result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SBK ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/referensi/sbk
   * Get all SBK
   */
  @Get('sbk')
  async getSbk() {
    const result = await sbkService.getAll();

    return {
      success: true,
      message: 'Data SBK berhasil diambil',
      data: result,
    };
  }

  /**
   * GET /api/referensi/sbk/:id
   * Get SBK by ID
   */
  @Get('sbk/:id')
  async getSbkById(@Param('id') id: string) {
    const result = await sbkService.getById(parseInt(id, 10));

    if (!result) {
      return {
        success: false,
        message: `SBK dengan ID ${id} tidak ditemukan`,
        data: null,
      };
    }

    return {
      success: true,
      message: 'Data SBK berhasil diambil',
      data: result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // OPD ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/referensi/opd
   * Get all OPD
   */
  @Get('opd')
  async getOpd(@Query('tahun') tahun?: string) {
    const result = await opdService.getAll(tahun ? parseInt(tahun, 10) : undefined);

    return {
      success: true,
      message: 'Data OPD berhasil diambil',
      data: result,
    };
  }

  /**
   * GET /api/referensi/opd/:id
   * Get OPD by ID
   */
  @Get('opd/:id')
  async getOpdById(@Param('id') id: string) {
    const result = await opdService.getById(parseInt(id, 10));

    if (!result) {
      return {
        success: false,
        message: `OPD dengan ID ${id} tidak ditemukan`,
        data: null,
      };
    }

    return {
      success: true,
      message: 'Data OPD berhasil diambil',
      data: result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STANDAR BIAYA MASUKAN (SBM) ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/referensi/sbm
   * Get paginated list of SBM
   */
  @Get('sbm')
  async getSbm(
    @Query('search') search?: string,
    @Query('kodeTabel') kodeTabel?: string,
    @Query('lampiran') lampiran?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await sbmService.getAll({
      search,
      kodeTabel,
      lampiran,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return {
      success: true,
      message: 'Data Standar Biaya Masukan berhasil diambil',
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * GET /api/referensi/sbm/:id
   * Get SBM by ID
   */
  @Get('sbm/:id')
  async getSbmById(@Param('id') id: string) {
    const result = await sbmService.getById(parseInt(id, 10));

    if (!result) {
      return {
        success: false,
        message: `SBM dengan ID ${id} tidak ditemukan`,
        data: null,
      };
    }

    return {
      success: true,
      message: 'Data SBM berhasil diambil',
      data: result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VISI & MISI PPATK ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/referensi/visi-misi
   * Get Visi & Misi PPATK
   */
  @Get('visi-misi')
  async getVisiMisi() {
    const result = await visiMisiService.getVisiMisi();

    return {
      success: true,
      message: 'Data Visi & Misi PPATK berhasil diambil',
      data: result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT KERJA PPATK ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/referensi/unit-kerja
   * Get list of all Unit Kerja PPATK
   */
  @Get('unit-kerja')
  async getUnitKerja() {
    const result = await unitKerjaService.getAll();

    return {
      success: true,
      message: 'Data Unit Kerja PPATK berhasil diambil',
      data: result,
    };
  }

  /**
   * GET /api/referensi/unit-kerja/:singkatan
   * Get Unit Kerja by singkatan
   */
  @Get('unit-kerja/:singkatan')
  async getUnitKerjaBySingkatan(@Param('singkatan') singkatan: string) {
    const result = await unitKerjaService.getBySingkatan(singkatan);

    if (!result) {
      return {
        success: false,
        message: `Unit kerja dengan singkatan ${singkatan} tidak ditemukan`,
        data: null,
      };
    }

    return {
      success: true,
      message: 'Data Unit Kerja berhasil diambil',
      data: result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SATUAN KERJA (SATKER) ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/referensi/satker
   * Get list of all Satker
   */
  @Get('satker')
  async getSatker() {
    const result = await satkerService.getAll();

    return {
      success: true,
      message: 'Data Satker berhasil diambil',
      data: result,
    };
  }

  /**
   * GET /api/referensi/satker/:kode
   * Get Satker by kode
   */
  @Get('satker/:kode')
  async getSatkerByKode(@Param('kode') kode: string) {
    const result = await satkerService.getByKode(kode);

    if (!result) {
      return {
        success: false,
        message: `Satker dengan kode ${kode} tidak ditemukan`,
        data: null,
      };
    }

    return {
      success: true,
      message: 'Data Satker berhasil diambil',
      data: result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INFORMASI KINERJA ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/referensi/informasi-kinerja
   * Get Informasi Kinerja (filter optional by unitKerja)
   */
  @Get('informasi-kinerja')
  async getInformasiKinerja(@Query('unitKerja') unitKerja?: string) {
    const result = await informasiKinerjaService.getAll(unitKerja);

    return {
      success: true,
      message: 'Data Informasi Kinerja berhasil diambil',
      data: result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SASARAN KINERJA (CASCADING RENJA & RENSTRA) ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/referensi/sasaran-kinerja
   * Get Sasaran Kinerja (filter optional by program, type)
   */
  @Get('sasaran-kinerja')
  async getSasaranKinerja(
    @Query('program') program?: string,
    @Query('type') type?: string,
  ) {
    const result = await sasaranKinerjaService.getAll(program, type);

    return {
      success: true,
      message: 'Data Sasaran Kinerja berhasil diambil',
      data: result,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HEALTH CHECK
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/referensi/health
   * Health check endpoint
   */
  @Get('health')
  async healthCheck() {
    return {
      success: true,
      message: 'Referensi API is healthy',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL (Drizzle ORM)',
    };
  }
}

