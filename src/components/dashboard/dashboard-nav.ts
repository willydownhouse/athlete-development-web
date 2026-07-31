export function dashboardHref(athleteId: string): string {
  return `/dashboard?athleteId=${encodeURIComponent(athleteId)}`;
}

export function defaultDashboardHref(athletes: { id: string }[]): string {
  const firstAthlete = athletes[0];

  return firstAthlete ? dashboardHref(firstAthlete.id) : "/dashboard";
}
