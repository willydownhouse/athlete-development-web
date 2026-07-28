import type { Athlete } from "@/lib/types";

import { AiInsightCard } from "./ai-insight-card";
import { DashboardBottomNav } from "./bottom-nav";
import { DashboardHeader } from "./dashboard-header";
import { DashboardShell } from "./dashboard-shell";
import { QuickLogCard } from "./quick-log-card";
import { ThisWeekCard } from "./this-week-card";
import { TodaysEventsCard } from "./todays-events-card";

type DashboardViewProps = {
  userEmail: string;
  isAdmin?: boolean;
  athletes: Athlete[];
  selectedAthlete: Athlete | null;
  loadError?: string | null;
};

export function DashboardView({
  userEmail,
  isAdmin = false,
  athletes,
  selectedAthlete,
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
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-28 pt-6">
        <p className="mb-6 hidden text-right text-sm font-medium tracking-wide text-zinc-300 lg:block">
          Athlete Development Service
        </p>

        <DashboardHeader selectedAthlete={selectedAthlete} />

        {loadError ? (
          <p className="mt-6 rounded-[1.35rem] bg-[#2a1717] px-4 py-3 text-sm text-red-300">
            {loadError}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3.5">
          {hasAthlete ? (
            <>
              <AiInsightCard />
              <TodaysEventsCard />
              <QuickLogCard />
              <ThisWeekCard />
            </>
          ) : (
            <>
              <TodaysEventsCard empty />
              <QuickLogCard />
              <ThisWeekCard empty />
            </>
          )}
        </div>
      </div>

      <DashboardBottomNav />
    </DashboardShell>
  );
}
