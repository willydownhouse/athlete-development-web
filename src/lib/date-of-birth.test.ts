import { describe, expect, it } from "vitest";

import { isAtLeastAgeYears, latestSelfAthleteBirthDate } from "./date-of-birth";

describe("isAtLeastAgeYears", () => {
  const now = new Date("2026-09-19T15:00:00.000Z");

  it("accepts the birthday that reaches the minimum age", () => {
    expect(isAtLeastAgeYears("2013-09-19", 13, now)).toBe(true);
  });

  it("rejects the day before that birthday", () => {
    expect(isAtLeastAgeYears("2013-09-20", 13, now)).toBe(false);
  });

  it("rejects invalid date-only values", () => {
    expect(isAtLeastAgeYears("2013-09-19T00:00:00.000Z", 13, now)).toBe(false);
  });
});

describe("latestSelfAthleteBirthDate", () => {
  it("returns the local calendar date 13 years ago", () => {
    const now = new Date(2026, 8, 19);

    expect(latestSelfAthleteBirthDate(now)).toEqual(new Date(2013, 8, 19));
  });
});
