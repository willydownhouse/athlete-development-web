import { OnboardingShell } from "./onboarding-shell";

type OnboardingViewProps = {
  userEmail: string;
  userName?: string | null;
  isAdmin?: boolean;
  loadError?: string | null;
};

export function OnboardingView({
  userEmail,
  userName,
  isAdmin = false,
  loadError,
}: OnboardingViewProps) {
  const greetingName = userName?.trim().split(/\s+/)[0];

  return (
    <OnboardingShell userEmail={userEmail} isAdmin={isAdmin}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <section className="rounded-[1.35rem] bg-[#171b22] px-5 py-8">
          <p className="text-sm text-zinc-400">Welcome{greetingName ? `, ${greetingName}` : ""}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Welcome to athlete onboarding
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-300">
            Next we&apos;ll set up your athlete profile and focus sport. The full onboarding flow is
            coming soon.
          </p>

          {loadError ? (
            <p className="mt-6 rounded-xl bg-[#2a1717] px-4 py-3 text-sm text-red-300">
              {loadError}
            </p>
          ) : null}
        </section>
      </div>
    </OnboardingShell>
  );
}
