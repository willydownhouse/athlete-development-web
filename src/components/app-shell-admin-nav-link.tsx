import { Suspense } from "react";

import Link from "next/link";

import { navLinkClass } from "@/components/app-shell-nav-styles";
import { fetchCurrentAppUser } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";

async function AdminNavLinkContent() {
  const token = await getAuthBearerToken();

  if (!token) {
    return null;
  }

  try {
    const appUser = await fetchCurrentAppUser(token);

    if (appUser.role !== "admin") {
      return null;
    }
  } catch {
    return null;
  }

  return (
    <Link href="/admin" className={navLinkClass(false)}>
      Admin
    </Link>
  );
}

export function AppShellAdminNavLink() {
  return (
    <Suspense fallback={null}>
      <AdminNavLinkContent />
    </Suspense>
  );
}
