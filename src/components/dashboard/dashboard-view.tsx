import { isParentRelationship } from "@/lib/athlete-access-display";
import { HOCKEY_SPORT_SLUG } from "@/lib/constants";
import { getIsAdminUser } from "@/lib/is-admin-user";
import type { Athlete, EventType } from "@/lib/types";

import {
  athleteAccessHref,
  athleteCalendarHref,
  athleteEventsHref,
  athleteStatsHref,
} from "./dashboard-nav";
import { DashboardAthleteContent } from "./dashboard-athlete-content";
import { DashboardBottomNav } from "./dashboard-bottom-nav";
import { DashboardOnboardingPrompt } from "./dashboard-onboarding-prompt";
import { DashboardShell } from "./dashboard-shell";

type DashboardViewProps = {
  userEmail: string;
  athletes: Athlete[];
  selectedAthlete: Athlete | null;
  eventTypes: EventType[];
  eventTypesError?: string | null;
  loadError?: string | null;
};

export async function DashboardView({
  userEmail,
  athletes,
  selectedAthlete,
  eventTypes,
  eventTypesError,
  loadError,
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
          hasAthlete ? "pb-24 pt-6 lg:pb-6" : "justify-center py-10 pb-6 lg:py-16"
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
      {selectedAthlete ? (
        <DashboardBottomNav
          statsHref={
            selectedAthlete.focusSport.slug === HOCKEY_SPORT_SLUG
              ? athleteStatsHref(selectedAthlete.id)
              : undefined
          }
          calendarHref={athleteCalendarHref(selectedAthlete.id)}
          historyHref={athleteEventsHref(selectedAthlete.id)}
          accessHref={
            isParentRelationship(selectedAthlete.relationshipToAthlete)
              ? athleteAccessHref(selectedAthlete.id)
              : undefined
          }
        />
      ) : null}
    </DashboardShell>
  );
}
