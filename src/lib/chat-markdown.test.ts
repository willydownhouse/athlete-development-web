import { describe, expect, it } from "vitest";

import { parseChatMarkdown } from "./chat-markdown";

describe("parseChatMarkdown", () => {
  it("treats **text** as bold", () => {
    expect(parseChatMarkdown("nämä ovat **treeniä** tai lepoa")).toEqual([
      { type: "text", value: "nämä ovat " },
      { type: "strong", value: "treeniä" },
      { type: "text", value: " tai lepoa" },
    ]);
  });

  it("treats *text* as italic", () => {
    expect(parseChatMarkdown("tämä on *tärkeää*")).toEqual([
      { type: "text", value: "tämä on " },
      { type: "em", value: "tärkeää" },
    ]);
  });

  it("leaves unmatched asterisks as text", () => {
    expect(parseChatMarkdown("odota **vielä")).toEqual([{ type: "text", value: "odota **vielä" }]);
  });
});
