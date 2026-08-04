import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { OnboardingView } from "@/components/onboarding/onboarding-view";
import { fetchSports } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { loadShellAthletes, loadShellOnboardingSessions } from "@/lib/shell-data";
import type { Sport } from "@/lib/types";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const token = await getAuthBearerToken();
  const [onboardingSessions, athletes] = await Promise.all([
    loadShellOnboardingSessions(token),
    loadShellAthletes(token),
  ]);

  let sports: Sport[] = [];
  let sportsLoaded = false;

  try {
    sports = await fetchSports();
    sportsLoaded = true;
  } catch {
    sportsLoaded = false;
  }

  const loadError = !sportsLoaded ? "Unable to load sports" : null;

  return (
    <OnboardingView
      userEmail={session.user.email ?? ""}
      userName={session.user.name}
      sports={sports}
      loadError={loadError}
      athletes={athletes}
      onboardingSessions={onboardingSessions}
    />
  );
}
