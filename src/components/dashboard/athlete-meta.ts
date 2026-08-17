export function athleteInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  const firstPart = parts[0];

  if (!firstPart) {
    return "?";
  }

  if (parts.length === 1) {
    return firstPart.slice(0, 2).toUpperCase();
  }

  const lastPart = parts.at(-1) ?? firstPart;

  return `${firstPart[0] ?? ""}${lastPart[0] ?? ""}`.toUpperCase();
}

function ageFromDateOfBirth(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export function ageGroupFromDateOfBirth(dateOfBirth: string | null): string | null {
  const age = ageFromDateOfBirth(dateOfBirth);

  if (age === null) {
    return null;
  }

  if (age < 7) {
    return `U${age + 1}`;
  }

  if (age <= 18) {
    return `U${age}`;
  }

  return null;
}

export function athleteEventsThisWeekLabel(eventsThisWeek: number): string {
  return `${eventsThisWeek} event${eventsThisWeek === 1 ? "" : "s"} this week`;
}
