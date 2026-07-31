export function chatHref(athleteId: string): string {
  return `/chat?athleteId=${encodeURIComponent(athleteId)}`;
}
