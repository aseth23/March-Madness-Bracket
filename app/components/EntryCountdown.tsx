"use client";

import { useEffect, useMemo, useState } from "react";

const DEADLINE_ET_ISO = "2026-03-19T12:00:00-04:00"; // March 19, 2026 12:00 PM ET

export default function EntryCountdown() {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { text, closed } = useMemo(() => {
    const deadline = new Date(DEADLINE_ET_ISO).getTime();
    const ms = deadline - now;

    if (ms <= 0) return { text: "Entries are closed", closed: true };

    const total = Math.floor(ms / 1000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    const parts = [
      days > 0 ? `${days}d` : null,
      `${hours}h`,
      `${minutes}m`,
      `${seconds}s`,
    ].filter(Boolean);

    return { text: `Entries close in ${parts.join(" ")}`, closed: false };
  }, [now]);

  return (
    <div
      className={[
        "mt-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs",
        closed
          ? "border-red-800 bg-red-950/40 text-red-200"
          : "border-slate-800 bg-slate-900/60 text-slate-200",
      ].join(" ")}
    >
      <span className={closed ? "text-red-300" : "text-green-300"}>●</span>
      <span className="font-semibold">{text}</span>
      <span className="text-slate-400">(ET)</span>
    </div>
  );
}
