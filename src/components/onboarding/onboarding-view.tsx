import { getTranslations } from "next-intl/server";

import { OnboardingShell } from "./onboarding-shell";
import { SportSelect } from "./sport-select";
import type { Sport, OnboardingSessionSummary } from "@/lib/types";

type OnboardingViewProps = {
  userEmail: string;
  userName?: string | null;
  isAdmin?: boolean;
  sports: Sport[];
  loadError?: string | null;
  onboardingSessions: OnboardingSessionSummary[];
};

export async function OnboardingView({
  userEmail,
  userName,
  isAdmin = false,
  sports,
  loadError,
  onboardingSessions,
}: OnboardingViewProps) {
  const tIntro = await getTranslations("onboarding.intro");
  const tCommon = await getTranslations("common");
  const greetingName = userName?.trim().split(/\s+/)[0];

  return (
    <OnboardingShell
      userEmail={userEmail}
      isAdmin={isAdmin}
      onboardingSessions={onboardingSessions}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:max-w-3xl lg:px-10 lg:py-16">
        <section className="space-y-8 lg:space-y-10">
          <div>
            <p className="text-sm text-zinc-400 lg:text-base">
              {greetingName
                ? tCommon("welcomeWithName", { name: greetingName })
                : tCommon("welcome")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:mt-3 lg:text-5xl lg:leading-[1.1]">
              {tIntro("heading")}
            </h1>
            <div className="mt-4 max-w-2xl space-y-3 text-[15px] leading-relaxed text-zinc-300 lg:mt-6 lg:space-y-4 lg:text-base lg:leading-7">
              <p>{tIntro("paragraph1")}</p>
              <p>{tIntro("paragraph2")}</p>
              <p>{tIntro("paragraph3")}</p>
            </div>
          </div>

          <div>
            {loadError ? (
              <p className="rounded-xl bg-[#2a1717] px-4 py-3 text-sm text-red-300">{loadError}</p>
            ) : (
              <SportSelect sports={sports} />
            )}
          </div>
        </section>
      </div>
    </OnboardingShell>
  );
}
