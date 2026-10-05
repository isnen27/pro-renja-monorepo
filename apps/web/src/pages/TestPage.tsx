export default function TestPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 aksi-card text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--primary-bg)] text-[var(--primary)] flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">
        ✓
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[var(--text)]">Test Page</h1>
      <p className="text-sm md:text-base text-[var(--text-muted)] max-w-lg">
        Jika Anda melihat halaman ini, berarti setup aplikasi AKSI berjalan dengan baik!
      </p>
    </div>
  );
}
