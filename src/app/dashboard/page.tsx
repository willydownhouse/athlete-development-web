import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { fetchCurrentAppUser } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const token = await getAuthBearerToken();
  let appUser = null;
  let apiError: string | null = null;

  if (token) {
    try {
      appUser = await fetchCurrentAppUser(token);
    } catch (error) {
      apiError = error instanceof Error ? error.message : "Unknown API error";
    }
  } else {
    apiError = "Missing Auth.js session token";
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Protected route
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-600">
            This page requires Google sign-in and calls the Fastify API with your Auth.js JWT.
          </p>
        </div>
        <SignOutButton />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Auth.js session</h2>
        <dl className="mt-4 space-y-3 text-sm text-slate-700">
          <div>
            <dt className="font-medium text-slate-500">Name</dt>
            <dd>{session.user.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Email</dt>
            <dd>{session.user.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Auth user id</dt>
            <dd className="break-all">{session.user.id}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Fastify `/api/auth/me`</h2>
        {appUser ? (
          <dl className="mt-4 space-y-3 text-sm text-slate-700">
            <div>
              <dt className="font-medium text-slate-500">App user id</dt>
              <dd className="break-all">{appUser.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Email</dt>
              <dd>{appUser.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Role</dt>
              <dd>{appUser.role}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-red-600">{apiError ?? "Unable to load app user"}</p>
        )}
      </section>

      {appUser?.role === "admin" ? (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900">Admin</h2>
          <p className="mt-2 text-sm text-slate-600">
            Manage sports, event types, and metric definitions.
          </p>
          <Link
            href="/admin"
            className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Open admin dashboard
          </Link>
        </section>
      ) : null}

      <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
        Back to home
      </Link>
    </main>
  );
}
