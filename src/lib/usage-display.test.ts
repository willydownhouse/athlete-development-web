import { describe, expect, it } from "vitest";

import { formatTokenCount, formatUsagePeriod, usageBarPercent } from "./usage-display";

describe("usage display", () => {
  it("formats token counts with grouping separators", () => {
    expect(formatTokenCount(50)).toBe("50");
    expect(formatTokenCount(500000)).toBe("500,000");
  });

  it("clamps the usage bar percent between 0 and 100", () => {
    expect(usageBarPercent(0, 100)).toBe(0);
    expect(usageBarPercent(25, 100)).toBe(25);
    expect(usageBarPercent(120, 100)).toBe(100);
    expect(usageBarPercent(10, 0)).toBe(0);
  });

  it("formats the UTC month from periodStart", () => {
    expect(formatUsagePeriod("2026-09-01T00:00:00.000Z")).toBe("September 2026");
  });
});
