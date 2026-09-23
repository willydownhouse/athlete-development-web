import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { AccessList, AccessListSkeleton } from "@/components/access/access-list";
import { InviteForm } from "@/components/access/invite-form";
import { backToTodayLabel, dashboardHref } from "@/components/dashboard/dashboard-nav";
import { AppShell } from "@/components/app-shell";
import { isParentRelationship } from "@/lib/athlete-access-display";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import { loadShellAthletes } from "@/lib/shell-data";

type AthleteAccessPageProps = {
  params: Promise<{ athleteId: string }>;
};

export default async function AthleteAccessPage({ params }: AthleteAccessPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { athleteId } = await params;
  const normalizedAthleteId = athleteId.trim();

  if (!normalizedAthleteId) {
    redirect("/dashboard");
  }

  const token = await getAuthBearerToken();

  if (!token) {
    redirect("/");
  }

  const [athletes, isAdmin, locale] = await Promise.all([
    loadShellAthletes(token),
    getIsAdminUser(),
    getRequestLocale(),
  ]);
  const messages = getMessages(locale);
  const selectedAthlete = athletes.find((athlete) => athlete.id === normalizedAthleteId) ?? null;

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

  if (!isParentRelationship(selectedAthlete.relationshipToAthlete)) {
    redirect(dashboardHref(selectedAthlete.id));
  }

  return (
    <AppShell
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={selectedAthlete}
    >
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6 pt-6 sm:px-6 lg:max-w-3xl lg:px-10">
        <Link
          href={dashboardHref(selectedAthlete.id)}
          className="inline-flex items-center text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
        >
          {backToTodayLabel(locale)}
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
          {messages.nav.access}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {messages.access.pageHint(selectedAthlete.name)}
        </p>

        <div className="mt-6 space-y-6">
          <Suspense fallback={<AccessListSkeleton />}>
            <AccessList athleteId={selectedAthlete.id} />
          </Suspense>
          <InviteForm athleteId={selectedAthlete.id} />
        </div>
      </div>
    </AppShell>
  );
}
