const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isAthleteMediaRouteId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function athleteMediaContentUpstreamPath(
  athleteId: string,
  mediaId: string,
  searchParams?: Pick<URLSearchParams, "get">,
): string {
  const path = `/api/athletes/${encodeURIComponent(athleteId)}/media/${encodeURIComponent(mediaId)}/content`;
  const variant = searchParams?.get("variant");

  if (!variant) {
    return path;
  }

  return `${path}?${new URLSearchParams({ variant }).toString()}`;
}

export function athleteMediaAvatarUrl(contentUrl: string): string {
  const url = new URL(contentUrl, "https://athlete.invalid");
  url.searchParams.set("variant", "avatar");
  return `${url.pathname}${url.search}`;
}

export function athleteMediaContentResponseHeaders(upstream: Headers): Headers {
  const headers = new Headers();
  const contentType = upstream.get("content-type");
  const cacheControl = upstream.get("cache-control");
  const etag = upstream.get("etag");
  const contentLength = upstream.get("content-length");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (cacheControl) {
    headers.set("Cache-Control", cacheControl);
  }

  if (etag) {
    headers.set("ETag", etag);
  }

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return headers;
}
