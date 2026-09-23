"use client";

import { useActionState, useState } from "react";

import {
  updateAthleteProfileAction,
  type ProfileActionState,
} from "@/app/athlete/[athleteId]/profile/actions";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { DatePickerInput } from "@/components/date-picker-input";
import { ATHLETE_NAME_MAX_LENGTH } from "@/lib/constants";
import { latestSelfAthleteBirthDate, SELF_ATHLETE_MIN_AGE_YEARS } from "@/lib/date-of-birth";
import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";
import type { AthleteAccessRole } from "@/lib/types";

const initialState: ProfileActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20 lg:py-3 lg:text-base";

type AthleteProfileFormProps = {
  athleteId: string;
  name: string;
  dateOfBirth: string;
  focusSportName: string;
  relationshipToAthlete: AthleteAccessRole;
};

export function AthleteProfileForm({
  athleteId,
  name,
  dateOfBirth,
  focusSportName,
  relationshipToAthlete,
}: AthleteProfileFormProps) {
  const [state, formAction] = useActionState(updateAthleteProfileAction, initialState);
  const [savedValues, setSavedValues] = useState({ name, dateOfBirth });
  const [nameValue, setNameValue] = useState(name);
  const [dateOfBirthValue, setDateOfBirthValue] = useState(dateOfBirth);
  const messages = getMessages(useAppLocale());
  const isSelfProfile = relationshipToAthlete === "athlete";
  const isDirty =
    nameValue.trim() !== savedValues.name.trim() || dateOfBirthValue !== savedValues.dateOfBirth;

  if (name !== savedValues.name || dateOfBirth !== savedValues.dateOfBirth) {
    setSavedValues({ name, dateOfBirth });
    setNameValue(name);
    setDateOfBirthValue(dateOfBirth);
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="athleteId" value={athleteId} />
      <input type="hidden" name="relationshipToAthlete" value={relationshipToAthlete} />
      <FormMessage error={state.error} success={state.success} />

      <div className="flex flex-col gap-1 text-sm lg:text-base">
        <span className="font-medium text-zinc-300">{messages.profile.sport}</span>
        <p className="text-white">{focusSportName}</p>
      </div>

      <label className="flex flex-col gap-1 text-sm lg:text-base">
        <span className="font-medium text-zinc-300">{messages.onboarding.athleteName}</span>
        <input
          name="athleteName"
          required
          maxLength={ATHLETE_NAME_MAX_LENGTH}
          value={nameValue}
          onChange={(event) => setNameValue(event.target.value)}
          autoComplete="off"
          className={inputClassName}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm lg:text-base">
        <span className="font-medium text-zinc-300">{messages.onboarding.dateOfBirth}</span>
        <DatePickerInput
          name="dateOfBirth"
          value={dateOfBirthValue}
          onChange={setDateOfBirthValue}
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

      {isDirty ? (
        <div className="flex justify-end">
          <SubmitButton
            className="!w-auto px-3 py-1.5 text-xs sm:py-1.5"
            pendingLabel={messages.events.saving}
          >
            {messages.events.saveChanges}
          </SubmitButton>
        </div>
      ) : null}
    </form>
  );
}
