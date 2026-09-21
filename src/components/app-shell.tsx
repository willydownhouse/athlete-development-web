import { AppShellClient } from "@/components/app-shell-client";
import { assertApiAccess } from "@/lib/assert-api-access";
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
  await assertApiAccess();
  const pendingInviteCount = await loadPendingInviteCount();

  return <AppShellClient {...props} pendingInviteCount={pendingInviteCount} />;
}
