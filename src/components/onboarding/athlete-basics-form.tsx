"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { createAthleteBasicsAction, type OnboardingActionState } from "@/app/onboarding/actions";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { DatePickerInput } from "@/components/date-picker-input";
import { RelationshipSelect } from "@/components/onboarding/relationship-select";
import { latestSelfAthleteBirthDate, SELF_ATHLETE_MIN_AGE_YEARS } from "@/lib/date-of-birth";
import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";
import type { AthleteAccessRole } from "@/lib/types";

const initialState: OnboardingActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20 lg:py-3 lg:text-base";

type AthleteBasicsFormProps = {
  sportId: string;
};

export function AthleteBasicsForm({ sportId }: AthleteBasicsFormProps) {
  const [state, formAction] = useActionState(createAthleteBasicsAction, initialState);
  const [relationshipToAthlete, setRelationshipToAthlete] = useState<AthleteAccessRole | null>(
    null,
  );

  const isSelfProfile = relationshipToAthlete === "athlete";
  const messages = getMessages(useAppLocale());

  return (
    <form action={formAction} className="space-y-5 lg:space-y-6">
      <input type="hidden" name="focusSportId" value={sportId} />
      {relationshipToAthlete ? (
        <input type="hidden" name="relationshipToAthlete" value={relationshipToAthlete} />
      ) : null}
      <FormMessage error={state.error} />

      <RelationshipSelect value={relationshipToAthlete} onChange={setRelationshipToAthlete} />

      <label className="flex flex-col gap-1 text-sm lg:text-base">
        <span className="font-medium text-zinc-300">
          {isSelfProfile ? messages.onboarding.yourName : messages.onboarding.athleteName}
        </span>
        <input
          name="name"
          required
          autoComplete="name"
          placeholder={isSelfProfile ? "Alex" : "Leo"}
          className={inputClassName}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm lg:text-base">
        <span className="font-medium text-zinc-300">
          {isSelfProfile ? messages.onboarding.yourDateOfBirth : messages.onboarding.dateOfBirth}
        </span>
        <DatePickerInput
          name="dateOfBirth"
          placeholder={messages.events.selectDate}
          className={inputClassName}
          disabledDates={{ after: isSelfProfile ? latestSelfAthleteBirthDate() : new Date() }}
        />
        {isSelfProfile ? (
          <span className="text-xs text-zinc-500 lg:text-sm">
            {messages.onboarding.minAgeHint(SELF_ATHLETE_MIN_AGE_YEARS)}
          </span>
        ) : null}
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton
          disabled={relationshipToAthlete === null}
          className="lg:px-5 lg:py-3 lg:text-base"
        >
          {isSelfProfile
            ? messages.onboarding.createMyProfile
            : messages.onboarding.createAthleteProfile}
        </SubmitButton>
        <Link
          href="/onboarding"
          className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-[#1c222c] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#252b36] sm:w-auto lg:px-5 lg:py-3 lg:text-base"
        >
          {messages.common.back}
        </Link>
      </div>
    </form>
  );
}
