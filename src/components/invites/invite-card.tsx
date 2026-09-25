"use client";

import { useActionState } from "react";

import {
  acceptInvitationAction,
  declineInvitationAction,
  type InviteActionState,
} from "@/app/invites/actions";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { formatInvitationExpiry } from "@/lib/athlete-access-display";
import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";
import type { AthleteInvitation } from "@/lib/types";

const initialState: InviteActionState = {};

function inviterName(invitation: AthleteInvitation): string {
  return invitation.invitedBy.name?.trim() || invitation.invitedBy.email;
}

export function InviteCard({ invitation }: { invitation: AthleteInvitation }) {
  const [acceptState, acceptAction, acceptPending] = useActionState(
    acceptInvitationAction,
    initialState,
  );
  const [declineState, declineAction, declinePending] = useActionState(
    declineInvitationAction,
    initialState,
  );
  const busy = acceptPending || declinePending;
  const locale = useAppLocale();
  const messages = getMessages(locale);

  return (
    <article className="rounded-2xl bg-[#171b22] px-4 py-4 sm:px-5">
      <h2 className="text-base font-semibold text-white">{invitation.athlete.name}</h2>
      <p className="mt-1 text-sm text-zinc-400">
        {messages.invites.invitedYouAs(inviterName(invitation), invitation.role)}
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        {messages.invites.expires(formatInvitationExpiry(invitation.expiresAt, locale))}
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <FormMessage error={acceptState.error ?? declineState.error} />
        <div className="flex flex-col gap-2 sm:flex-row">
          <form action={acceptAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <SubmitButton
              pending={acceptPending}
              pendingLabel={messages.invites.accepting}
              disabled={busy}
            >
              {messages.invites.accept}
            </SubmitButton>
          </form>
          <form action={declineAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <SubmitButton
              variant="secondary"
              pending={declinePending}
              pendingLabel={messages.invites.declining}
              disabled={busy}
            >
              {messages.invites.decline}
            </SubmitButton>
          </form>
        </div>
      </div>
    </article>
  );
}
