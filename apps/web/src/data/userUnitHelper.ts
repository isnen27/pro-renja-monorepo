import unitKerjaData from "./unitKerjaData.json";
import { getActiveUserUnitKerja } from "./userManagementData";

export { getActiveUserUnitKerja };

/**
 * Memeriksa apakah role saat ini memiliki akses istimewa untuk melihat seluruh unit kerja.
 * Role yang dapat melihat semua unit: BINCANG, PEKA, Super Admin.
 * Role Operator dan Approver (kecuali BINCANG/PEKA) hanya melihat unit kerjanya sendiri.
 */
export function isPrivilegedRole(role?: string | null): boolean {
  if (!role) {
    try {
      role = localStorage.getItem("renja_e2_user_role") || "Operator";
    } catch {
      role = "Operator";
    }
  }
  const roleUpper = (role || "").toUpperCase();
  return (
    roleUpper.includes("BINCANG") ||
    roleUpper.includes("PEKA") ||
    roleUpper.includes("SUPER ADMIN")
  );
}

/**
 * Mengambil nama Unit Kerja resmi user yang sedang login (Eselon II).
 */
export function getUserPersonalizedUnit(): string {
  return getActiveUserUnitKerja();
}

/**
 * Mengambil Unit Kerja Eselon I pengampu berdasarkan Unit Kerja Eselon II user.
 */
export function getUserPersonalizedEselon1Unit(userE2Nama?: string): string {
  const e2Nama = userE2Nama || getUserPersonalizedUnit();
  const e2Lower = e2Nama.toLowerCase();

  const found = unitKerjaData.find(
    (u) =>
      e2Lower.includes(u.nama.toLowerCase()) ||
      u.nama.toLowerCase().includes(e2Lower) ||
      e2Lower.includes(u.singkatan.toLowerCase())
  );

  if (!found) {
    if (e2Lower.includes("tegas") || e2Lower.includes("hukum") || e2Lower.includes("strategi")) return "Deputi TEGAS";
    if (e2Lower.includes("pengasuh") || e2Lower.includes("lapor") || e2Lower.includes("patuh")) return "Deputi PENGASUH";
    if (e2Lower.includes("asa") || e2Lower.includes("analisis") || e2Lower.includes("pemeriksaan")) return "Deputi ASA";
    return "Sekretariat Utama";
  }

  const sub = found.subcluster || "";
  const cl = found.cluster || "";

  if (sub.includes("TEGAS") || cl.includes("TEGAS")) return "Deputi TEGAS";
  if (sub.includes("PENGASUH") || cl.includes("PENGASUH")) return "Deputi PENGASUH";
  if (sub.includes("ASA") || cl.includes("ASA")) return "Deputi ASA";
  return "Sekretariat Utama";
}

function normalizeUnitString(str: string): string {
  return (str || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")
    .replace(/antipencucianuangdanpencegahanpendanaanterorisme/g, "apuppt")
    .replace(/antipencucianuang/g, "apu")
    .replace(/pencegahanpendanaanterorisme/g, "ppt");
}

/**
 * Mencocokkan apakah suatu nama unit pada data sesuai dengan unit kerja pengguna.
 */
export function matchesUserUnitKerja(itemUnit: string, targetUserUnit?: string): boolean {
  const userUnit = (targetUserUnit || getUserPersonalizedUnit()).toLowerCase().trim();
  const item = (itemUnit || "").toLowerCase().trim();

  if (!userUnit || !item) return false;
  if (userUnit === item) return true;

  // Pencocokan substring langsung
  if (userUnit.includes(item) || item.includes(userUnit)) return true;

  // Pencocokan setelah normalisasi (misal APU PPT vs Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme)
  const normUser = normalizeUnitString(userUnit);
  const normItem = normalizeUnitString(item);
  if (normUser === normItem || normUser.includes(normItem) || normItem.includes(normUser)) {
    return true;
  }

  // Pencocokan via singkatan unitKerjaData
  const userUnitObj = unitKerjaData.find(
    (u) =>
      userUnit.includes(u.nama.toLowerCase()) ||
      u.nama.toLowerCase().includes(userUnit) ||
      userUnit.includes(u.singkatan.toLowerCase()) ||
      normalizeUnitString(u.nama) === normUser ||
      normalizeUnitString(u.nama).includes(normUser) ||
      normUser.includes(normalizeUnitString(u.nama))
  );
  const itemUnitObj = unitKerjaData.find(
    (u) =>
      item.includes(u.nama.toLowerCase()) ||
      u.nama.toLowerCase().includes(item) ||
      item.includes(u.singkatan.toLowerCase()) ||
      normalizeUnitString(u.nama) === normItem ||
      normalizeUnitString(u.nama).includes(normItem) ||
      normItem.includes(normalizeUnitString(u.nama))
  );

  if (userUnitObj && itemUnitObj) {
    return userUnitObj.singkatan === itemUnitObj.singkatan;
  }

  // Jika item adalah singkatan atau nama unit
  if (userUnitObj && (item.includes(userUnitObj.singkatan.toLowerCase()) || userUnitObj.nama.toLowerCase().includes(item))) {
    return true;
  }
  if (itemUnitObj && (userUnit.includes(itemUnitObj.singkatan.toLowerCase()) || itemUnitObj.nama.toLowerCase().includes(userUnit))) {
    return true;
  }

  return false;
}
