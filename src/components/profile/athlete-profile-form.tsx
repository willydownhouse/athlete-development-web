"use client";

import { format, isValid, parseISO } from "date-fns";
import { useActionState, useState } from "react";

import {
  updateAthleteProfileAction,
  type ProfileActionState,
} from "@/app/(authenticated)/athlete/[athleteId]/profile/actions";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { DatePickerInput } from "@/components/date-picker-input";
import { FormSelect } from "@/components/form/form-select";
import { ATHLETE_NAME_MAX_LENGTH } from "@/lib/constants";
import { dateFnsLocale, datePickerDisplayFormat } from "@/lib/date-fns-locale";
import {
  canChangeProfileDateOfBirth,
  latestSelfAthleteBirthDate,
  SELF_ATHLETE_MIN_AGE_YEARS,
} from "@/lib/date-of-birth";
import type { AppLocale } from "@/lib/locale";
import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";
import {
  profileFieldControlName,
  profileFieldInputValue,
  profileFieldSavedName,
} from "@/lib/profile-field-form";
import type { AthleteAccessRole, AthleteProfileField } from "@/lib/types";

const initialState: ProfileActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20 lg:py-3 lg:text-base";

type AthleteProfileFormProps = {
  athleteId: string;
  name: string;
  dateOfBirth: string;
  focusSportName: string;
  relationshipToAthlete: AthleteAccessRole;
  profileFields: AthleteProfileField[];
};

function fieldValuesFrom(fields: AthleteProfileField[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.id, profileFieldInputValue(field)]));
}

function profileFieldsSignature(fields: AthleteProfileField[]): string {
  return fields.map((field) => `${field.id}=${profileFieldInputValue(field)}`).join("\n");
}

export function AthleteProfileForm({
  athleteId,
  name,
  dateOfBirth,
  focusSportName,
  relationshipToAthlete,
  profileFields,
}: AthleteProfileFormProps) {
  const [state, formAction] = useActionState(updateAthleteProfileAction, initialState);
  const [savedValues, setSavedValues] = useState({ name, dateOfBirth });
  const [nameValue, setNameValue] = useState(name);
  const [dateOfBirthValue, setDateOfBirthValue] = useState(dateOfBirth);
  const [savedFieldValues, setSavedFieldValues] = useState(() => fieldValuesFrom(profileFields));
  const [fieldValues, setFieldValues] = useState(() => fieldValuesFrom(profileFields));
  const [savedFieldSignature, setSavedFieldSignature] = useState(() =>
    profileFieldsSignature(profileFields),
  );
  const locale = useAppLocale();
  const messages = getMessages(locale);
  const canChangeDateOfBirth = canChangeProfileDateOfBirth(relationshipToAthlete, dateOfBirth);
  const isAdultAthlete = relationshipToAthlete === "athlete" && canChangeDateOfBirth;
  const fieldSignature = profileFieldsSignature(profileFields);

  if (
    name !== savedValues.name ||
    dateOfBirth !== savedValues.dateOfBirth ||
    fieldSignature !== savedFieldSignature
  ) {
    const nextFieldValues = fieldValuesFrom(profileFields);
    setSavedValues({ name, dateOfBirth });
    setNameValue(name);
    setDateOfBirthValue(dateOfBirth);
    setSavedFieldSignature(fieldSignature);
    setSavedFieldValues(nextFieldValues);
    setFieldValues(nextFieldValues);
  }

  const fieldsDirty = profileFields.some(
    (field) => (fieldValues[field.id] ?? "") !== (savedFieldValues[field.id] ?? ""),
  );
  const isDirty =
    nameValue.trim() !== savedValues.name.trim() ||
    (canChangeDateOfBirth && dateOfBirthValue !== savedValues.dateOfBirth) ||
    fieldsDirty;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="athleteId" value={athleteId} />
      <input type="hidden" name="relationshipToAthlete" value={relationshipToAthlete} />
      <input type="hidden" name="savedDateOfBirth" value={dateOfBirth} />
      <input type="hidden" name="savedAthleteName" value={name} />
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
        {canChangeDateOfBirth ? (
          <DatePickerInput
            name="dateOfBirth"
            value={dateOfBirthValue}
            onChange={setDateOfBirthValue}
            placeholder={messages.events.selectDate}
            className={inputClassName}
            disabledDates={{ after: isAdultAthlete ? latestSelfAthleteBirthDate() : new Date() }}
          />
        ) : (
          <p className="text-white">{formatProfileDateOfBirth(dateOfBirth, locale)}</p>
        )}
        {isAdultAthlete ? (
          <span className="text-xs text-zinc-500 lg:text-sm">
            {messages.onboarding.minAgeHint(SELF_ATHLETE_MIN_AGE_YEARS)}
          </span>
        ) : null}
      </label>

      {profileFields.map((field) => (
        <ProfileFieldControl
          key={field.id}
          field={field}
          value={fieldValues[field.id] ?? ""}
          savedValue={profileFieldInputValue(field)}
          placeholder={messages.profile.selectValue}
          yesLabel={messages.profile.yes}
          noLabel={messages.profile.no}
          onChange={(nextValue) =>
            setFieldValues((current) => ({ ...current, [field.id]: nextValue }))
          }
        />
      ))}

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

function ProfileFieldControl({
  field,
  value,
  savedValue,
  placeholder,
  yesLabel,
  noLabel,
  onChange,
}: {
  field: AthleteProfileField;
  value: string;
  savedValue: string;
  placeholder: string;
  yesLabel: string;
  noLabel: string;
  onChange: (value: string) => void;
}) {
  const catalogOptions =
    field.options?.map((option) => ({ value: option.value, label: option.name })) ?? [];
  const options =
    catalogOptions.length > 0
      ? catalogOptions
      : field.valueType === "boolean"
        ? [
            { value: "true", label: yesLabel },
            { value: "false", label: noLabel },
          ]
        : [];
  const useSelect = options.length > 0;

  return (
    <label className="flex flex-col gap-1 text-sm lg:text-base">
      <span className="font-medium text-zinc-300">{field.name}</span>
      <input type="hidden" name={profileFieldSavedName(field)} value={savedValue} />
      {useSelect ? (
        <FormSelect
          name={profileFieldControlName(field)}
          value={value}
          placeholder={placeholder}
          className={inputClassName}
          options={options}
          onValueChange={onChange}
        />
      ) : (
        <input
          name={profileFieldControlName(field)}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode={field.valueType === "number" ? "numeric" : "text"}
          maxLength={field.valueType === "text" ? 100 : undefined}
          autoComplete="off"
          className={inputClassName}
        />
      )}
      {field.description ? (
        <span className="text-xs text-zinc-500 lg:text-sm">{field.description}</span>
      ) : null}
    </label>
  );
}

function formatProfileDateOfBirth(value: string, locale: AppLocale): string {
  const parsed = parseISO(value);

  if (!isValid(parsed)) {
    return value;
  }

  return format(parsed, datePickerDisplayFormat(locale, false), {
    locale: dateFnsLocale(locale),
  });
}
