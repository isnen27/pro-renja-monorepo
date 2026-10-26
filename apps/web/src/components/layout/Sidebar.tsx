import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { X, Search } from "lucide-react";
import NavGroup from "../navigation/NavGroup";
import { menuConfig, type MenuGroup } from "../navigation/menuConfig";

interface SidebarProps {
  collapsed: boolean;
  onClose: () => void;
}

export default function Sidebar({ collapsed, onClose }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<string>(() => {
    try {
      return localStorage.getItem("renja_e2_user_role") || "Operator";
    } catch {
      return "Operator";
    }
  });

  // Sinkronisasi perubahan role dari local storage / event
  useEffect(() => {
    const handleRoleUpdate = () => {
      try {
        const saved = localStorage.getItem("renja_e2_user_role") || "Operator";
        setUserRole(saved);
      } catch {}
    };

    window.addEventListener("storage", handleRoleUpdate);
    window.addEventListener("renja_role_changed", handleRoleUpdate);
    window.addEventListener("focus", handleRoleUpdate);
    const interval = setInterval(handleRoleUpdate, 800);

    return () => {
      window.removeEventListener("storage", handleRoleUpdate);
      window.removeEventListener("renja_role_changed", handleRoleUpdate);
      window.removeEventListener("focus", handleRoleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Tutup sidebar mobile saat tekan Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !collapsed) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, collapsed]);

  // Filtered menu items when searching & role based
  const filteredGroups = useMemo(() => {
    const isOperatorOrApprover = userRole === "Operator" || userRole === "Approver";

    // Modifikasi item menu sesuai hak akses role
    const roleAdjustedConfig = menuConfig.map((group) => {
      const items = group.items.map((item) => {
        // Untuk menu RAB: jika Operator atau Approver, tampilkan Isian RAB, Revisi Anggaran, dan Laporan RAB
        if (item.label === "Rencana Anggaran Biaya (RAB)" && isOperatorOrApprover) {
          return {
            ...item,
            submenu: item.submenu?.filter(
              (sub) =>
                sub.label === "Isian RAB" ||
                sub.label === "Revisi Anggaran" ||
                sub.label === "Laporan RAB"
            ),
          };
        }
        return item;
      });
      return { ...group, items };
    });

    if (!searchQuery.trim()) return roleAdjustedConfig;
    const q = searchQuery.toLowerCase();

    return roleAdjustedConfig
      .map((group) => {
        const matchingItems = group.items.filter((item) => {
          const matchItem = item.label.toLowerCase().includes(q);
          const matchSub = item.submenu?.some((sub) => {
            const subMatch = sub.label.toLowerCase().includes(q);
            const childMatch = sub.submenu?.some((child) =>
              child.label.toLowerCase().includes(q)
            );
            return subMatch || childMatch;
          });
          return matchItem || matchSub;
        });

        return {
          ...group,
          items: matchingItems,
        };
      })
      .filter((group) => group.items.length > 0) as MenuGroup[];
  }, [searchQuery, userRole]);

  return (
    <>
      {/* ── Mobile overlay backdrop ── */}
      <div
        className={`
          fixed inset-0 z-30 bg-black/50 backdrop-blur-sm
          lg:hidden transition-opacity duration-300
          ${!collapsed ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Sidebar panel ── */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen flex flex-col
          lg:relative lg:top-auto lg:left-auto lg:h-full lg:z-auto
          bg-[var(--sidebar-bg)] border-r border-[var(--border)]
          transition-all duration-300 ease-in-out overflow-hidden
          ${collapsed
            ? "-translate-x-full lg:translate-x-0 w-72 lg:w-16"
            : "translate-x-0 w-72"
          }
        `}
        aria-label="Navigasi utama"
      >

        {/* ── Header / Logo ── */}
        <div
          className={`
            flex items-center border-b border-[var(--border)] flex-shrink-0 h-14
            transition-all duration-300
            ${collapsed ? "lg:justify-center px-3" : "px-4 justify-between"}
          `}
        >
          {/* Logo link (full) */}
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 group ${collapsed ? "lg:hidden" : ""}`}
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                AKSI
              </p>
              <p className="text-[0.6rem] text-[var(--text-muted)] leading-none">
                Perencanaan & Penganggaran
              </p>
            </div>
          </Link>

          {/* Logo icon only (collapsed desktop) */}
          <Link
            to="/dashboard"
            title="AKSI - Dashboard"
            className={`hidden group ${collapsed ? "lg:flex" : ""}`}
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">A</span>
            </div>
          </Link>

          {/* Close button (mobile) */}
          <button
            onClick={onClose}
            className={`lg:hidden p-1.5 rounded-lg hover:bg-[var(--accent)] text-[var(--text-muted)] transition-colors cursor-pointer ${collapsed ? "hidden" : ""}`}
            aria-label="Tutup sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Search Box (hidden when collapsed on desktop) ── */}
        <div className={`px-3 py-3 flex-shrink-0 ${collapsed ? "lg:hidden" : ""}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--accent)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Search icon only (collapsed desktop) */}
        <div className={`hidden px-3 py-3 flex-shrink-0 ${collapsed ? "lg:flex justify-center" : ""}`}>
          <button
            title="Cari menu"
            className="p-2 rounded-xl hover:bg-[var(--accent)] text-[var(--text-muted)] transition-colors cursor-pointer"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4">
          {filteredGroups.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-[var(--text-muted)]">
              Tidak ada menu ditemukan
            </div>
          ) : (
            filteredGroups.map((group) => (
              <NavGroup
                key={group.groupLabel}
                group={group}
                collapsed={collapsed}
              />
            ))
          )}
        </nav>

        {/* ── Footer ── */}
        <div
          className={`
            flex-shrink-0 border-t border-[var(--border)] px-3 py-3
            ${collapsed ? "lg:hidden" : ""}
          `}
        >
          <p className="text-[0.6rem] text-[var(--text-muted)] text-center">
            AKSI v1.0.0 · TA{" "}
            <span className="text-[var(--primary)] font-semibold">2026</span>
          </p>
        </div>
      </aside>
    </>
  );
}
