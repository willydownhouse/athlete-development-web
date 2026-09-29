import Link from "next/link";
import { redirect } from "next/navigation";

import { CalendarSection } from "@/components/calendar/calendar-section";
import { dashboardHref, backToTodayLabel } from "@/components/dashboard/dashboard-nav";
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

  const [timeZone, locale] = await Promise.all([getRequestTimeZone(), getRequestLocale()]);
  const messages = getMessages(locale);

  const monthEvents = await loadCalendarMonthEvents(normalizedAthleteId, timeZone);

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6 pt-6 sm:px-6 lg:max-w-3xl lg:px-10">
      <Link
        href={dashboardHref(normalizedAthleteId)}
        className="inline-flex items-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
      >
        {backToTodayLabel(locale)}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
        {messages.calendar.title}
      </h1>

      <div className="mt-6">
        <CalendarSection
          athleteId={normalizedAthleteId}
          timeZone={timeZone}
          initialMonthEvents={monthEvents.events}
          loadedRange={monthEvents.monthRange}
          initialSelectedDate={monthEvents.selectedDate}
          initialVisibleMonth={monthEvents.visibleMonth}
          initialLoadError={monthEvents.error}
        />
      </div>
    </div>
  );
}
