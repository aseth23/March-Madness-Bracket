"use client";

import { useEffect, useMemo, useState } from "react";

export default function EntryCountdown() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [deadlineIso, setDeadlineIso] = useState<string | null>(null);
  const [passed, setPassed] = useState<boolean>(false);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!API) return;

    (async () => {
      try {
        const res = await fetch(`${API}/meta`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setDeadlineIso(data?.deadline_et ?? null);
          setPassed(!!data?.deadline_passed);
        }
      } catch {
        // ignore
      }
    })();
  }, [API]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const text = useMemo(() => {
    if (!deadlineIso) return "Loading entry deadline…";

    const deadline = new Date(deadlineIso).getTime();
    const ms = deadline - now;

    if (passed || ms <= 0) return "Entries are closed";

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

    return `Entries close in ${parts.join(" ")}`;
  }, [deadlineIso, now, passed]);

  const closed =
    passed || (deadlineIso ? new Date(deadlineIso).getTime() - now <= 0 : false);

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
