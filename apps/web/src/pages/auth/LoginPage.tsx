import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  User,
  Calendar,
  RefreshCw,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  HelpCircle,
  Layers,
} from "lucide-react";
import { getStoredUsers, UserAccount } from "../../data/userManagementData";

interface CaptchaChallenge {
  type: "math" | "color" | "sequence";
  question: string;
  answer: string | number;
  hint: string;
  options?: string[];
}

export default function LoginPage() {
  const navigate = useNavigate();

  // Form State
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [tahunAnggaran, setTahunAnggaran] = useState("2027");
  const [captchaInput, setCaptchaInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Error
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Creative CAPTCHA System
  const [captchaChallenge, setCaptchaChallenge] = useState<CaptchaChallenge>({
    type: "math",
    question: "Berapa hasil dari 14 + 13?",
    answer: "27",
    hint: "Ketik angka jawaban yang benar",
  });
  const [captchaSeed, setCaptchaSeed] = useState(1);

  const generateCaptcha = () => {
    const types = ["math", "color", "sequence", "antigravity"] as const;
    const chosen = types[Math.floor(Math.random() * types.length)];

    if (chosen === "math") {
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 15) + 3;
      setCaptchaChallenge({
        type: "math",
        question: `Hitung keamanan: Berapa ${a} + ${b}?`,
        answer: String(a + b),
        hint: "Jawab dengan angka hasil penjumlahan",
      });
    } else if (chosen === "color") {
      const colors = [
        { code: "BIRU", answer: "biru", hex: "#2563eb" },
        { code: "EMAS", answer: "emas", hex: "#d97706" },
        { code: "HIJAU", answer: "hijau", hex: "#059669" },
        { code: "UNGU", answer: "ungu", hex: "#7c3aed" },
      ];
      const selected = colors[Math.floor(Math.random() * colors.length)];
      setCaptchaChallenge({
        type: "color",
        question: `Konfirmasi warna: Ketik kata "${selected.code}" dalam huruf kecil`,
        answer: selected.answer,
        hint: `Ketik "${selected.answer}" untuk validasi human-check`,
      });
    } else if (chosen === "sequence") {
      const start = Math.floor(Math.random() * 10) + 2;
      const step = 2;
      const s1 = start;
      const s2 = start + step;
      const s3 = start + step * 2;
      const ans = start + step * 3;
      setCaptchaChallenge({
        type: "sequence",
        question: `Lengkapi pola angka: ${s1}, ${s2}, ${s3}, ...?`,
        answer: String(ans),
        hint: "Ketik angka selanjutnya pada deret",
      });
    } else {
      const keywords = ["PPATK", "AKSI27", "INTEGRITAS", "AKUNTABEL", "RENJA"];
      const word = keywords[Math.floor(Math.random() * keywords.length)];
      setCaptchaChallenge({
        type: "math",
        question: `Ketik kode verifikasi: "${word}"`,
        answer: word.toLowerCase(),
        hint: "Ketik ulang kata di atas (bebas huruf besar/kecil)",
      });
    }
    setCaptchaInput("");
    setCaptchaSeed((s) => s + 1);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nip.trim()) {
      setErrorMsg("NIP / NRP wajib diisi.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Password wajib diisi.");
      return;
    }
    if (!captchaInput.trim()) {
      setErrorMsg("Harap selesaikan kode CAPTCHA verifikasi.");
      return;
    }

    // Verifikasi CAPTCHA
    const cleanInput = captchaInput.trim().toLowerCase();
    const cleanAnswer = String(captchaChallenge.answer).trim().toLowerCase();
    if (cleanInput !== cleanAnswer) {
      setErrorMsg("Jawaban CAPTCHA tidak sesuai. Silakan coba kembali.");
      generateCaptcha();
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Validasi akun dari localStorage / master users
      const users = getStoredUsers();
      const cleanNip = nip.trim();

      // Cari user berdasarkan NIP atau nama (case-insensitive)
      const foundUser = users.find(
        (u) =>
          u.nip.trim() === cleanNip ||
          u.nama.toLowerCase().includes(cleanNip.toLowerCase())
      );

      if (!foundUser) {
        setLoading(false);
        setErrorMsg("Akun dengan NIP tersebut tidak terdaftar di sistem AKSI.");
        return;
      }

      // Cek password
      if (foundUser.password !== password) {
        setLoading(false);
        setErrorMsg("Password yang Anda masukkan salah.");
        return;
      }

      // Simpan session pengguna yang berhasil diverifikasi
      localStorage.setItem("aksi_auth_user", JSON.stringify(foundUser));
      localStorage.setItem("aksi_active_tahun", tahunAnggaran);

      setLoading(false);

      // Alihkan ke halaman pemilihan role
      navigate("/pilih-role");
    }, 700);
  };

  // Quick fill demo accounts
  const handleQuickDemo = (user: UserAccount) => {
    setNip(user.nip);
    setPassword(user.password);
    setCaptchaInput(String(captchaChallenge.answer));
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0c1222] text-slate-100 font-sans relative overflow-hidden">
      {/* ── Background SVG Vector & Abstract Waves (Zero Copyright / Generated) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Radial glow effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-[128px]"></div>
        <div className="absolute top-1/2 -right-40 w-[32rem] h-[32rem] bg-purple-600/20 rounded-full blur-[140px]"></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-emerald-600/20 rounded-full blur-[120px]"></div>

        {/* Ambient SVG Geometric Lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.07]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* ── Sisi Kiri: Branding & Visual Infografis Elegan ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 z-10 border-r border-slate-800/80 bg-gradient-to-br from-[#0f172a]/95 via-[#0b1329]/80 to-[#020617]/95">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20">
            <span className="text-white font-extrabold text-xl tracking-wider">A</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>AKSI PPATK</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                TA 2027
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Sistem Informasi Perencanaan &amp; Penganggaran Terintegrasi
            </p>
          </div>
        </div>

        {/* Hero Visual Card / Vector Mockup */}
        <div className="my-auto py-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Modern, Presisi, Akuntabel &amp; Bebas Konflik Kepentingan</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight text-white tracking-tight">
            Akselerasi Perencanaan, <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Penganggaran &amp; Evaluasi Kinerja
            </span>
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
            Platform satu pintu penyusunan Rencana Kerja (Renja Eselon I &amp; II), Kerangka Acuan Kerja (KAK / TOR), dan Rencana Anggaran Biaya (RAB) Pusat Pelaporan dan Analisis Transaksi Keuangan.
          </p>

          {/* 3 Pillar Cards */}
          <div className="grid grid-cols-3 gap-3 pt-4 max-w-lg">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-1">
              <span className="text-indigo-400 font-mono font-bold text-lg">01</span>
              <h4 className="text-xs font-bold text-slate-200">Kepatuhan SBM</h4>
              <p className="text-[10px] text-slate-400">Validasi otomatis PMK Standar Biaya Masukan.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-1">
              <span className="text-purple-400 font-mono font-bold text-lg">02</span>
              <h4 className="text-xs font-bold text-slate-200">Cascading Kinerja</h4>
              <p className="text-[10px] text-slate-400">Pohon sasaran strategi institusi hingga output.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-1">
              <span className="text-emerald-400 font-mono font-bold text-lg">03</span>
              <h4 className="text-xs font-bold text-slate-200">Segregation of Duties</h4>
              <p className="text-[10px] text-slate-400">Pemisahan peran operator &amp; approver resmi.</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-4">
          <span>PPATK Indonesia · Versi Produksi 1.0.0</span>
          <span>Keamanan Data Terenkripsi SSL/TLS</span>
        </div>
      </div>

      {/* ── Sisi Kanan: Form Login Estetik ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-white">AKSI PPATK</h1>
              <p className="text-xs text-slate-400">Perencanaan &amp; Penganggaran</p>
            </div>
          </div>

          {/* Judul Form */}
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Masuk ke Portal AKSI</span>
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Silakan autentikasi menggunakan NIP/NRP dan kata sandi akun kedinasan Anda.
            </p>
          </div>

          {/* Alert Error */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Utama */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Field NIP / NRP */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>NIP / NRP Pegawai</span>
                <span className="text-[10px] text-slate-500">18 Digit Angka</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Contoh: 199008152014031001"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Field Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Kata Sandi</span>
                <span className="text-[10px] text-indigo-400 cursor-pointer hover:underline">
                  Lupa Sandi?
                </span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun Anda"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field Tahun Anggaran */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tahun Anggaran (TA)</span>
              </label>
              <select
                value={tahunAnggaran}
                onChange={(e) => setTahunAnggaran(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="2027">Tahun Anggaran 2027 (Penyusunan Berjalan)</option>
                <option value="2026">Tahun Anggaran 2026 (Pelaksanaan DIPA)</option>
                <option value="2025">Tahun Anggaran 2025 (Arsip Histori)</option>
              </select>
            </div>

            {/* ── CREATIVE CAPTCHA BOX ── */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-900/50 shadow-inner space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verifikasi Keamanan Interaktif</span>
                </span>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Ganti Soal CAPTCHA"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Segarkan</span>
                </button>
              </div>

              {/* Tampilan Visual Soal CAPTCHA */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-center select-none space-y-1">
                <p className="text-xs font-bold text-slate-200 tracking-wide">
                  {captchaChallenge.question}
                </p>
                <p className="text-[10px] text-indigo-400/90 font-medium italic">
                  💡 {captchaChallenge.hint}
                </p>
              </div>

              {/* Input Jawaban CAPTCHA */}
              <div className="relative">
                <input
                  type="text"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Ketik jawaban CAPTCHA di sini..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono tracking-wider text-center"
                />
              </div>
            </div>

            {/* Tombol Submit Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akses Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Akun Pegawai</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Selector untuk memudahkan pengujian */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Pilih Cepat Akun Demo (Simulasi Login):
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {getStoredUsers().slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickDemo(u)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 truncate text-left transition-colors cursor-pointer"
                  title={`${u.nama} (${u.peran.join(", ")})`}
                >
                  <span className="font-bold text-white block truncate">{u.nama.split(",")[0]}</span>
                  <span className="text-slate-500 block truncate">{u.peran[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
