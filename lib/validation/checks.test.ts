import { describe, it, expect } from "vitest";
import { findConflictingWireNumbers, findBrokenDrawingChains } from "@/lib/validation/checks";

describe("findConflictingWireNumbers", () => {
  it("flags same wire number used across different pin pairs", () => {
    const result = findConflictingWireNumbers([
      { wireNumber: "W1", sourcePinId: "a", destPinId: "b" },
      { wireNumber: "W1", sourcePinId: "c", destPinId: "d" },
    ]);
    expect(result).toEqual(["W1"]);
  });

  it("does not flag a wire repeated with the same pin pair", () => {
    const result = findConflictingWireNumbers([
      { wireNumber: "W1", sourcePinId: "a", destPinId: "b" },
      { wireNumber: "W1", sourcePinId: "a", destPinId: "b" },
    ]);
    expect(result).toEqual([]);
  });
});

describe("findBrokenDrawingChains", () => {
  it("flags a revision pointing at a non-existent parent", () => {
    const result = findBrokenDrawingChains([
      { id: "base", parentId: null },
      { id: "revA", parentId: "missing-id" },
    ]);
    expect(result).toEqual([{ id: "revA", parentId: "missing-id" }]);
  });

  it("does not flag a valid parent/child pair", () => {
    const result = findBrokenDrawingChains([
      { id: "base", parentId: null },
      { id: "revA", parentId: "base" },
    ]);
    expect(result).toEqual([]);
  });
});
