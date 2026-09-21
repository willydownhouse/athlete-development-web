"use client";

import { useActionState, useState } from "react";

import {
  createAthleteInvitationAction,
  type AccessActionState,
} from "@/app/athlete/[athleteId]/access/actions";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { INVITED_EMAIL_MAX_LENGTH } from "@/lib/constants";
import type { AthleteAccessRole } from "@/lib/types";

const initialState: AccessActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

const roleOptions: Array<{ value: AthleteAccessRole; label: string }> = [
  { value: "parent", label: "Parent" },
  { value: "athlete", label: "Athlete" },
];

export function InviteForm({ athleteId }: { athleteId: string }) {
  const [state, formAction] = useActionState(createAthleteInvitationAction, initialState);

  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
      <h2 className="text-base font-semibold text-white">Invite</h2>
      <p className="mt-1 text-sm text-zinc-400">They will see the invitation after signing in.</p>

      <div className="mt-4 space-y-4">
        <FormMessage error={state.error} success={state.success} />
        <InviteFormFields
          key={state.formKey ?? "idle"}
          athleteId={athleteId}
          formAction={formAction}
        />
      </div>
    </section>
  );
}

function InviteFormFields({
  athleteId,
  formAction,
}: {
  athleteId: string;
  formAction: (payload: FormData) => void;
}) {
  const [role, setRole] = useState<AthleteAccessRole>("parent");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="athleteId" value={athleteId} />
      <input type="hidden" name="role" value={role} />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-300">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={INVITED_EMAIL_MAX_LENGTH}
          placeholder="alex@example.com"
          className={inputClassName}
        />
      </label>

      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-300">Invite as</p>
        <div className="grid grid-cols-2 gap-2">
          {roleOptions.map((option) => {
            const selected = role === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  selected
                    ? "border-[#9ec9e8]/45 bg-[#1c222c] text-white"
                    : "border-white/10 bg-[#1c222c]/60 text-zinc-300 hover:border-white/20 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <SubmitButton pendingLabel="Sending…">Send invite</SubmitButton>
    </form>
  );
}
