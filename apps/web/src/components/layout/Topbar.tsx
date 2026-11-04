import { useState } from "react";
import {
  Menu,
  Bell,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
  LayoutGrid,
} from "lucide-react";
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
    <header className="sticky top-0 z-20 flex flex-col justify-center min-h-[58px] py-1 px-3 sm:px-4 bg-[var(--card)] border-b border-[var(--border)] shadow-xs flex-shrink-0 transition-colors">
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* ── Left Section: Panel Toggle + Waktu Server & Nomenklatur ── */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {/* Hamburger / Panel toggle button */}
          <button
            onClick={onMenuToggle}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors flex-shrink-0 cursor-pointer"
            aria-label={sidebarCollapsed ? "Buka sidebar" : "Tutup/Kecilkan sidebar"}
            title={sidebarCollapsed ? "Buka sidebar" : "Kecilkan sidebar"}
          >
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
          <div className="h-7 w-px bg-[var(--border)] flex-shrink-0" />

          {/* Area 2 Baris: Baris Atas Waktu Server, Baris Bawah Nomenklatur Unit Kerja */}
          <div className="flex flex-col justify-center min-w-0 leading-tight">
            {/* Baris 1: Waktu Server */}
            <div className="flex items-center gap-2">
              <ServerClock />
            </div>

            {/* Baris 2: Nomenklatur Unit Kerja */}
            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
              <span className="text-xs sm:text-[13px] font-bold text-[var(--text)] tracking-tight truncate">
                PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN
              </span>
            </div>
          </div>
        </div>

        {/* ── Right Section: TA 2027 + Theme Toggle + Icons + User Menu ── */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Info Tahun Anggaran di samping kiri toggle Mode Gelap */}
          <div className="flex items-center">
            <span className="px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg bg-[var(--primary-bg)] text-[var(--primary)] border border-[var(--primary)]/20 shadow-2xs font-mono">
              TA 2027
            </span>
          </div>

          {/* Theme toggle (Mode Gelap/Terang) */}
          <ThemeToggle />

          {/* Divider */}
          <div className="h-6 w-px bg-[var(--border)] mx-0.5 sm:mx-1" />

          {/* Shortcut / Modul Grid Icon */}
          <button
            title="Menu Aplikasi"
            className="hidden sm:flex p-1.5 rounded-lg hover:bg-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 sm:p-2 rounded-lg hover:bg-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer"
              aria-label="Notifikasi"
              title="Notifikasi Sistem"
            >
              <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-[var(--card)]">
                6
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 aksi-card shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text)]">Pemberitahuan Sistem</span>
                  <span className="badge badge-red">6 Baru</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
                  <div className="p-3 hover:bg-[var(--accent)] transition-colors">
                    <p className="text-xs font-semibold text-[var(--text)]">Forum Penelaahan Ditutup</p>
                    <p className="text-[0.7rem] text-[var(--text-muted)] mt-0.5">
                      Tahap Alokasi Anggaran TA 2026 PPATK telah disetujui DJA dan ditutup.
                    </p>
                    <span className="text-[0.65rem] text-[var(--primary)] mt-1 inline-block">10 menit yang lalu</span>
                  </div>
                  <div className="p-3 hover:bg-[var(--accent)] transition-colors">
                    <p className="text-xs font-semibold text-[var(--text)]">Batas Waktu Pengajuan RKA</p>
                    <p className="text-[0.7rem] text-[var(--text-muted)] mt-0.5">
                      Penyusunan RKA TA 2027 dimulai untuk Pagu Indikatif.
                    </p>
                    <span className="text-[0.65rem] text-[var(--primary)] mt-1 inline-block">1 jam yang lalu</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help button */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer"
              aria-label="Bantuan"
              title="Bantuan & Panduan Sistem"
            >
              <HelpCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </button>

            {showHelp && (
              <div className="absolute right-0 top-full mt-2 w-72 aksi-card p-4 shadow-xl z-50">
                <h3 className="text-xs font-bold text-[var(--text)] mb-2 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-[var(--primary)]" />
                  Pusat Bantuan AKSI
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
                  Sistem Informasi Perencanaan dan Penganggaran PPATK terintegrasi Renja, KAK/TOR, RAB, dan Forum Penelaahan.
                </p>
                <div className="space-y-1.5 text-xs">
                  <a href="#panduan" onClick={(e) => { e.preventDefault(); setShowHelp(false); }} className="block p-2 rounded-lg hover:bg-[var(--accent)] text-[var(--text)]">
                    📘 Unduh Panduan Pengguna (PDF)
                  </a>
                  <a href="#helpdesk" onClick={(e) => { e.preventDefault(); setShowHelp(false); }} className="block p-2 rounded-lg hover:bg-[var(--accent)] text-[var(--text)]">
                    📞 Kontak Helpdesk Biro Perencanaan PPATK
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-[var(--border)] mx-0.5 sm:mx-1" />

          {/* User info + dropdown (Identitas Operator SAKTI / PPATK) */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
