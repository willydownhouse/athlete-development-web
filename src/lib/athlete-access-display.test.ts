import { describe, expect, it } from "vitest";

import {
  athleteAccessRoleLabel,
  formatInvitationExpiry,
  isParentRelationship,
  isRemovableAccessMember,
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

describe("isRemovableAccessMember", () => {
  const invitedParent = {
    role: "parent" as const,
    invitationId: "00000000-0000-4000-8000-000000000001",
  };

  it("lets the creator leave their own profile-creation grant", () => {
    expect(isRemovableAccessMember({ role: "parent", invitationId: null }, true)).toBe(true);
  });

  it("hides remove on the profile-creation grant for other parents", () => {
    expect(isRemovableAccessMember({ role: "parent", invitationId: null }, false)).toBe(false);
  });

  it("lets a parent remove an invited parent", () => {
    expect(isRemovableAccessMember(invitedParent, false)).toBe(true);
  });

  it("lets an invited parent leave", () => {
    expect(isRemovableAccessMember(invitedParent, true)).toBe(true);
  });

  it("lets a parent remove an athlete member", () => {
    expect(isRemovableAccessMember({ role: "athlete", invitationId: null }, false)).toBe(true);
  });
});

describe("formatInvitationExpiry", () => {
  it("formats an ISO timestamp", () => {
    expect(formatInvitationExpiry("2026-10-18T12:00:00.000Z")).toMatch(/Oct \d{1,2}, 2026/);
  });
});
