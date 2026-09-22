import { describe, expect, it } from "vitest";

import {
  athleteEventIdFromPath,
  appShellMobileTitle,
  ACCESS_NAV_LABEL,
  HISTORY_NAV_LABEL,
  isChatPath,
  isInvitesPath,
  isOnboardingPath,
  isUsagePath,
  pendingInvitesMenuButtonLabel,
  pendingInvitesNavLabel,
} from "./dashboard-nav";

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

  it("uses Event Agent Toby as the mobile title", () => {
    expect(appShellMobileTitle("/chat")).toBe("Event Agent Toby");
    expect(appShellMobileTitle("/chat", "fi")).toBe("Tapahtuma-agentti Toby");
  });
});

describe("usage nav", () => {
  it("treats /usage as the usage path", () => {
    expect(isUsagePath("/usage")).toBe(true);
    expect(isUsagePath("/usage/")).toBe(true);
    expect(isUsagePath("/dashboard")).toBe(false);
  });

  it("uses Usage as the mobile title", () => {
    expect(appShellMobileTitle("/usage")).toBe("Usage");
  });
});

describe("invites nav", () => {
  it("treats /invites as the invites path", () => {
    expect(isInvitesPath("/invites")).toBe(true);
    expect(isInvitesPath("/invites/")).toBe(true);
    expect(isInvitesPath("/dashboard")).toBe(false);
  });

  it("uses Invites as the mobile title", () => {
    expect(appShellMobileTitle("/invites")).toBe("Invites");
  });

  it("adds a pending count to the nav label", () => {
    expect(pendingInvitesNavLabel(0)).toBe("Invites");
    expect(pendingInvitesNavLabel(1)).toBe("Invites, 1 pending");
    expect(pendingInvitesNavLabel(3)).toBe("Invites, 3 pending");
  });

  it("adds a pending count to the mobile menu button label", () => {
    expect(pendingInvitesMenuButtonLabel(0)).toBe("Open menu");
    expect(pendingInvitesMenuButtonLabel(2)).toBe("Open menu, 2 pending");
  });
});

describe("history nav", () => {
  it("uses History as the mobile title", () => {
    expect(appShellMobileTitle("/athlete/ath-1/events")).toBe(HISTORY_NAV_LABEL);
  });
});

describe("access nav", () => {
  it("uses Access as the mobile title", () => {
    expect(appShellMobileTitle("/athlete/ath-1/access")).toBe(ACCESS_NAV_LABEL);
  });
});

describe("onboarding nav", () => {
  it("uses Add athlete as the mobile title", () => {
    expect(isOnboardingPath("/onboarding")).toBe(true);
    expect(isOnboardingPath("/onboarding/athlete")).toBe(true);
    expect(isOnboardingPath("/dashboard")).toBe(false);
    expect(appShellMobileTitle("/onboarding")).toBe("Add athlete");
    expect(appShellMobileTitle("/onboarding/athlete")).toBe("Add athlete");
  });
});
