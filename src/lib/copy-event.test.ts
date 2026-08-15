import { describe, expect, it } from "vitest";

import {
  buildCopyForTodayPreservingTime,
  buildDayCopyForToday,
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
};

describe("copy-event helpers", () => {
  it("preserves local time-of-day when copying to today", () => {
    const now = new Date("2026-08-15T12:00:00.000Z");
    const body = buildCopyForTodayPreservingTime(baseSource, "Europe/Oslo", now);

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

  it("rejects batches over the max size", () => {
    const sources = Array.from({ length: EVENT_BATCH_CREATE_MAX_ITEMS + 1 }, (_, index) => ({
      ...baseSource,
      title: `Event ${index}`,
    }));

    expect(buildDayCopyForToday(sources, "Europe/Oslo")).toEqual({
      error: `You can copy up to ${EVENT_BATCH_CREATE_MAX_ITEMS} events at a time`,
    });
  });

  it("builds a batch payload for multiple events", () => {
    const now = new Date("2026-08-15T12:00:00.000Z");
    const secondSource: EventCopySource = {
      ...baseSource,
      startedAt: "2026-08-10T16:00:00.000Z",
      title: "Evening game",
    };

    const result = buildDayCopyForToday([baseSource, secondSource], "Europe/Oslo", now);

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
});
