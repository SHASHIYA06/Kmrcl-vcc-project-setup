"use client";
import { useEffect, useState } from "react";

type Check = { name: string; issueCount: number; issues: any[] };
type Report = { ranAt: string; totalIssues: number; checks: Check[] };

export default function ValidatePage() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/validate")
      .then((r) => {
        if (!r.ok) throw new Error(`Validation API returned ${r.status}`);
        return r.json();
      })
      .then(setReport)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Running integrity checks against live DB…</p>;
  if (error) return <p className="text-sm text-red-600">Validation failed: {error}</p>;
  if (!report) return null;

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Data Validation Center</h1>
      <p className="mb-4 text-sm text-slate-500">Ran {new Date(report.ranAt).toLocaleString()}</p>
      <div className={`mb-4 rounded p-3 text-sm ${report.totalIssues === 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
        {report.totalIssues === 0 ? "No integrity issues found." : `${report.totalIssues} total issue(s) found across ${report.checks.length} checks.`}
      </div>
      <div className="space-y-3">
        {report.checks.map((c) => (
          <div key={c.name} className="rounded border border-slate-200 bg-white p-3">
            <div className="flex justify-between text-sm font-medium">
              <span>{c.name}</span>
              <span className={c.issueCount ? "text-amber-600" : "text-slate-400"}>{c.issueCount}</span>
            </div>
            {c.issueCount > 0 && (
              <pre className="mt-2 max-h-32 overflow-y-auto rounded bg-slate-50 p-2 text-xs">
                {JSON.stringify(c.issues.slice(0, 20), null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
