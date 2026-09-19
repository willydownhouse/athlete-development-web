"use client";

import { startTransition, useActionState, useState } from "react";

import {
  endAthleteAccessGrantAction,
  type AccessActionState,
} from "@/app/athlete/[athleteId]/access/actions";
import { RemoveAccessConfirmModal } from "@/components/access/remove-access-confirm-modal";
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, formAction, pending] = useActionState(endAthleteAccessGrantAction, initialState);
  const name = memberName(member);

  function confirmRemove() {
    const formData = new FormData();
    formData.set("athleteId", athleteId);
    formData.set("accessId", member.id);
    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <article className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">{name}</h3>
          <p className="mt-1 truncate text-sm text-zinc-400">{member.user.email}</p>
          <p className="mt-1 text-sm text-zinc-500">{athleteAccessRoleLabel(member.role)}</p>
        </div>
        {isCurrentUser ? (
          <p className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300">
            You
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="shrink-0 text-sm font-medium text-zinc-500 transition hover:text-zinc-200"
          >
            Remove
          </button>
        )}
      </div>

      {isCurrentUser ? null : (
        <RemoveAccessConfirmModal
          open={confirmOpen}
          memberName={name}
          pending={pending}
          error={state.error}
          onClose={() => {
            if (!pending) {
              setConfirmOpen(false);
            }
          }}
          onConfirm={confirmRemove}
        />
      )}
    </article>
  );
}
