import Link from "next/link";
import { redirect } from "next/navigation";

import { onboardingInterviewHref } from "@/components/dashboard/dashboard-nav";
import { fetchAthleteOnboardingSummary } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { canStartOnboardingInterview } from "@/lib/date-of-birth";
import type { AppLocale } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import { formatZonedShortDate, formatZonedTime } from "@/lib/time-zone";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import type { AthleteAccessRole } from "@/lib/types";

function formatSummaryUpdatedAt(iso: string, timeZone: string, locale: AppLocale): string | null {
  const updatedAt = new Date(iso);
  if (Number.isNaN(updatedAt.getTime())) {
    return null;
  }

  return `${formatZonedShortDate(timeZone, updatedAt, new Date(), locale)} ${formatZonedTime(timeZone, updatedAt)}`;
}

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

  const [summary, locale, timeZone] = await Promise.all([
    fetchAthleteOnboardingSummary(token, athleteId),
    getRequestLocale(),
    getRequestTimeZone(),
  ]);
  const messages = getMessages(locale);
  const canStart = canStartOnboardingInterview(relationshipToAthlete, dateOfBirth);
  const updatedAtLabel = summary
    ? formatSummaryUpdatedAt(summary.updatedAt, timeZone, locale)
    : null;

  if (!summary && !canStart) {
    return null;
  }

  return (
    <section className="mt-6 rounded-2xl bg-[#171b22] px-4 py-5 sm:px-5">
      <h2 className="text-base font-semibold text-white">{messages.profile.onboarding}</h2>
      {summary && updatedAtLabel ? (
        <time dateTime={summary.updatedAt} className="mt-1 block text-xs text-zinc-500">
          {messages.profile.summaryUpdated(updatedAtLabel)}
        </time>
      ) : null}
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
