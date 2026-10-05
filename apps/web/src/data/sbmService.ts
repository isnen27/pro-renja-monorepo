// src/data/sbmService.ts
// Service pemroses data SBM & Database Referensi

export interface SbmDatabaseItem {
  id: number;
  kode_tabel: string;
  halaman: string;
  kategori: string;
  uraian: string;
  provinsi_kota: string;
  satuan: string;
  besaran: number | null;
  keterangan: string | null;
  raw_data: string;
}

let cachedItems: SbmDatabaseItem[] | null = null;

/**
 * Mengambil semua data SBM dari database JSON secara asynchronous.
 * Menghindari pembebanan ukuran bundle awal web.
 */
export async function getSbmDatabaseItems(): Promise<SbmDatabaseItem[]> {
  if (cachedItems) return cachedItems;

  try {
    const data = await import("./sbmData.json");
    cachedItems = (data.default || data) as unknown as SbmDatabaseItem[];
    return cachedItems;
  } catch (err) {
    console.error("Gagal memuat sbmData.json:", err);
    return [];
  }
}

/**
 * Mencari data SBM berdasarkan kata kunci pencarian.
 */
export async function searchSbmData(query: string): Promise<SbmDatabaseItem[]> {
  const items = await getSbmDatabaseItems();
  if (!query || query.trim() === "") return items;

  const q = query.toLowerCase().trim();
  return items.filter((item) =>
    item.uraian.toLowerCase().includes(q) ||
    item.kode_tabel.toLowerCase().includes(q) ||
    item.kategori.toLowerCase().includes(q) ||
    item.raw_data.toLowerCase().includes(q)
  );
}

/**
 * Mengambil data SBM berdasarkan kode tabel (misal: 'T01_P004', 'T82_P098')
 */
export async function getSbmByTableCode(kodeTabel: string): Promise<SbmDatabaseItem[]> {
  const items = await getSbmDatabaseItems();
  return items.filter(
    (item) => item.kode_tabel.toLowerCase() === kodeTabel.toLowerCase()
  );
}
