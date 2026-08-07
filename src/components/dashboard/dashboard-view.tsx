import type { Athlete, EventType } from "@/lib/types";

import { DashboardAthleteContent } from "./dashboard-athlete-content";
import { DashboardBottomNav } from "./bottom-nav";
import { DashboardOnboardingPrompt } from "./dashboard-onboarding-prompt";
import { DashboardShell } from "./dashboard-shell";
import type { HockeyStatsPeriod } from "@/lib/hockey-stats/period";
import { getIsAdminUser } from "@/lib/is-admin-user";

type DashboardViewProps = {
  userEmail: string;
  athletes: Athlete[];
  selectedAthlete: Athlete | null;
  eventTypes: EventType[];
  eventTypesError?: string | null;
  loadError?: string | null;
  statsPeriod: HockeyStatsPeriod;
};

export async function DashboardView({
  userEmail,
  athletes,
  selectedAthlete,
  eventTypes,
  eventTypesError,
  loadError,
  statsPeriod,
}: DashboardViewProps) {
  const hasAthlete = selectedAthlete !== null;
  const isAdmin = await getIsAdminUser();

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
            {loadError ? (
              <p className="mb-6 rounded-[1.35rem] bg-[#2a1717] px-4 py-3 text-sm text-red-300">
                {loadError}
              </p>
            ) : null}
            <DashboardAthleteContent
              selectedAthlete={selectedAthlete}
              eventTypes={eventTypes}
              eventTypesError={eventTypesError}
              statsPeriod={statsPeriod}
            />
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
