import type { useTranslations } from "next-intl";

import type { Athlete } from "@/lib/types";

type AthleteSubtitleTranslator = ReturnType<typeof useTranslations<"dashboard.athleteSubtitle">>;

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

  const position = (data as Record<string, unknown>)["position"];

  return typeof position === "string" && position.trim() ? position.trim() : null;
}

export function athleteSubtitle(
  athlete: Athlete,
  eventsThisWeek: number,
  t: AthleteSubtitleTranslator,
): string {
  const level = athlete.profile?.level?.trim() || ageGroupFromDateOfBirth(athlete.dateOfBirth);
  const position = positionFromProfile(athlete);
  const identity = [level, position].filter(Boolean).join(" ");
  const eventsLabel = t("eventsThisWeek", { count: eventsThisWeek });

  return identity ? `${identity}${t("separator")}${eventsLabel}` : eventsLabel;
}
