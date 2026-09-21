"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { dashboardHref, INVITES_HREF } from "@/components/dashboard/dashboard-nav";
import { acceptInvitation, ApiError, declineInvitation } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";

export type InviteActionState = {
  error?: string;
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

function actionError(error: unknown): InviteActionState {
  if (error instanceof ApiError) {
    return { error: error.apiError ?? error.message };
  }

  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: "Something went wrong" };
}

function readInvitationId(formData: FormData): string {
  const value = formData.get("invitationId");
  return typeof value === "string" ? value.trim() : "";
}

export async function acceptInvitationAction(
  _prevState: InviteActionState,
  formData: FormData,
): Promise<InviteActionState> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const invitationId = readInvitationId(formData);

  if (!invitationId) {
    return { error: "Invitation is missing" };
  }

  try {
    const result = await acceptInvitation(token, invitationId);
    revalidatePath(INVITES_HREF);
    redirect(dashboardHref(result.access.athleteId));
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }

    return actionError(error);
  }
}

export async function declineInvitationAction(
  _prevState: InviteActionState,
  formData: FormData,
): Promise<InviteActionState> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { error: "You need to sign in again" };
  }

  const invitationId = readInvitationId(formData);

  if (!invitationId) {
    return { error: "Invitation is missing" };
  }

  try {
    await declineInvitation(token, invitationId);
    revalidatePath(INVITES_HREF);
    return {};
  } catch (error) {
    return actionError(error);
  }
}
