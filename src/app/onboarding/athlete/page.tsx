import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AthleteBasicsForm } from "@/components/onboarding/athlete-basics-form";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { fetchCurrentAppUser, fetchSports } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { loadShellOnboardingSessions } from "@/lib/shell-data";

type OnboardingAthletePageProps = {
  searchParams: Promise<{ sportId?: string }>;
};

export default async function OnboardingAthletePage({ searchParams }: OnboardingAthletePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const params = await searchParams;
  const sportId = params.sportId?.trim() ?? "";

  if (!sportId) {
    redirect("/onboarding");
  }

  const token = await getAuthBearerToken();
  const onboardingSessions = await loadShellOnboardingSessions(token);

  if (!token) {
    redirect("/");
  }

  let isAdmin = false;

  try {
    const appUser = await fetchCurrentAppUser(token);
    isAdmin = appUser.role === "admin";
  } catch {
    isAdmin = false;
  }

  let sportName: string | null = null;

  try {
    const sports = await fetchSports();
    const sport = sports.find((item) => item.id === sportId);

    if (!sport) {
      redirect("/onboarding");
    }

    sportName = sport.name;
  } catch {
    redirect("/onboarding");
  }

  return (
    <OnboardingShell
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      onboardingSessions={onboardingSessions}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:max-w-3xl lg:px-10 lg:py-16">
        <section className="space-y-6 lg:space-y-8">
          <div>
            <p className="text-sm text-zinc-400 lg:text-base">{sportName}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:mt-3 lg:text-5xl lg:leading-[1.1]">
              Athlete details
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-300 lg:mt-6 lg:text-base lg:leading-7">
              Start with a few basics. Next we&apos;ll ask a few guided questions to build the full
              profile.
            </p>
          </div>

          <AthleteBasicsForm sportId={sportId} sportName={sportName} />
        </section>
      </div>
    </OnboardingShell>
  );
}
