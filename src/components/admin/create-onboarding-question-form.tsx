"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";

import { useAdminCreateModalClose } from "@/components/admin/admin-create-modal";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { createOnboardingQuestionAction, type ActionState } from "@/app/admin/actions";
import { createAnswerTypeLabel } from "@/lib/i18n-labels";
import { ONBOARDING_ANSWER_TYPES, type Sport } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type CreateOnboardingQuestionFormProps = {
  sports: Sport[];
};

export function CreateOnboardingQuestionForm({ sports }: CreateOnboardingQuestionFormProps) {
  const t = useTranslations("admin.onboardingQuestions");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("admin");
  const answerTypeLabel = createAnswerTypeLabel(tAdmin);
  const [state, formAction] = useActionState(createOnboardingQuestionAction, initialState);
  const closeModal = useAdminCreateModalClose();

  useEffect(() => {
    if (state.success) {
      closeModal?.();
    }
  }, [state.success, closeModal]);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("key")}</span>
          <input
            name="key"
            required
            pattern="[a-z0-9_]+"
            placeholder={t("keyPlaceholder")}
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{t("answerType")}</span>
          <select name="answerType" required defaultValue="text" className={inputClassName}>
            {ONBOARDING_ANSWER_TYPES.map((answerType) => (
              <option key={answerType} value={answerType}>
                {answerTypeLabel(answerType)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("sport")}</span>
          <select name="sportId" defaultValue="general" className={inputClassName}>
            <option value="general">{tCommon("commonAllSports")}</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{t("sortOrder")}</span>
          <input name="sortOrder" type="number" defaultValue={0} className={inputClassName} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{t("mapsToField")}</span>
          <input
            name="mapsToField"
            placeholder={t("mapsToFieldPlaceholder")}
            className={inputClassName}
          />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-zinc-300">{tCommon("prompt")}</span>
        <textarea
          name="prompt"
          required
          rows={2}
          placeholder={t("promptPlaceholder")}
          className={inputClassName}
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-zinc-300">{t("helpText")}</span>
        <textarea
          name="helpText"
          rows={2}
          placeholder={t("helpTextPlaceholder")}
          className={inputClassName}
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-zinc-300">{t("optionsJson")}</span>
        <textarea
          name="options"
          rows={3}
          placeholder={t("optionsPlaceholder")}
          className={`${inputClassName} font-mono`}
        />
      </label>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            name="required"
            type="checkbox"
            defaultChecked
            className="rounded border-white/20 bg-[#1c222c]"
          />
          {tCommon("required")}
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            name="active"
            type="checkbox"
            defaultChecked
            className="rounded border-white/20 bg-[#1c222c]"
          />
          {tCommon("active")}
        </label>
      </div>

      <SubmitButton>{t("createOnboardingQuestion")}</SubmitButton>
    </form>
  );
}
