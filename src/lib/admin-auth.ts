import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { fetchCurrentAppUser, type AppUser } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";

export async function requireAdmin(): Promise<{ token: string; user: AppUser }> {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const token = await getAuthBearerToken();

  if (!token) {
    redirect("/");
  }

  let user: AppUser;

  try {
    user = await fetchCurrentAppUser(token);
  } catch {
    redirect("/dashboard");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return { token, user };
}
