"use server";

import { redirect } from "next/navigation";

import { dashboardHref } from "@/components/dashboard/dashboard-nav";
import { ApiError, createAthlete } from "@/lib/api";
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

    redirect(dashboardHref(athlete.id));
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }

    return actionError(error);
  }
}
