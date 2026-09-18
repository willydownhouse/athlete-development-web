export function UsagePlanCard() {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-400">Current plan</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-white">Free</p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex shrink-0 cursor-not-allowed items-center justify-center rounded-xl bg-[#b7d7ec]/50 px-4 py-2.5 text-sm font-medium text-[#1a2430]/60"
        >
          Upgrade plan
        </button>
      </div>
    </section>
  );
}
