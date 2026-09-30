import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { RefreshOnResume } from "@/components/refresh-on-resume";
import { getAuthBearerToken } from "@/lib/auth-token";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { loadShellAthletes } from "@/lib/shell-data";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const token = await getAuthBearerToken();

  if (!token) {
    redirect("/");
  }

  const [athletes, isAdmin] = await Promise.all([loadShellAthletes(token), getIsAdminUser()]);

  return (
    <AppShell userEmail={session.user.email ?? ""} isAdmin={isAdmin} athletes={athletes}>
      <RefreshOnResume />
      {children}
    </AppShell>
  );
}
