"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { deleteDemoAllowedEmailAction, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

export function DeleteDemoAllowedEmailForm({ demoAllowedEmailId }: { demoAllowedEmailId: string }) {
  const [state, formAction] = useActionState(deleteDemoAllowedEmailAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="demoAllowedEmailId" value={demoAllowedEmailId} />
      <FormMessage error={state.error} />
      <SubmitButton variant="danger" pendingLabel="Removing…">
        Remove
      </SubmitButton>
    </form>
  );
}
