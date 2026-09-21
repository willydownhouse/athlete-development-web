import Link from "next/link";

import { INVITES_HREF } from "@/components/dashboard/dashboard-nav";
import { loadInvitationInbox } from "@/lib/load-invitation-inbox";
import type { AthleteInvitation } from "@/lib/types";

export async function DashboardOnboardingPrompt() {
  const inbox = await loadInvitationInbox();
  const invitations = inbox.error ? [] : inbox.invitations;

  if (invitations.length > 0) {
    return <PendingInvitesEmptyState invitations={invitations} />;
  }

  return <CreateAthleteEmptyState />;
}

function PendingInvitesEmptyState({ invitations }: { invitations: AthleteInvitation[] }) {
  const invitation = invitations[0];
  const athleteName = invitation?.athlete.name;
  const inviterName = invitation?.invitedBy.name?.trim() || invitation?.invitedBy.email;
  const heading =
    invitations.length === 1 ? "You have an invitation" : "You have invitations waiting";
  const body =
    invitations.length === 1 && athleteName
      ? `${inviterName} invited you to ${athleteName}'s profile. Open Invites to accept it and start following along.`
      : "Open Invites to accept them and start following those athlete profiles.";

  return (
    <section className="space-y-8 lg:space-y-10">
      <div>
        <p className="text-sm text-zinc-400 lg:text-base">Welcome</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:mt-3 lg:text-3xl">
          {heading}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-300 lg:mt-6 lg:text-base lg:leading-7">
          {body}
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:p-5 lg:p-6">
        <p className="text-sm font-medium text-zinc-300 lg:text-base">Invites</p>
        <Link
          href={INVITES_HREF}
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-3 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] lg:py-3.5 lg:text-base"
        >
          View invites
        </Link>
      </div>
    </section>
  );
}

function CreateAthleteEmptyState() {
  return (
    <section className="space-y-8 lg:space-y-10">
      <div>
        <p className="text-sm text-zinc-400 lg:text-base">Welcome</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:mt-3 lg:text-3xl">
          Dashboard is still empty
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-300 lg:mt-6 lg:text-base lg:leading-7">
          This dashboard fills in once you have an athlete profile. Add your first athlete to get
          started.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:p-5 lg:p-6">
        <p className="text-sm font-medium text-zinc-300 lg:text-base">Get started</p>
        <Link
          href="/onboarding"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-3 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] lg:py-3.5 lg:text-base"
        >
          Add athlete
        </Link>
      </div>
    </section>
  );
}
