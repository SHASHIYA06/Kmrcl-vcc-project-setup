import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [trains, cars, systems, wires, verifiedWires] = await Promise.all([
    prisma.train.count(),
    prisma.car.count(),
    prisma.system.count(),
    prisma.wire.count(),
    prisma.wire.count({ where: { validationStatus: "VERIFIED" } }),
  ]);

  const pct = wires ? Math.round((verifiedWires / wires) * 100) : 0;

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Engineering Accuracy Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Trains" value={trains} />
        <Stat label="Cars" value={cars} />
        <Stat label="Systems" value={systems} />
        <Stat label="Wires (verified / total)" value={`${verifiedWires} / ${wires}`} />
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Wire verification rate: <strong>{pct}%</strong>. Only VERIFIED wires should be trusted in
        diagnostics, AI, and topology views — see WireIntelligence spec in the PRD.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
