import { DashboardShellClient } from "@/components/dashboard/dashboard-shell-client";
import { loadPendingInviteCount } from "@/lib/load-invitation-inbox";
import type { Athlete } from "@/lib/types";

type DashboardShellProps = {
  userEmail: string;
  isAdmin?: boolean;
  athletes: Athlete[];
  selectedAthlete: Athlete | null;
  children: React.ReactNode;
};

export async function DashboardShell(props: DashboardShellProps) {
  const pendingInviteCount = await loadPendingInviteCount();

  return <DashboardShellClient {...props} pendingInviteCount={pendingInviteCount} />;
}
