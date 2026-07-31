"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { createAthleteBasicsAction, type OnboardingActionState } from "@/app/onboarding/actions";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { DatePickerInput } from "@/components/date-picker-input";

const initialState: OnboardingActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20 lg:py-3 lg:text-base";

type AthleteBasicsFormProps = {
  sportId: string;
  sportName: string;
};

export function AthleteBasicsForm({ sportId, sportName }: AthleteBasicsFormProps) {
  const t = useTranslations("onboarding.athleteDetails");
  const tCommon = useTranslations("common");
  const tForm = useTranslations("form");
  const [state, formAction] = useActionState(createAthleteBasicsAction, initialState);

  return (
    <form action={formAction} className="space-y-5 lg:space-y-6">
      <input type="hidden" name="focusSportId" value={sportId} />
      <FormMessage error={state.error} />

      <label className="flex flex-col gap-1 text-sm lg:text-base">
        <span className="font-medium text-zinc-300">{t("athleteName")}</span>
        <input
          name="name"
          required
          autoComplete="name"
          placeholder={t("namePlaceholder")}
          className={inputClassName}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm lg:text-base">
          <span className="font-medium text-zinc-300">{t("dateOfBirth")}</span>
          <DatePickerInput
            name="dateOfBirth"
            placeholder={tForm("selectDate")}
            className={inputClassName}
            disabledDates={{ after: new Date() }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm lg:text-base">
          <span className="font-medium text-zinc-300">{t("heightCm")}</span>
          <input
            name="heightCm"
            type="number"
            min={1}
            placeholder={t("heightPlaceholder")}
            className={inputClassName}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm lg:text-base">
          <span className="font-medium text-zinc-300">{t("weightKg")}</span>
          <input
            name="weightKg"
            type="number"
            min={1}
            placeholder={t("weightPlaceholder")}
            className={inputClassName}
          />
        </label>
      </div>

      <p className="text-sm text-zinc-500">{t("optionalDetails", { sportName })}</p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton className="lg:px-5 lg:py-3 lg:text-base">{tCommon("continue")}</SubmitButton>
        <Link
          href="/onboarding"
          className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-[#1c222c] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#252b36] sm:w-auto lg:px-5 lg:py-3 lg:text-base"
        >
          {tCommon("back")}
        </Link>
      </div>
    </form>
  );
}
