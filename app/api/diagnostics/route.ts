import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

// GET /api/diagnostics?faultCode=TRAC-F001  OR  ?systemCode=TRAC
export async function GET(req: NextRequest) {
  const faultCode = req.nextUrl.searchParams.get("faultCode");
  const systemCode = req.nextUrl.searchParams.get("systemCode");

  const diagnostics = await prisma.diagnostic.findMany({
    where: {
      ...(faultCode ? { faultCode } : {}),
      ...(systemCode ? { system: { code: systemCode } } : {}),
    },
    include: { system: true },
  });

  return NextResponse.json(diagnostics);
}
