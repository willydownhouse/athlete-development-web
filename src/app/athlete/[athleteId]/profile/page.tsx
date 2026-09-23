import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { athleteInitials } from "@/components/dashboard/athlete-meta";
import { DashboardBottomNav } from "@/components/dashboard/dashboard-bottom-nav";
import {
  athleteAccessHref,
  backToTodayLabel,
  dashboardHref,
} from "@/components/dashboard/dashboard-nav";
import { AthleteProfileForm } from "@/components/profile/athlete-profile-form";
import { isParentRelationship } from "@/lib/athlete-access-display";
import { getAuthBearerToken } from "@/lib/auth-token";
import { dateOnlyInputValue } from "@/lib/date-of-birth";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
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
  const [athletes, isAdmin] = await Promise.all([loadShellAthletes(token), getIsAdminUser()]);
  const messages = getMessages(locale);
  const selectedAthlete = athletes.find((athlete) => athlete.id === normalizedAthleteId) ?? null;

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

  const dateOfBirth = dateOnlyInputValue(selectedAthlete.dateOfBirth);
  const showAccess = isParentRelationship(selectedAthlete.relationshipToAthlete);
  const accessHref = showAccess ? athleteAccessHref(selectedAthlete.id) : undefined;

  return (
    <AppShell
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={selectedAthlete}
    >
      <div
        className={`relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6 sm:px-6 lg:max-w-3xl lg:px-10 ${
          showAccess ? "pb-24 lg:pb-6" : "pb-6"
        }`}
      >
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
          {accessHref ? (
            <Link
              href={accessHref}
              className="hidden text-sm font-medium text-zinc-300 transition hover:text-white lg:inline"
            >
              {messages.nav.access}
            </Link>
          ) : null}
        </div>

        <section className="mt-6 rounded-[1.35rem] bg-[#171b22] px-4 py-5 sm:px-5 lg:flex lg:items-start lg:gap-8">
          <div className="relative flex aspect-[3/4] w-full items-center justify-center rounded-[1.35rem] bg-[#2a2f38] text-2xl font-semibold text-white lg:w-56 lg:shrink-0">
            {athleteInitials(selectedAthlete.name)}
            <button
              type="button"
              className="absolute bottom-3 right-3 inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#1c222c] px-3 py-1.5 text-xs font-medium text-zinc-200"
            >
              {messages.profile.addPhoto}
            </button>
          </div>

          <div className="mt-6 min-w-0 flex-1 lg:mt-0">
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
      {accessHref ? <DashboardBottomNav accessHref={accessHref} /> : null}
    </AppShell>
  );
}
