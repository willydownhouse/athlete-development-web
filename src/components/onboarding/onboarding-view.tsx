import { OnboardingShell } from "./onboarding-shell";
import { SportSelect } from "./sport-select";
import type { Athlete, Sport } from "@/lib/types";
import { AppShellAdminNavLink } from "@/components/app-shell-admin-nav-link";

type OnboardingViewProps = {
  userEmail: string;
  userName?: string | null;
  sports: Sport[];
  loadError?: string | null;
  athletes: Athlete[];
};

export function OnboardingView({
  userEmail,
  userName,
  sports,
  loadError,
  athletes,
}: OnboardingViewProps) {
  const greetingName = userName?.trim().split(/\s+/)[0];

  return (
    <OnboardingShell
      userEmail={userEmail}
      adminNavLink={<AppShellAdminNavLink />}
      athletes={athletes}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:max-w-3xl lg:px-10 lg:py-16">
        <section className="space-y-8 lg:space-y-10">
          <div>
            <p className="text-sm text-zinc-400 lg:text-base">
              Welcome{greetingName ? `, ${greetingName}` : ""}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:mt-3 lg:text-5xl lg:leading-[1.1]">
              Let&apos;s set up your athlete profile
            </h1>
            <div className="mt-4 max-w-2xl space-y-3 text-[15px] leading-relaxed text-zinc-300 lg:mt-6 lg:space-y-4 lg:text-base lg:leading-7">
              <p>
                This setup creates the starting point for your athlete profile and long-term
                development memory.
              </p>
              <p>
                The more useful context you share with us — training, recovery, and everyday
                observations — the better we can support your athlete&apos;s journey.
              </p>
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
