import type { OnboardingSessionSummary } from "@/lib/types";

export function onboardingSessionHref(session: OnboardingSessionSummary): string {
  if (session.status === "in_progress") {
    return `/onboarding/questions?athleteId=${encodeURIComponent(session.athleteId)}&sessionId=${encodeURIComponent(session.id)}&sportId=${encodeURIComponent(session.sportId)}`;
  }

  return `/dashboard?athleteId=${encodeURIComponent(session.athleteId)}`;
}

export function onboardingSessionAvatarClass(status: OnboardingSessionSummary["status"]): string {
  switch (status) {
    case "in_progress":
      return "ring-2 ring-[#9ec9e8]/70";
    case "completed":
      return "ring-2 ring-emerald-500/70";
    case "abandoned":
      return "ring-2 ring-zinc-600/60 opacity-70";
  }
}

export function onboardingSessionStatusLabel(status: OnboardingSessionSummary["status"]): string {
  switch (status) {
    case "in_progress":
      return "In progress";
    case "completed":
      return "Completed";
    case "abandoned":
      return "Abandoned";
  }
}
