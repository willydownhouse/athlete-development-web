import { describe, expect, it } from "vitest";

import { formatChatTimestamp } from "./chat-time";

describe("formatChatTimestamp", () => {
  it("shows only the local time for messages from today", () => {
    expect(
      formatChatTimestamp(
        "Europe/Helsinki",
        "2026-09-01T11:30:00.000Z",
        new Date("2026-09-01T12:00:00.000Z"),
      ),
    ).toBe("14:30");
  });

  it("includes a short date for older messages", () => {
    expect(
      formatChatTimestamp(
        "Europe/Helsinki",
        "2026-08-20T11:30:00.000Z",
        new Date("2026-09-01T12:00:00.000Z"),
      ),
    ).toBe("Thu 20 Aug 14:30");
  });
});
