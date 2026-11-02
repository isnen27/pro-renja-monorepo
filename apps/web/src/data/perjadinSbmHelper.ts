// Helper lookup tarif Standar Biaya Masukan (SBM) untuk Perjalanan Dinas Domestik (Panduan 3)
import sbmData from "./sbmData.json";

export interface TarifPerjadinBiasaResult {
  tiketBisnis: number;
  tiketEkonomi: number;
  taksiJakarta: number;
  taksiTujuan: number;
  penginapanEselonI: number;
  penginapanEselonII: number;
  penginapanEselonIII: number;
  penginapanGolIII: number;
  uangHarian: number;
  uangRepresentasiEselonI: number;
  uangRepresentasiEselonII: number;
}

export function cleanProvName(p: string): string {
  return (p || "")
    .replace(/^[\d\s]+/, "") // Hilangkan kode provinsi di awal (misal: "06 ")
    .replace(/\s+/g, "")
    .toUpperCase();
}

export function cleanKotaName(k: string): string {
  return (k || "")
    .replace(/^[\d\s]+/, "") // Hilangkan kode kab/kota di awal (misal: "06 51 ")
    .replace(/^(KAB\.|KOTA|KABUPATEN)\s+/i, "") // Hilangkan prefix KAB./KOTA
    .trim()
    .toUpperCase();
}

export function getTarifPerjadinBiasa(provinsiRaw: string, kabKotaRaw: string): TarifPerjadinBiasaResult {
  const cleanProv = cleanProvName(provinsiRaw);
  const cleanKota = cleanKotaName(kabKotaRaw);

  // 1. Tiket Pesawat dari JAKARTA ke kabKota / ibukota provinsi
  const tiketItems = (sbmData as any[]).filter(
    (x) => (x.jenisTabel || "").includes("SATUAN BIAYA TIKET PESAWAT") && (x.uraian || "").startsWith("JAKARTA - ")
  );
  
  let tiketBisnis = 0;
  let tiketEkonomi = 0;

  // Coba cari kecocokan spesifik nama kota tujuan
  let matchKota = tiketItems.filter((x) => x.uraian.toUpperCase().includes(cleanKota));
  if (matchKota.length === 0 && cleanProv) {
    // Fallback coba cari dengan nama provinsi
    matchKota = tiketItems.filter((x) => cleanProvName(x.uraian).includes(cleanProv));
  }

  if (matchKota.length > 0) {
    const b = matchKota.find((x) => x.spesifikasi === "BISNIS");
    const e = matchKota.find((x) => x.spesifikasi === "EKONOMI");
    if (b) tiketBisnis = b.besaran || 0;
    if (e) tiketEkonomi = e.besaran || 0;
  }

  // 2. Taksi Jakarta: Rp 250.000 (standar SBM keberangkatan Jakarta)
  const taksiJakarta = 250000;

  // 3. Taksi Lokasi Tujuan: SATUAN BIAYA TRANSPORTASI DARI DAN/ATAU KE TERMINAL...
  const taksiItems = (sbmData as any[]).filter((x) =>
    (x.jenisTabel || "").includes("TRANSPORTASI DARI DAN/ATAU KE TERMINAL")
  );
  const matchTaksi = taksiItems.find(
    (x) => cleanProvName(x.uraian).includes(cleanProv) || cleanProv.includes(cleanProvName(x.uraian))
  );
  const taksiTujuan = matchTaksi?.besaran || 150000;

  // 4. Penginapan: SATUAN BIAYA PENGINAPAN PERJALANAN DINAS DALAM NEGERI
  const penginapanItems = (sbmData as any[]).filter((x) =>
    (x.jenisTabel || "").includes("SATUAN BIAYA PENGINAPAN")
  );
  const provPenginapan = penginapanItems.filter(
    (x) => cleanProvName(x.uraian).includes(cleanProv) || cleanProv.includes(cleanProvName(x.uraian))
  );
  
  const penginapanEselonI = provPenginapan.find((x) => (x.spesifikasi || "").includes("ESELON I"))?.besaran || 0;
  const penginapanEselonII = provPenginapan.find((x) => (x.spesifikasi || "").includes("ESELON II"))?.besaran || 0;
  const penginapanEselonIII = provPenginapan.find((x) => (x.spesifikasi || "").includes("ESELON III"))?.besaran || 0;
  const penginapanGolIII = provPenginapan.find(
    (x) => (x.spesifikasi || "").includes("GOLONGAN III") || (x.spesifikasi || "").includes("ESELON IV")
  )?.besaran || 0;

  // 5. Uang Harian Luar Kota
  const harianItems = (sbmData as any[]).filter(
    (x) => (x.jenisTabel || "").includes("SATUAN BIAYA UANG HARIAN") && (x.spesifikasi || "").includes("LUAR KOTA")
  );
  const matchHarian = harianItems.find(
    (x) => cleanProvName(x.uraian).includes(cleanProv) || cleanProv.includes(cleanProvName(x.uraian))
  );
  const uangHarian = matchHarian?.besaran || 360000;

  // 6. Uang Representasi
  const uangRepresentasiEselonI = 200000;
  const uangRepresentasiEselonII = 150000;

  return {
    tiketBisnis,
    tiketEkonomi,
    taksiJakarta,
    taksiTujuan,
    penginapanEselonI,
    penginapanEselonII,
    penginapanEselonIII,
    penginapanGolIII,
    uangHarian,
    uangRepresentasiEselonI,
    uangRepresentasiEselonII,
  };
}
