import { ApiError } from "@/lib/api";

export const DEMO_ACCESS_DENIED_MESSAGE = "Access is currently limited to demo users";
export const DEMO_SUPPORT_EMAIL = "support@athletedevcenter.com";

export function isDemoAccessDenied(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 403 &&
    error.apiError === DEMO_ACCESS_DENIED_MESSAGE
  );
}
