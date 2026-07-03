import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

// GET /api/search?q=term — searches wires, equipment, drawings, diagnostics in parallel
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ q, results: [] });

  const [wires, equipment, drawings, diagnostics] = await Promise.all([
    prisma.wire.findMany({
      where: { wireNumber: { contains: q, mode: "insensitive" } },
      take: 10,
      select: { id: true, wireNumber: true, validationStatus: true },
    }),
    prisma.equipment.findMany({
      where: { OR: [{ tag: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] },
      take: 10,
      select: { id: true, tag: true, name: true },
    }),
    prisma.drawing.findMany({
      where: { number: { contains: q, mode: "insensitive" } },
      take: 10,
      select: { id: true, number: true, revision: true, title: true },
    }),
    prisma.diagnostic.findMany({
      where: { OR: [{ faultCode: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
      take: 10,
      select: { id: true, faultCode: true, description: true },
    }),
  ]);

  const results = [
    ...wires.map((w) => ({ type: "wire", label: w.wireNumber, sub: w.validationStatus, id: w.id })),
    ...equipment.map((e) => ({ type: "equipment", label: e.tag, sub: e.name, id: e.id })),
    ...drawings.map((d) => ({ type: "drawing", label: `${d.number}${d.revision ?? ""}`, sub: d.title, id: d.id })),
    ...diagnostics.map((d) => ({ type: "diagnostic", label: d.faultCode, sub: d.description, id: d.id })),
  ];

  return NextResponse.json({ q, results });
}
