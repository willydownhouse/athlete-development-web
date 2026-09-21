import { ApiError, fetchAthleteAccess, fetchCurrentAppUser } from "@/lib/api";
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
  const token = await getAuthBearerToken();

  if (!token) {
    return {
      members: [],
      invitations: [],
      currentUserId: null,
      error: "Unable to load access",
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
    if (error instanceof ApiError) {
      return {
        members: [],
        invitations: [],
        currentUserId: null,
        error: error.apiError ?? error.message,
      };
    }

    if (error instanceof Error) {
      return {
        members: [],
        invitations: [],
        currentUserId: null,
        error: error.message,
      };
    }

    return {
      members: [],
      invitations: [],
      currentUserId: null,
      error: "Unable to load access",
    };
  }
}
