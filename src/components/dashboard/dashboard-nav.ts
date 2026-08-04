export function dashboardHref(athleteId: string): string {
  return `/dashboard/${encodeURIComponent(athleteId)}`;
}

export function defaultDashboardHref(athletes: { id: string }[]): string {
  const firstAthlete = athletes[0];

  return firstAthlete ? dashboardHref(firstAthlete.id) : "/dashboard";
}

export function activeDashboardAthleteId(pathname: string): string | null {
  const prefix = "/dashboard/";
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const athleteId = pathname.slice(prefix.length).split("/")[0];
  return athleteId ? decodeURIComponent(athleteId) : null;
}
