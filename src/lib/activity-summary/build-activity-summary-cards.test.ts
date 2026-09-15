import { describe, expect, it } from "vitest";

import type { ActivitySummary } from "@/lib/types";

import {
  buildActivitySummaryCards,
  buildActivitySummaryCategoryRows,
  durationCoverageLabel,
} from "./build-activity-summary-cards";

const summary: ActivitySummary = {
  athleteId: "33333333-3333-4333-8333-333333333333",
  timeZone: "Europe/Helsinki",
  startedAtFrom: "2026-08-02T21:00:00.000Z",
  startedAtTo: "2026-08-09T21:00:00.000Z",
  calendarDays: 7,
  trainingDays: 3,
  restDays: 4,
  games: 1,
  load: {
    eventCount: 3,
    durationSeconds: 10800,
    eventsWithDuration: 2,
  },
  categories: [
    {
      category: "training",
      eventCount: 3,
      durationSeconds: 5400,
      eventsWithDuration: 2,
    },
    {
      category: "competition",
      eventCount: 1,
      durationSeconds: 7200,
      eventsWithDuration: 1,
    },
    {
      category: "recovery",
      eventCount: 1,
      durationSeconds: 0,
      eventsWithDuration: 0,
    },
  ],
};

describe("durationCoverageLabel", () => {
  it("omits a label when every session has a duration", () => {
    expect(durationCoverageLabel(3, 3)).toBeUndefined();
    expect(durationCoverageLabel(0, 0)).toBeUndefined();
  });

  it("names the missing durations", () => {
    expect(durationCoverageLabel(2, 3)).toBe("Duration logged for 2 of 3 sessions");
  });
});

describe("buildActivitySummaryCards", () => {
  it("builds headline cards with rest and duration coverage", () => {
    expect(buildActivitySummaryCards(summary)).toEqual([
      { key: "training-days", value: "3", label: "Training days" },
      {
        key: "rest-days",
        value: "4",
        label: "Rest days",
        subtitle: "of 7 days in this period",
      },
      { key: "games", value: "1", label: "Games" },
      {
        key: "training-time",
        value: "3h",
        label: "Training time",
        subtitle: "Duration logged for 2 of 3 sessions",
      },
    ]);
  });
});

describe("buildActivitySummaryCategoryRows", () => {
  it("formats category rows in API order", () => {
    expect(buildActivitySummaryCategoryRows(summary)).toEqual([
      { key: "training", label: "Training", eventCount: 3, durationLabel: "1h 30m" },
      { key: "competition", label: "Competition", eventCount: 1, durationLabel: "2h" },
      { key: "recovery", label: "Recovery", eventCount: 1, durationLabel: "No duration" },
    ]);
  });
});
