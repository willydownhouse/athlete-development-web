import type { Athlete, OnboardingSessionSummary } from "@/lib/types";

import { DashboardBottomNav } from "@/components/dashboard/bottom-nav";
import { DashboardOnboardingPrompt } from "@/components/dashboard/dashboard-onboarding-prompt";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

import { ChatContent } from "./chat-content";

type ChatViewProps = {
  userEmail: string;
  isAdmin?: boolean;
  athletes: Athlete[];
  selectedAthlete: Athlete | null;
  loadError?: string | null;
  onboardingSessions: OnboardingSessionSummary[];
};

export function ChatView({
  userEmail,
  isAdmin = false,
  athletes,
  selectedAthlete,
  loadError,
  onboardingSessions,
}: ChatViewProps) {
  const hasAthlete = selectedAthlete !== null;

  return (
    <DashboardShell
      userEmail={userEmail}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={selectedAthlete}
      onboardingSessions={onboardingSessions}
    >
      <div
        className={`relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 sm:px-6 lg:max-w-3xl lg:px-10 ${
          hasAthlete ? "min-h-0 pb-28 pt-6" : "justify-center py-10 pb-28 lg:py-16"
        }`}
      >
        {hasAthlete ? (
          <>
            {loadError ? (
              <p className="mb-6 shrink-0 rounded-[1.35rem] bg-[#2a1717] px-4 py-3 text-sm text-red-300">
                {loadError}
              </p>
            ) : null}
            <ChatContent selectedAthlete={selectedAthlete} />
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

      <DashboardBottomNav selectedAthleteId={selectedAthlete?.id} />
    </DashboardShell>
  );
}
