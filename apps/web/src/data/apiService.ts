// src/data/apiService.ts
// API Service for fetching reference data from PostgreSQL Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AkunBelanja {
  id: number;
  no: number;
  kelompokBelanja: string;
  kodeAkun3Digit: string;
  namaAkun3Digit: string;
  kodeAkun6Digit: string;
  uraianAkun: string;
  penggunaanSingkat: string;
  kelompokBarangJasa: string | null;
  kategori: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pejabat {
  id: number;
  kodePejabat: string;
  nama: string;
  nip: string;
  jabatan: string;
  pangkat: string | null;
  unitKerja: string;
  email: string | null;
  roleTtd: string[] | null;
  status: string;
}

export interface Sbk {
  id: number;
  kode: string;
  nama: string;
  satuan: string;
  paguMaks: number;
  dasarHukum: string | null;
  keterangan: string | null;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BAGAN AKUN STANDAR (BAS) ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  async getAkun(params?: {
    search?: string;
    kategori?: string;
    kode3digit?: string;
    page?: number;
    limit?: number;
    sortBy?: 'kode' | 'uraian' | 'no';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<AkunBelanja[]>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.kategori) searchParams.set('kategori', params.kategori);
    if (params?.kode3digit) searchParams.set('kode3digit', params.kode3digit);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    return this.fetch<ApiResponse<AkunBelanja[]>>(`/api/referensi/akun${query ? `?${query}` : ''}`);
  }

  async getAkunByKode(kode: string): Promise<ApiResponse<AkunBelanja | null>> {
    return this.fetch<ApiResponse<AkunBelanja | null>>(`/api/referensi/akun/${kode}`);
  }

  async getKategoriList(): Promise<ApiResponse<string[]>> {
    return this.fetch<ApiResponse<string[]>>('/api/referensi/akun/kategori/list');
  }

  async getAkunSummary(): Promise<ApiResponse<{ totalAkun: number; byKategori: { kategori: string; count: number }[] }>> {
    return this.fetch<ApiResponse<{ totalAkun: number; byKategori: { kategori: string; count: number }[] }>>('/api/referensi/akun/summary');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PEJABAT ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  async getPejabat(): Promise<ApiResponse<Pejabat[]>> {
    return this.fetch<ApiResponse<Pejabat[]>>('/api/referensi/pejabat');
  }

  async getPejabatAktif(): Promise<ApiResponse<Pejabat[]>> {
    return this.fetch<ApiResponse<Pejabat[]>>('/api/referensi/pejabat/aktif');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SBK ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  async getSbk(): Promise<ApiResponse<Sbk[]>> {
    return this.fetch<ApiResponse<Sbk[]>>('/api/referensi/sbk');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HEALTH CHECK
  // ═══════════════════════════════════════════════════════════════════════════

  async healthCheck(): Promise<ApiResponse<{ timestamp: string; database: string }>> {
    return this.fetch<ApiResponse<{ timestamp: string; database: string }>>('/api/referensi/health');
  }
}

// Export singleton instance
export const apiService = new ApiService(API_BASE_URL);
