"use client";

import { useActionState } from "react";

import {
  revokeAthleteInvitationAction,
  type AccessActionState,
} from "@/app/athlete/[athleteId]/access/actions";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { formatInvitationExpiry } from "@/lib/athlete-access-display";
import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";
import type { AthleteInvitation } from "@/lib/types";

const initialState: AccessActionState = {};

export function PendingInviteCard({
  athleteId,
  invitation,
}: {
  athleteId: string;
  invitation: AthleteInvitation;
}) {
  const [state, formAction] = useActionState(revokeAthleteInvitationAction, initialState);
  const locale = useAppLocale();
  const messages = getMessages(locale);

  return (
    <article className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
      <h3 className="truncate text-base font-semibold text-white">{invitation.invitedEmail}</h3>
      <p className="mt-1 text-sm text-zinc-400">{messages.access.invitedAs(invitation.role)}</p>
      <p className="mt-1 text-sm text-zinc-500">
        {messages.invites.expires(formatInvitationExpiry(invitation.expiresAt, locale))}
      </p>

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="athleteId" value={athleteId} />
        <input type="hidden" name="invitationId" value={invitation.id} />
        <FormMessage error={state.error} />
        <SubmitButton variant="secondary" pendingLabel={messages.access.revoking}>
          {messages.access.revoke}
        </SubmitButton>
      </form>
    </article>
  );
}
