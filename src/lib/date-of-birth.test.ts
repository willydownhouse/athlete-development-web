import { describe, expect, it } from "vitest";

import {
  canChangeProfileDateOfBirth,
  dateOnlyInputValue,
  isAtLeastAgeYears,
  isValidDateOnly,
  latestSelfAthleteBirthDate,
  resolveProfileDateOfBirthUpdate,
} from "./date-of-birth";

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

describe("dateOnlyInputValue", () => {
  it("keeps a date-only value and strips a UTC timestamp", () => {
    expect(dateOnlyInputValue("2012-05-14")).toBe("2012-05-14");
    expect(dateOnlyInputValue("2012-05-14T00:00:00.000Z")).toBe("2012-05-14");
  });

  it("returns an empty string for missing or invalid values", () => {
    expect(dateOnlyInputValue(null)).toBe("");
    expect(dateOnlyInputValue("2013-02-29T00:00:00.000Z")).toBe("");
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

    expect(latestSelfAthleteBirthDate(now)).toEqual(new Date(2008, 8, 19));
  });

  it("clamps a leap-day cutoff to the last valid day of that month", () => {
    const now = new Date("2024-02-29T12:00:00.000Z");

    expect(latestSelfAthleteBirthDate(now)).toEqual(new Date(2006, 1, 28));
  });
});

describe("canChangeProfileDateOfBirth", () => {
  const now = new Date("2026-09-19T15:00:00.000Z");

  it("lets a parent change any saved date", () => {
    expect(canChangeProfileDateOfBirth("parent", "2016-09-19", now)).toBe(true);
  });

  it("lets an adult athlete change a date that is already at least 18", () => {
    expect(canChangeProfileDateOfBirth("athlete", "2008-09-19", now)).toBe(true);
  });

  it("keeps an under-18 athlete date locked", () => {
    expect(canChangeProfileDateOfBirth("athlete", "2016-09-19", now)).toBe(false);
    expect(canChangeProfileDateOfBirth("athlete", "", now)).toBe(false);
  });
});

describe("resolveProfileDateOfBirthUpdate", () => {
  const now = new Date("2026-09-19T15:00:00.000Z");

  it("omits an unchanged date and a missing field", () => {
    expect(
      resolveProfileDateOfBirthUpdate({
        dateOfBirth: "2016-09-19",
        savedDateOfBirth: "2016-09-19",
        relationshipToAthlete: "athlete",
        now,
      }),
    ).toEqual({ status: "omit" });
    expect(
      resolveProfileDateOfBirthUpdate({
        dateOfBirth: null,
        savedDateOfBirth: "2016-09-19",
        relationshipToAthlete: "athlete",
        now,
      }),
    ).toEqual({ status: "omit" });
  });

  it("rejects an under-18 athlete changing the date", () => {
    expect(
      resolveProfileDateOfBirthUpdate({
        dateOfBirth: "2000-01-01",
        savedDateOfBirth: "2016-09-19",
        relationshipToAthlete: "athlete",
        now,
      }),
    ).toEqual({ status: "error", error: "underAge" });
  });

  it("keeps an adult athlete date at least 18", () => {
    expect(
      resolveProfileDateOfBirthUpdate({
        dateOfBirth: "2007-09-19",
        savedDateOfBirth: "2000-01-01",
        relationshipToAthlete: "athlete",
        now,
      }),
    ).toEqual({ status: "include", dateOfBirth: "2007-09-19" });
    expect(
      resolveProfileDateOfBirthUpdate({
        dateOfBirth: "2016-09-19",
        savedDateOfBirth: "2000-01-01",
        relationshipToAthlete: "athlete",
        now,
      }),
    ).toEqual({ status: "error", error: "underAge" });
  });

  it("lets a parent set a younger date", () => {
    expect(
      resolveProfileDateOfBirthUpdate({
        dateOfBirth: "2018-01-01",
        savedDateOfBirth: "2016-09-19",
        relationshipToAthlete: "parent",
        now,
      }),
    ).toEqual({ status: "include", dateOfBirth: "2018-01-01" });
  });

  it("rejects a cleared or invalid date", () => {
    expect(
      resolveProfileDateOfBirthUpdate({
        dateOfBirth: "",
        savedDateOfBirth: "2016-09-19",
        relationshipToAthlete: "parent",
        now,
      }),
    ).toEqual({ status: "error", error: "required" });
    expect(
      resolveProfileDateOfBirthUpdate({
        dateOfBirth: "2016-02-31",
        savedDateOfBirth: "2016-09-19",
        relationshipToAthlete: "parent",
        now,
      }),
    ).toEqual({ status: "error", error: "invalid" });
  });
});
