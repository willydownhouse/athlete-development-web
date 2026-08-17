const DEFAULT_AUTH_SESSION_COOKIE_NAME = "authjs.session-token";
const SECURE_AUTH_SESSION_COOKIE_NAME = "__Secure-authjs.session-token";

export function getAuthSessionCookieName(): string {
  const configuredSalt = process.env["AUTH_TOKEN_SALT"]?.trim();

  if (configuredSalt) {
    return configuredSalt;
  }

  return shouldUseSecureAuthCookie()
    ? SECURE_AUTH_SESSION_COOKIE_NAME
    : DEFAULT_AUTH_SESSION_COOKIE_NAME;
}

export function shouldUseSecureAuthCookie(): boolean {
  const authUrl = process.env["AUTH_URL"] ?? process.env["NEXTAUTH_URL"];

  if (authUrl) {
    return authUrl.startsWith("https://");
  }

  if (process.env["VERCEL_URL"]) {
    return true;
  }

  return process.env["NODE_ENV"] === "production";
}
