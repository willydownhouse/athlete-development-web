"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { updateSportAction, type ActionState } from "@/app/admin/actions";
import type { Sport } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type UpdateSportFormProps = {
  sport: Sport;
};

export function UpdateSportForm({ sport }: UpdateSportFormProps) {
  const tCommon = useTranslations("common");
  const [state, formAction] = useActionState(updateSportAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="sportId" value={sport.id} />
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("slug")}</span>
          <input
            name="slug"
            required
            defaultValue={sport.slug}
            pattern="[a-z0-9_]+"
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("name")}</span>
          <input name="name" required defaultValue={sport.name} className={inputClassName} />
        </label>
      </div>

      <input type="hidden" name="active" value="false" />
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="active"
          type="checkbox"
          value="true"
          defaultChecked={sport.active}
          className="rounded border-white/20 bg-[#1c222c]"
        />
        {tCommon("active")}
      </label>

      <SubmitButton variant="secondary">{tCommon("saveChanges")}</SubmitButton>
    </form>
  );
}
