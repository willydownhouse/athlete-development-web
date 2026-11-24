import { describe, expect, it } from "vitest";

import { inclusivePeriodEnd } from "./weekly-report";

describe("inclusivePeriodEnd", () => {
  it("returns the Sunday before an exclusive Monday end", () => {
    expect(inclusivePeriodEnd("2026-10-26")).toBe("2026-10-25");
    expect(inclusivePeriodEnd("2026-11-01")).toBe("2026-10-31");
  });
});
