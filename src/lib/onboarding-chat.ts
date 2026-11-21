export const ONBOARDING_ATHLETE_QUERY_PARAM = "onboardingAthleteId";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type OnboardingChatQuery =
  { kind: "general" } | { kind: "interview"; athleteId: string } | { kind: "invalid" };

export function onboardingChatQuery(value: string | string[] | undefined): OnboardingChatQuery {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim() ?? "";

  if (!trimmed) {
    return { kind: "general" };
  }

  if (!UUID_PATTERN.test(trimmed)) {
    return { kind: "invalid" };
  }

  return { kind: "interview", athleteId: trimmed };
}
