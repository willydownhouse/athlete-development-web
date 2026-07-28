import { signOutAction } from "@/app/actions/auth";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({
  className = "rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100",
}: SignOutButtonProps) {
  return (
    <form action={signOutAction}>
      <button type="submit" className={className}>
        Sign out
      </button>
    </form>
  );
}
