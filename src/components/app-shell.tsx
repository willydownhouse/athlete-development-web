import { AppShellClient } from "@/components/app-shell-client";
import { loadPendingInviteCount } from "@/lib/load-invitation-inbox";
import type { Athlete } from "@/lib/types";

type AppShellProps = {
  userEmail: string;
  isAdmin?: boolean;
  athletes?: Athlete[];
  selectedAthlete?: Athlete | null;
  children: React.ReactNode;
};

export async function AppShell(props: AppShellProps) {
  const pendingInviteCount = await loadPendingInviteCount();

  return <AppShellClient {...props} pendingInviteCount={pendingInviteCount} />;
}
