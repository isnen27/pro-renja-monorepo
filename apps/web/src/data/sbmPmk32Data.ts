// src/data/sbmPmk32Data.ts
// Data Standar Biaya Masukan (SBM) TA 2026 berdasarkan PMK Nomor 32 Tahun 2025

import rawSbmData from "./sbmData.json";
import rawSbmTables from "./sbmTables.json";

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

// Full 4,009 SBM items extracted from tabel SBM.xlsx (86 sheets)
export const allSbmPmk32List: SbmItem[] = rawSbmData as SbmItem[];

// Full 86 SBM Table Metadata
export const sbmTablesList: SbmTableMetadata[] = rawSbmTables as SbmTableMetadata[];

// Strictly 2 PMK Categories (Pasal 2 PMK 32/2025)
export const sbmCategoryList = [
  "Lampiran I (Batas Tertinggi)",
  "Lampiran II (Dapat Dilampaui)",
] as const;

// Backward compatibility helper exports for any legacy consumers
export const sbmPengelolaKeuangan = allSbmPmk32List.filter((i) => i.kodeTabel === "T01_P004");
export const sbmNarasumberPanitia = allSbmPmk32List.filter((i) => i.kodeTabel === "T09_P012");
export const sbmDiklat = allSbmPmk32List.filter((i) => i.kodeTabel === "T39_P038");
export const sbmKonsumsiDiklatList = allSbmPmk32List.filter((i) => i.kodeTabel === "T39_P038");
export const sbmPaketMeetingList = allSbmPmk32List.filter((i) => i.kodeTabel === "T20_P022");
export const sbmUangHarianList = allSbmPmk32List.filter((i) => i.kodeTabel === "T12_P015");
export const sbmTiketPesawatList = allSbmPmk32List.filter((i) => i.kodeTabel === "T70_P086");
export const sbmTransportasiLokal = allSbmPmk32List.filter((i) => i.kodeTabel === "T50_P069");
export const sbmUangMakanLembur = allSbmPmk32List.filter((i) => i.kodeTabel === "T23_P024");
export const sbmPemeliharaan = allSbmPmk32List.filter((i) => i.kodeTabel === "T61_P080");
export const sbmPengadaanKendaraan = allSbmPmk32List.filter((i) => i.kodeTabel === "T32_P033");
