import { signIn } from "@/auth";

export function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/onboarding" });
      }}
    >
      <button
        type="submit"
        className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Continue with Google
      </button>
    </form>
  );
}
