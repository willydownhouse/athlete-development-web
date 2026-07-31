import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { OnboardingView } from "@/components/onboarding/onboarding-view";
import { fetchCurrentAppUser, fetchSports } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { loadShellOnboardingSessions } from "@/lib/shell-data";
import type { Sport } from "@/lib/types";

export default async function OnboardingPage() {
  const tLoadErrors = await getTranslations("onboarding.loadErrors");
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const token = await getAuthBearerToken();
  const onboardingSessions = await loadShellOnboardingSessions(token);

  let isAdmin = false;
  let sports: Sport[] = [];
  let sportsLoaded = false;

  try {
    sports = await fetchSports();
    sportsLoaded = true;
  } catch {
    sportsLoaded = false;
  }

  if (token) {
    try {
      const appUser = await fetchCurrentAppUser(token);
      isAdmin = appUser.role === "admin";
    } catch {
      isAdmin = false;
    }
  }

  const loadError = !sportsLoaded ? tLoadErrors("sports") : null;

  return (
    <OnboardingView
      userEmail={session.user.email ?? ""}
      userName={session.user.name}
      isAdmin={isAdmin}
      sports={sports}
      loadError={loadError}
      onboardingSessions={onboardingSessions}
    />
  );
}
