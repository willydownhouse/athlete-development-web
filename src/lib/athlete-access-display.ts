import type { AthleteAccessRole } from "@/lib/types";

const expiryFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function athleteAccessRoleLabel(role: AthleteAccessRole): string {
  return role === "parent" ? "Parent" : "Athlete";
}

export function isParentRelationship(role: AthleteAccessRole): boolean {
  return role === "parent";
}

export function isRemovableAccessMember(
  member: {
    role: AthleteAccessRole;
    invitationId: string | null;
  },
  isCurrentUser: boolean,
): boolean {
  if (isCurrentUser) {
    return true;
  }

  return !(member.role === "parent" && member.invitationId === null);
}

export function formatInvitationExpiry(iso: string): string {
  return expiryFormatter.format(new Date(iso));
}
