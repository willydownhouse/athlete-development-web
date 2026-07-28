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

function ageGroupFromBirthYear(birthYear: number | null): string | null {
  if (birthYear === null) {
    return null;
  }

  const age = new Date().getFullYear() - birthYear;

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
  const level = athlete.profile?.level?.trim() || ageGroupFromBirthYear(athlete.birthYear);
  const position = positionFromProfile(athlete);
  const identity = [level, position].filter(Boolean).join(" ");
  const eventsLabel = `${eventsThisWeek} event${eventsThisWeek === 1 ? "" : "s"} this week`;

  return identity ? `${identity} · ${eventsLabel}` : eventsLabel;
}
