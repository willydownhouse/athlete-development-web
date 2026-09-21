import { redirect } from "next/navigation";
import { cache } from "react";

import { fetchCurrentAppUser } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import { isDemoAccessDenied } from "@/lib/demo-access";

export const assertApiAccess = cache(async (): Promise<void> => {
  const token = await getAuthBearerToken();

  if (!token) {
    return;
  }

  try {
    await fetchCurrentAppUser(token);
  } catch (error) {
    if (isDemoAccessDenied(error)) {
      redirect("/unavailable");
    }
  }
});
