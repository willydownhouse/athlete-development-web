import { describe, expect, it } from "vitest";

import { getHockeyStatsRange, parseHockeyStatsPeriod } from "./period";

describe("parseHockeyStatsPeriod", () => {
  it("returns week by default", () => {
    expect(parseHockeyStatsPeriod(undefined)).toBe("week");
    expect(parseHockeyStatsPeriod("invalid")).toBe("week");
  });

  it("returns the requested period when valid", () => {
    expect(parseHockeyStatsPeriod("day")).toBe("day");
    expect(parseHockeyStatsPeriod("month")).toBe("month");
  });
});

describe("getHockeyStatsRange", () => {
  it("returns a half-open interval for each period", () => {
    for (const period of ["day", "week", "month"] as const) {
      const range = getHockeyStatsRange(period);

      expect(new Date(range.startedAtTo).getTime()).toBeGreaterThan(
        new Date(range.startedAtFrom).getTime(),
      );
    }
  });

  it("returns a seven-day range for week", () => {
    const weekRange = getHockeyStatsRange("week");

    expect(
      new Date(weekRange.startedAtTo).getTime() - new Date(weekRange.startedAtFrom).getTime(),
    ).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
