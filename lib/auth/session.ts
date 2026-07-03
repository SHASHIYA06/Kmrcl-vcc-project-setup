import { cookies } from "next/headers";
import { prisma } from "@/lib/db/client";

// Minimal session: signed cookie holds userId only. Swap for NextAuth/JWT
// when real SSO/AD integration lands — interface stays the same.
export async function getCurrentUser() {
  const userId = cookies().get("vcc_uid")?.value;
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export function canWrite(role: string | undefined) {
  return role === "ADMIN" || role === "ENGINEER";
}

export function canMarkVerified(role: string | undefined) {
  return role === "ADMIN";
}
