import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Layers,
} from "lucide-react";
import { UserAccount } from "../../data/userManagementData";

export default function UserMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Ambil user dan role aktif dari session / localStorage
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    nip: string;
    role: string;
    unitCode: string;
    initials: string;
  }>(() => {
    try {
      const authStr = localStorage.getItem("aksi_auth_user");
      const activeRole = localStorage.getItem("renja_e2_user_role") || "Super Admin";
      if (authStr) {
        const u = JSON.parse(authStr) as UserAccount;
        const initials = u.nama
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        return {
          name: u.nama,
          nip: u.nip,
          role: activeRole,
          unitCode: u.unitKerja.split(" - ")[0] || "PPATK",
          initials,
        };
      }
    } catch {}
    return {
      name: "Isnen Hadi Al Ghozali",
      nip: "199002272012101003",
      role: "Super Admin",
      unitCode: "BINCANG",
      initials: "IH",
    };
  });

  useEffect(() => {
    const updateUserData = () => {
      try {
        const authStr = localStorage.getItem("aksi_auth_user");
        const activeRole = localStorage.getItem("renja_e2_user_role") || "Super Admin";
        if (authStr) {
          const u = JSON.parse(authStr) as UserAccount;
          const initials = u.nama
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          setCurrentUser({
            name: u.nama,
            nip: u.nip,
            role: activeRole,
            unitCode: u.unitKerja.split(" - ")[0] || "PPATK",
            initials,
          });
        }
      } catch {}
    };

    window.addEventListener("storage", updateUserData);
    window.addEventListener("renja_role_changed", updateUserData);
    return () => {
      window.removeEventListener("storage", updateUserData);
      window.removeEventListener("renja_role_changed", updateUserData);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("aksi_auth_user");
    navigate("/login");
  };

  const handleChangeRole = () => {
    setIsOpen(false);
    navigate("/pilih-role");
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 sm:px-2.5 py-1 rounded-xl hover:bg-[var(--accent)] border border-transparent hover:border-[var(--border)] transition-all duration-200 focus:outline-none cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* User Identity Info */}
        <div className="flex flex-col text-right leading-tight min-w-0">
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-xs font-bold text-[var(--text)] tracking-tight truncate max-w-[150px]">
              {currentUser.name}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
          </div>
          <span className="text-[0.68rem] text-[var(--primary)] font-semibold leading-none truncate max-w-[150px]">
            {currentUser.role}
          </span>
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0 shadow-xs border border-white/20">
          {currentUser.initials}
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-200 hidden sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl z-50 overflow-hidden"
          role="menu"
        >
          {/* Header info user */}
          <div className="p-3.5 border-b border-[var(--border)] bg-[var(--accent)]">
            <p className="text-xs font-bold text-[var(--text)] truncate">{currentUser.name}</p>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">NIP. {currentUser.nip}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Shield className="h-3.5 w-3.5 text-[var(--primary)]" />
              <span className="text-[10px] text-[var(--primary)] font-bold">
                {currentUser.role} · {currentUser.unitCode}
              </span>
            </div>
          </div>

          {/* Action Links */}
          <div className="py-1">
            <button
              onClick={handleChangeRole}
              className="flex items-center w-full gap-2.5 px-3.5 py-2 text-xs text-[var(--text)] hover:bg-[var(--accent)] font-semibold transition-colors cursor-pointer text-left"
            >
              <Layers className="h-4 w-4 text-indigo-500" />
              <span>Ganti / Pilih Peran</span>
            </button>
          </div>

          {/* Divider + Logout */}
          <div className="border-t border-[var(--border)] py-1">
            <button
              className="flex items-center w-full gap-2.5 px-3.5 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold transition-colors cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
