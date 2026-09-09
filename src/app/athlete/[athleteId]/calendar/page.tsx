import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CalendarSection } from "@/components/calendar/calendar-section";
import { dashboardHref, backToTodayLabel } from "@/components/dashboard/dashboard-nav";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { loadCalendarMonthEvents } from "@/lib/calendar-event-data";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getRequestTimeZone } from "@/lib/time-zone-server";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { loadShellAthletes } from "@/lib/shell-data";

type AthleteCalendarPageProps = {
  params: Promise<{ athleteId: string }>;
};

export default async function AthleteCalendarPage({ params }: AthleteCalendarPageProps) {
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

  const [athletes, isAdmin, timeZone] = await Promise.all([
    loadShellAthletes(token),
    getIsAdminUser(),
    getRequestTimeZone(),
  ]);

  const selectedAthlete = athletes.find((athlete) => athlete.id === normalizedAthleteId) ?? null;

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

  const monthEvents = await loadCalendarMonthEvents(normalizedAthleteId, timeZone);

  return (
    <DashboardShell
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={selectedAthlete}
    >
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6 pt-6 sm:px-6 lg:max-w-3xl lg:px-10">
        <Link
          href={dashboardHref(selectedAthlete.id)}
          className="inline-flex items-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
        >
          {backToTodayLabel()}
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Calendar</h1>

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
    </DashboardShell>
  );
}
