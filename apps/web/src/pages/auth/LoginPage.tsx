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
  Sparkles,
  HelpCircle,
  FileCheck2,
  PieChart,
  Users2,
} from "lucide-react";
import { getStoredUsers } from "../../data/userManagementData";

interface CaptchaChallenge {
  type: "math" | "sequence" | "word" | "context" | "visual";
  question: string;
  answer: string | number;
  hint: string;
  badge?: string;
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

  // Dynamic CAPTCHA Generator (>1000 variasi unik)
  const [captchaChallenge, setCaptchaChallenge] = useState<CaptchaChallenge>({
    type: "math",
    question: "Berapa hasil dari 14 + 13?",
    answer: "27",
    hint: "Ketik angka jawaban yang benar",
    badge: "Matematika Anggaran",
  });
  const [captchaSeed, setCaptchaSeed] = useState(1);

  // Generator CAPTCHA algoritmis dengan ribuan kombinasi dinamis
  const generateCaptcha = () => {
    setCaptchaSeed((prev) => prev + 1);
    setCaptchaInput("");

    const category = Math.floor(Math.random() * 6);
    let challenge: CaptchaChallenge;

    if (category === 0) {
      // 1. Penjumlahan Anggaran / Angka Acak (10-89 + 10-89) -> 6400 variasi
      const a = Math.floor(Math.random() * 50) + 11;
      const b = Math.floor(Math.random() * 40) + 10;
      const contexts = [
        `Penjumlahan Pagu: ${a} Miliar + ${b} Miliar = [ ? ] Miliar`,
        `Hitung hasil alokasi: ${a} + ${b} = ...`,
        `Berapa total rencana belanja: ${a} + ${b}?`,
        `Verifikasi angka: ${a} ditambah ${b} adalah...`
      ];
      const q = contexts[Math.floor(Math.random() * contexts.length)];
      challenge = {
        type: "math",
        question: q,
        answer: (a + b).toString(),
        hint: "Ketik hasil penjumlahannya dalam angka",
        badge: "Penjumlahan Anggaran",
      };
    } else if (category === 1) {
      // 2. Pengurangan Anggaran (Sisa Pagu / Efisiensi) -> ribuan variasi
      const a = Math.floor(Math.random() * 60) + 40; // 40..99
      const b = Math.floor(Math.random() * 30) + 5;  // 5..34
      const contexts = [
        `Jika Pagu ${a} Miliar terealisasi ${b} Miliar, sisa pagu = [ ? ] Miliar`,
        `Hitung selisih efisiensi anggaran: ${a} - ${b} = ...`,
        `Berapa sisa pagu operasional dari ${a} dikurangi ${b}?`,
        `Verifikasi pengurangan: ${a} - ${b} = [ ? ]`
      ];
      const q = contexts[Math.floor(Math.random() * contexts.length)];
      challenge = {
        type: "math",
        question: q,
        answer: (a - b).toString(),
        hint: "Ketik angka selisihnya",
        badge: "Efisiensi Pagu",
      };
    } else if (category === 2) {
      // 3. Perkalian Ringkas Komponen Biaya -> ratusan variasi
      const a = Math.floor(Math.random() * 10) + 3; // 3..12
      const b = Math.floor(Math.random() * 8) + 2;  // 2..9
      const contexts = [
        `Pengadaan ${a} paket dengan biaya @ Rp ${b} Juta, totalnya [ ? ] Juta`,
        `Hitung perkalian volume kegiatan: ${a} x ${b} = ...`,
        `Berapa hasil dari ${a} dikali ${b}?`
      ];
      const q = contexts[Math.floor(Math.random() * contexts.length)];
      challenge = {
        type: "math",
        question: q,
        answer: (a * b).toString(),
        hint: "Ketik hasil perkaliannya",
        badge: "Volume Kegiatan",
      };
    } else if (category === 3) {
      // 4. Deret Angka Pola Perencanaan -> ratusan variasi
      const start = Math.floor(Math.random() * 30) + 5;
      const step = Math.floor(Math.random() * 8) + 2; // step 2..9
      const s1 = start;
      const s2 = s1 + step;
      const s3 = s2 + step;
      const s4 = s3 + step;
      challenge = {
        type: "sequence",
        question: `Lengkapi deret kode perencanaan: ${s1}, ${s2}, ${s3}, [ ? ]`,
        answer: s4.toString(),
        hint: `Lengkapi angka berikutnya (selisih +${step})`,
        badge: "Pola Deret Kode",
      };
    } else if (category === 4) {
      // 5. Alfanumerik Token Keamanan Acak (Anti-Bot) -> 10.000+ variasi
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      challenge = {
        type: "visual",
        question: `Ketik kode verifikasi keamanan: [ ${code} ]`,
        answer: code,
        hint: "Ketik persis 5 karakter huruf/angka di atas",
        badge: "Token Keamanan Acak",
      };
    } else {
      // 6. Logika Konteks Organisasi & Anggaran PPATK
      const contextPool = [
        {
          q: "Tahun Anggaran penyusunan Renja berjalan saat ini adalah TA [ ? ]",
          a: "2027",
          h: "Ketik 4 digit tahun perencanaan (2027)",
          b: "Tahun Anggaran",
        },
        {
          q: "Berapa jumlah Deputi (Eselon I teknis) di lingkungan PPATK? (Ketik angkanya)",
          a: "3",
          h: "Ketik angka 3 (TEGAS, PENGASUH, ASA)",
          b: "Struktur Organisasi",
        },
        {
          q: "Ketik singkatan Biro Perencanaan dan Keuangan PPATK (7 huruf)",
          a: "bincang",
          h: "Ketik BINCANG (huruf besar atau kecil)",
          b: "Singkatan Unit",
        },
        {
          q: "Ketik singkatan Inspektorat PPATK (4 huruf)",
          a: "peka",
          h: "Ketik PEKA (huruf besar atau kecil)",
          b: "Singkatan Unit",
        },
        {
          q: "Ketik singkatan Pusat Pendidikan dan Pelatihan APU PPT (5 huruf)",
          a: "patih",
          h: "Ketik PATIH (huruf besar atau kecil)",
          b: "Singkatan Unit",
        },
        {
          q: "Jumlah kuartal (triwulan) dalam satu siklus tahun anggaran adalah [ ? ]",
          a: "4",
          h: "Ketik angka 4",
          b: "Kalender Fiskal",
        },
        {
          q: "Kode status awal histori kertas kerja sebelum revisi adalah D0[ ? ]",
          a: "0",
          h: "Ketik angka 0 untuk kode D00",
          b: "Status Histori",
        },
        {
          q: "Singkatan dari Rencana Kerja Kementerian/Lembaga adalah [ ? ] (5 huruf)",
          a: "renja",
          h: "Ketik RENJA (huruf besar atau kecil)",
          b: "Perencanaan",
        },
        {
          q: "Singkatan dari Rencana Anggaran Biaya adalah [ ? ] (3 huruf)",
          a: "rab",
          h: "Ketik RAB (huruf besar atau kecil)",
          b: "Penganggaran",
        },
        {
          q: "Singkatan dari Kerangka Acuan Kerja adalah [ ? ] (3 huruf)",
          a: "kak",
          h: "Ketik KAK (huruf besar atau kecil)",
          b: "Kerangka Kerja",
        },
      ];
      const pick = contextPool[Math.floor(Math.random() * contextPool.length)];
      challenge = {
        type: "context",
        question: pick.q,
        answer: pick.a,
        hint: pick.h,
        badge: pick.b,
      };
    }

    setCaptchaChallenge(challenge);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Handle Submit Form Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Validasi CAPTCHA
    const cleanAnswer = String(captchaChallenge.answer).trim().toLowerCase();
    const cleanUserCaptcha = captchaInput.trim().toLowerCase();

    if (cleanUserCaptcha !== cleanAnswer) {
      setErrorMsg("Jawaban verifikasi keamanan (CAPTCHA) tidak sesuai. Silakan coba lagi.");
      generateCaptcha();
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = getStoredUsers();
      const cleanNip = nip.trim();

      // Cari user berdasarkan NIP atau nama
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
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 text-slate-800 font-sans relative overflow-hidden">
      {/* ── Background SVG Vector & Ambient Light Elements (Zero Copyright / Geometric) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft pastel ambient glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-200/40 rounded-full blur-[110px]"></div>
        <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] bg-purple-200/35 rounded-full blur-[130px]"></div>
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-emerald-100/50 rounded-full blur-[100px]"></div>

        {/* Crisp Subdued Grid Lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.4]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="light-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#light-grid)" />
        </svg>
      </div>

      {/* ── Sisi Kiri: Branding & Visual Infografis Elegan Tema Terang ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 z-10 border-r border-slate-200/80 bg-white/70 backdrop-blur-md">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/25 border border-white">
            <span className="text-white font-extrabold text-xl tracking-wider">A</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span>AKSI PPATK</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                TA 2027
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Sistem Informasi Perencanaan &amp; Penganggaran Terintegrasi
            </p>
          </div>
        </div>

        {/* Hero Visual Card / Modern Information Presentation */}
        <div className="my-auto py-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Presisi, Akuntabel, Transparan &amp; Bebas Konflik Kepentingan</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight text-slate-900 tracking-tight">
            Akselerasi Perencanaan, <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              Penganggaran &amp; Evaluasi Kinerja
            </span>
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
            Platform satu pintu penyusunan Rencana Kerja (Renja Eselon I &amp; II), Kerangka Acuan Kerja (KAK / TOR), dan Rencana Anggaran Biaya (RAB) Pusat Pelaporan dan Analisis Transaksi Keuangan.
          </p>

          {/* 3 Pillar Cards Tema Terang */}
          <div className="grid grid-cols-3 gap-3.5 pt-4 max-w-lg">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Kepatuhan SBM</h4>
              <p className="text-[10px] text-slate-500 leading-normal">Validasi otomatis plafon akun sesuai PMK Standar Biaya Masukan.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                <PieChart className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Cascading Kinerja</h4>
              <p className="text-[10px] text-slate-500 leading-normal">Pohon sasaran strategis dari Renstra institusi hingga level komponen.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                <Users2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Pemisahan Peran</h4>
              <p className="text-[10px] text-slate-500 leading-normal">Penegakan wewenang berjenjang antara Operator, Approver, &amp; BINCANG.</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-200/80 pt-4">
          <span>PPATK Republik Indonesia · Versi Produksi 1.0.0</span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Terkoneksi Aman SSL/TLS
          </span>
        </div>
      </div>

      {/* ── Sisi Kanan: Form Login Estetik & Modern (Tema Terang) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 z-10">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-9 space-y-6">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">AKSI PPATK</h1>
              <p className="text-xs text-slate-500">Perencanaan &amp; Penganggaran</p>
            </div>
          </div>

          {/* Judul Form */}
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Masuk ke Portal AKSI</span>
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </h2>
            <p className="text-xs text-slate-500">
              Silakan autentikasi menggunakan NIP/NRP dan kata sandi akun kedinasan Anda.
            </p>
          </div>

          {/* Alert Error */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Utama */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Field NIP / NRP */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>NIP / NRP Pegawai</span>
                <span className="text-[10px] text-slate-400 font-normal">18 Digit Angka Kedinasan</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Contoh: 199002272012101003"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                />
              </div>
            </div>

            {/* Field Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Kata Sandi Akun</span>
                <span className="text-[10px] text-indigo-600 font-semibold cursor-pointer hover:underline">
                  Lupa Sandi?
                </span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun Anda"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field Tahun Anggaran */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tahun Anggaran (TA)</span>
              </label>
              <select
                value={tahunAnggaran}
                onChange={(e) => setTahunAnggaran(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 cursor-pointer transition-all"
              >
                <option value="2025">TA 2025</option>
                <option value="2026">TA 2026</option>
                <option value="2027">TA 2027</option>
                <option value="2028">TA 2028</option>
              </select>
            </div>

            {/* ── CREATIVE CAPTCHA BOX (TEMA TERANG) ── */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-indigo-100 shadow-inner space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verifikasi Keamanan Interaktif</span>
                </span>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Ganti Soal CAPTCHA"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Segarkan</span>
                </button>
              </div>

              {/* Tampilan Visual Soal CAPTCHA */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center select-none space-y-1.5 shadow-xs">
                {captchaChallenge.badge && (
                  <div className="flex justify-center">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                      {captchaChallenge.badge}
                    </span>
                  </div>
                )}
                <p className="text-xs font-bold text-slate-800 tracking-wide font-mono">
                  {captchaChallenge.question}
                </p>
                <p className="text-[10px] text-indigo-600 font-medium italic">
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
                  placeholder="Ketik jawaban di sini..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-mono tracking-wider text-center"
                />
              </div>
            </div>

            {/* Tombol Submit Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white font-bold text-xs tracking-wide shadow-md shadow-indigo-600/25 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

          {/* Panduan Akun Resmi PPATK */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Sistem Keamanan Akun Terpusat
            </span>
            <span className="font-semibold text-indigo-600 cursor-pointer hover:underline">
              Bantuan Helpdesk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}