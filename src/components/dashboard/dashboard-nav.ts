import {
  buildEventsListQueryString,
  EVENTS_LIST_DEFAULT_LIMIT,
  EVENTS_LIST_DEFAULT_PAGE,
  getDefaultEventsListWeekDates,
  getEventsListDayDates,
} from "@/lib/events-list-params";

export function dashboardHref(athleteId: string): string {
  return `/athlete/${encodeURIComponent(athleteId)}/dashboard`;
}

export function athleteEventHref(athleteId: string, eventId: string): string {
  return `/athlete/${encodeURIComponent(athleteId)}/event/${encodeURIComponent(eventId)}`;
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
