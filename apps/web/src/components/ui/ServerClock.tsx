import { useState, useEffect } from "react";

export default function ServerClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client only (avoid SSR mismatch)
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) {
    // Placeholder saat loading / sebelum mount
    return (
      <div className="flex flex-col">
        <span className="text-[0.65rem] text-[var(--text-muted)] leading-none">Memuat...</span>
      </div>
    );
  }

  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[0.7rem] text-[var(--text-muted)] font-medium">{dateStr}</span>
      <span className="text-sm font-bold text-[var(--text)] tabular-nums">{timeStr}</span>
    </div>
  );
}
