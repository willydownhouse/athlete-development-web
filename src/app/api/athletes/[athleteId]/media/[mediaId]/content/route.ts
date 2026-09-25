import { getApiBaseUrl } from "@/lib/api";
import {
  athleteMediaContentResponseHeaders,
  athleteMediaContentUpstreamPath,
  isAthleteMediaRouteId,
} from "@/lib/athlete-media-content";
import { getAuthBearerToken } from "@/lib/auth-token";

export async function GET(
  request: Request,
  context: { params: Promise<{ athleteId: string; mediaId: string }> },
) {
  const token = await getAuthBearerToken();

  if (!token) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { athleteId, mediaId } = await context.params;

  if (!isAthleteMediaRouteId(athleteId) || !isAthleteMediaRouteId(mediaId)) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  const ifNoneMatch = request.headers.get("if-none-match");
  const headers = new Headers({
    Authorization: `Bearer ${token}`,
  });

  if (ifNoneMatch) {
    headers.set("If-None-Match", ifNoneMatch);
  }

  const upstream = await fetch(
    `${getApiBaseUrl()}${athleteMediaContentUpstreamPath(
      athleteId,
      mediaId,
      new URL(request.url).searchParams,
    )}`,
    {
      headers,
      cache: "no-store",
    },
  );

  if (upstream.status === 304) {
    return new Response(null, {
      status: 304,
      headers: athleteMediaContentResponseHeaders(upstream.headers),
    });
  }

  if (!upstream.ok) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: athleteMediaContentResponseHeaders(upstream.headers),
  });
}
