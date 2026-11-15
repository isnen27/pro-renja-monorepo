import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Building2,
  UserCheck,
  ArrowRight,
  LogOut,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  KeyRound,
} from "lucide-react";
import { UserAccount } from "../../data/userManagementData";

export default function PilihRolePage() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [activeTahun, setActiveTahun] = useState<string>("2027");

  useEffect(() => {
    try {
      const authUserStr = localStorage.getItem("aksi_auth_user");
      const tahunStr = localStorage.getItem("aksi_active_tahun") || "2027";
      setActiveTahun(tahunStr);

      if (authUserStr) {
        const parsed = JSON.parse(authUserStr) as UserAccount;
        setCurrentUser(parsed);
        if (parsed.peran && parsed.peran.length > 0) {
          // Ambil peran aktif yang sebelumnya tersimpan jika masih cocok, atau peran pertama
          const savedActiveRole = localStorage.getItem("renja_e2_user_role");
          if (savedActiveRole && parsed.peran.includes(savedActiveRole as any)) {
            setSelectedRole(savedActiveRole);
          } else {
            setSelectedRole(parsed.peran[0]);
          }
        }
      } else {
        // Jika belum ada session login, kembali ke halaman login
        navigate("/login");
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const handlePilihRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    // Simpan role terpilih ke sistem aktif aplikasi
    localStorage.setItem("renja_e2_user_role", selectedRole);
    window.dispatchEvent(new Event("renja_role_changed"));

    // Navigasikan ke dashboard
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("aksi_auth_user");
    navigate("/login");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0c1222] flex items-center justify-center text-slate-400">
        Memuat profil pengguna...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0c1222] text-slate-100 p-6 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10 space-y-6 backdrop-blur-xl">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md font-bold text-lg text-white">
              A
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AKSI PPATK</h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Pilih Peran &amp; Wewenang Akses
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Keluar dari Akun"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Ganti Akun</span>
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white truncate">{currentUser.nama}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                Terautentikasi
              </span>
            </div>
            <p className="text-xs text-indigo-300 font-medium truncate">{currentUser.jabatan}</p>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
              <span>NIP. {currentUser.nip}</span>
              <span>•</span>
              <span className="truncate">{currentUser.unitKerja}</span>
            </div>
          </div>
        </div>

        {/* Form Pilihan Role */}
        <form onSubmit={handlePilihRole} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Pilih Peran Operasional untuk Sesi Ini:</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Tersedia {currentUser.peran.length} Peran
              </span>
            </div>

            {/* List Pilihan Peran (Radio Grid) */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {currentUser.peran.map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <label
                    key={role}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-600/15 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                        : "bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="roleOption"
                      value={role}
                      checked={isSelected}
                      onChange={() => setSelectedRole(role)}
                      className="mt-1 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{role}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {role === "Super Admin"
                          ? "Hak akses penuh ke seluruh kluster menu, manajemen pengguna, dan notifikasi sistem."
                          : role.includes("Approver")
                          ? "Kewenangan penelaahan, persetujuan (approval), dan monitoring evaluasi dokumen."
                          : role.includes("Operator")
                          ? "Kewenangan pengisian kertas kerja isian Renja, KAK, dan penginputan RAB unit kerja."
                          : role === "BINCANG"
                          ? "Biro Perencanaan dan Keuangan: Penelaahan anggaran, monev revisi, RPD & konsolidasi instansi."
                          : role === "PEKA"
                          ? "Inspektorat: Audit kepatuhan, pengawasan internal, dan penelaahan tata kelola."
                          : "Peran fungsional perencanaan dan penganggaran terintegrasi."}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Info Tahun Anggaran Aktif */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tahun Anggaran Terpilih:</span>
            </span>
            <span className="font-bold text-white font-mono">TA {activeTahun}</span>
          </div>

          {/* Tombol Masuk Workspace */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-600/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Buka Lembar Kerja Sesuai Peran</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
