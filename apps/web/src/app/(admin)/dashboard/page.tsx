import {
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
} from "lucide-react";

// ── Stat Card ──────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="aksi-card p-5 flex gap-4 items-start">
      <div className={`p-3 rounded-xl flex-shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-[var(--text-muted)] font-medium">{label}</p>
        <p className="text-2xl font-bold text-[var(--text)] mt-0.5">{value}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ── Status Row ──────────────────────────────────────────────
function StatusRow({
  label,
  count,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
      <div className="flex items-center gap-2.5">
        <span className={`p-1.5 rounded-lg ${bg}`}>
          <Icon className={`h-3.5 w-3.5 ${color}`} />
        </span>
        <span className="text-sm text-[var(--text)]">{label}</span>
      </div>
      <span className="text-sm font-semibold text-[var(--text)]">{count}</span>
    </div>
  );
}

// ── Main Dashboard Page ──────────────────────────────────────
export default function DashboardPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Selamat datang di AKSI — Modul Perencanaan dan Penganggaran · TA {currentYear}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total Renja OPD"
          value="42"
          sub="Tahun Anggaran 2026"
          color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={DollarSign}
          label="Total Pagu Anggaran"
          value="Rp 4,2 T"
          sub="APBD Tahun 2026"
          color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Realisasi Keuangan"
          value="68,4%"
          sub="Per September 2026"
          color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={Users}
          label="Total OPD"
          value="37"
          sub="Aktif di sistem"
          color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Two column row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status dokumen */}
        <div className="aksi-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text)]">
              Status Dokumen Perencanaan
            </h2>
            <BarChart3 className="h-4 w-4 text-[var(--text-muted)]" />
          </div>
          <div>
            <StatusRow
              label="Renja OPD — Disetujui"
              count={28}
              icon={CheckCircle}
              color="text-emerald-600 dark:text-emerald-400"
              bg="bg-emerald-50 dark:bg-emerald-900/20"
            />
            <StatusRow
              label="Renja OPD — Dalam Proses"
              count={10}
              icon={Clock}
              color="text-amber-600 dark:text-amber-400"
              bg="bg-amber-50 dark:bg-amber-900/20"
            />
            <StatusRow
              label="Renja OPD — Belum Diajukan"
              count={4}
              icon={AlertCircle}
              color="text-red-500"
              bg="bg-red-50 dark:bg-red-900/20"
            />
            <StatusRow
              label="RKA-OPD — Perlu Verifikasi"
              count={7}
              icon={FileText}
              color="text-blue-600 dark:text-blue-400"
              bg="bg-blue-50 dark:bg-blue-900/20"
            />
          </div>
        </div>

        {/* Realisasi anggaran per sektor */}
        <div className="aksi-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text)]">
              Realisasi Anggaran per Urusan
            </h2>
            <span className="badge badge-primary">Sep 2026</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Pendidikan", pct: 72, color: "bg-blue-500" },
              { label: "Kesehatan", pct: 65, color: "bg-emerald-500" },
              { label: "Infrastruktur", pct: 58, color: "bg-amber-500" },
              { label: "Pemberdayaan Masyarakat", pct: 81, color: "bg-purple-500" },
              { label: "Pemerintahan Umum", pct: 70, color: "bg-indigo-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text)] font-medium">{item.label}</span>
                  <span className="text-[var(--text-muted)]">{item.pct}%</span>
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

      {/* Aktivitas terbaru */}
      <div className="aksi-card p-5">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-4">
          Aktivitas Terbaru
        </h2>
        <div className="space-y-3">
          {[
            {
              user: "Budi Santoso",
              action: "mengajukan Renja OPD Dinas Kesehatan",
              time: "5 menit lalu",
              type: "primary",
            },
            {
              user: "Sari Wulandari",
              action: "memverifikasi RKA Dinas Pendidikan TA 2026",
              time: "23 menit lalu",
              type: "emerald",
            },
            {
              user: "Ahmad Fauzi",
              action: "mengupload DPA Dinas PU Perumahan",
              time: "1 jam lalu",
              type: "amber",
            },
            {
              user: "Rina Marlina",
              action: "menyelesaikan input Musrenbang Kecamatan Tanah Abang",
              time: "2 jam lalu",
              type: "purple",
            },
            {
              user: "Sistem",
              action: "reminder: batas waktu pengajuan RKA adalah 30 September 2026",
              time: "3 jam lalu",
              type: "red",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div
                className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 bg-${item.type}-500 ring-4 ring-${item.type}-100 dark:ring-${item.type}-900/30`}
              />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-[var(--text)]">{item.user}</span>{" "}
                <span className="text-[var(--text-muted)]">{item.action}</span>
              </div>
              <span className="text-[0.65rem] text-[var(--text-muted)] flex-shrink-0 whitespace-nowrap">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
