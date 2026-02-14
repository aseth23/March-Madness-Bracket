"use client";

import { useState } from "react";

export default function CreateEntryPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch(`${API}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          username: username.trim() ? username : null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.detail ?? `Error: ${res.status}`);
        setLoading(false);
        return;
      }

      localStorage.setItem("entry_id", String(data.id));
      setMsg(`Entry created! Redirecting...`);

      setTimeout(() => {
        window.location.href = "/bracket";
      }, 400);
    } catch {
      setMsg("Network error. Make sure FastAPI is running on http://127.0.0.1:8000");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Stevens March Madness Bracket</h1>
        <p className="text-sm text-gray-600 mt-1">
          One entry per @stevens.edu email.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input
              className="mt-1 w-full rounded-xl border p-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Armaan Seth"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Stevens email</label>
            <input
              className="mt-1 w-full rounded-xl border p-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@stevens.edu"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Username (optional, shown on leaderboard)
            </label>
            <input
              className="mt-1 w-full rounded-xl border p-3"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="armaan"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black text-white p-3 font-medium disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create my bracket"}
          </button>
        </form>

        {msg && <div className="mt-4 rounded-xl border p-3 text-sm">{msg}</div>}
      </div>
    </div>
  );
}

