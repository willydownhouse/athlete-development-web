import type { Athlete, EventType } from "@/lib/types";

import { AiInsightCard } from "./ai-insight-card";
import { DashboardBottomNav } from "./bottom-nav";
import { DashboardHeader } from "./dashboard-header";
import { DashboardOnboardingPrompt } from "./dashboard-onboarding-prompt";
import { DashboardShell } from "./dashboard-shell";
import { QuickLogCard } from "./quick-log-card";
import { ThisWeekCard } from "./this-week-card";
import { TodaysEventsCard } from "./todays-events-card";

type DashboardViewProps = {
  userEmail: string;
  isAdmin?: boolean;
  athletes: Athlete[];
  selectedAthlete: Athlete | null;
  eventTypes: EventType[];
  eventTypesError?: string | null;
  loadError?: string | null;
};

export function DashboardView({
  userEmail,
  isAdmin = false,
  athletes,
  selectedAthlete,
  eventTypes,
  eventTypesError,
  loadError,
}: DashboardViewProps) {
  const hasAthlete = selectedAthlete !== null;

  return (
    <DashboardShell
      userEmail={userEmail}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={selectedAthlete}
    >
      <div
        className={`relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 sm:px-6 lg:max-w-3xl lg:px-10 ${
          hasAthlete ? "pb-28 pt-6" : "justify-center py-10 pb-28 lg:py-16"
        }`}
      >
        {hasAthlete ? (
          <>
            <DashboardHeader selectedAthlete={selectedAthlete} />
            {loadError ? (
              <p className="mt-6 rounded-[1.35rem] bg-[#2a1717] px-4 py-3 text-sm text-red-300">
                {loadError}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col gap-3.5">
              <AiInsightCard />
              <TodaysEventsCard />
              <QuickLogCard eventTypes={eventTypes} loadError={eventTypesError} />
              <ThisWeekCard />
            </div>
          </>
        ) : (
          <>
            {loadError ? (
              <p className="mb-6 rounded-[1.35rem] bg-[#2a1717] px-4 py-3 text-sm text-red-300">
                {loadError}
              </p>
            ) : null}
            <DashboardOnboardingPrompt />
          </>
        )}
      </div>

      <DashboardBottomNav />
    </DashboardShell>
  );
}
