import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentUser, canMarkVerified } from "@/lib/auth/session";

// PATCH /api/wires/verify  { wireId, status }
// Only ADMIN can move a wire between VERIFIED/UNVERIFIED/SYNTHETIC/DEPRECATED.
// This is the one write path in the scaffold — deliberately narrow, deliberately gated.
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!canMarkVerified(user.role)) {
    return NextResponse.json({ error: "Only ADMIN can change wire validation status" }, { status: 403 });
  }

  const { wireId, status } = await req.json();
  const allowed = ["VERIFIED", "UNVERIFIED", "SYNTHETIC", "DEPRECATED"];
  if (!wireId || !allowed.includes(status)) {
    return NextResponse.json({ error: "wireId and a valid status are required" }, { status: 400 });
  }

  const wire = await prisma.wire.update({
    where: { id: wireId },
    data: { validationStatus: status },
  });

  return NextResponse.json({ wire, verifiedBy: user.email });
}
