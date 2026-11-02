import { useState } from "react";
import {
  TrendingUp,
  Percent,
  DollarSign,
  Landmark,
  Calendar,
  FileText,
  ShieldCheck,
  Building,
  Info,
  CheckCircle2,
  Layers,
  ArrowUpRight,
} from "lucide-react";

export default function AsumsiMakroPage() {
  const [selectedTahun, setSelectedTahun] = useState("2027");

  // Asumsi Makro 2027 sesuai Panduan 3
  const asumsi2027 = [
    {
      id: "pertumbuhan",
      label: "Pertumbuhan Ekonomi",
      nilai: "6,0%",
      satuan: "persen (YoY)",
      deskripsi: "Proyeksi laju pertumbuhan ekonomi nasional tahun 2027 berbasis pemulihan investasi dan konsumsi domestik.",
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    },
    {
      id: "inflasi",
      label: "Laju Inflasi",
      nilai: "2,5%",
      satuan: "persen (YoY)",
      deskripsi: "Target stabilitas harga komoditas pangan dan energi nasional terjaga dalam rentang sasaran pemerintah.",
      icon: Percent,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    {
      id: "kurs",
      label: "Nilai Tukar Rupiah",
      nilai: "Rp17.500",
      satuan: "per USD",
      deskripsi: "Asumsi nilai konversi kurs valuta asing Rupiah terhadap Dolar Amerika Serikat (USD) untuk penganggaran belanja valas.",
      icon: DollarSign,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    },
    {
      id: "sbn",
      label: "Suku Bunga SBN 10 Tahun",
      nilai: "6,9%",
      satuan: "persen",
      deskripsi: "Tingkat imbal hasil Surat Berharga Negara tenor 10 tahun sebagai acuan biaya dana dan likuiditas fiskal pasar uang.",
      icon: Landmark,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs text-white border border-white/20 shadow-xs">
              <TrendingUp className="h-6 w-6 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Asumsi Ekonomi Makro</h1>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-xs border border-white/30">
                  TA {selectedTahun}
                </span>
              </div>
              <p className="text-xs text-sky-100/90 mt-1">
                Indikator parameter makroekonomi rujukan resmi penyusunan Rencana Kerja (Renja) &amp; Rencana Anggaran Biaya (RAB) PPATK
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold text-white border border-white/20">
              <Calendar className="h-3.5 w-3.5" />
              <span>Tahun Anggaran:</span>
              <select
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer"
              >
                <option value="2027" className="text-slate-900">2027 (KEM-PPKF)</option>
                <option value="2026" className="text-slate-900">2026</option>
                <option value="2025" className="text-slate-900">2025</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 4 Kartu Parameter Utama Asumsi Makro 2027 */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {asumsi2027.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${item.bgColor}`}
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${item.badgeColor}`}>
                  {item.satuan}
                </span>
                <div className={`p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-xs ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {item.label}
                </p>
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                  {item.nilai}
                </h3>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed border-t border-slate-200/60 dark:border-slate-700/60 pt-3">
                {item.deskripsi}
              </p>
            </div>
          );
        })}
      </div>

      {/* Informasi Kebijakan & Rujukan Kerangka Ekonomi Makro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-[var(--foreground)]">
              Landasan Kebijakan Fiskal TA 2027
            </h3>
          </div>

          <div className="space-y-3 text-xs text-[var(--muted-foreground)] leading-relaxed">
            <p>
              Asumsi Ekonomi Makro Tahun Anggaran 2027 ditetapkan mengacu pada dokumen Kerangka Ekonomi Makro dan Pokok-Pokok Kebijakan Fiskal (KEM-PPKF) serta kesepakatan Badan Anggaran DPR RI dan Pemerintah.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--accent)]/40 space-y-1">
                <span className="font-bold text-[var(--foreground)] block">Implikasi Nilai Tukar (Kurs USD)</span>
                <p className="text-[11px]">
                  Patokan <strong>Rp17.500 per USD</strong> digunakan pada perhitungan kebutuhan pengadaan server, lisensi perangkat lunak internasional, dan biaya perjalanan dinas luar negeri (PDLN).
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--accent)]/40 space-y-1">
                <span className="font-bold text-[var(--foreground)] block">Stabilitas Inflasi &amp; Belanja Operasional</span>
                <p className="text-[11px]">
                  Target inflasi <strong>2,5% (YoY)</strong> menjadi acuan penyesuaian indeks standar biaya masukan (SBM) keperluan kantor dan pengadaan barang/jasa PPATK.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kotak Ringkasan Rujukan PPATK */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Status Integrasi AKSI
              </h3>
            </div>
            <div className="space-y-2.5 text-xs text-[var(--muted-foreground)] mt-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Terhubung ke perhitungan Pagu Indikatif TA 2027</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Rujukan validasi pagu valas pada KAK &amp; RAB</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Kesesuaian standar inflasi belanja barang operasional</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-300">
            <strong>Catatan:</strong> Parameter ini berlaku menyeluruh bagi seluruh Unit Eselon I &amp; II di lingkungan PPATK.
          </div>
        </div>
      </div>
    </div>
  );
}
