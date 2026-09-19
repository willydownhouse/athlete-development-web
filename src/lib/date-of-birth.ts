export const SELF_ATHLETE_MIN_AGE_YEARS = 13;

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseNumber(value: string): number {
  return Number.parseInt(value, 10);
}

function parseDateOnly(value: string): Date | null {
  const match = dateOnlyPattern.exec(value);

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] = match;

  if (!yearText || !monthText || !dayText) {
    return null;
  }

  const year = parseNumber(yearText);
  const month = parseNumber(monthText);
  const day = parseNumber(dayText);
  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function isValidDateOnly(value: string): boolean {
  return parseDateOnly(value) !== null;
}

export function isAtLeastAgeYears(
  dateOfBirth: string,
  minAgeYears: number,
  now = new Date(),
): boolean {
  const birthDate = parseDateOnly(dateOfBirth);

  if (!birthDate) {
    return false;
  }

  const age =
    now.getUTCFullYear() -
    birthDate.getUTCFullYear() -
    (now.getUTCMonth() < birthDate.getUTCMonth() ||
    (now.getUTCMonth() === birthDate.getUTCMonth() && now.getUTCDate() < birthDate.getUTCDate())
      ? 1
      : 0);

  return age >= minAgeYears;
}

function utcDateOnlyAsLocalDate(year: number, monthIndex: number, day: number): Date {
  const date = new Date(year, monthIndex, day);

  if (date.getFullYear() !== year || date.getMonth() !== monthIndex || date.getDate() !== day) {
    return new Date(year, monthIndex + 1, 0);
  }

  return date;
}

export function latestSelfAthleteBirthDate(now = new Date()): Date {
  return utcDateOnlyAsLocalDate(
    now.getUTCFullYear() - SELF_ATHLETE_MIN_AGE_YEARS,
    now.getUTCMonth(),
    now.getUTCDate(),
  );
}
