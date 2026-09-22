import { describe, expect, it } from "vitest";

import { getMessages } from "./messages";

describe("getMessages", () => {
  it("returns English chrome by default", () => {
    expect(getMessages().nav.today).toBe("Today");
    expect(getMessages("en").nav.chat).toBe("Event Agent Toby");
  });

  it("returns Finnish chrome", () => {
    expect(getMessages("fi").nav.today).toBe("Tänään");
    expect(getMessages("fi").nav.chat).toBe("Tapahtuma-agentti Toby");
    expect(getMessages("fi").dashboard.todaysEvents).toBe("Tämän päivän tapahtumat");
  });

  it("interpolates pending invite counts", () => {
    expect(getMessages("en").nav.pendingInvites(0)).toBe("Invites");
    expect(getMessages("en").nav.pendingInvites(2)).toBe("Invites, 2 pending");
    expect(getMessages("fi").nav.pendingInvites(2)).toBe("Kutsut, 2 odottavaa");
  });

  it("interpolates weekly event counts", () => {
    expect(getMessages("en").dashboard.eventsThisWeek(1)).toBe("1 event this week");
    expect(getMessages("en").dashboard.eventsThisWeek(3)).toBe("3 events this week");
    expect(getMessages("fi").dashboard.eventsThisWeek(1)).toBe("1 tapahtuma tällä viikolla");
    expect(getMessages("fi").dashboard.eventsThisWeek(3)).toBe("3 tapahtumaa tällä viikolla");
  });
});
