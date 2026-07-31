"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { updateOnboardingQuestionAction, type ActionState } from "@/app/admin/actions";
import { createAnswerTypeLabel } from "@/lib/i18n-labels";
import { ONBOARDING_ANSWER_TYPES, type OnboardingQuestion, type Sport } from "@/lib/types";

const initialState: ActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type UpdateOnboardingQuestionFormProps = {
  question: OnboardingQuestion;
  sports: Sport[];
};

function formatOptions(options: unknown | null): string {
  if (options === null || options === undefined) {
    return "";
  }

  return JSON.stringify(options, null, 2);
}

export function UpdateOnboardingQuestionForm({
  question,
  sports,
}: UpdateOnboardingQuestionFormProps) {
  const t = useTranslations("admin.onboardingQuestions");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("admin");
  const answerTypeLabel = createAnswerTypeLabel(tAdmin);
  const [state, formAction] = useActionState(updateOnboardingQuestionAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="onboardingQuestionId" value={question.id} />
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("key")}</span>
          <input
            name="key"
            required
            defaultValue={question.key}
            pattern="[a-z0-9_]+"
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{t("answerType")}</span>
          <select name="answerType" defaultValue={question.answerType} className={inputClassName}>
            {ONBOARDING_ANSWER_TYPES.map((answerType) => (
              <option key={answerType} value={answerType}>
                {answerTypeLabel(answerType)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{tCommon("sport")}</span>
          <select
            name="sportId"
            defaultValue={question.sportId ?? "general"}
            className={inputClassName}
          >
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
          <input
            name="sortOrder"
            type="number"
            defaultValue={question.sortOrder}
            className={inputClassName}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-300">{t("mapsToField")}</span>
          <input
            name="mapsToField"
            defaultValue={question.mapsToField ?? ""}
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
          defaultValue={question.prompt}
          className={inputClassName}
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-zinc-300">{t("helpText")}</span>
        <textarea
          name="helpText"
          rows={2}
          defaultValue={question.helpText ?? ""}
          className={inputClassName}
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-zinc-300">{t("optionsJson")}</span>
        <textarea
          name="options"
          rows={3}
          defaultValue={formatOptions(question.options)}
          className={`${inputClassName} font-mono`}
        />
      </label>

      <div className="flex flex-wrap gap-4">
        <input type="hidden" name="required" value="false" />
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            name="required"
            type="checkbox"
            value="true"
            defaultChecked={question.required}
            className="rounded border-white/20 bg-[#1c222c]"
          />
          {tCommon("required")}
        </label>
        <input type="hidden" name="active" value="false" />
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            name="active"
            type="checkbox"
            value="true"
            defaultChecked={question.active}
            className="rounded border-white/20 bg-[#1c222c]"
          />
          {tCommon("active")}
        </label>
      </div>

      <SubmitButton variant="secondary">{tCommon("saveChanges")}</SubmitButton>
    </form>
  );
}
