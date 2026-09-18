import { describe, expect, it } from "vitest";

import { formatMediaDuration } from "./event-media-format";

describe("formatMediaDuration", () => {
  it("returns null for missing or sub-second values", () => {
    expect(formatMediaDuration(null)).toBeNull();
    expect(formatMediaDuration(0)).toBeNull();
    expect(formatMediaDuration(0.4)).toBeNull();
  });

  it("formats whole minutes and seconds", () => {
    expect(formatMediaDuration(1)).toBe("0:01");
    expect(formatMediaDuration(61)).toBe("1:01");
    expect(formatMediaDuration(90)).toBe("1:30");
  });
});
