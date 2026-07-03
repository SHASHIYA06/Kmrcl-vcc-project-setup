"use client";
import { useState } from "react";

export default function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(body.error ?? "Assistant request failed");
      return;
    }
    setAnswer(body.answer);
    setEvidence(body.evidence);
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">VCC Assistant</h1>
      <p className="mb-4 text-sm text-slate-500">
        Answers only from records in this database, always cited. Needs <code>ANTHROPIC_API_KEY</code> set in your environment.
      </p>
      <div className="mb-4 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="e.g. Why would TRAC-F001 occur?"
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <button onClick={ask} disabled={loading} className="rounded bg-slate-800 px-4 py-2 text-sm text-white disabled:opacity-50">
          {loading ? "Thinking…" : "Ask"}
        </button>
      </div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {answer && (
        <div className="mb-4 whitespace-pre-wrap rounded border border-slate-200 bg-white p-4 text-sm">{answer}</div>
      )}
      {evidence && (
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer">Evidence used</summary>
          <pre className="mt-2 max-h-64 overflow-y-auto rounded bg-slate-50 p-2">{JSON.stringify(evidence, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
