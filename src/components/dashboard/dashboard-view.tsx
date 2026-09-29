import { HOCKEY_SPORT_SLUG } from "@/lib/constants";
import type { Athlete, EventType } from "@/lib/types";

import { DashboardAthleteContent } from "./dashboard-athlete-content";
import { DashboardBottomNav } from "./dashboard-bottom-nav";
import {
  athleteCalendarHref,
  athleteEventsHref,
  athleteProfileHref,
  athleteStatsHref,
} from "./dashboard-nav";
import { DashboardOnboardingPrompt } from "./dashboard-onboarding-prompt";

type DashboardViewProps = {
  selectedAthlete: Athlete | null;
  eventTypes: EventType[];
  eventTypesError?: string | null;
  loadError?: string | null;
};

export async function DashboardView({
  selectedAthlete,
  eventTypes,
  eventTypesError,
  loadError,
}: DashboardViewProps) {
  const hasAthlete = selectedAthlete !== null;

  return (
    <>
      <div
        className={`relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 sm:px-6 lg:max-w-3xl lg:px-10 ${
          hasAthlete ? "pb-24 pt-6 lg:pb-6" : "justify-center py-10 pb-6 lg:py-16"
        }`}
      >
        {hasAthlete ? (
          <>
            {loadError ? (
              <p className="mb-6 rounded-2xl bg-[#2a1717] px-4 py-3 text-sm text-red-300">
                {loadError}
              </p>
            ) : null}
            <DashboardAthleteContent
              selectedAthlete={selectedAthlete}
              eventTypes={eventTypes}
              eventTypesError={eventTypesError}
            />
          </>
        ) : (
          <>
            {loadError ? (
              <p className="mb-6 rounded-2xl bg-[#2a1717] px-4 py-3 text-sm text-red-300">
                {loadError}
              </p>
            ) : null}
            <DashboardOnboardingPrompt />
          </>
        )}
      </div>
      {selectedAthlete ? (
        <DashboardBottomNav
          statsHref={
            selectedAthlete.focusSport.slug === HOCKEY_SPORT_SLUG
              ? athleteStatsHref(selectedAthlete.id)
              : undefined
          }
          calendarHref={athleteCalendarHref(selectedAthlete.id)}
          historyHref={athleteEventsHref(selectedAthlete.id)}
          profileHref={athleteProfileHref(selectedAthlete.id)}
        />
      ) : null}
    </>
  );
}
