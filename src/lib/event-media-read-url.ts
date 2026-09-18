export const EVENT_MEDIA_READ_URL_REFRESH_LEAD_MS = 30_000;
export const EVENT_MEDIA_READ_URL_REFRESH_CHECK_MS = 10_000;

export type EventMediaReadUrlExpiry = {
  readExpiresAt: string;
  posterExpiresAt: string | null;
};

function eventMediaReadAssetsExpiresAtMs(assets: EventMediaReadUrlExpiry): number {
  const readExpiresAtMs = Date.parse(assets.readExpiresAt);
  const posterExpiresAtMs = assets.posterExpiresAt
    ? Date.parse(assets.posterExpiresAt)
    : Number.POSITIVE_INFINITY;

  return Math.min(readExpiresAtMs, posterExpiresAtMs);
}

export function msUntilEventMediaReadUrlRefresh(
  assets: EventMediaReadUrlExpiry,
  nowMs = Date.now(),
  leadMs = EVENT_MEDIA_READ_URL_REFRESH_LEAD_MS,
): number {
  const expiresAtMs = eventMediaReadAssetsExpiresAtMs(assets);

  if (!Number.isFinite(expiresAtMs)) {
    return 0;
  }

  return Math.max(0, expiresAtMs - leadMs - nowMs);
}

export function shouldRefreshEventMediaReadUrl(
  assets: EventMediaReadUrlExpiry,
  nowMs = Date.now(),
): boolean {
  return msUntilEventMediaReadUrlRefresh(assets, nowMs) <= 0;
}
