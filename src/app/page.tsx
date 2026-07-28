import { redirect } from "next/navigation";
import { Oswald } from "next/font/google";

import { auth } from "@/auth";
import { SignInButton } from "@/components/sign-in-button";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen bg-[#0b0d10] text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(183,215,236,0.18),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(95,115,136,0.22),transparent_50%),radial-gradient(ellipse_50%_40%_at_0%_80%,rgba(111,143,106,0.12),transparent_45%)]" />
        <div className="landing-grid absolute inset-0 opacity-[0.35]" />
        <div className="landing-glow absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[#b7d7ec]/10 blur-3xl" />
        <div className="landing-glow-delayed absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-[#5f7388]/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="landing-fade-up space-y-6">
          <h1
            className={`${oswald.className} text-[2.75rem] font-semibold uppercase leading-[1.05] tracking-[0.02em] text-white sm:text-6xl md:text-7xl`}
          >
            <span className="block">Athlete</span>
            <span className="block">Development</span>
            <span className="block">Center</span>
          </h1>
          <p className="landing-fade-up-delayed max-w-md text-lg leading-relaxed text-zinc-300 sm:text-xl">
            Only if you take your training seriously.
          </p>
        </div>

        <div className="landing-fade-up-late mt-10">
          <SignInButton className="rounded-full bg-[#b7d7ec] px-7 py-3.5 text-sm font-semibold text-[#1a2430] transition hover:bg-[#c5dff0] hover:shadow-[0_0_40px_rgba(183,215,236,0.25)]" />
        </div>
      </div>
    </main>
  );
}
