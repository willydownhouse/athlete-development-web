import { describe, expect, it } from "vitest";

import { eventDetail } from "./event-display";
import type { Event } from "./types";

function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "event-1",
    athleteId: "athlete-1",
    eventTypeId: "type-1",
    createdByUserId: "user-1",
    sportId: null,
    category: "training",
    title: null,
    description: null,
    startedAt: "2026-08-05T14:00:00.000Z",
    endedAt: null,
    durationSeconds: null,
    intensity: null,
    source: "form",
    originalInput: null,
    structuredData: null,
    createdAt: "2026-08-05T14:00:00.000Z",
    updatedAt: "2026-08-05T14:00:00.000Z",
    eventType: {
      id: "type-1",
      sportId: null,
      category: "training",
      slug: "ice_practice",
      name: "Ice practice",
      active: true,
      createdAt: "2026-08-05T14:00:00.000Z",
      updatedAt: "2026-08-05T14:00:00.000Z",
      sport: null,
    },
    metrics: [],
    ...overrides,
  };
}

describe("eventDetail", () => {
  it("formats stored UTC timestamps in the provided time zone", () => {
    expect(eventDetail(buildEvent(), { timeZone: "Europe/Oslo" })).toBe("16:00");
  });

  it("formats event dates in the provided time zone", () => {
    expect(eventDetail(buildEvent(), { showDate: true, timeZone: "Europe/Oslo" })).toBe(
      "Wed 5 Aug · 16:00",
    );
  });
});
