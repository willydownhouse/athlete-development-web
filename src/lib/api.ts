import type { UserRole } from "./types";

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
}

export async function fetchCurrentAppUser(token: string): Promise<AppUser> {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<AppUser>;
}
