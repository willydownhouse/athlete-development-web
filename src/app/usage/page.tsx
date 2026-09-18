import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UsageMeters, UsageMetersSkeleton } from "@/components/usage/usage-meters";
import { UsagePlanCard } from "@/components/usage/usage-plan-card";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { loadShellAthletes } from "@/lib/shell-data";

export default async function UsagePage() {
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
    <DashboardShell
      userEmail={session.user.email ?? ""}
      isAdmin={isAdmin}
      athletes={athletes}
      selectedAthlete={null}
    >
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6 pt-6 sm:px-6 lg:max-w-3xl lg:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Usage</h1>
        <div className="mt-6 space-y-4">
          <UsagePlanCard />
          <Suspense fallback={<UsageMetersSkeleton />}>
            <UsageMeters />
          </Suspense>
        </div>
      </div>
    </DashboardShell>
  );
}
