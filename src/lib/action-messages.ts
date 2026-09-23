import { ApiError } from "@/lib/api";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages, type Messages } from "@/lib/messages";

export async function getActionMessages(): Promise<Messages["actions"]> {
  return getMessages(await getRequestLocale()).actions;
}

/** Keep API/Error messages as-is; use the localized generic only when there is no message. */
export function passthroughOrGeneric(error: unknown, generic: string): string {
  if (error instanceof ApiError) {
    return error.apiError ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return generic;
}
