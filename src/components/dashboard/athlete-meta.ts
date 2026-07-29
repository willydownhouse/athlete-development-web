import type { Athlete } from "@/lib/types";

export function athleteInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
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

function ageGroupFromDateOfBirth(dateOfBirth: string | null): string | null {
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

function positionFromProfile(athlete: Athlete): string | null {
  const data = athlete.profile?.sportSpecificData;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const position = (data as Record<string, unknown>).position;

  return typeof position === "string" && position.trim() ? position.trim() : null;
}

export function athleteSubtitle(athlete: Athlete, eventsThisWeek: number): string {
  const level = athlete.profile?.level?.trim() || ageGroupFromDateOfBirth(athlete.dateOfBirth);
  const position = positionFromProfile(athlete);
  const identity = [level, position].filter(Boolean).join(" ");
  const eventsLabel = `${eventsThisWeek} event${eventsThisWeek === 1 ? "" : "s"} this week`;

  return identity ? `${identity} · ${eventsLabel}` : eventsLabel;
}
