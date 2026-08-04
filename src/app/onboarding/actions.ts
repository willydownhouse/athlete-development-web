"use server";

import { redirect } from "next/navigation";

import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import { onboardingSessionPageHref } from "@/components/onboarding/onboarding-session-nav";
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

function actionError(error: unknown): OnboardingActionState {
  if (error instanceof ApiError) {
    return { error: error.apiError ?? error.message };
  }

  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: "Something went wrong" };
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalDate(formData: FormData, key: string): string | undefined {
  const value = readString(formData, key);
  return value === "" ? undefined : value;
}

export async function createAthleteBasicsAction(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const focusSportId = readString(formData, "focusSportId");
  const name = readString(formData, "name");

  if (!focusSportId) {
    return { error: "Focus sport is required" };
  }

  if (!name) {
    return { error: "Athlete name is required" };
  }

  try {
    const athlete = await createAthlete(token, {
      focusSportId,
      name,
      dateOfBirth: readOptionalDate(formData, "dateOfBirth"),
    });

    const session = await startOnboardingSession(token, athlete.id);

    redirect(onboardingSessionPageHref(session.id));
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
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const rawAnswer = input.rawAnswer.trim();

  if (input.required && rawAnswer === "") {
    return { error: "Please answer this question to continue" };
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
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
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
