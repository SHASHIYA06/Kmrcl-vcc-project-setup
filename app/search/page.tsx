"use client";
import { useEffect, useState } from "react";

type Result = { type: string; label: string; sub?: string; id: string };

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setRole(d.user?.role ?? null));
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setResults(d.results))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  async function markVerified(wireId: string) {
    setBusyId(wireId);
    const res = await fetch("/api/wires/verify", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wireId, status: "VERIFIED" }),
    });
    setBusyId(null);
    if (res.ok) {
      setResults((prev) => prev.map((r) => (r.id === wireId ? { ...r, sub: "VERIFIED" } : r)));
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Search</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Wire number, equipment tag, drawing number, fault code…"
        className="mb-4 w-full rounded border border-slate-300 px-3 py-2 text-sm"
      />
      {loading && <p className="text-sm text-slate-400">Searching…</p>}
      <ul className="divide-y divide-slate-100 rounded border border-slate-200 bg-white">
        {results.map((r) => (
          <li key={`${r.type}-${r.id}`} className="flex items-center justify-between px-3 py-2 text-sm">
            <span>
              <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs uppercase text-slate-500">{r.type}</span>
              {r.label}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-slate-400">{r.sub}</span>
              {r.type === "wire" && r.sub !== "VERIFIED" && role === "ADMIN" && (
                <button
                  onClick={() => markVerified(r.id)}
                  disabled={busyId === r.id}
                  className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-50"
                >
                  {busyId === r.id ? "Marking…" : "Mark verified"}
                </button>
              )}
            </span>
          </li>
        ))}
        {!loading && q.length >= 2 && results.length === 0 && (
          <li className="px-3 py-2 text-sm text-slate-400">No matches.</li>
        )}
      </ul>
    </div>
  );
}
