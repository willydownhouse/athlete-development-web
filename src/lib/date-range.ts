export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isLocalDateString(value: string): boolean {
  if (!LOCAL_DATE_PATTERN.test(value)) {
    return false;
  }

  try {
    parseLocalDateString(value);
    return true;
  } catch {
    return false;
  }
}

export function parseLocalDateString(value: string): Date {
  const match = LOCAL_DATE_PATTERN.exec(value);

  if (!match) {
    throw new Error(`Invalid local date string: ${value}`);
  }

  const year = Number.parseInt(match[1] ?? "", 10);
  const month = Number.parseInt(match[2] ?? "", 10);
  const day = Number.parseInt(match[3] ?? "", 10);

  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export function addLocalMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1, 0, 0, 0, 0);
}
