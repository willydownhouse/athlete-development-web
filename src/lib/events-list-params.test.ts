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
  resolveEventsListItemTypeId,
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
      eventTypeIds: [],
      categories: [],
      measure: "events",
      show: "events",
      metricDefinitionId: undefined,
      label: undefined,
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
        eventTypeIds: [
          "00000000-0000-4000-8000-000000000201",
          "00000000-0000-4000-8000-000000000209",
        ],
      }),
    ).toEqual({
      limit: 20,
      page: 3,
      offset: 40,
      from: "2026-08-01",
      to: "2026-08-07",
      eventTypeIds: [
        "00000000-0000-4000-8000-000000000201",
        "00000000-0000-4000-8000-000000000209",
      ],
      categories: [],
      measure: "events",
      show: "events",
      metricDefinitionId: undefined,
      label: undefined,
      explicitDateRange: true,
    });
  });

  it("parses comma-separated event type ids", () => {
    expect(
      parseEventsListSearchParams({
        eventTypeIds: "00000000-0000-4000-8000-000000000201,00000000-0000-4000-8000-000000000209",
      }).eventTypeIds,
    ).toEqual(["00000000-0000-4000-8000-000000000201", "00000000-0000-4000-8000-000000000209"]);
  });

  it("keeps a legacy single eventTypeId", () => {
    expect(
      parseEventsListSearchParams({
        eventTypeId: "00000000-0000-4000-8000-000000000201",
      }),
    ).toEqual({
      limit: EVENTS_LIST_DEFAULT_LIMIT,
      page: EVENTS_LIST_DEFAULT_PAGE,
      offset: 0,
      from: undefined,
      to: undefined,
      eventTypeIds: ["00000000-0000-4000-8000-000000000201"],
      categories: [],
      measure: "events",
      show: "events",
      metricDefinitionId: undefined,
      label: undefined,
      explicitDateRange: false,
    });
  });

  it("parses comma-separated categories", () => {
    expect(
      parseEventsListSearchParams({
        categories: "training,competition",
      }).categories,
    ).toEqual(["training", "competition"]);
  });

  it("ignores invalid categories", () => {
    expect(
      parseEventsListSearchParams({
        categories: "training,not-a-category",
      }).categories,
    ).toEqual(["training"]);
  });

  it("ignores invalid values", () => {
    expect(
      parseEventsListSearchParams({
        limit: "0",
        page: "-1",
        from: "not-a-date",
        eventTypeId: "bad-id",
        show: "not-a-show",
      }),
    ).toEqual({
      limit: EVENTS_LIST_DEFAULT_LIMIT,
      page: EVENTS_LIST_DEFAULT_PAGE,
      offset: 0,
      from: undefined,
      to: undefined,
      eventTypeIds: [],
      categories: [],
      measure: "events",
      show: "events",
      metricDefinitionId: undefined,
      label: undefined,
      explicitDateRange: false,
    });
  });

  it("parses show", () => {
    expect(parseEventsListSearchParams({ show: "count" }).show).toBe("count");
    expect(parseEventsListSearchParams({ show: "durationSeconds" }).show).toBe("durationSeconds");
    expect(parseEventsListSearchParams({ show: "metric" }).show).toBe("metric");
    expect(parseEventsListSearchParams({ show: "metricAverage" }).show).toBe("metricAverage");
  });

  it("parses a metric definition id", () => {
    expect(
      parseEventsListSearchParams({
        show: "metric",
        metricDefinitionId: "00000000-0000-4000-8000-000000000401",
      }).metricDefinitionId,
    ).toBe("00000000-0000-4000-8000-000000000401");
  });

  it("parses item measures and defaults their show to count", () => {
    expect(parseEventsListSearchParams({ measure: "warm_up" })).toMatchObject({
      measure: "warm_up",
      show: "count",
      metricDefinitionId: undefined,
      label: undefined,
    });
    expect(
      parseEventsListSearchParams({ measure: "cool_down", show: "durationSeconds" }).show,
    ).toBe("durationSeconds");
  });

  it("coerces list shows to item count for item measures and keeps metric shows", () => {
    expect(parseEventsListSearchParams({ measure: "warm_up", show: "events" }).show).toBe("count");
    expect(
      parseEventsListSearchParams({
        measure: "cool_down",
        show: "metric",
        metricDefinitionId: "00000000-0000-4000-8000-000000000401",
      }),
    ).toMatchObject({
      measure: "cool_down",
      show: "metric",
      metricDefinitionId: "00000000-0000-4000-8000-000000000401",
      label: undefined,
    });
  });

  it("parses an exercise measure and normalizes its name", () => {
    expect(
      parseEventsListSearchParams({
        measure: "exercise",
      }),
    ).toMatchObject({
      measure: "exercise",
      show: "count",
      label: undefined,
    });
    expect(
      parseEventsListSearchParams({
        measure: "exercise",
        label: "  BACK   SQUAT ",
        show: "durationSeconds",
      }),
    ).toMatchObject({
      measure: "exercise",
      show: "durationSeconds",
      metricDefinitionId: undefined,
      label: "BACK SQUAT",
    });
    expect(
      parseEventsListSearchParams({
        measure: "exercise",
        label: "Back squat",
        show: "metricAverage",
        metricDefinitionId: "00000000-0000-4000-8000-000000000401",
      }),
    ).toMatchObject({
      measure: "exercise",
      show: "metricAverage",
      metricDefinitionId: "00000000-0000-4000-8000-000000000401",
      label: "Back squat",
    });
    expect(
      parseEventsListSearchParams({
        measure: "exercise",
        label: "   ",
      }).label,
    ).toBeUndefined();
    expect(
      parseEventsListSearchParams({
        measure: "warm_up",
        label: "Treadmill",
      }).label,
    ).toBeUndefined();
    expect(
      parseEventsListSearchParams({
        measure: "exercise",
        label: "x".repeat(101),
      }).label,
    ).toBeUndefined();
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
        eventTypeIds: [],
        categories: [],
        measure: "events",
        show: "events",
      }),
    ).toBe("");
  });

  it("serializes multiple event type ids as one comma-separated param", () => {
    expect(
      buildEventsListQueryString({
        limit: EVENTS_LIST_DEFAULT_LIMIT,
        page: EVENTS_LIST_DEFAULT_PAGE,
        offset: 0,
        from: "2026-08-01",
        eventTypeIds: [
          "00000000-0000-4000-8000-000000000209",
          "00000000-0000-4000-8000-000000000201",
        ],
        categories: [],
        measure: "events",
        show: "events",
        explicitDateRange: true,
      }),
    ).toBe(
      "from=2026-08-01&eventTypeIds=00000000-0000-4000-8000-000000000209,00000000-0000-4000-8000-000000000201",
    );
  });

  it("serializes active filters", () => {
    expect(
      buildEventsListQueryString({
        limit: 20,
        page: 2,
        offset: 20,
        from: "2026-08-01",
        eventTypeIds: ["00000000-0000-4000-8000-000000000201"],
        categories: [],
        measure: "events",
        show: "events",
        explicitDateRange: true,
      }),
    ).toBe("limit=20&page=2&from=2026-08-01&eventTypeIds=00000000-0000-4000-8000-000000000201");
  });

  it("serializes multiple categories as one comma-separated param", () => {
    expect(
      buildEventsListQueryString({
        limit: EVENTS_LIST_DEFAULT_LIMIT,
        page: EVENTS_LIST_DEFAULT_PAGE,
        offset: 0,
        eventTypeIds: [],
        categories: ["training", "competition"],
        measure: "events",
        show: "events",
        explicitDateRange: false,
      }),
    ).toBe("categories=training,competition");
  });

  it("serializes a non-default show and omits list pagination", () => {
    expect(
      buildEventsListQueryString({
        limit: 20,
        page: 2,
        offset: 20,
        eventTypeIds: [],
        categories: [],
        measure: "events",
        show: "count",
        explicitDateRange: false,
      }),
    ).toBe("show=count");
  });

  it("serializes metric total with a metric definition id", () => {
    expect(
      buildEventsListQueryString({
        limit: EVENTS_LIST_DEFAULT_LIMIT,
        page: EVENTS_LIST_DEFAULT_PAGE,
        offset: 0,
        eventTypeIds: [],
        categories: [],
        measure: "events",
        show: "metric",
        metricDefinitionId: "00000000-0000-4000-8000-000000000401",
        explicitDateRange: false,
      }),
    ).toBe("show=metric&metricDefinitionId=00000000-0000-4000-8000-000000000401");
  });

  it("serializes metric average with a metric definition id", () => {
    expect(
      buildEventsListQueryString({
        limit: EVENTS_LIST_DEFAULT_LIMIT,
        page: EVENTS_LIST_DEFAULT_PAGE,
        offset: 0,
        eventTypeIds: [],
        categories: [],
        measure: "events",
        show: "metricAverage",
        metricDefinitionId: "00000000-0000-4000-8000-000000000401",
        explicitDateRange: false,
      }),
    ).toBe("show=metricAverage&metricDefinitionId=00000000-0000-4000-8000-000000000401");
  });

  it("serializes a warm-up item count without a show param", () => {
    expect(
      buildEventsListQueryString({
        limit: 20,
        page: 2,
        offset: 20,
        eventTypeIds: [],
        categories: [],
        measure: "warm_up",
        show: "count",
        metricDefinitionId: "00000000-0000-4000-8000-000000000401",
        explicitDateRange: false,
      }),
    ).toBe("measure=warm_up");
  });

  it("serializes cool-down duration", () => {
    expect(
      buildEventsListQueryString({
        limit: EVENTS_LIST_DEFAULT_LIMIT,
        page: EVENTS_LIST_DEFAULT_PAGE,
        offset: 0,
        from: "2026-08-01",
        to: "2026-08-07",
        eventTypeIds: ["00000000-0000-4000-8000-000000000201"],
        categories: ["training"],
        measure: "cool_down",
        show: "durationSeconds",
        explicitDateRange: true,
      }),
    ).toBe(
      "from=2026-08-01&to=2026-08-07&eventTypeIds=00000000-0000-4000-8000-000000000201&categories=training&measure=cool_down&show=durationSeconds",
    );
  });

  it("serializes an exercise name and omits a blank label", () => {
    expect(
      buildEventsListQueryString({
        limit: EVENTS_LIST_DEFAULT_LIMIT,
        page: EVENTS_LIST_DEFAULT_PAGE,
        offset: 0,
        eventTypeIds: [],
        categories: [],
        measure: "exercise",
        show: "count",
        label: "Back squat",
        explicitDateRange: false,
      }),
    ).toBe("measure=exercise&label=Back+squat");
    expect(
      buildEventsListQueryString({
        limit: EVENTS_LIST_DEFAULT_LIMIT,
        page: EVENTS_LIST_DEFAULT_PAGE,
        offset: 0,
        eventTypeIds: [],
        categories: [],
        measure: "exercise",
        show: "count",
        explicitDateRange: false,
      }),
    ).toBe("measure=exercise");
    expect(
      buildEventsListQueryString({
        limit: EVENTS_LIST_DEFAULT_LIMIT,
        page: EVENTS_LIST_DEFAULT_PAGE,
        offset: 0,
        eventTypeIds: [],
        categories: [],
        measure: "exercise",
        show: "metric",
        metricDefinitionId: "00000000-0000-4000-8000-000000000401",
        label: "Back squat",
        explicitDateRange: false,
      }),
    ).toBe(
      "measure=exercise&show=metric&metricDefinitionId=00000000-0000-4000-8000-000000000401&label=Back+squat",
    );
    expect(
      buildEventsListQueryString({
        limit: EVENTS_LIST_DEFAULT_LIMIT,
        page: EVENTS_LIST_DEFAULT_PAGE,
        offset: 0,
        eventTypeIds: [],
        categories: [],
        measure: "warm_up",
        show: "count",
        label: "Treadmill",
        explicitDateRange: false,
      }),
    ).toBe("measure=warm_up");
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
      eventTypeIds: [],
      categories: [],
      measure: "events",
      show: "events",
      metricDefinitionId: undefined,
      label: undefined,
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

describe("resolveEventsListItemTypeId", () => {
  it("prefers a general item type over a sport-specific match", () => {
    expect(
      resolveEventsListItemTypeId(
        [
          {
            id: "00000000-0000-4000-8000-000000000701",
            slug: "warm_up",
            sportId: "00000000-0000-4000-8000-000000000001",
          },
          {
            id: "00000000-0000-4000-8000-000000000605",
            slug: "warm_up",
            sportId: null,
          },
        ],
        "warm_up",
        "00000000-0000-4000-8000-000000000001",
      ),
    ).toBe("00000000-0000-4000-8000-000000000605");
  });
});
