import { ApiError, fetchInvitationInbox } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { AthleteInvitation } from "@/lib/types";

export type InvitationInboxResult =
  { invitations: AthleteInvitation[]; error?: undefined } | { invitations: []; error: string };

export async function loadInvitationInbox(): Promise<InvitationInboxResult> {
  const token = await getAuthBearerToken();

  if (!token) {
    return { invitations: [], error: "Unable to load invitations" };
  }

  try {
    const invitations = await fetchInvitationInbox(token);
    return { invitations };
  } catch (error) {
    if (error instanceof ApiError) {
      return { invitations: [], error: error.apiError ?? error.message };
    }

    if (error instanceof Error) {
      return { invitations: [], error: error.message };
    }

    return { invitations: [], error: "Unable to load invitations" };
  }
}

export async function loadPendingInviteCount(): Promise<number> {
  const result = await loadInvitationInbox();
  return result.error ? 0 : result.invitations.length;
}
