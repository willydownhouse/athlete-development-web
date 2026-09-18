import { OnboardingShellClient } from "@/components/onboarding/onboarding-shell-client";
import { loadPendingInviteCount } from "@/lib/load-invitation-inbox";
import type { Athlete } from "@/lib/types";

type OnboardingShellProps = {
  userEmail: string;
  isAdmin?: boolean;
  athletes?: Athlete[];
  dashboardAthleteId?: string | null;
  children: React.ReactNode;
};

export async function OnboardingShell(props: OnboardingShellProps) {
  const pendingInviteCount = await loadPendingInviteCount();

  return <OnboardingShellClient {...props} pendingInviteCount={pendingInviteCount} />;
}
