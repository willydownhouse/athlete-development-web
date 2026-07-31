"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import {
  ApiError,
  completeOnboardingSession,
  createAthlete,
  startOnboardingSession,
  upsertOnboardingAnswer,
} from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";

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
  const t = await getTranslations("errors");

  if (error instanceof ApiError) {
    return { error: error.apiError ?? error.message };
  }

  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: t("generic") };
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalInt(formData: FormData, key: string): number | undefined {
  const value = readString(formData, key);
  if (value === "") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function readOptionalDate(formData: FormData, key: string): string | undefined {
  const value = readString(formData, key);
  return value === "" ? undefined : value;
}

export async function createAthleteBasicsAction(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const tErrors = await getTranslations("errors");
  const tValidation = await getTranslations("onboarding.validation");
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: tErrors("signInRequired") };
  }

  const focusSportId = readString(formData, "focusSportId");
  const name = readString(formData, "name");

  if (!focusSportId) {
    return { error: tValidation("focusSportRequired") };
  }

  if (!name) {
    return { error: tValidation("athleteNameRequired") };
  }

  try {
    const athlete = await createAthlete(token, {
      focusSportId,
      name,
      dateOfBirth: readOptionalDate(formData, "dateOfBirth"),
      heightCm: readOptionalInt(formData, "heightCm"),
      weightKg: readOptionalInt(formData, "weightKg"),
    });

    const session = await startOnboardingSession(token, athlete.id);

    redirect(
      `/onboarding/questions?athleteId=${encodeURIComponent(athlete.id)}&sessionId=${encodeURIComponent(session.id)}&sportId=${encodeURIComponent(focusSportId)}`,
    );
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }

    return actionError(error);
  }
}

export async function saveOnboardingAnswerAction(input: {
  athleteId: string;
  sessionId: string;
  questionId: string;
  rawAnswer: string;
  structuredValue?: unknown;
  required: boolean;
}): Promise<OnboardingActionState> {
  const tErrors = await getTranslations("errors");
  const tValidation = await getTranslations("onboarding.validation");
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: tErrors("signInRequired") };
  }

  const rawAnswer = input.rawAnswer.trim();

  if (input.required && rawAnswer === "") {
    return { error: tValidation("answerRequired") };
  }

  try {
    if (rawAnswer !== "") {
      await upsertOnboardingAnswer(token, input.athleteId, input.sessionId, {
        questionId: input.questionId,
        rawAnswer,
        structuredValue: input.structuredValue,
      });
    }

    return { success: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function completeOnboardingAction(input: {
  athleteId: string;
  sessionId: string;
}): Promise<OnboardingActionState> {
  const tErrors = await getTranslations("errors");
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: tErrors("signInRequired") };
  }

  try {
    await completeOnboardingSession(token, input.athleteId, input.sessionId);
    redirect(dashboardHref(input.athleteId));
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }

    return actionError(error);
  }
}
