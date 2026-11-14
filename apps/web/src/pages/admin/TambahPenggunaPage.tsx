/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Info
} from "lucide-react";
import {
  getStoredUsers,
  saveStoredUsers,
  DAFTAR_UNIT_KERJA_PPATK,
  isPejabatJabatan,
  UserAccount
} from "../../data/userManagementData";

export default function TambahPenggunaPage() {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [nip, setNip] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [unitKerja, setUnitKerja] = useState(DAFTAR_UNIT_KERJA_PPATK[0]?.labelLengkap || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"Online" | "Offline">("Offline");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handlePilihRekomendasiJabatan = (jbt: string) => {
    setJabatan(jbt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nama.trim() || !nip.trim() || !jabatan.trim() || !password.trim()) {
      setErrorMsg("Mohon lengkapi seluruh kolom formulir wajib yang bertanda (*).");
      return;
    }

    const currentUsers = getStoredUsers();

    // Validasi NIP unik
    if (currentUsers.some((u) => u.nip === nip.trim())) {
      setErrorMsg(`NIP/NRP '${nip}' sudah terdaftar dalam sistem. Gunakan NIP yang berbeda.`);
      return;
    }

    // Buat objek pengguna baru
    const newId = `USR-${String(currentUsers.length + 1).padStart(2, "0")}`;
    const newUser: UserAccount = {
      id: newId,
      nip: nip.trim(),
      nama: nama.trim(),
      jabatan: jabatan.trim(),
      unitKerja: unitKerja,
      password: password,
      peran: ["Operator Eselon II"], // Default peran awal, peran dikelola di Hak Akses & Peran
      status: status,
      terakhirLogin: "Baru dibuat",
    };

    const updated = [newUser, ...currentUsers];
    saveStoredUsers(updated);

    setSuccessMsg(`Pengguna baru '${newUser.nama}' berhasil ditambahkan ke sistem AKSI PPATK.`);
    setTimeout(() => {
      navigate("/admin/pengguna");
    }, 1200);
  };

  const isPejabat = isPejabatJabatan(jabatan);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/admin/pengguna"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Daftar Pengguna</span>
            </Link>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[var(--text)] flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-indigo-600" />
            <span>Tambah Pengguna Baru</span>
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] mt-0.5">
            Formulir pendaftaran akun pegawai baru ke dalam Sistem Informasi Perencanaan & Penganggaran AKSI PPATK.
          </p>
        </div>
      </div>

      {/* Alert Pesan Sukses / Error */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2 animate-in fade-in">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg} Mengalihkan ke daftar pengguna...</span>
        </div>
      )}

      {/* Form Card */}
      <div className="aksi-card p-6 md:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Kolom Nama Pegawai */}
          <div>
            <label className="text-xs font-bold text-[var(--text)] block mb-1.5">
              Nama Lengkap Pegawai <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Akhyar Effendi, S.E., M.M."
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
              Gunakan nama lengkap beserta gelar akademik/kedinasan resmi.
            </span>
          </div>

          {/* Kolom NIP / NRP */}
          <div>
            <label className="text-xs font-bold text-[var(--text)] block mb-1.5">
              NIP / NRP Pegawai <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 198602231993031001"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className="w-full text-xs font-mono px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
              Nomor Induk Pegawai 18 digit atau NRP resmi yang terdaftar di BKN/PPATK.
            </span>
          </div>

          {/* Kolom Jabatan */}
          <div>
            <label className="text-xs font-bold text-[var(--text)] block mb-1.5">
              Jabatan Pegawai <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kepala Pusat Pendidikan dan Pelatihan APU PPT"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            {/* Rekomendasi Jabatan Pejabat */}
            <div className="mt-2 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Pilih Cepat Nomenklatur Pejabat Resmi:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Kepala PPATK",
                  "Sekretaris Utama",
                  "Deputi Bidang Strategi dan Kerja Sama",
                  "Deputi Bidang Pelaporan dan Pengawasan Kepatuhan",
                  "Deputi Bidang Analisis dan Pemeriksaan",
                  "Inspektur PPATK",
                  "Kepala Pusat Pendidikan dan Pelatihan APU PPT",
                  "Kepala Pusat Teknologi Informasi",
                  "Kepala Biro Perencanaan dan Keuangan",
                  "Kepala Biro Umum",
                  "Direktur Hukum dan Regulasi",
                  "Direktur Pelaporan",
                ].map((j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => handlePilihRekomendasiJabatan(j)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    + {j}
                  </button>
                ))}
              </div>
            </div>

            {/* Indikator Deteksi Pejabat */}
            {isPejabat && (
              <div className="mt-2 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>
                  Jabatan terdeteksi sebagai <b>Pejabat Utama</b>. Pengguna ini otomatis akan ditampilkan pada menu <b>Data Pejabat PPATK</b>.
                </span>
              </div>
            )}
          </div>

          {/* Kolom Unit Kerja */}
          <div>
            <label className="text-xs font-bold text-[var(--text)] block mb-1.5">
              Unit Kerja PPATK <span className="text-red-500">*</span>
            </label>
            <select
              value={unitKerja}
              onChange={(e) => setUnitKerja(e.target.value)}
              className="w-full text-xs font-semibold px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {DAFTAR_UNIT_KERJA_PPATK.map((u) => (
                <option key={u.kode} value={u.labelLengkap}>
                  {u.labelLengkap}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
              Pilihan sesuai master data resmi Submenu Unit Kerja PPATK (16 Unit Eselon II dan 4 Deputi/Sestama).
            </span>
          </div>

          {/* Kolom Password */}
          <div>
            <label className="text-xs font-bold text-[var(--text)] block mb-1.5">
              Password Akun <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Masukkan kata sandi untuk akun ini..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs font-mono px-3.5 py-2.5 pr-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
              Disarankan menggunakan kombinasi minimal 8 karakter dengan huruf kapital, angka, dan simbol.
            </span>
          </div>

          {/* Kolom Status Awal */}
          <div>
            <label className="text-xs font-bold text-[var(--text)] block mb-1.5">
              Status Awal Pengguna
            </label>
            <div className="flex gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Offline"
                  checked={status === "Offline"}
                  onChange={() => setStatus("Offline")}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Offline (Standar)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Online"
                  checked={status === "Online"}
                  onChange={() => setStatus("Online")}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-emerald-600 font-bold">Online (Sedang Aktif)</span>
              </label>
            </div>
          </div>

          {/* Informasi Pengaturan Peran */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-[var(--text-muted)] flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[var(--text)]">Pengaturan Hak Akses & Peran:</span>
              <p className="mt-0.5 leading-relaxed">
                Pengguna baru akan diberikan peran awal <b>Operator Eselon II</b>. Penambahan atau penyesuaian peran multi-role (seperti BINCANG, Tim Perencanaan, Approver, dll.) dapat dilakukan di submenu <Link to="/admin/peran" className="underline font-bold text-indigo-600 dark:text-indigo-400">Hak Akses & Peran</Link>.
              </p>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/pengguna")}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-[var(--text)] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Pengguna Baru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
