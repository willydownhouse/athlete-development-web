import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { OnboardingView } from "@/components/onboarding/onboarding-view";
import { getActionMessages } from "@/lib/action-messages";
import { fetchSports } from "@/lib/api";
import { getRequestLocale } from "@/lib/locale-server";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const [locale, actions] = await Promise.all([getRequestLocale(), getActionMessages()]);
  const sports = await fetchSports(locale);
  const loadError = sports === null ? actions.loadSports : null;

  return (
    <OnboardingView userName={session.user.name} sports={sports ?? []} loadError={loadError} />
  );
}
