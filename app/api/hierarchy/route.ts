import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

// GET /api/hierarchy?level=train|car|system|subsystem|equipment|connector|pin&parentId=xxx
export async function GET(req: NextRequest) {
  const level = req.nextUrl.searchParams.get("level") ?? "train";
  const parentId = req.nextUrl.searchParams.get("parentId") ?? undefined;

  try {
    switch (level) {
      case "train": {
        const trains = await prisma.train.findMany({ include: { _count: { select: { cars: true } } } });
        return NextResponse.json(trains);
      }
      case "car": {
        const cars = await prisma.car.findMany({
          where: parentId ? { trainId: parentId } : undefined,
          include: { _count: { select: { systems: true } } },
          orderBy: { position: "asc" },
        });
        return NextResponse.json(cars);
      }
      case "system": {
        const systems = await prisma.system.findMany({
          where: parentId ? { carId: parentId } : undefined,
          include: { _count: { select: { subsystems: true } } },
        });
        return NextResponse.json(systems);
      }
      case "subsystem": {
        const subs = await prisma.subsystem.findMany({
          where: parentId ? { systemId: parentId } : undefined,
          include: { _count: { select: { equipment: true } } },
        });
        return NextResponse.json(subs);
      }
      case "equipment": {
        const eq = await prisma.equipment.findMany({
          where: parentId ? { subsystemId: parentId } : undefined,
          include: { drawing: true, _count: { select: { connectors: true } } },
        });
        return NextResponse.json(eq);
      }
      case "connector": {
        const conns = await prisma.connector.findMany({
          where: parentId ? { equipmentId: parentId } : undefined,
          include: { _count: { select: { pins: true } } },
        });
        return NextResponse.json(conns);
      }
      case "pin": {
        const pins = await prisma.pin.findMany({
          where: parentId ? { connectorId: parentId } : undefined,
          include: { outWires: true, inWires: true },
        });
        return NextResponse.json(pins);
      }
      default:
        return NextResponse.json({ error: `unknown level: ${level}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
