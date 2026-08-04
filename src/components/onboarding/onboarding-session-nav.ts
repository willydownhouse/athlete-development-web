import { athleteOnboardingHref, dashboardHref } from "@/components/dashboard/dashboard-nav";
import type { OnboardingSessionSummary } from "@/lib/types";

export function onboardingSessionHref(session: OnboardingSessionSummary): string {
  if (session.status === "in_progress") {
    return athleteOnboardingHref(session.athleteId, session.id);
  }

  return dashboardHref(session.athleteId);
}

export function activeOnboardingSessionId(pathname: string): string | null {
  const match = pathname.match(/^\/athlete\/[^/]+\/onboarding\/([^/]+)/);
  const sessionId = match?.[1];
  return sessionId ? decodeURIComponent(sessionId) : null;
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
