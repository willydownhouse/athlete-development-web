import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShellAdminNavLink } from "@/components/app-shell-admin-nav-link";
import { AthleteBasicsForm } from "@/components/onboarding/athlete-basics-form";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { fetchSports } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { loadShellAthletes } from "@/lib/shell-data";

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
  const athletes = await loadShellAthletes(token);

  if (!token) {
    redirect("/");
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
      adminNavLink={<AppShellAdminNavLink />}
      athletes={athletes}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:max-w-3xl lg:px-10 lg:py-16">
        <section className="space-y-6 lg:space-y-8">
          <div>
            <p className="text-sm text-zinc-400 lg:text-base">{sportName}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:mt-3 lg:text-3xl">
              Athlete details
            </h1>
          </div>

          <AthleteBasicsForm sportId={sportId} />
        </section>
      </div>
    </OnboardingShell>
  );
}
