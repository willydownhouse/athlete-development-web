import { getToken } from "@auth/core/jwt";
import { cookies } from "next/headers";

export async function getAuthBearerToken(): Promise<string | null> {
  const secret = process.env["AUTH_SECRET"];

  if (!secret) {
    return null;
  }

  const cookieStore = await cookies();
  const token = await getToken({
    req: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
    secret,
    salt: process.env["AUTH_TOKEN_SALT"] ?? "authjs.session-token",
    raw: true,
  });

  return typeof token === "string" ? token : null;
}
