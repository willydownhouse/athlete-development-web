const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export function inclusivePeriodEnd(periodEnd: string): string {
  const match = dateOnlyPattern.exec(periodEnd);
  if (!match?.[1] || !match[2] || !match[3]) {
    return periodEnd;
  }

  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  date.setUTCDate(date.getUTCDate() - 1);

  return date.toISOString().slice(0, 10);
}
