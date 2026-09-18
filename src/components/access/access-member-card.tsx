"use client";

import { useActionState } from "react";

import {
  endAthleteAccessGrantAction,
  type AccessActionState,
} from "@/app/athlete/[athleteId]/access/actions";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { athleteAccessRoleLabel } from "@/lib/athlete-access-display";
import type { AthleteAccessMember } from "@/lib/types";

const initialState: AccessActionState = {};

function memberName(member: AthleteAccessMember): string {
  return member.user.name?.trim() || member.user.email;
}

export function AccessMemberCard({
  athleteId,
  member,
  isCurrentUser,
}: {
  athleteId: string;
  member: AthleteAccessMember;
  isCurrentUser: boolean;
}) {
  const [state, formAction] = useActionState(endAthleteAccessGrantAction, initialState);

  return (
    <article className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">{memberName(member)}</h3>
          <p className="mt-1 truncate text-sm text-zinc-400">{member.user.email}</p>
          <p className="mt-1 text-sm text-zinc-500">{athleteAccessRoleLabel(member.role)}</p>
        </div>
        {isCurrentUser ? (
          <p className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300">
            You
          </p>
        ) : null}
      </div>

      {isCurrentUser ? null : (
        <form action={formAction} className="mt-4 space-y-3">
          <input type="hidden" name="athleteId" value={athleteId} />
          <input type="hidden" name="accessId" value={member.id} />
          <FormMessage error={state.error} />
          <SubmitButton variant="danger" pendingLabel="Removing…">
            Remove access
          </SubmitButton>
        </form>
      )}
    </article>
  );
}
