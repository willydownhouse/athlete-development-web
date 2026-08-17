import { describe, expect, it } from "vitest";

import { datesWithEvents, eventsForLocalDate } from "./event-grouping";
import type { Event } from "./types";

function buildEvent(startedAt: string): Event {
  return {
    id: startedAt,
    athleteId: "athlete-1",
    eventTypeId: "type-1",
    createdByUserId: "user-1",
    sportId: null,
    category: "training",
    title: null,
    description: null,
    startedAt,
    endedAt: null,
    durationSeconds: null,
    intensity: null,
    source: "form",
    originalInput: null,
    structuredData: null,
    createdAt: startedAt,
    updatedAt: startedAt,
    eventType: {
      id: "type-1",
      sportId: null,
      category: "training",
      slug: "ice_practice",
      name: "Ice practice",
      active: true,
      createdAt: startedAt,
      updatedAt: startedAt,
      sport: null,
    },
    metrics: [],
  };
}

describe("event grouping", () => {
  it("groups events by the provided time zone date", () => {
    const event = buildEvent("2026-08-04T22:30:00.000Z");

    expect(
      eventsForLocalDate([event], new Date("2026-08-05T00:00:00.000Z"), "Europe/Oslo"),
    ).toEqual([event]);
    const [dateWithEvent] = datesWithEvents([event], "Europe/Oslo");

    expect(dateWithEvent?.getFullYear()).toBe(2026);
    expect(dateWithEvent?.getMonth()).toBe(7);
    expect(dateWithEvent?.getDate()).toBe(5);
  });
});
