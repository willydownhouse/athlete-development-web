import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { athleteInitials } from "@/components/dashboard/athlete-meta";
import { DashboardBottomNav } from "@/components/dashboard/dashboard-bottom-nav";
import {
  athleteAccessHref,
  athleteCalendarHref,
  athleteEventsHref,
  athleteStatsHref,
  backToTodayLabel,
  dashboardHref,
} from "@/components/dashboard/dashboard-nav";
import { AthleteProfileForm } from "@/components/profile/athlete-profile-form";
import { AthleteProfilePhoto } from "@/components/profile/athlete-profile-photo";
import { isParentRelationship } from "@/lib/athlete-access-display";
import { getAuthBearerToken } from "@/lib/auth-token";
import { HOCKEY_SPORT_SLUG } from "@/lib/constants";
import { dateOnlyInputValue } from "@/lib/date-of-birth";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import { loadAthleteProfileMedia } from "@/lib/load-athlete-profile-media";
import { loadShellAthletes } from "@/lib/shell-data";

type AthleteProfilePageProps = {
  params: Promise<{ athleteId: string }>;
};

export default async function AthleteProfilePage({ params }: AthleteProfilePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { athleteId } = await params;
  const normalizedAthleteId = athleteId.trim();

  if (!normalizedAthleteId) {
    redirect("/dashboard");
  }

  const token = await getAuthBearerToken();

  if (!token) {
    redirect("/");
  }

  const locale = await getRequestLocale();
  const [athletes, isAdmin, profileMedia] = await Promise.all([
    loadShellAthletes(token),
    getIsAdminUser(),
    loadAthleteProfileMedia(token, normalizedAthleteId),
  ]);

  const messages = getMessages(locale);
  const selectedAthlete = athletes.find((athlete) => athlete.id === normalizedAthleteId) ?? null;

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

  const dateOfBirth = dateOnlyInputValue(selectedAthlete.dateOfBirth);
  const showAccess = isParentRelationship(selectedAthlete.relationshipToAthlete);
  const accessHref = showAccess ? athleteAccessHref(selectedAthlete.id) : undefined;
  const statsHref =
    selectedAthlete.focusSport.slug === HOCKEY_SPORT_SLUG
      ? athleteStatsHref(selectedAthlete.id)
      : undefined;
  const calendarHref = athleteCalendarHref(selectedAthlete.id);
  const historyHref = athleteEventsHref(selectedAthlete.id);

  return (
    <AppShell
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={selectedAthlete}
    >
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6 pb-24 sm:px-6 lg:max-w-3xl lg:px-10 lg:pb-6">
        <Link
          href={dashboardHref(selectedAthlete.id)}
          className="inline-flex items-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
        >
          {backToTodayLabel(locale)}
        </Link>

        <div className="mt-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {messages.nav.profile}
          </h1>
          <nav className="hidden shrink-0 items-center gap-3 lg:flex">
            {statsHref ? (
              <Link
                href={statsHref}
                className="text-sm font-medium text-zinc-300 transition hover:text-white"
              >
                {messages.nav.stats}
              </Link>
            ) : null}
            <Link
              href={calendarHref}
              className="text-sm font-medium text-zinc-300 transition hover:text-white"
            >
              {messages.nav.calendar}
            </Link>
            <Link
              href={historyHref}
              className="text-sm font-medium text-zinc-300 transition hover:text-white"
            >
              {messages.nav.history}
            </Link>
            {accessHref ? (
              <Link
                href={accessHref}
                className="text-sm font-medium text-zinc-300 transition hover:text-white"
              >
                {messages.nav.access}
              </Link>
            ) : null}
          </nav>
        </div>

        <section className="relative mt-6 rounded-2xl bg-[#171b22] px-4 py-5 sm:px-5 lg:flex lg:items-start lg:gap-8">
          <AthleteProfilePhoto
            athleteId={selectedAthlete.id}
            athleteName={selectedAthlete.name}
            initials={athleteInitials(selectedAthlete.name)}
            initialMedia={profileMedia}
          />

          <div className="mt-6 min-w-0 flex-1 lg:mt-0 lg:pr-12">
            <AthleteProfileForm
              athleteId={selectedAthlete.id}
              name={selectedAthlete.name}
              dateOfBirth={dateOfBirth}
              focusSportName={selectedAthlete.focusSport.name}
              relationshipToAthlete={selectedAthlete.relationshipToAthlete}
            />
          </div>
        </section>
      </div>
      <DashboardBottomNav
        statsHref={statsHref}
        calendarHref={calendarHref}
        historyHref={historyHref}
        accessHref={accessHref}
      />
    </AppShell>
  );
}
