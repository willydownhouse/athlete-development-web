import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import type { OnboardingSessionSummary } from "@/lib/types";

export function onboardingSessionPageHref(sessionId: string): string {
  return `/onboarding/session/${encodeURIComponent(sessionId)}`;
}

export function onboardingSessionHref(session: OnboardingSessionSummary): string {
  if (session.status === "in_progress") {
    return onboardingSessionPageHref(session.id);
  }

  return dashboardHref(session.athleteId);
}

export function activeOnboardingSessionId(pathname: string): string | null {
  const prefix = "/onboarding/session/";
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const sessionId = pathname.slice(prefix.length).split("/")[0];
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
