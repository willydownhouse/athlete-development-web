import { describe, expect, it } from "vitest";

import { getStatsTimeRange, parseStatsSearchParams, statsRangeLocalDates } from "./stats-params";

describe("parseStatsSearchParams", () => {
  it("defaults to this week", () => {
    expect(parseStatsSearchParams({})).toEqual({
      period: "week",
      from: undefined,
      to: undefined,
      explicitDateRange: false,
    });
  });

  it("parses preset periods", () => {
    expect(parseStatsSearchParams({ statsPeriod: "month" }).period).toBe("month");
    expect(parseStatsSearchParams({ statsPeriod: "year" }).period).toBe("year");
    expect(parseStatsSearchParams({ statsPeriod: "day" }).period).toBe("week");
  });

  it("treats from/to as a custom range and swaps inverted dates", () => {
    expect(
      parseStatsSearchParams({
        from: "2026-08-10",
        to: "2026-08-01",
      }),
    ).toEqual({
      period: "week",
      from: "2026-08-01",
      to: "2026-08-10",
      explicitDateRange: true,
    });
  });

  it("fills a missing bound with the other date", () => {
    expect(parseStatsSearchParams({ from: "2026-08-05" })).toEqual({
      period: "week",
      from: "2026-08-05",
      to: "2026-08-05",
      explicitDateRange: true,
    });
  });
});

describe("getStatsTimeRange", () => {
  it("builds a custom local date range as UTC boundaries", () => {
    expect(
      getStatsTimeRange(
        {
          period: "week",
          from: "2026-08-03",
          to: "2026-08-09",
          explicitDateRange: true,
        },
        "Europe/Helsinki",
      ),
    ).toEqual({
      startedAtFrom: "2026-08-02T21:00:00.000Z",
      startedAtTo: "2026-08-09T21:00:00.000Z",
    });
  });

  it("uses this week when no custom range is set", () => {
    const range = getStatsTimeRange(
      { period: "week", explicitDateRange: false },
      "Europe/Oslo",
      new Date("2026-08-05T12:00:00.000Z"),
    );

    expect(range).toEqual({
      startedAtFrom: "2026-08-02T22:00:00.000Z",
      startedAtTo: "2026-08-09T22:00:00.000Z",
    });
  });
});

describe("statsRangeLocalDates", () => {
  it("converts a half-open UTC range back to inclusive local dates", () => {
    expect(
      statsRangeLocalDates(
        {
          startedAtFrom: "2026-08-02T21:00:00.000Z",
          startedAtTo: "2026-08-09T21:00:00.000Z",
        },
        "Europe/Helsinki",
      ),
    ).toEqual({
      from: "2026-08-03",
      to: "2026-08-09",
    });
  });
});
