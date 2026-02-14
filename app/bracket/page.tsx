"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BRACKET_2026_PLACEHOLDER, type RegionGame } from "./bracketData";
import { scoreBracket } from "@/lib/scoring";

const ROUNDS = [
  { name: "64", games: 8, spacing: "gap-4" },
  { name: "32", games: 4, spacing: "gap-12" },
  { name: "S16", games: 2, spacing: "gap-32" },
  { name: "E8", games: 1, spacing: "gap-0" },
];

type Team = { seed: number; name: string };
type UIRegion = { name: string; round64: RegionGame[] };

type UIGame = {
  id: string;
  teamA: Team | null;
  teamB: Team | null;
};

function teamKey(t: Team | null) {
  if (!t) return "TBD";
  return `${t.seed}|${t.name}`;
}

function toTeam(t: any): Team | null {
  if (!t) return null;
  return { seed: Number(t.seed), name: String(t.name) };
}

function winnerFromPick(game: UIGame, picks: Record<string, string>): Team | null {
  const chosen = picks[game.id];
  if (!chosen) return null;
  const aKey = teamKey(game.teamA);
  const bKey = teamKey(game.teamB);
  if (chosen === aKey) return game.teamA;
  if (chosen === bKey) return game.teamB;
  return null;
}

function buildRounds(region: UIRegion, picks: Record<string, string>) {
  const r64: UIGame[] = (region.round64 ?? []).map((g, idx) => ({
    id: `${region.name}_64_${(g as any).id ?? idx}`,
    teamA: toTeam((g as any).teamA),
    teamB: toTeam((g as any).teamB),
  }));

  const nextRound = (prev: UIGame[], roundLabel: string) => {
    const out: UIGame[] = [];
    for (let i = 0; i < prev.length; i += 2) {
      const g1 = prev[i];
      const g2 = prev[i + 1];
      const w1 = winnerFromPick(g1, picks);
      const w2 = winnerFromPick(g2, picks);
      out.push({
        id: `${region.name}_${roundLabel}_${i / 2}`,
        teamA: w1,
        teamB: w2,
      });
    }
    return out;
  };

  const r32 = nextRound(r64, "32");
  const r16 = nextRound(r32, "S16");
  const r8 = nextRound(r16, "E8");

  const regionWinner = r8[0] ? winnerFromPick(r8[0], picks) : null;

  return { r64, r32, r16, r8, regionWinner };
}

function fmtTeam(t: Team | null) {
  if (!t) return "TBD";
  return `${t.seed}. ${t.name}`;
}

