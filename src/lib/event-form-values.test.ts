import { describe, expect, it } from "vitest";

import {
  readEventDescriptionForCreate,
  readEventDescriptionForUpdate,
  readEventDurationSecondsForCreate,
  readEventDurationSecondsForUpdate,
  readEventIntensityForCreate,
  readEventIntensityForUpdate,
  readEventTitleForCreate,
  readEventTitleForUpdate,
} from "./event-form-schema";
import { eventToFormValues } from "./event-form-values";
import type { Event } from "./types";

function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "event-1",
    athleteId: "athlete-1",
    eventTypeId: "type-1",
    createdByUserId: "user-1",
    sportId: null,
    category: "training",
    title: null,
    description: null,
    startedAt: "2026-08-05T10:00:00.000Z",
    endedAt: null,
    durationSeconds: null,
    intensity: null,
    source: "form",
    originalInput: null,
    structuredData: null,
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-08-05T10:00:00.000Z",
    eventType: {
      id: "type-1",
      sportId: null,
      category: "training",
      slug: "gym",
      name: "Gym",
      active: true,
      createdAt: "2026-08-05T10:00:00.000Z",
      updatedAt: "2026-08-05T10:00:00.000Z",
      sport: null,
    },
    metrics: [],
    ...overrides,
  };
}

describe("eventToFormValues duration parts", () => {
  it("formats stored UTC timestamps in the provided time zone", () => {
    expect(
      eventToFormValues(
        buildEvent({
          startedAt: "2026-08-05T14:00:00.000Z",
        }),
        "Europe/Oslo",
      ),
    ).toMatchObject({
      eventDate: "2026-08-05",
      eventTime: "16:00",
    });
  });

  it("splits stored seconds into hours, minutes, and seconds", () => {
    expect(eventToFormValues(buildEvent({ durationSeconds: 4500 }))).toMatchObject({
      durationHours: "1",
      durationMinutes: "15",
      durationSeconds: "",
    });
  });

  it("leaves duration fields empty when no duration is stored", () => {
    expect(eventToFormValues(buildEvent())).toMatchObject({
      durationHours: "",
      durationMinutes: "",
      durationSeconds: "",
    });
  });
});

describe("readEventDurationSecondsForCreate", () => {
  it("combines duration parts into total seconds", () => {
    const formData = new FormData();
    formData.set("durationHours", "1");
    formData.set("durationMinutes", "15");
    formData.set("durationSeconds", "30");

    expect(readEventDurationSecondsForCreate(formData)).toBe(4530);
  });

  it("returns undefined when all duration parts are empty", () => {
    expect(readEventDurationSecondsForCreate(new FormData())).toBeUndefined();
  });

  it("treats cleared parts as zero when other parts remain", () => {
    const formData = new FormData();
    formData.set("durationHours", "");
    formData.set("durationMinutes", "15");
    formData.set("durationSeconds", "");

    expect(readEventDurationSecondsForCreate(formData)).toBe(900);
  });
});

describe("readEventDurationSecondsForUpdate", () => {
  it("returns null when all duration parts are empty", () => {
    expect(readEventDurationSecondsForUpdate(new FormData())).toBeNull();
  });
});

describe("readEventTitle and description", () => {
  it("omits empty title and notes on create", () => {
    const formData = new FormData();
    formData.set("title", "");
    formData.set("description", "  ");

    expect(readEventTitleForCreate(formData)).toBeUndefined();
    expect(readEventDescriptionForCreate(formData)).toBeUndefined();
  });

  it("clears empty title and notes on update", () => {
    const formData = new FormData();
    formData.set("title", "");
    formData.set("description", "  ");

    expect(readEventTitleForUpdate(formData)).toBeNull();
    expect(readEventDescriptionForUpdate(formData)).toBeNull();
  });
});

describe("readEventIntensity", () => {
  it("omits not set intensity on create", () => {
    const formData = new FormData();
    formData.set("intensity", "");

    expect(readEventIntensityForCreate(formData)).toBeUndefined();
  });

  it("clears not set intensity on update", () => {
    const formData = new FormData();
    formData.set("intensity", "");

    expect(readEventIntensityForUpdate(formData)).toBeNull();
  });

  it("keeps a selected intensity value", () => {
    const formData = new FormData();
    formData.set("intensity", "hard");

    expect(readEventIntensityForCreate(formData)).toBe("hard");
    expect(readEventIntensityForUpdate(formData)).toBe("hard");
  });
});
