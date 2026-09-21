"use client";

import { useActionState } from "react";

import {
  acceptInvitationAction,
  declineInvitationAction,
  type InviteActionState,
} from "@/app/invites/actions";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { athleteAccessRoleLabel, formatInvitationExpiry } from "@/lib/athlete-access-display";
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

  return (
    <article className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
      <h2 className="text-base font-semibold text-white">{invitation.athlete.name}</h2>
      <p className="mt-1 text-sm text-zinc-400">
        {inviterName(invitation)} invited you as{" "}
        {athleteAccessRoleLabel(invitation.role).toLowerCase()}.
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        Expires {formatInvitationExpiry(invitation.expiresAt)}
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <FormMessage error={acceptState.error ?? declineState.error} />
        <div className="flex flex-col gap-2 sm:flex-row">
          <form action={acceptAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <SubmitButton pending={acceptPending} pendingLabel="Accepting…" disabled={busy}>
              Accept
            </SubmitButton>
          </form>
          <form action={declineAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <SubmitButton
              variant="secondary"
              pending={declinePending}
              pendingLabel="Declining…"
              disabled={busy}
            >
              Decline
            </SubmitButton>
          </form>
        </div>
      </div>
    </article>
  );
}
