"use client";

import { useEffect, useMemo, useState } from "react";

const DEADLINE_ET_ISO = "2026-03-19T12:00:00-04:00"; // March 19, 2026 12:00 PM ET

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function EntryCountdown() {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { closed, days, hours, minutes, seconds } = useMemo(() => {
    const deadline = new Date(DEADLINE_ET_ISO).getTime();
    const ms = deadline - now;

    if (ms <= 0) {
      return { closed: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const total = Math.floor(ms / 1000);
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    return { closed: false, days: d, hours: h, minutes: m, seconds: s };
  }, [now]);

  return (
    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="text-center">
        <div className="text-xs sm:text-sm font-bold tracking-widest text-slate-300 uppercase">
          Entries close in
        </div>

        {closed ? (
          <div className="mt-2 text-2xl sm:text-3xl font-black text-red-400">
            Entries are closed
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-center gap-3 sm:gap-4">
            <TimeBox label="DAYS" value={String(days)} />
            <Colon />
            <TimeBox label="HRS" value={pad(hours)} />
            <Colon />
            <TimeBox label="MIN" value={pad(minutes)} />
            <Colon />
            <TimeBox label="SEC" value={pad(seconds)} />
          </div>
        )}

        <div className="mt-3 text-[11px] text-slate-400">
          Deadline: March 19, 2026 • 12:00 PM ET
        </div>
      </div>
    </div>
  );
}

function TimeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[64px] sm:min-w-[80px] rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-center">
      <div className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl sm:text-4xl font-black text-red-500 tabular-nums">
        {value}
      </div>
    </div>
  );
}

function Colon() {
  return <div className="text-2xl sm:text-4xl font-black text-red-500">:</div>;
}
