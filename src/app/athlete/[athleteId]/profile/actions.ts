"use server";

import { revalidatePath } from "next/cache";

import { athleteProfileHref, dashboardHref } from "@/components/dashboard/dashboard-nav";
import { updateAthlete } from "@/lib/api";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { getAuthBearerToken } from "@/lib/auth-token";
import {
  isAtLeastAgeYears,
  isValidDateOnly,
  SELF_ATHLETE_MIN_AGE_YEARS,
} from "@/lib/date-of-birth";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";

export type ProfileActionState = {
  error?: string;
  success?: string;
};

async function actionError(error: unknown): Promise<ProfileActionState> {
  return { error: passthroughOrGeneric(error, (await getActionMessages()).generic) };
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateAthleteProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const [token, locale] = await Promise.all([getAuthBearerToken(), getRequestLocale()]);
  const messages = getMessages(locale);
  const actions = messages.actions;

  if (!token) {
    return { error: actions.signInAgain };
  }

  const athleteId = readString(formData, "athleteId");
  const name = readString(formData, "athleteName");
  const dateOfBirth = readString(formData, "dateOfBirth");
  const relationshipToAthlete = readString(formData, "relationshipToAthlete");

  if (!athleteId) {
    return { error: actions.athleteRequired };
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
    return { error: messages.onboarding.minAgeHint(SELF_ATHLETE_MIN_AGE_YEARS) };
  }

  try {
    await updateAthlete(token, athleteId, {
      name,
      dateOfBirth,
    });
    revalidatePath(athleteProfileHref(athleteId));
    revalidatePath(dashboardHref(athleteId));
    return { success: actions.profileSaved };
  } catch (error) {
    return await actionError(error);
  }
}
