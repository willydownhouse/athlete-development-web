"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createAthleteBasicsAction, type OnboardingActionState } from "@/app/onboarding/actions";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { DatePickerInput } from "@/components/date-picker-input";

const initialState: OnboardingActionState = {};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20 lg:py-3 lg:text-base";

type AthleteBasicsFormProps = {
  sportId: string;
};

export function AthleteBasicsForm({ sportId }: AthleteBasicsFormProps) {
  const [state, formAction] = useActionState(createAthleteBasicsAction, initialState);

  return (
    <form action={formAction} className="space-y-5 lg:space-y-6">
      <input type="hidden" name="focusSportId" value={sportId} />
      <FormMessage error={state.error} />

      <label className="flex flex-col gap-1 text-sm lg:text-base">
        <span className="font-medium text-zinc-300">Athlete name</span>
        <input
          name="name"
          required
          autoComplete="name"
          placeholder="Leo"
          className={inputClassName}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm lg:text-base">
        <span className="font-medium text-zinc-300">Date of birth</span>
        <DatePickerInput
          name="dateOfBirth"
          placeholder="Select date"
          className={inputClassName}
          disabledDates={{ after: new Date() }}
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton className="lg:px-5 lg:py-3 lg:text-base">Create athlete profile</SubmitButton>
        <Link
          href="/onboarding"
          className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-[#1c222c] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#252b36] sm:w-auto lg:px-5 lg:py-3 lg:text-base"
        >
          Back
        </Link>
      </div>
    </form>
  );
}
