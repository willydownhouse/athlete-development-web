import { fetchInvitationInbox } from "@/lib/api";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { AthleteInvitation } from "@/lib/types";

export type InvitationInboxResult =
  { invitations: AthleteInvitation[]; error?: undefined } | { invitations: []; error: string };

export async function loadInvitationInbox(): Promise<InvitationInboxResult> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return { invitations: [], error: actions.loadInvitations };
  }

  try {
    const invitations = await fetchInvitationInbox(token);
    return { invitations };
  } catch (error) {
    return { invitations: [], error: passthroughOrGeneric(error, actions.loadInvitations) };
  }
}

export async function loadPendingInviteCount(): Promise<number> {
  const result = await loadInvitationInbox();
  return result.error ? 0 : result.invitations.length;
}
