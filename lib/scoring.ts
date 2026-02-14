// lib/scoring.ts
import { RESULTS, ROUND_POINTS } from "@/app/results/resultsData";

function roundFromGameId(gameId: string): keyof typeof ROUND_POINTS | null {
  if (gameId.includes("_64_")) return "64";
  if (gameId.includes("_32_")) return "32";
  if (gameId.includes("_S16_")) return "S16";
  if (gameId.includes("_E8_")) return "E8";
  if (gameId === "FF_SEMI_1" || gameId === "FF_SEMI_2") return "FF";
  if (gameId === "FF_CHAMP") return "CHAMP";
  return null;
}

export function scoreBracket(bracket: Record<string, string>) {
  let score = 0;
  let possible = 0;
  let correctGames = 0;

  for (const [gameId, actualWinner] of Object.entries(RESULTS)) {
    const round = roundFromGameId(gameId);
    if (!round) continue;

    const pts = ROUND_POINTS[round] ?? 0;
    possible += pts;

    const pick = bracket?.[gameId];
    if (pick && pick === actualWinner) {
      score += pts;
      correctGames += 1;
    }
  }

  return { score, possible, correctGames };
}
