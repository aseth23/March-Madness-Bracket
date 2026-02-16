"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BRACKET_2026_PLACEHOLDER } from "@/app/bracket/bracketData";
import { RESULTS, ROUND_POINTS } from "@/app/results/resultsData";

type Entry = {
  id: string | number;
  name: string;
  username: string | null;
  locked: boolean;
  bracket: Record<string, string> | null;
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

function scoreBracket(picks: Record<string, string>) {
  let score = 0;
  for (const [gameId, correct] of Object.entries(RESULTS)) {
    if (picks?.[gameId] && picks[gameId] === correct) score += pointsForGameId(gameId);
  }
  return score;
}

function entropy(pA: number, pB: number) {
  // Shannon entropy in bits (0..1 for binary-ish when normalized)
  const h = (p: number) => (p <= 0 ? 0 : -p * Math.log2(p));
  const H = h(pA) + h(pB);
  // max for two outcomes occurs at 0.5/0.5 => 1 bit
  return H; // 0..1
}

export default function AnalyticsPage() {
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
    } catch {
      setMsg("Network error loading analytics.");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allGameIds = useMemo(() => {
    // Collect game IDs from your bracketData round64; derived rounds use ids like Region_32_0 etc.
    // We'll analyze games that appear in RESULTS (cleanest).
    return Object.keys(RESULTS);
  }, []);

  const computed = useMemo(() => {
    const n = entries.length;

    // Flatten picks
    const picksByEntry = entries.map((e) => ({
      id: String(e.id),
      name: e.name ?? String(e.id),
      username: e.username ?? null,
      locked: !!e.locked,
      picks: e.bracket ?? {},
    }));

    // Scores
    const scores = picksByEntry.map((e) => ({
      ...e,
      score: scoreBracket(e.picks),
    }));

    const avgScore = n ? scores.reduce((a, b) => a + b.score, 0) / n : 0;

    // Champion distribution (FF_CHAMP)
    const champCounts = new Map<string, number>();
    for (const e of picksByEntry) {
      const champ = e.picks["FF_CHAMP"];
      if (!champ) continue;
      champCounts.set(champ, (champCounts.get(champ) ?? 0) + 1);
    }
    const champTop = [...champCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([teamKey, count]) => ({ teamKey, count, pct: n ? (count / n) * 100 : 0 }));

    const mostPickedChampion = champTop[0]?.teamKey ?? null;
    const mostPickedChampionPct = champTop[0]?.pct ?? 0;

    // Pick distributions per game (only for gameIds in RESULTS)
    const gameDistributions = allGameIds.map((gameId) => {
      const counts = new Map<string, number>();
      let total = 0;

      for (const e of picksByEntry) {
        const pick = e.picks[gameId];
        if (!pick) continue;
        total += 1;
        counts.set(pick, (counts.get(pick) ?? 0) + 1);
      }

      const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
      const top1 = sorted[0] ?? null;
      const top2 = sorted[1] ?? null;

      const p1 = top1 && total ? top1[1] / total : 0;
      const p2 = top2 && total ? top2[1] / total : 0;

      const correct = RESULTS[gameId] ?? null;
      const correctCount = correct ? (counts.get(correct) ?? 0) : 0;
      const correctPct = total ? (correctCount / total) * 100 : 0;

      return {
        gameId,
        total,
        topPick: top1 ? top1[0] : null,
        topPct: total && top1 ? (top1[1] / total) * 100 : 0,
        secondPick: top2 ? top2[0] : null,
        secondPct: total && top2 ? (top2[1] / total) * 100 : 0,
        entropy: entropy(p1, p2),
        correct,
        correctPct,
      };
    });

    // Contrarian score = sum of (1 - pick_pct_for_that_game)
    // Higher = picked less common outcomes more often
    // We compute pick pct per game per pick once:
    const pctLookup = new Map<string, Map<string, number>>(); // gameId -> (pick -> pct)
    for (const gd of gameDistributions) {
      const map = new Map<string, number>();
      // rebuild from counts by rescanning once (cheap enough at Stevens scale)
      // (Alternative: store counts above; keeping simple)
      for (const e of picksByEntry) {
        const pick = e.picks[gd.gameId];
        if (!pick) continue;
        // count how many chose this pick
      }
      // We'll compute properly by using another pass with counts:
      const counts = new Map<string, number>();
      let total = 0;
      for (const e of picksByEntry) {
        const pick = e.picks[gd.gameId];
        if (!pick) continue;
        total++;
        counts.set(pick, (counts.get(pick) ?? 0) + 1);
      }
      for (const [k, c] of counts.entries()) map.set(k, total ? c / total : 0);
      pctLookup.set(gd.gameId, map);
    }

    const contrarian = scores
      .map((e) => {
        let uniq = 0;
        for (const gameId of allGameIds) {
          const pick = e.picks[gameId];
          if (!pick) continue;
          const pct = pctLookup.get(gameId)?.get(pick) ?? 0;
          uniq += 1 - pct;
        }
        return { ...e, uniqueness: uniq };
      })
      .sort((a, b) => b.uniqueness - a.uniqueness)
      .slice(0, 15);

    // Most “coinflip” games (highest entropy)
    const mostSplit = [...gameDistributions]
      .filter((g) => g.total > 0)
      .sort((a, b) => b.entropy - a.entropy)
      .slice(0, 12);

    return {
      n,
      avgScore,
      champTop,
      mostPickedChampion,
      mostPickedChampionPct,
      mostSplit,
      contrarian,
    };
  }, [entries, allGameIds]);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">Analytics</h1>
            <p className="text-sm text-slate-400 mt-1">Auto-refreshes every 30 seconds.</p>
          </div>
          <Link
            href="/leaderboard"
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Back to standings
          </Link>
        </div>

        {msg && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm">
            {msg}
          </div>
        )}

        {/* Overview */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total entries" value={String(computed.n)} />
          <StatCard label="Average score" value={computed.n ? computed.avgScore.toFixed(1) : "0.0"} />
          <StatCard
            label="Most picked champion"
            value={
              computed.mostPickedChampion
                ? `${computed.mostPickedChampion} (${computed.mostPickedChampionPct.toFixed(1)}%)`
                : "—"
            }
          />
        </div>

        {/* Champion distribution */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
          <div className="text-sm font-bold mb-3">Champion pick distribution</div>
          <div className="space-y-2">
            {computed.champTop.length === 0 ? (
              <div className="text-sm text-slate-400">No champion picks yet.</div>
            ) : (
              computed.champTop.map((x) => (
                <BarRow key={x.teamKey} label={x.teamKey} pct={x.pct} />
              ))
            )}
          </div>
        </div>

        {/* Most split games */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
          <div className="text-sm font-bold mb-3">Most split games (highest disagreement)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {computed.mostSplit.map((g) => (
              <div key={g.gameId} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                <div className="text-xs text-slate-400 font-mono">{g.gameId}</div>
                <div className="mt-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-200">{g.topPick ?? "—"}</span>
                    <span className="font-bold">{g.topPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-slate-300 mt-1">
                    <span>{g.secondPick ?? "—"}</span>
                    <span>{g.secondPct.toFixed(1)}%</span>
                  </div>
                </div>
                {g.correct && (
                  <div className="mt-2 text-xs text-slate-400">
                    Correct: <span className="text-slate-200 font-mono">{g.correct}</span>{" "}
                    <span className="ml-2">({g.correctPct.toFixed(1)}% picked)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contrarian */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
          <div className="text-sm font-bold mb-3">Most contrarian brackets</div>
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-950/60">
                <tr>
                  <th className="text-left p-3">Rank</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Score</th>
                  <th className="text-left p-3">Uniqueness</th>
                  <th className="text-left p-3">View</th>
                </tr>
              </thead>
              <tbody>
                {computed.contrarian.map((e, idx) => (
                  <tr key={e.id} className="border-t border-slate-800">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-semibold">{e.name}</div>
                      <div className="text-xs text-slate-400">{e.username ? `@${e.username}` : "—"}</div>
                    </td>
                    <td className="p-3 font-bold">{e.score}</td>
                    <td className="p-3">{e.uniqueness.toFixed(2)}</td>
                    <td className="p-3">
                      <Link
                        href={`/bracket/view?id=${encodeURIComponent(String(e.id))}`}
                        className="inline-block rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 hover:bg-slate-800"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {computed.contrarian.length === 0 && (
                  <tr>
                    <td className="p-3 text-slate-400" colSpan={5}>
                      No data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Uniqueness = sum over games of (1 − pick popularity). Higher means more contrarian.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="text-xs text-slate-400 font-bold tracking-widest uppercase">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}

function BarRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-44 text-xs text-slate-200 font-mono truncate">{label}</div>
      <div className="flex-1 h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="h-full bg-red-600" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
      <div className="w-16 text-right text-xs font-bold">{pct.toFixed(1)}%</div>
    </div>
  );
}
