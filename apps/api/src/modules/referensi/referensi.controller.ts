// src/modules/referensi/referensi.controller.ts
// REST API Controller for Referensi (Reference Data) Module

import { Controller, Get, Param, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { baganAkunService, pejabatService, sbkService, opdService } from './referensi.service.js';

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
