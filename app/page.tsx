export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Stevens March Madness Bracket</h1>
        <p className="text-sm text-gray-600 mt-2">
          Make your picks, save once, and track live standings.
        </p>

        <div className="mt-6 grid gap-3">
          <a
            href="/create"
            className="rounded-xl bg-black text-white p-3 font-medium text-center"
          >
            Create entry
          </a>
          <a
            href="/bracket"
            className="rounded-xl border p-3 font-medium text-center"
          >
            Go to bracket
          </a>
          <a
            href="/leaderboard"
            className="rounded-xl border p-3 font-medium text-center"
          >
            Live standings
          </a>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Note: For now, this demo bracket uses a small sample of games. Next we
          upgrade to the full 64-team bracket.
        </div>
      </div>
    </div>
  );
}

