import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

// GET /api/wires/trace?wireNumber=W1032
// Returns full path: source connector/pin -> wire -> dest connector/pin,
// each hop with its own equipment/system context and validation status.
export async function GET(req: NextRequest) {
  const wireNumber = req.nextUrl.searchParams.get("wireNumber");
  if (!wireNumber) return NextResponse.json({ error: "wireNumber required" }, { status: 400 });

  const wires = await prisma.wire.findMany({
    where: { wireNumber },
    include: {
      sourcePin: { include: { connector: { include: { equipment: { include: { subsystem: { include: { system: true } } } } } } } },
      destPin: { include: { connector: { include: { equipment: { include: { subsystem: { include: { system: true } } } } } } } },
      drawing: true,
    },
  });

  if (wires.length === 0) {
    return NextResponse.json({ wireNumber, found: false, message: "No wire with this number in the verified registry" }, { status: 404 });
  }

  const results = wires.map((w) => ({
    wireNumber: w.wireNumber,
    validationStatus: w.validationStatus,
    cable: w.cable,
    trainline: w.trainline,
    drawing: w.drawing ? `${w.drawing.number}${w.drawing.revision ?? ""}` : null,
    source: {
      connector: w.sourcePin.connector.designator,
      pin: w.sourcePin.number,
      equipment: w.sourcePin.connector.equipment.name,
      system: w.sourcePin.connector.equipment.subsystem.system.code,
    },
    destination: {
      connector: w.destPin.connector.designator,
      pin: w.destPin.number,
      equipment: w.destPin.connector.equipment.name,
      system: w.destPin.connector.equipment.subsystem.system.code,
    },
  }));

  return NextResponse.json({ wireNumber, found: true, hops: results });
}
