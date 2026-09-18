import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { AccessList, AccessListSkeleton } from "@/components/access/access-list";
import { InviteForm } from "@/components/access/invite-form";
import {
  ACCESS_NAV_LABEL,
  backToTodayLabel,
  dashboardHref,
} from "@/components/dashboard/dashboard-nav";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isParentRelationship } from "@/lib/athlete-access-display";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getIsAdminUser } from "@/lib/is-admin-user";
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

  const [athletes, isAdmin] = await Promise.all([loadShellAthletes(token), getIsAdminUser()]);
  const selectedAthlete = athletes.find((athlete) => athlete.id === normalizedAthleteId) ?? null;

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

  if (!isParentRelationship(selectedAthlete.relationshipToAthlete)) {
    redirect(dashboardHref(selectedAthlete.id));
  }

  return (
    <DashboardShell
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
          {backToTodayLabel()}
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
          {ACCESS_NAV_LABEL}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Invite family members to {selectedAthlete.name}&apos;s profile.
        </p>

        <div className="mt-6 space-y-6">
          <Suspense fallback={<AccessListSkeleton />}>
            <AccessList athleteId={selectedAthlete.id} />
          </Suspense>
          <InviteForm athleteId={selectedAthlete.id} />
        </div>
      </div>
    </DashboardShell>
  );
}
