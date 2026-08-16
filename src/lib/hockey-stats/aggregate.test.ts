import { describe, expect, it } from "vitest";

import { formatHockeyStatTotal } from "./aggregate";

describe("formatHockeyStatTotal", () => {
  it("formats duration metrics", () => {
    expect(
      formatHockeyStatTotal({
        name: "Playing time",
        canonicalUnit: "s",
        total: 2100,
      }),
    ).toBe("35 min");
  });

  it("formats count metrics with units", () => {
    expect(
      formatHockeyStatTotal({
        name: "Goal count",
        canonicalUnit: "goals",
        total: 3,
      }),
    ).toBe("3 goals");
  });

  it("formats RPE metrics without the scale unit", () => {
    expect(
      formatHockeyStatTotal({
        name: "RPE",
        canonicalUnit: "scale_1_10",
        total: 7,
      }),
    ).toBe("7");
  });

  it("formats plus/minus metrics without the count unit", () => {
    expect(
      formatHockeyStatTotal({
        key: "plus_minus",
        name: "Plus/minus",
        canonicalUnit: "count",
        total: -2,
      }),
    ).toBe("-2");
  });

  it("formats decimal totals to one decimal place", () => {
    expect(
      formatHockeyStatTotal({
        name: "RPE",
        canonicalUnit: "scale_1_10",
        total: 6.5,
      }),
    ).toBe("6.5");
  });
});
