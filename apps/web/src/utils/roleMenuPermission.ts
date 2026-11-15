// src/utils/roleMenuPermission.ts
// Utility untuk validasi hak akses menu & submenu berdasarkan role.xlsx

import roleMatrix from "../data/roleMenuMatrixData.json";

export type OfficialRole =
  | "Operator Eselon I"
  | "Approver Eselon I"
  | "Operator Eselon II"
  | "Approver Eselon II"
  | "BINCANG"
  | "PEKA"
  | "Super Admin"
  | "Tim Perencanaan"
  | "Tim Penganggaran";

/**
 * Normalisasi role string dari localStorage atau session
 */
export function normalizeUserRole(rawRole?: string | null): string {
  if (!rawRole) return "Operator Eselon II";
  const r = rawRole.trim();
  if (r.toLowerCase() === "super admin") return "Super Admin";
  if (r.toLowerCase() === "bincang") return "BINCANG";
  if (r.toLowerCase() === "peka") return "PEKA";
  if (r.toLowerCase() === "tim perencanaan" || r.toLowerCase() === "tim penganggaran") return "BINCANG";
  if (r.toLowerCase() === "operator" || r.toLowerCase() === "operator unit") return "Operator Eselon II";
  if (r.toLowerCase() === "approver") return "Approver Eselon II";
  return r;
}

/**
 * Cek apakah suatu path/URL route diizinkan untuk role yang diberikan
 */
export function isRouteAllowedForRole(routePath: string, userRole: string): boolean {
  const normRole = normalizeUserRole(userRole);

  // Super Admin selalu memiliki akses ke seluruh menu
  if (normRole === "Super Admin") return true;

  // Bersihkan path dari query params untuk matching awal
  const cleanPath = routePath.split("?")[0];

  // Cari di matriks
  const match = (roleMatrix as any[]).find(
    (item) => item.path === routePath || item.path === cleanPath
  );

  if (!match || !match.roles) {
    // Default true jika tidak tercatat khusus di matriks
    return true;
  }

  // Cek langsung
  if (match.roles[normRole] !== undefined) {
    return Boolean(match.roles[normRole]);
  }

  // Fallback alias
  if (normRole.includes("Operator") && normRole.includes("I") && !normRole.includes("II")) {
    return Boolean(match.roles["Operator Eselon I"]);
  }
  if (normRole.includes("Approver") && normRole.includes("I") && !normRole.includes("II")) {
    return Boolean(match.roles["Approver Eselon I"]);
  }
  if (normRole.includes("Operator")) {
    return Boolean(match.roles["Operator Eselon II"]);
  }
  if (normRole.includes("Approver")) {
    return Boolean(match.roles["Approver Eselon II"]);
  }

  return true;
}

/**
 * Filter menuConfig items secara rekursif sesuai role pengguna
 */
export function filterMenuByRole(groups: any[], userRole: string): any[] {
  return groups
    .map((group) => {
      const filteredItems = group.items
        .map((item: any) => {
          // Jika item memiliki href langsung (tanpa submenu)
          if (item.href && (!item.submenu || item.submenu.length === 0)) {
            if (!isRouteAllowedForRole(item.href, userRole)) {
              return null;
            }
            return item;
          }

          // Jika item memiliki submenu
          if (item.submenu && item.submenu.length > 0) {
            const filteredSubmenu = item.submenu
              .map((sub: any) => {
                // Submenu dengan anak nested (misal Bab I atau Laporan RAB)
                if (sub.submenu && sub.submenu.length > 0) {
                  const filteredChildren = sub.submenu.filter((child: any) =>
                    isRouteAllowedForRole(child.href || "", userRole)
                  );
                  // Cek juga izin sub induknya
                  const isParentAllowed = sub.href
                    ? isRouteAllowedForRole(sub.href, userRole)
                    : filteredChildren.length > 0;

                  if (filteredChildren.length === 0 && !isParentAllowed) {
                    return null;
                  }
                  return {
                    ...sub,
                    submenu: filteredChildren,
                  };
                }

                // Submenu biasa tanpa anak
                if (sub.href && !isRouteAllowedForRole(sub.href, userRole)) {
                  return null;
                }
                return sub;
              })
              .filter(Boolean);

            // Jika seluruh submenu tidak boleh diakses oleh role ini, sembunyikan induk menu
            if (filteredSubmenu.length === 0 && (!item.href || !isRouteAllowedForRole(item.href, userRole))) {
              return null;
            }

            return {
              ...item,
              submenu: filteredSubmenu,
            };
          }

          return item;
        })
        .filter(Boolean);

      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items && group.items.length > 0);
}
