import { describe, expect, it } from "vitest";

import {
  getZonedDayRange,
  getZonedMonthRange,
  getZonedWeekRange,
  isTimeRangeWithin,
  mergeTimeRanges,
  zonedDateTimeToUtcIso,
} from "./time-zone";

describe("zonedDateTimeToUtcIso", () => {
  it("converts Norway summer local time to UTC", () => {
    expect(zonedDateTimeToUtcIso("2026-08-05", "10:00", "Europe/Oslo")).toBe(
      "2026-08-05T08:00:00.000Z",
    );
  });

  it("converts Norway winter local time to UTC", () => {
    expect(zonedDateTimeToUtcIso("2026-01-05", "10:00", "Europe/Oslo")).toBe(
      "2026-01-05T09:00:00.000Z",
    );
  });

  it("defaults missing event time to local noon", () => {
    expect(zonedDateTimeToUtcIso("2026-08-05", "", "Europe/Oslo")).toBe("2026-08-05T10:00:00.000Z");
  });

  it("rejects invalid local dates and times", () => {
    expect(zonedDateTimeToUtcIso("2026-02-30", "10:00", "Europe/Oslo")).toBeNull();
    expect(zonedDateTimeToUtcIso("2026-08-05", "24:00", "Europe/Oslo")).toBeNull();
    expect(zonedDateTimeToUtcIso("2026-08-05", "10:00", "Invalid/Zone")).toBeNull();
  });
});

describe("zoned ranges", () => {
  it("builds a Norway local day range as UTC boundaries", () => {
    expect(getZonedDayRange("Europe/Oslo", new Date("2026-08-05T12:00:00.000Z"))).toEqual({
      startedAtFrom: "2026-08-04T22:00:00.000Z",
      startedAtTo: "2026-08-05T22:00:00.000Z",
    });
  });

  it("builds a Norway local week range as UTC boundaries", () => {
    const range = getZonedWeekRange("Europe/Oslo", new Date("2026-08-05T12:00:00.000Z"));

    expect(range.startedAtFrom).toBe("2026-08-02T22:00:00.000Z");
    expect(range.startedAtTo).toBe("2026-08-09T22:00:00.000Z");
    expect(range.days.map((day) => day.toISOString())).toEqual([
      "2026-08-02T22:00:00.000Z",
      "2026-08-03T22:00:00.000Z",
      "2026-08-04T22:00:00.000Z",
      "2026-08-05T22:00:00.000Z",
      "2026-08-06T22:00:00.000Z",
      "2026-08-07T22:00:00.000Z",
      "2026-08-08T22:00:00.000Z",
    ]);
  });

  it("builds a Norway local month range as UTC boundaries", () => {
    expect(getZonedMonthRange("Europe/Oslo", new Date("2026-08-05T12:00:00.000Z"))).toEqual({
      startedAtFrom: "2026-07-31T22:00:00.000Z",
      startedAtTo: "2026-08-31T22:00:00.000Z",
    });
  });

  it("merges overlapping ranges to the widest half-open interval", () => {
    const month = getZonedMonthRange("Europe/Oslo", new Date("2026-08-05T12:00:00.000Z"));
    const week = getZonedWeekRange("Europe/Oslo", new Date("2026-08-05T12:00:00.000Z"));

    expect(mergeTimeRanges(month, week)).toEqual({
      startedAtFrom: "2026-07-31T22:00:00.000Z",
      startedAtTo: "2026-08-31T22:00:00.000Z",
    });
  });

  it("detects when a range fits within another", () => {
    const month = getZonedMonthRange("Europe/Oslo", new Date("2026-08-05T12:00:00.000Z"));
    const week = getZonedWeekRange("Europe/Oslo", new Date("2026-08-05T12:00:00.000Z"));
    const merged = mergeTimeRanges(month, week);

    expect(isTimeRangeWithin(week, merged)).toBe(true);
    expect(isTimeRangeWithin(month, merged)).toBe(true);
    expect(
      isTimeRangeWithin(
        getZonedMonthRange("Europe/Oslo", new Date("2026-07-05T12:00:00.000Z")),
        merged,
      ),
    ).toBe(false);
  });
});
