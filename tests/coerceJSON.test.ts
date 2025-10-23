import { describe, it, expect } from "vitest";

// if coerceJSON is not exported, export it conditionally for tests
// from src/lib/openrouter.ts as `export function coerceJSON(...)`
import { coerceJSON } from "@/lib/openrouter";

describe("coerceJSON", () => {
  it("parses plain JSON", () => {
    const s = `{"a":1,"b":"x"}`;
    expect(coerceJSON(s)).toEqual({ a: 1, b: "x" });
  });
  it("strips ```json fences", () => {
    const s = "```json\n{\"a\":2}\n```";
    expect(coerceJSON(s)).toEqual({ a: 2 });
  });
  it("extracts first balanced object", () => {
    const s = "noise {\"a\":3,\"b\":{\"c\":4}} trailing";
    expect(coerceJSON(s)).toEqual({ a: 3, b: { c: 4 } });
  });
  it("returns null on garbage", () => {
    expect(coerceJSON("nope")).toBeNull();
  });
});