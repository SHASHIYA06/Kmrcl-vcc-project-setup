import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

// GET /api/vcc?systemCode=TRAC
export async function GET(req: NextRequest) {
  const systemCode = req.nextUrl.searchParams.get("systemCode");

  const systems = await prisma.system.findMany({
    where: systemCode ? { code: systemCode } : undefined,
    include: { vccKnowledge: true, diagnostics: true, subsystems: { include: { equipment: true } } },
  });

  return NextResponse.json(systems);
}
