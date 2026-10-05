import {
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Shield,
  Layers,
  ArrowUpRight,
  BookOpenCheck,
  Calculator,
  Scale
} from "lucide-react";
import { Link } from "react-router-dom";

// ── Stat Card ──────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  link,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  color: string;
  link?: string;
}) {
  const content = (
    <div className="aksi-card p-5 flex gap-4 items-start hover:border-[var(--primary)] transition-all">
      <div className={`p-3 rounded-xl flex-shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--text-muted)] font-medium">{label}</p>
        <p className="text-2xl font-bold text-[var(--text)] mt-0.5 tabular-nums">{value}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center justify-between">
          <span>{sub}</span>
          {link && <ArrowUpRight className="h-3 w-3 text-[var(--primary)] inline ml-1" />}
        </p>
      </div>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

// ── Status Row ──────────────────────────────────────────────
function StatusRow({
  label,
  count,
  icon: Icon,
  color,
  bg,
  link,
}: {
  label: string;
  count: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  link?: string;
}) {
  const row = (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--accent)]/30 px-1 rounded-lg transition-colors">
      <div className="flex items-center gap-2.5">
        <span className={`p-1.5 rounded-lg ${bg}`}>
          <Icon className={`h-3.5 w-3.5 ${color}`} />
        </span>
        <span className="text-xs md:text-sm text-[var(--text)] font-medium">{label}</span>
      </div>
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--text)]">{count}</span>
    </div>
  );

  return link ? <Link to={link}>{row}</Link> : row;
}

// ── Main Dashboard Page ──────────────────────────────────────
export default function DashboardPage() {
  const currentYear = 2027;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary text-[0.65rem] font-bold">AKSI PPATK</span>
            <span className="text-xs text-[var(--text-muted)]">Peraturan PPATK No. 11 Tahun 2025</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Dashboard Eksekutif</h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] mt-0.5">
            Sistem Informasi Perencanaan dan Penganggaran Pusat Pelaporan dan Analisis Transaksi Keuangan · TA {currentYear}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/rab/input-rinci"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[var(--primary)] text-white hover:opacity-90 flex items-center gap-1.5 shadow-sm transition-opacity"
          >
            <Calculator className="h-4 w-4" />
            <span>Kalkulator RAB Rinci</span>
          </Link>
          <Link
            to="/renstra/cascading"
            className="px-3 py-2 text-xs font-medium rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] text-[var(--text)] flex items-center gap-1.5 transition-colors"
          >
            <BookOpenCheck className="h-4 w-4" />
            <span>Renstra 2025–2029</span>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Pagu PPATK 2027"
          value="Rp 1,20 T"
          sub="KPJM Renstra Tabel 4.3"
          color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          link="/renstra/kpjm"
        />
        <StatCard
          icon={Calculator}
          label="Pagu RAB Diklat APH"
          value="Rp 2,21 M"
          sub="390 Peserta (13 Kegiatan)"
          color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
          link="/rab/input-rinci"
        />
        <StatCard
          icon={TrendingUp}
          label="Target Reformasi Birokrasi"
          value="83,0"
          sub="Target IKSS 2.1 (Tahun 2027)"
          color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
          link="/setia/target-kinerja"
        />
        <StatCard
          icon={Users}
          label="Total Target Peserta Diklat"
          value="1.200"
          sub="40 Pelatihan (Pusdiklat APUPPT)"
          color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
          link="/patih/rencana-output"
        />
      </div>

      {/* Two column row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status dokumen berjenjang */}
        <div className="aksi-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text)]">
                Status Dokumen Perencanaan & Anggaran
              </h2>
              <p className="text-[0.7rem] text-[var(--text-muted)]">Keterpaduan Renja SETIA, PATIH, TOR, dan RAB</p>
            </div>
            <Layers className="h-4 w-4 text-[var(--text-muted)]" />
          </div>
          <div className="space-y-1">
            <StatusRow
              label="Renja SETIA (Eselon I - Sestama)"
              count="13 Program Kerja Siap"
              icon={CheckCircle}
              color="text-emerald-600 dark:text-emerald-400"
              bg="bg-emerald-50 dark:bg-emerald-900/20"
              link="/setia/program-prioritas"
            />
            <StatusRow
              label="Renja PATIH (Eselon II - Pusdiklat)"
              count="40 Diklat & 25 Sarpras"
              icon={CheckCircle}
              color="text-emerald-600 dark:text-emerald-400"
              bg="bg-emerald-50 dark:bg-emerald-900/20"
              link="/patih/rencana-output"
            />
            <StatusRow
              label="Kerangka Acuan Kerja (TOR Diklat APH)"
              count="390 Peserta (4 Triwulan)"
              icon={CheckCircle}
              color="text-emerald-600 dark:text-emerald-400"
              bg="bg-emerald-50 dark:bg-emerald-900/20"
              link="/kak/penyusunan"
            />
            <StatusRow
              label="RAB Pagu Indikatif (5 Akun BAS)"
              count="Rp 2.209.364.000 Terverifikasi"
              icon={Clock}
              color="text-blue-600 dark:text-blue-400"
              bg="bg-blue-50 dark:bg-blue-900/20"
              link="/rab/input-rinci"
            />
            <StatusRow
              label="Standar Biaya Keluaran (SBK Diklat APH)"
              count="Maks Rp 5,66 Juta/Orang"
              icon={Scale}
              color="text-purple-600 dark:text-purple-400"
              bg="bg-purple-50 dark:bg-purple-900/20"
              link="/standar-biaya/sbk"
            />
          </div>
        </div>

        {/* Kerangka Pendanaan Renstra per Program */}
        <div className="aksi-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text)]">
                Proyeksi Pendanaan PPATK TA 2027 (Renstra)
              </h2>
              <p className="text-[0.7rem] text-[var(--text-muted)]">Tabel 4.3 Kerangka Pendanaan Jangka Menengah</p>
            </div>
            <span className="badge badge-primary">Tabel 4.3</span>
          </div>
          <div className="space-y-3.5">
            {[
              { label: "Program Pencegahan & Pemberantasan TPPU (078.BE)", nominal: "Rp 679,2 Miliar", pct: 56.5, color: "bg-blue-500" },
              { label: "Program Dukungan Manajemen (078.WA)", nominal: "Rp 522,7 Miliar", pct: 43.5, color: "bg-emerald-500" },
              { label: "Kegiatan Pusdiklat APU PPT (3365)", nominal: "Rp 6,91 Miliar", pct: 15.2, color: "bg-indigo-500" },
              { label: "Penyelenggaraan Sarpras & Gedung (3377)", nominal: "Rp 255,6 Miliar", pct: 48.9, color: "bg-amber-500" },
              { label: "Pengelolaan TI & Big Data (3381)", nominal: "Rp 555,0 Miliar", pct: 81.7, color: "bg-purple-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text)] font-medium truncate max-w-[240px]">{item.label}</span>
                  <span className="text-[var(--text-muted)] font-semibold tabular-nums">{item.nominal}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--accent)]">
                  <div
                    className={`h-1.5 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Referensi Cepat & Aktivitas Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Kolom 1 & 2: Riwayat Aktivitas & Validasi */}
        <div className="aksi-card p-5 lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            Log Aktivitas & Audit Perencanaan Terakhir
          </h2>
          <div className="space-y-3 text-xs">
            {[
              {
                user: "Danang Tri Hartono, S.H.",
                role: "Plt. Sekretaris Utama",
                action: "menyetujui rancangan 13 Program Kerja Prioritas & RB pada Renja SETIA 2027",
                time: "15 menit lalu",
                color: "bg-blue-500",
              },
              {
                user: "Akhyar Effendi, S.E.",
                role: "Kepala Pusdiklat APUPPT",
                action: "mengesahkan Kerangka Acuan Kerja (TOR) Pelatihan Aparat Penegak Hukum (390 orang)",
                time: "45 menit lalu",
                color: "bg-emerald-500",
              },
              {
                user: "Budi Santoso, S.Sos",
                role: "PPK Diklat APUPPT",
                action: "memperbarui rincian kalkulator RAB 4 faktor: akun 524111 Perjadin Maluku & Papua",
                time: "2 jam lalu",
                color: "bg-purple-500",
              },
              {
                user: "Sistem AKSI",
                role: "Auto Validator",
                action: "memvalidasi nilai Unit Cost RAB Diklat APH (Rp5.665.035) patuh pada plafon SBK (Rp5.665.000)",
                time: "3 jam lalu",
                color: "bg-amber-500",
              },
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--accent)]/30 border border-[var(--border)]">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${act.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[var(--text)]">{act.user}</span>
                    <span className="text-[0.65rem] text-[var(--primary)] font-medium">({act.role})</span>
                  </div>
                  <p className="text-[var(--text-muted)] mt-0.5">{act.action}</p>
                </div>
                <span className="text-[0.65rem] text-[var(--text-muted)] whitespace-nowrap">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom 3: Tautan Akses Master & Referensi */}
        <div className="aksi-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            Akses Referensi Utama
          </h2>
          <div className="space-y-2 text-xs">
            <Link to="/referensi/bas" className="block p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] transition-colors">
              <span className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>🏛️ Bagan Akun Standar (BAS)</span>
                <span className="badge badge-primary">6 Digit</span>
              </span>
              <p className="text-[0.7rem] text-[var(--text-muted)] mt-1">Klasifikasi akun belanja 521211, 521811, 521219, 524111, dll.</p>
            </Link>

            <Link to="/referensi/pejabat" className="block p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] transition-colors">
              <span className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>👔 Data Pejabat PPATK</span>
                <span className="badge badge-gray">Tanda Tangan</span>
              </span>
              <p className="text-[0.7rem] text-[var(--text-muted)] mt-1">Kepala PPATK, Sestama, Kapusdiklat, PPK, dan KPA.</p>
            </Link>

            <Link to="/standar-biaya/sbk" className="block p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] transition-colors">
              <span className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>📦 Standar Biaya Keluaran</span>
                <span className="badge badge-primary">SBK & SBM</span>
              </span>
              <p className="text-[0.7rem] text-[var(--text-muted)] mt-1">Plafon per output diklat dan tarif tertinggi PMK Kemenkeu.</p>
            </Link>

            <Link to="/admin/pengguna" className="block p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] transition-colors">
              <span className="font-bold text-[var(--text)] flex items-center justify-between">
                <span>👥 Manajemen Pengguna</span>
                <span className="badge badge-gray">Role & Izin</span>
              </span>
              <p className="text-[0.7rem] text-[var(--text-muted)] mt-1">Kelola akun operator, perencana, dan verifikator satker.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
