import { AppShell } from "@/components/app-shell";
import { getIsAdminUser } from "@/lib/is-admin-user";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import type { Athlete, Sport } from "@/lib/types";

import { SportSelect } from "./sport-select";

type OnboardingViewProps = {
  userEmail: string;
  userName?: string | null;
  sports: Sport[];
  loadError?: string | null;
  athletes: Athlete[];
};

export async function OnboardingView({
  userEmail,
  userName,
  sports,
  loadError,
  athletes,
}: OnboardingViewProps) {
  const greetingName = userName?.trim().split(/\s+/)[0];
  const [isAdmin, locale] = await Promise.all([getIsAdminUser(), getRequestLocale()]);
  const messages = getMessages(locale);

  return (
    <AppShell userEmail={userEmail} isAdmin={isAdmin} athletes={athletes}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:max-w-3xl lg:px-10 lg:py-16">
        <section className="space-y-8 lg:space-y-10">
          <div>
            <p className="text-sm text-zinc-400 lg:text-base">
              {greetingName
                ? messages.dashboard.welcomeNamed(greetingName)
                : messages.dashboard.welcome}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:mt-3 lg:text-3xl">
              {messages.onboarding.setupTitle}
            </h1>
            <div className="mt-4 max-w-2xl space-y-3 text-[15px] leading-relaxed text-zinc-300 lg:mt-6 lg:space-y-4 lg:text-base lg:leading-7">
              <p>{messages.onboarding.setupBody1}</p>
              <p>{messages.onboarding.setupBody2}</p>
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
    </AppShell>
  );
}
