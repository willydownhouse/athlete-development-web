import { describe, expect, it } from "vitest";

import {
  buildEventsListQueryString,
  EVENTS_LIST_DEFAULT_LIMIT,
  EVENTS_LIST_DEFAULT_PAGE,
  eventsListDateRange,
  eventsListPageCount,
  getDefaultEventsListWeekDates,
  getEventsListDayDates,
  parseEventsListSearchParams,
  resolveEventsListSearchParams,
} from "./events-list-params";

describe("parseEventsListSearchParams", () => {
  it("uses defaults when search params are missing", () => {
    expect(parseEventsListSearchParams({})).toEqual({
      limit: EVENTS_LIST_DEFAULT_LIMIT,
      page: EVENTS_LIST_DEFAULT_PAGE,
      offset: 0,
      from: undefined,
      to: undefined,
      eventTypeId: undefined,
      explicitDateRange: false,
    });
  });

  it("parses pagination and filters", () => {
    expect(
      parseEventsListSearchParams({
        limit: "20",
        page: "3",
        from: "2026-08-01",
        to: "2026-08-07",
        eventTypeId: "00000000-0000-4000-8000-000000000201",
      }),
    ).toEqual({
      limit: 20,
      page: 3,
      offset: 40,
      from: "2026-08-01",
      to: "2026-08-07",
      eventTypeId: "00000000-0000-4000-8000-000000000201",
      explicitDateRange: true,
    });
  });

  it("ignores invalid values", () => {
    expect(
      parseEventsListSearchParams({
        limit: "0",
        page: "-1",
        from: "not-a-date",
        eventTypeId: "bad-id",
      }),
    ).toEqual({
      limit: EVENTS_LIST_DEFAULT_LIMIT,
      page: EVENTS_LIST_DEFAULT_PAGE,
      offset: 0,
      from: undefined,
      to: undefined,
      eventTypeId: undefined,
      explicitDateRange: false,
    });
  });
});

describe("buildEventsListQueryString", () => {
  it("omits default page and limit values", () => {
    expect(
      buildEventsListQueryString({
        limit: EVENTS_LIST_DEFAULT_LIMIT,
        page: EVENTS_LIST_DEFAULT_PAGE,
        offset: 0,
        explicitDateRange: false,
        from: "2026-08-04",
        to: "2026-08-10",
      }),
    ).toBe("");
  });

  it("serializes active filters", () => {
    expect(
      buildEventsListQueryString({
        limit: 20,
        page: 2,
        offset: 20,
        from: "2026-08-01",
        eventTypeId: "00000000-0000-4000-8000-000000000201",
        explicitDateRange: true,
      }),
    ).toBe("limit=20&page=2&from=2026-08-01&eventTypeId=00000000-0000-4000-8000-000000000201");
  });
});

describe("getDefaultEventsListWeekDates", () => {
  it("returns the local Monday through Sunday for the given week", () => {
    expect(
      getDefaultEventsListWeekDates("Europe/Oslo", new Date("2026-08-05T12:00:00.000Z")),
    ).toEqual({
      from: "2026-08-03",
      to: "2026-08-09",
    });
  });
});

describe("getEventsListDayDates", () => {
  it("returns the same local date for from and to", () => {
    expect(getEventsListDayDates("Europe/Oslo", new Date("2026-08-05T12:00:00.000Z"))).toEqual({
      from: "2026-08-05",
      to: "2026-08-05",
    });
  });
});

describe("resolveEventsListSearchParams", () => {
  it("applies this week's date range when no dates are in the URL", () => {
    expect(
      resolveEventsListSearchParams(
        parseEventsListSearchParams({}),
        "Europe/Oslo",
        new Date("2026-08-05T12:00:00.000Z"),
      ),
    ).toEqual({
      limit: EVENTS_LIST_DEFAULT_LIMIT,
      page: EVENTS_LIST_DEFAULT_PAGE,
      offset: 0,
      from: "2026-08-03",
      to: "2026-08-09",
      sportId: undefined,
      eventTypeId: undefined,
      explicitDateRange: false,
    });
  });

  it("keeps explicit URL date filters unchanged", () => {
    expect(
      resolveEventsListSearchParams(
        parseEventsListSearchParams({ from: "2026-07-01", to: "2026-07-31" }),
        "Europe/Oslo",
      ).from,
    ).toBe("2026-07-01");
  });
});

describe("eventsListDateRange", () => {
  it("builds a half-open interval for an inclusive date range", () => {
    expect(eventsListDateRange("UTC", "2026-08-01", "2026-08-02")).toEqual({
      startedAtFrom: "2026-08-01T00:00:00.000Z",
      startedAtTo: "2026-08-03T00:00:00.000Z",
    });
  });
});

describe("eventsListPageCount", () => {
  it("returns at least one page", () => {
    expect(eventsListPageCount(0, 10)).toBe(1);
    expect(eventsListPageCount(25, 10)).toBe(3);
  });
});
