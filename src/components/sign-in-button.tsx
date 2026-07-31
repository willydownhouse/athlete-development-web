import { getTranslations } from "next-intl/server";

import { signIn } from "@/auth";

type SignInButtonProps = {
  className?: string;
};

export async function SignInButton({
  className = "rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700",
}: SignInButtonProps) {
  const t = await getTranslations("auth");

  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/onboarding" });
      }}
    >
      <button type="submit" className={className}>
        {t("continueWithGoogle")}
      </button>
    </form>
  );
}
