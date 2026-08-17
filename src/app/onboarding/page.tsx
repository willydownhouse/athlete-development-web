import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { OnboardingView } from "@/components/onboarding/onboarding-view";
import { fetchSports } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { loadShellAthletes } from "@/lib/shell-data";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const token = await getAuthBearerToken();
  const [athletes, sports] = await Promise.all([loadShellAthletes(token), fetchSports()]);
  const loadError = sports === null ? "Unable to load sports" : null;

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
