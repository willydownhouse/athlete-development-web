import { describe, expect, it } from "vitest";

import { remainingVisibleViewportHeight } from "./visible-viewport";

describe("remainingVisibleViewportHeight", () => {
  it("uses the visual viewport bottom when the address bar is visible", () => {
    expect(remainingVisibleViewportHeight(60, { offsetTop: 0, height: 640 }, 740)).toBe(580);
  });

  it("grows when the visual viewport matches the large layout height", () => {
    expect(remainingVisibleViewportHeight(60, { offsetTop: 0, height: 740 }, 740)).toBe(680);
  });

  it("falls back to the layout viewport when visualViewport is unavailable", () => {
    expect(remainingVisibleViewportHeight(60, null, 740)).toBe(680);
  });

  it("does not return a negative height", () => {
    expect(remainingVisibleViewportHeight(800, { offsetTop: 0, height: 640 }, 740)).toBe(0);
  });
});
