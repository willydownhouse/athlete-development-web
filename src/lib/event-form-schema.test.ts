import { describe, expect, it } from "vitest";

import {
  EVENT_DESCRIPTION_MAX_LENGTH,
  EVENT_TITLE_MAX_LENGTH,
  getEventFormTextError,
} from "./event-form-schema";

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
