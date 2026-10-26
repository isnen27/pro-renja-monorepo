// src/data/sbmPmk32Data.ts
// Data Standar Biaya Masukan (SBM) & Standar Biaya Keluaran (SBK)
// Peraturan Rujukan: KMK Nomor 296 Tahun 2026

import rawSbmData from "./sbmData.json";
import rawSbmTables from "./sbmTables.json";
import rawSbkData from "./sbkData.json";

export interface SbmItem {
  id: string;
  kodeTabel: string;
  halaman: string;
  kategori: "Lampiran I (Batas Tertinggi)" | "Lampiran II (Dapat Dilampaui)";
  jenisTabel: string;
  subkategori?: string;
  uraian: string;
  spesifikasi?: string;
  satuan: string;
  besaran: number;
  lampiran: "Lampiran I (Batas Tertinggi)" | "Lampiran II (Dapat Dilampaui)";
  dasarHukum: string;
  kolom?: string[];
}

export interface SbmTableMetadata {
  kodeTabel: string;
  page: string;
  lampiran: "Lampiran I (Batas Tertinggi)" | "Lampiran II (Dapat Dilampaui)";
  jenisTabel: string;
  itemCount: number;
}

export interface SbkItem {
  id: string;
  kelompok: "SBKU" | "SBKK";
  kelompokNama: string;
  subKelompok?: string;
  kategori: string;
  kode: string;
  uraian: string;
  volume: number;
  satuan: string;
  besaran: number;
  dasarHukum: string;
  satker: string;
}

// ── SBM KMK Nomor 296 Tahun 2026 ──
// Total 3,466 SBM items extracted from 66 sheets (37 Batas Tertinggi + 29 Dapat Dilampaui)
export const allSbmList: SbmItem[] = rawSbmData as SbmItem[];
export const allSbmKmk296List: SbmItem[] = allSbmList;
export const allSbmPmk32List: SbmItem[] = allSbmList; // Alias for backward compatibility

// Full 66 SBM Table Metadata
export const sbmTablesList: SbmTableMetadata[] = rawSbmTables as SbmTableMetadata[];

// Two KMK 296 SBM Lampiran Categories
export const sbmCategoryList = [
  "Lampiran I (Batas Tertinggi)",
  "Lampiran II (Dapat Dilampaui)",
] as const;

// ── SBK KMK Nomor 296 Tahun 2026 (DataSBKAll.xlsx) ──
// Total 60 SBK items (57 SBKU + 3 SBKK PPATK)
export const allSbkList: SbkItem[] = rawSbkData as SbkItem[];
export const sbkuList: SbkItem[] = allSbkList.filter((s) => s.kelompok === "SBKU");
export const sbkkList: SbkItem[] = allSbkList.filter((s) => s.kelompok === "SBKK");

// Backward compatibility helper exports for any legacy consumers
export const sbmPengelolaKeuangan = allSbmList.filter((i) => i.kodeTabel === "T1_01");
export const sbmNarasumberPanitia = allSbmList.filter((i) => i.kodeTabel === "T1_08");
export const sbmDiklat = allSbmList.filter((i) => i.kodeTabel === "T1_10");
export const sbmKonsumsiDiklatList = allSbmList.filter((i) => i.kodeTabel === "T1_10");
export const sbmPaketMeetingList = allSbmList.filter((i) => i.kodeTabel === "T1_11");
export const sbmUangHarianList = allSbmList.filter((i) => i.kodeTabel === "T1_13");
export const sbmTiketPesawatList = allSbmList.filter((i) => i.kodeTabel === "T2_18");
export const sbmTransportasiLokal = allSbmList.filter((i) => i.kodeTabel === "T1_15");
export const sbmUangMakanLembur = allSbmList.filter((i) => i.kodeTabel === "T1_12");
export const sbmPemeliharaan = allSbmList.filter((i) => i.kodeTabel === "T2_14");
export const sbmPengadaanKendaraan = allSbmList.filter((i) => i.kodeTabel === "T2_13");
