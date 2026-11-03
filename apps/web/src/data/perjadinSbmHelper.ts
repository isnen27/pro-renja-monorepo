// Helper lookup tarif Standar Biaya Masukan (SBM) untuk Perjalanan Dinas Domestik, LN, dan Konsinyering
import sbmData from "./sbmData.json";

export const KURS_USD_ASUMSI_MAKRO = 17500;

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
    .replace(/SUMATERA/g, "SUMATRA")
    .replace(/D\.?K\.?I\.?\s*/g, "")
    .replace(/D\.?I\.?\s*/g, "")
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

// Format tampilan Header 1: membersihkan kode numerik wilayah di awal tapi menjaga spasi antar kata
export function formatDisplayProv(p: string): string {
  if (!p) return "";
  return p
    .replace(/^[\d\.\s\-]+/, "")
    .replace(/^[a-z]\.?\s+/i, "")
    .trim()
    .toUpperCase();
}

// Format tampilan Header 2: membersihkan kode numerik wilayah di awal tapi menjaga nama kota lengkap
export function formatDisplayKota(k: string): string {
  if (!k) return "";
  return k
    .replace(/^[\d\.\s\-]+/, "")
    .replace(/^[a-z]\.?\s+/i, "")
    .trim()
    .toUpperCase();
}

