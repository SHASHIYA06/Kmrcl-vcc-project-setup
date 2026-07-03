import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { findConflictingWireNumbers, findBrokenDrawingChains } from "@/lib/validation/checks";

export const dynamic = "force-dynamic";

// GET /api/validate — runs real integrity checks against current DB state.
// Every check returns actual offending row ids, never a canned "all good".
export async function GET() {
  const checks: { name: string; issueCount: number; issues: any[] }[] = [];

  // 1. Wires with no drawing reference (can't be trusted for commissioning)
  const noDrawing = await prisma.wire.findMany({
    where: { drawingId: null, validationStatus: { not: "DEPRECATED" } },
    select: { id: true, wireNumber: true },
  });
  checks.push({ name: "Wires missing drawing reference", issueCount: noDrawing.length, issues: noDrawing });

  // 2. SYNTHETIC wires still active (should be DEPRECATED, not silently deleted)
  const synthetic = await prisma.wire.findMany({
    where: { validationStatus: "SYNTHETIC" },
    select: { id: true, wireNumber: true },
  });
  checks.push({ name: "Synthetic wires present (flag for reconstruction)", issueCount: synthetic.length, issues: synthetic });

  // 3. Duplicate wire numbers pointing at different pin pairs (data conflict)
  const wires = await prisma.wire.findMany({ select: { wireNumber: true, sourcePinId: true, destPinId: true } });
  const conflicting = findConflictingWireNumbers(wires);
  checks.push({ name: "Wire numbers with conflicting pin pairs", issueCount: conflicting.length, issues: conflicting });

  // 4. Connectors with zero pins (incomplete drawing extraction)
  const emptyConnectors = await prisma.connector.findMany({
    where: { pins: { none: {} } },
    select: { id: true, designator: true },
  });
  checks.push({ name: "Connectors with no pins", issueCount: emptyConnectors.length, issues: emptyConnectors });

  // 5. Equipment with no drawing linked
  const noDrawingEq = await prisma.equipment.findMany({
    where: { drawingId: null },
    select: { id: true, tag: true },
  });
  checks.push({ name: "Equipment missing drawing reference", issueCount: noDrawingEq.length, issues: noDrawingEq });

  // 6. Drawing revision chains with an orphaned parentId (broken chain)
  const drawings = await prisma.drawing.findMany({ select: { id: true, parentId: true } });
  const brokenChains = findBrokenDrawingChains(drawings);
  checks.push({ name: "Drawing revisions with broken parent chain", issueCount: brokenChains.length, issues: brokenChains });

  const totalIssues = checks.reduce((s, c) => s + c.issueCount, 0);
  return NextResponse.json({ ranAt: new Date().toISOString(), totalIssues, checks });
}
