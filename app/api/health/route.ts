import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [trains, wires, verifiedWires] = await Promise.all([
      prisma.train.count(),
      prisma.wire.count(),
      prisma.wire.count({ where: { validationStatus: "VERIFIED" } }),
    ]);
    return NextResponse.json({
      status: "ok",
      db: "connected",
      trains,
      wires,
      verifiedWires,
      verifiedPct: wires ? Math.round((verifiedWires / wires) * 100) : 0,
    });
  } catch (err) {
    return NextResponse.json({ status: "error", db: "disconnected", message: String(err) }, { status: 500 });
  }
}