export default function BracketPage() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const entryId =
    typeof window !== "undefined" ? localStorage.getItem("entry_id") : null;

  const regions = useMemo(() => BRACKET_2026_PLACEHOLDER as unknown as UIRegion[], []);

  const [picks, setPicks] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!entryId) return;
      try {
        const res = await fetch(`${API}/entries/${entryId}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMsg(data?.detail ?? `Error loading entry: ${res.status}`);
          return;
        }
        setPicks(data?.bracket ?? {});
        setLocked(!!data?.locked);
      } catch {
        setMsg("Network error loading saved picks. Is FastAPI running?");
      }
    }
    load();
  }, [API, entryId]);

  function pickWinner(gameId: string, teamLabelKey: string) {
    if (locked) return;
    setPicks((prev) => ({ ...prev, [gameId]: teamLabelKey }));
  }

  async function savePicks() {
    setMsg(null);
    if (!entryId) {
      setMsg("No entry_id found. Go to /create first.");
      return;
    }
    if (locked) {
      setMsg("Bracket is locked. You can’t edit anymore.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/entries/${entryId}/bracket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(picks),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.detail ?? `Error saving: ${res.status}`);
        setSaving(false);
        return;
      }

      setMsg("Saved!");
      setSaving(false);
    } catch {
      setMsg("Network error saving picks.");
      setSaving(false);
    }
  }

  const west = regions.find((r) => r.name === "West")!;
  const south = regions.find((r) => r.name === "South")!;
  const east = regions.find((r) => r.name === "East")!;
  const midwest = regions.find((r) => r.name === "Midwest")!;

  const finalFour = useMemo(() => {
    const w = buildRounds(west, picks).regionWinner;
    const s = buildRounds(south, picks).regionWinner;
    const e = buildRounds(east, picks).regionWinner;
    const m = buildRounds(midwest, picks).regionWinner;

    const semi1: UIGame = { id: "FF_SEMI_1", teamA: w, teamB: s };
    const semi2: UIGame = { id: "FF_SEMI_2", teamA: e, teamB: m };

    const f1 = winnerFromPick(semi1, picks);
    const f2 = winnerFromPick(semi2, picks);

    const champ: UIGame = { id: "FF_CHAMP", teamA: f1, teamB: f2 };
    const champion = winnerFromPick(champ, picks);

    return { w, s, e, m, semi1, semi2, champ, champion };
  }, [west, south, east, midwest, picks]);

  // ✅ Points system (based on RESULTS file)
  const scoring = useMemo(() => scoreBracket(picks), [picks]);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-2 sm:p-4 font-sans selection:bg-red-500/30">
      <div
        className="fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <header className="relative z-10 mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter">
          STEVENS <span className="text-red-600">MARCH MADNESS</span>
        </h1>

        <div className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="text-[10px] text-slate-400">
            Entry ID:{" "}
            <span className="font-mono text-slate-200">{entryId ?? "none"}</span>
            {locked ? <span className="ml-2 text-red-400">• LOCKED</span> : null}
          </div>

          <button
            onClick={savePicks}
            disabled={saving || locked}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold hover:bg-red-500 disabled:opacity-50"
          >
            {locked ? "Locked" : saving ? "Saving..." : "Save Picks"}
          </button>
        </div>

        {/* ✅ SCORE DISPLAY */}
        <div className="mt-2 text-[10px] text-slate-400">
          Score: <span className="text-slate-200 font-bold">{scoring.score}</span>
          <span className="mx-2 text-slate-600">|</span>
          Possible so far:{" "}
          <span className="text-slate-200 font-bold">{scoring.possible}</span>
          <span className="mx-2 text-slate-600">|</span>
          Correct:{" "}
          <span className="text-slate-200 font-bold">{scoring.correctGames}</span>
        </div>

        {msg && (
          <div className="mt-2 inline-block rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs">
            {msg}
          </div>
        )}
      </header>

      <main className="relative z-10 mx-auto max-w-[1700px] overflow-x-auto pb-10">
        <div className="min-w-[1100px] grid grid-cols-[1fr_260px_1fr] gap-4 items-center">
          {/* LEFT SIDE */}
          <div className="relative z-10 flex flex-col gap-8">
            <RegionBracket
              region={west}
              side="left"
              picks={picks}
              locked={locked}
              pickWinner={pickWinner}
            />
            <RegionBracket
              region={south}
              side="left"
              picks={picks}
              locked={locked}
              pickWinner={pickWinner}
            />
          </div>

          {/* CENTER */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-center w-full">
              <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">
                Final Four
              </div>

              <div className="space-y-4">
                <CenterGameCard
                  title="Semifinal 1"
                  game={finalFour.semi1}
                  picks={picks}
                  locked={locked}
                  onPick={(id, key) => pickWinner(id, key)}
                />

                <CenterGameCard
                  title="Semifinal 2"
                  game={finalFour.semi2}
                  picks={picks}
                  locked={locked}
                  onPick={(id, key) => pickWinner(id, key)}
                />
              </div>
            </div>

            <div className="text-center w-full">
              <div className="text-[10px] font-bold tracking-widest text-red-500 uppercase mb-2">
                National Championship
              </div>

              <CenterGameCard
                title="Championship"
                game={finalFour.champ}
                picks={picks}
                locked={locked}
                onPick={(id, key) => pickWinner(id, key)}
              />

              <div className="mt-3">
                <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">
                  Champion
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-2 py-2 text-center text-[10px] font-semibold">
                  {finalFour.champion ? fmtTeam(finalFour.champion) : "TBD"}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="relative z-10 flex flex-col gap-8">
            <RegionBracket
              region={east}
              side="right"
              picks={picks}
              locked={locked}
              pickWinner={pickWinner}
            />
            <RegionBracket
              region={midwest}
              side="right"
              picks={picks}
              locked={locked}
              pickWinner={pickWinner}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function RegionBracket({
  region,
  side,
  picks,
  locked,
  pickWinner,
}: {
  region: UIRegion;
  side: "left" | "right";
  picks: Record<string, string>;
  locked: boolean;
  pickWinner: (gameId: string, teamLabelKey: string) => void;
}) {
  const directionClass = side === "left" ? "flex-row" : "flex-row-reverse";
  const rounds = useMemo(() => buildRounds(region, picks), [region, picks]);
  const roundGames: UIGame[][] = [rounds.r64, rounds.r32, rounds.r16, rounds.r8];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-2">
      <div className="mb-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
        {region.name}
      </div>

      <div className={`flex ${directionClass} items-center gap-2 w-full`}>
        {ROUNDS.map((round, rIdx) => (
          <div key={round.name} className="flex flex-col flex-1 min-w-[150px]">
            <div className={`flex flex-col justify-around h-[500px] ${round.spacing}`}>
              {Array.from({ length: round.games }).map((_, gIdx) => {
                const game = roundGames[rIdx]?.[gIdx] ?? null;

                const teamA = game?.teamA ?? null;
                const teamB = game?.teamB ?? null;

                const gameId = game?.id ?? `${region.name}_${round.name}_${gIdx}`;

                const aKey = teamKey(teamA);
                const bKey = teamKey(teamB);

                const chosen = picks[gameId];
                const aPicked = chosen === aKey;
                const bPicked = chosen === bKey;

                return (
                  <GameCard
                    key={gameId}
                    disabled={locked || !teamA || !teamB}
                    teamASeed={teamA ? String(teamA.seed) : "--"}
                    teamBSeed={teamB ? String(teamB.seed) : "--"}
                    teamAName={teamA ? teamA.name : "TBD"}
                    teamBName={teamB ? teamB.name : "TBD"}
                    aPicked={aPicked}
                    bPicked={bPicked}
                    onPickA={() => pickWinner(gameId, aKey)}
                    onPickB={() => pickWinner(gameId, bKey)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 text-[10px] text-slate-400">
        Winner:{" "}
        <span className="text-slate-200 font-semibold">
          {rounds.regionWinner ? fmtTeam(rounds.regionWinner) : "TBD"}
        </span>
      </div>
    </div>
  );
}

function GameCard({
  disabled,
  teamASeed,
  teamBSeed,
  teamAName,
  teamBName,
  aPicked,
  bPicked,
  onPickA,
  onPickB,
}: {
  disabled: boolean;
  teamASeed: string;
  teamBSeed: string;
  teamAName: string;
  teamBName: string;
  aPicked: boolean;
  bPicked: boolean;
  onPickA: () => void;
  onPickB: () => void;
}) {
  const pickedClass = "bg-green-200 text-black";
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden text-[10px]">
      <button
        onClick={onPickA}
        disabled={disabled}
        className={[
          "w-full flex items-center gap-2 p-1.5 hover:bg-slate-800 transition-colors",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          aPicked ? pickedClass : "",
        ].join(" ")}
      >
        <span className="w-4 text-slate-500">{teamASeed}</span>
        <span className="truncate font-bold uppercase">{teamAName}</span>
      </button>

      <div className="h-[2px] bg-slate-800" />

      <button
        onClick={onPickB}
        disabled={disabled}
        className={[
          "w-full flex items-center gap-2 p-1.5 hover:bg-slate-800 transition-colors",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          bPicked ? pickedClass : "",
        ].join(" ")}
      >
        <span className="w-4 text-slate-500">{teamBSeed}</span>
        <span className="truncate font-bold uppercase">{teamBName}</span>
      </button>
    </div>
  );
}

function CenterGameCard({
  title,
  game,
  picks,
  locked,
  onPick,
}: {
  title: string;
  game: UIGame;
  picks: Record<string, string>;
  locked: boolean;
  onPick: (gameId: string, teamKeyValue: string) => void;
}) {
  const teamA = game.teamA;
  const teamB = game.teamB;

  const aKey = teamKey(teamA);
  const bKey = teamKey(teamB);

  const chosen = picks[game.id];
  const aPicked = chosen === aKey;
  const bPicked = chosen === bKey;

  const disabled = locked || !teamA || !teamB;
  const pickedClass = "bg-green-200 text-black";

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2">
      <div className="mb-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
        {title}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden text-[10px]">
        <button
          onClick={() => onPick(game.id, aKey)}
          disabled={disabled}
          className={[
            "w-full flex items-center gap-2 p-2 hover:bg-slate-800 transition-colors text-left",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            aPicked ? pickedClass : "",
          ].join(" ")}
        >
          <span className="w-6 text-slate-500">{teamA ? String(teamA.seed) : "--"}</span>
          <span className="truncate font-bold uppercase">{teamA ? teamA.name : "TBD"}</span>
        </button>

        <div className="h-[2px] bg-slate-800" />

        <button
          onClick={() => onPick(game.id, bKey)}
          disabled={disabled}
          className={[
            "w-full flex items-center gap-2 p-2 hover:bg-slate-800 transition-colors text-left",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            bPicked ? pickedClass : "",
          ].join(" ")}
        >
          <span className="w-6 text-slate-500">{teamB ? String(teamB.seed) : "--"}</span>
          <span className="truncate font-bold uppercase">{teamB ? teamB.name : "TBD"}</span>
        </button>
      </div>
    </div>
  );
}
