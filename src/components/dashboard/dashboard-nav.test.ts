import { describe, expect, it } from "vitest";

import { athleteEventIdFromPath, appShellMobileTitle, isChatPath } from "./dashboard-nav";

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

describe("chat nav", () => {
  it("treats /chat as the chat path", () => {
    expect(isChatPath("/chat")).toBe(true);
    expect(isChatPath("/chat/")).toBe(true);
    expect(isChatPath("/dashboard")).toBe(false);
  });

  it("uses Chat as the mobile title", () => {
    expect(appShellMobileTitle("/chat")).toBe("Chat");
  });
});
