"use server";

import { revalidatePath } from "next/cache";

import { athleteProfileHref, dashboardHref } from "@/components/dashboard/dashboard-nav";
import {
  completeAthleteMediaUpload,
  createAthleteMediaUploadIntent,
  deleteAthleteMedia,
  getAthleteMedia,
  updateAthlete,
} from "@/lib/api";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { AthleteMediaItem, AthleteMediaUploadIntentResponse } from "@/lib/types";
import { resolveProfileDateOfBirthUpdate, SELF_ATHLETE_MIN_AGE_YEARS } from "@/lib/date-of-birth";
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
  const dateField = formData.get("dateOfBirth");
  const dateOfBirth = typeof dateField === "string" ? dateField.trim() : null;
  const savedDateOfBirth = readString(formData, "savedDateOfBirth");
  const relationshipToAthlete = readString(formData, "relationshipToAthlete");

  if (!athleteId) {
    return { error: actions.athleteRequired };
  }

  if (!name) {
    return { error: actions.athleteNameRequired };
  }

  const dateUpdate = resolveProfileDateOfBirthUpdate({
    dateOfBirth,
    savedDateOfBirth,
    relationshipToAthlete,
  });

  if (dateUpdate.status === "error") {
    if (dateUpdate.error === "required") {
      return { error: actions.dateOfBirthRequired };
    }

    if (dateUpdate.error === "invalid") {
      return { error: actions.dateOfBirthInvalid };
    }

    return { error: messages.onboarding.minAgeHint(SELF_ATHLETE_MIN_AGE_YEARS) };
  }

  try {
    await updateAthlete(token, athleteId, {
      name,
      ...(dateUpdate.status === "include" ? { dateOfBirth: dateUpdate.dateOfBirth } : {}),
    });
    revalidatePath(athleteProfileHref(athleteId));
    revalidatePath(dashboardHref(athleteId));
    return { success: actions.profileSaved };
  } catch (error) {
    return await actionError(error);
  }
}

type ActionError = { error: string };

async function requireToken(): Promise<string | ActionError> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: (await getActionMessages()).signInAgain };
  }

  return token;
}

export async function getAthleteMediaAction(
  athleteId: string,
  mediaId: string,
): Promise<AthleteMediaItem | ActionError> {
  const token = await requireToken();

  if (typeof token !== "string") {
    return token;
  }

  try {
    const media = await getAthleteMedia(token, athleteId, mediaId);

    if (media.status === "ready") {
      revalidatePath(athleteProfileHref(athleteId));
    }

    return media;
  } catch (error) {
    return { error: passthroughOrGeneric(error, (await getActionMessages()).generic) };
  }
}

export async function createAthleteMediaUploadIntentAction(
  athleteId: string,
  body: {
    declaredMimeType: string;
    declaredByteSize: number;
    originalFilename?: string;
  },
): Promise<AthleteMediaUploadIntentResponse | ActionError> {
  const token = await requireToken();

  if (typeof token !== "string") {
    return token;
  }

  try {
    return await createAthleteMediaUploadIntent(token, athleteId, {
      slot: "profile",
      kind: "image",
      declaredMimeType: body.declaredMimeType,
      declaredByteSize: body.declaredByteSize,
      originalFilename: body.originalFilename,
    });
  } catch (error) {
    return { error: passthroughOrGeneric(error, (await getActionMessages()).generic) };
  }
}

export async function completeAthleteMediaUploadAction(
  athleteId: string,
  mediaId: string,
): Promise<{ ok: true } | ActionError> {
  const token = await requireToken();

  if (typeof token !== "string") {
    return token;
  }

  try {
    await completeAthleteMediaUpload(token, athleteId, mediaId);
    return { ok: true };
  } catch (error) {
    return { error: passthroughOrGeneric(error, (await getActionMessages()).generic) };
  }
}

export async function deleteAthleteMediaAction(
  athleteId: string,
  mediaId: string,
): Promise<{ ok: true } | ActionError> {
  const token = await requireToken();

  if (typeof token !== "string") {
    return token;
  }

  try {
    await deleteAthleteMedia(token, athleteId, mediaId);
    revalidatePath(athleteProfileHref(athleteId));
    return { ok: true };
  } catch (error) {
    return { error: passthroughOrGeneric(error, (await getActionMessages()).generic) };
  }
}
