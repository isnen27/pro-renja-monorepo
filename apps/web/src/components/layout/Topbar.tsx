import { useState, useEffect, useRef } from "react";
import {
  Menu,
  Bell,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
  LayoutGrid,
  CreditCard,
  LineChart,
  FileSpreadsheet,
  Check,
  ChevronDown,
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import ServerClock from "../ui/ServerClock";
import ThemeToggle from "../ui/ThemeToggle";
import UserMenu from "../ui/UserMenu";
import { getStoredNotifications, type SystemNotification } from "../../data/userManagementData";

interface TopbarProps {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

export default function Topbar({ onMenuToggle, sidebarCollapsed }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showModuleMenu, setShowModuleMenu] = useState(false);
  const moduleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Data notifikasi dinamis dari localStorage / master data
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  useEffect(() => {
    const refreshNotifications = () => {
      setNotifications(getStoredNotifications());
    };
    refreshNotifications();

    window.addEventListener("aksi_notifications_updated", refreshNotifications);
    window.addEventListener("storage", refreshNotifications);
    return () => {
      window.removeEventListener("aksi_notifications_updated", refreshNotifications);
      window.removeEventListener("storage", refreshNotifications);
    };
  }, []);

  // Baca unit kerja & role user sesuai Panduan4
  const [userUnit, setUserUnit] = useState<string>("PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN");

  useEffect(() => {
    const updateUnit = () => {
      try {
        const role = localStorage.getItem("renja_e2_user_role") || "Operator";
        if (role === "Super Admin") {
          setUserUnit("PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN");
          return;
        }

        // Cek dari histori aktif RAB / KAK / Renja
        const rabSaved = localStorage.getItem("rab_active_histori");
        if (rabSaved) {
          const p = JSON.parse(rabSaved);
          if (p.kdsatker) {
            setUserUnit(p.kdsatker);
            return;
          }
        }

        const kakSaved = localStorage.getItem("kak_active_histori");
        if (kakSaved) {
          const p = JSON.parse(kakSaved);
          if (p.kdsatker) {
            setUserUnit(p.kdsatker);
            return;
          }
        }

        const renjaSaved = localStorage.getItem("renja_e2_active_histori");
        if (renjaSaved) {
          const p = JSON.parse(renjaSaved);
          if (p.unit_kerja) {
            setUserUnit(p.unit_kerja);
            return;
          }
        }
      } catch (e) {}
      setUserUnit("PUSAT PELAPORAN DAN ANALISIS TRANSAKSI KEUANGAN");
    };

    updateUnit();
    window.addEventListener("storage", updateUnit);
    window.addEventListener("focus", updateUnit);
    return () => {
      window.removeEventListener("storage", updateUnit);
      window.removeEventListener("focus", updateUnit);
    };
  }, []);

  // Close module popup on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moduleRef.current && !moduleRef.current.contains(e.target as Node)) {
        setShowModuleMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

            {/* Baris 2: Nomenklatur Unit Kerja sesuai Panduan4 */}
            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
              <span className="text-xs sm:text-[13px] font-bold text-[var(--text)] tracking-tight truncate uppercase">
                {userUnit}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right Section: TA 2027 + Theme Toggle + Pintasan Modul + Notifikasi + User Menu ── */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Info Tahun Anggaran di samping kiri toggle Mode Gelap */}
          <div className="flex items-center">
            <span className="px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg bg-[var(--primary-bg)] text-[var(--primary)] border border-[var(--primary)]/20 shadow-2xs font-mono">
              TA 2027
            </span>
          </div>

          {/* Theme toggle (Mode Gelap/Terang) */}
          <ThemeToggle />

          {/* Tombol Pintasan Modul Lain di samping kanan toggle theme (Panduan4) */}
          <div className="relative" ref={moduleRef}>
            <button
              onClick={() => setShowModuleMenu(!showModuleMenu)}
              title="Pintasan Modul Aplikasi"
              className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                showModuleMenu
                  ? "bg-[var(--primary-bg)] text-[var(--primary)] border-[var(--primary)]/30"
                  : "hover:bg-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--primary)] border-transparent hover:border-[var(--border)]"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 opacity-60 hidden sm:inline" />
            </button>

            {/* Dropdown Pintasan Modul Lain */}
            {showModuleMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 aksi-card p-2.5 shadow-xl z-50 rounded-2xl border border-[var(--border)] bg-[var(--card)] animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-[var(--border)] mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                    Pintasan Modul Aplikasi
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--primary-bg)] text-[var(--primary)] font-bold font-mono">
                    PPATK
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  {/* Modul Pelaksanaan Anggaran */}
                  <a
                    href="#pelaksanaan-anggaran"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowModuleMenu(false);
                      window.open("https://sakti.kemenkeu.go.id/", "_blank");
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--accent)] text-[var(--text)] transition-colors group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform flex-shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[var(--text)] leading-tight">
                        Modul Pelaksanaan Anggaran
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-1">
                        Penerbitan SPP, SPM, SP2D, dan Ketersediaan Kas
                      </p>
                    </div>
                  </a>

                  {/* Modul Monitoring */}
                  <a
                    href="/rab/monitoring"
                    onClick={() => setShowModuleMenu(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--accent)] text-[var(--text)] transition-colors group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0">
                      <LineChart className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[var(--text)] leading-tight">
                        Modul Monitoring
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-1">
                        Monitoring Submit, Approve, RPD & Blokir Anggaran
                      </p>
                    </div>
                  </a>

                  {/* Modul Pelaporan Keuangan */}
                  <a
                    href="#pelaporan-keuangan"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowModuleMenu(false);
                      window.open("https://monsobat.kemenkeu.go.id/", "_blank");
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--accent)] text-[var(--text)] transition-colors group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform flex-shrink-0">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[var(--text)] leading-tight">
                        Modul Pelaporan Keuangan
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-1">
                        Laporan Keuangan K/L, Rekonsiliasi & CalK
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-[var(--border)] mx-0.5 sm:mx-1" />

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 sm:p-2 rounded-lg hover:bg-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer"
              aria-label="Notifikasi"
              title="Notifikasi Sistem"
            >
              <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-[var(--card)]">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 aksi-card shadow-xl z-50 overflow-hidden border border-[var(--border)] rounded-2xl bg-[var(--card)]">
                <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card-header)]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[var(--primary)]" />
                    <span className="text-xs font-bold text-[var(--text)]">Pemberitahuan Sistem</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-red text-[10px] font-semibold">
                      {notifications.length} Notifikasi
                    </span>
                    <a
                      href="/admin/notifikasi"
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-[var(--primary)] hover:underline font-medium"
                    >
                      Kelola
                    </a>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                      Belum ada notifikasi baru untuk saat ini.
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const getIcon = () => {
                        switch (n.kategori) {
                          case "urgent":
                            return <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />;
                          case "warning":
                            return <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />;
                          case "success":
                            return <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />;
                          default:
                            return <Info className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />;
                        }
                      };

                      return (
                        <div key={n.id} className="p-3.5 hover:bg-[var(--accent)] transition-colors flex items-start gap-3">
                          {getIcon()}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-[var(--text)] leading-tight line-clamp-1">
                                {n.judul}
                              </p>
                              <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                                {n.waktu}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                              {n.pesan}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--primary-bg)] text-[var(--primary)] font-semibold">
                                Target: {n.target}
                              </span>
                              <span className="text-[9px] text-[var(--text-muted)]">
                                {n.tanggal}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2.5 border-t border-[var(--border)] bg-[var(--card-header)] text-center">
                  <a
                    href="/admin/notifikasi"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                  >
                    Buka Halaman Kelola Notifikasi &rarr;
                  </a>
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

          {/* User info + dropdown (Identitas Operator SAKTI / PPATK tanpa info tahun) */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
