import Link from "next/link";
import { redirect } from "next/navigation";

import { onboardingInterviewHref } from "@/components/dashboard/dashboard-nav";
import { fetchAthleteOnboardingSummary } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { canStartOnboardingInterview } from "@/lib/date-of-birth";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import type { AthleteAccessRole } from "@/lib/types";

type ProfileOnboardingSectionProps = {
  athleteId: string;
  relationshipToAthlete: AthleteAccessRole;
  dateOfBirth: string | null;
};

export async function ProfileOnboardingSection({
  athleteId,
  relationshipToAthlete,
  dateOfBirth,
}: ProfileOnboardingSectionProps) {
  const token = await getAuthBearerToken();
  if (!token) {
    redirect("/");
  }

  const [summary, locale] = await Promise.all([
    fetchAthleteOnboardingSummary(token, athleteId),
    getRequestLocale(),
  ]);
  const messages = getMessages(locale);
  const canStart = canStartOnboardingInterview(relationshipToAthlete, dateOfBirth);

  if (!summary && !canStart) {
    return null;
  }

  return (
    <section className="mt-6 rounded-2xl bg-[#171b22] px-4 py-5 sm:px-5">
      <h2 className="text-base font-semibold text-white">{messages.profile.onboarding}</h2>
      {summary ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{summary.text}</p>
      ) : null}
      {canStart ? (
        <Link
          href={onboardingInterviewHref(athleteId)}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-3 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] lg:w-auto lg:px-5"
        >
          {summary ? messages.profile.updateInterview : messages.profile.startInterview}
        </Link>
      ) : null}
    </section>
  );
}
