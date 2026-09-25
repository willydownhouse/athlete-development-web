import { athleteMediaAvatarUrl } from "@/lib/athlete-media-content";
import { getAuthBearerToken } from "@/lib/auth-token";
import { loadAthleteProfileMedia } from "@/lib/load-athlete-profile-media";

export async function loadAthleteAvatarUrl(athleteId: string): Promise<string | null> {
  const token = await getAuthBearerToken();

  if (!token) {
    return null;
  }

  try {
    const media = await loadAthleteProfileMedia(token, athleteId);

    if (media?.status !== "ready" || !media.contentUrl) {
      return null;
    }

    return athleteMediaAvatarUrl(media.contentUrl);
  } catch {
    return null;
  }
}

export async function loadAthleteAvatarUrls(athleteIds: string[]): Promise<Record<string, string>> {
  const urls = await Promise.all(
    athleteIds.map(
      async (athleteId) => [athleteId, await loadAthleteAvatarUrl(athleteId)] as const,
    ),
  );

  return Object.fromEntries(urls.filter((entry): entry is [string, string] => entry[1] !== null));
}
