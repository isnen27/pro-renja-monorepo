import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Sinkronisasi dengan theme yang sudah di-set oleh ThemeInitScript
  useEffect(() => {
    const html = document.documentElement;
    setIsDark(html.classList.contains("dark"));

    // Observe perubahan class di html (misal dari toggle lain)
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const html = document.documentElement;
    const newDark = !isDark;
    html.classList.remove("light", "dark");
    html.classList.add(newDark ? "dark" : "light");
    localStorage.setItem("aksi-theme", newDark ? "dark" : "light");
    setIsDark(newDark);
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
      className={`
        relative flex items-center w-12 h-6 rounded-full border transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 cursor-pointer
        ${isDark
          ? "bg-slate-700 border-slate-600"
          : "bg-slate-100 border-slate-200"
        }
      `}
    >
      {/* Sun icon */}
      <Sun className={`absolute left-1 h-3.5 w-3.5 transition-all duration-300 ${isDark ? "opacity-20 text-slate-400" : "opacity-100 text-amber-500"}`} />
      {/* Moon icon */}
      <Moon className={`absolute right-1 h-3.5 w-3.5 transition-all duration-300 ${isDark ? "opacity-100 text-blue-400" : "opacity-20 text-slate-400"}`} />
      {/* Thumb */}
      <span
        className={`
          absolute w-4 h-4 rounded-full shadow-sm transition-all duration-300
          ${isDark ? "translate-x-7 bg-blue-400" : "translate-x-1 bg-white"}
        `}
      />
    </button>
  );
}
