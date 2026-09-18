const tokenCountFormatter = new Intl.NumberFormat("en-US");
const usagePeriodFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatTokenCount(value: number): string {
  return tokenCountFormatter.format(value);
}

export function usageBarPercent(used: number, limit: number): number {
  if (limit <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((used / limit) * 100));
}

export function formatUsagePeriod(periodStartIso: string): string {
  return usagePeriodFormatter.format(new Date(periodStartIso));
}
