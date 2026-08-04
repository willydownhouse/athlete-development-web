import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShellAdminNavLink } from "@/components/app-shell-admin-nav-link";
import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { getOnboardingSessionById } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { loadShellAthletes, loadShellOnboardingSessions } from "@/lib/shell-data";

type AthleteOnboardingSessionPageProps = {
  params: Promise<{ athleteId: string; sessionId: string }>;
};

export default async function AthleteOnboardingSessionPage({
  params,
}: AthleteOnboardingSessionPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { athleteId, sessionId } = await params;
  const normalizedAthleteId = athleteId.trim();
  const normalizedSessionId = sessionId.trim();

  if (!normalizedAthleteId || !normalizedSessionId) {
    redirect("/onboarding");
  }

  const token = await getAuthBearerToken();
  const [onboardingSessions, athletes] = await Promise.all([
    loadShellOnboardingSessions(token),
    loadShellAthletes(token),
  ]);

  if (!token) {
    redirect("/");
  }

  let onboardingSession;

  try {
    onboardingSession = await getOnboardingSessionById(token, normalizedSessionId);
  } catch {
    redirect("/onboarding");
  }

  if (onboardingSession.athleteId !== normalizedAthleteId) {
    redirect("/onboarding");
  }

  if (onboardingSession.status === "completed") {
    redirect(dashboardHref(onboardingSession.athleteId));
  }

  return (
    <OnboardingShell
      userEmail={session.user.email ?? ""}
      adminNavLink={<AppShellAdminNavLink />}
      athletes={athletes}
      dashboardAthleteId={onboardingSession.athleteId}
      onboardingSessions={onboardingSessions}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:max-w-3xl lg:px-10 lg:py-16">
        <div className="mb-5 lg:mb-7">
          <p className="text-sm text-zinc-400 lg:text-base">
            {onboardingSession.sport.name} onboarding
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:mt-3 lg:text-5xl lg:leading-[1.1]">
            {onboardingSession.athlete.name}
          </h1>
        </div>
      </div>
    </OnboardingShell>
  );
}
