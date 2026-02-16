"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RESULTS, ROUND_POINTS } from "@/app/results/resultsData";

type Entry = {
  id: string | number;
  name: string;
  username: string | null;
  locked: boolean;
  bracket: Record<string, string> | null;
};

type Row = {
  id: string;
  name: string;
  username: string | null;
  score: number;
  locked: boolean;
};

function pointsForGameId(gameId: string): number {
  if (gameId === "FF_CHAMP") return ROUND_POINTS["CHAMP"];
  if (gameId.startsWith("FF_")) return ROUND_POINTS["FF"];
  if (gameId.includes("_64_")) return ROUND_POINTS["64"];
  if (gameId.includes("_32_")) return ROUND_POINTS["32"];
  if (gameId.includes("_S16_")) return ROUND_POINTS["S16"];
  if (gameId.includes("_E8_")) return ROUND_POINTS["E8"];
  return 0;
}

function scoreBracket(picks: Record<string, string>): number {
  let score = 0;
  for (const [gameId, correct] of Object.entries(RESULTS)) {
    if (picks?.[gameId] && picks[gameId] === correct) {
      score += pointsForGameId(gameId);
    }
  }
  return score;
}

export default function LeaderboardPage() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [entries, setEntries] = useState<Entry[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    if (!API) {
      setMsg("Missing NEXT_PUBLIC_API_BASE_URL (Vercel env var not set).");
      return;
    }

    setMsg(null);

    try {
      const res = await fetch(`${API}/entries`, { cache: "no-store" });
      const data = await res.json().catch(() => []);

      if (!res.ok) {
        setMsg(`Error loading entries: ${res.status}`);
        return;
      }

      const list: Entry[] = Array.isArray(data) ? data : data?.entries ?? [];
      setEntries(list);
      setMsg(null);
    } catch {
      setMsg("Network error loading leaderboard. API may be sleeping or blocked by CORS.");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // ✅ every 30 seconds
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows: Row[] = useMemo(() => {
    const mapped: Row[] = (entries ?? []).map((e) => {
      const id = String(e.id);
      const picks = e.bracket ?? {};
      const score = scoreBracket(picks);
      return {
        id,
        name: e.name ?? id,
        username: e.username ?? null,
        score,
        locked: !!e.locked,
      };
    });

    mapped.sort((a, b) => b.score - a.score);
    return mapped;
  }, [entries]);

  return (
    <div className="min-h-screen p-6 bg-[#020617] text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Live Standings</h1>
            <p className="text-sm text-slate-400 mt-1">Auto-refreshes every 30 seconds.</p>
          </div>

          <button
            onClick={load}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Refresh now
          </button>
        </div>

        {msg && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm">
            {msg}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/60">
              <tr>
                <th className="text-left p-3 w-16">Rank</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Username</th>
                <th className="text-left p-3 w-24">Score</th>
                <th className="text-left p-3 w-24">Locked</th>
                <th className="text-left p-3 w-28">View</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.id} className="border-t border-slate-800">
                  <td className="p-3">{idx + 1}</td>

                  <td className="p-3">
                    <Link
                      href={`/bracket/view?id=${encodeURIComponent(String(r.id))}`}
                      className="font-semibold hover:underline text-slate-100"
                    >
                      {r.name}
                    </Link>
                  </td>

                  <td className="p-3 text-slate-300">{r.username ?? "—"}</td>
                  <td className="p-3 font-bold">{r.score}</td>
                  <td className="p-3">{r.locked ? "Yes" : "No"}</td>

                  <td className="p-3">
                    <Link
                      href={`/bracket/view?id=${encodeURIComponent(String(r.id))}`}
                      className="inline-block rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 hover:bg-slate-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td className="p-3 text-slate-400" colSpan={6}>
                    No entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-sm text-slate-400">
          Open <span className="font-mono">/create</span> to enter,{" "}
          <span className="font-mono">/bracket</span> to make picks.
        </div>
      </div>
    </div>
  );
}
