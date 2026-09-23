"use server";

import { redirect } from "next/navigation";

import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import { createAthlete } from "@/lib/api";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { getAuthBearerToken } from "@/lib/auth-token";
import {
  isAtLeastAgeYears,
  isValidDateOnly,
  SELF_ATHLETE_MIN_AGE_YEARS,
} from "@/lib/date-of-birth";
import type { AthleteAccessRole } from "@/lib/types";

export type OnboardingActionState = {
  error?: string;
  success?: boolean;
};

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

async function actionError(error: unknown): Promise<OnboardingActionState> {
  return { error: passthroughOrGeneric(error, (await getActionMessages()).generic) };
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readRelationshipToAthlete(formData: FormData): AthleteAccessRole | null {
  const value = readString(formData, "relationshipToAthlete");
  if (value === "parent" || value === "athlete") {
    return value;
  }
  return null;
}

export async function createAthleteBasicsAction(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { error: actions.signInAgain };
  }

  const focusSportId = readString(formData, "focusSportId");
  const relationshipToAthlete = readRelationshipToAthlete(formData);
  const name = readString(formData, "name");
  const dateOfBirth = readString(formData, "dateOfBirth");

  if (!focusSportId) {
    return { error: actions.focusSportRequired };
  }

  if (!relationshipToAthlete) {
    return { error: actions.chooseWhoFor };
  }

  if (!name) {
    return { error: actions.athleteNameRequired };
  }

  if (!dateOfBirth) {
    return { error: actions.dateOfBirthRequired };
  }

  if (!isValidDateOnly(dateOfBirth)) {
    return { error: actions.dateOfBirthInvalid };
  }

  if (
    relationshipToAthlete === "athlete" &&
    !isAtLeastAgeYears(dateOfBirth, SELF_ATHLETE_MIN_AGE_YEARS)
  ) {
    return {
      error: actions.selfCreateMinAge(SELF_ATHLETE_MIN_AGE_YEARS),
    };
  }

  try {
    const athlete = await createAthlete(token, {
      relationshipToAthlete,
      focusSportId,
      name,
      dateOfBirth,
    });

    redirect(dashboardHref(athlete.id));
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }

    return await actionError(error);
  }
}
