import { Skeleton } from "@/components/ui/skeleton";
import { loadMonthlyUsage } from "@/lib/load-monthly-usage";
import { formatTokenCount, formatUsagePeriod, usageBarPercent } from "@/lib/usage-display";
import type { MonthlyUsage } from "@/lib/types";

export function UsageMetersSkeleton() {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
      <Skeleton className="h-4 w-40" />
      <div className="mt-5 space-y-5">
        <UsageBarSkeleton />
        <UsageBarSkeleton />
      </div>
    </section>
  );
}

function UsageBarSkeleton() {
  return (
    <div>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-2 h-2 w-full rounded-full" />
      <Skeleton className="mt-2 h-3.5 w-24" />
    </div>
  );
}

export async function UsageMeters() {
  const result = await loadMonthlyUsage();

  if (!result.usage) {
    return <UsageMetersError message={result.error} />;
  }

  return <UsageMetersCard usage={result.usage} />;
}

function UsageMetersError({ message }: { message: string }) {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
      <p className="text-sm text-red-300">{message}</p>
    </section>
  );
}

function UsageMetersCard({ usage }: { usage: MonthlyUsage }) {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-white sm:text-base">This month</h2>
        <p className="text-sm text-zinc-400">{formatUsagePeriod(usage.periodStart)}</p>
      </div>

      {usage.limitReached ? (
        <p className="mt-2 text-sm text-[#f0d4a8]">{"You've reached this month's chat limit."}</p>
      ) : null}

      <div className="mt-5 space-y-5">
        <UsageUnitBar
          label="Input tokens"
          used={usage.inputTokens.used}
          limit={usage.inputTokens.limit}
          remaining={usage.inputTokens.remaining}
        />
        <UsageUnitBar
          label="Output tokens"
          used={usage.outputTokens.used}
          limit={usage.outputTokens.limit}
          remaining={usage.outputTokens.remaining}
        />
      </div>
    </section>
  );
}

function UsageUnitBar({
  label,
  used,
  limit,
  remaining,
}: {
  label: string;
  used: number;
  limit: number;
  remaining: number;
}) {
  const percent = usageBarPercent(used, limit);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-sm text-zinc-400">
          {formatTokenCount(used)} / {formatTokenCount(limit)}
        </p>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="h-full rounded-full bg-[#9ec9e8]" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-zinc-500">{formatTokenCount(remaining)} remaining</p>
    </div>
  );
}
