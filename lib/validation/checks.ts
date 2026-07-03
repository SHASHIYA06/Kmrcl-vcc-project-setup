// Pure functions used by /api/validate — kept DB-free so they're unit-testable.

export function findConflictingWireNumbers(
  wires: { wireNumber: string; sourcePinId: string; destPinId: string }[]
): string[] {
  const byNumber = new Map<string, Set<string>>();
  for (const w of wires) {
    const key = `${w.sourcePinId}-${w.destPinId}`;
    if (!byNumber.has(w.wireNumber)) byNumber.set(w.wireNumber, new Set());
    byNumber.get(w.wireNumber)!.add(key);
  }
  return [...byNumber.entries()].filter(([, set]) => set.size > 1).map(([wireNumber]) => wireNumber);
}

export function findBrokenDrawingChains(
  drawings: { id: string; parentId: string | null }[]
): { id: string; parentId: string | null }[] {
  const ids = new Set(drawings.map((d) => d.id));
  return drawings.filter((d) => d.parentId && !ids.has(d.parentId));
}
