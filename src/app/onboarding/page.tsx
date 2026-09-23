import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { OnboardingView } from "@/components/onboarding/onboarding-view";
import { getActionMessages } from "@/lib/action-messages";
import { fetchSports } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getRequestLocale } from "@/lib/locale-server";
import { loadShellAthletes } from "@/lib/shell-data";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const [token, locale, actions] = await Promise.all([
    getAuthBearerToken(),
    getRequestLocale(),
    getActionMessages(),
  ]);
  const [athletes, sports] = await Promise.all([loadShellAthletes(token), fetchSports(locale)]);
  const loadError = sports === null ? actions.loadSports : null;

  return (
    <OnboardingView
      userEmail={session.user.email ?? ""}
      userName={session.user.name}
      sports={sports ?? []}
      loadError={loadError}
      athletes={athletes}
    />
  );
}
