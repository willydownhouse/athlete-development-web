import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { OnboardingView } from "@/components/onboarding/onboarding-view";
import { fetchAthletes, fetchCurrentAppUser } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const token = await getAuthBearerToken();

  let isAdmin = false;
  let athletesLoaded = false;

  if (token) {
    const [athletesResult, appUserResult] = await Promise.allSettled([
      fetchAthletes(token),
      fetchCurrentAppUser(token),
    ]);

    if (athletesResult.status === "fulfilled") {
      athletesLoaded = true;

      if (athletesResult.value.length > 0) {
        redirect("/dashboard");
      }
    }

    if (appUserResult.status === "fulfilled") {
      isAdmin = appUserResult.value.role === "admin";
    }
  }

  return (
    <OnboardingView
      userEmail={session.user.email ?? ""}
      userName={session.user.name}
      isAdmin={isAdmin}
      loadError={athletesLoaded ? null : "Unable to verify athlete status"}
    />
  );
}
