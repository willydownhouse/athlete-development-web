import { cache } from "react";

import { fetchCurrentAppUser } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";

export const getIsAdminUser = cache(async (): Promise<boolean> => {
  const token = await getAuthBearerToken();

  if (!token) {
    return false;
  }

  try {
    const appUser = await fetchCurrentAppUser(token);
    return appUser.role === "admin";
  } catch {
    return false;
  }
});
