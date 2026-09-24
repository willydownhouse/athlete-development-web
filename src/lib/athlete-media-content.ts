const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isAthleteMediaRouteId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function athleteMediaContentUpstreamPath(athleteId: string, mediaId: string): string {
  return `/api/athletes/${encodeURIComponent(athleteId)}/media/${encodeURIComponent(mediaId)}/content`;
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
