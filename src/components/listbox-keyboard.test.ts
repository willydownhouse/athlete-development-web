import { describe, expect, it } from "vitest";

import { nextListboxIndex } from "./listbox-keyboard";

describe("nextListboxIndex", () => {
  it("moves within bounds without wrapping", () => {
    expect(nextListboxIndex(4, 0, "ArrowDown")).toBe(1);
    expect(nextListboxIndex(4, 3, "ArrowDown")).toBe(3);
    expect(nextListboxIndex(4, 0, "ArrowUp")).toBe(0);
    expect(nextListboxIndex(4, 2, "ArrowUp")).toBe(1);
  });

  it("jumps to the ends", () => {
    expect(nextListboxIndex(4, 2, "Home")).toBe(0);
    expect(nextListboxIndex(4, 2, "End")).toBe(3);
  });

  it("starts from the edge when nothing is focused", () => {
    expect(nextListboxIndex(4, -1, "ArrowDown")).toBe(0);
    expect(nextListboxIndex(4, -1, "ArrowUp")).toBe(3);
    expect(nextListboxIndex(0, -1, "ArrowDown")).toBe(-1);
  });
});
