import { describe, expect, it } from "vitest";

import {
  athleteAccessRoleLabel,
  formatInvitationExpiry,
  isParentRelationship,
} from "./athlete-access-display";

describe("athleteAccessRoleLabel", () => {
  it("labels parent and athlete roles", () => {
    expect(athleteAccessRoleLabel("parent")).toBe("Parent");
    expect(athleteAccessRoleLabel("athlete")).toBe("Athlete");
  });
});

describe("isParentRelationship", () => {
  it("is true only for parent", () => {
    expect(isParentRelationship("parent")).toBe(true);
    expect(isParentRelationship("athlete")).toBe(false);
  });
});

describe("formatInvitationExpiry", () => {
  it("formats an ISO timestamp", () => {
    expect(formatInvitationExpiry("2026-10-18T12:00:00.000Z")).toMatch(/Oct \d{1,2}, 2026/);
  });
});
