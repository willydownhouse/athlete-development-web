import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { fetchAthletes } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getRequestLocale } from "@/lib/locale-server";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const [token, locale, actions] = await Promise.all([
    getAuthBearerToken(),
    getRequestLocale(),
    getActionMessages(),
  ]);

  let athletes = [] as Awaited<ReturnType<typeof fetchAthletes>>;
  let loadError: string | null = null;

  if (token) {
    try {
      athletes = await fetchAthletes(token, locale);
    } catch (error) {
      loadError = passthroughOrGeneric(error, actions.loadAthletes);
    }
  } else {
    loadError = actions.signInAgain;
  }

  const firstAthlete = athletes[0];
  if (firstAthlete) {
    redirect(dashboardHref(firstAthlete.id));
  }

  return (
    <DashboardView
      userEmail={session.user.email ?? ""}
      athletes={athletes}
      selectedAthlete={null}
      eventTypes={[]}
      loadError={loadError}
    />
  );
}
