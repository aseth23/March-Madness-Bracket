import EntryCountdown from "./components/EntryCountdown";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] text-white">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
        <h1 className="text-2xl font-bold">
          Stevens March Madness Bracket
        </h1>

        <p className="text-sm text-slate-400 mt-2">
          Make your picks, save once, and track live standings.
        </p>

        {/* ✅ Deadline Countdown */}
        <EntryCountdown />

        <div className="mt-6 grid gap-3">
          <a
            href="/create"
            className="rounded-xl bg-white text-black p-3 font-medium text-center hover:opacity-90"
          >
            Create entry
          </a>

          <a
            href="/bracket"
            className="rounded-xl border border-slate-700 p-3 font-medium text-center hover:bg-slate-800"
          >
            Go to bracket
          </a>

          <a
            href="/leaderboard"
            className="rounded-xl border border-slate-700 p-3 font-medium text-center hover:bg-slate-800"
          >
            Live standings
          </a>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Note: Entries lock at noon ET on March 19, 2026.
        </div>
      </div>
    </div>
  );
}
