import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignInButton } from "@/components/sign-in-button";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium tracking-wide text-slate-500">
          Athlete Development Service
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Sign in to continue
        </h1>
        <p className="text-base leading-7 text-slate-600">
          Use your Google account to open the athlete dashboard.
        </p>
      </div>

      <SignInButton />
    </main>
  );
}
