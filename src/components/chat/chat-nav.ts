export function chatHref(athleteId: string): string {
  return `/chat?athleteId=${encodeURIComponent(athleteId)}`;
}

export function defaultChatHref(athletes: { id: string }[]): string {
  const firstAthlete = athletes[0];

  return firstAthlete ? chatHref(firstAthlete.id) : "/chat";
}
