import Link from "next/link";
import { redirect } from "next/navigation";

import { CalendarSection } from "@/components/calendar/calendar-section";
import { AthleteSectionBottomNav } from "@/components/dashboard/athlete-section-bottom-nav";
import { dashboardHref, backToTodayLabel } from "@/components/dashboard/dashboard-nav";
import { loadAccessibleAthlete } from "@/lib/accessible-athlete";
import { loadCalendarMonthEvents } from "@/lib/calendar-event-data";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import { getRequestTimeZone } from "@/lib/time-zone-server";

type AthleteCalendarPageProps = {
  params: Promise<{ athleteId: string }>;
};

export default async function AthleteCalendarPage({ params }: AthleteCalendarPageProps) {
  const { athleteId } = await params;
  const normalizedAthleteId = athleteId.trim();

  if (!normalizedAthleteId) {
    redirect("/dashboard");
  }

  const [timeZone, locale, athlete] = await Promise.all([
    getRequestTimeZone(),
    getRequestLocale(),
    loadAccessibleAthlete(normalizedAthleteId),
  ]);
  const messages = getMessages(locale);

  if (!athlete) {
    redirect("/dashboard");
  }

  const monthEvents = await loadCalendarMonthEvents(athlete.id, timeZone);

  return (
    <>
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-24 pt-6 sm:px-6 lg:max-w-3xl lg:px-10 lg:pb-6">
        <Link
          href={dashboardHref(normalizedAthleteId)}
          className="hidden items-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200 lg:inline-flex"
        >
          {backToTodayLabel(locale)}
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-white max-lg:sr-only lg:mt-4">
          {messages.calendar.title}
        </h1>

        <div className="mt-6">
          <CalendarSection
            athleteId={athlete.id}
            timeZone={timeZone}
            initialMonthEvents={monthEvents.events}
            loadedRange={monthEvents.monthRange}
            initialSelectedDate={monthEvents.selectedDate}
            initialVisibleMonth={monthEvents.visibleMonth}
            initialLoadError={monthEvents.error}
          />
        </div>
      </div>
      <AthleteSectionBottomNav athlete={athlete} current="calendar" />
    </>
  );
}
