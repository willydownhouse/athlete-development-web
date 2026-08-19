import { describe, expect, it } from "vitest";

import {
  buildCopyForDatePreservingTime,
  buildDayCopyForDate,
  EVENT_BATCH_CREATE_MAX_ITEMS,
  type EventCopySource,
} from "./copy-event";

const baseSource: EventCopySource = {
  eventTypeId: "00000000-0000-4000-8000-000000000201",
  startedAt: "2026-08-10T06:30:00.000Z",
  title: "Morning skate",
  description: null,
  durationSeconds: 3600,
  intensity: "moderate",
  metrics: [
    {
      metricDefinitionId: "00000000-0000-4000-8000-000000000301",
      numericValue: 6,
    },
  ],
  items: [],
};

describe("copy-event helpers", () => {
  it("preserves local time-of-day when copying to a target date", () => {
    const body = buildCopyForDatePreservingTime(baseSource, "Europe/Oslo", "2026-08-15");

    expect(body).toMatchObject({
      eventTypeId: baseSource.eventTypeId,
      source: "form",
      title: "Morning skate",
      durationSeconds: 3600,
      intensity: "moderate",
      metrics: baseSource.metrics,
    });
    expect(body?.startedAt).toBe("2026-08-15T06:30:00.000Z");
  });

  it("includes nested event items in the copy payload", () => {
    const source: EventCopySource = {
      ...baseSource,
      title: "Strength session",
      metrics: [],
      items: [
        {
          eventItemTypeId: "00000000-0000-4000-8000-000000000401",
          sortOrder: 0,
          label: "Curls",
          children: [
            {
              eventItemTypeId: "00000000-0000-4000-8000-000000000402",
              sortOrder: 0,
              metrics: [
                {
                  metricDefinitionId: "00000000-0000-4000-8000-000000000501",
                  numericValue: 10,
                },
              ],
            },
          ],
        },
      ],
    };

    expect(buildCopyForDatePreservingTime(source, "Europe/Oslo", "2026-08-15")).toMatchObject({
      title: "Strength session",
      items: source.items,
    });
  });

  it("rejects batches over the max size", () => {
    const sources = Array.from({ length: EVENT_BATCH_CREATE_MAX_ITEMS + 1 }, (_, index) => ({
      ...baseSource,
      title: `Event ${index}`,
    }));

    expect(buildDayCopyForDate(sources, "Europe/Oslo", "2026-08-15")).toEqual({
      error: `You can copy up to ${EVENT_BATCH_CREATE_MAX_ITEMS} events at a time`,
    });
  });

  it("builds a batch payload for multiple events", () => {
    const secondSource: EventCopySource = {
      ...baseSource,
      startedAt: "2026-08-10T16:00:00.000Z",
      title: "Evening game",
    };

    const result = buildDayCopyForDate([baseSource, secondSource], "Europe/Oslo", "2026-08-15");

    expect(result).toEqual({
      events: [
        expect.objectContaining({
          title: "Morning skate",
          startedAt: "2026-08-15T06:30:00.000Z",
        }),
        expect.objectContaining({
          title: "Evening game",
          startedAt: "2026-08-15T16:00:00.000Z",
        }),
      ],
    });
  });

  it("includes event items in a batch copy payload", () => {
    const strengthSource: EventCopySource = {
      ...baseSource,
      title: "Strength session",
      metrics: [],
      items: [
        {
          eventItemTypeId: "00000000-0000-4000-8000-000000000401",
          sortOrder: 0,
          label: "Curls",
          children: [
            {
              eventItemTypeId: "00000000-0000-4000-8000-000000000402",
              sortOrder: 0,
              metrics: [
                {
                  metricDefinitionId: "00000000-0000-4000-8000-000000000501",
                  numericValue: 10,
                },
              ],
            },
          ],
        },
      ],
    };

    const result = buildDayCopyForDate([strengthSource], "Europe/Oslo", "2026-08-15");

    expect(result).toEqual({
      events: [
        expect.objectContaining({
          title: "Strength session",
          items: strengthSource.items,
        }),
      ],
    });
  });
});
