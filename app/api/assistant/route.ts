import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { askClaude } from "@/lib/ai/anthropic";

// POST /api/assistant { question }
// Retrieval-first: pulls real diagnostic/wire/VCC rows matching keywords in the
// question, then instructs Claude to answer ONLY from that evidence and cite
// record ids. If nothing matches, Claude is told to say so — never invent wiring.
export async function POST(req: NextRequest) {
  const { question } = await req.json();
  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const words = question.split(/\s+/).filter((w: string) => w.length > 2).slice(0, 6);

  const [diagnostics, wires, knowledge] = await Promise.all([
    prisma.diagnostic.findMany({
      where: { OR: words.map((w: string) => ({ description: { contains: w, mode: "insensitive" as const } })) },
      include: { system: true },
      take: 5,
    }),
    prisma.wire.findMany({
      where: { OR: words.map((w: string) => ({ wireNumber: { contains: w, mode: "insensitive" as const } })) },
      include: { sourcePin: { include: { connector: true } }, destPin: { include: { connector: true } } },
      take: 5,
    }),
    prisma.vCCKnowledge.findMany({ take: 10, include: { system: true } }),
  ]);

  const evidence = {
    diagnostics: diagnostics.map((d) => ({ id: d.id, faultCode: d.faultCode, description: d.description, cause: d.probableCause, system: d.system.code })),
    wires: wires.map((w) => ({ id: w.id, wireNumber: w.wireNumber, status: w.validationStatus, from: w.sourcePin.connector.designator, to: w.destPin.connector.designator })),
    vccKnowledge: knowledge.map((k) => ({ system: k.system.code, overview: k.overview })),
  };

  if (diagnostics.length === 0 && wires.length === 0) {
    return NextResponse.json({
      answer: "No matching diagnostic, wire, or knowledge record found in the database for this question. I won't guess at wiring or fault data — try a specific fault code or wire number, or check the Search page.",
      evidence,
      confidence: 0,
    });
  }

  const system = `You are a VCC engineering assistant for KMRCL RS3R metro rolling stock.
Answer ONLY using the JSON evidence provided below. Every claim must reference the record id or wire number it came from.
If the evidence doesn't fully answer the question, say exactly what is missing rather than inferring.
End your answer with a line: Confidence: <0-100>, based only on how directly the evidence answers the question.

Evidence:
${JSON.stringify(evidence, null, 2)}`;

  try {
    const answer = await askClaude(system, question);
    return NextResponse.json({ answer, evidence });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
