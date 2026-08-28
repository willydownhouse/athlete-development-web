import { describe, expect, it } from "vitest";

import { athleteEventIdFromPath } from "./dashboard-nav";

describe("athleteEventIdFromPath", () => {
  it("reads the event id from the event page", () => {
    expect(athleteEventIdFromPath("/athlete/ath-1/event/event-1")).toBe("event-1");
  });

  it("reads the event id from the media player page", () => {
    expect(athleteEventIdFromPath("/athlete/ath-1/event/event-1/media/media-1")).toBe("event-1");
  });

  it("decodes the event id", () => {
    expect(athleteEventIdFromPath("/athlete/ath-1/event/event%2D1")).toBe("event-1");
  });

  it("returns null outside an event or media route", () => {
    expect(athleteEventIdFromPath("/athlete/ath-1/dashboard")).toBeNull();
    expect(athleteEventIdFromPath("/athlete/ath-1/events")).toBeNull();
    expect(athleteEventIdFromPath("/athlete/ath-1/calendar")).toBeNull();
    expect(athleteEventIdFromPath("/athlete/ath-1/event/event-1/extra")).toBeNull();
  });
});
