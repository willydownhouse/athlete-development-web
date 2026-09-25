import { AppShellClient } from "@/components/app-shell-client";
import { assertApiAccess } from "@/lib/assert-api-access";
import { loadAthleteAvatarUrls } from "@/lib/load-athlete-avatar-url";
import { loadPendingInviteCount } from "@/lib/load-invitation-inbox";
import { getRequestLocale } from "@/lib/locale-server";
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
  const [pendingInviteCount, locale, athleteAvatarUrls] = await Promise.all([
    loadPendingInviteCount(),
    getRequestLocale(),
    loadAthleteAvatarUrls((props.athletes ?? []).map((athlete) => athlete.id)),
  ]);

  return (
    <AppShellClient
      {...props}
      pendingInviteCount={pendingInviteCount}
      locale={locale}
      athleteAvatarUrls={athleteAvatarUrls}
    />
  );
}
