import type { HockeyStatsPeriod } from "@/lib/hockey-stats/period";

export const TODAY_NAV_LABEL = "Today";
export const CHAT_NAV_LABEL = "Event Agent Toby";
export const CHAT_HREF = "/chat";
export const USAGE_NAV_LABEL = "Usage";
export const USAGE_HREF = "/usage";
export const INVITES_NAV_LABEL = "Invites";
export const INVITES_HREF = "/invites";
export const HISTORY_NAV_LABEL = "History";

export function backToTodayLabel(): string {
  return `← Back to ${TODAY_NAV_LABEL}`;
}

export function backToEventLabel(): string {
  return "← Back to event";
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

export function appShellMobileTitle(pathname: string): string {
  if (isChatPath(pathname)) {
    return CHAT_NAV_LABEL;
  }

  if (isInvitesPath(pathname)) {
    return INVITES_NAV_LABEL;
  }

  if (isUsagePath(pathname)) {
    return USAGE_NAV_LABEL;
  }

  if (isAthleteDashboardPath(pathname) || pathname === "/dashboard") {
    return TODAY_NAV_LABEL;
  }

  if (/^\/athlete\/[^/]+\/calendar\/?$/.test(pathname)) {
    return "Calendar";
  }

  if (/^\/athlete\/[^/]+\/stats\/?$/.test(pathname)) {
    return "Stats";
  }

  if (/^\/athlete\/[^/]+\/events\/?$/.test(pathname)) {
    return HISTORY_NAV_LABEL;
  }

  if (/^\/athlete\/[^/]+\/event\/[^/]+\/media\/[^/]+\/?$/.test(pathname)) {
    return "Video";
  }

  if (/^\/athlete\/[^/]+\/event\/[^/]+\/?$/.test(pathname)) {
    return "Event";
  }

  return "Athlete Development Center";
}
