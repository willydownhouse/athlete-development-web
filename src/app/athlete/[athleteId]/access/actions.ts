"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { athleteAccessHref, defaultDashboardHref } from "@/components/dashboard/dashboard-nav";
import {
  createAthleteInvitation,
  endAthleteAccessGrant,
  fetchAthletes,
  revokeAthleteInvitation,
} from "@/lib/api";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getRequestLocale } from "@/lib/locale-server";
import type { AthleteAccessRole } from "@/lib/types";

export type AccessActionState = {
  error?: string;
  success?: string;
  formKey?: string;
};

async function actionError(error: unknown): Promise<AccessActionState> {
  return { error: passthroughOrGeneric(error, (await getActionMessages()).generic) };
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
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { error: actions.signInAgain };
  }

  const athleteId = readString(formData, "athleteId");
  const email = readString(formData, "email");
  const role = readRole(formData);

  if (!athleteId) {
    return { error: actions.athleteRequired };
  }

  if (!email) {
    return { error: actions.emailRequired };
  }

  if (!role) {
    return { error: actions.chooseParentOrAthlete };
  }

  try {
    await createAthleteInvitation(token, athleteId, { email, role });
    revalidatePath(athleteAccessHref(athleteId));
    return { success: actions.invitationSent, formKey: crypto.randomUUID() };
  } catch (error) {
    return await actionError(error);
  }
}

export async function revokeAthleteInvitationAction(
  _prevState: AccessActionState,
  formData: FormData,
): Promise<AccessActionState> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { error: actions.signInAgain };
  }

  const athleteId = readString(formData, "athleteId");
  const invitationId = readString(formData, "invitationId");

  if (!athleteId || !invitationId) {
    return { error: actions.invitationMissing };
  }

  try {
    await revokeAthleteInvitation(token, athleteId, invitationId);
    revalidatePath(athleteAccessHref(athleteId));
    return {};
  } catch (error) {
    return await actionError(error);
  }
}

export async function endAthleteAccessGrantAction(
  _prevState: AccessActionState,
  formData: FormData,
): Promise<AccessActionState> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { error: actions.signInAgain };
  }

  const athleteId = readString(formData, "athleteId");
  const accessId = readString(formData, "accessId");

  if (!athleteId || !accessId) {
    return { error: actions.accessGrantMissing };
  }

  try {
    await endAthleteAccessGrant(token, athleteId, accessId);
  } catch (error) {
    return await actionError(error);
  }

  let athletes: Awaited<ReturnType<typeof fetchAthletes>> = [];

  try {
    athletes = await fetchAthletes(token, await getRequestLocale());
  } catch {
    redirect("/dashboard");
  }

  if (!athletes.some((athlete) => athlete.id === athleteId)) {
    redirect(defaultDashboardHref(athletes));
  }

  revalidatePath(athleteAccessHref(athleteId));
  return {};
}
