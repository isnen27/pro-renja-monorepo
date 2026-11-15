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
  ChevronRight,
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
        Memuat profil pengguna...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 text-slate-800 p-6 relative overflow-hidden font-sans">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/35 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-xl bg-white/95 border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-9 relative z-10 space-y-6 backdrop-blur-xl">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center shadow-md font-bold text-lg text-white">
              A
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AKSI PPATK</h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Pilih Peran &amp; Wewenang Akses
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200"
            title="Keluar dari Akun"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Ganti Akun</span>
          </button>
        </div>

        {/* User Profile Card (Tema Terang) */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0 shadow-xs">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 truncate">{currentUser.nama}</h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Terautentikasi
              </span>
            </div>
            <p className="text-xs text-indigo-700 font-medium truncate">{currentUser.jabatan}</p>
            <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-0.5">
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
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Pilih Peran Operasional untuk Sesi Ini:</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Tersedia {currentUser.peran.length} Peran Resmi
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
                        ? "bg-indigo-50/90 border-indigo-500 text-slate-900 shadow-sm"
                        : "bg-slate-50/60 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
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
                        <span className={`text-xs font-bold ${isSelected ? "text-indigo-900" : "text-slate-800"}`}>
                          {role}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                            Dipilih
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {role.includes("Operator")
                          ? "Kewenangan mengisi kertas kerja, menyusun TOR/RAB, dan mengajukan draf ke atasan."
                          : role.includes("Approver")
                          ? "Kewenangan menelaah, menyetujui (approval), dan menandatangani rancangan dokumen."
                          : role === "BINCANG"
                          ? "Kewenangan verifikasi teknis penganggaran, validasi SBM, penelaahan pagu & evaluasi."
                          : role === "Super Admin"
                          ? "Hak akses penuh ke seluruh modul, konfigurasi hak akses, dan manajemen sistem."
                          : "Kewenangan penelaahan dan pemantauan sesuai penugasan unit kerja."}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Sesi info */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Tahun Anggaran Aktif:
            </span>
            <span className="font-bold text-slate-900">{activeTahun} (Penyusunan)</span>
          </div>

          {/* Tombol Lanjutkan ke Dashboard */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white font-bold text-xs tracking-wide shadow-md shadow-indigo-600/25 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Masuk ke Dashboard ({selectedRole || "Pilih Peran"})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}