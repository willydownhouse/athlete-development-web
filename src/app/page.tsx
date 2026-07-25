import Link from "next/link";

import { auth } from "@/auth";
import { SignInButton } from "@/components/sign-in-button";

export default async function HomePage() {
  const session = await auth();

  console.log("session");
  console.log(session);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Hockey App</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
          Build your player&apos;s development memory
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          Sign in with Google to start logging practices, games, and everyday hockey life in one
          place.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {session?.user ? (
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Go to dashboard
          </Link>
        ) : (
          <SignInButton />
        )}
      </div>
    </main>
  );
}
