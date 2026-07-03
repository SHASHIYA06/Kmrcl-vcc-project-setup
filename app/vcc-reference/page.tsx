import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function VCCReference() {
  const systems = await prisma.system.findMany({
    include: { vccKnowledge: true, diagnostics: true },
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">VCC Knowledge Center</h1>
      <div className="space-y-6">
        {systems.map((s) => (
          <div key={s.id} className="rounded border border-slate-200 bg-white p-4">
            <h2 className="font-medium">{s.code} — {s.name}</h2>
            {s.vccKnowledge ? (
              <div className="mt-2 space-y-1 text-sm text-slate-700">
                <p><strong>Overview:</strong> {s.vccKnowledge.overview}</p>
                {s.vccKnowledge.powerFlow && <p><strong>Power Flow:</strong> {s.vccKnowledge.powerFlow}</p>}
                {s.vccKnowledge.signalFlow && <p><strong>Signal Flow:</strong> {s.vccKnowledge.signalFlow}</p>}
              </div>
            ) : (
              <p className="mt-2 text-sm text-amber-600">No VCC knowledge entry yet — needs real content, not placeholder.</p>
            )}
            <p className="mt-2 text-xs text-slate-400">{s.diagnostics.length} linked diagnostic(s)</p>
          </div>
        ))}
      </div>
    </div>
  );
}
