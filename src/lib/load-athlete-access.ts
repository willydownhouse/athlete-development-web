import { fetchAthleteAccess, fetchCurrentAppUser } from "@/lib/api";
import { getActionMessages, passthroughOrGeneric } from "@/lib/action-messages";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { AthleteAccessMember, AthleteInvitation } from "@/lib/types";

export type AthleteAccessResult =
  | {
      members: AthleteAccessMember[];
      invitations: AthleteInvitation[];
      currentUserId: string;
      error?: undefined;
    }
  | {
      members: [];
      invitations: [];
      currentUserId: null;
      error: string;
    };

export async function loadAthleteAccess(athleteId: string): Promise<AthleteAccessResult> {
  const [token, actions] = await Promise.all([getAuthBearerToken(), getActionMessages()]);

  if (!token) {
    return {
      members: [],
      invitations: [],
      currentUserId: null,
      error: actions.loadAccess,
    };
  }

  try {
    const [access, currentUser] = await Promise.all([
      fetchAthleteAccess(token, athleteId),
      fetchCurrentAppUser(token),
    ]);

    return {
      members: access.members,
      invitations: access.invitations,
      currentUserId: currentUser.id,
    };
  } catch (error) {
    return {
      members: [],
      invitations: [],
      currentUserId: null,
      error: passthroughOrGeneric(error, actions.loadAccess),
    };
  }
}
