import { describe, expect, it } from "vitest";

import {
  EVENT_DESCRIPTION_MAX_LENGTH,
  EVENT_TITLE_MAX_LENGTH,
  getEventFormTextError,
  getEventFormValidationError,
} from "./event-form-schema";

describe("getEventFormValidationError", () => {
  it("requires core form fields before content validation", () => {
    const formData = new FormData();

    expect(getEventFormValidationError(formData, [], null, { timeZone: "Europe/Helsinki" })).toBe(
      "Athlete is required",
    );

    formData.set("athleteId", "athlete-1");
    expect(getEventFormValidationError(formData, [], null, { timeZone: "Europe/Helsinki" })).toBe(
      "Event type is required",
    );

    formData.set("eventTypeId", "event-type-1");
    expect(
      getEventFormValidationError(formData, [], null, {
        timeZone: "Europe/Helsinki",
        requireEventId: true,
      }),
    ).toBe("Event is required");

    formData.set("eventId", "event-1");
    expect(getEventFormValidationError(formData, [], null, { timeZone: "" })).toBe(
      "Time zone is not ready. Refresh the page and try again.",
    );

    formData.set("eventDate", "2026-08-19");
    expect(
      getEventFormValidationError(formData, [], null, { timeZone: "Europe/Helsinki" }),
    ).toBeNull();
  });
});

describe("getEventFormTextError", () => {
  it("accepts text within the limits", () => {
    expect(getEventFormTextError("Morning skate", "Felt good")).toBeNull();
  });

  it("rejects titles and notes over the max length", () => {
    expect(getEventFormTextError("t".repeat(EVENT_TITLE_MAX_LENGTH + 1), "")).toBe(
      `Title must be ${EVENT_TITLE_MAX_LENGTH} characters or less`,
    );

    expect(getEventFormTextError("", "d".repeat(EVENT_DESCRIPTION_MAX_LENGTH + 1))).toBe(
      `Notes must be ${EVENT_DESCRIPTION_MAX_LENGTH} characters or less`,
    );
  });
});
