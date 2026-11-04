import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function ServerClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <Clock className="w-3.5 h-3.5 animate-spin" />
        <span>Memuat waktu server...</span>
      </div>
    );
  }

  // Format: Rabu, 4 November 2026 15:31:30 (Waktu Server)
  const dayStr = now.toLocaleDateString("id-ID", { weekday: "long" });
  const dateStr = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-[var(--text-muted)] tracking-tight">
      <Clock className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
      <span className="tabular-nums">
        {dayStr}, {dateStr} {timeStr}
      </span>
      <span className="text-[10px] text-[var(--text-muted)] opacity-80">(Waktu Server)</span>
    </div>
  );
}
