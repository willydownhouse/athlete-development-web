import { describe, expect, it } from "vitest";

import { getMessages } from "./messages";

describe("getMessages", () => {
  it("returns English chrome by default", () => {
    expect(getMessages().nav.today).toBe("Today");
    expect(getMessages("en").nav.chat).toBe("Event Agent Toby");
  });

  it("returns Finnish chrome", () => {
    expect(getMessages("fi").nav.today).toBe("Tänään");
    expect(getMessages("fi").nav.chat).toBe("Event Agent Toby");
    expect(getMessages("fi").dashboard.todaysEvents).toBe("Tänään");
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

  it("localizes web-owned action and load errors", () => {
    expect(getMessages("en").actions.signInAgain).toBe("You need to sign in again");
    expect(getMessages("fi").actions.signInAgain).toBe("Kirjaudu sisään uudelleen");
    expect(getMessages("en").actions.loadAthletes).toBe("Unable to load athletes");
    expect(getMessages("fi").actions.loadAthletes).toBe("Urheilijoita ei voitu ladata");
    expect(getMessages("en").actions.copyLimit(20)).toBe("You can copy up to 20 events at a time");
    expect(getMessages("fi").actions.copyLimit(20)).toBe(
      "Voit kopioida enintään 20 tapahtumaa kerralla",
    );
  });
});
