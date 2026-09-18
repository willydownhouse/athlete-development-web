"use client";

import { useActionState } from "react";

import {
  revokeAthleteInvitationAction,
  type AccessActionState,
} from "@/app/athlete/[athleteId]/access/actions";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { athleteAccessRoleLabel, formatInvitationExpiry } from "@/lib/athlete-access-display";
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

  return (
    <article className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
      <h3 className="truncate text-base font-semibold text-white">{invitation.invitedEmail}</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Invited as {athleteAccessRoleLabel(invitation.role).toLowerCase()}.
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        Expires {formatInvitationExpiry(invitation.expiresAt)}
      </p>

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="athleteId" value={athleteId} />
        <input type="hidden" name="invitationId" value={invitation.id} />
        <FormMessage error={state.error} />
        <SubmitButton variant="secondary" pendingLabel="Revoking…">
          Revoke
        </SubmitButton>
      </form>
    </article>
  );
}
