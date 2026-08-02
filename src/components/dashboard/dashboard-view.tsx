import type { Athlete, EventType, OnboardingSessionSummary } from "@/lib/types";

import { AppShellAdminNavLink } from "@/components/app-shell-admin-nav-link";
import { DashboardAthleteContent } from "./dashboard-athlete-content";
import { DashboardBottomNav } from "./bottom-nav";
import { DashboardOnboardingPrompt } from "./dashboard-onboarding-prompt";
import { DashboardShell } from "./dashboard-shell";

type DashboardViewProps = {
  userEmail: string;
  athletes: Athlete[];
  selectedAthlete: Athlete | null;
  eventTypes: EventType[];
  eventTypesError?: string | null;
  loadError?: string | null;
  onboardingSessions: OnboardingSessionSummary[];
};

export function DashboardView({
  userEmail,
  athletes,
  selectedAthlete,
  eventTypes,
  eventTypesError,
  loadError,
  onboardingSessions,
}: DashboardViewProps) {
  const hasAthlete = selectedAthlete !== null;

  return (
    <DashboardShell
      userEmail={userEmail}
      adminNavLink={<AppShellAdminNavLink />}
      athletes={athletes}
      selectedAthlete={selectedAthlete}
      onboardingSessions={onboardingSessions}
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
