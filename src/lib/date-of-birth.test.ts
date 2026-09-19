import { describe, expect, it } from "vitest";

import { isAtLeastAgeYears, isValidDateOnly, latestSelfAthleteBirthDate } from "./date-of-birth";

describe("isValidDateOnly", () => {
  it("accepts a real calendar date", () => {
    expect(isValidDateOnly("2013-09-19")).toBe(true);
    expect(isValidDateOnly("2012-02-29")).toBe(true);
  });

  it("rejects overflow and non date-only values", () => {
    expect(isValidDateOnly("2013-02-29")).toBe(false);
    expect(isValidDateOnly("2013-09-31")).toBe(false);
    expect(isValidDateOnly("2013-09-19T00:00:00.000Z")).toBe(false);
  });
});

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
    expect(isAtLeastAgeYears("2013-02-29", 13, now)).toBe(false);
  });
});

describe("latestSelfAthleteBirthDate", () => {
  it("uses the UTC calendar date as a local date-picker day", () => {
    const now = new Date("2026-09-20T00:30:00.000+02:00");

    expect(latestSelfAthleteBirthDate(now)).toEqual(new Date(2013, 8, 19));
  });

  it("clamps a leap-day cutoff to the last valid day of that month", () => {
    const now = new Date("2024-02-29T12:00:00.000Z");

    expect(latestSelfAthleteBirthDate(now)).toEqual(new Date(2011, 1, 28));
  });
});
