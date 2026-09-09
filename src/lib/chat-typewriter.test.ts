import { describe, expect, it } from "vitest";

import {
  CHAT_TYPEWRITER_CHARS_PER_FRAME,
  nextChatTypewriterCount,
  splitChatGraphemes,
  visibleChatTypewriterText,
} from "./chat-typewriter";

describe("splitChatGraphemes", () => {
  it("keeps emoji as single units", () => {
    expect(splitChatGraphemes("Nice 👍")).toEqual(["N", "i", "c", "e", " ", "👍"]);
  });
});

describe("visibleChatTypewriterText", () => {
  it("returns the original string once every grapheme is revealed", () => {
    expect(visibleChatTypewriterText("Logged 👍", 8)).toBe("Logged 👍");
  });

  it("reveals a prefix without splitting an emoji", () => {
    expect(visibleChatTypewriterText("Logged 👍", 7)).toBe("Logged ");
    expect(visibleChatTypewriterText("Logged 👍", 8)).toBe("Logged 👍");
  });

  it("returns an empty string before any characters are revealed", () => {
    expect(visibleChatTypewriterText("Logged", 0)).toBe("");
  });
});

describe("nextChatTypewriterCount", () => {
  it("advances by the frame size and stops at the end", () => {
    expect(nextChatTypewriterCount(0, 10)).toBe(CHAT_TYPEWRITER_CHARS_PER_FRAME);
    expect(nextChatTypewriterCount(9, 10)).toBe(10);
  });
});
