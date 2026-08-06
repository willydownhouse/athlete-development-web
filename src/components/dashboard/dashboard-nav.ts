export function dashboardHref(athleteId: string): string {
  return `/athlete/${encodeURIComponent(athleteId)}/dashboard`;
}

export function athleteEventHref(athleteId: string, eventId: string): string {
  return `/athlete/${encodeURIComponent(athleteId)}/event/${encodeURIComponent(eventId)}`;
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
