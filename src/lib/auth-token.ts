import { getToken } from "@auth/core/jwt";
import { cookies } from "next/headers";

import { getAuthSessionCookieName, shouldUseSecureAuthCookie } from "./auth-cookie";

export async function getAuthBearerToken(): Promise<string | null> {
  const secret = process.env["AUTH_SECRET"];

  if (!secret) {
    return null;
  }

  const cookieStore = await cookies();
  const cookieName = getAuthSessionCookieName();
  const token = await getToken({
    req: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
    secret,
    secureCookie: shouldUseSecureAuthCookie(),
    cookieName,
    salt: cookieName,
    raw: true,
  });

  return typeof token === "string" ? token : null;
}
