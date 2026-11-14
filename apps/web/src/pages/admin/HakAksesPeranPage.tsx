/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Edit,
  Save,
  X,
  Lock,
  Sparkles,
  UserCheck,
  Building2
} from "lucide-react";
import {
  UserAccount,
  getStoredUsers,
  saveStoredUsers,
  DAFTAR_PERAN,
  PeranType,
  validateRoles,
  DAFTAR_UNIT_KERJA_PPATK
} from "../../data/userManagementData";

export default function HakAksesPeranPage() {
  const [users, setUsers] = useState<UserAccount[]>(getStoredUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnit, setFilterUnit] = useState("Semua");
  const [filterPeran, setFilterPeran] = useState("Semua");

  // State Modal Edit Peran
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [tempRoles, setTempRoles] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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
        u.unitKerja.toLowerCase().includes(searchQuery.toLowerCase());

      const matchUnit = filterUnit === "Semua" || u.unitKerja.includes(filterUnit);
      const matchPeran = filterPeran === "Semua" || u.peran.includes(filterPeran);

      return matchSearch && matchUnit && matchPeran;
    });
  }, [users, searchQuery, filterUnit, filterPeran]);

  // Buka Modal Edit Peran
  const handleOpenEditPeran = (u: UserAccount) => {
    setSelectedUser(u);
    setTempRoles([...u.peran]);
    setValidationError(null);
  };

  // Toggle Checkbox Peran dengan Aturan Bisnis
  const handleToggleRole = (role: PeranType) => {
    if (!selectedUser) return;
    setValidationError(null);

    const isCurrentlyChecked = tempRoles.includes(role);
    let nextRoles: string[] = [];

    if (isCurrentlyChecked) {
      // Hapus peran
      nextRoles = tempRoles.filter((r) => r !== role);
      if (nextRoles.length === 0) {
        setValidationError("Pengguna wajib memiliki minimal 1 (satu) peran aktif.");
        return;
      }
    } else {
      // Tambah peran
      // Validasi 1: Super Admin hanya untuk Isnen Hadi Al Ghozali
      if (
        role === "Super Admin" &&
        selectedUser.nama.trim().toLowerCase() !== "isnen hadi al ghozali"
      ) {
        setValidationError("Peran 'Super Admin' hanya dapat disematkan khusus pada user 'Isnen Hadi Al Ghozali'.");
        return;
      }

      // Validasi 2: Operator & Approver tidak dapat disematkan bersamaan
      const isOperator = role === "Operator Eselon I" || role === "Operator Eselon II";
      const isApprover = role === "Approver Eselon I" || role === "Approver Eselon II";

      if (isOperator) {
        const hasApprover = tempRoles.some((r) => r === "Approver Eselon I" || r === "Approver Eselon II");
        if (hasApprover) {
          setValidationError(
            "Pemisahan Tugas (Segregation of Duties): Peran 'Operator' dan 'Approver' tidak dapat disematkan pada pengguna yang sama secara bersamaan."
          );
          return;
        }
      }

      if (isApprover) {
        const hasOperator = tempRoles.some((r) => r === "Operator Eselon I" || r === "Operator Eselon II");
        if (hasOperator) {
          setValidationError(
            "Pemisahan Tugas (Segregation of Duties): Peran 'Operator' dan 'Approver' tidak dapat disematkan pada pengguna yang sama secara bersamaan."
          );
          return;
        }
      }

      nextRoles = [...tempRoles, role];
    }

    // Validasi akhir dengan helper
    const val = validateRoles(selectedUser.nama, nextRoles);
    if (!val.valid) {
      setValidationError(val.message || "Kombinasi peran tidak valid.");
      return;
    }

    setTempRoles(nextRoles);
  };

  // Simpan Peran Baru
  const handleSavePeran = () => {
    if (!selectedUser) return;

    if (tempRoles.length === 0) {
      setValidationError("Pengguna wajib memiliki minimal 1 peran aktif.");
      return;
    }

    const val = validateRoles(selectedUser.nama, tempRoles);
    if (!val.valid) {
      setValidationError(val.message || "Kombinasi peran tidak valid.");
      return;
    }

    const updated = users.map((u) => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          peran: tempRoles,
        };
      }
      return u;
    });

    setUsers(updated);
    saveStoredUsers(updated);
    setSuccessToast(`Hak akses & peran untuk ${selectedUser.nama} berhasil diperbarui.`);
    setSelectedUser(null);

    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary text-[0.65rem] font-bold">MANAJEMEN PENGGUNA</span>
            <span className="text-xs text-[var(--text-muted)]">Otorisasi & Keamanan Akses</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[var(--text)] flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            <span>Hak Akses & Peran Pengguna</span>
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] mt-0.5">
            Pengaturan peran berjenjang untuk pemisahan kewenangan perencanaan, penelaahan, pengawasan, dan persetujuan anggaran.
          </p>
        </div>

        <Link
          to="/admin/pengguna"
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Buka Daftar Pengguna</span>
          <span>→</span>
        </Link>
      </div>

      {/* Toast Notifikasi Sukses */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banner Aturan Bisnis & Segregation of Duties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 text-xs text-purple-900 dark:text-purple-200 space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-purple-800 dark:text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Multi-Role & Pemisahan Fungsi (SoD)</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Pengguna dapat memiliki <b>lebih dari 1 peran</b> (misal: BINCANG dan Tim Perencanaan). Namun, peran <b>Operator</b> dan <b>Approver</b> <u>tidak dapat</u> disematkan bersamaan pada satu pengguna guna menjamin integritas reviu berjenjang.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Otoritas Khusus Super Admin</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Peran <b>Super Admin</b> dengan kendali penuh sistem AKSI memiliki hak eksklusif dan <u>hanya dapat disematkan</u> pada akun <b>Isnen Hadi Al Ghozali</b>.
          </p>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="aksi-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari NIP, nama pegawai, atau unit..."
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
              <option value="Semua">Semua Unit</option>
              {DAFTAR_UNIT_KERJA_PPATK.map((u) => (
                <option key={u.kode} value={u.kode}>
                  {u.kode}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--text-muted)] font-medium">Peran:</span>
            <select
              value={filterPeran}
              onChange={(e) => setFilterPeran(e.target.value)}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none"
            >
              <option value="Semua">Semua Peran</option>
              {DAFTAR_PERAN.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabel NIP, Nama, Unit Kerja, dan Peran */}
      <div className="aksi-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--accent)] text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-3 w-44">NIP / NRP</th>
                <th className="py-3 px-3">Nama Pegawai</th>
                <th className="py-3 px-3">Unit Kerja PPATK</th>
                <th className="py-3 px-3">Peran yang Disematkan</th>
                <th className="py-3 px-3 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada data pengguna yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => {
                  const isSuperAdminUser = u.nama.trim().toLowerCase() === "isnen hadi al ghozali";
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
                        <span className="text-[11px] text-[var(--text-muted)]">{u.jabatan}</span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                        {u.unitKerja}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {u.peran.map((p) => (
                            <span
                              key={p}
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                                p === "Super Admin"
                                  ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300"
                                  : p.includes("Approver")
                                  ? "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300"
                                  : p === "BINCANG"
                                  ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300"
                                  : "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                              }`}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenEditPeran(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Kelola Peran</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL KELOLA PERAN PENGGUNA ─────────────────────────────────── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                  <Shield className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-[var(--text)]">Kelola Hak Akses & Peran</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {selectedUser.nama} (NIP: {selectedUser.nip})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alert Validasi Error */}
            {validationError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{validationError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text)]">Pilih Hak Akses / Peran Sistem:</span>
                <span className="text-slate-400">{tempRoles.length} Peran Terpilih</span>
              </div>

              {/* 9 Pilihan Peran Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {DAFTAR_PERAN.map((role) => {
                  const isChecked = tempRoles.includes(role);
                  const isSuperAdminRole = role === "Super Admin";
                  const isSuperAdminAllowed =
                    selectedUser.nama.trim().toLowerCase() === "isnen hadi al ghozali";

                  // Disabling logic
                  const isSuperAdminLocked = isSuperAdminRole && !isSuperAdminAllowed;

                  return (
                    <div
                      key={role}
                      onClick={() => {
                        if (!isSuperAdminLocked) {
                          handleToggleRole(role);
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer select-none ${
                        isSuperAdminLocked
                          ? "opacity-50 bg-slate-50 dark:bg-slate-800/40 border-slate-200 cursor-not-allowed"
                          : isChecked
                          ? "bg-purple-50/80 dark:bg-purple-950/50 border-purple-400 shadow-xs"
                          : "bg-white dark:bg-slate-900 border-[var(--border)] hover:bg-[var(--accent)]/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isSuperAdminLocked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-[var(--text)] block truncate">
                          {role}
                        </span>
                        {isSuperAdminLocked && (
                          <span className="text-[10px] text-amber-600 flex items-center gap-1 mt-0.5">
                            <Lock className="w-3 h-3" />
                            <span>Khusus Isnen Hadi Al Ghozali</span>
                          </span>
                        )}
                        {isChecked && (
                          <span className="text-[10px] text-purple-600 font-semibold block mt-0.5">
                            Aktif
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Catatan Ketentuan SoD */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-[var(--text-muted)] space-y-1">
                <span className="font-bold text-[var(--text)]">Catatan Kepatuhan Peran:</span>
                <p>• Peran Operator & Approver tidak dapat disematkan bersamaan.</p>
                <p>• Pengguna dapat memiliki lebih dari 1 peran teknis (misal: BINCANG + Tim Perencanaan).</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-[var(--text)] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePeran}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Peran</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
