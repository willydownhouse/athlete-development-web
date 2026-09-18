import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { InvitesList, InvitesListSkeleton } from "@/components/invites/invites-list";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { loadShellAthletes } from "@/lib/shell-data";

export default async function InvitesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const token = await getAuthBearerToken();

  if (!token) {
    redirect("/");
  }

  const [athletes, isAdmin] = await Promise.all([loadShellAthletes(token), getIsAdminUser()]);

  return (
    <AppShell
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={null}
    >
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6 pt-6 sm:px-6 lg:max-w-3xl lg:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Invites</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Accept an invitation to share an athlete profile with your family.
        </p>
        <div className="mt-6">
          <Suspense fallback={<InvitesListSkeleton />}>
            <InvitesList />
          </Suspense>
        </div>
      </div>
    </AppShell>
  );
}
