import { getTranslations } from "next-intl/server";

import { signOutAction } from "@/app/actions/auth";

type SignOutButtonProps = {
  className?: string;
};

export async function SignOutButton({
  className = "rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100",
}: SignOutButtonProps) {
  const t = await getTranslations("auth");

  return (
    <form action={signOutAction}>
      <button type="submit" className={className}>
        {t("signOut")}
      </button>
    </form>
  );
}
