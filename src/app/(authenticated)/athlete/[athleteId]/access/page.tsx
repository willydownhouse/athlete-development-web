import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AccessList, AccessListSkeleton } from "@/components/access/access-list";
import { InviteForm } from "@/components/access/invite-form";
import { backToTodayLabel, dashboardHref } from "@/components/dashboard/dashboard-nav";
import { loadAccessibleAthlete } from "@/lib/accessible-athlete";
import { isParentRelationship } from "@/lib/athlete-access-display";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";

type AthleteAccessPageProps = {
  params: Promise<{ athleteId: string }>;
};

export default async function AthleteAccessPage({ params }: AthleteAccessPageProps) {
  const { athleteId } = await params;
  const [selectedAthlete, locale] = await Promise.all([
    loadAccessibleAthlete(athleteId),
    getRequestLocale(),
  ]);
  const messages = getMessages(locale);

  if (!selectedAthlete) {
    redirect("/dashboard");
  }

  if (!isParentRelationship(selectedAthlete.relationshipToAthlete)) {
    redirect(dashboardHref(selectedAthlete.id));
  }

  return (
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
      <p className="mt-2 text-sm text-zinc-400">{messages.access.pageHint(selectedAthlete.name)}</p>

      <div className="mt-6 space-y-6">
        <Suspense fallback={<AccessListSkeleton />}>
          <AccessList athleteId={selectedAthlete.id} />
        </Suspense>
        <InviteForm athleteId={selectedAthlete.id} />
      </div>
    </div>
  );
}
