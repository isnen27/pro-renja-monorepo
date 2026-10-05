import { useState, useRef, useEffect } from "react";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Bell,
} from "lucide-react";

// Dummy user data
const dummyUser = {
  name: "Budi Santoso, S.Sos",
  role: "Admin Perencanaan",
  opd: "Bappeda",
  initials: "BS",
  email: "budi.santoso@bappeda.go.id",
  isOnline: true,
};

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-[var(--accent)] border border-transparent hover:border-[var(--border)] transition-all duration-200 focus:outline-none cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[var(--primary-bg)] flex items-center justify-center">
            <span className="text-[var(--primary)] text-xs font-bold">
              {dummyUser.initials}
            </span>
          </div>
          {/* Online dot */}
          {dummyUser.isOnline && (
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-[var(--card)]" />
          )}
        </div>

        {/* Name (hide on small screens) */}
        <div className="hidden md:flex flex-col text-left leading-tight">
          <span className="text-xs font-semibold text-[var(--text)] truncate max-w-[140px]">
            {dummyUser.name}
          </span>
          <span className="text-[0.65rem] text-[var(--text-muted)]">
            {dummyUser.role} · {dummyUser.opd}
          </span>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 aksi-card shadow-xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--accent)]/50">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-bg)] flex items-center justify-center">
                  <span className="text-[var(--primary)] text-sm font-bold">
                    {dummyUser.initials}
                  </span>
                </div>
                {dummyUser.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[var(--card)]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text)] truncate">
                  {dummyUser.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {dummyUser.email}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Shield className="h-3 w-3 text-[var(--primary)]" />
                  <span className="text-[0.65rem] text-[var(--primary)] font-medium">
                    {dummyUser.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <DropdownItem icon={User} label="Profil Saya" href="#profil" />
            <DropdownItem icon={Bell} label="Notifikasi" href="#notifikasi" badge="3" />
            <DropdownItem icon={Settings} label="Pengaturan Akun" href="#pengaturan" />
          </div>

          {/* Divider + Logout */}
          <div className="border-t border-[var(--border)] py-1.5">
            <button
              className="flex items-center w-full gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
              onClick={() => alert("Sesi akan diakhiri. Silakan login kembali.")}
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Keluar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  icon: Icon,
  label,
  href,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--accent)] transition-colors"
      onClick={(e) => {
        if (href.startsWith("#")) {
          e.preventDefault();
        }
      }}
    >
      <Icon className="h-4 w-4 text-[var(--text-muted)]" />
      <span className="flex-1">{label}</span>
      {badge && <span className="badge badge-red">{badge}</span>}
    </a>
  );
}
