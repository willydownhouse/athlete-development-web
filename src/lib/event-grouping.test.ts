import { describe, expect, it } from "vitest";

import { datesWithEvents, eventTonesByLocalDate, eventsForLocalDate } from "./event-grouping";
import type { Event } from "./types";

function buildEvent(
  startedAt: string,
  eventType: Partial<Event["eventType"]> & Pick<Event, "category" | "sportId"> = {
    category: "training",
    sportId: null,
  },
): Event {
  return {
    id: `${startedAt}-${eventType.slug ?? "ice_practice"}`,
    athleteId: "athlete-1",
    eventTypeId: eventType.id ?? "type-1",
    createdByUserId: "user-1",
    sportId: eventType.sportId,
    category: eventType.category,
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
      id: eventType.id ?? "type-1",
      sportId: eventType.sportId,
      category: eventType.category,
      slug: eventType.slug ?? "ice_practice",
      name: eventType.name ?? "Ice practice",
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

  it("collects unique event tones for each local date", () => {
    const ice = buildEvent("2026-08-05T10:00:00.000Z", {
      category: "training",
      sportId: "hockey",
      slug: "ice_practice",
      name: "Ice practice",
    });
    const game = buildEvent("2026-08-05T16:00:00.000Z", {
      category: "competition",
      sportId: "hockey",
      slug: "game",
      name: "Game",
    });
    const anotherIce = buildEvent("2026-08-05T18:00:00.000Z", {
      category: "training",
      sportId: "hockey",
      slug: "team_practice",
      name: "Team practice",
    });
    const shooting = buildEvent("2026-08-05T19:00:00.000Z", {
      category: "training",
      sportId: "hockey",
      slug: "shooting",
      name: "Shooting",
    });
    const rest = buildEvent("2026-08-06T10:00:00.000Z", {
      category: "recovery",
      sportId: null,
      slug: "rest",
      name: "Rest",
    });

    const tonesByDate = eventTonesByLocalDate([game, shooting, ice, anotherIce, rest], "UTC");

    expect(tonesByDate.get("2026-08-05")).toEqual(["ice", "skills", "game"]);
    expect(tonesByDate.get("2026-08-06")).toEqual(["rest"]);
  });
});
