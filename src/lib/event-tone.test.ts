import { describe, expect, it } from "vitest";

import { getEventTone } from "./event-tone";
import type { Event } from "./types";

function toneFor(slug: string, extras: Partial<Pick<Event, "category" | "sportId">> = {}) {
  return getEventTone({
    category: extras.category ?? "training",
    sportId: extras.sportId === undefined ? "hockey" : extras.sportId,
    eventType: {
      id: slug,
      sportId: extras.sportId === undefined ? "hockey" : extras.sportId,
      category: extras.category ?? "training",
      slug,
      name: slug,
      active: true,
      createdAt: "2026-08-05T00:00:00.000Z",
      updatedAt: "2026-08-05T00:00:00.000Z",
      sport: null,
    },
  });
}

describe("event tone", () => {
  it("keeps team ice sessions on the ice tone", () => {
    expect(toneFor("ice_practice")).toBe("ice");
    expect(toneFor("team_practice")).toBe("ice");
  });

  it("uses skills for individual on-ice work", () => {
    expect(toneFor("individual_practice")).toBe("skills");
    expect(toneFor("skating")).toBe("skills");
    expect(toneFor("stickhandling")).toBe("skills");
    expect(toneFor("skill_training")).toBe("skills");
    expect(toneFor("shooting")).toBe("skills");
  });

  it("falls unknown sport training back to ice", () => {
    expect(
      getEventTone({
        category: "training",
        sportId: "hockey",
        eventType: {
          id: "unknown",
          sportId: "hockey",
          category: "training",
          slug: "unknown_drill",
          name: "Unknown drill",
          active: true,
          createdAt: "2026-08-05T00:00:00.000Z",
          updatedAt: "2026-08-05T00:00:00.000Z",
          sport: null,
        },
      }),
    ).toBe("ice");
  });
});
