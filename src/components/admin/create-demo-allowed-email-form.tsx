"use client";

import { useActionState, useEffect } from "react";

import { useAdminCreateModalClose } from "@/components/admin/admin-create-modal";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { createDemoAllowedEmailAction, type ActionState } from "@/app/admin/actions";
import { INVITED_EMAIL_MAX_LENGTH } from "@/lib/constants";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

export function CreateDemoAllowedEmailForm() {
  const [state, formAction] = useActionState(createDemoAllowedEmailAction, initialState);
  const closeModal = useAdminCreateModalClose();

  useEffect(() => {
    if (state.success) {
      closeModal?.();
    }
  }, [state.success, closeModal]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage error={state.error} success={state.success} />

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

      <SubmitButton pendingLabel="Adding…">Add email</SubmitButton>
    </form>
  );
}
