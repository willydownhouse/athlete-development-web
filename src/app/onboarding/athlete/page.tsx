import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AthleteBasicsForm } from "@/components/onboarding/athlete-basics-form";
import { AppShell } from "@/components/app-shell";
import { fetchSports } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
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

  if (!token) {
    redirect("/");
  }

  const locale = await getRequestLocale();
  const [athletes, sports, isAdmin] = await Promise.all([
    loadShellAthletes(token),
    fetchSports(locale),
    getIsAdminUser(),
  ]);

  const sport = sports?.find((item) => item.id === sportId);

  if (sports === null || !sport) {
    redirect("/onboarding");
  }

  const sportName = sport.name;
  const messages = getMessages(locale);

  return (
    <AppShell userEmail={session.user.email ?? ""} isAdmin={isAdmin} athletes={athletes}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:max-w-3xl lg:px-10 lg:py-16">
        <section className="space-y-6 lg:space-y-8">
          <div>
            <p className="text-sm text-zinc-400 lg:text-base">{sportName}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:mt-3 lg:text-3xl">
              {messages.onboarding.athleteDetails}
            </h1>
          </div>

          <AthleteBasicsForm sportId={sportId} />
        </section>
      </div>
    </AppShell>
  );
}
