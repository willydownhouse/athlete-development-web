export const SELF_ATHLETE_MIN_AGE_YEARS = 13;

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isAtLeastAgeYears(
  dateOfBirth: string,
  minAgeYears: number,
  now = new Date(),
): boolean {
  if (!dateOnlyPattern.test(dateOfBirth)) {
    return false;
  }

  const birthDate = new Date(`${dateOfBirth}T00:00:00.000Z`);

  if (Number.isNaN(birthDate.getTime())) {
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

export function latestSelfAthleteBirthDate(now = new Date()): Date {
  return new Date(now.getFullYear() - SELF_ATHLETE_MIN_AGE_YEARS, now.getMonth(), now.getDate());
}
