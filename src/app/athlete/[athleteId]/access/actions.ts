"use server";

import { revalidatePath } from "next/cache";

import { athleteAccessHref } from "@/components/dashboard/dashboard-nav";
import {
  ApiError,
  createAthleteInvitation,
  endAthleteAccessGrant,
  revokeAthleteInvitation,
} from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { AthleteAccessRole } from "@/lib/types";

export type AccessActionState = {
  error?: string;
  success?: string;
  formKey?: string;
};

function actionError(error: unknown): AccessActionState {
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

function readRole(formData: FormData): AthleteAccessRole | null {
  const value = readString(formData, "role");
  return value === "parent" || value === "athlete" ? value : null;
}

export async function createAthleteInvitationAction(
  _prevState: AccessActionState,
  formData: FormData,
): Promise<AccessActionState> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const athleteId = readString(formData, "athleteId");
  const email = readString(formData, "email");
  const role = readRole(formData);

  if (!athleteId) {
    return { error: "Athlete is missing" };
  }

  if (!email) {
    return { error: "Email is required" };
  }

  if (!role) {
    return { error: "Choose parent or athlete" };
  }

  try {
    await createAthleteInvitation(token, athleteId, { email, role });
    revalidatePath(athleteAccessHref(athleteId));
    return { success: "Invitation sent", formKey: crypto.randomUUID() };
  } catch (error) {
    return actionError(error);
  }
}

export async function revokeAthleteInvitationAction(
  _prevState: AccessActionState,
  formData: FormData,
): Promise<AccessActionState> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const athleteId = readString(formData, "athleteId");
  const invitationId = readString(formData, "invitationId");

  if (!athleteId || !invitationId) {
    return { error: "Invitation is missing" };
  }

  try {
    await revokeAthleteInvitation(token, athleteId, invitationId);
    revalidatePath(athleteAccessHref(athleteId));
    return {};
  } catch (error) {
    return actionError(error);
  }
}

export async function endAthleteAccessGrantAction(
  _prevState: AccessActionState,
  formData: FormData,
): Promise<AccessActionState> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const athleteId = readString(formData, "athleteId");
  const accessId = readString(formData, "accessId");

  if (!athleteId || !accessId) {
    return { error: "Access grant is missing" };
  }

  try {
    await endAthleteAccessGrant(token, athleteId, accessId);
    revalidatePath(athleteAccessHref(athleteId));
    return {};
  } catch (error) {
    return actionError(error);
  }
}
