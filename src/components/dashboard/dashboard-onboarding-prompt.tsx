import Link from "next/link";

import { INVITES_HREF } from "@/components/dashboard/dashboard-nav";
import { loadInvitationInbox } from "@/lib/load-invitation-inbox";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import type { AthleteInvitation } from "@/lib/types";

export async function DashboardOnboardingPrompt() {
  const [inbox, locale] = await Promise.all([loadInvitationInbox(), getRequestLocale()]);
  const invitations = inbox.error ? [] : inbox.invitations;
  const messages = getMessages(locale);

  if (invitations.length > 0) {
    return <PendingInvitesEmptyState invitations={invitations} messages={messages} />;
  }

  return <CreateAthleteEmptyState messages={messages} />;
}

function PendingInvitesEmptyState({
  invitations,
  messages,
}: {
  invitations: AthleteInvitation[];
  messages: ReturnType<typeof getMessages>;
}) {
  const invitation = invitations[0];
  const athleteName = invitation?.athlete.name;
  const inviterName = invitation?.invitedBy.name?.trim() || invitation?.invitedBy.email;
  const heading =
    invitations.length === 1
      ? messages.dashboard.invitationTitle
      : messages.dashboard.invitationsTitle;
  const body =
    invitations.length === 1 && athleteName
      ? messages.dashboard.invitationBody(inviterName ?? "", athleteName)
      : messages.dashboard.invitationsBody;

  return (
    <section className="space-y-8 lg:space-y-10">
      <div>
        <p className="text-sm text-zinc-400 lg:text-base">{messages.dashboard.welcome}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:mt-3 lg:text-3xl">
          {heading}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-300 lg:mt-6 lg:text-base lg:leading-7">
          {body}
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#171b22] p-4 sm:p-5 lg:p-6">
        <p className="text-sm font-medium text-zinc-300 lg:text-base">{messages.invites.title}</p>
        <Link
          href={INVITES_HREF}
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-3 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] lg:py-3.5 lg:text-base"
        >
          {messages.dashboard.viewInvites}
        </Link>
      </div>
    </section>
  );
}

function CreateAthleteEmptyState({ messages }: { messages: ReturnType<typeof getMessages> }) {
  return (
    <section className="space-y-8 lg:space-y-10">
      <div>
        <p className="text-sm text-zinc-400 lg:text-base">{messages.dashboard.welcome}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:mt-3 lg:text-3xl">
          {messages.dashboard.emptyTitle}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-300 lg:mt-6 lg:text-base lg:leading-7">
          {messages.dashboard.emptyBody}
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#171b22] p-4 sm:p-5 lg:p-6">
        <p className="text-sm font-medium text-zinc-300 lg:text-base">
          {messages.dashboard.getStartedCard}
        </p>
        <Link
          href="/onboarding"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-3 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] lg:py-3.5 lg:text-base"
        >
          {messages.nav.addAthlete}
        </Link>
      </div>
    </section>
  );
}
