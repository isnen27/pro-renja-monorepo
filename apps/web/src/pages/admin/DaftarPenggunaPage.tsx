/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Shield,
  Building2,
  CheckCircle2,
  XCircle,
  KeyRound,
  EyeOff,
  AlertTriangle,
  Award,
  Sparkles,
  Info,
  X
} from "lucide-react";
import {
  UserAccount,
  getStoredUsers,
  saveStoredUsers,
  DAFTAR_UNIT_KERJA_PPATK,
  isPejabatJabatan,
  DAFTAR_PERAN
} from "../../data/userManagementData";

export default function DaftarPenggunaPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserAccount[]>(getStoredUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnit, setFilterUnit] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

  // State Modal Detail (Read)
  const [readUser, setReadUser] = useState<UserAccount | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // State Modal Edit
  const [editUser, setEditUser] = useState<UserAccount | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editNip, setEditNip] = useState("");
  const [editJabatan, setEditJabatan] = useState("");
  const [editUnitKerja, setEditUnitKerja] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editStatus, setEditStatus] = useState<"Online" | "Offline">("Offline");
  const [showEditPassword, setShowEditPassword] = useState(false);

  // State Dialog Hapus
  const [deleteUser, setDeleteUser] = useState<UserAccount | null>(null);

  // Sinkronisasi data antar tab/event
  useEffect(() => {
    const handleUpdate = () => {
      setUsers(getStoredUsers());
    };
    window.addEventListener("aksi_users_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("aksi_users_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Filter Data
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.nip.includes(searchQuery) ||
        u.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.unitKerja.toLowerCase().includes(searchQuery.toLowerCase());

      const matchUnit = filterUnit === "Semua" || u.unitKerja.includes(filterUnit);
      const matchStatus = filterStatus === "Semua" || u.status === filterStatus;

      return matchSearch && matchUnit && matchStatus;
    });
  }, [users, searchQuery, filterUnit, filterStatus]);

  // Handle Buka Modal Edit
  const handleOpenEdit = (user: UserAccount) => {
    setEditUser(user);
    setEditNama(user.nama);
    setEditNip(user.nip);
    setEditJabatan(user.jabatan);
    setEditUnitKerja(user.unitKerja);
    setEditPassword(user.password);
    setEditStatus(user.status);
    setShowEditPassword(false);
  };

  // Handle Simpan Edit (Kecuali Peran & Wewenang)
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    const updated = users.map((u) => {
      if (u.id === editUser.id) {
        return {
          ...u,
          nama: editNama.trim(),
          nip: editNip.trim(),
          jabatan: editJabatan.trim(),
          unitKerja: editUnitKerja,
          password: editPassword,
          status: editStatus,
        };
      }
      return u;
    });

    setUsers(updated);
    saveStoredUsers(updated);
    setEditUser(null);
  };

  // Handle Konfirmasi Hapus
  const handleConfirmDelete = () => {
    if (!deleteUser) return;
    const updated = users.filter((u) => u.id !== deleteUser.id);
    setUsers(updated);
    saveStoredUsers(updated);
    setDeleteUser(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary text-[0.65rem] font-bold">ADMINISTRASI & PENGGUNA</span>
            <span className="text-xs text-[var(--text-muted)]">Aplikasi AKSI PPATK</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[var(--text)] flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Daftar Pengguna & Role</span>
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] mt-0.5">
            Kelola master data akun pegawai, NIP, jabatan, unit kerja resmi, serta status online/offline sistem.
          </p>
        </div>

        {/* Tombol Create (Tambah Pengguna Baru) */}
        <button
          onClick={() => navigate("/admin/pengguna/tambah")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Banner Informasi Sinkronisasi Data Pejabat */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-blue-50/50 border border-indigo-200/80 text-xs text-indigo-900 dark:bg-slate-900 dark:border-indigo-900/60 dark:text-indigo-200 flex items-start gap-3 shadow-xs">
        <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Integrasi Otomatis ke Submenu Data Pejabat:
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Pengguna dengan jabatan <span className="font-bold text-indigo-700 dark:text-indigo-300">Kepala PPATK, Deputi, Kepala Pusat, Kepala Biro, atau Direktur</span> akan otomatis tersinkronisasi dan ditampilkan pada submenu <Link to="/referensi/pejabat" className="underline font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900">Data Pejabat</Link> sebagai penandatangan dokumen perencanaan dan anggaran resmi.
          </p>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="aksi-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, NIP, jabatan, atau unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[var(--text-muted)] font-medium">Unit:</span>
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none"
            >
              <option value="Semua">Semua Unit Kerja</option>
              {DAFTAR_UNIT_KERJA_PPATK.map((u) => (
                <option key={u.kode} value={u.kode}>
                  {u.kode}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--text-muted)] font-medium">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none"
            >
              <option value="Semua">Semua Status</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Pengguna */}
      <div className="aksi-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--accent)] text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-3 w-40">NIP / NRP</th>
                <th className="py-3 px-3">Nama Pegawai</th>
                <th className="py-3 px-3">Jabatan</th>
                <th className="py-3 px-3">Unit Kerja PPATK</th>
                <th className="py-3 px-3">Peran / Hak Akses</th>
                <th className="py-3 px-3 text-center w-24">Status</th>
                <th className="py-3 px-3 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data pengguna yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => {
                  const isPejabat = isPejabatJabatan(u.jabatan);
                  return (
                    <tr key={u.id} className="hover:bg-[var(--accent)]/40 transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[var(--text)]">
                        {u.nip}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-[var(--text)] block">{u.nama}</span>
                        {isPejabat && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                            <Award className="w-3 h-3" />
                            <span>Pejabat Penandatangan</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium text-[var(--text)]">
                        {u.jabatan}
                      </td>
                      <td className="py-3 px-3 text-[var(--text-muted)]">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {u.unitKerja}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.peran && u.peran.length > 0 ? (
                            u.peran.map((p) => (
                              <span
                                key={p}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  p === "Super Admin"
                                    ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300"
                                    : p.includes("Approver")
                                    ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300"
                                    : p === "BINCANG"
                                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                                }`}
                              >
                                {p}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Belum disematkan</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            u.status === "Online"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === "Online" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          <span>{u.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol Read */}
                          <button
                            onClick={() => {
                              setReadUser(u);
                              setShowPassword(false);
                            }}
                            title="Lihat Rincian Lengkap User (Read)"
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Edit */}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Edit Data User (Kecuali Peran)"
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Delete */}
                          <button
                            onClick={() => setDeleteUser(u)}
                            title="Hapus Pengguna (Delete)"
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL 1: READ (INFO LENGKAP USER) ───────────────────────────── */}
      {readUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <Eye className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-[var(--text)]">Kartu Rincian Pengguna</h3>
                  <p className="text-xs text-[var(--text-muted)]">Informasi profil lengkap akun di sistem AKSI</p>
                </div>
              </div>
              <button
                onClick={() => setReadUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-[var(--text-muted)] font-medium">Status Akun:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] ${
                    readUser.status === "Online"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${readUser.status === "Online" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  <span>{readUser.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 border-b border-[var(--border)]">
                <span className="text-[var(--text-muted)] font-medium">Nama Pegawai:</span>
                <span className="col-span-2 font-bold text-[var(--text)]">{readUser.nama}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 border-b border-[var(--border)]">
                <span className="text-[var(--text-muted)] font-medium">NIP / NRP:</span>
                <span className="col-span-2 font-mono font-semibold text-[var(--text)]">{readUser.nip}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 border-b border-[var(--border)]">
                <span className="text-[var(--text-muted)] font-medium">Jabatan:</span>
                <span className="col-span-2 font-semibold text-[var(--text)]">{readUser.jabatan}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 border-b border-[var(--border)]">
                <span className="text-[var(--text-muted)] font-medium">Unit Kerja PPATK:</span>
                <span className="col-span-2 font-semibold text-indigo-600 dark:text-indigo-400">{readUser.unitKerja}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 border-b border-[var(--border)] items-center">
                <span className="text-[var(--text-muted)] font-medium">Password Akun:</span>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="font-mono font-bold text-[var(--text)]">
                    {showPassword ? readUser.password : "••••••••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 border-b border-[var(--border)]">
                <span className="text-[var(--text-muted)] font-medium">Peran & Wewenang:</span>
                <div className="col-span-2 flex flex-wrap gap-1">
                  {readUser.peran.map((p) => (
                    <span key={p} className="badge badge-primary text-[10px]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1">
                <span className="text-[var(--text-muted)] font-medium">Aktivitas Terakhir:</span>
                <span className="col-span-2 text-slate-500">{readUser.terakhirLogin}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setReadUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-[var(--text)] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EDIT (SEMUA DATA BISA DIEDIT KECUALI PERAN) ─────────── */}
      {editUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                  <Edit className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-[var(--text)]">Edit Data Pengguna</h3>
                  <p className="text-xs text-[var(--text-muted)]">Perbarui NIP, Nama, Jabatan, Unit Kerja, & Password</p>
                </div>
              </div>
              <button
                onClick={() => setEditUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[var(--text)] block mb-1">
                  Nama Lengkap Pegawai <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--text)] block mb-1">
                  NIP / NRP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editNip}
                  onChange={(e) => setEditNip(e.target.value)}
                  className="w-full px-3 py-2 font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--text)] block mb-1">
                  Jabatan Pegawai <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editJabatan}
                  onChange={(e) => setEditJabatan(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="w-full min-w-0">
                <label className="font-bold text-[var(--text)] block mb-1">
                  Unit Kerja PPATK <span className="text-red-500">*</span>
                </label>
                <select
                  value={editUnitKerja}
                  onChange={(e) => setEditUnitKerja(e.target.value)}
                  className="w-full max-w-full truncate px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-xs cursor-pointer"
                  title={editUnitKerja}
                >
                  {DAFTAR_UNIT_KERJA_PPATK.map((u) => (
                    <option key={u.kode} value={u.labelLengkap}>
                      {u.labelLengkap}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 block truncate">
                  Pilihan terpilih: <span className="font-medium text-[var(--text)]">{editUnitKerja}</span>
                </span>
              </div>

              <div>
                <label className="font-bold text-[var(--text)] block mb-1">
                  Password Akun <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--text)] block mb-1">
                  Status Keaktifan
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as "Online" | "Offline")}
                  className="w-full max-w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              {/* Peringatan: Peran & Wewenang Terkunci */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Peran & Wewenang Tidak Dapat Diedit di Sini:</span>
                  <p className="mt-0.5">
                    Peran pengguna saat ini ({editUser.peran.join(", ")}). Perubahan peran dan wewenang pengguna hanya dapat dilakukan secara aman melalui submenu{" "}
                    <Link to="/admin/peran" className="underline font-bold text-indigo-700 dark:text-indigo-300">
                      Hak Akses & Peran
                    </Link>.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-[var(--text)] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: DELETE (KONFIRMASI HAPUS PENGGUNA) ─────────────────── */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <span className="p-3 rounded-2xl bg-red-50 dark:bg-red-950 text-red-600 flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-bold text-base text-[var(--text)]">Hapus Pengguna?</h3>
                <p className="text-xs text-[var(--text-muted)]">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Apakah Anda yakin ingin menghapus akun pegawai{" "}
              <span className="font-bold text-[var(--text)]">{deleteUser.nama}</span> (NIP: {deleteUser.nip}) dari sistem AKSI PPATK?
            </p>

            <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setDeleteUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-[var(--text)] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all cursor-pointer"
              >
                Hapus Pengguna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
