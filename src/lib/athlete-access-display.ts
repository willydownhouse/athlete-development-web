import { intlDateLocale } from "@/lib/date-fns-locale";
import { DEFAULT_APP_LOCALE, type AppLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import type { AthleteAccessRole } from "@/lib/types";

export function athleteAccessRoleLabel(
  role: AthleteAccessRole,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  return role === "parent" ? getMessages(locale).access.parent : getMessages(locale).access.athlete;
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

export function formatInvitationExpiry(
  iso: string,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  return new Intl.DateTimeFormat(intlDateLocale(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
