import type { HockeyStatsPeriod } from "@/lib/hockey-stats/period";
import { DEFAULT_APP_LOCALE, type AppLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

export const CHAT_HREF = "/chat";
export const USAGE_HREF = "/usage";
export const INVITES_HREF = "/invites";
export const HISTORY_NAV_LABEL = getMessages("en").nav.history;
export const ACCESS_NAV_LABEL = getMessages("en").nav.access;

export function pendingInvitesNavLabel(
  count: number,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  return getMessages(locale).nav.pendingInvites(count);
}

export function pendingInvitesMenuButtonLabel(
  count: number,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  return getMessages(locale).nav.pendingMenu(count);
}

export function backToTodayLabel(locale: AppLocale = DEFAULT_APP_LOCALE): string {
  return getMessages(locale).nav.backToToday;
}

export function backToEventLabel(locale: AppLocale = DEFAULT_APP_LOCALE): string {
  return getMessages(locale).nav.backToEvent;
}

export function dashboardHref(athleteId: string): string {
  return `/athlete/${encodeURIComponent(athleteId)}/dashboard`;
}

export function athleteCalendarHref(athleteId: string): string {
  return `/athlete/${encodeURIComponent(athleteId)}/calendar`;
}

export function athleteStatsHref(athleteId: string, period: HockeyStatsPeriod = "week"): string {
  const params = new URLSearchParams({ statsPeriod: period });

  return `/athlete/${encodeURIComponent(athleteId)}/stats?${params.toString()}`;
}

export function athleteEventHref(athleteId: string, eventId: string): string {
  return `/athlete/${encodeURIComponent(athleteId)}/event/${encodeURIComponent(eventId)}`;
}

export function athleteEventIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/athlete\/[^/]+\/event\/([^/]+)(?:\/media\/[^/]+)?\/?$/);

  if (!match?.[1]) {
    return null;
  }

  return decodeURIComponent(match[1]);
}

export function athleteEventMediaHref(athleteId: string, eventId: string, mediaId: string): string {
  return `${athleteEventHref(athleteId, eventId)}/media/${encodeURIComponent(mediaId)}`;
}

export function athleteEventsHref(athleteId: string): string {
  return `/athlete/${encodeURIComponent(athleteId)}/events`;
}

export function athleteAccessHref(athleteId: string): string {
  return `/athlete/${encodeURIComponent(athleteId)}/access`;
}

export function athleteProfileHref(athleteId: string): string {
  return `/athlete/${encodeURIComponent(athleteId)}/profile`;
}

export function defaultDashboardHref(athletes: { id: string }[]): string {
  const firstAthlete = athletes[0];

  return firstAthlete ? dashboardHref(firstAthlete.id) : "/dashboard";
}

export function activeAthleteIdFromPath(pathname: string): string | null {
  const prefix = "/athlete/";
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const athleteId = pathname.slice(prefix.length).split("/")[0];
  return athleteId ? decodeURIComponent(athleteId) : null;
}

export function isAthleteDashboardPath(pathname: string): boolean {
  return /^\/athlete\/[^/]+\/dashboard\/?$/.test(pathname);
}

export function isChatPath(pathname: string): boolean {
  return pathname === CHAT_HREF || pathname.startsWith(`${CHAT_HREF}/`);
}

export function isUsagePath(pathname: string): boolean {
  return pathname === USAGE_HREF || pathname.startsWith(`${USAGE_HREF}/`);
}

export function isInvitesPath(pathname: string): boolean {
  return pathname === INVITES_HREF || pathname.startsWith(`${INVITES_HREF}/`);
}

export function isOnboardingPath(pathname: string): boolean {
  return pathname === "/onboarding" || pathname.startsWith("/onboarding/");
}

export function appShellMobileTitle(
  pathname: string,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): string {
  const messages = getMessages(locale);

  if (isChatPath(pathname)) {
    return messages.nav.chat;
  }

  if (isInvitesPath(pathname)) {
    return messages.nav.invites;
  }

  if (isUsagePath(pathname)) {
    return messages.nav.usage;
  }

  if (isAthleteDashboardPath(pathname) || pathname === "/dashboard") {
    return messages.nav.today;
  }

  if (/^\/athlete\/[^/]+\/calendar\/?$/.test(pathname)) {
    return messages.nav.calendar;
  }

  if (/^\/athlete\/[^/]+\/stats\/?$/.test(pathname)) {
    return messages.nav.stats;
  }

  if (/^\/athlete\/[^/]+\/events\/?$/.test(pathname)) {
    return messages.nav.history;
  }

  if (/^\/athlete\/[^/]+\/access\/?$/.test(pathname)) {
    return messages.nav.access;
  }

  if (/^\/athlete\/[^/]+\/profile\/?$/.test(pathname)) {
    return messages.nav.profile;
  }

  if (/^\/athlete\/[^/]+\/event\/[^/]+\/media\/[^/]+\/?$/.test(pathname)) {
    return messages.nav.video;
  }

  if (/^\/athlete\/[^/]+\/event\/[^/]+\/?$/.test(pathname)) {
    return messages.nav.event;
  }

  if (isOnboardingPath(pathname)) {
    return messages.nav.addAthlete;
  }

  return messages.brand;
}