// Membersihkan uraian Header untuk perbandingan duplikasi atau pengurutan (menghilangkan prefiks penomoran seperti "1. ", "1a. ", "> ")
export function cleanHeaderUraian(uraian: string): string {
  if (!uraian) return "";
  let s = uraian.trim();
  if (s.startsWith(">")) s = s.replace(/^>+\s*/, "");
  s = s.replace(/^\d+[a-z]?[\.\s\-]+/i, "");
  s = s.replace(/^[\d\s]+/, "");
  return s.trim().toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PERJALANAN DINAS DOMESTIK (AKUN 524111)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// 2. PERJALANAN DINAS LUAR NEGERI (AKUN 524211)
// ─────────────────────────────────────────────────────────────────────────────
export interface TarifPerjadinLNResult {
  tiketBisnisUSD: number;
  tiketEkonomiUSD: number;
  tiketBisnisIDR: number;       // 1a, 1b: Tiket Pesawat Eselon I & II
  tiketEkonomiIDR: number;      // 1c, 1d: Tiket Pesawat Eselon III & Gol III
  taksiJakarta: number;         // 1e: 250000
  uangHarianGolA_IDR: number;   // 1f
  uangHarianGolB_IDR: number;   // 1g
  uangHarianGolC_IDR: number;   // 1h
  uangHarianGolD_IDR: number;   // 1i
  uangHarianPerjadinGolA_IDR: number; // 1j: 30% * Gol A * Kurs
  uangHarianPerjadinGolB_IDR: number; // 1k: 30% * Gol B * Kurs
  uangHarianPerjadinGolC_IDR: number; // 1l: 30% * Gol C * Kurs
  uangHarianPerjadinGolD_IDR: number; // 1m: 30% * Gol D * Kurs
}

export interface OptionDestinasiLN {
  key: string;       // e.g. "JAKARTA - AMERIKA UTARA - Chicago"
  benua: string;     // e.g. "AMERIKA UTARA"
  negara: string;    // e.g. "Amerika Serikat"
  kota: string;      // e.g. "Chicago"
  label: string;     // e.g. "AMERIKA UTARA-Amerika Serikat - Chicago"
}

export const KOTA_TO_NEGARA_LN: Record<string, string> = {
  Chicago: "Amerika Serikat",
  Houston: "Amerika Serikat",
  "Los Angeles": "Amerika Serikat",
  "New York": "Amerika Serikat",
  Ottawa: "Kanada",
  "San Fransisco": "Amerika Serikat",
  Toronto: "Kanada",
  Vancouver: "Kanada",
  Washington: "Amerika Serikat",
  Bogota: "Kolombia",
  Brasilia: "Brasil",
  "Boenos Aires": "Argentina",
  Caracas: "Venezuela",
  Paramaribo: "Suriname",
  "Santiago de Chile": "Chili",
  Quito: "Ekuador",
  Lima: "Peru",
  Meksiko: "Meksiko",
  Havana: "Kuba",
  Panama: "Panama",
  Vienna: "Austria",
  Brussel: "Belgia",
  Marseille: "Perancis",
  Paris: "Perancis",
  Berlin: "Jerman",
  Bern: "Swiss",
  Bonn: "Jerman",
  Hamburg: "Jerman",
  Geneva: "Swiss",
  Amsterdam: "Belanda",
  "Den Haag": "Belanda",
  Frankfurt: "Jerman",
  Kopenhagen: "Denmark",
  Helsinki: "Finlandia",
  Stockholm: "Swedia",
  London: "Inggris",
  Oslo: "Norwegia",
  Sarajevo: "Bosnia dan Herzegovina",
  Zagreb: "Kroasia",
  Athens: "Yunani",
  Lisbon: "Portugal",
  Madrid: "Spanyol",
  Roma: "Italia",
  Beograd: "Serbia",
  Vatikan: "Italia",
  Bratislava: "Slovakia",
  Bucharest: "Rumania",
  Kiev: "Ukraina",
  Moskow: "Rusia",
  Praha: "Ceko",
  Sofia: "Bulgaria",
  Warsawa: "Polandia",
  Budapest: "Hongaria",
  Dakkar: "Senegal",
  Abuja: "Nigeria",
  Yaounde: "Kamerun",
  "Addis Ababa": "Etiopia",
  Nairobi: "Kenya",
  Antananarivo: "Madagaskar",
  "Dar Es Salaam": "Tanzania",
  Harare: "Zimbabwe",
  Windhoek: "Namibia",
  "Cape Town": "Afrika Selatan",
  Johannesburg: "Afrika Selatan",
  Maputo: "Mozambik",
  Pretoria: "Afrika Selatan",
  Algiers: "Aljazair",
  Kairo: "Mesir",
  Khartoum: "Sudan",
  Rabbat: "Maroko",
  Tripoli: "Libya",
  Tunisia: "Tunisia",
  Manama: "Bahrain",
  Baghdad: "Irak",
  Amman: "Yordania",
  Kuwait: "Kuwait",
  Beirut: "Libanon",
  Doha: "Qatar",
  Damaskus: "Suriah",
  Ankara: "Turki",
  "Abu Dhabi": "Uni Emirat Arab",
  Sanaa: "Yaman",
  Jeddah: "Saudi Arabia",
  Muscat: "Oman",
  Riyadh: "Saudi Arabia",
  Istanbul: "Turki",
  Dubai: "Uni Emirat Arab",
  Tashkent: "Uzbekistan",
  Astana: "Kazakhstan",
  Baku: "Azerbaijan",
  Beijing: "Republik Rakyat Tiongkok",
  Hongkong: "Hongkong",
  Osaka: "Jepang",
  Tokyo: "Jepang",
  Pyongyang: "Korea Utara",
  Seoul: "Korea Selatan",
  Shanghai: "Republik Rakyat Tiongkok",
  Guangzhou: "Republik Rakyat Tiongkok",
  Kabul: "Afganistan",
  Teheran: "Iran",
  Kolombo: "Srilanka",
  Dhaka: "Bangladesh",
  Islamabad: "Pakistan",
  Karachi: "Pakistan",
  "New Delhi": "India",
  Mumbai: "India",
  "Bandar Seri Bagawan": "Brunei Darussalam",
  Bangkok: "Thailand",
  "Davao City": "Filipina",
  Dilli: "Timor Leste",
  Hanoi: "Vietnam",
  "Ho Chi Minh": "Vietnam",
  "Johor Bahru": "Malaysia",
  "Kota Kinabalu": "Malaysia",
  "Kuala Lumpur": "Malaysia",
  Kuching: "Malaysia",
  Manila: "Filipina",
  Penang: "Malaysia",
  "Phnom Penh": "Kamboja",
  Singapura: "Singapura",
  Vientiane: "Laos",
  Yangon: "Myanmar",
  Tawau: "Malaysia",
  Songkhla: "Thailand",
  Canberra: "Australia",
  Darwin: "Australia",
  Melbourne: "Australia",
  Noumea: "Kaledonia Baru",
  Perth: "Australia",
  "Port Moresby": "Papua Nugini",
  Suva: "Fiji",
  Sydney: "Australia",
  Vanimo: "Papua Nugini",
  Wellington: "Selandia Baru"
};

// Ambil daftar opsi destinasi LN dari tabel SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS LUAR NEGERI PERGI PULANG (PP) bagian EKONOMI
export function getDaftarDestinasiLN(): OptionDestinasiLN[] {
  const tPP = (sbmData as any[]).filter(
    (x) =>
      x.jenisTabel === "SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS LUAR NEGERI PERGI PULANG (PP)" &&
      x.spesifikasi === "EKONOMI"
  );

  return tPP.map((x) => {
    const parts = (x.uraian || "").replace(/^JAKARTA\s*-\s*/i, "").split(" - ");
    const benua = parts[0]?.trim() || "";
    const kota = parts[1]?.trim() || "";
    const negara = KOTA_TO_NEGARA_LN[kota] || "";
    const label = `${benua}-${negara} - ${kota}`;
    return {
      key: x.uraian,
      benua,
      negara,
      kota,
      label,
    };
  });
}

export function getTarifPerjadinLN(destinasiKeyOrKota: string, kurs = KURS_USD_ASUMSI_MAKRO): TarifPerjadinLNResult {
  const tiketItems = (sbmData as any[]).filter(
    (x) => x.jenisTabel === "SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS LUAR NEGERI PERGI PULANG (PP)"
  );

  // Cari tiket yang cocok dengan key atau nama kota
  let matchTiket = tiketItems.filter(
    (x) => x.uraian === destinasiKeyOrKota || x.uraian.toUpperCase().includes(destinasiKeyOrKota.toUpperCase())
  );
  if (matchTiket.length === 0) {
    // default Chicago
    matchTiket = tiketItems.filter((x) => x.uraian.includes("Chicago"));
  }

  const tiketBisnisUSD = matchTiket.find((x) => x.spesifikasi === "BISNIS")?.besaran || 6891;
  const tiketEkonomiUSD = matchTiket.find((x) => x.spesifikasi === "EKONOMI")?.besaran || 3662;

  const tiketBisnisIDR = Math.round(tiketBisnisUSD * kurs);
  const tiketEkonomiIDR = Math.round(tiketEkonomiUSD * kurs);
  const taksiJakarta = 250000;

  // Uang Harian LN
  const sampleMatch = matchTiket[0];
  const parts = (sampleMatch?.uraian || "").replace(/^JAKARTA\s*-\s*/i, "").split(" - ");
  const kota = parts[1]?.trim() || "";
  const negara = KOTA_TO_NEGARA_LN[kota] || "Amerika Serikat";

  const uhItems = (sbmData as any[]).filter(
    (x) => x.jenisTabel === "SATUAN BIAYA UANG HARIAN PERJALANAN DINAS LUAR NEGERI (dalam US$)"
  );
  const matchUH = uhItems.filter((x) => (x.uraian || "").toLowerCase().includes(negara.toLowerCase()));

  const uhGolA_USD = matchUH.find((x) => x.spesifikasi === "GOLONGAN A")?.besaran || 659;
  const uhGolB_USD = matchUH.find((x) => x.spesifikasi === "GOLONGAN B")?.besaran || 563;
  const uhGolC_USD = matchUH.find((x) => x.spesifikasi === "GOLONGAN C")?.besaran || 505;
  const uhGolD_USD = matchUH.find((x) => x.spesifikasi === "GOLONGAN D")?.besaran || 447;

  const uangHarianGolA_IDR = Math.round(uhGolA_USD * kurs);
  const uangHarianGolB_IDR = Math.round(uhGolB_USD * kurs);
  const uangHarianGolC_IDR = Math.round(uhGolC_USD * kurs);
  const uangHarianGolD_IDR = Math.round(uhGolD_USD * kurs);

  // Uang Harian Perjalanan: 30% * Golongan * Kurs
  const uangHarianPerjadinGolA_IDR = Math.round(0.3 * uhGolA_USD * kurs);
  const uangHarianPerjadinGolB_IDR = Math.round(0.3 * uhGolB_USD * kurs);
  const uangHarianPerjadinGolC_IDR = Math.round(0.3 * uhGolC_USD * kurs);
  const uangHarianPerjadinGolD_IDR = Math.round(0.3 * uhGolD_USD * kurs);

  return {
    tiketBisnisUSD,
    tiketEkonomiUSD,
    tiketBisnisIDR,
    tiketEkonomiIDR,
    taksiJakarta,
    uangHarianGolA_IDR,
    uangHarianGolB_IDR,
    uangHarianGolC_IDR,
    uangHarianGolD_IDR,
    uangHarianPerjadinGolA_IDR,
    uangHarianPerjadinGolB_IDR,
    uangHarianPerjadinGolC_IDR,
    uangHarianPerjadinGolD_IDR,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PENYELENGGARAAN KONSINYERING DALAM KOTA (AKUN 524114)
// ─────────────────────────────────────────────────────────────────────────────
export interface TarifKonsinyeringDalamKotaResult {
  transportLokal: number; // 1a: 170000 (OK)
  fullboardMenteri: number; // 1b: 2257000 (OP)
  fullboardEselonI_II: number; // 1c: 1347000 (OP)
  fullboardEselonIII: number; // 1d: 1197000 (OP)
  fulldayMenteri: number; // 1e: 993000 (OP)
  fulldayEselonI_II: number; // 1f: 667000 (OP)
  fulldayEselonIII: number; // 1g: 455000 (OP)
  uangHarianFullboard: number; // 1h: 130000 (OH)
}

export function getTarifKonsinyeringDalamKota(): TarifKonsinyeringDalamKotaResult {
  return {
    transportLokal: 170000,
    fullboardMenteri: 2257000,
    fullboardEselonI_II: 1347000,
    fullboardEselonIII: 1197000,
    fulldayMenteri: 993000,
    fulldayEselonI_II: 667000,
    fulldayEselonIII: 455000,
    uangHarianFullboard: 130000,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PENYELENGGARAAN KONSINYERING LUAR KOTA (AKUN 524119)
// ─────────────────────────────────────────────────────────────────────────────
export interface TarifKonsinyeringLuarKotaResult {
  tiketBisnis: number; // 1a: Tiket Pesawat Eselon I (OK)
  tiketEkonomi: number; // 1b: Tiket Pesawat Eselon II ke Bawah (OK)
  taksiJakarta: number; // 1c: 250000 (OK)
  taksiTujuan: number; // 1d: Taksi Tujuan (OK)
  penginapanEselonI: number; // 1e: (OH)
  penginapanEselonII: number; // 1f: (OH)
  penginapanEselonIII: number; // 1g: (OH)
  penginapanGolIII: number; // 1h: (OH)
  fullboardMenteri: number; // 1i: (OP)
  fullboardEselonI_II: number; // 1j: (OP)
  fullboardEselonIII: number; // 1k: (OP)
  fulldayMenteri: number; // 1l: (OP)
  fulldayEselonI_II: number; // 1m: (OP)
  fulldayEselonIII: number; // 1n: (OP)
  uangHarianFullboard: number; // 1o: 130000 (OH)
  uangHarianLuarKota: number; // 1p: (OH)
}

export function getTarifKonsinyeringLuarKota(provinsiRaw: string): TarifKonsinyeringLuarKotaResult {
  const cleanProv = cleanProvName(provinsiRaw);

  // Ambil data dasar perjadin biasa (Tiket, Taksi, Penginapan, Uang Harian)
  const dasar = getTarifPerjadinBiasa(provinsiRaw, provinsiRaw);

  // Rapat di Luar Kantor untuk provinsi tujuan
  const rapatItems = (sbmData as any[]).filter((x) =>
    (x.jenisTabel || "").includes("SATUAN BIAYA RAPAT/PERTEMUAN DI LUAR KANTOR")
  );
  const provRapat = rapatItems.filter(
    (x) => cleanProvName(x.uraian).includes(cleanProv) || cleanProv.includes(cleanProvName(x.uraian))
  );

  const fullboardMenteri =
    provRapat.find((x) => (x.uraian || "").includes("Menteri") && (x.spesifikasi === "FULLBOARD"))?.besaran || 1871000;
  const fullboardEselonI_II =
    provRapat.find(
      (x) => ((x.uraian || "").includes("Eselon I dan II") || (x.uraian || "").includes("Fungsional Utama")) &&
        x.spesifikasi === "FULLBOARD"
    )?.besaran || 1151000;
  const fullboardEselonIII =
    provRapat.find(
      (x) => ((x.uraian || "").includes("Eselon III") || (x.uraian || "").includes("Fungsional Madya")) &&
        x.spesifikasi === "FULLBOARD"
    )?.besaran || 992000;

  const fulldayMenteri =
    provRapat.find((x) => (x.uraian || "").includes("Menteri") && (x.spesifikasi === "FULLDAY"))?.besaran || 663000;
  const fulldayEselonI_II =
    provRapat.find(
      (x) => ((x.uraian || "").includes("Eselon I dan II") || (x.uraian || "").includes("Fungsional Utama")) &&
        x.spesifikasi === "FULLDAY"
    )?.besaran || 575000;
  const fulldayEselonIII =
    provRapat.find(
      (x) => ((x.uraian || "").includes("Eselon III") || (x.uraian || "").includes("Fungsional Madya")) &&
        x.spesifikasi === "FULLDAY"
    )?.besaran || 425000;

  return {
    tiketBisnis: dasar.tiketBisnis || 7519000,
    tiketEkonomi: dasar.tiketEkonomi || 4807000,
    taksiJakarta: dasar.taksiJakarta || 250000,
    taksiTujuan: dasar.taksiTujuan || 123000,
    penginapanEselonI: dasar.penginapanEselonI || 5109000,
    penginapanEselonII: dasar.penginapanEselonII || 3526000,
    penginapanEselonIII: dasar.penginapanEselonIII || 1578000,
    penginapanGolIII: dasar.penginapanGolIII || 770000,
    fullboardMenteri,
    fullboardEselonI_II,
    fullboardEselonIII,
    fulldayMenteri,
    fulldayEselonI_II,
    fulldayEselonIII,
    uangHarianFullboard: 130000,
    uangHarianLuarKota: dasar.uangHarian || 360000,
  };
}
