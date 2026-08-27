import {
  buildEventsListQueryString,
  EVENTS_LIST_DEFAULT_LIMIT,
  EVENTS_LIST_DEFAULT_PAGE,
  getDefaultEventsListWeekDates,
  getEventsListDayDates,
} from "@/lib/events-list-params";
import type { HockeyStatsPeriod } from "@/lib/hockey-stats/period";

export const TODAY_NAV_LABEL = "Today";

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

export function athleteEventMediaHref(athleteId: string, eventId: string, mediaId: string): string {
  return `${athleteEventHref(athleteId, eventId)}/media/${encodeURIComponent(mediaId)}`;
}

export function athleteEventsHref(athleteId: string): string {
  return `/athlete/${encodeURIComponent(athleteId)}/events`;
}

function athleteEventsHrefWithDateRange(athleteId: string, from: string, to: string): string {
  const query = buildEventsListQueryString({
    limit: EVENTS_LIST_DEFAULT_LIMIT,
    page: EVENTS_LIST_DEFAULT_PAGE,
    offset: 0,
    from,
    to,
    explicitDateRange: true,
  });
  const base = athleteEventsHref(athleteId);

  return query ? `${base}?${query}` : base;
}

export function athleteEventsWeekHref(
  athleteId: string,
  timeZone: string,
  date = new Date(),
): string {
  const { from, to } = getDefaultEventsListWeekDates(timeZone, date);

  return athleteEventsHrefWithDateRange(athleteId, from, to);
}

export function athleteEventsDayHref(
  athleteId: string,
  timeZone: string,
  date = new Date(),
): string {
  const { from, to } = getEventsListDayDates(timeZone, date);

  return athleteEventsHrefWithDateRange(athleteId, from, to);
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

export function appShellMobileTitle(pathname: string): string {
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
    return "Events";
  }

  if (/^\/athlete\/[^/]+\/event\/[^/]+\/media\/[^/]+\/?$/.test(pathname)) {
    return "Video";
  }

  if (/^\/athlete\/[^/]+\/event\/[^/]+\/?$/.test(pathname)) {
    return "Event";
  }

  return "Athlete Development Center";
}
