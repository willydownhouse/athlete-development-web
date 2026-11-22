import Link from "next/link";

import { onboardingInterviewHref } from "@/components/dashboard/dashboard-nav";
import { fetchAthleteOnboardingSummary } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { canStartOnboardingInterview } from "@/lib/date-of-birth";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import type { Athlete } from "@/lib/types";

type DashboardInterviewCardProps = {
  athlete: Athlete;
};

export async function DashboardInterviewCard({ athlete }: DashboardInterviewCardProps) {
  if (!canStartOnboardingInterview(athlete.relationshipToAthlete, athlete.dateOfBirth)) {
    return null;
  }

  const token = await getAuthBearerToken();
  if (!token) {
    return null;
  }

  try {
    const summary = await fetchAthleteOnboardingSummary(token, athlete.id);
    if (summary) {
      return null;
    }
  } catch {
    return null;
  }

  const messages = getMessages(await getRequestLocale());

  return (
    <section className="rounded-2xl bg-[#171b22] px-4 py-5 sm:px-5">
      <h2 className="text-base font-semibold text-white">
        {messages.dashboard.interviewPendingTitle}
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-300">
        {messages.dashboard.interviewPendingBody(athlete.name)}
      </p>
      <Link
        href={onboardingInterviewHref(athlete.id)}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-3 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] lg:w-auto lg:px-5"
      >
        {messages.profile.startInterview}
      </Link>
    </section>
  );
}
