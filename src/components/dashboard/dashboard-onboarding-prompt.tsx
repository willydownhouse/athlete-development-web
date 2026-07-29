import Link from "next/link";

export function DashboardOnboardingPrompt() {
  return (
    <section className="space-y-8 lg:space-y-10">
      <div>
        <p className="text-sm text-zinc-400 lg:text-base">Welcome</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:mt-3 lg:text-5xl lg:leading-[1.1]">
          Dashboard is still empty
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-300 lg:mt-6 lg:text-base lg:leading-7">
          This dashboard fills in once you have an athlete profile. Head to onboarding to add your
          first athlete and get started.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:p-5 lg:p-6">
        <p className="text-sm font-medium text-zinc-300 lg:text-base">Get started</p>
        <Link
          href="/onboarding"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-3 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] lg:py-3.5 lg:text-base"
        >
          Go to onboarding
        </Link>
      </div>
    </section>
  );
}
