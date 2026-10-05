import { useState } from "react";
import { Menu, Bell, HelpCircle, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import ServerClock from "../ui/ServerClock";
import ThemeToggle from "../ui/ThemeToggle";
import UserMenu from "../ui/UserMenu";

interface TopbarProps {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

export default function Topbar({ onMenuToggle, sidebarCollapsed }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex items-center h-14 px-4 gap-3 bg-[var(--card)] border-b border-[var(--border)] shadow-sm flex-shrink-0">
      {/* ── Left Section ── */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Hamburger / Panel toggle button */}
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors flex-shrink-0 cursor-pointer"
          aria-label={sidebarCollapsed ? "Buka sidebar" : "Tutup/Kecilkan sidebar"}
          title={sidebarCollapsed ? "Buka sidebar" : "Kecilkan sidebar"}
        >
          {/* Desktop: show panel icon; Mobile: always show hamburger */}
          <span className="hidden lg:block">
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </span>
          <span className="block lg:hidden">
            <Menu className="h-5 w-5" />
          </span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-[var(--border)] flex-shrink-0" />

        {/* Server date/time clock - hide on small mobile screens to prevent overlap */}
        <div className="hidden sm:block">
          <ServerClock />
        </div>
      </div>

      {/* ── Right Section ── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Divider */}
        <div className="h-6 w-px bg-[var(--border)] mx-1" />

        {/* Help button */}
        <div className="relative">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 rounded-lg hover:bg-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer"
            aria-label="Bantuan"
            title="Bantuan & Panduan Sistem"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          {showHelp && (
            <div className="absolute right-0 top-full mt-2 w-72 aksi-card p-4 shadow-xl z-50">
              <h3 className="text-xs font-bold text-[var(--text)] mb-2 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-[var(--primary)]" />
                Pusat Bantuan AKSI
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
                Sistem Informasi Perencanaan dan Penganggaran Daerah terintegrasi dari RPJMD, Renstra, Renja, KUA-PPAS hingga RKA & DPA.
              </p>
              <div className="space-y-1.5 text-xs">
                <a href="#panduan" onClick={(e) => { e.preventDefault(); setShowHelp(false); }} className="block p-2 rounded-lg hover:bg-[var(--accent)] text-[var(--text)]">
                  📘 Unduh Buku Panduan Pengguna (PDF)
                </a>
                <a href="#helpdesk" onClick={(e) => { e.preventDefault(); setShowHelp(false); }} className="block p-2 rounded-lg hover:bg-[var(--accent)] text-[var(--text)]">
                  📞 Kontak Helpdesk Bappeda / BPKAD
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer"
            aria-label="Notifikasi"
            title="Notifikasi Sistem"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--card)]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 aksi-card shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text)]">Pemberitahuan Sistem</span>
                <span className="badge badge-red">3 Baru</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
                <div className="p-3 hover:bg-[var(--accent)] transition-colors">
                  <p className="text-xs font-semibold text-[var(--text)]">Batas Waktu Pengajuan RKA</p>
                  <p className="text-[0.7rem] text-[var(--text-muted)] mt-0.5">Pengajuan RKA TA 2026 ditutup pada 30 September 2026 pukul 23:59 WIB.</p>
                  <span className="text-[0.65rem] text-[var(--primary)] mt-1 inline-block">10 menit yang lalu</span>
                </div>
                <div className="p-3 hover:bg-[var(--accent)] transition-colors">
                  <p className="text-xs font-semibold text-[var(--text)]">Verifikasi Renja Disetujui</p>
                  <p className="text-[0.7rem] text-[var(--text-muted)] mt-0.5">Renja OPD Dinas Pendidikan telah disahkan oleh Bappeda.</p>
                  <span className="text-[0.65rem] text-[var(--primary)] mt-1 inline-block">1 jam yang lalu</span>
                </div>
                <div className="p-3 hover:bg-[var(--accent)] transition-colors">
                  <p className="text-xs font-semibold text-[var(--text)]">Sinkronisasi IKD Selesai</p>
                  <p className="text-[0.7rem] text-[var(--text-muted)] mt-0.5">Indikator Kinerja Daerah telah dimutakhirkan berdasarkan RPJMD 2024-2029.</p>
                  <span className="text-[0.65rem] text-[var(--primary)] mt-1 inline-block">Kemarin</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-[var(--border)] mx-1" />

        {/* User info + dropdown */}
        <UserMenu />
      </div>
    </header>
  );
}
