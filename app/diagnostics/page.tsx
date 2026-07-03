import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function Diagnostics() {
  const diagnostics = await prisma.diagnostic.findMany({ include: { system: true } });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Diagnostics</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2">Fault Code</th>
            <th>System</th>
            <th>Description</th>
            <th>Probable Cause</th>
          </tr>
        </thead>
        <tbody>
          {diagnostics.map((d) => (
            <tr key={d.id} className="border-b">
              <td className="py-2 font-mono">{d.faultCode}</td>
              <td>{d.system.code}</td>
              <td>{d.description}</td>
              <td>{d.probableCause}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
