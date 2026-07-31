"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";

import { useAdminCreateModalClose } from "@/components/admin/admin-create-modal";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { createSportAction, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

export function CreateSportForm() {
  const t = useTranslations("admin.sports");
  const tCommon = useTranslations("common");
  const [state, formAction] = useActionState(createSportAction, initialState);
  const closeModal = useAdminCreateModalClose();

  useEffect(() => {
    if (state.success) {
      closeModal?.();
    }
  }, [state.success, closeModal]);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("slug")}</span>
          <input
            name="slug"
            required
            pattern="[a-z0-9_]+"
            placeholder={t("slugPlaceholder")}
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("name")}</span>
          <input
            name="name"
            required
            placeholder={t("namePlaceholder")}
            className={inputClassName}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="active"
          type="checkbox"
          defaultChecked
          className="rounded border-white/20 bg-[#1c222c]"
        />
        {tCommon("active")}
      </label>

      <SubmitButton>{t("createSport")}</SubmitButton>
    </form>
  );
}
