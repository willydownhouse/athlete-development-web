import { describe, expect, it } from "vitest";

import type { SportStats } from "@/lib/types";

import { buildHockeyStatTiles } from "./build-hockey-stat-tiles";

describe("buildHockeyStatTiles", () => {
  it("returns an empty list when no event types have stats", () => {
    const sportStats: SportStats = {
      athleteId: "33333333-3333-4333-8333-333333333333",
      sportId: "00000000-0000-4000-8000-000000000001",
      eventTypes: {},
    };

    expect(buildHockeyStatTiles(sportStats)).toEqual([]);
  });

  it("builds duration and metric tiles sorted by event type and metric key", () => {
    const sportStats: SportStats = {
      athleteId: "33333333-3333-4333-8333-333333333333",
      sportId: "00000000-0000-4000-8000-000000000001",
      eventTypes: {
        "22222222-2222-4222-8222-222222222222": {
          name: "Shooting",
          durationSeconds: 1800,
          metrics: {
            shot_count: {
              name: "Shot count",
              canonicalUnit: "shots",
              total: 50,
            },
          },
        },
        "11111111-1111-4111-8111-111111111111": {
          name: "Ice practice",
          durationSeconds: 3600,
          metrics: {
            rpe: {
              name: "RPE",
              canonicalUnit: "scale_1_10",
              total: 7,
            },
          },
        },
      },
    };

    expect(buildHockeyStatTiles(sportStats)).toEqual([
      {
        key: "11111111-1111-4111-8111-111111111111-duration",
        value: "1h",
        label: "Ice practice",
      },
      {
        key: "11111111-1111-4111-8111-111111111111-rpe",
        value: "7 scale 1 10",
        label: "RPE",
        subtitle: "Ice practice",
      },
      {
        key: "22222222-2222-4222-8222-222222222222-duration",
        value: "30 min",
        label: "Shooting",
      },
      {
        key: "22222222-2222-4222-8222-222222222222-shot_count",
        value: "50 shots",
        label: "Shot count",
        subtitle: "Shooting",
      },
    ]);
  });

  it("omits the duration tile when durationSeconds is zero", () => {
    const sportStats: SportStats = {
      athleteId: "33333333-3333-4333-8333-333333333333",
      sportId: "00000000-0000-4000-8000-000000000001",
      eventTypes: {
        "22222222-2222-4222-8222-222222222222": {
          name: "Shooting",
          durationSeconds: 0,
          metrics: {
            shot_count: {
              name: "Shot count",
              canonicalUnit: "shots",
              total: 25,
            },
          },
        },
      },
    };

    expect(buildHockeyStatTiles(sportStats)).toEqual([
      {
        key: "22222222-2222-4222-8222-222222222222-shot_count",
        value: "25 shots",
        label: "Shot count",
        subtitle: "Shooting",
      },
    ]);
  });
});
